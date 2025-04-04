import { and, eq, ne } from "drizzle-orm";
import { Hono } from "hono";
import {
    type GetPassResponse,
    type LoadoutResponse,
    type ProfileResponse,
    type RefreshQuestResponse,
    type SetPassUnlockResponse,
    type UsernameResponse,
    zGetPassRequest,
    zLoadoutRequest,
    zRefreshQuestRequest,
    zSetItemStatusRequest,
    zSetPassUnlockRequest,
    zUsernameRequest,
} from "../../../../../shared/types/user";
import loadout from "../../../../../shared/utils/loadout";
import { encryptLoadout } from "../../../utils/loadoutHelpers";
import { validateUserName } from "../../../utils/serverHelpers";
import { server } from "../../apiServer";
import { authMiddleware, validateParams } from "../../auth/middleware";
import { accountsEnabledMiddleware } from "../../auth/middleware";
import { db } from "../../db";
import { matchDataTable, usersTable } from "../../db/schema";
import type { Context } from "../../index";
import {
    getTimeUntilNextUsernameChange,
    logoutUser,
    sanitizeSlug,
} from "./auth/authUtils";

export const UserRouter = new Hono<Context>();

UserRouter.use(accountsEnabledMiddleware);
UserRouter.use(authMiddleware);

UserRouter.post("/profile", async (c) => {
    try {
        const user = c.get("user")!;

        const {
            loadout,
            slug,
            linked,
            username,
            usernameSet,
            lastUsernameChangeTime,
            items,
            banned,
            banReason,
        } = user;

        if (banned) {
            const session = c.get("session")!;
            await logoutUser(c, session.id);

            return c.json<ProfileResponse>({
                banned: true,
                reason: banReason,
            });
        }

        const timeUntilNextChange =
            getTimeUntilNextUsernameChange(lastUsernameChangeTime);

        return c.json<ProfileResponse>(
            {
                success: true,
                profile: {
                    slug,
                    linked,
                    username,
                    usernameSet,
                    usernameChangeTime: timeUntilNextChange,
                },
                loadout,
                loadoutPriv: encryptLoadout(loadout),
                items: items,
            },
            200,
        );
    } catch (err) {
        server.logger.warn("/api/profile: Error fetching user profile", err);
        return c.json({}, 500);
    }
});

UserRouter.post(
    "/username",
    validateParams(zUsernameRequest, { result: "invalid" } satisfies UsernameResponse),
    async (c) => {
        try {
            const user = c.get("user")!;
            const { username } = c.req.valid("json");
            const timeUntilNextChange = getTimeUntilNextUsernameChange(
                user.lastUsernameChangeTime,
            );

            if (timeUntilNextChange > 0) {
                return c.json<UsernameResponse>(
                    { result: "change_time_not_expired" },
                    200,
                );
            }

            const isUsernameTaken = await db.query.usersTable.findFirst({
                where: and(eq(usersTable.slug, username), ne(usersTable.id, user.id)),
                columns: {
                    id: true,
                },
            });

            if (isUsernameTaken) {
                return c.json<UsernameResponse>({ result: "taken" }, 200);
            }

            const now = new Date();
            const slug = sanitizeSlug(username);

            await db
                .update(usersTable)
                .set({
                    username: validateUserName(username),
                    slug: slug,
                    usernameSet: true,
                    lastUsernameChangeTime: now,
                })
                .where(eq(usersTable.id, user.id));

            return c.json<UsernameResponse>({ result: "success" }, 200);
        } catch (err) {
            server.logger.warn("/api/username: Error updating username", err);
            return c.json<UsernameResponse>({ result: "failed" }, 500);
        }
    },
);

UserRouter.post("/loadout", validateParams(zLoadoutRequest), async (c) => {
    try {
        const user = c.get("user")!;
        const { loadout: userLoadout } = c.req.valid("json");

        const validatedLoadout = loadout.validateWithAvailableItems(
            userLoadout,
            user!.items,
        );

        await db
            .update(usersTable)
            .set({ loadout: validatedLoadout })
            .where(eq(usersTable.id, user.id));

        return c.json<LoadoutResponse>(
            {
                loadout: validatedLoadout,
                loadoutPriv: encryptLoadout(validatedLoadout),
            },
            200,
        );
    } catch (err) {
        server.logger.warn("/api/username: Error updating loadout", err);
        return c.json({}, 500);
    }
});

UserRouter.post("/logout", async (c) => {
    try {
        const session = c.get("session")!;

        await logoutUser(c, session.id);

        return c.json({}, 200);
    } catch (err) {
        server.logger.warn("/api/logout: Error logging out", err);
        return c.json({}, 500);
    }
});

UserRouter.post("/delete", async (c) => {
    try {
        const user = c.get("user")!;
        const session = c.get("session")!;

        // logout out the user
        await logoutUser(c, session.id);

        // delete the account
        await db.delete(usersTable).where(eq(usersTable.id, user.id));

        // remove reference to the user from match data
        await db
            .update(matchDataTable)
            .set({ userId: null })
            .where(eq(matchDataTable.userId, user.id));

        return c.json({}, 200);
    } catch (err) {
        server.logger.warn("/api/delete: Error deleting account", err);
        return c.json({}, 500);
    }
});

UserRouter.post("/set_item_status", validateParams(zSetItemStatusRequest), async (c) => {
    try {
        const user = c.get("user")!;
        const { itemTypes, status } = c.req.valid("json");

        const result = await db.query.usersTable.findFirst({
            where: eq(usersTable.id, user.id),
            columns: {
                items: true,
            },
        });

        if (!result) return c.json({}, 200);

        const { items } = result;

        const updatedItems = items.map((item) => {
            if (itemTypes.includes(item.type)) {
                item.status = status;
            }
            return item;
        });

        await db
            .update(usersTable)
            .set({
                items: updatedItems,
            })
            .where(eq(usersTable.id, user.id));

        return c.json({}, 200);
    } catch (err) {
        server.logger.warn("/api/set_item_status: Error setting item status", err);
        return c.json({}, 500);
    }
});

UserRouter.post("/reset_stats", async (c) => {
    try {
        const user = c.get("user")!;

        await db
            .update(matchDataTable)
            .set({ userId: null })
            .where(eq(matchDataTable.userId, user.id));

        return c.json({}, 200);
    } catch (err) {
        server.logger.warn("/api/reset_stats: Error reseting stats", err);
        return c.json({}, 500);
    }
});

//
// NOT IMPLEMENTED
//
UserRouter.post("/set_pass_unlock", validateParams(zSetPassUnlockRequest), (c) => {
    return c.json<SetPassUnlockResponse>({ success: true }, 200);
});

UserRouter.post("/get_pass", validateParams(zGetPassRequest), (c) => {
    return c.json<GetPassResponse>({ success: true }, 200);
});

UserRouter.post("/refresh_quest", validateParams(zRefreshQuestRequest), (c) => {
    return c.json<RefreshQuestResponse>({ success: true }, 200);
});

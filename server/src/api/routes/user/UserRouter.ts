import { and, eq, ne } from "drizzle-orm";
import { Hono } from "hono";
import { deleteCookie } from "hono/cookie";
import { z } from "zod";
import { UnlockDefs } from "../../../../../shared/defs/gameObjects/unlockDefs";
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
import loadout, { type Item, ItemStatus } from "../../../../../shared/utils/loadout";
import { encryptLoadout } from "../../../utils/loadoutHelpers";
import { validateUserName } from "../../../utils/serverHelpers";
import { server } from "../../apiServer";
import { lucia } from "../../auth/lucia";
import { AuthMiddleware, validateParams } from "../../auth/middleware";
import { accountsEnabledMiddleware } from "../../auth/middleware";
import { db } from "../../db";
import { matchDataTable, usersTable } from "../../db/schema";
import type { Context } from "../../index";
import { getTimeUntilNextUsernameChange, sanitizeSlug } from "./auth/authUtils";
import { MOCK_USER_ID } from "./auth/mock";

export const UserRouter = new Hono<Context>();

UserRouter.use(accountsEnabledMiddleware);
UserRouter.use(AuthMiddleware);

UserRouter.post("/profile", AuthMiddleware, async (c) => {
    try {
        const user = c.get("user")!;
        const result = await db.query.usersTable.findFirst({
            where: eq(usersTable.id, user.id),
            columns: {
                loadout: true,
                slug: true,
                linked: true,
                username: true,
                usernameSet: true,
                items: true,
                banned: true,
                banReason: true,
                lastUsernameChangeTime: true,
            },
        });

        if (!result) {
            return c.json({ err: "User profile not found" }, 404);
        }

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
        } = result;

        if (banned) {
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
    AuthMiddleware,
    async (c) => {
        try {
            const user = c.get("user")!;
            const { username } = c.req.valid("json");

            const existingUser = await db.query.usersTable.findFirst({
                where: eq(usersTable.id, user.id),
                columns: {
                    lastUsernameChangeTime: true,
                },
            })!;

            const timeUntilNextChange = getTimeUntilNextUsernameChange(
                existingUser!.lastUsernameChangeTime,
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

UserRouter.post(
    "/loadout",
    validateParams(zLoadoutRequest),
    AuthMiddleware,
    async (c) => {
        try {
            const user = c.get("user")!;
            const { loadout: userLoadout } = c.req.valid("json");

            const userItems = await db.query.usersTable.findFirst({
                where: eq(usersTable.id, user.id),
                columns: {
                    items: true,
                },
            });

            const validatedLoadout = loadout.validateWithAvailableItems(
                userLoadout,
                userItems!.items,
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
    },
);

UserRouter.post("/logout", AuthMiddleware, async (c) => {
    try {
        const session = c.get("session")!;
        deleteCookie(c, "app-data");
        await lucia.invalidateSession(session.id);
        c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), {
            append: true,
        });
        return c.json({}, 200);
    } catch (err) {
        server.logger.warn("/api/logout: Error logging out", err);
        return c.json({}, 500);
    }
});

UserRouter.post("/delete", AuthMiddleware, async (c) => {
    try {
        const user = c.get("user")!;
        const session = c.get("session")!;

        // logout out the user
        await lucia.invalidateSession(session.id);
        c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), {
            append: true,
        });

        // delete the account
        await db.delete(usersTable).where(eq(usersTable.id, user.id));

        return c.json({}, 200);
    } catch (err) {
        server.logger.warn("/api/delete: Error deleting account", err);
        return c.json({}, 500);
    }
});

UserRouter.post(
    "/set_item_status",
    validateParams(zSetItemStatusRequest),
    AuthMiddleware,
    async (c) => {
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
    },
);

// is there a use for this besides unlocking skins on account creation?
// if not delete it, or make it admin only.
UserRouter.post(
    "/unlock",
    validateParams(
        z.object({
            unlockType: z.string(),
        }),
    ),
    async (c) => {
        try {
            if (process.env.NODE_ENV === "production") return;
            const { unlockType } = c.req.valid("json");

            if (!(unlockType in UnlockDefs)) {
                return c.json([], 400);
            }

            const outfitsToUnlock = UnlockDefs[unlockType].unlocks;

            const result = await db.query.usersTable.findFirst({
                where: eq(usersTable.authId, MOCK_USER_ID),
                columns: {
                    items: true,
                },
            });

            if (!result) {
                return c.json({ err: "No items found for this user." }, 404);
            }

            const { items } = result;

            // Remove duplicates
            const unlockedItemTypes = new Set(items.map(({ type }) => type));
            const itemsToUnlock: Item[] = outfitsToUnlock
                .filter((type) => !unlockedItemTypes.has(type))
                .map((outfit) => {
                    return {
                        source: unlockType,
                        type: outfit,
                        status: ItemStatus.New,
                        timeAcquired: Date.now(),
                    };
                });
            const updatedItems = items.concat(itemsToUnlock);

            await db
                .update(usersTable)
                .set({
                    items: updatedItems,
                })
                .where(eq(usersTable.authId, MOCK_USER_ID));

            return c.json({ success: true }, 200);
        } catch (err) {
            server.logger.warn("/api/set_item_status: Error unlocking item", err);
            return c.json({}, 500);
        }
    },
);

UserRouter.post("/reset_stats", AuthMiddleware, async (c) => {
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

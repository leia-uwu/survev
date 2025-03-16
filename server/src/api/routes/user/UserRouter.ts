import { zValidator } from "@hono/zod-validator";
import { eq, or } from "drizzle-orm";
import { Hono } from "hono";
import { deleteCookie } from "hono/cookie";
import { z } from "zod";
import { OutfitDefs } from "../../../../../shared/defs/gameObjects/outfitDefs";
import { UnlockDefs } from "../../../../../shared/defs/gameObjects/unlockDefs";
import { ItemStatus, validateLoadout } from "../../../../../shared/utils/helpers";
import { encryptLoadout } from "../../../utils/loadoutHelpers";
import { server } from "../../apiServer";
import { lucia } from "../../auth/lucia";
import { AuthMiddleware } from "../../auth/middleware";
import { accountsEnabledMiddleware } from "../../auth/middleware";
import { db } from "../../db";
import { matchDataTable, usersTable } from "../../db/schema";
import type { Context } from "../../index";
import {
    type Loadout,
    loadoutSchema,
    usernameSchema,
    validateParams,
} from "../../zodSchemas";
import { invalidateUserStatsCache } from "../stats/user_stats";
import { getTimeUntilNextUsernameChange, sanitizeSlug } from "./auth/authUtils";
import { MOCK_USER_ID } from "./auth/mock";

export const UserRouter = new Hono<Context>();

UserRouter.use(accountsEnabledMiddleware);

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
        server.logger.warn("/api/profile: Error fetching user profile");
        return c.json({}, 500);
    }
});

UserRouter.post(
    "/username",
    zValidator("json", usernameSchema, (result, c) => {
        if (!result.success) {
            return c.json<UsernameResponse>({ result: "invalid" }, 400);
        }
    }),
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
                where: or(
                    eq(usersTable.username, username),
                    eq(usersTable.slug, username),
                ),
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
                    username: slug,
                    slug: slug,
                    usernameSet: true,
                    lastUsernameChangeTime: now,
                })
                .where(eq(usersTable.id, user.id));

            await invalidateUserStatsCache(user.id, "*");

            return c.json<UsernameResponse>({ result: "success" }, 200);
        } catch (err) {
            server.logger.warn("/api/username: Error updating username");
            return c.json<UsernameResponse>({ result: "failed" }, 500);
        }
    },
);

UserRouter.post(
    "/loadout",
    validateParams(z.object({ loadout: loadoutSchema })),
    AuthMiddleware,
    async (c) => {
        try {
            const user = c.get("user")!;
            const { loadout } = c.req.valid("json");
            const validatedLoadout = validateLoadout(loadout);

            await db
                .update(usersTable)
                .set({ loadout: validatedLoadout })
                .where(eq(usersTable.id, user.id));

            return c.json<{
                loadout: Loadout;
                loadoutPriv: string;
            }>(
                {
                    loadout: validatedLoadout,
                    loadoutPriv: encryptLoadout(validatedLoadout),
                },
                200,
            );
        } catch (err) {
            server.logger.warn("/api/username: Error updating loadout");
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
        server.logger.warn("/api/logout: Error logging out");
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
        server.logger.warn("/api/delete: Error deleting account");
        return c.json({}, 500);
    }
});

UserRouter.post(
    "/set_item_status",
    validateParams(
        z.object({
            itemTypes: z.array(z.string()),
            status: z.nativeEnum(ItemStatus),
        }),
    ),
    AuthMiddleware,
    async (c) => {
        try {
            const user = c.get("user")!;
            const { itemTypes, status } = c.req.valid("json");

            const validOutfits = new Set(Object.keys(OutfitDefs));
            const validItemTypes = itemTypes.filter((item) => validOutfits.has(item));

            if (!validItemTypes.length) return c.json({}, 200);

            const result = await db.query.usersTable.findFirst({
                where: eq(usersTable.id, user.id),
                columns: {
                    items: true,
                },
            });

            if (!result) return c.json({}, 200);

            const { items } = result;

            const updatedItems = items.map((item) => {
                if (validItemTypes.includes(item.type)) {
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
            server.logger.warn("/api/set_item_status: Error setting item status");
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

            const timeAcquired = new Date();
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
                        timeAcquired,
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
            server.logger.warn("/api/set_item_status: Error unlocking item");
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
    } catch (_err) {
        server.logger.warn("/api/reset_stats: Error reseting stats");
        return c.json({}, 500);
    }
});

//
// NOT IMPLEMENTED
//

UserRouter.post(
    "/get_pass",
    validateParams(
        z.object({
            tryRefreshQuests: z.boolean(),
        }),
    ),
    (c) => {
        return c.json({ success: true }, 200);
    },
);

//
// TYPES
//
export type Item = {
    type: string;
    status: ItemStatus;
    timeAcquired: Date;
    source: string;
};

type ProfileResponse =
    | {
          readonly banned: true;
          reason: string;
      }
    | {
          readonly success: true;
          profile: Pick<
              typeof usersTable.$inferSelect,
              "slug" | "username" | "usernameSet" | "linked"
          > & {
              usernameChangeTime: number;
          };
          loadout: Loadout;
          loadoutPriv: string;
          items: Item[];
      };

type UsernameResponse =
    | {
          result: "success";
      }
    | {
          result: "failed" | "invalid" | "taken" | "change_time_not_expired";
      };

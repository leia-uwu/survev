import { zValidator } from "@hono/zod-validator";
import { eq, or } from "drizzle-orm";
import { Hono } from "hono";
import { deleteCookie } from "hono/cookie";
import { z } from "zod";
import { OutfitDefs } from "../../../../../shared/defs/gameObjects/outfitDefs";
import { UnlockDefs } from "../../../../../shared/defs/gameObjects/unlockDefs";
import { ItemStatus, validateLoadout } from "../../../../../shared/utils/helpers";
import { encryptLoadout } from "../../../utils/loadoutHelpers";
import { lucia } from "../../auth/lucia";
import { AuthMiddleware } from "../../auth/middleware";
import { db } from "../../db";
import { usersTable } from "../../db/schema";
import type { Context } from "../../index";
import { type Loadout, loadoutSchema, usernameSchema } from "../../zodSchemas";
import { getTimeUntilNextUsernameChange, sanitizeSlug } from "./auth/authUtils";
import { MOCK_USER_ID } from "./auth/mock";

export const UserRouter = new Hono<Context>();

UserRouter.post("/profile", AuthMiddleware, async (c) => {
    try {
        const user = c.get("user")!;
        const result = await db.query.usersTable.findFirst({
            where: eq(usersTable.id, user.id),
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
                items,
            },
            200,
        );
    } catch (err) {
        console.error("Error fetching user profile:", err);
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

            return c.json<UsernameResponse>({ result: "success" }, 200);
        } catch (err) {
            console.error("Error updating username", { error: err });
            return c.json<UsernameResponse>({ result: "failed" }, 500);
        }
    },
);

UserRouter.post(
    "/loadout",
    zValidator("json", z.object({ loadout: loadoutSchema }), (result, c) => {
        if (!result.success) {
            return c.json({}, 400);
        }
    }),
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
            console.error("Error updating loadout", { error: err });
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
        console.error("Error logging out", { error: err });
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
        console.error("Error deleting account", { error: err });
        return c.json({}, 500);
    }
});

UserRouter.post(
    "/set_item_status",
    zValidator(
        "json",
        z.object({
            itemTypes: z.array(z.string()),
            status: z.nativeEnum(ItemStatus),
        }),
        (result, c) => {
            if (!result.success) {
                return c.json({}, 400);
            }
        },
    ),
    AuthMiddleware,
    async (c) => {
        try {
            const user = c.get("user")!;
            const { itemTypes, status } = c.req.valid("json");

            const validOutfits = new Set(Object.keys(OutfitDefs));
            const validItemTypes = itemTypes.filter((item) => validOutfits.has(item));

            if (!validItemTypes.length) return c.json({}, 200);

            const [{ items }] = await db
                .select({ items: usersTable.items })
                .from(usersTable)
                .where(eq(usersTable.id, user.id))
                .limit(1);

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
            console.error("Error setting item status", { error: err });
            return c.json({}, 500);
        }
    },
);

// is there a use for this besides unlocking skins on account creation?
// if not delete it, or make it admin only.
UserRouter.post(
    "/unlock",
    zValidator(
        "json",
        z.object({
            unlockType: z.string(),
        }),
        (result, c) => {
            if (!result.success) {
                return c.json({}, 400);
            }
        },
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

            const result = await db
                .select({ items: usersTable.items })
                .from(usersTable)
                .where(eq(usersTable.authId, MOCK_USER_ID))
                .limit(1);

            if (!result.length) {
                return c.json({ err: "No items found for this user." }, 404);
            }

            const [{ items }] = result;

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

            const retunedItems = await db
                .update(usersTable)
                .set({
                    items: updatedItems,
                })
                .where(eq(usersTable.authId, MOCK_USER_ID))
                .returning({
                    items: usersTable.items,
                });

            return c.json({ success: true, items: retunedItems }, 200);
        } catch (err) {
            console.error("Error unlocking item", { error: err });
            return c.json({}, 500);
        }
    },
);

//
// NOT IMPLEMENTED
//
UserRouter.post("/reset_stats", (c) => {
    return c.json({}, 200);
});

UserRouter.post(
    "/get_pass",
    zValidator(
        "json",
        z.object({
            tryRefreshQuests: z.boolean(),
        }),
        (result, c) => {
            if (!result.success) {
                return c.json({}, 400);
            }
        },
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

import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import type { Context } from "../..";
import { lucia } from "../../auth/lucia";
import { AuthMiddleware } from "../../auth/middleware";
import { db } from "../../db";
import { usersTable } from "../../db/schema";
import { helpers } from "../../helpers";
import { type Loadout, loadoutSchema, usernameSchema } from "../../zodSchemas";

export const UserRouter = new Hono<Context>();

UserRouter.post("/profile", AuthMiddleware, async (c) => {
    const user = c.get("user")!;
    console.log({user})
    const result = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, user.id),
    });
    if (!result) {
        return c.json({ err: "" }, 200);
    }

    const { loadout, ...profile } = result;

    return c.json<ProfileResponse>(
        {
            success: true,
            // @ts-expect-error don't send the whole profile
            profile,
            loadout,
        },
        200,
    );
});

UserRouter.post(
    "/username",
    zValidator("json", usernameSchema, (result, c) => {
        if (!result.success) {
            return c.text<UsernameErrorType>("invalid", 400);
        }
    }),
    AuthMiddleware,
    async (c) => {
        try {
            const user = c.get("user")!;
            const { username } = c.req.valid("json");

            const usernameAlreadyExist = await db.query.usersTable.findFirst({
                where: eq(usersTable.username, username),
            });

            if (usernameAlreadyExist) {
                return c.text<UsernameErrorType>("taken", 200);
            }

            await db
                .update(usersTable)
                .set({ username, usernameSet: true })
                .where(eq(usersTable.id, user.id));

            return c.json<UsernameResponse>({ result: "success" }, 200);
        } catch {
            return c.text<UsernameErrorType>("failed");
        }
    },
);

UserRouter.post(
    "/loadout",
    zValidator("json", z.object({ loadout: loadoutSchema }), async (result, c) => {
        if (!result.success) {
            return c.json({}, 400);
        }
    }),
    AuthMiddleware,
    async (c) => {
        try {
            const user = c.get("user")!;
            const { loadout } = c.req.valid("json");
            const validatedLoadout = helpers.validateLoadout(loadout);

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
                    loadoutPriv: "",
                },
                200,
            );
        } catch (_e) {
            return c.json({}, 500);
        }
    },
);

UserRouter.post("/logout", AuthMiddleware, async (c) => {
    const session = c.get("session")!;

    await lucia.invalidateSession(session.id);
    c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), {
        append: true,
    });
    return c.redirect("/login");
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
    } catch {
        return c.json({}, 500);
    }
});

//
// NOT IMPLEMENTED
//
UserRouter.post("/reset_stats", async (c) => {
    return c.json({}, 200);
});

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
            return c.json([], 200);
        } catch (_e) {
            return c.json({}, 500);
        }
    },
);

//
// TYPES
//
type ProfileResponse =
    | {
          banned: true;
          reason: string;
      }
    | {
          success: true;
          profile: typeof usersTable.$inferSelect;
          loadout: Loadout;
      };

type UsernameErrorType = "failed" | "invalid" | "taken" | "change_time_not_expired";

type UsernameResponse = {
    result: "success";
};

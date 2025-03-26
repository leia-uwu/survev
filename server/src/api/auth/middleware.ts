import { zValidator } from "@hono/zod-validator";
import type { Context, Next } from "hono";
import { deleteCookie, getCookie } from "hono/cookie";
import type { z } from "zod";
import { Config } from "../../config";
import { server } from "../apiServer";
import { lucia } from "./lucia";

export const AuthMiddleware = async (c: Context, next: Next) => {
    try {
        const sessionId = getCookie(c, lucia.sessionCookieName) ?? null;

        if (!sessionId) {
            c.set("user", null);
            c.set("session", null);
            return c.json({ err: "Authentication failed" }, 401);
        }
        const { session, user } = await lucia.validateSession(sessionId);

        if (!user) {
            return c.json({ err: "Authentication failed" }, 401);
        }

        if (session && session.fresh) {
            // use `header()` instead of `setCookie()` to avoid TS errors
            c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), {
                append: true,
            });
        }

        if (!session) {
            c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), {
                append: true,
            });
            deleteCookie(c, "app-data");
        }
        c.set("user", user);
        c.set("session", session);
        return next();
    } catch (err) {
        server.logger.warn("Error trying to authenticate user", err);
        return c.json({ error: "Authentication failed" }, 500);
    }
};

/**
 * middleware for validating JSON request parameters against a Zod schema.
 */
export function validateParams<Schema extends z.ZodSchema>(
    schema: Schema,
    response?: object,
) {
    return zValidator("json", schema, (result, c) => {
        if (!result.success) {
            return c.json(
                response ?? {
                    message: "Invalid params",
                },
                400,
            );
        }
    });
}

export async function accountsEnabledMiddleware(c: Context, next: Next) {
    if (!Config.accountsEnabled) {
        return c.json({ err: "Account-related features are disabled" }, 403);
    }
    await next();
}

export async function privateMiddleware(c: Context, next: Next) {
    if (c.req.header("survev-api-key") !== Config.apiKey) {
        return c.json({ message: "Forbidden" }, 403);
    }
    await next();
}

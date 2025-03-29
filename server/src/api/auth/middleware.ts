import { zValidator } from "@hono/zod-validator";
import type { Context, Next } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { z } from "zod";
import { validateSessionToken } from ".";
import { Config } from "../../config";
import { server } from "../apiServer";
import { deleteSessionTokenCookie } from "../routes/user/auth/authUtils";

export const authMiddleware = async (c: Context, next: Next) => {
    try {
        const sessionToken = getCookie(c, "session") ?? null;

        if (!sessionToken) {
            c.set("user", null);
            c.set("session", null);
            return c.json({ err: "Authentication failed" }, 401);
        }
        const { session, user } = await validateSessionToken(sessionToken);

        if (!user) {
            return c.json({ err: "Authentication failed" }, 401);
        }

        if (session) {
            setCookie(c, "session", sessionToken, {
                httpOnly: false,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                expires: session.expiresAt,
            });
        } else {
            deleteSessionTokenCookie(c);
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

import type { Context, Next } from "hono";
import { deleteCookie, getCookie } from "hono/cookie";
import { Config } from "../../config";
import { server } from "../apiServer";
import { lucia } from "./lucia";

export async function accountsEnabledMiddleware(c: Context, next: Next) {
    if (!Config.accountsEnabled) {
        return c.json({ err: "Account-related features are disabled" }, 403);
    }
    await next();
}

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
    } catch (_err) {
        server.logger.warn("Error trying to authenticate user");
        return c.json({ error: "Authentication failed" }, 500);
    }
};

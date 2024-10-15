import { Google, OAuth2RequestError, generateCodeVerifier, generateState } from "arctic";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { generateId } from "lucia";
import { server } from "../../..";
import { Config } from "../../../../config";
import { db } from "../../../db";
import { usersTable } from "../../../db/schema";
import { createNewUser, sanitizeSlug, setUserCookie } from "./authUtils";

const google = new Google(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_SECRET_ID!,
    process.env.REDIRECT_URI!,
);

const stateCookieName = "google_oauth_state";
const codeVerifierCookieName = "google_code_verifier";

export const GoogleRouter = new Hono();

GoogleRouter.get("/", async (c) => {
    if (!Config.accountsEnabled) {
        return c.json({ err: "Account-related features are disabled" }, 403);
    }
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_SECRET_ID) {
        return c.json({ err: "Missing Google credentials" }, 500);
    }
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    const url = await google.createAuthorizationURL(state, codeVerifier, {
        scopes: ["profile", "email"],
    });

    setCookie(c, stateCookieName, state, {
        secure: process.env.NODE_ENV === "production",
        path: "/",
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: "Lax",
    });

    setCookie(c, codeVerifierCookieName, codeVerifier, {
        secure: process.env.NODE_ENV === "production",
        path: "/",
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: "Lax",
    });

    return c.redirect(url.toString());
});

GoogleRouter.get("/callback", async (c) => {
    const code = c.req.query("code")?.toString() ?? null;
    const state = c.req.query("state")?.toString() ?? null;

    const storedState = getCookie(c)[stateCookieName] ?? null;
    const storedCodeVerifier = getCookie(c)[codeVerifierCookieName];

    if (!code || !state || !storedCodeVerifier || !storedState || state !== storedState) {
        return c.body(null, 400);
    }

    try {
        const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);
        const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
            },
        });
        const { sub: id, name: username } = await response.json();

        const existingUser = await db.query.usersTable.findFirst({
            where: eq(usersTable.auth_id, id),
        });

        setCookie(c, "app-data", "1");

        if (existingUser) {
            await setUserCookie(existingUser.id, c);
            return c.redirect("/");
        }

        const slug = sanitizeSlug(username);

        const userId = generateId(15);
        await createNewUser({
            id: userId,
            auth_id: id,
            linked: true,
            username: slug,
            slug,
        });

        await setUserCookie(userId, c);
        return c.redirect("/");
    } catch (e) {
        server.logger.warn(`/api/user/auth/google/callback: Failed to create user`);
        console.log({ err: e });
        if (e instanceof OAuth2RequestError && e.message === "bad_verification_code") {
            return c.body(null, 400);
        }
        return c.body(null, 500);
    }
});

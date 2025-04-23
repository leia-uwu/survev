import { Google, OAuth2RequestError, generateCodeVerifier, generateState } from "arctic";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { Config } from "../../../../config";
import { server } from "../../../apiServer";
import { getRedirectUri, handleAuthUser } from "./authUtils";

const google = new Google(
    Config.secrets.GOOGLE_CLIENT_ID!,
    Config.secrets.GOOGLE_SECRET_ID!,
    getRedirectUri("google"),
);

const stateCookieName = "google_oauth_state";
const codeVerifierCookieName = "google_code_verifier";

export const GoogleRouter = new Hono();

GoogleRouter.get("/", async (c) => {
    if (!Config.secrets.GOOGLE_CLIENT_ID || !Config.secrets.GOOGLE_SECRET_ID) {
        return c.json({ error: "Missing Google credentials" }, 500);
    }
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    const url = await google.createAuthorizationURL(state, codeVerifier, {
        scopes: ["openid", "email"],
    });

    setCookie(c, stateCookieName, state, {
        secure: process.env.NODE_ENV === "production",
        path: "/",
        httpOnly: false,
        maxAge: 60 * 10,
        sameSite: "Lax",
    });

    setCookie(c, codeVerifierCookieName, codeVerifier, {
        secure: process.env.NODE_ENV === "production",
        path: "/",
        httpOnly: false,
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
        return c.json({}, 400);
    }

    try {
        const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);
        const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
            },
        });

        const resData = (await response.json()) as {
            sub: string;
            email_verified: boolean;
        };

        if (!resData.email_verified) {
            return c.json({ error: "verified_email_required" }, 400);
        }

        await handleAuthUser(c, "google", resData.sub);

        return c.redirect("/");
    } catch (err) {
        server.logger.error(`/api/auth/google/callback: Failed to create user`, err);
        if (
            err instanceof OAuth2RequestError &&
            err.message === "bad_verification_code"
        ) {
            return c.json({ error: "bad_verification_code" }, 400);
        }
        return c.json({}, 500);
    }
});

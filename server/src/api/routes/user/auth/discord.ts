import { Discord, OAuth2RequestError, generateState } from "arctic";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { generateId } from "lucia";
import { server } from "../../..";
import { Config } from "../../../../config";
import { db } from "../../../db";
import { usersTable } from "../../../db/schema";
import { createNewUser, getRedirectUri, sanitizeSlug, setUserCookie } from "./authUtils";

export const discord = new Discord(
    process.env.DISCORD_CLIENT_ID!,
    process.env.DISCORD_SECRET_ID!,
    getRedirectUri("discord"),
);

const stateCookieName = "discord_oauth_state";

export const DiscordRouter = new Hono();

DiscordRouter.get("/", async (c) => {
    if (!Config.accountsEnabled) {
        return c.json({ err: "Account-related features are disabled" }, 403);
    }
    if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_SECRET_ID) {
        return c.json({ err: "Missing Discord credentials" }, 500);
    }
    const state = generateState();

    const url = await discord.createAuthorizationURL(state, {
        scopes: ["identify"],
    });

    setCookie(c, stateCookieName, state, {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: "Lax",
    });
    return c.redirect(url.toString());
});

DiscordRouter.get("/callback", async (c) => {
    const code = c.req.query("code")?.toString() ?? null;
    const state = c.req.query("state")?.toString() ?? null;
    const storedState = getCookie(c)[stateCookieName] ?? null;
    if (!code || !state || !storedState || state !== storedState) {
        return c.json({}, 400);
    }

    try {
        const tokens = await discord.validateAuthorizationCode(code);

        const discordUserResponse = await fetch("https://discord.com/api/users/@me", {
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
            },
        });

        const discordUser: {
            username: string;
            id: string;
        } = await discordUserResponse.json();

        const existingUser = await db.query.usersTable.findFirst({
            where: eq(usersTable.auth_id, discordUser.id),
        });

        setCookie(c, "app-data", "1");

        if (existingUser) {
            await setUserCookie(existingUser.id, c);
            return c.redirect("/");
        }

        const slug = sanitizeSlug(discordUser.username);

        const userId = generateId(15);
        await createNewUser({
            id: userId,
            auth_id: discordUser.id,
            linked: true,
            username: slug,
            slug,
        });

        await setUserCookie(userId, c);
        return c.redirect("/");
    } catch (e) {
        server.logger.warn("/api/user/auth/mock: Failed to create user");
        if (e instanceof OAuth2RequestError && e.message === "bad_verification_code") {
            // invalid code
            return c.json({}, 400);
        }
        return c.json({}, 500);
    }
});

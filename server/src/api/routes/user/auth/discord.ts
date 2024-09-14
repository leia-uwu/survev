import { Discord, OAuth2RequestError, generateState } from "arctic";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { generateId } from "lucia";
import { setUserCookie } from "../../../auth/lucia";
import { db } from "../../../db";
import { usersTable } from "../../../db/schema";
import { createNewUser } from "./github";

export const discord = new Discord(
    process.env.DISCORD_CLIENT_ID!,
    process.env.DISCORD_SECRET_ID!,
    `${process.env.BASE_URL}/api/user/auth/discord/callback`,
);

export const DiscordRouter = new Hono();

DiscordRouter.get("/", async (c) => {
    const state = generateState();

    const url = await discord.createAuthorizationURL(state, {
        scopes: ["identify"],
    });

    setCookie(c, "discord_oauth_state", state, {
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
    const storedState = getCookie(c).discord_oauth_state ?? null;
    if (!code || !state || !storedState || state !== storedState) {
        return c.body(null, 400);
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

        if (existingUser) {
            await setUserCookie(existingUser.id, c);
            return c.redirect("/");
        }

        const userId = generateId(15);
        await createNewUser({
            username: discordUser.username,
            auth_id: discordUser.id,
            id: userId,
            linked: true,
            linkedDiscord: true,
            slug: discordUser.username,
        });

        await setUserCookie(userId, c);
        return c.redirect("/");
    } catch (e) {
        if (e instanceof OAuth2RequestError && e.message === "bad_verification_code") {
            // invalid code
            return c.body(null, 400);
        }
        return c.body(null, 500);
    }
});

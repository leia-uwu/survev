import { Discord, generateState } from "arctic";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { Config } from "../../../../config";
import { getRedirectUri, handleAuthUser } from "./authUtils";

export const discord = new Discord(
    Config.secrets.DISCORD_CLIENT_ID!,
    Config.secrets.DISCORD_SECRET_ID!,
    getRedirectUri("discord"),
);

const stateCookieName = "discord_oauth_state";

export const DiscordRouter = new Hono();

DiscordRouter.use(async (c, next) => {
    if (!(Config.secrets.DISCORD_CLIENT_ID && Config.secrets.DISCORD_SECRET_ID)) {
        return c.text("Discord login is not supported", 500);
    }
    await next();
});

DiscordRouter.get("/", async (c) => {
    const state = generateState();

    const url = await discord.createAuthorizationURL(state, {
        scopes: ["identify", "email"],
    });

    setCookie(c, stateCookieName, state, {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: "Lax",
    });

    url.searchParams.append("prompt", "none");
    return c.redirect(url.toString());
});

DiscordRouter.get("/callback", async (c) => {
    const code = c.req.query("code")?.toString() ?? null;
    const state = c.req.query("state")?.toString() ?? null;
    const storedState = getCookie(c)[stateCookieName] ?? null;
    if (!code || !state || !storedState || state !== storedState) {
        return c.json({}, 400);
    }

    const tokens = await discord.validateAuthorizationCode(code);

    const discordUserResponse = await fetch("https://discord.com/api/users/@me", {
        headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
        },
    });

    const resData = (await discordUserResponse.json()) as {
        id: string;
        verified: boolean;
    };

    if (!resData.verified) {
        return c.json({ error: "verified_email_required" }, 400);
    }

    await handleAuthUser(c, "discord", resData.id);

    return c.redirect("/");
});

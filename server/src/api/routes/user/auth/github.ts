import { GitHub, OAuth2RequestError, generateState } from "arctic";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { generateId } from "lucia";
import { lucia, setUserCookie } from "../../../auth/lucia";
import { db } from "../../../db";
import { usersTable } from "../../../db/schema";

export const github = new GitHub(
    process.env.GITHUB_CLIENT_ID!,
    process.env.GITHUB_CLIENT_SECRET!,
);

export const GithubRouter = new Hono();

GithubRouter.get("/", async (c) => {
    const state = generateState();
    const url = await github.createAuthorizationURL(state);
    setCookie(c, "github_oauth_state", state, {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: "Lax",
    });
    return c.redirect(url.toString());
});

GithubRouter.get("/callback", async (c) => {
    const code = c.req.query("code")?.toString() ?? null;
    const state = c.req.query("state")?.toString() ?? null;
    const storedState = getCookie(c).github_oauth_state ?? null;
    if (!code || !state || !storedState || state !== storedState) {
        return c.body(null, 400);
    }

    try {
        const tokens = await github.validateAuthorizationCode(code);
        const githubUserResponse = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
            },
        });
        const githubUser: {
            id: string;
            login: string;
        } = await githubUserResponse.json();

        const existingUser = await db.query.usersTable.findFirst({
            where: eq(usersTable.auth_id, githubUser.id),
        });

        if (existingUser) {
            const session = await lucia.createSession(existingUser.id, {});
            c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), {
                append: true,
            });
            return c.redirect("/");
        }

        const userId = generateId(15);
        await db.insert(usersTable).values({
            username: githubUser.login,
            auth_id: githubUser.id,
            id: userId,
            linked: true,
        });
        const session = await lucia.createSession(userId, {});
        c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), {
            append: true,
        });
        console.log("reached", session.id, userId)
        return c.redirect("/");
    } catch (e) {
        if (e instanceof OAuth2RequestError && e.message === "bad_verification_code") {
            // invalid code
            return c.body(null, 400);
        }
        return c.body(null, 500);
    }
});

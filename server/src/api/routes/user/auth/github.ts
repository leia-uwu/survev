import { GitHub, OAuth2RequestError, generateState } from "arctic";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { generateId } from "lucia";
import { UnlockDefs } from "../../../../../../shared/defs/gameObjects/unlockDefs";
import { setUserCookie } from "../../../auth/lucia";
import { db } from "../../../db";
import { type UsersTable, itemsTable, usersTable } from "../../../db/schema";

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

        setCookie(c, "app-data", "1");

        if (existingUser) {
            setUserCookie(existingUser.id, c);
            return c.redirect("/");
        }

        const userId = generateId(15);
        await createNewUser({
            id: userId,
            auth_id: githubUser.id,
            username: githubUser.login,
            linked: true,
            linkedGithub: true,
            // TODO: make sure this is unique and slugify it
            slug: githubUser.login,
        });

        setUserCookie(userId, c);
        return c.redirect("/");
    } catch (e) {
        if (e instanceof OAuth2RequestError && e.message === "bad_verification_code") {
            // invalid code
            return c.body(null, 400);
        }
        return c.body(null, 500);
    }
});

export async function createNewUser(payload: UsersTable) {
    await db.insert(usersTable).values(payload);

    // unlock outfits on account creation;
    const unlockType = "unlock_new_account";
    const outfitsToUnlock = UnlockDefs[unlockType].unlocks;
    if (outfitsToUnlock.length) {
        const data = outfitsToUnlock.map((outfit) => {
            return {
                source: unlockType,
                type: outfit,
                userId: payload.id,
            };
        });
        await db.insert(itemsTable).values(data);
    }
}

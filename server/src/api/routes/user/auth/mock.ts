import { OAuth2RequestError } from "arctic";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { generateId } from "lucia";
import { setUserCookie } from "../../../auth/lucia";
import { db } from "../../../db";
import { usersTable } from "../../../db/schema";
import { createNewUser } from "./github";

export const MockRouter = new Hono();

MockRouter.get("/", async (c) => {
    setCookie(c, "mock_oauth_state", "MOCK_STATE", {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: "Lax",
    });
    return c.redirect("/api/user/auth/mock/callback");
});

MockRouter.get("/callback", async (c) => {
    try {
        const existingUser = await db.query.usersTable.findFirst({
            where: eq(usersTable.auth_id, "MOCK_USER_ID"),
        });

        setCookie(c, "app-data", "1");

        if (existingUser) {
            setUserCookie(existingUser.id, c);
            return c.redirect("/");
        }

        const userId = generateId(15);
        await createNewUser({
            userId,
            authId: "MOCK_USER_ID",
            username: "MOCK_USER_ID",
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

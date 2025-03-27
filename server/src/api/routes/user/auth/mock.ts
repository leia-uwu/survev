import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { generateId } from "lucia";
import { server } from "../../../apiServer";
import { db } from "../../../db";
import { usersTable } from "../../../db/schema";
import { createNewUser, setUserCookie } from "./authUtils";

export const MockRouter = new Hono();

export const MOCK_USER_ID = "MOCK_USER_ID";

MockRouter.get("/", async (c) => {
    if (process.env.NODE_ENV == "production") return c.json({ err: "" }, 404);
    try {
        const existingUser = await db.query.usersTable.findFirst({
            where: eq(usersTable.authId, MOCK_USER_ID),
            columns: {
                id: true,
            },
        });

        setCookie(c, "app-data", "1");

        if (existingUser) {
            await setUserCookie(existingUser.id, c);
            return c.redirect("/");
        }

        const userId = generateId(15);
        await createNewUser({
            id: userId,
            authId: MOCK_USER_ID,
            username: MOCK_USER_ID,
            linked: true,
            slug: MOCK_USER_ID,
        });

        await setUserCookie(userId, c);
        return c.redirect("/");
    } catch (err) {
        server.logger.warn("/api/auth/mock: Failed to create user", err);
        return c.json({}, 500);
    }
});

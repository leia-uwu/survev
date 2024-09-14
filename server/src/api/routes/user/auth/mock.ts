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
            id: userId,
            auth_id: "MOCK_USER_ID",
            username: "MOCK_USER_ID",
            linked: true,
            slug: "MOCK_USER_ID",
        });

        setUserCookie(userId, c);
        return c.redirect("/");
    } catch (_err) {
        return c.body(null, 500);
    }
});

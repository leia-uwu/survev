import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { generateId } from "lucia";
import { server } from "../../..";
import { Config } from "../../../../config";
import { db } from "../../../db";
import { usersTable } from "../../../db/schema";
import { createNewUser, setUserCookie } from "./authUtils";

export const MockRouter = new Hono();

export const MOCK_USER_ID = "MOCK_USER_ID";

MockRouter.get("/", async (c) => {
    if (!Config.accountsEnabled) {
        return c.json({ err: "Account-related features are disabled" }, 403);
    }
    try {
        const existingUser = await db.query.usersTable.findFirst({
            where: eq(usersTable.authId, MOCK_USER_ID),
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
    } catch (_err) {
        console.log({ _err });
        server.logger.warn("/api/user/auth/mock: Failed to create user");
        return c.json({}, 500);
    }
});

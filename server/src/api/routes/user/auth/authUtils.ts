import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import { generateId } from "lucia";
import slugify from "slugify";
import { UnlockDefs } from "../../../../../../shared/defs/gameObjects/unlockDefs";
import { ItemStatus } from "../../../../../../shared/utils/loadout";
import { Config } from "../../../../config";
import { checkForBadWords } from "../../../../utils/serverHelpers";
import { lucia } from "../../../auth/lucia";
import { db } from "../../../db";
import { type UsersTable, usersTable } from "../../../db/schema";
import type { Item } from "../UserRouter";

export function sanitizeSlug(username: string) {
    username = username.toLowerCase().trim();

    if (username === "" || checkForBadWords(username)) {
        username = `Player${generateId(6)}`;
    }

    return slugify(username, {
        trim: true,
        strict: true,
    });
}

export async function setUserCookie(userId: string, c: Context) {
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    setCookie(c, sessionCookie.name, sessionCookie.value, {
        httpOnly: false,
        secure: true,
        sameSite: "lax",
        path: sessionCookie.attributes.path,
        expires: sessionCookie.attributes.expires,
    });
    return session;
}

export async function createNewUser(payload: UsersTable) {
    const unlockType = "unlock_new_account";
    const outfitsToUnlock = UnlockDefs[unlockType].unlocks || [];
    const timeAcquired = new Date();
    const items: Item[] = outfitsToUnlock.map((outfit) => {
        return {
            source: unlockType,
            type: outfit,
            timeAcquired,
            status: ItemStatus.New,
        };
    });

    await db.insert(usersTable).values({ ...payload, items });
}

export function getRedirectUri(method: "discord" | "google") {
    const isProduction = process.env.NODE_ENV === "production";

    if (isProduction && !Config.BASE_URL) {
        throw new Error("BASE_URL is not defined.");
    }

    const baseUrl = isProduction
        ? Config.BASE_URL!
        : // uh don't hardcode me
          `http://localhost:3000`;

    return `${baseUrl}/api/user/auth/${method}/callback`;
}

export const dayInMs = 24 * 60 * 60 * 1000;
export const cooldownPeriod = 10 * dayInMs;

export function getTimeUntilNextUsernameChange(lastChangeTime: Date | null) {
    if (!(lastChangeTime instanceof Date)) return 0;

    const currentTime = Date.now();
    const timeSinceLastChange = currentTime - new Date(lastChangeTime).getTime();
    return cooldownPeriod - timeSinceLastChange;
}

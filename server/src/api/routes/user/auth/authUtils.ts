import { generateRandomString } from "@oslojs/crypto/random";
import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import slugify from "slugify";
import { UnlockDefs } from "../../../../../../shared/defs/gameObjects/unlockDefs";
import { type Item, ItemStatus } from "../../../../../../shared/utils/loadout";
import { Config } from "../../../../config";
import { checkForBadWords } from "../../../../utils/serverHelpers";
import { createSession, generateSessionToken, invalidateSession } from "../../../auth";
import { db } from "../../../db";
import { type UsersTableInsert, usersTable } from "../../../db/schema";

const random = {
    read(bytes: Uint8Array) {
        crypto.getRandomValues(bytes);
    },
};
export function generateId(length: number) {
    const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
    return generateRandomString(random, alphabet, length);
}

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

export async function setSessionTokenCookie(userId: string, c: Context) {
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, userId);

    setCookie(c, "session", sessionToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: session.expiresAt,
    });
    return session;
}

export async function logoutUser(c: Context, sessionId: string) {
    await invalidateSession(sessionId);
    deleteSessionTokenCookie(c);
}

export function deleteSessionTokenCookie(c: Context) {
    setCookie(c, "session", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });
}

export async function createNewUser(payload: UsersTableInsert) {
    const unlockType = "unlock_new_account";
    const outfitsToUnlock = UnlockDefs[unlockType].unlocks || [];
    const items: Item[] = outfitsToUnlock.map((outfit) => {
        return {
            source: unlockType,
            type: outfit,
            timeAcquired: Date.now(),
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

    return `${baseUrl}/api/auth/${method}/callback`;
}

export const dayInMs = 24 * 60 * 60 * 1000;
export const cooldownPeriod = 10 * dayInMs;

export function getTimeUntilNextUsernameChange(lastChangeTime: Date | null) {
    if (!(lastChangeTime instanceof Date)) return 0;

    const currentTime = Date.now();
    const timeSinceLastChange = currentTime - new Date(lastChangeTime).getTime();
    return cooldownPeriod - timeSinceLastChange;
}

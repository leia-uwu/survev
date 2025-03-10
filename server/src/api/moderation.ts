import { desc, eq, lt } from "drizzle-orm";
import { Config } from "../config";
import { db } from "./db";
import { bannedIpsTable, ipLogsTable } from "./db/schema";

export async function handleModerationAction(
    action: string,
    ip: string,
    name = "",
): Promise<string> {
    const actionHandlers = {
        ban: async () => await banIP(ip),
        unban: async () => await unbanIp(ip),
        clear: async () => await clearAllBans(),
        "get-player-ip": async () => await getPlayerIp(name),
        isbanned: async () => {
            const isIpBanned = await isBanned(ip);
            return isIpBanned ? `IP ${ip} is banned.` : `IP ${ip} is not banned.`;
        },
    };

    if (action in actionHandlers) {
        return await actionHandlers[action as keyof typeof actionHandlers]();
    }

    return "Invalid action.";
}

async function isBanned(ip: string, shouldEncode = true) {
    try {
        const encodedIp = shouldEncode ? encodeIP(ip) : ip;
        console.log(`Checking if ${encodedIp} is banned.`);
        const banned = await db.query.bannedIpsTable.findFirst({
            where: eq(bannedIpsTable.encodedIp, encodedIp),
            columns: {
                expiresIn: true,
            },
        });
        if (banned) {
            const { expiresIn } = banned;
            if (expiresIn.getTime() > Date.now()) {
                console.log(`${encodedIp} is banned.`);
                return true;
            }
            await unbanIp(encodedIp);
            console.log(`${encodedIp} is not banned.`);
            return false;
        }
        return false;
    } catch (err) {
        console.log("Failed to check if IP is banned", err);
        return false;
    }
}

async function banIP(encodedIp: string, durationInDays = 3) {
    try {
        const expiresIn = new Date(Date.now() + durationInDays * 24 * 60 * 60 * 1000);

        await db
            .insert(bannedIpsTable)
            .values({
                encodedIp,
                expiresIn,
            })
            .onDuplicateKeyUpdate({
                set: {
                    expiresIn: expiresIn,
                },
            });

        return `IP ${encodedIp} has been banned for ${durationInDays} days.`;
    } catch (err) {
        console.log("Failed to ban IP", err);
        return "An error occurred while banning IP.";
    }
}

async function unbanIp(encodedIp: string) {
    try {
        await db
            .delete(bannedIpsTable)
            .where(eq(bannedIpsTable.encodedIp, encodedIp))
            .execute();
        return `IP ${encodedIp} has been unbanned.`;
    } catch (err) {
        console.log("Failed to unban IP", err);
        return "An error occurred while unbanning IP.";
    }
}

async function clearAllBans() {
    try {
        await db.delete(bannedIpsTable).execute();
        return `All bans have been cleared.`;
    } catch (err) {
        console.log("Failed to clear all bans", err);
        return "An error occurred while clearing all bans.";
    }
}

async function getPlayerIp(name: string) {
    if (!name) return "Please enter a valid name";
    try {
        const result = await db
            .select({
                ip: ipLogsTable.encodedIp,
                name: ipLogsTable.name,
            })
            .from(ipLogsTable)
            .where(eq(ipLogsTable.name, name))
            .orderBy(desc(ipLogsTable.createdAt))
            .limit(10);

        if (result.length === 0) {
            return `No IP found for ${name}. Make sure the name matches the one in game.`;
        }

        return JSON.stringify(result.map(({ ip, name }) => `${name}'s IP is ${ip}`));
    } catch (err) {
        console.log("Failed to search IP", err);
        return "An error occurred while searching IP.";
    }
}

export async function logPlayerIP(name: string, ip: string, gameId: string) {
    try {
        await db.insert(ipLogsTable).values({
            realIp: ip,
            encodedIp: encodeIP(ip),
            name,
            gameId,
        });
    } catch (err) {
        console.log("Failed to log IP", err);
    }
}

async function cleanupOldLogs() {
    try {
        const DAYS = 7;
        const sevenDaysAgo = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000);
        await db.delete(ipLogsTable).where(lt(ipLogsTable.createdAt, sevenDaysAgo));
    } catch (err) {
        console.log("Failed to cleanup old logs", err);
    }
}

/**
 * DONT ASK ME ABOUT THIS CODE.
 */
export function encodeIP(ip: string, secret: string = Config.apiKey) {
    let encoded = "";
    for (let i = 0; i < ip.length; i++) {
        encoded += String.fromCharCode(
            ip.charCodeAt(i) ^ secret.charCodeAt(i % secret.length),
        );
    }
    return Buffer.from(encoded).toString("base64");
}

export function decodeIP(encoded: string, secret: string = Config.apiKey) {
    const decoded = Buffer.from(encoded, "base64").toString();
    let ip = "";
    for (let i = 0; i < decoded.length; i++) {
        ip += String.fromCharCode(
            decoded.charCodeAt(i) ^ secret.charCodeAt(i % secret.length),
        );
    }
    return ip;
}

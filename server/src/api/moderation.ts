import { desc, eq, lt } from "drizzle-orm";
import type { ModerationParms } from ".";
import { Config, type Region } from "../config";
import { server } from "./apiServer";
import { db } from "./db";
import { bannedIpsTable, ipLogsTable } from "./db/schema";

export async function handleModerationAction(data: ModerationParms) {
    switch (data.action) {
        case "clean-all-bans": {
            return await clearAllBans();
        }
        case "ban-ip": {
            return await banIP(data.ip);
        }
        case "unban-ip": {
            return await unbanIp(data.ip);
        }
        case "check-ban-status": {
            return await isBanned(data.ip);
        }
        case "get-player-ip": {
            return await getPlayerIp(data.playerName);
        }
        default: {
            return "Invalid action.";
        }
    }
}

export async function isBanned(ip: string) {
    const encodedIp = encodeIP(ip);
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
}

async function banIP(encodedIp: string, durationInDays = 7) {
    const expiresIn = new Date(Date.now() + durationInDays * 24 * 60 * 60 * 1000);

    await db
        .insert(bannedIpsTable)
        .values({
            encodedIp,
            expiresIn,
        })
        .onConflictDoUpdate({
            target: bannedIpsTable.encodedIp,
            set: {
                expiresIn: expiresIn,
            },
        });

    return `IP ${encodedIp} has been banned for ${durationInDays} days.`;
}

async function unbanIp(encodedIp: string) {
    await db
        .delete(bannedIpsTable)
        .where(eq(bannedIpsTable.encodedIp, encodedIp))
        .execute();
    return `IP ${encodedIp} has been unbanned.`;
}

async function clearAllBans() {
    await db.delete(bannedIpsTable).execute();
    return `All bans have been cleared.`;
}

async function getPlayerIp(name: string) {
    if (!name) return "Please enter a valid name";

    const result = await db
        .select({
            ip: ipLogsTable.encodedIp,
            name: ipLogsTable.name,
            region: ipLogsTable.region,
        })
        .from(ipLogsTable)
        .where(eq(ipLogsTable.name, name))
        .orderBy(desc(ipLogsTable.createdAt))
        .limit(10);

    if (result.length === 0) {
        return `No IP found for ${name}. Make sure the name matches the one in game.`;
    }

    return result.map(({ ip, name, region }) => `[${region}] ${name}'s IP is ${ip}`);
}

export async function logPlayerIP({
    name,
    ip,
    gameId,
    userId,
    region,
}: { region: Region; name: string; ip: string; gameId: string; userId?: string }) {
    try {
        await db.insert(ipLogsTable).values({
            realIp: ip,
            encodedIp: encodeIP(ip),
            name: name.toLowerCase(),
            gameId,
            userId,
            region,
        });
    } catch (err) {
        server.logger.warn("Failed to log player ip", err);
    }
}

// TODO: set up a cron job for this
async function cleanupOldLogs() {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        await db.delete(ipLogsTable).where(lt(ipLogsTable.createdAt, thirtyDaysAgo));
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

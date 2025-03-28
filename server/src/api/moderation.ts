import { desc, eq, lt } from "drizzle-orm";
import { Config } from "../config";
import type { SaveGameBody } from "../utils/types";
import { server } from "./apiServer";
import { db } from "./db";
import { bannedIpsTable, ipLogsTable } from "./db/schema";
import type { ModerationParms } from "./routes/private/private";

export async function handleModerationAction(data: ModerationParms) {
    switch (data.action) {
        case "clean-all-bans": {
            return await clearAllBans();
        }
        case "ban-ip": {
            return await banIP(data.ip, data.permanent, data.isEncoded);
        }
        case "unban-ip": {
            return await unbanIp(data.ip, data.isEncoded);
        }
        case "check-ban-status": {
            return await isBanned(data.ip, data.isEncoded);
        }
        case "get-player-ip": {
            return await getPlayerIp(data.playerName);
        }
        default: {
            return "Invalid action.";
        }
    }
}

export async function isBanned(ip: string, isEncoded = false) {
    const encodedIp = isEncoded ? ip : encodeIP(ip);
    const banned = await db.query.bannedIpsTable.findFirst({
        where: eq(bannedIpsTable.encodedIp, encodedIp),
        columns: {
            permanent: true,
            expiresIn: true,
        },
    });
    if (banned) {
        const { expiresIn, permanent } = banned;
        if (permanent || expiresIn.getTime() > Date.now()) {
            console.log(`${encodedIp} is banned.`);
            return true;
        }
        await unbanIp(encodedIp);
        console.log(`${encodedIp} is not banned.`);
        return false;
    }
    return false;
}

async function banIP(
    ip: string,
    isEncoded = false,
    permanent = false,
    durationInDays = 7,
) {
    const expiresIn = new Date(Date.now() + durationInDays * 24 * 60 * 60 * 1000);
    const encodedIp = isEncoded ? ip : encodeIP(ip);

    await db
        .insert(bannedIpsTable)
        .values({
            encodedIp,
            expiresIn,
            permanent,
        })
        .onConflictDoUpdate({
            target: bannedIpsTable.encodedIp,
            set: {
                expiresIn: expiresIn,
            },
        });

    if (permanent) return `IP ${ip} has been permanently banned.`;
    return `IP ${ip} has been banned for ${durationInDays} days.`;
}

async function unbanIp(ip: string, isEncoded = false) {
    const encodedIp = isEncoded ? ip : encodeIP(ip);
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
            name: ipLogsTable.username,
            region: ipLogsTable.region,
        })
        .from(ipLogsTable)
        .where(eq(ipLogsTable.username, name))
        .orderBy(desc(ipLogsTable.createdAt))
        .limit(10);

    if (result.length === 0) {
        return `No IP found for ${name}. Make sure the name matches the one in game.`;
    }

    return result.map(({ ip, name, region }) => `[${region}] ${name}'s IP is ${ip}`);
}

export async function logPlayerIPs(data: SaveGameBody["matchData"]) {
    try {
        const logsData = data.map((matchData) => ({
            ...matchData,
            encodedIp: encodeIP(matchData.ip),
        }));
        await db.insert(ipLogsTable).values(logsData);
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

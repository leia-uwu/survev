import { desc, eq, lt } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { Config } from "../../../config";
import type { SaveGameBody } from "../../../utils/types";
import { server } from "../../apiServer";
import { validateParams } from "../../auth/middleware";
import { db } from "../../db";
import { bannedIpsTable, ipLogsTable, matchDataTable, usersTable } from "../../db/schema";

export const ModerationRouter = new Hono();

ModerationRouter.post(
    "/ban-account",
    validateParams(
        z.object({
            slug: z.string(),
            banReason: z.string().default("Banned for cheating."),
        }),
    ),
    async (c) => {
        try {
            const { slug, banReason } = c.req.valid("json");

            const user = await db.query.usersTable.findFirst({
                where: eq(usersTable.slug, slug),
                columns: {
                    id: true,
                    banned: true,
                },
            });

            if (!user) {
                return c.json({ message: "No user found with that slug." }, 404);
            }

            if (user.banned) {
                return c.json({ message: "User is already banned." }, 400);
            }

            await db
                .update(usersTable)
                .set({
                    banned: true,
                    banReason,
                })
                .where(eq(usersTable.id, user.id));

            // delete all their matches
            // manually clear lb cache if they are in it
            await db.delete(matchDataTable).where(eq(matchDataTable.userId, user.id));

            return c.json({ message: "User has been banned." }, 200);
        } catch (err) {
            server.logger.warn(
                "/private/moderation/ban-account: Error banning account",
                err,
            );
            return c.json({ message: "An unexpected error occurred." }, 500);
        }
    },
);

ModerationRouter.post(
    "/ban-ip",
    validateParams(
        z.object({
            ip: z.string(),
            isEncoded: z.boolean().default(false),
            permanent: z.boolean().default(false),
            banAssociatedAccount: z.boolean().default(true),
            durationInDays: z.number().default(7),
        }),
    ),
    async (c) => {
        try {
            const { ip, isEncoded, permanent, banAssociatedAccount, durationInDays } =
                c.req.valid("json");
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

            if (banAssociatedAccount) {
                const user = await db.query.ipLogsTable.findFirst({
                    where: eq(ipLogsTable.encodedIp, encodedIp),
                    columns: {
                        userId: true,
                    },
                });
                if (user?.userId) {
                    await db
                        .update(usersTable)
                        .set({
                            banned: true,
                            banReason: "Banned for cheating.",
                        })
                        .where(eq(usersTable.id, user.userId));
                }
            }
            if (permanent)
                return c.json({ message: `IP ${ip} has been permanently banned.` }, 200);
            return c.json(
                {
                    message: `IP ${ip} has been banned for ${durationInDays} days.`,
                },
                200,
            );
        } catch (err) {
            server.logger.warn("/private/moderation/ban-ip: Error banning IP", err);
            return c.json({ message: "An unexpected error occurred." }, 500);
        }
    },
);

ModerationRouter.post(
    "/unban-ip",
    validateParams(
        z.object({
            ip: z.string(),
            isEncoded: z.boolean().default(false),
        }),
    ),
    async (c) => {
        try {
            const { ip, isEncoded } = c.req.valid("json");
            const encodedIp = isEncoded ? ip : encodeIP(ip);
            await db
                .delete(bannedIpsTable)
                .where(eq(bannedIpsTable.encodedIp, encodedIp))
                .execute();
            return c.json({ message: `IP ${encodedIp} has been unbanned.` }, 200);
        } catch (err) {
            server.logger.warn("/private/moderation/unban-ip: Error unbanning IP", err);
            return c.json({ message: "An unexpected error occurred." }, 500);
        }
    },
);

ModerationRouter.post(
    "/get-player-ip",
    validateParams(
        z.object({
            name: z.string(),
        }),
    ),
    async (c) => {
        try {
            const { name } = c.req.valid("json");

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
                return c.json(
                    {
                        message: `No IP found for ${name}. Make sure the name matches the one in game.`,
                    },
                    200,
                );
            }

            return c.json(
                {
                    message: result.map(
                        ({ ip, name, region }) => `[${region}] ${name}'s IP is ${ip}`,
                    ),
                },
                200,
            );
        } catch (err) {
            server.logger.warn(
                "/private/moderation/get-player-ip: Error getting player IP",
                err,
            );
            return c.json({ message: "An unexpected error occurred." }, 500);
        }
    },
);

ModerationRouter.post("/clear-all-bans", async (c) => {
    try {
        await db.delete(bannedIpsTable).execute();
        return c.json({ message: `All bans have been cleared.` }, 200);
    } catch (err) {
        server.logger.warn(
            "/private/moderation/clear-all-bans: Error clearing all bans",
            err,
        );
        return c.json({ message: "An unexpected error occurred." }, 500);
    }
});

// TODO: set up a cron job for this
async function cleanupOldLogs() {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        await db.delete(ipLogsTable).where(lt(ipLogsTable.createdAt, thirtyDaysAgo));
    } catch (err) {
        console.log("Failed to cleanup old logs", err);
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
        // unban the ip
        await db
            .delete(bannedIpsTable)
            .where(eq(bannedIpsTable.encodedIp, encodedIp))
            .execute();
        return false;
    }
    return false;
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

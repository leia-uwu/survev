import { desc, eq, lt } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { Config } from "../../../config";
import type { SaveGameBody } from "../../../utils/types";
import { server } from "../../apiServer";
import { databaseEnabledMiddleware, validateParams } from "../../auth/middleware";
import { db } from "../../db";
import { bannedIpsTable, ipLogsTable, matchDataTable, usersTable } from "../../db/schema";

export const ModerationRouter = new Hono();

ModerationRouter.use(databaseEnabledMiddleware);

ModerationRouter.post(
    "/ban_account",
    validateParams(
        z.object({
            slug: z.string(),
            banReason: z.string().default("Cheating"),
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
                return c.json({ error: "No user found with that slug." }, 404);
            }

            if (user.banned) {
                return c.json({ error: "User is already banned." }, 400);
            }

            await banAccount(user.id, banReason);

            return c.json({ message: "User has been banned." }, 200);
        } catch (err) {
            server.logger.warn(
                "/private/moderation/ban_account: Error banning account",
                err,
            );
            return c.json({ error: "An unexpected error occurred." }, 500);
        }
    },
);

ModerationRouter.post(
    "/unban_account",
    validateParams(
        z.object({
            slug: z.string(),
        }),
    ),
    async (c) => {
        try {
            const { slug } = c.req.valid("json");

            const user = await db.query.usersTable.findFirst({
                where: eq(usersTable.slug, slug),
                columns: {
                    id: true,
                    banned: true,
                },
            });

            if (!user) {
                return c.json({ error: "No user found with that slug." }, 404);
            }

            if (!user.banned) {
                return c.json({ error: "User is not banned." }, 400);
            }

            await db
                .update(usersTable)
                .set({
                    banned: false,
                    banReason: "",
                })
                .where(eq(usersTable.id, user.id));

            await db
                .update(matchDataTable)
                .set({ userBanned: false })
                .where(eq(matchDataTable.userId, user.id));

            return c.json({ message: "User has been unbanned." }, 200);
        } catch (err) {
            server.logger.warn(
                "/private/moderation/unban_account: Error unbanning account",
                err,
            );
            return c.json({ error: "An unexpected error occurred." }, 500);
        }
    },
);

ModerationRouter.post(
    "/ban_ip",
    validateParams(
        z.object({
            ip: z.string(),
            isEncoded: z.boolean().default(false),
            permanent: z.boolean().default(false),
            banAssociatedAccount: z.boolean().default(true),
            durationInDays: z.number().default(7),
            reason: z.string().default("Cheating"),
        }),
    ),
    async (c) => {
        try {
            const {
                ip,
                isEncoded,
                permanent,
                banAssociatedAccount,
                durationInDays,
                reason,
            } = c.req.valid("json");
            const expiresIn = new Date(Date.now() + durationInDays * 24 * 60 * 60 * 1000);
            const encodedIp = isEncoded ? ip : encodeIP(ip);

            await db
                .insert(bannedIpsTable)
                .values({
                    encodedIp,
                    expiresIn,
                    permanent,
                    reason,
                })
                .onConflictDoUpdate({
                    target: bannedIpsTable.encodedIp,
                    set: {
                        expiresIn: expiresIn,
                        reason: reason,
                        permanent: permanent,
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
                    await banAccount(user.userId, reason);
                }
            }
            if (permanent) {
                return c.json(
                    { message: `IP ${encodedIp} has been permanently banned.` },
                    200,
                );
            }
            return c.json(
                {
                    message: `IP ${encodedIp} has been banned for ${durationInDays} days.`,
                },
                200,
            );
        } catch (err) {
            server.logger.warn("/private/moderation/ban_ip: Error banning IP", err);
            return c.json({ error: "An unexpected error occurred." }, 500);
        }
    },
);

ModerationRouter.post(
    "/unban_ip",
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
            server.logger.warn("/private/moderation/unban_ip: Error unbanning IP", err);
            return c.json({ error: "An unexpected error occurred." }, 500);
        }
    },
);

ModerationRouter.post(
    "/get_player_ip",
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
                    findGameIp: ipLogsTable.findGameIp,
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
                    message: result.map(({ ip, findGameIp, name, region }) => {
                        if (ip === findGameIp) {
                            return `[${region}] ${name}'s IP is ${ip}`;
                        }

                        return `[${region}] ${name}'s IP is ${findGameIp} - in game: ${ip}`;
                    }),
                },
                200,
            );
        } catch (err) {
            server.logger.warn(
                "/private/moderation/get_player_ip: Error getting player IP",
                err,
            );
            return c.json({ error: "An unexpected error occurred." }, 500);
        }
    },
);

ModerationRouter.post("/clear_all_bans", async (c) => {
    try {
        await db.delete(bannedIpsTable).execute();
        return c.json({ message: `All bans have been cleared.` }, 200);
    } catch (err) {
        server.logger.warn(
            "/private/moderation/clear_all_bans: Error clearing all bans",
            err,
        );
        return c.json({ error: "An unexpected error occurred." }, 500);
    }
});

async function banAccount(userId: string, banReason: string) {
    await db
        .update(usersTable)
        .set({
            banned: true,
            banReason,
        })
        .where(eq(usersTable.id, userId));

    // NOTE: some lb queries join with the userTable so we do
    // this so it's easier to filter them
    await db
        .update(matchDataTable)
        .set({ userBanned: true })
        .where(eq(matchDataTable.userId, userId));
}

export async function cleanupOldLogs() {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        await db.delete(ipLogsTable).where(lt(ipLogsTable.createdAt, thirtyDaysAgo));
    } catch (err) {
        console.log("Failed to cleanup old logs", err);
    }
}

export async function isBanned(ip: string, isEncoded = false) {
    if (!Config.database.enabled) return undefined;

    const encodedIp = isEncoded ? ip : encodeIP(ip);
    const banned = await db.query.bannedIpsTable.findFirst({
        where: eq(bannedIpsTable.encodedIp, encodedIp),
        columns: {
            permanent: true,
            expiresIn: true,
            reason: true,
        },
    });
    if (banned) {
        const { expiresIn, permanent, reason } = banned;
        if (permanent || expiresIn.getTime() > Date.now()) {
            console.log(`${encodedIp} is banned.`);
            return {
                permanent,
                expiresIn,
                reason,
            };
        }
        // unban the ip
        await db
            .delete(bannedIpsTable)
            .where(eq(bannedIpsTable.encodedIp, encodedIp))
            .execute();
        return undefined;
    }
    return undefined;
}

export async function logPlayerIPs(data: SaveGameBody["matchData"]) {
    try {
        const logsData = data.map((matchData) => ({
            ...matchData,
            encodedIp: encodeIP(matchData.ip),
            findGameEncodedIp: encodeIP(matchData.findGameIp),
        }));
        await db.insert(ipLogsTable).values(logsData);
    } catch (err) {
        server.logger.warn("Failed to log player ip", err);
    }
}

/**
 * DONT ASK ME ABOUT THIS CODE.
 */
export function encodeIP(ip: string, secret: string = Config.secrets.SURVEV_IP_SECRET) {
    let encoded = "";
    for (let i = 0; i < ip.length; i++) {
        encoded += String.fromCharCode(
            ip.charCodeAt(i) ^ secret.charCodeAt(i % secret.length),
        );
    }
    return Buffer.from(encoded).toString("base64");
}

export function decodeIP(
    encoded: string,
    secret: string = Config.secrets.SURVEV_IP_SECRET,
) {
    const decoded = Buffer.from(encoded, "base64").toString();
    let ip = "";
    for (let i = 0; i < decoded.length; i++) {
        ip += String.fromCharCode(
            decoded.charCodeAt(i) ^ secret.charCodeAt(i % secret.length),
        );
    }
    return ip;
}

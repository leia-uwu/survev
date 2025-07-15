import { createHash } from "node:crypto";
import { and, desc, eq, lt, ne } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { MapId, TeamModeToString } from "../../../../../shared/defs/types/misc";
import {
    zBanAccountParams,
    zBanIpParams,
    zGetPlayerIpParams,
    zSetAccountNameParams,
    zSetMatchDataNameParams,
    zUnbanAccountParams,
    zUnbanIpParams,
} from "../../../../../shared/types/moderation";
import { Config } from "../../../config";
import { validateUserName } from "../../../utils/serverHelpers";
import type { SaveGameBody } from "../../../utils/types";
import { server } from "../../apiServer";
import { databaseEnabledMiddleware, validateParams } from "../../auth/middleware";
import { db } from "../../db";
import { bannedIpsTable, ipLogsTable, matchDataTable, usersTable } from "../../db/schema";
import { sanitizeSlug } from "../user/auth/authUtils";

export const ModerationRouter = new Hono()
    .use(databaseEnabledMiddleware)
    .post("/ban_account", validateParams(zBanAccountParams), async (c) => {
        const {
            slug,
            ban_reason: banReason,
            executorId,
            banAssociatedIps,
            ipBanDuration,
            ipBanPermanent,
        } = c.req.valid("json");

        const user = await db.query.usersTable.findFirst({
            where: eq(usersTable.slug, slug),
            columns: {
                id: true,
                banned: true,
            },
        });

        if (!user) {
            return c.json({ message: "No user found with that slug." }, 200);
        }

        if (user.banned) {
            return c.json({ message: "User is already banned." }, 200);
        }

        await banAccount(user.id, banReason, executorId);

        if (banAssociatedIps) {
            const ips = await db
                .select({
                    encodedIp: ipLogsTable.encodedIp,
                    findGameEncodedIp: ipLogsTable.findGameEncodedIp,
                })
                .from(ipLogsTable)
                .where(eq(ipLogsTable.userId, user.id))
                .groupBy(ipLogsTable.encodedIp, ipLogsTable.findGameEncodedIp);

            const expiresIn = new Date(Date.now() + ipBanDuration * 24 * 60 * 60 * 1000);

            const bans = [
                ...new Set(
                    ips.map((data) => [data.encodedIp, data.findGameEncodedIp]).flat(),
                ),
            ].map((encodedIp) => {
                return {
                    expiresIn: expiresIn,
                    encodedIp,
                    permanent: ipBanPermanent,
                    reason: banReason,
                    bannedBy: executorId,
                };
            });

            if (bans.length) {
                await db
                    .insert(bannedIpsTable)
                    .values(bans)
                    .onConflictDoUpdate({
                        target: bannedIpsTable.encodedIp,
                        set: {
                            expiresIn: expiresIn,
                            reason: banReason,
                            permanent: ipBanPermanent,
                            bannedBy: executorId,
                        },
                    });
            }

            for (const ban of bans) {
                server.teamMenu.disconnectPlayers(ban.encodedIp);
            }
        }

        return c.json(
            {
                message: `Banned ${slug} account and all associated IPs for ${ipBanDuration} days.`,
            },
            200,
        );
    })
    .post("/unban_account", validateParams(zUnbanAccountParams), async (c) => {
        const { slug } = c.req.valid("json");

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

        if (!user.banned) {
            return c.json({ message: "User is not banned." }, 400);
        }

        await db
            .update(usersTable)
            .set({
                banned: false,
                banReason: "",
                bannedBy: "",
            })
            .where(eq(usersTable.id, user.id));

        await db
            .update(matchDataTable)
            .set({ userBanned: false })
            .where(eq(matchDataTable.userId, user.id));

        return c.json({ message: "User has been unbanned." }, 200);
    })
    .post("/ban_ip", validateParams(zBanIpParams), async (c) => {
        const {
            ip,
            isEncoded,
            permanent,
            banAssociatedAccount,
            ipBanDuration,
            ban_reason: banReason,
            executorId,
        } = c.req.valid("json");
        const expiresIn = new Date(Date.now() + ipBanDuration * 24 * 60 * 60 * 1000);
        const encodedIp = isEncoded ? ip : hashIp(ip);

        await db
            .insert(bannedIpsTable)
            .values({
                encodedIp,
                expiresIn,
                permanent,
                reason: banReason,
                bannedBy: executorId,
            })
            .onConflictDoUpdate({
                target: bannedIpsTable.encodedIp,
                set: {
                    expiresIn: expiresIn,
                    reason: banReason,
                    permanent: permanent,
                },
            });

        if (banAssociatedAccount) {
            const user = await db.query.ipLogsTable.findFirst({
                where: and(
                    eq(ipLogsTable.encodedIp, encodedIp),
                    ne(ipLogsTable.userId, ""),
                ),
                columns: {
                    userId: true,
                },
            });
            if (user?.userId) {
                await banAccount(user.userId, banReason, executorId);
            }
        }

        server.teamMenu.disconnectPlayers(encodedIp);

        if (permanent) {
            return c.json(
                { message: `IP ${encodedIp} has been permanently banned.` },
                200,
            );
        }
        return c.json(
            {
                message: `IP ${encodedIp} has been banned for ${ipBanDuration} days.`,
            },
            200,
        );
    })
    .post("/unban_ip", validateParams(zUnbanIpParams), async (c) => {
        const { ip, isEncoded } = c.req.valid("json");
        const encodedIp = isEncoded ? ip : hashIp(ip);
        await db
            .delete(bannedIpsTable)
            .where(eq(bannedIpsTable.encodedIp, encodedIp))
            .execute();
        return c.json({ message: `IP ${encodedIp} has been unbanned.` }, 200);
    })
    .post("/get_player_ip", validateParams(zGetPlayerIpParams), async (c) => {
        const { name, useAccountSlug, gameId } = c.req.valid("json");

        let userId: string | null = null;

        if (useAccountSlug) {
            const user = await db.query.usersTable.findFirst({
                where: eq(usersTable.slug, name),
                columns: {
                    id: true,
                },
            });

            if (!user?.id) {
                return c.json(
                    {
                        message: `User not found`,
                    },
                    200,
                );
            }
            userId = user.id;
        }

        const result = await db
            .select({
                slug: usersTable.slug,
                authId: usersTable.authId,
                linkedDiscord: usersTable.linkedDiscord,
                ip: ipLogsTable.encodedIp,
                findGameIp: ipLogsTable.findGameEncodedIp,
                username: ipLogsTable.username,
                region: ipLogsTable.region,
                teamMode: ipLogsTable.teamMode,
                createdAt: ipLogsTable.createdAt,
                mapId: ipLogsTable.mapId,
            })
            .from(ipLogsTable)
            .where(
                and(
                    userId
                        ? eq(ipLogsTable.userId, userId)
                        : eq(ipLogsTable.username, name),
                    gameId ? eq(ipLogsTable.gameId, gameId) : undefined,
                ),
            )
            .leftJoin(usersTable, eq(ipLogsTable.userId, usersTable.id))
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

        const prettyResult = result.map((data) => ({
            ...data,
            teamMode: TeamModeToString[data.teamMode],
            mapId: MapId[data.mapId],
        }));

        return c.json(prettyResult, 200);
    })
    .post("/clear_all_bans", async (c) => {
        await db.delete(bannedIpsTable).execute();
        return c.json({ message: `All bans have been cleared.` }, 200);
    })
    .post(
        // useful for purging bad names from leaderboards
        "/set_match_data_name",
        validateParams(zSetMatchDataNameParams),
        async (c) => {
            const { current_name, new_name } = c.req.valid("json");

            const res = await db
                .update(matchDataTable)
                .set({
                    username: new_name,
                })
                .where(eq(matchDataTable.username, current_name));

            return c.json({ message: `Updated ${res.rowCount} rows` }, 200);
        },
    )
    .post("/set_account_name", validateParams(zSetAccountNameParams), async (c) => {
        const { new_name, current_slug } = c.req.valid("json");

        const sanitized = validateUserName(new_name);

        if (sanitized.originalWasInvalid) {
            return c.json({ message: "Invalid new username" }, 200);
        }

        const newSlug = sanitizeSlug(sanitized.validName);

        const res = await db
            .update(usersTable)
            .set({
                username: sanitized.validName,
                slug: newSlug,
            })
            .where(eq(usersTable.slug, current_slug));

        if (res.rowCount) {
            return c.json(
                { message: `updated player's name to ${sanitized.validName}` },
                200,
            );
        }

        return c.json({ message: `User not found` }, 400);
    })
    .post(
        "/delete_game",
        validateParams(
            z.object({
                gameId: z.string(),
            }),
        ),
        async (c) => {
            const { gameId } = c.req.valid("json");

            const res = await db
                .delete(matchDataTable)
                .where(eq(matchDataTable.gameId, gameId));

            return c.json({ message: `Deleted ${res.rowCount} rows` }, 200);
        },
    );

async function banAccount(userId: string, banReason: string, executorId: string) {
    await db
        .update(usersTable)
        .set({
            banned: true,
            banReason,
            bannedBy: executorId,
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
        server.logger.error("Failed to cleanup old logs", err);
    }
}

export async function isBanned(ip: string, isEncoded = false) {
    if (!Config.database.enabled) return undefined;

    const encodedIp = isEncoded ? ip : hashIp(ip);
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
            server.logger.info(`${encodedIp} is banned.`);
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
            encodedIp: hashIp(matchData.ip),
            findGameEncodedIp: hashIp(matchData.findGameIp),
        }));
        await db.insert(ipLogsTable).values(logsData);
    } catch (err) {
        server.logger.error("Failed to log player ip", err);
    }
}

const salt = Config.secrets.SURVEV_IP_SECRET;
export function hashIp(ip: string) {
    return createHash("sha256")
        .update(salt + ip)
        .digest("hex");
}

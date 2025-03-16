import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import type { Context } from "../..";
import { TeamMode } from "../../../../../shared/gameConfig";
import { Config } from "../../../config";
import { server } from "../../apiServer";
import { accountsEnabledMiddleware } from "../../auth/middleware";
import { CACHE_TTL, getRedisClient } from "../../cache";
import { db } from "../../db";
import { matchDataTable, usersTable } from "../../db/schema";
import { validateParams } from "../../zodSchemas";

export const matchHistoryRouter = new Hono<Context>();

/**
 * sent by the client when to teammode filter is selected
 */
const ALL_TEAM_MODES = 7;

const matchHistorySchema = z.object({
    slug: z.string(),
    offset: z.number(),
    count: z.number(),
    teamModeFilter: z
        .union([
            z.literal(TeamMode.Solo),
            z.literal(TeamMode.Duo),
            z.literal(TeamMode.Squad),
            z.literal(ALL_TEAM_MODES),
        ])
        .catch(ALL_TEAM_MODES),
});

matchHistoryRouter.post(
    "/",
    accountsEnabledMiddleware,
    validateParams(matchHistorySchema),
    async (c) => {
        try {
            const { slug, offset, teamModeFilter } = c.req.valid("json");

            const result = await db.query.usersTable.findFirst({
                where: eq(usersTable.slug, slug),
                columns: {
                    id: true,
                },
            });

            if (result == undefined || result?.id == undefined) {
                return c.json({}, 200);
            }

            const { id: userId } = result;
            const data = await db
                .select({
                    guid: matchDataTable.gameId,
                    region: matchDataTable.region,
                    map_id: matchDataTable.mapId,
                    team_mode: matchDataTable.teamMode,
                    team_count: matchDataTable.teamCount,
                    team_total: matchDataTable.teamTotal,
                    end_time: matchDataTable.createdAt,
                    time_alive: matchDataTable.timeAlive,
                    rank: matchDataTable.rank,
                    kills: matchDataTable.kills,
                    team_kills: matchDataTable.kills,
                    damage_dealt: matchDataTable.damageDealt,
                    damage_taken: matchDataTable.damageTaken,
                    slug: usersTable.slug,
                })
                .from(matchDataTable)
                .innerJoin(usersTable, eq(usersTable.id, matchDataTable.userId))
                .where(
                    and(
                        eq(usersTable.id, userId),
                        eq(matchDataTable.teamMode, teamModeFilter as TeamMode).if(
                            teamModeFilter != ALL_TEAM_MODES,
                        ),
                    ),
                )
                .orderBy(desc(matchDataTable.createdAt))
                .offset(offset)
                // NOTE: we ignore the count sent from the client; not safe;
                .limit(10);

            return c.json(data);
        } catch (_err) {
            server.logger.warn("/api/match_history: Error getting match history");
            return c.json({}, 500);
        }
    },
);

function getMatchHistoryCacheKey(userId: string) {
    // NOTE: we only cache match_history with no teammode filter
    // since this get request page load
    return `match-history:${userId}:${ALL_TEAM_MODES}`;
}

async function getMatchHistoryCache(cacheKey: string) {
    if (!Config.cachingEnabled) return;

    const client = await getRedisClient();
    const data = await client.get(cacheKey);
    return data ? JSON.parse(data) : null;
}

async function setMatchHistoryCache(cacheKey: string, data: any) {
    if (!Config.cachingEnabled) return;
    const client = await getRedisClient();
    await client.setEx(cacheKey, CACHE_TTL, JSON.stringify(data));
}

/**
 * needs to be called everytime a player plays a game
 * does it make sense to cache then?
 */
async function invalidateMatchHistoryCache(cacheKey: string) {
    if (!Config.cachingEnabled) return false;
    const client = await getRedisClient();
    await client.del(cacheKey);
    return true;
}

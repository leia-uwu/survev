import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { Hono } from "hono";
import type { Context } from "../..";
import { TeamMode } from "../../../../../shared/gameConfig";
import {
    type LeaderboardRequest,
    type LeaderboardResponse,
    zLeaderboardsRequest,
} from "../../../../../shared/types/stats";
import { math } from "../../../../../shared/utils/math";
import { Config } from "../../../config";
import type { Player } from "../../../game/objects/player";
import { server } from "../../apiServer";
import { accountsEnabledMiddleware } from "../../auth/middleware";
import { validateParams } from "../../auth/middleware";
import { CACHE_TTL, getRedisClient } from "../../cache";
import { db } from "../../db";
import { matchDataTable, usersTable } from "../../db/schema";
import { filterByInterval, filterByMapId } from "./user_stats";

export const leaderboardRouter = new Hono<Context>();

leaderboardRouter.post(
    "/",
    accountsEnabledMiddleware,
    validateParams(zLeaderboardsRequest),
    async (c) => {
        try {
            const { teamMode, mapId, type, interval } = c.req.valid("json");
            const cacheKey = getLeaderboardCacheKey({ teamMode, mapId, type, interval });
            const cachedResult = await getLeaderboardCache(cacheKey);

            if (cachedResult) {
                console.log(`CACHE HIT -> ${cacheKey}`);
                return c.json(cachedResult, 200);
            }

            const data =
                type === "most_kills" &&
                (teamMode === TeamMode.Duo || teamMode === TeamMode.Squad)
                    ? await multiplePlayersQuery({ teamMode, type, mapId, interval })
                    : await soloLeaderboardQuery({ teamMode, type, mapId, interval });

            // TODO: decide if we should cache empty results;
            if (data.length != 0) {
                let lowestScore: string | number = data[0].val;

                if (typeof lowestScore === "number") lowestScore = lowestScore.toString();

                // await updateLowestScore({
                //   cacheKey: getLowestScoreCacheKey(type, mapId),
                //   lowestScore
                // });

                await setLeaderboardCache({ cacheKey, data });
            }

            return c.json<LeaderboardResponse[]>(data, 200);
        } catch (err) {
            server.logger.warn("/api/leaderboard: Error getting leaderboard data", err);
            return c.json({ error: "" }, 500);
        }
    },
);

// we don't use the one sent by the client lol.
const MAX_RESULT_COUNT = 100;

const typeToQuery: Record<LeaderboardRequest["type"], string> = {
    kills: "match_data.kills",
    most_damage_dealt: "MAX(match_data.damage_dealt)",
    kpg: "SUM(match_data.kills) / COUNT(DISTINCT match_data.game_id)",
    most_kills: "MAX(match_data.kills)",
    wins: "COUNT(CASE WHEN match_data.rank = 1 THEN 1 END)",
};

async function soloLeaderboardQuery(params: LeaderboardRequest) {
    const { interval, mapId, teamMode, type } = params;
    const intervalFilterQuery = filterByInterval(interval);
    const mapIdFilterQuery = filterByMapId(mapId as unknown as string);

    // SQL 🤮, migrate to drizzle once stable
    const query = sql.raw(`
      SELECT
        match_data.username,
        match_data.map_id AS map_id,
        match_data.region,
        COUNT(DISTINCT(match_data.game_id)) as games,
        match_data.team_mode as team_mode,
        users.slug,
        ${typeToQuery[type]} as val
      FROM match_data
      LEFT JOIN users ON match_data.user_id = users.id
      WHERE
      team_mode = ${teamMode}
      ${intervalFilterQuery}
      ${mapIdFilterQuery}
      GROUP BY
      map_id,
      match_data.kills,
      match_data.username,
      match_data.region,
      match_data.team_mode,
      users.slug    
    ORDER BY val DESC
    LIMIT ${MAX_RESULT_COUNT};
  `);

    const result = await db.execute<LeaderboardResponse>(query);
    return result.rows;
}

async function multiplePlayersQuery({
    interval,
    mapId,
    teamMode,
}: LeaderboardRequest): Promise<LeaderboardResponse[]> {
    const intervalFilter = {
        daily: gte(matchDataTable.createdAt, sql`NOW() - INTERVAL '1 day'`),
        weekly: gte(matchDataTable.createdAt, sql`NOW() - INTERVAL '7 days'`),
    };

    const data = await db
        .select({
            matchedUsers: sql<
                {
                    username: string;
                    userId: string | null;
                }[]
            >`json_agg(
                json_build_object(
                    'username', ${matchDataTable.username},
                    'userId', ${matchDataTable.userId}
                )
            )`,
            region: matchDataTable.region,
            val: sql<number>`SUM(${matchDataTable.kills}) as val`,
        })
        .from(matchDataTable)
        .where(
            and(
                interval === "alltime" ? undefined : intervalFilter[interval],
                eq(matchDataTable.teamMode, teamMode),
                eq(matchDataTable.mapId, mapId),
            ),
        )
        .groupBy(matchDataTable.gameId, matchDataTable.teamId, matchDataTable.region)
        .orderBy(sql`val DESC`)
        .limit(MAX_RESULT_COUNT);

    // get slugs using userIds
    // @NOTE: previously this was done in SQL using a join
    // but performance degraded significantly with larger table
    // splitting it into two separate queries is much faster

    const userIds: string[] = [];
    for (const row of data) {
        for (const { userId } of row.matchedUsers) {
            if (!userId) continue;
            userIds.push(userId);
        }
    }

    const slugsFromUserIds = await db
        .select({
            slug: usersTable.slug,
            id: usersTable.id,
        })
        .from(usersTable)
        .where(inArray(usersTable.id, userIds));

    const slugMap = Object.fromEntries(
        slugsFromUserIds.map(({ id, slug }) => [id, slug]),
    );

    return data.map((row) => {
        const usernames = [];
        const slugs = [];

        for (const { userId, username } of row.matchedUsers) {
            usernames.push(username);
            slugs.push(userId ? slugMap[userId] || null : null);
        }

        return {
            region: row.region,
            slugs,
            usernames,
            val: row.val,
        };
    }) satisfies LeaderboardResponse[];
}

/**
 * WE KEEP TRACK OF THE LOWEST VALUE IN THE LEADERBOARD
 * SO WE ONLY INVALIDATE THE CACHE IF THE GAME WE ARE SAVING
 * REQUIRES TO RECACLULATE THE LEADERBOARD
 */
export async function shouldUpdateLeaderboard(
    lowestScoreCacheKey: string,
    maxGameValue: number,
): Promise<boolean> {
    if (!Config.cachingEnabled) return true;

    const client = await getRedisClient();
    const lowestLeaderboardValue = await client.get(lowestScoreCacheKey);

    if (!lowestLeaderboardValue || maxGameValue <= parseInt(lowestLeaderboardValue))
        return false;

    await client.setEx(lowestScoreCacheKey, CACHE_TTL, maxGameValue.toString());

    return true;
}

export function getLowestScoreCacheKey(params: LeaderboardRequest) {
    const { teamMode, mapId, type, interval } = params;
    return `leaderboard:lowest:${teamMode}:${mapId}:${type}:${interval}`;
}
export function getLeaderboardCacheKey(params: LeaderboardRequest) {
    const { teamMode, mapId, type, interval } = params;
    return `leaderboard:${teamMode}:${mapId}:${type}:${interval}`;
}
async function setLeaderboardCache({
    cacheKey,
    data,
}: {
    cacheKey: string;
    data: LeaderboardResponse[];
}) {
    if (!Config.cachingEnabled) return;
    const client = await getRedisClient();
    await client.setEx(cacheKey, CACHE_TTL, JSON.stringify(data));
}

export async function getLeaderboardCache(cacheKey: string) {
    if (!Config.cachingEnabled) return;

    const client = await getRedisClient();
    const data = await client.get(cacheKey);
    return data ? JSON.parse(data) : null;
}

export async function invalidateLeaderboardCache(cacheKey: string) {
    if (!Config.cachingEnabled) return false;
    const client = await getRedisClient();
    await client.del(cacheKey);
    return true;
}

export async function invalidateLeaderboards(
    players: Player[],
    mapId: number,
    teamMode: TeamMode,
) {
    if (!Config.cachingEnabled) return;
    const maxValues = players.reduce(
        (obj, player) => {
            obj.most_kills = math.max(obj.most_kills, player.kills);
            obj.most_damage_dealt = math.max(obj.most_damage_dealt, player.damageDealt);
            return obj;
        },
        {
            most_kills: 0,
            most_damage_dealt: 0,
        } as Record<LeaderboardRequest["type"], number>,
    );

    for (const [type, maxGameValue] of Object.entries(maxValues) as [
        LeaderboardRequest["type"],
        number,
    ][]) {
        for (const interval of ["daily", "weekly", "alltime"] as const) {
            const gameData: LeaderboardRequest = {
                type,
                teamMode,
                mapId,
                interval,
            };
            const lowestScoreCacheKey = getLowestScoreCacheKey(gameData);
            const shouldInvalidateLeaderboardCache = await shouldUpdateLeaderboard(
                lowestScoreCacheKey,
                maxGameValue,
            );

            if (!shouldInvalidateLeaderboardCache) continue;

            const leaderboardCacheKey = getLeaderboardCacheKey(gameData);
            invalidateLeaderboardCache(leaderboardCacheKey);
        }
    }
}

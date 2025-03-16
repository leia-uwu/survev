import { sql } from "drizzle-orm";
import type { MySqlQueryResult } from "drizzle-orm/mysql2";
import { Hono } from "hono";
import { z } from "zod";
import type { Context } from "../..";
import { TeamMode } from "../../../../../shared/gameConfig";
import { math } from "../../../../../shared/utils/math";
import { Config, type Region } from "../../../config";
import type { Player } from "../../../game/objects/player";
import { server } from "../../apiServer";
import { accountsEnabledMiddleware } from "../../auth/middleware";
import { CACHE_TTL, getRedisClient } from "../../cache";
import { db } from "../../db";
import { validateParams } from "../../zodSchemas";
import { filterByInterval, filterByMapId } from "./user_stats";

export const leaderboardRouter = new Hono<Context>();

const teamModeMap = {
    solo: TeamMode.Solo,
    duo: TeamMode.Duo,
    squad: TeamMode.Squad,
};

const LeaderboardsParamsSchema = z.object({
    interval: z.enum(["daily", "weekly", "alltime"]).catch("daily"),
    mapId: z
        .string()
        .min(1)
        .transform((v) => Number(v)),
    maxCount: z.number().optional(),
    type: z.enum(["most_kills", "most_damage_dealt", "kpg", "kills", "wins"]),
    // why tf is this sent as a string
    // TODO: refactor the client to use TeamMode enum
    teamMode: z
        .enum(["solo", "duo", "squad"])
        .catch("solo")
        .transform((mode) => teamModeMap[mode]),
});

export type LeaderboardParams = z.infer<typeof LeaderboardsParamsSchema>;

leaderboardRouter.post(
    "/",
    accountsEnabledMiddleware,
    validateParams(LeaderboardsParamsSchema),
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

            return c.json<LeaderboardReturnType[]>(data, 200);
        } catch (_err) {
            server.logger.warn("/api/user_stats: Error getting leaderboard data");
            return c.json({ error: "" }, 500);
        }
    },
);

type LeaderboardReturnType = {
    val: number;
    region: Region;
    /**
     * not used
     */
    active?: boolean;
    /**
     * required for all types except most_kills & win_streak
     */
    games?: number;
} & (
    | {
          slug: string | null;
          username: string;
      }
    | {
          slugs: (string | null)[];
          usernames: string[];
      }
);

// we don't use the one sent by the client lol.
const MAX_RESULT_COUNT = 100;

const typeToQuery: Record<LeaderboardParams["type"], string> = {
    kills: "match_data.kills",
    most_damage_dealt: "MAX(match_data.damage_dealt)",
    kpg: "SUM(match_data.kills) / COUNT(DISTINCT match_data.game_id)",
    most_kills: "MAX(match_data.kills)",
    wins: "COUNT(CASE WHEN match_data.rank = 1 THEN 1 END)",
};

async function soloLeaderboardQuery({
    interval,
    mapId,
    teamMode,
    type,
}: LeaderboardParams) {
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
      WHERE 1=1
      ${intervalFilterQuery}
      ${mapIdFilterQuery}
      AND team_mode = ${teamMode}
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
    const [result] = (await db.execute(
        query,
    )) as unknown as MySqlQueryResult<LeaderboardReturnType>;

    return result;
}

async function multiplePlayersQuery({ interval, mapId, teamMode }: LeaderboardParams) {
    const intervalFilterQuery = filterByInterval(interval);
    const mapIdFilterQuery = filterByMapId(mapId as unknown as string);

    const query = sql.raw(`
    WITH team_stats AS (
      SELECT
        game_id,
        team_id,
        region,
        JSON_ARRAYAGG(username) as usernames,
        JSON_ARRAYAGG(slug) as slugs,
        SUM(kills) as val,
        COUNT(DISTINCT(match_data.game_id)) as games
      FROM match_data
      WHERE 1=1
      ${intervalFilterQuery}
      ${mapIdFilterQuery}
      AND team_mode = ${teamMode}
      GROUP BY game_id, team_id, region
    )
    SELECT
      usernames,
      slugs,
      region,
      games,
      val
    FROM team_stats
    ORDER BY val DESC
    LIMIT ${MAX_RESULT_COUNT};
  `);

    const [result] = (await db.execute(
        query,
    )) as unknown as MySqlQueryResult<LeaderboardReturnType>;
    return result;
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

export function getLowestScoreCacheKey({
    teamMode,
    mapId,
    type,
    interval,
}: LeaderboardParams) {
    return `leaderboard:lowest:${teamMode}:${mapId}:${type}:${interval}`;
}
export function getLeaderboardCacheKey({
    teamMode,
    mapId,
    type,
    interval,
}: LeaderboardParams) {
    return `leaderboard:${teamMode}:${mapId}:${type}:${interval}`;
}
async function setLeaderboardCache({
    cacheKey,
    data,
}: {
    cacheKey: string;
    data: LeaderboardReturnType[];
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
        } as Record<LeaderboardParams["type"], number>,
    );

    for (const [type, maxGameValue] of Object.entries(maxValues) as [
        LeaderboardParams["type"],
        number,
    ][]) {
        for (const interval of ["daily", "weekly", "alltime"] as const) {
            const gameData: LeaderboardParams = {
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

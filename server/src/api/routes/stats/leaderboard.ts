import { sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import type { Context } from "../..";
import { TeamMode } from "../../../../../shared/gameConfig";
import type { Region } from "../../../config";
import { getRedisClient } from "../../cache";
import { db } from "../../db";
import { validateParams } from "../../zodSchemas";
import { filterByInterval, filterByMapId } from "./user_stats";

export const leaderboardRouter = new Hono<Context>();

const teamModeMap = {
    solo: TeamMode.Solo,
    duo: TeamMode.Duo,
    squad: TeamMode.Squad,
};

const paramsSchema = z.object({
    interval: z.enum(["daily", "weekly", "alltime"]).catch("daily"),
    mapId: z
        .string()
        .min(1)
        .transform((v) => Number(v)),
    maxCount: z.number(),
    type: z.enum(["most_kills", "most_damage_dealt", "kpg", "kills", "wins"]),
    // why tf is this sent as a string
    // TODO: refactor the client to use TeamMode enum
    teamMode: z
        .enum(["solo", "duo", "squad"])
        .catch("solo")
        .transform((mode) => teamModeMap[mode]),
});

type ParamsSchema = z.infer<typeof paramsSchema>;

function getVal(type: ParamsSchema["type"], row: any) {
    // can this be done in the sql?
    if (type === "most_kills") return row.mostKills;
    if (type === "most_damage_dealt") return row.mostDamage;
    if (type === "kpg") return row.kpg;
    if (type === "kills") return row.kills;
    if (type === "wins") return row.wins;
}
leaderboardRouter.post("/", validateParams(paramsSchema), async (c) => {
    const { teamMode, mapId, type, interval } = c.req.valid("json");
    const cacheKey = getLeaderboardCacheKey({ teamMode, mapId, type });
    const cachedResult = await getLeaderboardCache(cacheKey);

    if (cachedResult) {
        console.log(`CACHE HIT -> ${cacheKey}`);
        return c.json(cachedResult, 200);
    }

    const data =
        type === "most_kills" &&
        (teamMode === TeamMode.Duo || teamMode === TeamMode.Squad)
            ? await multiplePlayersQuery(teamMode, type, mapId, interval)
            : await soloLeaderboardQuery(teamMode, type, mapId, interval);

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

    return c.json(data, 200);
});

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

async function soloLeaderboardQuery(
    teamMode: TeamMode,
    type: ParamsSchema["type"],
    mapIdFilter: number | string,
    interval: string,
) {
    const intervalFilterQuery = filterByInterval(interval);
    const mapIdFilterQuery = filterByMapId(mapIdFilter as string);

    const sortMap = {
        kills: "kills",
        most_damage_dealt: "mostDamage",
        kpg: "kpg",
        most_kills: "mostKills",
        wins: "wins",
    };

    const query = sql.raw(`
      SELECT
        match_data.kills as kills,
        match_data.username,
        match_data.map_id AS map_id,
        SUM(match_data.kills) as total_kills,
        match_data.region,
        COUNT(DISTINCT(match_data.gameId)) as games,
        COUNT(CASE WHEN match_data.rank = 1 THEN 1 END) as wins,
        SUM(match_data.kills) / COUNT(DISTINCT match_data.gameId) as kpg,
        MAX(match_data.damage_dealt) as mostDamage,
        MAX(match_data.kills) as mostKills,
        match_data.team_mode as team_mode,
        users.slug
      FROM match_data
      LEFT JOIN users ON match_data.user_id = users.id
      WHERE 1=1
      ${intervalFilterQuery}
      ${mapIdFilterQuery}
      AND team_mode = ${teamMode}
      GROUP BY
      map_id,
      kills,
      match_data.username,
      match_data.region,
      match_data.team_mode,
      users.slug
    ORDER BY ${sortMap[type]} DESC
    LIMIT ${MAX_RESULT_COUNT};
  `);
    const result: any = await db.execute(query);

    // @ts-expect-error guh drizzle
    return result[0].map((row) => {
        const val = getVal(type, row) as number;
        return {
            ...row,
            val,
        };
    });
}

async function multiplePlayersQuery(
    teamMode: TeamMode,
    type: ParamsSchema["type"],
    mapIdFilter: number | string,
    interval: string,
) {
    const intervalFilterQuery = filterByInterval(interval);
    const mapIdFilterQuery = filterByMapId(mapIdFilter as string);
    const query = sql.raw(`
    WITH team_stats AS (
      SELECT
        gameId,
        team_id,
        region,
        JSON_ARRAYAGG(username) as usernames,
        JSON_ARRAYAGG(slug) as slugs,
        SUM(kills) as team_kills,
        COUNT(DISTINCT(match_data.gameId)) as games
      FROM match_data
      WHERE 1=1
      ${intervalFilterQuery}
      ${mapIdFilterQuery}
      AND team_mode = ${teamMode}
      GROUP BY gameId, team_id, region
    )
    SELECT
      usernames,
      slugs,
      region,
      games,
      team_kills as val
    FROM team_stats
    ORDER BY team_kills DESC
    LIMIT ${MAX_RESULT_COUNT};
  `);

    const data = await db.execute(query);
    return data[0];
}

const CACHE_TTL = 300;

/**
 * WE KEEP TRACK OF THE LOWEST VALUE IN THE LEADERBOARD
 * SO WE ONLY INVALIDATE THE CACHE IF THE GAME WE ARE SAVING
 * REQUIRES TO RECACLULATE THE LEADERBOARD
 */
async function updateLowestScore({
    cacheKey,
    lowestScore,
}: {
    cacheKey: string;
    lowestScore: string;
}) {
    const client = await getRedisClient();
    await client.setEx(cacheKey, CACHE_TTL, lowestScore);
    return;
}
async function shouldUpdateLeaderboard({
    cacheKey,
    highestScore,
}: {
    cacheKey: string;
    highestScore: number;
}): Promise<boolean> {
    const client = await getRedisClient();
    const data = await client.get(cacheKey);

    if (!data || highestScore <= parseInt(data)) return false;

    await client.setEx(cacheKey, CACHE_TTL, highestScore.toString());

    return true;
}

function getLowestScoreCacheKey({
    teamMode,
    mapId,
    type,
}: { teamMode: TeamMode; mapId: number; type: string }) {
    return `leaderboard:lowest:${teamMode}:${mapId}:${type}`;
}
function getLeaderboardCacheKey({
    teamMode,
    mapId,
    type,
}: { teamMode: TeamMode; mapId: number; type: string }) {
    return `leaderboard:${teamMode}:${mapId}:${type}`;
}
async function setLeaderboardCache({
    cacheKey,
    data,
}: {
    cacheKey: string;
    data: LeaderboardReturnType[];
}) {
    const client = await getRedisClient();
    await client.setEx(cacheKey, CACHE_TTL, JSON.stringify(data));
}

async function getLeaderboardCache(cacheKey: string) {
    const client = await getRedisClient();
    const data = await client.get(cacheKey);
    return data ? JSON.parse(data) : null;
}
async function invalidateLeaderboardCache({
    cacheKey,
}: {
    cacheKey: string;
}) {
    const client = await getRedisClient();
    await client.del(cacheKey);
    return true;
}

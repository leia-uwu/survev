import { zValidator } from "@hono/zod-validator";
import { and, eq, gt, max, sql, sum } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import type { Context } from "../..";
import type { TeamMode } from "../../../../../shared/gameConfig";
import { db } from "../../db";
import { matchDataTable, usersTable } from "../../db/schema";
import { getRedisClient } from "../../cache";
import { validateParams } from "../../zodSchemas";

export const UserStatsRouter = new Hono<Context>();

const userStatsSchema = z.object({
    // why is the client sending null as the default value
    // and why is there all and alltime???
    // TODO: remove all and send "alltime" as the default
    interval: z.enum(["all", "daily", "weekly", "alltime"]).nullable().catch("all").transform(v => v ?? "all"),
    slug: z.string().min(1),
    // TODO: use mapId eenum for extra validation
    mapIdFilter: z.string().catch("-1"),
});

/*
  * minimum data required for the ui to show the user doesn't exist
*/
const emptyState = {
  slug: "",
  username: "",
  modes: [],
};

UserStatsRouter.post(
    "/",
    validateParams(userStatsSchema),
    async (c) => {
        try {
          // TODO: filter by interval
            const { interval, mapIdFilter, slug } = c.req.valid("json");

            const result = await db.query.usersTable.findFirst({
              where: eq(usersTable.slug, slug),
              columns: {
                id: true
              }
            })

            if (!result) {
                return c.json(
                    emptyState,
                    200,
                );
            }

          const { id: userId } = result;

          const data = await userStatsSqlQuery(userId, mapIdFilter, interval);

          return c.json<UserStatsResponse>(data, 200);
        } catch (_err) {
            console.log({ _err });
            return c.json({ error: ""}, 500);
        }
    },
);

type UserStatsResponse = {
    slug: string;
    username: string;
    player_icon: string;
    banned: boolean;
    wins: number;
    kills: number;
    games: number;
    kpg: number;
    modes: ModeStat[];
};

export interface ModeStat {
    teamMode: TeamMode;
    games: number;
    wins: number;
    kills: number;
    winPct: number;
    mostKills: number;
    mostDamage: number;
    kpg: number;
    avgDamage: number;
    avgTimeAlive: number;
}


export function filterByInterval(interval: string) {
  if (interval === "weekly") {
    return "AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
  }
  if (interval === "daily") {
    return "AND created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)";
  }
  return ""; // Default case for "all" or "alltime"
};

export function filterByMapId(mapIdFilter: string) {
  return mapIdFilter === "-1" ? "" : `AND map_id = '${mapIdFilter}'`
}

async function userStatsSqlQuery(userId: string, mapIdFilter: string, interval: string): Promise<UserStatsResponse> {
  const intervalFilterQuery = filterByInterval(interval)
  const mapIdFilterQuery = filterByMapId(mapIdFilter);

  const query = sql.raw(`
    WITH mode_stats AS (
        SELECT
            u.slug,
            m.team_mode,
            COUNT(*) AS games,
            SUM(CASE WHEN m.rank = 1 THEN 1 ELSE 0 END) AS wins,
            SUM(m.kills) AS kills,
            ROUND(SUM(CASE WHEN m.rank = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS winPct,
            MAX(m.kills) AS most_kills,
            MAX(m.damage_dealt) AS most_damage,
            ROUND(SUM(m.kills) * 1.0 / COUNT(*), 1) AS kpg,
            ROUND(AVG(m.damage_dealt)) AS avg_damage,
            ROUND(AVG(m.time_alive)) AS avg_time_alive
        FROM users u
        INNER JOIN match_data m ON u.id = m.user_id
        WHERE u.id = '${userId}'
        ${ intervalFilterQuery }
        ${ mapIdFilterQuery }
        GROUP BY u.slug, u.username, m.team_mode
    )
    SELECT
        u.slug,
        u.username,
        u.banned,
        JSON_EXTRACT(u.loadout, '$.player_icon') AS player_icon,
        COALESCE(SUM(ms.games), 0) AS games,
        COALESCE(SUM(ms.wins), 0) AS wins,
        COALESCE(SUM(ms.kills), 0) AS kills,
        COALESCE(ROUND(SUM(ms.kills) * 1.0 / NULLIF(SUM(ms.games), 0), 1), 0) AS kpg,
        COALESCE(JSON_ARRAYAGG(
            CASE WHEN ms.team_mode IS NOT NULL THEN
                JSON_OBJECT(
                    'wins', ms.wins,
                    'kills', ms.kills,
                    'teamMode', ms.team_mode,
                    'avgDamage', ms.avg_damage,
                    'avgTimeAlive', ms.avg_time_alive,
                    'mostDamage', ms.most_damage,
                    'kpg', ms.kpg,
                    'winPct', ms.winPct,
                    'mostKils', ms.most_kills
                )
            END
        ), '[]') AS modes
    FROM users u
    LEFT JOIN mode_stats ms ON u.slug = ms.slug
    WHERE u.id = '${userId}'
    GROUP BY u.slug, u.username, u.banned
    LIMIT 1;
    `);
  const [data] = await db.execute(query);
  const userStats = (data as any)[0];

  if ( !userStats ) return emptyState as unknown as UserStatsResponse;

  const modes = JSON.parse(userStats?.modes)
  const formatedData: UserStatsResponse = {
    ...userStats,
    // sql fuckery, it returns [null] where no result
    modes: modes[0] === null ? [] : modes,
  };
  return formatedData;
}

function getUserStatsCacheKey(userId: string, mapIdFilter: string) {
  return `user-stats:${userId}:${mapIdFilter}`;
}

async function getUserStatsFromCache(cacheKey: string) {
  const client = await getRedisClient();
  const data = await client.get(cacheKey);
  return data ? JSON.parse(data) : null
}

async function setUserStatsCache(cacheKey: string, data: UserStatsResponse) {
  const client = await getRedisClient();
  await client.set(cacheKey, JSON.stringify(data));
  return true;
}
/*
  this needss to be called every time a game is played.
  also if any of these {banned, username, slug, laodout.avatar} changes :sob:
*/
export async function invalidateUserStatsCache(userId: string, mapIdFilter: string) {
  const client = await getRedisClient();
  // clear the cached stat for that sepcific map
  await client.del(getUserStatsCacheKey(userId, mapIdFilter));
  // clear the cached stat for when no map filter is applied
  await client.del(getUserStatsCacheKey(userId, "-1"));
  return true;
}

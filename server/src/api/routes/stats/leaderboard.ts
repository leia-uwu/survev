import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { Hono } from "hono";
import type { Context } from "../..";
import { MinGames } from "../../../../../shared/constants";
import { TeamMode } from "../../../../../shared/gameConfig";
import {
    type LeaderboardRequest,
    type LeaderboardResponse,
    zLeaderboardsRequest,
} from "../../../../../shared/types/stats";
import { Config } from "../../../config";
import { server } from "../../apiServer";
import { databaseEnabledMiddleware, rateLimitMiddleware } from "../../auth/middleware";
import { validateParams } from "../../auth/middleware";
import { leaderboardCache } from "../../cache/leaderboard";
import { db } from "../../db";
import { matchDataTable, usersTable } from "../../db/schema";
import { filterByInterval, filterByMapId } from "./user_stats";

export const leaderboardRouter = new Hono<Context>();

leaderboardRouter.post(
    "/",
    databaseEnabledMiddleware,
    rateLimitMiddleware(40, 60 * 1000),
    validateParams(zLeaderboardsRequest),
    async (c) => {
        try {
            const params = c.req.valid("json");
            const { type, teamMode } = params;
            const cachedResult = await leaderboardCache.get(params);

            if (cachedResult) {
                server.logger.info(
                    `[CACHE HIT] -> ${leaderboardCache.getCacheKey("leaderboard", params)}`,
                );
                return c.json(cachedResult, 200);
            }

            const startTime = performance.now();
            const data =
                type === "most_kills" && teamMode != TeamMode.Solo
                    ? await multiplePlayersQuery(params)
                    : await soloLeaderboardQuery(params);
            logQueryPerformance(startTime, params);

            // TODO: decide if we should cache empty results;
            if (data.length != 0) {
                await leaderboardCache.set(params, data);
            }

            return c.json<LeaderboardResponse[]>(data, 200);
        } catch (err) {
            server.logger.error("/api/leaderboard: Error getting leaderboard data", err);
            return c.json({ error: "" }, 500);
        }
    },
);

// we don't use the one sent by the client lol.
const MAX_RESULT_COUNT = 100;

const typeToQuery: Record<LeaderboardRequest["type"], string> = {
    kills: "SUM(match_data.kills)",
    most_damage_dealt: "MAX(match_data.damage_dealt)",
    kpg: "ROUND(SUM(match_data.kills) * 1.0 / COUNT(*), 1)",
    most_kills: "match_data.kills",
    wins: "COUNT(CASE WHEN match_data.rank = 1 THEN 1 END)",
};

async function soloLeaderboardQuery(params: LeaderboardRequest) {
    const { interval, mapId, teamMode, type } = params;
    const intervalFilterQuery = filterByInterval(interval);
    const mapIdFilterQuery = filterByMapId(mapId as unknown as string);
    const userNotBannedQuery = `AND users.banned = false`;
    const loggedPlayersFilterQuery = `AND match_data.user_id IS NOT NULL`;
    const minGames = type === "kpg" ? MinGames[type][interval] : 1;

    const usernameQuery =
        type === "most_kills" ? "match_data.username" : "users.username";

    // SQL 🤮, migrate to drizzle once stable
    const query = sql.raw(`
    SELECT
        ${usernameQuery} AS username,
        match_data.map_id AS map_id,
        match_data.region,
        COUNT(DISTINCT(match_data.game_id)) as games,
        match_data.team_mode as team_mode,
        users.slug,
        ${typeToQuery[type]} as val
    FROM match_data
    LEFT JOIN users ON match_data.user_id = users.id
    WHERE team_mode = ${teamMode}
        ${userNotBannedQuery}
        ${loggedPlayersFilterQuery}
        ${intervalFilterQuery}
        ${mapIdFilterQuery}
    GROUP BY
        map_id,
        users.slug,
        match_data.region,
        match_data.team_mode,
        ${type === "most_kills" ? "match_data.kills," : ""}
        ${usernameQuery}
    HAVING COUNT(DISTINCT(match_data.game_id)) >= ${minGames}
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
                eq(matchDataTable.userBanned, false),
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
        .where(and(inArray(usersTable.id, userIds), eq(usersTable.banned, false)));

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

function logQueryPerformance(startTime: number, params: LeaderboardRequest) {
    if (!Config.errorLoggingWebhook) return;
    if (Math.random() > 0.2) return;

    const endTime = performance.now();
    const executionTime = endTime - startTime;
    const message = `**${params.type} leaderboard** | Execution time: ${executionTime > 1000 ? `${(executionTime / 1000).toFixed(2)}s` : `${executionTime.toFixed(2)}ms`} | Params: ${JSON.stringify(params)}`;

    fetch(Config.errorLoggingWebhook, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
    });
}

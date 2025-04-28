import { eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import type { Context } from "../..";
import {
    type UserStatsResponse,
    zUserStatsRequest,
} from "../../../../../shared/types/stats";
import { databaseEnabledMiddleware, rateLimitMiddleware } from "../../auth/middleware";
import { validateParams } from "../../auth/middleware";
import { db } from "../../db";
import { usersTable } from "../../db/schema";

export const UserStatsRouter = new Hono<Context>();

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
    databaseEnabledMiddleware,
    rateLimitMiddleware(40, 60 * 1000),
    validateParams(zUserStatsRequest),
    async (c) => {
        const { interval, mapIdFilter, slug } = c.req.valid("json");

        const result = await db.query.usersTable.findFirst({
            where: eq(usersTable.slug, slug),
            columns: {
                id: true,
                banned: true,
            },
        });

        if (!result) {
            return c.json(emptyState, 200);
        }

        const { id: userId } = result;

        const data = await userStatsSqlQuery(userId, mapIdFilter, interval);

        return c.json<UserStatsResponse>(data, 200);
    },
);

export function filterByInterval(interval: string) {
    if (interval === "weekly") {
        return `AND created_at >= (NOW() - INTERVAL '7 DAY')`;
    }
    if (interval === "daily") {
        return ` AND created_at >= (NOW() - INTERVAL '1 DAY')`;
    }
    return ""; // Default case for "all" or "alltime"
}

export function filterByMapId(mapIdFilter: string) {
    return mapIdFilter === "-1" ? "" : `AND map_id = '${mapIdFilter}'`;
}

async function userStatsSqlQuery(
    userId: string,
    mapIdFilter: string,
    interval: string,
): Promise<UserStatsResponse> {
    const intervalFilterQuery = filterByInterval(interval);
    const mapIdFilterQuery = filterByMapId(mapIdFilter);

    const query = sql.raw(`
            WITH mode_stats AS (
                SELECT
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
                FROM match_data m
                WHERE m.user_id = '${userId}'
                ${intervalFilterQuery}
                ${mapIdFilterQuery}
                GROUP BY m.team_mode
            )
            SELECT
                u.slug,
                u.username,
                u.banned,
                JSON_EXTRACT_PATH(ANY_VALUE(u.loadout), 'player_icon') AS player_icon,
                COALESCE(SUM(ms.games), 0) AS games,
                COALESCE(SUM(ms.wins), 0) AS wins,
                COALESCE(SUM(ms.kills), 0) AS kills,  
                COALESCE(ROUND(SUM(ms.kills) * 1.0 / NULLIF(SUM(ms.games), 0), 1), 0) AS kpg,
        COALESCE(JSON_AGG(
            CASE WHEN ms.team_mode IS NOT NULL THEN
                JSON_BUILD_OBJECT(
                    'wins', ms.wins,
                    'kills', ms.kills,
                    'teamMode', ms.team_mode,
                    'avgDamage', ms.avg_damage,
                    'avgTimeAlive', ms.avg_time_alive,
                    'mostDamage', ms.most_damage,
                    'kpg', ms.kpg,
                    'winPct', ms.winPct,
                    'mostKills', ms.most_kills
                )
            END
        ), '[]') AS modes
            FROM users u
            LEFT JOIN mode_stats ms ON 1 = 1
            WHERE u.id = '${userId}'
            GROUP BY u.slug, u.username, u.banned
            LIMIT 1;
    `);

    const data = await db.execute<UserStatsResponse>(query);
    const userStats = data.rows[0];

    if (!userStats || !userStats.slug) return emptyState as unknown as UserStatsResponse;

    const modes = userStats?.modes;
    const formatedData: UserStatsResponse = {
        ...userStats,
        // sql fuckery, it returns [null] where no result
        modes: modes[0] === null ? [] : modes,
    };
    return formatedData;
}

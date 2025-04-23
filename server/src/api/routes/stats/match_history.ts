import { and, desc, eq, gt } from "drizzle-orm";
import { Hono } from "hono";
import type { Context } from "../..";
import type { TeamMode } from "../../../../../shared/gameConfig";
import {
    ALL_TEAM_MODES,
    type MatchHistoryResponse,
    zMatchHistoryRequest,
} from "../../../../../shared/types/stats";
import { server } from "../../apiServer";
import { databaseEnabledMiddleware, rateLimitMiddleware } from "../../auth/middleware";
import { validateParams } from "../../auth/middleware";
import { db } from "../../db";
import { matchDataTable, usersTable } from "../../db/schema";

export const matchHistoryRouter = new Hono<Context>();

matchHistoryRouter.post(
    "/",
    databaseEnabledMiddleware,
    rateLimitMiddleware(40, 60 * 1000),
    validateParams(zMatchHistoryRequest),
    async (c) => {
        try {
            const { slug, offset, teamModeFilter } = c.req.valid("json");

            const result = await db.query.usersTable.findFirst({
                where: eq(usersTable.slug, slug),
                columns: {
                    id: true,
                },
            });

            if (result?.id == undefined) {
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
                        gt(
                            matchDataTable.createdAt,
                            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                        ),
                    ),
                )
                .orderBy(desc(matchDataTable.createdAt))
                .offset(offset)
                .limit(10);

            return c.json<MatchHistoryResponse>(data);
        } catch (err) {
            server.logger.error("/api/match_history: Error getting match history", err);
            return c.json({}, 500);
        }
    },
);

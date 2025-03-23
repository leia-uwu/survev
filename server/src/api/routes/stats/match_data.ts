import { asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import type { Context } from "../..";
import { server } from "../../apiServer";
import { accountsEnabledMiddleware } from "../../auth/middleware";
import { db } from "../../db";
import { matchDataTable, usersTable } from "../../db/schema";
import { validateParams } from "../../auth/middleware";
import { MatchData, zMatchDataRequest } from "../../../../../shared/types/stats";

export const matchDataRouter = new Hono<Context>();

matchDataRouter.post(
    "/",
    accountsEnabledMiddleware,
    validateParams(zMatchDataRequest),
    async (c) => {
        try {
            const { gameId } = c.req.valid("json");

            const result = await db
                .select({
                    slug: usersTable.slug,
                    username: matchDataTable.username,
                    player_id: matchDataTable.playerId,
                    team_id: matchDataTable.teamId,
                    time_alive: matchDataTable.timeAlive,
                    rank: matchDataTable.rank,
                    died: matchDataTable.died,
                    kills: matchDataTable.kills,
                    damage_dealt: matchDataTable.damageDealt,
                    damage_taken: matchDataTable.damageTaken,
                    killer_id: matchDataTable.killerId,
                    killed_ids: matchDataTable.killedIds,
                })
                .from(matchDataTable)
                .leftJoin(usersTable, eq(usersTable.id, matchDataTable.userId))
                .orderBy(asc(matchDataTable.rank))
                .where(eq(matchDataTable.gameId, gameId));

            return c.json<MatchData[]>(result);
        } catch (err) {
            server.logger.warn("/api/match_data: Error getting match data", err);
            return c.json({}, 500);
        }
    },
);
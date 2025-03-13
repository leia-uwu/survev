import { asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import type { Context } from "../..";
import { server } from "../../apiServer";
import { db } from "../../db";
import { matchDataTable } from "../../db/schema";
import { validateParams } from "../../zodSchemas";

export const matchDataRouter = new Hono<Context>();

const matchDataSchema = z.object({
    gameId: z.string(),
});

matchDataRouter.post("/", validateParams(matchDataSchema), async (c) => {
    try {
        const { gameId } = c.req.valid("json");

        const result = await db
            .select({
                slug: matchDataTable.slug,
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
            .orderBy(asc(matchDataTable.rank))
            .where(eq(matchDataTable.gameId, gameId));

        return c.json<MatchData[]>(result);
    } catch (_err) {
        server.logger.warn("/api/match_data: Error getting match data");
        return c.json({}, 500);
    }
});

export type MatchData = {
    slug: string | null;
    username: string;
    player_id: number;
    team_id: number;
    time_alive: number;
    rank: number;
    died: boolean;
    kills: number;
    damage_dealt: number;
    damage_taken: number;
    killer_id: number;
    killed_ids: number[];
};

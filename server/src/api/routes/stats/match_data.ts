import { zValidator } from "@hono/zod-validator";
import { asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import type { Context } from "../..";
import { db } from "../../db";
import { matchDataTable } from "../../db/schema";

export const matchDataRouter = new Hono<Context>();

const matchDataSchema = z.object({
    gameId: z.string(),
});

function shuffle<T>(array: T[]): T[] {
  return array.sort(() => Math.random() - 0.5);
}

matchDataRouter.post(
    "/",
    zValidator("json", matchDataSchema, (result, c) => {
        if (!result.success) {
            return c.json(
                {
                    message: "Invalid params",
                },
                400,
            );
        }
    }),
    async (c) => {
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
                
                return c.json<MatchData[]>(result)
        } catch (_err) {
            console.log({ _err });
            return c.json({}, 500);
        }
    },
);

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
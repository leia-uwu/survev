import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import type { Context } from "../..";
import { TeamMode } from "../../../../../shared/gameConfig";
import { db } from "../../db";
import { matchDataTable } from "../../db/schema";

export const matchHistoryRouter = new Hono<Context>();

const matchHistorySchema = z.object({
    slug: z.string(),
    offset: z.number(),
    count: z.number(),
    teamModeFilter: z
        .union([
            z.literal(TeamMode.Solo),
            z.literal(TeamMode.Duo),
            z.literal(TeamMode.Squad),
            z.literal(7),
        ])
        .catch(7),
});

matchHistoryRouter.post(
    "/",
    zValidator("json", matchHistorySchema, (result, c) => {
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
            const { slug, offset, teamModeFilter } = c.req.valid("json");

            const result = await db
                .select({
                    guid: matchDataTable.gameId,
                    region: matchDataTable.region,
                    map_id: matchDataTable.mapId,
                    team_mode: matchDataTable.teamMode,
                    team_count: matchDataTable.teamTotal,
                    team_total: matchDataTable.teamTotal,
                    end_time: matchDataTable.createdAt,
                    time_alive: matchDataTable.timeAlive,
                    rank: matchDataTable.rank,
                    kills: matchDataTable.kills,
                    team_kills: matchDataTable.kills,
                    damage_dealt: matchDataTable.damageDealt,
                    damage_taken: matchDataTable.damageTaken,
                })
                .from(matchDataTable)
                .where(
                    and(
                        eq(matchDataTable.slug, slug),
                        eq(matchDataTable.teamMode, teamModeFilter as TeamMode).if(
                            teamModeFilter != 7,
                        ),
                    ),
                )
                .offset(offset)
                // NOTE: we ignore the count sent from the client; not safe;
                .limit(10);

            return c.json(result);
        } catch (_err) {
            console.log({ _err });
            return c.json({}, 500);
        }
    },
);

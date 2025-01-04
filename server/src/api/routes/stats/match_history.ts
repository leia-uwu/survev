import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import type { Context } from "../..";

export const matchHistoryRouter = new Hono<Context>();

const matchHistorySchema = z.object({
    slug: z.string(),
    offset: z.number(),
    count: z.number(),
    teamModeFilter: z.enum(["1", "2", "4", "7"]).catch("7"),
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
        return c.json(
            Array.from({ length: 10 }, (_, i) => ({
                guid: "85d16fd3-be8f-913b-09ce-4ba5c86482aa" + Math.random(),
                region: "na",
                map_id: 2,
                team_mode: 2,
                team_count: 1,
                team_total: 13,
                end_time: "2021-11-06T05:01:34.000Z",
                time_alive: 303,
                rank: 1,
                kills: 11,
                team_kills: 11,
                damage_dealt: 1264,
                damage_taken: 227,
            })),
            200,
        );
    },
);

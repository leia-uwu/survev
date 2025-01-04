import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import type { Context } from "../..";
import type { TeamMode } from "../../../../../shared/gameConfig";
import { db } from "../../db";
import { matchDataTable, usersTable } from "../../db/schema";

export const UserStatsRouter = new Hono<Context>();

const userStatsSchema = z.object({
    interval: z.enum(["all", "daily", "weekly", "alltime"]).catch("all"),
    slug: z.string().min(1),
    // TODO: map enum
    mapIdFilter: z.string().catch("-1"),
});

UserStatsRouter.post(
    "/",
    zValidator("json", userStatsSchema, (result, c) => {
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
            const { interval, mapIdFilter, slug } = c.req.valid("json");

            const result = await db.query.usersTable.findFirst({
                where: eq(usersTable.slug, slug),
            });

            if (!result) {
                // minimum data required for the ui to show the user doesn't exist
                return c.json(
                    {
                        slug: "",
                        username: "",
                        modes: [],
                    },
                    200
                );
            }

            const {
                slug: user_slug,
                username,
                id,
                loadout,
                wins,
                kills,
                games,
                kpg,
                banned,
            } = result;

            const matchHistory = await db.query.matchDataTable.findMany({
                where: eq(matchDataTable.userId, id),
            });

            return c.json<UserStatsResponse>(
                {
                    slug: user_slug,
                    username,
                    player_icon: loadout.player_icon,
                    banned,
                    wins,
                    kills,
                    games,
                    kpg,
                    modes: [
                        {
                            teamMode: 1,
                            games: 1035,
                            wins: 561,
                            kills: 2730,
                            winPct: 54.2,
                            mostKills: 10,
                            mostDamage: 1309,
                            kpg: 2.6,
                            avgDamage: 373,
                            avgTimeAlive: 294,
                        },
                        {
                            teamMode: 2,
                            games: 730,
                            wins: 312,
                            kills: 2019,
                            winPct: 42.7,
                            mostKills: 13,
                            mostDamage: 1833,
                            kpg: 2.8,
                            avgDamage: 475,
                            avgTimeAlive: 251,
                        },
                        {
                            teamMode: 4,
                            games: 783,
                            wins: 432,
                            kills: 1871,
                            winPct: 55.2,
                            mostKills: 12,
                            mostDamage: 2427,
                            kpg: 2.4,
                            avgDamage: 546,
                            avgTimeAlive: 272,
                        },
                    ],
                },
                200,
            );
        } catch (_err) {
            console.log({ _err });
            return c.json({}, 400);
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

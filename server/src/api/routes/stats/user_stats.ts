import { zValidator } from "@hono/zod-validator";
import { and, eq, gt, sql } from "drizzle-orm";
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

const getDurationFilter = (duration: "daily" | "weekly") => {
    const now = new Date();

    switch (duration) {
        case "daily":
            return gt(matchDataTable.createdAt, new Date(now.setDate(now.getDate() - 1)));
        case "weekly":
            return gt(matchDataTable.createdAt, new Date(now.setDate(now.getDate() - 7)));
        default:
            undefined;
    }
};

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

            // TODO: do both queries in a join
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
                    200,
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

            type sortingInterval = "daily" | "weekly";
            const statsQuery = db
                .select({
                    teamMode: matchDataTable.teamMode,
                    games: sql<number>`count(*)`,
                    wins: sql<number>`SUM(CASE WHEN \`rank\` = 1 THEN 1 ELSE 0 END)`,
                    kills: sql<number>`SUM(kills)`,
                    winPct: sql<number>`ROUND(SUM(CASE WHEN \`rank\` = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1)`,
                    mostKills: sql<number>`MAX(kills)`,
                    mostDamage: sql<number>`MAX(damage_dealt)`,
                    kpg: sql<number>`ROUND(SUM(kills) * 1.0 / COUNT(*), 1)`,
                    avgDamage: sql<number>`ROUND(AVG(damage_dealt))`,
                    avgTimeAlive: sql<number>`ROUND(AVG(time_alive))`,
                })
                .from(matchDataTable)
                .where(
                    and(
                        eq(matchDataTable.userId, id),
                        eq(matchDataTable.mapId, Number(mapIdFilter)).if(
                            mapIdFilter !== "-1",
                        ),
                        getDurationFilter(interval as sortingInterval),
                    ),
                )
                .groupBy(matchDataTable.teamMode);

            const modes = await statsQuery.execute();

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
                    modes,
                },
                200,
            );
        } catch (_err) {
            console.log({ _err });
            return c.json({}, 500);
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

import { Hono } from "hono";
import type { Context } from "../..";

export const UserStatsRouter = new Hono<Context>();
UserStatsRouter.post("/", async (c) => {
    return c.json<UserStatsResponse>(
        {
            slug: "bucephalandra1",
            username: "Bucephalandra",
            player_icon: "",
            banned: false,
            wins: 1305,
            kills: 6620,
            games: 2548,
            kpg: "2.6",
            modes: [
                {
                    teamMode: 1,
                    games: 1035,
                    wins: 561,
                    kills: 2730,
                    winPct: "54.2",
                    mostKills: 10,
                    mostDamage: 1309,
                    kpg: "2.6",
                    avgDamage: 373,
                    avgTimeAlive: 294,
                },
                {
                    teamMode: 2,
                    games: 730,
                    wins: 312,
                    kills: 2019,
                    winPct: "42.7",
                    mostKills: 13,
                    mostDamage: 1833,
                    kpg: "2.8",
                    avgDamage: 475,
                    avgTimeAlive: 251,
                },
                {
                    teamMode: 4,
                    games: 783,
                    wins: 432,
                    kills: 1871,
                    winPct: "55.2",
                    mostKills: 12,
                    mostDamage: 2427,
                    kpg: "2.4",
                    avgDamage: 546,
                    avgTimeAlive: 272,
                },
            ],
        },
        200,
    );
});

type UserStatsRequest = {
    slug: string;
    interval: string;
    mapIdFilter: number;
};

type UserStatsResponse = {
    slug: string;
    username: string;
    player_icon: string;
    banned: boolean;
    wins: number;
    kills: number;
    games: number;
    kpg: string;
    modes: Mode[];
};

interface Mode {
    teamMode: number;
    games: number;
    wins: number;
    kills: number;
    winPct: string;
    mostKills: number;
    mostDamage: number;
    kpg: string;
    avgDamage: number;
    avgTimeAlive: number;
}

import { Hono } from "hono";
import { z } from "zod";
import type { Context } from "../..";

export const matchDataRouter = new Hono<Context>();

const matchDataSchema = z.object({
    gameId: z.string(),
});

matchDataRouter.post("/", (c) => {
    return c.json<MatchData[]>(json, 200);
});

type MatchData = {
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

var json: MatchData[] = [
    {
        slug: "shiny_fox",
        username: "{SW}FallenAngel",
        player_id: 43,
        team_id: 18,
        time_alive: 84,
        rank: 1,
        died: true,
        kills: 1,
        damage_dealt: 261,
        damage_taken: 101,
        killer_id: 17,
        killed_ids: [19],
    },
    {
        slug: "team-kirill2007",
        username: "Bouchik {SW}",
        player_id: 44,
        team_id: 18,
        time_alive: 345,
        rank: 1,
        died: false,
        kills: 3,
        damage_dealt: 334,
        damage_taken: 266,
        killer_id: 0,
        killed_ids: [17, 9, 62],
    },
    {
        slug: "evzinplay",
        username: "~ggman:D~ {SW}",
        player_id: 45,
        team_id: 18,
        time_alive: 345,
        rank: 1,
        died: false,
        kills: 4,
        damage_dealt: 862,
        damage_taken: 404,
        killer_id: 0,
        killed_ids: [56, 3, 2, 55],
    },
    {
        slug: "yte",
        username: "cziesnok",
        player_id: 47,
        team_id: 18,
        time_alive: 345,
        rank: 1,
        died: false,
        kills: 6,
        damage_dealt: 949,
        damage_taken: 350,
        killer_id: 0,
        killed_ids: [4, 1, 51, 50, 35, 48],
    },
    {
        slug: "diomedes",
        username: "Diomedes",
        player_id: 48,
        team_id: 20,
        time_alive: 343,
        rank: 2,
        died: true,
        kills: 5,
        damage_dealt: 908,
        damage_taken: 394,
        killer_id: 47,
        killed_ids: [25, 24, 26, 46, 61],
    },
    {
        slug: null,
        username: "?0B0;",
        player_id: 50,
        team_id: 20,
        time_alive: 254,
        rank: 2,
        died: true,
        kills: 0,
        damage_dealt: 6,
        damage_taken: 189,
        killer_id: 47,
        killed_ids: [],
    },
    {
        slug: null,
        username: "XD",
        player_id: 52,
        team_id: 20,
        time_alive: 102,
        rank: 2,
        died: true,
        kills: 0,
        damage_dealt: 0,
        damage_taken: 100,
        killer_id: 61,
        killed_ids: [],
    },
    {
        slug: "77765",
        username: "777",
        player_id: 53,
        team_id: 20,
        time_alive: 36,
        rank: 2,
        died: true,
        kills: 0,
        damage_dealt: 60,
        damage_taken: 125,
        killer_id: 26,
        killed_ids: [],
    },
    {
        slug: null,
        username: "chica2011",
        player_id: 34,
        team_id: 15,
        time_alive: 109,
        rank: 3,
        died: true,
        kills: 0,
        damage_dealt: 0,
        damage_taken: 101,
        killer_id: 0,
        killed_ids: [],
    },
    {
        slug: null,
        username: "Player",
        player_id: 33,
        team_id: 15,
        time_alive: 195,
        rank: 3,
        died: true,
        kills: 0,
        damage_dealt: 0,
        damage_taken: 100,
        killer_id: 0,
        killed_ids: [],
    },
    {
        slug: null,
        username: "Edu",
        player_id: 36,
        team_id: 15,
        time_alive: 120,
        rank: 3,
        died: true,
        kills: 0,
        damage_dealt: 0,
        damage_taken: 100,
        killer_id: 51,
        killed_ids: [],
    },
    {
        slug: null,
        username: "Player",
        player_id: 35,
        team_id: 15,
        time_alive: 289,
        rank: 3,
        died: true,
        kills: 2,
        damage_dealt: 147,
        damage_taken: 179,
        killer_id: 47,
        killed_ids: [69, 10],
    },
    {
        slug: "tarix-nikotin",
        username: "Toxic_Nikotin",
        player_id: 62,
        team_id: 27,
        time_alive: 257,
        rank: 4,
        died: true,
        kills: 5,
        damage_dealt: 906,
        damage_taken: 302,
        killer_id: 44,
        killed_ids: [49, 41, 42, 15, 8],
    },
    {
        slug: "beautifullworld",
        username: "Lucky Fork",
        player_id: 61,
        team_id: 27,
        time_alive: 210,
        rank: 4,
        died: true,
        kills: 4,
        damage_dealt: 481,
        damage_taken: 224,
        killer_id: 48,
        killed_ids: [52, 22, 11, 13],
    },
    {
        slug: "antocha",
        username: "Antocha",
        player_id: 11,
        team_id: 7,
        time_alive: 223,
        rank: 5,
        died: true,
        kills: 4,
        damage_dealt: 508,
        damage_taken: 223,
        killer_id: 61,
        killed_ids: [18, 27, 23, 57],
    },
    {
        slug: "fantax_ha",
        username: "Fantax_ha",
        player_id: 13,
        team_id: 7,
        time_alive: 223,
        rank: 5,
        died: true,
        kills: 0,
        damage_dealt: 160,
        damage_taken: 194,
        killer_id: 61,
        killed_ids: [],
    },
    {
        slug: "feon_",
        username: "FeoN_",
        player_id: 12,
        team_id: 7,
        time_alive: 170,
        rank: 5,
        died: true,
        kills: 0,
        damage_dealt: 142,
        damage_taken: 100,
        killer_id: 9,
        killed_ids: [],
    },
    {
        slug: null,
        username: "\u001c8E0 33",
        player_id: 55,
        team_id: 21,
        time_alive: 174,
        rank: 6,
        died: true,
        kills: 0,
        damage_dealt: 95,
        damage_taken: 208,
        killer_id: 45,
        killed_ids: [],
    },
    {
        slug: null,
        username: "R  PYCCKUU",
        player_id: 51,
        team_id: 21,
        time_alive: 185,
        rank: 6,
        died: true,
        kills: 2,
        damage_dealt: 374,
        damage_taken: 100,
        killer_id: 47,
        killed_ids: [7, 36],
    },
    {
        slug: "ezg-harry33",
        username: "[EZG]-Harry33",
        player_id: 9,
        team_id: 6,
        time_alive: 183,
        rank: 7,
        died: true,
        kills: 6,
        damage_dealt: 1070,
        damage_taken: 119,
        killer_id: 44,
        killed_ids: [54, 21, 20, 70, 28, 12],
    },
    {
        slug: "yt-g0dak-yt",
        username: "",
        player_id: 22,
        team_id: 12,
        time_alive: 179,
        rank: 8,
        died: true,
        kills: 5,
        damage_dealt: 1134,
        damage_taken: 377,
        killer_id: 61,
        killed_ids: [66, 68, 64, 29, 65],
    },
    {
        slug: null,
        username: "jjjjjjjjjjjjjjjj",
        player_id: 8,
        team_id: 5,
        time_alive: 178,
        rank: 9,
        died: true,
        kills: 4,
        damage_dealt: 610,
        damage_taken: 188,
        killer_id: 62,
        killed_ids: [40, 31, 59, 30],
    },
    {
        slug: null,
        username: "Lenin",
        player_id: 16,
        team_id: 5,
        time_alive: 72,
        rank: 9,
        died: true,
        kills: 1,
        damage_dealt: 186,
        damage_taken: 100,
        killer_id: 39,
        killed_ids: [37],
    },
    {
        slug: "277",
        username: "u",
        player_id: 14,
        team_id: 5,
        time_alive: 42,
        rank: 9,
        died: true,
        kills: 0,
        damage_dealt: 48,
        damage_taken: 101,
        killer_id: 39,
        killed_ids: [],
    },
    {
        slug: null,
        username: "mp killer",
        player_id: 15,
        team_id: 5,
        time_alive: 163,
        rank: 9,
        died: true,
        kills: 0,
        damage_dealt: 164,
        damage_taken: 100,
        killer_id: 62,
        killed_ids: [],
    },
    {
        slug: "pro-adrian",
        username: "pro wilk",
        player_id: 57,
        team_id: 22,
        time_alive: 134,
        rank: 10,
        died: true,
        kills: 0,
        damage_dealt: 19,
        damage_taken: 100,
        killer_id: 11,
        killed_ids: [],
    },
    {
        slug: "77764",
        username: "777",
        player_id: 56,
        team_id: 22,
        time_alive: 31,
        rank: 10,
        died: true,
        kills: 0,
        damage_dealt: 0,
        damage_taken: 101,
        killer_id: 45,
        killed_ids: [],
    },
    {
        slug: "eagle_eldon",
        username: "JOIN TEAM:RHgi",
        player_id: 54,
        team_id: 22,
        time_alive: 29,
        rank: 10,
        died: true,
        kills: 0,
        damage_dealt: 0,
        damage_taken: 101,
        killer_id: 9,
        killed_ids: [],
    },
    {
        slug: null,
        username: "POLAK",
        player_id: 58,
        team_id: 22,
        time_alive: 22,
        rank: 10,
        died: true,
        kills: 0,
        damage_dealt: 27,
        damage_taken: 100,
        killer_id: 21,
        killed_ids: [],
    },
    {
        slug: "enndy",
        username: "-_- enndy -_-",
        player_id: 7,
        team_id: 4,
        time_alive: 63,
        rank: 11,
        died: true,
        kills: 0,
        damage_dealt: 100,
        damage_taken: 101,
        killer_id: 51,
        killed_ids: [],
    },
    {
        slug: "bongousek",
        username: ".22LR",
        player_id: 10,
        team_id: 4,
        time_alive: 159,
        rank: 11,
        died: true,
        kills: 0,
        damage_dealt: 66,
        damage_taken: 100,
        killer_id: 35,
        killed_ids: [],
    },
    {
        slug: "lpvali08",
        username: "SCW",
        player_id: 27,
        team_id: 10,
        time_alive: 89,
        rank: 12,
        died: true,
        kills: 0,
        damage_dealt: 34,
        damage_taken: 100,
        killer_id: 11,
        killed_ids: [],
    },
    {
        slug: null,
        username: "Player",
        player_id: 28,
        team_id: 10,
        time_alive: 135,
        rank: 12,
        died: true,
        kills: 0,
        damage_dealt: 0,
        damage_taken: 100,
        killer_id: 9,
        killed_ids: [],
    },
    {
        slug: null,
        username: "Neverer0",
        player_id: 18,
        team_id: 10,
        time_alive: 92,
        rank: 12,
        died: true,
        kills: 0,
        damage_dealt: 15,
        damage_taken: 100,
        killer_id: 11,
        killed_ids: [],
    },
    {
        slug: "4725",
        username: "GERMANY",
        player_id: 23,
        team_id: 10,
        time_alive: 155,
        rank: 12,
        died: true,
        kills: 0,
        damage_dealt: 46,
        damage_taken: 190,
        killer_id: 11,
        killed_ids: [],
    },
    {
        slug: null,
        username: "Player",
        player_id: 41,
        team_id: 17,
        time_alive: 125,
        rank: 13,
        died: true,
        kills: 0,
        damage_dealt: 0,
        damage_taken: 100,
        killer_id: 62,
        killed_ids: [],
    },
    {
        slug: "xaris-fr",
        username: "xaris",
        player_id: 42,
        team_id: 17,
        time_alive: 134,
        rank: 13,
        died: true,
        kills: 0,
        damage_dealt: 34,
        damage_taken: 100,
        killer_id: 62,
        killed_ids: [],
    },
    {
        slug: null,
        username: "Minni",
        player_id: 64,
        team_id: 28,
        time_alive: 58,
        rank: 14,
        died: true,
        kills: 0,
        damage_dealt: 101,
        damage_taken: 100,
        killer_id: 22,
        killed_ids: [],
    },
    {
        slug: null,
        username: "'8B5@",
        player_id: 68,
        team_id: 28,
        time_alive: 47,
        rank: 14,
        died: true,
        kills: 0,
        damage_dealt: 6,
        damage_taken: 100,
        killer_id: 22,
        killed_ids: [],
    },
    {
        slug: "tsm-myht",
        username: "(_FACE NINJA)_",
        player_id: 65,
        team_id: 28,
        time_alive: 107,
        rank: 14,
        died: true,
        kills: 2,
        damage_dealt: 315,
        damage_taken: 115,
        killer_id: 22,
        killed_ids: [38, 32],
    },
    {
        slug: null,
        username: "vccvv",
        player_id: 66,
        team_id: 28,
        time_alive: 35,
        rank: 14,
        died: true,
        kills: 1,
        damage_dealt: 61,
        damage_taken: 100,
        killer_id: 22,
        killed_ids: [60],
    },
    {
        slug: "urmum40",
        username: "Slasher",
        player_id: 70,
        team_id: 32,
        time_alive: 58,
        rank: 15,
        died: true,
        kills: 0,
        damage_dealt: 0,
        damage_taken: 101,
        killer_id: 9,
        killed_ids: [],
    },
    {
        slug: null,
        username: "=¤=¤=¤=¤=¤=¤=¤=¤",
        player_id: 69,
        team_id: 32,
        time_alive: 97,
        rank: 15,
        died: true,
        kills: 0,
        damage_dealt: 0,
        damage_taken: 101,
        killer_id: 35,
        killed_ids: [],
    },
    {
        slug: "artonoscz120",
        username: "artonoscz 120",
        player_id: 31,
        team_id: 14,
        time_alive: 65,
        rank: 16,
        died: true,
        kills: 0,
        damage_dealt: 81,
        damage_taken: 100,
        killer_id: 8,
        killed_ids: [],
    },
    {
        slug: "lukas166",
        username: "Player",
        player_id: 29,
        team_id: 14,
        time_alive: 123,
        rank: 16,
        died: true,
        kills: 2,
        damage_dealt: 286,
        damage_taken: 101,
        killer_id: 22,
        killed_ids: [63, 67],
    },
    {
        slug: "ghost-killer4",
        username: ".",
        player_id: 32,
        team_id: 14,
        time_alive: 122,
        rank: 16,
        died: true,
        kills: 0,
        damage_dealt: 0,
        damage_taken: 100,
        killer_id: 65,
        killed_ids: [],
    },
    {
        slug: "kermitpl",
        username: "Kermit PL",
        player_id: 30,
        team_id: 14,
        time_alive: 100,
        rank: 16,
        died: true,
        kills: 0,
        damage_dealt: 16,
        damage_taken: 100,
        killer_id: 8,
        killed_ids: [],
    },
    {
        slug: "mohamed120",
        username: "Dm1=tazer annas0",
        player_id: 49,
        team_id: 19,
        time_alive: 105,
        rank: 17,
        died: true,
        kills: 0,
        damage_dealt: 12,
        damage_taken: 173,
        killer_id: 62,
        killed_ids: [],
    },
    {
        slug: "annas",
        username: "EU WoW",
        player_id: 46,
        team_id: 19,
        time_alive: 83,
        rank: 17,
        died: true,
        kills: 2,
        damage_dealt: 317,
        damage_taken: 170,
        killer_id: 48,
        killed_ids: [6, 5],
    },
    {
        slug: null,
        username: "Olfoo",
        player_id: 17,
        team_id: 9,
        time_alive: 113,
        rank: 18,
        died: true,
        kills: 1,
        damage_dealt: 190,
        damage_taken: 185,
        killer_id: 44,
        killed_ids: [43],
    },
    {
        slug: null,
        username: "kap1r",
        player_id: 19,
        team_id: 9,
        time_alive: 82,
        rank: 18,
        died: true,
        kills: 0,
        damage_dealt: 0,
        damage_taken: 100,
        killer_id: 43,
        killed_ids: [],
    },
    {
        slug: null,
        username: "Player",
        player_id: 37,
        team_id: 16,
        time_alive: 59,
        rank: 19,
        died: true,
        kills: 0,
        damage_dealt: 0,
        damage_taken: 100,
        killer_id: 16,
        killed_ids: [],
    },
    {
        slug: "fearfullwarrior_",
        username: "fearfullwarrior",
        player_id: 39,
        team_id: 16,
        time_alive: 92,
        rank: 19,
        died: true,
        kills: 2,
        damage_dealt: 433,
        damage_taken: 145,
        killer_id: 0,
        killed_ids: [14, 16],
    },
    {
        slug: null,
        username: "debil",
        player_id: 38,
        team_id: 16,
        time_alive: 84,
        rank: 19,
        died: true,
        kills: 0,
        damage_dealt: 0,
        damage_taken: 100,
        killer_id: 65,
        killed_ids: [],
    },
    {
        slug: null,
        username: "Moneymaker",
        player_id: 40,
        team_id: 16,
        time_alive: 48,
        rank: 19,
        died: true,
        kills: 0,
        damage_dealt: 46,
        damage_taken: 100,
        killer_id: 8,
        killed_ids: [],
    },
    {
        slug: null,
        username: "Amara",
        player_id: 4,
        team_id: 1,
        time_alive: 69,
        rank: 20,
        died: true,
        kills: 0,
        damage_dealt: 0,
        damage_taken: 100,
        killer_id: 47,
        killed_ids: [],
    },
    {
        slug: "imgood3",
        username: "warm up:)",
        player_id: 1,
        team_id: 1,
        time_alive: 80,
        rank: 20,
        died: true,
        kills: 0,
        damage_dealt: 132,
        damage_taken: 131,
        killer_id: 47,
        killed_ids: [],
    },
    {
        slug: null,
        username: "dken",
        player_id: 2,
        team_id: 1,
        time_alive: 99,
        rank: 20,
        died: true,
        kills: 0,
        damage_dealt: 31,
        damage_taken: 101,
        killer_id: 45,
        killed_ids: [],
    },
    {
        slug: null,
        username: "VEGETTA777",
        player_id: 3,
        team_id: 1,
        time_alive: 99,
        rank: 20,
        died: true,
        kills: 0,
        damage_dealt: 67,
        damage_taken: 128,
        killer_id: 45,
        killed_ids: [],
    },
    {
        slug: "kick-my-dick",
        username: "KICK MY DICK",
        player_id: 60,
        team_id: 24,
        time_alive: 39,
        rank: 21,
        died: true,
        kills: 0,
        damage_dealt: 0,
        damage_taken: 100,
        killer_id: 66,
        killed_ids: [],
    },
    {
        slug: "god972",
        username: "milán26",
        player_id: 59,
        team_id: 24,
        time_alive: 46,
        rank: 21,
        died: true,
        kills: 0,
        damage_dealt: 47,
        damage_taken: 100,
        killer_id: 8,
        killed_ids: [],
    },
    {
        slug: null,
        username: "()--()=====>",
        player_id: 63,
        team_id: 24,
        time_alive: 22,
        rank: 21,
        died: true,
        kills: 0,
        damage_dealt: 0,
        damage_taken: 100,
        killer_id: 29,
        killed_ids: [],
    },
    {
        slug: "cuguli1",
        username: "Player",
        player_id: 67,
        team_id: 24,
        time_alive: 28,
        rank: 21,
        died: true,
        kills: 0,
        damage_dealt: 105,
        damage_taken: 100,
        killer_id: 29,
        killed_ids: [],
    },
    {
        slug: "fetroxito",
        username: "spayk plus  pro",
        player_id: 21,
        team_id: 11,
        time_alive: 67,
        rank: 22,
        died: true,
        kills: 1,
        damage_dealt: 152,
        damage_taken: 100,
        killer_id: 9,
        killed_ids: [58],
    },
    {
        slug: null,
        username: "Cacita",
        player_id: 20,
        team_id: 11,
        time_alive: 68,
        rank: 22,
        died: true,
        kills: 0,
        damage_dealt: 48,
        damage_taken: 100,
        killer_id: 9,
        killed_ids: [],
    },
    {
        slug: null,
        username: "BoogieMEN",
        player_id: 26,
        team_id: 13,
        time_alive: 58,
        rank: 23,
        died: true,
        kills: 1,
        damage_dealt: 130,
        damage_taken: 100,
        killer_id: 48,
        killed_ids: [53],
    },
    {
        slug: null,
        username: "Obla",
        player_id: 24,
        team_id: 13,
        time_alive: 35,
        rank: 23,
        died: true,
        kills: 0,
        damage_dealt: 226,
        damage_taken: 100,
        killer_id: 48,
        killed_ids: [],
    },
    {
        slug: null,
        username: "Srx7",
        player_id: 25,
        team_id: 13,
        time_alive: 29,
        rank: 23,
        died: true,
        kills: 0,
        damage_dealt: 15,
        damage_taken: 100,
        killer_id: 48,
        killed_ids: [],
    },
    {
        slug: "zss1",
        username: "PlayerNOTog",
        player_id: 5,
        team_id: 3,
        time_alive: 53,
        rank: 24,
        died: true,
        kills: 0,
        damage_dealt: 88,
        damage_taken: 100,
        killer_id: 46,
        killed_ids: [],
    },
    {
        slug: null,
        username: "OGclan.c",
        player_id: 6,
        team_id: 3,
        time_alive: 53,
        rank: 24,
        died: true,
        kills: 0,
        damage_dealt: 48,
        damage_taken: 100,
        killer_id: 46,
        killed_ids: [],
    },
];

import { sql } from "drizzle-orm";
import {
    bigint,
    boolean,
    index,
    integer,
    json,
    pgTable,
    text,
    timestamp,
} from "drizzle-orm/pg-core";
import type { TeamMode } from "../../../../shared/gameConfig";
import { type Loadout, loadout } from "../../../../shared/utils/loadout";
import type { Region } from "../../config";
import type { Item } from "../routes/user/UserRouter";

export const sessionTable = pgTable("session", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => usersTable.id, {
            onDelete: "cascade",
            onUpdate: "cascade",
        }),
    expiresAt: timestamp("expires_at").notNull(),
});

// timestamp().defaultNow() will use the system time zone for some reason
// which will display with the timezone offset eg in the client match history
// using this fixes it
const defaultNow = sql.raw(`timezone('utc', now())`);

export const usersTable = pgTable("users", {
    id: text("id").notNull().primaryKey(),
    authId: text("auth_id").notNull(),
    slug: text("slug").notNull().unique(),
    banned: boolean("banned").notNull().default(false),
    banReason: text("ban_reason").notNull().default(""),
    username: text("username").notNull().default(""),
    usernameSet: boolean("username_set").notNull().default(false),
    userCreated: timestamp("user_created").notNull().default(defaultNow),
    lastUsernameChangeTime: timestamp("last_username_change_time"),
    linked: boolean("linked").notNull().default(false),
    linkedGoogle: boolean("linked_google").notNull().default(false),
    linkedDiscord: boolean("linked_discord").notNull().default(false),
    loadout: json("loadout")
        .notNull()
        .default(loadout.validate({} as Loadout))
        .$type<Loadout>(),
    items: json("items").notNull().$type<Item[]>().default([]),
    // STATS
    wins: integer("wins").notNull().default(0),
    games: integer("games").notNull().default(0),
    kills: integer("kills").notNull().default(0),
    kpg: integer("kpg").notNull().default(0),
});

export type UsersTable = typeof usersTable.$inferInsert;

export const matchDataTable = pgTable(
    "match_data",
    {
        userId: text("user_id").default(""),
        createdAt: timestamp("created_at").notNull().default(defaultNow),
        region: text("region").notNull().$type<Region>(),
        mapId: integer("map_id").notNull(),
        gameId: text("game_id").notNull(),
        mapSeed: bigint("map_seed", { mode: "number" }).notNull(),
        username: text("username").notNull(),
        playerId: integer("player_id").notNull(),
        teamMode: integer("team_mode").$type<TeamMode>().notNull(),
        teamCount: integer("team_count").notNull(),
        teamTotal: integer("team_total").notNull(),
        teamId: integer("team_id").notNull(),
        timeAlive: integer("time_alive").notNull(),
        rank: integer("rank").notNull(),
        died: boolean("died").notNull(),
        kills: integer("kills").notNull(),
        damageDealt: integer("damage_dealt").notNull(),
        damageTaken: integer("damage_taken").notNull(),
        killerId: integer("killer_id").notNull(),
        killedIds: json("killed_ids").$type<number[]>().notNull(),
    },
    (table) => [
        index("idx_match_data_user_stats").on(
            table.userId,
            table.teamMode,
            table.rank,
            table.kills,
            table.damageDealt,
            table.timeAlive,
        ),
        index("idx_game_id").on(table.gameId),
        index("idx_user_id").on(table.userId),
        index("idx_match_data_team_query").on(
            table.teamMode,
            table.mapId,
            table.createdAt,
            table.gameId,
            table.teamId,
            table.region,
            table.kills,
        ),
    ],
);

export type MatchDataTable = typeof matchDataTable.$inferInsert;

//
// LOGS
//
export const ipLogsTable = pgTable(
    "ip_logs",
    {
        createdAt: timestamp("created_at").notNull().default(defaultNow),
        realIp: text("real_ip").notNull(),
        encodedIp: text("encoded_ip").notNull(),
        name: text("name").notNull(),
        gameId: text("game_id").notNull(),
    },
    (table) => [index("name_created_at_idx").on(table.name, table.createdAt)],
);

export const bannedIpsTable = pgTable("banned_ips", {
    createdAt: timestamp("created_at").notNull().default(defaultNow),
    expiresIn: timestamp("expries_in").notNull(),
    encodedIp: text("encoded_ip").notNull().primaryKey(),
});

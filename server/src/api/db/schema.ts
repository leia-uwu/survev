import {
    boolean,
    datetime,
    index,
    int,
    json,
    mysqlTable,
    timestamp,
    varchar,
} from "drizzle-orm/mysql-core";
import { TeamMode } from "../../../../shared/gameConfig";
import { validateLoadout } from "../../../../shared/utils/helpers";
import type { Region } from "../../config";
import type { ModeStat } from "../routes/stats/user_stats";
import type { Item } from "../routes/user/UserRouter";
import type { Loadout } from "../zodSchemas";

export const sessionTable = mysqlTable("session", {
    id: varchar("id", {
        length: 255,
    }).primaryKey(),
    userId: varchar("user_id", {
        length: 255,
    })
        .notNull()
        .references(() => usersTable.id, {
            onDelete: "cascade",
            onUpdate: "cascade",
        }),
    expiresAt: datetime("expires_at").notNull(),
});

export const usersTable = mysqlTable("users", {
    id: varchar("id", { length: 255 }).notNull().primaryKey(),
    authId: varchar("auth_id", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    banned: boolean("banned").notNull().default(false),
    banReason: varchar("ban_reason", { length: 255 }).notNull().default(""),
    username: varchar("username", { length: 255 }).notNull().default(""),
    usernameSet: boolean("username_set").notNull().default(false),
    userCreated: timestamp("user_created").notNull().defaultNow(),
    lastUsernameChangeTime: timestamp("last_username_change_time"),
    linked: boolean("linked").notNull().default(false),
    linkedGoogle: boolean("linked_google").notNull().default(false),
    linkedDiscord: boolean("linked_discord").notNull().default(false),
    loadout: json("loadout")
        .$type<Loadout>()
        .notNull()
        .default(validateLoadout({} as Loadout)),
    items: json("items").$type<Item[]>().notNull().default([]),
});

export type UsersTable = typeof usersTable.$inferInsert;

export const matchDataTable = mysqlTable(
    "match_data",
    {
        userId: varchar("user_id", { length: 255 }).default(""),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        region: varchar("region", { length: 255 }).notNull().$type<Region>(),
        mapId: int("map_id").notNull(),
        gameId: varchar("gameId", { length: 255 }).notNull(),
        slug: varchar("slug", { length: 255 }),
        username: varchar("username", { length: 255 }).notNull(),
        playerId: int("player_id").notNull(),
        teamMode: int("team_mode").$type<TeamMode>().notNull(),
        teamCount: int("team_count").notNull(),
        teamTotal: int("team_total").notNull(),
        teamId: int("team_id").notNull(),
        timeAlive: int("time_alive").notNull(),
        rank: int("rank").notNull(),
        died: boolean("died").notNull(),
        kills: int("kills").notNull(),
        damageDealt: int("damage_dealt").notNull(),
        damageTaken: int("damage_taken").notNull(),
        killerId: int("killer_id").notNull(),
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
        index("idx_match_data_team_query").on(
            table.teamMode,
            table.mapId,
            table.createdAt,
            table.region,
        ),
    ],
);

export type MatchDataTable = typeof matchDataTable.$inferInsert;

//
// LOGS
//
export const ipLogsTable = mysqlTable(
    "ip_logs",
    {
        createdAt: timestamp("created_at").notNull().defaultNow(),
        realIp: varchar("real_ip", { length: 255 }).notNull(),
        encodedIp: varchar("encoded_ip", { length: 255 }).notNull(),
        name: varchar("name", { length: 255 }).notNull(),
        gameId: varchar("game_id", { length: 255 }).notNull(),
    },
    (table) => [index("name_created_at_idx").on(table.name, table.createdAt)],
);

export const bannedIpsTable = mysqlTable("banned_ips", {
    createdAt: timestamp("created_at").notNull().defaultNow(),
    expiresIn: timestamp("expries_in").notNull(),
    encodedIp: varchar("encoded_ip", { length: 255 }).notNull().primaryKey(),
});

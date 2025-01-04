import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { validateLoadout } from "../../../../shared/utils/helpers";
import type {  ModeStat } from "../routes/stats/user_stats";
import type { Item } from "../routes/user/UserRouter";
import type { Loadout } from "../zodSchemas";
import { TeamMode } from "../../../../shared/gameConfig";

export const sessionTable = sqliteTable("session", {
    id: text("id").notNull().primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => usersTable.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at").notNull(),
});

export const usersTable = sqliteTable("users", {
    id: text("id").notNull().primaryKey(),
    authId: text("auth_id").notNull(),
    slug: text("slug").notNull().unique(),
    banned: integer("banned", { mode: "boolean" }).notNull().default(false),
    banReason: text("ban_reason").notNull().default(""),
    username: text("username").notNull().default(""),
    usernameSet: integer("username_set", { mode: "boolean" }).notNull().default(false),
    userCreated: integer("user_created", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`),
    lastUsernameChangeTime: integer("last_username_change_time", { mode: "timestamp" }),
    linked: integer("linked", { mode: "boolean" }).notNull().default(false),
    linkedGoogle: integer("linked_google", { mode: "boolean" }).notNull().default(false),
    linkedDiscord: integer("linked_google", { mode: "boolean" }).notNull().default(false),
    loadout: text("loadout", { mode: "json" })
        .notNull()
        .default(validateLoadout({} as Loadout))
        .$type<Loadout>(),
    items: text("items", { mode: "json" }).notNull().$type<Item[]>().default([]),
    // STATS
    wins: integer("wins").notNull().default(0),
    games: integer("games").notNull().default(0),
    kills: integer("kills").notNull().default(0),
    kpg: integer("kpg").notNull().default(0),
    modes: text("modes", { mode: "json" })
        .notNull()
        .$type<ModeStat[]>()
        .default(generateEmptyStatModes()),
});

export type UsersTable = typeof usersTable.$inferInsert;


export const matchDataTable = sqliteTable('match_data', {
  userId: text("user_id")
  .notNull()
  .references(() => usersTable.id, { onDelete: "cascade" }),
  mapId: integer('map_id').notNull(),
  gameId: text('gameId').notNull(),
  slug: text('slug'),
  username: text('username').notNull(),
  player_id: integer('player_id').notNull(),
  teamMode: integer('team_mode').$type<TeamMode>().notNull(),
  team_id: integer('team_id').notNull(),
  time_alive: integer('time_alive').notNull(),
  rank: integer('rank').notNull(), 
  died: integer('died', { mode: 'boolean' }).notNull(),
  kills: integer('kills').notNull(),
  damage_dealt: integer('damage_dealt').notNull(),
  damage_taken: integer('damage_taken').notNull(),
  killer_id: integer('killer_id'),
  killed_ids: text('killed_ids', { mode: "json" }).$type<number[]>().notNull()
 });

export type MatchDataTable = typeof matchDataTable.$inferInsert;


export function generateEmptyStatModes(): ModeStat[] {
  return [TeamMode.Solo, TeamMode.Duo, TeamMode.Squad].map((teamMode) => ({
      teamMode,
      games: 0,
      wins: 0,
      kills: 0,
      winPct: 0,
      mostKills: 0,
      mostDamage: 0,
      kpg: 0,
      avgDamage: 0,
      avgTimeAlive: 0,
  }));
}

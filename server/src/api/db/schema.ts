import { boolean, datetime, int, json, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { validateLoadout } from "../../../../shared/utils/helpers";
import type {  ModeStat } from "../routes/stats/user_stats";
import type { Item } from "../routes/user/UserRouter";
import type { Loadout } from "../zodSchemas";
import { TeamMode } from "../../../../shared/gameConfig";
import type { Region } from "../../config";

export const sessionTable = mysqlTable("session", {
	id: varchar("id", {
		length: 255
	}).primaryKey(),
	userId: varchar("user_id", {
		length: 255
	})
		.notNull()
		.references(() => usersTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade"
    }),
	expiresAt: datetime("expires_at").notNull()
});

export const usersTable = mysqlTable("users", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  authId: varchar("auth_id", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  banned: boolean("banned").notNull().default(false),
  banReason: varchar("ban_reason", { length: 255 }).notNull().default(''),
  username: varchar("username", { length: 255 }).notNull().default(''),
  usernameSet: boolean("username_set").notNull().default(false),
  userCreated: timestamp("user_created")
      .notNull()
      .defaultNow(),
  lastUsernameChangeTime: timestamp("last_username_change_time"),
  linked: boolean("linked").notNull().default(false),
  linkedGoogle: boolean("linked_google").notNull().default(false),
  linkedDiscord: boolean("linked_discord").notNull().default(false),
  loadout: json("loadout").$type<Loadout>().notNull().default(validateLoadout({} as Loadout)),
  items: json("items").$type<Item[]>().notNull().default([]),
  // STATS
  wins: int("wins").notNull().default(0),
  games: int("games").notNull().default(0),
  kills: int("kills").notNull().default(0),
  kpg: int("kpg").notNull().default(0),
  modes: json("modes").$type<ModeStat[]>().notNull().default(generateEmptyStatModes()),
});

export type UsersTable = typeof usersTable.$inferInsert;


export const matchDataTable = mysqlTable('match_data', {
  userId: varchar('user_id', { length: 255 }).default(""),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  region: varchar('region', { length: 255 }).notNull().$type<Region>(),
  mapId: int('map_id').notNull(),
  gameId: varchar('gameId', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }),
  username: varchar('username', { length: 255 }).notNull(),
  playerId: int('player_id').notNull(),
  teamMode: int('team_mode').$type<TeamMode>().notNull(),
  teamTotal: int('team_total').notNull(),
  teamId: int('team_id').notNull(),
  timeAlive: int('time_alive').notNull(),
  rank: int('rank').notNull(),
  died: boolean('died').notNull(),
  kills: int('kills').notNull(),
  damageDealt: int('damage_dealt').notNull(),
  damageTaken: int('damage_taken').notNull(),
  killerId: int('killer_id').notNull(),
  killedIds: json('killed_ids').$type<number[]>().notNull()
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

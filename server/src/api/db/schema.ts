import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { validateLoadout } from "../../../../shared/utils/helpers";
import type { Item } from "../routes/user/UserRouter";
import type { Loadout } from "../zodSchemas";

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
    wins: integer("wins").notNull().default(0),
    banned: integer("banned", { mode: "boolean" }).notNull().default(false),
    banReason: text("ban_reason").notNull().default(""),
    username: text("username").notNull().default(""),
    usernameSet: integer("username_set", { mode: "boolean" }).notNull().default(false),
    userCreated: integer("user_created", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`),
    lastUsernameChangeTime: integer("last_username_change_time", { mode: "timestamp" }),
    linked: integer("linked", { mode: "boolean" }).notNull().default(false),
    linkedGoogle: integer("linked_google", { mode: "boolean"}).notNull().default(false),
    linkedDiscord: integer("linked_google", { mode: "boolean"}).notNull().default(false),
    loadout: text("loadout", { mode: "json" })
        .notNull()
        .default(validateLoadout({} as Loadout))
        .$type<Loadout>(),
    items: text("items", { mode: "json" }).notNull().$type<Item[]>().default([]),
});

export type UsersTable = typeof usersTable.$inferInsert;

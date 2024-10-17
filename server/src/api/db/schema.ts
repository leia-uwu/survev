import { sql } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { ItemStatus, validateLoadout } from "../../../../shared/utils/helpers";
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
    auth_id: text("auth_id").notNull(),
    slug: text("slug").notNull().unique(),
    wins: integer("wins").notNull().default(0),
    banned: integer("banned", { mode: "boolean" }).notNull().default(false),
    username: text("username").notNull().default(""),
    usernameSet: integer("username_set", { mode: "boolean" }).notNull().default(false),
    userCreated: integer("user_created", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`),
    lastUsernameChangeTime: integer("last_username_change_time", { mode: "timestamp" }),
    linked: integer("linked", { mode: "boolean" }).notNull().default(false),
    loadout: text("loadout", { mode: "json" })
        .notNull()
        .default(validateLoadout({} as Loadout))
        .$type<Loadout>(),
});

export type UsersTable = typeof usersTable.$inferInsert;

export const itemsTable = sqliteTable(
    "items",
    {
        userId: text("user_id")
            .notNull()
            .references(() => usersTable.id, { onDelete: "cascade" }),
        source: text("source").notNull(),
        timeAcquired: integer("time_acquired", { mode: "timestamp" })
            .notNull()
            .default(sql`(unixepoch())`),
        type: text("type").notNull(),
        status: integer("status").notNull().$type<ItemStatus>().default(ItemStatus.New),
    },
    (table) => ({
        primaryKey: primaryKey({ columns: [table.userId, table.type] }),
    }),
);

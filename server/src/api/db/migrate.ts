import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

const sqlite = new Database("game.db");
const db = drizzle(sqlite);
migrate(db, { migrationsFolder: "./src/api/db/drizzle" });

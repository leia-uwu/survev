import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

export const dbConfig = {
    host: "127.0.0.1",
    user: "survev",
    password: "survev",
    database: "survev",
    port: 5432,
};

export const DATABASE_URL = `postgresql://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`;

const poolConnection = new pg.Pool({
    connectionString: DATABASE_URL,
});

export const db = drizzle({
    client: poolConnection,
    schema,
});

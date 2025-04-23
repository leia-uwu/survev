import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { Config } from "../../config";
import { server } from "../apiServer";
import * as schema from "./schema";

const poolConnection = new pg.Pool({
    ...Config.database,
    idleTimeoutMillis: 60 * 1000,
});

poolConnection.on("connect", () => {
    server.logger.info("Connected to database");
});

export const db = drizzle({
    client: poolConnection,
    schema,
});

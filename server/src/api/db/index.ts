import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

/**
 * DROP DATABASE IF EXISTS survev;
 * CREATE DATABASE survev;
 */
const poolConnection = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "root",
    database: "survev",
    port: 3306,
});

export const DATABASE_URL = "mysql://root:root@127.0.0.1:3306/survev";

export const db = drizzle(poolConnection, {
    schema: schema,
    mode: "default",
});

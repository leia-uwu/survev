import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const dbConfig = {
    host: "127.0.0.1",
    user: "root",
    password: "root",
    database: "survev",
    port: 3306,
  };
  
  const poolConnection = mysql.createPool(dbConfig);
  
  export const DATABASE_URL = `mysql://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`;

export const db = drizzle(poolConnection, {
    schema: schema,
    mode: "default",
});

import { Pool } from "pg";
import { dbConfig } from ".";

const pgConfig = {
    ...dbConfig,
    user: "postgres",
    password: "postgres",
    database: "postgres",
};

const PG_URL = `postgresql://${pgConfig.user}:${pgConfig.password}@${pgConfig.host}:${pgConfig.port}/${pgConfig.database}`;

async function dropDatabase() {
    if (process.env.NODE_ENV === "production") return;
    const pool = new Pool({
        connectionString: PG_URL,
    });

    try {
        await pool.query(
            `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'survev'`,
        );
        await pool.query(`DROP DATABASE IF EXISTS survev`);
        await pool.query(`CREATE DATABASE survev OWNER survev`);
        console.log("Database wiped successfully");
    } catch (error) {
        console.error("Error dropping database:", error);
    } finally {
        await pool.end();
    }
}

dropDatabase();

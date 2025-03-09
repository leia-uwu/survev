import { defineConfig } from "drizzle-kit";
import { DATABASE_URL } from "./db";

export default defineConfig({
    dialect: "mysql",
    schema: "src/api/db/schema.ts",
    out: "./src/api/db/drizzle",
    dbCredentials: {
        url: DATABASE_URL,
    },
});

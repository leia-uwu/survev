import { defineConfig } from "drizzle-kit";
import { DATABASE_URL } from "./db";

export default defineConfig({
    dialect: "postgresql",
    schema: "src/api/db/schema.ts",
    out: "./src/api/db/drizzle",
    dbCredentials: {
        url: DATABASE_URL,
    },
});

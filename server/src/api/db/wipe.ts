import { db } from ".";

async function clearDb(): Promise<void> {
    try {
        await db.execute("DROP DATABASE IF EXISTS survev;");
        await db.execute("CREATE DATABASE survev;");
        console.log("Database wiped successfully");
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

clearDb();

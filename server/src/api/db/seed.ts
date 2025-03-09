import { generateId } from "lucia";
import { db } from ".";
import { generateMatchHistory } from "../../utils/seedDatabase";
import { createNewUser } from "../routes/user/auth/authUtils";
import { matchDataTable } from "./schema";

const seed = async () => {
    try {
        ["olimpiq", "floor", "mitm", "preacher"].forEach(async (username) => {
            const userId = generateId(15);
            await createNewUser({
                id: userId,
                authId: userId,
                username: username,
                linked: true,
                slug: username,
            });

            for (let i = 0; i < 120; i++) {
                const data = generateMatchHistory(userId, username, 70);
                await db.insert(matchDataTable).values(data);
            }
        });
        console.log("Seeded database");
    } catch (error) {
        console.error(error);
        throw new Error("Failed to seed database");
    }
};

seed();

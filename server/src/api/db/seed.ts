import { generateId } from "lucia";
import { db } from ".";
import { generateMatchHistory } from "../../utils/seedDatabase";
import { createNewUser } from "../routes/user/auth/authUtils";
import { matchDataTable } from "./schema";

const seed = async () => {
    try {
        [
          "olimpiq", "floor", "mitm"
        ].forEach(async (username) => {
          const userId = generateId(15);
          await createNewUser({
            id: userId,
            authId: userId,
            username: username,
            linked: true,
            slug: username,
        });

        for (let i = 0; i < 70; i++) {
          const data = generateMatchHistory(userId, 70);
          await db.insert(matchDataTable).values(data);
        }
      })
    } catch (error) {
        console.error(error);
        throw new Error("Failed to seed database");
    }
};

seed();

import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import type { Env } from "hono";
import type { Session, User } from "lucia";
import { Lucia } from "lucia";
import { db } from "../db";
import { type UsersTableSelect, sessionTable, usersTable } from "../db/schema";

export interface Context extends Env {
    Variables: {
        user: User | null;
        session: Session | null;
    };
}

const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, usersTable);

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            secure: process.env.NODE_ENV === "production",
        },
    },
    getUserAttributes: (attributes) => {
        return {
            username: attributes.username,
        };
    },
});

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: Pick<UsersTableSelect, "username" | "id">;
    }
}

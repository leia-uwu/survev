import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import type { Env } from "hono";
import type { Context as HonoContext } from "hono";
import { Lucia } from "lucia";
import type { Session, User } from "lucia";
import type { z } from "zod";
import { db } from "../db";
import { sessionTable, usersTable } from "../db/schema";

export interface Context extends Env {
    Variables: {
        user: User | null;
        session: Session | null;
    };
}

const adapter = new DrizzleSQLiteAdapter(db, sessionTable, usersTable);

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            secure: process.env.NODE_ENV === "production",
        },
    },
    getUserAttributes: (attributes) => {
        return {
            githubId: attributes.id,
            username: attributes.username,
        };
    },
});

const t = usersTable.$inferSelect;

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: Pick<z.infer<typeof t>, "username" | "id">;
    }
}

export async function setUserCookie(userId: string, c: HonoContext) {
    const session = await lucia.createSession(userId, {});
    c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), {
        append: true,
    });
    return session;
}

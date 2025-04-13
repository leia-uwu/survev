import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import type { Context } from "../..";
import { TeamMode } from "../../../../../shared/gameConfig";
import { ItemStatus } from "../../../../../shared/utils/loadout";
import { type SaveGameBody, zUpdateRegionBody } from "../../../utils/types";
import { server } from "../../apiServer";
import { deleteExpiredSessions } from "../../auth";
import {
    databaseEnabledMiddleware,
    privateMiddleware,
    validateParams,
} from "../../auth/middleware";
import { getRedisClient } from "../../cache";
import { leaderboardCache } from "../../cache/leaderboard";
import { db } from "../../db";
import { type MatchDataTable, matchDataTable, usersTable } from "../../db/schema";
import { generateId } from "../user/auth/authUtils";
import { MOCK_USER_ID } from "../user/auth/mock";
import { ModerationRouter, logPlayerIPs } from "./ModerationRouter";

export const PrivateRouter = new Hono<Context>();

PrivateRouter.use(privateMiddleware);

PrivateRouter.route("/moderation", ModerationRouter);

PrivateRouter.post("/update_region", validateParams(zUpdateRegionBody), (c) => {
    try {
        const { regionId, data } = c.req.valid("json");

        server.updateRegion(regionId, data);
        return c.json({}, 200);
    } catch (err) {
        server.logger.warn("/private/update_region: Error processing request", err);
        return c.json({ error: "Error processing request" }, 500);
    }
});

PrivateRouter.post("/save_game", databaseEnabledMiddleware, async (c) => {
    try {
        const data = (await c.req.json()) as SaveGameBody;

        const matchData = data.matchData;

        if (!matchData.length) {
            return c.json({ error: "Empty match data" }, 500);
        }

        await leaderboardCache.invalidateCache(matchData);

        await db.insert(matchDataTable).values(matchData);
        await logPlayerIPs(matchData);
        server.logger.log(`Saved game data for ${matchData[0].gameId}`);
        return c.json({}, 200);
    } catch (err) {
        server.logger.warn("save_game Error processing request", err);
        return c.json({ error: "Error processing request" }, 500);
    }
});

// TODO: use a cron job instead
PrivateRouter.post("/delete-expired-sessions", databaseEnabledMiddleware, async (ctx) => {
    try {
        await deleteExpiredSessions();
    } catch (err) {
        server.logger.warn(
            `/private/delete-expired-sessions: Error deleting expired sessinos`,
            err,
        );
        return ctx.json({ error: "An unexpected error occurred." }, 500);
    }
});

PrivateRouter.post(
    "/unlock",
    databaseEnabledMiddleware,
    validateParams(
        z.object({
            item: z.string(),
            slug: z.string(),
        }),
    ),
    async (c) => {
        try {
            // TODO: make sure that item is a valide game item;
            const { item, slug } = c.req.valid("json");

            const result = await db.query.usersTable.findFirst({
                where: eq(usersTable.slug, slug),
                columns: {
                    items: true,
                },
            });

            if (!result) {
                return c.json({ error: "No items found for this user." }, 404);
            }

            const { items } = result;

            items.push({
                source: "daddy-has-privileges",
                type: item,
                status: ItemStatus.New,
                timeAcquired: Date.now(),
            });

            await db
                .update(usersTable)
                .set({
                    items,
                })
                .where(eq(usersTable.slug, slug));

            return c.json({ success: true }, 200);
        } catch (err) {
            server.logger.warn("/private/unlock: Error unlocking item", err);
            return c.json({}, 500);
        }
    },
);

PrivateRouter.post("/clear_cache", async (c) => {
    try {
        const client = await getRedisClient();
        await client.flushAll();
        return c.json({ success: true }, 200);
    } catch (err) {
        server.logger.warn("/private/clear_cache: Error clearing cache", err);
        return c.json({}, 500);
    }
});

PrivateRouter.post(
    "/test/insert_game",
    databaseEnabledMiddleware,
    validateParams(
        z.object({
            kills: z.number().catch(1),
        }),
    ),
    async (c) => {
        try {
            const data = c.req.valid("json");
            const matchData: MatchDataTable = {
                ...{
                    gameId: generateId(15),
                    userId: MOCK_USER_ID,
                    createdAt: new Date(),
                    region: "na",
                    mapId: 0,
                    mapSeed: 9834567801234,
                    username: MOCK_USER_ID,
                    playerId: 9834,
                    teamMode: TeamMode.Solo,
                    teamCount: 4,
                    teamTotal: 25,
                    teamId: 7,
                    timeAlive: 842,
                    rank: 3,
                    died: true,
                    kills: 5,
                    damageDealt: 1247,
                    damageTaken: 862,
                    killerId: 18765,
                    killedIds: [12543, 13587, 14298, 15321, 16754],
                },
                ...data,
            };
            await leaderboardCache.invalidateCache([matchData]);
            await db.insert(matchDataTable).values(matchData);
            return c.json({ success: true }, 200);
        } catch (err) {
            server.logger.warn("/private/test/insert_game: Error inserting game", err);
            return c.json({}, 500);
        }
    },
);

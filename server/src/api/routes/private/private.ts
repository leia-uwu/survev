import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import type { Context } from "../..";
import { ItemStatus } from "../../../../../shared/utils/loadout";
import { type SaveGameBody, zUpdateRegionBody } from "../../../utils/types";
import { server } from "../../apiServer";
import { deleteExpiredSessions } from "../../auth";
import { privateMiddleware, validateParams } from "../../auth/middleware";
import { invalidateLeaderboards } from "../../cache/leaderboard";
import { db } from "../../db";
import { matchDataTable, usersTable } from "../../db/schema";
import { handleModerationAction, logPlayerIPs } from "../../moderation";

export const PrivateRouter = new Hono<Context>();

PrivateRouter.use(privateMiddleware);

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

PrivateRouter.post("/save_game", async (c) => {
    try {
        const data = (await c.req.json()) as SaveGameBody;

        const matchData = data.matchData;

        if (!matchData.length) {
            return c.json({ error: "Empty match data" }, 500);
        }

        await invalidateLeaderboards(matchData);

        await db.insert(matchDataTable).values(matchData);
        await logPlayerIPs(matchData);
        server.logger.log(`Saved game data for ${matchData[0].gameId}`);
        return c.json({}, 200);
    } catch (err) {
        server.logger.warn("save_game Error processing request", err);
        return c.json({ error: "Error processing request" }, 500);
    }
});

const zModerationParms = z.discriminatedUnion("action", [
    z.object({
        action: z.literal("get-player-ip"),
        playerName: z.string(),
    }),
    z.object({
        action: z.literal("clean-all-bans"),
    }),
    z.object({
        action: z.enum(["ban-ip", "unban-ip", "check-ban-status"]),
        ip: z.string(),
        isEncoded: z.boolean().default(false),
        permanent: z.boolean().default(false),
    }),
]);

export type ModerationParms = z.infer<typeof zModerationParms>;

PrivateRouter.post("/moderation", validateParams(zModerationParms), async (ctx) => {
    const data = ctx.req.valid("json");
    try {
        return ctx.json({ message: await handleModerationAction(data) });
    } catch (err) {
        server.logger.warn(
            `/private/moderation: Error processing ${data.action} request`,
            err,
        );
        return ctx.json({ message: "An unexpected error occurred." }, 500);
    }
});

// TODO: use a cron job instead
PrivateRouter.post("/delete-expired-sessions", async (ctx) => {
    try {
        await deleteExpiredSessions();
    } catch (err) {
        server.logger.warn(
            `/private/delete-expired-sessions: Error deleting expired sessinos`,
            err,
        );
        return ctx.json({ message: "An unexpected error occurred." }, 500);
    }
});

PrivateRouter.post(
    "/unlock",
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
                return c.json({ err: "No items found for this user." }, 404);
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

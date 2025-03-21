import { readFileSync } from "fs";
import path from "path";
import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Session, User } from "lucia";
import { z } from "zod";
import { version } from "../../../package.json";
import { Config } from "../config";
import type { FindGameBody } from "../gameServer";
import { GIT_VERSION } from "../utils/gitRevision";
import { HTTPRateLimit, getHonoIp } from "../utils/serverHelpers";
import { server } from "./apiServer";
import { handleModerationAction } from "./moderation";
import { StatsRouter } from "./routes/stats/StatsRouter";
import { AuthRouter } from "./routes/user/AuthRouter";
import { UserRouter } from "./routes/user/UserRouter";
import { validateParams } from "./zodSchemas";

export type Context = {
    Variables: {
        user: User | null;
        session: Session | null;
    };
};

const app = new Hono();
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

// all api routes for now, this should be okey?
//
// pretty sure its ok, maybe if we add private APIs for like a management dashboard
// we could use like /private/
// - Leia
app.use(
    "/api/*",
    cors({
        origin: "*",
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Origin", "Content-Type", "Accept", "X-Requested-With"],
        maxAge: 3600,
    }),
);

const stats = readFileSync(
    path.resolve(__dirname.replace("dist/server/", ""), "static/stats.html"),
    "utf-8",
);

["/stats", "/stats/"].forEach((route) => {
    app.get(route, (c) => {
        return c.redirect("/leaderboard/");
    });
});

app.get("/stats/:slug", (c) => {
    return c.html(stats);
});

app.route("/api/user/", UserRouter);
app.route("/api/user/auth/", AuthRouter);
app.route("/api/", StatsRouter);

server.init(app, upgradeWebSocket);

const findGameRateLimit = new HTTPRateLimit(5, 3000);

app.post("/api/find_game", async (c) => {
    try {
        const ip = getHonoIp(c, Config.apiServer.proxyIPHeader);
        server.logger.log(`/api/find_game IP: ${ip}`, ip);

        if (!ip) {
            return c.json({}, 500);
        }

        if (findGameRateLimit.isRateLimited(ip)) {
            return c.json(
                {
                    res: [{ err: "you are being rate limited" }],
                },
                429,
            );
        }

        const body = (await c.req.json()) as FindGameBody;

        const data = await server.findGame(body);
        return c.json(data);
    } catch (err) {
        server.logger.warn("/api/find_game: Error retrieving body", err);
        return c.json(
            {
                res: [{ err: "Internal server error" }],
            },
            500,
        );
    }
});

app.post("/api/update_region", async (c) => {
    try {
        const { apiKey, regionId, data } = await c.req.json();

        if (apiKey !== Config.apiKey || !(regionId in server.regions)) {
            return c.body("Forbidden", 403);
        }

        server.updateRegion(regionId, data);
        return c.json({}, 200);
    } catch (err) {
        server.logger.warn("/api/find_game: Error processing request", err);
        return c.json({ error: "Error processing request" }, 500);
    }
});

app.post(
    "/api/moderation",
    validateParams(
        z.object({
            apiKey: z.string(),
            data: z.object({
                action: z.enum(["ban", "unban", "isbanned", "clear", "get-player-ip"]),
                ip: z.string(),
                name: z.string().optional(),
            }),
        }),
    ),
    async (ctx) => {
        try {
            const { apiKey, data } = ctx.req.valid("json");

            if (apiKey !== Config.apiKey) {
                return ctx.json({ message: "Forbidden" }, 403);
            }

            const message = handleModerationAction(data.action, data.ip, data.name);

            return ctx.json({ message });
        } catch (err) {
            server.logger.warn("/api/moderation: Error processing request", err);
            return ctx.json({ message: "An unexpected error occurred." }, 500);
        }
    },
);

app.post("/api/report_error", async (c) => {
    try {
        const content = await c.req.json();
        return c.json({ success: true }, 200);

        const ERROR_LOGS_WEBHOOK = "";

        fetch(ERROR_LOGS_WEBHOOK, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content,
            }),
        });
        return c.json({ success: true }, 200);
    } catch (err) {
        server.logger.warn("/api/report_error: Invalid request", err);
        return c.json({ error: "Invalid request" }, 400);
    }
});

server.logger.log(`Survev API Server v${version} - GIT ${GIT_VERSION}`);
server.logger.log(`Listening on ${Config.apiServer.host}:${Config.apiServer.port}`);
server.logger.log("Press Ctrl+C to exit.");

// reset player count to 0 if region seems to be down
setInterval(() => {
    for (const regionId in server.regions) {
        const region = server.regions[regionId];
        if (Date.now() - region.lastUpdateTime > 60000) {
            server.logger.warn(
                `Region ${regionId} has not sent player count in more than 60 seconds`,
            );
            region.playerCount = 0;
        }
    }
}, 60000);

const honoServer = serve({
    fetch: app.fetch,
    port: Config.apiServer.port,
});
injectWebSocket(honoServer);

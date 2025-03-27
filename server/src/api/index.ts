import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Session, User } from "lucia";
import { version } from "../../../package.json";
import {
    type FindGameResponse,
    type Info,
    zFindGameBody,
} from "../../../shared/types/api";
import { Config } from "../config";
import { GIT_VERSION } from "../utils/gitRevision";
import {
    HTTPRateLimit,
    getHonoIp,
    isBehindProxy,
    logErrorToWebhook,
} from "../utils/serverHelpers";
import { server } from "./apiServer";
import { validateParams } from "./auth/middleware";
import { isBanned } from "./moderation";
import { PrivateRouter } from "./routes/private/private";
import { StatsRouter } from "./routes/stats/StatsRouter";
import { AuthRouter } from "./routes/user/AuthRouter";
import { UserRouter } from "./routes/user/UserRouter";
import { z } from "zod";

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

app.route("/api/user/", UserRouter);
app.route("/api/auth/", AuthRouter);
app.route("/api/", StatsRouter);
app.route("/private/", PrivateRouter);

server.init(app, upgradeWebSocket);

app.get("/api/site_info", (c) => {
    return c.json<Info>(server.getSiteInfo(), 200);
});

const findGameRateLimit = new HTTPRateLimit(5, 3000);

app.post("/api/find_game", validateParams(zFindGameBody), async (c) => {
    try {
        const ip = getHonoIp(c, Config.apiServer.proxyIPHeader);

        if (!ip) {
            return c.json({}, 500);
        }

        if (findGameRateLimit.isRateLimited(ip)) {
            return c.json<FindGameResponse>({ err: "rate_limited" }, 429);
        }

        if (await isBehindProxy(ip)) {
            return c.json<FindGameResponse>({ err: "behind_proxy" });
        }

        if (await isBanned(ip)) {
            return c.json<FindGameResponse>({ err: "banned" });
        }

        const body = c.req.valid("json");

        const data = await server.findGame({
            region: body.region,
            zones: body.zones,
            version: body.version,
            gameModeIdx: body.gameModeIdx,
            playerCount: 1, // only team menu can request more
            autoFill: true,
        });

        return c.json(data);
    } catch (err) {
        server.logger.warn("/api/find_game: Error retrieving body", err);
        return c.json({}, 500);
    }
});

app.post("/api/report_error",
    validateParams(z.object({ loc: z.string(), data: z.any() })),
    async (c) => {
    try {
        const content = await c.req.json();

        logErrorToWebhook("client", content);

        return c.json({ success: true }, 200);
    } catch (err) {
        server.logger.warn("/api/report_error: Invalid request", err);
        return c.json({ error: "Invalid request" }, 400);
    }
});

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

server.logger.log(`Survev API Server v${version} - GIT ${GIT_VERSION}`);
server.logger.log(`Listening on ${Config.apiServer.host}:${Config.apiServer.port}`);
server.logger.log("Press Ctrl+C to exit.");

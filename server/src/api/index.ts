import { randomUUID } from "crypto";
import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { cors } from "hono/cors";
import { z } from "zod";
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
import { validateSessionToken } from "./auth";
import { validateParams } from "./auth/middleware";
import type { SessionTableSelect, UsersTableSelect } from "./db/schema";
import { isBanned } from "./routes/private/ModerationRouter";
import { PrivateRouter } from "./routes/private/private";
import { StatsRouter } from "./routes/stats/StatsRouter";
import { AuthRouter } from "./routes/user/AuthRouter";
import { UserRouter } from "./routes/user/UserRouter";

export type Context = {
    Variables: {
        user: UsersTableSelect | null;
        session: SessionTableSelect | null;
    };
};

const app = new Hono();
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

app.use(
    "/api/*",
    cors({
        origin: "*",
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Origin", "Content-Type", "Accept", "X-Requested-With"],
        maxAge: 3600,
    }),
);

// @TODO: figure out the origins for this..
// app.use(csrf())

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
            return c.json<FindGameResponse>({ error: "rate_limited" }, 429);
        }

        if (await isBehindProxy(ip)) {
            return c.json<FindGameResponse>({ error: "behind_proxy" });
        }

        try {
            if (await isBanned(ip)) {
                return c.json<FindGameResponse>({ error: "banned" });
            }
        } catch (err) {
            console.error("/api/find_game: Failed to check if IP is banned", err);
        }

        const body = c.req.valid("json");

        const token = randomUUID();
        let userId: string | null = null;

        const sessionId = getCookie(c, "session") ?? null;

        if (sessionId) {
            try {
                const account = await validateSessionToken(sessionId);
                userId = account.user?.id || null;
            } catch (err) {
                console.error("/api/find_game: Failed to validate session", err);
                userId = null;
            }
        }

        const data = await server.findGame({
            region: body.region,
            version: body.version,
            gameModeIdx: body.gameModeIdx,
            autoFill: true,
            playerData: [
                {
                    token,
                    userId,
                },
            ],
        });

        if ("error" in data) {
            return c.json(data);
        }

        return c.json<FindGameResponse>({
            res: [
                {
                    zone: "",
                    data: token,
                    useHttps: data.useHttps,
                    hosts: data.hosts,
                    addrs: data.addrs,
                    gameId: data.gameId,
                },
            ],
        });
    } catch (err) {
        server.logger.warn("/api/find_game: Error retrieving body", err);
        return c.json({}, 500);
    }
});

app.post(
    "/api/report_error",
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
    },
);

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

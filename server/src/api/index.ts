import { version } from "../../../package.json";
import { Config } from "../config";
import type { FindGameBody } from "../gameServer";
import { GIT_VERSION } from "../utils/gitRevision";
import { HTTPRateLimit, getHonoIp, verifyTurnsStile } from "../utils/serverHelpers";
import { ApiServer } from "./apiServer";
import { readFileSync } from "fs";
import path from "path";
import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Session, User } from "lucia";
import { StatsRouter } from "./routes/stats/StatsRouter";
import { AuthRouter } from "./routes/user/AuthRouter";
import { UserRouter } from "./routes/user/UserRouter";

export type Context = {
    Variables: {
        user: User | null;
        session: Session | null;
    };
};

export const server = new ApiServer();

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
    path.resolve(__dirname.replace("dist/server/", ""), "static/index.html"),
    "utf-8",
    
);

[
    "/stats",
    "/stats/",
].forEach((route) => {
  app.get(route, (c) => {
    return c.redirect("/leaderboard/");
  });
});

app.get("/stats/:slug", (c) => {
    console.log("redirecting to /stats", c.req.url);
    return c.html(stats);
});

app.route("/api/user/", UserRouter);
app.route("/api/user/auth/", AuthRouter);
app.route("/api/", StatsRouter);

server.init(app, upgradeWebSocket);

const findGameRateLimit = new HTTPRateLimit(5, 3000);

app.post("/api/find_game", async (c) => {
    try {
        const ip = getHonoIp(c);

        if (findGameRateLimit.isRateLimited(ip)) {
            return c.json(
                {
                    res: [{ err: "you are being rate limited" }],
                },
                429,
            );
        }

        const body = (await c.req.json()) as FindGameBody;

        if (server.captchaEnabled && !(await verifyTurnsStile(body.token, ip))) {
            return c.json(
                {
                    res: [{ err: "Invalid captcha token" }],
                },
                400,
            );
        }

        const data = await server.findGame(body);
        return c.json(data);
    } catch (_err) {
        server.logger.warn("/api/find_game: Error retrieving body");
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
    } catch (_err) {
        server.logger.warn("/api/find_game: Error processing request");
        return c.json({ error: "Error processing request" }, 500);
    }
});

app.post("/api/toggleCaptcha", async (c) => {
    try {
        const body = await c.req.json();
        if (body.apiKey !== Config.apiKey) {
            return c.json({ error: "Invalid token" }, 403);
        }

        if (typeof body.state === "boolean") {
            server.captchaEnabled = body.state;
        }

        return c.json({
            state: server.captchaEnabled,
        });
    } catch (_err) {
        server.logger.warn("/api/toggleCaptcha: Invalid request");
        return c.json({ error: "Invalid request" }, 400);
    }
});

// TODO: HACK: this is just temporary
// waiting for accounts to do a proper dashboard for stuff
// since accounts pr refactors a lot of the API server and i dont want many conflicts
const dashboard = readFileSync(
    path.resolve(__dirname.replace("dist/server/", ""), "static/dashboard.html"),
    "utf-8",
);
app.get("/dashboard", (c) => {
    return c.html(dashboard);
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

import { randomUUID } from "crypto";
import { App, SSLApp, type WebSocket } from "uWebSockets.js";
import { version } from "../../package.json";
import { GameConfig } from "../../shared/gameConfig";
import * as net from "../../shared/net/net";
import { Config } from "./config";
import { SingleThreadGameManager } from "./game/gameManager";
import { GameProcessManager } from "./game/gameProcessManager";
import { GIT_VERSION } from "./utils/gitRevision";
import { Logger } from "./utils/logger";
import {
    HTTPRateLimit,
    WebSocketRateLimit,
    cors,
    fetchApiServer,
    forbidden,
    getIp,
    isBehindProxy,
    logErrorToWebhook,
    readPostedJSON,
    returnJson,
    waitForApiServerReady,
} from "./utils/serverHelpers";
import {
    type FindGamePrivateBody,
    type FindGamePrivateRes,
    type GameSocketData,
    zFindGamePrivateBody,
} from "./utils/types";

process.on("uncaughtException", async (err) => {
    console.error(err);

    await logErrorToWebhook("server", "Game server error:", err);

    process.exit(1);
});

class GameServer {
    readonly logger = new Logger("GameServer");

    readonly region = Config.regions[Config.gameServer.thisRegion];
    readonly regionId = Config.gameServer.thisRegion;

    readonly manager =
        Config.processMode === "single"
            ? new SingleThreadGameManager()
            : new GameProcessManager();

    async findGame(body: FindGamePrivateBody): Promise<FindGamePrivateRes> {
        const parsed = zFindGamePrivateBody.safeParse(body);

        if (!parsed.success || !parsed.data) {
            this.logger.warn("/api/find_game: Invalid body");
            return {
                error: "full",
            };
        }
        const data = parsed.data;

        if (data.version !== GameConfig.protocolVersion) {
            return {
                error: "invalid_protocol",
            };
        }

        if (data.region !== this.regionId) {
            return {
                error: "full",
            };
        }

        const gameId = await this.manager.findGame({
            region: data.region,
            version: data.version,
            autoFill: data.autoFill,
            mapName: data.mapName,
            teamMode: data.teamMode,
            playerData: data.playerData,
        });

        return {
            gameId,
            useHttps: this.region.https,
            hosts: [this.region.address],
            addrs: [this.region.address],
        };
    }

    sendData() {
        fetchApiServer("private/update_region", {
            data: {
                playerCount: this.manager.getPlayerCount(),
            },
            regionId: Config.gameServer.thisRegion,
        });
    }
}

const server = new GameServer();

if (process.env.NODE_ENV !== "production") {
    server.manager.newGame(Config.modes[0]);
}

const app = Config.gameServer.ssl
    ? SSLApp({
          key_file_name: Config.gameServer.ssl.keyFile,
          cert_file_name: Config.gameServer.ssl.certFile,
      })
    : App();

app.options("/api/find_game", (res) => {
    cors(res);
    res.end();
});

app.post("/api/find_game", async (res, req) => {
    res.onAborted(() => {
        res.aborted = true;
    });

    if (req.getHeader("survev-api-key") !== Config.secrets.SURVEV_API_KEY) {
        forbidden(res);
        return;
    }

    readPostedJSON(
        res,
        async (body: FindGamePrivateBody) => {
            try {
                if (res.aborted) return;

                const parsed = zFindGamePrivateBody.safeParse(body);
                if (!parsed.success || !parsed.data) {
                    returnJson(res, { error: "full" });
                    return;
                }

                returnJson(res, await server.findGame(parsed.data));
            } catch (error) {
                server.logger.warn("API find_game error: ", error);
            }
        },
        () => {
            server.logger.warn("/api/find_game: Error retrieving body");
        },
    );
});

const gameHTTPRateLimit = new HTTPRateLimit(5, 1000);
const gameWsRateLimit = new WebSocketRateLimit(500, 1000, 5);

app.ws<GameSocketData>("/play", {
    idleTimeout: 30,
    maxPayloadLength: 1024,

    async upgrade(res, req, context): Promise<void> {
        res.onAborted((): void => {
            res.aborted = true;
        });
        const wskey = req.getHeader("sec-websocket-key");
        const wsProtocol = req.getHeader("sec-websocket-protocol");
        const wsExtensions = req.getHeader("sec-websocket-extensions");

        const ip = getIp(res, req, Config.gameServer.proxyIPHeader);

        if (!ip) {
            server.logger.warn(`Invalid IP Found`);
            res.end();
            return;
        }

        if (gameHTTPRateLimit.isRateLimited(ip) || gameWsRateLimit.isIpRateLimited(ip)) {
            res.cork(() => {
                res.writeStatus("429 Too Many Requests");
                res.write("429 Too Many Requests");
                res.end();
            });
            return;
        }

        const searchParams = new URLSearchParams(req.getQuery());
        const gameId = searchParams.get("gameId");

        if (!gameId || !server.manager.getById(gameId)) {
            forbidden(res);
            return;
        }
        gameWsRateLimit.ipConnected(ip);

        const socketId = randomUUID();
        let disconnectReason = "";

        if (await isBehindProxy(ip)) {
            disconnectReason = "behind_proxy";
        }

        if (res.aborted) return;
        res.cork(() => {
            if (res.aborted) return;
            res.upgrade(
                {
                    gameId,
                    id: socketId,
                    closed: false,
                    rateLimit: {},
                    ip,
                    disconnectReason,
                },
                wskey,
                wsProtocol,
                wsExtensions,
                context,
            );
        });
    },

    open(socket: WebSocket<GameSocketData>) {
        const data = socket.getUserData();

        if (data.disconnectReason) {
            const disconnectMsg = new net.DisconnectMsg();
            disconnectMsg.reason = data.disconnectReason;
            const stream = new net.MsgStream(new ArrayBuffer(128));
            stream.serializeMsg(net.MsgType.Disconnect, disconnectMsg);
            socket.send(stream.getBuffer(), true, false);
            socket.end();
            return;
        }

        server.manager.onOpen(data.id, socket);
    },

    message(socket: WebSocket<GameSocketData>, message) {
        if (gameWsRateLimit.isRateLimited(socket.getUserData().rateLimit)) {
            socket.close();
            return;
        }
        server.manager.onMsg(socket.getUserData().id, message);
    },

    close(socket: WebSocket<GameSocketData>) {
        const data = socket.getUserData();
        data.closed = true;
        server.manager.onClose(data.id);
        gameWsRateLimit.ipDisconnected(data.ip);
    },
});

const pingHTTPRateLimit = new HTTPRateLimit(1, 3000);
const pingWsRateLimit = new WebSocketRateLimit(50, 1000, 10);

interface pingSocketData {
    rateLimit: Record<symbol, number>;
    ip: string;
}

// ping test
app.ws<pingSocketData>("/ptc", {
    idleTimeout: 10,
    maxPayloadLength: 2,

    upgrade(res, req, context) {
        res.onAborted((): void => {});

        const ip = getIp(res, req, Config.gameServer.proxyIPHeader);

        if (!ip) {
            server.logger.warn(`Invalid IP Found`);
            res.end();
            return;
        }

        if (pingHTTPRateLimit.isRateLimited(ip) || pingWsRateLimit.isIpRateLimited(ip)) {
            res.writeStatus("429 Too Many Requests");
            res.write("429 Too Many Requests");
            res.end();
            return;
        }
        pingWsRateLimit.ipConnected(ip);

        res.upgrade(
            {
                rateLimit: {},
                ip,
            },
            req.getHeader("sec-websocket-key"),
            req.getHeader("sec-websocket-protocol"),
            req.getHeader("sec-websocket-extensions"),
            context,
        );
    },

    message(socket: WebSocket<pingSocketData>, message) {
        if (pingWsRateLimit.isRateLimited(socket.getUserData().rateLimit)) {
            socket.close();
            return;
        }
        socket.send(message, true, false);
    },

    close(ws) {
        pingWsRateLimit.ipDisconnected(ws.getUserData().ip);
    },
});

await waitForApiServerReady();
server.sendData();
setInterval(() => {
    server.sendData();
}, 20 * 1000);

app.listen(Config.gameServer.host, Config.gameServer.port, () => {
    server.logger.info(`Survev Game Server v${version} - GIT ${GIT_VERSION}`);
    server.logger.info(
        `Listening on ${Config.gameServer.host}:${Config.gameServer.port}`,
    );
    server.logger.info("Press Ctrl+C to exit.");
});

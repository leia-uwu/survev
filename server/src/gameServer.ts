import { randomBytes } from "crypto";
import { App, SSLApp, type WebSocket } from "uWebSockets.js";
import { version } from "../../package.json";
import { GameConfig } from "../../shared/gameConfig";
import * as net from "../../shared/net/net";
import {
    type FindGameBody,
    type FindGameMatchData,
    type FindGameResponse,
    zFindGameBody,
} from "../../shared/types/api";
import { math } from "../../shared/utils/math";
import { Config } from "./config";
import { SingleThreadGameManager } from "./game/gameManager";
import { GameProcessManager } from "./game/gameProcessManager";
import { GIT_VERSION } from "./utils/gitRevision";
import { Logger } from "./utils/logger";
import {
    HTTPRateLimit,
    WebSocketRateLimit,
    cors,
    forbidden,
    getIp,
    isBehindProxy,
    readPostedJSON,
    returnJson,
} from "./utils/serverHelpers";
import type { GameSocketData } from "./utils/types";

class GameServer {
    readonly logger = new Logger("GameServer");

    readonly region = Config.regions[Config.thisRegion];
    readonly regionId = Config.thisRegion;

    readonly manager =
        Config.processMode === "single"
            ? new SingleThreadGameManager()
            : new GameProcessManager();

    async findGame(body: FindGameBody): Promise<FindGameResponse> {
        const parsed = zFindGameBody.safeParse(body);

        if (!parsed.success) {
            this.logger.warn("/api/find_game: Invalid body");
            return {
                err: "full",
            };
        }

        if (body.version !== GameConfig.protocolVersion) {
            return {
                err: "invalid_protocol",
            };
        }

        if (body.region !== this.regionId) {
            return {
                err: "full",
            };
        }

        const mode = Config.modes[body.gameModeIdx];

        if (!mode || !mode.enabled) {
            return {
                err: "full",
            };
        }

        body.playerCount = math.clamp(body.playerCount ?? 1, 1, mode.teamMode);

        const data = await this.manager.findGame({
            region: body.region,
            zones: body.zones,
            version: body.version,
            playerCount: math.clamp(body.playerCount, 1, mode.teamMode),
            autoFill: body.autoFill,
            gameModeIdx: body.gameModeIdx,
        });

        let response: FindGameMatchData = {
            zone: "",
            data: data.data,
            gameId: data.gameId,
            useHttps: this.region.https,
            hosts: [this.region.address],
            addrs: [this.region.address],
        };

        return { res: [response] };
    }

    async fetchApiServer(route: string, body: object) {
        const url = `${Config.gameServer.apiServerUrl}/${route}`;
        try {
            const res = await fetch(url, {
                method: "post",
                headers: {
                    "Content-type": "application/json",
                    "survev-api-key": Config.apiKey,
                },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(5000),
            });

            return res;
        } catch (err) {
            console.warn(`Error fetching routed ${route}`, err);
        }
    }

    sendData() {
        this.fetchApiServer("private/update_region", {
            data: {
                playerCount: this.manager.getPlayerCount(),
            },
            regionId: Config.thisRegion,
        });
    }
}

const server = new GameServer();

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

    if (req.getHeader("survev-api-key") !== Config.apiKey) {
        forbidden(res);
        return;
    }

    readPostedJSON(
        res,
        async (body: FindGameBody) => {
            try {
                if (res.aborted) return;

                const parsed = zFindGameBody.safeParse(body);
                if (!parsed.success) {
                    returnJson(res, { err: "full" });
                }

                returnJson(res, await server.findGame(body));
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
const gameWsRateLimit = new WebSocketRateLimit(500, 1000, 10);

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
            res.writeStatus("429 Too Many Requests");
            res.write("429 Too Many Requests");
            res.end();
            return;
        }

        const searchParams = new URLSearchParams(req.getQuery());
        const gameId = searchParams.get("gameId");

        if (!gameId || !server.manager.getById(gameId)) {
            forbidden(res);
            return;
        }
        gameWsRateLimit.ipConnected(ip);

        const socketId = randomBytes(20).toString("hex");
        res.cork(async () => {
            let disconnectReason = "";

            if (await isBehindProxy(ip)) {
                disconnectReason = "behind_proxy";
            }

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

server.sendData();
setInterval(() => {
    server.sendData();
}, 20 * 1000);

setInterval(() => {
    const memoryUsage = process.memoryUsage().rss;

    const perfString = `Memory usage: ${Math.round((memoryUsage / 1024 / 1024) * 100) / 100} MB`;

    server.logger.log(perfString);
}, 60000);

app.listen(Config.gameServer.host, Config.gameServer.port, () => {
    server.logger.log(`Survev Game Server v${version} - GIT ${GIT_VERSION}`);
    server.logger.log(`Listening on ${Config.gameServer.host}:${Config.gameServer.port}`);
    server.logger.log("Press Ctrl+C to exit.");
});

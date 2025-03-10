import { randomBytes } from "crypto";
import { App, SSLApp, type TemplatedApp, type WebSocket } from "uWebSockets.js";
import { version } from "../../package.json";
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
    readPostedJSON,
    returnJson,
} from "./utils/serverHelpers";

export interface FindGameBody {
    region: string;
    zones: string[];
    version: number;
    playerCount: number;
    autoFill: boolean;
    gameModeIdx: number;
}

export type FindGameResponse = {
    res: Array<
        | {
              zone: string;
              gameId: string;
              useHttps: boolean;
              hosts: string[];
              addrs: string[];
              data: string;
          }
        | { err: string }
    >;
};

export interface GameSocketData {
    gameId: string;
    id: string;
    closed: boolean;
    rateLimit: Record<symbol, number>;
    ip: string;
}

export class GameServer {
    readonly logger = new Logger("GameServer");

    readonly region = Config.regions[Config.thisRegion];
    readonly regionId = Config.thisRegion;

    readonly manager =
        Config.processMode === "single"
            ? new SingleThreadGameManager()
            : new GameProcessManager();

    constructor() {}

    init(app: TemplatedApp): void {
        setInterval(() => {
            const memoryUsage = process.memoryUsage().rss;

            const perfString = `Memory usage: ${Math.round((memoryUsage / 1024 / 1024) * 100) / 100} MB`;

            this.logger.log(perfString);
        }, 60000);

        const server = this;

        const gameHTTPRateLimit = new HTTPRateLimit(5, 1000);
        const gameWsRateLimit = new WebSocketRateLimit(500, 1000, 10);

        app.ws<GameSocketData>("/play", {
            idleTimeout: 30,
            /**
             * Upgrade the connection to WebSocket.
             */
            upgrade(res, req, context) {
                res.onAborted((): void => {});

                const ip = getIp(res, req, Config.gameServer.proxyIPHeader);

                if (!ip) {
                    server.logger.warn(`Invalid IP Found`);
                    res.end();
                    return;
                }

                if (
                    gameHTTPRateLimit.isRateLimited(ip) ||
                    gameWsRateLimit.isIpRateLimited(ip)
                ) {
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
                res.upgrade(
                    {
                        gameId,
                        id: socketId,
                        closed: false,
                        rateLimit: {},
                        ip,
                    },
                    req.getHeader("sec-websocket-key"),
                    req.getHeader("sec-websocket-protocol"),
                    req.getHeader("sec-websocket-extensions"),
                    context,
                );
            },

            /**
             * Handle opening of the socket.
             * @param socket The socket being opened.
             */
            open(socket: WebSocket<GameSocketData>) {
                server.manager.onOpen(socket.getUserData().id, socket);
            },

            /**
             * Handle messages coming from the socket.
             * @param socket The socket in question.
             * @param message The message to handle.
             */
            message(socket: WebSocket<GameSocketData>, message) {
                if (gameWsRateLimit.isRateLimited(socket.getUserData().rateLimit)) {
                    socket.close();
                    return;
                }
                server.manager.onMsg(socket.getUserData().id, message);
            },

            /**
             * Handle closing of the socket.
             * @param socket The socket being closed.
             */
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

                if (
                    pingHTTPRateLimit.isRateLimited(ip) ||
                    pingWsRateLimit.isIpRateLimited(ip)
                ) {
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
    }

    async findGame(body: FindGameBody): Promise<FindGameResponse> {
        if (body.region !== this.regionId) {
            this.logger.warn("/api/find_game: Invalid region");
            return {
                res: [
                    {
                        err: "Invalid Region",
                    },
                ],
            };
        }

        // sanitize the body
        if (typeof body.gameModeIdx !== "number") {
            body.gameModeIdx = 0;
        }
        if (typeof body.autoFill !== "boolean") {
            body.autoFill = true;
        }

        const mode = Config.modes[body.gameModeIdx];

        if (!mode || !mode.enabled) {
            return {
                res: [
                    {
                        err: "Invalid game mode index",
                    },
                ],
            };
        }

        if (typeof body.playerCount !== "number") {
            body.playerCount = 1;
        } else {
            body.playerCount = math.clamp(body.playerCount ?? 1, 1, mode.teamMode);
        }

        const data = await this.manager.findGame(body);

        let response: FindGameResponse["res"][0] = {
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
        fetch(url, {
            body: JSON.stringify({
                ...body,
                apiKey: Config.apiKey,
            }),
            method: "post",
            headers: {
                "Content-type": "application/json",
            },
            signal: AbortSignal.timeout(5000),
        }).catch((error) => {
            this.logger.warn(`Failed to fetch "${url}" error:`, error);
        });
    }

    sendData() {
        this.fetchApiServer("api/update_region", {
            data: {
                playerCount: this.manager.getPlayerCount(),
            },
            regionId: Config.thisRegion,
        });
    }
}

if (process.argv.includes("--game-server")) {
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
    app.post("/api/find_game", async (res) => {
        res.onAborted(() => {
            res.aborted = true;
        });
        cors(res);

        readPostedJSON(
            res,
            async (body: FindGameBody & { apiKey: string }) => {
                try {
                    if (res.aborted) return;
                    if (body.apiKey !== Config.apiKey) {
                        forbidden(res);
                        return;
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

    app.listen(Config.gameServer.host, Config.gameServer.port, () => {
        server.logger.log(`Survev Game Server v${version} - GIT ${GIT_VERSION}`);
        server.logger.log(
            `Listening on ${Config.gameServer.host}:${Config.gameServer.port}`,
        );
        server.logger.log("Press Ctrl+C to exit.");

        server.init(app);

        setInterval(() => {
            server.sendData();
        }, 10 * 3000);
    });
}

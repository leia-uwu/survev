import { randomBytes } from "crypto";
import { App, SSLApp, type TemplatedApp, type WebSocket } from "uWebSockets.js";
import { version } from "../../package.json";
import { math } from "../../shared/utils/math";
import { Config } from "./config";
import { SingleThreadGameManager } from "./game/gameManager";
import { GameProcessManager } from "./game/gameProcessManager";
import { GIT_VERSION } from "./utils/gitRevision";
import { Logger } from "./utils/logger";
import { cors, forbidden, readPostedJSON, returnJson } from "./utils/serverHelpers";

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

        app.ws("/play", {
            idleTimeout: 30,
            /**
             * Upgrade the connection to WebSocket.
             */
            upgrade(res, req, context) {
                res.onAborted((): void => {});

                const searchParams = new URLSearchParams(req.getQuery());
                const gameId = searchParams.get("gameId");

                if (!gameId || !server.manager.getById(gameId)) {
                    forbidden(res);
                    return;
                }

                const socketId = randomBytes(20).toString("hex");
                res.upgrade(
                    {
                        gameId,
                        id: socketId,
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
                server.manager.onMsg(socket.getUserData().id, message);
            },

            /**
             * Handle closing of the socket.
             * @param socket The socket being closed.
             */
            close(socket: WebSocket<GameSocketData>) {
                server.manager.onClose(socket.getUserData().id);
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
            body.playerCount = mode.teamMode;
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
        }).catch((error) => {
            this.logger.warn(`Failed to fetch "${url}" error:`);
            console.error(error);
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

    server.init(app);

    app.options("/api/find_game", (res) => {
        cors(res);
        res.end();
    });
    app.post("/api/find_game", async (res) => {
        let aborted = false;
        res.onAborted(() => {
            aborted = true;
        });
        cors(res);

        readPostedJSON(
            res,
            async (body: FindGameBody & { apiKey: string }) => {
                try {
                    if (aborted) return;
                    if (body.apiKey !== Config.apiKey) {
                        forbidden(res);
                        return;
                    }
                    returnJson(res, await server.findGame(body));
                } catch (error) {
                    server.logger.warn("API find_game error:");
                    console.error(error);
                    console.error(error);
                    if (aborted) return;
                    returnJson(res, {
                        res: [
                            {
                                err: "Failed finding game",
                            },
                        ],
                    });
                }
            },
            () => {
                server.logger.warn("/api/find_game: Error retrieving body");
                if (aborted) return;
                returnJson(res, {
                    res: [
                        {
                            err: "Error retriving body",
                        },
                    ],
                });
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
        }, 10 * 1000);
    });
}

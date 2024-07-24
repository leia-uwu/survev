import { randomBytes } from "crypto";
import { platform } from "os";
import { URLSearchParams } from "url";
import NanoTimer from "nanotimer";
import { App, SSLApp, type WebSocket } from "uWebSockets.js";
import { version } from "../../package.json";
import { GameConfig } from "../../shared/gameConfig";
import { Config } from "./config";
import { Game, type ServerGameConfig } from "./game/game";
import type { Group } from "./game/group";
import type { Player } from "./game/objects/player";
import { TeamMenu } from "./teamMenu";
import { Logger } from "./utils/logger";
import { cors, forbidden, readPostedJSON, returnJson } from "./utils/serverHelpers";

export interface GameSocketData {
    readonly gameID: string;
    sendMsg: (msg: ArrayBuffer | Uint8Array) => void;
    closeSocket: () => void;
    player?: Player;
}

export interface TeamSocketData {
    sendMsg: (response: string) => void;
    closeSocket: () => void;
    roomUrl: string;
}

export interface FindGameBody {
    region: string;
    zones: string[];
    version: number;
    playerCount: number;
    autoFill: boolean;
    gameModeIdx: number;
}

export class Server {
    readonly logger = new Logger("Server");

    readonly gamesById = new Map<string, Game>();
    readonly games: Game[] = [];

    teamMenu = new TeamMenu(this);

    init(): void {
        this.logger.log(`Resurviv Server v${version}`);
        this.logger.log(`Listening on ${Config.host}:${Config.port}`);
        this.logger.log("Press Ctrl+C to exit.");

        setInterval(() => {
            const memoryUsage = process.memoryUsage().rss;

            const perfString = `Memory usage: ${Math.round((memoryUsage / 1024 / 1024) * 100) / 100} MB`;

            this.logger.log(perfString);
        }, 60000);

        this.newGame(Config.modes[0]);
    }

    update(): void {
        for (let i = 0; i < this.games.length; i++) {
            const game = this.games[i];
            if (game.stopped) {
                this.games.splice(i, 1);
                this.gamesById.delete(game.id);
                continue;
            }
            game.update();
        }
    }

    netSync(): void {
        for (let i = 0; i < this.games.length; i++) {
            this.games[i].netSync();
        }
    }

    async newGame(config: ServerGameConfig): Promise<Game> {
        const id = randomBytes(20).toString("hex");
        const game = new Game(id, config);
        await game.init();
        this.games.push(game);
        this.gamesById.set(id, game);
        return game;
    }

    getSiteInfo() {
        const playerCount = this.games.reduce((a, b) => {
            return a + (b ? b.playerBarn.players.length : 0);
        }, 0);

        const data = {
            modes: Config.modes,
            pops: {
                local: `${playerCount} players`
            },
            youtube: { name: "", link: "" },
            twitch: [],
            country: "US"
        };
        return data;
    }

    getUserProfile() {
        return { err: "" };
    }

    async findGame(body: FindGameBody) {
        let response:
            | {
                  zone: string;
                  gameId: string;
                  useHttps: boolean;
                  hosts: string[];
                  addrs: string[];
                  data: string;
              }
            | { err: string } = {
            zone: "",
            data: "",
            gameId: "",
            useHttps: true,
            hosts: [],
            addrs: []
        };

        const region =
            Config.regions[body.region] ?? Config.regions[Config.defaultRegion];
        if (region !== undefined) {
            response.hosts.push(region.address);
            response.addrs.push(region.address);
            response.useHttps = region.https;

            let game = this.games
                .filter((game) => {
                    return game.canJoin() && game.gameModeIdx === body.gameModeIdx;
                })
                .sort((a, b) => {
                    return a.startedTime - b.startedTime;
                })[0];

            if (!game) {
                const mode = Config.modes[body.gameModeIdx];

                if (!mode || !mode.enabled) {
                    response = {
                        err: "Invalid game mode idx"
                    };
                } else {
                    game = await this.newGame({
                        teamMode: mode.teamMode,
                        mapName: mode.mapName
                    });
                }
            }

            if (game && !("err" in response)) {
                response.gameId = game.id;

                const mode = Config.modes[body.gameModeIdx];
                if (mode.teamMode > 1) {
                    let group: Group | undefined;

                    if (body.autoFill) {
                        group = [...game.groups.values()].filter((group) => {
                            return group.autoFill && group.players.length < mode.teamMode;
                        })[0];
                    }

                    if (!group) {
                        group = game.addGroup(
                            randomBytes(20).toString("hex"),
                            body.autoFill
                        );
                    }

                    if (group) {
                        response.data = group.hash;
                    }
                }
            }
        } else {
            this.logger.warn("/api/find_game: Invalid region");
            response = {
                err: "Invalid Region"
            };
        }
        return { res: [response] };
    }

    validateGameId(params: URLSearchParams): false | string {
        //
        // Validate game ID
        //
        const gameId = params.get("gameId");
        if (!gameId) {
            return false;
        }
        if (!this.gamesById.get(gameId)?.canJoin()) {
            return false;
        }
        return gameId;
    }

    onOpen(data: GameSocketData): void {
        const game = this.gamesById.get(data.gameID);
        if (game === undefined) {
            data.closeSocket();
        }
    }

    onMessage(data: GameSocketData, message: ArrayBuffer | Buffer) {
        const game = this.gamesById.get(data.gameID);
        if (!game) {
            data.closeSocket();
            return;
        }
        try {
            game.handleMsg(message, data);
        } catch (e) {
            game.logger.warn("Error parsing message:", e);
        }
    }

    onClose(data: GameSocketData): void {
        const game = this.gamesById.get(data.gameID);
        const player = data.player;
        if (game === undefined || player === undefined) return;
        game.logger.log(`"${player.name}" left`);
        player.disconnected = true;
        if (player.group) player.group.checkPlayers();
        if (player.timeAlive < GameConfig.player.minActiveTime) {
            player.game.playerBarn.removePlayer(player);
        }
    }
}

const server = new Server();

const app = Config.ssl
    ? SSLApp({
          key_file_name: Config.ssl.keyFile,
          cert_file_name: Config.ssl.certFile
      })
    : App();

app.get("/api/site_info", (res) => {
    let aborted = false;
    res.onAborted(() => {
        aborted = true;
    });
    cors(res);
    const data = server.getSiteInfo();
    if (!aborted) {
        res.cork(() => {
            returnJson(res, data);
        });
    }
});
app.post("/api/user/profile", (res, _req) => {
    returnJson(res, server.getUserProfile());
});

app.post("/api/find_game", async (res) => {
    readPostedJSON(
        res,
        async (body: FindGameBody) => {
            try {
                returnJson(res, await server.findGame(body));
            } catch (err) {
                console.error("Find game error:", err);
                returnJson(res, {
                    res: [
                        {
                            err: "Failed finding game"
                        }
                    ]
                });
            }
        },
        () => {
            server.logger.warn("/api/find_game: Error retrieving body");
            returnJson(res, {
                res: [
                    {
                        err: "Error retriving body"
                    }
                ]
            });
        }
    );
});

app.ws("/play", {
    idleTimeout: 30,
    /**
     * Upgrade the connection to WebSocket.
     */
    upgrade(res, req, context) {
        res.onAborted((): void => {});

        const searchParams = new URLSearchParams(req.getQuery());
        const gameID = server.validateGameId(searchParams);
        if (gameID !== false) {
            res.upgrade(
                {
                    gameID
                },
                req.getHeader("sec-websocket-key"),
                req.getHeader("sec-websocket-protocol"),
                req.getHeader("sec-websocket-extensions"),
                context
            );
        } else {
            forbidden(res);
        }
    },

    /**
     * Handle opening of the socket.
     * @param socket The socket being opened.
     */
    open(socket: WebSocket<GameSocketData>) {
        socket.getUserData().sendMsg = (data) => {
            socket.send(data, true, false);
        };
        socket.getUserData().closeSocket = () => {
            socket.close();
        };
        server.onOpen(socket.getUserData());
    },

    /**
     * Handle messages coming from the socket.
     * @param socket The socket in question.
     * @param message The message to handle.
     */
    message(socket: WebSocket<GameSocketData>, message) {
        server.onMessage(socket.getUserData(), message);
    },

    /**
     * Handle closing of the socket.
     * @param socket The socket being closed.
     */
    close(socket: WebSocket<GameSocketData>) {
        server.onClose(socket.getUserData());
    }
});

app.ws("/team_v2", {
    idleTimeout: 30,
    /**
     * Upgrade the connection to WebSocket.
     */
    upgrade(res, req, context) {
        res.onAborted((): void => {});

        res.upgrade(
            {},
            req.getHeader("sec-websocket-key"),
            req.getHeader("sec-websocket-protocol"),
            req.getHeader("sec-websocket-extensions"),
            context
        );
    },

    /**
     * Handle opening of the socket.
     * @param socket The socket being opened.
     */
    open(socket: WebSocket<TeamSocketData>) {
        socket.getUserData().sendMsg = (data) => socket.send(data, false, false);
        socket.getUserData().closeSocket = () => socket.close();
    },

    /**
     * Handle messages coming from the socket.
     * @param socket The socket in question.
     * @param message The message to handle.
     */
    message(socket: WebSocket<TeamSocketData>, message) {
        server.teamMenu.handleMsg(message, socket.getUserData());
    },

    /**
     * Handle closing of the socket.
     * Called if player hits the leave button or if there's an error joining/creating a team
     * @param socket The socket being closed.
     */
    close(socket: WebSocket<TeamSocketData>) {
        const userData = socket.getUserData();
        const room = server.teamMenu.rooms.get(userData.roomUrl);
        if (room) {
            server.teamMenu.removePlayer(userData);
            server.teamMenu.sendRoomState(room);
        }
    }
});

app.listen(Config.host, Config.port, (): void => {
    server.init();

    // setInterval on windows sucks
    // and doesn't give accurate timings
    if (platform() === "win32") {
        new NanoTimer().setInterval(
            () => {
                server.update();
            },
            "",
            `${1000 / Config.gameTps}m`
        );

        new NanoTimer().setInterval(
            () => {
                server.netSync();
            },
            "",
            `${1000 / Config.netSyncTps}m`
        );
    } else {
        setInterval(() => {
            server.update();
        }, 1000 / Config.gameTps);

        setInterval(() => {
            server.netSync();
        }, 1000 / Config.netSyncTps);
    }
});

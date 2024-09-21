import { type ChildProcess, fork } from "child_process";
import { randomBytes } from "crypto";
import type { WebSocket } from "uWebSockets.js";
import type { TeamMode } from "../../../shared/gameConfig";
import { Config } from "../config";
import type { FindGameBody, GameSocketData } from "../gameServer";
import { Logger } from "../utils/logger";
import type {
    FindGameResponse,
    GameData,
    GameManager,
    ServerGameConfig,
} from "./gameManager";

let path: string;
let args: string[];
if (process.env.NODE_ENV === "production") {
    path = "dist/server/src/game/gameProcess.js";
    args = ["--enable-source-maps"];
} else {
    path = "src/game/gameProcess.ts";
    args = [];
}

export enum ProcessMsgType {
    Create,
    Created,
    KeepAlive,
    UpdateData,
    AddJoinToken,
    SocketMsg,
    SocketClose,
}

export interface CreateGameMsg {
    type: ProcessMsgType.Create;
    config: ServerGameConfig;
    id: string;
}

export interface GameCreatedMsg {
    type: ProcessMsgType.Created;
}

export interface KeepAliveMsg {
    type: ProcessMsgType.KeepAlive;
}

export interface UpdateDataMsg extends GameData {
    type: ProcessMsgType.UpdateData;
}

export interface AddJoinTokenMsg {
    type: ProcessMsgType.AddJoinToken;
    token: string;
    autoFill: boolean;
    playerCount: number;
}

export interface SocketMsgsMsg {
    type: ProcessMsgType.SocketMsg;
    msgs: Array<{
        socketId: string;
        data: ArrayBuffer;
    }>;
}

export interface SocketCloseMsg {
    type: ProcessMsgType.SocketClose;
    socketId: string;
}

export type ProcessMsg =
    | CreateGameMsg
    | GameCreatedMsg
    | KeepAliveMsg
    | UpdateDataMsg
    | AddJoinTokenMsg
    | SocketMsgsMsg
    | SocketCloseMsg;

class GameProcess implements GameData {
    process: ChildProcess;

    canJoin = true;
    gameModeIdx = 0;
    teamMode: TeamMode = 1;
    id = "";
    aliveCount = 0;
    startedTime = 0;
    stopped = true;

    manager: GameProcessManager;

    onCreatedCbs: Array<(_game: typeof this) => void> = [];

    lastMsgTime = Date.now();

    killed = false;

    stoppedTime = Date.now();

    constructor(manager: GameProcessManager) {
        this.manager = manager;
        this.process = fork(path, args, {
            serialization: "advanced",
        });

        this.process.on("message", (msg: ProcessMsg) => {
            if (msg.type) {
                this.lastMsgTime = Date.now();
            }

            switch (msg.type) {
                case ProcessMsgType.Created:
                    for (const cb of this.onCreatedCbs) {
                        cb(this);
                    }
                    this.stopped = false;
                    this.onCreatedCbs.length = 0;
                    break;
                case ProcessMsgType.UpdateData:
                    this.canJoin = msg.canJoin;
                    this.gameModeIdx = msg.gameModeIdx;
                    this.teamMode = msg.teamMode;
                    this.id = msg.id;
                    this.aliveCount = msg.aliveCount;
                    this.startedTime = msg.startedTime;
                    this.stopped = msg.stopped;
                    if (!this.stopped) {
                        this.stoppedTime = Date.now();
                    }
                    break;
                case ProcessMsgType.SocketMsg:
                    for (let i = 0; i < msg.msgs.length; i++) {
                        const socketMsg = msg.msgs[i];
                        this.manager.sockets
                            .get(socketMsg.socketId)
                            ?.send(socketMsg.data, true, false);
                    }
                    break;
                case ProcessMsgType.SocketClose:
                    this.manager.sockets.get(msg.socketId)?.close();
                    break;
            }
        });
    }

    send(msg: ProcessMsg) {
        this.process.send(msg);
    }

    create(id: string, config: ServerGameConfig) {
        this.send({
            type: ProcessMsgType.Create,
            id,
            config,
        });
    }

    addJoinToken(token: string, autoFill: boolean, playerCount: number) {
        this.send({
            type: ProcessMsgType.AddJoinToken,
            token,
            autoFill,
            playerCount,
        });
    }

    handleMsg(data: ArrayBuffer, socketId: string) {
        this.send({
            type: ProcessMsgType.SocketMsg,
            msgs: [
                {
                    socketId,
                    data,
                },
            ],
        });
    }

    handleSocketClose(socketId: string) {
        this.send({
            type: ProcessMsgType.SocketClose,
            socketId,
        });
    }
}

/**
 * Game manager that runs all game in the same process
 * Used for dev server
 */
export class GameProcessManager implements GameManager {
    readonly sockets = new Map<string, WebSocket<GameSocketData>>();

    readonly gamesById = new Map<string, GameProcess>();
    readonly games: GameProcess[] = [];

    readonly logger = new Logger("Game Process Manager");

    constructor() {
        this.newGame(Config.modes[0]);

        process.on("beforeExit", () => {
            for (const game of this.games) {
                game.process.kill();
            }
        });

        setInterval(() => {
            for (const game of this.games) {
                game.send({
                    type: ProcessMsgType.KeepAlive,
                });

                if (Date.now() - game.lastMsgTime > 10000) {
                    this.logger.log(
                        `Game ${game.id} did not send a message in more 10 seconds, killing`,
                    );
                    this.killGame(game);
                } else if (game.stopped && Date.now() - game.stoppedTime > 60000) {
                    this.logger.log(
                        `Game ${game.id} stopped more than a minute ago, killing`,
                    );
                    this.killGame(game);
                }
            }
        }, 2);
    }

    getPlayerCount(): number {
        return this.games.reduce((a, b) => {
            return a + b.aliveCount;
        }, 0);
    }

    async newGame(config: ServerGameConfig): Promise<GameProcess> {
        let game: GameProcess | undefined;

        for (let i = 0; i < this.games.length; i++) {
            const proc = this.games[i];
            if (proc.stopped) {
                game = proc;
                break;
            }
        }

        if (!game) {
            game = new GameProcess(this);
            this.games.push(game);

            game.process.on("exit", () => {
                this.killGame(game!);
            });
            game.process.on("close", () => {
                this.killGame(game!);
            });
            game.process.on("disconnect", () => {
                this.killGame(game!);
            });
        } else {
            this.gamesById.delete(game.id);
        }

        const id = randomBytes(20).toString("hex");

        this.gamesById.set(id, game);

        game.id = id;

        game.create(id, config);

        return game;
    }

    killGame(game: GameProcess): void {
        // send SIGTERM, if still hasn't terminated after 5 seconds, send SIGKILL >:3
        game.process.kill();
        setTimeout(() => {
            if (!game.process.killed) {
                game.process.kill("SIGKILL");
            }
        }, 5000);

        const idx = this.games.indexOf(game);
        if (idx !== -1) {
            this.games.splice(idx, 1);
        }
        this.gamesById.delete(game.id);
        game.killed = true;
    }

    getById(id: string): GameData | undefined {
        return this.gamesById.get(id);
    }

    async findGame(body: FindGameBody): Promise<FindGameResponse> {
        let game = this.games
            .filter((proc) => {
                return (
                    proc.gameModeIdx === body.gameModeIdx &&
                    (proc.canJoin || proc.stopped)
                );
            })
            .sort((a, b) => {
                return a.startedTime - b.startedTime;
            })[0];

        const mode = Config.modes[body.gameModeIdx];

        const joinToken = randomBytes(20).toString("hex");

        if (!game) {
            game = await this.newGame({
                teamMode: mode.teamMode,
                mapName: mode.mapName,
            });
        }

        if (game.stopped) {
            return new Promise((resolve) => {
                game.onCreatedCbs.push((game) => {
                    game.addJoinToken(joinToken, body.autoFill, body.playerCount);
                    resolve({
                        gameId: game.id,
                        data: joinToken,
                    });
                });
            });
        }

        game.addJoinToken(joinToken, body.autoFill, body.playerCount);

        return {
            gameId: game.id,
            data: joinToken,
        };
    }

    onOpen(socketId: string, socket: WebSocket<GameSocketData>): void {
        const data = socket.getUserData();
        const game = this.gamesById.get(data.gameId);
        if (game === undefined) {
            socket.close();
            return;
        }
        this.sockets.set(socketId, socket);
    }

    onMsg(socketId: string, msg: ArrayBuffer): void {
        const data = this.sockets.get(socketId)?.getUserData();
        if (!data) return;
        this.gamesById.get(data.gameId)?.handleMsg(msg, socketId);
    }

    onClose(socketId: string) {
        const data = this.sockets.get(socketId)?.getUserData();
        if (!data) return;
        this.gamesById.get(data.gameId)?.handleSocketClose(socketId);
        this.sockets.delete(socketId);
    }
}

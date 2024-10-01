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

/**
 * Used for server to send websocket msgs to game
 * And game to send websocket msgs to clients
 * msgs is an array to batch all msgs created in the same game net tick
 * into the same send call
 */
export interface SocketMsgsMsg {
    type: ProcessMsgType.SocketMsg;
    msgs: Array<{
        socketId: string;
        data: ArrayBuffer;
    }>;
}

/**
 * Sent by the server to the game when the socket is closed
 * Or by the game to the server when the game wants to close the socket
 */
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

    onCreatedCbs: Array<(_proc: typeof this) => void> = [];

    lastMsgTime = Date.now();

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
                    if (this.id !== msg.id) {
                        this.manager.processById.delete(this.id);
                        this.id = msg.id;
                        this.manager.processById.set(this.id, this);
                    }
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

    readonly processById = new Map<string, GameProcess>();
    readonly processes: GameProcess[] = [];

    readonly logger = new Logger("Game Process Manager");

    constructor() {
        this.newGame(Config.modes[0]);

        process.on("beforeExit", () => {
            for (const gameProc of this.processes) {
                gameProc.process.kill();
            }
        });

        setInterval(() => {
            for (const gameProc of this.processes) {
                gameProc.send({
                    type: ProcessMsgType.KeepAlive,
                });

                if (Date.now() - gameProc.lastMsgTime > 10000) {
                    this.logger.log(
                        `Game ${gameProc.id} did not send a message in more 10 seconds, killing`,
                    );
                    this.killProcess(gameProc);
                } else if (
                    gameProc.stopped &&
                    Date.now() - gameProc.stoppedTime > 60000
                ) {
                    this.logger.log(
                        `Game ${gameProc.id} stopped more than a minute ago, killing`,
                    );
                    this.killProcess(gameProc);
                }
            }
        }, 5000);
    }

    getPlayerCount(): number {
        return this.processes.reduce((a, b) => {
            return a + b.aliveCount;
        }, 0);
    }

    async newGame(config: ServerGameConfig): Promise<GameProcess> {
        let gameProc: GameProcess | undefined;

        for (let i = 0; i < this.processes.length; i++) {
            const p = this.processes[i];
            if (p.stopped) {
                gameProc = p;
                break;
            }
        }

        if (!gameProc) {
            gameProc = new GameProcess(this);
            this.processes.push(gameProc);

            gameProc.process.on("exit", () => {
                this.killProcess(gameProc!);
            });
            gameProc.process.on("close", () => {
                this.killProcess(gameProc!);
            });
            gameProc.process.on("disconnect", () => {
                this.killProcess(gameProc!);
            });
        } else {
            this.processById.delete(gameProc.id);
        }

        const id = randomBytes(20).toString("hex");

        this.processById.set(id, gameProc);

        gameProc.id = id;

        gameProc.create(id, config);

        return gameProc;
    }

    killProcess(gameProc: GameProcess): void {
        // send SIGTERM, if still hasn't terminated after 5 seconds, send SIGKILL >:3
        gameProc.process.kill();
        setTimeout(() => {
            if (!gameProc.process.killed) {
                gameProc.process.kill("SIGKILL");
            }
        }, 5000);

        const idx = this.processes.indexOf(gameProc);
        if (idx !== -1) {
            this.processes.splice(idx, 1);
        }
        this.processById.delete(gameProc.id);
    }

    getById(id: string): GameData | undefined {
        return this.processById.get(id);
    }

    async findGame(body: FindGameBody): Promise<FindGameResponse> {
        let game = this.processes
            .filter((proc) => {
                return proc.gameModeIdx === body.gameModeIdx && proc.canJoin;
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

        // if the game is not running
        // wait for it to be created to send the find game response
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
        const proc = this.processById.get(data.gameId);
        if (proc === undefined) {
            socket.close();
            return;
        }
        this.sockets.set(socketId, socket);
    }

    onMsg(socketId: string, msg: ArrayBuffer): void {
        const data = this.sockets.get(socketId)?.getUserData();
        if (!data) return;
        this.processById.get(data.gameId)?.handleMsg(msg, socketId);
    }

    onClose(socketId: string) {
        const data = this.sockets.get(socketId)?.getUserData();
        if (!data) return;
        this.processById.get(data.gameId)?.handleSocketClose(socketId);
        this.sockets.delete(socketId);
    }
}

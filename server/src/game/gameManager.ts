import { randomBytes } from "crypto";
import { platform } from "os";
import NanoTimer from "nanotimer";
import type { WebSocket } from "uWebSockets.js";
import type { MapDefs } from "../../../shared/defs/mapDefs";
import type { TeamMode } from "../../../shared/gameConfig";
import { Config } from "../config";
import type { FindGameBody, GameSocketData } from "../gameServer";
import { Game } from "./game";

export interface ServerGameConfig {
    readonly mapName: keyof typeof MapDefs;
    readonly teamMode: TeamMode;
}

export interface GameData {
    id: string;
    teamMode: TeamMode;
    mapName: string;
    canJoin: boolean;
    aliveCount: number;
    startedTime: number;
    stopped: boolean;
}

export interface FindGameResponse {
    gameId: string;
    data: string;
}

export abstract class GameManager {
    abstract sockets: Map<string, WebSocket<GameSocketData>>;

    abstract getPlayerCount(): number;

    abstract getById(id: string): GameData | undefined;

    abstract findGame(body: FindGameBody): Promise<FindGameResponse>;

    abstract onOpen(socketId: string, socket: WebSocket<GameSocketData>): void;

    abstract onMsg(socketId: string, msg: ArrayBuffer): void;

    abstract onClose(socketId: string): void;
}

/**
 * Game manager that runs all game in the same process
 * Used for dev server
 */
export class SingleThreadGameManager implements GameManager {
    readonly sockets = new Map<string, WebSocket<GameSocketData>>();

    readonly gamesById = new Map<string, Game>();
    readonly games: Game[] = [];

    constructor() {
        // setInterval on windows sucks
        // and doesn't give accurate timings
        if (platform() === "win32") {
            new NanoTimer().setInterval(
                () => {
                    this.update();
                },
                "",
                `${1000 / Config.gameTps}m`,
            );

            new NanoTimer().setInterval(
                () => {
                    this.netSync();
                },
                "",
                `${1000 / Config.netSyncTps}m`,
            );
        } else {
            setInterval(() => {
                this.update();
            }, 1000 / Config.gameTps);

            setInterval(() => {
                this.netSync();
            }, 1000 / Config.netSyncTps);
        }

        this.newGame(Config.modes[0]);
    }

    update(): void {
        for (let i = 0; i < this.games.length; i++) {
            const game = this.games[i];
            if (game.stopped) {
                this.games.splice(i, 1);
                i--;
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

    getPlayerCount(): number {
        return this.games.reduce((a, b) => {
            return (
                a +
                (b ? b.playerBarn.livingPlayers.filter((p) => !p.disconnected).length : 0)
            );
        }, 0);
    }

    async newGame(config: ServerGameConfig): Promise<Game> {
        const id = randomBytes(20).toString("hex");
        const game = new Game(
            id,
            config,
            (id, data) => {
                this.sockets.get(id)?.send(data, true, false);
            },
            (id) => {
                const socket = this.sockets.get(id);
                if (socket && !socket.getUserData().closed) {
                    socket.close();
                }
            },
        );
        await game.init();
        this.games.push(game);
        this.gamesById.set(id, game);
        return game;
    }

    getById(id: string): GameData | undefined {
        return this.gamesById.get(id);
    }

    async findGame(body: FindGameBody): Promise<FindGameResponse> {
        const config = Config.modes[body.gameModeIdx];

        let game = this.games
            .filter((game) => {
                return (
                    game.canJoin &&
                    game.teamMode === config.teamMode &&
                    game.mapName === config.mapName
                );
            })
            .sort((a, b) => {
                return a.startedTime - b.startedTime;
            })[0];

        const mode = Config.modes[body.gameModeIdx];
        if (!game) {
            game = await this.newGame({
                teamMode: mode.teamMode,
                mapName: mode.mapName,
            });
        }

        const id = randomBytes(20).toString("hex");
        game.addJoinToken(id, body.autoFill, body.playerCount);

        return {
            gameId: game.id,
            data: id,
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

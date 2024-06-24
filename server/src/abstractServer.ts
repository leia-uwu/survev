import { type URLSearchParams } from "url";
import { Config } from "./config";
import { Game, type ServerGameConfig } from "./game";
import { type Player } from "./objects/player";
import { Logger } from "./utils/logger";
import { version } from "../../package.json";
import { randomBytes } from "crypto";
import { TeamMenu } from "./teamMenu";
import { type Group } from "./group";

export interface PlayerContainer {
    readonly gameID: string
    sendMsg: (msg: ArrayBuffer | Uint8Array) => void
    closeSocket: () => void
    player?: Player
}

export interface TeamMenuPlayerContainer {
    sendMsg: (response: string) => void
    close: () => void
    roomUrl: string
}

export interface FindGameBody {
    region: string
    zones: string[]
    version: number
    playerCount: number
    autoFill: boolean
    gameModeIdx: number
}

export abstract class AbstractServer {
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

            const perfString = `Memory usage: ${Math.round(memoryUsage / 1024 / 1024 * 100) / 100} MB`;

            this.logger.log(perfString);
        }, 60000);
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

    newGame(config: ServerGameConfig): Game {
        const id = randomBytes(20).toString("hex");
        const game = new Game(id, config);
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

    findGame(body: FindGameBody) {
        let response: {
            zone: string
            gameId: string
            useHttps: boolean
            hosts: string[]
            addrs: string[]
            data: string
        } | { err: string } = {
            zone: "",
            data: "",
            gameId: "",
            useHttps: true,
            hosts: [],
            addrs: []
        };

        const region = (Config.regions[body.region] ?? Config.regions[Config.defaultRegion]);
        if (region !== undefined) {
            response.hosts.push(region.address);
            response.addrs.push(region.address);
            response.useHttps = region.https;

            let game = this.games.filter(game => {
                return game.canJoin() && game.gameModeIdx === body.gameModeIdx;
            }).sort((a, b) => {
                return a.startedTime - b.startedTime;
            })[0];

            if (!game) {
                const mode = Config.modes[body.gameModeIdx];

                if (!mode) {
                    response = {
                        err: "Invalid game mode idx"
                    };
                } else {
                    game = this.newGame({
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
                        group = [...game.groups.values()].filter(group => {
                            return group.autoFill &&
                                group.players.length < mode.teamMode;
                        })[0];
                    }

                    if (!group) {
                        group = game.addGroup(randomBytes(20).toString("hex"), true);
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

    onOpen(data: PlayerContainer): void {
        const game = this.gamesById.get(data.gameID);
        if (game === undefined) {
            data.closeSocket();
        }
    }

    onMessage(data: PlayerContainer, message: ArrayBuffer | Buffer) {
        const game = this.gamesById.get(data.gameID);
        if (!game) {
            data.closeSocket();
            return;
        }
        try {
            game.handleMsg(message, data);
        } catch (e) {
            console.warn("Error parsing message:", e);
        }
    }

    onClose(data: PlayerContainer): void {
        const game = this.gamesById.get(data.gameID);
        const player = data.player;
        if (game === undefined || player === undefined) return;
        game.logger.log(`"${player.name}" left`);
        player.disconnected = true;
        if (player.timeAlive < 5) {
            player.game.playerBarn.removePlayer(player);
        }
    }
}

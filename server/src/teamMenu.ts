import type { Hono } from "hono";
import type { UpgradeWebSocket, WSContext } from "hono/ws";
import type { FindGameError } from "../../shared/types/api";
import {
    type ClientRoomData,
    type ClientToServerTeamMsg,
    type RoomData,
    type ServerToClientTeamMsg,
    type TeamErrorMsg,
    type TeamMenuErrorType,
    type TeamMenuPlayer,
    type TeamPlayGameMsg,
    zTeamClientMsg,
} from "../../shared/types/team";
import { assert } from "../../shared/utils/util";
import type { ApiServer } from "./api/apiServer";
import { Config } from "./config";
import {
    HTTPRateLimit,
    WebSocketRateLimit,
    getHonoIp,
    isBehindProxy,
    validateUserName,
} from "./utils/serverHelpers";

interface SocketData {
    rateLimit: Record<symbol, number>;
    player: Player;
    ip: string;
}

class Player {
    room?: Room;

    name = "Player";

    inGame = false;

    get isLeader() {
        // first player is always leader
        return !!this.room && this.room.players[0] == this;
    }

    get playerId() {
        return this.room ? this.room.players.indexOf(this) : -1;
    }

    get data(): TeamMenuPlayer {
        return {
            name: this.name,
            inGame: this.inGame,
            isLeader: this.isLeader,
            playerId: this.playerId,
        };
    }

    lastMsgTime = Date.now();

    disconnectTimeout: ReturnType<typeof setTimeout>;

    constructor(
        public socket: WSContext<SocketData>,
        public teamMenu: TeamMenu,
    ) {
        // disconnect if didn't join a room in 5 seconds
        this.disconnectTimeout = setTimeout(() => {
            if (!this.room) {
                this.socket.close();
            }
        }, 5000);
    }

    setName(name: string) {
        this.name = validateUserName(name);
    }

    send<T extends ServerToClientTeamMsg["type"]>(
        type: T,
        data: (ServerToClientTeamMsg & { type: T })["data"],
    ) {
        this.socket.send(
            JSON.stringify({
                type,
                data,
            }),
        );
    }

    onMsg(msg: ClientToServerTeamMsg) {
        if (!this.room) return;

        switch (msg.type) {
            case "changeName": {
                this.setName(msg.data.name);
                this.room.sendState();
                break;
            }
            case "keepAlive": {
                this.lastMsgTime = Date.now();
                this.send("keepAlive", {});
                break;
            }
            case "gameComplete": {
                this.inGame = false;
                this.room.sendState();
                break;
            }
            case "setRoomProps": {
                if (!this.isLeader) break;
                this.room.setProps(msg.data);
                break;
            }
            case "kick": {
                if (!this.isLeader) break;
                this.room.kick(msg.data.playerId);
                break;
            }
            case "playGame": {
                if (!this.isLeader) break;
                this.room.findGame(msg.data);
                break;
            }
        }
    }
}

function allowedGameModeIdxs() {
    return Config.modes
        .map((_, i) => i)
        .filter((i) => {
            const mode = Config.modes[i];
            return mode.enabled && mode.teamMode > 1;
        });
}

class Room {
    players: Player[] = [];

    data: RoomData = {
        roomUrl: "",
        findingGame: false,
        lastError: "",
        region: "",
        autoFill: true,
        enabledGameModeIdxs: allowedGameModeIdxs(),
        gameModeIdx: 1,
        maxPlayers: 4,
    };

    constructor(
        public teamMenu: TeamMenu,
        public id: string,
        initialData: ClientRoomData,
    ) {
        this.data.roomUrl = `#${id}`;

        this.setProps(initialData);
    }

    addPlayer(player: Player) {
        if (this.players.length >= this.data.maxPlayers) return;

        this.players.push(player);
        player.room = this;

        clearTimeout(player.disconnectTimeout);

        this.sendState();
    }

    setProps(props: ClientRoomData) {
        let region = props.region;
        if (!(region in Config.regions)) {
            region = Object.keys(Config.regions)[0];
        }
        this.data.region = region;

        let gameModeIdx = props.gameModeIdx;

        if (!this.data.enabledGameModeIdxs.includes(gameModeIdx)) {
            // we don't allow creating teams if there's no valid team mode
            // so this will never be -1
            gameModeIdx = Config.modes.findIndex(
                (mode) => mode.enabled && mode.teamMode > 1,
            );
        }

        this.data.gameModeIdx = gameModeIdx;

        this.data.maxPlayers = Config.modes[gameModeIdx].teamMode;

        // kick players that don't fit on the new max players
        while (this.players.length > this.data.maxPlayers) {
            this.kick(this.players.length - 1);
        }

        this.sendState();
    }

    kick(playerId: number) {
        const player = this.players[playerId];
        if (!player) return;

        player.send("kicked", {});

        this.removePlayer(player);
    }

    removePlayer(player: Player) {
        const idx = this.players.indexOf(player);
        if (idx === -1) return;

        this.players.splice(idx, 1);
        player.room = undefined;
        player.socket.close();

        this.sendState();

        if (!this.players.length) {
            this.teamMenu.removeRoom(this);
        }
    }

    findGameCooldown = 0;

    async findGame(data: TeamPlayGameMsg["data"]) {
        if (this.data.findingGame) return;
        this.data.findingGame = true;
        this.sendState();

        let region = data.region;
        if (!(region in Config.regions)) {
            region = Object.keys(Config.regions)[0];
        }
        this.data.region = region;

        const res = await this.teamMenu.server.findGame({
            playerCount: this.players.length,
            gameModeIdx: this.data.gameModeIdx,
            autoFill: this.data.autoFill,
            region: region,
            zones: data.zones,
            version: data.version,
        });

        if ("err" in res) {
            const errToTeamMenuErr: Partial<Record<FindGameError, TeamMenuErrorType>> = {
                full: "find_game_full",
                invalid_protocol: "find_game_invalid_protocol",
            };

            this.data.lastError = errToTeamMenuErr[res.err] || "find_game_error";
            this.sendState();
            // 1 second cooldown on error
            this.findGameCooldown = Date.now() + 1000;
            return;
        }

        this.findGameCooldown = Date.now() + 5000;

        const joinData = res.res[0];
        if (!joinData) return;

        this.data.lastError = "";

        for (const player of this.players) {
            player.inGame = true;
            player.send("joinGame", joinData);
        }

        this.sendState();
    }

    sendState() {
        const players = this.players.map((p) => p.data);

        for (const player of this.players) {
            player.send("state", {
                localPlayerId: player.playerId,
                room: this.data,
                players,
            });
        }
    }
}

const alphanumerics = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
function randomString(len: number) {
    let str = "";
    let i = 0;
    while (i < len) {
        str += alphanumerics.charAt(Math.floor(Math.random() * alphanumerics.length));
        i++;
    }
    return `${str}`;
}

export class TeamMenu {
    rooms = new Map<string, Room>();

    constructor(public server: ApiServer) {
        setInterval(() => {
            for (const room of this.rooms.values()) {
                // just making sure ig
                if (!room.players.length) {
                    this.removeRoom(room);
                    continue;
                }
                if (room.data.findingGame && room.findGameCooldown < Date.now()) {
                    room.data.findingGame = false;
                    room.sendState();
                }

                // kick players that haven't sent a keep alive msg in over a minute
                // client sends it every 45 seconds
                for (const player of room.players) {
                    if (player.lastMsgTime < Date.now() - 60 * 1000) {
                        room.removePlayer(player);
                    }
                }
            }
        }, 1000);
    }

    init(app: Hono, upgradeWebSocket: UpgradeWebSocket) {
        const teamMenu = this;

        const httpRateLimit = new HTTPRateLimit(1, 2000);
        const wsRateLimit = new WebSocketRateLimit(5, 1000, 5);

        app.get(
            "/team_v2",
            upgradeWebSocket(async (c) => {
                const ip = getHonoIp(c, Config.gameServer.proxyIPHeader);

                let closeReason = "";

                if (
                    !ip ||
                    httpRateLimit.isRateLimited(ip) ||
                    wsRateLimit.isIpRateLimited(ip)
                ) {
                    closeReason = "rate_limited";
                }

                if (!closeReason && (await isBehindProxy(ip!))) {
                    closeReason = "behind_proxy";
                }

                wsRateLimit.ipConnected(ip!);

                return {
                    onOpen(_event, ws) {
                        if (closeReason) {
                            ws.send(
                                JSON.stringify({
                                    type: "error",
                                    data: {
                                        type: closeReason as TeamMenuErrorType,
                                    },
                                } satisfies TeamErrorMsg),
                            );
                            ws.close();
                            return;
                        }

                        teamMenu.onOpen(ws as WSContext<SocketData>, ip!);
                    },

                    onMessage(event, ws) {
                        const data = ws.raw! as SocketData;
                        if (wsRateLimit.isRateLimited(data.rateLimit)) {
                            ws.close();
                            return;
                        }

                        try {
                            teamMenu.onMsg(
                                ws as WSContext<SocketData>,
                                event.data as string,
                            );
                        } catch {
                            ws.close();
                        }
                    },

                    onClose: (_event, ws) => {
                        teamMenu.onClose(ws as WSContext<SocketData>);

                        const data = ws.raw! as SocketData;
                        wsRateLimit.ipDisconnected(data.ip);
                    },
                };
            }),
        );
    }

    onOpen(ws: WSContext<SocketData>, ip: string) {
        const player = new Player(ws, this);
        ws.raw = {
            ip,
            rateLimit: {},
            player,
        };
    }

    async onMsg(ws: WSContext<SocketData>, data: string) {
        let msg: ClientToServerTeamMsg;
        try {
            assert(data.length < 1024);
            msg = JSON.parse(data);
            zTeamClientMsg.parse(msg);
        } catch {
            ws.close();
            return;
        }

        const player = ws.raw?.player;
        // i really don't think this is necessary but /shrug
        if (!player) {
            ws.close();
            return;
        }

        // handle creation and joining messages
        // other messages are handled on the player class
        if (!player.room) {
            switch (msg.type) {
                case "create": {
                    // don't allow creating a team if there's no team mode enabled
                    if (!allowedGameModeIdxs().length) {
                        player.send("error", { type: "create_failed" });
                        break;
                    }

                    player.setName(msg.data.playerData.name);

                    const room = this.createRoom(msg.data.roomData);
                    room.addPlayer(player);

                    break;
                }
                case "join": {
                    const room = this.rooms.get(msg.data.roomUrl);
                    if (!room) {
                        player.send("error", { type: "join_not_found" });
                        break;
                    }

                    if (room.players.length >= room.data.maxPlayers) {
                        player.send("error", { type: "join_full" });
                        break;
                    }

                    room.addPlayer(player);
                }
            }
        }

        // player.room is set on room.addPlayer
        // if we don't have a room at this point it meant both creation and joining failed
        // so close the socket
        if (!player.room) {
            ws.close();
            return;
        }

        // handle messages for when the player is already inside a room
        player.onMsg(msg);
    }

    onClose(ws: WSContext<SocketData>) {
        const player = ws.raw?.player;

        if (!player) {
            ws.close();
            return;
        }

        // meh just to make sure we dont keep timeouts with references hanging
        // not like it matters because its 5 seconds...
        clearTimeout(player.disconnectTimeout);

        if (player.room) {
            player.room.removePlayer(player);
        }
    }

    createRoom(data: ClientRoomData) {
        let roomUrl = randomString(4);
        while (this.rooms.has(roomUrl)) {
            roomUrl = randomString(4);
        }

        const room = new Room(this, roomUrl, data);
        this.rooms.set(roomUrl, room);
        return room;
    }

    removeRoom(room: Room) {
        this.rooms.delete(room.id);
    }
}

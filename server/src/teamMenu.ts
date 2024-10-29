import type { Hono } from "hono";
import { getConnInfo } from "hono/bun";
import type { UpgradeWebSocket, WSContext } from "hono/ws";
import type {
    ClientToServerTeamMsg,
    RoomData,
    ServerToClientTeamMsg,
    TeamErrorMsg,
    TeamMenuPlayer,
    TeamStateMsg,
} from "../../shared/net/team";
import { math } from "../../shared/utils/math";
import { assert } from "../../shared/utils/util";
import type { ApiServer } from "./api/apiServer";
import { Config } from "./config";
import {
    HTTPRateLimit,
    WebSocketRateLimit,
    checkForBadWords,
} from "./utils/serverHelpers";

export interface TeamSocketData {
    roomUrl: string;
    rateLimit: Record<symbol, number>;
    ip: string;
    closeOnOpen: boolean;
}

interface RoomPlayer extends TeamMenuPlayer {
    socket: WSContext<TeamSocketData>;
}

export interface Room {
    roomData: RoomData;
    players: RoomPlayer[];
}

type ErrorType =
    | "join_full"
    | "join_not_found"
    | "create_failed"
    | "join_failed"
    | "join_game_failed"
    | "lost_conn"
    | "find_game_error"
    | "find_game_full"
    | "find_game_invalid_protocol"
    | "kicked";

function teamErrorMsg(type: ErrorType): TeamErrorMsg {
    return {
        type: "error",
        data: {
            type,
        },
    };
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

    constructor(public server: ApiServer) {}

    init(app: Hono, upgradeWebSocket: UpgradeWebSocket) {
        const teamMenu = this;

        const httpRateLimit = new HTTPRateLimit(1, 2000);
        const wsRateLimit = new WebSocketRateLimit(5, 1000, 10);

        app.get(
            "/team_v2",
            (upgradeWebSocket as UpgradeWebSocket<TeamSocketData>)((c) => {
                const info = getConnInfo(c);
                const ip = info.remote.address;

                let closeOnOpen = false;
                if (
                    !ip ||
                    httpRateLimit.isRateLimited(ip) ||
                    wsRateLimit.isIpRateLimited(ip)
                ) {
                    closeOnOpen = true;
                }

                wsRateLimit.ipConnected(ip!);
                return {
                    onOpen(_evt, ws: WSContext<TeamSocketData>) {
                        const userData = {
                            ip,
                            rateLimit: {},
                        } as TeamSocketData;
                        ws.raw = userData;
                        if (closeOnOpen) {
                            ws.close();
                        }
                    },
                    onMessage(event, ws: WSContext<TeamSocketData>) {
                        const userData = ws.raw!;
                        if (wsRateLimit.isRateLimited(userData.rateLimit)) {
                            ws.close();
                            return;
                        }
                        teamMenu.handleMsg(event.data as string, ws);
                    },
                    onClose: (_event, ws: WSContext<TeamSocketData>) => {
                        const userData = ws.raw!;
                        const room = teamMenu.rooms.get(userData.roomUrl);
                        if (room) {
                            teamMenu.removePlayer(ws);
                            teamMenu.sendRoomState(room);
                        }
                        wsRateLimit.ipDisconnected(userData.ip);
                    },
                };
            }),
        );
    }

    addRoom(roomUrl: string, initialRoomData: RoomData, roomLeader: RoomPlayer) {
        const enabledGameModeIdxs = Config.modes
            .slice(1)
            .filter((m) => m.enabled)
            .map((m) => m.teamMode / 2);
        const gameModeIdx = enabledGameModeIdxs.includes(initialRoomData.gameModeIdx)
            ? initialRoomData.gameModeIdx
            : 3 - initialRoomData.gameModeIdx;

        const value = {
            roomData: {
                roomUrl,
                region: initialRoomData.region,
                gameModeIdx: gameModeIdx,
                enabledGameModeIdxs: enabledGameModeIdxs,
                autoFill: initialRoomData.autoFill,
                findingGame: initialRoomData.findingGame,
                lastError: initialRoomData.lastError,
                maxPlayers: math.clamp(gameModeIdx * 2, 2, 4),
            },
            players: [roomLeader],
        };
        this.rooms.set(roomUrl, value);
        return value;
    }

    /**
     * removes player from all necessary data structures (room, idToSocketSend map, id allocator)
     */
    removePlayer(ws: WSContext<TeamSocketData>): void {
        const room = this.rooms.get(ws.raw!.roomUrl)!;

        const pToRemove = room.players.find((p) => p.socket === ws)!;
        const pToRemoveIndex = room.players.indexOf(pToRemove);
        room.players.splice(pToRemoveIndex, 1);

        if (room.players.length == 0) {
            this.rooms.delete(ws.raw!.roomUrl);
            return;
        }

        // if leader leaves, make next player in array the new leader
        if (pToRemove.isLeader) {
            room.players[0].isLeader = true;
        }

        // send the new room state to all remaining players
        this.sendRoomState(room);
    }

    /**
     * @param socket player to send the response to
     */
    sendResponse(
        response: ServerToClientTeamMsg,
        socket: WSContext<TeamSocketData>,
    ): void {
        socket.send(JSON.stringify(response));
    }

    /**
     * @param players players to send the message to
     */
    sendResponses(response: ServerToClientTeamMsg, players: RoomPlayer[]): void {
        for (const player of players) {
            this.sendResponse(response, player.socket);
        }
    }

    /**
     * the only properties that can change are: region, gameModeIdx, autoFill, and maxPlayers (by virtue of gameModeIdx)
     */
    modifyRoom(newRoomData: RoomData, room: Room): void {
        room.roomData.gameModeIdx = newRoomData.gameModeIdx;
        room.roomData.maxPlayers = math.clamp(room.roomData.gameModeIdx * 2, 2, 4);
        room.roomData.autoFill = newRoomData.autoFill;
        room.roomData.region = newRoomData.region;
    }

    sendRoomState(room: Room) {
        for (let i = 0; i < room.players.length; i++) {
            const player = room.players[i];
            const msg: TeamStateMsg = {
                type: "state",
                data: {
                    localPlayerId: room.players.indexOf(player),
                    room: room.roomData,
                    players: room.players.map((player, id) => {
                        return {
                            name: player.name,
                            playerId: id,
                            isLeader: player.isLeader,
                            inGame: player.inGame,
                        };
                    }),
                },
            };

            player.socket.send(JSON.stringify(msg));
        }
    }

    cleanUserName(name: string): string {
        if (!name || typeof name !== "string") return "Player";
        name = name.trim();
        if (checkForBadWords(name) || !name || name.length > 16) {
            return "Player";
        }
        return name;
    }

    validateMsg(msg: ClientToServerTeamMsg) {
        assert(typeof msg.type === "string");

        function validateRoomData(data: RoomData) {
            assert(typeof data.roomUrl === "string");
            assert(typeof data.region === "string");
            assert(typeof data.autoFill === "boolean");
            assert(typeof data.gameModeIdx === "number");
        }

        switch (msg.type) {
            case "create": {
                assert(typeof msg.data === "object");
                assert(typeof msg.data.playerData === "object");
                assert(typeof msg.data.roomData === "object");
                validateRoomData(msg.data.roomData);
                break;
            }
            case "join": {
                assert(typeof msg.data === "object");
                assert(typeof msg.data.roomUrl === "string");
                assert(typeof msg.data.playerData === "object");
                break;
            }
            case "changeName": {
                assert(typeof msg.data === "object");
                break;
            }
            case "setRoomProps": {
                assert(typeof msg.data === "object");
                validateRoomData(msg.data);
                break;
            }
            case "kick": {
                assert(typeof msg.data === "object");
                assert(typeof msg.data.playerId === "number");
                break;
            }
            case "playGame": {
                assert(typeof msg.data === "object");
                assert(typeof msg.data.region === "string");
                assert(Array.isArray(msg.data.zones));
                assert(msg.data.zones.length < 5);
                for (const zone of msg.data.zones) {
                    assert(typeof zone === "string");
                }
                break;
            }
        }
    }

    async handleMsg(message: string, ws: WSContext<TeamSocketData>) {
        const localPlayerData = ws.raw!;
        let parsedMessage: ClientToServerTeamMsg;
        try {
            parsedMessage = JSON.parse(message);
            this.validateMsg(parsedMessage);
        } catch {
            ws.close();
            return;
        }

        const type = parsedMessage.type;
        let response: ServerToClientTeamMsg;

        switch (type) {
            case "create": {
                const name = this.cleanUserName(parsedMessage.data.playerData.name);

                const player: RoomPlayer = {
                    name,
                    isLeader: true,
                    inGame: false,
                    playerId: 0,
                    socket: ws,
                };

                if (!Config.modes[1].enabled && !Config.modes[2].enabled) {
                    response = teamErrorMsg("create_failed");
                    this.sendResponse(response, ws);
                    break;
                }

                const activeCodes = new Set(this.rooms.keys());
                let roomUrl = `#${randomString(4)}`;
                while (activeCodes.has(roomUrl)) {
                    roomUrl = `#${randomString(4)}`;
                }

                localPlayerData.roomUrl = roomUrl;

                const room = this.addRoom(roomUrl, parsedMessage.data.roomData, player);
                if (!room) {
                    response = teamErrorMsg("create_failed");
                    this.sendResponse(response, ws);
                    break;
                }

                this.sendRoomState(room);
                break;
            }
            case "join": {
                const roomUrl = `#${parsedMessage.data.roomUrl}`;
                const room = this.rooms.get(roomUrl);
                // join fail if room doesnt exist or if room is already full
                if (!room) {
                    response = teamErrorMsg("join_failed");
                    ws.send(JSON.stringify(response));
                    break;
                }
                if (room.roomData.maxPlayers == room.players.length) {
                    response = teamErrorMsg("join_full");
                    ws.send(JSON.stringify(response));
                    break;
                }

                const name = this.cleanUserName(parsedMessage.data.playerData.name);

                const player = {
                    name,
                    isLeader: false,
                    inGame: false,
                    playerId: room.players.length,
                    socket: ws,
                } as RoomPlayer;
                room.players.push(player);

                localPlayerData.roomUrl = roomUrl;

                this.sendRoomState(room);
                break;
            }
            case "changeName": {
                const newName = this.cleanUserName(parsedMessage.data.name);
                const room = this.rooms.get(localPlayerData.roomUrl)!;
                const player = room.players.find((p) => p.socket === ws)!;
                player.name = newName;

                this.sendRoomState(room);
                break;
            }
            case "setRoomProps": {
                const newRoomData = parsedMessage.data;
                const room = this.rooms.get(localPlayerData.roomUrl)!;
                const player = room.players.find((p) => p.socket === ws)!;
                if (!player.isLeader) {
                    return;
                }

                // do nothing if player tries to select disabled gamemode
                if (
                    !room.roomData.enabledGameModeIdxs.includes(newRoomData.gameModeIdx)
                ) {
                    return;
                }

                this.modifyRoom(newRoomData, room);
                this.sendRoomState(room);
                break;
            }
            case "kick": {
                const room = this.rooms.get(localPlayerData.roomUrl)!;
                const player = room.players.find((p) => p.socket === ws)!;
                if (!player.isLeader) {
                    return;
                }
                const pToKick = room.players[parsedMessage.data.playerId];
                if (!pToKick || pToKick === player) {
                    return;
                }

                response = {
                    type: "kicked",
                    data: {},
                };
                this.sendResponse(response, pToKick.socket);
                //player is removed and new room state is sent when the socket is inevitably closed after the kick
                break;
            }
            case "keepAlive": {
                const room = this.rooms.get(localPlayerData.roomUrl);
                if (!room) return;
                response = {
                    type: "keepAlive",
                    data: {},
                };
                this.sendResponses(response, room.players);
                break;
            }
            case "playGame": {
                // this message can only ever be sent by the leader
                const room = this.rooms.get(localPlayerData.roomUrl)!;
                const player = room.players.find((p) => p.socket === ws)!;

                if (!player.isLeader) {
                    return;
                }

                room.roomData.findingGame = true;
                this.sendRoomState(room);

                const data = parsedMessage.data;
                const playData = (
                    await this.server.findGame({
                        version: data.version,
                        region: data.region,
                        zones: data.zones,
                        gameModeIdx: room.roomData.gameModeIdx,
                        autoFill: room.roomData.autoFill,
                        playerCount: room.players.length,
                    })
                ).res[0];

                if ("err" in playData) {
                    response = teamErrorMsg("find_game_error");
                    this.sendResponse(response, player.socket);
                    return;
                }

                response = {
                    type: "joinGame",
                    data: {
                        ...playData,
                        data: playData.data,
                    },
                };
                this.sendResponses(response, room.players);

                room.players.forEach((p) => {
                    p.inGame = true;
                });
                this.sendRoomState(room);
                break;
            }
            case "gameComplete": {
                // doesn't necessarily mean game is over, sent when player leaves game and returns to team menu
                const room = this.rooms.get(localPlayerData.roomUrl)!;
                const player = room.players.find((p) => p.socket === ws)!;
                player.inGame = false;
                room.roomData.findingGame = false;

                this.sendRoomState(room);
                break;
            }
        }
    }
}

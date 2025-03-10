import type { TemplatedApp, WebSocket } from "uWebSockets.js";
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
import type { ApiServer } from "./apiServer";
import { Config } from "./config";
import {
    HTTPRateLimit,
    WebSocketRateLimit,
    checkForBadWords,
    getIp,
} from "./utils/serverHelpers";

export interface TeamSocketData {
    sendMsg: (response: string) => void;
    closeSocket: () => void;
    roomUrl: string;
    rateLimit: Record<symbol, number>;
    ip: string;
}

interface RoomPlayer extends TeamMenuPlayer {
    socketData: TeamSocketData;
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

    init(app: TemplatedApp) {
        const teamMenu = this;

        const httpRateLimit = new HTTPRateLimit(1, 2000);
        const wsRateLimit = new WebSocketRateLimit(5, 1000, 10);

        app.ws("/team_v2", {
            idleTimeout: 30,
            /**
             * Upgrade the connection to WebSocket.
             */
            upgrade(res, req, context) {
                res.onAborted((): void => {});

                const ip = getIp(res);

                if (httpRateLimit.isRateLimited(ip) || wsRateLimit.isIpRateLimited(ip)) {
                    res.writeStatus("429 Too Many Requests");
                    res.write("429 Too Many Requests");
                    res.end();
                    return;
                }
                wsRateLimit.ipConnected(ip);

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
                if (wsRateLimit.isRateLimited(socket.getUserData().rateLimit)) {
                    socket.close();
                    return;
                }
                teamMenu.handleMsg(message, socket.getUserData());
            },

            /**
             * Handle closing of the socket.
             * Called if player hits the leave button or if there's an error joining/creating a team
             * @param socket The socket being closed.
             */
            close(socket: WebSocket<TeamSocketData>) {
                const userData = socket.getUserData();
                const room = teamMenu.rooms.get(userData.roomUrl);
                if (room) {
                    teamMenu.removePlayer(userData);
                    teamMenu.sendRoomState(room);
                }
                wsRateLimit.ipDisconnected(userData.ip);
            },
        });
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
    removePlayer(playerContainer: TeamSocketData): void {
        const room = this.rooms.get(playerContainer.roomUrl)!;

        const pToRemove = room.players.find((p) => p.socketData === playerContainer)!;
        const pToRemoveIndex = room.players.indexOf(pToRemove);
        room.players.splice(pToRemoveIndex, 1);

        if (room.players.length == 0) {
            this.rooms.delete(playerContainer.roomUrl);
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
     * @param player player to send the response to
     */
    sendResponse(response: ServerToClientTeamMsg, player: RoomPlayer): void {
        player.socketData.sendMsg(JSON.stringify(response));
    }

    /**
     * @param players players to send the message to
     */
    sendResponses(response: ServerToClientTeamMsg, players: RoomPlayer[]): void {
        for (const player of players) {
            this.sendResponse(response, player);
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

            player.socketData.sendMsg(JSON.stringify(msg));
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

    async handleMsg(message: ArrayBuffer, localPlayerData: TeamSocketData) {
        let parsedMessage: ClientToServerTeamMsg;
        try {
            parsedMessage = JSON.parse(new TextDecoder().decode(message));
            this.validateMsg(parsedMessage);
        } catch {
            localPlayerData.closeSocket();
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
                    socketData: localPlayerData,
                };

                if (!Config.modes[1].enabled && !Config.modes[2].enabled) {
                    response = teamErrorMsg("create_failed");
                    this.sendResponse(response, player);
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
                    this.sendResponse(response, player);
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
                    localPlayerData.sendMsg(JSON.stringify(response));
                    break;
                }
                if (room.roomData.maxPlayers == room.players.length) {
                    response = teamErrorMsg("join_full");
                    localPlayerData.sendMsg(JSON.stringify(response));
                    break;
                }

                const name = this.cleanUserName(parsedMessage.data.playerData.name);

                const player = {
                    name,
                    isLeader: false,
                    inGame: false,
                    playerId: room.players.length,
                    socketData: localPlayerData,
                } as RoomPlayer;
                room.players.push(player);

                localPlayerData.roomUrl = roomUrl;

                this.sendRoomState(room);
                break;
            }
            case "changeName": {
                const newName = this.cleanUserName(parsedMessage.data.name);
                const room = this.rooms.get(localPlayerData.roomUrl)!;
                const player = room.players.find(
                    (p) => p.socketData === localPlayerData,
                )!;
                player.name = newName;

                this.sendRoomState(room);
                break;
            }
            case "setRoomProps": {
                const newRoomData = parsedMessage.data;
                const room = this.rooms.get(localPlayerData.roomUrl)!;
                const player = room.players.find(
                    (p) => p.socketData === localPlayerData,
                )!;
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
                const player = room.players.find(
                    (p) => p.socketData === localPlayerData,
                )!;
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
                this.sendResponse(response, pToKick);
                // player is removed and new room state is sent when the socket is inevitably closed after the kick
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
                const player = room.players.find(
                    (p) => p.socketData === localPlayerData,
                )!;

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
                    this.sendResponse(response, player);
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
                const player = room.players.find(
                    (p) => p.socketData === localPlayerData,
                )!;
                player.inGame = false;
                room.roomData.findingGame = false;

                this.sendRoomState(room);
                break;
            }
        }
    }
}

import type { Context, Hono } from "hono";
import type { UpgradeWebSocket } from "hono/ws";
import {
    type ClientRoomData,
    type ClientToServerTeamMsg,
    type RoomData,
    type ServerToClientTeamMsg,
    type TeamErrorMsg,
    type TeamMenuPlayer,
    type TeamStateMsg,
    zTeamClientMsg,
} from "../../shared/types/team";
import { math } from "../../shared/utils/math";
import type { ApiServer } from "./api/apiServer";
import { Config } from "./config";
import {
    HTTPRateLimit,
    WebSocketRateLimit,
    getHonoIp,
    validateUserName,
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

    init(app: Hono, upgradeWebSocket: UpgradeWebSocket) {
        const teamMenu = this;

        const httpRateLimit = new HTTPRateLimit(1, 2000);
        const wsRateLimit = new WebSocketRateLimit(5, 1000, 10);

        app.get(
            "/team_v2",
            upgradeWebSocket((c) => {
                const ip = getHonoIp(c, Config.gameServer.proxyIPHeader);

                let closeOnOpen = false;
                if (
                    !ip ||
                    httpRateLimit.isRateLimited(ip) ||
                    wsRateLimit.isIpRateLimited(ip)
                ) {
                    closeOnOpen = true;
                }

                wsRateLimit.ipConnected(ip!);

                // guh, i'm sure there is a better way;
                // lmssiehdev: leia found a way but it's broken? I couldn't get it to work
                const userDataMap = new Map<Context, TeamSocketData>();
                return {
                    onOpen(_event, ws) {
                        const userData = {
                            ip,
                            rateLimit: {},
                        } as TeamSocketData;
                        userData.sendMsg = (data) => ws.send(data);
                        userData.closeSocket = () => ws.close();
                        userDataMap.set(c, userData);

                        if (closeOnOpen) {
                            ws.close();
                        }
                    },
                    onMessage(event, ws) {
                        const userData = userDataMap.get(c)!;
                        if (wsRateLimit.isRateLimited(userData.rateLimit)) {
                            ws.close();
                            return;
                        }
                        teamMenu.handleMsg(event.data as string, userData);
                    },
                    onClose: () => {
                        const userData = userDataMap.get(c)!;
                        const room = teamMenu.rooms.get(userData.roomUrl);
                        if (room) {
                            teamMenu.removePlayer(userData);
                            teamMenu.sendRoomState(room);
                        }
                        userDataMap.delete(c);
                        wsRateLimit.ipDisconnected(userData.ip);
                    },
                };
            }),
        );
    }

    addRoom(roomUrl: string, initialRoomData: ClientRoomData, roomLeader: RoomPlayer) {
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
    modifyRoom(newRoomData: ClientRoomData, room: Room): void {
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

    validateMsg(msg: ClientToServerTeamMsg) {
        zTeamClientMsg.parse(msg);
    }

    async handleMsg(message: string, localPlayerData: TeamSocketData) {
        let parsedMessage: ClientToServerTeamMsg;
        try {
            parsedMessage = JSON.parse(message);
            this.validateMsg(parsedMessage);
        } catch (e) {
            localPlayerData.closeSocket();
            console.error("Failed parsing message", e);
            return;
        }

        let response: ServerToClientTeamMsg;

        switch (parsedMessage.type) {
            case "create": {
                const name = validateUserName(parsedMessage.data.playerData.name);

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

                const name = validateUserName(parsedMessage.data.playerData.name);

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
                const newName = validateUserName(parsedMessage.data.name);
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
                const findGameRes = await this.server.findGame({
                    version: data.version,
                    region: data.region,
                    zones: data.zones,
                    gameModeIdx: room.roomData.gameModeIdx,
                    autoFill: room.roomData.autoFill,
                    playerCount: room.players.length,
                });

                if ("err" in findGameRes) {
                    response = teamErrorMsg("find_game_error");
                    this.sendResponse(response, player);
                    return;
                }

                response = {
                    type: "joinGame",
                    data: {
                        ...findGameRes.res[0],
                        data: findGameRes.res[0].data,
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

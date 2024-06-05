import {
    type ClientToServerTeamMsg,
    type RoomData,
    type ServerToClientTeamMsg,
    type TeamStateMsg,
    type TeamErrorMsg,
    type TeamMenuPlayer
} from "../../shared/net";
import { math } from "../../shared/utils/math";
import { type TeamMenuPlayerContainer, type AbstractServer } from "./abstractServer";
import { IDAllocator } from "./IDAllocator";

export interface Room {
    roomData: RoomData
    players: TeamMenuPlayer[]
}

type ErrorType =
    "join_full" |
    "join_not_found" |
    "create_failed" |
    "join_failed" |
    "join_game_failed" |
    "lost_conn" |
    "find_game_error" |
    "find_game_full" |
    "find_game_invalid_protocol" |
    "kicked";

function teamErrorMsg(type: ErrorType): TeamErrorMsg {
    return {
        type: "error",
        data: {
            type
        }
    };
}

const alphanumerics = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
function genRoomCode() {
    let str = "";
    let i = 0;
    while (i < 4) {
        str += alphanumerics.charAt(Math.floor(Math.random() * alphanumerics.length));
        i++;
    }
    return `#${str}`;
}

export class TeamMenu {
    idToSocketSend = new Map<number, (response: string) => void>();
    rooms = new Map<string, Room>();
    idAllocator = new IDAllocator(16);
    groupIdAllocator = new IDAllocator(16);

    constructor(public server: AbstractServer) {

    }

    addRoom(roomUrl: string, initialRoomData: RoomData, roomLeader: TeamMenuPlayer) {
        const key = roomUrl.slice(1);
        const value = {
            roomData: {
                roomUrl,
                region: initialRoomData.region,
                gameModeIdx: initialRoomData.gameModeIdx,
                enabledGameModeIdxs: [1, 2],
                autoFill: initialRoomData.autoFill,
                findingGame: initialRoomData.findingGame,
                lastError: initialRoomData.lastError,
                maxPlayers: math.clamp(initialRoomData.gameModeIdx * 2, 2, 4)
            },
            players: [roomLeader]
        };
        this.rooms.set(key, value);
        return value;
    }

    /**
     * removes player from all necessary data structures (room, idToSocketSend map, id allocator)
     * @param playerId id of player to remove
     * @param room room to remove player from
     */
    removePlayer(playerContainer: TeamMenuPlayerContainer): void {
        this.idToSocketSend.delete(playerContainer.playerId);
        this.idAllocator.give(playerContainer.playerId);

        const room = this.rooms.get(playerContainer.roomUrl)!;

        const pToRemove = room.players.find(p => p.playerId == playerContainer.playerId)!;
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
        const response = this.roomToStateObj(room);
        for (const player of room.players) {
            response.data.localPlayerId = player.playerId;
            const sendResponse = this.idToSocketSend.get(player.playerId);
            sendResponse?.(JSON.stringify(response));
        }
    }

    /**
     *
     * @param type type of response to send
     * @param player player to send the response to
     */
    sendResponse(response: ServerToClientTeamMsg, player: TeamMenuPlayer): void {
        if (response.type == "state") {
            response.data.localPlayerId = player.playerId;
        }
        const send = this.idToSocketSend.get(player.playerId);
        send?.(JSON.stringify(response));
    }

    /**
     *
     * @param type type of message to send
     * @param players players to send the message to
     */
    sendResponses(response: ServerToClientTeamMsg, players: TeamMenuPlayer[]): void {
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

    roomToStateObj(room: Room): TeamStateMsg {
        return {
            type: "state",
            data: {
                localPlayerId: -1,
                room: room.roomData,
                players: room.players
            }
        };
    }

    handleMsg(message: ArrayBuffer, localPlayerData: TeamMenuPlayerContainer): void {
        const parsedMessage: ClientToServerTeamMsg = JSON.parse(new TextDecoder().decode(message));
        const type = parsedMessage.type;
        let response: ServerToClientTeamMsg;

        switch (type) {
        case "create":{
            const name = parsedMessage.data.playerData.name != "" ? parsedMessage.data.playerData.name : "Player";
            const playerId = this.idAllocator.getNextId();
            const player: TeamMenuPlayer = {
                name,
                playerId,
                isLeader: true,
                inGame: false
            };

            const activeCodes = new Set(this.rooms.keys());
            let roomUrl = genRoomCode();
            while (activeCodes.has(roomUrl.slice(1))) {
                roomUrl = genRoomCode();
            }

            localPlayerData.roomUrl = roomUrl.slice(1);
            localPlayerData.playerId = playerId;

            this.idToSocketSend.set(playerId, localPlayerData.sendResponse);

            const room = this.addRoom(roomUrl, parsedMessage.data.roomData, player);
            if (!room) {
                response = teamErrorMsg("create_failed");
                this.sendResponse(response, player);
                break;
            }

            response = this.roomToStateObj(room);
            this.sendResponse(response, player);
            break;
        }
        case "join":{
            const roomUrl = parsedMessage.data.roomUrl;
            const room = this.rooms.get(roomUrl);
            // join fail if room doesnt exist or if room is already full
            if (!room) {
                response = teamErrorMsg("join_failed");
                localPlayerData.sendResponse(JSON.stringify(response));
                break;
            }
            if (room.roomData.maxPlayers == room.players.length) {
                response = teamErrorMsg("join_full");
                localPlayerData.sendResponse(JSON.stringify(response));
                break;
            }

            let name = parsedMessage.data.playerData.name;
            name = name != "" ? name : "Player";
            const playerId = this.idAllocator.getNextId();
            const player: TeamMenuPlayer = {
                name,
                playerId,
                isLeader: false,
                inGame: false
            };
            localPlayerData.roomUrl = roomUrl;
            localPlayerData.playerId = playerId;

            this.idToSocketSend.set(playerId, localPlayerData.sendResponse);
            room.players.push(player);
            response = this.roomToStateObj(room);
            this.sendResponses(response, room.players);
            break;
        }
        case "changeName":{
            const newName = parsedMessage.data.name;
            const room = this.rooms.get(localPlayerData.roomUrl)!;
            const player = room.players.find(p => p.playerId == localPlayerData.playerId)!;
            player.name = newName;

            response = this.roomToStateObj(room);
            this.sendResponses(response, room.players);
            break;
        }
        case "setRoomProps":{
            const newRoomData = parsedMessage.data; // roomUrl comes with #
            const room = this.rooms.get(newRoomData.roomUrl.slice(1))!;

            this.modifyRoom(newRoomData, room);
            response = this.roomToStateObj(room);
            this.sendResponses(response, room.players);
            break;
        }
        case "kick":{
            const room = this.rooms.get(localPlayerData.roomUrl)!;
            const pToKick = room.players.find(p => p.playerId === parsedMessage.data.playerId)!;

            response = {
                type: "kicked"
            };
            this.sendResponse(response, pToKick);
            // don't need to send new state to remaining players in room since this.removePlayer will do that by default
            break;
        }
        case "keepAlive":{
            const room = this.rooms.get(localPlayerData.roomUrl)!;
            response = {
                type: "keepAlive",
                data: {}
            };
            this.sendResponses(response, room.players);
            break;
        }
        case "playGame":{ // this message can only ever be sent by the leader
            const room = this.rooms.get(localPlayerData.roomUrl)!;
            const player = room.players.find(p => p.playerId == localPlayerData.playerId)!;

            room.roomData.findingGame = true;
            response = this.roomToStateObj(room);
            this.sendResponses(response, room.players);

            const playData = this.server.findGame(parsedMessage.data.region).res[0];
            if ("err" in playData) {
                response = teamErrorMsg("find_game_error");
                this.sendResponse(response, player);
                break;
            }

            response = {
                type: "joinGame",
                data: {
                    ...playData,
                    data: JSON.stringify({
                        groupId: this.groupIdAllocator.getNextId().toString(),
                        teamMode: math.clamp(room.roomData.gameModeIdx * 2, 2, 4)
                    })
                }
            };
            this.sendResponses(response, room.players);

            room.players.forEach((p) => { p.inGame = true; });
            room.roomData.findingGame = false;
            response = this.roomToStateObj(room);
            this.sendResponses(response, room.players);
            break;
        }
        case "gameComplete":{ // doesn't necessarily mean game is over, sent when player leaves game and returns to team menu
            const room = this.rooms.get(localPlayerData.roomUrl)!;
            const player = room.players.find(p => p.playerId == localPlayerData.playerId)!;
            player.inGame = false;

            response = this.roomToStateObj(room);
            this.sendResponses(response, room.players);
            break;
        }
        }
    }
}

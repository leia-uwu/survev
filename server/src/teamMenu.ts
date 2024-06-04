import {
    type ClientToServerTeamMsg,
    type RoomData,
    type ServerToClientTeamMsg,
    type TeamStateMsg,
    type TeamErrorMsg,
    type TeamMenuPlayer
} from "../../shared/net";
import { math } from "../../shared/utils/math";
import { type TeamMenuPlayerContainer } from "./abstractServer";
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
     * the only properties that can change are: region, gameModeIdx, autoFill, and maxPlayers (by virtue of gameModeIdx)
     */
    modifyRoom(newRoomData: RoomData, room: Room): void {
        room.roomData.gameModeIdx = newRoomData.gameModeIdx;
        room.roomData.maxPlayers = math.clamp(room.roomData.gameModeIdx * 2, 2, 4);
        room.roomData.autoFill = newRoomData.autoFill;
        room.roomData.region = newRoomData.region;

        // Object.assign(room.roomData, newRoomData);
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

    handleMsg(message: ArrayBuffer, localPlayerData: TeamMenuPlayerContainer): ServerToClientTeamMsg {
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
            while (activeCodes.has(roomUrl.slice(1))){
                roomUrl = genRoomCode();
            }

            console.log(activeCodes);

            localPlayerData.roomUrl = roomUrl.slice(1);
            localPlayerData.playerId = playerId;

            this.idToSocketSend.set(playerId, localPlayerData.sendResponse);

            const room = this.addRoom(roomUrl, parsedMessage.data.roomData, player);
            if (!room) {
                response = teamErrorMsg("create_failed");
                break;
            }

            response = this.roomToStateObj(room);
            break;
        }
        case "join":{
            const roomUrl = parsedMessage.data.roomUrl;
            const room = this.rooms.get(roomUrl);
            // join fail if room doesnt exist or if room is already full
            if (!room) {
                response = teamErrorMsg("join_failed");
                break;
            }
            if (room.roomData.maxPlayers == room.players.length) {
                response = teamErrorMsg("join_full");
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
            break;
        }
        case "changeName":{
            const newName = parsedMessage.data.name;
            const room = this.rooms.get(localPlayerData.roomUrl)!;
            const player = room.players.find(p => p.playerId == localPlayerData.playerId)!;
            player.name = newName;

            response = this.roomToStateObj(room);
            break;
        }
        case "setRoomProps":{
            const newRoomData = parsedMessage.data; // roomUrl comes with #
            const room = this.rooms.get(newRoomData.roomUrl.slice(1));
            if (!room) {
                response = teamErrorMsg("lost_conn");
                break;
            }

            this.modifyRoom(newRoomData, room);
            response = this.roomToStateObj(room);
            break;
        }
        case "kick":{
            const room = this.rooms.get(localPlayerData.roomUrl)!;
            const pToKick = room.players.find(p => p.playerId === parsedMessage.data.playerId)!;

            const sendResponse = this.idToSocketSend.get(pToKick.playerId);
            response = {
                type: "kicked"
            };
            sendResponse?.(JSON.stringify(response));
            // hack to essentially "do nothing" for all the players that weren't kicked
            // the new room state is already sent to all players when a player is kicked/removed so we don't need to send it again
            response = {
                type: "keepAlive",
                data: {}
            };
            break;
        }
        case "keepAlive":{
            response = {
                type: "keepAlive",
                data: {}
            };
            break;
        }
        // case  "playGame":{
        //     break;
        // }
        // case "gameComplete":{
        //     break;
        // }
        default: {
            response = {
                type: "keepAlive",
                data: {}
            };
        }
        }
        return response;
    }
}

import {
    type ClientToServerTeamMsg,
    RoomData,
    ServerToClientTeamMsg,
    type TeamJoinGameMsg,
    type TeamStateMsg,
    type TeamErrorMsg,
    type TeamMenuPlayer
} from "../../shared/net";
import { math } from "../../shared/utils/math";
import {type TeamMenuPlayerContainer} from "./abstractServer";
import { IDAllocator } from "./IDAllocator";
import { RoomCodeAllocator } from "./RoomCodeAllocator";

export type Room = {
    roomData: RoomData;
    players: TeamMenuPlayer[];
}

const JOIN_FAILED: TeamErrorMsg = {
    type: "error",
    data: {
        type: "join_failed"
    }
};

const CREATE_FAILED: TeamErrorMsg = {
    type: "error",
    data: {
        type: "create_failed"
    }
};

export class TeamMenu {

    idToSocketSend = new Map<number, (response: string) => void>();
    rooms = new Map<string, Room>();
    roomCodeAllocator = new RoomCodeAllocator();
    idAllocator = new IDAllocator(16);

    addRoom(roomUrl: string, initialRoomData: RoomData, roomLeader: TeamMenuPlayer){
        const key = roomUrl.slice(1);
        const value = {
            roomData: {
                roomUrl: roomUrl,
                region: initialRoomData.region,
                gameModeIdx: initialRoomData.gameModeIdx,
                enabledGameModeIdxs: [1, 2],
                autoFill: initialRoomData.autoFill,
                findingGame: initialRoomData.findingGame,
                lastError: initialRoomData.lastError,
                maxPlayers: math.clamp(initialRoomData.gameModeIdx*2, 2, 4)
            },
            players: [roomLeader]
        };
        this.rooms.set(key, value);
        return value;
    }

    /**
     * removes player from room AND idToSocketSend map
     * @param playerId id of player to remove
     * @param room room to remove player from
     */
    removePlayer(playerContainer: TeamMenuPlayerContainer){
        this.idToSocketSend.delete(playerContainer.playerId);
        this.idAllocator.give(playerContainer.playerId);

        const room = this.rooms.get(playerContainer.roomUrl);
        room!.players.filter(p => p.playerId != playerContainer.playerId);
        if (room!.players.length == 0){
            this.rooms.delete(playerContainer.roomUrl);
            this.roomCodeAllocator.freeCode(playerContainer.roomUrl);
        }
    }

    modifyRoom(newRoomData: RoomData, room: Room): void{
        Object.assign(room.roomData, newRoomData);
    }

    roomToStateObj(room: Room): TeamStateMsg{
        return {
            type: "state",
            data: {
                localPlayerId: -1,
                room: room.roomData,
                players: room.players
            }
        };
    }

    handleMsg(message: ArrayBuffer, localPlayerData: TeamMenuPlayerContainer): ServerToClientTeamMsg{
        const parsedMessage = JSON.parse(new TextDecoder().decode(message as ArrayBuffer)) as ClientToServerTeamMsg;
        const type = parsedMessage.type;
        const data = type != "gameComplete" ? parsedMessage.data : undefined;
        let response: ServerToClientTeamMsg;
        
        switch (type){
            case "create":{
                let name = parsedMessage.data.playerData.name != '' ? parsedMessage.data.playerData.name : "Player";
                const playerId = this.idAllocator.getNextId();
                const player: TeamMenuPlayer = {
                    name: name,
                    playerId: playerId,
                    isLeader: true,
                    inGame: false,
                }

                const roomUrl = this.roomCodeAllocator.getCode();
                localPlayerData.roomUrl = roomUrl.slice(1);
                localPlayerData.playerId = playerId;

                this.idToSocketSend.set(playerId, localPlayerData.sendResponse);

                const room = this.addRoom(roomUrl, parsedMessage.data.roomData, player);
                if (!room){
                    response = CREATE_FAILED;
                    break;
                }

                response = this.roomToStateObj(room);
                break;
            }
            case "join":{
                const roomUrl = parsedMessage.data.roomUrl;
                let name = parsedMessage.data.playerData.name;
                name = name != '' ? name : "Player";
                const playerId = this.idAllocator.getNextId();
                const player: TeamMenuPlayer = {
                    name: name,
                    playerId: playerId,
                    isLeader: false,
                    inGame: false,
                }
                localPlayerData.roomUrl = roomUrl;
                localPlayerData.playerId = playerId;

                this.idToSocketSend.set(playerId, localPlayerData.sendResponse);
                const room = this.rooms.get(roomUrl);
                if (!room){
                    response = JOIN_FAILED;
                    break;
                }

                room.players.push(player);
                response = this.roomToStateObj(room);
                break;
            }
            // case "changeName":{
            //     break;
            // }
            // case "setRoomProps":{
            //     break;
            // }
            // case "kick":{
            //     break;
            // }
            case "keepAlive":{
                response = {
                    type: "keepAlive",
                    data: {}
                }
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
                }
            }
        }
        return response;
    }
}
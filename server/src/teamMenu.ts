import {
    type ClientToServerTeamMsg,
    RoomData,
    ServerToClientTeamMsg,
    type TeamJoinGameMsg,
    type TeamStateMsg
} from "../../shared/net";
import {type TeamMenuPlayerContainer} from "./abstractServer";
import { IDAllocator } from "./IDAllocator";
import { RoomCodeAllocator } from "./RoomCodeAllocator";

// type TeamMenuPlayer = Omit<TeamMenuPlayerContainer, "roomUrl" | "sendResponse">;
type TeamMenuPlayer = {
    name: string;
    playerId: number;
    isLeader: boolean;
    inGame: boolean;
}

export type Room = {
    roomData: RoomData;
    players: TeamMenuPlayer[];
}

export class TeamMenu {

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
                maxPlayers: initialRoomData.gameModeIdx*2
            },
            players: [roomLeader]
        };
        this.rooms.set(key, value);
        return value;
    }

    deleteRoom(roomUrl: string){
        this.rooms.delete(roomUrl);
    }

    modifyRoom(newRoomData: RoomData, room: Room): void{
        Object.assign(room.roomData, newRoomData);
    }

    roomToStateObj(playerId: number, room: Room): TeamStateMsg{
        return {
            type: "state",
            data: {
                localPlayerId: playerId,
                room: room.roomData,
                players: room.players
            }
        };
    }

    handleMsg(message: ArrayBuffer, localPlayerData: TeamMenuPlayerContainer): ServerToClientTeamMsg{
        const parsedMessage = JSON.parse(new TextDecoder().decode(message as ArrayBuffer)) as ClientToServerTeamMsg;
        const type = parsedMessage.type;
        const data = type != "gameComplete" ? parsedMessage.data : undefined;
        // console.log(parsedMessage);
        let response: ServerToClientTeamMsg;
        
        switch (type){
            case "create":{
                let name = parsedMessage.data.playerData.name != '' ? parsedMessage.data.playerData.name : "Player";
                const playerId = this.idAllocator.getNextId();
                const player: TeamMenuPlayer = {//roomUrl in player obj is for server only, doesnt get sent to client
                    name: name,
                    playerId: playerId,
                    isLeader: true,
                    inGame: false
                }

                const roomUrl = this.roomCodeAllocator.getCode();

                localPlayerData.roomUrl = roomUrl.slice(1);
                localPlayerData.name = name;
                localPlayerData.playerId = playerId;
                localPlayerData.isLeader = true;
                localPlayerData.inGame = false;

                const room = this.addRoom(roomUrl, parsedMessage.data.roomData, player);

                response = {
                    type: "state",
                    data: {
                        localPlayerId: playerId,
                        room: room?.roomData,
                        players: room?.players
                    }
                } satisfies ServerToClientTeamMsg;
                break;
            }
            // case "join":{
            //     break;
            // }
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
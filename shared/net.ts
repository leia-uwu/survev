import bb from "bit-buffer";
import { GameObjectDefs } from "./defs/gameObjectDefs";
import { MapObjectDefs } from "./defs/mapObjectDefs";
import { math } from "./utils/math";
import { type Vec2 } from "./utils/v2";
import { assert } from "./utils/util";

const DEV_MODE = false;

export interface Msg {
    serialize: (s: BitStream) => void
}

export abstract class AbstractMsg {
    abstract serialize(s: BitStream): void;
    abstract deserialize(s: BitStream): void;
}

/**
 * Map type strings to integers for more efficient serialization.
 */
class ConfigTypeMap {
    _typeToId: Record<string, number> = {};
    _idToType: Record<number, string> = {};
    nextId = 0;
    maxId: number;

    constructor(typeBits: number) {
        this.maxId = 2 ** typeBits;
        this.addType("");
    }

    addType(type: string) {
        assert(this._typeToId[type] === undefined, `Type ${type} has already been defined!`);
        assert(this.nextId < this.maxId);
        this._typeToId[type] = this.nextId;
        this._idToType[this.nextId] = type;
        this.nextId++;
    }

    typeToId(type: string) {
        const id = this._typeToId[type];
        assert(id !== undefined, `Invalid type ${type}`);
        return id;
    }

    idToType(id: number) {
        const type = this._idToType[id];
        if (type === undefined) {
            console.error("Invalid id given to idToType", id, "max", Object.keys(this._idToType).length);
        }
        return type;
    }
}

function createTypeSerialization(type: string, typeList: Record<string, unknown>, bitsPerType: number) {
    const typeMap = new ConfigTypeMap(bitsPerType);

    const types = Object.keys(typeList);
    assert(types.length <= typeMap.maxId, `${type} contains ${types.length} types, max ${typeMap.maxId}`);
    for (let i = 0; i < types.length; i++) {
        typeMap.addType(types[i]);
    }

    if (DEV_MODE) {
        console.log(`Used ${typeMap.nextId} / ${typeMap.maxId} ${type} types`);
    }

    // Create serialization functions
    /* bb.BitStream.prototype[`write${type}Type`] = function(v) {
        this.writeBits(typeMap.typeToId(v), bitsPerType);
    };
    bb.BitStream.prototype[`read${type}Type`] = function() {
        return typeMap.idToType(this.readBits(bitsPerType));
    }; */

    return typeMap;
}

const gameTypeSerialization = createTypeSerialization("Game", GameObjectDefs, 10);
const mapTypeSerialization = createTypeSerialization("Map", MapObjectDefs, 12);

export class BitStream extends bb.BitStream {
    writeString(str: string, len?: number) {
        this.writeASCIIString(str, len);
    }

    readString(len?: number) {
        return this.readASCIIString(len);
    }

    writeFloat(f: number, min: number, max: number, bits: number) {
        assert(bits > 0 && bits < 31);
        assert(f >= min && f <= max, `writeFloat: value out of range: ${f}, range: [${min}, ${max}]`);
        const range = (1 << bits) - 1;
        const x = math.clamp(f, min, max);
        const t = (x - min) / (max - min);
        const v = t * range + 0.5;
        this.writeBits(v, bits);
    }

    readFloat(min: number, max: number, bits: number) {
        assert(bits > 0 && bits < 31);
        const range = (1 << bits) - 1;
        const x = this.readBits(bits);
        const t = x / range;
        const v = min + t * (max - min);
        return v;
    }

    writeVec(vec: Vec2, minX: number, minY: number, maxX: number, maxY: number, bitCount: number) {
        this.writeFloat(vec.x, minX, maxX, bitCount);
        this.writeFloat(vec.y, minY, maxY, bitCount);
    }

    readVec(minX: number, minY: number, maxX: number, maxY: number, bitCount: number) {
        return {
            x: this.readFloat(minX, maxX, bitCount),
            y: this.readFloat(minY, maxY, bitCount)
        };
    }

    writeUnitVec(vec: Vec2, bitCount: number) {
        this.writeVec(vec, -1.0001, -1.0001, 1.0001, 1.0001, bitCount);
    }

    readUnitVec(bitCount: number) {
        return this.readVec(-1.0001, -1.0001, 1.0001, 1.0001, bitCount);
    }

    writeVec32(vec: Vec2) {
        this.writeFloat32(vec.x);
        this.writeFloat32(vec.y);
    }

    readVec32() {
        return {
            x: this.readFloat32(),
            y: this.readFloat32()
        };
    }

    // private field L
    declare _view: { _view: Uint8Array };

    writeBytes(src: BitStream, offset: number, length: number) {
        assert(this.index % 8 == 0);
        const data = new Uint8Array(src._view._view.buffer, offset, length);
        this._view._view.set(data, this.index / 8);
        this.index += length * 8;
    }

    writeAlignToNextByte() {
        const offset = 8 - this.index % 8;
        if (offset < 8) this.writeBits(0, offset);
    }

    readAlignToNextByte() {
        const offset = 8 - this.index % 8;
        if (offset < 8) this.readBits(offset);
    }

    writeGameType(type: string) {
        this.writeBits(gameTypeSerialization.typeToId(type), 10);
    }

    readGameType() {
        return gameTypeSerialization.idToType(this.readBits(10));
    }

    writeMapType(type: string) {
        this.writeBits(mapTypeSerialization.typeToId(type), 12);
    }

    readMapType() {
        return mapTypeSerialization.idToType(this.readBits(12));
    }
}

//
// MsgStream
//

export class MsgStream {
    stream: BitStream;
    arrayBuf: ArrayBuffer;

    constructor(buf: ArrayBuffer | Uint8Array) {
        const arrayBuf = buf instanceof ArrayBuffer ? buf : buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

        if (!(arrayBuf instanceof ArrayBuffer)) {
            throw new Error(`Invalid buf type ${typeof buf === "undefined" ? "undefined" : typeof (buf)}`);
        }
        this.arrayBuf = arrayBuf;
        this.stream = new BitStream(arrayBuf);
    }

    getBuffer() {
        return new Uint8Array(this.arrayBuf, 0, this.stream.byteIndex);
    }

    getStream() {
        return this.stream;
    }

    serializeMsg(type: MsgType, msg: Msg) {
        assert(this.stream.index % 8 == 0);
        this.stream.writeUint8(type);
        msg.serialize(this.stream);
        assert(this.stream.index % 8 == 0);
    }

    serializeMsgStream(type: number, stream: BitStream) {
        assert(this.stream.index % 8 == 0 && stream.index % 8 == 0);
        this.stream.writeUint8(type);
        this.stream.writeBytes(stream, 0, stream.index / 8);
    }

    deserializeMsgType() {
        if (this.stream.length - this.stream.byteIndex * 8 >= 1) {
            return this.stream.readUint8();
        }
        return MsgType.None;
    }
}

export const Constants = {
    MapNameMaxLen: 24,
    PlayerNameMaxLen: 16,
    MouseMaxDist: 64,
    SmokeMaxRad: 10,
    ActionMaxDuration: 8.5,
    AirstrikeZoneMaxRad: 256,
    AirstrikeZoneMaxDuration: 60,
    PlayerMinScale: 0.75,
    PlayerMaxScale: 2,
    MapObjectMinScale: 0.125,
    MapObjectMaxScale: 2.5,
    MaxPerks: 8,
    MaxMapIndicators: 16
};

export enum MsgType {
    None,
    Join,
    Disconnect,
    Input,
    Edit,
    Joined,
    Update,
    Kill,
    GameOver,
    Pickup,
    Map,
    Spectate,
    DropItem,
    Emote,
    PlayerStats,
    AdStatus,
    Loadout,
    RoleAnnouncement,
    Stats,
    UpdatePass,
    AliveCounts,
    PerkModeRoleSelect
}

export enum PickupMsgType {
    Full,
    AlreadyOwned,
    AlreadyEquipped,
    BetterItemEquipped,
    Success,
    GunCannotFire
}

// * seem to be only used when cheats are detected
// export class LoadoutMsg extends AbstractMsg {
//     emotes: string[] = [];
//     custom = false;

//     serialize(s: BitStream) {
//         for (let i = 0; i < GameConfig.EmoteSlot.Count; i++) {
//             s.writeGameType(this.emotes[i]);
//         }
//         s.writeUint8(this.custom);
//         s.readAlignToNextByte();
//     }

//     override deserialize(s: BitStream) {
//         for (let i = 0; i < GameConfig.EmoteSlot.Count; i++) {
//             this.emotes.push(s.readGameType());
//         }
//         this.custom = s.readUint8();
//         s.writeAlignToNextByte();
//     }
// }

export class StatsMsg extends AbstractMsg {
    data = "";

    override serialize(s: BitStream) {
        s.writeString(this.data);
    }

    override deserialize(s: BitStream) {
        this.data = s.readString();
    }
}

export class UpdatePassMsg {
    serialize(_e: BitStream) { }
    deserialize(_e: BitStream) { }
}

//
// /api/team_v2 websocket msg typings
// TODO?: move to another file?
//

interface RoomData {
    roomUrl: string
    findingGame: boolean
    lastError: string
    region: string
    autoFill: boolean
    enabledGameModeIdxs: number[]
    gameModeIdx: number
    maxPlayers: number
}

//
// Team msgs that the server sends to clients
//

/**
 * send by the server to all clients to make them join the game
 */
export interface TeamJoinGameMsg {
    readonly type: "joinGame"
    data: {
        zone: string
        gameId: string
        hosts: string[]
        addrs: string[]
        // server generated data that gets sent back to the server on `joinMsg.matchPriv`
        data: string
        useHttps: boolean
    }
}

/**
 * Send by the server to update the client team ui
 */
export interface TeamStateMsg {
    readonly type: "state"
    data: {
        localPlayerId: number
        room: RoomData
        players: Array<{
            playerId: number
            name: string
            isLeader: boolean
            inGame: boolean
        }>
    }
}

/**
 * Send by the server to keep the connection alive
 */
export interface TeamKeepAliveMsg {
    readonly type: "keepAlive"
    // eslint-disable-next-line @typescript-eslint/ban-types
    data: {}
}

/**
 * Send by the server when the player gets kicked from the team room
 */
export interface TeamKickedMsg {
    readonly type: "kicked"
}

export interface TeamErrorMsg {
    readonly type: "error"
    data: {
        type: string
    }
}

export type ServerToClientTeamMsg =
    TeamJoinGameMsg |
    TeamStateMsg |
    TeamKeepAliveMsg |
    TeamKickedMsg |
    TeamErrorMsg;

//
// Team Msgs that the client sends to the server
//

/**
 * send by the client to join a team room
 */
export interface TeamJoinMsg {
    readonly type: "join"
    data: {
        roomUrl: string
        playerData: {
            name: string
        }
    }
}

/**
 * Send by the client to change the player name
 */
export interface TeamChangeNameMsg {
    readonly type: "changeName"
    data: {
        name: string
    }
}

/**
 * Send by the client to set the room properties
 */
export interface TeamSetRoomPropsMsg {
    readonly type: "setRoomProps"
    data: RoomData
}

/**
 * Send by the client to create a room
 */
export interface TeamCreateMsg {
    readonly type: "create"
    data: {
        roomData: RoomData
        playerData: {
            name: string
        }
    }
}

/**
 * Send by the client when the team leader kicks someone from the team
 */
export interface TeamKickMsg {
    readonly type: "kick"
    data: {
        playerId: number
    }
}

/**
 * Send by the client when the game is completed
 */
export interface TeamGameCompleteMsg {
    readonly type: "gameComplete"
}

export type ClientToServerTeamMsg =
    TeamJoinMsg |
    TeamChangeNameMsg |
    TeamSetRoomPropsMsg |
    TeamCreateMsg |
    TeamKickMsg |
    TeamGameCompleteMsg;

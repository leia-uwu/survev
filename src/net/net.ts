import { BitStream, type BitView } from "bit-buffer";
import { MapObjectDefs } from "../defs/mapObjectDefs";
import { GameObjectDefs } from "../defs/gameObjectDefs";

import { type Vec2 } from "../utils/v2";

class ConfigTypeMap {
    private _typeToId: Record<string, number> = {};
    private _idToType: Record<number, string> = {};
    private _nextId = 0;
    readonly maxId: number;

    constructor(typeBits: number, types: string[]) {
        this.maxId = 2 ** typeBits;
        this.addType("");

        for (const type of types) {
            this.addType(type);
        }
    }

    addType(type: string) {
        // assert(this._typeToId[type] === undefined, `Type ${type} has already been defined!`);
        // assert(this.nextId < this.maxId);
        this._typeToId[type] = this._nextId;
        this._idToType[this._nextId] = type;
        this._nextId++;
    }

    typeToId(type: string) {
        const id = this._typeToId[type];
        // assert(id !== undefined, `Invalid type ${type}`);
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

const mapTypeSerialization = new ConfigTypeMap(12, Object.keys(MapObjectDefs));
const gameTypeSerialization = new ConfigTypeMap(10, Object.keys(GameObjectDefs));

export class SurvivBitStream extends BitStream {
    constructor(source: ArrayBuffer | BitView, byteOffset = 0, byteLength = 0) {
        super(source, byteOffset, byteLength);
    }

    writeString(str: string, len?: number): void { this.writeASCIIString(str, len); }
    readString(len?: number): string { return this.readASCIIString(len); }

    writeFloat(val: number, min: number, max: number, bitCount: number): void {
        const range = (1 << bitCount) - 1;
        const x = val < max ? (val > min ? val : min) : max;
        const t = (x - min) / (max - min);
        this.writeBits(t * range + 0.5, bitCount);
    }

    readFloat(min: number, max: number, bitCount: number): number {
        const range = (1 << bitCount) - 1;
        return min + (max - min) * this.readBits(bitCount) / range;
    }

    writeVec(vec: Vec2, minX: number, minY: number, maxX: number, maxY: number, bitCount: number): void {
        this.writeFloat(vec.x, minX, maxX, bitCount);
        this.writeFloat(vec.y, minY, maxY, bitCount);
    }

    readVec(minX: number, minY: number, maxX: number, maxY: number, bitCount: number): Vec2 {
        return {
            x: this.readFloat(minX, maxX, bitCount),
            y: this.readFloat(minY, maxY, bitCount)
        };
    }

    writeUnitVec(vec: Vec2, bitCount: number): void {
        this.writeVec(vec, -1, -1, 1, 1, bitCount);
    }

    readUnitVec(bitCount: number): Vec2 {
        return this.readVec(-1, -1, 1, 1, bitCount);
    }

    writeVec32(vec: Vec2): void {
        this.writeFloat32(vec.x);
        this.writeFloat32(vec.y);
    }

    readVec32(): Vec2 {
        return {
            x: this.readFloat32(),
            y: this.readFloat32()
        };
    }

    writeBytes(src: SurvivBitStream, offset: number, length: number) {
        // assert(this._index % 8 == 0);
        const data = new Uint8Array(src.view.buffer).slice(offset, length);
        this.view.buffer.set(data, this.index / 8);
        this.index += length * 8;
    }

    writeAlignToNextByte(): void {
        const offset = 8 - this.index % 8;
        if (offset < 8) this.writeBits(0, offset);
    }

    readAlignToNextByte(): void {
        const offset = 8 - this.index % 8;
        if (offset < 8) this.readBits(offset);
    }

    writeGameType(type: string): void {
        this.writeBits(gameTypeSerialization.typeToId(type), 10);
    }

    readGameType(): string {
        return gameTypeSerialization.idToType(this.readBits(10));
    }

    writeMapType(type: string): void {
        this.writeBits(mapTypeSerialization.typeToId(type), 12);
    }

    readMapType(): string {
        return mapTypeSerialization.idToType(this.readBits(12));
    }
}

export const NetConstants = {
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

export abstract class Msg {
    abstract type: MsgType;
    abstract deserialize(stream: SurvivBitStream): void;
    abstract serialize(stream: SurvivBitStream): void;
}

export class MsgStream {
    arrayBuf: ArrayBuffer;
    stream: SurvivBitStream;

    constructor(buf: Uint8Array | ArrayBuffer) {
        let arrayBuf = buf;
        if (buf instanceof Uint8Array) {
            arrayBuf = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
        }

        this.arrayBuf = arrayBuf;
        this.stream = new SurvivBitStream(arrayBuf);
    }

    getBuffer() {
        return new Uint8Array(this.arrayBuf, 0, this.stream.byteIndex);
    }

    serializeMsg(msg: Msg) {
        // assert(this.stream.index % 8 == 0);
        this.stream.writeUint8(msg.type);
        msg.serialize(this.stream);
        // assert(this.stream.index % 8 == 0);
    }

    deserializeMsgType(): MsgType {
        if (this.stream.length - this.stream.byteIndex * 8 >= 1) {
            return this.stream.readUint8();
        }
        return MsgType.None;
    }
}

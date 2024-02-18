import { type Game } from "../game";
import { SurvivBitStream } from "./net";
import { ObjectSerializeFns } from "./objectSerialization";

const MAX_ID = 2 ** 16;

// TODO: this doesn't work for now and is unused

export class SerializationCache {
    stream: SurvivBitStream;
    buffer: Buffer;

    offsets = new Uint32Array(MAX_ID + 1);
    partialOffsets = new Uint32Array(MAX_ID + 1);
    lengths = new Uint32Array(MAX_ID + 1);
    partialLengths = new Uint32Array(MAX_ID + 1);

    // object id to cache entry
    idMap = new Uint32Array(MAX_ID);

    offset = 0;
    idCount = 0;
    head = 0;

    constructor() {
        this.buffer = Buffer.alloc(2 ** 20);
        this.stream = new SurvivBitStream(this.buffer);
    }

    getOffset(id: number): number {
        const i = this.idMap[id];
        if (i === undefined) {
            throw new Error("Object not serialized");
        }
        return this.offsets[i]!;
    }

    getLength(id: number): number {
        const i = this.idMap[id];
        if (i === 0) {
            throw new Error("Object not serialized");
        }
        return this.lengths[i];
    }

    getPartialOffset(id: number): number {
        const i = this.idMap[id];
        if (i === undefined) {
            throw new Error("Object not serialized");
        }
        return this.partialOffsets[i]!;
    }

    getPartialLength(id: number): number {
        const i = this.idMap[id];
        if (i === 0) {
            throw new Error("Object not serialized");
        }
        return this.partialLengths[i];
    }

    update(game: Game): void {
        this.stream.byteIndex = 0;

        for (const obj of game.partialObjs) {
            if (game.fullObjs.has(obj)) {
                game.partialObjs.delete(obj);
                continue;
            }
            const objId = obj.id;
            const objType = obj.__type;
            const index = this.idMap[objId];
            if (index === 0) continue;

            this.stream.byteIndex = this.partialOffsets[index];
            this.stream.writeUint16(objId);

            // @ts-expect-error ...
            ObjectSerializeFns[objType].serializePart(this.stream, obj);
        }

        for (const obj of game.fullObjs) {
            const objId = obj.id;
            const objType = obj.__type;
            const isNew = this.idMap[objId] === 0;

            if (isNew) {
                ++this.idCount;
                this.idMap[objId] = this.idCount;
                this.offsets[this.idCount] = this.head;
            }

            const index = this.idMap[objId];
            this.stream.byteIndex = this.offsets[index];
            this.stream.writeUint8(objType);

            if (isNew) {
                this.partialOffsets[this.idCount] = this.stream.byteIndex;
            }

            this.stream.writeUint16(objId);

            // @ts-expect-error ...
            ObjectSerializeFns[objType].serializePart(this.stream, obj);

            const partialLength = this.stream.byteIndex - this.offsets[index];

            // @ts-expect-error ...
            ObjectSerializeFns[objType].serializeFull(this.stream, obj);

            const length = this.stream.byteIndex - this.offsets[index];

            if (isNew) {
                this.head = this.stream.byteIndex;
                this.lengths[index] = length;
                this.partialLengths[index] = partialLength;
            } else {
                if (length !== this.lengths[index] || partialLength !== this.partialLengths[index]) {
                    throw new Error(`Serialization Cache: Object ${objType} changed length`);
                }
            }
        }
    }
}

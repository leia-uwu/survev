import type { Buffer } from "buffer";
export declare class BitView {
    constructor(buffer: ArrayBuffer | Buffer, byteLength?: number);

    readonly buffer: Buffer;
    readonly byteLength: number;

    getBits(offset: number, bits: number, signed?: boolean): number;

    getInt8(offset: number): number;

    getInt16(offset: number): number;

    getInt32(offset: number): number;

    getUint8(offset: number): number;

    getUint16(offset: number): number;

    getUint32(offset: number): number;

    getFloat32(offset: number): number;

    getFloat64(offset: number): number;

    setBits(offset: number, value: number, bits: number): void;

    setInt8(offset: number): void;

    setInt16(offset: number): void;

    setInt32(offset: number): void;

    setUint8(offset: number): void;

    setUint16(offset: number): void;

    setUint32(offset: number): void;

    setFloat32(offset: number, value: number): void;

    setFloat64(offset: number, value: number): void;
}

export declare class BitStream {
    constructor(
        source: ArrayBuffer | Buffer | BitView,
        byteOffset?: number,
        byteLength?: number,
    );

    readonly length: number;
    readonly bitsLeft: number;
    readonly buffer: Buffer;
    readonly view: BitView;
    byteIndex: number;
    index: number;

    readBits(bits: number, signed?: boolean): number;

    writeBits(value: number, bits: number): void;

    readBoolean(): boolean;

    readInt8(): number;

    readUint8(): number;

    readInt16(): number;

    readUint16(): number;

    readInt32(): number;

    readUint32(): number;

    readFloat32(): number;

    readFloat64(): number;

    writeBoolean(value: boolean): void;

    writeInt8(value: number): void;

    writeUint8(value: number): void;

    writeInt16(value: number): void;

    writeUint16(value: number): void;

    writeInt32(value: number): void;

    writeUint32(value: number): void;

    writeFloat32(value: number): void;

    writeFloat64(value: number): void;

    readASCIIString(length?: number): string;

    readUTF8String(length?: number): string;

    writeASCIIString(data: string, length?: number): void;

    writeUTF8String(data: string, length?: number): void;

    readBitStream(length: number): BitStream;

    readArrayBuffer(byteLength: number): Uint8Array;

    writeBitStream(stream: BitStream, length?: number): void;

    writeArrayBuffer(buffer: BitStream, length?: number): void;
}

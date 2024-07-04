import type { AbstractMsg, BitStream } from "./net";

export class DropItemMsg implements AbstractMsg {
    item = "";
    weapIdx = 0;

    serialize(s: BitStream) {
        s.writeGameType(this.item);
        s.writeUint8(this.weapIdx);
        s.writeBits(0, 6);
    }

    deserialize(s: BitStream) {
        this.item = s.readGameType();
        this.weapIdx = s.readUint8();
        s.readBits(6);
    }
}

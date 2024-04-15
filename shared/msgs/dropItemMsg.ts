import { AbstractMsg, type BitStream } from "../net";

export class DropItemMsg extends AbstractMsg {
    item = "";
    weapIdx = 0;

    override serialize(s: BitStream) {
        s.writeGameType(this.item);
        s.writeUint8(this.weapIdx);
        s.writeBits(0, 6);
    }

    override deserialize(s: BitStream) {
        this.item = s.readGameType();
        this.weapIdx = s.readUint8();
        s.readBits(6);
    }
}

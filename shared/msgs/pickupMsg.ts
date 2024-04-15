import { AbstractMsg, type BitStream } from "../net";

export class PickupMsg extends AbstractMsg {
    type = 0;
    item = "";
    count = 0;

    override serialize(s: BitStream) {
        s.writeUint8(this.type);
        s.writeGameType(this.item);
        s.writeUint8(this.count);
        s.writeBits(0, 6);
    }

    override deserialize(s: BitStream) {
        this.type = s.readUint8();
        this.item = s.readGameType();
        this.count = s.readUint8();
        s.readBits(6);
    }
}

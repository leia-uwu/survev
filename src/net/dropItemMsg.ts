import { Msg, MsgType, type SurvivBitStream } from "./net";

export class DropItemMsg extends Msg {
    msgType = MsgType.DropItem;

    item = "";
    weapIdx = 0;

    serialize(s: SurvivBitStream): void {
        s.writeGameType(this.item);
        s.writeUint8(this.weapIdx);
        s.writeBits(0, 6);
    }

    deserialize(s: SurvivBitStream): void {
        this.item = s.readGameType();
        this.weapIdx = s.readUint8();
        s.readBits(6);
    }
}

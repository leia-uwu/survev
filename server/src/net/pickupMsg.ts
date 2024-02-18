import { Msg, MsgType, type SurvivBitStream } from "./net";

export enum PickupMsgType {
    Full,
    AlreadyOwned,
    AlreadyEquipped,
    BetterItemEquipped,
    Success,
    GunCannotFire
}

export class PickupMsg extends Msg {
    msgType = MsgType.Pickup;

    type = PickupMsgType.Full;
    item = "";
    count = 0;

    serialize(s: SurvivBitStream): void {
        s.writeUint8(this.type);
        s.writeGameType(this.item);
        s.writeUint8(this.count);
        s.writeBits(0, 6);
    }

    deserialize(s: SurvivBitStream): void {
        this.type = s.readUint8();
        this.item = s.readGameType();
        this.count = s.readUint8();
        s.readBits(6);
    }
}

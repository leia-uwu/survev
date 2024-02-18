import { Msg, MsgType, type SurvivBitStream } from "./net";

export class PerkModeSelectMsg extends Msg {
    msgType = MsgType.PerkModeRoleSelect;

    role = "";

    serialize(s: SurvivBitStream): void {
        s.writeGameType(this.role);
        s.writeBits(0, 6);
    }

    deserialize(s: SurvivBitStream): void {
        this.role = s.readGameType();
        s.readBits(6);
    }
}

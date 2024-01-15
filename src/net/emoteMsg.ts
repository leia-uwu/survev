import { v2 } from "../utils/v2";
import { Msg, MsgType, type SurvivBitStream } from "./net";

export class EmoteMsg extends Msg {
    msgType = MsgType.Emote;

    pos = v2.create(0, 0);
    type = "";
    isPing = false;

    serialize(s: SurvivBitStream): void {
        s.writeVec(this.pos, 0, 0, 1024, 1024, 16);
        s.writeGameType(this.type);
        s.writeBoolean(this.isPing);
        s.writeBits(0, 5);
    }

    deserialize(s: SurvivBitStream): void {
        this.pos = s.readVec(0, 0, 1024, 1024, 16);
        this.type = s.readGameType();
        this.isPing = s.readBoolean();
        s.readBits(6);
    }
}

import { Msg, MsgType, type SurvivBitStream } from "./net";

export class SpectateMsg extends Msg {
    msgType = MsgType.Spectate;

    specBegin = false;
    specNext = false;
    specPrev = false;
    specForce = false;

    serialize(s: SurvivBitStream): void {
        s.writeBoolean(this.specBegin);
        s.writeBoolean(this.specNext);
        s.writeBoolean(this.specPrev);
        s.writeBoolean(this.specForce);
        s.writeBits(0, 4);
    }

    deserialize(s: SurvivBitStream): void {
        s.writeBoolean(this.specBegin);
        s.writeBoolean(this.specNext);
        s.writeBoolean(this.specPrev);
        s.writeBoolean(this.specForce);
        s.writeBits(0, 4);
    }
}

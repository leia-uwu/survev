import { Msg, MsgType, type SurvivBitStream } from "./net";

export class StatsMsg extends Msg {
    msgType = MsgType.Stats;

    data = "";

    serialize(s: SurvivBitStream): void {
        s.writeString(this.data);
    }

    deserialize(s: SurvivBitStream): void {
        this.data = s.readString();
    }
}

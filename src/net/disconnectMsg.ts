import { Msg, MsgType, type SurvivBitStream } from "./net";

export class DisconnectMsg extends Msg {
    msgType = MsgType.Disconnect;

    reason = "";

    serialize(s: SurvivBitStream): void {
        s.writeString(this.reason);
    }

    deserialize(s: SurvivBitStream): void {
        this.reason = s.readString();
    }
}

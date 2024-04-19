import { AbstractMsg, type BitStream } from "../net";

export class DisconnectMsg extends AbstractMsg {
    reason = "";

    override serialize(s: BitStream) {
        s.writeString(this.reason);
    }

    override deserialize(s: BitStream) {
        this.reason = s.readString();
    }
}

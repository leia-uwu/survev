import type { AbstractMsg, BitStream } from "./net";

export class DisconnectMsg implements AbstractMsg {
    reason = "";

    serialize(s: BitStream) {
        s.writeString(this.reason);
    }

    deserialize(s: BitStream) {
        this.reason = s.readString();
    }
}

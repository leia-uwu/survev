import type { AbstractMsg, BitStream } from "./net";

export class KillFeedMsg implements AbstractMsg {
    text = "";
    color = 0;

    serialize(s: BitStream) {
        s.writeASCIIString(this.text);
        s.writeAlignToNextByte();
        s.writeBits(this.color, 24);
    }

    deserialize(s: BitStream) {
        this.text = s.readASCIIString();
        s.readAlignToNextByte();
        this.color = s.readBits(24);
    }
}

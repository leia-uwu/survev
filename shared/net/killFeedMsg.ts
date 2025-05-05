import type { AbstractMsg, BitStream } from "./net";

export class KillFeedMsg implements AbstractMsg {
    text = "";
    color = 0;

    serialize(s: BitStream) {
        s.writeASCIIString(this.text);
        s.writeAlignToNextByte();
        s.writeUint8((this.color >> 16) & 0xff); //red
        s.writeUint8((this.color >> 8) & 0xff); //green
        s.writeUint8(this.color & 0xff); //blue
    }

    deserialize(s: BitStream) {
        this.text = s.readASCIIString();
        s.readAlignToNextByte();
        this.color =
            (s.readUint8() << 16) | //red
            (s.readUint8() << 8) | //green
            s.readUint8(); //blue
    }
}

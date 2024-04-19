import { AbstractMsg, type BitStream } from "../net";

export class SpectateMsg extends AbstractMsg {
    specBegin = false;
    specNext = false;
    specPrev = false;
    specForce = false;

    override serialize(s: BitStream) {
        s.writeBoolean(this.specBegin);
        s.writeBoolean(this.specNext);
        s.writeBoolean(this.specPrev);
        s.writeBoolean(this.specForce);
        s.writeBits(0, 4);
    }

    override deserialize(s: BitStream) {
        this.specBegin = s.readBoolean();
        this.specNext = s.readBoolean();
        this.specPrev = s.readBoolean();
        this.specForce = s.readBoolean();
        s.readBits(4);
    }
}

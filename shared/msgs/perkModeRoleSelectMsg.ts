import { AbstractMsg, type BitStream } from "../net";

export class PerkModeRoleSelectMsg extends AbstractMsg {
    role = "";

    override serialize(s: BitStream) {
        s.writeGameType(this.role);
        s.writeBits(0, 6);
    }

    override deserialize(s: BitStream) {
        this.role = s.readGameType();
        s.readBits(6);
    }
}

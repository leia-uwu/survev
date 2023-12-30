import { Msg, MsgType, NetConstants, type SurvivBitStream } from "./net";

export class JoinMsg extends Msg {
    override readonly type = MsgType.Join;

    protocol = 0;
    matchPriv = "";
    loadoutPriv = "";
    questPriv = "";
    name = "";
    useTouch = false;
    isMobile = false;
    proxy = false;
    otherProxy = false;
    bot = false;

    deserialize(s: SurvivBitStream): void {
        this.protocol = s.readUint32();
        this.matchPriv = s.readString();
        this.loadoutPriv = s.readString();
        this.questPriv = s.readString();
        this.name = s.readString(NetConstants.PlayerNameMaxLen);
        this.useTouch = s.readBoolean();
        this.isMobile = s.readBoolean();
        this.proxy = s.readBoolean();
        this.otherProxy = s.readBoolean();
        this.bot = s.readBoolean();
        s.readAlignToNextByte();
    }

    serialize(s: SurvivBitStream) {
        s.writeUint32(this.protocol);
        if (this.matchPriv) s.writeString(this.matchPriv);
        if (this.loadoutPriv) s.writeString(this.loadoutPriv);
        if (this.questPriv) s.writeString(this.questPriv);
        s.writeString(this.name, NetConstants.PlayerNameMaxLen);
        s.writeBoolean(this.useTouch);
        s.writeBoolean(this.isMobile);
        s.writeBoolean(this.proxy);
        s.writeBoolean(this.otherProxy);
        s.writeBoolean(this.bot);
        s.writeAlignToNextByte();
    }
}

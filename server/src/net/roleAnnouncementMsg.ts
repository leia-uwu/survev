import { Msg, MsgType, type SurvivBitStream } from "./net";

export class RoleAnnouncementMsg extends Msg {
    msgType = MsgType.RoleAnnouncement;

    playerId = 0;
    killerId = 0;
    role = "";
    assigned = false;
    killed = false;

    serialize(s: SurvivBitStream): void {
        s.writeUint16(this.playerId);
        s.writeUint16(this.killerId);
        s.writeGameType(this.role);
        s.writeBoolean(this.assigned);
        s.writeBoolean(this.killed);
        s.writeAlignToNextByte();
    }

    deserialize(s: SurvivBitStream): void {
        this.playerId = s.readUint16();
        this.killerId = s.readUint16();
        this.role = s.readGameType();
        this.assigned = s.readBoolean();
        this.killed = s.readBoolean();
        s.readAlignToNextByte();
    }
}

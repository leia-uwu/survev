import { Msg, MsgType, type SurvivBitStream } from "./net";

export class JoinedMsg extends Msg {
    override readonly type = MsgType.Joined;

    teamMode = 0;
    playerId = 0;
    started = false;
    emotes: string[] = [];

    serialize(s: SurvivBitStream): void {
        s.writeUint8(this.teamMode);
        s.writeUint16(this.playerId);
        s.writeBoolean(this.started);

        s.writeUint8(this.emotes.length);
        for (const emote of this.emotes) {
            s.writeGameType(emote);
        }
    }

    deserialize(s: SurvivBitStream): void {
        this.teamMode = s.readUint8();
        this.playerId = s.readUint16();
        this.started = s.readBoolean();

        const count = s.readUint8();
        for (let i = 0; i < count; i++) {
            this.emotes.push(s.readGameType());
        }
        s.readAlignToNextByte();
    }
}

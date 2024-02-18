import { GameConfig } from "../../../shared/gameConfig";
import { Msg, MsgType, type SurvivBitStream } from "./net";

export class LoadoutMsg extends Msg {
    msgType = MsgType.Loadout;

    emotes: string[] = [];
    custom = 0;

    serialize(s: SurvivBitStream): void {
        for (let i = 0; i < GameConfig.EmoteSlot.Count; i++) {
            s.writeGameType(this.emotes[i]);
        }
        s.writeUint8(this.custom);
        s.readAlignToNextByte();
    }

    deserialize(s: SurvivBitStream): void {
        for (let i = 0; i < GameConfig.EmoteSlot.Count; i++) {
            this.emotes.push(s.readGameType());
        }
        this.custom = s.readUint8();
        s.writeAlignToNextByte();
    }
}

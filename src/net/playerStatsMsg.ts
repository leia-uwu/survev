import { Msg, MsgType, type SurvivBitStream } from "./net";

export class PlayerStatsMsg extends Msg {
    override readonly msgType = MsgType.PlayerStats;

    playerId = 0;
    playerStats = {
        playerId: 0,
        timeAlive: 0,
        kills: 0,
        dead: false,
        damageDealt: 0,
        damageTaken: 0
    };

    override deserialize(s: SurvivBitStream) {
        this.playerId = s.readUint16();
        this.playerStats = {
            playerId: this.playerId,
            timeAlive: s.readUint16(),
            kills: s.readUint8(),
            dead: !!s.readUint8(),
            damageDealt: s.readUint16(),
            damageTaken: s.readUint16()
        };
    }

    override serialize(s: SurvivBitStream) {
        s.writeUint16(this.playerId);
        s.writeUint16(this.playerStats.timeAlive);
        s.writeUint8(this.playerStats.kills);
        s.writeUint8(+this.playerStats.dead);
        s.writeUint16(this.playerStats.damageDealt);
        s.writeUint16(this.playerStats.damageTaken);
    }
}

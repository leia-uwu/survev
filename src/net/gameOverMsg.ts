import { PlayerStatsMsg } from "./playerStatsMsg";
import { Msg, MsgType, type SurvivBitStream } from "./net";

export class GameOverMsg extends Msg {
    override readonly msgType = MsgType.GameOver;

    teamId = 1;
    teamRank = 0;
    gameOver = false;
    winningTeamId = 0;
    playerStats: Array<PlayerStatsMsg["playerStats"]> = [];

    override deserialize(s: SurvivBitStream) {
        this.teamId = s.readUint8();
        this.teamRank = s.readUint8();
        this.gameOver = !!s.readUint8();
        this.winningTeamId = s.readUint8();

        const count = s.readUint8();
        for (let i = 0; i < count; i++) {
            const statsMsg = new PlayerStatsMsg();
            statsMsg.deserialize(s);
            this.playerStats.push(statsMsg.playerStats);
        }
    }

    override serialize(s: SurvivBitStream): void {
        s.writeUint8(this.teamId);
        s.writeUint8(this.teamRank);
        s.writeUint8(+this.gameOver);
        s.writeUint8(this.winningTeamId);

        s.writeUint8(this.playerStats.length);
        for (const stats of this.playerStats) {
            const statsMsg = new PlayerStatsMsg();
            statsMsg.playerId = stats.playerId;
            statsMsg.playerStats = stats;
            statsMsg.serialize(s);
        }
    }
}

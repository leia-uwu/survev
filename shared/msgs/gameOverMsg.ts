import { AbstractMsg, type BitStream } from "../net";
import { PlayerStatsMsg } from "./playerStatsMsg";

export class GameOverMsg extends AbstractMsg {
    teamId = 0;
    teamRank = 0;
    gameOver = false;
    winningTeamId = 0;
    playerStats: Array<PlayerStatsMsg["playerStats"]> = [];

    override serialize(s: BitStream) {
        s.writeUint8(this.teamId);
        s.writeUint8(this.teamRank);
        s.writeUint8(+this.gameOver);
        s.writeUint8(this.winningTeamId);

        s.writeUint8(this.playerStats.length);
        for (let i = 0; i < this.playerStats.length; i++) {
            const stats = this.playerStats[i];
            const statsMsg = new PlayerStatsMsg();
            statsMsg.playerId = stats.playerId;
            statsMsg.playerStats = stats;
            statsMsg.serialize(s);
        }
    }

    override deserialize(s: BitStream) {
        this.teamId = s.readUint8();
        this.teamRank = s.readUint8();
        // !
        // @ts-expect-error suppressed
        this.gameOver = s.readUint8();
        this.winningTeamId = s.readUint8();
        for (let count = s.readUint8(), i = 0; i < count; i++) {
            const statsMsg = new PlayerStatsMsg();
            statsMsg.deserialize(s);
            this.playerStats.push(statsMsg.playerStats);
        }
    }
}

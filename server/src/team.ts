import { type Player } from "./objects/player";
import { type DamageParams } from "../src/objects/gameObject";
import { GameConfig } from "../../shared/gameConfig";
import { v2 } from "../../shared/utils/v2";

export class Team {
    players: Player[] = [];

    add(player: Player) {
        this.players.push(player);
    }

    isTeammate(player: Player) {
        return this.players.includes(player);
    }

    /**
     * true if all ALIVE teammates besides the passed in player are downed
     */
    allTeammatesDowned(player: Player) {
        const filteredPlayers = this.players.filter(p => p != player && !p.dead);
        if (filteredPlayers.length == 0) { // this is necessary since for some dumb reason every() on an empty array returns true????
            return false;
        }
        return filteredPlayers.every(p => p.downed);
    }

    /**
     * true if all teammates besides the passed in player are dead
     */
    allTeammatesDead(player: Player) {
        const filteredPlayers = this.players.filter(p => p != player);
        if (filteredPlayers.length == 0) { // this is necessary since for some dumb reason every() on an empty array returns true????
            return false;
        }
        return filteredPlayers.every(p => p.dead);
    }

    /**
     * kills all teammates besides the passed in player, only called after last player on team thats not knocked gets knocked
     */
    killAllTeammates(player: Player) {
        for (const p of this.players) {
            if (p == player) continue;
            const params: DamageParams = {
                damageType: GameConfig.DamageType.Bleeding,
                dir: v2.create(0, 0),
                source: p.downedBy
            };
            p.kill(params);
        }
    }
}

import { GameConfig } from "../../../shared/gameConfig";
import type { Player } from "./objects/player";

export class Team {
    players: Player[] = [];
    livingPlayers: Player[] = [];

    constructor(public teamId: number) {}

    addPlayer(player: Player): void {
        player.teamId = this.teamId;
        player.team = this;
        this.players.push(player);
        this.livingPlayers.push(player);
    }

    removePlayer(player: Player): void {
        this.players.splice(this.players.indexOf(player), 1);
        this.livingPlayers.splice(this.livingPlayers.indexOf(player), 1);
    }

    checkAllDowned(player: Player): boolean {
        // players with self_revive are discarded from the check since they can get downed "independently"
        // they have no influence over the other downed teammates and how the code measures them
        const filteredPlayers = this.livingPlayers.filter(
            (p) => p != player && !p.hasPerk("self_revive"),
        );
        if (filteredPlayers.length == 0) {
            // this is necessary since for some dumb reason every() on an empty array returns true????
            return false;
        }
        return filteredPlayers.every((p) => p.downed);
    }

    checkAllDead(player: Player): boolean {
        return this.livingPlayers.length == 1 && this.livingPlayers[0] == player;
    }

    killAllTeammates() {
        for (let i = 0; i < this.livingPlayers.length; i++) {
            const p = this.livingPlayers[i];
            p.kill({
                damageType: GameConfig.DamageType.Bleeding,
                dir: p.dir,
                source: p.downedBy,
            });
        }
    }
}

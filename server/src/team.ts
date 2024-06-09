import { type Player } from "./objects/player";
import { type DamageParams } from "../src/objects/gameObject";
import { GameConfig } from "../../shared/gameConfig";
import { v2 } from "../../shared/utils/v2";
import { util } from "../../shared/utils/util";

export class Team {
    id: number;
    allDeadOrDisconnected = false;
    players: Player[] = [];

    constructor(id: number){
        this.id = id;
    }

    getAlivePlayers(){
        return this.players.filter(p => !p.dead);
    }

    getAliveTeammates(player: Player){
        return this.getAlivePlayers().filter(p => p != player);
    }

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
     * also if player is solo queuing, all teammates are "dead" by default
     */
    allTeammatesDeadOrDisconnected(player: Player) {//TODO: potentially replace with allDead?
        if (this.players.length == 1 && this.players[0] == player){
            return true;
        }

        const filteredPlayers = this.players.filter(p => p != player);
        if (filteredPlayers.length == 0) { // this is necessary since for some dumb reason every() on an empty array returns true????
            return false;
        }
        return filteredPlayers.every(p => p.dead || p.disconnected);
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

    /**
     * 
     * @param player optional player to exclude
     * @returns random player
     */
    randomPlayer(player?: Player) {
        const players = player ? this.players.filter(p => p != player) : this.players;
        return players[util.randomInt(0, this.players.length - 1)];
    }

    /** gets next alive player in the array, loops around if end is reached */
    nextPlayer(currentPlayer: Player){
        const alivePlayers = this.getAlivePlayers();
        const currentPlayerIndex = alivePlayers.indexOf(currentPlayer);
        const newIndex = (currentPlayerIndex + 1) % alivePlayers.length;
        return alivePlayers[newIndex];
    }

    /** gets previous alive player in the array, loops around if beginning is reached */
    prevPlayer(currentPlayer: Player){
        const alivePlayers = this.getAlivePlayers();
        const currentPlayerIndex = alivePlayers.indexOf(currentPlayer);
        const newIndex = currentPlayerIndex == 0 ? alivePlayers.length - 1 : currentPlayerIndex - 1;
        return alivePlayers[newIndex];
    }

    addGameOverMsg(winningTeamId: number = -1){
        for (const p of this.players){
            p.addGameOverMsg(winningTeamId);
            for (const spectator of p.spectators) {
                spectator.addGameOverMsg(winningTeamId);
            }
        }
    }
}

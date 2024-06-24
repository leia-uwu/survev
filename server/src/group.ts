import { type Player } from "./objects/player";
import { GameConfig } from "../../shared/gameConfig";
import { util } from "../../shared/utils/util";

export class Group {
    groupId: number;
    /**
     * Faction mode team ID.
     * Same as group id when not in faction mode.
     * 0 is no team
     * 1 is red
     * 2 is blue
     */
    teamId: number;
    allDeadOrDisconnected = false;
    players: Player[] = [];

    constructor(groupId: number, teamId: number) {
        this.groupId = groupId;
        this.teamId = teamId;
    }

    /**
     * getPlayers((p) => !p.dead) : gets all alive players on team
     */
    getPlayers(playerFilter?: (player: Player) => (boolean)) {
        if (!playerFilter) return this.players;

        return this.players.filter(p => playerFilter(p));
    }

    getAlivePlayers() {
        return this.getPlayers(p => !p.dead && !p.disconnected);
    }

    getAliveTeammates(player: Player) {
        return this.getPlayers(p => p != player && !p.dead && !p.disconnected);
    }

    addPlayer(player: Player) {
        player.groupId = this.groupId;
        player.teamId = this.teamId;
        player.group = this;
        player.setGroupStatuses();
        player.playerStatusDirty = true;
        this.players.push(player);
    }

    removePlayer(player: Player) {
        this.players.splice(this.players.indexOf(player), 1);
        this.checkPlayers();
    }

    /**
     * true if all ALIVE teammates besides the passed in player are downed
     */
    checkAllDowned(player: Player) {
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
    checkAllDeadOrDisconnected(player: Player) { // TODO: potentially replace with allDead?
        if (this.players.length == 1 && this.players[0] == player) {
            return true;
        }

        const filteredPlayers = this.players.filter(p => p != player);
        if (filteredPlayers.length == 0) { // this is necessary since for some dumb reason every() on an empty array returns true????
            return false;
        }
        return filteredPlayers.every(p => p.dead || p.disconnected);
    }

    /**
     * kills all teammates, only called after last player on team thats not knocked gets knocked
     */
    killAllTeammates() {
        for (const p of this.players) {
            p.kill({
                damageType: GameConfig.DamageType.Bleeding,
                dir: p.dir,
                source: p.downedBy
            });
        }
    }

    checkPlayers(): void {
        if (this.allDeadOrDisconnected) return;

        for (const player of this.players) {
            if (player.dead || player.disconnected) {
                this.allDeadOrDisconnected = true;
                break;
            }
        }
    }

    /**
     *
     * @param player optional player to exclude
     * @returns random player
     */
    randomPlayer(player?: Player) {
        const players = player ? this.getPlayers(p => p != player) : this.players;
        return players[util.randomInt(0, this.players.length - 1)];
    }

    /** gets next alive player in the array, loops around if end is reached */
    nextPlayer(currentPlayer: Player) {
        // const alivePlayers = this.getAlivePlayers();
        const alivePlayers = this.getPlayers(p => !p.dead && !p.disconnected);
        const currentPlayerIndex = alivePlayers.indexOf(currentPlayer);
        const newIndex = (currentPlayerIndex + 1) % alivePlayers.length;
        return alivePlayers[newIndex];
    }

    /** gets previous alive player in the array, loops around if beginning is reached */
    prevPlayer(currentPlayer: Player) {
        // const alivePlayers = this.getAlivePlayers();
        const alivePlayers = this.getPlayers(p => !p.dead && !p.disconnected);
        const currentPlayerIndex = alivePlayers.indexOf(currentPlayer);
        const newIndex = currentPlayerIndex == 0 ? alivePlayers.length - 1 : currentPlayerIndex - 1;
        return alivePlayers[newIndex];
    }

    addGameOverMsg(winningTeamId: number = -1) {
        for (const p of this.players) {
            p.addGameOverMsg(winningTeamId);
            for (const spectator of p.spectators) {
                spectator.addGameOverMsg(winningTeamId);
            }
        }
    }
}

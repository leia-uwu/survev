import { GameConfig } from "../../../shared/gameConfig";
import { util } from "../../../shared/utils/util";
import type { Player } from "./objects/player";

export class Group {
    hash: string;
    groupId: number;
    allDeadOrDisconnected = true; //only set to false when first player is added to the group
    players: Player[] = [];
    livingPlayers: Player[] = [];
    autoFill: boolean;

    maxPlayers: number;
    reservedSlots = 0;

    canJoin(players: number) {
        return this.maxPlayers - this.reservedSlots - players >= 0;
    }

    constructor(hash: string, groupId: number, autoFill: boolean, maxPlayers: number) {
        this.hash = hash;
        this.groupId = groupId;
        this.autoFill = autoFill;
        this.maxPlayers = maxPlayers;
    }

    /**
     * getPlayers((p) => !p.dead) : gets all alive players on team
     */
    getPlayers(playerFilter?: (player: Player) => boolean) {
        if (!playerFilter) return this.players;

        return this.players.filter((p) => playerFilter(p));
    }

    getAlivePlayers() {
        return this.getPlayers((p) => !p.dead && !p.disconnected);
    }

    getAliveTeammates(player: Player) {
        return this.getPlayers((p) => p != player && !p.dead && !p.disconnected);
    }

    addPlayer(player: Player) {
        player.groupId = this.groupId;
        player.group = this;
        player.setGroupStatuses();
        player.playerStatusDirty = true;
        this.players.push(player);
        this.livingPlayers.push(player);
        this.allDeadOrDisconnected = false;
        this.checkPlayers();
    }

    removePlayer(player: Player) {
        this.players.splice(this.players.indexOf(player), 1);
        this.checkPlayers();
    }

    /**
     * true if all ALIVE teammates besides the passed in player are downed
     */
    checkAllDowned(player: Player) {
        for (const p of this.players) {
            if (p === player) continue;
            if (p.downed) continue;
            if (p.dead) continue;
            if (p.disconnected) continue;
            return false;
        }
        return true;
    }

    /**
     * true if all teammates besides the passed in player are dead
     * also if player is solo queuing, all teammates are "dead" by default
     */
    checkAllDeadOrDisconnected(player: Player) {
        const alivePlayers = this.players.filter(
            (p) => (!p.dead || !p.disconnected) && p !== player,
        );
        return alivePlayers.length <= 0;
    }

    /**
     * kills all teammates, only called after last player on team thats not knocked gets knocked
     */
    killAllTeammates() {
        const alivePlayers = this.getAlivePlayers();
        for (const p of alivePlayers) {
            p.kill({
                damageType: GameConfig.DamageType.Bleeding,
                dir: p.dir,
                source: p.downedBy,
            });
        }
    }

    checkPlayers(): void {
        this.livingPlayers = this.players.filter((p) => !p.dead);
        this.allDeadOrDisconnected = this.players.every((p) => p.dead || p.disconnected);
    }

    /**
     *
     * @param player optional player to exclude
     * @returns random alive player
     */
    randomPlayer(player?: Player) {
        const alivePlayers = player
            ? this.getAliveTeammates(player)
            : this.getAlivePlayers();
        return alivePlayers[util.randomInt(0, alivePlayers.length - 1)];
    }

    /** gets next alive player in the array, loops around if end is reached */
    nextPlayer(currentPlayer: Player) {
        // const alivePlayers = this.getAlivePlayers();
        const alivePlayers = this.getPlayers((p) => !p.dead && !p.disconnected);
        const currentPlayerIndex = alivePlayers.indexOf(currentPlayer);
        const newIndex = (currentPlayerIndex + 1) % alivePlayers.length;
        return alivePlayers[newIndex];
    }

    /** gets previous alive player in the array, loops around if beginning is reached */
    prevPlayer(currentPlayer: Player) {
        // const alivePlayers = this.getAlivePlayers();
        const alivePlayers = this.getPlayers((p) => !p.dead && !p.disconnected);
        const currentPlayerIndex = alivePlayers.indexOf(currentPlayer);
        const newIndex =
            currentPlayerIndex == 0 ? alivePlayers.length - 1 : currentPlayerIndex - 1;
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

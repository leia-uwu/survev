import { GameConfig, TeamMode } from "../../../shared/gameConfig";
import { ObjectType } from "../../../shared/net/objectSerializeFns";
import type { PlayerStatus } from "../../../shared/net/updateMsg";
import { collider } from "../../../shared/utils/collider";
import { util } from "../../../shared/utils/util";
import { v2 } from "../../../shared/utils/v2";
import type { Game } from "./game";
import type { DamageParams } from "./objects/gameObject";
import type { Player } from "./objects/player";

enum GameMode {
    /** default solos, any map besides factions */
    Solo,
    /** default duos or squads, any map besides factions */
    Team,
    /** irrelevant to gamemode type, always the mode if faction map is selected */
    Faction,
}

export class GameModeManager {
    readonly game: Game;
    readonly mode: GameMode;
    readonly isSolo: boolean;

    constructor(game: Game) {
        this.game = game;

        this.mode = [
            game.teamMode == TeamMode.Solo && !game.map.factionMode,
            game.teamMode != TeamMode.Solo && !game.map.factionMode,
            game.map.factionMode,
        ].findIndex((isMode) => isMode);

        this.isSolo = this.mode === GameMode.Solo;
    }

    aliveCount(): number {
        switch (this.mode) {
            case GameMode.Solo:
                return this.game.playerBarn.livingPlayers.length;
            case GameMode.Team:
                return this.game.playerBarn.getAliveGroups().length;
            case GameMode.Faction:
                return this.game.playerBarn.getAliveTeams().length;
        }
    }

    /** true if game needs to end */
    handleGameEnd(): boolean {
        if (!this.game.started || this.aliveCount() > 1) return false;
        switch (this.mode) {
            case GameMode.Solo: {
                const winner = this.game.playerBarn.livingPlayers[0];
                winner.addGameOverMsg(winner.teamId);
                return true;
            }
            case GameMode.Team: {
                const winner = this.game.playerBarn.getAliveGroups()[0];
                for (const player of winner.getAlivePlayers()) {
                    player.addGameOverMsg(winner.groupId);
                }
                return true;
            }
            case GameMode.Faction: {
                const winner = this.game.playerBarn.getAliveTeams()[0];
                for (const player of winner.livingPlayers) {
                    player.addGameOverMsg(winner.teamId);
                }
                return true;
            }
        }
    }

    isGameStarted(): boolean {
        return this.aliveCount() > 1;
    }

    updateAliveCounts(aliveCounts: number[]): void {
        switch (this.mode) {
            case GameMode.Solo:
            case GameMode.Team:
                aliveCounts.push(this.game.aliveCount);
                break;
            case GameMode.Faction:
                const numFactions = this.game.map.mapDef.gameMode.factions!;
                for (let i = 0; i < numFactions; i++) {
                    aliveCounts.push(this.game.playerBarn.teams[i].livingPlayers.length);
                }
                break;
        }
    }

    /**
     * Solos: all living players in game wrapped in outer array
     *
     * Duos/Squads: 2D array of living players in each group
     *
     * Factions: 2D array of living players on each team
     */
    getAlivePlayersContext(): Player[][] {
        switch (this.mode) {
            case GameMode.Solo:
                return [this.game.playerBarn.livingPlayers];
            case GameMode.Team:
                return this.game.playerBarn.groups.map((g) => g.livingPlayers);
            case GameMode.Faction:
                return this.game.playerBarn.teams.map((t) => t.livingPlayers);
        }
    }

    getSpectatablePlayers(player: Player): Player[] {
        let playerFilter: (p: Player) => boolean;
        if (this.getPlayerAlivePlayersContext(player).length != 0) {
            playerFilter = (p: Player) => !p.disconnected && p.teamId == player.teamId;
        } else {
            playerFilter = (p: Player) => !p.disconnected;
        }
        // livingPlayers is used here instead of a more "efficient" option because its sorted while other options are not
        return this.game.playerBarn.livingPlayers.filter(playerFilter);
    }

    getPlayerStatusPlayers(player: Player): Player[] | undefined {
        switch (this.mode) {
            case GameMode.Solo:
                return undefined;
            case GameMode.Team:
                return player.group!.players;
            case GameMode.Faction:
                return this.game.playerBarn.players;
        }
    }

    getPlayerAlivePlayersContext(player: Player): Player[] {
        switch (this.mode) {
            case GameMode.Solo:
                return !player.dead ? [player] : [];
            case GameMode.Team:
                return player.group!.livingPlayers;
            case GameMode.Faction:
                return player.team!.livingPlayers;
        }
    }

    getIdContext(player: Player): number {
        switch (this.mode) {
            case GameMode.Solo:
                return player.__id;
            case GameMode.Team:
                return player.groupId;
            case GameMode.Faction:
                return player.teamId;
        }
    }

    /** includes passed in player */
    getNearbyAlivePlayersContext(player: Player, range: number): Player[] {
        const alivePlayersContext = this.getPlayerAlivePlayersContext(player);

        //probably more efficient when there's 4 or less players in the context (untested)
        if (alivePlayersContext.length <= 4) {
            return alivePlayersContext.filter(
                (p) =>
                    !!util.sameLayer(player.layer, p.layer) &&
                    v2.lengthSqr(v2.sub(player.pos, p.pos)) <= range * range,
            );
        }

        const playerIdContext = this.getIdContext(player);
        return this.game.grid
            .intersectCollider(collider.createCircle(player.pos, range))
            .filter(
                (obj): obj is Player =>
                    obj.__type == ObjectType.Player &&
                    playerIdContext == this.getIdContext(obj) &&
                    !obj.dead && //necessary since player isnt deleted from grid on death
                    !!util.sameLayer(player.layer, obj.layer) &&
                    v2.lengthSqr(v2.sub(player.pos, obj.pos)) <= range * range,
            );
    }

    /**
     * by default, true if the current context mode supports reviving
     *
     * always true regardless of context mode with self revive
     * @param playerReviving player that initializes the revive action
     */
    canRevive(playerReviving: Player): boolean {
        return playerReviving.hasPerk("self_revive") || !this.isSolo;
    }

    isReviving(player: Player): boolean {
        if (this.isSolo) return false;

        return player.actionType == GameConfig.Action.Revive && !!player.action.targetId;
    }

    isBeingRevived(player: Player): boolean {
        if (!player.downed || this.isSolo) return false;

        const normalRevive =
            player.actionType == GameConfig.Action.Revive && player.action.targetId == 0;
        if (normalRevive) return true;

        const numMedics = this.game.playerBarn.medics.length;
        if (numMedics) {
            return this.game.playerBarn.medics.some((medic) => {
                return (
                    medic != player &&
                    this.isReviving(medic) &&
                    player.isAffectedByAOE(medic)
                );
            });
        }
        return false;
    }

    showStatsMsg(player: Player): boolean {
        switch (this.mode) {
            case GameMode.Solo:
                return false;
            case GameMode.Team:
                return !player.group!.allDeadOrDisconnected && this.aliveCount() > 1;
            case GameMode.Faction:
                /**
                 * temporary fix for when you kill the last non knocked player on a team
                 * and all of the knocked players are supposed to bleed out
                 * technically everyone is "dead" at this point and the stats message shouldnt show for anyone
                 * but since the last knocked player gets killed first the downed teammates are technically still "alive"
                 *
                 * i believe the solution is to separate kills and gameovermsgs so that all kills in a tick get done first
                 * then all gameovermsgs get done after
                 * for (const kill of kills){};
                 * for (const msg of gameovermsgs){};
                 */
                if (player.team!.checkAllDowned(player)) return false;

                if (!this.game.isTeamMode) {
                    //stats msg can only show in solos if it's also faction mode
                    return this.aliveCount() > 1;
                }

                return !player.group!.allDeadOrDisconnected && this.aliveCount() > 1;
        }
    }

    getPlayerStatuses(player: Player): PlayerStatus[] {
        if (this.isSolo) return [];

        const players: Player[] = this.getPlayerStatusPlayers(player)!;
        return players.map((p) => ({
            hasData: p.playerStatusDirty,
            pos: p.pos,
            visible: p.teamId === player.teamId || p.timeUntilHidden > 0,
            dead: p.dead,
            downed: p.downed,
            role: p.role,
        }));
    }

    handlePlayerDeath(player: Player, params: DamageParams): void {
        switch (this.mode) {
            case GameMode.Solo:
                return player.kill(params);
            case GameMode.Team:
                {
                    const sourceIsPlayer = params.source?.__type === ObjectType.Player;
                    const group = player.group!;
                    if (player.downed) {
                        const finishedByTeammate =
                            player.downedBy &&
                            sourceIsPlayer &&
                            player.downedBy.groupId === (params.source as Player).groupId;

                        const bledOut =
                            player.downedBy &&
                            params.damageType == GameConfig.DamageType.Bleeding;

                        if (finishedByTeammate || bledOut) {
                            params.source = player.downedBy;
                        }

                        player.kill(params);
                        //special case that only happens when the player has self_revive since the teammates wouldnt have previously been finished off
                        if (group.checkAllDowned(player)) {
                            group.killAllTeammates();
                        }
                        return;
                    }

                    const allDeadOrDisconnected =
                        group.checkAllDeadOrDisconnected(player);
                    const allDowned = group.checkAllDowned(player);
                    const groupHasSelfRevive = group.livingPlayers.find((p) =>
                        p.hasPerk("self_revive"),
                    );

                    if (!groupHasSelfRevive && (allDeadOrDisconnected || allDowned)) {
                        group.allDeadOrDisconnected = true; // must set before any kill() calls so the gameovermsgs are accurate
                        player.kill(params);
                        if (allDowned) {
                            group.killAllTeammates();
                        }
                    } else {
                        player.down(params);
                    }
                }
                break;
            case GameMode.Faction:
                {
                    const sourceIsPlayer = params.source?.__type === ObjectType.Player;
                    const team = player.team!;
                    if (player.downed) {
                        const finishedByTeammate =
                            player.downedBy &&
                            sourceIsPlayer &&
                            player.downedBy.teamId === (params.source as Player).teamId;

                        const bledOut =
                            player.downedBy &&
                            params.damageType == GameConfig.DamageType.Bleeding;

                        if (finishedByTeammate || bledOut) {
                            params.source = player.downedBy;
                        }

                        player.kill(params);
                        //special case that only happens when the player has self_revive since the teammates wouldnt have previously been finished off
                        if (team.checkAllDowned(player)) {
                            team.killAllTeammates();
                        }
                        return;
                    }

                    const allDead = team.checkAllDead(player);
                    const allDowned = team.checkAllDowned(player);

                    if (allDead || allDowned) {
                        player.kill(params);
                        if (allDowned) {
                            team.killAllTeammates();
                        }
                    } else {
                        player.down(params);
                    }
                }
                break;
        }
    }
}

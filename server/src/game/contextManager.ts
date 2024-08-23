import { GameConfig } from "../../../shared/gameConfig";
import { ObjectType } from "../../../shared/net/objectSerializeFns";
import type { PlayerStatus } from "../../../shared/net/updateMsg";
import { collider } from "../../../shared/utils/collider";
import { util } from "../../../shared/utils/util";
import { v2 } from "../../../shared/utils/v2";
import { TeamMode } from "../config";
import type { Game } from "./game";
import type { DamageParams } from "./objects/gameObject";
import type { Player } from "./objects/player";
enum ContextMode {
    Solo,
    Team,
    Faction,
}

export class ContextManager {
    private _game: Game;
    private _contextMode: ContextMode;

    constructor(game: Game) {
        this._game = game;

        this._contextMode = [
            game.teamMode == TeamMode.Solo && !game.map.factionMode,
            game.teamMode != TeamMode.Solo && !game.map.factionMode,
            game.map.factionMode,
        ].findIndex((isMode) => isMode);
    }

    private _applyContext<T>(contextObj: Record<ContextMode, () => T>) {
        return contextObj[this._contextMode]();
    }

    aliveCount(): number {
        return this._applyContext<number>({
            [ContextMode.Solo]: () => this._game.playerBarn.livingPlayers.length,
            [ContextMode.Team]: () => this._game.getAliveGroups().length,
            [ContextMode.Faction]: () => this._game.getAliveTeams().length, //tbd
        });
    }

    /** true if game needs to end */
    handleGameEnd(): boolean {
        return this._applyContext<boolean>({
            [ContextMode.Solo]: () => {
                if (!this._game.started || this.aliveCount() > 1) return false;
                const winner = this._game.playerBarn.livingPlayers[0];
                winner.addGameOverMsg(winner.teamId);
                return true;
            },
            [ContextMode.Team]: () => {
                if (!this._game.started || this.aliveCount() > 1) return false;
                const winner = this._game.getAliveGroups()[0];
                for (const player of winner.getAlivePlayers()) {
                    player.addGameOverMsg(winner.groupId);
                }
                return true;
            },
            [ContextMode.Faction]: () => {
                if (!this._game.started || this.aliveCount() > 1) return false;
                const winner = this._game.getAliveTeams()[0];
                for (const player of winner.livingPlayers) {
                    player.addGameOverMsg(winner.teamId);
                }
                return true;
            },
        });
    }

    isGameStarted(): boolean {
        return this._applyContext<boolean>({
            [ContextMode.Solo]: () => this.aliveCount() > 1,
            [ContextMode.Team]: () => this.aliveCount() > 1,
            [ContextMode.Faction]: () => this.aliveCount() > 1, //tbd
        });
    }

    updateAliveCounts(aliveCounts: number[]): void {
        return this._applyContext<void>({
            [ContextMode.Solo]: () => aliveCounts.push(this._game.aliveCount),
            [ContextMode.Team]: () => aliveCounts.push(this._game.aliveCount),
            [ContextMode.Faction]: () => {
                const numFactions = this._game.map.mapDef.gameMode.factions;
                if (!numFactions) return;
                for (let i = 0; i < numFactions; i++) {
                    aliveCounts.push(this._game.teams[i].livingPlayers.length);
                }
            },
        });
    }

    /**
     * Solos: all living players in game wrapped in outer array
     *
     * Duos/Squads: 2D array of living players in each group
     *
     * Factions: 2D array of living players on each team
     */
    getAlivePlayersContext(): Player[][] {
        return this._applyContext<Player[][]>({
            [ContextMode.Solo]: () => [this._game.playerBarn.livingPlayers],
            [ContextMode.Team]: () =>
                [...this._game.groups.values()].map((g) => g.livingPlayers),
            [ContextMode.Faction]: () => this._game.teams.map((t) => t.livingPlayers),
        });
    }

    getPlayerStatusPlayers(player: Player): Player[] | undefined {
        return this._applyContext<Player[] | undefined>({
            [ContextMode.Solo]: () => undefined,
            [ContextMode.Team]: () => player.group!.players,
            [ContextMode.Faction]: () => this._game.playerBarn.players,
        });
    }

    getPlayerAlivePlayersContext(player: Player): Player[] {
        return this._applyContext<Player[]>({
            [ContextMode.Solo]: () => (!player.dead ? [player] : []),
            [ContextMode.Team]: () => player.group!.livingPlayers,
            [ContextMode.Faction]: () => player.team!.livingPlayers,
        });
    }

    getIdContext(player: Player): number {
        return this._applyContext<number>({
            [ContextMode.Solo]: () => player.__id,
            [ContextMode.Team]: () => player.groupId,
            [ContextMode.Faction]: () => player.teamId,
        });
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
        return this._game.grid
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

    /** if the current context mode supports reviving, unrelated to individual players */
    canRevive(): boolean {
        return this._applyContext<boolean>({
            [ContextMode.Solo]: () => false,
            [ContextMode.Team]: () => true,
            [ContextMode.Faction]: () => true,
        });
    }

    isReviving(player: Player): boolean {
        return this._applyContext<boolean>({
            [ContextMode.Solo]: () => false,
            [ContextMode.Team]: () => {
                return (
                    player.actionType == GameConfig.Action.Revive &&
                    !!player.action.targetId
                );
            },
            [ContextMode.Faction]: () => {
                return (
                    player.actionType == GameConfig.Action.Revive &&
                    !!player.action.targetId
                );
            },
        });
    }

    isBeingRevived(player: Player): boolean {
        if (!player.downed) return false;
        return this._applyContext<boolean>({
            [ContextMode.Solo]: () => false,
            [ContextMode.Team]: () => {
                return (
                    player.actionType == GameConfig.Action.Revive &&
                    player.action.targetId == 0
                );
            },
            [ContextMode.Faction]: () => {
                const normalRevive =
                    player.actionType == GameConfig.Action.Revive &&
                    player.action.targetId == 0;
                if (normalRevive) return true;

                const numMedics = this._game.playerBarn.medics.length;
                if (numMedics) {
                    return Boolean(
                        this._game.playerBarn.medics.find((medic) => {
                            return (
                                medic != player &&
                                this.isReviving(medic) &&
                                player.isAffectedByAOE(medic)
                            );
                        }),
                    );
                }
                return false;
            },
        });
    }

    showStatsMsg(player: Player): boolean {
        return this._applyContext<boolean>({
            [ContextMode.Solo]: () => false,
            [ContextMode.Team]: () =>
                !player.group!.allDeadOrDisconnected && this.aliveCount() > 1,
            [ContextMode.Faction]: () => {
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

                if (!this._game.isTeamMode) {
                    //stats msg can only show in solos if it's also faction mode
                    return this.aliveCount() > 1;
                }

                return !player.group!.allDeadOrDisconnected && this.aliveCount() > 1;
            },
        });
    }

    getPlayerStatuses(player: Player): PlayerStatus[] {
        if (this._contextMode == ContextMode.Solo) return [];

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
        return this._applyContext<void>({
            [ContextMode.Solo]: () => player.kill(params),
            [ContextMode.Team]: () => {
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

                const allDeadOrDisconnected = group.checkAllDeadOrDisconnected(player);
                const allDowned = group.checkAllDowned(player);

                if (allDeadOrDisconnected || allDowned) {
                    group.allDeadOrDisconnected = true; // must set before any kill() calls so the gameovermsgs are accurate
                    player.kill(params);
                    if (allDowned) {
                        group.killAllTeammates();
                    }
                } else {
                    player.down(params);
                }
            },
            [ContextMode.Faction]: () => {
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
            },
        });
    }
}

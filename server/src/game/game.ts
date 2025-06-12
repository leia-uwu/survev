import { TeamMode } from "../../../shared/gameConfig";
import * as net from "../../../shared/net/net";
import { math } from "../../../shared/utils/math";
import { v2 } from "../../../shared/utils/v2";
import { Config } from "../config";
import { Logger } from "../utils/logger";
import { fetchApiServer } from "../utils/serverHelpers";
import {
    type FindGamePrivateBody,
    ProcessMsgType,
    type SaveGameBody,
    type ServerGameConfig,
    type UpdateDataMsg,
} from "../utils/types";
import { GameModeManager } from "./gameModeManager";
import { Grid } from "./grid";
import { GameMap } from "./map";
import { AirdropBarn } from "./objects/airdrop";
import { BulletBarn } from "./objects/bullet";
import { DeadBodyBarn } from "./objects/deadBody";
import { DecalBarn } from "./objects/decal";
import { ExplosionBarn } from "./objects/explosion";
import { type GameObject, ObjectRegister } from "./objects/gameObject";
import { Gas } from "./objects/gas";
import { LootBarn } from "./objects/loot";
import { MapIndicatorBarn } from "./objects/mapIndicator";
import { PlaneBarn } from "./objects/plane";
import { PlayerBarn } from "./objects/player";
import { ProjectileBarn } from "./objects/projectile";
import { SmokeBarn } from "./objects/smoke";
import { PluginManager } from "./pluginManager";
import { Profiler } from "./profiler";

export interface JoinTokenData {
    expiresAt: number;
    userId: string | null;
    findGameIp: string;
    groupData: {
        autoFill: boolean;
        playerCount: number;
        groupHashToJoin: string;
    };
}

export class Game {
    started = false;
    stopped = false;
    allowJoin = false;
    over = false;
    sentWinEMotes = false;
    startedTime = 0;
    stopTicker = 0;
    id: string;
    teamMode: TeamMode;
    mapName: string;
    isTeamMode: boolean;
    config: ServerGameConfig;
    pluginManager = new PluginManager(this);
    modeManager: GameModeManager;

    tickTimeWarnThreshold = (1000 / Config.gameTps) * 4;
    gameTickWarnings = 0;

    netSyncWarnThreshold = (1000 / Config.netSyncTps) * 4;
    netSyncWarnings = 0;

    grid: Grid<GameObject>;
    objectRegister: ObjectRegister;

    joinTokens = new Map<string, JoinTokenData>();

    get aliveCount(): number {
        return this.playerBarn.livingPlayers.length;
    }

    get trueAliveCount(): number {
        return this.playerBarn.livingPlayers.filter((p) => !p.disconnected).length;
    }

    /**
     * All msgs created this tick that will be sent to all players
     * cached in a single stream
     */
    msgsToSend = new net.MsgStream(new ArrayBuffer(4096));

    playerBarn: PlayerBarn;
    lootBarn: LootBarn;
    deadBodyBarn: DeadBodyBarn;
    decalBarn: DecalBarn;
    projectileBarn: ProjectileBarn;
    bulletBarn: BulletBarn;
    smokeBarn: SmokeBarn;
    airdropBarn: AirdropBarn;

    explosionBarn: ExplosionBarn;
    planeBarn: PlaneBarn;
    mapIndicatorBarn: MapIndicatorBarn;

    map: GameMap;
    gas: Gas;

    now!: number;

    perfTicker = 0;
    tickTimes: number[] = [];

    logger: Logger;

    start = Date.now();

    profiler = new Profiler();

    constructor(
        id: string,
        config: ServerGameConfig,
        readonly sendSocketMsg: (id: string, data: Uint8Array) => void,
        readonly closeSocket: (id: string, reason?: string) => void,
        readonly sendData?: (data: UpdateDataMsg) => void,
    ) {
        this.id = id;
        this.logger = new Logger(`Game #${this.id.substring(0, 4)}`);
        this.logger.info("Creating");

        this.config = config;

        this.teamMode = config.teamMode;
        this.mapName = config.mapName;
        this.isTeamMode = this.teamMode !== TeamMode.Solo;

        this.map = new GameMap(this);
        this.grid = new Grid(this.map.width, this.map.height);
        this.objectRegister = new ObjectRegister(this.grid);

        this.playerBarn = new PlayerBarn(this);
        this.lootBarn = new LootBarn(this);
        this.deadBodyBarn = new DeadBodyBarn(this);
        this.decalBarn = new DecalBarn(this);
        this.projectileBarn = new ProjectileBarn(this);
        this.bulletBarn = new BulletBarn(this);
        this.smokeBarn = new SmokeBarn(this);
        this.airdropBarn = new AirdropBarn(this);
        this.explosionBarn = new ExplosionBarn(this);
        this.planeBarn = new PlaneBarn(this);
        this.explosionBarn = new ExplosionBarn(this);
        this.planeBarn = new PlaneBarn(this);
        this.mapIndicatorBarn = new MapIndicatorBarn();

        this.gas = new Gas(this);

        this.modeManager = new GameModeManager(this);

        if (this.map.factionMode) {
            for (let i = 1; i <= this.map.mapDef.gameMode.factions!; i++) {
                this.playerBarn.addTeam(i);
            }
        }
    }

    async init() {
        await this.pluginManager.loadPlugins();
        this.map.init();
        this.pluginManager.emit("gameCreated", { game: this });

        this.allowJoin = true;
        this.logger.info(`Created in ${Date.now() - this.start} ms`);

        this.updateData();
    }

    update(): void {
        if (!this.allowJoin) return;
        this.profiler.flush();

        const now = performance.now();
        if (!this.now) this.now = now;
        const dt = math.clamp((now - this.now) / 1000, 0.001, 1 / 8);

        this.now = now;

        if (this.over) {
            this.stopTicker -= dt;
            if (this.stopTicker <= 0) {
                this.stop();
                return;
            }
        }

        if (!this.started) {
            this.started = this.modeManager.isGameStarted();
            if (this.started) {
                this.pluginManager.emit("gameStarted", { game: this });
                this.gas.advanceGasStage();
            }
        }

        if (this.started) this.startedTime += dt;

        //
        // Update modules
        //
        this.profiler.addSample("gas");
        this.gas.update(dt);
        this.profiler.endSample();

        this.profiler.addSample("players");
        this.playerBarn.update(dt);
        this.profiler.endSample();

        this.profiler.addSample("map");
        this.map.update(dt);
        this.profiler.endSample();

        this.profiler.addSample("loot");
        this.lootBarn.update(dt);
        this.profiler.endSample();

        this.profiler.addSample("bullets");
        this.bulletBarn.update(dt);
        this.profiler.endSample();

        this.profiler.addSample("projectiles");
        this.projectileBarn.update(dt);
        this.profiler.endSample();

        this.profiler.addSample("explosions");
        this.explosionBarn.update();
        this.profiler.endSample();

        this.profiler.addSample("smoke");
        this.smokeBarn.update(dt);
        this.profiler.endSample();

        this.profiler.addSample("airdrops");
        this.airdropBarn.update(dt);
        this.profiler.endSample();

        this.profiler.addSample("deadBodies");
        this.deadBodyBarn.update(dt);
        this.profiler.endSample();

        this.profiler.addSample("decals");
        this.decalBarn.update(dt);
        this.profiler.endSample();

        this.profiler.addSample("planes");
        this.planeBarn.update(dt);
        this.profiler.endSample();

        const tickTime = performance.now() - this.now;

        if (tickTime > 1000) {
            let errString = `Tick took over 1 second! ${tickTime.toFixed(2)}ms\n`;
            errString += "Profiler stats:\n";
            errString += this.profiler.getStats();
            this.logger.error(errString);
        } else if (tickTime > this.tickTimeWarnThreshold) {
            this.logger.warn(
                `Tick took over ${this.tickTimeWarnThreshold}ms! ${tickTime.toFixed(2)}ms`,
            );
            this.gameTickWarnings++;

            if (this.gameTickWarnings > 20) {
                let errString = `Server is overloaded! Increasing tickTimeWarnThreshold.\n`;
                errString += "Profiler stats:\n";
                errString += this.profiler.getStats();
                this.logger.warn(errString);

                this.gameTickWarnings = 0;
                this.tickTimeWarnThreshold *= 2;
            }
        }

        if (Config.logging.debugLogs) {
            this.tickTimes.push(tickTime);

            this.perfTicker += dt;
            if (this.perfTicker >= 15) {
                this.perfTicker = 0;
                const mspt =
                    this.tickTimes.reduce((a, b) => a + b) / this.tickTimes.length;

                this.logger.debug(
                    `Avg ms/tick: ${mspt.toFixed(2)} | Load: ${((mspt / (1000 / Config.gameTps)) * 100).toFixed(1)}%`,
                );
                this.tickTimes = [];
            }
        }

        this.pluginManager.emit("gameUpdate", { game: this, dt: dt });
    }

    netSync() {
        if (!this.allowJoin) return;

        const start = performance.now();

        // serialize objects and send msgs
        this.objectRegister.serializeObjs();
        this.playerBarn.sendMsgs();

        //
        // reset stuff
        //
        this.playerBarn.flush();
        this.lootBarn.flush();
        this.planeBarn.flush();
        this.bulletBarn.flush();
        this.airdropBarn.flush();
        this.objectRegister.flush();
        this.explosionBarn.flush();
        this.gas.flush();
        this.mapIndicatorBarn.flush();

        this.msgsToSend.stream.index = 0;

        const syncTime = performance.now() - start;
        if (syncTime > 1000) {
            this.logger.error(`Tick took over 1 second! ${syncTime.toFixed(2)}ms`);
        } else if (syncTime > this.netSyncWarnThreshold) {
            this.logger.warn(
                `Tick took over ${this.netSyncWarnThreshold}ms! ${syncTime.toFixed(2)}ms`,
            );
            this.netSyncWarnings++;

            if (this.netSyncWarnings > 20) {
                this.logger.warn(
                    `Server is overloaded! Increasing netSyncWarnThreshold.`,
                );

                this.netSyncWarnings = 0;
                this.netSyncWarnThreshold *= 2;
            }
        }
    }

    get canJoin(): boolean {
        const canJoin =
            this.aliveCount < this.map.mapDef.gameMode.maxPlayers &&
            !this.over &&
            this.startedTime < 60;

        return this.pluginManager.trigger("game:canJoin", { game: this }, canJoin);
    }

    deserializeMsg(buff: ArrayBuffer): {
        type: net.MsgType;
        msg: net.AbstractMsg | undefined;
    } {
        const msgStream = new net.MsgStream(buff);
        const stream = msgStream.stream;

        const type = msgStream.deserializeMsgType();

        let msg:
            | net.JoinMsg
            | net.InputMsg
            | net.EmoteMsg
            | net.DropItemMsg
            | net.SpectateMsg
            | net.PerkModeRoleSelectMsg
            | net.EditMsg
            | undefined = undefined;

        switch (type) {
            case net.MsgType.Join: {
                msg = new net.JoinMsg();
                msg.deserialize(stream);
                break;
            }
            case net.MsgType.Input: {
                msg = new net.InputMsg();
                msg.deserialize(stream);
                break;
            }
            case net.MsgType.Emote:
                msg = new net.EmoteMsg();
                msg.deserialize(stream);
                break;
            case net.MsgType.DropItem:
                msg = new net.DropItemMsg();
                msg.deserialize(stream);
                break;
            case net.MsgType.Spectate:
                msg = new net.SpectateMsg();
                msg.deserialize(stream);
                break;
            case net.MsgType.PerkModeRoleSelect:
                msg = new net.PerkModeRoleSelectMsg();
                msg.deserialize(stream);
                break;
            case net.MsgType.Edit:
                if (!Config.debug.allowEditMsg) break;
                msg = new net.EditMsg();
                msg.deserialize(stream);
                break;
        }

        return {
            type,
            msg,
        };
    }

    handleMsg(buff: ArrayBuffer | Buffer, socketId: string, ip: string): void {
        if (!(buff instanceof ArrayBuffer)) return;

        const player = this.playerBarn.socketIdToPlayer.get(socketId);

        let msg: net.AbstractMsg | undefined = undefined;
        let type = net.MsgType.None;

        try {
            const deserialized = this.deserializeMsg(buff);
            msg = deserialized.msg;
            type = deserialized.type;
        } catch (err) {
            this.logger.error("Failed to deserialize msg: ", err);
            return;
        }

        if (!msg) return;

        if (type === net.MsgType.Join && !player) {
            this.playerBarn.addPlayer(socketId, msg as net.JoinMsg, ip);
            return;
        }

        if (!player) {
            this.closeSocket(socketId);
            return;
        }

        switch (type) {
            case net.MsgType.Input: {
                player.handleInput(msg as net.InputMsg);
                break;
            }
            case net.MsgType.Emote: {
                player.emoteFromMsg(msg as net.EmoteMsg);
                break;
            }
            case net.MsgType.DropItem: {
                player.dropItem(msg as net.DropItemMsg);
                break;
            }
            case net.MsgType.Spectate: {
                player.spectate(msg as net.SpectateMsg);
                break;
            }
            case net.MsgType.PerkModeRoleSelect: {
                player.roleSelect((msg as net.PerkModeRoleSelectMsg).role);
                break;
            }
            case net.MsgType.Edit: {
                player.processEditMsg(msg as net.EditMsg);
                break;
            }
        }
    }

    handleSocketClose(socketId: string): void {
        const player = this.playerBarn.socketIdToPlayer.get(socketId);
        if (!player) return;
        this.logger.info(`"${player.name}" left`);
        player.disconnected = true;
        player.group?.checkPlayers();
        player.spectating = undefined;
        player.dir = v2.create(0, 0);
        player.setPartDirty();
        if (player.canDespawn()) {
            player.game.playerBarn.removePlayer(player);
        }
        this.pluginManager.emit("playerDisconnect", { player });
    }

    broadcastMsg(type: net.MsgType, msg: net.Msg) {
        this.msgsToSend.serializeMsg(type, msg);
    }

    checkGameOver(): void {
        if (this.over) return;
        const shouldGameEnd = this.modeManager.shouldGameEnd();
        if (this.pluginManager.emit("gameCheckGameOver", { game: this, shouldGameEnd }))
            return;

        if (shouldGameEnd) {
            this.modeManager.handleGameEnd();
            this.over = true;

            // send win emoji after 1 second
            this.playerBarn.sendWinEmoteTicker = 1;
            // stop game after 2
            this.stopTicker = 2;

            this.updateData();
        }
    }

    addJoinTokens(tokens: FindGamePrivateBody["playerData"], autoFill: boolean) {
        const groupData = {
            playerCount: tokens.length,
            groupHashToJoin: "",
            autoFill,
        };

        for (const token of tokens) {
            this.joinTokens.set(token.token, {
                expiresAt: Date.now() + 10000,
                userId: token.userId,
                groupData,
                findGameIp: token.ip,
            });
        }
    }

    updateData() {
        this.sendData?.({
            type: ProcessMsgType.UpdateData,
            id: this.id,
            teamMode: this.teamMode,
            mapName: this.mapName,
            canJoin: this.canJoin,
            aliveCount: this.aliveCount,
            startedTime: this.startedTime,
            stopped: this.stopped,
        });
    }

    stop(): void {
        if (this.stopped) return;
        this.stopped = true;
        this.allowJoin = false;
        for (const player of this.playerBarn.players) {
            if (!player.disconnected) {
                this.closeSocket(player.socketId);
            }
        }
        this.logger.info("Game Ended");
        this.updateData();
        this._saveGameToDatabase();
    }

    private async _saveGameToDatabase() {
        const players = this.modeManager.getPlayersSortedByRank();
        /**
         * teamTotal is for total teams that started the match, i hope?
         *
         * it also seems to be unused by the client so we could also remove it?
         */
        const teamTotal = new Set(players.map(({ player }) => player.teamId)).size;

        const values: SaveGameBody["matchData"] = players.map(({ player, rank }) => {
            return {
                // *NOTE: userId is optional; we save the game stats for non logged users too
                userId: player.userId,
                region: Config.gameServer.thisRegion,
                username: player.name,
                playerId: player.matchDataId,
                teamMode: this.teamMode,
                teamCount: player.group?.totalCount ?? 1,
                teamTotal: teamTotal,
                teamId: player.teamId,
                timeAlive: Math.round(player.timeAlive),
                died: player.dead,
                kills: player.kills,
                damageDealt: Math.round(player.damageDealt),
                damageTaken: Math.round(player.damageTaken),
                killerId: player.killedBy?.matchDataId || 0,
                gameId: this.id,
                mapId: this.map.mapId,
                mapSeed: this.map.seed,
                killedIds: player.killedIds,
                rank: rank,
                ip: player.ip,
                findGameIp: player.findGameIp,
            };
        });

        // only save the game if it has more than 2 players lol
        if (values.length < 2) return;

        // FIXME: maybe move this to the parent game server process?
        // to avoid blocking the game from being GC'd until this request is done
        // and opening a database in each process if it fails
        // etc
        const res = await fetchApiServer<SaveGameBody, { error: string }>(
            "private/save_game",
            {
                matchData: values,
            },
        );

        if (!res || res.error) {
            this.logger.warn(`Failed to save game data, saving locally instead`);

            // we dump the game  to a local db if we failed to save;
            // avoid importing sqlite and creating the database at process startup
            // since this code should rarely run anyway
            const sqliteDb = (await import("better-sqlite3")).default(
                "lost_game_data.db",
            );

            sqliteDb
                .prepare(`
                    CREATE TABLE IF NOT EXISTS lost_game_data (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        data TEXT NOT NULL,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `)
                .run();

            sqliteDb
                .prepare("INSERT INTO lost_game_data (data) VALUES (?)")
                .run(JSON.stringify(values));
        }
    }
}

import { GameConfig, TeamMode } from "../../../shared/gameConfig";
import * as net from "../../../shared/net/net";
import { v2 } from "../../../shared/utils/v2";
import { Config } from "../config";
import { Logger } from "../utils/logger";
import type { ServerGameConfig } from "./gameManager";
import { GameModeManager } from "./gameModeManager";
import { ProcessMsgType, type UpdateDataMsg } from "./gameProcessManager";
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
import { PlaneBarn } from "./objects/plane";
import { PlayerBarn } from "./objects/player";
import { ProjectileBarn } from "./objects/projectile";
import { SmokeBarn } from "./objects/smoke";
import { PluginManager } from "./pluginManager";

export type GroupData = {
    hash: string;
    autoFill: boolean;
};

export class Game {
    started = false;
    stopped = false;
    allowJoin = true;
    over = false;
    startedTime = 0;
    id: string;
    teamMode: TeamMode;
    mapName: string;
    isTeamMode: boolean;
    config: ServerGameConfig;
    pluginManager = new PluginManager(this);
    modeManager: GameModeManager;

    grid: Grid<GameObject>;
    objectRegister: ObjectRegister;

    joinTokens = new Map<string, { autoFill: boolean; playerCount: number }>();

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

    playerBarn = new PlayerBarn(this);
    lootBarn = new LootBarn(this);
    deadBodyBarn = new DeadBodyBarn(this);
    decalBarn = new DecalBarn(this);
    projectileBarn = new ProjectileBarn(this);
    bulletBarn = new BulletBarn(this);
    smokeBarn = new SmokeBarn(this);
    airdropBarn = new AirdropBarn(this);

    explosionBarn = new ExplosionBarn(this);
    planeBarn = new PlaneBarn(this);

    map: GameMap;
    gas: Gas;

    now!: number;

    perfTicker = 0;
    tickTimes: number[] = [];

    logger: Logger;

    start = Date.now();

    constructor(
        id: string,
        config: ServerGameConfig,
        readonly sendSocketMsg: (id: string, data: ArrayBuffer) => void,
        readonly closeSocket: (id: string) => void,
        readonly sendData?: (data: UpdateDataMsg) => void,
    ) {
        this.id = id;
        this.logger = new Logger(`Game #${this.id.substring(0, 4)}`);
        this.logger.log("Creating");

        this.config = config;

        this.teamMode = config.teamMode;
        this.mapName = config.mapName;
        this.isTeamMode = this.teamMode !== TeamMode.Solo;

        this.map = new GameMap(this);
        this.grid = new Grid(this.map.width, this.map.height);
        this.objectRegister = new ObjectRegister(this.grid);

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
        this.pluginManager.emit("gameCreated", this);
        this.map.init();

        this.allowJoin = true;
        this.logger.log(`Created in ${Date.now() - this.start} ms`);

        this.updateData();
    }

    update(): void {
        const now = Date.now();
        if (!this.now) this.now = now;
        const dt = (now - this.now) / 1000;
        this.now = now;

        if (this.started) this.startedTime += dt;

        //
        // Update modules
        //
        this.gas.update(dt);
        this.playerBarn.update(dt);
        this.map.update();
        this.lootBarn.update(dt);
        this.bulletBarn.update(dt);
        this.projectileBarn.update(dt);
        this.explosionBarn.update();
        this.smokeBarn.update(dt);
        this.airdropBarn.update(dt);
        this.deadBodyBarn.update(dt);
        this.decalBarn.update(dt);
        this.planeBarn.update(dt);

        if (Config.perfLogging.enabled) {
            // Record performance and start the next tick
            // THIS TICK COUNTER IS WORKING CORRECTLY!
            // It measures the time it takes to calculate a tick, not the time between ticks.
            const tickTime = Date.now() - this.now;
            this.tickTimes.push(tickTime);

            this.perfTicker += dt;
            if (this.perfTicker >= Config.perfLogging.time) {
                this.perfTicker = 0;
                const mspt =
                    this.tickTimes.reduce((a, b) => a + b) / this.tickTimes.length;

                this.logger.log(
                    `Avg ms/tick: ${mspt.toFixed(2)} | Load: ${((mspt / (1000 / Config.gameTps)) * 100).toFixed(1)}%`,
                );
                this.tickTimes = [];
            }
        }
    }

    netSync() {
        // serialize objects and send msgs
        this.objectRegister.serializeObjs();
        this.playerBarn.sendMsgs();

        //
        // reset stuff
        //
        this.playerBarn.flush();
        this.bulletBarn.flush();
        this.airdropBarn.flush();
        this.objectRegister.flush();
        this.explosionBarn.flush();
        this.gas.flush();
        this.msgsToSend.stream.index = 0;
    }

    get canJoin(): boolean {
        return (
            this.aliveCount < this.map.mapDef.gameMode.maxPlayers &&
            !this.over &&
            this.gas.stage < 2
        );
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
        }

        return {
            type,
            msg,
        };
    }

    handleMsg(buff: ArrayBuffer | Buffer, socketId: string): void {
        if (!(buff instanceof ArrayBuffer)) return;

        const player = this.playerBarn.socketIdToPlayer.get(socketId);

        let msg: net.AbstractMsg | undefined = undefined;
        let type = net.MsgType.None;

        try {
            const deserialized = this.deserializeMsg(buff);
            msg = deserialized.msg;
            type = deserialized.type;
        } catch (err) {
            this.logger.warn("Failed to deserialize msg: ");
            console.error(err);
            return;
        }

        if (!msg) return;

        if (type === net.MsgType.Join && !player) {
            this.playerBarn.addPlayer(socketId, msg as net.JoinMsg);
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
        }
    }

    handleSocketClose(socketId: string): void {
        const player = this.playerBarn.socketIdToPlayer.get(socketId);
        if (!player) return;
        this.logger.log(`"${player.name}" left`);
        player.disconnected = true;
        player.group?.checkPlayers();
        player.spectating = undefined;
        player.dir = v2.create(0, 0);
        player.setPartDirty();
        if (player.timeAlive < GameConfig.player.minActiveTime) {
            player.game.playerBarn.removePlayer(player);
        }
    }

    broadcastMsg(type: net.MsgType, msg: net.Msg) {
        this.msgsToSend.serializeMsg(type, msg);
    }

    checkGameOver(): void {
        if (this.over) return;
        const didGameEnd: boolean = this.modeManager.handleGameEnd();
        if (didGameEnd) {
            this.over = true;
            this.updateData();
            setTimeout(() => {
                this.stop();
            }, 750);
        }
    }

    addJoinToken(id: string, autoFill: boolean, playerCount: number) {
        this.joinTokens.set(id, {
            autoFill,
            playerCount,
        });
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
        this.logger.log("Game Ended");
        this.updateData();
    }
}

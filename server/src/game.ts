import { Emote, Player } from "./objects/player";
import { type Vec2, v2 } from "../../shared/utils/v2";
import { Grid } from "./utils/grid";
import { ObjectType, type BaseGameObject } from "./objects/gameObject";
import { SpawnMode, type ConfigType } from "./config";
import { GameMap } from "./map";
import { BulletManager } from "./objects/bullet";
import { Logger } from "./utils/logger";
import { GameConfig } from "../../shared/gameConfig";
import * as net from "../../shared/net";
import { type Explosion } from "./objects/explosion";
import { type Msg } from "../../shared/netTypings";
import { type ServerSocket } from "./abstractServer";
import { LootBarn } from "./objects/loot";
import NanoTimer from "nanotimer";
import { Gas } from "./objects/gas";
import { isItemInLoadout } from "../../shared/defs/gameObjects/unlockDefs";

export class Game {
    started = false;
    stopped = false;
    allowJoin = true;
    over = false;
    startedTime = 0;

    nextObjId = 0;

    nextGroupId = 0;

    players = new Set<Player>();
    connectedPlayers = new Set<Player>();
    livingPlayers = new Set<Player>();

    get aliveCount(): number {
        return this.livingPlayers.size;
    }

    aliveCountDirty = false;

    msgsToSend: Array<{ type: number, msg: Msg }> = [];

    partialObjs = new Set<BaseGameObject>();
    fullObjs = new Set<BaseGameObject>();

    lootBarn = new LootBarn(this);

    newPlayers: Player[] = [];

    explosions: Explosion[] = [];

    id: number;

    map: GameMap;

    grid: Grid;

    timer: NanoTimer;

    /**
     * for stuff based on ms
     */
    realDt: number;
    /**
     * realDt divided by 1000, used for physics since speed values are in unit/second.
     * for stuff based on seconds
     */
    dt: number;

    config: ConfigType;

    now = Date.now();

    tickTimes: number[] = [];

    timeouts: NodeJS.Timeout[] = [];

    bulletManager = new BulletManager(this);

    // serializationCache = new SerializationCache();

    logger: Logger;

    gas: Gas;

    emotes: Emote[] = [];

    constructor(id: number, config: ConfigType) {
        this.id = id;
        this.logger = new Logger(`Game #${this.id}`);
        this.logger.log("Creating");
        const start = Date.now();

        this.config = config;

        this.grid = new Grid(1024, 1024);
        this.map = new GameMap(this);

        this.gas = new Gas(this);

        this.realDt = 1000 / config.tps;
        this.dt = this.realDt / 1000;

        this.timer = new NanoTimer();

        this.timer.setInterval(() => { this.tick(); }, "", `${this.realDt}m`);

        this.allowJoin = true;

        this.logger.log(`Created in ${Date.now() - start} ms`);
    }

    tick(): void {
        this.now = Date.now();

        this.bulletManager.update();

        this.gas.update();

        for (const loot of this.grid.categories[ObjectType.Loot]) {
            loot.update();
        }

        for (const explosion of this.explosions) {
            explosion.explode(this);
        }

        for (const player of this.players) {
            player.update();
        }

        // this.serializationCache.update(this);

        for (const player of this.connectedPlayers) {
            player.sendMsgs();
        }

        //
        // reset stuff
        //
        for (const player of this.players) {
            for (const key in player.dirty) {
                player.dirty[key as keyof Player["dirty"]] = false;
            }
        }

        this.fullObjs.clear();
        this.partialObjs.clear();
        this.newPlayers.length = 0;
        this.bulletManager.reset();
        this.msgsToSend.length = 0;
        this.explosions.length = 0;
        this.emotes.length = 0;
        this.grid.updateObjects = false;
        this.aliveCountDirty = false;

        this.gas.dirty = false;
        this.gas.timeDirty = false;

        // Record performance and start the next tick
        // THIS TICK COUNTER IS WORKING CORRECTLY!
        // It measures the time it takes to calculate a tick, not the time between ticks.
        const tickTime = Date.now() - this.now;
        this.tickTimes.push(tickTime);

        if (this.tickTimes.length >= 200) {
            const mspt = this.tickTimes.reduce((a, b) => a + b) / this.tickTimes.length;

            this.logger.log(`Avg ms/tick: ${mspt.toFixed(2)} | Load: ${((mspt / this.realDt) * 100).toFixed(1)}%`);
            this.tickTimes = [];
        }
    }

    addPlayer(socket: ServerSocket): Player {
        let pos: Vec2;

        switch (this.config.spawn.mode) {
        case SpawnMode.Center:
            pos = v2.copy(this.map.center);
            break;
        case SpawnMode.Fixed:
            pos = v2.copy(this.config.spawn.pos);
            break;
        case SpawnMode.Random:
            pos = this.map.getRandomSpawnPos();
            break;
        }

        const player = new Player(
            this,
            pos,
            socket);

        if (this.aliveCount >= 1 && !this.started) {
            this.started = true;
            this.gas.advanceGasStage();
        }

        return player;
    }

    handleMsg(buff: ArrayBuffer, player: Player): void {
        const msgStream = new net.MsgStream(buff);
        const type = msgStream.deserializeMsgType();
        const stream = msgStream.stream!;
        switch (type) {
        case net.MsgType.Input: {
            const inputMsg = new net.InputMsg();
            inputMsg.deserialize(stream);
            player.handleInput(inputMsg);
            break;
        }
        case net.MsgType.Join: {
            const joinMsg = new net.JoinMsg();
            joinMsg.deserialize(stream);

            if (joinMsg.protocol !== GameConfig.protocolVersion) {
                const disconnectMsg = new net.DisconnectMsg();
                disconnectMsg.reason = "index-invalid-protocol";
                player.sendMsg(net.MsgType.Disconnect, disconnectMsg);
                setTimeout(() => {
                    player.socket.close();
                }, 1);
                return;
            }

            let name = joinMsg.name;
            if (name.trim() === "") name = "Player";
            player.name = name;

            this.logger.log(`Player ${name} joined`);

            player.joinedTime = Date.now();

            player.isMobile = joinMsg.isMobile;

            if (isItemInLoadout(joinMsg.loadout.outfit, "outfit")) {
                player.outfit = joinMsg.loadout.outfit;
            }

            if (isItemInLoadout(joinMsg.loadout.melee, "melee")) {
                player.weapons[GameConfig.WeaponSlot.Melee].type = joinMsg.loadout.melee;
            }

            if (isItemInLoadout(joinMsg.loadout.heal, "heal")) {
                player.loadout.heal = joinMsg.loadout.heal;
            }
            if (isItemInLoadout(joinMsg.loadout.boost, "boost")) {
                player.loadout.boost = joinMsg.loadout.boost;
            }

            const emotes = joinMsg.loadout.emotes;
            for (let i = 0; i < emotes.length; i++) {
                const emote = emotes[i];

                if ((i < 4 && emote === "") || (!isItemInLoadout(emote, "emote") && emote !== "")) {
                    player.loadout.emotes.push("emote_logoswine");
                    continue;
                }

                player.loadout.emotes.push(emote);
            }

            this.newPlayers.push(player);
            this.grid.addObject(player);
            this.connectedPlayers.add(player);
            this.players.add(player);
            this.livingPlayers.add(player);
            this.aliveCountDirty = true;
            break;
        }
        case net.MsgType.Emote: {
            const emoteMsg = new net.EmoteMsg();
            emoteMsg.deserialize(stream);

            this.emotes.push(new Emote(player.id, emoteMsg.pos, emoteMsg.type, emoteMsg.isPing));
            break;
        }
        case net.MsgType.DropItem: {
            const dropMsg = new net.DropItemMsg();
            dropMsg.deserialize(stream);
            player.dropItem(dropMsg);
        }
        }
    }

    removePlayer(player: Player): void {
        this.connectedPlayers.delete(player);
    }

    end(): void {
        this.stopped = true;
        this.allowJoin = false;
        this.timer.clearInterval();
        for (const player of this.players) {
            player.socket.close();
        }
        this.logger.log("Game Ended");
    }
}

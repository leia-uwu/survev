import { type WebSocket } from "uWebSockets.js";
import { type PlayerContainer } from "./server";
import { Player } from "./objects/player";
import { type Vec2, v2 } from "../../shared/utils/v2";
import { Grid } from "./utils/grid";
import { ObjectType, type BaseGameObject } from "./objects/gameObject";
import { SpawnMode, type ConfigType } from "./config";
import { GameMap } from "./map";
import { BulletManager } from "./objects/bullet";
import { Logger } from "./utils/logger";
import { Loot } from "./objects/loot";
import { GameObjectDefs } from "../../shared/defs/gameObjectDefs";
import { GameConfig } from "../../shared/gameConfig";
import net, { type BitStream } from "../../shared/net";

export interface Msg {
    serialize: (s: BitStream) => void
    deserialize: (s: BitStream) => void
}

export class Game {
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

    newPlayers: Player[] = [];

    explosions = [];

    id: number;

    map: GameMap;

    grid: Grid;

    tickInterval: NodeJS.Timeout;

    realDt: number;
    // realDt divided by 1000, used for physics since speed values are in unit/second
    dt: number;

    config: ConfigType;

    now = Date.now();

    tickTimes: number[] = [];

    bulletManager = new BulletManager(this);

    // serializationCache = new SerializationCache();

    logger: Logger;

    constructor(id: number, config: ConfigType) {
        this.id = id;
        this.logger = new Logger(`Game #${this.id}`);
        this.logger.log("Creating");
        const start = Date.now();

        this.config = config;

        this.grid = new Grid(1024, 1024);
        this.map = new GameMap(this);

        this.realDt = 1000 / config.tps;
        this.dt = this.realDt / 1000;
        this.tickInterval = setInterval(() => this.tick(), this.realDt);
        this.allowJoin = true;

        this.logger.log(`Created in ${Date.now() - start} ms`);
    }

    tick(): void {
        this.now = Date.now();

        this.bulletManager.update();

        for (const loot of this.grid.categories[ObjectType.Loot]) {
            loot.update();
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
        this.aliveCountDirty = false;

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

    addPlayer(socket: WebSocket<PlayerContainer>): Player {
        let position: Vec2;

        switch (this.config.spawn.mode) {
        case SpawnMode.Center:
            position = v2.create(this.map.width / 2, this.map.height / 2);
            break;
        case SpawnMode.Fixed:
            position = v2.copy(this.config.spawn.position);
            break;
        case SpawnMode.Random:
            position = this.map.getRandomSpawnPosition();
            break;
        }

        const player = new Player(
            this,
            position,
            socket);

        return player;
    }

    addLoot(type: string, pos: Vec2, layer: number, count: number, useCountForAmmo?: boolean) {
        const loot = new Loot(this, type, pos, layer, count);
        this.grid.addObject(loot);

        const def = GameObjectDefs[type];

        if (def.type === "gun" && GameObjectDefs[def.ammo]) {
            const ammoCount = useCountForAmmo ? count : def.ammoSpawnCount;
            const halfAmmo = Math.ceil(ammoCount / 2);

            const leftAmmo = new Loot(this, def.ammo, v2.add(pos, v2.create(-0.2, -0.2)), layer, halfAmmo, 0);
            leftAmmo.push(v2.create(-1, -1), 0.5);
            this.grid.addObject(leftAmmo);

            if (ammoCount - halfAmmo >= 1) {
                const rightAmmo = new Loot(this, def.ammo, v2.add(pos, v2.create(0.2, -0.2)), layer, ammoCount - halfAmmo, 0);
                rightAmmo.push(v2.create(1, -1), 0.5);

                this.grid.addObject(rightAmmo);
            }
        }
    }

    handleMsg(buff: ArrayBuffer, player: Player): void {
        const msgStream = new net.MsgStream(buff);
        const type = msgStream.deserializeMsgType();
        const stream = msgStream.stream!;
        switch (type) {
        case net.Msg.Input: {
            const inputMsg = new net.InputMsg();
            inputMsg.deserialize(stream);
            player.handleInput(inputMsg);
            break;
        }
        case net.Msg.Join: {
            const joinMsg = new net.JoinMsg();
            joinMsg.deserialize(stream);

            if (joinMsg.protocol !== GameConfig.protocolVersion) {
                const disconnectMsg = new net.DisconnectMsg();
                disconnectMsg.reason = "index-invalid-protocol";
                player.sendMsg(net.Msg.Disconnect, disconnectMsg);
                setTimeout(() => {
                    player.socket.close();
                }, 1);
                return;
            }

            let name = joinMsg.name;
            if (name.trim() === "") name = "Player";
            player.name = name;
            player.joinedTime = Date.now();

            this.newPlayers.push(player);
            this.grid.addObject(player);
            this.connectedPlayers.add(player);
            this.players.add(player);
            this.livingPlayers.add(player);
            this.aliveCountDirty = true;
            break;
        }
        }
    }

    removePlayer(player: Player): void {
        this.connectedPlayers.delete(player);
    }
}

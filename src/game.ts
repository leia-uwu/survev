import { type WebSocket } from "uWebSockets.js";
import { type PlayerContainer } from "./server";
import { type Msg, MsgStream, MsgType } from "./net/net";
import { Player } from "./objects/player";
import { Vec2, v2 } from "./utils/v2";
import { InputMsg } from "./net/inputMsg";
import { Grid } from "./utils/grid";
import { JoinMsg } from "./net/joinMsg";
import { type GameObject } from "./objects/gameObject";
import { SpawnMode, type ConfigType } from "./config";
import { GameMap } from "./map";
import { Logger } from "./utils/misc";
import { BulletManager } from "./objects/bullet";
import { type ExplosionData } from "./net/updateMsg";
import { util } from "./utils/util";

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

    msgsToSend: Msg[] = [];

    partialObjs = new Set<GameObject>();
    fullObjs = new Set<GameObject>();

    newPlayers: Player[] = [];

    explosions: ExplosionData[] = [];

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

    constructor(id: number, config: ConfigType) {
        const start = Date.now();

        this.id = id;
        this.config = config;

        this.grid = new Grid(1024, 1024);
        this.map = new GameMap(this);

        this.realDt = 1000 / config.tps;
        this.dt = this.realDt / 1000;
        this.tickInterval = setInterval(() => this.tick(), this.realDt);
        this.allowJoin = true;

        Logger.log(`Game ${this.id} | Created in ${Date.now() - start} ms`);
    }

    tick(): void {
        this.now = Date.now();

        this.bulletManager.update();

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

            Logger.log(`Game ${this.id} | Avg ms/tick: ${mspt.toFixed(2)} | Load: ${((mspt / this.realDt) * 100).toFixed(1)}%`);
            this.tickTimes = [];
        }
    }

    addPlayer(socket: WebSocket<PlayerContainer>): Player {
        let position: Vec2

        switch (this.config.spawn.mode) {
            case SpawnMode.Center:
                position = v2.create(this.map.width / 2, this.map.height / 2)
                break;
            case SpawnMode.Fixed:
                position = v2.copy(this.config.spawn.position)
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

    handleMsg(buff: ArrayBuffer, player: Player): void {
        const msgStream = new MsgStream(buff);
        const type = msgStream.deserializeMsgType();
        switch (type) {
        case MsgType.Input: {
            const inputMsg = new InputMsg();
            inputMsg.deserialize(msgStream.stream);
            player.handleInput(inputMsg);
            break;
        }
        case MsgType.Join: {
            const joinMsg = new JoinMsg();
            joinMsg.deserialize(msgStream.stream);
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

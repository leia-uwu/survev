import { type WebSocket } from "uWebSockets.js";
import { type PlayerContainer } from "./server";
import { MsgStream, MsgType } from "./net/net";
import { Player } from "./objects/player";
import { v2 } from "./utils/v2";
import { InputMsg } from "./net/inputMsg";
import { Grid } from "./utils/grid";
import { JoinMsg } from "./net/joinMsg";
import { type GameObject } from "./objects/gameObject";
import { type ConfigType } from "./config";
import { GameMap } from "./map";
import { Logger } from "./utils/misc";

export class Game {
    stopped = false;
    allowJoin = false;
    aliveCount = 0;
    over = false;
    startedTime = 0;

    nextObjId = 1;

    players = new Set<Player>();
    connectedPlayers = new Set<Player>();
    livingPlayers = new Set<Player>();

    aliveCountDirty = false;

    partialObjs = new Set<GameObject>();
    fullObjs = new Set<GameObject>();

    newPlayers: Player[] = [];

    id: number;

    map: GameMap;

    grid: Grid;

    tickInterval: NodeJS.Timeout;
    dt: number;

    config: ConfigType;

    now = Date.now();

    tickTimes: number[] = [];

    constructor(id: number, config: ConfigType) {
        this.id = id;

        this.config = config;

        this.grid = new Grid(1024, 1024);

        this.map = new GameMap(this);

        this.dt = 1000 / config.tps;

        this.tickInterval = setInterval(() => this.tick(), this.dt);
    }

    tick(): void {
        this.now = Date.now();

        for (const player of this.players) {
            player.update();
        }

        for (const player of this.connectedPlayers) {
            player.sendMsgs();
        }
        for (const player of this.players) {
            for (const key in player.dirty) {
                player.dirty[key as keyof Player["dirty"]] = false;
            }
        }

        // reset stuff
        this.fullObjs.clear();
        this.partialObjs.clear();
        this.newPlayers.length = 0;
        this.aliveCountDirty = false;


        // Record performance and start the next tick
        // THIS TICK COUNTER IS WORKING CORRECTLY!
        // It measures the time it takes to calculate a tick, not the time between ticks.
        const tickTime = Date.now() - this.now;
        this.tickTimes.push(tickTime);

        if (this.tickTimes.length >= 200) {
            const mspt = this.tickTimes.reduce((a, b) => a + b) / this.tickTimes.length;

            Logger.log(`Game ${this.id} | Avg ms/tick: ${mspt.toFixed(2)} | Load: ${((mspt / this.dt) * 100).toFixed(1)}%`);
            this.tickTimes = [];
        }
    }

    addPlayer(socket: WebSocket<PlayerContainer>): Player {
        const player = new Player(
            this,
            v2.add(v2.create(100, 100), v2.mul(v2.randomUnit(), 10)),
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
                player.name = joinMsg.name;

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

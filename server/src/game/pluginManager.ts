import fs from "fs";
import path from "path";
import type * as net from "../../../shared/net/net";
import type { Vec2 } from "../../../shared/utils/v2";
import type { Game } from "./game";
import type { GameMap } from "./map";
import type { DamageParams } from "./objects/gameObject";
import type { Gas } from "./objects/gas";
import type { Loot } from "./objects/loot";
import type { Obstacle } from "./objects/obstacle";
import type { Player } from "./objects/player";
import type { Weapon } from "./weaponManager";

class BaseGameEvent<T> {
    data: T;
    protected _stopPropogation = false;
    get shouldStopPropagation() {
        return this._stopPropogation;
    }

    constructor(data: T) {
        this.data = data;
    }

    stopPropagation() {
        this._stopPropogation = true;
    }
}

class CancelableEvent<T> extends BaseGameEvent<T> {
    protected _canceled = false;
    get canceled() {
        return this._canceled;
    }

    cancel() {
        this._canceled = true;
    }
}

function makeEvent<T>(cancelable: true): new (data: T) => CancelableEvent<T>;
function makeEvent<T>(cancelable?: false): new (data: T) => BaseGameEvent<T>;
function makeEvent<T>(cancelable?: boolean) {
    return cancelable ? CancelableEvent<T> : BaseGameEvent<T>;
}

export const GameEvents = {
    playerWillBeRevived: makeEvent<{ player: Player }>(true),
    playerWasRevived: makeEvent<{ player: Player }>(),

    playerWillJoin: makeEvent<{
        joinMsg: net.JoinMsg;
        ip: string;
        userId: string | null;
    }>(true),
    playerDidJoin: makeEvent<{ player: Player }>(),

    playerWillTakeDamage: makeEvent<{ player: Player; params: DamageParams }>(true),
    playerDidTakeDamage: makeEvent<{ player: Player; params: DamageParams }>(),

    playerWillDie: makeEvent<{ player: Player; params: DamageParams }>(true),
    playerDidDie: makeEvent<{ player: Player; params: DamageParams }>(),

    playerWillInput: makeEvent<{ player: Player; msg: net.InputMsg }>(true),
    playerDidInput: makeEvent<{ player: Player }>(),

    playerWillPickupLoot: makeEvent<{ player: Player; loot: Loot }>(true),
    playerDidPickupLoot: makeEvent<{ player: Player; loot: Loot }>(true),

    playerWillSwitchIdx: makeEvent<{
        player: Player;
        idx: number;
        cancelAction: boolean;
        cancelSlowdown: boolean;
        forceSwitch: boolean;
        changeCooldown: boolean;
    }>(true),
    playerDidSwitchIdx: makeEvent<{ player: Player; nextWeapon: Weapon }>(true),

    //TODO: add cancel support
    obstacleWillGenerate: makeEvent<{
        type: string;
        pos: Vec2;
        layer: number;
        ori?: number;
        scale?: number;
        buildingId?: number;
        puzzlePiece?: string;
        hideFromMap?: boolean;
    }>(true),
    obstacleDidGenerate: makeEvent<{ obstacle: Obstacle }>(),

    /** obstacle already dead, but before side effects such as explosions and loot dropping */
    obstacleDeathBeforeEffects: makeEvent<{ obstacle: Obstacle; params: DamageParams }>(
        true,
    ),
    /** obstacle already dead and after all side effects */
    obstacleDeathAfterEffects: makeEvent<{ obstacle: Obstacle; params: DamageParams }>(),

    gameCreated: makeEvent<{ game: Game }>(),
    gameStarted: makeEvent<{ game: Game }>(),
    gameUpdate: makeEvent<{ game: Game; dt: number }>(),

    //TODO: add cancel support
    gasWillAdvance: makeEvent<{ gas: Gas }>(true),
    gasDidAdvance: makeEvent<{ gas: Gas }>(),

    mapCreated: makeEvent<{ map: GameMap }>(),
};

export type EventName = keyof typeof GameEvents;

export type GameEvent<T extends EventName> = InstanceType<(typeof GameEvents)[T]>;
export type EventData<T extends EventName> = GameEvent<T>["data"];

export type EventHandler<T extends EventName> = (event: GameEvent<T>) => void;
export type EventHandlersMap = Partial<{
    [E in EventName]: EventHandler<E>[];
}>;

export function readDirectory(dir: string): string[] {
    let results: string[] = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.resolve(dir, file);
        const stat = fs.statSync(filePath);
        if (stat?.isDirectory()) {
            const res = readDirectory(filePath);
            results = results.concat(res);
        } else if (filePath.endsWith(".ts") || filePath.endsWith(".js")) {
            results.push(filePath);
        }
    }

    return results;
}

export const pluginDir = path.join(import.meta.dirname, "./plugins/");

let pluginPaths: string[] = [];
if (fs.existsSync(pluginDir)) {
    pluginPaths = readDirectory(pluginDir);
}

export abstract class GamePlugin {
    constructor(public readonly game: Game) {
        this.initListeners();
    }

    protected abstract initListeners(): void;

    on<E extends EventName>(eventName: E, handler: EventHandler<E>): void {
        (
            (this.game.pluginManager.eventToHandlers[eventName] ??=
                []) as EventHandler<E>[]
        ).push(handler);
    }
}

export class PluginManager {
    private readonly _plugins = new Set<GamePlugin>();
    eventToHandlers: EventHandlersMap = {};

    constructor(readonly game: Game) {}

    /** returns true if event cancelled, false otherwise */
    emit<E extends EventName>(eventName: E, data: EventData<E>): boolean {
        const handlers = this.eventToHandlers[eventName];
        if (!handlers) return false;
        //any because typescript cannot correctly infer the event constructor type yet
        const eventFactory = GameEvents[eventName] as any;
        const event = new eventFactory(data) as GameEvent<E>;

        for (const handler of handlers) {
            handler(event);
            if (event.shouldStopPropagation) break;
        }

        return event instanceof CancelableEvent ? event.canceled : false;
    }

    private loadPlugin(PluginConstructor: new (game: Game) => GamePlugin): void {
        const plugin = new PluginConstructor(this.game);
        this._plugins.add(plugin);
    }

    async loadPlugins() {
        for (const p of pluginPaths) {
            const pluginPath = `./${path.relative(import.meta.dirname, p)}`;
            this.game.logger.info("Loading plugin", pluginPath);
            const module = await import(pluginPath);
            if ("default" in module) {
                const plugin = (module as { default: new () => GamePlugin }).default;
                this.loadPlugin(plugin);
            }
        }
    }
}

import fs from "fs";
import path from "path";
import type { LootDef } from "../../../shared/defs/gameObjectDefs";
import type * as net from "../../../shared/net/net";
import type { Vec2 } from "../../../shared/utils/v2";
import type { Game } from "./game";
import type { GameMap } from "./map";
import type { DamageParams } from "./objects/gameObject";
import type { Gas } from "./objects/gas";
import type { Loot } from "./objects/loot";
import type { Obstacle } from "./objects/obstacle";
import type { Emote, Ping, Player } from "./objects/player";
import type { Weapon } from "./weaponManager";

class BaseGameEvent<T> {
    data: T;
    protected _stopPropogation = false;
    get shouldStopPropagation() {
        return this._stopPropogation;
    }
    stopPropagation() {
        this._stopPropogation = true;
    }

    constructor(data: T) {
        this.data = data;
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

    //if socket closes, unrelated to if the player despawns or not
    playerDisconnect: makeEvent<{ player: Player }>(),

    playerWillTakeDamage: makeEvent<{ player: Player; params: DamageParams }>(true),
    playerDidTakeDamage: makeEvent<{ player: Player; params: DamageParams }>(),

    playerWillDie: makeEvent<{ player: Player; params: DamageParams }>(true),
    playerDidDie: makeEvent<{ player: Player; params: DamageParams }>(),

    playerWillInput: makeEvent<{ player: Player; msg: net.InputMsg }>(true),
    playerDidInput: makeEvent<{ player: Player; msg: net.InputMsg }>(),

    playerWillPickupLoot: makeEvent<{ player: Player; loot: Loot }>(true),
    playerDidPickupLoot: makeEvent<{ player: Player; loot: Loot }>(),

    playerWillSwitchIdx: makeEvent<{
        player: Player;
        idx: number;
        cancelAction: boolean;
        cancelSlowdown: boolean;
        forceSwitch: boolean;
        changeCooldown: boolean;
    }>(true),
    playerDidSwitchIdx: makeEvent<{ player: Player; nextWeapon: Weapon }>(true),

    //emitted before type specific guards are checked (dropping 1x, trying to drop ammo player doesn't have)
    playerWillDropItem: makeEvent<{
        player: Player;
        dropMsg: net.DropItemMsg;
        itemDef: LootDef;
    }>(true),
    playerDidDropItem: makeEvent<{
        player: Player;
        dropMsg: net.DropItemMsg;
        itemDef: LootDef;
    }>(),

    //role promotions
    playerWillBePromoted: makeEvent<{ player: Player; role: string }>(true),
    playerDidGetPromoted: makeEvent<{ player: Player; role: string }>(),

    emoteWillOccur: makeEvent<{ type: string; playerId: number; itemType: string }>(true),
    emoteDidOccur: makeEvent<{ emote: Emote }>(),

    pingWillOccur: makeEvent<{ type: string; pos: Vec2; playerId: number }>(true),
    pingDidOccur: makeEvent<{ ping: Ping }>(),

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

    obstacleWillInteract: makeEvent<{
        obstacle: Obstacle;
        player?: Player;
        auto: boolean;
    }>(true),
    obstacleDidInteract: makeEvent<{ obstacle: Obstacle; player?: Player }>(),

    obstacleWillTakeDamage: makeEvent<{ obstacle: Obstacle; params: DamageParams }>(true),
    obstacleDidTakeDamage: makeEvent<{ obstacle: Obstacle; params: DamageParams }>(),

    /** obstacle already dead, but before side effects such as explosions and loot dropping */
    obstacleDeathBeforeEffects: makeEvent<{ obstacle: Obstacle; params: DamageParams }>(
        true,
    ),
    /** obstacle already dead and after all side effects */
    obstacleDeathAfterEffects: makeEvent<{ obstacle: Obstacle; params: DamageParams }>(),

    gameCreated: makeEvent<{ game: Game }>(),
    gameStarted: makeEvent<{ game: Game }>(),
    gameUpdate: makeEvent<{ game: Game; dt: number }>(),

    gameCheckGameOver: makeEvent<{ game: Game; shouldGameEnd: boolean }>(true),

    //TODO: add cancel support
    gasWillAdvance: makeEvent<{ gas: Gas }>(true),
    gasDidAdvance: makeEvent<{ gas: Gas }>(),

    mapCreated: makeEvent<{ map: GameMap }>(),
};

class HookPoint<T, R> {
    data: T;
    readonly original: R;

    constructor(data: T, original: R) {
        this.data = data;
        this.original = original;
    }
}

function makeHookPoint<T, R>() {
    return HookPoint<T, R>;
}

const GameHookPoints = {
    gameCheckCanJoin: makeHookPoint<{ game: Game }, boolean>(),
};

export type HookName = keyof typeof GameHookPoints;
export type GameHookPoint<T extends HookName> = InstanceType<(typeof GameHookPoints)[T]>;
export type HookPointData<T extends HookName> = GameHookPoint<T>["data"];
export type HookReturnType<T> = T extends HookPoint<any, infer R> ? R : never;
export type GameHookReturn<T extends HookName> = HookReturnType<GameHookPoint<T>>;
export type HookHandler<T extends HookName> = (
    hookPoint: GameHookPoint<T>,
) => GameHookReturn<T>;
export type HookHandlersMap = Partial<{
    [H in HookName]: HookHandler<H>[];
}>;

export type EventName = keyof typeof GameEvents;

export type GameEvent<T extends EventName> = InstanceType<(typeof GameEvents)[T]>;
export type EventData<T extends EventName> = GameEvent<T>["data"];

class ListenerContext {
    protected _unregistered = false;
    get unregistered() {
        return this._unregistered;
    }

    unregister() {
        this._unregistered = true;
    }
}

export type EventHandler<T extends EventName> = (
    event: GameEvent<T>,
    ctx: ListenerContext,
) => void;
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

    hook<H extends HookName>(hookName: H, handler: HookHandler<H>): void {
        (
            (this.game.pluginManager.hookNameToHandlers[hookName] ??=
                []) as HookHandler<H>[]
        ).push(handler);
    }
}

export class PluginManager {
    private readonly _plugins = new Set<GamePlugin>();
    eventToHandlers: EventHandlersMap = {};
    hookNameToHandlers: HookHandlersMap = {};

    constructor(readonly game: Game) {}

    emit<E extends EventName>(eventName: E, data: EventData<E>): boolean {
        const handlers = this.eventToHandlers[eventName];
        if (!handlers) return false;
        //any because typescript cannot correctly infer the event constructor type yet
        const eventConstructor = GameEvents[eventName] as any;
        const event = new eventConstructor(data) as GameEvent<E>;

        for (let i = 0; i < handlers.length; i++) {
            const handler = handlers[i];
            const ctx = new ListenerContext();
            handler(event, ctx);
            if (ctx.unregistered) {
                handlers.splice(i, 1);
                i--;
            }
            if (event.shouldStopPropagation) break;
        }

        return event instanceof CancelableEvent ? event.canceled : false;
    }

    trigger<H extends HookName>(
        hookName: H,
        data: HookPointData<H>,
        original: GameHookReturn<H>,
    ): GameHookReturn<H> {
        const handlers = this.hookNameToHandlers[hookName];
        if (!handlers || handlers.length == 0) return original;
        const hookPointConstructor = GameHookPoints[hookName] as any;
        const hookPoint = new hookPointConstructor(data, original) as GameHookPoint<H>;

        let hookReturn: GameHookReturn<H> = original; //original fallback just in case

        for (let i = 0; i < handlers.length; i++) {
            const handler = handlers[i];
            hookReturn = handler(hookPoint);
        }

        return hookReturn;
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

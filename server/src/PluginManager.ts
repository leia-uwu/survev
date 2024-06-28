import { Config } from "./config";
import { type Game } from "./game";
import { type Player } from "./objects/player";
import { type DamageParams } from "./objects/gameObject";

export enum Events {
    Player_Damage,
    Player_Kill,
    Game_Created
}

interface PlayerDamageEvent extends DamageParams {
    player: Player
}

interface EventMap {
    [Events.Player_Damage]: PlayerDamageEvent
    [Events.Player_Kill]: Omit<PlayerDamageEvent, "amount">
    [Events.Game_Created]: Game
}

type EventHandler<E extends keyof EventMap> = (data: EventMap[E]) => void;

type EventHandlers = {
    [E in keyof EventMap]?: Set<EventHandler<E>>; // optional since handlers are not determined on object initialization
};

export abstract class Plugin {
    handlers: EventHandlers = {};

    constructor(public readonly game: Game) {
        this.initListeners();
    }

    protected abstract initListeners(): void;

    on<E extends keyof EventMap>(eventName: E, handler: EventHandler<E>): void {
        ((this.handlers[eventName] as Set<typeof handler>) ??= new Set()).add(handler);
    }
}

export class PluginManager {
    private readonly _plugins = new Set<Plugin>();

    constructor(readonly game: Game) {}

    emit<E extends keyof EventMap>(eventName: E, data: EventMap[E]): void {
        for (const plugin of this._plugins) {
            const handlers: EventHandlers[E] = plugin.handlers[eventName];
            if (handlers) {
                for (const handler of handlers) {
                    handler(data);
                }
            }
        }
    }

    private loadPlugin(PluginConstructor: new (game: Game) => Plugin): void {
        const plugin = new PluginConstructor(this.game);
        this._plugins.add(plugin);
    }

    loadPlugins() {
        for (const plugin of Config.plugins) {
            this.loadPlugin(plugin);
        }
    }
}

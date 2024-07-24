import fs from "fs";
import path from "path";
import type { Game } from "./game";
import type { DamageParams } from "./objects/gameObject";
import type { Player } from "./objects/player";

export enum Events {
    Player_Join,
    Player_Damage,
    Player_Kill,
    Game_Created
}

interface PlayerDamageEvent extends DamageParams {
    player: Player;
}

interface EventMap {
    [Events.Player_Join]: Player;
    [Events.Player_Damage]: PlayerDamageEvent;
    [Events.Player_Kill]: Omit<PlayerDamageEvent, "amount">;
    [Events.Game_Created]: Game;
}

type EventHandler<E extends keyof EventMap> = (data: EventMap[E]) => void;

type EventHandlers = {
    [E in keyof EventMap]?: Set<EventHandler<E>>; // optional since handlers are not determined on object initialization
};

function readDirectory(dir: string): string[] {
    let results: string[] = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.resolve(dir, file);
        const stat = fs.statSync(filePath);

        if (stat?.isDirectory()) {
            const res = readDirectory(filePath);
            results = results.concat(res);
        } else results.push(filePath);
    }

    return results;
}

const pluginDir = path.join(__dirname, "../plugins/");

const pluginPaths = readDirectory(pluginDir).filter(
    (path) => path.endsWith(".ts") || path.endsWith(".js")
);

console.log(pluginPaths);

export abstract class GamePlugin {
    handlers: EventHandlers = {};

    constructor(public readonly game: Game) {
        this.initListeners();
    }

    protected abstract initListeners(): void;

    on<E extends keyof EventMap>(eventName: E, handler: EventHandler<E>): void {
        // eslint-disable-next-line
        ((this.handlers[eventName] as Set<typeof handler>) ??= new Set()).add(handler);
    }
}

export class PluginManager {
    private readonly _plugins = new Set<GamePlugin>();

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

    private loadPlugin(PluginConstructor: new (game: Game) => GamePlugin): void {
        const plugin = new PluginConstructor(this.game);
        this._plugins.add(plugin);
    }

    async loadPlugins() {
        for (const path of pluginPaths) {
            const plugin = ((await import(path)) as { default: new () => GamePlugin })
                .default;

            this.loadPlugin(plugin);
        }
    }

    unloadPlugins() {
        this._plugins.clear();
    }
}

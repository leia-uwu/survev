import type { KillFeedSegment, KillFeedStyleObj } from "../../../shared/net/killFeedMsg";
import type { Game } from "../game/game";
import type { EventName, GamePlugin } from "../game/pluginManager";
import { IDAllocator } from "./IDAllocator";

export function createSimpleSegment(
    text: string,
    color?: string,
    fontWeight?: string,
): KillFeedSegment {
    const style = {} as KillFeedStyleObj;
    if (color) style.color = color;
    if (fontWeight) style.fontWeight = fontWeight;

    return { text, style };
}

function createSegment(text: string, style: KillFeedStyleObj): KillFeedSegment {
    return { text, style };
}

export function attachEventLogger(plugin: GamePlugin, eventName: EventName) {
    plugin.on(eventName, (_event) => {
        const segments = [
            createSimpleSegment(eventName, "red", "bold"),
            createSimpleSegment(" was emitted", "white"),
        ];
        plugin.game.playerBarn.addKillFeedLine(-1, segments);
    });
}

interface Timer {
    callback: () => void;
    remaining: number;
    repeat: number;
    destroyed: boolean;
}

export class TimerManager {
    idAllocator = new IDAllocator(8);
    idToTimer: Map<number, Timer> = new Map();

    constructor(public readonly game: Game) {}

    update(dt: number) {
        for (const [id, timer] of this.idToTimer) {
            if (timer.destroyed) continue;
            timer.remaining -= dt;
            if (timer.remaining <= 0) {
                timer.callback();
                if (timer.repeat === -1) {
                    this.clearTimer(id);
                } else {
                    timer.remaining += timer.repeat;
                }
            }
        }
    }

    /** delay units are seconds */
    setTimeout(callback: () => void, delay: number = 0): number {
        const id = this.idAllocator.getNextId();
        this.idToTimer.set(id, {
            callback,
            remaining: delay,
            repeat: -1,
            destroyed: false,
        });
        return id;
    }

    /** delay units are seconds */
    setInterval(callback: () => void, delay: number = 0): number {
        const id = this.idAllocator.getNextId();
        this.idToTimer.set(id, {
            callback,
            remaining: delay,
            repeat: delay,
            destroyed: false,
        });
        return id;
    }

    clearTimer(id: number) {
        this.idToTimer.delete(id);
        this.idAllocator.give(id);
    }

    countdown(
        n: number,
        interval: number,
        onTick: (i: number) => void,
        onComplete?: () => void,
    ) {
        let ticksLeft = n;
        const id = this.setInterval(() => {
            if (ticksLeft <= 0) {
                onComplete?.();
                this.clearTimer(id);
                return;
            }
            onTick(ticksLeft);
            ticksLeft -= 1;
        }, interval);
    }
}

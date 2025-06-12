import type { KillFeedSegment, KillFeedStyleObj } from "../../../shared/net/killFeedMsg";
import type { GameObject } from "../game/objects/gameObject";
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

export function createSegment(text: string, style: KillFeedStyleObj): KillFeedSegment {
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

export function addLootAtObj(obj: GameObject, type: string) {
    obj.game.lootBarn.addLoot(type, obj.pos, obj.layer, 1);
}

interface Timer {
    callback: () => void;
    remaining: number;
    repeat: number;
    destroyed: boolean;
    paused: boolean;
}

export class TimerManager {
    idAllocator = new IDAllocator(8);
    idToTimer: Map<number, Timer> = new Map();
    update(dt: number) {
        for (const [id, timer] of this.idToTimer) {
            if (timer.destroyed || timer.paused) continue;
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
            paused: false,
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
            paused: false,
        });
        return id;
    }

    setIntervalImmediately(callback: () => void, delay: number = 0): number {
        const id = this.idAllocator.getNextId();
        this.idToTimer.set(id, {
            callback,
            remaining: 0,
            repeat: delay,
            destroyed: false,
            paused: false,
        });
        return id;
    }

    clearTimer(id: number) {
        this.idToTimer.delete(id);
        this.idAllocator.give(id);
    }

    pauseTimer(id: number) {
        const timer = this.idToTimer.get(id);
        if (!timer) return;
        timer.paused = true;
    }

    resumeTimer(id: number) {
        const timer = this.idToTimer.get(id);
        if (!timer) return;
        timer.paused = false;
    }

    /**
     * interval units are seconds
     *
     * if onComplete is defined, countdown will tick for one extra interval before executing it
     */
    countdown(
        n: number,
        interval: number,
        onTick: (i: number) => void,
        onComplete?: () => void,
    ) {
        let ticksLeft = n;
        const id = this.setIntervalImmediately(() => {
            onTick(ticksLeft);
            ticksLeft -= 1;

            if (ticksLeft <= 0) {
                this.clearTimer(id);
                if (onComplete) {
                    this.setTimeout(onComplete, interval);
                }
                return;
            }
        }, interval);
    }
}

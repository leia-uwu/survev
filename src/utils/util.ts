import { type AABB } from "./coldet";
import { math } from "./math";
import { v2 } from "./v2";

export const util = {
    //
    // Game objects can belong to the following layers:
    //   0: ground layer
    //   1: bunker layer
    //   2: ground and stairs (both)
    //   3: bunker and stairs (both)
    //
    // Objects on the same layer should interact with one another.
    sameLayer(a: number, b: number) {
        // Which is faster?
        /* eslint-disable no-mixed-operators */
        // return (a == b && a < 2) || (a >= 2 && b >= 2);
        return (a & 0x1) === (b & 0x1) || a & 0x2 && b & 0x2;
    },

    sameAudioLayer(a: number, b: number) {
        return a === b || a & 0x2 || b & 0x2;
    },

    toGroundLayer(a: number) {
        // return a < 2 ? a : (a == 2 ? 0 : 1);
        return a & 0x1;
    },

    toStairsLayer(a: number) {
        // return a >= 2 ? a : (a == 0 ? 2 : 3);
        //  return a | 0x2;
        return a & 0x1;
    },

    random(min: number, max: number) {
        return math.lerp(Math.random(), min, max);
    },

    randomInt(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Uniformly distributed random point within circle
    // Taken from https://stackoverflow.com/questions/5837572/generate-a-random-point-within-a-circle-uniformly
    randomPointInCircle(rad: number) {
        let a = Math.random();
        let b = Math.random();
        if (b < a) {
            const c = a;
            a = b;
            b = c;
        }
        const pos = v2.create(b * rad * Math.cos(2.0 * Math.PI * a / b), b * rad * Math.sin(2.0 * Math.PI * a / b));
        return pos;
    },

    randomPointInAabb(aabb: AABB) {
        return v2.create(util.random(aabb.min.x, aabb.max.x), util.random(aabb.min.y, aabb.max.y));
    },

    seededRand(seed: number) {
        // Park-Miller PRNG
        let rng = seed;
        return function(min = 0, max = 1) {
            rng = rng * 16807 % 2147483647;
            const t = rng / 2147483647;
            return math.lerp(t, min, max);
        };
    },

    // Taken from https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
    isObject(item: unknown) {
        return item && (typeof item === "undefined" ? "undefined" : typeof item) === "object" && !Array.isArray(item);
    },

    mergeDeep(target: any, ...sources: any[]): any {
        if (!sources.length) return target;
        const source = sources.shift();

        if (this.isObject(target) && this.isObject(source)) {
            for (const key in source) {
                if (this.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    this.mergeDeep(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }

        return this.mergeDeep(target, ...sources);
    },

    cloneDeep(source: unknown) {
        // @TODO: This does not properly handle arrays
        return util.mergeDeep({}, source);
    },

    shuffleArray(arr: unknown[]) {
        for (let i = arr.length - 1; i >= 0; i--) {
            const idx = Math.floor(Math.random() * (i + 1));
            const tmp = arr[i];
            arr[i] = arr[idx];
            arr[idx] = tmp;
        }
    },

    // functions not copied from surviv
    // https://stackoverflow.com/a/55671924/5905216
    /**
    * Pick a random element from a weighted series of elements.
    * @param items The elements to choose from.
    * @param weights A legend of the elements' relative weight.
    */
    weightedRandom<T>(items: T[], weights: number[]): T {
        let i: number;
        for (i = 1; i < weights.length; i++) weights[i] += weights[i - 1];

        const random = Math.random() * weights[weights.length - 1];
        for (i = 0; i < weights.length; i++) { if (weights[i] > random) break; }
        return items[i];
    }

};

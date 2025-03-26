import { GameObjectDefs, type LootDef } from "../../../../shared/defs/gameObjectDefs";
import type { MapDef } from "../../../../shared/defs/mapDefs";
import { GameConfig } from "../../../../shared/gameConfig";
import { ObjectType } from "../../../../shared/net/objectSerializeFns";
import { type AABB, type Circle, coldet } from "../../../../shared/utils/coldet";
import { collider } from "../../../../shared/utils/collider";
import { math } from "../../../../shared/utils/math";
import type { River } from "../../../../shared/utils/river";
import { assert, util } from "../../../../shared/utils/util";
import { type Vec2, v2 } from "../../../../shared/utils/v2";
import type { Game } from "../game";
import { BaseGameObject } from "./gameObject";
import type { MapIndicator } from "./mapIndicator";
import type { Player } from "./player";

// velocity drag applied every tick
const LOOT_DRAG = 3;
// how much loot pushes each other every tick
const LOOT_PUSH_FORCE = 6;
// explosion push force multiplier
export const EXPLOSION_LOOT_PUSH_FORCE = 6;

const AMMO_OFFSET_X = 1.35;
const AMMO_OFFSET_Y = -0.3;

type LootTierItem = MapDef["lootTable"][string][number];

export class LootBarn {
    loots: Loot[] = [];

    private _cachedTiers: Record<string, () => LootTierItem> = {};

    constructor(public game: Game) {}

    update(dt: number) {
        const collisions: Record<string, boolean> = {};

        for (let i = 0; i < this.loots.length; i++) {
            const loot = this.loots[i];
            if (loot.destroyed) {
                this.loots.splice(i, 1);
                i--;
                continue;
            }
            loot.update(dt, collisions);
        }
    }

    splitUpLoot(player: Player, item: string, amount: number, dir: Vec2) {
        const dropCount = Math.floor(amount / 60);
        for (let i = 0; i < dropCount; i++) {
            this.addLoot(item, player.pos, player.layer, 60, undefined, -4, dir);
        }
        if (amount % 60 !== 0)
            this.addLoot(item, player.pos, player.layer, amount % 60, undefined, -4, dir);
    }

    /**
     * spawns loot without ammo attached, use addLoot() if you want the respective ammo to drop alongside the gun
     */
    addLootWithoutAmmo(
        type: string,
        pos: Vec2,
        layer: number,
        count: number,
        pushSpeed?: number,
        dir?: Vec2,
    ) {
        const loot = new Loot(this.game, type, pos, layer, count, pushSpeed, dir);
        this._addLoot(loot);
    }

    addLoot(
        type: string,
        pos: Vec2,
        layer: number,
        count: number,
        useCountForAmmo?: boolean,
        pushSpeed?: number,
        dir?: Vec2,
        preloadGun?: boolean,
    ) {
        const loot = new Loot(this.game, type, pos, layer, count, pushSpeed, dir);
        this._addLoot(loot);

        if (preloadGun) {
            loot.isPreloadedGun = true;
        }

        const def = GameObjectDefs[type];
        if (def.type === "gun" && GameObjectDefs[def.ammo] && !preloadGun) {
            const ammoCount = useCountForAmmo ? count : def.ammoSpawnCount;
            if (ammoCount <= 0) return;
            const halfAmmo = Math.ceil(ammoCount / 2);

            const leftAmmo = new Loot(
                this.game,
                def.ammo,
                v2.add(pos, v2.create(-AMMO_OFFSET_X, AMMO_OFFSET_Y)),
                layer,
                halfAmmo,
                pushSpeed,
                dir,
            );
            this._addLoot(leftAmmo);

            if (ammoCount - halfAmmo >= 1) {
                const rightAmmo = new Loot(
                    this.game,
                    def.ammo,
                    v2.add(pos, v2.create(AMMO_OFFSET_X, AMMO_OFFSET_Y)),
                    layer,
                    ammoCount - halfAmmo,
                    pushSpeed,
                    dir,
                );
                this._addLoot(rightAmmo);
            }
        }
    }

    private _addLoot(loot: Loot) {
        this.game.objectRegister.register(loot);
        this.loots.push(loot);
    }

    private _getLootTable(tier: string): LootTierItem {
        if (this._cachedTiers[tier]) {
            return this._cachedTiers[tier]();
        }
        const lootTable = this.game.map.mapDef.lootTable[tier];

        let total = 0.0;
        for (let i = 0; i < lootTable.length; i++) {
            total += lootTable[i].weight;
        }

        function fn() {
            let rng = util.random(0, total);
            let idx = 0;
            while (rng > lootTable[idx].weight) {
                rng -= lootTable[idx].weight;
                idx++;
            }
            return lootTable[idx];
        }
        this._cachedTiers[tier] = fn;
        return fn();
    }

    getLootTable(tier: string): Array<LootTierItem> {
        if (!this.game.map.mapDef.lootTable[tier]) {
            this.game.logger.warn(`Unknown loot tier with type ${tier}`);
            return [];
        }
        const items: Array<LootTierItem> = [];

        const item = this._getLootTable(tier);
        if (item.name.startsWith("tier_")) {
            items.push(...this.getLootTable(item.name));
        } else if (item.name) {
            items.push(item);
        }

        return items;
    }
}

export class Loot extends BaseGameObject {
    override readonly __type = ObjectType.Loot;
    bounds: AABB;

    isPreloadedGun = false;
    hasOwner = false;
    ownerId = 0;
    isOld = false;

    layer: number;
    type: string;
    count: number;

    vel = v2.create(0, 0);
    oldPos = v2.create(0, 0);

    collider: Circle;
    rad: number;
    ticks = 0;

    bellowBridge = false;

    mapIndicator?: MapIndicator;

    constructor(
        game: Game,
        type: string,
        pos: Vec2,
        layer: number,
        count: number,
        pushSpeed = 4,
        dir?: Vec2,
    ) {
        super(game, pos);

        const def = GameObjectDefs[type] as LootDef;
        def === undefined
            ? console.log(`Invalid loot type ${type}`)
            : assert("lootImg" in def, `Invalid loot type ${type}`);

        this.layer = layer;
        this.type = type;
        this.count = def.type === "gun" ? 1 : count;

        this.collider = collider.createCircle(pos, GameConfig.lootRadius[def.type]);
        this.collider.pos = this.pos;

        this.rad = this.collider.rad;

        this.bounds = collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(this.rad, this.rad),
        );

        if ("mapIndicator" in def) {
            this.mapIndicator = this.game.mapIndicatorBarn.allocIndicator(
                this.type,
                false,
            );
            this.mapIndicator?.updatePosition(this.pos);
        }

        this.push(dir ?? v2.randomUnit(), pushSpeed);
    }

    updatePos(newPos: Vec2): void {
        this.pos = v2.copy(newPos);
        this.game.map.clampToMapBounds(this.pos, this.rad);
        this.setPartDirty();
    }

    refresh(): void {
        this.collider.pos = this.pos;
        this.game.grid.updateObject(this);
    }

    update(dt: number, collisions: Record<string, boolean>): void {
        if (this.ticks > 2 && !this.isOld) {
            this.isOld = true;
            this.ticks = 0;
            this.setDirty();
        } else this.ticks++;
        const moving =
            !this.isOld ||
            Math.abs(this.vel.x) > 0.001 ||
            Math.abs(this.vel.y) > 0.001 ||
            !v2.eq(this.oldPos, this.pos);

        if (!moving) return;

        this.oldPos = v2.copy(this.pos);

        v2.set(this.pos, v2.add(this.pos, v2.mul(this.vel, dt)));
        this.vel = v2.mul(this.vel, 1 / (1 + dt * LOOT_DRAG));

        let objs = this.game.grid.intersectCollider(this.collider);

        for (let i = 0; i < objs.length; i++) {
            const obj = objs[i];
            if (obj.__type === ObjectType.Obstacle) {
                if (!obj.collidable) continue;
                if (!util.sameLayer(obj.layer, this.layer)) continue;
                if (obj.dead) continue;

                const collision = collider.intersectCircle(
                    obj.collider,
                    this.pos,
                    this.rad,
                );
                if (collision) {
                    v2.set(
                        this.pos,
                        v2.add(this.pos, v2.mul(collision.dir, collision.pen + 0.001)),
                    );
                }
            } else if (obj.__type === ObjectType.Loot && obj.__id !== this.__id) {
                const hash1 = `${this.__id} ${obj.__id}`;
                const hash2 = `${obj.__id} ${this.__id}`;
                if (collisions[hash1] || collisions[hash2]) continue;
                if (!util.sameLayer(obj.layer, this.layer)) continue;

                const res = coldet.intersectCircleCircle(
                    this.pos,
                    this.collider.rad * 1.25,
                    obj.pos,
                    obj.collider.rad * 1.25,
                );
                if (!res) continue;
                collisions[hash1] = collisions[hash2] = true;

                const force = (res.pen / 2) * LOOT_PUSH_FORCE * dt;
                this.vel = v2.sub(this.vel, v2.mul(res.dir, force));
                obj.vel = v2.add(obj.vel, v2.mul(res.dir, force));
            }
        }

        const originalLayer = this.layer;
        const stair = this.checkStairs(objs, this.rad);
        if (this.layer !== originalLayer) {
            this.setDirty();
        }

        if (this.layer === 0) {
            this.bellowBridge = false;
        }

        if (stair?.lootOnly) {
            this.bellowBridge = true;
        }

        const surface = this.game.map.getGroundSurface(this.pos, this.layer);
        let finalRiver: River | undefined;
        if ((this.layer === 0 && surface.river) || this.bellowBridge) {
            const rivers = this.game.map.normalRivers;
            for (let i = 0; i < rivers.length; i++) {
                const river = rivers[i];
                if (
                    coldet.testPointAabb(this.pos, river.aabb.min, river.aabb.max) &&
                    math.pointInsidePolygon(this.pos, river.waterPoly)
                ) {
                    finalRiver = river;
                    break;
                }
            }
        }
        if (finalRiver) {
            const tangent = finalRiver.spline.getTangent(
                finalRiver.spline.getClosestTtoPoint(this.pos),
            );
            this.push(tangent, 0.5 * dt);
        }

        if (!v2.eq(this.oldPos, this.pos)) {
            this.setPartDirty();
            this.game.grid.updateObject(this);
            this.mapIndicator?.updatePosition(this.pos);
        }

        this.game.map.clampToMapBounds(this.pos, this.rad);
    }

    push(dir: Vec2, velocity: number): void {
        this.vel = v2.add(this.vel, v2.mul(dir, velocity));
    }

    override destroy() {
        super.destroy();
        this.mapIndicator?.kill();
    }
}

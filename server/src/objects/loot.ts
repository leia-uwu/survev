import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";
import { type Game } from "../game";
import { GameConfig } from "../../../shared/gameConfig";
import { type Circle, coldet } from "../../../shared/utils/coldet";
import { collider } from "../../../shared/utils/collider";
import { util } from "../../../shared/utils/util";
import { v2, type Vec2 } from "../../../shared/utils/v2";
import { BaseGameObject } from "./gameObject";
import { Obstacle } from "./obstacle";
import { Structure } from "./structure";
import { type Player } from "./player";
import { MapDefs } from "../../../shared/defs/mapDefs";
import { ObjectType } from "../../../shared/utils/objectSerializeFns";

export class LootBarn {
    loots: Loot[] = [];
    constructor(public game: Game) { }

    update(dt: number) {
        for (let i = 0; i < this.loots.length; i++) {
            const loot = this.loots[i];
            if (loot.destroyed) {
                this.loots.splice(i, 1);
                continue;
            }
            loot.update(dt);
        }
    }

    splitUpLoot(player: Player, item: string, amount: number, dir: Vec2) {
        const dropCount = Math.floor(amount / 60);
        for (let i = 0; i < dropCount; i++) {
            this.addLoot(item, player.pos, player.layer, 60, undefined, -4, dir);
        }
        if (amount % 60 !== 0) this.addLoot(item, player.pos, player.layer, amount % 60, undefined, -4, dir);
    }

    /**
    * spawns loot without ammo attached, use addLoot() if you want the respective ammo to drop alongside the gun
    */
    addLootWithoutAmmo(type: string, pos: Vec2, layer: number, count: number) {
        const loot = new Loot(this.game, type, pos, layer, count);
        this._addLoot(loot);
    }

    addLoot(type: string, pos: Vec2, layer: number, count: number, useCountForAmmo?: boolean, pushSpeed?: number, dir?: Vec2) {
        const loot = new Loot(this.game, type, pos, layer, count, pushSpeed, dir);
        this._addLoot(loot);

        const def = GameObjectDefs[type];

        if (def.type === "gun" && GameObjectDefs[def.ammo]) {
            const ammoCount = useCountForAmmo ? count : def.ammoSpawnCount;
            if (ammoCount <= 0) return;
            const halfAmmo = Math.ceil(ammoCount / 2);

            const leftAmmo = new Loot(this.game, def.ammo, v2.add(pos, v2.create(-0.2, -0.2)), layer, halfAmmo, 0);
            leftAmmo.push(v2.create(-1, -1), 0.5);
            this._addLoot(leftAmmo);

            if (ammoCount - halfAmmo >= 1) {
                const rightAmmo = new Loot(this.game, def.ammo, v2.add(pos, v2.create(0.2, -0.2)), layer, ammoCount - halfAmmo, 0);
                rightAmmo.push(v2.create(1, -1), 0.5);

                this._addLoot(rightAmmo);
            }
        }
    }

    private _addLoot(loot: Loot) {
        this.game.objectRegister.register(loot);
        this.loots.push(loot);
    }

    getLootTable(tier: string): Array<{ name: string, count: number }> {
        const lootTable = MapDefs[this.game.config.map].lootTable[tier];
        const items: Array<{ name: string, count: number }> = [];

        if (!lootTable) {
            console.warn(`Unknown loot tier with type ${tier}`);
            return [];
        }

        const weights: number[] = [];

        const weightedItems: Array<{ name: string, count: number }> = [];
        for (const item of lootTable) {
            weightedItems.push({
                name: item.name,
                count: item.count
            });
            weights.push(item.weight);
        }

        const item = util.weightedRandom(weightedItems, weights);

        if (item.name.startsWith("tier_")) {
            items.push(...this.getLootTable(item.name));
        } else if (item.name) {
            items.push(item);
        }

        return items;
    }
}

export class Loot extends BaseGameObject {
    bounds = collider.createCircle(v2.create(0.0, 0.0), 3.0);

    override readonly __type = ObjectType.Loot;

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

    dragConstant: number;

    get pos() {
        return this.collider.pos;
    }

    set pos(pos: Vec2) {
        this.collider.pos = pos;
    }

    ticks = 0;

    constructor(game: Game, type: string, pos: Vec2, layer: number, count: number, pushSpeed = 2, dir?: Vec2) {
        super(game, pos);

        const def = GameObjectDefs[type];
        if (!def) {
            throw new Error(`Invalid loot with type ${type}`);
        }

        this.layer = layer;
        this.type = type;
        this.count = count;

        this.collider = collider.createCircle(pos, GameConfig.lootRadius[def.type]);

        this.rad = this.collider.rad;

        this.dragConstant = Math.exp(-3.69 / game.config.tps);

        this.push(dir ?? v2.randomUnit(), pushSpeed);
    }

    update(dt: number): void {
        if (this.ticks > 2 && !this.isOld) {
            this.isOld = true;
            this.ticks = 0;
            this.setDirty();
        } else this.ticks++;
        const moving = Math.abs(this.vel.x) > 0.001 ||
            Math.abs(this.vel.y) > 0.001 ||
            !v2.eq(this.oldPos, this.pos);

        if (!moving) return;

        this.oldPos = v2.copy(this.pos);

        const halfDt = dt / 2;

        const calculateSafeDisplacement = (): Vec2 => {
            let displacement = v2.mul(this.vel, halfDt);
            if (v2.lengthSqr(displacement) >= 1) {
                displacement = v2.normalizeSafe(displacement);
            }

            return displacement;
        };

        this.pos = v2.add(this.pos, calculateSafeDisplacement());
        this.vel = v2.mul(this.vel, this.dragConstant);

        this.pos = v2.add(this.pos, calculateSafeDisplacement());

        const objects = this.game.grid.intersectCollider(this.collider);
        for (const obj of objects) {
            if (
                moving &&
                obj instanceof Obstacle &&
                !obj.dead &&
                util.sameLayer(obj.layer, this.layer) &&
                obj.collidable &&
                coldet.test(obj.collider, this.collider)
            ) {
                const res = collider.intersectCircle(obj.collider, this.collider.pos, this.collider.rad);
                if (res) {
                    this.pos = v2.add(this.pos, v2.mul(res.dir, res.pen));
                }
            }

            if (obj instanceof Loot && obj !== this && coldet.test(this.collider, obj.collider)) {
                const res = coldet.intersectCircleCircle(this.pos, this.collider.rad, obj.pos, obj.collider.rad);
                if (res) {
                    this.vel = v2.sub(this.vel, v2.mul(res.dir, 0.2));
                    const norm = res.dir;
                    const vRelativeVelocity = v2.create(this.vel.x - obj.vel.x, this.vel.y - obj.vel.y);

                    const speed = (vRelativeVelocity.x * norm.x + vRelativeVelocity.y * norm.y);

                    if (speed < 0) continue;

                    this.vel.x -= speed * norm.x;
                    this.vel.y -= speed * norm.y;
                    obj.vel.x += speed * norm.x;
                    obj.vel.y += speed * norm.y;
                }
            }
        }

        const river = this.game.map.getGroundSurface(this.pos, 0).river;
        if (river) {
            const tangent = river.spline.getTangent(
                river.spline.getClosestTtoPoint(this.pos)
            );
            this.push(tangent, 0.5 * dt);
        }

        let onStair = false;
        const originalLayer = this.layer;
        const objs = this.game.grid.intersectCollider(this.collider);
        for (const obj of objs) {
            if (obj.__type === ObjectType.Structure) {
                for (const stair of obj.stairs) {
                    if (Structure.checkStairs(this.pos, stair, this)) {
                        onStair = true;
                        break;
                    }
                }
                if (!onStair) {
                    if (this.layer === 2) this.layer = 0;
                    if (this.layer === 3) this.layer = 1;
                }
            }
        }

        if (this.layer !== originalLayer) {
            this.setDirty();
        }

        if (!v2.eq(this.oldPos, this.pos)) {
            this.setPartDirty();
            this.game.grid.updateObject(this);
        }

        this.game.map.clampToMapBounds(this.pos);
    }

    push(dir: Vec2, velocity: number): void {
        this.vel = v2.add(this.vel, v2.mul(dir, velocity));
    }
}

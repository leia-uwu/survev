import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";
import { type ExplosionDef } from "../../../shared/defs/objectsTypings";
import { GameConfig } from "../../../shared/gameConfig";
import { collider } from "../../../shared/utils/collider";
import { math } from "../../../shared/utils/math";
import { ObjectType } from "../../../shared/utils/objectSerializeFns";
import { util } from "../../../shared/utils/util";
import { type Vec2, v2 } from "../../../shared/utils/v2";
import { type Game } from "../game";
import { Decal } from "./decal";
import { type GameObject } from "./gameObject";

export class Explosion {
    rad: number;

    constructor(
        public type: string,
        public pos: Vec2,
        public layer: number,
        public gameSourceType = "",
        public mapSourceType = "",
        public damageType: number = GameConfig.DamageType.Player,
        public source?: GameObject
    ) {
        const def = GameObjectDefs[this.type] as ExplosionDef;

        if (def.type !== "explosion") {
            throw new Error(`Invalid explosion with type ${this.type}`);
        }
        this.rad = def.rad.max;
    }

    explode(game: Game): void {
        const def = GameObjectDefs[this.type] as ExplosionDef;

        const coll = collider.createCircle(this.pos, this.rad);

        // List of all near objects
        const objects = game.grid.intersectCollider(coll);
        const damagedObjects = new Map<number, boolean>();

        for (let angle = -Math.PI; angle < Math.PI; angle += 0.1) {
            // All objects that collided with this line
            const lineCollisions: Array<{
                obj: GameObject
                pos: Vec2
                distance: number
                dir: Vec2
            }> = [];

            const lineEnd = v2.add(this.pos, v2.rotate(v2.create(this.rad, 0), angle));

            for (const obj of objects) {
                if (!util.sameLayer(obj.layer, this.layer)) continue;
                if ((obj as { dead?: boolean }).dead) continue;
                if (obj.__type === ObjectType.Obstacle && obj.height <= 0.25) continue;
                if (obj.__type === ObjectType.Player || obj.__type === ObjectType.Obstacle || obj.__type === ObjectType.Loot) {
                    // check if the object hitbox collides with a line from the explosion center to the explosion max distance
                    const intersection = collider.intersectSegment(obj.collider, this.pos, lineEnd);
                    if (intersection) {
                        lineCollisions.push({
                            pos: intersection.point,
                            obj,
                            distance: v2.distance(this.pos, intersection.point),
                            dir: v2.neg(v2.normalize(v2.sub(this.pos, obj.pos)))
                        });
                    }
                }
            }

            // sort by closest to the explosion center to prevent damaging objects through walls
            lineCollisions.sort((a, b) => a.distance - b.distance);

            for (const collision of lineCollisions) {
                const obj = collision.obj;

                if (!damagedObjects.has(obj.__id)) {
                    damagedObjects.set(obj.__id, true);
                    const dist = collision.distance;

                    if (obj.__type === ObjectType.Player || obj.__type === ObjectType.Obstacle) {
                        let damage = def.damage;

                        if (dist > def.rad.min) {
                            damage = math.remap(dist, def.rad.min, def.rad.max, damage, 0);
                        }

                        if (obj.__type === ObjectType.Obstacle) {
                            damage *= def.obstacleDamage;
                        }

                        obj.damage({
                            amount: damage,
                            gameSourceType: this.gameSourceType,
                            mapSourceType: this.mapSourceType,
                            source: this.source,
                            damageType: this.damageType,
                            dir: collision.dir
                        });
                    }

                    if (obj.__type === ObjectType.Loot) {
                        obj.push(v2.normalize(v2.sub(collision.pos, this.pos)), (def.rad.max - dist) * 4);
                    }
                }

                if (obj.__type === ObjectType.Obstacle && obj.collidable) break;
            }
        }

        const bulletDef = GameObjectDefs[def.shrapnelType];
        if (bulletDef && bulletDef.type === "bullet") {
            for (let i = 0, count = def.shrapnelCount ?? 0; i < count; i++) {
                game.bulletManager.fireBullet(
                    {
                        bulletType: def.shrapnelType,
                        pos: this.pos,
                        layer: this.layer,
                        damageType: this.damageType,
                        playerId: this.source?.__id ?? 0,
                        shotFx: false,
                        damageMult: 1,
                        varianceT: Math.random(),
                        gameSourceType: this.gameSourceType,
                        mapSourceType: this.mapSourceType,
                        dir: v2.randomUnit()
                    }
                );
            }
        }

        if (def.decalType) {
            game.grid.addObject(
                new Decal(
                    game,
                    def.decalType,
                    this.pos,
                    this.layer,
                    0,
                    1
                )
            );
        }
    }
}

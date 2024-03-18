import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";
import { type ExplosionDef } from "../../../shared/defs/objectsTypings";
import { collider } from "../../../shared/utils/collider";
import { util } from "../../../shared/utils/util";
import { type Vec2, v2 } from "../../../shared/utils/v2";
import { type Game } from "../game";
import { Decal } from "./decal";
import { ObjectType, type GameObject } from "./gameObject";

export class Explosion {
    rad: number;

    constructor(
        public type: string,
        public pos: Vec2,
        public layer: number,
        public sourceType: string,
        public damageType: number,
        public source?: GameObject
    ) {
        this.rad = (GameObjectDefs[this.type] as ExplosionDef).rad.max;
    }

    explode(game: Game): void {
        // List of all near objects

        const def = GameObjectDefs[this.type];
        if (def.type !== "explosion") {
            throw new Error(`Invalid explosion with type ${this.type}`);
        }

        const coll = collider.createCircle(this.pos, this.rad);

        const objects = game.grid.intersectCollider(coll);
        const damagedObjects = new Map<number, boolean>();

        for (let angle = -Math.PI; angle < Math.PI; angle += 0.1) {
            // All objects that collided with this line
            const lineCollisions: Array<{
                readonly object: GameObject
                readonly pos: Vec2
                readonly distance: number
            }> = [];

            const lineEnd = v2.add(this.pos, v2.rotate(v2.create(this.rad, 0), angle));

            for (const obj of objects) {
                if (!util.sameLayer(obj.layer, this.layer)) continue;
                if (obj.__type === ObjectType.Player || obj.__type === ObjectType.Obstacle || obj.__type === ObjectType.Loot) {
                    // check if the object hitbox collides with a line from the explosion center to the explosion max distance
                    const intersection = collider.intersectSegment(obj.collider, this.pos, lineEnd);
                    if (intersection) {
                        lineCollisions.push({
                            pos: intersection.point,
                            object: obj,
                            distance: v2.distance(this.pos, intersection.point)
                        });
                    }
                }
            }

            // sort by closest to the explosion center to prevent damaging objects through walls
            lineCollisions.sort((a, b) => a.distance - b.distance);

            const { min, max } = def.rad;
            for (const collision of lineCollisions) {
                const object = collision.object;

                if (!damagedObjects.has(object.id)) {
                    damagedObjects.set(object.id, true);
                    const dist = Math.sqrt(collision.distance);

                    if (object.__type === ObjectType.Player || object.__type === ObjectType.Obstacle) {
                        object.damage(
                            def.damage *
                            (object.__type === ObjectType.Obstacle ? def.obstacleDamage : 1) *
                            ((dist > min) ? (max - dist) / (max - min) : 1),
                            this.sourceType,
                            this.damageType,
                            this.source
                        );
                    }

                    if (object.__type === ObjectType.Loot) {
                        object.push(v2.normalize(v2.sub(collision.pos, this.pos)), (max - dist) * 4);
                    }
                }

                if (object.__type === ObjectType.Obstacle && object.collidable) break;
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
                        playerId: this.source?.id ?? 0,
                        shotFx: false,
                        damageMult: 1,
                        variance: util.random(0, bulletDef.variance),
                        sourceType: this.sourceType,
                        maxDistance: bulletDef.distance,
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

import { GameObjectDefs } from "../../../../shared/defs/gameObjectDefs";
import type { ExplosionDef } from "../../../../shared/defs/gameObjects/explosionsDefs";
import { GameConfig } from "../../../../shared/gameConfig";
import { ObjectType } from "../../../../shared/net/objectSerializeFns";
import { collider } from "../../../../shared/utils/collider";
import { math } from "../../../../shared/utils/math";
import { util } from "../../../../shared/utils/util";
import { type Vec2, v2 } from "../../../../shared/utils/v2";
import type { Game } from "../game";
import type { GameObject } from "./gameObject";

export class ExplosionBarn {
    explosions: Explosion[] = [];
    newExplosions: Explosion[] = [];

    constructor(readonly game: Game) {}

    update() {
        const game = this.game;
        for (let i = 0; i < this.explosions.length; i++) {
            const explosion = this.explosions[i];
            const def = GameObjectDefs[explosion.type] as ExplosionDef;

            if (def.decalType) {
                this.game.decalBarn.addDecal(
                    def.decalType,
                    explosion.pos,
                    explosion.layer,
                    0,
                    1
                );
            }

            if (explosion.type === "explosion_smoke") {
                this.game.smokeBarn.addEmitter(explosion.pos, explosion.layer);
                continue;
            }

            const coll = collider.createCircle(explosion.pos, explosion.rad);

            // List of all near objects
            const objects = game.grid.intersectCollider(coll);
            const damagedObjects = new Map<number, boolean>();

            for (let angle = -Math.PI; angle < Math.PI; angle += 0.1) {
                // All objects that collided with this line
                const lineCollisions: Array<{
                    obj: GameObject;
                    pos: Vec2;
                    distance: number;
                    dir: Vec2;
                }> = [];

                const lineEnd = v2.add(
                    explosion.pos,
                    v2.rotate(v2.create(explosion.rad, 0), angle)
                );

                for (const obj of objects) {
                    if (!util.sameLayer(obj.layer, explosion.layer)) continue;
                    if ((obj as { dead?: boolean }).dead) continue;
                    if (obj.__type === ObjectType.Obstacle && obj.height <= 0.25)
                        continue;
                    if (
                        obj.__type === ObjectType.Player ||
                        obj.__type === ObjectType.Obstacle ||
                        obj.__type === ObjectType.Loot
                    ) {
                        // check if the object hitbox collides with a line from the explosion center to the explosion max distance
                        const intersection = collider.intersectSegment(
                            obj.collider,
                            explosion.pos,
                            lineEnd
                        );
                        if (intersection) {
                            lineCollisions.push({
                                pos: intersection.point,
                                obj,
                                distance: v2.distance(explosion.pos, intersection.point),
                                dir: v2.neg(v2.normalize(v2.sub(explosion.pos, obj.pos)))
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

                        if (
                            obj.__type === ObjectType.Player ||
                            obj.__type === ObjectType.Obstacle
                        ) {
                            let damage = def.damage;
                            if (
                                obj.__type == ObjectType.Player &&
                                obj.hasPerk("flak_jacket")
                            ) {
                                damage *= 0.1;
                            }

                            if (dist > def.rad.min) {
                                damage = math.remap(
                                    dist,
                                    def.rad.min,
                                    def.rad.max,
                                    damage,
                                    0
                                );
                            }

                            if (obj.__type === ObjectType.Obstacle) {
                                damage *= def.obstacleDamage;
                            }

                            obj.damage({
                                amount: damage,
                                gameSourceType: explosion.gameSourceType,
                                mapSourceType: explosion.mapSourceType,
                                source: explosion.source,
                                damageType: explosion.damageType,
                                dir: collision.dir
                            });
                        }

                        if (obj.__type === ObjectType.Loot) {
                            obj.push(
                                v2.normalize(v2.sub(collision.pos, explosion.pos)),
                                (def.rad.max - dist) * 4
                            );
                        }
                    }

                    if (obj.__type === ObjectType.Obstacle && obj.collidable) break;
                }
            }

            const bulletDef = GameObjectDefs[def.shrapnelType];
            if (bulletDef && bulletDef.type === "bullet") {
                for (let i = 0, count = def.shrapnelCount ?? 0; i < count; i++) {
                    game.bulletBarn.fireBullet({
                        bulletType: def.shrapnelType,
                        pos: explosion.pos,
                        layer: explosion.layer,
                        damageType: explosion.damageType,
                        playerId: explosion.source?.__id ?? 0,
                        shotFx: false,
                        damageMult: 1,
                        varianceT: Math.random(),
                        gameSourceType: explosion.gameSourceType,
                        mapSourceType: explosion.mapSourceType,
                        dir: v2.randomUnit()
                    });
                }
            }
        }
        this.explosions.length = 0;
    }

    flush() {
        this.newExplosions.length = 0;
    }

    addExplosion(
        type: string,
        pos: Vec2,
        layer: number,
        gameSourceType = "",
        mapSourceType = "",
        damageType: number = GameConfig.DamageType.Player,
        source?: GameObject
    ) {
        const def = GameObjectDefs[type];

        if (def.type !== "explosion") {
            throw new Error(`Invalid explosion with type ${type}`);
        }
        const explosion: Explosion = {
            rad: def.rad.max,
            type,
            pos,
            layer,
            gameSourceType,
            mapSourceType,
            damageType,
            source
        };
        this.explosions.push(explosion);
        this.newExplosions.push(explosion);
    }
}

interface Explosion {
    rad: number;
    type: string;
    pos: Vec2;
    layer: number;
    gameSourceType: string;
    mapSourceType: string;
    damageType: number;
    source?: GameObject;
}

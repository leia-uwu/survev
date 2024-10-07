import { GameObjectDefs } from "../../../../shared/defs/gameObjectDefs";
import type { ThrowableDef } from "../../../../shared/defs/gameObjects/throwableDefs";
import { DamageType, GameConfig } from "../../../../shared/gameConfig";
import { ObjectType } from "../../../../shared/net/objectSerializeFns";
import { type AABB, coldet } from "../../../../shared/utils/coldet";
import { collider } from "../../../../shared/utils/collider";
import { math } from "../../../../shared/utils/math";
import { util } from "../../../../shared/utils/util";
import { type Vec2, v2 } from "../../../../shared/utils/v2";
import type { Game } from "../game";
import { BaseGameObject } from "./gameObject";

const gravity = 10;

export class ProjectileBarn {
    projectiles: Projectile[] = [];
    constructor(readonly game: Game) {}

    update(dt: number) {
        for (let i = 0; i < this.projectiles.length; i++) {
            const proj = this.projectiles[i];
            if (proj.destroyed) {
                this.projectiles.splice(i, 1);
                i--;
                continue;
            }
            proj.update(dt);
        }
    }

    addProjectile(
        playerId: number,
        type: string,
        pos: Vec2,
        posZ: number,
        layer: number,
        vel: Vec2,
        fuseTime: number,
        damageType: number,
    ): Projectile {
        const proj = new Projectile(
            this.game,
            type,
            pos,
            layer,
            posZ,
            playerId,
            vel,
            fuseTime,
            damageType,
        );

        this.projectiles.push(proj);
        this.game.objectRegister.register(proj);
        return proj;
    }
}

export class Projectile extends BaseGameObject {
    override readonly __type = ObjectType.Projectile;
    bounds: AABB;

    layer: number;

    posZ: number;
    dir: Vec2;
    type: string;

    rad: number;

    playerId: number;
    fuseTime: number;
    damageType: DamageType;

    vel: Vec2;
    velZ: number;
    dead = false;

    obstacleBellowId = 0;

    constructor(
        game: Game,
        type: string,
        pos: Vec2,
        layer: number,
        posZ: number,
        playerId: number,
        vel: Vec2,
        fuseTime: number,
        damageType: DamageType,
    ) {
        super(game, pos);
        this.layer = layer;
        this.type = type;
        this.posZ = posZ;
        this.playerId = playerId;
        this.vel = vel;
        this.fuseTime = fuseTime;
        this.damageType = damageType;
        this.dir = v2.normalizeSafe(vel);

        const def = GameObjectDefs[type] as ThrowableDef;
        this.velZ = def.throwPhysics.velZ;
        this.rad = def.rad * 0.5;
        this.bounds = collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(this.rad, this.rad),
        );
    }

    update(dt: number) {
        const def = GameObjectDefs[this.type] as ThrowableDef;
        //
        // Velocity
        //
        if (!def.forceMaxThrowDistance) {
            //velocity needs to stay constant to reach max throw dist
            this.vel = v2.mul(this.vel, 1 / (1 + dt * (this.posZ != 0 ? 1.2 : 2)));
        }
        this.pos = v2.add(this.pos, v2.mul(this.vel, dt));

        //
        // Height / posZ
        //
        this.velZ -= gravity * dt;
        this.posZ += this.velZ * dt;
        this.posZ = math.clamp(this.posZ, 0, GameConfig.projectile.maxHeight);
        let height = this.posZ;
        if (def.throwPhysics.fixedCollisionHeight) {
            height = def.throwPhysics.fixedCollisionHeight;
        }

        //
        // Collision and changing layers on stair
        //
        const coll = collider.createCircle(this.pos, this.rad, this.posZ);
        const objs = this.game.grid.intersectCollider(coll);

        for (const obj of objs) {
            if (
                obj.__type === ObjectType.Obstacle &&
                util.sameLayer(this.layer, obj.layer) &&
                !obj.dead
            ) {
                const intersection = collider.intersectCircle(
                    obj.collider,
                    this.pos,
                    this.rad,
                );
                if (intersection) {
                    if (obj.height >= height && obj.__id !== this.obstacleBellowId) {
                        obj.damage({
                            amount: 1,
                            damageType: this.damageType,
                            gameSourceType: this.type,
                            mapSourceType: "",
                            dir: this.vel,
                        });

                        if (obj.dead || !obj.collidable) continue;

                        this.pos = v2.add(
                            this.pos,
                            v2.mul(intersection.dir, intersection.pen),
                        );

                        if (def.explodeOnImpact) {
                            this.explode();
                        } else {
                            const len = v2.length(this.vel);
                            const dir = v2.div(this.vel, len);
                            const normal = intersection.dir;
                            const dot = v2.dot(dir, normal);
                            const newDir = v2.add(v2.mul(normal, dot * -2), this.dir);
                            this.vel = v2.mul(newDir, len * 0.2);
                        }
                    } else if (obj.collidable) {
                        this.obstacleBellowId = obj.__id;
                    }
                }
            } else if (
                obj.__type === ObjectType.Player &&
                def.playerCollision &&
                !obj.dead &&
                obj.__id !== this.playerId
            ) {
                if (coldet.testCircleCircle(this.pos, this.rad, obj.pos, obj.rad)) {
                    this.explode();
                }
            }
        }

        this.game.map.clampToMapBounds(this.pos, this.rad);

        const originalLayer = this.layer;
        this.checkStairs(objs, this.rad);

        if (!this.dead) {
            if (this.layer !== originalLayer) {
                this.setDirty();
            } else {
                this.setPartDirty();
            }

            this.game.grid.updateObject(this);

            if (this.posZ === 0 && def.explodeOnImpact) {
                this.explode();
            }

            //
            // Fuse time
            //

            this.fuseTime -= dt;
            if (this.fuseTime <= 0) {
                this.explode();
            }
        }
    }

    explode() {
        if (this.dead) return;
        this.dead = true;
        const def = GameObjectDefs[this.type] as ThrowableDef;

        // courtesy of kaklik
        if (def.splitType && def.numSplit) {
            for (let i = 0; i < def.numSplit; i++) {
                const splitDef = GameObjectDefs[def.splitType] as ThrowableDef;
                const velocity = v2.add(this.vel, v2.mul(v2.randomUnit(), 5));
                this.game.projectileBarn.addProjectile(
                    this.playerId,
                    def.splitType,
                    this.pos,
                    1,
                    this.layer,
                    velocity,
                    splitDef.fuseTime,
                    DamageType.Player,
                );
            }
        }

        const explosionType = def.explosionType;
        if (explosionType) {
            const source = this.game.objectRegister.getById(this.playerId);
            this.game.explosionBarn.addExplosion(
                explosionType,
                this.pos,
                this.layer,
                this.type,
                "",
                this.damageType,
                source,
            );
        }
        this.destroy();
    }
}

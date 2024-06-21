import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";
import { type ThrowableDef } from "../../../shared/defs/objectsTypings";
import { type Game } from "../game";
import { coldet, type Collider } from "../../../shared/utils/coldet";
import { collider } from "../../../shared/utils/collider";
import { v2, type Vec2 } from "../../../shared/utils/v2";
import { BaseGameObject } from "./gameObject";
import { ObjectType } from "../../../shared/utils/objectSerializeFns";
import { util } from "../../../shared/utils/util";
import { Structure } from "./structure";
import { math } from "../../../shared/utils/math";
import { GameConfig } from "../../../shared/gameConfig";

export class ProjectileBarn {
    projectiles: Projectile[] = [];
    constructor(readonly game: Game) { }

    update(dt: number) {
        for (let i = 0; i < this.projectiles.length; i++) {
            const proj = this.projectiles[i];
            if (proj.destroyed) {
                this.projectiles.splice(i, 0);
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
        damageType: number
    ): Projectile {
        const proj = new Projectile(this.game, type, pos, layer);
        proj.posZ = posZ;
        proj.playerId = playerId;
        proj.vel = vel;
        proj.fuseTime = fuseTime;
        proj.damageType = damageType;
        proj.dir = v2.normalize(vel);

        this.game.objectRegister.register(proj);
        return proj;
    }
}

export class Projectile extends BaseGameObject {
    bounds: Collider;

    override readonly __type = ObjectType.Projectile;

    layer: number;

    posZ: number = 5;
    dir = v2.create(0, 0);
    type: string;

    playerId = 0;
    fuseTime = Infinity;
    damageType = 0;

    vel = v2.create(0, 0);
    dead = false;

    obstacleBellowId = 0;

    constructor(game: Game, type: string, pos: Vec2, layer: number) {
        super(game, pos);
        this.layer = layer;
        this.type = type;

        const def = GameObjectDefs[type] as ThrowableDef;

        this.bounds = collider.createCircle(v2.create(0, 0), def.rad);
    }

    update(dt: number) {
        //
        // Velocity
        //
        this.pos = v2.add(this.pos, v2.mul(this.vel, dt));
        this.vel = v2.mul(this.vel, 0.96);

        const def = GameObjectDefs[this.type] as ThrowableDef;

        //
        // Height / posZ
        //

        let height = this.posZ;
        if (def.throwPhysics.fixedCollisionHeight) {
            height = def.throwPhysics.fixedCollisionHeight;
        } else {
            this.posZ -= def.throwPhysics.velZ * dt / 10;
            this.posZ = height = math.clamp(this.posZ, 0, GameConfig.projectile.maxHeight);
        }

        //
        // Collision and changing layers on stair
        //
        const rad = math.max(def.rad * this.posZ, 0.5);
        const coll = collider.createCircle(this.pos, rad, this.posZ);
        const objs = this.game.grid.intersectCollider(coll);
        let onStair = false;
        const originalLayer = this.layer;

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
                if (this.layer !== originalLayer) {
                    this.setDirty();
                }
            } else if (obj.__type === ObjectType.Obstacle &&
                util.sameLayer(this.layer, obj.layer) &&
                !obj.dead &&
                obj.collidable
            ) {
                const intersection = collider.intersectCircle(obj.collider, this.pos, rad);
                if (intersection) {
                    // break obstacle if its a window
                    // resolve the collision otherwise
                    if (obj.isWindow) {
                        obj.damage({
                            amount: 1,
                            damageType: this.damageType,
                            gameSourceType: this.type,
                            mapSourceType: "",
                            dir: this.vel
                        });
                    } else {
                        if (obj.height >= height && obj.__id !== this.obstacleBellowId) {
                            this.pos = v2.add(this.pos, v2.mul(intersection.dir, intersection.pen));

                            if (def.explodeOnImpact) {
                                this.explode();
                            }
                        } else {
                            this.obstacleBellowId = obj.__id;
                        }
                    }
                }
            } else if (obj.__type === ObjectType.Player && def.playerCollision && obj.__id !== this.playerId) {
                if (coldet.testCircleCircle(this.pos, rad, obj.pos, obj.rad)) {
                    this.explode();
                }
            }
        }

        this.pos = this.game.map.clampToMapBounds(this.pos);

        if (!this.dead) {
            if (this.layer !== originalLayer) {
                this.setDirty();
            } else {
                this.setPartDirty();
            }

            this.game.grid.updateObject(this);

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
                source
            );
        }
        this.destroy();
    }
}

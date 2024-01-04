import { GameObjectDefs } from "../defs/gameObjectDefs";
import { MapObjectDefs } from "../defs/mapObjectDefs";
import { type ObstacleDef } from "../defs/mapObjectsTyping";
import { type GunDef, type BulletDef } from "../defs/objectsTypings";
import { type Game } from "../game";
import { GameConfig } from "../gameConfig";
import { type BulletData } from "../net/updateMsg";
import { coldet } from "../utils/coldet";
import { collider } from "../utils/collider";
import { math } from "../utils/math";
import { util } from "../utils/util";
import { type Vec2, v2 } from "../utils/v2";
import { type GameObject, ObjectType } from "./gameObject";
import { Obstacle } from "./obstacle";
import { Player } from "./player";

// NOTE: most of this code was copied from surviv client and bit heroes arena client
// to get bullet collision the most accurate possible

function transformSegment(p0: Vec2, p1: Vec2, pos: Vec2, dir: Vec2) {
    const ang = Math.atan2(dir.y, dir.x);
    return {
        p0: v2.add(pos, v2.rotate(p0, ang)),
        p1: v2.add(pos, v2.rotate(p1, ang))
    };
}

interface BulletCollision {
    object: Player | Obstacle
    collidable: boolean
    point: Vec2
    normal: Vec2
    reflect?: boolean
    dist?: number
    bullet?: Bullet
}

export interface BulletParams {
    bulletType: string
    sourceType: string
    pos: Vec2
    dir: Vec2
    layer: number
    damageMult: number
    damageType: number
    shotFx?: boolean
    shotOffhand?: boolean
    lastShot?: boolean
    splinter?: boolean
    shotAlt?: boolean
    trailSaturated?: boolean
    trailSmall?: boolean
    trailThick?: boolean
    variance: number
    playerId: number
    reflectCount?: number
    reflectObjId?: number
    onHitFx?: string
    maxDistance: number
}

export class BulletManager {
    bullets: Bullet[] = [];
    newBullets: Bullet[] = [];

    constructor(public game: Game) { }

    damages: Array<{
        obj: Player | Obstacle
        killer?: GameObject
        damageType: number
        sourceType: string
        damage: number
        isHeadShot?: boolean
    }> = [];

    update(): void {
        this.newBullets.length = 0;
        this.damages.length = 0;

        for (let i = 0; i < this.bullets.length; i++) {
            const bullet = this.bullets[i];

            if (!bullet.alive || bullet.skipCollision || (bullet.player?.dead ?? false)) {
                this.bullets.splice(i, 1);
                continue;
            }

            bullet.update();
        }

        for (let i = 0; i < this.damages.length; i++) {
            const damageRecord = this.damages[i];

            damageRecord.obj.damage(
                damageRecord.damage,
                damageRecord.sourceType,
                damageRecord.damageType,
                damageRecord.killer,
                damageRecord.isHeadShot
            );
        }
    }

    fireBullet(params: BulletParams): Bullet {
        const bullet = new Bullet(this, params);
        this.bullets.push(bullet);
        this.newBullets.push(bullet);
        return bullet;
    }
}

export class Bullet implements BulletData {
    collided = false;
    alive = true;
    distanceTraveled = 0;
    moveT = 0;

    playerId: number;
    player?: Player;
    pos: Vec2;
    endPos: Vec2;
    clientEndPos: Vec2;
    dir: Vec2;
    bulletType: string;
    layer: number;
    varianceT: number;
    distAdjIdx: number;
    clipDistance: boolean;
    distance: number;
    maxDistance: number;
    shotFx: boolean;
    sourceType: string;
    shotOffhand: boolean;
    lastShot: boolean;
    reflectCount: number;
    reflectObjId: number;
    hasSpecialFx: boolean;
    shotAlt: boolean;
    splinter: boolean;
    trailSaturated: boolean;
    trailSmall: boolean;
    trailThick: boolean;
    startPos: Vec2;
    speed: number;
    damageSelf: boolean;
    damage: number;
    damageMult: number;
    onHitFx?: string;
    hasOnHitFx: boolean;
    damageType: number;
    isShrapnel: boolean;
    skipCollision: boolean;

    constructor(public bulletManager: BulletManager, params: BulletParams) {
        const bulletDef = GameObjectDefs[params.bulletType] as BulletDef;

        this.layer = params.layer;
        this.pos = v2.copy(params.pos);
        this.dir = v2.copy(params.dir);
        this.playerId = params.playerId;
        this.startPos = v2.copy(params.pos);
        this.bulletType = params.bulletType;
        this.reflectCount = params.reflectCount ?? 0;
        this.reflectObjId = params.reflectObjId ?? -1;
        this.lastShot = params.lastShot ?? false;
        this.speed = bulletDef.speed * params.variance;
        this.onHitFx = bulletDef.onHit ?? params.onHitFx;
        this.hasOnHitFx = !!this.onHitFx;

        const player = this.bulletManager.game.grid.getById(this.playerId);
        if (player instanceof Player) {
            this.player = player;
        }

        // Add random jitter to the bullet distance. This makes spray patterns
        // for low spread, high rate-of-fire guns like the vector look better.
        //
        // Don't apply the jitter on shotguns as they have inherent jitter
        // due to how the player computes the shot start position.
        const distAdjIdxMax = 16;
        const distAdjIdx = params.bulletType !== "bullet_shotgun" && params.bulletType !== "bullet_frag" ? util.randomInt(0, distAdjIdxMax) : distAdjIdxMax / 2;
        const distAdj = math.remap(distAdjIdx, 0, distAdjIdxMax, -1.0, 1.0);
        const desiredDistance = (bulletDef.distance * params.variance + distAdj) / GameConfig.bullet.reflectDistDecay ** this.reflectCount;

        // this.serialized = false;
        // this.sentToClient = false;
        // this.timeInactive = 0.0;
        this.sourceType = params.sourceType;
        this.damageType = params.damageType;
        this.maxDistance = params.maxDistance;
        this.damageMult = params.damageMult;
        this.shotFx = params.shotFx ?? false;
        this.shotOffhand = params.shotOffhand ?? false;
        this.shotAlt = params.shotAlt ?? false;
        this.splinter = params.splinter ?? false;
        this.trailSaturated = params.trailSaturated ?? false;
        this.trailSmall = params.trailSmall ?? false;
        this.trailThick = params.trailThick ?? false;
        this.varianceT = params.variance;
        this.distAdjIdx = distAdjIdx;
        this.distance = math.min(desiredDistance, params.maxDistance);
        this.clipDistance = desiredDistance > params.maxDistance;
        this.endPos = v2.add(params.pos, v2.mul(this.dir, this.distance));
        this.clientEndPos = v2.copy(this.endPos);
        this.damage = bulletDef.damage * this.damageMult;
        this.skipCollision = !!bulletDef.skipCollision;
        this.isShrapnel = bulletDef.shrapnel;

        this.damageSelf = this.reflectCount > 0 || this.isShrapnel;
        this.hasSpecialFx = this.shotAlt ||
            this.splinter ||
            this.trailSaturated ||
            this.trailSmall ||
            this.trailThick;

        const nearbyObjs = this.bulletManager.game.grid.intersectLineSegment(this.pos, this.endPos);
        const colIds: Array<{
            obj: Obstacle
            pos: Vec2
            nrm: Vec2
            t: number
        }> = [];

        for (let i = 0; i < nearbyObjs.length; i++) {
            const obj = nearbyObjs[i] as Obstacle;

            if ((obj.__type !== ObjectType.Obstacle ||
                obj.dead ||
                obj.height < GameConfig.bullet.height ||
                !util.sameLayer(obj.layer, this.layer) ||
                obj.id === this.reflectObjId)) {
                continue;
            }

            const res = collider.intersectSegment(obj.collider, this.pos, this.endPos);

            if (res) {
                const dist = v2.length(v2.sub(res.point, this.pos));
                colIds.push({
                    obj,
                    pos: res.point,
                    nrm: res.normal,
                    t: dist / this.distance
                });
            }
        }

        colIds.sort((a, b) => a.t - b.t);

        // Clamp end pos to the map boundaries if the bullet
        // has an onHit effect
        if (this.hasOnHitFx) {
            const res = coldet.intersectSegmentAabb2(
                this.startPos, this.endPos,
                this.bulletManager.game.map.bounds.min,
                this.bulletManager.game.map.bounds.max);
            if (res) {
                const dist = v2.length(v2.sub(res.point, this.startPos));
                this.endPos = res.point;
                this.clientEndPos = res.point;
                this.distance = dist;
                this.maxDistance = dist;
                this.clipDistance = true;
            }
        }

        // Store furthest possible travel distance to
        // an indestructible obstacle for the client.
        let maxDistance = this.distance;
        for (let i = 0; i < colIds.length; i++) {
            const col = colIds[i];
            const obj = col.obj;
            if (obj && !obj.destructible) {
                maxDistance = col.t * this.distance;
                break;
            }
        }
        this.clientEndPos = v2.add(this.startPos, v2.mul(this.dir, maxDistance));
    }

    update(): void {
        const posOld = v2.copy(this.pos);
        const distLeft = this.distance - v2.length(v2.sub(this.startPos, this.pos));
        const moveDist = math.min(distLeft, this.bulletManager.game.dt * this.speed);
        this.distanceTraveled += moveDist;

        v2.set(this.pos, v2.add(this.pos, v2.mul(this.dir, moveDist)));

        const map = this.bulletManager.game.map;
        if (!coldet.testPointAabb(this.pos, map.bounds.min, map.bounds.max)) {
            this.alive = false;
            v2.set(this.pos, map.clampToMapBounds(this.pos));
        }

        // const oldT = this.moveT;
        this.moveT = v2.length(v2.sub(this.pos, this.startPos)) / this.distance;

        this.checkForCollisions(posOld);

        // Check if bullet has reached the maximun distance
        if (math.eqAbs(moveDist, 0.0) || this.moveT >= 1.0) {
            this.alive = false;
            // Explosive rounds peter out
            if (this.onHitFx === "explosion_rounds") {
                this.onHitFx = "";
            }
        }
    }

    checkForCollisions(posOld: Vec2): void {
        const collisions: BulletCollision[] = [];

        const objects = this.bulletManager.game.grid.intersectLineSegment(posOld, this.pos);

        const obstacles = objects.filter(o => o.__type === ObjectType.Obstacle) as Obstacle[];
        const players = objects.filter(o => o.__type === ObjectType.Player) as Player[];

        for (const obstacle of obstacles) {
            if (!(obstacle.dead ||
                !util.sameLayer(obstacle.layer, this.layer) ||
                obstacle.height < GameConfig.bullet.height ||
                (this.reflectCount > 0 && obstacle.id === this.reflectObjId))) {
                const collision = collider.intersectSegment(
                    obstacle.collider,
                    posOld,
                    this.pos
                );
                if (collision) {
                    collisions.push({
                        object: obstacle,
                        collidable: obstacle.collidable,
                        point: collision.point,
                        normal: collision.normal
                    });
                }
            }
        }
        for (const player of players) {
            if (!player.dead &&
                (util.sameLayer(player.layer, this.layer) || 2 & player.layer) &&
                (player.id !== this.playerId || this.damageSelf)) {
                let panCollision = null;

                if (player.hasActivePan()) {
                    const panSeg = player.getPanSegment();
                    const oldSegment = transformSegment(
                        panSeg.p0,
                        panSeg.p1,
                        player.posOld,
                        player.dirOld
                    );
                    const newSegment = transformSegment(panSeg.p0, panSeg.p1, player.pos, player.dir);

                    const newIntersection = coldet.intersectSegmentSegment(
                        posOld,
                        this.pos,
                        oldSegment.p0,
                        oldSegment.p1
                    );
                    const oldIntersection = coldet.intersectSegmentSegment(
                        posOld,
                        this.pos,
                        newSegment.p0,
                        newSegment.p1
                    );

                    const finalIntersection = oldIntersection ?? newIntersection;

                    if (finalIntersection) {
                        const normal = v2.normalize(
                            v2.perp(v2.sub(newSegment.p1, newSegment.p0))
                        );
                        panCollision = {
                            point: finalIntersection.point,
                            normal
                        };
                    }
                }
                const collision = coldet.intersectSegmentCircle(
                    posOld,
                    this.pos,
                    player.pos,
                    player.rad
                );

                if ((collision && (!panCollision ||
                    v2.length(
                        v2.sub(collision.point, this.startPos)
                    ) <
                    v2.length(
                        v2.sub(
                            panCollision.point,
                            this.startPos
                        )
                    ))
                    ? (collisions.push({
                        object: player,
                        point: collision.point,
                        normal: collision.normal,
                        collidable: true
                    }),
                    player.hasPerk("steelskin") &&
                        collisions.push({
                            object: player,
                            reflect: true,
                            point: v2.add(
                                collision.point,
                                v2.mul(
                                    collision.normal,
                                    0.1
                                )
                            ),
                            normal: collision.normal,
                            collidable: false
                        }))
                    : panCollision &&
                    collisions.push({
                        object: player,
                        reflect: true,
                        point: panCollision.point,
                        normal: panCollision.normal,
                        collidable: true
                    }),
                collision ?? panCollision)
                ) { break; }
            }
        }

        for (let i = 0; i < collisions.length; i++) {
            const collision = collisions[i];
            collision.dist = v2.length(v2.sub(collision.point, posOld));
            collision.bullet = this;
        }

        collisions.sort((e, t) => {
            return e.dist! - t.dist!;
        });

        let stopBullet = false;

        for (let i = 0; i < collisions.length; i++) {
            const collision = collisions[i];
            const obj = collision.object;

            let finalDamage = this.damage;
            finalDamage *= 1 / (this.reflectCount + 1);

            if (obj instanceof Obstacle) {
                stopBullet = obj.collidable;

                const def = GameObjectDefs[this.bulletType] as BulletDef;

                this.bulletManager.damages.push({
                    obj,
                    sourceType: this.sourceType,
                    damageType: this.damageType,
                    killer: this.player,
                    damage: finalDamage * def.obstacleDamage
                });

                const obstacleDef = (MapObjectDefs[obj.type] as ObstacleDef);
                if (obstacleDef.reflectBullets) {
                    this.reflect(collision.point, collision.normal, obj.id);
                }
            } else if (obj instanceof Player) {
                stopBullet = collision.collidable;

                let isHeadShot = false;
                // headshots >:3
                const sourceDef = GameObjectDefs[this.sourceType] as GunDef;
                if ((sourceDef.headshotMult ?? 1) > 1 && Math.random() < 0.15) {
                    finalDamage *= (GameObjectDefs[this.sourceType] as GunDef).headshotMult;
                    isHeadShot = true;
                }

                this.bulletManager.damages.push({
                    obj,
                    sourceType: this.sourceType,
                    killer: this.player,
                    damageType: this.damageType,
                    damage: finalDamage,
                    isHeadShot
                });
            }
            if (stopBullet) {
                this.pos = collision.point;
                this.alive = false;
                break;
            }
        }
    }

    reflected = false;
    reflect(pos: Vec2, normal: Vec2, objId: number) {
        if (this.reflected) return;
        this.reflected = true;
        if (this.reflectCount >= GameConfig.bullet.maxReflect) return;

        const dot = v2.dot(this.dir, normal);
        const dir = v2.add(v2.mul(normal, dot * -2), this.dir);

        this.bulletManager.fireBullet({
            bulletType: this.bulletType,
            sourceType: this.sourceType,
            pos,
            dir,
            layer: this.layer,
            damageMult: this.damageMult,
            shotFx: false,
            reflectCount: this.reflectCount + 1,
            reflectObjId: objId,
            playerId: this.playerId,
            damageType: this.damageType,
            shotAlt: this.shotAlt,
            splinter: this.splinter,
            trailSaturated: this.trailSaturated,
            trailSmall: this.trailSmall,
            trailThick: this.trailThick,
            onHitFx: this.onHitFx,
            variance: this.varianceT,
            maxDistance: this.maxDistance
        });
    }
}

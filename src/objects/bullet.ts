import { GameObjectDefs } from "../defs/gameObjectDefs";
import { MapObjectDefs } from "../defs/mapObjectDefs";
import { type ObstacleDef } from "../defs/mapObjectsTyping";
import { type BulletDef } from "../defs/objectsTypings";
import { type Game } from "../game";
import { GameConfig } from "../gameConfig";
import { type BulletData } from "../net/updateMsg";
import { coldet } from "../utils/coldet";
import { collider } from "../utils/collider";
import { math } from "../utils/math";
import { util } from "../utils/util";
import { type Vec2, v2 } from "../utils/v2";
import { ObjectType } from "./gameObject";
import { Obstacle } from "./obstacle";
import { Player } from "./player";

function transformSegment(p0: Vec2, p1: Vec2, pos: Vec2, dir: Vec2) {
    const ang = Math.atan2(dir.y, dir.x);
    return {
        p0: v2.add(pos, v2.rotate(p0, ang)),
        p1: v2.add(pos, v2.rotate(p1, ang))
    };
}

export interface BulletParams {
    bulletType: string
    shotSourceType: string
    pos: Vec2
    dir: Vec2
    layer: number
    damage?: number
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
    varianceT?: number
    distance?: number
    player?: Player
    reflectCount?: number
    reflectObjId?: number
    onHitFx?: string
}

export class Bullet implements BulletData {
    collided = false;
    alive = true;
    distanceTraveled = 0;
    moveT = 0;

    game: Game;

    playerId: number;
    pos: Vec2;
    dir: Vec2;
    bulletType: string;
    layer: number;
    varianceT: number;
    distAdjIdx: number;
    clipDistance: boolean;
    distance: number;
    shotFx: boolean;
    shotSourceType: string;
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
    onHitFx?: string;
    damageType: number;

    shooter?: Player;

    constructor(game: Game, params: BulletParams) {
        this.game = game;
        this.startPos = v2.copy(params.pos);
        this.pos = v2.copy(params.pos);
        this.dir = params.dir;

        this.bulletType = params.bulletType;
        this.shotSourceType = params.shotSourceType;
        const def = GameObjectDefs[params.bulletType] as BulletDef;
        this.speed = def.speed;

        this.layer = params.layer;

        this.varianceT = params.varianceT ?? 0;

        this.clipDistance = params.distance !== undefined && params.distance < def.distance;

        this.reflectCount = params.reflectCount ?? 0;
        this.reflectObjId = params.reflectObjId ?? -1;

        const variance = 1.0 + this.varianceT * def.variance;

        const distAdjIdxMax = 16;
        const distAdjIdx = params.bulletType !== "bullet_shotgun" && params.bulletType !== "bullet_frag"
            ? util.randomInt(0, distAdjIdxMax)
            : distAdjIdxMax / 2;
        this.distAdjIdx = distAdjIdx;

        const distAdj = math.remap(distAdjIdx, 0, 16, -1.0, 1.0);
        let distance = def.distance / GameConfig.bullet.reflectDistDecay ** this.reflectCount;

        if (this.clipDistance) {
            distance = params.distance!;
        }

        this.distance = distance * variance + distAdj;

        this.shotFx = params.shotFx ?? false;
        this.lastShot = params.lastShot ?? false;
        this.shotOffhand = params.shotOffhand ?? false;
        this.playerId = params.player?.id ?? -1;
        this.shooter = params.player;

        this.splinter = params.splinter ?? false;
        this.shotAlt = params.shotAlt ?? false;
        this.trailSaturated = params.trailSaturated ?? false;
        this.trailSmall = params.trailSmall ?? false;
        this.trailThick = params.trailThick ?? false;

        this.hasSpecialFx = this.splinter || this.shotAlt || this.trailSaturated || this.trailSmall || this.trailThick;

        this.onHitFx = params.onHitFx;

        this.damageSelf = this.reflectCount > 0 || def.shrapnel;

        this.damage = (params.damage ?? def.damage) * params.damageMult;
        this.damageType = params.damageType;
    }

    update(): void {
        const posOld = v2.copy(this.pos);
        const distLeft = this.distance - v2.length(v2.sub(this.startPos, this.pos));
        const moveDist = math.min(distLeft, (this.game.dt * this.speed) / 1000);
        this.distanceTraveled += moveDist;

        v2.set(this.pos, v2.add(this.pos, v2.mul(this.dir, moveDist)));
        v2.set(this.pos, this.game.map.clampToMapBounds(this.pos));

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
        const collisions: Array<{
            object: Player | Obstacle
            collidable: boolean
            point: Vec2
            normal: Vec2
            reflect?: boolean
            dist?: number
        }> = [];

        const objects = [...this.game.grid.intersectCollider(coldet.lineSegmentToAabb(posOld, this.pos))];

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
                    const oldColl = coldet.intersectSegmentSegment(
                        posOld,
                        this.pos,
                        oldSegment.p0,
                        oldSegment.p1
                    );
                    const newColl = coldet.intersectSegmentSegment(
                        posOld,
                        this.pos,
                        newSegment.p0,
                        newSegment.p1
                    );

                    const finalCollision = newColl ?? oldColl;

                    if (finalCollision) {
                        const normal = v2.normalize(
                            v2.perp(v2.sub(newSegment.p1, newSegment.p0))
                        );
                        panCollision = {
                            point: finalCollision.point,
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
        }

        collisions.sort((e, t) => {
            return e.dist! - t.dist!;
        });

        let stopBullet = false;
        for (let i = 0; i < collisions.length; i++) {
            const collision = collisions[i];

            const obj = collision.object;

            if (obj instanceof Obstacle) {
                obj.damage(this.damage);

                const def = (MapObjectDefs[obj.type] as ObstacleDef);

                stopBullet = def.collidable;

                if (def.reflectBullets) {
                    this.reflect(collision.point, collision.normal, obj.id);
                }
            } else if (obj instanceof Player) {
                stopBullet = collision.collidable;

                if (collision.reflect) {
                    this.reflect(collision.point, collision.normal, obj.id);
                } else {
                    obj.damage(this.damage, this.shooter!, this.shotSourceType, this.damageType);
                }
            }
            if (stopBullet) {
                this.pos = collision.point;
                break;
            }
        }

        if (stopBullet) {
            this.alive = false;
        }
    }

    reflect(pos: Vec2, normal: Vec2, objId: number) {
        if (this.reflectCount >= GameConfig.bullet.maxReflect) return;

        const dot = v2.dot(this.dir, normal);
        const dir = v2.add(v2.mul(normal, dot * -2), this.dir);

        this.game.addBullet({
            bulletType: this.bulletType,
            shotSourceType: this.shotSourceType,
            pos,
            dir,
            layer: this.layer,
            damage: this.damage,
            damageMult: 1 / (this.reflectCount + 1),
            shotFx: false,
            reflectCount: this.reflectCount + 1,
            reflectObjId: objId,
            player: this.shooter,
            damageType: this.damageType
        });
    }
}

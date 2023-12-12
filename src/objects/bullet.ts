import { Game } from "../game";
import { gameConfig } from "../gameConfig";
import { coldet } from "../utils/coldet";
import { collider } from "../utils/collider";
import math from "../utils/math";
import { util } from "../utils/util";
import { Vec2, v2 } from "../utils/v2";
import { ObjectType } from "./gameObject";
import { Obstacle } from "./obstacle";
import { Player } from "./player";

function a(e, t, r, a) {
    var i = Math.atan2(a.y, a.x);
    return {
        p0: v2.add(r, v2.rotate(e, i)),
        p1: v2.add(r, v2.rotate(t, i)),
    };
}

export class Bullet {

    collided = false;
    alive = true;
    distance = 0;
    startPos = v2.create(0, 0);
    pos = v2.create(0, 0);
    speed = 0;
    reflectCount = 0;
    layer = 0;
    reflectObjId = 0


    update(dt: number, game: Game): void {
        if (this.collided && this.alive) {

            const lastPos = v2.copy(this.pos);

            const collisions: Array<{
                type: string
                obstacleType?: string
                collidable: boolean
                point: Vec2
                normal: Vec2
            }> = []

            const objects = [...game.grid.intersectCollider(coldet.lineSegmentToAabb(lastPos, this.pos))]

            const obstacles = objects.filter(o => o.kind === ObjectType.Obstacle) as Obstacle[]
            const players = objects.filter(o => o.kind === ObjectType.Player) as Player[]

            for (const obstacle of obstacles) {
                if (
                    !(obstacle.dead ||
                        !util.sameLayer(obstacle.layer, this.layer) ||
                        obstacle.height < gameConfig.bullet.height ||
                        (this.reflectCount > 0 &&
                            obstacle.id === this.reflectObjId)
                    )
                ) {
                    const collision = collider.intersectSegment(
                        obstacle.collider,
                        lastPos,
                        this.pos,
                    );
                    collision &&
                        collisions.push({
                            type: "obstacle",
                            obstacleType: obstacle.type,
                            collidable: obstacle.collidable,
                            point: collision.point,
                            normal: collision.normal,
                        });
                }
            }
            for (const player of players) {
                if (
                    !player.dead &&
                    (util.sameLayer(player.layer, this.layer) ||
                        2 & player.layer) &&
                    (player.id !== this.playerId || this.damageSelf)
                ) {
                    var O = null;
                    if (player.hasActivePan()) {
                        const E = player.getPanSegment(),
                            B = a(
                                E.p0,
                                E.p1,
                                player.posOld,
                                player.dirOld,
                            ),
                            R = a(E.p0, E.p1, player.pos, player.dir),
                            L = coldet.intersectSegmentSegment(
                                lastPos,
                                this.pos,
                                B.p0,
                                B.p1,
                            ),
                            q = coldet.intersectSegmentSegment(
                                lastPos,
                                this.pos,
                                R.p0,
                                R.p1,
                            ),
                            F = q || L;
                        if (F) {
                            var j = v2.normalize(
                                v2.perp(v2.sub(R.p1, R.p0)),
                            );
                            O = {
                                point: F.point,
                                normal: j,
                            };
                        }
                    }
                    var N = coldet.intersectSegmentCircle(
                        lastPos,
                        this.pos,
                        player.pos,
                        player.rad,
                    );
                    if (
                        (N &&
                            (!O ||
                                v2.length(
                                    v2.sub(N.point, this.startPos),
                                ) <
                                v2.length(
                                    v2.sub(
                                        O.point,
                                        this.startPos,
                                    ),
                                ))
                            ? (collisions.push({
                                type: "player",
                                player: player,
                                point: N.point,
                                normal: N.normal,
                                layer: player.layer,
                                collidable: !0,
                            }),
                                player.hasPerk("steelskin") &&
                                collisions.push({
                                    type: "pan",
                                    point: v2.add(
                                        N.point,
                                        v2.mul(
                                            N.normal,
                                            0.1,
                                        ),
                                    ),
                                    normal: N.normal,
                                    layer: player.layer,
                                    collidable: !1,
                                }))
                            : O &&
                            collisions.push({
                                type: "pan",
                                point: O.point,
                                normal: O.normal,
                                layer: player.layer,
                                collidable: !0,
                            }),
                            N || O)
                    )
                        break;
                }
            }
            for (var H = 0; H < collisions.length; H++) {
                var V = collisions[H];
                V.dist = v2.length(v2.sub(V.point, lastPos));
            }
            collisions.sort(function(e, t) {
                return e.dist - t.dist;
            });
            var U = !1,
                W = t.u(this.playerId);
            W && (W.Le.he || W.Le.ue) && (U = !0);
            for (var G = !1, X = 0; X < collisions.length; X++) {
                var K = collisions[X];
                if ("obstacle" == K.type) {
                    var Z = y[K.obstacleType];
                    o(
                        Z.hitParticle,
                        Z.sound.bullet,
                        K.point,
                        K.normal,
                        this.layer,
                        u,
                        w,
                    ),
                        (G = K.collidable);
                } else if ("player" == K.type) {
                    if (!U) {
                        var Y = K.player;
                        if (
                            r.turkeyMode &&
                            W &&
                            W.hasPerk("turkey_shoot")
                        ) {
                            var J = v2.mul(
                                v2.randomUnit(),
                                util.random(3, 6),
                            );
                            u.addParticle(
                                "turkeyFeathersHit",
                                Y.layer,
                                Y.pos,
                                J,
                            );
                        }
                        var Q = v2.sub(K.point, Y.pos);
                        (Q.y *= -1),
                            u.addParticle(
                                "bloodSplat",
                                Y.layer,
                                v2.mul(Q, i.ppu),
                                v2.create(0, 0),
                                1,
                                1,
                                Y.container,
                            ),
                            w.playGroup(
                                "player_bullet_hit",
                                {
                                    soundPos: Y.pos,
                                    fallOff: 1,
                                    layer: Y.layer,
                                    filter: "muffled",
                                },
                            );
                    }
                    G = K.collidable;
                } else
                    "pan" == K.type &&
                        (o(
                            "barrelChip",
                            g.pan.sound.bullet,
                            K.point,
                            K.normal,
                            K.layer,
                            u,
                            w,
                        ),
                            (G = K.collidable));
                if (G) {
                    this.pos = K.point;
                    break;
                }
            }
            if (!(2 & this.layer)) {
                for (
                    var $ = r.lr.p(), ee = this.layer, te = 0;
                    te < $.length;
                    te++
                ) {
                    var re = $[te];
                    if (re.active) {
                        for (
                            var ae = !1, ie = !1, oe = 0;
                            oe < re.stairs.length;
                            oe++
                        ) {
                            var se = re.stairs[oe];
                            if (
                                !se.lootOnly &&
                                collider.intersectSegment(
                                    se.collision,
                                    this.pos,
                                    lastPos,
                                )
                            ) {
                                ae = !0;
                                break;
                            }
                        }
                        for (
                            var ne = 0;
                            ne < re.mask.length;
                            ne++
                        )
                            if (
                                collider.intersectSegment(
                                    re.mask[ne],
                                    this.pos,
                                    lastPos,
                                )
                            ) {
                                ie = !0;
                                break;
                            }
                        ae && !ie && (ee |= 2);
                    }
                }
            }
        }
    }

}

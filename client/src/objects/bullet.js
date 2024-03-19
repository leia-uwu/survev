import * as PIXI from "pixi.js";
import { coldet } from "../../../shared/utils/coldet";
import { collider } from "../../../shared/utils/collider";
import { GameConfig } from "../../../shared/gameConfig";
import { math } from "../../../shared/utils/math";
import { util } from "../../../shared/utils/util";
import { v2 } from "../../../shared/utils/v2";
import { BulletDefs } from "../../../shared/defs/gameObjects/bulletDefs";
import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";
import { MapObjectDefs } from "../../../shared/defs/mapObjectDefs";

function transformSegment(p0, p1, pos, dir) {
    const ang = Math.atan2(dir.y, dir.x);
    return {
        p0: v2.add(pos, v2.rotate(p0, ang)),
        p1: v2.add(pos, v2.rotate(p1, ang))
    };
}

export function createBullet(e, t, r, a, i) {
    if (BulletDefs[e.bulletType].addFlare) {
        r.addFlare(e, a, i);
    } else {
        t.addBullet(e, a, i);
    }
}

export function playHitFx(e, t, r, a, i, o, s) {
    for (
        let n = Math.floor(util.random(1, 2)),
            l = v2.mul(a, 9.5),
            c = 0;
        c < n;
        c++
    ) {
        l = v2.rotate(l, ((Math.random() - 0.5) * Math.PI) / 3);
        o.addParticle(e, i, r, l);
    }
    s.playGroup(t, {
        channel: "hits",
        soundPos: r,
        layer: i,
        filter: "muffled"
    });
}
export class BulletBarn {
    constructor() {
        this.bullets = [];
        this.tracerColors = {};
    }

    onMapLoad(e) {
        this.tracerColors = util.mergeDeep(
            {},
            GameConfig.tracerColors,
            e.getMapDef().biome.tracerColors
        );
    }

    addBullet(e, t, r) {
        let a = null;
        for (let i = 0; i < this.bullets.length; i++) {
            if (
                !this.bullets[i].alive &&
                !this.bullets[i].collided
            ) {
                a = this.bullets[i];
                break;
            }
        }
        if (!a) {
            a = {};
            a.alive = false;
            a.container = new PIXI.Container();
            a.container.pivot.set(14.5, 0);
            a.container.visible = false;
            a.bulletTrail = PIXI.Sprite.from(
                "player-bullet-trail-02.img"
            );
            a.bulletTrail.anchor.set(0.5, 0.5);
            a.container.addChild(a.bulletTrail);
            this.bullets.push(a);
        }
        const o = BulletDefs[e.bulletType];
        const s = 1 + e.varianceT * o.variance;
        const l = math.remap(e.distAdjIdx, 0, 16, -1, 1);
        let c =
            o.distance /
            Math.pow(GameConfig.bullet.reflectDistDecay, e.reflectCount);
        if (e.clipDistance) {
            c = e.distance;
        }
        a.alive = true;
        a.isNew = true;
        a.collided = false;
        a.scale = 1;
        a.playerId = e.playerId;
        a.startPos = v2.copy(e.pos);
        a.pos = v2.copy(e.pos);
        a.dir = v2.copy(e.dir);
        a.layer = e.layer;
        a.speed = o.speed * s;
        a.distance = c * s + l;
        a.damageSelf = o.shrapnel || e.reflectCount > 0;
        a.reflectCount = e.reflectCount;
        a.reflectObjId = e.reflectObjId;
        a.whizHeard = false;
        const h = Math.atan2(a.dir.x, a.dir.y);
        a.container.rotation = h - Math.PI / 2;
        a.layer = e.layer;
        const g = t.u(a.playerId);
        if (g && g.layer & 2) {
            a.layer |= 2;
        }
        let y = o.tracerWidth;
        if (e.trailSmall) {
            y *= 0.5;
        }
        if (e.trailThick) {
            y *= 2;
        }
        a.bulletTrail.scale.set(0.8, y);
        a.tracerLength = o.tracerLength;
        a.suppressed = !!o.suppressed;
        const w = this.tracerColors[o.tracerColor];
        let f = w.regular;
        if (e.trailSaturated) {
            f = w.chambered || w.saturated;
        } else if (g?.surface?.data.isBright) {
            f = w.saturated;
        }
        a.bulletTrail.tint = f;
        a.tracerAlphaRate = w.alphaRate;
        a.tracerAlphaMin = w.alphaMin;
        a.bulletTrail.alpha = 1;
        if (a.reflectCount > 0) {
            a.bulletTrail.alpha *= 0.5;
        }
        a.container.visible = true;
        r.addPIXIObj(a.container, a.layer, 20);
    }

    update(e, t, r, i, s, n, u, w) {
        for (
            let f = t.$e.p(), _ = 0;
            _ < this.bullets.length;
            _++
        ) {
            const b = this.bullets[_];
            if (b.collided) {
                b.scale = math.max(b.scale - e * 6, 0);
                if (b.scale <= 0) {
                    b.collided = false;
                    b.container.visible = false;
                }
            }
            if (b.alive) {
                const x =
                    b.distance - v2.length(v2.sub(b.startPos, b.pos));
                const S = math.min(x, e * b.speed);
                const v = v2.copy(b.pos);
                b.pos = v2.add(b.pos, v2.mul(b.dir, S));
                if (
                    !s.netData.he &&
                    util.sameAudioLayer(s.layer, b.layer) &&
                    v2.length(v2.sub(i.pos, b.pos)) < 7.5 &&
                    !b.whizHeard &&
                    b.playerId != s.__id
                ) {
                    w.playGroup("bullet_whiz", {
                        soundPos: b.pos,
                        fallOff: 4
                    });
                    b.whizHeard = true;
                }
                if (b.tracerAlphaRate && b.suppressed) {
                    const k = b.tracerAlphaRate;
                    b.bulletTrail.alpha = math.max(
                        b.tracerAlphaMin,
                        b.bulletTrail.alpha * k
                    );
                }
                const z = [];
                for (let I = r.Ve.p(), T = 0; T < I.length; T++) {
                    const M = I[T];
                    if (
                        !!M.active &&
                        !M.dead &&
                        !!util.sameLayer(M.layer, b.layer) &&
                        M.height >= GameConfig.bullet.height &&
                        (b.reflectCount <= 0 ||
                            M.__id != b.reflectObjId)
                    ) {
                        const P = collider.intersectSegment(
                            M.collider,
                            v,
                            b.pos
                        );
                        if (P) {
                            z.push({
                                type: "obstacle",
                                obstacleType: M.type,
                                collidable: M.collidable,
                                point: P.point,
                                normal: P.normal
                            });
                        }
                    }
                }
                for (let C = 0; C < f.length; C++) {
                    const A = f[C];
                    if (
                        A.active &&
                        !A.netData.he &&
                        (util.sameLayer(A.netData.pe, b.layer) ||
                            A.netData.pe & 2) &&
                        (A.__id != b.playerId || b.damageSelf)
                    ) {
                        let O = null;
                        if (A.hasActivePan()) {
                            const D = A;
                            const E = D.getPanSegment();
                            const B = transformSegment(
                                E.p0,
                                E.p1,
                                D.posOld,
                                D.dirOld
                            );
                            const R = transformSegment(E.p0, E.p1, D.pos, D.dir);
                            const L = coldet.intersectSegmentSegment(
                                v,
                                b.pos,
                                B.p0,
                                B.p1
                            );
                            const q = coldet.intersectSegmentSegment(
                                v,
                                b.pos,
                                R.p0,
                                R.p1
                            );
                            const F = q || L;
                            if (F) {
                                const j = v2.normalize(
                                    v2.perp(v2.sub(R.p1, R.p0))
                                );
                                O = {
                                    point: F.point,
                                    normal: j
                                };
                            }
                        }
                        const N = coldet.intersectSegmentCircle(
                            v,
                            b.pos,
                            A.pos,
                            A.rad
                        );
                        if (
                            N &&
                            (!O ||
                                v2.length(
                                    v2.sub(N.point, b.startPos)
                                ) <
                                v2.length(
                                    v2.sub(O.point, b.startPos)
                                ))
                        ) {
                            z.push({
                                type: "player",
                                player: A,
                                point: N.point,
                                normal: N.normal,
                                layer: A.layer,
                                collidable: true
                            });
                            if (A.hasPerk("steelskin")) {
                                z.push({
                                    type: "pan",
                                    point: v2.add(
                                        N.point,
                                        v2.mul(N.normal, 0.1)
                                    ),
                                    normal: N.normal,
                                    layer: A.layer,
                                    collidable: false
                                });
                            }
                        } else if (O) {
                            z.push({
                                type: "pan",
                                point: O.point,
                                normal: O.normal,
                                layer: A.layer,
                                collidable: true
                            });
                        }
                        if (N || O) {
                            break;
                        }
                    }
                }
                for (let H = 0; H < z.length; H++) {
                    const V = z[H];
                    V.dist = v2.length(v2.sub(V.point, v));
                }
                z.sort((e, t) => {
                    return e.dist - t.dist;
                });
                let U = false;
                const W = t.u(b.playerId);
                if (W && (W.netData.he || W.netData.ue)) {
                    U = true;
                }
                let G = false;
                for (let X = 0; X < z.length; X++) {
                    const K = z[X];
                    if (K.type == "obstacle") {
                        const Z = MapObjectDefs[K.obstacleType];
                        playHitFx(
                            Z.hitParticle,
                            Z.sound.bullet,
                            K.point,
                            K.normal,
                            b.layer,
                            u,
                            w
                        );
                        G = K.collidable;
                    } else if (K.type == "player") {
                        if (!U) {
                            const Y = K.player;
                            if (
                                r.turkeyMode &&
                                W?.hasPerk("turkey_shoot")
                            ) {
                                const J = v2.mul(
                                    v2.randomUnit(),
                                    util.random(3, 6)
                                );
                                u.addParticle(
                                    "turkeyFeathersHit",
                                    Y.layer,
                                    Y.pos,
                                    J
                                );
                            }
                            const Q = v2.sub(K.point, Y.pos);
                            Q.y *= -1;
                            u.addParticle(
                                "bloodSplat",
                                Y.layer,
                                v2.mul(Q, i.ppu),
                                v2.create(0, 0),
                                1,
                                1,
                                Y.container
                            );
                            w.playGroup("player_bullet_hit", {
                                soundPos: Y.pos,
                                fallOff: 1,
                                layer: Y.layer,
                                filter: "muffled"
                            });
                        }
                        G = K.collidable;
                    } else if (K.type == "pan") {
                        playHitFx(
                            "barrelChip",
                            GameObjectDefs.pan.sound.bullet,
                            K.point,
                            K.normal,
                            K.layer,
                            u,
                            w
                        );
                        G = K.collidable;
                    }
                    if (G) {
                        b.pos = K.point;
                        break;
                    }
                }
                if (!(b.layer & 2)) {
                    const $ = r.lr.p();
                    let ee = b.layer;
                    for (let te = 0; te < $.length; te++) {
                        const re = $[te];
                        if (re.active) {
                            let ae = false;
                            let ie = false;
                            for (
                                let oe = 0;
                                oe < re.stairs.length;
                                oe++
                            ) {
                                const se = re.stairs[oe];
                                if (
                                    !se.lootOnly &&
                                    collider.intersectSegment(
                                        se.collision,
                                        b.pos,
                                        v
                                    )
                                ) {
                                    ae = true;
                                    break;
                                }
                            }
                            for (
                                let ne = 0;
                                ne < re.mask.length;
                                ne++
                            ) {
                                if (
                                    collider.intersectSegment(
                                        re.mask[ne],
                                        b.pos,
                                        v
                                    )
                                ) {
                                    ie = true;
                                    break;
                                }
                            }
                            if (ae && !ie) {
                                ee |= 2;
                            }
                        }
                    }
                    if (ee != b.layer) {
                        b.layer = ee;
                        n.addPIXIObj(b.container, b.layer, 20);
                    }
                }
                if (G || math.eqAbs(x, S)) {
                    b.collided = true;
                    b.alive = false;
                }
                b.isNew = false;
            }
        }
    }

    createBulletHit(e, t, r) {
        const a = e.u(t);
        if (a) {
            r.playGroup("player_bullet_hit", {
                soundPos: a.pos,
                fallOff: 1,
                layer: a.layer,
                filter: "muffled"
            });
        }
    }

    render(e, t) {
        e.pixels(1);
        for (let r = 0; r < this.bullets.length; r++) {
            const a = this.bullets[r];
            if (a.alive || a.collided) {
                const i = v2.length(v2.sub(a.pos, a.startPos));
                const o = e.pointToScreen(a.pos);
                a.container.position.set(o.x, o.y);
                const s = e.pixels(1);
                const n = math.min(a.tracerLength * 15, i / 2);
                a.container.scale.set(s * n * a.scale, s);
            }
        }
    }
}

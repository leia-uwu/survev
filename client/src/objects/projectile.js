import * as PIXI from "pixi.js"
;
import { GameConfig } from "../../../shared/gameConfig";
import { collider } from "../../../shared/utils/collider";
import { math } from "../../../shared/utils/math";
import { util } from "../../../shared/utils/util";
import { v2 } from "../../../shared/utils/v2";
import bullet from "./bullet";
import objectPool from "./objectPool";
import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";
import { MapObjectDefs } from "../../../shared/defs/mapObjectDefs";

function Projectile() {
    this.container = new PIXI.Container();
    this.container.visible = false;
    this.trail = PIXI.Sprite.from("player-bullet-trail-02.img");
    this.trail.anchor.set(1, 0.5);
    this.trail.scale.set(1, 1);
    this.trail.visible = false;
    this.container.addChild(this.trail);
    this.sprite = new PIXI.Sprite();
    this.sprite.anchor.set(0.5, 0.5);
    this.container.addChild(this.sprite);
    this.strobeSprite = null;
}
function i() {
    this.cr = new objectPool.Pool(Projectile);
}

const g = {
    grass: "frag_grass",
    sand: "frag_sand",
    water: "frag_water"
};
Projectile.prototype = {
    o: function() { },
    n: function() {
        this.container.visible = false;
        if (this.strobeSprite) {
            this.strobeSprite.visible = false;
        }
    },
    c: function(e, t, r, a) {
        if (t) {
            const i = GameObjectDefs[e.type];
            this.layer = e.layer;
            this.type = e.type;
            this.rad = i.rad * 0.5;
        }
        this.posOld = r ? v2.copy(e.pos) : v2.copy(this.pos);
        this.posZOld = r ? e.posZ : this.posZ;
        this.pos = v2.copy(e.pos);
        this.posZ = e.posZ;
        this.dir = v2.copy(e.dir);
        if (r) {
            const s = GameObjectDefs[e.type];
            const l = s.worldImg;
            this.imgScale = l.scale;
            this.rot = 0;
            this.rotVel = s.throwPhysics.spinVel;
            if (
                s.throwPhysics.randomizeSpinDir &&
                Math.random() < 0.5
            ) {
                this.rotVel *= -1;
            }
            this.rotDrag = s.throwPhysics.spinDrag * util.random(1, 2);
            this.velZ = 0;
            this.grounded = false;
            this.inWater = false;
            this.lastSoundObjId = 0;
            this.playHitSfx = !s.explodeOnImpact;
            this.alwaysRenderOntop = false;
            let p = true;
            if (this.type == "bomb_iron") {
                this.alwaysRenderOntop = true;
                const h = collider.createCircle(this.pos, 0.5);
                if (a.map.insideBuildingCeiling(h, true)) {
                    p = false;
                }
            }
            this.sprite.texture = PIXI.Texture.from(l.sprite);
            this.sprite.tint = l.tint;
            this.sprite.alpha = 1;
            this.container.visible = p;
            if (e.type == "strobe") {
                if (!this.strobeSprite) {
                    this.strobeSprite = new PIXI.Sprite();
                    this.strobeSprite.texture =
                        PIXI.Texture.from("part-strobe-01.img");
                    this.strobeSprite.anchor.set(0.5, 0.5);
                    this.container.addChild(this.strobeSprite);
                }
                this.strobeSprite.scale.set(0, 0);
                this.strobeSprite.visible = true;
                this.strobeScale = 0;
                this.strobeScaleMax = 12;
                this.strobeTicker = 0;
                this.strobeDir = 1;
                this.strobeSpeed = 1.25;
            }
        }
    }
};
i.prototype = {
    m: function(e, t, r, a, i, o, h) {
        for (let y = this.cr.p(), w = 0; w < y.length; w++) {
            const f = y[w];
            if (f.active) {
                const _ = GameObjectDefs[f.type];
                let b = f.rotDrag;
                if (f.inWater) {
                    b *= 3;
                }
                f.rotVel *= 1 / (1 + e * b);
                f.rot += f.rotVel * e;
                var x = {
                    obj: null,
                    pen: 0
                };
                var S = {
                    obj: null,
                    pen: 0
                };
                var v = collider.createCircle(f.pos, f.rad);
                for (var k = i.Ve.p(), z = 0; z < k.length; z++) {
                    const I = k[z];
                    if (
                        I.active &&
                        !I.dead &&
                        util.sameLayer(I.layer, f.layer)
                    ) {
                        const T = collider.intersect(I.collider, v);
                        if (T) {
                            const M = I.height > f.posZ ? x : S;
                            if (
                                T.pen > M.pen &&
                                (!M.obj || M.obj.height <= I.height)
                            ) {
                                M.obj = I;
                                M.pen = T.pen;
                            }
                        }
                    }
                }
                const P = v2.div(v2.sub(f.pos, f.posOld), e);
                const C = v2.length(P);
                if (
                    x.obj &&
                    x.obj.__id != f.lastSoundObjId &&
                    C > 7.5 &&
                    ((f.lastSoundObjId = x.obj.__id), f.playHitSfx)
                ) {
                    const A = v2.mul(
                        v2.normalizeSafe(P, v2.create(1, 0)),
                        -1
                    );
                    const O = MapObjectDefs[x.obj.type];
                    bullet.playHitFx(
                        O.hitParticle,
                        O.sound.bullet,
                        f.pos,
                        A,
                        f.layer,
                        t,
                        r
                    );
                }
                const D = i.getGroundSurface(f.pos, f.layer);
                if (f.posZ <= 0.01) {
                    if (!f.inWater && D.type == "water") {
                        t.addRippleParticle(
                            f.pos,
                            f.layer,
                            D.data.rippleColor
                        );
                    }
                    f.inWater = D.type == "water";
                }
                const E = f.velZ;
                f.velZ = (f.posZ - f.posZOld) / e;
                if (
                    !f.isNew &&
                    !f.grounded &&
                    f.velZ >= 0 &&
                    E < 0
                ) {
                    const B = {
                        fn: "playGroup",
                        channel: "hits",
                        name: ""
                    };
                    if (S.obj) {
                        if (f.lastSoundObjId != S.obj.__id) {
                            f.lastSoundObjId = S.obj.__id;
                            const R = MapObjectDefs[S.obj.type];
                            B.name = R.sound.bullet;
                        }
                    } else {
                        f.grounded = true;
                        B.name = g[D.type];
                        if (B.name === undefined) {
                            B.name = `footstep_${D.type}`;
                            B.fn = "playGroup";
                            B.channel = "sfx";
                        }
                    }
                    if (B.name && f.playHitSfx) {
                        r[B.fn](B.name, {
                            channel: B.channel,
                            soundPos: f.pos,
                            layer: f.layer,
                            filter: "muffled"
                        });
                    }
                }
                if (f.type == "strobe" && f.strobeSprite) {
                    f.strobeTicker = math.clamp(
                        f.strobeTicker +
                        e * f.strobeDir * f.strobeSpeed,
                        0,
                        1
                    );
                    f.strobeScale =
                        math.easeInExpo(f.strobeTicker) *
                        f.strobeScaleMax;
                    f.strobeSprite.scale.set(
                        f.strobeScale,
                        f.strobeScale
                    );
                    if (
                        f.strobeScale >= f.strobeScaleMax ||
                        f.strobeTicker <= 0
                    ) {
                        f.strobeDir *= -1;
                    }
                }
                f.sprite.rotation = f.rot;
                f.sprite.alpha = f.inWater ? 0.3 : 1;
                if (_.trail) {
                    const L = v2.length(P);
                    const q =
                        math.remap(
                            L,
                            _.throwPhysics.speed * 0.25,
                            _.throwPhysics.speed * 1,
                            0,
                            1
                        ) *
                        math.remap(
                            f.posZ,
                            0.1,
                            GameConfig.projectile.maxHeight * 0.5,
                            0,
                            1
                        );
                    f.trail.scale.set(
                        _.trail.maxLength * q,
                        _.trail.width
                    );
                    f.trail.rotation = -Math.atan2(
                        f.dir.y,
                        f.dir.x
                    );
                    f.trail.tint = _.trail.tint;
                    f.trail.alpha = _.trail.alpha * q;
                    f.trail.visible = true;
                } else {
                    f.trail.visible = false;
                }
                let F = f.layer;
                let j = f.posZ < 0.25 ? 14 : 25;
                const N = collider.createCircle(f.pos, f.rad * 3);
                const H = i.insideStructureStairs(N);
                const V = i.insideStructureMask(N);
                if (
                    f.posZ >= 0.25 &&
                    !!H &&
                    (f.layer & 1) == (a.layer & 1) &&
                    (!V || !(a.layer & 2))
                ) {
                    F |= 2;
                    j += 100;
                }
                if (f.alwaysRenderOntop && a.layer == 0) {
                    j = 1000;
                    F |= 2;
                }
                o.addPIXIObj(f.container, F, j);
                const U =
                    f.imgScale *
                    math.remap(
                        f.posZ,
                        0,
                        GameConfig.projectile.maxHeight,
                        1,
                        4.75
                    );
                const W = h.pointToScreen(f.pos);
                const G = h.pixels(U);
                f.container.position.set(W.x, W.y);
                f.container.scale.set(G, G);
            }
        }
    }
};
export default {
    Vt: i
};

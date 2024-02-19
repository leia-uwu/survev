import * as PIXI from "pixi.js"
;
import { GameConfig } from "../../../shared/gameConfig";
import { collider } from "../../../shared/utils/collider";
import { math } from "../../../shared/utils/math";
import { util } from "../../../shared/utils/util";
import { v2 } from "../../../shared/utils/v2";
import { BulletDefs } from "../../../shared/defs/gameObjects/bulletDefs";

function a() {
    this.bullets = [];
}

a.prototype = {
    addFlare: function(e, t, r) {
        var a = null;
        for (var s = 0; s < this.bullets.length; s++) {
            if (
                !this.bullets[s].alive &&
                !this.bullets[s].collided
            ) {
                a = this.bullets[s];
                break;
            }
        }
        if (!a) {
            a = {};
            a.alive = false;
            a.flareContainer = new PIXI.Container();
            a.flareContainer.visible = false;
            a.flare = PIXI.Sprite.from("part-flare-01.img");
            a.flare.anchor.set(0.5, 0.5);
            a.flareContainer.addChild(a.flare);
            a.trailContainer = new PIXI.Container();
            a.trailContainer.visible = false;
            a.trailContainer.pivot.set(14.5, 0);
            a.bulletTrail = PIXI.Sprite.from(
                "player-bullet-trail-02.img"
            );
            a.bulletTrail.anchor.set(0.5, 0.5);
            a.trailContainer.addChild(a.bulletTrail);
            this.bullets.push(a);
        }
        const l = BulletDefs[e.bulletType];
        const p = 1 + e.varianceT * l.variance;
        const h = math.remap(e.distAdjIdx, 0, 32, -1, 1);
        const d =
            l.distance /
            Math.pow(GameConfig.bullet.reflectDistDecay, e.reflectCount);
        a.alive = true;
        a.isNew = true;
        a.collided = false;
        a.flareScale = 0.01;
        a.trailScale = 1;
        a.timeAlive = 0;
        a.maxTimeAlive = 2.5;
        a.startPos = v2.copy(e.pos);
        a.pos = v2.copy(e.pos);
        a.dir = v2.copy(e.dir);
        a.layer = e.layer;
        a.speed = l.speed * p;
        a.distance = d * p + h;
        const u = Math.atan2(a.dir.x, a.dir.y);
        a.flareContainer.rotation = u - Math.PI / 2;
        a.trailContainer.rotation = u - Math.PI / 2;
        a.layer = e.layer;
        const g = t.u(a.playerId);
        if (g && g.layer & 2) {
            a.layer |= 2;
        }
        const y = GameConfig.tracerColors[l.tracerColor];
        let w = y.regular;
        if (g?.isOnBrightSurface) {
            w = y.saturated;
        }
        a.bulletTrail.scale.set(0.8, l.tracerWidth);
        a.tracerLength = l.tracerLength;
        a.bulletTrail.tint = w;
        a.tracerAlphaRate = y.alphaRate;
        a.tracerAlphaMin = y.alphaMin;
        a.bulletTrail.alpha = 1;
        a.flare.scale.set(1, 1);
        a.flare.tint = l.flareColor;
        a.flare.alpha = 0.8;
        a.maxFlareScale = l.maxFlareScale;
        a.smokeThrottle = 0;
        a.flareContainer.visible = true;
        a.trailContainer.visible = true;
    },
    m: function(e, t, r, a, i, o, m, p) {
        t.$e.p();
        for (let h = 0; h < this.bullets.length; h++) {
            const d = this.bullets[h];
            if (d.collided) {
                d.flareScale = math.max(d.flareScale - e * 0.5, 0);
                d.flare.alpha = math.max(d.flare.alpha - e, 0);
                d.trailScale = math.max(d.trailScale - e * 6, 0);
                d.bulletTrail.alpha = math.max(
                    d.bulletTrail.alpha - e,
                    0
                );
                d.pos = v2.add(d.pos, v2.mul(d.dir, e * d.speed));
                if (d.flare.alpha <= 0) {
                    d.collided = false;
                    d.flareContainer.visible = false;
                    d.trailContainer.visible = false;
                }
            }
            if (d.alive) {
                if (d.tracerAlphaRate) {
                    i.__id;
                    d.playerId;
                    const u =
                        i.__id == d.playerId
                            ? d.tracerAlphaRate
                            : d.tracerAlphaRate * 0.9;
                    d.bulletTrail.alpha = math.max(
                        d.tracerAlphaMin,
                        d.bulletTrail.alpha * u
                    );
                }
                d.timeAlive += e;
                d.flareScale =
                    math.easeOutExpo(d.timeAlive / d.maxTimeAlive) *
                    d.maxFlareScale;
                if (d.smokeThrottle <= 0) {
                    d.smokeThrottle = 0.05;
                } else {
                    d.smokeThrottle -= e;
                }
                const g =
                    d.distance - v2.length(v2.sub(d.startPos, d.pos));
                const y = math.min(g, e * d.speed);
                v2.copy(d.pos);
                d.pos = v2.add(d.pos, v2.mul(d.dir, y));
                if (math.eqAbs(g, y)) {
                    d.collided = true;
                    d.alive = false;
                }
                let w = 0;
                if (
                    (!!util.sameLayer(w, i.layer) ||
                        !!(i.layer & 2)) &&
                    (!(i.layer & 2) ||
                        !r.insideStructureMask(
                            collider.createCircle(d.pos, 1)
                        ))
                ) {
                    w |= 2;
                }
                o.addPIXIObj(d.trailContainer, w, 1000, 0);
                o.addPIXIObj(d.flareContainer, w, 1000, 1);
                d.isNew = false;
            }
        }
    },
    render: function(e) {
        e.pixels(1);
        for (let t = 0; t < this.bullets.length; t++) {
            const r = this.bullets[t];
            if (r.alive || r.collided) {
                const a = e.pointToScreen(r.pos);
                r.flareContainer.position.set(a.x, a.y);
                const i = e.pixels(1);
                r.flareContainer.scale.set(
                    i * r.flareScale,
                    i * r.flareScale
                );
                const o = v2.length(v2.sub(r.pos, r.startPos));
                r.trailContainer.position.set(a.x, a.y);
                const s = math.min(r.tracerLength * 15, o / 2);
                r.trailContainer.scale.set(i * s * r.trailScale, i);
            }
        }
    }
};
export default {
    Nt: a
};

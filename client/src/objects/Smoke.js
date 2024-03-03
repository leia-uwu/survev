import * as PIXI from "pixi.js";
import { collider } from "../../../shared/utils/collider";
import { math } from "../../../shared/utils/math";
import { util } from "../../../shared/utils/util";
import { v2 } from "../../../shared/utils/v2";
import { Pool } from "./objectPool";

class Smoke {
    o() { }
    n() {
        this.particle.fadeOut();
        this.particle = null;
    }

    c(e, t, r, a) {
        this.type = e.type;
        this.pos = v2.copy(e.pos);
        this.rad = e.rad;
        if (t) {
            this.layer = e.layer;
            this.interior = e.interior;
        }
        if (r) {
            this.particle = a.smokeBarn.allocParticle();
            this.particle.o(
                this.pos,
                this.rad,
                this.layer,
                this.interior
            );
        }
        this.particle.posTarget = v2.copy(this.pos);
        this.particle.radTarget = this.rad;
    }
}

class SmokeParticle {
    constructor() {
        const e = ["part-smoke-02.img", "part-smoke-03.img"];
        this.active = false;
        this.zIdx = 0;
        this.sprite = PIXI.Sprite.from(
            e[Math.floor(Math.random() * e.length)]
        );
        this.sprite.anchor = new PIXI.Point(0.5, 0.5);
        this.sprite.visible = false;
    }

    o(e, t, r, a) {
        this.pos = v2.copy(e);
        this.posTarget = v2.copy(this.pos);
        this.rad = t;
        this.radTarget = this.rad;
        this.rot = util.random(0, Math.PI * 2);
        this.rotVel =
            Math.PI *
            util.random(0.25, 0.5) *
            (Math.random() < 0.5 ? -1 : 1);
        this.fade = false;
        this.fadeTicker = 0;
        this.fadeDuration = util.random(0.5, 0.75);
        this.tint = util.rgbToInt(
            util.hsvToRgb(0, 0, util.random(0.9, 0.95))
        );
        this.layer = r;
        this.interior = a;
    }

    fadeOut() {
        this.fade = true;
    }
}
export class SmokeBarn {
    constructor() {
        this.e = new Pool(Smoke);
        this.particles = [];
        this.zIdx = 2147483647;
    }

    allocParticle() {
        let e = null;
        for (let t = 0; t < this.particles.length; t++) {
            if (!this.particles[t].active) {
                e = this.particles[t];
                break;
            }
        }
        if (!e) {
            e = new SmokeParticle();
            this.particles.push(e);
        }
        e.active = true;
        e.zIdx = this.zIdx--;
        return e;
    }

    m(e, t, r, a, i) {
        // for (let o = this.e.p(), s = 0; s < o.length; s++) {
        // o[s].active;
        // }
        for (let m = 0; m < this.particles.length; m++) {
            const p = this.particles[m];
            if (p.active) {
                p.rad = math.lerp(e * 3, p.rad, p.radTarget);
                p.pos = math.v2lerp(e * 3, p.pos, p.posTarget);
                p.rotVel *= 1 / (1 + e * 0.1);
                p.rot += p.rotVel * e;
                p.fadeTicker += p.fade ? e : 0;
                p.active = p.fadeTicker < p.fadeDuration;
                const h =
                    math.clamp(
                        1 - p.fadeTicker / p.fadeDuration,
                        0,
                        1
                    ) * 0.9;
                let d = p.layer;
                if (
                    (!!util.sameLayer(p.layer, r.layer) ||
                        !!(r.layer & 2)) &&
                    (p.layer == 1 ||
                        !(r.layer & 2) ||
                        !a.insideStructureMask(
                            collider.createCircle(p.pos, 1)
                        ))
                ) {
                    d |= 2;
                }
                const u = p.interior ? 500 : 1000;
                i.addPIXIObj(p.sprite, d, u, p.zIdx);
                const g = t.pointToScreen(p.pos);
                const y = t.pixels((p.rad * 2) / t.ppu);
                p.sprite.position.set(g.x, g.y);
                p.sprite.scale.set(y, y);
                p.sprite.rotation = p.rot;
                p.sprite.tint = p.tint;
                p.sprite.alpha = h;
                p.sprite.visible = p.active;
            }
        }
    }
}

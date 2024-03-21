import * as PIXI from "pixi.js-legacy";
import { collider } from "../../../shared/utils/collider";
import { math } from "../../../shared/utils/math";
import { util } from "../../../shared/utils/util";
import { v2 } from "../../../shared/utils/v2";
import { Pool } from "./objectPool";

class Smoke {
    init() { }
    free() {
        this.particle.fadeOut();
        this.particle = null;
    }

    updateData(data, fullUpdate, isNew, ctx) {
        this.type = data.type;
        this.pos = v2.copy(data.pos);
        this.rad = data.rad;

        if (fullUpdate) {
            this.layer = data.layer;
            this.interior = data.interior;
        }

        if (isNew) {
            this.particle = ctx.smokeBarn.allocParticle();
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
        const particles = ["part-smoke-02.img", "part-smoke-03.img"];
        this.active = false;
        this.zIdx = 0;
        this.sprite = PIXI.Sprite.from(
            particles[Math.floor(Math.random() * particles.length)]
        );
        this.sprite.anchor = new PIXI.Point(0.5, 0.5);
        this.sprite.visible = false;
    }

    o(pos, rad, layer, interior) {
        this.pos = v2.copy(pos);
        this.posTarget = v2.copy(this.pos);
        this.rad = rad;
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
        this.layer = layer;
        this.interior = interior;
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
        let particle = null;
        for (let i = 0; i < this.particles.length; i++) {
            if (!this.particles[i].active) {
                particle = this.particles[i];
                break;
            }
        }
        if (!particle) {
            particle = new SmokeParticle();
            this.particles.push(particle);
        }
        particle.active = true;
        particle.zIdx = this.zIdx--;
        return particle;
    }

    update(dt, camera, activePlayer, map, renderer) {
        // why is this commented out?
        // for (let o = this.e.getPool(), s = 0; s < o.length; s++) {
        // o[s].active;
        // }

        // Update visual particles
        for (let m = 0; m < this.particles.length; m++) {
            const p = this.particles[m];
            if (p.active) {
                p.rad = math.lerp(dt * 3, p.rad, p.radTarget);
                p.pos = math.v2lerp(dt * 3, p.pos, p.posTarget);
                p.rotVel *= 1 / (1 + dt * 0.1);
                p.rot += p.rotVel * dt;
                p.fadeTicker += p.fade ? dt : 0;
                p.active = p.fadeTicker < p.fadeDuration;

                const alpha =
                    math.clamp(
                        1 - p.fadeTicker / p.fadeDuration,
                        0,
                        1
                    ) * 0.9;

                // Always add to the top layer if visible and not occluded by
                // the layer mask (fixes issue of smokes spawning on the ground
                // level but occluded by the cellar when on the stairs).
                let layer = p.layer;
                if (
                    (!!util.sameLayer(p.layer, activePlayer.layer) ||
                        !!(activePlayer.layer & 2)) &&
                    (p.layer == 1 ||
                        !(activePlayer.layer & 2) ||
                        !map.insideStructureMask(
                            collider.createCircle(p.pos, 1)
                        ))
                ) {
                    layer |= 2;
                }
                const zOrd = p.interior ? 500 : 1000;
                renderer.addPIXIObj(p.sprite, layer, zOrd, p.zIdx);

                const screenPos = camera.pointToScreen(p.pos);
                const screenScale = camera.pixels((p.rad * 2) / camera.ppu);

                p.sprite.position.set(screenPos.x, screenPos.y);
                p.sprite.scale.set(screenScale, screenScale);
                p.sprite.rotation = p.rot;
                p.sprite.tint = p.tint;
                p.sprite.alpha = alpha;
                p.sprite.visible = p.active;
            }
        }
    }
}

import * as PIXI from "pixi.js";
import { collider } from "../../../shared/utils/collider";
import { GameConfig } from "../../../shared/gameConfig";
import { math } from "../../../shared/utils/math";
import { util } from "../../../shared/utils/util";
import { v2 } from "../../../shared/utils/v2";
import { Pool } from "./objectPool";

class AirDrop {
    constructor() {
        this.sprite = new PIXI.Sprite();
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.visible = false;
    }

    o() {
        this.playedLandFx = false;
        this.landed = false;
        this.fallInstance = null;
        this.chuteDeployed = false;
        this.soundUpdateThrottle = 0;
        this.pos = v2.create(0, 0);
        this.isNew = false;
        this.fallTicker = 0;
    }

    n() {
        this.fallInstance?.stop();
        this.fallInstance = null;
        this.sprite.visible = false;
    }

    c(e, t, r, a) {
        if (r) {
            this.isNew = true;
            this.fallTicker = e.fallT * GameConfig.airdrop.fallTime;
            const i = a.map.getMapDef().biome.airdrop.airdropImg;
            this.sprite.texture = PIXI.Texture.from(i);
        }
        if (t) {
            this.pos = v2.copy(e.pos);
        }
        this.landed = e.landed;
    }
}
export class AirdropBarn {
    constructor() {
        this.re = new Pool(AirDrop);
    }

    free() {
        for (let e = this.re.p(), t = 0; t < e.length; t++) {
            e[t].n();
        }
    }

    m(e, t, r, a, i, o, p) {
        for (let h = this.re.p(), d = 0; d < h.length; d++) {
            const u = h[d];
            if (u.active) {
                u.fallTicker += e;
                const g = math.clamp(
                    u.fallTicker / GameConfig.airdrop.fallTime,
                    0,
                    1
                );
                let y = 0;
                if (
                    (!!util.sameLayer(y, t.layer) ||
                        !!(t.layer & 2)) &&
                    (!(t.layer & 2) ||
                        !a.insideStructureMask(
                            collider.createCircle(u.pos, 1)
                        ))
                ) {
                    y |= 2;
                }
                if (
                    u.landed &&
                    !u.playedLandFx &&
                    ((u.playedLandFx = true), !u.isNew)
                ) {
                    for (let w = 0; w < 10; w++) {
                        const f = v2.randomUnit();
                        i.addParticle("airdropSmoke", y, u.pos, f);
                    }
                    const _ = a.getGroundSurface(u.pos, y);
                    if (_.type == "water") {
                        for (let b = 0; b < 12; b++) {
                            const x = v2.add(
                                u.pos,
                                v2.mul(
                                    v2.randomUnit(),
                                    util.random(4.5, 6)
                                )
                            );
                            const S = i.addRippleParticle(
                                x,
                                y,
                                _.data.rippleColor
                            );
                            S.setDelay(b * 0.075);
                        }
                    }
                    const v =
                        _.type == "water"
                            ? "airdrop_crash_02"
                            : "airdrop_crash_01";
                    p.playSound(v, {
                        channel: "sfx",
                        soundPos: u.pos,
                        layer: y,
                        filter: "muffled"
                    });
                    p.stopSound(u.fallInstance);
                    u.fallInstance = null;
                }
                if (!u.chuteDeployed && g <= 0.1) {
                    p.playSound("airdrop_chute_01", {
                        channel: "sfx",
                        soundPos: u.pos,
                        layer: y,
                        rangeMult: 1.75
                    });
                    u.chuteDeployed = true;
                }
                if (!u.landed && !u.fallInstance) {
                    u.fallInstance = p.playSound(
                        "airdrop_fall_01",
                        {
                            channel: "sfx",
                            soundPos: u.pos,
                            layer: y,
                            rangeMult: 1.75,
                            ignoreMinAllowable: true,
                            offset: u.fallTicker
                        }
                    );
                }
                if (u.fallInstance && u.soundUpdateThrottle < 0) {
                    u.soundUpdateThrottle = 0.1;
                    p.updateSound(u.fallInstance, "sfx", u.pos, {
                        layer: y,
                        rangeMult: 1.75,
                        ignoreMinAllowable: true
                    });
                } else {
                    u.soundUpdateThrottle -= e;
                }
                u.rad = math.lerp(Math.pow(1 - g, 1.1), 5, 12);
                o.addPIXIObj(u.sprite, y, 1500, u.__id);
                const k = r.pointToScreen(u.pos);
                const z = r.pixels((u.rad * 2) / r.ppu);
                u.sprite.position.set(k.x, k.y);
                u.sprite.scale.set(z, z);
                u.sprite.tint = 16776960;
                u.sprite.alpha = 1;
                u.sprite.visible = !u.landed;
                u.isNew = false;
            }
        }
    }
}

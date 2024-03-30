import * as PIXI from "pixi.js-legacy";
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

    init() {
        this.playedLandFx = false;
        this.landed = false;
        this.fallInstance = null;
        this.chuteDeployed = false;
        this.soundUpdateThrottle = 0;
        this.pos = v2.create(0, 0);
        this.isNew = false;
        this.fallTicker = 0;
    }

    free() {
        this.fallInstance?.stop();
        this.fallInstance = null;
        this.sprite.visible = false;
    }

    updateData(data, fullUpdate, isNew, ctx) {
        if (isNew) {
            this.isNew = true;
            this.fallTicker = data.fallT * GameConfig.airdrop.fallTime;
            const img = ctx.map.getMapDef().biome.airdrop.airdropImg;
            this.sprite.texture = PIXI.Texture.from(img);
        }
        if (fullUpdate) {
            this.pos = v2.copy(data.pos);
        }
        this.landed = data.landed;
    }
}
export class AirdropBarn {
    constructor() {
        this.airdropPool = new Pool(AirDrop);
    }

    free() {
        const airdrops = this.airdropPool.getPool();
        for (let i = 0; i < airdrops.length; i++) {
            airdrops[i].free();
        }
    }

    update(dt, activePlayer, camera, map, particleBarn, renderer, audioManager) {
        const airdrops = this.airdropPool.getPool();
        for (let i = 0; i < airdrops.length; i++) {
            const airdrop = airdrops[i];
            if (airdrop.active) {
                airdrop.fallTicker += dt;
                const fallT = math.clamp(
                    airdrop.fallTicker / GameConfig.airdrop.fallTime,
                    0,
                    1
                );
                let layer;
                // Make some crate particles? = 0;
                if (
                    (!!util.sameLayer(layer, activePlayer.layer) ||
                        !!(activePlayer.layer & 2)) &&
                    (!(activePlayer.layer & 2) ||
                        !map.insideStructureMask(
                            collider.createCircle(airdrop.pos, 1)
                        ))
                ) {
                    layer |= 2;
                }
                if (
                    airdrop.landed &&
                    !airdrop.playedLandFx &&
                    ((airdrop.playedLandFx = true), !airdrop.isNew)
                ) {
                    // Make some crate particles?
                    for (let j = 0; j < 10; j++) {
                        const vel = v2.randomUnit();
                        particleBarn.addParticle("airdropSmoke", layer, airdrop.pos, vel);
                    }

                    // Water landing effects
                    const surface = map.getGroundSurface(airdrop.pos, layer);
                    if (surface.type == "water") {
                        for (let b = 0; b < 12; b++) {
                            const ripplePos = v2.add(
                                airdrop.pos,
                                v2.mul(
                                    v2.randomUnit(),
                                    util.random(4.5, 6)
                                )
                            );
                            const part = particleBarn.addRippleParticle(
                                ripplePos,
                                layer,
                                surface.data.rippleColor
                            );
                            part.setDelay(b * 0.075);
                        }
                    }

                    // Play the crate hitting ground sound
                    const crashSound =
                        surface.type == "water"
                            ? "airdrop_crash_02"
                            : "airdrop_crash_01";
                    audioManager.playSound(crashSound, {
                        channel: "sfx",
                        soundPos: airdrop.pos,
                        layer,
                        filter: "muffled"
                    });
                    audioManager.stopSound(airdrop.fallInstance);
                    airdrop.fallInstance = null;
                }

                // Play airdrop chute and falling sounds once
                if (!airdrop.chuteDeployed && fallT <= 0.1) {
                    audioManager.playSound("airdrop_chute_01", {
                        channel: "sfx",
                        soundPos: airdrop.pos,
                        layer,
                        rangeMult: 1.75
                    });
                    airdrop.chuteDeployed = true;
                }
                if (!airdrop.landed && !airdrop.fallInstance) {
                    airdrop.fallInstance = audioManager.playSound(
                        "airdrop_fall_01",
                        {
                            channel: "sfx",
                            soundPos: airdrop.pos,
                            layer,
                            rangeMult: 1.75,
                            ignoreMinAllowable: true,
                            offset: airdrop.fallTicker
                        }
                    );
                }

                if (airdrop.fallInstance && airdrop.soundUpdateThrottle < 0) {
                    airdrop.soundUpdateThrottle = 0.1;
                    audioManager.updateSound(airdrop.fallInstance, "sfx", airdrop.pos, {
                        layer,
                        rangeMult: 1.75,
                        ignoreMinAllowable: true
                    });
                } else {
                    airdrop.soundUpdateThrottle -= dt;
                }

                airdrop.rad = math.lerp(Math.pow(1 - fallT, 1.1), 5, 12);
                renderer.addPIXIObj(airdrop.sprite, layer, 1500, airdrop.__id);

                const screenPos = camera.pointToScreen(airdrop.pos);
                const screenScale = camera.pixels((airdrop.rad * 2) / camera.ppu);
                airdrop.sprite.position.set(screenPos.x, screenPos.y);
                airdrop.sprite.scale.set(screenScale, screenScale);
                airdrop.sprite.tint = 16776960;
                airdrop.sprite.alpha = 1;
                airdrop.sprite.visible = !airdrop.landed;
                airdrop.isNew = false;
            }
        }
    }
}

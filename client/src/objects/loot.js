import * as PIXI from "pixi.js";
import { GameConfig } from "../../../shared/gameConfig";
import { math } from "../../../shared/utils/math";
import { util } from "../../../shared/utils/util";
import { v2 } from "../../../shared/utils/v2";
import { device } from "../device";
import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";
import { Pool } from "./objectPool";

class Loot {
    constructor() {
        this.ticker = 0;
        this.playDropSfx = false;
        this.container = new PIXI.Sprite();
        this.container.anchor.set(0.5, 0.5);
        this.container.scale.set(1, 1);
        this.sprite = new PIXI.Sprite();
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.scale.set(0.8, 0.8);
        this.container.addChild(this.sprite);
        this.emitter = null;
    }

    o() {
        this.updatedData = false;
    }

    n() {
        this.container.visible = false;
        if (this.emitter) {
            this.emitter.stop();
            this.emitter = null;
        }
    }

    c(e, t, r, a) {
        this.updatedData = true;
        this.pos = v2.copy(e.pos);
        if (t) {
            this.layer = e.layer;
            this.type = e.type;
            this.count = e.count;
            this.isOld = e.isOld;
            this.isPreloadedGun = e.isPreloadedGun;
            this.ownerId = e.hasOwner ? e.ownerId : 0;
        }
        if (r) {
            const i = GameObjectDefs[this.type];
            this.ticker = 0;
            if (this.isOld) {
                this.ticker = 10;
            }
            if (
                !this.isOld &&
                i.sound.drop &&
                a.map.lootDropSfxIds.indexOf(this.__id) == -1
            ) {
                this.playDropSfx = true;
            }
            this.rad = GameConfig.lootRadius[i.type];
            this.imgScale = i.lootImg.scale * 1.25;
            const n = i.lootImg.innerScale || 0.8;
            this.sprite.scale.set(n, n);
            this.sprite.texture = PIXI.Texture.from(
                i.lootImg.sprite
            );
            this.sprite.tint = i.lootImg.tint;
            this.container.texture = i.lootImg.border
                ? PIXI.Texture.from(i.lootImg.border)
                : PIXI.Texture.EMPTY;
            if (this.isPreloadedGun) {
                this.container.texture = PIXI.Texture.from(
                    "loot-circle-outer-06.img"
                );
            }
            const l = GameObjectDefs[i.ammo];
            if (l) {
                this.container.tint = l.lootImg.tintDark;
            } else if (i.lootImg.borderTint) {
                this.container.tint = i.lootImg.borderTint;
            } else {
                this.container.tint = 0;
            }
            if (i.type == "xp" && i.emitter) {
                this.emitter = a.particleBarn.addEmitter(
                    i.emitter,
                    {
                        pos: this.pos,
                        layer: this.layer
                    }
                );
            }
            this.sprite.rotation = i.lootImg.rot
                ? i.lootImg.rot
                : 0;
            this.sprite.scale.x = i.lootImg.mirror ? -n : n;
            this.container.visible = true;
        }
        if (r || t) {
            a.renderer.addPIXIObj(
                this.container,
                this.layer,
                13,
                this.__id
            );
        }
    }
}

export class LootBarn {
    constructor() {
        this.sr = new Pool(Loot);
        this.closestLoot = null;
    }

    /**
     * @param {number} dt
     * @param {import("./player").Player} activePlayer
     * @param {import("../map").Map} map
     * @param {import("../audioManager").AudioManager} audioManager
     * @param {import("../camera").Camera} camera
     */
    update(dt, activePlayer, map, audioManager, camera, debug) {
        this.closestLoot = null;
        let closestDist = Number.MAX_VALUE;
        const loots = this.sr.p();
        for (let i = 0; i < loots.length; i++) {
            /** @type {Loot} */
            const loot = loots[i];
            if (loot.active) {
                if (
                    util.sameLayer(loot.layer, activePlayer.layer) &&
                    !activePlayer.netData.he &&
                    (loot.ownerId == 0 || loot.ownerId == activePlayer.__id)
                ) {
                    const pos = loot.pos;
                    const rad = device.touch
                        ? activePlayer.rad + loot.rad * GameConfig.player.touchLootRadMult
                        : loot.rad;
                    const toPlayer = v2.sub(activePlayer.pos, pos);
                    const distSq = v2.lengthSqr(toPlayer);
                    if (distSq < rad * rad && distSq < closestDist) {
                        closestDist = distSq;
                        this.closestLoot = loot;
                    }
                }
                loot.ticker += dt;
                if (loot.playDropSfx) {
                    map.lootDropSfxIds.push(loot.__id);
                    loot.playDropSfx = false;
                    const b = GameObjectDefs[loot.type];
                    audioManager.playSound(b.sound.drop, {
                        channel: "sfx",
                        soundPos: loot.pos,
                        layer: loot.layer,
                        filter: "muffled"
                    });
                }
                if (loot.emitter) {
                    loot.emitter.pos = v2.add(loot.pos, v2.create(0, 0.1));
                    loot.emitter.layer = loot.layer;
                }
                const x = math.delerp(loot.ticker, 0, 1);
                const S = math.easeOutElastic(x, 0.75);
                const v = camera.pointToScreen(loot.pos);
                const k = camera.pixels(loot.imgScale * S);
                loot.container.position.set(v.x, v.y);
                loot.container.scale.set(k, k);
            }
        }
    }

    getClosestLoot() {
        return this.closestLoot;
    }
}

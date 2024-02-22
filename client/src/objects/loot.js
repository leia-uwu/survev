import * as PIXI from "pixi.js";
import { GameConfig } from "../../../shared/gameConfig";
import { math } from "../../../shared/utils/math";
import { util } from "../../../shared/utils/util";
import { v2 } from "../../../shared/utils/v2";
import device from "../device";
import ObjectPool from "./objectPool";
import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";

function a() {
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
function i() {
    this.sr = new ObjectPool.Pool(a);
    this.Dr = null;
}

a.prototype = {
    o: function() {
        this.updatedData = false;
    },
    n: function() {
        this.container.visible = false;
        if (this.emitter) {
            this.emitter.stop();
            this.emitter = null;
        }
    },
    c: function(e, t, r, a) {
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
};
i.prototype = {
    m: function(e, t, r, a, i, o) {
        this.Dr = null;
        for (
            let p = Number.MAX_VALUE, d = this.sr.p(), u = 0;
            u < d.length;
            u++
        ) {
            const g = d[u];
            if (g.active) {
                if (
                    util.sameLayer(g.layer, t.layer) &&
                    !t.netData.he &&
                    (g.ownerId == 0 || g.ownerId == t.__id)
                ) {
                    const y = g.pos;
                    const w = device.touch
                        ? t.rad + g.rad * GameConfig.player.touchLootRadMult
                        : g.rad;
                    const f = v2.sub(t.pos, y);
                    const _ = v2.lengthSqr(f);
                    if (_ < w * w && _ < p) {
                        p = _;
                        this.Dr = g;
                    }
                }
                g.ticker += e;
                if (g.playDropSfx) {
                    r.lootDropSfxIds.push(g.__id);
                    g.playDropSfx = false;
                    const b = GameObjectDefs[g.type];
                    a.playSound(b.sound.drop, {
                        channel: "sfx",
                        soundPos: g.pos,
                        layer: g.layer,
                        filter: "muffled"
                    });
                }
                if (g.emitter) {
                    g.emitter.pos = v2.add(g.pos, v2.create(0, 0.1));
                    g.emitter.layer = g.layer;
                }
                const x = math.delerp(g.ticker, 0, 1);
                const S = math.easeOutElastic(x, 0.75);
                const v = i.pointToScreen(g.pos);
                const k = i.pixels(g.imgScale * S);
                g.container.position.set(v.x, v.y);
                g.container.scale.set(k, k);
            }
        }
    },
    Er: function() {
        return this.Dr;
    }
};
export default {
    LootBarn: i
};

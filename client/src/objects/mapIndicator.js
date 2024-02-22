import * as PIXI from "pixi.js";
import { v2 } from "../../../shared/utils/v2";
import device from "../device";
import { math } from "../../../shared/utils/math";
import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";

function a(e) {
    this.ht = e;
    this.dt = [];
    this.ut = {};
}

a.prototype = {
    Ne: function(e) {
        for (let t = 0; t < e.length; t++) {
            const r = e[t];
            if (r.dead) {
                this.gt(r.id);
            } else {
                this.yt(r);
            }
        }
    },
    wt: function(e) {
        const t = {
            id: e.id,
            type: e.type,
            pos: v2.copy(e.pos),
            equipped: e.equipped,
            mapSprite: this.ht.addSprite(),
            pulseSprite: this.ht.addSprite(),
            pulseScale: 0.5,
            pulseScaleMin: 0.5,
            pulseScaleMax: 1,
            pulseTicker: 0,
            pulseDir: 1,
            pulseSpeed: 0.3
        };
        this.dt.push(t);
        this.ut[e.id] = t;
        return t;
    },
    gt: function(e) {
        for (let t = 0; t < this.dt.length; t++) {
            const r = this.dt[t];
            if (r.id == e) {
                r.mapSprite.free();
                r.pulseSprite.free();
                this.dt.splice(t, 1);
                delete this.ut[e];
                break;
            }
        }
    },
    yt: function(e) {
        let t = this.ut[e.id];
        t ||= this.wt(e);
        t.pos = v2.copy(e.pos);
        t.equipped = e.equipped;
        const r = GameObjectDefs[t.type];
        const a = (device.uiLayout == device.UiLayout.Sm ? 0.15 : 0.2) * 1.25;
        const n = t.equipped ? 655350 : 1;
        const c = t.mapSprite;
        c.pos = v2.copy(t.pos);
        c.scale = a;
        c.alpha = 1;
        c.zOrder = n;
        c.visible = true;
        c.sprite.texture = PIXI.Texture.from(
            r.mapIndicator.sprite
        );
        c.sprite.tint = r.mapIndicator.tint;
        if (r.mapIndicator.pulse) {
            const m = t.pulseSprite;
            m.pos = v2.copy(t.pos);
            m.scale = 1;
            m.zOrder = n - 1;
            m.visible = true;
            m.sprite.texture =
                PIXI.Texture.from("part-pulse-01.img");
            m.sprite.tint = r.mapIndicator.pulseTint;
        }
    },
    Ee: function(e) {
        for (let t = 0; t < this.dt.length; t++) {
            const r = this.dt[t];
            r.pulseTicker = math.clamp(
                r.pulseTicker + e * r.pulseDir * r.pulseSpeed,
                r.pulseScaleMin,
                1
            );
            r.pulseScale = r.pulseTicker * r.pulseScaleMax;
            if (
                r.pulseScale >= r.pulseScaleMax ||
                r.pulseTicker <= r.pulseScaleMin
            ) {
                r.pulseDir *= -1;
            }
            r.pulseSprite.scale = r.pulseScale;
            r.pulseSprite.visible = r.equipped;
        }
    }
};
export default {
    Oe: a
};

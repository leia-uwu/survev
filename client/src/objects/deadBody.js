import * as PIXI from "pixi.js"
;
import { collider } from "../../../shared/utils/collider";
import { util } from "../../../shared/utils/util";
import { v2 } from "../../../shared/utils/v2";
import device from "../device";
import ObjectPool from "./objectPool";

function a() {
    const e = {
        fontFamily: "Arial",
        fontWeight: "bold",
        fontSize: device.pixelRatio > 1 ? 30 : 24,
        align: "center",
        fill: 16777215,
        stroke: 0,
        strokeThickness: 0,
        dropShadow: true,
        dropShadowColor: "#000000",
        dropShadowBlur: 1,
        dropShadowAngle: Math.PI / 3,
        dropShadowDistance: 1
    };
    const t = new PIXI.Text("", e);
    t.anchor.set(0.5, 0.5);
    t.scale.set(0.5, 0.5);
    return t;
}
function i() {
    this.active = false;
    this.pos = v2.create(0, 0);
    this.container = new PIXI.Container();
    this.sprite = PIXI.Sprite.from("skull.img");
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.scale.set(0.4, 0.4);
    this.sprite.tint = 5921370;
    this.container.addChild(this.sprite);
    this.nameText = a();
    this.nameText.anchor.set(0.5, -1);
    this.nameText.tint = util.rgbToInt(util.hsvToRgb(0, 0, 0.5));
    this.container.addChild(this.nameText);
    this.container.visible = this.sprite;
}
function DeadBodyBarn() {
    this.ot = new ObjectPool.Pool(i);
}

i.prototype = {
    o: function() { },
    n: function() {
        this.container.visible = false;
    },
    c: function(e, t, r, a) {
        this.pos = v2.copy(e.pos);
        if (t) {
            this.layer = e.layer;
            this.playerId = e.playerId;
        }
        if (r) {
            this.nameTextSet = false;
            this.container.visible = true;
        }
    }
};
DeadBodyBarn.prototype = {
    m: function(e, t, r, a, i, o) {
        for (let s = this.ot.p(), l = 0; l < s.length; l++) {
            const c = s[l];
            if (c.active) {
                if (!c.nameTextSet) {
                    c.nameText.text = t.getPlayerName(
                        c.playerId,
                        r.__id,
                        false
                    );
                    c.nameTextSet = true;
                }
                const m = collider.createCircle(c.pos, 1);
                const p = a.insideStructureStairs(m);
                let h = c.layer;
                let d = 12;
                if (c.layer == 0 && r.layer == 0 && p) {
                    h |= 2;
                    d += 100;
                }
                o.addPIXIObj(c.container, h, d, c.__id);
                const u = i.pointToScreen(c.pos);
                const g = i.pixels(1);
                c.container.position.set(u.x, u.y);
                c.container.scale.set(g, g);
            }
        }
    },
    getDeadBodyById: function(e) {
        for (let t = this.ot.p(), r = 0; r < t.length; r++) {
            const a = t[r];
            if (a.active && a.playerId == e) {
                return a;
            }
        }
        return null;
    }
};
export default {
    DeadBodyBarn
};

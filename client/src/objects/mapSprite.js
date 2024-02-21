import * as PIXI from "pixi.js";
import { math } from "../../../shared/utils/math";
import { v2 } from "../../../shared/utils/v2";

function s() {
    this.active = false;
    this.retained = true;
    this.sprite = new p();
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.scale.set(1, 1);
    this.sprite.visible = false;
    this.pos = v2.create(0, 0);
    this.scale = 1;
    this.alpha = 1;
    this.visible = true;
    this.pulse = false;
    this.lifetime = 0;
    this.ticker = 0;
    this.zOrder = 0;
}
function MapSpriteBarn() {
    this.container = new PIXI.Container();
    this.mapSprites = [];
}

class p extends PIXI.Sprite {
    constructor() {
        super();
        this.__zOrder = -1;
    }
}

s.prototype = {
    init: function() {
        this.active = true;
        this.retained = true;
        this.pos = v2.create(0, 0);
        this.scale = 1;
        this.alpha = 1;
        this.pulse = false;
        this.visible = true;
        this.lifetime = Number.MAX_VALUE;
        this.ticker = 0;
        this.zOrder = 0;
    },
    free: function() {
        this.active = false;
        this.sprite.visible = false;
    },
    release: function() {
        this.retained = false;
    }
};
MapSpriteBarn.prototype = {
    n: function() {
        for (let e = 0; e < this.mapSprites.length; e++) {
            const t = this.mapSprites[e].sprite;
            t.parent?.removeChild(t);
            t.destroy({
                children: true
            });
        }
    },
    addSprite: function() {
        let e = null;
        for (let t = 0; t < this.mapSprites.length; t++) {
            if (!this.mapSprites[t].active) {
                e = this.mapSprites[t];
                break;
            }
        }
        if (!e) {
            e = new s();
            this.mapSprites.push(e);
            this.container.addChild(e.sprite);
        }
        e.init();
        return e;
    },
    update: function(e, t, r) {
        let a = false;
        for (let i = 0; i < this.mapSprites.length; i++) {
            const o = this.mapSprites[i];
            if (o.active) {
                if (o.zOrder != o.sprite.__zOrder) {
                    o.sprite.__zOrder = o.zOrder;
                    a = true;
                }
                o.ticker += e;
                if (o.pulse) {
                    o.scale += e / 2.5;
                }
                const s = t.getMapPosFromWorldPos(o.pos, r);
                const n = o.scale;
                const l =
                    math.smoothstep(o.ticker, 0, 0.1) *
                    (1 -
                        math.smoothstep(
                            o.ticker,
                            o.lifetime - 0.5,
                            o.lifetime
                        ));
                o.sprite.position.set(s.x, s.y);
                o.sprite.scale.set(n, n);
                o.sprite.alpha = o.alpha * l;
                o.sprite.visible =
                    o.visible && o.sprite.alpha > 0.0001;
                if (o.ticker >= o.lifetime && !o.retained) {
                    o.free();
                }
            }
        }
        if (a) {
            this.container.children.sort((e, t) => {
                return e.__zOrder - t.__zOrder;
            });
        }
    }
};
export default {
    MapSpriteBarn
};

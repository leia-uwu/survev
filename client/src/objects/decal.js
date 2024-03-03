import * as PIXI from "pixi.js";
import { collider } from "../../../shared/utils/collider";
import { math } from "../../../shared/utils/math";
import { v2 } from "../../../shared/utils/v2";
import { Pool } from "./objectPool";
import { util } from "../../../shared/utils/util";
import { MapObjectDefs } from "../../../shared/defs/mapObjectDefs";

function lerpColor(t, a, b) {
    // util.lerpColor is relatively expensive; avoid if it possible
    return t == 0.0 ? a : t == 1.0 ? b : util.lerpColor(t, a, b);
}

class Decal {
    constructor() {
        this.decalRender = null;
    }

    o() {
        this.isNew = false;
        this.goreT = 0;
    }

    n() {
        if (this.decalRender) {
            this.decalRender.n();
            this.decalRender = null;
        }
    }

    c(e, t, r, a) {
        if (t) {
            const i = MapObjectDefs[e.type];
            this.type = e.type;
            this.pos = v2.copy(e.pos);
            this.rot = math.oriToRad(e.ori);
            this.scale = e.scale;
            this.layer = e.layer;
            this.goreKills = e.goreKills;
            this.collider = collider.transform(
                i.collision,
                this.pos,
                this.rot,
                this.scale
            );
            this.surface = i.surface
                ? util.cloneDeep(i.surface)
                : null;
            this.hasGore = i.gore !== undefined;
            this.isNew = r;
            if (this.isNew) {
                this.decalRender = a.decalBarn.allocDecalRender();
                this.decalRender.o(this, a.map, a.renderer);
            }
        }
    }

    m(e, t) {
        if (this.hasGore) {
            const r = MapObjectDefs[this.type];
            let i = math.delerp(
                this.goreKills,
                r.gore.fade.start,
                r.gore.fade.end
            );
            i = Math.pow(i, r.gore.fade.pow);
            this.goreT = this.isNew
                ? i
                : math.lerp(e * r.gore.fade.speed, this.goreT, i);
            if (r.gore.tint !== undefined) {
                const o = lerpColor(this.goreT, r.img.tint, r.gore.tint);
                this.decalRender.setTint(o);
            }
            if (r.gore.alpha !== undefined) {
                this.decalRender.spriteAlpha = math.lerp(
                    this.goreT,
                    r.img.alpha,
                    r.gore.alpha
                );
            }
            if (r.gore.waterColor !== undefined && this.surface) {
                this.surface.data.waterColor = lerpColor(
                    this.goreT,
                    r.surface.data.waterColor,
                    r.gore.waterColor
                );
            }
            if (r.gore.rippleColor !== undefined && this.surface) {
                this.surface.data.rippleColor = lerpColor(
                    this.goreT,
                    r.surface.data.rippleColor,
                    r.gore.rippleColor
                );
            }
        }
        this.isNew = false;
    }
}

class DecalRender {
    constructor() {
        this.sprite = new PIXI.Sprite();
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.visible = false;
    }

    o(e, t, r) {
        const a = MapObjectDefs[e.type];
        this.pos = v2.copy(e.pos);
        this.rot = e.rot;
        this.scale = e.scale;
        this.layer = e.layer;
        this.zIdx = a.img.zIdx;
        this.zOrd = e.__id;
        const i = a.img;
        this.sprite.texture = PIXI.Texture.from(i.sprite);
        this.sprite.alpha = 1;
        this.sprite.visible = true;
        this.imgScale = a.img.scale;
        this.spriteAlpha = i.alpha;
        this.valueAdjust = i.ignoreAdjust
            ? 1
            : t.getMapDef().biome.valueAdjust;
        this.setTint(i.tint);
        this.inWater = false;
        if (a.height < 0.25) {
            const o = t.getGroundSurface(e.pos, e.layer);
            this.inWater = o.type == "water";
        }
        this.flicker = a.img.flicker;
        if (this.flicker) {
            this.flickerMin = a.img.flickerMin;
            this.flickerMax = a.img.flickerMax;
            this.flickerTarget = this.imgScale;
            this.flickerRate = a.img.flickerRate;
            this.flickerCooldown = 0;
        }
        this.active = true;
        this.deactivated = false;
        this.fadeout = a.lifetime !== undefined;
        this.fadeAlpha = 1;
    }

    n() {
        this.deactivated = true;
    }

    setTint(e) {
        if (this.valueAdjust < 1) {
            e = util.adjustValue(e, this.valueAdjust);
        }
        this.sprite.tint = e;
    }

    m(e, t, r) {
        if (this.deactivated && this.fadeout) {
            this.fadeAlpha = math.lerp(e * 3, this.fadeAlpha, 0);
            if (this.fadeAlpha < 0.01) {
                this.fadeAlpha = 0;
            }
        }
        if (
            !!this.deactivated &&
            (!this.fadeout || !!math.eqAbs(this.fadeAlpha, 0))
        ) {
            this.sprite.visible = false;
            this.active = false;
        }
        if (this.flicker) {
            if (this.flickerCooldown < 0) {
                this.flickerTarget = util.random(
                    this.flickerMin,
                    this.flickerMax
                );
                this.flickerCooldown = util.random(
                    0.05,
                    this.flickerRate
                );
            } else {
                this.imgScale = math.lerp(
                    this.flickerRate - this.flickerCooldown,
                    this.imgScale,
                    this.flickerTarget
                );
                this.flickerCooldown -= e;
            }
        }
        const a = t.pointToScreen(this.pos);
        const i = t.pixels(this.scale * this.imgScale);
        this.sprite.position.set(a.x, a.y);
        this.sprite.scale.set(i, i);
        this.sprite.rotation = -this.rot;
        this.sprite.alpha =
            this.spriteAlpha *
            (this.inWater ? 0.3 : 1) *
            this.fadeAlpha;
        r.addPIXIObj(this.sprite, this.layer, this.zIdx, this.zOrd);
    }
}
export class DecalBarn {
    constructor() {
        this._ = new Pool(Decal);
        this.decalRenders = [];
    }

    allocDecalRender() {
        let e = null;
        for (let t = 0; t < this.decalRenders.length; t++) {
            const r = this.decalRenders[t];
            if (!r.active) {
                e = r;
                break;
            }
        }
        if (!e) {
            e = new DecalRender();
            this.decalRenders.push(e);
        }
        return e;
    }

    m(e, t, r) {
        for (let a = this._.p(), i = 0; i < a.length; i++) {
            const o = a[i];
            if (o.active) {
                o.m(e);
            }
        }
        for (let s = 0; s < this.decalRenders.length; s++) {
            const n = this.decalRenders[s];
            if (n.active) {
                n.m(e, t, r);
            }
        }
    }

    render(e, t, r) { }
}

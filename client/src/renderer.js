import * as PIXI from "pixi.js";
import { v2 } from "../../shared/utils/v2";

function s(e, t, r) {
    const a = t - e;
    const i = a * r;
    if (Math.abs(i) < 0.01) {
        return a;
    } else {
        return i;
    }
}
function n() {
    const e = new PIXI.Graphics();
    e.position.set(0, 0);
    e.scale.set(1, 1);
    e.__zOrd = 0;
    e.__zIdx = 0;
    return e;
}
function l(e, t, r, a, i) {
    e.moveTo(t, r);
    e.lineTo(t, r + i);
    e.lineTo(t + a, r + i);
    e.lineTo(t + a, r);
    e.lineTo(t, r);
    e.closePath();
}
export class Renderer {
    constructor(e, t) {
        this.game = e;
        this.canvasMode = t;
        this.zIdx = 0;
        this.layer = 0;
        this.layerAlpha = 0;
        this.groundAlpha = 0;
        this.underground = false;
        this.layers = [];
        for (let r = 0; r < 4; r++) {
            this.layers.push(new RenderGroup(`layer_${r}`));
        }
        this.ground = new PIXI.Graphics();
        this.ground.alpha = 0;
        this.layerMask = n();
        this.debugLayerMask = null;
        this.layerMaskDirty = true;
        this.layerMaskActive = false;
    }

    free() {
        this.layerMask.parent?.removeChild(this.layerMark);
        this.layerMask.destroy(true);
    }

    addPIXIObj(e, t, r, a) {
        if (!e.transform) {
            // const i = new Error();
            // const o = JSON.stringify({
            //     type: "addChild",
            //     stack: i.stack,
            //     browser: navigator.userAgent,
            //     playing: this.game.playing,
            //     gameOver: this.game.gameOver,
            //     spectating: this.game.spectating,
            //     time: this.game.playingTicker,
            //     mode: this.game.teamMode,
            //     video: this.game.adManager.isPlayingVideo,
            //     layer: t,
            //     zOrd: r,
            //     zIdx: a
            // });
            // console.error(o);
        }
        if (e.__layerIdx === undefined) {
            e.__layerIdx = -1;
            e.__zOrd = -1;
            e.__zIdx = -1;
        }
        let s = t;
        if (t & 2) {
            s = r >= 100 ? 3 : 2;
        }
        if (
            e.parent != this.layers[s] ||
            e.__zOrd != r ||
            (a !== undefined && e.__zIdx != a)
        ) {
            e.__layerIdx = s;
            e.__zOrd = r;
            e.__zIdx = a !== undefined ? a : this.zIdx++;
            this.layers[s].addSortedChild(e);
        }
    }

    setActiveLayer(e) {
        this.layer = e;
    }

    setUnderground(e) {
        this.underground = e;
    }

    resize(e, t) {
        const r = e.mapLoaded
            ? e.getMapDef().biome.colors.underground
            : 1772803;
        this.ground.clear();
        this.ground.beginFill(r);
        this.ground.drawRect(0, 0, t.screenWidth, t.screenHeight);
        this.ground.endFill();
        this.layerMaskDirty = true;
    }

    redrawLayerMask(e, t) {
        const r = this.layerMask;
        if (this.canvasMode) {
            r.clear();
            if (this.layerMaskActive) {
                r.beginFill(16777215, 1);
                r.drawRect(0, 0, e.screenWidth, e.screenHeight);
                for (let a = t.lr.p(), i = 0; i < a.length; i++) {
                    const o = a[i];
                    if (o.active) {
                        for (let s = 0; s < o.mask.length; s++) {
                            const n = o.mask[s];
                            const c = v2.mul(
                                v2.sub(n.max, n.min),
                                0.5
                            );
                            const m = v2.add(n.min, c);
                            const p = e.pointToScreen(v2.sub(m, c));
                            const h = e.pointToScreen(v2.add(m, c));
                            r.drawRect(
                                p.x,
                                p.y,
                                h.x - p.x,
                                h.y - p.y
                            );
                        }
                    }
                }
                r.endFill();
            }
        } else {
            if (this.layerMaskDirty) {
                this.layerMaskDirty = false;
                r.clear();
                r.beginFill(16777215, 1);
                l(r, 0, 0, 1024, 1024);
                for (let u = t.lr.p(), g = 0; g < u.length; g++) {
                    const y = u[g];
                    if (y.active) {
                        for (let w = 0; w < y.mask.length; w++) {
                            const f = y.mask[w];
                            const _ = v2.mul(
                                v2.sub(f.max, f.min),
                                0.5
                            );
                            const b = v2.add(f.min, _);
                            const x = b.x - _.x;
                            const S = b.y - _.y;
                            const v = _.x * 2;
                            const k = _.y * 2;
                            r.beginHole();
                            l(r, x, S, v, k);
                            // r.addHole();
                            r.endHole();
                        }
                    }
                }
                r.endFill();
            }
            const z = e.pointToScreen(v2.create(0, 0));
            e.pointToScreen(v2.create(1, 0));
            const I = e.scaleToScreen(1);
            r.position.set(z.x, z.y);
            r.scale.set(I, -I);
        }
    }

    redrawDebugLayerMask(e, t) {
        const r = this.debugLayerMask;
        r.clear();
        r.beginFill(16711935, 1);
        for (let a = t.lr.p(), i = 0; i < a.length; i++) {
            const o = a[i];
            if (o.active) {
                for (let s = 0; s < o.mask.length; s++) {
                    const n = o.mask[s];
                    const c = v2.mul(v2.sub(n.max, n.min), 0.5);
                    const m = v2.add(n.min, c);
                    const p = m.x - c.x;
                    const h = m.y - c.y;
                    const u = c.x * 2;
                    const g = c.y * 2;
                    l(r, p, h, u, g);
                }
            }
        }
        r.endFill();
        const y = e.pointToScreen(v2.create(0, 0));
        e.pointToScreen(v2.create(1, 0));
        const w = e.scaleToScreen(1);
        r.position.set(y.x, y.y);
        r.scale.set(w, -w);
    }

    m(e, t, r, a) {
        const i = this.layer > 0 ? 1 : 0;
        this.layerAlpha += s(this.layerAlpha, i, e * 12);
        const o = this.layer == 1 && this.underground ? 1 : 0;
        this.groundAlpha += s(this.groundAlpha, o, e * 12);
        this.layers[0].alpha = 1;
        this.layers[1].alpha = this.layerAlpha;
        this.layers[2].alpha = 1;
        this.layers[3].alpha = 1;
        this.ground.alpha = this.groundAlpha;
        this.layers[0].visible = this.groundAlpha < 1;
        this.layers[1].visible = this.layerAlpha > 0;
        this.ground.visible = this.groundAlpha > 0;
        this.redrawLayerMask(t, r);
        const n = this.layer == 0;
        if (n && !this.layerMaskActive) {
            this.layers[2].mask = this.layerMask;
            this.layers[2].addChild(this.layerMask);
            this.layerMaskActive = true;
        } else if (!n && this.layerMaskActive) {
            this.layers[2].mask = null;
            this.layers[2].removeChild(this.layerMask);
            this.layerMaskActive = false;
        }
        for (let i = 0; i < this.layers.length; i++) {
            this.layers[i].checkSort();
        }
    }
}

class RenderGroup extends PIXI.Container {
    constructor(e) {
        super();
        this.dirty = true;
        this.debugName = e || "";
    }

    addSortedChild(child) {
        this.addChild(child);
        this.dirty = true;
    }

    checkSort() {
        return (
            !!this.dirty &&
            (this.children.sort((e, t) => {
                if (e.__zOrd == t.__zOrd) {
                    return e.__zIdx - t.__zIdx;
                } else {
                    return e.__zOrd - t.__zOrd;
                }
            }),
            (this.dirty = false),
            true)
        );
    }
}

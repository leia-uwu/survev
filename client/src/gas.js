import * as PIXI from "pixi.js";
import { GameConfig } from "../../shared/gameConfig";
import { math } from "../../shared/utils/math";
import { v2 } from "../../shared/utils/v2";
import helpers from "./helpers";

const gasMode = GameConfig.GasMode;

const p = 100000;
const h = 512;

class GasRenderer {
    constructor(t, r) {
        this.gasColorDOMString = "";
        this.display = null;
        this.canvas = null;
        if (t) {
            this.canvas = document.createElement("canvas");
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.display = new PIXI.Sprite(
                PIXI.Texture.fromCanvas(this.canvas)
            );
            this.gasColorDOMString = helpers.colorToDOMString(r, 0.6);
        } else {
            this.display = new PIXI.Graphics();
            const i = this.display;
            i.clear();
            i.beginFill(r, 0.6);
            i.moveTo(-p, -p);
            i.lineTo(p, -p);
            i.lineTo(p, p);
            i.lineTo(-p, p);
            i.closePath();
            i.beginHole();
            i.moveTo(0, 1);
            for (let s = 1; s < h; s++) {
                const n = s / h;
                const l = Math.sin(Math.PI * 2 * n);
                const c = Math.cos(Math.PI * 2 * n);
                i.lineTo(l, c);
            }
            // i.addHole();
            i.endHole();
            i.closePath();
        }
        this.display.visible = false;
    }

    free() {
        this.display.destroy(true);
    }

    resize() {
        if (this.canvas != null) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.display.texture.update();
        }
    }

    render(e, t, r) {
        if (this.canvas != null) {
            const a = this.canvas;
            const i = a.getContext("2d");
            i.clearRect(0, 0, a.width, a.height);
            i.beginPath();
            i.fillStyle = this.gasColorDOMString;
            i.rect(0, 0, a.width, a.height);
            i.arc(e.x, e.y, t, 0, Math.PI * 2, true);
            i.fill();
        } else {
            const o = v2.copy(e);
            let s = t;
            if (s < 0.1) {
                s = 1;
                o.x += p * 0.5;
            }
            const n = this.display;
            n.position.set(o.x, o.y);
            n.scale.set(s, s);
        }
        this.display.visible = r;
    }
}

class GasSafeZoneRenderer {
    constructor() {
        this.display = new PIXI.Container();
        this.circleGfx = new PIXI.Graphics();
        this.lineGfx = new PIXI.Graphics();
        this.display.addChild(this.circleGfx);
        this.display.addChild(this.lineGfx);
        this.circleGfx.visible = false;
        this.lineGfx.visible = false;
        this.safePos = v2.create(0, 0);
        this.safeRad = 0;
        this.playerPos = v2.create(0, 0);
    }

    render(e, t, r, a, i) {
        this.circleGfx.visible = a;
        this.lineGfx.visible = i;
        if (a || i) {
            const o = !v2.eq(this.safePos, e, 0.0001);
            const s = Math.abs(this.safeRad - t) > 0.0001;
            const n = !v2.eq(this.playerPos, r, 0.0001);
            if (o) {
                this.safePos.x = e.x;
                this.safePos.y = e.y;
            }
            if (s) {
                this.safeRad = t;
            }
            if (n) {
                this.playerPos.x = r.x;
                this.playerPos.y = r.y;
            }
            if (o) {
                this.circleGfx.position.set(
                    this.safePos.x,
                    this.safePos.y
                );
            }
            if (s) {
                this.circleGfx.clear();
                this.circleGfx.lineStyle(1.5, 16777215);
                this.circleGfx.drawCircle(0, 0, t);
            }
            if (o || s || n) {
                const l = v2.length(v2.sub(r, e)) < t;
                const m = l ? 0.5 : 1;
                this.lineGfx.clear();
                this.lineGfx.lineStyle(2, 65280, m);
                this.lineGfx.moveTo(r.x, r.y);
                this.lineGfx.lineTo(e.x, e.y);
            }
        }
    }
}

class Gas {
    constructor(t) {
        const r = (Math.sqrt(2) + 0.01) * 1024;
        this.mode = gasMode.Inactive;
        this.circleT = 0;
        this.duration = 0;
        this.circleOld = {
            pos: v2.create(0, 0),
            rad: r
        };
        this.circleNew = {
            pos: v2.create(0, 0),
            rad: r
        };
        this.gasRenderer = new GasRenderer(t, 16711680);
    }

    free() {
        this.gasRenderer.free();
    }

    resize() {
        this.gasRenderer.resize();
    }

    isActive() {
        return this.mode != gasMode.Inactive;
    }

    getCircle() {
        const e = this.mode == gasMode.Moving ? this.circleT : 0;
        return {
            pos: v2.lerp(
                e,
                this.circleOld.pos,
                this.circleNew.pos
            ),
            rad: math.lerp(
                e,
                this.circleOld.rad,
                this.circleNew.rad
            )
        };
    }

    setProgress(e) {
        this.circleT = e;
    }

    setFullState(e, t, r, a) {
        if (t.mode != this.mode) {
            const i = Math.ceil(t.duration * (1 - e));
            a.setWaitingForPlayers(false);
            a.displayGasAnnouncement(t.mode, i);
        }
        this.mode = t.mode;
        this.duration = t.duration;
        this.circleT = e;
        this.circleOld.pos = v2.copy(t.posOld);
        this.circleOld.rad = t.radOld;
        this.circleNew.pos = v2.copy(t.posNew);
        this.circleNew.rad = t.radNew;
    }

    render(e) {
        const t = this.getCircle();
        const r = e.pointToScreen(t.pos);
        const a = e.scaleToScreen(t.rad);
        this.gasRenderer.render(r, a, this.isActive());
    }
}

export default {
    GasRenderer,
    GasSafeZoneRenderer,
    Gas
};

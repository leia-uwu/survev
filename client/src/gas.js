import * as PIXI from "pixi.js";
import { GameConfig } from "../../shared/gameConfig";
import { math } from "../../shared/utils/math";
import { v2 } from "../../shared/utils/v2";
import helpers from "./helpers";

const gasMode = GameConfig.GasMode;

const overdraw = 100 * 1000;
const segments = 512;

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
            i.moveTo(-overdraw, -overdraw);
            i.lineTo(overdraw, -overdraw);
            i.lineTo(overdraw, overdraw);
            i.lineTo(-overdraw, overdraw);
            i.closePath();
            i.beginHole();
            i.moveTo(0, 1);
            for (let s = 1; s < segments; s++) {
                const n = s / segments;
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

    render(gasPos, gasRad, active) {
        if (this.canvas != null) {
            const canvas = this.canvas;
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.fillStyle = this.gasColorDOMString;
            ctx.rect(0, 0, canvas.width, canvas.height);
            ctx.arc(gasPos.x, gasPos.y, gasRad, 0, Math.PI * 2, true);
            ctx.fill();
        } else {
            const center = v2.copy(gasPos);
            // Once the hole gets small enough, just fill the entire
            // screen with some random part of the geometry
            let rad = gasRad;
            if (rad < 0.1) {
                rad = 1;
                center.x += overdraw * 0.5;
            }
            const ctx = this.display;
            ctx.position.set(center.x, center.y);
            ctx.scale.set(rad, rad);
        }
        this.display.visible = active;
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

    render(safePos, safeRad, playerPos, drawCircle, drawLine) {
        // Render a circle showing the safe zone, and a line pointing from
        // the player to the center. Only update geometry if relevant data
        // has changed.
        this.circleGfx.visible = drawCircle;
        this.lineGfx.visible = drawLine;
        if (drawCircle || drawLine) {
            const safePosChanged = !v2.eq(this.safePos, safePos, 0.0001);
            const safeRadChanged = Math.abs(this.safeRad - safeRad) > 0.0001;
            const playerPosChanged = !v2.eq(this.playerPos, playerPos, 0.0001);

            if (safePosChanged) {
                this.safePos.x = safePos.x;
                this.safePos.y = safePos.y;
            }
            if (safeRadChanged) {
                this.safeRad = safeRad;
            }
            if (playerPosChanged) {
                this.playerPos.x = playerPos.x;
                this.playerPos.y = playerPos.y;
            }

            // Update circle?
            if (safePosChanged) {
                this.circleGfx.position.set(
                    this.safePos.x,
                    this.safePos.y
                );
            }
            if (safeRadChanged) {
                this.circleGfx.clear();
                this.circleGfx.lineStyle(1.5, 16777215);
                is.circleGfx.drawCircle(0, 0, safeRad);
            }
            // Update line?
            if (safePosChanged || safeRadChanged || playerPosChanged) {
                const isSafe = v2.length(v2.sub(playerPos, safePos)) < safeRad;
                const alpha = isSafe ? 0.5 : 1;
                this.lineGfx.clear();
                this.lineGfx.lineStyle(2, 65280, alpha);
                this.lineGfx.moveTo(playerPos.x, playerPos.y);
                this.lineGfx.lineTo(safePos.x, safePos.y);
            }
        }
    }
}

class Gas {
    constructor(t) {
        const startRad = (Math.sqrt(2) + 0.01) * 1024;
        this.mode = gasMode.Inactive;
        this.circleT = 0;
        this.duration = 0;
        this.circleOld = {
            pos: v2.create(0, 0),
            rad: startRad
        };
        this.circleNew = {
            pos: v2.create(0, 0),
            rad: startRad
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
        const t = this.mode == gasMode.Moving ? this.circleT : 0;
        return {
            pos: v2.lerp(
                t,
                this.circleOld.pos,
                this.circleNew.pos
            ),
            rad: math.lerp(
                t,
                this.circleOld.rad,
                this.circleNew.rad
            )
        };
    }

    setProgress(circleT) {
        this.circleT = circleT;
    }

    setFullState(circleT, data, map, ui) {
        // Update Ui
        if (data.mode != this.mode) {
            const timeLeft = Math.ceil(data.duration * (1 - circleT));
            ui.setWaitingForPlayers(false);
            ui.displayGasAnnouncement(data.mode, timeLeft);
        }

        // Update state
        this.mode = data.mode;
        this.duration = data.duration;
        this.circleT = circleT;

        // Update circles
        this.circleOld.pos = v2.copy(data.posOld);
        this.circleOld.rad = data.radOld;
        this.circleNew.pos = v2.copy(data.posNew);
        this.circleNew.rad = data.radNew;
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

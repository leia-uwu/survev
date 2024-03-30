import * as PIXI from "pixi.js-legacy";
import { math } from "../../../shared/utils/math";
import { device } from "../device";

const fontWidth = 24;

export class PieTimer {
    constructor() {
        this.container = new PIXI.Container();
        this.container.visible = false;
        this.timerBackground = PIXI.Sprite.from(
            "timer-background.img"
        );
        this.timerBackground.anchor.set(0.5, 0.5);
        this.timerBackground.scale.set(1, 1);
        this.container.addChild(this.timerBackground);
        this.gfx = new PIXI.Graphics();
        this.container.addChild(this.gfx);
        this.counterText = new PIXI.Text();
        this.counterText.anchor.set(0.5, 0.5);
        this.counterText.style = {
            fontFamily: "Roboto Condensed, Arial, sans-serif",
            fontWeight: "bold",
            fontSize: fontWidth,
            align: "center",
            fill: 16777215,
            stroke: 0,
            strokeThickness: 3
        };
        this.container.addChild(this.counterText);
        this.labelText = new PIXI.Text();
        this.labelText.anchor.set(0.5, 0.5);
        this.labelText.style = {
            fontFamily: "Roboto Condensed, Arial, sans-serif",
            fontWeight: "100",
            fontSize: fontWidth,
            align: "center",
            fill: 16777215
        };
        this.container.addChild(this.labelText);
        this.screenScaleFactor = 1;
        this.mobileOffset = 0;
        this.active = false;
        this.label = "";
        this.elapsed = 0;
        this.duration = 0;
    }

    destroy() {
        // Don't destroy the texture being used by timerBackground
        this.container.removeChild(this.timerBackground);
        this.timerBackground.destroy({
            children: true
        });
        this.container.destroy({
            children: true,
            texture: true
        });
    }

    start(label, elapsed, duration) {
        this.active = true;
        this.label = label;
        this.elapsed = elapsed;
        this.duration = duration;
    }

    stop() {
        this.active = false;
    }

    /**
    * @param {import("./touch").Touch} touch
    * @param {number} screenScaleFactor
    */
    resize(touch, screenScaleFactor) {
        this.screenScaleFactor = screenScaleFactor;

        if (device.uiLayout == device.UiLayout.Sm) {
            if (!device.tablet) {
                this.container.scale.set(0.5, 0.5);
            }
            this.mobileOffset = device.isLandscape
                ? touch.mobileOffsetLandscape
                : touch.mobileOffsetPortrait;
        } else {
            this.container.scale.set(1, 1);
            this.mobileOffset = 0;
        }
    }

    /**
    * @param {number} dt
    * @param {import("../camera").Camera} camera
    */
    update(dt, camera) {
        if (!this.active) {
            this.container.visible = false;
            return;
        }

        this.elapsed = math.min(this.elapsed + dt, this.duration);

        const labelWidth = 56 + this.label.length * fontWidth * 0.45;
        const labelHeight = fontWidth * 1.5;
        const rectX = 0 - labelWidth / 2;
        const rectY = 87.5 - labelHeight / 2;
        const l =
            math.min(this.elapsed / this.duration, 1) * Math.PI * 2 -
            Math.PI * 0.5;
        this.gfx.clear();
        this.gfx.beginFill(0, 0.5);
        this.gfx.drawRoundedRect(rectX, rectY, labelWidth, labelHeight, 5);
        this.gfx.endFill();
        this.gfx.lineStyle(6, 16777215);
        this.gfx.arc(0, 0, 35, -Math.PI * 0.5, l, false);
        this.counterText.text = math
            .max(0, this.duration - this.elapsed)
            .toFixed(1);
        this.labelText.position.y = 87.5;
        this.labelText.text = this.label;
        this.container.position.set(
            camera.screenWidth / 2,
            (camera.screenHeight / 3) * this.screenScaleFactor +
            this.mobileOffset
        );
        this.container.visible = true;
    }
}

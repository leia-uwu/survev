import { math } from "../../shared/utils/math";
import { v2 } from "../../shared/utils/v2";

export class Camera {
    constructor() {
        this.I = 0;
        this.pos = v2.create(0, 0);
        this.ppu = 16;
        this.zoom = 1.5;
        this.targetZoom = 1.5;
        this.screenWidth = 1;
        this.screenHeight = 1;
        this.shakeEnabled = true;
        this.shakeInt = 0;
    }

    z() {
        return this.ppu * this.zoom;
    }

    pointToScreen(point) {
        return {
            x:
                this.screenWidth * 0.5 +
                (point.x - this.pos.x) * this.z(),
            y:
                this.screenHeight * 0.5 -
                (point.y - this.pos.y) * this.z()
        };
    }

    screenToPoint(screen) {
        return {
            x:
                this.pos.x +
                (screen.x - this.screenWidth * 0.5) / this.z(),
            y:
                this.pos.y +
                (this.screenHeight * 0.5 - screen.y) / this.z()
        };
    }

    pixels(p) {
        return p * this.zoom;
    }

    scaleToScreen(s) {
        return s * this.z();
    }

    setShakeEnabled(en) {
        this.shakeEnabled = en;
    }

    addShake(pos, intensity) {
        const dist = v2.length(v2.sub(this.pos, pos));
        const newInt = math.delerp(dist, 40, 10) * intensity;
        this.shakeInt = Math.max(this.shakeInt, newInt);
    }

    applyShake() {
        if (this.shakeEnabled) {
            this.pos = v2.add(
                this.pos,
                v2.mul(v2.randomUnit(), this.shakeInt)
            );
        }
        this.shakeInt = 0;
    }
}

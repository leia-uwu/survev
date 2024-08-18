import { math } from "../../shared/utils/math";
import { type Vec2, v2 } from "../../shared/utils/v2";

export default class Camera {
    pos = v2.create(0, 0);
    ppu = 16;
    zoom = 1.5;
    targetZoom = 1.5;
    screenWidth = 1;
    screenHeight = 1;
    shakeEnabled = true;
    shakeInt = 0;

    z() {
        return this.ppu * this.zoom;
    }

    pointToScreen(point: Vec2) {
        return {
            x: this.screenWidth * 0.5 + (point.x - this.pos.x) * this.z(),
            y: this.screenHeight * 0.5 - (point.y - this.pos.y) * this.z(),
        };
    }

    screenToPoint(screen: Vec2) {
        return {
            x: this.pos.x + (screen.x - this.screenWidth * 0.5) / this.z(),
            y: this.pos.y + (this.screenHeight * 0.5 - screen.y) / this.z(),
        };
    }

    pixels(p: number) {
        return p * this.zoom;
    }

    scaleToScreen(s: number) {
        return s * this.z();
    }

    setShakeEnabled(en: boolean) {
        this.shakeEnabled = en;
    }

    addShake(pos: Vec2, intensity: number) {
        const dist = v2.length(v2.sub(this.pos, pos));
        const newInt = math.delerp(dist, 40, 10) * intensity;
        this.shakeInt = Math.max(this.shakeInt, newInt);
    }

    applyShake() {
        if (this.shakeEnabled) {
            this.pos = v2.add(this.pos, v2.mul(v2.randomUnit(), this.shakeInt));
        }
        this.shakeInt = 0;
    }
}
export { Camera };

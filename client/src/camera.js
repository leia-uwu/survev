import { math } from "../../shared/utils/math";
import { v2 } from "../../shared/utils/v2";

export default function Camera() {
    this.I = 0;
    this.pos = v2.create(0, 0);
    this.ppu = 16;
    this.O = 1.5;
    this.q = 1.5;
    this.screenWidth = 1;
    this.screenHeight = 1;
    this.shakeEnabled = true;
    this.shakeInt = 0;
}

Camera.prototype = {
    z: function() {
        return this.ppu * this.O;
    },
    pointToScreen: function(e) {
        return {
            x:
                this.screenWidth * 0.5 +
                (e.x - this.pos.x) * this.z(),
            y:
                this.screenHeight * 0.5 -
                (e.y - this.pos.y) * this.z()
        };
    },
    j: function(e) {
        return {
            x:
                this.pos.x +
                (e.x - this.screenWidth * 0.5) / this.z(),
            y:
                this.pos.y +
                (this.screenHeight * 0.5 - e.y) / this.z()
        };
    },
    pixels: function(e) {
        return e * this.O;
    },
    scaleToScreen: function(e) {
        return e * this.z();
    },
    setShakeEnabled: function(e) {
        this.shakeEnabled = e;
    },
    addShake: function(e, t) {
        const r = v2.length(v2.sub(this.pos, e));
        const a = math.delerp(r, 40, 10) * t;
        this.shakeInt = Math.max(this.shakeInt, a);
    },
    applyShake: function() {
        if (this.shakeEnabled) {
            this.pos = v2.add(
                this.pos,
                v2.mul(v2.randomUnit(), this.shakeInt)
            );
        }
        this.shakeInt = 0;
    }
};

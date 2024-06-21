import * as PIXI from "pixi.js-legacy";
import { collider } from "../../../shared/utils/collider";
import { util } from "../../../shared/utils/util";
import { v2 } from "../../../shared/utils/v2";
import { device } from "../device";
import { Pool } from "./objectPool";

function createDeadBodyText() {
    const nameStyle = {
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
    const nameText = new PIXI.Text("", nameStyle);
    nameText.anchor.set(0.5, 0.5);
    nameText.scale.set(0.5, 0.5);
    return nameText;
}

class DeadBody {
    constructor() {
        this.active = false;
        this.pos = v2.create(0, 0);
        this.container = new PIXI.Container();
        this.sprite = PIXI.Sprite.from("skull.img");
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.scale.set(0.4, 0.4);
        this.sprite.tint = 5921370;
        this.container.addChild(this.sprite);
        this.nameText = createDeadBodyText();
        this.nameText.anchor.set(0.5, -1);
        this.nameText.tint = util.rgbToInt(util.hsvToRgb(0, 0, 0.5));
        this.container.addChild(this.nameText);
        this.container.visible = this.sprite;
    }

    init() { }
    free() {
        this.container.visible = false;
    }

    updateData(data, fullUpdate, isNew, ctx) {
        this.pos = v2.copy(data.pos);
        if (fullUpdate) {
            this.layer = data.layer;
            this.playerId = data.playerId;
        }
        if (isNew) {
            this.nameTextSet = false;
            this.container.visible = true;
        }
    }
}

export class DeadBodyBarn {
    constructor() {
        this.deadBodyPool = new Pool(DeadBody);
    }

    update(dt, playerBarn, activePlayer, map, camera, renderer) {
        const deadBodies = this.deadBodyPool.getPool();
        for (let i = 0; i < deadBodies.length; i++) {
            const d = deadBodies[i];
            if (d.active) {
                if (!d.nameTextSet) {
                    d.nameText.text = playerBarn.getPlayerName(
                        d.playerId,
                        activePlayer.__id,
                        false
                    );
                    d.nameTextSet = true;
                }
                const col = collider.createCircle(d.pos, 1);
                const onStairs = map.insideStructureStairs(col);

                let layer = d.layer;
                let zOrd = 12;
                if (d.layer == 0 && activePlayer.layer == 0 && onStairs) {
                    layer |= 2;
                    zOrd += 100;
                }

                renderer.addPIXIObj(d.container, layer, zOrd, d.__id);

                const screenPos = camera.pointToScreen(d.pos);
                const screenScale = camera.pixels(1);
                d.container.position.set(screenPos.x, screenPos.y);
                d.container.scale.set(screenScale, screenScale);
            }
        }
    }

    getDeadBodyById(playerId) {
        const deadBodies = this.deadBodyPool.getPool();
        for (let i = 0; i < deadBodies.length; i++) {
            const d = deadBodies[i];
            if (d.active && d.playerId == playerId) {
                return d;
            }
        }
        return null;
    }
}

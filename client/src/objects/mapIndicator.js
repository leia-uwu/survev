import * as PIXI from "pixi.js-legacy";
import { v2 } from "../../../shared/utils/v2";
import { device } from "../device";
import { math } from "../../../shared/utils/math";
import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";

export class MapIndicatorBarn {
    constructor(e) {
        this.ht = e;
        this.dt = [];
        this.idToMapIdicator = {};
    }

    Ne(indicatorData) {
        for (let i = 0; i < indicatorData.length; i++) {
            const data = indicatorData[i];
            if (data.dead) {
                this.gt(data.id);
            } else {
                this.yt(data);
            }
        }
    }

    wt(data) {
        const indicator = {
            id: data.id,
            type: data.type,
            pos: v2.copy(data.pos),
            equipped: data.equipped,
            mapSprite: this.ht.addSprite(),
            pulseSprite: this.ht.addSprite(),
            pulseScale: 0.5,
            pulseScaleMin: 0.5,
            pulseScaleMax: 1,
            pulseTicker: 0,
            pulseDir: 1,
            pulseSpeed: 0.3
        };
        this.dt.push(indicator);
        this.idToMapIdicator[data.id] = indicator;
        return indicator;
    }

    gt(id) {
        for (let i = 0; i < this.dt.length; i++) {
            const indicator = this.dt[i];
            if (indicator.id == id) {
                indicator.mapSprite.free();
                indicator.pulseSprite.free();
                this.dt.splice(i, 1);
                delete this.idToMapIdicator[id];
                break;
            }
        }
    }

    yt(data) {
        let indicator = this.idToMapIdicator[data.id];
        indicator ||= this.wt(data);

        indicator.pos = v2.copy(data.pos);
        indicator.equipped = data.equipped;

        const objDef = GameObjectDefs[indicator.type];
        const scale = (device.uiLayout == device.UiLayout.Sm ? 0.15 : 0.2) * 1.25;
        const zOrder = indicator.equipped ? 655350 : 1;

        const mapSprite = indicator.mapSprite;
        mapSprite.pos = v2.copy(indicator.pos);
        mapSprite.scale = scale;
        mapSprite.alpha = 1;
        mapSprite.zOrder = zOrder;
        mapSprite.visible = true;
        mapSprite.sprite.texture = PIXI.Texture.from(
            objDef.mapIndicator.sprite
        );

        mapSprite.sprite.tint = objDef.mapIndicator.tint;
        if (objDef.mapIndicator.pulse) {
            const m = indicator.pulseSprite;
            m.pos = v2.copy(indicator.pos);
            m.scale = 1;
            m.zOrder = zOrder - 1;
            m.visible = true;
            m.sprite.texture =
                PIXI.Texture.from("part-pulse-01.img");
            m.sprite.tint = objDef.mapIndicator.pulseTint;
        }
    }

    Ee(dt) {
        for (let i = 0; i < this.dt.length; i++) {
            const indicator = this.dt[i];
            indicator.pulseTicker = math.clamp(
                indicator.pulseTicker + dt * indicator.pulseDir * indicator.pulseSpeed,
                indicator.pulseScaleMin,
                1
            );

            // Ease up and down
            indicator.pulseScale = indicator.pulseTicker * indicator.pulseScaleMax;
            if (
                indicator.pulseScale >= indicator.pulseScaleMax ||
                indicator.pulseTicker <= indicator.pulseScaleMin
            ) {
                indicator.pulseDir *= -1;
            }
            indicator.pulseSprite.scale = indicator.pulseScale;
            indicator.pulseSprite.visible = indicator.equipped;
        }
    }
}

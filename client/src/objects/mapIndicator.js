import * as PIXI from "pixi.js-legacy";
import { v2 } from "../../../shared/utils/v2";
import { device } from "../device";
import { math } from "../../../shared/utils/math";
import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";

export class MapIndicatorBarn {
    /**
     * @param {import("./mapSprite").MapSpriteBarn} mapSpriteBarn
     */
    constructor(mapSpriteBarn) {
        this.mapSpriteBarn = mapSpriteBarn;
        this.mapIndicators = [];
        this.idToMapIdicator = {};
    }

    updateIndicatorData(indicatorData) {
        for (let i = 0; i < indicatorData.length; i++) {
            const data = indicatorData[i];
            if (data.dead) {
                this.removeIndicator(data.id);
            } else {
                this.updateIndicator(data);
            }
        }
    }

    addIndicator(data) {
        const indicator = {
            id: data.id,
            type: data.type,
            pos: v2.copy(data.pos),
            equipped: data.equipped,
            mapSprite: this.mapSpriteBarn.addSprite(),
            pulseSprite: this.mapSpriteBarn.addSprite(),
            pulseScale: 0.5,
            pulseScaleMin: 0.5,
            pulseScaleMax: 1,
            pulseTicker: 0,
            pulseDir: 1,
            pulseSpeed: 0.3
        };
        this.mapIndicators.push(indicator);
        this.idToMapIdicator[data.id] = indicator;
        return indicator;
    }

    removeIndicator(id) {
        for (let i = 0; i < this.mapIndicators.length; i++) {
            const indicator = this.mapIndicators[i];
            if (indicator.id == id) {
                indicator.mapSprite.free();
                indicator.pulseSprite.free();
                this.mapIndicators.splice(i, 1);
                delete this.idToMapIdicator[id];
                break;
            }
        }
    }

    updateIndicator(data) {
        let indicator = this.idToMapIdicator[data.id];
        indicator ||= this.addIndicator(data);

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
            const pulseSprite = indicator.pulseSprite;
            pulseSprite.pos = v2.copy(indicator.pos);
            pulseSprite.scale = 1;
            pulseSprite.zOrder = zOrder - 1;
            pulseSprite.visible = true;
            pulseSprite.sprite.texture =
                PIXI.Texture.from("part-pulse-01.img");
            pulseSprite.sprite.tint = objDef.mapIndicator.pulseTint;
        }
    }

    updateIndicatorPulses(dt) {
        for (let i = 0; i < this.mapIndicators.length; i++) {
            const indicator = this.mapIndicators[i];
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

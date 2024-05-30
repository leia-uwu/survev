import * as PIXI from "pixi.js-legacy";
import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";
import { GameConfig } from "../../../shared/gameConfig";
import { math } from "../../../shared/utils/math";
import { util } from "../../../shared/utils/util";
import { Vec2, v2 } from "../../../shared/utils/v2";
import { AudioManager } from "../audioManager";
import { Camera } from "../camera";
import { device } from "../device";
import { Map } from "../map";
import { Pool } from "./objectPool";
import { AbstractObject, Player } from "./player";
import { Emitter, ParticleBarn } from "./particles";
import { AmmoDef, LootDef, XPDef } from "../../../shared/defs/objectsTypings";
import { Renderer } from "../renderer";
import { ObjectData, ObjectType, ObjectsFullData, ObjectsPartialData } from "../../../shared/utils/objectSerializeFns";

export class Loot extends AbstractObject {
    __id!: number;
    __type!: ObjectType.Loot;
    active!: boolean;

    ticker = 0;
    playDropSfx = false;
    container = new PIXI.Sprite();
    sprite = new PIXI.Sprite();
    emitter: Emitter | null = null;

    updatedData!: boolean;
    pos!: Vec2;
    isOld!: boolean;

    layer!: number;
    type!: string;
    count!: number;
    isPreloadedGun!: boolean;
    ownerId!: number;
    rad!: number;
    imgScale!: number;

    
    constructor() {
        super();
        this.container.anchor.set(0.5, 0.5);
        this.container.scale.set(1, 1);
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.scale.set(0.8, 0.8);
        this.container.addChild(this.sprite);
    }

    init() {
        this.updatedData = false;
    }

    free() {
        this.container.visible = false;
        if (this.emitter) {
            this.emitter.stop();
            this.emitter = null;
        }
    }

    updateData(data: ObjectData<ObjectType.Loot>, fullUpdate: boolean, isNew: boolean, ctx: {
        map: Map;
        renderer: Renderer;
        particleBarn: ParticleBarn;
    }) {
        this.updatedData = true;
        this.pos = v2.copy(data.pos);

        if (fullUpdate) {
            this.layer = data.layer;
            this.type = data.type;
            this.count = data.count;
            this.isOld = data.isOld;
            this.isPreloadedGun = data.isPreloadedGun;
            this.ownerId = data.hasOwner ? data.ownerId : 0;
        }

        if (isNew) {
            const itemDef = GameObjectDefs[this.type] as LootDef;
            this.ticker = 0;

            // Don't play the pop-in effect if this is an old piece of loot
            if (this.isOld) {
                this.ticker = 10;
            }

            if (
                !this.isOld &&
                itemDef.sound.drop &&
                ctx.map.lootDropSfxIds.indexOf(this.__id) == -1
            ) {
                this.playDropSfx = true;
            }

            this.rad = GameConfig.lootRadius[itemDef.type as keyof typeof GameConfig.lootRadius];
            this.imgScale = itemDef.lootImg?.scale! * 1.25; 

            // @ts-expect-error innerScale not used?
            const innerScale = itemDef.lootImg.innerScale || 0.8;
            this.sprite.scale.set(innerScale, innerScale);
            this.sprite.texture = PIXI.Texture.from(
                itemDef.lootImg?.sprite!
            );
            this.sprite.tint = itemDef.lootImg?.tint!;
            this.container.texture = itemDef.lootImg.border
                ? PIXI.Texture.from(itemDef.lootImg.border)
                : PIXI.Texture.EMPTY;
            if (this.isPreloadedGun) {
                this.container.texture = PIXI.Texture.from(
                    "loot-circle-outer-06.img"
                );
            }
            const ammo = GameObjectDefs[itemDef.ammo] as AmmoDef;
            if (ammo) {
                this.container.tint = ammo.lootImg.tintDark;
            } else if (itemDef.lootImg.borderTint) {
                this.container.tint = itemDef.lootImg.borderTint;
            } else {
                this.container.tint = 0;
            }

            if (itemDef.type == "xp" && (itemDef as XPDef).emitter) {
                this.emitter = ctx.particleBarn.addEmitter(
                    (itemDef as XPDef).emitter,
                    {
                        pos: this.pos,
                        layer: this.layer
                    }
                );
            }

            this.sprite.rotation = itemDef?.lootImg?.rot
                ? itemDef.lootImg.rot
                : 0;
            this.sprite.scale.x = itemDef.lootImg.mirror ? -innerScale : innerScale;

            this.container.visible = true;
        }

        if (isNew || fullUpdate) {
            // Loot can change layers during a fullUpdate.
            // Should probably just readd it every frame.
            ctx.renderer.addPIXIObj(
                this.container,
                this.layer,
                13,
                this.__id
            );
        }
    }
}

export class LootBarn {
    lootPool = new Pool(Loot);
    closestLoot: Loot | null = null;
    
    constructor() {
    }

    update(dt: number, activePlayer: Player, map: Map, audioManager: AudioManager, camera: Camera, debug: unknown) {
        this.closestLoot = null;
        let closestDist = Number.MAX_VALUE;
        const loots = this.lootPool.getPool();
        for (let i = 0; i < loots.length; i++) {

            const loot = loots[i];
            if (loot.active) {
                if (
                    util.sameLayer(loot.layer, activePlayer.layer) &&
                    !activePlayer.netData.dead &&
                    (loot.ownerId == 0 || loot.ownerId == activePlayer.__id)
                ) {
                    const pos = loot.pos;
                    const rad = device.touch
                        ? activePlayer.rad + loot.rad * GameConfig.player.touchLootRadMult
                        : loot.rad;
                    const toPlayer = v2.sub(activePlayer.pos, pos);
                    const distSq = v2.lengthSqr(toPlayer);
                    if (distSq < rad * rad && distSq < closestDist) {
                        closestDist = distSq;
                        this.closestLoot = loot;
                    }
                }

                loot.ticker += dt;

                // Drop sound
                if (loot.playDropSfx) {
                    map.lootDropSfxIds.push(loot.__id);
                    loot.playDropSfx = false;
                    const itemDef = GameObjectDefs[loot.type] as LootDef;
                    audioManager.playSound(itemDef.sound?.drop, {
                        channel: "sfx",
                        soundPos: loot.pos,
                        layer: loot.layer,
                        filter: "muffled"
                    });
                }

                // Passive particle effect
                if (loot.emitter) {
                    loot.emitter.pos = v2.add(loot.pos, v2.create(0, 0.1));
                    loot.emitter.layer = loot.layer;
                }

                const scaleIn = math.delerp(loot.ticker, 0, 1);
                const scale = math.easeOutElastic(scaleIn, 0.75);
                const screenPos = camera.pointToScreen(loot.pos);
                const screenScale = camera.pixels(loot.imgScale * scale);

                loot.container.position.set(screenPos.x, screenPos.y);
                loot.container.scale.set(screenScale, screenScale);
            }
        }
    }

    getClosestLoot() {
        return this.closestLoot;
    }
}

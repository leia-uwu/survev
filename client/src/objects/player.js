import * as PIXI from "pixi.js-legacy";
import { GameConfig } from "../../../shared/gameConfig";
import { util } from "../../../shared/utils/util";
import { v2 } from "../../../shared/utils/v2";
import { math } from "../../../shared/utils/math";
import { coldet } from "../../../shared/utils/coldet";
import { collider } from "../../../shared/utils/collider";
import { collisionHelpers } from "../../../shared/utils/collisionHelpers";
import { device } from "../device";
import { helpers } from "../helpers";
import { Pool } from "./objectPool";
import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";
import { MapObjectDefs } from "../../../shared/defs/mapObjectDefs";
import animData from "../animData";
import { createCasingParticle } from "./shot";
import { getPlayerStatusUpdateRate } from "../../../shared/msgs/updateMsg";
import { debugLines } from "../debugLines";

const Action = GameConfig.Action;
const Anim = GameConfig.Anim;
const Input = GameConfig.Input;
const HasteType = GameConfig.HasteType;

const submergeMaskScaleFactor = 0.1;

function perksEqual(a, b) {
    if (a.length != b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i].type != b[i].type) {
            return false;
        }
    }
    return true;
}
function createPlayerNameText() {
    const nameStyle = {
        fontFamily: "Arial",
        fontWeight: "bold",
        fontSize: device.pixelRatio > 1 ? 30 : 22,
        align: "center",
        fill: 65535,
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
    nameText.position.set(0, 30);
    nameText.visible = false;
    return nameText;
}

function createSprite() {
    const sprite = new PIXI.Sprite();
    sprite.texture = PIXI.Texture.EMPTY;
    sprite.anchor.set(0.5, 0.5);
    sprite.scale.set(1, 1);
    sprite.tint = 16777215;
    sprite.visible = false;
    return sprite;
}

const Pose = animData.Pose;
const Bones = animData.Bones;

const desktopZoomRads = [];
const mobileZoomRads = [];
const scopeKeys = Object.keys(GameConfig.scopeZoomRadius.mobile);

for (
    let i = 0;
    i < scopeKeys.length;
    i++
) {
    const key = scopeKeys[i];
    desktopZoomRads.push(GameConfig.scopeZoomRadius.desktop[key]);
    mobileZoomRads.push(GameConfig.scopeZoomRadius.mobile[key]);
}

class Gun {
    constructor() {
        this.gunBarrel = createSprite();
        this.gunMag = createSprite();

        this.container = new PIXI.Container();
        this.container.addChild(this.gunBarrel);
        this.container.addChild(this.gunMag);
        this.container.rotation = Math.PI * 0.5;
        this.container.visible = false;

        this.magTop = false;
    }

    setVisible(vis) {
        this.container.visible = vis;
    }

    setType(type, t) {
        const gunDef = GameObjectDefs[type];
        const imgDef = gunDef.worldImg;
        this.gunBarrel.texture = PIXI.Texture.from(
            imgDef.sprite
        );
        this.gunBarrel.anchor.set(0.5, 1);
        this.gunBarrel.position.set(0, 0);
        this.gunBarrel.scale.set(
            (imgDef.scale.x * 0.5) / t,
            (imgDef.scale.y * 0.5) / t
        );

        this.gunBarrel.tint = imgDef.tint;
        this.gunBarrel.visible = true;
        if (imgDef.magImg) {
            const magDef = imgDef.magImg;
            this.gunMag.texture = PIXI.Texture.from(
                magDef.sprite
            );
            this.gunMag.anchor.set(0.5, 0.5);
            this.gunMag.position.set(
                magDef.pos.x / t,
                magDef.pos.y / t
            );
            this.gunMag.scale.set(0.25 / t, 0.25 / t);
            this.gunMag.tint = 16777215;
            this.gunMag.visible = true;
            if (magDef.top) {
                this.container.addChild(this.gunMag);
            } else {
                this.container.addChildAt(this.gunMag, 0);
            }
        } else {
            this.gunMag.visible = false;
        }

        this.magTop = imgDef.magImg?.top;

        const handOffset = gunDef.isDual
            ? v2.create(-5.95, 0)
            : v2.create(-4.25, -1.75);
        if (imgDef.gunOffset) {
            handOffset.x += imgDef.gunOffset.x;
            handOffset.y += imgDef.gunOffset.y;
        }
        this.container.position.set(handOffset.x, handOffset.y);
    }
}

export class Player {
    constructor() {
        this.bodySprite = createSprite();
        this.chestSprite = createSprite();
        this.flakSprite = createSprite();
        this.steelskinSprite = createSprite();
        this.helmetSprite = createSprite();
        this.visorSprite = createSprite();
        this.backpackSprite = createSprite();
        this.handLSprite = createSprite();
        this.handRSprite = createSprite();
        this.footLSprite = createSprite();
        this.footRSprite = createSprite();
        this.hipSprite = createSprite();
        this.gunLSprites = new Gun();
        this.gunRSprites = new Gun();
        this.objectLSprite = createSprite();
        this.objectRSprite = createSprite();
        this.meleeSprite = createSprite();
        this.bodySubmergeSprite = createSprite();
        this.handLSubmergeSprite = createSprite();
        this.handRSubmergeSprite = createSprite();
        this.footLSubmergeSprite = createSprite();
        this.footRSubmergeSprite = createSprite();
        this.bodyEffectSprite = createSprite();
        this.patchSprite = createSprite();
        this.bodySprite.addChild(this.bodySubmergeSprite);
        this.handLSprite.addChild(this.handLSubmergeSprite);
        this.handRSprite.addChild(this.handRSubmergeSprite);
        this.footLSprite.addChild(this.footLSubmergeSprite);
        this.footRSprite.addChild(this.footRSubmergeSprite);
        this.handLContainer = new PIXI.Container();
        this.handLContainer.addChild(this.gunLSprites.container);
        this.handLContainer.addChild(this.handLSprite);
        this.handLContainer.addChild(this.objectLSprite);
        this.handRContainer = new PIXI.Container();
        this.handRContainer.addChild(this.gunRSprites.container);
        this.handRContainer.addChild(this.meleeSprite);
        this.handRContainer.addChild(this.handRSprite);
        this.handRContainer.addChild(this.objectRSprite);
        this.footLContainer = new PIXI.Container();
        this.footLContainer.addChild(this.footLSprite);
        this.footRContainer = new PIXI.Container();
        this.footRContainer.addChild(this.footRSprite);

        this.bodyContainer = new PIXI.Container();
        this.bodyContainer.addChild(this.footLContainer);
        this.bodyContainer.addChild(this.footRContainer);
        this.bodyContainer.addChild(this.backpackSprite);
        this.bodyContainer.addChild(this.bodySprite);
        this.bodyContainer.addChild(this.chestSprite);
        this.bodyContainer.addChild(this.flakSprite);
        this.bodyContainer.addChild(this.steelskinSprite);
        this.bodyContainer.addChild(this.hipSprite);
        this.bodyContainer.addChild(this.patchSprite);
        this.bodyContainer.addChild(this.bodyEffectSprite);
        this.bodyContainer.addChild(this.handLContainer);
        this.bodyContainer.addChild(this.handRContainer);
        this.bodyContainer.addChild(this.visorSprite);
        this.bodyContainer.addChild(this.helmetSprite);

        this.container = new PIXI.Container();
        this.container.addChild(this.bodyContainer);

        this.nameText = createPlayerNameText();
        this.container.addChild(this.nameText);

        this.auraContainer = new PIXI.Container();
        this.auraCircle = createSprite();
        this.auraContainer.addChild(this.auraCircle);

        this.initSubmergeSprites();

        // Anim
        this.bones = [];
        this.anim = {
            type: Anim.None,
            data: {},
            seq: -1,
            ticker: 0,
            bones: []
        };

        const boneCount = Object.keys(Bones).length;
        for (let i = 0; i < boneCount; i++) {
            this.bones.push(new Pose());
            this.anim.bones.push({
                weight: 0,
                pose: new Pose()
            });
        }

        this.perks = [];
        // Maintain a list of just the perk types as a hasPerk() optimization
        this.perkTypes = [];
        this.perksDirty = false;
        this.surface = null;
        this.wasInWater = false;
        this.weapTypeOld = "";
        this.visualsDirty = false;
        this.stepDistance = 0;
        this.zoomFast = false;
        this.playedDryFire = false;
        this.lastSwapIdx = -1;
        this.hasteSeq = -1;
        this.cycleSoundInstance = null;
        this.actionSoundInstance = null;
        this.useItemEmitter = null;
        this.hasteEmitter = null;
        this.passiveHealEmitter = null;
        this.downed = false;
        this.wasDowned = false;
        this.bleedTicker = 0;
        this.submersion = 0;
        this.gunRecoilL = 0;
        this.gunRecoilR = 0;
        this.fireDelay = 0;

        this.throwableState = "equip";
        this.throwableStatePrev = this.throwableState;
        this.lastThrowablePickupSfxTicker = 0;

        this.isNearDoorError = false;
        this.doorErrorTicker = 0;
        this.noCeilingRevealTicker = 0;
        this.frozenTicker = 0;
        this.updateFrozenImage = true;

        this.viewAabb = {
            min: v2.create(0, 0),
            max: v2.create(0, 0)
        };

        this.auraViewFade = 0;
        this.auraPulseTicker = 0;
        this.auraPulseDir = 1;

        this.renderLayer = 0;
        this.renderZOrd = 18;
        this.renderZIdx = 0;

        // Anti-cheat
        this.I = 0;
        this.Br = 0;

        this.action = {};
        this.netData = {};
        this.localData = {};

        this.rad = GameConfig.player.radius;
        this.bodyRad = this.rad;
        this.pos = v2.create(0, 0);
        this.posOld = v2.create(0, 0);
        this.dir = v2.create(1, 0);
        this.dirOld = v2.create(1, 0);
        this.layer = 0;
        this.isLoadoutAvatar = false;
        this.playActionStartSfx = true;
    }

    init() {
        this.isNew = false;
        this.wasInsideObstacle = false;
        this.insideObstacleType = "";
        this.lastInsideObstacleTime = 0;
        this.lastSwapIdx = -1;
        this.hasteSeq = -1;
        this.actionSoundInstance = null;

        this.action = {
            type: Action.None,
            seq: -1,
            seqOld: -1,
            item: "",
            skin: "",
            targetId: 0,
            time: 0,
            duration: 0,
            throttleCount: 0,
            throttleTicker: 0
        };

        this.playAnim(Anim.None, -1);
        this.netData = {
            pos: v2.create(0, 0),
            dir: v2.create(1, 0),
            outfit: "",
            backpack: "",
            helmet: "",
            chest: "",
            activeWeapon: "",
            layer: 0,
            dead: false,
            downed: false,
            animType: 0,
            animSeq: 0,
            actionType: 0,
            actionSeq: 0,
            wearingPan: false,
            healEffect: false,
            frozen: false,
            frozenOri: 0,
            hasteType: 0,
            hasteSeq: 0,
            actionItem: "",
            scale: 1,
            role: "",
            Me: []
        };
        this.localData = {
            health: GameConfig.player.health ?? 100,
            zoom: 0,
            boost: 0,
            scope: "",
            curWeapIdx: 0,
            inventory: {},
            weapons: [],
            spectatorCount: 0
        };
    }

    free() {
        this.container.visible = false;
        this.auraContainer.visible = false;
        if (this.useItemEmitter) {
            this.useItemEmitter.stop();
            this.useItemEmitter = null;
        }
        if (this.hasteEmitter) {
            this.hasteEmitter.stop();
            this.hasteEmitter = null;
        }
        if (this.passiveHealEmitter) {
            this.passiveHealEmitter.stop();
            this.passiveHealEmitter = null;
        }
    }

    updateData(data, fullUpdate, isNew, ctx) {
        this.netData.pos = v2.copy(data.pos);
        this.netData.dir = v2.copy(data.dir);

        if (fullUpdate) {
            this.netData.outfit = data.outfit;
            this.netData.backpack = data.backpack;
            this.netData.helmet = data.helmet;
            this.netData.chest = data.chest;
            this.netData.activeWeapon = data.activeWeapon;
            this.netData.layer = data.layer;
            this.netData.dead = data.dead;
            this.netData.downed = data.downed;
            this.netData.animType = data.animType;
            this.netData.animSeq = data.animSeq;
            this.netData.actionType = data.actionType;
            this.netData.actionSeq = data.actionSeq;
            this.netData.wearingPan = data.wearingPan;
            this.netData.healEffect = data.healEffect;
            this.netData.frozen = data.frozen;
            this.netData.frozenOri = data.frozenOri;
            this.netData.hasteType = data.hasteType;
            this.netData.hasteSeq = data.hasteSeq;
            this.netData.actionItem = data.actionItem;
            this.netData.scale = data.scale;
            this.netData.role = data.role;

            if (!!isNew || !perksEqual(this.netData.perks, data.perks)) {
                this.perksDirty = true;
            }

            this.netData.perks = data.perks;
            if (data.animSeq != this.anim.seq) {
                this.playAnim(data.animType, data.animSeq);
            }
            this.action.type = data.actionType;
            this.action.seq = data.actionSeq;
            this.action.item = data.actionItem;
            this.visualsDirty = true;
        }

        if (isNew) {
            this.isNew = true;
            this.renderLayer = this.netData.layer;
            this.renderZOrd = 18;
            this.renderZIdx = this.__id;
        }
    }

    setLocalData(data, t) {
        const scopeOld = this.localData.scope;

        if (data.healthDirty) {
            this.localData.health = data.health;
        }

        if (data.boostDirty) {
            this.localData.boost = data.boost;
        }

        if (data.zoomDirty) {
            this.localData.zoom = data.zoom;
            this.zoomFast = false;
        }

        if (data.actionDirty) {
            this.action.time = data.action.time;
            this.action.duration = data.action.duration;
            this.action.targetId = data.action.targetId;
        }

        if (data.inventoryDirty) {
            this.localData.scope = data.scope;
            this.localData.inventory = {};
            for (const item in GameConfig.bagSizes) {
                if (GameConfig.bagSizes.hasOwnProperty(item)) {
                    this.localData.inventory[item] = data.inventory[item];
                }
            }
        }
        if (data.weapsDirty) {
            this.localData.curWeapIdx = data.curWeapIdx;
            this.localData.weapons = [];
            for (let i = 0; i < GameConfig.WeaponSlot.Count; i++) {
                const w = {
                    type: data.weapons[i].type,
                    ammo: data.weapons[i].ammo
                };
                this.localData.weapons.push(w);
            }
        }
        if (data.spectatorCountDirty) {
            this.localData.spectatorCount = data.spectatorCount;
        }

        // Zoom more quickly when changing scopes
        if (this.localData.scope != scopeOld) {
            this.zoomFast = true;
        }
    }

    getZoom() {
        let zoom = this.localData.zoom;

        if (device.mobile) {
            const stepIdx = desktopZoomRads.indexOf(zoom);
            if (stepIdx !== -1) {
                zoom = mobileZoomRads[stepIdx];
            }
        }

        return zoom;
    }

    getHelmetLevel() {
        if (this.netData.helmet) {
            return GameObjectDefs[this.netData.helmet].level;
        } else {
            return 0;
        }
    }

    getChestLevel() {
        if (this.netData.chest) {
            return GameObjectDefs[this.netData.chest].level;
        } else {
            return 0;
        }
    }

    getBagLevel() {
        return GameObjectDefs[this.netData.backpack].level;
    }

    Ur() {
        return GameObjectDefs[this.netData.activeWeapon].type;
    }

    Wr(e) {
        return this.localData.weapons[e].type !== "";
    }

    getMeleeCollider() {
        const meleeDef = GameObjectDefs[this.netData.activeWeapon];
        const ang = Math.atan2(this.dir.y, this.dir.x);
        const off = v2.add(
            meleeDef.attack.offset,
            v2.mul(v2.create(1, 0), this.netData.scale - 1)
        );
        const pos = v2.add(this.pos, v2.rotate(off, ang));
        const rad = meleeDef.attack.rad;
        return collider.createCircle(pos, rad, 0);
    }

    hasActivePan() {
        return (
            this.netData.wearingPan ||
            (this.netData.activeWeapon == "pan" && this.currentAnim() != Anim.Melee)
        );
    }

    getPanSegment() {
        const panSurface = this.netData.wearingPan ? "unequipped" : "equipped";
        return GameObjectDefs.pan.reflectSurface[panSurface];
    }

    canInteract(map) {
        return !this.netData.dead && (!map.perkMode || this.netData.role);
    }

    updatePerks(isActivePlayer, isSpectating, ui2Manager) {
        for (let i = 0; i < this.perks.length; i++) {
            this.perks[i].isNew = false;
        }
        if (this.perksDirty) {
            if (isActivePlayer && !isSpectating) {
                // Create Ui notifications for newly added perks
                for (let i = 0; i < this.netData.perks.length; i++) {
                    const perk = this.netData.perks[i];
                    if (
                        this.perks.findIndex((x) => {
                            return x.type == perk.type;
                        }) === -1
                    ) {
                        ui2Manager.addRareLootMessage(perk.type);
                    }
                }

                // Remove active Ui messages for perks we no longer have
                for (let i = 0; i < this.perks.length; i++) {
                    const perk = this.perks[i];
                    if (
                        this.netData.perks.findIndex((x) => {
                            return x.type == perk.type;
                        }) === -1
                    ) {
                        ui2Manager.removeRareLootMessage(perk.type);
                    }
                }
            }

            // Update the internal perk list and calculate an 'isNew' property;
            // this is used by the Ui to animate the perk icon.
            const perks = [];
            for (let i = 0; i < this.netData.perks.length; i++) {
                const perk = this.netData.perks[i];
                const isNew =
                        this.perks.findIndex((x) => {
                            return x.type == perk.type;
                        }) === -1;
                perks.push({
                    type: perk.type,
                    droppable: perk.droppable,
                    isNew: isNew && !this.isNew
                });
            }

            this.perks = perks;

            this.perkTypes = [];
            for (let i = 0; i < this.netData.perks.length; i++) {
                this.perkTypes.push(this.netData.perks[i].type);
            }
            this.perksDirty = false;
        }
    }

    hasPerk(type) {
        return this.perkTypes.includes(type);
    }

    /**
     * @param {import("../objects/player").PlayerBarn} playerBarn
     * @param {import("./player").PlayerBarn} player
     * @param {import("../map").Map} map
     * @param {import("../audioManager").AudioManager} audioManager
     * @param {import("./particles").ParticleBarn} particleBarn
     * @param {import("../inputBinds").InputBinds} inputBinds
     * @param {import("../camera").Camera} camera
     * @param {import("../renderer").Renderer} renderer
     */
    update(dt, playerBarn, map, audioManager, particleBarn, inputBinds, camera, renderer, ui2Manager, activeId, preventInput, displayingStats, isSpectating) {
        const curWeapDef = GameObjectDefs[this.netData.activeWeapon];
        const isActivePlayer = this.__id == activeId;
        const activePlayer = playerBarn.getPlayerById(activeId);
        this.posOld = v2.copy(this.pos);
        this.dirOld = v2.copy(this.dir);
        this.pos = v2.copy(this.netData.pos);
        this.dir = v2.copy(this.netData.dir);
        this.layer = this.netData.layer;
        this.downed = this.netData.downed;
        this.rad = this.netData.scale * GameConfig.player.radius;

        // Ease radius transitions
        if (!math.eqAbs(this.rad, this.bodyRad)) {
            const bodyRadDist = this.rad - this.bodyRad;
            let bodyRadStep = Math.abs(bodyRadDist) > 0.0001 ? bodyRadDist * dt * 6 : bodyRadDist;
            if (this.isNew) {
                bodyRadStep = bodyRadDist;
            }
            this.bodyRad += bodyRadStep;
            this.visualsDirty = true;
        }

        // Calculate an aabb that fits the camera view
        if (isActivePlayer) {
            const viewEdge = camera.screenToPoint(v2.create(camera.screenWidth, 0));
            const viewExtent = v2.sub(viewEdge, camera.pos);
            this.viewAabb.min = v2.sub(camera.pos, viewExtent);
            this.viewAabb.max = v2.add(camera.pos, viewExtent);
        }

        // Should happen early in the frame so the rest of the update will have
        // accurate hasPerk() calls
        this.updatePerks(isActivePlayer, isSpectating, ui2Manager);

        const weapTypeDirty = this.weapTypeOld != this.netData.activeWeapon;
        this.weapTypeOld = this.netData.activeWeapon;

        this.lastThrowablePickupSfxTicker -= dt;
        this.noCeilingRevealTicker -= dt;

        // Update nameTex
        const activeGroupId = playerBarn.getPlayerInfo(activeId).groupId;
        const playerInfo = playerBarn.getPlayerInfo(this.__id);
        const inSameGroup = playerInfo.groupId == activeGroupId;
        this.nameText.text = playerInfo.name;
        this.nameText.visible = !isActivePlayer && inSameGroup;

        // Locate nearby obstacles that may play interaction effects
        let insideObstacle = null;
        let doorErrorObstacle = null;
        const obstacles = map.obstaclePool.getPool();
        for (let N = 0; N < obstacles.length; N++) {
            const H = obstacles[N];
            if (H.active && !H.dead && H.layer == this.netData.layer) {
                if (H.isBush) {
                    const rad = this.rad * 0.25;
                    if (
                        collider.intersectCircle(H.collider, this.pos, rad)
                    ) {
                        insideObstacle = H;
                    }
                } else if (H.isDoor) {
                    const rad = this.rad + 0.25;
                    const toDoor = v2.sub(H.pos, this.pos);
                    const doorDir = v2.rotate(v2.create(1, 0), H.rot);
                    const res = collider.intersectCircle(
                        H.collider,
                        this.pos,
                        rad
                    );
                    if (
                        res &&
                        (H.door.locked ||
                            (H.door.openOneWay && v2.dot(toDoor, doorDir) < 0))
                    ) {
                        doorErrorObstacle = H;
                    }
                }
            }
        }

        // Enter/exit bush effects
        const isInside = insideObstacle != null;
        if (isInside) {
            this.insideObstacleType = insideObstacle.type;
        }
        this.lastInsideObstacleTime -= dt;
        if (
            this.wasInsideObstacle != isInside &&
            this.lastInsideObstacleTime < 0 &&
            !this.isNew
        ) {
            const obstacleDef = MapObjectDefs[this.insideObstacleType];
            this.lastInsideObstacleTime = 0.2;
            audioManager.playSound(obstacleDef.sound.enter, {
                channel: "sfx",
                soundPos: this.pos,
                falloff: 1,
                layer: this.layer,
                filter: "muffled"
            });

            const moveDir = v2.normalizeSafe(
                v2.sub(this.posOld, this.pos),
                v2.create(1, 0)
            );
            const partDir = isInside ? 1 : -1;
            const numParticles = Math.floor(util.random(3, 5));
            for (
                let i = 0;
                i < numParticles;
                i++
            ) {
                const vel = v2.mul(
                    v2.rotate(
                        v2.mul(moveDir, partDir),
                        ((Math.random() - 0.5) * Math.PI) / 1.5
                    ),
                    util.random(6, 8)
                );
                particleBarn.addParticle(
                    obstacleDef.hitParticle,
                    this.layer,
                    this.pos,
                    vel
                );
            }
        }
        this.wasInsideObstacle = isInside;

        // Play a sound effect when touching a one-way door from the wrong side
        const wasNearDoorError = this.isNearDoorError;
        this.isNearDoorError = doorErrorObstacle != null;
        this.doorErrorTicker -= dt;
        if (
            this.isNearDoorError &&
            !wasNearDoorError &&
            this.doorErrorTicker <= 0
        ) {
            this.doorErrorTicker = 0.5;

            const doorDef = MapObjectDefs[doorErrorObstacle.type];
            const doorSfx = doorDef.door.sound.error;
            audioManager.playSound(doorSfx, {
                channel: "sfx",
                soundPos: this.pos,
                falloff: 1,
                layer: this.layer,
                filter: "muffled"
            });
        }
        this.surface = map.getGroundSurface(this.pos, this.layer);

        // SOUND

        const inWater = this.surface.type == "water";
        this.updateSubmersion(dt, map);
        this.updateFrozenState(dt);

        // Play a footstep if we've moved enough
        if (!this.netData.dead) {
            this.stepDistance += v2.length(
                v2.sub(this.posOld, this.pos)
            );
            if (
                (this.stepDistance > 5 && inWater) ||
                (inWater && !this.wasInWater)
            ) {
                this.stepDistance = 0;
                particleBarn.addRippleParticle(
                    this.pos,
                    this.layer,
                    this.surface.data.rippleColor
                );
                audioManager.playGroup("footstep_water", {
                    soundPos: this.pos,
                    fallOff: 3,
                    layer: this.layer,
                    filter: "muffled"
                });
            } else if (this.stepDistance > 4 && !inWater) {
                this.stepDistance = 0;
                audioManager.playGroup(`footstep_${this.surface.type}`, {
                    soundPos: this.pos,
                    fallOff: 3,
                    layer: this.layer,
                    filter: "muffled"
                });
            }
            this.wasInWater = inWater;
        }

        // Take bleeding damage
        this.bleedTicker -= dt;
        if (
            !this.netData.dead &&
            ((this.netData.downed && this.action.type == Action.None) ||
                this.hasPerk("trick_drain")) &&
            this.bleedTicker < 0
        ) {
            this.bleedTicker = this.hasPerk("trick_drain")
                ? GameConfig.player.bleedTickRate * 3
                : GameConfig.player.bleedTickRate;
            const vel = v2.rotate(
                v2.mul(this.dir, -1),
                ((Math.random() - 0.5) * Math.PI) / 3
            );
            vel.y *= -1;
            particleBarn.addParticle(
                "bloodSplat",
                this.renderLayer,
                v2.create(0, 0),
                v2.mul(vel, camera.ppu),
                1,
                Math.random() * Math.PI * 2,
                this.container,
                this.renderZOrd + 1
            );
            if (!displayingStats) {
                audioManager.playSound("player_bullet_hit_02", {
                    channel: "hits",
                    soundPos: this.pos,
                    fallOff: 3,
                    layer: this.layer,
                    filter: "muffled"
                });
            }
        }

        // Only play swaps for local players.
        this.gunSwitchCooldown -= dt;
        this.fireDelay -= dt;
        if (isActivePlayer && (weapTypeDirty || this.lastSwapIdx != this.localData.curWeapIdx)) {
            const lastWeapIdx = this.lastSwapIdx;
            this.lastSwapIdx = this.localData.curWeapIdx;
            const itemDef = GameObjectDefs[this.netData.activeWeapon];
            if (itemDef.type == "melee" || itemDef.type == "throwable") {
                // @HACK: Equipping a throwable currently plays
                // the same SFX as picking up a throwable, leading
                // to an echo effect
                if (
                    itemDef.type != "throwable" ||
                    this.lastThrowablePickupSfxTicker <= 0
                ) {
                    // Fixes issue with melee equip sounds being offset in the loadoutMenu
                    const soundPos = this.isLoadoutAvatar
                        ? camera.pos
                        : this.pos;
                    audioManager.playSound(itemDef.sound.deploy, {
                        channel: "sfx",
                        soundPos,
                        fallOff: 3
                    });
                }
            } else if (itemDef.type == "gun") {
                let switchSound = "gun_switch_01";
                let deployFull = false;
                // Check if we're using 2 guns in the same group
                if (
                    (lastWeapIdx == 0 || lastWeapIdx == 1) &&
                    (this.lastSwapIdx == 0 ||
                        this.lastSwapIdx == 1) &&
                    this.fireDelay > 0
                ) {
                    const lastWeapDef = GameObjectDefs[this.localData.weapons[lastWeapIdx].type];
                    if (
                        itemDef &&
                        lastWeapDef &&
                        itemDef.deployGroup !== undefined &&
                        lastWeapDef.deployGroup !== undefined &&
                        itemDef.deployGroup == lastWeapDef.deployGroup
                    ) {
                        deployFull = true;
                    }
                }
                if (this.gunSwitchCooldown > 0 || deployFull) {
                    switchSound = itemDef.sound.deploy;
                } else {
                    this.gunSwitchCooldown =
                        GameConfig.player.freeSwitchCooldown;
                }
                audioManager.stopSound(this.cycleSoundInstance);
                this.cycleSoundInstance = audioManager.playSound(switchSound, {
                    channel: "activePlayer"
                });
                this.fireDelay = 0;
            }
        }
        if (!audioManager.isSoundPlaying(this.cycleSoundInstance)) {
            this.cycleSoundInstance = null;
        }

        // Action effect
        if (this.action.seq != this.action.seqOld && !this.isNew) {
            // Throttle effects for other players if they repeatedly cancel and
            // start new actions
            let playEffect = true;
            if (!isActivePlayer && this.action.type != Action.None) {
                this.action.throttleTicker = 0.5;
                if (this.action.throttleCount < 5) {
                    this.action.throttleCount++;
                } else {
                    playEffect = false;
                }
            }
            if (playEffect) {
                this.playActionStartEffect(isActivePlayer, particleBarn, audioManager);
            }
        }
        this.action.seqOld = this.action.seq;
        this.updateActionEffect(isActivePlayer, playerInfo, particleBarn, audioManager);
        this.action.throttleTicker -= dt;
        if (
            this.action.throttleTicker < 0 &&
            this.action.throttleCount > 0
        ) {
            this.action.throttleCount--;
            this.action.throttleTicker = 0.25;
        }

        // Haste effect
        if (this.netData.hasteType && this.netData.hasteSeq != this.hasteSeq) {
            const hasteEffects = {
                [HasteType.None]: {
                    particle: "",
                    sound: ""
                },
                [HasteType.Windwalk]: {
                    particle: "windwalk",
                    sound: "ability_stim_01"
                },
                [HasteType.Takedown]: {
                    particle: "takedown",
                    sound: "ability_stim_01"
                },
                [HasteType.Inspire]: {
                    particle: "inspire",
                    sound: "ability_stim_01"
                }
            };
            const fx = hasteEffects[this.netData.hasteType];

            if (!this.isNew) {
                audioManager.playSound(fx.sound, {
                    channel: "sfx",
                    soundPos: this.pos,
                    fallOff: 1,
                    layer: this.layer,
                    filter: "muffled"
                });
            }

            this.hasteEmitter?.stop();
            this.hasteEmitter = particleBarn.addEmitter(fx.particle, {
                pos: this.pos,
                layer: this.layer
            });
            this.hasteSeq = this.netData.hasteSeq;
        } else if (!this.netData.hasteType && this.hasteEmitter) {
            this.hasteEmitter.stop();
            this.hasteEmitter = null;
        }
        if (this.hasteEmitter) {
            this.hasteEmitter.pos = v2.add(
                this.pos,
                v2.create(0, 0.1)
            );
            this.hasteEmitter.layer = this.renderLayer;
            this.hasteEmitter.zOrd = this.renderZOrd + 1;
        }

        // Passive heal effect
        if (this.netData.healEffect && !this.passiveHealEmitter) {
            this.passiveHealEmitter = particleBarn.addEmitter("heal_basic", {
                pos: this.pos,
                layer: this.layer
            });
        } else if (!this.netData.healEffect && this.passiveHealEmitter) {
            this.passiveHealEmitter.stop();
            this.passiveHealEmitter = null;
        }
        if (this.passiveHealEmitter) {
            this.passiveHealEmitter.pos = v2.add(
                this.pos,
                v2.create(0, 0.1)
            );
            this.passiveHealEmitter.layer = this.renderLayer;
            this.passiveHealEmitter.zOrd = this.renderZOrd + 1;
        }
        if (isActivePlayer && !isSpectating) {
            const curWeapIdx = this.localData.curWeapIdx;
            const curWeap = this.localData.weapons[curWeapIdx];
            const itemDef = GameObjectDefs[curWeap.type];

            // Play dry fire sound when empty
            if (
                !this.playedDryFire &&
                this.Ur() == "gun" &&
                (inputBinds.isBindPressed(Input.Fire) ||
                    (inputBinds.isBindDown(Input.Fire) &&
                        itemDef.fireMode == "auto")) &&
                this.action.type == Action.None &&
                !preventInput &&
                !itemDef.ammoInfinite
            ) {
                const ammoLeft = this.localData.inventory[itemDef.ammo] || 0;
                const currentClip = curWeap.ammo;
                if (ammoLeft == 0 && currentClip == 0) {
                    audioManager.playSound(itemDef.sound.empty);
                    this.playedDryFire = true;
                }
            }
            if (!inputBinds.isBindDown(Input.Fire)) {
                this.playedDryFire = false;
            }
        }

        // Decay gun recoil
        this.gunRecoilL = math.max(
            0,
            this.gunRecoilL - this.gunRecoilL * dt * 5 - dt
        );
        this.gunRecoilR = math.max(
            0,
            this.gunRecoilR - this.gunRecoilR * dt * 5 - dt
        );
        const xe = {
            playerBarn,
            map,
            audioManager,
            particleBarn
        };
        this.updateAnim(dt, xe);
        if (this.currentAnim() == Anim.None) {
            this.throwableState = "equip";
        }
        if (
            (this.currentAnim() == Anim.Cook ||
                this.currentAnim() == Anim.Throw) &&
            curWeapDef.type != "throwable"
        ) {
            this.playAnim(Anim.None, this.anim.seq);
        }

        // Compute blended bone positions
        const idlePose = this.selectIdlePose();
        const idlePoseData = animData.IdlePoses[idlePose];
        for (
            let boneIdx = 0;
            boneIdx < this.bones.length;
            boneIdx++
        ) {
            const idleBonePose = idlePoseData[boneIdx] || Pose.identity;
            const animBone = this.anim.bones[boneIdx];
            if (animBone.weight > 0) {
                this.bones[boneIdx].copy(Pose.lerp(animBone.weight, idleBonePose, animBone.pose));
            } else {
                this.bones[boneIdx].copy(idleBonePose);
            }
        }

        // Update sprite components
        if (this.throwableStatePrev != this.throwableState) {
            this.visualsDirty = true;
        }
        this.throwableStatePrev = this.throwableState;

        if (this.visualsDirty) {
            this.updateVisuals(playerBarn, map);
        }
        this.visualsDirty = false;

        this.updateAura(dt, isActivePlayer, activePlayer);

        this.Zr();

        // @NOTE: There's an off-by-one frame issue for effects spawned earlier
        // in this frame that reference renderLayer / zOrd / zIdx. This issue is
        // prevalent for other effects that reference the player outside of
        // update, like shot shell particle creation.
        this.updateRenderLayer(isActivePlayer, activePlayer, map);

        renderer.addPIXIObj(
            this.auraContainer,
            this.renderLayer,
            this.renderZOrd - 1,
            this.renderZIdx
        );

        // Special visibility rules for the aura since it doesn't clip well with
        // the bunker mask system
        const auraLayerMatch =
            activePlayer.layer & 2 ||
            (activePlayer.layer & 1) == 1 ||
            (this.layer & 1) == 0;

        this.auraContainer.visible = !this.netData.dead && auraLayerMatch;

        renderer.addPIXIObj(
            this.container,
            this.renderLayer,
            this.renderZOrd,
            this.renderZIdx
        );

        this.isNew = false;
    }

    render(camera, debug) {
        const screenPos = camera.pointToScreen(this.pos);
        const screenScale = camera.pixels(1);
        this.container.position.set(screenPos.x, screenPos.y);
        this.container.scale.set(screenScale, screenScale);
        this.container.visible = !this.netData.dead;
        this.auraContainer.position.set(screenPos.x, screenPos.y);
        this.auraContainer.scale.set(screenScale, screenScale);

        if (device.debug) {
            debugLines.addCircle(this.pos, this.rad, 0xff0000, 0);

            const weapDef = GameObjectDefs[this.netData.activeWeapon];
            if (weapDef.type === "gun") {
                debugLines.addRay(this.pos, this.dir, weapDef.barrelLength, 0xff0000, 0);
            }
        }
    }

    /**
     * @param {import("../map").Map} map
     */
    updateRenderLayer(isActivePlayer, activePlayer, map) {
        // Give the player a larger stairs collision radius.
        // This is a hack to reduce popping when emerging from below,
        // and to fix sorting issues with decals and loot when near
        // the bottom and top of stairs
        const visualCol = collider.createCircle(this.pos, GameConfig.player.maxVisualRadius);
        let onMask = false;
        let onStairs = false;
        let occluded = false;
        const structures = map.structurePool.getPool();
        for (let i = 0; i < structures.length; i++) {
            const structure = structures[i];
            if (structure.active) {
                for (let j = 0; j < structure.stairs.length; j++) {
                    const stairs = structure.stairs[j];
                    const col = collider.intersect(stairs.collision, visualCol);
                    if (col) {
                        onStairs = true;

                        const stairTop = v2.add(
                            stairs.center,
                            v2.mul(stairs.downDir, -2.5)
                        );
                        let dir = v2.sub(stairTop, this.pos);
                        const dist = v2.length(dir);
                        dir =
                            dist > 0.0001
                                ? v2.div(dir, dist)
                                : v2.create(1, 0);
                        occluded =
                            collisionHelpers.intersectSegmentDist(
                                map.obstaclePool.getPool(),
                                this.pos,
                                dir,
                                dist,
                                0.5,
                                this.layer,
                                false
                            ) < dist;
                    }

                    // Disable ceiling reveals if we're near certain types
                    // of stairs. This lets the player enter cellars from an
                    // exterior entrance without peeking inside the building
                    // when passing through the exterior walls via the stairs.
                    if (
                        isActivePlayer &&
                        stairs.noCeilingReveal &&
                        col &&
                        this.layer != 0
                    ) {
                        this.noCeilingRevealTicker = 0.25;
                    }
                }
                for (let j = 0; j < structure.mask.length; j++) {
                    if (collider.intersect(structure.mask[j], visualCol)) {
                        onMask = true;
                        break;
                    }
                }
            }
        }
        let renderLayer = this.layer;
        let renderZOrd = 18;
        if (
            onStairs &&
            ((renderLayer & 1 && (activePlayer.layer & 1 || !occluded)) || (activePlayer.layer & 2 && !onMask))
        ) {
            renderLayer |= 2;
        }
        if (
            !!onStairs &&
            (renderLayer & 1) == (activePlayer.layer & 1) &&
            (!onMask || activePlayer.layer == 0)
        ) {
            renderLayer |= 2;
            renderZOrd += 100;
        }
        const renderZIdx =
            this.__id +
            (this.netData.downed ? 0 : 262144) +
            (isActivePlayer ? 65536 : 0) +
            (this.rad > 1 ? 131072 : 0);

        this.renderLayer = renderLayer;
        this.renderZOrd = renderZOrd;
        this.renderZIdx = renderZIdx;
    }

    /**
     * @param {import("../objects/player").PlayerBarn} playerBarn
     * @param {import("../map").Map} map
    */
    updateVisuals(playerBarn, map) {
        const outfitDef = GameObjectDefs[this.netData.outfit];
        const outfitImg = outfitDef.skinImg;
        const bodyScale = this.bodyRad / GameConfig.player.radius;

        this.bodySprite.texture = PIXI.Texture.from(outfitImg.baseSprite);
        this.bodySprite.tint = outfitDef.ghillie
            ? map.getMapDef().biome.colors.playerGhillie
            : outfitImg.baseTint;
        this.bodySprite.scale.set(0.25, 0.25);
        this.bodySprite.visible = true;

        if (this.netData.frozen && this.updateFrozenImage) {
            const frozenSprites = map.getMapDef().biome.frozenSprites || [];
            if (frozenSprites.length > 0) {
                const sprite = frozenSprites[Math.floor(Math.random() * frozenSprites.length)];
                const n =
                    math.oriToRad(this.netData.frozenOri) +
                    Math.PI * 0.5 +
                    (Math.random() - 0.5) * Math.PI * 0.25;
                this.bodyEffectSprite.texture =
                    PIXI.Texture.from(sprite);
                this.bodyEffectSprite.rotation = n;
                this.bodyEffectSprite.tint = 16777215;
                this.bodyEffectSprite.scale.set(0.25, 0.25);
            }
            this.updateFrozenImage = false;
        }

        if (map.factionMode && !outfitDef.ghillie) {
            const playerInfo = playerBarn.getPlayerInfo(this.__id);
            const teamId = playerInfo.teamId;
            const teamSprites = [
                "player-patch-01.img",
                "player-patch-02.img"
            ];
            const teamIdx = (teamId - 1) % teamSprites.length;
            const sprite = teamSprites[teamIdx];
            const tint = GameConfig.teamColors[teamIdx];
            const rot = math.oriToRad(3) + Math.PI * 0.5;
            this.patchSprite.texture = PIXI.Texture.from(sprite);
            this.patchSprite.rotation = rot;
            this.patchSprite.tint = tint;
            this.patchSprite.scale.set(0.25, 0.25);
            this.patchSprite.visible = true;
        } else {
            this.patchSprite.visible = false;
        }

        // Hands
        const setHandSprite = function(sprite, img, tint) {
            sprite.texture = PIXI.Texture.from(img);
            sprite.scale.set(0.175, 0.175);
            sprite.tint = tint;
            sprite.visible = true;
        };
        const handTint = outfitDef.ghillie
            ? map.getMapDef().biome.colors.playerGhillie
            : outfitImg.handTint;
        setHandSprite(this.handLSprite, outfitImg.handSprite, handTint);
        setHandSprite(this.handRSprite, outfitImg.handSprite, handTint);

        // Feet
        const setFootSprite = function(sprite, tint, downed) {
            sprite.texture = PIXI.Texture.from("player-feet-01.img");
            sprite.scale.set(0.45, 0.45);
            sprite.rotation = Math.PI * 0.5;
            sprite.tint = tint;
            sprite.visible = downed;
        };

        const footTint = outfitDef.ghillie
            ? map.getMapDef().biome.colors.playerGhillie
            : outfitImg.footTint;
        setFootSprite(this.footLSprite, footTint, this.downed);
        setFootSprite(this.footRSprite, footTint, this.downed);

        // Flak Jacket
        if (this.hasPerk("flak_jacket") && !outfitDef.ghillie) {
            this.flakSprite.texture = PIXI.Texture.from(
                "player-armor-base-01.img"
            );
            this.flakSprite.scale.set(0.215, 0.215);
            this.flakSprite.tint = 3671558;
            this.flakSprite.alpha = 0.7;
            this.flakSprite.visible = true;
        } else {
            this.flakSprite.visible = false;
        }

        // Chest
        if (this.netData.chest == "" || outfitDef.ghillie) {
            this.chestSprite.visible = false;
        } else {
            const chestDef = GameObjectDefs[this.netData.chest];
            const chestSkin = chestDef.skinImg;
            this.chestSprite.texture = PIXI.Texture.from(
                chestSkin.baseSprite
            );
            this.chestSprite.scale.set(0.25, 0.25);
            this.chestSprite.tint = chestSkin.baseTint;
            this.chestSprite.visible = true;
        }

        // Steelskin
        if (this.hasPerk("steelskin") && !outfitDef.ghillie) {
            this.steelskinSprite.texture = PIXI.Texture.from(
                "loot-melee-pan-black.img"
            );
            this.steelskinSprite.scale.set(0.4, 0.4);
            this.steelskinSprite.anchor.set(0.575, 0.5);
            this.steelskinSprite.tint = 0xFFFFFF;
            this.steelskinSprite.visible = true;
        } else {
            this.steelskinSprite.visible = false;
        }

        // Helmet
        if (this.netData.helmet == "" || outfitDef.ghillie) {
            this.helmetSprite.visible = false;
        } else {
            const helmetDef = GameObjectDefs[this.netData.helmet];
            const helmetSkin = helmetDef.skinImg;
            const helmetOffset = (this.downed ? 1 : -1) * 3.33;
            this.helmetSprite.texture = PIXI.Texture.from(
                helmetSkin.baseSprite
            );
            this.helmetSprite.position.set(helmetOffset, 0);
            if (helmetSkin.spriteScale) {
                this.helmetSprite.scale.set(
                    helmetSkin.spriteScale,
                    helmetSkin.spriteScale
                );
            } else {
                this.helmetSprite.scale.set(0.15, 0.15);
            }
            let helmetTint = helmetSkin.baseTint;
            if (map.factionMode) {
                helmetTint =
                    playerBarn.getPlayerInfo(this.__id).teamId == 1
                        ? helmetSkin.baseTintRed
                        : helmetSkin.baseTintBlue;
            }
            this.helmetSprite.tint = helmetTint;
            this.helmetSprite.visible = true;
        }

        // Backpack
        if (this.getBagLevel() > 0 && !outfitDef.ghillie && !this.downed) {
            const bagOffsets = [10.25, 11.5, 12.75];
            const bagLevel = this.getBagLevel();
            const bagOffset = bagOffsets[math.min(bagLevel - 1, bagOffsets.length - 1)];
            const scale = (0.4 + bagLevel * 0.03) * 0.5;

            this.backpackSprite.texture = PIXI.Texture.from(
                "player-circle-base-01.img"
            );
            this.backpackSprite.position.set(-bagOffset, 0);
            this.backpackSprite.scale.set(scale, scale);
            this.backpackSprite.tint = outfitImg.backpackTint;
            this.backpackSprite.visible = true;
            (function(sprite, img, tint) {
                sprite.texture = PIXI.Texture.from(img);
                sprite.tint = tint;
            })(
                this.backpackSprite,
                outfitImg.backpackSprite,
                outfitImg.backpackTint
            );
        } else {
            this.backpackSprite.visible = false;
        }

        // Hip
        if (this.netData.wearingPan) {
            const imgDef = GameObjectDefs.pan.hipImg;
            this.hipSprite.texture = PIXI.Texture.from(imgDef.sprite);
            this.hipSprite.position.set(imgDef.pos.x, imgDef.pos.y);
            this.hipSprite.scale.set(imgDef.scale.x, imgDef.scale.y);
            this.hipSprite.rotation = imgDef.rot;
            this.hipSprite.tint = imgDef.tint;
            this.hipSprite.visible = true;
        } else {
            this.hipSprite.visible = false;
        }

        const R = GameObjectDefs[this.netData.activeWeapon];
        if (R.type == "gun") {
            this.gunRSprites.setType(this.netData.activeWeapon, bodyScale);
            this.gunRSprites.setVisible(true);
            if (R.isDual) {
                this.gunLSprites.setType(this.netData.activeWeapon, bodyScale);
                this.gunLSprites.setVisible(true);
            } else {
                this.gunLSprites.setVisible(false);
            }
            const L = this.bodyContainer.getChildIndex(
                this.handRContainer
            );
            const q = this.bodyContainer.getChildIndex(
                this.handRContainer
            );
            let F = L + 1;
            if (this.gunRSprites.magTop || R.worldImg.handsBelow) {
                F = L - 1;
            }
            F = math.max(F, 0);
            if (q != F) {
                this.bodyContainer.addChildAt(
                    this.handLContainer,
                    F
                );
            }
            const j = this.handRContainer.getChildIndex(
                this.gunRSprites.container
            );
            const N = R.worldImg.handsBelow
                ? this.handRContainer.children.length
                : 0;
            if (j != N) {
                this.handRContainer.addChildAt(
                    this.gunRSprites.container,
                    N
                );
            }
        } else {
            this.gunLSprites.setVisible(false);
            this.gunRSprites.setVisible(false);
        }
        if (this.downed != this.wasDowned) {
            this.wasDowned = this.downed;
            if (this.downed) {
                const H = this.bodyContainer.getChildIndex(
                    this.footLContainer
                );
                this.bodyContainer.addChildAt(
                    this.handLContainer,
                    H
                );
                this.bodyContainer.addChildAt(
                    this.handRContainer,
                    H
                );
            } else {
                this.bodyContainer.addChild(this.handLContainer);
                this.bodyContainer.addChild(this.handRContainer);
            }
        }
        if (R.type == "melee" && this.netData.activeWeapon != "fists") {
            const V = R.worldImg;
            this.meleeSprite.texture = PIXI.Texture.from(
                V.sprite
            );
            this.meleeSprite.pivot.set(-V.pos.x, -V.pos.y);
            this.meleeSprite.scale.set(
                V.scale.x / bodyScale,
                V.scale.y / bodyScale
            );
            this.meleeSprite.rotation = V.rot;
            this.meleeSprite.tint = V.tint;
            this.meleeSprite.visible = true;
            const U = this.handRContainer.getChildIndex(
                this.handRSprite
            );
            const W = math.max(V.renderOnHand ? U + 1 : U - 1, 0);
            if (
                this.handRContainer.getChildIndex(
                    this.meleeSprite
                ) != W
            ) {
                this.handRContainer.addChildAt(this.meleeSprite, W);
            }
            const G = this.bodyContainer.getChildIndex(
                this.handRContainer
            );
            const X = math.max(V.leftHandOntop ? G + 1 : G - 1, 0);
            if (
                this.bodyContainer.getChildIndex(
                    this.handLContainer
                ) != X
            ) {
                this.bodyContainer.addChildAt(
                    this.handLContainer,
                    X
                );
            }
        } else {
            this.meleeSprite.visible = false;
        }
        if (R.type == "throwable") {
            const K = function(e, t) {
                if (t.sprite && t.sprite != "none") {
                    e.texture = PIXI.Texture.from(t.sprite);
                    e.position.set(t.pos.x, t.pos.y);
                    e.scale.set(t.scale, t.scale);
                    e.rotation = Math.PI * 0.5;
                    e.visible = true;
                } else {
                    e.visible = false;
                }
            };
            const Z = R.handImg[this.throwableState];
            K(this.objectLSprite, Z.left);
            K(this.objectRSprite, Z.right);
        } else {
            this.objectLSprite.visible = false;
            this.objectRSprite.visible = false;
        }

        // Hide weapons when reviving or downed
        if (this.downed || this.currentAnim() == Anim.Revive) {
            this.gunLSprites.setVisible(false);
            this.gunRSprites.setVisible(false);
            this.meleeSprite.visible = false;
            this.objectLSprite.visible = false;
            this.objectRSprite.visible = false;
        }

        // Hide additional gear when downed
        if (this.downed) {
            this.backpackSprite.visible = false;
        }

        // Role specific visuals
        if (
            (this.action.type != Action.UseItem &&
                this.action.type != Action.Revive) ||
            this.netData.dead ||
            (this.netData.downed && !this.hasPerk("self_revive")) ||
            !this.hasPerk("aoe_heal")
        ) {
            this.auraPulseTicker = 0;
            this.auraPulseDir = 1;
            this.auraCircle.visible = false;
        } else {
            const actionItemDef = GameObjectDefs[this.action.item];
            // Assume if there's no item defined, it's a revive circle
            const sprite = actionItemDef?.aura
                ? actionItemDef.aura.sprite
                : "part-aura-circle-01.img";
            const tint = actionItemDef?.aura ? actionItemDef.aura.tint : 0xff00ff;
            const auraScale = 0.125;
            let auraRad = actionItemDef
                ? GameConfig.player.medicHealRange
                : GameConfig.player.medicReviveRange;
            auraRad *= auraScale;
            this.auraCircle.texture = PIXI.Texture.from(sprite);
            this.auraCircle.scale.set(auraRad, auraRad);
            this.auraCircle.tint = tint;
            this.auraCircle.visible = true;
        }

        // Class visors
        if (
            map.perkMode &&
            this.netData.role != "" &&
            this.netData.helmet != "" &&
            !outfitDef.ghillie
        ) {
            const roleDef = GameObjectDefs[this.netData.role];
            const visorSkin = roleDef.visorImg;
            if (visorSkin) {
                const helmetOffset = (this.downed ? 1 : -1) * 3.33;
                this.visorSprite.texture = PIXI.Texture.from(
                    visorSkin.baseSprite
                );
                this.visorSprite.position.set(helmetOffset, 0);
            }
            if (visorSkin.spriteScale) {
                this.visorSprite.scale.set(
                    visorSkin.spriteScale,
                    visorSkin.spriteScale
                );
            } else {
                this.visorSprite.scale.set(0.15, 0.15);
            }
            this.visorSprite.visible = true;
        } else {
            this.visorSprite.visible = false;
        }
        this.bodyContainer.scale.set(bodyScale, bodyScale);
    }

    updateAura(dt, isActivePlayer, activePlayer) {
        // Fade in/out when entering/exiting the screen edge of the active player.
        // This fixes popping caused by the player being culled before the aura
        // is off screen.
        let inView = true;
        if (!isActivePlayer) {
            inView = coldet.testCircleAabb(
                this.pos,
                this.rad,
                activePlayer.viewAabb.min,
                activePlayer.viewAabb.max
            );
        }
        this.auraViewFade = math.lerp(
            dt * 6,
            this.auraViewFade,
            inView ? 1 : 0
        );

        // Pulse healing circle
        if (this.auraCircle.visible) {
            this.auraPulseTicker = math.clamp(
                this.auraPulseTicker + dt * this.auraPulseDir * 1.5,
                0,
                1
            );
            const pulseAlpha =
                math.easeOutExpo(this.auraPulseTicker) * 0.75 + 0.25;
            if (
                this.auraPulseTicker >= 1 ||
                this.auraPulseTicker <= 0
            ) {
                this.auraPulseDir *= -1;
            }

            this.auraCircle.alpha = pulseAlpha * this.auraViewFade;
        }
    }

    Zr() {
        const e = function(e, t) {
            e.position.set(t.pos.x, t.pos.y);
            e.pivot.set(-t.pivot.x, -t.pivot.y);
            e.rotation = t.rot;
        };
        e(this.handLContainer, this.bones[Bones.HandL]);
        e(this.handRContainer, this.bones[Bones.HandR]);
        e(this.footLContainer, this.bones[Bones.FootL]);
        e(this.footRContainer, this.bones[Bones.FootR]);
        const t = GameObjectDefs[this.netData.activeWeapon];
        if (
            !this.downed &&
            this.currentAnim() != Anim.Revive &&
            t.type == "gun"
        ) {
            if (t.worldImg.leftHandOffset) {
                this.handLContainer.position.x +=
                    t.worldImg.leftHandOffset.x;
                this.handLContainer.position.y +=
                    t.worldImg.leftHandOffset.y;
            }
        }
        this.handLContainer.position.x -= this.gunRecoilL * 1.125;
        this.handRContainer.position.x -= this.gunRecoilR * 1.125;
        this.bodyContainer.rotation = -Math.atan2(
            this.dir.y,
            this.dir.x
        );
    }

    playActionStartEffect(isActivePlayer, particleBarn, audioManager) {
        // Play action sound
        let actionSound = null;
        switch (this.action.type) {
        case Action.Reload:
        case Action.ReloadAlt: {
            const actionItemDef = GameObjectDefs[this.action.item];
            if (actionItemDef) {
                actionSound = {
                    sound:
                            this.action.type == Action.ReloadAlt
                                ? actionItemDef.sound.reloadAlt
                                : actionItemDef.sound.reload,
                    channel: isActivePlayer ? "activePlayer" : "otherPlayers"
                };
            }
        }
            break;
        case Action.UseItem: {
            const actionItemDef = GameObjectDefs[this.action.item];
            if (actionItemDef) {
                actionSound = {
                    sound: actionItemDef.sound.use,
                    channel: isActivePlayer ? "activePlayer" : "otherPlayers"
                };
            }
        }
        }

        audioManager.stopSound(this.actionSoundInstance);

        if (actionSound && this.playActionStartSfx) {
            this.actionSoundInstance = audioManager.playSound(actionSound.sound, {
                channel: actionSound.channel,
                soundPos: this.pos,
                fallOff: 2,
                layer: this.layer,
                filter: "muffled"
            });
        }

        // Create a casing shell if reloading certain types of weapons
        if (
            this.action.type == Action.Reload ||
            this.action.type == Action.ReloadAlt
        ) {
            const actionItemDef = GameObjectDefs[this.action.item];
            if (actionItemDef && actionItemDef.caseTiming == "reload") {
                for (let n = 0; n < actionItemDef.maxReload; n++) {
                    const shellDir = n % 2 == 0 ? -1 : 1;
                    const shellAngle = Math.PI + (Math.PI / 4) * shellDir;
                    const shellSpeedMult =
                        actionItemDef.maxReload <= 2
                            ? 1
                            : math.lerp(Math.random(), 0.8, 1.2);
                    createCasingParticle(
                        this.action.item,
                        shellAngle,
                        shellSpeedMult,
                        this.pos,
                        this.dir,
                        this.renderLayer,
                        this.renderZOrd + 1,
                        particleBarn
                    );
                }
            }
        }
    }

    updateActionEffect(isActivePlayer, playerInfo, r, audioManager) {
        // Determine if we should have an emitter
        let emitterType = "";
        const emitterProps = {};

        switch (this.action.type) {
        case Action.UseItem: {
            const actionItemDef = GameObjectDefs[this.action.item];
            const loadout = playerInfo.loadout;
            if (actionItemDef.type == "heal") {
                emitterType = GameObjectDefs[loadout.heal].emitter;
            } else if (actionItemDef.type == "boost") {
                emitterType = GameObjectDefs[loadout.boost].emitter;
            }
            if (this.hasPerk("aoe_heal")) {
                emitterProps.scale = 1.5;
                emitterProps.radius = GameConfig.player.medicHealRange / emitterProps.scale;
                emitterProps.rateMult = 0.25;
            }
            break;
        }
        case Action.Revive: {
            if (this.netData.downed) {
                emitterType = "revive_basic";
            }
            break;
        }
        }

        // Add emitter
        if (
            !!emitterType &&
            (!this.useItemEmitter || this.useItemEmitter.type != emitterType)
        ) {
            this.useItemEmitter?.stop();
            emitterProps.pos = this.pos;
            emitterProps.layer = this.layer;
            this.useItemEmitter = r.addEmitter(emitterType, emitterProps);
        }

        // Update existing emitter
        if (this.useItemEmitter) {
            this.useItemEmitter.pos = v2.add(
                this.pos,
                v2.create(0, 0.1)
            );
            this.useItemEmitter.layer = this.renderLayer;
            this.useItemEmitter.zOrd = this.renderZOrd + 1;
        }

        // Stop emitter
        if (this.useItemEmitter && !emitterType) {
            this.useItemEmitter.stop();
            this.useItemEmitter = null;
        }

        // Update action sound effect position
        if (!audioManager.isSoundPlaying(this.actionSoundInstance)) {
            this.actionSoundInstance = null;
        }

        if (this.actionSoundInstance && !isActivePlayer) {
            audioManager.updateSound(
                this.actionSoundInstance,
                "otherPlayers",
                this.pos,
                {
                    layer: this.layer,
                    fallOff: 2,
                    filter: "muffled"
                }
            );
        }
    }

    playItemPickupSound(item, audioManager) {
        const itemDef = GameObjectDefs[item];
        if (itemDef) {
            audioManager.playSound(itemDef.sound.pickup, {
                channel: "ui"
            });
            if (itemDef.type == "throwable") {
                this.lastThrowablePickupSfxTicker = 0.3;
            }
        }
    }

    selectIdlePose() {
        const curWeapDef = GameObjectDefs[this.netData.activeWeapon];
        let idlePose = "fists";
        idlePose = this.downed
            ? "downed"
            : curWeapDef.anim?.idlePose
                ? curWeapDef.anim.idlePose
                : curWeapDef.type == "gun"
                    ? curWeapDef.pistol
                        ? curWeapDef.isDual
                            ? "dualPistol"
                            : "pistol"
                        : curWeapDef.isBullpup
                            ? "bullpup"
                            : curWeapDef.isLauncher
                                ? "launcher"
                                : curWeapDef.isDual
                                    ? "dualRifle"
                                    : "rifle"
                    : curWeapDef.type == "throwable"
                        ? "throwable"
                        : "fists";
        if (animData.IdlePoses[idlePose]) {
            return idlePose;
        } else {
            return "fists";
        }
    }

    selectAnim(type) {
        const t = function(e, t) {
            return {
                type: e,
                mirror: !!t && Math.random() < 0.5
            };
        };
        switch (type) {
        case Anim.None:
            return t("none", false);
        case Anim.Cook:
            return t("cook", false);
        case Anim.Throw:
            return t("throw", false);
        case Anim.Revive:
            return t("revive", false);
        case Anim.CrawlForward:
            return t("crawl_forward", true);
        case Anim.CrawlBackward:
            return t("crawl_backward", true);
        case Anim.Melee: {
            const r = GameObjectDefs[this.netData.activeWeapon];
            if (!r.anim?.attackAnims) {
                return t("fists", true);
            }
            const a = r.anim.attackAnims;
            const i = Math.floor(Math.random() * a.length);
            const o = a[i];
            return t(o, o == "fists" && a.length == 1);
        }
        default:
            return t("none", false);
        }
    }

    currentAnim() {
        return this.anim.type;
    }

    playAnim(type, seq) {
        this.anim.type = type;
        this.anim.data = this.selectAnim(type);
        this.anim.seq = seq;
        this.anim.ticker = 0;
        for (let r = 0; r < this.bones.length; r++) {
            const a = this.anim.bones[r];
            a.weight = 0;
            a.pose.copy(this.bones[r]);
        }
    }

    updateAnim(e, t) {
        if (this.anim.data.type == "none") {
            this.playAnim(Anim.None, this.anim.seq);
        }
        if (this.currentAnim() != Anim.None) {
            const r = this.anim.ticker;
            this.anim.ticker += e * 1;
            const a = animData.Animations[this.anim.data.type];

            const i = a.keyframes;
            let o = -1;
            let s = 0;
            for (; this.anim.ticker >= i[s].time && s < i.length - 1;) {
                o++;
                s++;
            }
            o = math.max(o, 0);
            const n = i[o].time;
            const l = i[s].time;
            const c = math.min((this.anim.ticker - n) / (l - n), 1);
            const m = i[o].bones;
            const p = i[s].bones;
            const h = this.anim.data.mirror;
            for (let d = 0; d < this.anim.bones.length; d++) {
                const g = this.anim.bones[d];
                let y = d;
                if (h) {
                    y = d % 2 == 0 ? d + 1 : d - 1;
                }
                if (m[y] !== undefined && p[y] !== undefined) {
                    g.weight = o == s ? c : 1;
                    g.pose.copy(Pose.lerp(c, m[y], p[y]));
                    if (h) {
                        g.pose.pos.y *= -1;
                        g.pose.pivot.y *= -1;
                        g.pose.rot *= -1;
                    }
                }
            }
            const w = s == i.length - 1 && math.eqAbs(c, 1);
            let f = this.anim.ticker;
            if (w) {
                f += 1;
            }
            for (let _ = 0; _ < a.effects.length; _++) {
                const x = a.effects[_];
                if (x.time >= r && x.time < f) {
                    /* eslint-disable-next-line no-useless-call */
                    this[x.fn].apply(this, [t, x.args]);
                }
            }
            if (w) {
                this.playAnim(Anim.None, this.anim.seq);
            }
        }
    }

    animPlaySound(animCtx, args) {
        const itemDef = GameObjectDefs[this.netData.activeWeapon];
        const sound = itemDef.sound[args.sound];
        if (sound) {
            animCtx.audioManager.playSound(sound, {
                channel: "sfx",
                soundPos: this.pos,
                fallOff: 3,
                layer: this.layer,
                filter: "muffled"
            });
        }
    }

    animSetThrowableState(animCtx, args) {
        this.throwableState = args.state;
    }

    animThrowableParticles(animCtx, args) {
        if (GameObjectDefs[this.netData.activeWeapon].useThrowParticles) {
            // Pin
            const pinOff = v2.rotate(
                v2.create(0.75, 0.75),
                Math.atan2(this.dir.y, this.dir.x)
            );
            animCtx.particleBarn.addParticle(
                "fragPin",
                this.renderLayer,
                v2.add(this.pos, pinOff),
                v2.mul(v2.rotate(this.dir, Math.PI * 0.5), 4.5),
                1,
                Math.random() * Math.PI * 2,
                null,
                this.renderZOrd + 1
            );
            const leverOff = v2.rotate(
                v2.create(0.75, -0.75),
                Math.atan2(this.dir.y, this.dir.x)
            );
            animCtx.particleBarn.addParticle(
                "fragLever",
                this.renderLayer,
                v2.add(this.pos, leverOff),
                v2.mul(v2.rotate(this.dir, -Math.PI * 0.25), 3.5),
                1,
                Math.random() * Math.PI * 2,
                null,
                this.renderZOrd + 1
            );
        }
    }

    animMeleeCollision(animCtx, args) {
        const meleeDef = GameObjectDefs[this.netData.activeWeapon];
        if (meleeDef && meleeDef.type == "melee") {
            const meleeCol = this.getMeleeCollider();
            const meleeDist = meleeCol.rad + v2.length(v2.sub(this.pos, meleeCol.pos));
            const hits = [];

            // Obstacles
            const obstacles = animCtx.map.obstaclePool.getPool();
            for (let n = 0; n < obstacles.length; n++) {
                const l = obstacles[n];
                if (
                    !!l.active &&
                    !l.dead &&
                    !l.isSkin &&
                    l.height >= GameConfig.player.meleeHeight &&
                    util.sameLayer(l.layer, this.layer & 1)
                ) {
                    let res = collider.intersectCircle(
                        l.collider,
                        meleeCol.pos,
                        meleeCol.rad
                    );

                    // Certain melee weapons should perform a more expensive wall check
                    // to not hit obstacles behind walls.
                    if (meleeDef.cleave || meleeDef.wallCheck) {
                        const meleeDir = v2.normalizeSafe(
                            v2.sub(l.pos, this.pos),
                            v2.create(1, 0)
                        );
                        const wallCheck = collisionHelpers.intersectSegment(
                            animCtx.map.obstaclePool.getPool(),
                            this.pos,
                            meleeDir,
                            meleeDist,
                            1,
                            this.layer,
                            false
                        );
                        if (wallCheck && wallCheck.id !== l.__id) {
                            res = null;
                        }
                    }
                    if (res) {
                        const def = MapObjectDefs[l.type];
                        const closestPt = v2.add(
                            meleeCol.pos,
                            v2.mul(v2.neg(res.dir), meleeCol.rad - res.pen)
                        );
                        const vel = v2.rotate(
                            v2.mul(res.dir, 7.5),
                            ((Math.random() - 0.5) * Math.PI) / 3
                        );
                        hits.push({
                            pen: res.pen,
                            prio: 1,
                            pos: closestPt,
                            vel,
                            layer: this.renderLayer,
                            zOrd: this.renderZOrd,
                            particle: def.hitParticle,
                            sound: def.sound.punch,
                            soundFn: "playGroup"
                        });
                    }
                }
            }
            const ourTeamId = animCtx.playerBarn.getPlayerInfo(this.__id).teamId;
            const players = animCtx.playerBarn.playerPool.getPool();
            for (
                let i = 0;
                i < players.length;
                i++
            ) {
                const playerCol = players[i];
                if (
                    playerCol.active &&
                    playerCol.__id != this.__id &&
                    !playerCol.netData.dead &&
                    util.sameLayer(playerCol.layer, this.layer)
                ) {
                    const meleeDir = v2.normalizeSafe(
                        v2.sub(playerCol.pos, this.pos),
                        v2.create(1, 0)
                    );
                    const col = coldet.intersectCircleCircle(
                        meleeCol.pos,
                        meleeCol.rad,
                        playerCol.pos,
                        playerCol.rad
                    );
                    if (
                        col &&
                        math.eqAbs(
                            meleeDist,
                            collisionHelpers.intersectSegmentDist(
                                animCtx.map.obstaclePool.getPool(),
                                this.pos,
                                meleeDir,
                                meleeDist,
                                GameConfig.player.meleeHeight,
                                this.layer,
                                false
                            )
                        )
                    ) {
                        const teamId = animCtx.playerBarn.getPlayerInfo(playerCol.__id).teamId;
                        const vel = v2.rotate(
                            meleeDir,
                            ((Math.random() - 0.5) * Math.PI) / 3
                        );
                        const hitSound =
                            meleeDef.sound[args.playerHit] ||
                            meleeDef.sound.playerHit;
                        hits.push({
                            pen: col.pen,
                            prio: teamId == ourTeamId ? 2 : 0,
                            pos: v2.copy(playerCol.pos),
                            vel,
                            layer: playerCol.renderLayer,
                            zOrd: playerCol.renderZOrd,
                            particle: "bloodSplat",
                            sound: hitSound,
                            soundFn: "playSound"
                        });
                    }
                }
            }

            hits.sort((a, b) => {
                if (a.prio == b.prio) {
                    return b.pen - a.pen;
                } else {
                    return a.prio - b.prio;
                }
            });

            let hitCount = hits.length;
            if (!meleeDef.cleave) {
                hitCount = math.min(hitCount, 1);
            }

            for (let i = 0; i < hitCount; i++) {
                const hit = hits[i];
                animCtx.particleBarn.addParticle(
                    hit.particle,
                    hit.layer,
                    hit.pos,
                    hit.vel,
                    1,
                    Math.random() * Math.PI * 2,
                    null,
                    hit.zOrd + 1
                );
                animCtx.audioManager[hit.soundFn](hit.sound, {
                    channel: "hits",
                    soundPos: hit.pos,
                    layer: this.layer,
                    filter: "muffled"
                });
            }
        }
    }

    initSubmergeSprites() {
        const initSprite = function(sprite, img) {
            sprite.texture = PIXI.Texture.from(img);
            sprite.anchor.set(0.5, 0.5);
            sprite.tint = 16777215;
            sprite.alpha = 0;
            sprite.visible = false;
        };
        initSprite(this.bodySubmergeSprite, "player-wading-01.img");
        initSprite(this.handLSubmergeSprite, "player-hands-01.img");
        initSprite(this.handRSubmergeSprite, "player-hands-01.img");
        initSprite(this.footLSubmergeSprite, "player-feet-01.img");
        initSprite(this.footRSubmergeSprite, "player-feet-01.img");

        // submergeMaskScaleFactor reduces the number of verts generated
        // by PIXI.Graphics; we scale it back up to the world size remains
        // the same
        const mask = new PIXI.Graphics();
        mask.beginFill(0xff0000, 0.5);
        mask.drawCircle(0, 0, 38.0 * 2.0 * submergeMaskScaleFactor);
        mask.position.set(0, 0);
        this.bodySubmergeSprite.addChild(mask);
        this.bodySubmergeSprite.mask = mask;
        this.bodySubmergeSprite.scale.set(0.5, 0.5);
    }

    updateSubmersion(dt, map) {
        const inWater = this.surface.type == "water";

        // Compute submersion
        let submersionAmount = 0;
        if (inWater) {
            const river = this.surface.data.river;
            const inRiver = river && !map.isInOcean(this.pos);
            const dist = inRiver
                ? river.distanceToShore(this.pos)
                : map.distanceToShore(this.pos);
            const maxDist = inRiver ? 12 : 16;
            submersionAmount = math.remap(dist, 0, maxDist, 0.6, 1);
        }
        this.submersion = math.lerp(dt * 4, this.submersion, submersionAmount);

        // Update sprites
        const submersionAlpha = this.submersion * 0.8;
        const submersionScale = (0.9 - this.submersion * 0.4) * 2;
        const maskScale = 1 / (submersionScale * submergeMaskScaleFactor);
        this.bodySubmergeSprite.scale.set(submersionScale, submersionScale);
        this.bodySubmergeSprite.mask.scale.set(maskScale, maskScale);
        this.bodySubmergeSprite.alpha = submersionAlpha;
        this.bodySubmergeSprite.visible = submersionAlpha > 0.001;
        if (inWater) {
            this.bodySubmergeSprite.tint =
                this.surface.data.waterColor;
        }

        const limbs = [
            this.handLSubmergeSprite,
            this.handRSubmergeSprite,
            this.footLSubmergeSprite,
            this.footRSubmergeSprite
        ];
        for (
            let i = 0;
            i < limbs.length;
            i++
        ) {
            const limb = limbs[i];
            limb.alpha = this.downed ? submersionAlpha : 0;
            limb.visible = limb.alpha > 0.001;
            if (inWater) {
                limb.tint = this.surface.data.waterColor;
            }
        }
    }

    updateFrozenState(dt) {
        const fadeDuration = 0.25;
        if (this.netData.frozen) {
            this.frozenTicker = fadeDuration;
        } else {
            this.frozenTicker -= dt;
            this.updateFrozenImage = true;
        }
        this.bodyEffectSprite.alpha = this.netData.frozen
            ? 1
            : math.remap(this.frozenTicker, 0, fadeDuration, 0, 1);
        this.bodyEffectSprite.visible = this.frozenTicker > 0;
    }

    addRecoil(amount, leftHand, rightHand) {
        if (leftHand) {
            this.gunRecoilL += amount;
        }
        if (rightHand) {
            this.gunRecoilR += amount;
        }
    }

    /**
     * @param {import("../map").Map} map
     */
    isUnderground(map) {
        if (this.layer != 1) {
            return false;
        }
        const structures = map.structurePool.getPool();

        for (let i = 0; i < structures.length; i++) {
            const s = structures[i];
            if (s.layers.length >= 2) {
                const layer = s.layers[1];
                if (
                    collider.intersectCircle(
                        layer.collision,
                        this.pos,
                        this.rad
                    )
                ) {
                    return layer.underground;
                }
            }
        }
        return true;
    }
}

export class PlayerBarn {
    constructor() {
        this.playerPool = new Pool(Player);
        this.playerInfo = {};
        this.playerIds = [];
        this.teamInfo = {};
        this.groupInfo = {};
        this.playerStatus = {};
        this.anonPlayerNames = false;
    }

    onMapLoad(e) { }

    update(dt, activeId, r, renderer, particleBarn, camera, map, inputBinds, audioManager, ui2Manager, preventInput, displayingStats, isSpectating) {
        // Update players
        const players = this.playerPool.getPool();
        for (let i = 0; i < players.length; i++) {
            const p = players[i];
            if (p.active) {
                p.update(dt, this, map, audioManager, particleBarn, inputBinds, camera, renderer, ui2Manager, activeId, preventInput, displayingStats, isSpectating);
            }
        }

        //
        // Update player status data
        //
        // @HACK: Set the local player data; the server will only
        // send status updates when not in solo-mode. We may also
        // have not yet received an update for ourselves yet, but
        // we always expect the local data to be available.
        const activeInfo = this.getPlayerInfo(activeId);
        const activePlayer = this.getPlayerById(activeId);

        this.setPlayerStatus(activeId, {
            pos: v2.copy(activePlayer.netData.pos),
            health: activePlayer.localData.health,
            disconnected: false,
            dead: activePlayer.netData.dead,
            downed: activePlayer.netData.downed,
            role: activePlayer.netData.role,
            visible: true
        });

        const statusUpdateRate = getPlayerStatusUpdateRate(map.factionMode);
        const keys = Object.keys(this.playerStatus);
        for (
            let i = 0;
            i < keys.length;
            i++
        ) {
            const status = this.playerStatus[keys[i]];
            const playerId = status.playerId;
            const playerInfo = this.getPlayerInfo(playerId);

            const player = this.getPlayerById(playerId);
            if (player) {
                // Update data with latest position if on screen
                status.posDelta = v2.length(v2.sub(player.netData.pos, status.pos));
                status.posTarget = v2.copy(player.netData.pos);
                status.posInterp = math.clamp(
                    status.posInterp + dt * 0.2,
                    dt / statusUpdateRate,
                    1
                );
                status.dead = player.netData.dead;
                status.downed = player.netData.downed;
            } else {
                status.posInterp = dt / statusUpdateRate;
            }

            // Interpolate position
            const move = v2.sub(status.posTarget, status.pos);
            const moveLen = v2.length(move);
            const moveDir = moveLen > 0.0001 ? v2.div(move, moveLen) : v2.create(1, 0);
            const moveAmt = math.min(moveLen, status.posDelta * status.posInterp);
            status.pos = v2.add(status.pos, v2.mul(moveDir, moveAmt));

            status.timeSinceVisible += dt;
            status.timeSinceUpdate += dt;

            const fade =
                !status.dead ||
                    (playerInfo.teamId != activeInfo.teamId && status.role != "leader")
                    ? 0
                    : 0.6;

            status.minimapAlpha =
                math.smoothstep(status.timeSinceVisible, 0, 0.1) *
                math.lerp(
                    math.smoothstep(status.timeSinceUpdate, 2, 2.5),
                    1,
                    fade
                );

            // @HACK: Fix issue in non-faction mode when spectating and swapping
            // between teams. We don't want the old player indicators to fade out
            // after moving to the new team
            if (!map.factionMode && playerInfo.teamId != activeInfo.teamId) {
                status.minimapAlpha = 0;
            }
            status.minimapVisible = status.minimapAlpha > 0.01;
        }
    }

    render(camera, debug) {
        const players = this.playerPool.getPool();
        for (let i = 0; i < players.length; i++) {
            const p = players[i];
            if (p.active) {
                p.render(camera, debug);
            }
        }
    }

    /**
     * @returns {Player|null} The player object if found, otherwise null.
     */
    getPlayerById(id) {
        const pool = this.playerPool.getPool();
        for (let i = 0; i < pool.length; i++) {
            const p = pool[i];
            if (p.active && p.__id === id) {
                return p;
            }
        }
        return null;
    }

    setPlayerInfo(info) {
        this.playerInfo[info.playerId] = {
            playerId: info.playerId,
            teamId: info.teamId,
            groupId: info.groupId,
            name: info.name,
            nameTruncated: helpers.truncateString(
                info.name || "",
                "bold 16px arial",
                180
            ),
            anonName: `Player${info.playerId - 2750}`,
            loadout: util.cloneDeep(info.loadout)
        };
        this.playerIds.push(info.playerId);
        this.playerIds.sort((a, b) => {
            return a - b;
        });
    }

    deletePlayerInfo(id) {
        const idx = this.playerIds.indexOf(id);
        if (idx !== -1) {
            this.playerIds.splice(idx, 1);
        }
        delete this.playerInfo[id];
        delete this.playerStatus[id];
    }

    getPlayerInfo(id) {
        return (
            this.playerInfo[id] || {
                playerId: 0,
                group: 0,
                teamId: 0,
                name: "",
                nameTruncated: "",
                anonName: "",
                loadout: {}
            }
        );
    }

    recomputeTeamData() {
        this.teamInfo = {};
        this.groupInfo = {};

        const keys = Object.keys(this.playerInfo);
        for (
            let i = 0;
            i < keys.length;
            i++
        ) {
            const playerInfo = this.playerInfo[keys[i]];
            const playerId = playerInfo.playerId;

            const teamId = playerInfo.teamId;
            this.teamInfo[teamId] = this.teamInfo[teamId] || {
                teamId,
                playerIds: []
            };
            this.teamInfo[teamId].playerIds.push(playerId);

            const groupId = playerInfo.groupId;
            this.groupInfo[groupId] = this.groupInfo[groupId] || {
                groupId,
                playerIds: []
            };
            this.groupInfo[groupId].playerIds.push(playerId);
        }

        const teams = Object.keys(this.teamInfo);
        for (
            let i = 0;
            i < teams.length;
            i++
        ) {
            this.teamInfo[teams[i]].playerIds.sort((a, b) => {
                return a - b;
            });
        }

        const groups = Object.keys(this.groupInfo);
        for (
            let i = 0;
            i < groups.length;
            i++
        ) {
            this.groupInfo[groups[i]].playerIds.sort((a, b) => {
                return a - b;
            });
        }
    }

    getTeamInfo(teamId) {
        return this.teamInfo[teamId];
    }

    getGroupInfo(groupId) {
        return this.groupInfo[groupId];
    }

    updatePlayerStatus(teamId, playerStatus, factionMode) {
        // In factionMode, playerStatus refers to all playerIds in the game.
        // In all other modes, playerStatus refers to only playerIds in our team.
        const team = this.getTeamInfo(teamId);
        const playerIds = factionMode ? this.playerIds : team.playerIds;

        if (playerIds.length != playerStatus.players.length) {
            console.error(
                `PlayerIds and playerStatus.players out of sync. OurLen: ${playerIds.length} MsgLen: ${playerStatus.players.length} FactionMode: ${factionMode}`
            );
            return;
        }

        for (let o = 0; o < playerIds.length; o++) {
            const playerId = playerIds[o];
            const status = playerStatus.players[o];
            if (status.hasData) {
                this.setPlayerStatus(playerId, status);
            }
        }
    }

    setPlayerStatus(playerId, newStatus) {
        const status = this.playerStatus[playerId] || {
            playerId,
            pos: v2.copy(newStatus.pos),
            posTarget: v2.copy(newStatus.pos),
            posDelta: v2.create(0, 0),
            health: 100,
            posInterp: 0,
            visible: false,
            dead: false,
            downed: false,
            disconnected: false,
            role: "",
            timeSinceUpdate: 0,
            timeSinceVisible: 0,
            minimapAlpha: 0,
            minimapVisible: false
        };

        if (!status.minimapVisible) {
            status.pos = v2.copy(newStatus.pos);
            if (!status.visible && newStatus.visible) {
                status.timeSinceVisible = 0;
            }
        }

        status.visible = newStatus.visible;
        if (status.visible) {
            status.timeSinceUpdate = 0;
        }

        status.posTarget = v2.copy(newStatus.pos);
        status.posDelta = v2.length(v2.sub(newStatus.pos, status.pos));
        status.dead = newStatus.dead;
        status.downed = newStatus.downed;
        status.role = newStatus.role;
        if (newStatus.health !== undefined) {
            status.health = newStatus.health;
        }
        if (newStatus.disconnected !== undefined) {
            status.disconnected = newStatus.disconnected;
        }
        this.playerStatus[playerId] = status;
    }

    getPlayerStatus(playerId) {
        return this.playerStatus[playerId];
    }

    updateGroupStatus(groupId, groupStatus) {
        const info = this.getGroupInfo(groupId);
        if (info.playerIds.length != groupStatus.players.length) {
            console.error(
                "PlayerIds and groupStatus.players out of sync"
            );
            return;
        }
        for (let i = 0; i < info.playerIds.length; i++) {
            const playerId = info.playerIds[i];
            const playerStatus = groupStatus.players[i];

            // Stash groupStatus values into playerStatus
            const status = this.getPlayerStatus(playerId);
            if (status) {
                status.health = playerStatus.health;
                status.disconnected = playerStatus.disconnected;
            }
        }
    }

    getGroupColor(playerId) {
        const playerInfo = this.getPlayerInfo(playerId);
        const group = this.getGroupInfo(playerInfo.groupId);
        const groupIdx = group ? group.playerIds.indexOf(playerId) : 0;
        if (groupIdx >= 0 && groupIdx < GameConfig.groupColors.length) {
            return GameConfig.groupColors[groupIdx];
        } else {
            return 0xFFFFFF;
        }
    }

    getTeamColor(teamId) {
        const teamIdx = teamId - 1;
        if (teamIdx >= 0 && teamIdx < GameConfig.teamColors.length) {
            return GameConfig.teamColors[teamIdx];
        } else {
            return 0xFFFFFF;
        }
    }

    getPlayerName(playerId, activePlayerId, truncateForKillfeed) {
        const info = this.getPlayerInfo(playerId);
        if (!info) {
            return "";
        }
        let name = info.name;

        if (truncateForKillfeed) {
            name = info.nameTruncated;
        }

        // Anonymize player name if they aren't in the active player's group
        if (
            this.anonPlayerNames &&
            this.getPlayerInfo(activePlayerId).groupId != info.groupId
        ) {
            name = info.anonName;
        }
        return name;
    }

    addDeathEffect(targetId, killerId, r, audioManager, particleBarn) {
        const target = this.getPlayerById(targetId);
        const killer = this.getPlayerById(killerId);
        if (target && killer?.hasPerk("turkey_shoot")) {
            audioManager.playGroup("cluck", {
                soundPos: target.pos,
                layer: target.layer,
                muffled: true
            });
            audioManager.playSound("feather_01", {
                channel: "sfx",
                soundPos: target.pos,
                layer: target.layer,
                muffled: true
            });
            const numParticles = Math.floor(util.random(30, 35));
            for (
                let i = 0;
                i < numParticles;
                i++
            ) {
                const vel = v2.mul(v2.randomUnit(), util.random(5, 15));
                particleBarn.addParticle(
                    "turkeyFeathersDeath",
                    target.layer,
                    target.pos,
                    vel
                );
            }
        }
    }
}

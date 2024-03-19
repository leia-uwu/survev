import * as PIXI from "pixi.js";
import { collider } from "../../../shared/utils/collider";
import { GameConfig } from "../../../shared/gameConfig";
import gameObject from "../../../shared/utils/gameObject";
import loadouts from "./loadouts";
import { math } from "../../../shared/utils/math";
import { v2 } from "../../../shared/utils/v2";
import { device } from "../device";
import { Camera } from "../camera";
import { debugLines } from "../debugLines";
import { DecalBarn } from "../objects/decal";
import { Map } from "../map";
import { ParticleBarn } from "../objects/particles";
import { Renderer } from "../renderer";
import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";
import { PlayerBarn } from "../objects/player";
import { SmokeBarn } from "../objects/smoke";
import { Creator } from "../objects/objectPool";

class LoadoutDisplay {
    /**
     * @param {import("../audioManager").AudioManager} audioManager
     * @param {import("../config").ConfigManager} config
     * @param {import("../inputBinds").InputBinds} inputBinds
     * @param {import("../inputBinds").InputBindUi} inputBindUi
    */
    constructor(e, audioManager, config, inputBinds, account) {
        this.active = false;
        this.initialized = false;
        this.pixi = e;
        this.audioManager = audioManager;
        this.config = config;
        this.inputBinds = inputBinds;
        this.account = account;
    }

    o() {
        const This = this;
        this.canvasMode =
            this.pixi.renderer.type == PIXI.RENDERER_TYPE.CANVAS;
        this.camera = new Camera();
        this.renderer = new Renderer(this, this.canvasMode);
        this.particleBarn = new ParticleBarn(this.renderer);
        this.decalBarn = new DecalBarn();
        this.map = new Map(this.decalBarn);
        this.playerBarn = new PlayerBarn();
        this.smokeBarn = new SmokeBarn();

        // Register types
        const TypeToPool = {
            [gameObject.Type.Player]: this.playerBarn.playerPool,
            [gameObject.Type.Obstacle]: this.map.Ve,
            [gameObject.Type.Building]: this.map.nr,
            [gameObject.Type.Structure]: this.map.lr,
            [gameObject.Type.Decal]: this.decalBarn._,
            [gameObject.Type.Smoke]: this.smokeBarn.e
        };

        this.objectCreator = new Creator();
        for (const type in TypeToPool) {
            if (TypeToPool.hasOwnProperty(type)) {
                this.objectCreator.registerType(type, TypeToPool[type]);
            }
        }

        // Render ordering
        this.debugDisplay = new PIXI.Graphics();

        const pixiContainers = [
            this.map.display.ground,
            this.renderer.layers[0],
            this.renderer.ground,
            this.renderer.layers[1],
            this.renderer.layers[2],
            this.renderer.layers[3],
            this.debugDisplay
        ];
        for (
            let n = 0;
            n < pixiContainers.length;
            n++
        ) {
            const container = pixiContainers[n];
            if (container) {
                container.interactiveChildren = false;
                this.pixi.stage.addChild(container);
            }
        }

        this.loadout = loadouts.defaultLoadout();
        this.setLoadout(this.loadout);
        this.view = "outfit";
        this.viewOld = this.view;
        this.cameraOffset = v2.create(0, 0);
        this.q = 1;
        this.debugZoom = 1;
        this.useDebugZoom = false;

        this.outfitOld = this.loadout.outfit;

        this.map.loadMap(
            {
                grassInset: 18,
                groundPatches: [],
                height: 720,
                mapName: "main",
                objects: [],
                places: [],
                rivers: [],
                seed: 218051654,
                shoreInset: 48,
                width: 720
            },
            this.camera,
            this.canvasMode,
            this.particleBarn
        );

        this.activeId = 98;
        this.dr = this.playerBarn.u(this.activeId);
        this.dr.setLocalData(
            {
                boost: 100,
                boostDirty: true,
                hasAction: false,
                health: 100,
                inventoryDirty: false,
                scopedIn: false,
                spectatorCountDirty: false,
                weapsDirty: true,
                curWeapIdx: 2,
                weapons: [
                    {
                        name: "",
                        ammo: 0
                    },
                    {
                        name: "",
                        ammo: 0
                    },
                    {
                        name: "bayonet_rugged",
                        ammo: 0
                    },
                    {
                        name: "",
                        ammo: 0
                    }
                ]
            },
            this.playerBarn
        );

        this.dr.layer = this.dr.netData.pe;
        this.dr.isLoadoutAvatar = true;
        this.renderer.setActiveLayer(this.dr.layer);
        this.audioManager.activeLayer = this.dr.layer;

        // Idle anim ticker
        this.animIdleTicker = 3;
        this.animSeq = 0;
        this.actionSeq = 0;

        this.hide();
        this.account.addEventListener("loadout", (e) => {
            This.setLoadout(e, true);
        });

        this.setLoadout(this.account.loadout, true);

        this.initialized = true;

        this.resize();
    }

    n() {
        if (this.initialized) {
            this.map.free();
            this.particleBarn.free();
            this.renderer.free();
            while (this.pixi.stage.children.length > 0) {
                const e = this.pixi.stage.children[0];
                this.pixi.stage.removeChild(e);
                e.destroy({
                    children: true
                });
            }
        }
        this.initialized = false;
    }

    setLoadout(loadout, skipEffects) {
        this.loadout = loadouts.validate(loadout);
        this.updateCharDisplay();
        if (skipEffects) {
            this.outfitOld = this.loadout.outfit;
        }
        if (this.dr) {
            this.dr.playActionStartSfx = true;
        }
        this.animIdleTicker = 0;
    }

    setView(view) {
        this.viewOld = this.view;
        this.view = view;
    }

    updateCharDisplay(options = {}) {
        const ctx = {
            audioManager: this.audioManager,
            renderer: this.renderer,
            particleBarn: this.particleBarn,
            map: this.map,
            smokeBarn: this.smokeBarn,
            decalBarn: this.decalBarn
        };

        // HACK: clear the player particle emitter and reset the anim counter
        if (this.dr?.useItemEmitter) {
            this.dr.useItemEmitter.stop();
            this.dr.useItemEmitter = null;
            this.animIdleTicker = 0;
        }

        const obj = {
            outfit: this.loadout.outfit,
            backpack: "backpack02",
            helmet: "helmet01",
            chest: "chest03",
            activeWeapon: this.loadout.melee,
            layer: 0,
            dead: false,
            downed: false,
            animType: options.animType || 0,
            animSeq: options.animSeq || 0,
            actionSeq: options.actionSeq || 0,
            actionType: options.actionType || 0,
            actionItem: options.actionItem || "",
            wearingPan: false,
            healEffect: false,
            frozen: false,
            frozenOri: 0,
            hasteType: 0,
            hasteSeq: 0,
            scale: 1,
            role: "",
            perks: [],
            $r: false
        };
        obj.pos = v2.create(50, 50);
        obj.dir = v2.create(0, -1);

        this.objectCreator.updateObjFull(1, 98, obj, ctx);

        this.playerBarn.setPlayerInfo({
            playerId: 98,
            teamId: 0,
            groupId: 0,
            name: "",
            loadout: {
                heal: this.loadout.heal,
                boost: this.loadout.boost
            }
        });
    }

    getCameraTargetZoom() {
        return (
            ((document
                .getElementById("modal-content-left")
                .getBoundingClientRect().height /
                this.camera.screenHeight) *
                0.2 *
                this.camera.screenHeight *
                0.5) /
            this.camera.ppu
        );
    }

    getCameraLoadoutOffset() {
        const zoomPrev = this.camera.O;

        const targetZoom = this.getCameraTargetZoom();
        this.camera.O = targetZoom;

        const modal = document.getElementById("modal-content-left");
        const modalBound = modal.getBoundingClientRect();
        const modalAabb = collider.createAabb(
            this.camera.screenToPoint(v2.create(modalBound.left, modalBound.top + modalBound.height)),
            this.camera.screenToPoint(v2.create(modalBound.left + modalBound.width, modalBound.top))
        );
        const modalExt = v2.mul(v2.sub(modalAabb.max, modalAabb.min), 0.5);
        const modalPos = v2.add(modalAabb.min, modalExt);

        const screenAabb = collider.createAabb(
            this.camera.screenToPoint(v2.create(0, this.camera.screenHeight)),
            this.camera.screenToPoint(v2.create(this.camera.screenWidth, 0))
        );

        const screenExt = v2.mul(v2.sub(screenAabb.max, screenAabb.min), 0.5);
        const screenPos = v2.add(screenAabb.min, screenExt);
        const modalOffset = v2.sub(modalPos, screenPos);
        const viewWidth = screenExt.x - modalOffset.x - modalExt.x;
        const offsetX = math.clamp(viewWidth * 0.5, 2.5, 6);
        const offsetY = 0.33;
        const offset = v2.create(modalOffset.x + modalExt.x + offsetX, modalOffset.y + offsetY);
        this.camera.O = zoomPrev;
        return offset;
    }

    show() {
        if (!this.active) {
            this.active = true;
            this.resize();
        }
    }

    hide() {
        if (this.active) {
            this.active = false;
            this.camera.O = 2;
        }
    }

    m(dt, hasFocus) {
        const debug = {};
        debug.render = debug.render || {};

        // Camera
        this.camera.pos = v2.sub(this.dr.pos, this.cameraOffset);
        this.camera.O = math.lerp(dt * 5, this.camera.O, this.camera.q);

        this.audioManager.cameraPos = v2.copy(this.camera.pos);

        // DebugLines.addAabb(modalAabb.min, modalAabb.max, 0xff0000, 0.0);
        // DebugLines.addCircle(this.m_activePlayer.pos, 1.5, 0xff0000, 0.0);

        if (
            hasFocus &&
            (this.view == this.viewOld ||
                (this.view != "heal" && this.view != "boost") ||
                (this.animIdleTicker = 0),
            (this.viewOld = this.view),
            (this.animIdleTicker -= dt),
            this.animIdleTicker < 0)
        ) {
            if (this.view == "heal") {
                this.actionSeq = (this.actionSeq + 1) % 8;
                const options = {
                    actionType: GameConfig.Action.UseItem,
                    actionItem: "bandage",
                    actionSeq: this.actionSeq
                };
                this.updateCharDisplay(options);
                this.animIdleTicker = 2 + Math.random();
            } else if (this.view == "boost") {
                this.actionSeq = (this.actionSeq + 1) % 8;
                const options = {
                    actionType: GameConfig.Action.UseItem,
                    actionItem: "soda",
                    actionSeq: this.actionSeq
                };
                this.updateCharDisplay(options);
                this.animIdleTicker = 2 + Math.random();
            } else if (
                this.view != "emote" &&
                this.view != "crosshair"
            ) {
                this.animSeq = (this.animSeq + 1) % 8;
                const options = {
                    animType: GameConfig.Anim.Melee,
                    animSeq: this.animSeq
                };
                this.updateCharDisplay(options);
                this.animIdleTicker = 1.5 + Math.random();
            }
        }

        // Play a sound when changing oufits
        const outfitDirty = this.loadout.outfit != this.outfitOld;
        this.outfitOld = this.loadout.outfit;
        if (hasFocus && outfitDirty) {
            const itemDef = GameObjectDefs[this.loadout.outfit];
            if (itemDef) {
                this.audioManager.playSound(itemDef.sound.pickup, {
                    channel: "ui"
                });
            }
        }
        this.playerBarn.m(
            dt,
            this.activeId,
            this.teamMode,
            this.renderer,
            this.particleBarn,
            this.camera,
            this.map,
            this.inputBinds,
            this.audioManager,
            false,
            false,
            false
        );
        this.smokeBarn.update(dt, this.camera, this.dr, this.map, this.renderer);
        this.particleBarn.update(dt, this.camera, debug);
        this.decalBarn.update(dt, this.camera, this.renderer, debug);
        this.renderer.update(dt, this.camera, this.map, debug);
        this.dr.playActionStartSfx = false;

        this.render(dt, debug);
    }

    render(dt, debug) {
        const grassColor = this.map.mapLoaded
            ? this.map.getMapDef().biome.colors.grass
            : 8433481;

        this.pixi.renderer.background.color = grassColor;

        // Module rendering
        this.playerBarn.render(this.camera, debug);
        this.map.render(this.camera);

        debugLines.flush();
    }

    resize() {
        if (this.initialized) {
            this.camera.screenWidth = device.screenWidth;
            this.camera.screenHeight = device.screenHeight;
            this.map.resize(this.pixi.renderer, this.canvasMode);
            this.renderer.resize(this.map, this.camera);
            this.camera.q = this.getCameraTargetZoom();
            this.cameraOffset = this.getCameraLoadoutOffset();
        }
    }
}
export default {
    LoadoutDisplay
};

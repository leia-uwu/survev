import * as PIXI from "pixi.js";
import { collider } from "../../shared/utils/collider";
import { GameConfig } from "../../shared/gameConfig";
import gameObject from "../../shared/utils/gameObject";
import loadouts from "./loadouts";
import { math } from "../../shared/utils/math";
import { v2 } from "../../shared/utils/v2";
import device from "./device";
import camera from "./camera";
import debugLines from "./debugLines";
import decal from "./objects/decal";
import map from "./map";
import objectPool from "./objects/objectPool";
import particles from "./objects/particles";
import Player from "./objects/player";
import renderer from "./renderer";
import Smoke from "./objects/Smoke";
import { GameObjectDefs } from "../../shared/defs/gameObjectDefs";

function a(e, t, r) {
    if (t in e) {
        Object.defineProperty(e, t, {
            value: r,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        e[t] = r;
    }
    return e;
}
function LoadoutDisplay(e, t, r, a, i) {
    this.active = false;
    this.initialized = false;
    this.pixi = e;
    this.ft = t;
    this.config = r;
    this.xt = a;
    this.account = i;
}

LoadoutDisplay.prototype = {
    o: function() {
        let e;
        const t = this;
        this.canvasMode =
            this.pixi.renderer.type == PIXI.RENDERER_TYPE.CANVAS;
        this.De = new camera();
        this.Ct = new renderer.At(this, this.canvasMode);
        this.Ot = new particles.ParticleBarn(this.Ct);
        this.Dt = new decal.DecalBarn();
        this.Et = new map.Bt(this.Dt);
        this.Rt = new Player.Lt();
        this.Kt = new Smoke.SmokeBarn();
        e = {};
        a(e, gameObject.Type.Player, this.Rt.$e);
        a(e, gameObject.Type.Obstacle, this.Et.Ve);
        a(e, gameObject.Type.Building, this.Et.nr);
        a(e, gameObject.Type.Structure, this.Et.lr);
        a(e, gameObject.Type.Decal, this.Dt._);
        a(e, gameObject.Type.Smoke, this.Kt.e);
        const r = e;
        this.mr = new objectPool.Creator();
        for (const i in r) {
            if (r.hasOwnProperty(i)) {
                this.mr.registerType(i, r[i]);
            }
        }
        this.debugDisplay = new PIXI.Graphics();
        for (
            let s = [
                    this.Et.display.ground,
                    this.Ct.layers[0],
                    this.Ct.ground,
                    this.Ct.layers[1],
                    this.Ct.layers[2],
                    this.Ct.layers[3],
                    this.debugDisplay
                ],
                n = 0;
            n < s.length;
            n++
        ) {
            const m = s[n];
            if (m) {
                m.interactiveChildren = false;
                this.pixi.stage.addChild(m);
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
        this.Et.loadMap(
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
            this.De,
            this.canvasMode,
            this.Ot
        );
        this.hr = 98;
        this.dr = this.Rt.u(this.hr);
        this.dr.Mr(
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
            this.Rt
        );
        this.dr.layer = this.dr.Le.pe;
        this.dr.isLoadoutAvatar = true;
        this.Ct.setActiveLayer(this.dr.layer);
        this.ft.activeLayer = this.dr.layer;
        this.animIdleTicker = 3;
        this.animSeq = 0;
        this.actionSeq = 0;
        this.hide();
        this.account.addEventListener("loadout", (e) => {
            t.setLoadout(e, true);
        });
        this.setLoadout(this.account.loadout, true);
        this.initialized = true;
        this.xr();
    },
    n: function() {
        if (this.initialized) {
            this.Et.n();
            this.Ot.n();
            this.Ct.n();
            while (this.pixi.stage.children.length > 0) {
                const e = this.pixi.stage.children[0];
                this.pixi.stage.removeChild(e);
                e.destroy({
                    children: true
                });
            }
        }
        this.initialized = false;
    },
    setLoadout: function(e, t) {
        this.loadout = loadouts.validate(e);
        this.updateCharDisplay();
        if (t) {
            this.outfitOld = this.loadout.outfit;
        }
        if (this.dr) {
            this.dr.playActionStartSfx = true;
        }
        this.animIdleTicker = 0;
    },
    setView: function(e) {
        this.viewOld = this.view;
        this.view = e;
    },
    updateCharDisplay: function(e = {}) {
        const t = {
            audioManager: this.ft,
            renderer: this.Ct,
            particleBarn: this.Ot,
            map: this.Et,
            smokeBarn: this.Kt,
            decalBarn: this.Dt
        };
        if (this.dr?.useItemEmitter) {
            this.dr.useItemEmitter.stop();
            this.dr.useItemEmitter = null;
            this.animIdleTicker = 0;
        }
        const r = {
            se: this.loadout.outfit,
            ne: "backpack02",
            le: "helmet01",
            ce: "chest03",
            me: this.loadout.melee,
            pe: 0,
            he: false,
            ue: false,
            ge: e.animType || 0,
            ye: e.animSeq || 0,
            fe: e.actionSeq || 0,
            we: e.actionType || 0,
            ze: e.actionItem || "",
            _e: false,
            be: false,
            xe: false,
            Se: 0,
            ve: 0,
            ke: 0,
            Ie: 1,
            Te: "",
            Me: [],
            $r: false
        };
        r.ie = v2.create(50, 50);
        r.oe = v2.create(0, -1);
        this.mr.updateObjFull(1, 98, r, t);
        this.Rt.vr({
            playerId: 98,
            teamId: 0,
            groupId: 0,
            name: "",
            loadout: {
                heal: this.loadout.heal,
                boost: this.loadout.boost
            }
        });
    },
    getCameraTargetZoom: function() {
        return (
            ((document
                .getElementById("modal-content-left")
                .getBoundingClientRect().height /
                this.De.screenHeight) *
                0.2 *
                this.De.screenHeight *
                0.5) /
            this.De.ppu
        );
    },
    getCameraLoadoutOffset: function() {
        const e = this.De.O;
        const t = this.getCameraTargetZoom();
        this.De.O = t;
        const r = document.getElementById("modal-content-left");
        const a = r.getBoundingClientRect();
        const i = collider.createAabb(
            this.De.j(v2.create(a.left, a.top + a.height)),
            this.De.j(v2.create(a.left + a.width, a.top))
        );
        const o = v2.mul(v2.sub(i.max, i.min), 0.5);
        const n = v2.add(i.min, o);
        const l = collider.createAabb(
            this.De.j(v2.create(0, this.De.screenHeight)),
            this.De.j(v2.create(this.De.screenWidth, 0))
        );
        const c = v2.mul(v2.sub(l.max, l.min), 0.5);
        const h = v2.add(l.min, c);
        const d = v2.sub(n, h);
        const u = c.x - d.x - o.x;
        const g = math.clamp(u * 0.5, 2.5, 6);
        const y = v2.create(d.x + o.x + g, d.y + 0.33);
        this.De.O = e;
        return y;
    },
    show: function() {
        if (!this.active) {
            this.active = true;
            this.xr();
        }
    },
    hide: function() {
        if (this.active) {
            this.active = false;
            this.De.O = 2;
        }
    },
    m: function(e, t) {
        const r = {};
        r.render = r.render || {};
        this.De.pos = v2.sub(this.dr.pos, this.cameraOffset);
        this.De.O = math.lerp(e * 5, this.De.O, this.De.q);
        this.ft.cameraPos = v2.copy(this.De.pos);
        if (
            t &&
            (this.view == this.viewOld ||
                (this.view != "heal" && this.view != "boost") ||
                (this.animIdleTicker = 0),
            (this.viewOld = this.view),
            (this.animIdleTicker -= e),
            this.animIdleTicker < 0)
        ) {
            if (this.view == "heal") {
                this.actionSeq = (this.actionSeq + 1) % 8;
                const a = {
                    actionType: GameConfig.Action.UseItem,
                    actionItem: "bandage",
                    actionSeq: this.actionSeq
                };
                this.updateCharDisplay(a);
                this.animIdleTicker = 2 + Math.random();
            } else if (this.view == "boost") {
                this.actionSeq = (this.actionSeq + 1) % 8;
                const i = {
                    actionType: GameConfig.Action.UseItem,
                    actionItem: "soda",
                    actionSeq: this.actionSeq
                };
                this.updateCharDisplay(i);
                this.animIdleTicker = 2 + Math.random();
            } else if (
                this.view != "emote" &&
                this.view != "crosshair"
            ) {
                this.animSeq = (this.animSeq + 1) % 8;
                const o = {
                    animType: GameConfig.Anim.Melee,
                    animSeq: this.animSeq
                };
                this.updateCharDisplay(o);
                this.animIdleTicker = 1.5 + Math.random();
            }
        }
        const s = this.loadout.outfit != this.outfitOld;
        this.outfitOld = this.loadout.outfit;
        if (t && s) {
            const l = GameObjectDefs[this.loadout.outfit];
            if (l) {
                this.ft.playSound(l.sound.pickup, {
                    channel: "ui"
                });
            }
        }
        this.Rt.m(
            e,
            this.hr,
            this.teamMode,
            this.Ct,
            this.Ot,
            this.De,
            this.Et,
            this.xt,
            this.ft,
            false,
            false,
            false
        );
        this.Kt.m(e, this.De, this.dr, this.Et, this.Ct);
        this.Ot.m(e, this.De, r);
        this.Dt.m(e, this.De, this.Ct, r);
        this.Ct.m(e, this.De, this.Et, r);
        this.dr.playActionStartSfx = false;
        this.br(e, r);
    },
    br: function(e, t) {
        const r = this.Et.mapLoaded
            ? this.Et.getMapDef().biome.colors.grass
            : 8433481;
        this.pixi.renderer.backgroundColor = r;
        this.Rt.render(this.De, t);
        this.Et.render(this.De);
        debugLines.flush();
    },
    xr: function() {
        if (this.initialized) {
            this.De.screenWidth = device.screenWidth;
            this.De.screenHeight = device.screenHeight;
            this.Et.resize(this.pixi.renderer, this.canvasMode);
            this.Ct.resize(this.Et, this.De);
            this.De.q = this.getCameraTargetZoom();
            this.cameraOffset = this.getCameraLoadoutOffset();
        }
    }
};
export default {
    LoadoutDisplay
};

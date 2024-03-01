import * as PIXI from "pixi.js";
import { GameConfig } from "../../shared/gameConfig";
import GameObject from "../../shared/utils/gameObject";
import { mapHelpers } from "../../shared/utils/mapHelpers";
import { math } from "../../shared/utils/math";
import net from "../../shared/net";
import { v2 } from "../../shared/utils/v2";
import device from "./device";
import helpers from "./helpers";
import proxy from "./proxy";
import { RoleDefs } from "../../shared/defs/gameObjects/roleDefs";
import { GameObjectDefs } from "../../shared/defs/gameObjectDefs";
import Aidrop from "./objects/aidrop";
import Bullet from "./objects/bullet";
import Camera from "./camera";
import DeadBody from "./objects/deadBody";
import debugLines from "./debugLines";
import Decal from "./objects/decal";
import emote from "./emote";
import Explosion from "./objects/explosion";
import Flare from "./objects/flare";
import Gas from "./gas";
import input from "./input";
import Loot from "./objects/loot";
import Map from "./map";
import ObjectPool from "./objects/objectPool";
import Particles from "./objects/particles";
import Plane from "./objects/plane";
import Player from "./objects/player";
import Shot from "./objects/shot";
import Projectile from "./objects/projectile";
import Smoke from "./objects/Smoke";
import Renderer from "./renderer";
import Touch from "./touch";
import Ui from "./ui";
import Ui2 from "./ui2";

const Input = GameConfig.Input;

export class Game {
    constructor(pixi, ft, localization, config, i, o, s, l, resourceManager, onJoin, onQuit) {
        this.initialized = false;
        this.teamMode = 0;
        this.onJoin = onJoin;
        this.onQuit = onQuit;
        this.pixi = pixi;
        this.ft = ft;
        this._t = l;
        this.localization = localization;
        this.config = config;
        this.bt = i;
        this.xt = o;
        this.St = s;
        this.resourceManager = resourceManager;
        this.victoryMusic = null;
        this.ws = null;
        this.connecting = false;
        this.connected = false;
    }

    tryJoinGame(e, t, r, a, i) {
        const o = this;
        if (
            !this.connecting &&
            !this.connected &&
            !this.initialized
        ) {
            if (this.ws) {
                this.ws.onerror = function() { };
                this.ws.onopen = function() { };
                this.ws.onmessage = function() { };
                this.ws.onclose = function() { };
                this.ws.close();
                this.ws = null;
            }
            this.connecting = true;
            this.connected = false;
            try {
                this.ws = new WebSocket(e);
                this.ws.binaryType = "arraybuffer";
                this.ws.onerror = function(e) {
                    o.ws?.close();
                };
                this.ws.onopen = function() {
                    o.connecting = false;
                    o.connected = true;
                    const e = o.config.get("playerName");
                    const i = new net.JoinMsg();
                    i.protocol = GameConfig.protocolVersion;
                    i.matchPriv = t;
                    i.loadoutPriv = r;
                    i.questPriv = a;
                    i.name = e;
                    i.useTouch = device.touch;
                    i.isMobile = device.mobile || window.mobile;
                    i.proxy = !/.*surviv\.io$/.test(
                        window.location.hostname
                    );
                    i.otherProxy = !proxy.authLocation();
                    i.bot = false;
                    o.$(net.Msg.Join, i, 8192);
                };
                this.ws.onmessage = function(e) {
                    for (let t = new net.MsgStream(e.data); ;) {
                        const r = t.deserializeMsgType();
                        if (r == net.Msg.None) {
                            break;
                        }
                        o.onMsg(r, t.getStream());
                    }
                };
                this.ws.onclose = function() {
                    const e = o.uiManager?.displayingStats;
                    const t = o.connecting;
                    const r = o.connected;
                    o.connecting = false;
                    o.connected = false;
                    if (t) {
                        i();
                    } else if (r && !o.gameOver && !e) {
                        const a =
                            o.disconnectMsg || "index-host-closed";
                        console.log(a);
                        o.onQuit(a);
                    }
                };
            } catch (e) {
                this.connecting = false;
                this.connected = false;
                i();
            }
        }
    }

    init() {
        this.canvasMode = this.pixi.renderer.type == PIXI.RENDERER_TYPE.CANVAS;
        this.I = false;
        this.It = 0;
        this.U = false;
        this.Tt = false;
        this.touch = new Touch.Touch(this.bt, this.config);
        this.camera = new Camera();
        this.renderer = new Renderer.Renderer(this, this.canvasMode);
        this.particleBarn = new Particles.ParticleBarn(this.renderer);
        this.decalBarn = new Decal.DecalBarn();
        this.map = new Map.Map(this.decalBarn);
        this.playerBarn = new Player.PlayerBarn();
        this.bulletBarn = new Bullet.BulletBarn();
        this.flareBarn = new Flare.FlareBarn();
        this.projectileBarn = new Projectile.ProjectileBarn();
        this.explosionBarn = new Explosion.ExplosionBarn();
        this.planeBarn = new Plane.PlaneBarn(this.ft);
        this.airdropBarn = new Aidrop.AirdropBarn();
        this.smokeBarn = new Smoke.SmokeBarn();
        this.deadBodyBarn = new DeadBody.DeadBodyBarn();
        this.lootBarn = new Loot.LootBarn();
        this.gas = new Gas.Gas(this.canvasMode);
        this.uiManager = new Ui.He(
            this,
            this.ft,
            this.particleBarn,
            this.planeBarn,
            this.localization,
            this.canvasMode,
            this.touch,
            this.xt,
            this.St
        );
        this.ui2Manager = new Ui2.Ui2(this.localization, this.xt);
        this.emoteBarn = new emote.EmoteBarn(
            this.ft,
            this.uiManager,
            this.playerBarn,
            this.camera,
            this.map
        );
        this.shotBarn = new Shot.ShotBarn(this.particleBarn, this.ft, this.uiManager);
        const t = {
            [GameObject.Type.Player]: this.playerBarn.$e,
            [GameObject.Type.Obstacle]: this.map.Ve,
            [GameObject.Type.Loot]: this.lootBarn.sr,
            [GameObject.Type.DeadBody]: this.deadBodyBarn.ot,
            [GameObject.Type.Building]: this.map.nr,
            [GameObject.Type.Structure]: this.map.lr,
            [GameObject.Type.Decal]: this.decalBarn._,
            [GameObject.Type.Projectile]: this.projectileBarn.cr,
            [GameObject.Type.Smoke]: this.smokeBarn.e,
            [GameObject.Type.Airdrop]: this.airdropBarn.re
        };
        this.objectCreator = new ObjectPool.Creator();
        for (const r in t) {
            if (t.hasOwnProperty(r)) {
                this.objectCreator.registerType(r, t[r]);
            }
        }
        this.debugDisplay = new PIXI.Graphics();
        for (
            let i = [
                    this.map.display.ground,
                    this.renderer.layers[0],
                    this.renderer.ground,
                    this.renderer.layers[1],
                    this.renderer.layers[2],
                    this.renderer.layers[3],
                    this.debugDisplay,
                    this.gas.gasRenderer.display,
                    this.touch.container,
                    this.emoteBarn.container,
                    this.uiManager.container,
                    this.uiManager.Pe.container,
                    this.emoteBarn.indContainer
                ],
                s = 0;
            s < i.length;
            s++
        ) {
            const n = i[s];
            if (n) {
                n.interactiveChildren = false;
                this.pixi.stage.addChild(n);
            }
        }
        this.disconnectMsg = "";
        this.playing = false;
        this.gameOver = false;
        this.spectating = false;
        this.inputMsgTimeout = 0;
        this.prevInputMsg = new net.InputMsg();
        this.playingTicker = 0;
        this.updateRecvCount = 0;
        this.updatePass = false;
        this.updatePassDelay = 0;
        this.pr = 0;
        this.hr = 0;
        this.dr = null;
        this.ur = false;
        this.q = 1;
        this.debugZoom = 1;
        this.useDebugZoom = false;
        this.seq = 0;
        this.seqInFlight = false;
        this.seqSendTime = 0;
        this.pings = [];
        this.debugPingTime = 0;
        this.camera.setShakeEnabled(this.config.get("screenShake"));
        this.playerBarn.anonPlayerNames =
            this.config.get("anonPlayerNames");
        this.initialized = true;
    }

    free() {
        if (this.ws) {
            this.ws.onmessage = function() { };
            this.ws.close();
            this.ws = null;
        }
        this.connecting = false;
        this.connected = false;
        if (this.initialized) {
            this.initialized = false;
            this.updatePass = false;
            this.updatePassDelay = 0;
            this.emoteBarn.free();
            this.ui2Manager.free();
            this.uiManager.free();
            this.gas.free();
            this.airdropBarn.free();
            this.planeBarn.free();
            this.map.free();
            this.particleBarn.free();
            this.renderer.free();
            this.bt.n();
            this.ft.stopAll();
            while (this.pixi.stage.children.length > 0) {
                const e = this.pixi.stage.children[0];
                this.pixi.stage.removeChild(e);
                e.destroy({
                    children: true
                });
            }
        }
    }

    warnPageReload() {
        return (
            this.initialized &&
            this.playing &&
            !this.spectating &&
            !this.uiManager.displayingStats
        );
    }

    update(e) {
        const t = this.smokeBarn.particles;
        const r = this.map.Ve.p();
        let a = 0;
        this.I = true;
        const i = {};
        i.render = i.render || {};
        if (this.playing) {
            this.playingTicker += e;
        }
        this.playerBarn.m(
            e,
            this.hr,
            this.teamMode,
            this.renderer,
            this.particleBarn,
            this.camera,
            this.map,
            this.xt,
            this.ft,
            this.ui2Manager,
            this.emoteBarn.wheelKeyTriggered,
            this.uiManager.displayingStats,
            this.spectating
        );
        this.updateAmbience();
        this.camera.pos = v2.copy(this.dr.pos);
        this.camera.applyShake();
        const o = this.dr.yr();
        const l = math.min(this.camera.screenWidth, this.camera.screenHeight);
        const g = math.max(this.camera.screenWidth, this.camera.screenHeight);
        const y = math.max(l * (16 / 9), g);
        this.camera.q = (y * 0.5) / (o * this.camera.ppu);
        const w = this.dr.zoomFast ? 3 : 2;
        const f = this.dr.zoomFast ? 3 : 1.4;
        const _ = this.camera.q > this.camera.O ? w : f;
        this.camera.O = math.lerp(e * _, this.camera.O, this.camera.q);
        this.ft.cameraPos = v2.copy(this.camera.pos);
        if (this.bt.We(input.Key.Escape)) {
            this.uiManager.toggleEscMenu();
        }
        if (
            this.xt.isBindPressed(Input.ToggleMap) ||
            (this.bt.We(input.Key.G) && !this.xt.isKeyBound(input.Key.G))
        ) {
            this.uiManager.displayMapLarge(false);
        }
        if (this.xt.isBindPressed(Input.CycleUIMode)) {
            this.uiManager.cycleVisibilityMode();
        }
        if (
            this.xt.isBindPressed(Input.HideUI) ||
            (this.bt.We(input.Key.Escape) && !this.uiManager.hudVisible)
        ) {
            this.uiManager.cycleHud();
        }
        const b = this.dr.pos;
        const x = this.camera.j(this.bt.Ue);
        const S = v2.sub(x, b);
        let v = v2.length(S);
        let k = v > 0.00001 ? v2.div(S, v) : v2.create(1, 0);
        if (this.emoteBarn.wheelDisplayed) {
            v = this.prevInputMsg.toMouseLen;
            k = this.prevInputMsg.toMouseDir;
        }
        const z = new net.InputMsg();
        z.seq = this.seq;
        if (!this.spectating) {
            if (device.touch) {
                const I = this.touch.getTouchMovement(this.camera);
                const M = this.touch.getAimMovement(this.dr, this.camera);
                let P = v2.copy(M.aimMovement.toAimDir);
                this.touch.turnDirTicker -= e;
                if (this.touch.moveDetected && !M.touched) {
                    const C = v2.normalizeSafe(
                        I.toMoveDir,
                        v2.create(1, 0)
                    );
                    const A =
                        this.touch.turnDirTicker < 0
                            ? C
                            : M.aimMovement.toAimDir;
                    this.touch.setAimDir(A);
                    P = A;
                }
                if (M.touched) {
                    this.touch.turnDirTicker = this.touch.turnDirCooldown;
                }
                if (this.touch.moveDetected) {
                    z.touchMoveDir = v2.normalizeSafe(
                        I.toMoveDir,
                        v2.create(1, 0)
                    );
                    z.touchMoveLen = Math.round(
                        math.clamp(I.toMoveLen, 0, 1) * 255
                    );
                } else {
                    z.touchMoveLen = 0;
                }
                z.touchMoveActive = true;
                const O = M.aimMovement.toAimLen;
                const D =
                    math.clamp(O / this.touch.padPosRange, 0, 1) *
                    GameConfig.player.throwableMaxMouseDist;
                z.toMouseLen = D;
                z.toMouseDir = P;
            } else {
                z.moveLeft =
                    this.xt.isBindDown(Input.MoveLeft) ||
                    (this.bt.Ye(input.Key.Left) &&
                        !this.xt.isKeyBound(input.Key.Left));
                z.moveRight =
                    this.xt.isBindDown(Input.MoveRight) ||
                    (this.bt.Ye(input.Key.Right) &&
                        !this.xt.isKeyBound(input.Key.Right));
                z.moveUp =
                    this.xt.isBindDown(Input.MoveUp) ||
                    (this.bt.Ye(input.Key.Up) &&
                        !this.xt.isKeyBound(input.Key.Up));
                z.moveDown =
                    this.xt.isBindDown(Input.MoveDown) ||
                    (this.bt.Ye(input.Key.Down) &&
                        !this.xt.isKeyBound(input.Key.Down));
                z.toMouseDir = v2.copy(k);
                z.toMouseLen = v;
            }
            z.touchMoveDir = v2.normalizeSafe(
                z.touchMoveDir,
                v2.create(1, 0)
            );
            z.touchMoveLen = math.clamp(z.touchMoveLen, 0, 255);
            z.toMouseDir = v2.normalizeSafe(
                z.toMouseDir,
                v2.create(1, 0)
            );
            z.toMouseLen = math.clamp(
                z.toMouseLen,
                0,
                net.Constants.MouseMaxDist
            );
            z.shootStart =
                this.xt.isBindPressed(Input.Fire) || this.touch.wr;
            z.shootHold = this.xt.isBindDown(Input.Fire) || this.touch.wr;
            z.portrait = this.camera.screenWidth < this.camera.screenHeight;
            for (
                let E = [
                        Input.Reload,
                        Input.Revive,
                        Input.Use,
                        Input.Loot,
                        Input.Cancel,
                        Input.EquipPrimary,
                        Input.EquipSecondary,
                        Input.EquipThrowable,
                        Input.EquipMelee,
                        Input.EquipNextWeap,
                        Input.EquipPrevWeap,
                        Input.EquipLastWeap,
                        Input.EquipOtherGun,
                        Input.EquipPrevScope,
                        Input.EquipNextScope,
                        Input.StowWeapons
                    ],
                    B = 0;
                B < E.length;
                B++
            ) {
                const R = E[B];
                if (this.xt.isBindPressed(R)) {
                    z.addInput(R);
                }
            }
            if (this.xt.isBindPressed(Input.Interact)) {
                const q = [];
                const L = [Input.Revive, Input.Use, Input.Loot];
                for (let F = 0; F < L.length; F++) {
                    const j = L[F];
                    if (!this.xt.getBind(j)) {
                        q.push(j);
                    }
                }
                if (q.length == L.length) {
                    z.addInput(Input.Interact);
                } else {
                    for (let N = 0; N < q.length; N++) {
                        z.addInput(q[N]);
                    }
                }
            }
            if (
                this.xt.isBindPressed(Input.SwapWeapSlots) ||
                this.uiManager.swapWeapSlots
            ) {
                z.addInput(Input.SwapWeapSlots);
                this.dr.gunSwitchCooldown = 0;
            }
            if (this.uiManager.reloadTouched) {
                z.addInput(Input.Reload);
            }
            if (this.uiManager.interactionTouched) {
                z.addInput(Input.Interact);
                z.addInput(Input.Cancel);
            }
            for (let H = 0; H < this.ui2Manager.uiEvents.length; H++) {
                const V = this.ui2Manager.uiEvents[H];
                if (V.action == "use") {
                    if (V.type == "weapon") {
                        const U = {
                            0: Input.EquipPrimary,
                            1: Input.EquipSecondary,
                            2: Input.EquipMelee,
                            3: Input.EquipThrowable
                        };
                        const W = U[V.data];
                        if (W) {
                            z.addInput(W);
                        }
                    } else {
                        z.useItem = V.data;
                    }
                }
            }
            if (this.xt.isBindPressed(Input.UseBandage)) {
                z.useItem = "bandage";
            } else if (this.xt.isBindPressed(Input.UseHealthKit)) {
                z.useItem = "healthkit";
            } else if (this.xt.isBindPressed(Input.UseSoda)) {
                z.useItem = "soda";
            } else if (this.xt.isBindPressed(Input.UsePainkiller)) {
                z.useItem = "painkiller";
            }
            let G = false;
            for (let X = 0; X < this.ui2Manager.uiEvents.length; X++) {
                const K = this.ui2Manager.uiEvents[X];
                if (K.action == "drop") {
                    const Z = new net.DropItemMsg();
                    if (K.type == "weapon") {
                        const Y = this.dr.Re.tt;
                        Z.item = Y[K.data].type;
                        Z.weapIdx = K.data;
                    } else if (K.type == "perk") {
                        const J = this.dr.netData.Me;
                        const Q =
                            J.length > K.data ? J[K.data] : null;
                        if (Q?.droppable) {
                            Z.item = Q.type;
                        }
                    } else {
                        let $ = "";
                        $ =
                            K.data == "helmet"
                                ? this.dr.netData.le
                                : K.data == "chest"
                                    ? this.dr.netData.ce
                                    : K.data;
                        Z.item = $;
                    }
                    if (Z.item != "") {
                        this.$(net.Msg.DropItem, Z, 128);
                        if (Z.item != "fists") {
                            G = true;
                        }
                    }
                }
            }
            if (G) {
                this.ft.playSound("loot_drop_01", {
                    channel: "ui"
                });
            }
            if (this.uiManager.roleSelected) {
                const ee = new net.PerkModeRoleSelectMsg();
                ee.role = this.uiManager.roleSelected;
                this.$(net.Msg.PerkModeRoleSelect, ee, 128);
                this.config.set("perkModeRole", ee.role);
            }
        }
        const te = this.uiManager.specBegin;
        const re =
            this.uiManager.specNext ||
            (this.spectating && this.bt.We(input.Key.Right));
        const ae =
            this.uiManager.specPrev ||
            (this.spectating && this.bt.We(input.Key.Left));
        const ie =
            this.bt.We(input.Key.Right) || this.bt.We(input.Key.Left);
        if (te || (this.spectating && re) || ae) {
            const oe = new net.SpectateMsg();
            oe.specBegin = te;
            oe.specNext = re;
            oe.specPrev = ae;
            oe.specForce = ie;
            this.$(net.Msg.Spectate, oe, 128);
        }
        this.uiManager.specBegin = false;
        this.uiManager.specNext = false;
        this.uiManager.specPrev = false;
        this.uiManager.reloadTouched = false;
        this.uiManager.interactionTouched = false;
        this.uiManager.swapWeapSlots = false;
        this.uiManager.roleSelected = "";
        let se = false;
        for (const ne in z) {
            if (z.hasOwnProperty(ne)) {
                if (ne == "inputs") {
                    se = z[ne].length > 0;
                } else if (
                    ne == "toMouseDir" ||
                    ne == "touchMoveDir"
                ) {
                    const le = math.clamp(
                        v2.dot(z[ne], this.prevInputMsg[ne]),
                        -1,
                        1
                    );
                    const ce = math.rad2deg(Math.acos(le));
                    se = ce > 0.1;
                } else if (ne == "toMouseLen") {
                    se =
                        Math.abs(this.prevInputMsg[ne] - z[ne]) >
                        0.5;
                } else if (ne == "shootStart") {
                    se = z[ne] || z[ne] != this.prevInputMsg[ne];
                } else if (this.prevInputMsg[ne] != z[ne]) {
                    se = true;
                }
                if (se) {
                    break;
                }
            }
        }
        this.inputMsgTimeout -= e;
        if (se || this.inputMsgTimeout < 0) {
            if (!this.seqInFlight) {
                this.seq = (this.seq + 1) % 256;
                this.seqSendTime = Date.now();
                this.seqInFlight = true;
                z.seq = this.seq;
            }
            this.$(net.Msg.Input, z, 128);
            this.inputMsgTimeout = 1;
            this.prevInputMsg = z;
        }
        this.ui2Manager.flushInput();
        this.map.m(
            e,
            this.dr,
            this.playerBarn,
            this.particleBarn,
            this.ft,
            this._t,
            this.renderer,
            this.camera,
            t,
            i
        );
        this.lootBarn.m(e, this.dr, this.map, this.ft, this.camera, i);
        this.bulletBarn.m(
            e,
            this.playerBarn,
            this.map,
            this.camera,
            this.dr,
            this.renderer,
            this.particleBarn,
            this.ft
        );
        this.flareBarn.m(
            e,
            this.playerBarn,
            this.map,
            this.camera,
            this.dr,
            this.renderer,
            this.particleBarn,
            this.ft
        );
        this.projectileBarn.m(
            e,
            this.particleBarn,
            this.ft,
            this.dr,
            this.map,
            this.renderer,
            this.camera
        );
        this.explosionBarn.m(
            e,
            this.map,
            this.playerBarn,
            this.camera,
            this.particleBarn,
            this.ft,
            i
        );
        this.airdropBarn.m(
            e,
            this.dr,
            this.camera,
            this.map,
            this.particleBarn,
            this.renderer,
            this.ft
        );
        this.planeBarn.m(e, this.camera, this.dr, this.map, this.renderer);
        this.smokeBarn.m(e, this.camera, this.dr, this.map, this.renderer);
        this.shotBarn.m(e, this.hr, this.playerBarn, this.particleBarn, this.ft);
        this.particleBarn.m(e, this.camera, i);
        this.deadBodyBarn.m(e, this.playerBarn, this.dr, this.map, this.camera, this.renderer);
        this.decalBarn.m(e, this.camera, this.renderer, i);
        this.uiManager.m(
            e,
            this.dr,
            this.map,
            this.gas,
            this.lootBarn,
            this.playerBarn,
            this.camera,
            this.teamMode,
            this.map.factionMode
        );
        this.ui2Manager.m(
            e,
            this.dr,
            this.spectating,
            this.playerBarn,
            this.lootBarn,
            this.map,
            this.xt
        );
        this.emoteBarn.m(
            e,
            this.pr,
            this.dr,
            this.teamMode,
            this.deadBodyBarn,
            this.map,
            this.renderer,
            this.bt,
            this.xt,
            this.spectating
        );
        this.touch.update(e, this.dr, this.map, this.camera, this.renderer);
        this.renderer.m(e, this.camera, this.map, i);
        if (!this.Tt && this.map._r && this.map.U) {
            this.Tt = true;
            const me = new net.LoadoutMsg();
            me.emotes = [];
            for (
                let pe = 0;
                pe < this.emoteBarn.emoteLoadout.length;
                pe++
            ) {
                me.emotes.push(this.emoteBarn.emoteLoadout[pe]);
            }
            me.custom = this.emoteBarn.hasCustomEmotes();
            this.$(net.Msg.Loadout, me, 128);
        }
        for (let he = 0; he < this.emoteBarn.newPings.length; he++) {
            const de = this.emoteBarn.newPings[he];
            const ue = new net.EmoteMsg();
            ue.type = de.type;
            ue.pos = de.pos;
            ue.isPing = true;
            this.$(net.Msg.Emote, ue, 128);
        }
        this.emoteBarn.newPings = [];
        for (let ge = 0; ge < this.emoteBarn.newEmotes.length; ge++) {
            const ye = this.emoteBarn.newEmotes[ge];
            const we = new net.EmoteMsg();
            we.type = ye.type;
            we.pos = ye.pos;
            we.isPing = false;
            this.$(net.Msg.Emote, we, 128);
        }
        this.emoteBarn.newEmotes = [];
        this.br(e, i);
        if (++this.It % 30 == 0) {
            const fe = mapHelpers.ct;
            for (let _e = 0; _e < t.length; _e++) {
                const be = t[_e];
                if (be.active && !be.fade && fe(be, mapHelpers.nt)) {
                    a++;
                }
            }
            for (let xe = 0; xe < r.length; xe++) {
                const Se = r[xe];
                if (Se.active && !Se.dead && fe(Se, mapHelpers.lt)) {
                    a++;
                }
            }
            if (a) {
                this.U = true;
            }
            if (a && this.ur) {
                helpers.cheatDetected(this);
            }
        }
    }

    br(e, t) {
        const r = this.map.mapLoaded
            ? this.map.getMapDef().biome.colors.grass
            : 8433481;
        this.pixi.renderer.backgroundColor = r;
        this.playerBarn.render(this.camera, t);
        this.bulletBarn.render(this.camera, t);
        this.flareBarn.render(this.camera);
        this.decalBarn.render(this.camera, t, this.dr.layer);
        this.map.render(this.camera);
        this.gas.render(this.camera);
        this.uiManager.render(
            this.dr.pos,
            this.gas,
            this.camera,
            this.map,
            this.planeBarn,
            t
        );
        this.emoteBarn.render(this.camera);
        debugLines.flush();
    }

    updateAmbience() {
        const e = this.dr.pos;
        let t = 0;
        let r = 0;
        let a = 1;
        if (this.map.isInOcean(e)) {
            t = 1;
            r = 0;
            a = 0;
        } else {
            const i = this.map.distanceToShore(e);
            t = math.delerp(i, 50, 0);
            r = 0;
            for (
                let o = 0;
                o < this.map.terrain.rivers.length;
                o++
            ) {
                const s = this.map.terrain.rivers[o];
                const n = s.spline.getClosestTtoPoint(e);
                const l = s.spline.getPos(n);
                const c = v2.length(v2.sub(l, e));
                const p = s.waterWidth + 2;
                const d = math.delerp(c, 30 + p, p);
                const u = math.clamp(s.waterWidth / 8, 0.25, 1);
                r = math.max(d * u, r);
            }
            if (this.dr.layer == 1) {
                r = 0;
            }
            a = 1;
        }
        this._t.getTrack("wind").weight = a;
        this._t.getTrack("river").weight = r;
        this._t.getTrack("waves").weight = t;
    }

    resize() {
        this.camera.screenWidth = device.screenWidth;
        this.camera.screenHeight = device.screenHeight;
        this.map.resize(this.pixi.renderer, this.canvasMode);
        this.gas.resize();
        this.uiManager.resize(this.map, this.camera);
        this.touch.resize();
        this.renderer.resize(this.map, this.camera);
    }

    processGameUpdate(e) {
        const t = {
            audioManager: this.ft,
            renderer: this.renderer,
            particleBarn: this.particleBarn,
            map: this.map,
            smokeBarn: this.smokeBarn,
            decalBarn: this.decalBarn
        };
        if (e.activePlayerIdDirty) {
            this.hr = e.activePlayerId;
        }
        for (let r = 0; r < e.playerInfos.length; r++) {
            this.playerBarn.vr(e.playerInfos[r]);
        }
        for (let a = 0; a < e.deletedPlayerIds.length; a++) {
            const i = e.deletedPlayerIds[a];
            this.playerBarn.kr(i);
        }
        if (
            e.playerInfos.length > 0 ||
            e.deletedPlayerIds.length > 0
        ) {
            this.playerBarn.zr();
        }
        if (e.playerStatusDirty) {
            const o = this.playerBarn.qe(this.hr).teamId;
            this.playerBarn.Ir(o, e.playerStatus, this.map.factionMode);
        }
        if (e.groupStatusDirty) {
            const s = this.playerBarn.qe(this.hr).groupId;
            this.playerBarn.Tr(s, e.groupStatus);
        }
        for (let n = 0; n < e.delObjIds.length; n++) {
            this.objectCreator.deleteObj(e.delObjIds[n]);
        }
        for (let l = 0; l < e.fullObjects.length; l++) {
            const c = e.fullObjects[l];
            this.objectCreator.updateObjFull(c.__type, c.__id, c, t);
        }
        for (let m = 0; m < e.partObjects.length; m++) {
            const p = e.partObjects[m];
            this.objectCreator.updateObjPart(p.__id, p, t);
        }
        this.spectating = this.hr != this.pr;
        this.dr = this.playerBarn.u(this.hr);
        this.dr.Mr(e.activePlayerData, this.playerBarn);
        if (e.activePlayerData.weapsDirty) {
            this.uiManager.weapsDirty = true;
        }
        if (this.spectating) {
            this.uiManager.setSpectateTarget(
                this.hr,
                this.pr,
                this.teamMode,
                this.playerBarn
            );
            this.touch.hideAll();
        }
        this.dr.layer = this.dr.netData.pe;
        this.renderer.setActiveLayer(this.dr.layer);
        this.ft.activeLayer = this.dr.layer;
        const h = this.dr.isUnderground(this.map);
        this.renderer.setUnderground(h);
        this.ft.underground = h;
        if (e.gasDirty) {
            this.gas.setFullState(
                e.gasT,
                e.gasData,
                this.map,
                this.uiManager
            );
        }
        if (e.gasTDirty) {
            this.gas.setProgress(e.gasT);
        }
        for (let d = 0; d < e.bullets.length; d++) {
            const g = e.bullets[d];
            Bullet.createBullet(g, this.bulletBarn, this.flareBarn, this.playerBarn, this.renderer);
            if (g.shotFx) {
                this.shotBarn.addShot(g);
            }
        }
        for (let y = 0; y < e.explosions.length; y++) {
            const f = e.explosions[y];
            this.explosionBarn.addExplosion(f.type, f.pos, f.layer);
        }
        for (let _ = 0; _ < e.emotes.length; _++) {
            const b = e.emotes[_];
            if (b.isPing) {
                this.emoteBarn.addPing(b, this.map.factionMode);
            } else {
                this.emoteBarn.addEmote(b);
            }
        }
        this.planeBarn.Pr(e.planes, this.map);
        for (let x = 0; x < e.airstrikeZones.length; x++) {
            this.planeBarn.Cr(e.airstrikeZones[x]);
        }
        this.uiManager.je(e.mapIndicators);
        if (e.killLeaderDirty) {
            const S = helpers.htmlEscape(
                this.playerBarn.getPlayerName(e.killLeaderId, this.hr, true)
            );
            this.uiManager.updateKillLeader(
                e.killLeaderId,
                S,
                e.killLeaderKills,
                this.map.getMapDef().gameMode
            );
        }
        this.updateRecvCount++;
        if (e.ack == this.seq && this.seqInFlight) {
            this.seqInFlight = false;
        }
    }

    onMsg(e, t) {
        switch (e) {
        case net.Msg.Joined: {
            const r = new net.JoinedMsg();
            r.deserialize(t);
            this.onJoin();
            this.teamMode = r.teamMode;
            this.pr = r.playerId;
            this.ur = true;
            this.emoteBarn.updateEmoteWheel(r.emotes);
            if (!r.started) {
                this.uiManager.setWaitingForPlayers(true);
            }
            if (this.victoryMusic) {
                this.victoryMusic.stop();
                this.victoryMusic = null;
            }
            if (!document.hasFocus()) {
                this.ft.playSound("notification_start_01", {
                    channel: "ui"
                });
            }
            if (helpers.ee() || helpers.te()) {
                this.U = true;
            }
            break;
        }
        case net.Msg.Map: {
            const a = new net.MapMsg();
            a.deserialize(t);
            this.map.loadMap(
                a,
                this.camera,
                this.canvasMode,
                this.particleBarn
            );
            this.resourceManager.loadMapAssets(this.map.mapName);
            this.map.renderMap(
                this.pixi.renderer,
                this.canvasMode
            );
            this.playerBarn.onMapLoad(this.map);
            this.bulletBarn.onMapLoad(this.map);
            this.particleBarn.onMapLoad(this.map);
            this.uiManager.onMapLoad(this.map, this.camera);
            if (this.map.perkMode) {
                const i = this.config.get("perkModeRole");
                this.uiManager.setRoleMenuOptions(
                    i,
                    this.map.getMapDef().gameMode.perkModeRoles
                );
                this.uiManager.setRoleMenuActive(true);
            } else {
                this.uiManager.setRoleMenuActive(false);
            }
            break;
        }
        case net.Msg.Update: {
            const o = new net.UpdateMsg();
            o.deserialize(t, this.objectCreator);
            /* if (o.partObjects.length) {
                    console.log(o)
                } */
            this.playing = true;
            this.processGameUpdate(o);
            break;
        }
        case net.Msg.Kill: {
            const n = new net.KillMsg();
            n.deserialize(t);
            const l = n.itemSourceType || n.mapSourceType;
            const c = this.playerBarn.qe(this.hr).teamId;
            const m =
                    (n.downed && !n.killed) ||
                    n.damageType == GameConfig.DamageType.Gas ||
                    n.damageType == GameConfig.DamageType.Bleeding ||
                    n.damageType == GameConfig.DamageType.Airdrop;
            const h = this.playerBarn.qe(n.targetId);
            const d = this.playerBarn.qe(n.killCreditId);
            const g = m ? d : this.playerBarn.qe(n.killerId);
            let y = this.playerBarn.getPlayerName(
                h.playerId,
                this.hr,
                true
            );
            let w = this.playerBarn.getPlayerName(
                d.playerId,
                this.hr,
                true
            );
            let f = this.playerBarn.getPlayerName(
                g.playerId,
                this.hr,
                true
            );
            y = helpers.htmlEscape(y);
            w = helpers.htmlEscape(w);
            f = helpers.htmlEscape(f);
            if (n.killCreditId == this.hr) {
                const _ = n.killerId == this.hr;
                const b =
                        n.killerId == n.targetId ||
                        n.killCreditId == n.targetId;
                const x = this.ui2Manager.getKillText(
                    w,
                    y,
                    _,
                    n.downed,
                    n.killed,
                    b,
                    l,
                    n.damageType,
                    this.spectating
                );
                const S =
                        n.killed && !b
                            ? this.ui2Manager.getKillCountText(
                                n.killerKills
                            )
                            : "";
                this.ui2Manager.displayKillMessage(x, S);
            } else if (
                n.targetId == this.hr &&
                    n.downed &&
                    !n.killed
            ) {
                const v = this.ui2Manager.getDownedText(
                    w,
                    y,
                    l,
                    n.damageType,
                    this.spectating
                );
                this.ui2Manager.displayKillMessage(v, "");
            }
            if (n.killCreditId == this.pr && n.killed) {
                this.uiManager.setLocalKills(n.killerKills);
            }
            const k = this.ui2Manager.getKillFeedText(
                y,
                g.teamId ? f : "",
                l,
                n.damageType,
                n.downed && !n.killed
            );
            const z = this.ui2Manager.getKillFeedColor(
                c,
                h.teamId,
                d.teamId,
                this.map.factionMode
            );
            this.ui2Manager.addKillFeedMessage(k, z);
            if (n.killed) {
                this.playerBarn.addDeathEffect(
                    n.targetId,
                    n.killerId,
                    l,
                    this.ft,
                    this.particleBarn
                );
            }
            if (n.type == GameConfig.DamageType.Player) {
                this.bulletBarn.createBulletHit(
                    this.playerBarn,
                    n.targetId,
                    this.ft
                );
            }
            break;
        }
        case net.Msg.RoleAnnouncement: {
            const I = new net.RoleAnnouncementMsg();
            I.deserialize(t);
            const T = RoleDefs[I.role];
            if (!T) {
                break;
            }
            const M = this.playerBarn.qe(I.playerId);
            const P = helpers.htmlEscape(
                this.playerBarn.getPlayerName(I.playerId, this.hr, true)
            );
            if (I.assigned) {
                if (T.sound?.assign) {
                    if (
                        I.role == "kill_leader" &&
                            this.map.getMapDef().gameMode
                                .spookyKillSounds
                    ) {
                        this.ft.playGroup(
                            "kill_leader_assigned",
                            {
                                channel: "ui"
                            }
                        );
                    } else if (
                        I.role == "kill_leader" ||
                            !this.map.perkMode ||
                            this.pr == I.playerId
                    ) {
                        this.ft.playSound(T.sound.assign, {
                            channel: "ui"
                        });
                    }
                }
                if (this.map.perkMode && this.pr == I.playerId) {
                    this.uiManager.setRoleMenuActive(false);
                }
                if (T.killFeed?.assign) {
                    const C =
                            this.ui2Manager.getRoleAssignedKillFeedText(
                                I.role,
                                M.teamId,
                                P
                            );
                    const A = this.ui2Manager.getRoleKillFeedColor(
                        I.role,
                        M.teamId,
                        this.playerBarn
                    );
                    this.ui2Manager.addKillFeedMessage(C, A);
                }
                if (T.announce && this.pr == I.playerId) {
                    const O = this.ui2Manager.getRoleAnnouncementText(
                        I.role,
                        M.teamId
                    );
                    this.uiManager.displayAnnouncement(
                        O.toUpperCase()
                    );
                }
            } else if (I.killed) {
                if (T.killFeed?.dead) {
                    let D = helpers.htmlEscape(
                        this.playerBarn.getPlayerName(
                            I.killerId,
                            this.hr,
                            true
                        )
                    );
                    if (I.playerId == I.killerId) {
                        D = "";
                    }
                    const E = this.ui2Manager.getRoleKilledKillFeedText(
                        I.role,
                        M.teamId,
                        D
                    );
                    const B = this.ui2Manager.getRoleKillFeedColor(
                        I.role,
                        M.teamId,
                        this.playerBarn
                    );
                    this.ui2Manager.addKillFeedMessage(E, B);
                }
                if (T.sound?.dead) {
                    if (
                        this.map.getMapDef().gameMode
                            .spookyKillSounds
                    ) {
                        this.ft.playGroup("kill_leader_dead", {
                            channel: "ui"
                        });
                    } else {
                        this.ft.playSound(T.sound.dead, {
                            channel: "ui"
                        });
                    }
                }
            }
            break;
        }
        case net.Msg.PlayerStats: {
            const R = new net.PlayerStatsMsg();
            R.deserialize(t);
            this.uiManager.setLocalStats(R.playerStats);
            this.uiManager.showTeamAd(R.playerStats, this.ui2Manager);
            break;
        }
        case net.Msg.Stats: {
            const L = new net.StatsMsg();
            L.deserialize(t);
            helpers.J(L.data, this);
            break;
        }
        case net.Msg.GameOver: {
            const q = new net.GameOverMsg();
            q.deserialize(t);
            this.gameOver = q.gameOver;
            const F = this.playerBarn.qe(this.pr).teamId;
            for (let j = 0; j < q.playerStats.length; j++) {
                const V = q.playerStats[j];
                if (V.playerId == this.pr) {
                    this.uiManager.setLocalStats(V);
                    break;
                }
            }
            this.uiManager.showStats(
                q.playerStats,
                q.teamId,
                q.teamRank,
                q.winningTeamId,
                q.gameOver,
                F,
                this.teamMode,
                this.spectating,
                this.playerBarn,
                this.ft,
                this.map,
                this.ui2Manager
            );
            if (F == q.winningTeamId) {
                this.victoryMusic = this.ft.playSound(
                    "menu_music",
                    {
                        channel: "music",
                        delay: 1300,
                        forceStart: true
                    }
                );
            }
            this.touch.hideAll();
            break;
        }
        case net.Msg.Pickup: {
            const U = new net.PickupMsg();
            U.deserialize(t);
            if (U.type == net.PickupMsgType.Success && U.item) {
                this.dr.playItemPickupSound(U.item, this.ft);
                const W = GameObjectDefs[U.item];
                if (W && W.type == "xp") {
                    this.ui2Manager.addRareLootMessage(U.item, true);
                }
            } else {
                this.ui2Manager.displayPickupMessage(U.type);
            }
            break;
        }
        case net.Msg.UpdatePass: {
            new net.UpdatePassMsg().deserialize(t);
            this.updatePass = true;
            this.updatePassDelay = 0;
            break;
        }
        case net.Msg.AliveCounts: {
            const G = new net.AliveCountsMsg();
            G.deserialize(t);
            if (G.teamAliveCounts.length == 1) {
                this.uiManager.updatePlayersAlive(
                    G.teamAliveCounts[0]
                );
            } else if (G.teamAliveCounts.length >= 2) {
                this.uiManager.updatePlayersAliveRed(
                    G.teamAliveCounts[0]
                );
                this.uiManager.updatePlayersAliveBlue(
                    G.teamAliveCounts[1]
                );
            }
            break;
        }
        case net.Msg.Disconnect: {
            const X = new net.DisconnectMsg();
            X.deserialize(t);
            this.disconnectMsg = X.reason;
        }
        }
    }

    $(e, t, r) {
        const a = r || 128;
        const i = new net.MsgStream(new ArrayBuffer(a));
        i.serializeMsg(e, t);
        this.Ar(i);
    }

    Ar(e) {
        if (this.ws && this.ws.readyState == this.ws.OPEN) {
            try {
                this.ws.send(e.getBuffer());
            } catch (e) {
                console.error("sendMessageException", e);
                this.ws.close();
            }
        }
    }
}

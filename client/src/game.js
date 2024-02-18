import * as PIXI from "pixi.js"
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
import firebaseManager from "./firebaseManager";
import { AirDropPool } from "./objects/aidrop";
import Bullet from "./objects/bullet";
import Camera from "./camera";
import DeadBody from "./objects/deadBody";
import debugLines from "./debugLines";
import Decal from "./objects/decal";
import emote from "./emote";
import explosion from "./objects/explosion";
import flare from "./objects/flare";
import gas from "./gas";
import input from "./input";
import loot from "./objects/loot";
import map from "./map";
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

const n = GameConfig.Input;
GameConfig.EmoteSlot;

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

    vt(e, t, r, a, i) {
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
                    i.otherProxy = !proxy.Y();
                    i.bot = false;
                    o.$(net.Msg.Join, i, 8192);
                };
                this.ws.onmessage = function(e) {
                    for (let t = new net.MsgStream(e.data); ;) {
                        const r = t.deserializeMsgType();
                        if (r == net.Msg.None) {
                            break;
                        }
                        o.kt(r, t.getStream());
                    }
                };
                this.ws.onclose = function() {
                    const e = o.zt?.displayingStats;
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
    o() {
        let e;
        this.canvasMode =
            this.pixi.renderer.type == PIXI.RENDERER_TYPE.CANVAS;
        this.I = false;
        this.It = 0;
        this.U = false;
        this.Tt = false;
        this.Mt = new Touch.Pt(this.bt, this.config);
        this.De = new Camera();
        this.Ct = new Renderer.At(this, this.canvasMode);
        this.Ot = new Particles.f(this.Ct);
        this.Dt = new Decal.k();
        this.Et = new map.Bt(this.Dt);
        this.Rt = new Player.Lt();
        this.qt = new Bullet.Ft();
        this.jt = new flare.Nt();
        this.Ht = new Projectile.Vt();
        this.Ut = new explosion.et();
        this.Wt = new Plane.Gt(this.ft);
        this.Xt = new AirDropPool();
        this.Kt = new Smoke.d();
        this.Zt = new DeadBody.st();
        this.Yt = new loot.Jt();
        this.Qt = new gas.$t(this.canvasMode);
        this.zt = new Ui.He(
            this,
            this.ft,
            this.Ot,
            this.Wt,
            this.localization,
            this.canvasMode,
            this.Mt,
            this.xt,
            this.St,
        );
        this.er = new Ui2.rr(this.localization, this.xt);
        this.ar = new emote.ir(
            this.ft,
            this.zt,
            this.Rt,
            this.De,
            this.Et
        );
        this.or = new Shot.at(this.Ot, this.ft, this.zt);
        e = {};
        a(e, GameObject.Type.Player, this.Rt.$e);
        a(e, GameObject.Type.Obstacle, this.Et.Ve);
        a(e, GameObject.Type.Loot, this.Yt.sr);
        a(e, GameObject.Type.DeadBody, this.Zt.ot);
        a(e, GameObject.Type.Building, this.Et.nr);
        a(e, GameObject.Type.Structure, this.Et.lr);
        a(e, GameObject.Type.Decal, this.Dt._);
        a(e, GameObject.Type.Projectile, this.Ht.cr);
        a(e, GameObject.Type.Smoke, this.Kt.e);
        a(e, GameObject.Type.Airdrop, this.Xt.re);
        const t = e;
        this.mr = new ObjectPool.Creator();
        for (const r in t) {
            if (t.hasOwnProperty(r)) {
                this.mr.registerType(r, t[r]);
            }
        }
        this.debugDisplay = new PIXI.Graphics();
        for (
            let i = [
                this.Et.display.ground,
                this.Ct.layers[0],
                this.Ct.ground,
                this.Ct.layers[1],
                this.Ct.layers[2],
                this.Ct.layers[3],
                this.debugDisplay,
                this.Qt.gasRenderer.display,
                this.Mt.container,
                this.ar.container,
                this.zt.container,
                this.zt.Pe.container,
                this.ar.indContainer
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
        this.De.setShakeEnabled(this.config.get("screenShake"));
        this.Rt.anonPlayerNames =
            this.config.get("anonPlayerNames");
        this.initialized = true;
    }
    n() {
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
            this.ar.n();
            this.er.n();
            this.zt.n();
            this.Qt.free();
            this.Xt.n();
            this.Wt.n();
            this.Et.n();
            this.Ot.n();
            this.Ct.n();
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
    gr() {
        return (
            this.initialized &&
            this.playing &&
            !this.spectating &&
            !this.zt.displayingStats
        );
    }
    m(e) {
        const t = this.Kt.particles;
        const r = this.Et.Ve.p();
        let a = 0;
        this.I = true;
        const i = {};
        i.render = i.render || {};
        if (this.playing) {
            this.playingTicker += e;
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
            this.er,
            this.ar.wheelKeyTriggered,
            this.zt.displayingStats,
            this.spectating
        );
        this.updateAmbience();
        this.De.pos = v2.copy(this.dr.pos);
        this.De.applyShake();
        const o = this.dr.yr();
        const l = math.min(this.De.screenWidth, this.De.screenHeight);
        const g = math.max(this.De.screenWidth, this.De.screenHeight);
        const y = math.max(l * (16 / 9), g);
        this.De.q = (y * 0.5) / (o * this.De.ppu);
        const w = this.dr.zoomFast ? 3 : 2;
        const f = this.dr.zoomFast ? 3 : 1.4;
        const _ = this.De.q > this.De.O ? w : f;
        this.De.O = math.lerp(e * _, this.De.O, this.De.q);
        this.ft.cameraPos = v2.copy(this.De.pos);
        if (this.bt.We(input.Key.Escape)) {
            this.zt.toggleEscMenu();
        }
        if (
            this.xt.isBindPressed(n.ToggleMap) ||
            (this.bt.We(input.Key.G) && !this.xt.isKeyBound(input.Key.G))
        ) {
            this.zt.displayMapLarge(false);
        }
        if (this.xt.isBindPressed(n.CycleUIMode)) {
            this.zt.cycleVisibilityMode();
        }
        if (
            this.xt.isBindPressed(n.HideUI) ||
            (this.bt.We(input.Key.Escape) && !this.zt.hudVisible)
        ) {
            this.zt.cycleHud();
        }
        const b = this.dr.pos;
        const x = this.De.j(this.bt.Ue);
        const S = v2.sub(x, b);
        let v = v2.length(S);
        let k = v > 0.00001 ? v2.div(S, v) : v2.create(1, 0);
        if (this.ar.wheelDisplayed) {
            v = this.prevInputMsg.toMouseLen;
            k = this.prevInputMsg.toMouseDir;
        }
        const z = new net.InputMsg();
        z.seq = this.seq;
        if (!this.spectating) {
            if (device.touch) {
                const I = this.Mt.getTouchMovement(this.De);
                const M = this.Mt.getAimMovement(this.dr, this.De);
                let P = v2.copy(M.aimMovement.toAimDir);
                this.Mt.turnDirTicker -= e;
                if (this.Mt.moveDetected && !M.touched) {
                    const C = v2.normalizeSafe(
                        I.toMoveDir,
                        v2.create(1, 0)
                    );
                    const A =
                        this.Mt.turnDirTicker < 0
                            ? C
                            : M.aimMovement.toAimDir;
                    this.Mt.setAimDir(A);
                    P = A;
                }
                if (M.touched) {
                    this.Mt.turnDirTicker = this.Mt.turnDirCooldown;
                }
                if (this.Mt.moveDetected) {
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
                    math.clamp(O / this.Mt.padPosRange, 0, 1) *
                    GameConfig.player.throwableMaxMouseDist;
                z.toMouseLen = D;
                z.toMouseDir = P;
            } else {
                z.moveLeft =
                    this.xt.isBindDown(n.MoveLeft) ||
                    (this.bt.Ye(input.Key.Left) &&
                        !this.xt.isKeyBound(input.Key.Left));
                z.moveRight =
                    this.xt.isBindDown(n.MoveRight) ||
                    (this.bt.Ye(input.Key.Right) &&
                        !this.xt.isKeyBound(input.Key.Right));
                z.moveUp =
                    this.xt.isBindDown(n.MoveUp) ||
                    (this.bt.Ye(input.Key.Up) &&
                        !this.xt.isKeyBound(input.Key.Up));
                z.moveDown =
                    this.xt.isBindDown(n.MoveDown) ||
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
                this.xt.isBindPressed(n.Fire) || this.Mt.wr;
            z.shootHold = this.xt.isBindDown(n.Fire) || this.Mt.wr;
            z.portrait = this.De.screenWidth < this.De.screenHeight;
            for (
                let E = [
                    n.Reload,
                    n.Revive,
                    n.Use,
                    n.Loot,
                    n.Cancel,
                    n.EquipPrimary,
                    n.EquipSecondary,
                    n.EquipThrowable,
                    n.EquipMelee,
                    n.EquipNextWeap,
                    n.EquipPrevWeap,
                    n.EquipLastWeap,
                    n.EquipOtherGun,
                    n.EquipPrevScope,
                    n.EquipNextScope,
                    n.StowWeapons
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
            if (this.xt.isBindPressed(n.Interact)) {
                for (
                    var L = [n.Revive, n.Use, n.Loot],
                    q = [],
                    F = 0;
                    F < L.length;
                    F++
                ) {
                    const j = L[F];
                    if (!this.xt.getBind(j)) {
                        q.push(j);
                    }
                }
                if (q.length == L.length) {
                    z.addInput(n.Interact);
                } else {
                    for (let N = 0; N < q.length; N++) {
                        z.addInput(q[N]);
                    }
                }
            }
            if (
                this.xt.isBindPressed(n.SwapWeapSlots) ||
                this.zt.swapWeapSlots
            ) {
                z.addInput(n.SwapWeapSlots);
                this.dr.gunSwitchCooldown = 0;
            }
            if (this.zt.reloadTouched) {
                z.addInput(n.Reload);
            }
            if (this.zt.interactionTouched) {
                z.addInput(n.Interact);
                z.addInput(n.Cancel);
            }
            for (let H = 0; H < this.er.uiEvents.length; H++) {
                const V = this.er.uiEvents[H];
                if (V.action == "use") {
                    if (V.type == "weapon") {
                        const U = {
                            0: n.EquipPrimary,
                            1: n.EquipSecondary,
                            2: n.EquipMelee,
                            3: n.EquipThrowable
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
            if (this.xt.isBindPressed(n.UseBandage)) {
                z.useItem = "bandage";
            } else if (this.xt.isBindPressed(n.UseHealthKit)) {
                z.useItem = "healthkit";
            } else if (this.xt.isBindPressed(n.UseSoda)) {
                z.useItem = "soda";
            } else if (this.xt.isBindPressed(n.UsePainkiller)) {
                z.useItem = "painkiller";
            }
            var G = false;
            for (var X = 0; X < this.er.uiEvents.length; X++) {
                const K = this.er.uiEvents[X];
                if (K.action == "drop") {
                    const Z = new net.DropItemMsg();
                    if (K.type == "weapon") {
                        const Y = this.dr.Re.tt;
                        Z.item = Y[K.data].type;
                        Z.weapIdx = K.data;
                    } else if (K.type == "perk") {
                        const J = this.dr.Le.Me;
                        const Q =
                            J.length > K.data ? J[K.data] : null;
                        if (Q?.droppable) {
                            Z.item = Q.type;
                        }
                    } else {
                        let $ = "";
                        $ =
                            K.data == "helmet"
                                ? this.dr.Le.le
                                : K.data == "chest"
                                    ? this.dr.Le.ce
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
            if (this.zt.roleSelected) {
                const ee = new net.PerkModeRoleSelectMsg();
                ee.role = this.zt.roleSelected;
                this.$(net.Msg.PerkModeRoleSelect, ee, 128);
                this.config.set("perkModeRole", ee.role);
            }
        }
        const te = this.zt.specBegin;
        const re =
            this.zt.specNext ||
            (this.spectating && this.bt.We(input.Key.Right));
        const ae =
            this.zt.specPrev ||
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
        this.zt.specBegin = false;
        this.zt.specNext = false;
        this.zt.specPrev = false;
        this.zt.reloadTouched = false;
        this.zt.interactionTouched = false;
        this.zt.swapWeapSlots = false;
        this.zt.roleSelected = "";
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
        this.er.flushInput();
        this.Et.m(
            e,
            this.dr,
            this.Rt,
            this.Ot,
            this.ft,
            this._t,
            this.Ct,
            this.De,
            t,
            i
        );
        this.Yt.m(e, this.dr, this.Et, this.ft, this.De, i);
        this.qt.m(
            e,
            this.Rt,
            this.Et,
            this.De,
            this.dr,
            this.Ct,
            this.Ot,
            this.ft
        );
        this.jt.m(
            e,
            this.Rt,
            this.Et,
            this.De,
            this.dr,
            this.Ct,
            this.Ot,
            this.ft
        );
        this.Ht.m(
            e,
            this.Ot,
            this.ft,
            this.dr,
            this.Et,
            this.Ct,
            this.De
        );
        this.Ut.m(
            e,
            this.Et,
            this.Rt,
            this.De,
            this.Ot,
            this.ft,
            i
        );
        this.Xt.m(
            e,
            this.dr,
            this.De,
            this.Et,
            this.Ot,
            this.Ct,
            this.ft
        );
        this.Wt.m(e, this.De, this.dr, this.Et, this.Ct);
        this.Kt.m(e, this.De, this.dr, this.Et, this.Ct);
        this.or.m(e, this.hr, this.Rt, this.Ot, this.ft);
        this.Ot.m(e, this.De, i);
        this.Zt.m(e, this.Rt, this.dr, this.Et, this.De, this.Ct);
        this.Dt.m(e, this.De, this.Ct, i);
        this.zt.m(
            e,
            this.dr,
            this.Et,
            this.Qt,
            this.Yt,
            this.Rt,
            this.De,
            this.teamMode,
            this.Et.factionMode
        );
        this.er.m(
            e,
            this.dr,
            this.spectating,
            this.Rt,
            this.Yt,
            this.Et,
            this.xt
        );
        this.ar.m(
            e,
            this.pr,
            this.dr,
            this.teamMode,
            this.Zt,
            this.Et,
            this.Ct,
            this.bt,
            this.xt,
            this.spectating
        );
        this.Mt.update(e, this.dr, this.Et, this.De, this.Ct);
        this.Ct.m(e, this.De, this.Et, i);
        if (!this.Tt && this.Et._r && this.Et.U) {
            this.Tt = true;
            const me = new net.LoadoutMsg();
            me.emotes = [];
            for (
                let pe = 0;
                pe < this.ar.emoteLoadout.length;
                pe++
            ) {
                me.emotes.push(this.ar.emoteLoadout[pe]);
            }
            me.custom = this.ar.hasCustomEmotes();
            this.$(net.Msg.Loadout, me, 128);
        }
        for (let he = 0; he < this.ar.newPings.length; he++) {
            const de = this.ar.newPings[he];
            const ue = new net.EmoteMsg();
            ue.type = de.type;
            ue.pos = de.pos;
            ue.isPing = true;
            this.$(net.Msg.Emote, ue, 128);
        }
        this.ar.newPings = [];
        for (let ge = 0; ge < this.ar.newEmotes.length; ge++) {
            const ye = this.ar.newEmotes[ge];
            const we = new net.EmoteMsg();
            we.type = ye.type;
            we.pos = ye.pos;
            we.isPing = false;
            this.$(net.Msg.Emote, we, 128);
        }
        this.ar.newEmotes = [];
        this.br(e, i);
        if (++this.It % 30 == 0) {
            var fe = mapHelpers.ct;
            for (var _e = 0; _e < t.length; _e++) {
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
                helpers.U(this);
            }
        }
    }
    br(e, t) {
        const r = this.Et.mapLoaded
            ? this.Et.getMapDef().biome.colors.grass
            : 8433481;
        this.pixi.renderer.backgroundColor = r;
        this.Rt.render(this.De, t);
        this.qt.render(this.De, t);
        this.jt.render(this.De);
        this.Dt.render(this.De, t, this.dr.layer);
        this.Et.render(this.De);
        this.Qt.render(this.De);
        this.zt.render(
            this.dr.pos,
            this.Qt,
            this.De,
            this.Et,
            this.Wt,
            t
        );
        this.ar.render(this.De);
        debugLines.flush();
    }
    updateAmbience() {
        const e = this.dr.pos;
        let t = 0;
        let r = 0;
        let a = 1;
        if (this.Et.isInOcean(e)) {
            t = 1;
            r = 0;
            a = 0;
        } else {
            const i = this.Et.distanceToShore(e);
            t = math.delerp(i, 50, 0);
            r = 0;
            for (
                let o = 0;
                o < this.Et.terrain.rivers.length;
                o++
            ) {
                const s = this.Et.terrain.rivers[o];
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
    xr() {
        this.De.screenWidth = device.screenWidth;
        this.De.screenHeight = device.screenHeight;
        this.Et.resize(this.pixi.renderer, this.canvasMode);
        this.Qt.resize();
        this.zt.resize(this.Et, this.De);
        this.Mt.resize();
        this.Ct.resize(this.Et, this.De);
    }
    Sr(e) {
        this.hr;
        const t = {
            audioManager: this.ft,
            renderer: this.Ct,
            particleBarn: this.Ot,
            map: this.Et,
            smokeBarn: this.Kt,
            decalBarn: this.Dt
        };
        if (e.activePlayerIdDirty) {
            this.hr = e.activePlayerId;
        }
        for (let r = 0; r < e.playerInfos.length; r++) {
            this.Rt.vr(e.playerInfos[r]);
        }
        for (let a = 0; a < e.deletedPlayerIds.length; a++) {
            const i = e.deletedPlayerIds[a];
            this.Rt.kr(i);
        }
        if (
            e.playerInfos.length > 0 ||
            e.deletedPlayerIds.length > 0
        ) {
            this.Rt.zr();
        }
        if (e.playerStatusDirty) {
            const o = this.Rt.qe(this.hr).teamId;
            this.Rt.Ir(o, e.playerStatus, this.Et.factionMode);
        }
        if (e.groupStatusDirty) {
            const s = this.Rt.qe(this.hr).groupId;
            this.Rt.Tr(s, e.groupStatus);
        }
        for (let n = 0; n < e.delObjIds.length; n++) {
            e.delObjIds[n];
            this.mr.deleteObj(e.delObjIds[n]);
        }
        for (let l = 0; l < e.fullObjects.length; l++) {
            const c = e.fullObjects[l];
            this.mr.updateObjFull(c.__type, c.__id, c, t);
        }
        for (let m = 0; m < e.partObjects.length; m++) {
            const p = e.partObjects[m];
            this.mr.updateObjPart(p.__id, p, t);
        }
        this.spectating = this.hr != this.pr;
        this.dr = this.Rt.u(this.hr);
        this.dr.Mr(e.activePlayerData, this.Rt);
        if (e.activePlayerData.weapsDirty) {
            this.zt.weapsDirty = true;
        }
        if (this.spectating) {
            this.zt.setSpectateTarget(
                this.hr,
                this.pr,
                this.teamMode,
                this.Rt
            );
            this.Mt.hideAll();
        }
        this.dr.layer = this.dr.Le.pe;
        this.Ct.setActiveLayer(this.dr.layer);
        this.ft.activeLayer = this.dr.layer;
        const h = this.dr.isUnderground(this.Et);
        this.Ct.setUnderground(h);
        this.ft.underground = h;
        if (e.gasDirty) {
            this.Qt.setFullState(
                e.gasT,
                e.gasData,
                this.Et,
                this.zt
            );
        }
        if (e.gasTDirty) {
            this.Qt.setProgress(e.gasT);
        }
        for (let d = 0; d < e.bullets.length; d++) {
            const g = e.bullets[d];
            Bullet.createBullet(g, this.qt, this.jt, this.Rt, this.Ct);
            if (g.shotFx) {
                this.or.addShot(g);
            }
        }
        for (let y = 0; y < e.explosions.length; y++) {
            const f = e.explosions[y];
            this.Ut.addExplosion(f.type, f.pos, f.layer);
        }
        for (let _ = 0; _ < e.emotes.length; _++) {
            const b = e.emotes[_];
            if (b.isPing) {
                this.ar.addPing(b, this.Et.factionMode);
            } else {
                this.ar.addEmote(b);
            }
        }
        this.Wt.Pr(e.planes, this.Et);
        for (let x = 0; x < e.airstrikeZones.length; x++) {
            this.Wt.Cr(e.airstrikeZones[x]);
        }
        this.zt.je(e.mapIndicators);
        if (e.killLeaderDirty) {
            const S = helpers.htmlEscape(
                this.Rt.getPlayerName(e.killLeaderId, this.hr, true)
            );
            this.zt.updateKillLeader(
                e.killLeaderId,
                S,
                e.killLeaderKills,
                this.Et.getMapDef().gameMode
            );
        }
        this.updateRecvCount++;
        if (e.ack == this.seq && this.seqInFlight) {
            this.seqInFlight = false;
        }
    }
    kt(e, t) {
        switch (e) {
            case net.Msg.Joined:
                var r = new net.JoinedMsg();
                r.deserialize(t);
                this.onJoin();
                this.teamMode = r.teamMode;
                this.pr = r.playerId;
                this.ur = true;
                this.ar.updateEmoteWheel(r.emotes);
                if (!r.started) {
                    this.zt.setWaitingForPlayers(true);
                }
                this.zt.removeAds();
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
            case net.Msg.Map:
                var a = new net.MapMsg();
                a.deserialize(t);
                this.Et.loadMap(
                    a,
                    this.De,
                    this.canvasMode,
                    this.Ot
                );
                this.resourceManager.loadMapAssets(this.Et.mapName);
                this.Et.renderMap(
                    this.pixi.renderer,
                    this.canvasMode
                );
                this.Rt.onMapLoad(this.Et);
                this.qt.onMapLoad(this.Et);
                this.Ot.onMapLoad(this.Et);
                this.zt.onMapLoad(this.Et, this.De);
                if (this.Et.perkMode) {
                    const i = this.config.get("perkModeRole");
                    this.zt.setRoleMenuOptions(
                        i,
                        this.Et.getMapDef().gameMode.perkModeRoles
                    );
                    this.zt.setRoleMenuActive(true);
                } else {
                    this.zt.setRoleMenuActive(false);
                }
                break;
            case net.Msg.Update:
                var o = new net.UpdateMsg();
                o.deserialize(t, this.mr);
                /* if (o.partObjects.length) {
            console.log(o)
        } */
                this.playing = true;
                this.Sr(o);
                break;
            case net.Msg.Kill:
                var n = new net.KillMsg();
                n.deserialize(t);
                var l = n.itemSourceType || n.mapSourceType;
                var c = this.Rt.qe(this.hr).teamId;
                var m =
                    (n.downed && !n.killed) ||
                    n.damageType == GameConfig.DamageType.Gas ||
                    n.damageType == GameConfig.DamageType.Bleeding ||
                    n.damageType == GameConfig.DamageType.Airdrop;
                var h = this.Rt.qe(n.targetId);
                var d = this.Rt.qe(n.killCreditId);
                var g = m ? d : this.Rt.qe(n.killerId);
                var y = this.Rt.getPlayerName(
                    h.playerId,
                    this.hr,
                    true
                );
                var w = this.Rt.getPlayerName(
                    d.playerId,
                    this.hr,
                    true
                );
                var f = this.Rt.getPlayerName(
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
                    const x = this.er.getKillText(
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
                            ? this.er.getKillCountText(
                                n.killerKills
                            )
                            : "";
                    this.er.displayKillMessage(x, S);
                } else if (
                    n.targetId == this.hr &&
                    n.downed &&
                    !n.killed
                ) {
                    const v = this.er.getDownedText(
                        w,
                        y,
                        l,
                        n.damageType,
                        this.spectating
                    );
                    this.er.displayKillMessage(v, "");
                }
                if (n.killCreditId == this.pr && n.killed) {
                    this.zt.setLocalKills(n.killerKills);
                }
                var k = this.er.getKillFeedText(
                    y,
                    g.teamId ? f : "",
                    l,
                    n.damageType,
                    n.downed && !n.killed
                );
                var z = this.er.getKillFeedColor(
                    c,
                    h.teamId,
                    d.teamId,
                    this.Et.factionMode
                );
                this.er.addKillFeedMessage(k, z);
                if (n.killed) {
                    this.Rt.addDeathEffect(
                        n.targetId,
                        n.killerId,
                        l,
                        this.ft,
                        this.Ot
                    );
                }
                if (n.type == GameConfig.DamageType.Player) {
                    this.qt.createBulletHit(
                        this.Rt,
                        n.targetId,
                        this.ft
                    );
                }
                break;
            case net.Msg.RoleAnnouncement:
                var I = new net.RoleAnnouncementMsg();
                I.deserialize(t);
                var T = RoleDefs[I.role];
                if (!T) {
                    break;
                }
                var M = this.Rt.qe(I.playerId);
                var P = helpers.htmlEscape(
                    this.Rt.getPlayerName(I.playerId, this.hr, true)
                );
                if (I.assigned) {
                    if (T.sound?.assign) {
                        if (
                            I.role == "kill_leader" &&
                            this.Et.getMapDef().gameMode
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
                            !this.Et.perkMode ||
                            this.pr == I.playerId
                        ) {
                            this.ft.playSound(T.sound.assign, {
                                channel: "ui"
                            });
                        }
                    }
                    if (this.Et.perkMode && this.pr == I.playerId) {
                        this.zt.setRoleMenuActive(false);
                    }
                    if (T.killFeed?.assign) {
                        const C =
                            this.er.getRoleAssignedKillFeedText(
                                I.role,
                                M.teamId,
                                P
                            );
                        const A = this.er.getRoleKillFeedColor(
                            I.role,
                            M.teamId,
                            this.Rt
                        );
                        this.er.addKillFeedMessage(C, A);
                    }
                    if (T.announce && this.pr == I.playerId) {
                        const O = this.er.getRoleAnnouncementText(
                            I.role,
                            M.teamId
                        );
                        this.zt.displayAnnouncement(
                            O.toUpperCase()
                        );
                    }
                } else if (I.killed) {
                    if (T.killFeed?.dead) {
                        let D = helpers.htmlEscape(
                            this.Rt.getPlayerName(
                                I.killerId,
                                this.hr,
                                true
                            )
                        );
                        if (I.playerId == I.killerId) {
                            D = "";
                        }
                        const E = this.er.getRoleKilledKillFeedText(
                            I.role,
                            M.teamId,
                            D
                        );
                        const B = this.er.getRoleKillFeedColor(
                            I.role,
                            M.teamId,
                            this.Rt
                        );
                        this.er.addKillFeedMessage(E, B);
                    }
                    if (T.sound?.dead) {
                        if (
                            this.Et.getMapDef().gameMode
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
            case net.Msg.PlayerStats:
                var R = new net.PlayerStatsMsg();
                R.deserialize(t);
                this.zt.setLocalStats(R.playerStats);
                this.zt.showTeamAd(R.playerStats, this.er);
                break;
            case net.Msg.Stats:
                var L = new net.StatsMsg();
                L.deserialize(t);
                helpers.J(L.data, this);
                break;
            case net.Msg.GameOver:
                var q = new net.GameOverMsg();
                q.deserialize(t);
                this.gameOver = q.gameOver;
                var F = this.Rt.qe(this.pr).teamId;
                for (var j = 0; j < q.playerStats.length; j++) {
                    const V = q.playerStats[j];
                    if (V.playerId == this.pr) {
                        this.zt.setLocalStats(V);
                        break;
                    }
                }
                this.zt.showStats(
                    q.playerStats,
                    q.teamId,
                    q.teamRank,
                    q.winningTeamId,
                    q.gameOver,
                    F,
                    this.teamMode,
                    this.spectating,
                    this.Rt,
                    this.ft,
                    this.Et,
                    this.er
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
                this.Mt.hideAll();
                break;
            case net.Msg.Pickup:
                var U = new net.PickupMsg();
                U.deserialize(t);
                if (U.type == net.PickupMsgType.Success && U.item) {
                    this.dr.playItemPickupSound(U.item, this.ft);
                    const W = GameObjectDefs[U.item];
                    if (W && W.type == "xp") {
                        this.er.addRareLootMessage(U.item, true);
                    }
                } else {
                    this.er.displayPickupMessage(U.type);
                }
                break;
            case net.Msg.UpdatePass:
                new net.UpdatePassMsg().deserialize(t);
                this.updatePass = true;
                this.updatePassDelay = 0;
                break;
            case net.Msg.AliveCounts:
                var G = new net.AliveCountsMsg();
                G.deserialize(t);
                if (G.teamAliveCounts.length == 1) {
                    this.zt.updatePlayersAlive(
                        G.teamAliveCounts[0]
                    );
                } else if (G.teamAliveCounts.length >= 2) {
                    this.zt.updatePlayersAliveRed(
                        G.teamAliveCounts[0]
                    );
                    this.zt.updatePlayersAliveBlue(
                        G.teamAliveCounts[1]
                    );
                }
                break;
            case net.Msg.Disconnect:
                var X = new net.DisconnectMsg();
                X.deserialize(t);
                this.disconnectMsg = X.reason;
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
                firebaseManager.storeGeneric("error", "sendMessageException");
                this.ws.close();
            }
        }
    }
}

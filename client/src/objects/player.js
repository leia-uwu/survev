import * as PIXI from "pixi.js"
;
import { GameConfig } from "../../../shared/gameConfig";
import net from "../../../shared/net";
import { util } from "../../../shared/utils/util";
import { v2 } from "../../../shared/utils/v2";
import { math } from "../../../shared/utils/math";
import { coldet } from "../../../shared/utils/coldet";
import { collider } from "../../../shared/utils/collider";
import { collisionHelpers } from "../../../shared/utils/collisionHelpers";
import device from "../device";
import firebaseManager from "../firebaseManager";
import helpers from "../helpers";
import objectPool from "./objectPool";
import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";
import { MapObjectDefs } from "../../../shared/defs/mapObjectDefs";
import animData from "../animData";
import shot from "./shot";

var Action = GameConfig.Action;
var Anim = GameConfig.Anim;
var Input = GameConfig.Input;
var HasteType = GameConfig.HasteType;

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
function i(e, t) {
    if (!(e instanceof t)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function o(e, t) {
    if (e.length != t.length) {
        return false;
    }
    for (let r = 0; r < e.length; r++) {
        if (e[r].type != t[r].type) {
            return false;
        }
    }
    return true;
}
function s() {
    const e = {
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
    const t = new PIXI.Text("", e);
    t.anchor.set(0.5, 0.5);
    t.scale.set(0.5, 0.5);
    t.position.set(0, 30);
    t.visible = false;
    return t;
}
function n() {
    const e = new PIXI.Sprite();
    e.texture = PIXI.Texture.EMPTY;
    e.anchor.set(0.5, 0.5);
    e.scale.set(1, 1);
    e.tint = 16777215;
    e.visible = false;
    return e;
}
function l() {
    this.bodySprite = n();
    this.chestSprite = n();
    this.flakSprite = n();
    this.steelskinSprite = n();
    this.helmetSprite = n();
    this.visorSprite = n();
    this.backpackSprite = n();
    this.handLSprite = n();
    this.handRSprite = n();
    this.footLSprite = n();
    this.footRSprite = n();
    this.hipSprite = n();
    this.gunLSprites = new F();
    this.gunRSprites = new F();
    this.objectLSprite = n();
    this.objectRSprite = n();
    this.meleeSprite = n();
    this.bodySubmergeSprite = n();
    this.handLSubmergeSprite = n();
    this.handRSubmergeSprite = n();
    this.footLSubmergeSprite = n();
    this.footRSubmergeSprite = n();
    this.bodyEffectSprite = n();
    this.patchSprite = n();
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
    this.nameText = s();
    this.container.addChild(this.nameText);
    this.auraContainer = new PIXI.Container();
    this.auraCircle = n();
    this.auraContainer.addChild(this.auraCircle);
    this.initSubmergeSprites();
    this.bones = [];
    this.anim = {
        type: Anim.None,
        data: {},
        seq: -1,
        ticker: 0,
        bones: []
    };
    for (let e = Object.keys(D).length, t = 0; t < e; t++) {
        this.bones.push(new O());
        this.anim.bones.push({
            weight: 0,
            pose: new O()
        });
    }
    this.perks = [];
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
    this.I = 0;
    this.Br = 0;
    this.action = {};
    this.Le = {};
    this.Re = {};
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
function c() {
    this.$e = new objectPool.Pool(l);
    this.Rr = {};
    this.playerIds = [];
    this.teamInfo = {};
    this.groupInfo = {};
    this.playerStatus = {};
    this.anonPlayerNames = false;
}
var m = (function() {
    function e(e, t) {
        for (let r = 0; r < t.length; r++) {
            const a = t[r];
            a.enumerable = a.enumerable || false;
            a.configurable = true;
            if ("value" in a) {
                a.writable = true;
            }
            Object.defineProperty(e, a.key, a);
        }
    }
    return function(t, r, a) {
        if (r) {
            e(t.prototype, r);
        }
        if (a) {
            e(t, a);
        }
        return t;
    };
})();

var O = animData.Pose;
var D = animData.Bones;
var E = [];
var B = [];
for (
    var R = Object.keys(GameConfig.scopeZoomRadius.mobile), L = 0;
    L < R.length;
    L++
) {
    const q = R[L];
    E.push(GameConfig.scopeZoomRadius.desktop[q]);
    B.push(GameConfig.scopeZoomRadius.mobile[q]);
}
var F = (function() {
    function e() {
        i(this, e);
        this.gunBarrel = n();
        this.gunMag = n();
        this.container = new PIXI.Container();
        this.container.addChild(this.gunBarrel);
        this.container.addChild(this.gunMag);
        this.container.rotation = Math.PI * 0.5;
        this.container.visible = false;
        this.magTop = false;
    }
    m(e, [
        {
            key: "setVisible",
            value: function(e) {
                this.container.visible = e;
            }
        },
        {
            key: "setType",
            value: function(e, t) {
                const r = GameObjectDefs[e];
                const a = r.worldImg;
                this.gunBarrel.texture = PIXI.Texture.fromImage(
                    a.sprite
                );
                this.gunBarrel.anchor.set(0.5, 1);
                this.gunBarrel.position.set(0, 0);
                this.gunBarrel.scale.set(
                    (a.scale.x * 0.5) / t,
                    (a.scale.y * 0.5) / t
                );
                this.gunBarrel.tint = a.tint;
                this.gunBarrel.visible = true;
                if (a.magImg) {
                    const i = a.magImg;
                    this.gunMag.texture = PIXI.Texture.fromImage(
                        i.sprite
                    );
                    this.gunMag.anchor.set(0.5, 0.5);
                    this.gunMag.position.set(
                        i.pos.x / t,
                        i.pos.y / t
                    );
                    this.gunMag.scale.set(0.25 / t, 0.25 / t);
                    this.gunMag.tint = 16777215;
                    this.gunMag.visible = true;
                    if (i.top) {
                        this.container.addChild(this.gunMag);
                    } else {
                        this.container.addChildAt(this.gunMag, 0);
                    }
                } else {
                    this.gunMag.visible = false;
                }
                this.magTop = a.magImg?.top;
                const o = r.isDual
                    ? v2.create(-5.95, 0)
                    : v2.create(-4.25, -1.75);
                if (a.gunOffset) {
                    o.x += a.gunOffset.x;
                    o.y += a.gunOffset.y;
                }
                this.container.position.set(o.x, o.y);
            }
        }
    ]);
    return e;
})();
l.prototype = {
    o: function() {
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
        this.Le = {
            ie: v2.create(0, 0),
            oe: v2.create(1, 0),
            se: "",
            ne: "",
            le: "",
            ce: "",
            me: "",
            pe: 0,
            he: false,
            ue: false,
            ge: 0,
            ye: 0,
            we: 0,
            fe: 0,
            _e: false,
            be: false,
            xe: false,
            Se: 0,
            ve: 0,
            ke: 0,
            ze: "",
            Ie: 1,
            Te: "",
            Me: []
        };
        this.Re = {
            Lr: 100,
            O: 0,
            qr: 0,
            Fr: "",
            rt: 0,
            jr: {},
            tt: [],
            Be: 0
        };
    },
    n: function() {
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
    },
    c: function(e, t, r, a) {
        this.Le.ie = v2.copy(e.ie);
        this.Le.oe = v2.copy(e.oe);
        if (t) {
            this.Le.se = e.se;
            this.Le.ne = e.ne;
            this.Le.le = e.le;
            this.Le.ce = e.ce;
            this.Le.me = e.me;
            this.Le.pe = e.pe;
            this.Le.he = e.he;
            this.Le.ue = e.ue;
            this.Le.ge = e.ge;
            this.Le.ye = e.ye;
            this.Le.we = e.we;
            this.Le.fe = e.fe;
            this.Le._e = e._e;
            this.Le.be = e.be;
            this.Le.xe = e.xe;
            this.Le.Se = e.Se;
            this.Le.ve = e.ve;
            this.Le.ke = e.ke;
            this.Le.ze = e.ze;
            this.Le.Ie = e.Ie;
            this.Le.Te = e.Te;
            if (!!r || !o(this.Le.Me, e.Me)) {
                this.perksDirty = true;
            }
            this.Le.Me = e.Me;
            if (e.ye != this.anim.seq) {
                this.playAnim(e.ge, e.ye);
            }
            this.action.type = e.we;
            this.action.seq = e.fe;
            this.action.item = e.ze;
            this.visualsDirty = true;
        }
        if (r) {
            this.isNew = true;
            this.renderLayer = this.Le.pe;
            this.renderZOrd = 18;
            this.renderZIdx = this.__id;
        }
    },
    Mr: function(e, t) {
        const r = this.Re.Fr;
        if (e.healthDirty) {
            this.Re.Lr = e.health;
        }
        if (e.boostDirty) {
            this.Re.qr = e.boost;
        }
        if (e.zoomDirty) {
            this.Re.O = e.zoom;
            this.zoomFast = false;
        }
        if (e.actionDirty) {
            this.action.time = e.action.time;
            this.action.duration = e.action.duration;
            this.action.targetId = e.action.targetId;
        }
        if (e.inventoryDirty) {
            this.Re.Fr = e.scope;
            this.Re.jr = {};
            for (const a in GameConfig.bagSizes) {
                if (GameConfig.bagSizes.hasOwnProperty(a)) {
                    this.Re.jr[a] = e.inventory[a];
                }
            }
        }
        if (e.weapsDirty) {
            this.Re.rt = e.curWeapIdx;
            this.Re.tt = [];
            for (let i = 0; i < GameConfig.WeaponSlot.Count; i++) {
                const o = {
                    type: e.weapons[i].type,
                    ammo: e.weapons[i].ammo
                };
                this.Re.tt.push(o);
            }
        }
        if (e.spectatorCountDirty) {
            this.Re.Be = e.spectatorCount;
        }
        if (this.Re.Fr != r) {
            this.zoomFast = true;
        }
    },
    yr: function() {
        let e = this.Re.O;
        if (device.mobile) {
            const t = E.indexOf(e);
            if (t !== -1) {
                e = B[t];
            }
        }
        return e;
    },
    Nr: function() {
        if (this.Le.le) {
            return GameObjectDefs[this.Le.le].level;
        } else {
            return 0;
        }
    },
    Hr: function() {
        if (this.Le.ce) {
            return GameObjectDefs[this.Le.ce].level;
        } else {
            return 0;
        }
    },
    Vr: function() {
        return GameObjectDefs[this.Le.ne].level;
    },
    Ur: function() {
        return GameObjectDefs[this.Le.me].type;
    },
    Wr: function(e) {
        return this.Re.tt[e].type !== "";
    },
    getMeleeCollider: function() {
        const e = GameObjectDefs[this.Le.me];
        const t = Math.atan2(this.dir.y, this.dir.x);
        const r = v2.add(
            e.attack.offset,
            v2.mul(v2.create(1, 0), this.Le.Ie - 1)
        );
        const a = v2.add(this.pos, v2.rotate(r, t));
        const i = e.attack.rad;
        return collider.createCircle(a, i, 0);
    },
    hasActivePan: function() {
        return (
            this.Le._e ||
            (this.Le.me == "pan" && this.currentAnim() != Anim.Melee)
        );
    },
    getPanSegment: function() {
        const e = this.Le._e ? "unequipped" : "equipped";
        return GameObjectDefs.pan.reflectSurface[e];
    },
    canInteract: function(e) {
        return !this.Le.he && (!e.perkMode || this.Le.Te);
    },
    Gr: function(e, t, r) {
        var a = this;
        for (var i = 0; i < this.perks.length; i++) {
            this.perks[i].isNew = false;
        }
        if (this.perksDirty) {
            if (e && !t) {
                for (let o = 0; o < this.Le.Me.length; o++) {
                    (function(e) {
                        const t = a.Le.Me[e];
                        if (
                            a.perks.findIndex((e) => {
                                return e.type == t.type;
                            }) === -1
                        ) {
                            r.addRareLootMessage(t.type);
                        }
                    })(o);
                }
                for (let s = 0; s < this.perks.length; s++) {
                    (function(e) {
                        const t = a.perks[e];
                        if (
                            a.Le.Me.findIndex((e) => {
                                return e.type == t.type;
                            }) === -1
                        ) {
                            r.removeRareLootMessage(t.type);
                        }
                    })(s);
                }
            }
            var n = [];
            for (var l = 0; l < this.Le.Me.length; l++) {
                (function(e) {
                    const t = a.Le.Me[e];
                    const r =
                        a.perks.findIndex((e) => {
                            return e.type == t.type;
                        }) === -1;
                    n.push({
                        type: t.type,
                        droppable: t.droppable,
                        isNew: r && !a.isNew
                    });
                })(l);
            }
            this.perks = n;
            this.perkTypes = [];
            for (let c = 0; c < this.Le.Me.length; c++) {
                this.perkTypes.push(this.Le.Me[c].type);
            }
            this.perksDirty = false;
        }
    },
    hasPerk: function(e) {
        return this.perkTypes.includes(e);
    },
    m: function(e, t, r, i, o, s, n, l, c, m, p, w, x) {
        const k = GameObjectDefs[this.Le.me];
        const z = this.__id == m;
        const I = t.u(m);
        this.posOld = v2.copy(this.pos);
        this.dirOld = v2.copy(this.dir);
        this.pos = v2.copy(this.Le.ie);
        this.dir = v2.copy(this.Le.oe);
        this.layer = this.Le.pe;
        this.downed = this.Le.ue;
        this.rad = this.Le.Ie * GameConfig.player.radius;
        if (!math.eqAbs(this.rad, this.bodyRad)) {
            const T = this.rad - this.bodyRad;
            let M = Math.abs(T) > 0.0001 ? T * e * 6 : T;
            if (this.isNew) {
                M = T;
            }
            this.bodyRad += M;
            this.visualsDirty = true;
        }
        if (z) {
            const P = n.j(v2.create(n.screenWidth, 0));
            const D = v2.sub(P, n.pos);
            this.viewAabb.min = v2.sub(n.pos, D);
            this.viewAabb.max = v2.add(n.pos, D);
        }
        this.Gr(z, x, c);
        const E = this.weapTypeOld != this.Le.me;
        this.weapTypeOld = this.Le.me;
        this.lastThrowablePickupSfxTicker -= e;
        this.noCeilingRevealTicker -= e;
        const B = t.qe(m).groupId;
        const R = t.qe(this.__id);
        const L = R.groupId == B;
        this.nameText.text = R.name;
        this.nameText.visible = !z && L;
        var q = null;
        var F = null;
        for (var j = r.Ve.p(), N = 0; N < j.length; N++) {
            const H = j[N];
            if (H.active && !H.dead && H.layer == this.Le.pe) {
                if (H.isBush) {
                    const V = this.rad * 0.25;
                    if (
                        collider.intersectCircle(H.collider, this.pos, V)
                    ) {
                        q = H;
                    }
                } else if (H.isDoor) {
                    const U = this.rad + 0.25;
                    const W = v2.sub(H.pos, this.pos);
                    const G = v2.rotate(v2.create(1, 0), H.rot);
                    const X = collider.intersectCircle(
                        H.collider,
                        this.pos,
                        U
                    );
                    if (
                        X &&
                        (H.door.locked ||
                            (H.door.openOneWay && v2.dot(W, G) < 0))
                    ) {
                        F = H;
                    }
                }
            }
        }
        const K = q != null;
        if (K) {
            this.insideObstacleType = q.type;
        }
        this.lastInsideObstacleTime -= e;
        if (
            this.wasInsideObstacle != K &&
            this.lastInsideObstacleTime < 0 &&
            !this.isNew
        ) {
            const Z = MapObjectDefs[this.insideObstacleType];
            this.lastInsideObstacleTime = 0.2;
            i.playSound(Z.sound.enter, {
                channel: "sfx",
                soundPos: this.pos,
                falloff: 1,
                layer: this.layer,
                filter: "muffled"
            });
            for (
                let Y = v2.normalizeSafe(
                    v2.sub(this.posOld, this.pos),
                    v2.create(1, 0)
                ),
                J = K ? 1 : -1,
                Q = Math.floor(util.random(3, 5)),
                $ = 0;
                $ < Q;
                $++
            ) {
                const ee = v2.mul(
                    v2.rotate(
                        v2.mul(Y, J),
                        ((Math.random() - 0.5) * Math.PI) / 1.5
                    ),
                    util.random(6, 8)
                );
                o.addParticle(
                    Z.hitParticle,
                    this.layer,
                    this.pos,
                    ee
                );
            }
        }
        this.wasInsideObstacle = K;
        const te = this.isNearDoorError;
        this.isNearDoorError = F != null;
        this.doorErrorTicker -= e;
        if (
            this.isNearDoorError &&
            !te &&
            this.doorErrorTicker <= 0
        ) {
            this.doorErrorTicker = 0.5;
            const re = MapObjectDefs[F.type];
            const ae = re.door.sound.error;
            i.playSound(ae, {
                channel: "sfx",
                soundPos: this.pos,
                falloff: 1,
                layer: this.layer,
                filter: "muffled"
            });
        }
        this.surface = r.getGroundSurface(this.pos, this.layer);
        const ie = this.surface.type == "water";
        this.updateSubmersion(e, r);
        this.updateFrozenState(e);
        if (!this.Le.he) {
            this.stepDistance += v2.length(
                v2.sub(this.posOld, this.pos)
            );
            if (
                (this.stepDistance > 5 && ie) ||
                (ie && !this.wasInWater)
            ) {
                this.stepDistance = 0;
                o.addRippleParticle(
                    this.pos,
                    this.layer,
                    this.surface.data.rippleColor
                );
                i.playGroup("footstep_water", {
                    soundPos: this.pos,
                    fallOff: 3,
                    layer: this.layer,
                    filter: "muffled"
                });
            } else if (this.stepDistance > 4 && !ie) {
                this.stepDistance = 0;
                i.playGroup(`footstep_${this.surface.type}`, {
                    soundPos: this.pos,
                    fallOff: 3,
                    layer: this.layer,
                    filter: "muffled"
                });
            }
            this.wasInWater = ie;
        }
        this.bleedTicker -= e;
        if (
            !this.Le.he &&
            ((this.Le.ue && this.action.type == Action.None) ||
                this.hasPerk("trick_drain")) &&
            this.bleedTicker < 0
        ) {
            this.bleedTicker = this.hasPerk("trick_drain")
                ? GameConfig.player.bleedTickRate * 3
                : GameConfig.player.bleedTickRate;
            const oe = v2.rotate(
                v2.mul(this.dir, -1),
                ((Math.random() - 0.5) * Math.PI) / 3
            );
            oe.y *= -1;
            o.addParticle(
                "bloodSplat",
                this.renderLayer,
                v2.create(0, 0),
                v2.mul(oe, n.ppu),
                1,
                Math.random() * Math.PI * 2,
                this.container,
                this.renderZOrd + 1
            );
            if (!w) {
                i.playSound("player_bullet_hit_02", {
                    channel: "hits",
                    soundPos: this.pos,
                    fallOff: 3,
                    layer: this.layer,
                    filter: "muffled"
                });
            }
        }
        this.gunSwitchCooldown -= e;
        this.fireDelay -= e;
        if (z && (E || this.lastSwapIdx != this.Re.rt)) {
            const se = this.lastSwapIdx;
            this.lastSwapIdx = this.Re.rt;
            const ne = GameObjectDefs[this.Le.me];
            if (ne.type == "melee" || ne.type == "throwable") {
                if (
                    ne.type != "throwable" ||
                    this.lastThrowablePickupSfxTicker <= 0
                ) {
                    const le = this.isLoadoutAvatar
                        ? n.pos
                        : this.pos;
                    i.playSound(ne.sound.deploy, {
                        channel: "sfx",
                        soundPos: le,
                        fallOff: 3
                    });
                }
            } else if (ne.type == "gun") {
                let ce = "gun_switch_01";
                let me = false;
                if (
                    (se == 0 || se == 1) &&
                    (this.lastSwapIdx == 0 ||
                        this.lastSwapIdx == 1) &&
                    this.fireDelay > 0
                ) {
                    const pe = GameObjectDefs[this.Re.tt[se].type];
                    if (
                        ne &&
                        pe &&
                        ne.deployGroup !== undefined &&
                        pe.deployGroup !== undefined &&
                        ne.deployGroup == pe.deployGroup
                    ) {
                        me = true;
                    }
                }
                if (this.gunSwitchCooldown > 0 || me) {
                    ce = ne.sound.deploy;
                } else {
                    this.gunSwitchCooldown =
                        GameConfig.player.freeSwitchCooldown;
                }
                i.stopSound(this.cycleSoundInstance);
                this.cycleSoundInstance = i.playSound(ce, {
                    channel: "activePlayer"
                });
                this.fireDelay = 0;
            }
        }
        if (!i.isSoundPlaying(this.cycleSoundInstance)) {
            this.cycleSoundInstance = null;
        }
        if (this.action.seq != this.action.seqOld && !this.isNew) {
            let he = true;
            if (!z && this.action.type != Action.None) {
                this.action.throttleTicker = 0.5;
                if (this.action.throttleCount < 5) {
                    this.action.throttleCount++;
                } else {
                    he = false;
                }
            }
            if (he) {
                this.playActionStartEffect(z, o, i);
            }
        }
        this.action.seqOld = this.action.seq;
        this.updateActionEffect(z, R, o, i);
        this.action.throttleTicker -= e;
        if (
            this.action.throttleTicker < 0 &&
            this.action.throttleCount > 0
        ) {
            this.action.throttleCount--;
            this.action.throttleTicker = 0.25;
        }
        if (this.Le.ve && this.Le.ke != this.hasteSeq) {
            let de;
            de = {};
            a(de, HasteType.None, {
                particle: "",
                sound: ""
            });
            a(de, HasteType.Windwalk, {
                particle: "windwalk",
                sound: "ability_stim_01"
            });
            a(de, HasteType.Takedown, {
                particle: "takedown",
                sound: "ability_stim_01"
            });
            a(de, HasteType.Inspire, {
                particle: "inspire",
                sound: "ability_stim_01"
            });
            const ue = de;
            const ge = ue[this.Le.ve];
            if (!this.isNew) {
                i.playSound(ge.sound, {
                    channel: "sfx",
                    soundPos: this.pos,
                    fallOff: 1,
                    layer: this.layer,
                    filter: "muffled"
                });
            }
            this.hasteEmitter?.stop();
            this.hasteEmitter = o.addEmitter(ge.particle, {
                pos: this.pos,
                layer: this.layer
            });
            this.hasteSeq = this.Le.ke;
        } else if (!this.Le.ve && this.hasteEmitter) {
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
        if (this.Le.be && !this.passiveHealEmitter) {
            this.passiveHealEmitter = o.addEmitter("heal_basic", {
                pos: this.pos,
                layer: this.layer
            });
        } else if (!this.Le.be && this.passiveHealEmitter) {
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
        if (z && !x) {
            const ye = this.Re.rt;
            const we = this.Re.tt[ye];
            const fe = GameObjectDefs[we.type];
            if (
                !this.playedDryFire &&
                this.Ur() == "gun" &&
                (s.isBindPressed(Input.Fire) ||
                    (s.isBindDown(Input.Fire) &&
                        fe.fireMode == "auto")) &&
                this.action.type == Action.None &&
                !p &&
                !fe.ammoInfinite
            ) {
                const _e = this.Re.jr[fe.ammo] || 0;
                const be = we.ammo;
                if (_e == 0 && be == 0) {
                    i.playSound(fe.sound.empty);
                    this.playedDryFire = true;
                }
            }
            if (!s.isBindDown(Input.Fire)) {
                this.playedDryFire = false;
            }
        }
        this.gunRecoilL = math.max(
            0,
            this.gunRecoilL - this.gunRecoilL * e * 5 - e
        );
        this.gunRecoilR = math.max(
            0,
            this.gunRecoilR - this.gunRecoilR * e * 5 - e
        );
        const xe = {
            playerBarn: t,
            map: r,
            audioManager: i,
            particleBarn: o
        };
        this.updateAnim(e, xe);
        if (this.currentAnim() == Anim.None) {
            this.throwableState = "equip";
        }
        if (
            (this.currentAnim() == Anim.Cook ||
                this.currentAnim() == Anim.Throw) &&
            k.type != "throwable"
        ) {
            this.playAnim(Anim.None, this.anim.seq);
        }
        for (
            let Se = this.selectIdlePose(),
            ve = animData.IdlePoses[Se],
            ke = 0;
            ke < this.bones.length;
            ke++
        ) {
            const ze = ke;
            const Ie = ve[ze] || O.identity;
            const Te = this.anim.bones[ze];
            if (Te.weight > 0) {
                this.bones[ke].copy(O.lerp(Te.weight, Ie, Te.pose));
            } else {
                this.bones[ke].copy(Ie);
            }
        }
        if (this.throwableStatePrev != this.throwableState) {
            this.visualsDirty = true;
        }
        this.throwableStatePrev = this.throwableState;
        if (this.visualsDirty) {
            this.Xr(t, r);
        }
        this.visualsDirty = false;
        this.Kr(e, z, I);
        this.Zr();
        this.Yr(z, I, r);
        l.addPIXIObj(
            this.auraContainer,
            this.renderLayer,
            this.renderZOrd - 1,
            this.renderZIdx
        );
        const Me =
            I.layer & 2 ||
            (I.layer & 1) == 1 ||
            (this.layer & 1) == 0;
        this.auraContainer.visible = !this.Le.he && Me;
        l.addPIXIObj(
            this.container,
            this.renderLayer,
            this.renderZOrd,
            this.renderZIdx
        );
        this.isNew = false;
    },
    br: function(e, t) {
        const r = e.pointToScreen(this.pos);
        const a = e.pixels(1);
        this.container.position.set(r.x, r.y);
        this.container.scale.set(a, a);
        this.container.visible = !this.Le.he;
        this.auraContainer.position.set(r.x, r.y);
        this.auraContainer.scale.set(a, a);
    },
    Yr: function(e, t, r) {
        var a = collider.createCircle(this.pos, GameConfig.player.maxVisualRadius);
        var i = false;
        var o = false;
        var s = false;
        for (var n = r.lr.p(), l = 0; l < n.length; l++) {
            const c = n[l];
            if (c.active) {
                for (let m = 0; m < c.stairs.length; m++) {
                    const p = c.stairs[m];
                    const d = collider.intersect(p.collision, a);
                    if (d) {
                        o = true;
                        const u = v2.add(
                            p.center,
                            v2.mul(p.downDir, -2.5)
                        );
                        let g = v2.sub(u, this.pos);
                        const y = v2.length(g);
                        g =
                            y > 0.0001
                                ? v2.div(g, y)
                                : v2.create(1, 0);
                        s =
                            collisionHelpers.intersectSegmentDist(
                                r.Ve.p(),
                                this.pos,
                                g,
                                y,
                                0.5,
                                this.layer,
                                false
                            ) < y;
                    }
                    if (
                        e &&
                        p.noCeilingReveal &&
                        d &&
                        this.layer != 0
                    ) {
                        this.noCeilingRevealTicker = 0.25;
                    }
                }
                for (let w = 0; w < c.mask.length; w++) {
                    if (collider.intersect(c.mask[w], a)) {
                        i = true;
                        break;
                    }
                }
            }
        }
        let f = this.layer;
        let b = 18;
        if (
            o &&
            ((f & 1 && (t.layer & 1 || !s)) || (t.layer & 2 && !i))
        ) {
            f |= 2;
        }
        if (
            !!o &&
            (f & 1) == (t.layer & 1) &&
            (!i || t.layer == 0)
        ) {
            f |= 2;
            b += 100;
        }
        const x =
            this.__id +
            (this.Le.ue ? 0 : 262144) +
            (e ? 65536 : 0) +
            (this.rad > 1 ? 131072 : 0);
        this.renderLayer = f;
        this.renderZOrd = b;
        this.renderZIdx = x;
    },
    Xr: function(e, t) {
        const r = GameObjectDefs[this.Le.se];
        const a = r.skinImg;
        const i = this.bodyRad / GameConfig.player.radius;
        this.bodySprite.texture = PIXI.Texture.fromImage(a.baseSprite);
        this.bodySprite.tint = r.ghillie
            ? t.getMapDef().biome.colors.playerGhillie
            : a.baseTint;
        this.bodySprite.scale.set(0.25, 0.25);
        this.bodySprite.visible = true;
        if (this.Le.xe && this.updateFrozenImage) {
            const o = t.getMapDef().biome.frozenSprites || [];
            if (o.length > 0) {
                const s = o[Math.floor(Math.random() * o.length)];
                const n =
                    math.oriToRad(this.Le.Se) +
                    Math.PI * 0.5 +
                    (Math.random() - 0.5) * Math.PI * 0.25;
                this.bodyEffectSprite.texture =
                    PIXI.Texture.fromImage(s);
                this.bodyEffectSprite.rotation = n;
                this.bodyEffectSprite.tint = 16777215;
                this.bodyEffectSprite.scale.set(0.25, 0.25);
            }
            this.updateFrozenImage = false;
        }
        if (t.factionMode && !r.ghillie) {
            const l = e.qe(this.__id);
            const c = l.teamId;
            const m = [
                "player-patch-01.img",
                "player-patch-02.img"
            ];
            const g = (c - 1) % m.length;
            const y = m[g];
            const w = GameConfig.teamColors[g];
            const f = math.oriToRad(3) + Math.PI * 0.5;
            this.patchSprite.texture = PIXI.Texture.fromImage(y);
            this.patchSprite.rotation = f;
            this.patchSprite.tint = w;
            this.patchSprite.scale.set(0.25, 0.25);
            this.patchSprite.visible = true;
        } else {
            this.patchSprite.visible = false;
        }
        const _ = function(e, t, r) {
            e.texture = PIXI.Texture.fromImage(t);
            e.scale.set(0.175, 0.175);
            e.tint = r;
            e.visible = true;
        };
        const x = r.ghillie
            ? t.getMapDef().biome.colors.playerGhillie
            : a.handTint;
        _(this.handLSprite, a.handSprite, x);
        _(this.handRSprite, a.handSprite, x);
        const S = function(e, t, r) {
            e.texture = PIXI.Texture.fromImage("player-feet-01.img");
            e.scale.set(0.45, 0.45);
            e.rotation = Math.PI * 0.5;
            e.tint = t;
            e.visible = r;
        };
        const v = r.ghillie
            ? t.getMapDef().biome.colors.playerGhillie
            : a.footTint;
        S(this.footLSprite, v, this.downed);
        S(this.footRSprite, v, this.downed);
        if (this.hasPerk("flak_jacket") && !r.ghillie) {
            this.flakSprite.texture = PIXI.Texture.fromImage(
                "player-armor-base-01.img"
            );
            this.flakSprite.scale.set(0.215, 0.215);
            this.flakSprite.tint = 3671558;
            this.flakSprite.alpha = 0.7;
            this.flakSprite.visible = true;
        } else {
            this.flakSprite.visible = false;
        }
        if (this.Le.ce == "" || r.ghillie) {
            this.chestSprite.visible = false;
        } else {
            const k = GameObjectDefs[this.Le.ce];
            const z = k.skinImg;
            this.chestSprite.texture = PIXI.Texture.fromImage(
                z.baseSprite
            );
            this.chestSprite.scale.set(0.25, 0.25);
            this.chestSprite.tint = z.baseTint;
            this.chestSprite.visible = true;
        }
        if (this.hasPerk("steelskin") && !r.ghillie) {
            this.steelskinSprite.texture = PIXI.Texture.fromImage(
                "loot-melee-pan-black.img"
            );
            this.steelskinSprite.scale.set(0.4, 0.4);
            this.steelskinSprite.anchor.set(0.575, 0.5);
            this.steelskinSprite.tint = 16777215;
            this.steelskinSprite.visible = true;
        } else {
            this.steelskinSprite.visible = false;
        }
        if (this.Le.le == "" || r.ghillie) {
            this.helmetSprite.visible = false;
        } else {
            const I = GameObjectDefs[this.Le.le];
            const T = I.skinImg;
            const M = (this.downed ? 1 : -1) * 3.33;
            this.helmetSprite.texture = PIXI.Texture.fromImage(
                T.baseSprite
            );
            this.helmetSprite.position.set(M, 0);
            if (T.spriteScale) {
                this.helmetSprite.scale.set(
                    T.spriteScale,
                    T.spriteScale
                );
            } else {
                this.helmetSprite.scale.set(0.15, 0.15);
            }
            let P = T.baseTint;
            if (t.factionMode) {
                P =
                    e.qe(this.__id).teamId == 1
                        ? T.baseTintRed
                        : T.baseTintBlue;
            }
            this.helmetSprite.tint = P;
            this.helmetSprite.visible = true;
        }
        if (this.Vr() > 0 && !r.ghillie && !this.downed) {
            GameObjectDefs[this.Le.ne];
            const A = [10.25, 11.5, 12.75];
            const O = this.Vr();
            const D = A[math.min(O - 1, A.length - 1)];
            const E = (0.4 + O * 0.03) * 0.5;
            this.backpackSprite.texture = PIXI.Texture.fromImage(
                "player-circle-base-01.img"
            );
            this.backpackSprite.position.set(-D, 0);
            this.backpackSprite.scale.set(E, E);
            this.backpackSprite.tint = a.backpackTint;
            this.backpackSprite.visible = true;
            (function(e, t, r) {
                e.texture = PIXI.Texture.fromImage(t);
                e.tint = r;
            })(
                this.backpackSprite,
                a.backpackSprite,
                a.backpackTint
            );
        } else {
            this.backpackSprite.visible = false;
        }
        if (this.Le._e) {
            const B = GameObjectDefs.pan.hipImg;
            this.hipSprite.texture = PIXI.Texture.fromImage(B.sprite);
            this.hipSprite.position.set(B.pos.x, B.pos.y);
            this.hipSprite.scale.set(B.scale.x, B.scale.y);
            this.hipSprite.rotation = B.rot;
            this.hipSprite.tint = B.tint;
            this.hipSprite.visible = true;
        } else {
            this.hipSprite.visible = false;
        }
        const R = GameObjectDefs[this.Le.me];
        if (R.type == "gun") {
            this.gunRSprites.setType(this.Le.me, i);
            this.gunRSprites.setVisible(true);
            if (R.isDual) {
                this.gunLSprites.setType(this.Le.me, i);
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
        if (R.type == "melee" && this.Le.me != "fists") {
            const V = R.worldImg;
            this.meleeSprite.texture = PIXI.Texture.fromImage(
                V.sprite
            );
            this.meleeSprite.pivot.set(-V.pos.x, -V.pos.y);
            this.meleeSprite.scale.set(
                V.scale.x / i,
                V.scale.y / i
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
                    e.texture = PIXI.Texture.fromImage(t.sprite);
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
        if (this.downed || this.currentAnim() == Anim.Revive) {
            this.gunLSprites.setVisible(false);
            this.gunRSprites.setVisible(false);
            this.meleeSprite.visible = false;
            this.objectLSprite.visible = false;
            this.objectRSprite.visible = false;
        }
        if (this.downed) {
            this.backpackSprite.visible = false;
        }
        if (
            (this.action.type != Action.UseItem &&
                this.action.type != Action.Revive) ||
            this.Le.he ||
            (this.Le.ue && !this.hasPerk("self_revive")) ||
            !this.hasPerk("aoe_heal")
        ) {
            this.auraPulseTicker = 0;
            this.auraPulseDir = 1;
            this.auraCircle.visible = false;
        } else {
            const Y = GameObjectDefs[this.action.item];
            const J = Y?.aura
                ? Y.aura.sprite
                : "part-aura-circle-01.img";
            const Q = Y?.aura ? Y.aura.tint : 16711935;
            let $ = Y
                ? GameConfig.player.medicHealRange
                : GameConfig.player.medicReviveRange;
            $ *= 0.125;
            this.auraCircle.texture = PIXI.Texture.fromImage(J);
            this.auraCircle.scale.set($, $);
            this.auraCircle.tint = Q;
            this.auraCircle.visible = true;
        }
        if (
            t.perkMode &&
            this.Le.Te != "" &&
            this.Le.le != "" &&
            !r.ghillie
        ) {
            const ee = GameObjectDefs[this.Le.Te];
            const te = ee.visorImg;
            if (te) {
                const re = (this.downed ? 1 : -1) * 3.33;
                this.visorSprite.texture = PIXI.Texture.fromImage(
                    te.baseSprite
                );
                this.visorSprite.position.set(re, 0);
            }
            if (te.spriteScale) {
                this.visorSprite.scale.set(
                    te.spriteScale,
                    te.spriteScale
                );
            } else {
                this.visorSprite.scale.set(0.15, 0.15);
            }
            this.visorSprite.visible = true;
        } else {
            this.visorSprite.visible = false;
        }
        this.bodyContainer.scale.set(i, i);
    },
    Kr: function(e, t, r) {
        let a = true;
        if (!t) {
            a = coldet.testCircleAabb(
                this.pos,
                this.rad,
                r.viewAabb.min,
                r.viewAabb.max
            );
        }
        this.auraViewFade = math.lerp(
            e * 6,
            this.auraViewFade,
            a ? 1 : 0
        );
        if (this.auraCircle.visible) {
            this.auraPulseTicker = math.clamp(
                this.auraPulseTicker + e * this.auraPulseDir * 1.5,
                0,
                1
            );
            const i =
                math.easeOutExpo(this.auraPulseTicker) * 0.75 + 0.25;
            if (
                this.auraPulseTicker >= 1 ||
                this.auraPulseTicker <= 0
            ) {
                this.auraPulseDir *= -1;
            }
            this.auraCircle.alpha = i * this.auraViewFade;
        }
    },
    Zr: function() {
        const e = function(e, t) {
            e.position.set(t.pos.x, t.pos.y);
            e.pivot.set(-t.pivot.x, -t.pivot.y);
            e.rotation = t.rot;
        };
        e(this.handLContainer, this.bones[D.HandL]);
        e(this.handRContainer, this.bones[D.HandR]);
        e(this.footLContainer, this.bones[D.FootL]);
        e(this.footRContainer, this.bones[D.FootR]);
        const t = GameObjectDefs[this.Le.me];
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
    },
    playActionStartEffect: function(e, t, r) {
        let a = null;
        switch (this.action.type) {
            case Action.Reload:
            case Action.ReloadAlt:
                var i = GameObjectDefs[this.action.item];
                if (i) {
                    a = {
                        sound:
                            this.action.type == Action.ReloadAlt
                                ? i.sound.reloadAlt
                                : i.sound.reload,
                        channel: e ? "activePlayer" : "otherPlayers"
                    };
                }
                break;
            case Action.UseItem:
                var o = GameObjectDefs[this.action.item];
                if (o) {
                    a = {
                        sound: o.sound.use,
                        channel: e ? "activePlayer" : "otherPlayers"
                    };
                }
        }
        r.stopSound(this.actionSoundInstance);
        if (a && this.playActionStartSfx) {
            this.actionSoundInstance = r.playSound(a.sound, {
                channel: a.channel,
                soundPos: this.pos,
                fallOff: 2,
                layer: this.layer,
                filter: "muffled"
            });
        }
        if (
            this.action.type == Action.Reload ||
            this.action.type == Action.ReloadAlt
        ) {
            const s = GameObjectDefs[this.action.item];
            if (s && s.caseTiming == "reload") {
                for (let n = 0; n < s.maxReload; n++) {
                    const l = n % 2 == 0 ? -1 : 1;
                    const c = Math.PI + (Math.PI / 4) * l;
                    const m =
                        s.maxReload <= 2
                            ? 1
                            : math.lerp(Math.random(), 0.8, 1.2);
                    shot.createCasingParticle(
                        this.action.item,
                        c,
                        m,
                        this.pos,
                        this.dir,
                        this.renderLayer,
                        this.renderZOrd + 1,
                        t
                    );
                }
            }
        }
    },
    updateActionEffect: function(e, t, r, a) {
        let i = "";
        const o = {};
        switch (this.action.type) {
            case Action.UseItem:
                var s = GameObjectDefs[this.action.item];
                var n = t.loadout;
                if (s.type == "heal") {
                    i = GameObjectDefs[n.heal].emitter;
                } else if (s.type == "boost") {
                    i = GameObjectDefs[n.boost].emitter;
                }
                if (this.hasPerk("aoe_heal")) {
                    o.scale = 1.5;
                    o.radius = GameConfig.player.medicHealRange / o.scale;
                    o.rateMult = 0.25;
                }
                break;
            case Action.Revive:
                if (this.Le.ue) {
                    i = "revive_basic";
                }
        }
        if (
            !!i &&
            (!this.useItemEmitter || this.useItemEmitter.type != i)
        ) {
            this.useItemEmitter?.stop();
            o.pos = this.pos;
            o.layer = this.layer;
            this.useItemEmitter = r.addEmitter(i, o);
        }
        if (this.useItemEmitter) {
            this.useItemEmitter.pos = v2.add(
                this.pos,
                v2.create(0, 0.1)
            );
            this.useItemEmitter.layer = this.renderLayer;
            this.useItemEmitter.zOrd = this.renderZOrd + 1;
        }
        if (this.useItemEmitter && !i) {
            this.useItemEmitter.stop();
            this.useItemEmitter = null;
        }
        if (!a.isSoundPlaying(this.actionSoundInstance)) {
            this.actionSoundInstance = null;
        }
        if (this.actionSoundInstance && !e) {
            a.updateSound(
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
    },
    playItemPickupSound: function(e, t) {
        const r = GameObjectDefs[e];
        if (r) {
            t.playSound(r.sound.pickup, {
                channel: "ui"
            });
            if (r.type == "throwable") {
                this.lastThrowablePickupSfxTicker = 0.3;
            }
        }
    },
    selectIdlePose: function() {
        const e = GameObjectDefs[this.Le.me];
        let t = "fists";
        t = this.downed
            ? "downed"
            : e.anim?.idlePose
                ? e.anim.idlePose
                : e.type == "gun"
                    ? e.pistol
                        ? e.isDual
                            ? "dualPistol"
                            : "pistol"
                        : e.isBullpup
                            ? "bullpup"
                            : e.isLauncher
                                ? "launcher"
                                : e.isDual
                                    ? "dualRifle"
                                    : "rifle"
                    : e.type == "throwable"
                        ? "throwable"
                        : "fists";
        if (animData.IdlePoses[t]) {
            return t;
        } else {
            return "fists";
        }
    },
    selectAnim: function(e) {
        const t = function(e, t) {
            return {
                type: e,
                mirror: !!t && Math.random() < 0.5
            };
        };
        switch (e) {
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
            case Anim.Melee:
                var r = GameObjectDefs[this.Le.me];
                if (!r.anim?.attackAnims) {
                    return t("fists", true);
                }
                var a = r.anim.attackAnims;
                var i = Math.floor(Math.random() * a.length);
                var o = a[i];
                return t(o, o == "fists" && a.length == 1);
            default:
                return t("none", false);
        }
    },
    currentAnim: function() {
        return this.anim.type;
    },
    playAnim: function(e, t) {
        this.anim.type = e;
        this.anim.data = this.selectAnim(e);
        this.anim.seq = t;
        this.anim.ticker = 0;
        for (let r = 0; r < this.bones.length; r++) {
            const a = this.anim.bones[r];
            a.weight = 0;
            a.pose.copy(this.bones[r]);
        }
    },
    updateAnim: function(e, t) {
        if (this.anim.data.type == "none") {
            this.playAnim(Anim.None, this.anim.seq);
        }
        if (this.currentAnim() != Anim.None) {
            const r = this.anim.ticker;
            this.anim.ticker += e * 1;
            var a = animData.Animations[this.anim.data.type];
            for (
                var i = a.keyframes, o = -1, s = 0;
                this.anim.ticker >= i[s].time && s < i.length - 1;

            ) {
                o++;
                s++;
            }
            o = math.max(o, 0);
            var n = i[o].time;
            var l = i[s].time;
            var c = math.min((this.anim.ticker - n) / (l - n), 1);
            var m = i[o].bones;
            var p = i[s].bones;
            var h = this.anim.data.mirror;
            for (var d = 0; d < this.anim.bones.length; d++) {
                const g = this.anim.bones[d];
                let y = d;
                if (h) {
                    y = d % 2 == 0 ? d + 1 : d - 1;
                }
                if (m[y] !== undefined && p[y] !== undefined) {
                    g.weight = o == s ? c : 1;
                    g.pose.copy(O.lerp(c, m[y], p[y]));
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
                    this[x.fn].apply(this, [t, x.args]);
                }
            }
            if (w) {
                this.playAnim(Anim.None, this.anim.seq);
            }
        }
    },
    animPlaySound: function(e, t) {
        const r = GameObjectDefs[this.Le.me];
        const a = r.sound[t.sound];
        if (a) {
            e.audioManager.playSound(a, {
                channel: "sfx",
                soundPos: this.pos,
                fallOff: 3,
                layer: this.layer,
                filter: "muffled"
            });
        }
    },
    animSetThrowableState: function(e, t) {
        this.throwableState = t.state;
    },
    animThrowableParticles: function(e, t) {
        if (GameObjectDefs[this.Le.me].useThrowParticles) {
            const r = v2.rotate(
                v2.create(0.75, 0.75),
                Math.atan2(this.dir.y, this.dir.x)
            );
            e.particleBarn.addParticle(
                "fragPin",
                this.renderLayer,
                v2.add(this.pos, r),
                v2.mul(v2.rotate(this.dir, Math.PI * 0.5), 4.5),
                1,
                Math.random() * Math.PI * 2,
                null,
                this.renderZOrd + 1
            );
            const a = v2.rotate(
                v2.create(0.75, -0.75),
                Math.atan2(this.dir.y, this.dir.x)
            );
            e.particleBarn.addParticle(
                "fragLever",
                this.renderLayer,
                v2.add(this.pos, a),
                v2.mul(v2.rotate(this.dir, -Math.PI * 0.25), 3.5),
                1,
                Math.random() * Math.PI * 2,
                null,
                this.renderZOrd + 1
            );
        }
    },
    animMeleeCollision: function(e, t) {
        const r = GameObjectDefs[this.Le.me];
        if (r && r.type == "melee") {
            var a = this.getMeleeCollider();
            var i = a.rad + v2.length(v2.sub(this.pos, a.pos));
            var o = [];
            for (var s = e.map.Ve.p(), n = 0; n < s.length; n++) {
                const l = s[n];
                if (
                    !!l.active &&
                    !l.dead &&
                    !l.isSkin &&
                    l.height >= GameConfig.player.meleeHeight &&
                    util.sameLayer(l.layer, this.layer & 1)
                ) {
                    let c = collider.intersectCircle(
                        l.collider,
                        a.pos,
                        a.rad
                    );
                    if (r.cleave || r.wallCheck) {
                        const m = v2.normalizeSafe(
                            v2.sub(l.pos, this.pos),
                            v2.create(1, 0)
                        );
                        const p = collisionHelpers.intersectSegment(
                            e.map.Ve.p(),
                            this.pos,
                            m,
                            i,
                            1,
                            this.layer,
                            false
                        );
                        if (p && p.id !== l.__id) {
                            c = null;
                        }
                    }
                    if (c) {
                        const d = MapObjectDefs[l.type];
                        const u = v2.add(
                            a.pos,
                            v2.mul(v2.neg(c.dir), a.rad - c.pen)
                        );
                        const g = v2.rotate(
                            v2.mul(c.dir, 7.5),
                            ((Math.random() - 0.5) * Math.PI) / 3
                        );
                        o.push({
                            pen: c.pen,
                            prio: 1,
                            pos: u,
                            vel: g,
                            layer: this.renderLayer,
                            zOrd: this.renderZOrd,
                            particle: d.hitParticle,
                            sound: d.sound.punch,
                            soundFn: "playGroup"
                        });
                    }
                }
            }
            for (
                let y = e.playerBarn.qe(this.__id).teamId,
                w = e.playerBarn.$e.p(),
                v = 0;
                v < w.length;
                v++
            ) {
                const z = w[v];
                if (
                    z.active &&
                    z.__id != this.__id &&
                    !z.Le.he &&
                    util.sameLayer(z.layer, this.layer)
                ) {
                    const I = v2.normalizeSafe(
                        v2.sub(z.pos, this.pos),
                        v2.create(1, 0)
                    );
                    const T = coldet.intersectCircleCircle(
                        a.pos,
                        a.rad,
                        z.pos,
                        z.rad
                    );
                    if (
                        T &&
                        math.eqAbs(
                            i,
                            collisionHelpers.intersectSegmentDist(
                                e.map.Ve.p(),
                                this.pos,
                                I,
                                i,
                                GameConfig.player.meleeHeight,
                                this.layer,
                                false
                            )
                        )
                    ) {
                        const M = e.playerBarn.qe(z.__id).teamId;
                        const P = v2.rotate(
                            I,
                            ((Math.random() - 0.5) * Math.PI) / 3
                        );
                        const O =
                            r.sound[t.playerHit] ||
                            r.sound.playerHit;
                        o.push({
                            pen: T.pen,
                            prio: M == y ? 2 : 0,
                            pos: v2.copy(z.pos),
                            vel: P,
                            layer: z.renderLayer,
                            zOrd: z.renderZOrd,
                            particle: "bloodSplat",
                            sound: O,
                            soundFn: "playSound"
                        });
                    }
                }
            }
            o.sort((e, t) => {
                if (e.prio == t.prio) {
                    return t.pen - e.pen;
                } else {
                    return e.prio - t.prio;
                }
            });
            let D = o.length;
            if (!r.cleave) {
                D = math.min(D, 1);
            }
            for (let E = 0; E < D; E++) {
                const B = o[E];
                e.particleBarn.addParticle(
                    B.particle,
                    B.layer,
                    B.pos,
                    B.vel,
                    1,
                    Math.random() * Math.PI * 2,
                    null,
                    B.zOrd + 1
                );
                e.audioManager[B.soundFn](B.sound, {
                    channel: "hits",
                    soundPos: B.pos,
                    layer: this.layer,
                    filter: "muffled"
                });
            }
        }
    },
    initSubmergeSprites: function() {
        const e = function(e, t) {
            e.texture = PIXI.Texture.fromImage(t);
            e.anchor.set(0.5, 0.5);
            e.tint = 16777215;
            e.alpha = 0;
            e.visible = false;
        };
        e(this.bodySubmergeSprite, "player-wading-01.img");
        e(this.handLSubmergeSprite, "player-hands-01.img");
        e(this.handRSubmergeSprite, "player-hands-01.img");
        e(this.footLSubmergeSprite, "player-feet-01.img");
        e(this.footRSubmergeSprite, "player-feet-01.img");
        const t = new PIXI.Graphics();
        t.beginFill(16711680, 0.5);
        t.drawCircle(0, 0, 7.6000000000000005);
        t.position.set(0, 0);
        this.bodySubmergeSprite.addChild(t);
        this.bodySubmergeSprite.mask = t;
        this.bodySubmergeSprite.scale.set(0.5, 0.5);
    },
    updateSubmersion: function(e, t) {
        const r = this.surface.type == "water";
        let a = 0;
        if (r) {
            const i = this.surface.data.river;
            const o = i && !t.isInOcean(this.pos);
            const s = o
                ? i.distanceToShore(this.pos)
                : t.distanceToShore(this.pos);
            const n = o ? 12 : 16;
            a = math.remap(s, 0, n, 0.6, 1);
        }
        this.submersion = math.lerp(e * 4, this.submersion, a);
        const l = this.submersion * 0.8;
        const c = (0.9 - this.submersion * 0.4) * 2;
        const m = 1 / (c * 0.1);
        this.bodySubmergeSprite.scale.set(c, c);
        this.bodySubmergeSprite.mask.scale.set(m, m);
        this.bodySubmergeSprite.alpha = l;
        this.bodySubmergeSprite.visible = l > 0.001;
        if (r) {
            this.bodySubmergeSprite.tint =
                this.surface.data.waterColor;
        }
        for (
            let p = [
                this.handLSubmergeSprite,
                this.handRSubmergeSprite,
                this.footLSubmergeSprite,
                this.footRSubmergeSprite
            ],
            h = 0;
            h < p.length;
            h++
        ) {
            const d = p[h];
            d.alpha = this.downed ? l : 0;
            d.visible = d.alpha > 0.001;
            if (r) {
                d.tint = this.surface.data.waterColor;
            }
        }
    },
    updateFrozenState: function(e) {
        if (this.Le.xe) {
            this.frozenTicker = 0.25;
        } else {
            this.frozenTicker -= e;
            this.updateFrozenImage = true;
        }
        this.bodyEffectSprite.alpha = this.Le.xe
            ? 1
            : math.remap(this.frozenTicker, 0, 0.25, 0, 1);
        this.bodyEffectSprite.visible = this.frozenTicker > 0;
    },
    addRecoil: function(e, t, r) {
        if (t) {
            this.gunRecoilL += e;
        }
        if (r) {
            this.gunRecoilR += e;
        }
    },
    isUnderground: function(e) {
        if (this.layer != 1) {
            return false;
        }
        for (let t = e.lr.p(), r = 0; r < t.length; r++) {
            const a = t[r];
            if (a.layers.length >= 2) {
                const i = a.layers[1];
                if (
                    collider.intersectCircle(
                        i.collision,
                        this.pos,
                        this.rad
                    )
                ) {
                    return i.underground;
                }
            }
        }
        return true;
    }
};
c.prototype = {
    onMapLoad: function(e) { },
    m: function(e, t, r, a, i, o, s, n, l, c, m, p, h) {
        for (let d = this.$e.p(), u = 0; u < d.length; u++) {
            const g = d[u];
            if (g.active) {
                g.m(e, this, s, l, i, n, o, a, c, t, m, p, h);
            }
        }
        const y = this.qe(t);
        const f = this.u(t);
        this.Jr(t, {
            pos: v2.copy(f.Le.ie),
            health: f.Re.Lr,
            disconnected: false,
            dead: f.Le.he,
            downed: f.Le.ue,
            role: f.Le.Te,
            visible: true
        });
        for (
            let x = net.getPlayerStatusUpdateRate(s.factionMode),
            S = Object.keys(this.playerStatus),
            v = 0;
            v < S.length;
            v++
        ) {
            const k = this.playerStatus[S[v]];
            const z = k.playerId;
            const I = this.qe(z);
            const T = this.u(z);
            if (T) {
                k.posDelta = v2.length(v2.sub(T.Le.ie, k.pos));
                k.posTarget = v2.copy(T.Le.ie);
                k.posInterp = math.clamp(
                    k.posInterp + e * 0.2,
                    e / x,
                    1
                );
                k.dead = T.Le.he;
                k.downed = T.Le.ue;
            } else {
                k.posInterp = e / x;
            }
            const M = v2.sub(k.posTarget, k.pos);
            const P = v2.length(M);
            const C = P > 0.0001 ? v2.div(M, P) : v2.create(1, 0);
            const A = math.min(P, k.posDelta * k.posInterp);
            k.pos = v2.add(k.pos, v2.mul(C, A));
            k.timeSinceVisible += e;
            k.timeSinceUpdate += e;
            const O =
                !k.dead ||
                    (I.teamId != y.teamId && k.role != "leader")
                    ? 0
                    : 0.6;
            k.minimapAlpha =
                math.smoothstep(k.timeSinceVisible, 0, 0.1) *
                math.lerp(
                    math.smoothstep(k.timeSinceUpdate, 2, 2.5),
                    1,
                    O
                );
            if (!s.factionMode && I.teamId != y.teamId) {
                k.minimapAlpha = 0;
            }
            k.minimapVisible = k.minimapAlpha > 0.01;
        }
    },
    render: function(e, t) {
        for (let r = this.$e.p(), a = 0; a < r.length; a++) {
            const i = r[a];
            if (i.active) {
                i.br(e, t);
            }
        }
    },
    u: function(e) {
        for (let t = this.$e.p(), r = 0; r < t.length; r++) {
            const a = t[r];
            if (a.active && a.__id === e) {
                return a;
            }
        }
        return null;
    },
    vr: function(e) {
        this.Rr[e.playerId] = {
            playerId: e.playerId,
            teamId: e.teamId,
            groupId: e.groupId,
            name: e.name,
            nameTruncated: helpers.truncateString(
                e.name || "",
                "bold 16px arial",
                180
            ),
            anonName: `Player${e.playerId - 2750}`,
            loadout: util.cloneDeep(e.loadout)
        };
        this.playerIds.push(e.playerId);
        this.playerIds.sort((e, t) => {
            return e - t;
        });
    },
    kr: function(e) {
        const t = this.playerIds.indexOf(e);
        if (t !== -1) {
            this.playerIds.splice(t, 1);
        }
        delete this.Rr[e];
        delete this.playerStatus[e];
    },
    qe: function(e) {
        return (
            this.Rr[e] || {
                playerId: 0,
                group: 0,
                teamId: 0,
                name: "",
                nameTruncated: "",
                anonName: "",
                loadout: {}
            }
        );
    },
    zr: function() {
        this.teamInfo = {};
        this.groupInfo = {};
        for (
            let e = Object.keys(this.Rr), t = 0;
            t < e.length;
            t++
        ) {
            const r = this.Rr[e[t]];
            const a = r.playerId;
            const i = r.teamId;
            this.teamInfo[i] = this.teamInfo[i] || {
                teamId: i,
                playerIds: []
            };
            this.teamInfo[i].playerIds.push(a);
            const o = r.groupId;
            this.groupInfo[o] = this.groupInfo[o] || {
                groupId: o,
                playerIds: []
            };
            this.groupInfo[o].playerIds.push(a);
        }
        for (
            let s = Object.keys(this.teamInfo), n = 0;
            n < s.length;
            n++
        ) {
            this.teamInfo[s[n]].playerIds.sort((e, t) => {
                return e - t;
            });
        }
        for (
            let l = Object.keys(this.groupInfo), c = 0;
            c < l.length;
            c++
        ) {
            this.groupInfo[l[c]].playerIds.sort((e, t) => {
                return e - t;
            });
        }
    },
    getTeamInfo: function(e) {
        return this.teamInfo[e];
    },
    getGroupInfo: function(e) {
        return this.groupInfo[e];
    },
    Ir: function(e, t, r) {
        const a = this.getTeamInfo(e);
        const i = r ? this.playerIds : a.playerIds;
        if (i.length != t.players.length) {
            firebaseManager.logError(
                `PlayerIds and playerStatus.players out of sync. OurLen: ${i.length} MsgLen: ${t.players.length} FactionMode: ${r}`
            );
            return;
        }
        for (let o = 0; o < i.length; o++) {
            const s = i[o];
            const n = t.players[o];
            if (n.hasData) {
                this.Jr(s, n);
            }
        }
    },
    Jr: function(e, t) {
        const r = this.playerStatus[e] || {
            playerId: e,
            pos: v2.copy(t.pos),
            posTarget: v2.copy(t.pos),
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
        r.visible;
        if (!r.minimapVisible) {
            r.pos = v2.copy(t.pos);
            if (!r.visible && t.visible) {
                r.timeSinceVisible = 0;
            }
        }
        r.visible = t.visible;
        if (r.visible) {
            r.timeSinceUpdate = 0;
        }
        r.posTarget = v2.copy(t.pos);
        r.posDelta = v2.length(v2.sub(t.pos, r.pos));
        r.dead = t.dead;
        r.downed = t.downed;
        r.role = t.role;
        if (t.health !== undefined) {
            r.health = t.health;
        }
        if (t.disconnected !== undefined) {
            r.disconnected = t.disconnected;
        }
        this.playerStatus[e] = r;
    },
    Fe: function(e) {
        return this.playerStatus[e];
    },
    Tr: function(e, t) {
        const r = this.getGroupInfo(e);
        if (r.playerIds.length != t.players.length) {
            firebaseManager.logError(
                "PlayerIds and groupStatus.players out of sync"
            );
            return;
        }
        for (let a = 0; a < r.playerIds.length; a++) {
            const i = r.playerIds[a];
            const o = t.players[a];
            const s = this.Fe(i);
            if (s) {
                s.health = o.health;
                s.disconnected = o.disconnected;
            }
        }
    },
    getGroupColor: function(e) {
        const t = this.qe(e);
        const r = this.getGroupInfo(t.groupId);
        const a = r ? r.playerIds.indexOf(e) : 0;
        if (a >= 0 && a < GameConfig.groupColors.length) {
            return GameConfig.groupColors[a];
        } else {
            return 16777215;
        }
    },
    getTeamColor: function(e) {
        const t = e - 1;
        if (t >= 0 && t < GameConfig.teamColors.length) {
            return GameConfig.teamColors[t];
        } else {
            return 16777215;
        }
    },
    getPlayerName: function(e, t, r) {
        const a = this.qe(e);
        if (!a) {
            return "";
        }
        let i = a.name;
        if (r) {
            i = a.nameTruncated;
        }
        if (
            this.anonPlayerNames &&
            this.qe(t).groupId != a.groupId
        ) {
            i = a.anonName;
        }
        return i;
    },
    addDeathEffect: function(e, t, r, a, i) {
        const o = this.u(e);
        const s = this.u(t);
        if (o && s?.hasPerk("turkey_shoot")) {
            a.playGroup("cluck", {
                soundPos: o.pos,
                layer: o.layer,
                muffled: true
            });
            a.playSound("feather_01", {
                channel: "sfx",
                soundPos: o.pos,
                layer: o.layer,
                muffled: true
            });
            for (
                let n = Math.floor(util.random(30, 35)), l = 0;
                l < n;
                l++
            ) {
                const c = v2.mul(v2.randomUnit(), util.random(5, 15));
                i.addParticle(
                    "turkeyFeathersDeath",
                    o.layer,
                    o.pos,
                    c
                );
            }
        }
    }
};
export default {
    Lt: c
};


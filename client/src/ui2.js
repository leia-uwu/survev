import { GameObjectDefs } from "../../shared/defs/gameObjectDefs";
import { MapObjectDefs } from "../../shared/defs/mapObjectDefs";
import { GameConfig } from "../../shared/gameConfig";
import net from "../../shared/net";
import { collider } from "../../shared/utils/collider";
import { math } from "../../shared/utils/math";
import { util } from "../../shared/utils/util";
import { v2 } from "../../shared/utils/v2";
import device from "./device";
import helpers from "./helpers";

const Input = GameConfig.Input;
const Action = GameConfig.Action;
const DamageType = GameConfig.DamageType;
const PickupMsgType = net.PickupMsgType;

function i(e) {
    return document.getElementById(e);
}
function o(e) {
    return e.button == 0;
}
function s(e) {
    if ("which" in e) {
        return e.which == 3;
    } else {
        return e.button == 2;
    }
}
function n(e, t, r) {
    if (e instanceof Array) {
        for (let a = 0; a < e.length; a++) {
            n(e[a], r !== undefined ? t[r] : t, a);
        }
    } else if (e instanceof Object) {
        for (let i = Object.keys(e), o = 0; o < i.length; o++) {
            const s = i[o];
            n(e[s], r !== undefined ? t[r] : t, s);
        }
    } else {
        t[r] = e;
    }
}
function l(e, t, r) {
    if (t instanceof Array) {
        const a = [];
        for (let i = 0; i < t.length; i++) {
            a[i] = l(e[i], t[i], r);
        }
        return a;
    }
    if (t instanceof Object) {
        const o = {};
        for (let s = Object.keys(t), n = 0; n < s.length; n++) {
            const c = s[n];
            o[c] = l(e[c], t[c], r);
        }
        return o;
    }
    return e != t || r;
}
function c() {
    const e = Object.keys(GameObjectDefs);
    const t = [];
    for (let i = 0; i < e.length; i++) {
        const a = e[i];
        if (GameObjectDefs[a].type == "scope") {
            t.push(a);
        }
    }
    return t;
}
function m() {
    const e = Object.keys(GameObjectDefs);
    const t = [];
    for (let r = 0; r < e.length; r++) {
        const a = e[r];
        const i = GameObjectDefs[a];
        if (
            !i.hideUi &&
            (i.type == "heal" ||
                i.type == "boost" ||
                i.type == "ammo")
        ) {
            t.push(a);
        }
    }
    return t;
}
function p() {
    return ["chest", "helmet", "backpack"];
}
function UiState() {
    this.mobile = false;
    this.touch = false;
    this.rareLootMessage = {
        lootType: "",
        ticker: 0,
        duration: 0,
        opacity: 0
    };
    this.pickupMessage = {
        message: "",
        ticker: 0,
        duration: 0,
        opacity: 0
    };
    this.killMessage = {
        text: "",
        count: "",
        ticker: 0,
        duration: 0,
        opacity: 0
    };
    this.killFeed = [];
    for (let e = 0; e < C; e++) {
        this.killFeed.push({
            text: "",
            color: "#000000",
            offset: 0,
            opacity: 0,
            ticker: Number.MAX_VALUE
        });
    }
    this.weapons = [];
    for (let t = 0; t < GameConfig.WeaponSlot.Count; t++) {
        this.weapons[t] = {
            slot: t,
            type: "",
            ammo: 0,
            equipped: false,
            selectable: false,
            opacity: 0,
            width: 0,
            ticker: 0,
            bind: E[t],
            bindStr: ""
        };
    }
    this.ammo = {
        current: 0,
        remaining: 0,
        displayCurrent: false,
        displayRemaining: false
    };
    this.interaction = {
        type: D.None,
        text: "",
        key: "",
        usable: false
    };
    this.scopes = [];
    for (let r = c(), a = 0; a < r.length; a++) {
        this.scopes.push({
            type: r[a],
            visible: false,
            equipped: false,
            selectable: false
        });
    }
    this.loot = [];
    for (let i = m(), o = 0; o < i.length; o++) {
        this.loot.push({
            type: i[o],
            count: 0,
            maximum: 0,
            selectable: false,
            width: 0,
            ticker: 0
        });
    }
    this.gear = [];
    for (let s = p(), n = 0; n < s.length; n++) {
        this.gear.push({
            type: s[n],
            item: "",
            selectable: false,
            width: 0,
            ticker: 0,
            rot: 0
        });
    }
    this.perks = [];
    for (let l = 0; l < O; l++) {
        this.perks.push({
            type: "",
            droppable: false,
            width: 0,
            ticker: 0,
            pulse: false
        });
    }
    this.health = 100;
    this.boost = 0;
    this.downed = false;
}
function Ui2(e, t) {
    const r = this;
    this.localization = e;
    this.inputBinds = t;
    this.oldState = new UiState();
    this.newState = new UiState();
    this.frameCount = 0;
    this.dom = {
        debugButton: i("ui-debug-button"),
        emoteButton: i("ui-emote-button"),
        menu: {
            touchStyles: i("btn-touch-styles"),
            aimLine: i("btn-game-aim-line")
        },
        rareLootMessage: {
            icon: i("ui-perk-message-image-icon"),
            imageWrapper: i("ui-perk-message-image-wrapper"),
            wrapper: i("ui-perk-message-wrapper"),
            name: i("ui-perk-message-name"),
            desc: i("ui-perk-message-acquired")
        },
        pickupMessage: i("ui-pickup-message"),
        killMessage: {
            div: i("ui-kills"),
            text: i("ui-kill-text"),
            count: i("ui-kill-count")
        },
        killFeed: {
            div: i("ui-killfeed-contents"),
            lines: []
        },
        weapons: [],
        ammo: {
            current: i("ui-current-clip"),
            remaining: i("ui-remaining-ammo"),
            reloadButton: i("ui-reload-button-container")
        },
        interaction: {
            div: i("ui-interaction"),
            key: i("ui-interaction-press"),
            text: i("ui-interaction-description")
        },
        health: {
            inner: i("ui-health-actual"),
            depleted: i("ui-health-depleted")
        },
        boost: {
            div: i("ui-boost-counter"),
            bars: [
                i("ui-boost-counter-0").firstElementChild,
                i("ui-boost-counter-1").firstElementChild,
                i("ui-boost-counter-2").firstElementChild,
                i("ui-boost-counter-3").firstElementChild
            ]
        },
        scopes: [],
        loot: [],
        gear: [],
        perks: []
    };
    for (let a = 0; a < C; a++) {
        const n = `ui-killfeed-${a}`;
        let l = i(n);
        if (!l) {
            l = document.createElement("div");
            l.id = n;
            l.classList.add("killfeed-div");
            const d = document.createElement("div");
            d.classList.add("killfeed-text");
            l.appendChild(d);
            this.dom.killFeed.div.appendChild(l);
        }
        this.dom.killFeed.lines.push({
            line: l,
            text: l.firstElementChild
        });
    }
    for (let u = 0; u < 4; u++) {
        const g = i(`ui-weapon-id-${u + 1}`);
        const y = {
            div: g,
            type: g.getElementsByClassName("ui-weapon-name")[0],
            number: g.getElementsByClassName("ui-weapon-number")[0],
            image: g.getElementsByClassName("ui-weapon-image")[0],
            ammo: g.getElementsByClassName(
                "ui-weapon-ammo-counter"
            )[0]
        };
        this.dom.weapons.push(y);
    }
    for (let w = c(), _ = 0; _ < w.length; _++) {
        const b = w[_];
        const x = {
            scopeType: b,
            div: i(`ui-scope-${b}`)
        };
        this.dom.scopes.push(x);
    }
    for (let S = m(), v = 0; v < S.length; v++) {
        const I = S[v];
        const T = i(`ui-loot-${I}`);
        if (T) {
            const P = {
                lootType: I,
                div: T,
                count: T.getElementsByClassName("ui-loot-count")[0],
                image: T.getElementsByClassName("ui-loot-image")[0],
                overlay:
                    T.getElementsByClassName("ui-loot-overlay")[0]
            };
            this.dom.loot.push(P);
        }
    }
    for (let D = p(), E = 0; E < D.length; E++) {
        const B = D[E];
        const R = i(`ui-armor-${B}`);
        const L = {
            gearType: B,
            div: R,
            level: R.getElementsByClassName("ui-armor-level")[0],
            image: R.getElementsByClassName("ui-armor-image")[0]
        };
        this.dom.gear.push(L);
    }
    for (let q = 0; q < O; q++) {
        const F = i(`ui-perk-${q}`);
        const j = {
            perkType: "",
            div: F,
            divTitle: F.getElementsByClassName("tooltip-title")[0],
            divDesc: F.getElementsByClassName("tooltip-desc")[0],
            image: F.getElementsByClassName("ui-armor-image")[0]
        };
        this.dom.perks.push(j);
    }
    this.rareLootMessageQueue = [];
    this.uiEvents = [];
    this.eventListeners = [];
    const N = function(e, t, a) {
        r.eventListeners.push({
            event: e,
            elem: t,
            fn: a
        });
        t.addEventListener(e, a);
    };
    this.itemActions = [];
    const H = function(e, t, a, i) {
        r.itemActions.push({
            action: e,
            type: t,
            data: a,
            div: i,
            actionQueued: false,
            actionTime: 0
        });
    };
    for (let V = 0; V < this.dom.weapons.length; V++) {
        H("use", "weapon", V, this.dom.weapons[V].div);
        H("drop", "weapon", V, this.dom.weapons[V].div);
    }
    for (let U = 0; U < this.dom.scopes.length; U++) {
        const W = this.dom.scopes[U];
        H("use", "scope", W.scopeType, W.div);
        if (W.scopeType != "1xscope") {
            H("drop", "loot", W.scopeType, W.div);
        }
    }
    for (let G = 0; G < this.dom.loot.length; G++) {
        const X = this.dom.loot[G];
        const K = GameObjectDefs[X.lootType];
        if (K.type == "heal" || K.type == "boost") {
            H("use", "loot", X.lootType, X.div);
        }
        H("drop", "loot", X.lootType, X.div);
    }
    for (let Z = 0; Z < this.dom.gear.length; Z++) {
        const Y = this.dom.gear[Z];
        if (Y.gearType != "backpack") {
            H("drop", "loot", Y.gearType, Y.div);
        }
    }
    for (let J = 0; J < this.dom.perks.length; J++) {
        H("drop", "perk", J, this.dom.perks[J].div);
    }
    for (let Q = 0; Q < this.itemActions.length; Q++) {
        (function(e) {
            const t = r.itemActions[e];
            N("mousedown", t.div, (e) => {
                if (
                    (t.action == "use" && o(e)) ||
                    (t.action == "drop" && s(e))
                ) {
                    e.stopPropagation();
                    t.actionQueued = true;
                }
            });
            N("mouseup", t.div, (e) => {
                if (
                    t.actionQueued &&
                    ((t.action == "use" && o(e)) ||
                        (t.action == "drop" && s(e)))
                ) {
                    e.stopPropagation();
                    r.pushAction(t);
                    t.actionQueued = false;
                }
            });
            N("touchstart", t.div, (e) => {
                if (e.changedTouches.length > 0) {
                    e.stopPropagation();
                    t.actionQueued = true;
                    t.actionTime = new Date().getTime();
                    t.touchOsId = e.changedTouches[0].identifier;
                }
            });
            N("touchend", t.div, (e) => {
                if (
                    new Date().getTime() - t.actionTime < A &&
                    t.actionQueued &&
                    t.action == "use"
                ) {
                    r.pushAction(t);
                }
                t.actionQueued = false;
            });
            N("touchcancel", t.div, (e) => {
                t.actionQueued = false;
            });
        })(Q);
    }
    const $ = document.getElementById("cvs");
    this.clearQueuedItemActions = function() {
        for (let e = 0; e < r.itemActions.length; e++) {
            r.itemActions[e].actionQueued = false;
        }
        if (device.touch) {
            $.focus();
        }
    };
    window.addEventListener("mouseup", this.clearQueuedItemActions);
    window.addEventListener("focus", this.clearQueuedItemActions);
    this.onKeyUp = function(e) {
        const t = e.which || e.keyCode;
        const a = r.inputBinds.getBind(Input.Fullscreen);
        if (a && t == a.code) {
            helpers.toggleFullScreen();
        }
    };
    window.addEventListener("keyup", this.onKeyUp);
}
function loadStaticDomImages() {
    const e = function(e, t) {
        i(e).getElementsByClassName("ui-loot-image")[0].src = t;
    };
    e("ui-loot-bandage", "img/loot/loot-medical-bandage.svg");
    e("ui-loot-healthkit", "img/loot/loot-medical-healthkit.svg");
    e("ui-loot-soda", "img/loot/loot-medical-soda.svg");
    e("ui-loot-painkiller", "img/loot/loot-medical-pill.svg");
    e("ui-loot-9mm", "img/loot/loot-ammo-box.svg");
    e("ui-loot-12gauge", "img/loot/loot-ammo-box.svg");
    e("ui-loot-762mm", "img/loot/loot-ammo-box.svg");
    e("ui-loot-556mm", "img/loot/loot-ammo-box.svg");
    e("ui-loot-50AE", "img/loot/loot-ammo-box.svg");
    e("ui-loot-308sub", "img/loot/loot-ammo-box.svg");
    e("ui-loot-flare", "img/loot/loot-ammo-box.svg");
    e("ui-loot-45acp", "img/loot/loot-ammo-box.svg");
    i("mag-glass-white").src = "img/gui/mag-glass.svg";
    i("ui-minimize-img").src = "img/gui/minimize.svg";
}
const C = 6;
const A = 750;
const O = 3;
const D = {
    None: 0,
    Cancel: 1,
    Loot: 2,
    Revive: 3,
    Object: 4
};

const E = {
    [GameConfig.WeaponSlot.Primary]: Input.EquipPrimary,
    [GameConfig.WeaponSlot.Secondary]: Input.EquipSecondary,
    [GameConfig.WeaponSlot.Melee]: Input.EquipMelee,
    [GameConfig.WeaponSlot.Throwable]: Input.EquipThrowable
};

Ui2.prototype = {
    n: function() {
        for (let e = 0; e < this.eventListeners.length; e++) {
            const t = this.eventListeners[e];
            t.elem.removeEventListener(t.event, t.fn);
        }
        window.removeEventListener(
            "focus",
            this.clearQueuedItemActions
        );
        window.removeEventListener(
            "mouseup",
            this.clearQueuedItemActions
        );
        window.removeEventListener("keyup", this.onKeyUp);
    },
    pushAction: function(e) {
        this.uiEvents.push({
            action: e.action,
            type: e.type,
            data: e.data
        });
    },
    flushInput: function() {
        this.uiEvents = [];
    },
    m: function(e, t, r, a, i, o, s) {
        const c = this.newState;
        c.mobile = device.mobile;
        c.touch = device.touch;
        if (c.touch) {
            for (let m = 0; m < this.itemActions.length; m++) {
                const p = this.itemActions[m];
                if (p.actionQueued && p.action == "drop") {
                    const h = new Date().getTime();
                    const d = h - p.actionTime;
                    if (d >= A) {
                        this.pushAction(p);
                        p.actionTime = h;
                        p.actionQueued = false;
                    }
                }
            }
        }
        if (
            c.rareLootMessage.ticker >=
            c.rareLootMessage.duration &&
            this.rareLootMessageQueue.length > 0
        ) {
            const u = this.rareLootMessageQueue.shift();
            c.rareLootMessage.lootType = u;
            c.rareLootMessage.ticker = 0;
            c.rareLootMessage.duration =
                this.rareLootMessageQueue.length > 0 ? 2 : 4;
            c.rareLootMessage.opacity = 0;
        }
        c.rareLootMessage.ticker += e;
        const g = c.rareLootMessage.ticker;
        const f = c.rareLootMessage.duration;
        c.rareLootMessage.opacity = 1 - math.smoothstep(g, f - 0.2, f);
        c.pickupMessage.ticker += e;
        const x = c.pickupMessage.ticker;
        const z = c.pickupMessage.duration;
        c.pickupMessage.opacity =
            math.smoothstep(x, 0, 0.2) *
            (1 - math.smoothstep(x, z, z + 0.2)) *
            (1 - c.rareLootMessage.opacity);
        c.killMessage.ticker += e;
        const I = c.killMessage.ticker;
        const T = c.killMessage.duration;
        c.killMessage.opacity =
            (1 - math.smoothstep(I, T - 0.2, T)) *
            (1 - c.rareLootMessage.opacity);
        for (let P = 0, C = 0; C < c.killFeed.length; C++) {
            const O = c.killFeed[C];
            O.ticker += e;
            const E = O.ticker;
            O.offset = P;
            O.opacity =
                math.smoothstep(E, 0, 0.25) *
                (1 - math.smoothstep(E, 6, 6.5));
            P += math.min(E / 0.25, 1);
            if (device.mobile) {
                O.opacity = E < 6.5 ? 1 : 0;
            }
        }
        c.health = t.Le.he ? 0 : math.max(t.Re.Lr, 1);
        c.boost = t.Re.qr;
        c.downed = t.Le.ue;
        let B = D.None;
        let R = null;
        let L = true;
        if (t.canInteract(o)) {
            let q = null;
            let F = 0;
            for (let j = o.Ve.p(), N = 0; N < j.length; N++) {
                const H = j[N];
                if (
                    H.active &&
                    !H.dead &&
                    util.sameLayer(H.layer, t.layer)
                ) {
                    const V = H.getInteraction();
                    if (V) {
                        const U = collider.intersectCircle(
                            H.collider,
                            t.Le.ie,
                            V.rad + t.rad
                        );
                        if (U && U.pen >= F) {
                            q = H;
                            F = U.pen;
                        }
                    }
                }
            }
            if (q) {
                B = D.Object;
                R = q;
                L = true;
            }
            const W = i.Er();
            if (W && !t.Le.ue) {
                const G = GameObjectDefs[W.type];
                const X = t.Wr(GameConfig.WeaponSlot.Primary);
                const K = t.Wr(GameConfig.WeaponSlot.Secondary);
                const Z = X && K;
                const Y = G.type != "gun" || !Z || t.Ur() == "gun";
                let J = false;
                if (
                    (c.touch &&
                        G.type == "helmet" &&
                        t.Nr() == G.level &&
                        W.type != t.Le.le) ||
                    (G.type == "chest" &&
                        t.Hr() == G.level &&
                        W.type != t.Le.ce)
                ) {
                    J = true;
                }
                if (Y || device.uiLayout == device.UiLayout.Sm) {
                    B = D.Loot;
                    R = W;
                }
                L =
                    Y &&
                    (!c.touch ||
                        G.type == "gun" ||
                        G.type == "melee" ||
                        G.type == "outfit" ||
                        G.type == "perk" ||
                        J);
            }
            const Q = t.hasPerk("self_revive");
            if (t.action.type == Action.None && (!t.Le.ue || Q)) {
                for (
                    let $ = a.qe(t.__id).teamId,
                        ee = a.$e.p(),
                        te = 0;
                    te < ee.length;
                    te++
                ) {
                    const re = ee[te];
                    if (re.active) {
                        const ae = a.qe(re.__id).teamId;
                        if (
                            (re.__id != t.__id || Q) &&
                            $ == ae &&
                            re.Le.ue &&
                            !re.Le.he &&
                            re.action.type != Action.Revive
                        ) {
                            const ie = v2.length(
                                v2.sub(re.Le.ie, t.Le.ie)
                            );
                            if (
                                ie < GameConfig.player.reviveRange &&
                                util.sameLayer(re.layer, t.layer)
                            ) {
                                B = D.Revive;
                                R = re;
                                L = true;
                            }
                        }
                    }
                }
            }
            if (t.action.type == Action.Revive && t.Le.ue && !Q) {
                B = D.None;
                R = null;
                L = false;
            }
            if (
                (t.action.type == Action.UseItem ||
                    (t.action.type == Action.Revive &&
                        (!t.Le.ue || !!Q))) &&
                !r
            ) {
                B = D.Cancel;
                R = null;
                L = true;
            }
        }
        c.interaction.type = B;
        c.interaction.text = this.getInteractionText(B, R, t);
        c.interaction.key = this.getInteractionKey(B);
        c.interaction.usable = L && !r;
        for (let oe = 0; oe < t.Re.tt.length; oe++) {
            const se = t.Re.tt[oe];
            const ne = c.weapons[oe];
            ne.type = se.type;
            ne.ammo = se.ammo;
            if (oe == GameConfig.WeaponSlot.Throwable) {
                ne.ammo = t.Re.jr[se.type] || 0;
            }
            const le = ne.equipped;
            ne.equipped = oe == t.Re.rt;
            ne.selectable =
                (se.type != "" || oe == 0 || oe == 1) && !r;
            const ce = ne.equipped ? 1 : 0.6;
            const me = ce - ne.opacity;
            const pe = math.min(me, (math.sign(me) * e) / 0.15);
            ne.opacity = math.clamp(ne.opacity + pe, 0, 1);
            if (device.mobile) {
                ne.opacity = ce;
            }
            if (ne.type == "bugle" && ne.ammo == 0) {
                ne.opacity = 0.25;
            }
            ne.ticker += e;
            if (!ne.equipped || !le) {
                ne.ticker = 0;
            }
            if (this.frameCount < 2) {
                ne.ticker = 1;
            }
            const he = math.min(ne.ticker / 0.09, Math.PI);
            const de = Math.sin(he);
            ne.width = de < 0.001 ? 0 : de;
            if (device.mobile) {
                ne.width = 0;
            }
            const ue = s.getBind(ne.bind);
            ne.bindStr = ue ? ue.toString() : "";
        }
        const ge = c.weapons[t.Re.rt];
        const ye = GameObjectDefs[ge.type];
        const we = ge.ammo;
        const fe =
            ye.type == "gun"
                ? ye.ammoInfinite ||
                    (t.hasPerk("endless_ammo") &&
                        !ye.ignoreEndlessAmmo)
                    ? Number.MAX_VALUE
                    : t.Re.jr[ye.ammo]
                : 0;
        c.ammo.current = we;
        c.ammo.remaining = fe;
        c.ammo.displayCurrent = ye.type != "melee";
        c.ammo.displayRemaining = fe > 0;
        for (let _e = 0; _e < c.scopes.length; _e++) {
            const be = c.scopes[_e];
            be.visible = t.Re.jr[be.type] > 0;
            be.equipped = be.visible && t.Re.Fr == be.type;
            be.selectable = be.visible && !r;
        }
        for (let xe = t.Vr(), Se = 0; Se < c.loot.length; Se++) {
            const ve = c.loot[Se];
            const ke = ve.count;
            ve.count = t.Re.jr[ve.type] || 0;
            ve.maximum = GameConfig.bagSizes[ve.type][xe];
            ve.selectable = ve.count > 0 && !r;
            if (ve.count > ke) {
                ve.ticker = 0;
            }
            if (this.frameCount < 2) {
                ve.ticker = 1;
            }
            ve.ticker += e;
            const ze = math.min(ve.ticker / 0.05, Math.PI);
            const Ie = Math.sin(ze);
            ve.width = Ie < 0.001 ? 0 : Ie;
            if (device.mobile) {
                ve.width = 0;
            }
        }
        for (let Te = 0; Te < c.gear.length; Te++) {
            const Me = c.gear[Te];
            let Pe = "";
            if (Me.type == "chest") {
                Pe = t.Le.ce;
            } else if (Me.type == "helmet") {
                Pe = t.Le.le;
            } else if (
                Me.type == "backpack" &&
                (Pe = t.Le.ne) == "backpack00"
            ) {
                Pe = "";
            }
            const Ce = Me.item;
            Me.item = Pe;
            Me.selectable = Pe != "" && !r;
            if (Ce != Me.item) {
                Me.ticker = 0;
            }
            if (this.frameCount < 2) {
                Me.ticker = 1;
            }
            Me.ticker += e;
            const Ae = math.min(Me.ticker / 0.05, Math.PI);
            const Oe = Math.sin(Ae);
            Me.width = Oe < 0.001 ? 0 : Oe;
            if (device.mobile) {
                Me.width = 0;
            }
        }
        for (let De = 0; De < c.perks.length; De++) {
            const Ee = c.perks[De];
            if (t.perks.length > De) {
                const Be = t.perks[De];
                Ee.type = Be.type;
                Ee.droppable = Be.droppable;
                if (Be.isNew) {
                    Ee.ticker = 0;
                }
                if (this.frameCount < 2) {
                    Ee.ticker = 1;
                }
                Ee.ticker += e;
                const Re = math.min(Ee.ticker / 0.05, Math.PI);
                const Le = Math.sin(Re);
                Ee.width = Le < 0.001 ? 0 : Le;
                if (device.mobile) {
                    Ee.width = 0;
                }
                Ee.pulse = !device.mobile && Ee.ticker < 4;
            } else {
                Ee.type = "";
            }
        }
        const qe = l(
            this.oldState,
            this.newState,
            this.frameCount++ == 0
        );
        this.render(qe, this.newState);
        n(this.newState, this.oldState);
    },
    render: function(e, t) {
        const r = this.dom;
        if (e.touch) {
            r.interaction.key.style.backgroundImage = t.touch
                ? "url('img/gui/tap.svg')"
                : "none";
            if (t.touch) {
                r.interaction.key.innerHTML = "";
            }
            r.menu.touchStyles.style.display = t.touch
                ? "flex"
                : "none";
            r.menu.aimLine.style.display = t.touch
                ? "block"
                : "none";
            r.ammo.reloadButton.style.display = t.touch
                ? "block"
                : "none";
            r.emoteButton.style.display = t.touch
                ? "block"
                : "none";
            if (r.debugButton) {
                r.debugButton.style.display = t.touch
                    ? "block"
                    : "none";
            }
        }
        if (e.rareLootMessage.lootType) {
            const a = t.rareLootMessage.lootType;
            const i = GameObjectDefs[a];
            if (i && i.type == "xp") {
                const o =
                    this.localization.translate(
                        "game-xp-drop-desc"
                    );
                r.rareLootMessage.desc.innerHTML = `+${i.xp} ${o}`;
            } else {
                r.rareLootMessage.desc.innerHTML = "";
            }
            const s = i?.lootImg?.border
                ? `url(img/loot/${i.lootImg.border.slice(
                    0,
                    -4
                )}.svg)`
                : "none";
            r.rareLootMessage.imageWrapper.style.backgroundImage =
                s;
            const n = helpers.getSvgFromGameType(a);
            r.rareLootMessage.icon.style.backgroundImage = n
                ? `url('${n}')`
                : "none";
            const l = this.localization.translate(`game-${a}`);
            r.rareLootMessage.name.innerHTML = l;
        }
        if (e.rareLootMessage.opacity) {
            r.rareLootMessage.wrapper.style.opacity =
                t.rareLootMessage.opacity;
        }
        if (e.pickupMessage.message) {
            r.pickupMessage.innerHTML = t.pickupMessage.message;
        }
        if (e.pickupMessage.opacity) {
            r.pickupMessage.style.opacity = t.pickupMessage.opacity;
        }
        if (e.killMessage.text || e.killMessage.count) {
            r.killMessage.text.innerHTML = t.killMessage.text;
            r.killMessage.count.innerHTML = t.killMessage.count;
        }
        if (e.killMessage.opacity) {
            r.killMessage.div.style.opacity = t.killMessage.opacity;
        }
        for (let c = 0; c < e.killFeed.length; c++) {
            const m = e.killFeed[c];
            const p = r.killFeed.lines[c];
            const h = t.killFeed[c];
            if (m.text) {
                p.text.innerHTML = h.text;
            }
            if (m.offset) {
                const d =
                    device.uiLayout != device.UiLayout.Sm || device.tablet
                        ? 35
                        : 15;
                p.line.style.top = `${Math.floor(h.offset * d)}px`;
            }
            if (m.color) {
                p.text.style.color = h.color;
            }
            if (m.opacity) {
                p.line.style.opacity = h.opacity;
            }
        }
        if (e.health || e.downed) {
            const u = [
                {
                    health: 100,
                    color: [179, 179, 179]
                },
                {
                    health: 100,
                    color: [255, 255, 255]
                },
                {
                    health: 75,
                    color: [255, 255, 255]
                },
                {
                    health: 75,
                    color: [255, 158, 158]
                },
                {
                    health: 25,
                    color: [255, 82, 82]
                },
                {
                    health: 25,
                    color: [255, 0, 0]
                },
                {
                    health: 0,
                    color: [255, 0, 0]
                }
            ];
            let g = 0;
            const y = Math.ceil(t.health);
            for (; u[g].health > y && g < u.length - 1;) {
                g++;
            }
            const f = u[math.max(g - 1, 0)];
            const _ = u[g];
            const x = math.delerp(t.health, f.health, _.health);
            let S = [
                Math.floor(math.lerp(x, f.color[0], _.color[0])),
                Math.floor(math.lerp(x, f.color[1], _.color[1])),
                Math.floor(math.lerp(x, f.color[2], _.color[2]))
            ];
            if (t.downed) {
                S = [255, 0, 0];
            }
            r.health.inner.style.backgroundColor = `rgba(${S[0]}, ${S[1]}, ${S[2]}, 1.0)`;
            r.health.inner.style.width = `${t.health}%`;
            r.health.depleted.style.width = `${t.health}%`;
            r.health.depleted.style.display =
                t.health > 0 ? "block" : "none";
            if (t.health > 25) {
                r.health.inner.classList.remove("ui-bar-danger");
            } else {
                r.health.inner.classList.add("ui-bar-danger");
            }
        }
        if (e.boost) {
            const v = GameConfig.player.boostBreakpoints;
            let I = 0;
            for (let T = 0; T < v.length; T++) {
                I += v[T];
            }
            for (
                let P = t.boost / 100, C = 0;
                C < r.boost.bars.length;
                C++
            ) {
                const A = v[C] / I;
                const O = math.clamp(P / A, 0, 1);
                P = math.max(P - A, 0);
                r.boost.bars[C].style.width = `${O * 100}%`;
            }
            r.boost.div.style.opacity = t.boost == 0 ? 0 : 1;
        }
        if (e.interaction.type) {
            r.interaction.div.style.display =
                t.interaction.type == D.None ? "none" : "flex";
        }
        if (e.interaction.text) {
            r.interaction.text.innerHTML = t.interaction.text;
        }
        if (e.interaction.key) {
            r.interaction.key.innerHTML = t.touch
                ? ""
                : t.interaction.key;
            r.interaction.key.className =
                r.interaction.key.innerHTML.length > 1
                    ? "ui-interaction-small"
                    : "ui-interaction-large";
        }
        if (e.interaction.usable) {
            r.interaction.key.style.display = t.interaction.usable
                ? "block"
                : "none";
        }
        for (let E = 0; E < e.weapons.length; E++) {
            const B = e.weapons[E];
            const R = r.weapons[E];
            const L = t.weapons[E];
            if (B.type) {
                let q = "";
                let F = "";
                const j = GameObjectDefs[L.type];
                if (j) {
                    q =
                        this.localization.translate(
                            `game-hud-${L.type}`
                        ) ||
                        this.localization.translate(
                            `game-${L.type}`
                        );
                    F = helpers.getCssTransformFromGameType(L.type);
                }
                R.type.innerHTML = q;
                R.image.src = helpers.getSvgFromGameType(L.type);
                R.image.style.display = j ? "inline" : "none";
                R.image.style.transform = F;
            }
            if (B.equipped) {
                R.div.style.backgroundColor = L.equipped
                    ? "rgba(0, 0, 0, 0.4)"
                    : "rgba(0, 0, 0, 0)";
            }
            if (B.selectable) {
                R.div.style.pointerEvents =
                    L.type != "" || L.selectable ? "auto" : "none";
            }
            if (B.width) {
                const N = math.lerp(L.width, 83.33, 100);
                R.div.style.width = `${N}%`;
            }
            if (B.opacity) {
                R.div.style.opacity = L.opacity;
            }
            if (B.ammo && R.ammo) {
                R.ammo.innerHTML = L.ammo;
                R.ammo.style.display =
                    L.ammo > 0 ? "block" : "none";
            }
            if (B.bindStr) {
                R.number.innerHTML = L.bindStr[0] || "";
            }
        }
        if (e.ammo.current) {
            const H = t.ammo.current;
            r.ammo.current.innerHTML = H;
            r.ammo.current.style.color = H > 0 ? "white" : "red";
        }
        if (e.ammo.remaining) {
            const V = t.ammo.remaining;
            r.ammo.remaining.innerHTML =
                V == Number.MAX_VALUE ? "&#8734;" : V;
            r.ammo.remaining.style.color = V != 0 ? "white" : "red";
        }
        if (e.ammo.displayCurrent) {
            r.ammo.current.style.opacity = t.ammo.displayCurrent
                ? 1
                : 0;
        }
        if (e.ammo.displayRemaining) {
            r.ammo.remaining.style.opacity = t.ammo.displayRemaining
                ? 1
                : 0;
            r.ammo.reloadButton.style.opacity = t.ammo
                .displayRemaining
                ? 1
                : 0;
        }
        for (let U = 0; U < e.scopes.length; U++) {
            const W = e.scopes[U];
            const G = r.scopes[U];
            const X = t.scopes[U];
            if (W.visible) {
                if (X.visible) {
                    G.div.classList.remove("ui-hidden");
                } else {
                    G.div.classList.add("ui-hidden");
                }
            }
            if (W.equipped) {
                if (X.equipped) {
                    G.div.classList.add("ui-zoom-active");
                    G.div.classList.remove("ui-zoom-inactive");
                } else {
                    G.div.classList.remove("ui-zoom-active");
                    G.div.classList.add("ui-zoom-inactive");
                }
            }
            if (W.selectable) {
                G.div.style.pointerEvents = X.selectable
                    ? "auto"
                    : "none";
            }
        }
        for (let K = 0; K < e.loot.length; K++) {
            const Z = e.loot[K];
            const Y = r.loot[K];
            const J = t.loot[K];
            if (Z && Y && J) {
                if (Z.count || Z.maximum) {
                    Y.count.innerHTML = J.count;
                    Y.div.style.opacity =
                        GameObjectDefs[Y.lootType].special && J.count == 0
                            ? 0
                            : J.count > 0
                                ? 1
                                : 0.25;
                    Y.div.style.color =
                        J.count == J.maximum
                            ? "#ff9900"
                            : "#ffffff";
                }
                if (Z.width) {
                    const Q = 1 + J.width * 0.33;
                    const $ = `scale(${Q}, ${Q})`;
                    Y.image.style.transform = $;
                    if (Y.overlay) {
                        Y.overlay.style.transform = $;
                    }
                }
                if (Z.selectable) {
                    Y.div.style.pointerEvents = J.selectable
                        ? "auto"
                        : "none";
                }
            }
        }
        for (let ee = 0; ee < e.gear.length; ee++) {
            const te = e.gear[ee];
            const re = r.gear[ee];
            const ae = t.gear[ee];
            if (te.item) {
                const ie = ae.item ? GameObjectDefs[ae.item] : null;
                const oe = ie ? ie.level : 0;
                re.div.style.display = ie ? "block" : "none";
                re.level.innerHTML = this.localization.translate(
                    `game-level-${oe}`
                );
                re.level.style.color =
                    oe >= 3 ? "#ff9900" : "#ffffff";
                re.image.src = helpers.getSvgFromGameType(ae.item);
            }
            if (te.selectable) {
                re.div.style.pointerEvents = ae.selectable
                    ? "auto"
                    : "none";
            }
            if (te.width) {
                const se = 1 + ae.width * 0.33;
                let ne = `scale(${se}, ${se})`;
                const le = GameObjectDefs[ae.item];
                if (le && le.lootImg.rot !== undefined) {
                    ne += ` rotate(${le.lootImg.rot}rad)`;
                }
                re.image.style.transform = ne;
            }
        }
        for (let ce = 0; ce < e.perks.length; ce++) {
            const me = e.perks[ce];
            const pe = r.perks[ce];
            const he = t.perks[ce];
            if (me.type) {
                pe.perkType = he.type;
                pe.divTitle.innerHTML = this.localization.translate(
                    `game-${he.type}`
                );
                pe.divDesc.innerHTML = this.localization.translate(
                    `game-${he.type}-desc`
                );
                pe.div.style.display = he.type ? "block" : "none";
                pe.image.src = he.type
                    ? helpers.getSvgFromGameType(he.type)
                    : "";
            }
            if (me.droppable) {
                if (he.droppable) {
                    pe.div.classList.add("ui-outline-hover");
                    pe.div.classList.remove("ui-perk-no-drop");
                } else {
                    pe.div.classList.remove("ui-outline-hover");
                    pe.div.classList.add("ui-perk-no-drop");
                }
            }
            if (me.pulse) {
                if (he.pulse) {
                    pe.div.classList.add("ui-perk-pulse");
                } else {
                    pe.div.classList.remove("ui-perk-pulse");
                }
            }
            if (me.width) {
                const de = 1 + he.width * 0.33;
                pe.image.style.transform = `scale(${de}, ${de})`;
            }
        }
    },
    displayPickupMessage: function(e) {
        const t = this.newState.pickupMessage;
        t.message = this.getPickupMessageText(e);
        t.ticker = 0;
        t.duration = 3;
    },
    displayKillMessage: function(e, t) {
        const r = this.newState.killMessage;
        r.text = e;
        r.count = t;
        r.ticker = 0;
        r.duration = 7;
    },
    hideKillMessage: function() {
        this.newState.killMessage.ticker = math.max(
            this.newState.killMessage.ticker,
            this.newState.killMessage.duration - 0.2
        );
    },
    addRareLootMessage: function(e, t) {
        if (t) {
            this.newState.rareLootMessage.ticker =
                this.newState.rareLootMessage.duration;
            this.rareLootMessageQueue = [];
        }
        this.rareLootMessageQueue.push(e);
    },
    removeRareLootMessage: function(e) {
        const t = this.rareLootMessageQueue.indexOf(e);
        if (t >= 0) {
            this.rareLootMessageQueue.splice(t, 1);
        }
        if (this.newState.rareLootMessage.lootType == e) {
            this.newState.rareLootMessage.ticker =
                this.newState.rareLootMessage.duration;
        }
    },
    getRareLootMessageText: function(e) {
        if (GameObjectDefs[e]) {
            return `Acquired perk: ${this.localization.translate(
                `game-${e}`
            )}`;
        } else {
            return "";
        }
    },
    addKillFeedMessage: function(e, t) {
        const r = this.newState.killFeed;
        const a = r[r.length - 1];
        a.text = e;
        a.color = t;
        a.ticker = 0;
        r.sort((e, t) => {
            return e.ticker - t.ticker;
        });
    },
    getKillFeedText: function(targetName, killerName, sourceType, damageType, downed) {
        switch (damageType) {
        case DamageType.Player:
            return `${killerName} ${this.localization.translate(
                downed ? "game-knocked-out" : "game-killed"
            )} ${targetName} ${this.localization.translate(
                "game-with"
            )} ${this.localization.translate(`game-${sourceType}`)}`;
        case DamageType.Bleeding: {
            const o = this.localization.translate(
                killerName
                    ? "game-finally-killed"
                    : "game-finally-bled-out"
            );
            if (killerName) {
                return `${killerName} ${o} ${targetName}`;
            } else {
                return `${targetName} ${o}`;
            }
        }
        case DamageType.Gas: {
            let s;
            let n;
            if (downed) {
                s = this.localization.translate(
                    "game-the-red-zone"
                );
                n = this.localization.translate(
                    "game-knocked-out"
                );
            } else {
                n = this.localization.translate(
                    killerName
                        ? "game-finally-killed"
                        : "game-died-outside"
                );
            }
            if (s) {
                return `${s} ${n} ${targetName}`;
            } else {
                return `${targetName} ${n}`;
            }
        }
        case DamageType.Airdrop: {
            const l = MapObjectDefs[sourceType];
            const c = this.localization.translate(
                "game-the-air-drop"
            );
            const m = downed
                ? this.localization.translate(
                    "game-knocked-out"
                )
                : l && !l.airdropCrate
                    ? this.localization.translate("game-killed")
                    : this.localization.translate("game-crushed");
            return `${c} ${m} ${targetName}`;
        }
        case DamageType.Airstrike: {
            const p = this.localization.translate(
                downed ? "game-knocked-out" : "game-killed"
            );
            if (killerName) {
                return `${killerName} ${p} ${targetName} ${this.localization.translate(
                    "game-with"
                )} ${this.localization.translate(
                    "game-an-air-strike"
                )}`;
            } else {
                return `${this.localization.translate(
                    "game-the-air-strike"
                )} ${p} ${targetName}`;
            }
        }
        default:
            return "";
        }
    },
    getKillFeedColor: function(e, t, r, a) {
        if (a) {
            return "#efeeee";
        } else if (e == t) {
            return "#d1777c";
        } else if (e == r) {
            return "#00bfff";
        } else {
            return "#efeeee";
        }
    },
    getRoleKillFeedColor: function(e, t, r) {
        const a = GameObjectDefs[e];
        if (a?.killFeed?.color) {
            return a.killFeed.color;
        } else {
            return helpers.colorToHexString(r.getTeamColor(t));
        }
    },
    getRoleTranslation: function(e, t) {
        let r = `game-${e}`;
        if (e == "leader") {
            r = t == 1 ? "game-red-leader" : "game-blue-leader";
        }
        return this.localization.translate(r);
    },
    getRoleAnnouncementText: function(e, t) {
        return `${this.localization.translate(
            "game-youve-been-promoted-to"
        )} ${this.getRoleTranslation(e, t)}!`;
    },
    getRoleAssignedKillFeedText: function(e, t, r) {
        const a = this.getRoleTranslation(e, t);
        return `${r} ${this.localization.translate(
            "game-promoted-to"
        )} ${a}!`;
    },
    getRoleKilledKillFeedText: function(e, t, r) {
        const a = this.getRoleTranslation(e, t);
        if (r) {
            return `${r} ${this.localization.translate(
                "game-killed"
            )} ${a}!`;
        } else {
            return `${a} ${this.localization.translate(
                "game-is-dead"
            )}!`;
        }
    },
    getKillText: function(e, t, r, a, i, o, s, n, l) {
        const c = a && !i;
        const m = l
            ? e
            : this.localization.translate("game-you").toUpperCase();
        const p = c
            ? "game-knocked-out"
            : r
                ? "game-killed"
                : "game-finally-killed";
        const h = this.localization.translate(p);
        const d = o
            ? l
                ? this.localization.translate("game-themselves")
                : this.localization
                    .translate("game-yourself")
                    .toUpperCase()
            : t;
        const u = this.localization.translate(
            n == GameConfig.DamageType.Airstrike
                ? "game-an-air-strike"
                : `game-${s}`
        );
        const g = this.localization.translate("game-with");
        if (u && (r || c)) {
            return `${m} ${h} ${d} ${g} ${u}`;
        } else {
            return `${m} ${h} ${d}`;
        }
    },
    getKillCountText: function(e) {
        return `${e} ${this.localization.translate(
            e != 1 ? "game-kills" : "game-kill"
        )}`;
    },
    getDownedText: function(e, t, r, a, i) {
        const o = i
            ? t
            : this.localization.translate("game-you").toUpperCase();
        let s = e;
        if (!s) {
            if (a == GameConfig.DamageType.Gas) {
                s =
                    this.localization.translate(
                        "game-the-red-zone"
                    );
            } else if (a == GameConfig.DamageType.Airdrop) {
                s =
                    this.localization.translate(
                        "game-the-air-drop"
                    );
            } else if (a == GameConfig.DamageType.Airstrike) {
                s = this.localization.translate(
                    "game-the-air-strike"
                );
            }
        }
        let n = this.localization.translate(`game-${r}`);
        if (e && a == GameConfig.DamageType.Airstrike) {
            n = this.localization.translate("game-an-air-strike");
        }
        const l = this.localization.translate("game-with");
        if (n) {
            return `${s} knocked ${o} out ${l} ${n}`;
        } else {
            return `${s} knocked ${o} out`;
        }
    },
    getPickupMessageText: function(e) {
        const r = {
            [PickupMsgType.Full]: "game-not-enough-space",
            [PickupMsgType.AlreadyOwned]: "game-item-already-owned",
            [PickupMsgType.AlreadyEquipped]: "game-item-already-equipped",
            [PickupMsgType.BetterItemEquipped]: "game-better-item-equipped",
            [PickupMsgType.GunCannotFire]: "game-gun-cannot-fire"
        };
        const i = r[e] || r[PickupMsgType.Full];
        return this.localization.translate(i);
    },
    getInteractionText: function(e, t, r) {
        switch (e) {
        case D.None:
            return "";
        case D.Cancel:
            return this.localization.translate("game-cancel");
        case D.Revive:
            if (t && r && t == r && r.hasPerk("self_revive")) {
                return this.localization.translate(
                    "game-revive-self"
                );
            } else {
                return this.localization.translate(
                    "game-revive-teammate"
                );
            }
        case D.Object: {
            const a = t.getInteraction();
            return `${this.localization.translate(a.action)} ${this.localization.translate(a.object)}`;
        }
        case D.Loot: {
            let i = this.localization.translate(`game-${t.type}`) || t.type;
            if (t.count > 1) {
                i += ` (${t.count})`;
            }
            return i;
        }
        default:
            return "";
        }
    },
    getInteractionKey: function(e) {
        let t = null;
        switch (e) {
        case D.Cancel:
            t = this.inputBinds.getBind(Input.Cancel);
            break;
        case D.Loot:
            t =
                    this.inputBinds.getBind(Input.Loot) ||
                    this.inputBinds.getBind(Input.Interact);
            break;
        case D.Object:
            t =
                    this.inputBinds.getBind(Input.Use) ||
                    this.inputBinds.getBind(Input.Interact);
            break;
        case D.Revive:
            t =
                    this.inputBinds.getBind(Input.Revive) ||
                    this.inputBinds.getBind(Input.Interact);
            break;
        case D.None:
        default:
            t = this.inputBinds.getBind(Input.Use);
        }
        if (t) {
            return t.toString();
        } else {
            return "<Unbound>";
        }
    }
};
export default {
    Ui2,
    loadStaticDomImages
};

import $ from "jquery";
import { GameConfig } from "../../shared/gameConfig";
import * as PIXI from "pixi.js";
import { coldet } from "../../shared/utils/coldet";
import { util } from "../../shared/utils/util";
import { v2 } from "../../shared/utils/v2";
import { math } from "../../shared/utils/math";
import { device } from "./device";
import { helpers } from "./helpers";
import { EmotesDefs } from "../../shared/defs/gameObjects/emoteDefs";
import { PingDefs } from "../../shared/defs/gameObjects/pingDefs";
import { GameObjectDefs } from "../../shared/defs/gameObjectDefs";

const Input = GameConfig.Input;
const EmoteSlot = GameConfig.EmoteSlot;

function a(e) {
    if (e.displayCloseIcon) {
        return "img/gui/close.svg";
    } else {
        return helpers.getSvgFromGameType(e.ping || e.emote);
    }
}
function i(e) {
    let t = (Math.atan2(e.y, e.x) * 180) / Math.PI;
    if (t < 0) {
        t += 360;
    }
    return t;
}
function o(e, t, r) {
    if (t <= r) {
        if (r - t <= 180) {
            return t <= e && e <= r;
        } else {
            return r <= e || e <= t;
        }
    } else if (t - r <= 180) {
        return r <= e && e <= t;
    } else {
        return t <= e || e <= r;
    }
}
export class EmoteBarn {
    constructor(audioManager, uiManager, playerBarn, camera, map) {
        const s = this;
        this.audioManager = audioManager;
        this.uiManager = uiManager;
        this.gameElem = $("#ui-game");
        this.disable = false;
        this.dr = null;
        this.playerBarn = playerBarn;
        this.camera = camera;
        this.map = map;
        this.worldPos = v2.create(0, 0);
        this.zIdxNext = 0;
        this.emoteSelector = {
            ping: "",
            emote: ""
        };
        this.emoteSoftTicker = 0;
        this.emoteHardTicker = 0;
        this.emoteCounter = 0;
        this.emoteWheelsGreyed = false;
        this.teamEmotesGreyed = false;
        this.wheelKeyTriggered = false;
        this.emoteTimeoutTicker = 0;
        this.aa = false;
        this.pingKeyDown = false;
        this.pingMouseTriggered = false;
        this.wheelDisplayed = false;
        this.emoteMouseTriggered = false;
        this.emoteScreenPos = v2.create(0, 0);
        this.triggerPing = function() {
            if (s.dr) {
                let e;
                if (s.emoteSelector.ping && !s.emoteWheelsGreyed) {
                    const t = PingDefs[s.emoteSelector.ping];
                    if (t?.pingMap) {
                        e = s.uiManager.getWorldPosFromMapPos(
                            s.bigmapPingPos || s.emoteScreenPos,
                            s.map,
                            s.camera
                        );
                        e ||= s.camera.j(s.emoteScreenPos);
                        e.x = math.clamp(e.x, 0, s.map.width);
                        e.y = math.clamp(e.y, 0, s.map.height);
                        s.sendPing({
                            type: s.emoteSelector.ping,
                            pos: e
                        });
                    }
                } else if (
                    s.emoteSelector.emote &&
                    !s.emoteWheelsGreyed
                ) {
                    e = s.dr.pos;
                    s.sendEmote({
                        type: s.emoteSelector.emote,
                        pos: e
                    });
                    s.uiManager.displayMapLarge(true);
                }
                s.inputReset();
                s.aa = s.pingKeyDown;
            }
        };
        this.triggerEmote = function() {
            if (s.dr) {
                let e;
                if (s.emoteSelector.emote && !s.emoteWheelsGreyed) {
                    e = s.dr.pos;
                    s.sendEmote({
                        type: s.emoteSelector.emote,
                        pos: e
                    });
                }
                s.inputReset();
            }
        };
        this.emoteTouchedPos = null;
        this.bigmapPingPos = null;
        this.onTouchStart = function(e) {
            if (s.wheelDisplayed) {
                e.stopPropagation();
                s.inputReset();
            }
        };
        if (device.touch) {
            this.emoteElems = $(".ui-emote");
            this.emoteElems.css("pointer-events", "auto");
            this.bigmapCollision = $("#big-map-collision");
            this.bigmapCollision.on("touchend", (e) => {
                e.stopPropagation();
                s.bigmapPingPos = {
                    x: e.originalEvent.changedTouches[0].pageX,
                    y: e.originalEvent.changedTouches[0].pageY
                };
                s.emoteScreenPos = v2.create(
                    s.camera.screenWidth / 2,
                    s.camera.screenHeight / 2
                );
                s.pingMouseTriggered = true;
            });
            this.emoteButtonElem = $("#ui-emote-button");
            this.emoteButtonElem.css("pointer-events", "auto");
            this.emoteButtonElem.on("touchstart", (e) => {
                e.stopPropagation();
                s.emoteScreenPos = v2.create(
                    s.camera.screenWidth / 2,
                    s.camera.screenHeight / 2
                );
                s.emoteMouseTriggered = true;
            });
            this.emoteElems.on("touchstart", (e) => {
                e.stopPropagation();
                s.emoteTouchedPos = {
                    x: e.originalEvent.changedTouches[0].pageX,
                    y: e.originalEvent.changedTouches[0].pageY
                };
            });
            $(document).on("touchstart", this.onTouchStart);
        }
        this.emoteWheels = $("#ui-emotes, #ui-team-pings");
        this.teamEmotes = $(
            ".ui-emote-bottom-left, .ui-emote-top-left"
        );
        this.emoteWheel = $("#ui-emotes");
        this.emoteWheelData = {
            middle: {
                parent: $("#ui-emote-middle"),
                vA: v2.create(-1, 1),
                vC: v2.create(1, 1),
                ping: "",
                emote: "",
                displayCloseIcon: true
            },
            top: {
                parent: $("#ui-emote-top"),
                vA: v2.create(-1, 1),
                vC: v2.create(1, 1),
                ping: "",
                emote: "",
                emoteSlot: EmoteSlot.Top
            },
            right: {
                parent: $("#ui-emote-right"),
                vA: v2.create(1, 1),
                vC: v2.create(1, -1),
                ping: "",
                emote: "",
                emoteSlot: EmoteSlot.Right
            },
            bottom: {
                parent: $("#ui-emote-bottom"),
                vA: v2.create(1, -1),
                vC: v2.create(-1, -1),
                ping: "",
                emote: "",
                emoteSlot: EmoteSlot.Bottom
            },
            left: {
                parent: $("#ui-emote-left"),
                vA: v2.create(-1, -1),
                vC: v2.create(-1, 1),
                ping: "",
                emote: "",
                emoteSlot: EmoteSlot.Left
            }
        };
        this.teamPingWheel = $("#ui-team-pings");
        const c = {
            middle: {
                parent: $("#ui-team-ping-middle"),
                vA: v2.create(-1, 1),
                vC: v2.create(1, 1),
                ping: "",
                emote: "",
                displayCloseIcon: true
            },
            top: {
                parent: $("#ui-team-ping-top"),
                vA: v2.create(-1, 1),
                vC: v2.create(1, 1),
                ping: "ping_danger",
                emote: ""
            },
            right: {
                parent: $("#ui-team-ping-right"),
                vA: v2.create(1, 1),
                vC: v2.create(1, -1),
                ping: "ping_coming",
                emote: ""
            },
            bottom: {
                parent: $("#ui-team-ping-bottom"),
                vA: v2.create(1, -1),
                vC: v2.create(-1, -1),
                ping: "ping_help",
                emote: ""
            },
            "bottom-left": {
                parent: $("#ui-team-ping-bottom-left"),
                vA: v2.create(-1, -1),
                vC: v2.create(-1, 0),
                ping: "",
                emote: "emote_medical"
            },
            "top-left": {
                parent: $("#ui-team-ping-top-left"),
                vA: v2.create(-1, 0),
                vC: v2.create(-1, 1),
                ping: "",
                emote: "emote_ammo",
                ammoEmote: true
            }
        };
        this.teamPingSelectors = [];
        for (const h in c) {
            if (c.hasOwnProperty(h)) {
                const g = c[h];
                const w = i(g.vA);
                const f = i(g.vC);
                this.teamPingSelectors.push({
                    parent: g.parent,
                    angleA: w,
                    angleC: f,
                    highlight: g.parent.find(".ui-emote-hl"),
                    highlightDisplayed: false,
                    ping: g.ping,
                    emote: g.emote,
                    ammoEmote: g.ammoEmote,
                    displayCloseIcon: g.displayCloseIcon
                });
            }
        }
        this.displayedSelectors = this.teamPingSelectors;
        this.baseScale = 1;
        this.container = new PIXI.Container();
        this.container.scale.set(this.baseScale, this.baseScale);
        this.pingContainer = new PIXI.Container();
        this.container.addChild(this.pingContainer);
        this.indContainer = new PIXI.Container();
        const v = function(e, t = 16777215) {
            const r = new PIXI.Container();
            const a = new PIXI.Container();
            const i = GameConfig.groupColors[e] || t;
            const o = PIXI.Sprite.from("ping-border.img");
            o.scale.set(0.4, 0.4);
            o.anchor.set(0.5, 0.5);
            o.tint = i;
            o.alpha = 0;
            o.visible = true;
            r.addChild(o);
            const s = PIXI.Sprite.from("ping-team-danger.img");
            s.scale.set(0.4, 0.4);
            s.anchor.set(0.5, 0.5);
            s.tint = i;
            s.alpha = 0;
            s.visible = true;
            r.addChild(s);
            const c = PIXI.Sprite.from("ping-team-danger.img");
            c.scale.set(0.5, 0.5);
            c.anchor.set(0.5, 0.5);
            c.tint = i;
            c.alpha = 0;
            c.visible = true;
            a.addChild(c);
            const m = PIXI.Sprite.from("ping-indicator.img");
            m.scale.set(0.5, 0.5);
            m.anchor.set(0.5, 0);
            m.alpha = 0;
            m.visible = true;
            a.addChild(m);
            return {
                elem: $("#ui-team-indicators").find(
                    `.ui-indicator-ping[data-id=${e}]`
                ),
                borderElem: $("#ui-team-indicators").find(
                    `.ui-indicator-ping-border[data-id=${e}]`
                ),
                pingContainer: r,
                indContainer: a,
                borderSprite: {
                    sprite: o,
                    baseScale: 0.4
                },
                pingSprite: {
                    sprite: s,
                    baseScale: 0.4
                },
                indSpriteOuter: {
                    sprite: m,
                    baseScale: 0.5,
                    baseTint: m.tint
                },
                indSpriteInner: {
                    sprite: c,
                    baseScale: 0.5,
                    baseTint: c.tint
                },
                displayed: false,
                fadeIn: 0,
                life: 0,
                fadeOut: 0,
                pos: v2.create(0, 0)
            };
        };
        this.pingIndicators = [];
        for (let k = 0; k < 4; k++) {
            const z = v(k);
            this.pingContainer.addChild(z.pingContainer);
            this.indContainer.addChild(z.indContainer);
            this.pingIndicators.push({
                ping: z
            });
        }
        this.airdropIndicator = v(x, PingDefs.ping_airdrop.tint);
        this.pingContainer.addChild(
            this.airdropIndicator.pingContainer
        );
        this.indContainer.addChild(this.airdropIndicator.indContainer);
        this.pingIndicators.push({
            ping: this.airdropIndicator
        });
        this.airstrikeIndicator = v(S, PingDefs.ping_airstrike.tint);
        this.pingContainer.addChild(
            this.airstrikeIndicator.pingContainer
        );
        this.indContainer.addChild(
            this.airstrikeIndicator.indContainer
        );
        this.pingIndicators.push({
            ping: this.airstrikeIndicator
        });
        this.emoteLifeIn = 0.75;
        this.emoteLife = 1;
        this.emoteLifeOut = 0.1;
        this.pingFadeIn = 0.5;
        this.pingLife = 4.25;
        this.pingFadeOut = 0.1;
        this.wedgeOpacityReset = device.touch ? 1 : 0.75;
        this.teamEmoteOpacityReset = 0.2;
        this.emotes = [];
        this.newPings = [];
        this.newEmotes = [];
        this.emoteLoadout = [];
        this.unlockTypes = {};
        this.socialUnlocked = false;
    }

    free() {
        if (device.touch) {
            $(document).off("touchstart", this.onTouchStart);
            this.emoteButtonElem.off("touchstart");
            this.emoteElems.off("touchstart");
            this.bigmapCollision.off("touchend");
        }
        this.o();
    }

    o() {
        this.emoteWheelsGreyed = false;
        this.emoteWheels.css("opacity", 1);
        this.teamEmotesGreyed = false;
        this.teamEmotes.css("opacity", 1);
        this.disable = false;
        this.inputReset();
    }

    inputReset() {
        this.pingMouseTriggered = false;
        this.aa = false;
        this.emoteMouseTriggered = false;
        this.wheelDisplayed = false;
        this.displayWheel(this.teamPingWheel, false);
        this.displayWheel(this.emoteWheel, false);
        this.emoteTouchedPos = null;
        this.bigmapPingPos = null;
        this.emoteTimeoutTicker = 0;
        for (let e = 0; e < this.displayedSelectors.length; e++) {
            const t = this.displayedSelectors[e];
            const r = EmotesDefs[t.emote];
            const a = r?.teamOnly;
            if (this.teamEmotesGreyed && a) {
                t.parent.css("opacity", this.teamEmoteOpacityReset);
            } else {
                t.parent.css("opacity", this.wedgeOpacityReset);
            }
            t.highlight.css("display", "none");
            t.highlightDisplayed = false;
        }
    }

    sendPing(e) {
        const t = {
            type: e.type,
            pos: e.pos
        };
        this.newPings.push(t);
        this.incrementEmote();
    }

    addPing(e, t) {
        if (this.dr) {
            const r = PingDefs[e.type];
            if (r) {
                this.uiManager.createPing(
                    e.type,
                    e.pos,
                    e.playerId,
                    this.dr.__id,
                    this.playerBarn,
                    t
                );
                let a = null;
                let i = r.sound;
                if (e.type == "ping_airdrop") {
                    a = this.pingIndicators[x].ping;
                } else if (e.type == "ping_airstrike") {
                    a = this.pingIndicators[S].ping;
                } else {
                    const o = this.playerBarn.qe(e.playerId);
                    if (o) {
                        const s = this.playerBarn.qe(
                            this.dr.__id
                        ).groupId;
                        const n = o.groupId;
                        if (s == n) {
                            const l =
                                this.playerBarn.getGroupInfo(n);
                            const c = l.playerIds.indexOf(
                                e.playerId
                            );
                            if (c !== -1) {
                                a = this.pingIndicators[c].ping;
                            }
                        }
                    }
                    const m = this.playerBarn.Fe(e.playerId);
                    if (m && m.role == "leader") {
                        i = r.soundLeader;
                    }
                }
                if (t || e.type != "ping_airstrike") {
                    this.audioManager.playSound(i, {
                        channel: "ui"
                    });
                } else {
                    this.audioManager.playSound(i, {
                        channel: "ui",
                        fallOff: 1,
                        soundPos: e.pos,
                        rangeMult: 20
                    });
                }
                if (a) {
                    a.pos = e.pos;
                    a.pingSprite.sprite.texture =
                        PIXI.Texture.from(r.texture);
                    a.indSpriteInner.sprite.texture =
                        PIXI.Texture.from(r.texture);
                    a.indSpriteInner.sprite.tint = r.mapEvent
                        ? r.tint
                        : a.indSpriteInner.baseTint;
                    a.indSpriteOuter.sprite.tint = r.mapEvent
                        ? r.tint
                        : a.indSpriteOuter.baseTint;
                    a.fadeIn = this.pingFadeIn;
                    a.life = this.pingLife;
                    a.fadeOut = this.pingFadeOut;
                    a.mapEvent = r.mapEvent;
                    a.worldDisplay = r.worldDisplay;
                }
            }
        }
    }

    sendEmote(e) {
        const t = {
            type: e.type,
            pos: e.pos
        };
        this.newEmotes.push(t);
        this.incrementEmote();
    }

    addEmote(e) {
        const t = EmotesDefs[e.type];
        if (t) {
            let r = null;
            for (let a = 0; a < this.emotes.length; a++) {
                if (this.emotes[a].alive || r) {
                    if (
                        this.emotes[a].alive &&
                        this.emotes[a].playerId == e.playerId
                    ) {
                        this.emotes[a].alive = false;
                    }
                } else {
                    r = this.emotes[a];
                }
            }
            if (!r) {
                r = {};
                r.alive = false;
                r.pos = v2.create(0, 0);
                r.container = new PIXI.Container();
                r.circleOuter = PIXI.Sprite.from(
                    "emote-circle-outer.img"
                );
                r.circleOuter.anchor.set(0.5, 0.5);
                r.baseScale = 0.55;
                r.circleOuter.scale.set(
                    r.baseScale * 0.8,
                    r.baseScale * 0.8
                );
                r.circleOuter.tint = 0;
                r.circleOuter.visible = true;
                r.container.addChild(r.circleOuter);
                r.sprite = new PIXI.Sprite();
                r.sprite.anchor.set(0.5, 0.5);
                r.container.addChild(r.sprite);
                r.sprite.scale.set(r.baseScale, r.baseScale);
                r.posOffset = v2.create(0, 4);
                r.container.scale.set(1, 1);
                r.container.visible = false;
                this.emotes.push(r);
            }
            r.alive = true;
            r.isNew = true;
            r.type = e.type;
            r.playerId = e.playerId;
            r.pos = v2.create(0, 0);
            r.lifeIn = this.emoteLifeIn;
            r.life = this.emoteLife;
            r.lifeOut = this.emoteLifeOut;
            r.zIdx = this.zIdxNext++;
            r.sprite.texture = PIXI.Texture.from(t.texture);
            r.container.visible = false;
            r.baseScale = 0.55;
            r.sound = t.sound;
            r.channel = t.channel;
            if (e.type == "emote_loot") {
                const i = GameObjectDefs[e.itemType];
                if (i?.lootImg) {
                    r.sprite.texture = PIXI.Texture.from(
                        i.lootImg.sprite
                    );
                    const o = GameObjectDefs[i.ammo];
                    r.circleOuter.tint = o ? o.lootImg.tintDark : 0;
                    if (i.lootImg.rot) {
                        r.sprite.rotation = i.lootImg.rot;
                    } else {
                        r.sprite.rotation = 0;
                    }
                    if (i.lootImg.mirror) {
                        r.sprite.scale.set(
                            r.baseScale * -1,
                            r.baseScale
                        );
                    } else {
                        r.sprite.scale.set(
                            r.baseScale,
                            r.baseScale
                        );
                    }
                    if (i.sound?.deploy) {
                        if (i.type == "gun") {
                            r.sound = i.sound.deploy;
                            r.channel = "activePlayer";
                        } else {
                            r.sound = "";
                        }
                    }
                }
            } else {
                r.circleOuter.tint = 0;
                r.sprite.rotation = 0;
                r.sprite.scale.set(r.baseScale, r.baseScale);
            }
        }
    }

    incrementEmote() {
        if (++this.emoteCounter >= GameConfig.player.emoteThreshold) {
            this.emoteHardTicker =
                this.emoteHardTicker > 0
                    ? this.emoteHardTicker
                    : GameConfig.player.emoteHardCooldown * 1.5;
        }
    }

    m(e, t, r, s, n, m, p, w, b, x) {
        const S = this.playerBarn;
        const v = this.camera;
        let k = v2.create(w.Ue.x, w.Ue.y);
        if (w.lostFocus) {
            this.inputReset();
        }
        if (b.isBindPressed(Input.TeamPingMenu)) {
            if (!this.pingKeyDown && !x) {
                this.pingKeyDown = true;
                this.aa = true;
            }
        }
        if (b.isBindReleased(Input.TeamPingMenu) && this.pingKeyDown) {
            this.pingKeyDown = false;
            this.aa = this.wheelDisplayed;
        }
        if (b.isBindPressed(Input.TeamPingSingle)) {
            if (
                !this.pingMouseTriggered &&
                !this.emoteMouseTriggered
            ) {
                this.emoteScreenPos = v2.copy(k);
                this.pingMouseTriggered = true;
            }
        }
        if (
            b.isBindReleased(Input.TeamPingSingle) &&
            this.pingMouseTriggered
        ) {
            this.triggerPing();
        }
        if (b.isBindPressed(Input.EmoteMenu)) {
            if (
                !this.pingMouseTriggered &&
                !this.emoteMouseTriggered &&
                !!this.pingKeyDown
            ) {
                this.emoteScreenPos = v2.copy(k);
                this.pingMouseTriggered = true;
            }
            if (!this.pingMouseTriggered) {
                this.emoteScreenPos = v2.copy(k);
                this.emoteMouseTriggered = true;
            }
        }
        if (b.isBindReleased(Input.EmoteMenu)) {
            if (this.aa && this.pingMouseTriggered) {
                this.triggerPing();
            }
            if (this.emoteMouseTriggered) {
                this.triggerEmote();
            }
        }
        this.dr = r;
        if ((t != r.__id || !!r.netData.he) && !this.disable) {
            this.free();
            this.disable = true;
        }
        const z = m.perkMode && !r.netData.Te;
        if (
            !this.disable &&
            !z &&
            ((this.wheelKeyTriggered =
                this.aa || this.emoteMouseTriggered),
            (this.emoteSoftTicker -= e),
            this.emoteCounter >= GameConfig.player.emoteThreshold &&
                    this.emoteHardTicker > 0
                ? ((this.emoteHardTicker -= e),
                this.emoteHardTicker < 0 &&
                        (this.emoteCounter = 0))
                : this.emoteSoftTicker < 0 &&
                    this.emoteCounter > 0 &&
                    (this.emoteCounter--,
                    (this.emoteSoftTicker =
                            GameConfig.player.emoteSoftCooldown * 1.5)),
            (!this.pingMouseTriggered &&
                    !this.emoteMouseTriggered) ||
                this.wheelDisplayed ||
                ((this.parentDisplayed = this.pingMouseTriggered
                    ? this.teamPingWheel
                    : this.emoteWheel),
                this.parentDisplayed.css({
                    display: "block",
                    left: this.emoteScreenPos.x,
                    top: this.emoteScreenPos.y
                }),
                this.displayWheel(this.parentDisplayed, true),
                (this.wheelDisplayed = true),
                (this.displayedSelectors = this.pingMouseTriggered
                    ? this.teamPingSelectors
                    : this.emoteWheelSelectors),
                (this.worldPos = v.j(this.emoteScreenPos))),
            this.wheelDisplayed)
        ) {
            this.emoteTimeoutTicker += e;
            if (this.emoteTimeoutTicker > 10) {
                this.inputReset();
            } else {
                if (
                    this.emoteHardTicker > 0 &&
                    !this.emoteWheelsGreyed
                ) {
                    this.emoteWheels.css("opacity", 0.5);
                    this.emoteWheelsGreyed = true;
                } else if (
                    this.emoteHardTicker <= 0 &&
                    this.emoteWheelsGreyed
                ) {
                    this.emoteWheels.css("opacity", 1);
                    this.emoteWheelsGreyed = false;
                }
                if (!this.teamEmotesGreyed && s == 1) {
                    this.teamEmotes.css(
                        "opacity",
                        this.teamEmoteOpacityReset
                    );
                    this.teamEmotesGreyed = true;
                }
                let I = null;
                if (device.touch) {
                    k = this.emoteTouchedPos;
                }
                if (k) {
                    const T = v2.sub(k, this.emoteScreenPos);
                    T.y *= -1;
                    const M = v2.length(T);
                    const P = i(T);
                    const C = r.Re.tt[r.Re.rt];
                    const A = GameObjectDefs[C.type];
                    let O = "";
                    if (A?.ammo) {
                        O = A.ammo;
                    }
                    for (
                        let D = 0;
                        D < this.displayedSelectors.length;
                        D++
                    ) {
                        const E = this.displayedSelectors[D];
                        if (E.ammoEmote) {
                            const B = {
                                "9mm": "emote_ammo9mm",
                                "12gauge": "emote_ammo12gauge",
                                "762mm": "emote_ammo762mm",
                                "556mm": "emote_ammo556mm",
                                "50AE": "emote_ammo50ae",
                                "308sub": "emote_ammo308sub",
                                flare: "emote_ammoflare",
                                "45acp": "emote_ammo45acp"
                            };
                            const R = E.emote;
                            E.emote = B[O] || "emote_ammo";
                            E.texture = EmotesDefs[E.emote].texture;
                            if (R != E.emote) {
                                const L =
                                    E.parent.find(
                                        ".ui-emote-image"
                                    );
                                const q = a(E);
                                L.css(
                                    "background-image",
                                    `url(${q})`
                                );
                            }
                        }
                        const F = E.ping || E.emote;
                        const j = EmotesDefs[E.emote];
                        const N = j?.teamOnly;
                        const H = N && s == 1;
                        if (
                            M <= 35 &&
                            !F &&
                            this.emoteHardTicker <= 0 &&
                            !H
                        ) {
                            I = E;
                        } else if (
                            o(P, E.angleC, E.angleA) &&
                            M > 35 &&
                            F &&
                            this.emoteHardTicker <= 0 &&
                            !H
                        ) {
                            I = E;
                        } else if (E.highlightDisplayed) {
                            E.parent.css(
                                "opacity",
                                this.wedgeOpacityReset
                            );
                            E.highlight.css("display", "none");
                            E.highlightDisplayed = false;
                        }
                    }
                }
                if (I) {
                    this.emoteSelector = I;
                    if (!I.highlightDisplayed) {
                        I.parent.css("opacity", 1);
                        I.highlight.css("display", "block");
                        I.highlightDisplayed = true;
                    }
                    if (device.touch && this.emoteTouchedPos) {
                        if (this.pingMouseTriggered) {
                            this.triggerPing();
                        } else {
                            this.triggerEmote();
                        }
                    }
                }
            }
        }
        for (let V = 0; V < this.emotes.length; V++) {
            const U = this.emotes[V];
            if (U.alive) {
                let W = false;
                let G = v2.create(0, 0);
                let X = 0;
                const K = S.u(U.playerId);
                if (K && !K.netData.he) {
                    G = v2.copy(K.pos);
                    X = K.layer;
                    W = true;
                }
                if (!W) {
                    const Z = n.getDeadBodyById(U.playerId);
                    if (Z) {
                        G = v2.copy(Z.pos);
                        X = Z.layer;
                        W = true;
                    }
                }
                if (W) {
                    if (U.isNew) {
                        this.audioManager.playSound(U.sound, {
                            channel: U.channel,
                            soundPos: G,
                            layer: X
                        });
                    }
                    U.isNew = false;
                    U.pos = G;
                    if (U.lifeIn > 0) {
                        U.lifeIn -= e;
                    } else if (U.life > 0) {
                        U.life -= e;
                    } else if (U.lifeOut > 0) {
                        U.lifeOut -= e;
                    }
                    const Y = util.sameLayer(X, this.dr.layer) ? 3 : X;
                    p.addPIXIObj(U.container, Y, 50000, U.zIdx);
                    U.alive = U.alive && U.lifeOut > 0;
                } else {
                    U.alive = false;
                }
            }
        }
        for (
            let J = v2.create(
                    (v.screenWidth * 0.5) / v.z(),
                    (v.screenHeight * 0.5) / v.z()
                ),
                Q = {
                    min: v2.sub(v.pos, J),
                    max: v2.add(v.pos, J)
                },
                $ = S.qe(r.__id).groupId,
                ee = S.getGroupInfo($),
                te = (ee.playerIds.length, 0);
            te < this.pingIndicators.length;
            te++
        ) {
            const re = this.pingIndicators[te].ping;
            const ae = ee.playerIds[te];
            const ie = re.pingContainer;
            const oe = re.indContainer;
            if (ae != undefined || re.mapEvent) {
                S.qe(ae);
                const se = ae == this.dr.__id;
                const ne = S.Fe(ae);
                const le = re.borderSprite.sprite;
                const ce = re.pingSprite.sprite;
                const me = re.indSpriteOuter.sprite;
                const pe = re.indSpriteInner.sprite;
                let he = true;
                re.fadeIn -= e;
                re.life -= e;
                re.fadeOut -= re.life > 0 ? 0 : e;
                if (re.fadeOut > 0) {
                    const de = re.pos;
                    const ue = v2.normalizeSafe(
                        v2.sub(de, v.pos),
                        v2.create(1, 0)
                    );
                    const ge = coldet.intersectRayAabb(
                        v.pos,
                        ue,
                        Q.min,
                        Q.max
                    );
                    const ye =
                        Math.atan2(ue.y, -ue.x) + Math.PI * 0.5;
                    const we = v.pointToScreen(ge);
                    const fe = coldet.testCircleAabb(
                        de,
                        GameConfig.player.radius,
                        Q.min,
                        Q.max
                    );
                    const _e = v.pixels(re.borderSprite.baseScale);
                    const be = v.pixels(re.pingSprite.baseScale);
                    le.scale.set(_e, _e);
                    ce.scale.set(be, be);
                    if (ne?.dead) {
                        continue;
                    }
                    he = re.fadeOut < 0;
                    const xe = fe
                        ? v.pointToScreen(de).x
                        : math.clamp(we.x, 64, v.screenWidth - 64);
                    const Se = fe
                        ? v.pointToScreen(de).y
                        : math.clamp(we.y, 64, v.screenHeight - 64);
                    const ve = v.pointToScreen(de).x;
                    const ke = v.pointToScreen(de).y;
                    ce.position.x = ve;
                    ce.position.y = ke;
                    le.position.x = ve;
                    le.position.y = ke;
                    me.position.x = xe;
                    me.position.y = Se;
                    me.rotation = ye;
                    pe.position.x = xe;
                    pe.position.y = Se;
                    const ze = le.alpha <= 0 ? 1 : le.alpha - e;
                    le.alpha = ze;
                    const Ie = v.pixels(
                        re.borderSprite.baseScale * (2 - ze)
                    );
                    le.scale.set(Ie, Ie);
                    pe.alpha = fe ? 0 : ze;
                    if (re.fadeIn > 0) {
                        const Te = 1 - re.fadeIn / this.pingFadeIn;
                        ie.alpha = 1;
                        oe.alpha = 1;
                        ce.alpha = 1;
                        me.alpha = fe ? 0 : Te;
                    } else {
                        me.alpha = fe ? 0 : 1;
                    }
                    if (re.life < 0) {
                        const Me = re.fadeOut / this.pingFadeOut;
                        ie.alpha = Me;
                        oe.alpha = Me;
                    }
                    if (!re.displayed) {
                        ie.visible = re.worldDisplay;
                        oe.visible = !se || re.mapEvent;
                        re.displayed = true;
                    }
                }
                if (he && re.displayed) {
                    ie.visible = false;
                    oe.visible = false;
                    re.displayed = false;
                }
            } else {
                ie.visible = false;
                oe.visible = false;
                re.displayed = false;
            }
        }
    }

    displayWheel(e, t) {
        e.css("display", t ? "block" : "none");
    }

    updateEmoteWheel(e) {
        this.emoteLoadout = e;
        const t = {
            top: e[EmoteSlot.Top],
            right: e[EmoteSlot.Right],
            bottom: e[EmoteSlot.Bottom],
            left: e[EmoteSlot.Left]
        };
        for (const r in t) {
            if (t.hasOwnProperty(r)) {
                const o = t[r];
                const s = EmotesDefs[o];
                if (s && this.emoteWheelData[r]) {
                    this.emoteWheelData[r].emote = o;
                }
            }
        }
        this.emoteWheelSelectors = [];
        for (const n in this.emoteWheelData) {
            if (this.emoteWheelData.hasOwnProperty(n)) {
                const l = this.emoteWheelData[n];
                const c = i(l.vA);
                const p = i(l.vC);
                this.emoteWheelSelectors.push(
                    Object.assign(
                        {
                            angleA: c,
                            angleC: p,
                            highlight:
                                l.parent.find(".ui-emote-hl"),
                            highlightDisplayed: false
                        },
                        l
                    )
                );
                const h = l.parent.find(".ui-emote-image");
                const d = a(l);
                h.css("background-image", `url(${d})`);
            }
        }
    }

    render(e) {
        for (let t = 0; t < this.emotes.length; t++) {
            const r = this.emotes[t];
            r.container.visible = r.alive;
            if (r.alive) {
                let a = 0;
                if (r.lifeIn > 0) {
                    const i = 1 - r.lifeIn / this.emoteLifeIn;
                    a = math.easeOutElastic(i);
                } else if (r.life > 0) {
                    a = 1;
                } else if (r.lifeOut > 0) {
                    const o = r.lifeOut / this.emoteLifeOut;
                    a = o;
                }
                const s = v2.add(
                    r.pos,
                    v2.mul(r.posOffset, 1 / math.clamp(e.O, 0.75, 1))
                );
                const n = e.pointToScreen(s);
                const l = a * r.baseScale * math.clamp(e.O, 0.9, 1.75);
                r.container.position.set(n.x, n.y);
                r.container.scale.set(l, l);
            }
        }
    }
}

const x = 4;
const S = 5;
const v = function(e) {
    return e
        .map((e) => {
            return String.fromCharCode(e);
        })
        .join("");
};
v([109, 101, 110, 117]);
v([105, 110, 105, 116]);
v([99, 104, 101, 97, 116]);

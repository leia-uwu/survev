import $ from "jquery";
import * as PIXI from "pixi.js";
import { collider } from "../../../shared/utils/collider";
import { GameConfig } from "../../../shared/gameConfig";
import { math } from "../../../shared/utils/math";
import { util } from "../../../shared/utils/util";
import { v2 } from "../../../shared/utils/v2";
import { device } from "../device";
import { BulletDefs } from "../../../shared/defs/gameObjects/bulletDefs";
import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";

export class Touch {
    constructor(t, r) {
        const i = this;
        this.input = t;
        this.config = r;
        this.container = new PIXI.Container();
        this.ta = new LineSprites();
        this.padScaleBase = 1;
        this.padScaleDown = 0.6;
        this.padScalePos = 0.25;
        this.moveDetected = false;
        this.wr = false;
        this.ra = false;
        this.touchingAim = false;
        this.display = true;
        this.moveStyle = "locked";
        this.aimStyle = "locked";
        this.touchAimLine = true;
        const o = function(e, t) {
            const r = PIXI.Sprite.from("pad.img");
            r.anchor.set(0.5, 0.5);
            r.scale.set(1, 1);
            r.alpha = 0.2;
            r.visible = false;
            r.tint = t;
            e.addChild(r);
            return r;
        };
        const n = function() {
            return {
                touched: false,
                centerPos: v2.create(0, 0),
                touchPos: v2.create(0, 0),
                centerSprite: o(i.container, 0),
                touchSprite: o(i.container, 16777215)
            };
        };
        this.touchPads = [n(), n()];
        this.playerMovement = {
            left: false,
            right: false,
            up: false,
            down: false,
            moveLen: 0
        };
        this.analogMovement = {
            toMoveDir: v2.create(1, 0),
            toMoveLen: 0
        };
        this.aimMovement = {
            toAimDir: v2.create(1, 0),
            toAimLen: 0
        };
        this.leftLockedPadCenter = v2.create(0, 0);
        this.rightLockedPadCenter = v2.create(0, 0);
        this.padPosBase = 48;
        this.padPosRange = 0;
        this.movePadDetectMult = 1;
        this.shotPadDetectMult = 1.075;
        this.turnDirCooldown = 0.5;
        this.turnDirTicker = 0;
        this.mobileOffsetLandscape = 25;
        this.mobileOffsetPortrait = 100;
        this.lockedPadOffsetLandscape = v2.create(126, 100);
        this.lockedPadOffsetPortrait = v2.create(96, 160);
        this.lockedPadOffsetYLandscapeSafari = 120;
        this.lockedPadOffsetYPortraitSafari = 240;
        const l = function(e) {
            if (!["locked", "anywhere"].includes(e)) {
                return "anywhere";
            } else {
                return e;
            }
        };
        const c = l(r.get("touchMoveStyle"));
        const m = l(r.get("touchAimStyle"));
        this.setMoveStyle(c);
        this.setAimStyle(m);
        this.setTouchAimLine(!!r.get("touchAimLine"));
        this.init();
    }

    getTouchMovement(e) {
        return this.getMovement(e);
    }

    getAimMovement(e, t) {
        const r = e.Re.rt == GameConfig.WeaponSlot.Throwable;
        return this.getAim(r, t);
    }

    setAimDir(e) {
        this.aimMovement.toAimDir = v2.copy(e);
    }

    getMovement(e) {
        let t = null;
        let r = null;
        let a = false;
        let i;
        this.moveDetected = false;
        for (
            let o = 0;
            o < this.input.touches.length;
            o++
        ) {
            const s = this.input.touches[o];
            if (
                !s.isDead &&
                this.isLeftSideTouch(s.posDown.x, e)
            ) {
                const n =
                    this.moveStyle == "anywhere"
                        ? s.posDown
                        : this.leftLockedPadCenter;
                const l = v2.sub(s.pos, n);
                const c = v2.length(l);
                if (c > 2) {
                    const m =
                        (c - 2) /
                        (this.padPosRange /
                            this.movePadDetectMult -
                            2);
                    i =
                        m > 0.00001
                            ? v2.div(l, m)
                            : this.analogMovement.toMoveDir;
                    this.analogMovement = {
                        toMoveDir: v2.create(i.x, i.y * -1),
                        toMoveLen: m
                    };
                    this.moveDetected = true;
                }
                r = this.getConstrainedPos(n, s.pos, c);
                t = n;
                a = true;
                break;
            }
        }
        const h = this.touchPads[0];
        h.touched = a;
        if (a && this.moveStyle == "anywhere") {
            h.centerPos = v2.copy(t);
        } else {
            h.centerPos = v2.copy(this.leftLockedPadCenter);
        }
        h.touchPos.x = a ? r.x : this.leftLockedPadCenter.x;
        h.touchPos.y = a ? r.y : this.leftLockedPadCenter.y;
        return this.analogMovement;
    }

    getAim(e, t) {
        let r = false;
        let a = null;
        let i = null;
        let o;
        for (
            let s = 0;
            s < this.input.touches.length;
            s++
        ) {
            const n = this.input.touches[s];
            if (
                !n.isDead &&
                !this.isLeftSideTouch(n.posDown.x, t)
            ) {
                const l =
                    this.aimStyle == "anywhere"
                        ? n.posDown
                        : this.rightLockedPadCenter;
                const c = v2.sub(n.pos, l);
                const m = v2.length(c);
                if (m > 2) {
                    const h = v2.sub(n.pos, l);
                    const d = v2.length(h);
                    o =
                        d > 0.00001
                            ? v2.div(h, d)
                            : this.aimMovement.toAimDir;
                    this.aimMovement = {
                        toAimDir: v2.create(o.x, o.y * -1),
                        toAimLen: d
                    };
                } else {
                    this.aimMovement.toAimLen = 0;
                }
                i = this.getConstrainedPos(l, n.pos, m);
                a = l;
                r = true;
                break;
            }
        }
        this.ra = this.wr;
        this.wr =
            this.aimMovement.toAimLen >
            this.padPosRange / this.shotPadDetectMult &&
            r;
        this.touchingAim = r;
        if (e && this.ra && r) {
            this.wr = true;
        }
        const u = this.touchPads[1];
        u.touched = r;
        if (r && this.aimStyle == "anywhere") {
            u.centerPos = v2.copy(a);
        } else {
            u.centerPos = v2.copy(this.rightLockedPadCenter);
        }
        u.touchPos.x = r
            ? i.x
            : this.rightLockedPadCenter.x;
        u.touchPos.y = r
            ? i.y
            : this.rightLockedPadCenter.y;
        return {
            aimMovement: this.aimMovement,
            touched: u.touched
        };
    }

    update(e, t, r, a, i) {
        for (let o = 0; o < this.touchPads.length; o++) {
            const s = this.touchPads[o];
            s.centerSprite.position.x = s.centerPos.x;
            s.centerSprite.position.y = s.centerPos.y;
            s.centerSprite.scale.x =
                this.padScaleBase * this.padScaleDown;
            s.centerSprite.scale.y =
                this.padScaleBase * this.padScaleDown;
            s.centerSprite.visible =
                device.touch && this.display;
            s.touchSprite.position.x = s.touchPos.x;
            s.touchSprite.position.y = s.touchPos.y;
            s.touchSprite.scale.x =
                this.padScaleBase * this.padScalePos;
            s.touchSprite.scale.y =
                this.padScaleBase * this.padScalePos;
            s.touchSprite.visible = device.touch && this.display;
        }
        this.ta.update(this, t, r, a, i);
    }

    isLeftSideTouch(e, t) {
        return e < t.screenWidth * 0.5;
    }

    getConstrainedPos(e, t, r) {
        if (r <= this.padPosRange) {
            return t;
        }
        const a = t.x - e.x;
        const i = t.y - e.y;
        const o = Math.atan2(i, a);
        return v2.create(
            Math.cos(o) * this.padPosRange + e.x,
            Math.sin(o) * this.padPosRange + e.y
        );
    }

    getConstrainedPosDown(e, t, r) {
        const a = v2.normalizeSafe(t);
        return v2.add(
            e,
            v2.mul(a, Math.max(0, r - this.padPosRange))
        );
    }

    toggleMoveStyle() {
        this.setMoveStyle(
            this.moveStyle == "locked"
                ? "anywhere"
                : "locked"
        );
    }

    setMoveStyle(e) {
        this.moveStyle = e;
        this.config.set("touchMoveStyle", e);
        const t = document.getElementById(
            "btn-game-move-style"
        );
        if (t) {
            if (this.moveStyle == "locked") {
                t.classList.remove("unlocked-on-icon");
                t.classList.add("locked-on-icon");
            } else {
                t.classList.remove("locked-on-icon");
                t.classList.add("unlocked-on-icon");
            }
        }
    }

    toggleAimStyle() {
        this.setAimStyle(
            this.aimStyle == "locked"
                ? "anywhere"
                : "locked"
        );
    }

    setAimStyle(e) {
        this.aimStyle = e;
        this.config.set("touchAimStyle", e);
        const t =
            document.getElementById("btn-game-aim-style");
        if (this.aimStyle == "locked") {
            t.classList.remove("unlocked-on-icon");
            t.classList.add("locked-on-icon");
        } else {
            t.classList.remove("locked-on-icon");
            t.classList.add("unlocked-on-icon");
        }
    }

    toggleAimLine() {
        this.setTouchAimLine(!this.touchAimLine);
    }

    setTouchAimLine(e) {
        this.touchAimLine = e;
        this.config.set("touchAimLine", this.touchAimLine);
        const t =
            document.getElementById("btn-game-aim-line");
        if (this.touchAimLine) {
            t.classList.remove("aim-line-off-icon");
            t.classList.add("aim-line-on-icon");
        } else {
            t.classList.remove("aim-line-on-icon");
            t.classList.add("aim-line-off-icon");
        }
    }

    init() {
        this.resize();
    }

    resize() {
        const e = device.isLandscape;
        const t = this.lockedPadOffsetLandscape;
        const r = this.lockedPadOffsetPortrait;
        if (device.tablet) {
            t.x = t.x * 1;
            r.x = r.x * 1.25;
        }
        const a = v2.create(t.x, t.y);
        const i = v2.create(r.x, r.y);
        const o = v2.create(device.screenWidth - t.x, t.y);
        const s = v2.create(device.screenWidth - r.x, r.y);
        if (device.os == "ios") {
            if (device.model == "iphonex") {
                a.x = a.x + 56;
                o.x = o.x - 56;
                a.y = a.y * 0.9;
                o.y = o.y * 0.9;
            } else if (device.webview) {
                if (device.tablet && device.webview) {
                    a.y = a.y * 1.1;
                    o.y = o.y * 1.1;
                }
            } else {
                let n =
                    this.lockedPadOffsetYLandscapeSafari;
                let l = this.lockedPadOffsetYPortraitSafari;
                if (device.tablet) {
                    n *= 1;
                    l *= 1;
                }
                a.y = n;
                i.y = l;
                o.y = n;
                s.y = l;
            }
        }
        this.padScaleBase = e ? 1 : 0.8;
        this.padPosRange =
            this.padPosBase * this.padScaleBase;
        const c = e ? a : i;
        this.leftLockedPadCenter = v2.create(
            c.x,
            device.screenHeight - c.y
        );
        const m = e ? o : s;
        this.rightLockedPadCenter = v2.create(
            m.x,
            device.screenHeight - m.y
        );
        this.setMobileStyling(e);
    }

    setMobileStyling(e) {
        if (device.touch) {
            $("#btn-touch-styles")
                .find(".btn-game-container")
                .css("display", "inline-block");
            $("#ui-emote-button").css("display", "block");
        }
        if (device.uiLayout == device.UiLayout.Sm) {
            $("#ui-map-wrapper")
                .addClass("ui-map-wrapper-mobile")
                .removeClass("ui-map-wrapper-desktop");
            $("#ui-settings-container-mobile").css(
                "display",
                "block"
            );
            $("#ui-settings-container-desktop").css(
                "display",
                "none"
            );
            $("#ui-right-center")
                .addClass("ui-right-center-mobile")
                .removeClass("ui-right-center-desktop");
            $("#ui-leaderboard-wrapper").css(
                "display",
                "none"
            );
            $("#big-map-close").css("display", "block");
            $("#ui-game-menu").removeClass(
                "ui-game-menu-desktop"
            );
            $("#btn-game-tabs").css("display", "none");
            $("#ui-game-tab-settings").removeClass(
                "ui-game-tab-settings-desktop"
            );
            $(".ui-ability-key").css("display", "none");
        } else {
            $("#ui-map-wrapper")
                .removeClass("ui-map-wrapper-mobile")
                .addClass("ui-map-wrapper-desktop");
            $("#ui-settings-container-mobile").css(
                "display",
                "none"
            );
            $("#ui-settings-container-desktop").css(
                "display",
                "block"
            );
            $("#ui-right-center")
                .removeClass("ui-right-center-mobile")
                .addClass("ui-right-center-desktop");
            $("#ui-leaderboard-wrapper").css(
                "display",
                "block"
            );
            $("#big-map-close").css("display", "none");
            $("#ui-game-menu").addClass(
                "ui-game-menu-desktop"
            );
            $("#btn-game-tabs").css("display", "flex");
            $("#ui-game-tab-settings").addClass(
                "ui-game-tab-settings-desktop"
            );
            $(".ui-ability-key").css("display", "block");
        }
        if (device.tablet) {
            if (e) {
                if (device.os == "ios") {
                    if (device.webview) {
                        $("#ui-bottom-right").addClass(
                            "ui-bottom-right-tablet-ipad-webview"
                        );
                        $("#ui-right-center").addClass(
                            "ui-right-center-tablet"
                        );
                    } else {
                        $("#ui-bottom-right").addClass(
                            "ui-bottom-right-tablet-ipad-browser"
                        );
                        $("#ui-right-center").addClass(
                            "ui-right-center-tablet-ipad-browser"
                        );
                    }
                } else {
                    $("#ui-bottom-right").addClass(
                        "ui-bottom-right-tablet"
                    );
                    $("#ui-right-center").addClass(
                        "ui-right-center-tablet"
                    );
                }
                $("#ui-bottom-center-left").addClass(
                    "ui-bottom-center-left-tablet"
                );
                $("#ui-bottom-center-right").addClass(
                    "ui-bottom-center-right-tablet"
                );
                $("#ui-top-left").addClass(
                    "ui-top-left-tablet"
                );
                $("#ui-spectate-options-wrapper").addClass(
                    "ui-spectate-options-wrapper-tablet"
                );
                $("#ui-killfeed-wrapper").addClass(
                    "ui-killfeed-wrapper-tablet"
                );
                $("#ui-kill-leader-wrapper").css(
                    "right",
                    144
                );
            } else {
                $("#ui-bottom-left").removeClass(
                    "ui-bottom-left-tablet"
                );
                $("#ui-bottom-right").removeClass(
                    "ui-bottom-right-tablet"
                );
                $("#ui-right-center").removeClass(
                    "ui-right-center-tablet"
                );
                $("#ui-bottom-center-right").removeClass(
                    "ui-bottom-center-right-tablet"
                );
                $("#ui-top-left").removeClass(
                    "ui-top-left-tablet"
                );
                $(
                    "#ui-spectate-options-wrapper"
                ).removeClass(
                    "ui-spectate-options-wrapper-tablet"
                );
                $(
                    "#ui-killfeed-wrapper-wrapper"
                ).removeClass("ui-killfeed-wrapper-tablet");
            }
        }
        if (device.os == "ios") {
            if (device.model == "iphonex") {
                const t = device.isLandscape ? "99%" : "90%";
                const r = device.isLandscape ? 0 : 32;
                $("#ui-game").css({
                    height: t,
                    top: r
                });
                $("#ui-stats-contents").css({
                    transform:
                        "translate(-50%) scale(0.95)",
                    "transform-origin": "top"
                });
                if (e) {
                    $("#ui-game").css({
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "93%"
                    });
                } else {
                    $("#ui-game").css({
                        left: "",
                        transform: "",
                        width: ""
                    });
                }
            } else if (
                window.navigator.standalone &&
                !device.tablet
            ) {
                $("#ui-game").css({
                    height: "95%"
                });
            } else {
                let a = device.isLandscape ? "86%" : "82%";
                if (device.tablet) {
                    a = "100%";
                } else if (device.webview) {
                    a = "98%";
                }
                $("#ui-game").css({
                    height: a
                });
                const i = device.webview && !device.tablet ? 0 : 6;
                const s = $(
                    "#ui-right-center, #ui-top-center-scopes-wrapper, #ui-top-center, #ui-menu-display"
                );
                s.css({
                    "margin-top": i
                });
            }
        }
        if (device.tablet || e) {
            $("#ui-loot-50AE").insertBefore(
                "#ui-loot-556mm"
            );
            $("#ui-loot-9mm").insertBefore(
                "#ui-loot-556mm"
            );
            $("#ui-loot-308sub").insertBefore(
                "#ui-loot-556mm"
            );
            $("#ui-loot-12gauge").insertBefore(
                "#ui-loot-556mm"
            );
            $("#ui-loot-flare").insertBefore(
                "#ui-loot-556mm"
            );
            $("#ui-loot-762mm").insertBefore(
                "#ui-loot-556mm"
            );
            $("#ui-loot-45acp").insertBefore(
                "#ui-loot-556mm"
            );
        } else {
            $("#ui-loot-9mm").insertBefore(
                "#ui-loot-45acp"
            );
            $("#ui-loot-12gauge").insertBefore(
                "#ui-loot-45acp"
            );
            $("#ui-loot-762mm").insertBefore(
                "#ui-loot-45acp"
            );
            $("#ui-loot-556mm").insertBefore(
                "#ui-loot-45acp"
            );
            $("#ui-loot-50AE").insertBefore(
                "#ui-loot-45acp"
            );
            $("#ui-loot-308sub").insertBefore(
                "#ui-loot-45acp"
            );
            $("#ui-loot-flare").insertBefore(
                "#ui-loot-45acp"
            );
        }
    }

    hideAll() {
        this.display = false;
    }
}

class LineSprites {
    constructor() {
        this.container = new PIXI.Container();
        this.container.visible = false;
        this.dots = [];
    }

    createDot() {
        const e = new PIXI.Sprite();
        e.texture = PIXI.Texture.from("dot.img");
        e.anchor.set(0.5, 0.5);
        e.position.set(0, 0);
        e.scale.set(1, 1);
        e.tint = 16777215;
        e.alpha = 1;
        e.visible = false;
        return e;
    }

    /**
     * @param {import("../objects/player").Player} activePlayer
     */
    update(e, activePlayer, r, a, i) {
        const o =
            device.touch && e.touchingAim && e.touchAimLine;
        if (o) {
            const s = activePlayer.netData.me;
            const g = GameObjectDefs[s];
            let y = 30;
            if (g.type == "gun") {
                const w = BulletDefs[g.bulletType].distance;
                y = g.barrelLength + w;
            }
            const f = activePlayer.getZoom();
            const _ = Math.sqrt(f * 1.414 * f);
            y = math.min(y, _);
            const b = v2.copy(activePlayer.pos);
            let x = v2.add(b, v2.mul(activePlayer.dir, y));
            for (
                let S = r.Ve.p(), v = 0;
                v < S.length;
                v++
            ) {
                const k = S[v];
                if (
                    !!k.active &&
                    !k.dead &&
                    k.height >= GameConfig.bullet.height &&
                    !!k.collidable &&
                    !k.isWindow &&
                    util.sameLayer(activePlayer.layer, k.layer) &&
                    (g.type != "throwable" ||
                        k.height > GameConfig.projectile.maxHeight)
                ) {
                    const z = collider.intersectSegment(
                        k.collider,
                        b,
                        x
                    );
                    if (z) {
                        const I = v2.length(
                            v2.sub(z.point, b)
                        );
                        if (I < y) {
                            y = I;
                            x = z.point;
                        }
                    }
                }
            }
            const T = v2.length(v2.sub(x, b));
            const M = Math.max(
                Math.ceil((T - 3.5) / 1.5),
                0
            );
            for (; this.dots.length < M;) {
                const P = this.createDot();
                this.container.addChild(P);
                this.dots.push(P);
            }
            for (let C = 0; C < this.dots.length; C++) {
                const A = this.dots[C];
                const O = 3.5 + C * 1.5;
                const D = v2.add(activePlayer.pos, v2.mul(activePlayer.dir, O));
                A.position.set(D.x, D.y);
                A.scale.set(0.01171875, 0.01171875);
                A.visible = C < M;
            }
            const E = a.pointToScreen(v2.create(0, 0));
            const B = a.pointToScreen(v2.create(1, 1));
            const R = v2.sub(B, E);
            this.container.position.set(E.x, E.y);
            this.container.scale.set(R.x, R.y);
            this.container.alpha = 0.3;
            i.addPIXIObj(this.container, activePlayer.layer, 19, 0);
        }
        this.container.visible = o;
    }
}

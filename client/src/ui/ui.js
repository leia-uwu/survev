import $ from "jquery";
import * as PIXI from "pixi.js";
import { coldet } from "../../../shared/utils/coldet";
import { GameConfig } from "../../../shared/gameConfig";
import { math } from "../../../shared/utils/math";
import { device } from "../device";
import { GasRenderer, GasSafeZoneRenderer } from "../gas";
import { helpers } from "../helpers";
import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";
import { PingDefs } from "../../../shared/defs/gameObjects/pingDefs";
import { RoleDefs } from "../../../shared/defs/gameObjects/roleDefs";
import "../objects/particles";
import "../objects/shot";
import "../inputBinds";
import { MapIndicatorBarn } from "../objects/mapIndicator";
import { MapSpriteBarn } from "../objects/mapSprite";
import { PieTimer } from "./pieTimer";
import { v2 } from "../../../shared/utils/v2";

const Action = GameConfig.Action;
const GasMode = GameConfig.GasMode;

function a(e) {
    const t = Math.floor(e / 3600);
    const r = Math.floor(e / 60) % 60;
    const a = Math.floor(e) % 60;
    let i = "";
    if (t > 0) {
        i += `${t}h `;
    }
    if (t > 0 || r > 0) {
        i += `${r}m `;
    }
    return (i += `${a}s`);
}

function o(e, t, r, a) {
    const i = e;
    const o = t;
    const s = i + ((o - i) / r) * a;
    return Math.floor(s);
}

function Color(e, t, r) {
    let a;
    let i;
    let o;
    (function(e, t, r) {
        a = e;
        i = t;
        o = r;
    })(e, t, r);
    this.getColors = function() {
        return {
            r: a,
            g: i,
            b: o
        };
    };
}

export class UiManager {
    constructor(e, t, r, a, i, o, c, m, p) {
        const d = this;
        const g = this;
        this.game = e;
        this.particleBarn = r;
        this.localization = i;
        this.touch = c;
        this.inputBinds = m;
        this.inputBindUi = p;
        this.Pe = new PieTimer();
        this.gameElem = $("#ui-game");
        this.statsMain = $("#ui-stats");
        this.statsElem = $("#ui-stats-bg");
        this.statsContentsContainer = $("#ui-stats-contents");
        this.statsContents = $("#ui-stats-contents-inner");
        this.statsHeader = $("#ui-stats-header");
        this.statsInfoBox = $("#ui-stats-info-box");
        this.statsOptions = $("#ui-stats-options");
        this.statsAds = $(".ui-stats-ad-container");
        this.statsLogo = $("#ui-stats-logo");
        this.escMenuElem = $("#ui-game-menu");
        this.escMenuDisplayed = false;
        this.roleMenuElemWrapper = $("#ui-role-menu-wrapper");
        this.roleMenuElem = $("#ui-role-menu");
        this.roleMenuFooterEnterElem = $("#ui-role-footer-enter");
        this.roleMenuFooterHtml = "";
        this.roleMenuActive = false;
        this.roleMenuDisplayed = false;
        this.roleMenuTicker = 0;
        this.roleDisplayed = "";
        this.roleSelected = "";
        this.roleMenuConfirm = $("#ui-role-footer-enter");
        this.roleMenuConfirm.on("click", (e) => {
            e.stopPropagation();
            g.roleSelected = g.roleDisplayed;
            g.setRoleMenuActive(false);
        });
        this.roleMenuInst = null;
        this.topLeft = $("#ui-top-left");
        this.waitingForPlayers = true;
        this.waitingText = $("#ui-waiting-text");
        this.spectating = false;
        this.prevSpectatorCount = 0;
        this.spectatorCount = 0;
        this.spectatorCounterDisplayed = false;
        this.spectatorCounterContainer = $("#ui-spec-counter");
        this.spectatorCounter = $("#ui-spec-counter-number");
        this.spectateMode = $(".ui-spectate-mode");
        this.spectatedPlayerText = $("#ui-spectate-text");
        this.spectatedPlayerName = "";
        this.spectatedPlayerId = 0;
        this.spectateModeStats = $("#ui-spectate-stats");
        this.spectateModeStatsData = $("#ui-spectate-stats-data");
        this.spectateOptionsWrapper = $("#ui-spectate-options-wrapper");
        this.rightCenter = $("#ui-right-center");
        this.leaderboardAlive = $("#ui-leaderboard-alive");
        this.playersAlive = $(".js-ui-players-alive");
        this.leaderboardAliveFaction = $(
            "#ui-leaderboard-alive-faction"
        );
        this.playersAliveRed = $(".js-ui-players-alive-red");
        this.playersAliveBlue = $(".js-ui-players-alive-blue");
        this.playersAliveRedCounter = 0;
        this.playersAliveBlueCounter = 0;
        this.playerKills = $(".js-ui-player-kills");
        this.announcement = $("#ui-announcement");
        this.killLeaderName = $("#ui-kill-leader-name");
        this.killLeaderCount = $("#ui-kill-leader-count");
        this.mapContainer = $("#ui-map-container");
        this.mapContainerBottom = 52;
        this.mapInfo = $("#ui-map-info");
        this.mapInfoBottom = 218;
        this.gasState = {};
        this.gasIcon = $("#ui-gas-icon");
        this.gasTimer = $("#ui-gas-timer");
        this.mapMinimizeButton = $("#ui-map-minimize");
        this.menuDisplayButton = $("#ui-menu-display");
        this.bottomCenterRight = $("#ui-bottom-center-right");
        $("#ui-map-wrapper").css("display", "block");
        $("#ui-team").css("display", "block");
        this.actionSeq = -1;
        this.displayMapDirty = false;
        this.displayMapClear = false;
        $(".ui-map-expand").on("mousedown", (e) => {
            e.stopPropagation();
        });
        $(".ui-map-expand").on("click", (e) => {
            if (device.touch) {
                if (!d.bigmapDisplayed) {
                    d.displayMapLarge();
                }
            } else if (device.uiLayout == device.UiLayout.Lg) {
                d.displayMapLarge(d.bigmapDisplayed);
            }
        });
        $("#ui-map-minimize").on("mousedown", (e) => {
            e.stopPropagation();
        });
        $("#ui-map-minimize").on("click", (e) => {
            e.stopPropagation();
            d.toggleMiniMap();
        });
        $("#ui-menu-display").on("click", (e) => {
            e.stopPropagation();
            d.toggleEscMenu();
        });
        this.bigmap = $("#big-map");
        this.bigmapCollision = $("#big-map-collision");
        this.moveStyleButton = $("#btn-game-move-style");
        this.moveStyleButton.on("touchstart", () => {
            c.toggleMoveStyle();
        });
        this.aimStyleButton = $("#btn-game-aim-style");
        this.aimStyleButton.on("touchstart", () => {
            c.toggleAimStyle();
        });
        this.aimLineButton = $("#btn-game-aim-line");
        this.aimLineButton.on("touchstart", () => {
            c.toggleAimLine();
        });
        this.onTouchScreen = function(e) {
            if (e.target.id == "cvs") {
                d.toggleEscMenu(true);
            }
        };
        $(document).on("touchstart", this.onTouchScreen);
        this.bigmapClose = $("#big-map-close");
        this.bigmapClose.on("touchend", (e) => {
            e.stopPropagation();
            d.displayMapLarge(true);
        });
        this.bigmapClose.on("mousedown", (e) => {
            e.stopPropagation();
        });
        this.bigmapClose.on("click", (e) => {
            e.stopPropagation();
            d.displayMapLarge(true);
        });
        this.gameTabs = $(".ui-game-tab");
        this.gameTabBtns = $(".btn-game-tab-select");
        this.gameKeybindBtns = $(".btn-keybind-desc");
        this.currentGameTab = "settings";
        this.gameTabBtns.on("click", (e) => {
            d.setCurrentGameTab($(e.target).data("tab"));
        });
        this.setCurrentGameTab(this.currentGameTab);
        this.fullScreenButton = $("#btn-game-fullscreen");
        this.fullScreenButton.on("mousedown", (e) => {
            e.stopPropagation();
        });
        this.fullScreenButton.on("click", () => {
            helpers.toggleFullScreen();
            d.toggleEscMenu();
        });
        let w = device.os == "ios" ? "none" : "block";
        if (device.webview || device.touch) {
            w = "none";
        }
        $("#btn-game-fullscreen").css("display", w);
        this.resumeButton = $("#btn-game-resume");
        this.resumeButton.on("mousedown", (e) => {
            e.stopPropagation();
        });
        this.resumeButton.on("click", () => {
            d.toggleEscMenu();
        });
        if (device.touch) {
            this.resumeButton.css("display", "none");
        }
        $("#btn-spectate-quit").on("click", () => {
            d.quitGame();
        });
        $("#btn-game-quit").on("mousedown", (e) => {
            e.stopPropagation();
        });
        $("#btn-game-quit").on("click", () => {
            d.game.updatePass = true;
            d.game.updatePassDelay = 1;
            d.quitGame();
        });
        this.specStatsButton = $("#btn-spectate-view-stats");
        this.specStatsButton.on("click", () => {
            d.toggleLocalStats();
        });
        this.specBegin = false;
        this.specNext = false;
        this.specPrev = false;
        this.specNextButton = $("#btn-spectate-next-player");
        this.specNextButton.on("click", () => {
            d.specNext = true;
        });
        this.specPrevButton = $("#btn-spectate-prev-player");
        this.specPrevButton.on("click", () => {
            d.specPrev = true;
        });
        this.interactionElems = $(
            "#ui-interaction-press, #ui-interaction"
        );
        this.interactionTouched = false;
        this.interactionElems.css("pointer-events", "auto");
        this.interactionElems.on("touchstart", (e) => {
            e.stopPropagation();
            d.interactionTouched = true;
        });
        this.reloadElems = $(
            "#ui-current-clip, #ui-remaining-ammo, #ui-reload-button-container"
        );
        this.reloadTouched = false;
        this.reloadElems.css("pointer-events", "auto");
        this.reloadElems.on("touchstart", (e) => {
            e.stopPropagation();
            d.reloadTouched = true;
        });
        this.flairElems = $(".ui-health-flair");
        this.flairId = 0;
        this.healthRed = new Color(255, 0, 0);
        this.healthDarkpink = new Color(255, 45, 45);
        this.healthLightpink = new Color(255, 112, 112);
        this.healthWhite = new Color(255, 255, 255);
        this.healthGrey = new Color(179, 179, 179);
        this.minimapDisplayed = true;
        this.visibilityMode = 0;
        this.hudVisible = true;
        this.gasRenderer = new GasRenderer(o, 0);
        this.gasSafeZoneRenderer = new GasSafeZoneRenderer();
        this.sentAdStatus = false;
        this.frame = 0;
        this.weapsDirty = false;
        this.weapSwitches = $("#ui-weapon-id-1, #ui-weapon-id-2");
        this.weapNoSwitches = $("#ui-weapon-id-3, #ui-weapon-id-4");
        this.weapDraggedId = 0;
        this.swapWeapSlots = false;
        this.weapDraggedDiv = null;
        this.weapDragging = false;
        this.weapDropped = false;
        this.resetWeapSlotStyling = function() {
            if (g.weapDraggedDiv) {
                g.weapSwitches.css({
                    left: "",
                    top: ""
                });
                $("#ui-game").css({
                    "pointer-events": ""
                });
            }
            g.weapDraggedDiv = null;
            g.weapDragging = false;
            g.weapDropped = false;
            if (g.weapSwitches.hasClass("ui-weapon-dragged")) {
                g.weapSwitches.removeClass("ui-weapon-dragged");
            }
            if (!g.weapNoSwitches.hasClass("ui-outline-hover")) {
                g.weapNoSwitches.addClass("ui-outline-hover");
            }
        };
        if (!device.touch) {
            this.weapSwitches.on("mousedown", function(e) {
                if (e.button == 0) {
                    g.weapDraggedDiv = $(this);
                    g.weapDraggedId = $(this).data("slot");
                }
            });
            $("#ui-game").on("mousemove", (e) => {
                if (g.weapDraggedDiv && !g.weapDropped) {
                    if (g.weapDragging) {
                        g.weapDraggedDiv.css({
                            left: e.pageX - 80,
                            top: e.pageY - 30
                        });
                        g.weapDraggedDiv.addClass("ui-weapon-dragged");
                    } else {
                        $("#ui-game").css({
                            "pointer-events": "initial"
                        });
                        g.weapNoSwitches.removeClass(
                            "ui-outline-hover"
                        );
                        g.weapDragging = true;
                    }
                }
            });
            $("#ui-game, #ui-weapon-id-1, #ui-weapon-id-2").on(
                "mouseup",
                (e) => {
                    if (e.button == 0 && g.weapDraggedDiv != null) {
                        g.weapSwitches.each(function() {
                            const e = $(this).data("slot");
                            if (
                                $(this).is(":hover") &&
                                g.weapDraggedId != e
                            ) {
                                g.swapWeapSlots = true;
                                g.weapDropped = true;
                            }
                        });
                        if (!g.swapWeapSlots) {
                            g.resetWeapSlotStyling();
                        }
                    }
                }
            );
        }
        this.mapSpriteBarn = new MapSpriteBarn();
        this.Ae = new MapIndicatorBarn(this.mapSpriteBarn);
        this.playerMapSprites = [];
        this.playerPingSprites = {};
        this.container = new PIXI.Container();
        this.container.mask = new PIXI.Graphics();
        this.display = {
            gas: this.gasRenderer.display,
            gasSafeZone: this.gasSafeZoneRenderer.display,
            airstrikeZones: a.airstrikeZoneContainer,
            mapSprites: this.mapSpriteBarn.container,
            teammates: new PIXI.Container(),
            player: new PIXI.Container(),
            border: new PIXI.Graphics()
        };
        this.mapSprite = new PIXI.Sprite(PIXI.Texture.EMPTY);
        this.mapSprite.anchor = new PIXI.Point(0.5, 0.5);
        this.container.addChild(this.mapSprite);
        this.container.addChild(this.display.gas);
        this.container.addChild(this.display.gasSafeZone);
        this.container.addChild(this.display.airstrikeZones);
        this.container.addChild(this.display.mapSprites);
        this.container.addChild(this.display.teammates);
        this.container.addChild(this.display.player);
        this.container.addChild(this.display.border);
        this.bigmapDisplayed = false;
        this.screenScaleFactor = 1;
        const f = this.getMinimapMargin();
        const z = this.getMinimapSize();
        this.minimapPos = v2.create(
            f + z / 2,
            e.camera.screenHeight - z / 2 - f
        );
        this.dead = false;
        this.audioManager = t;
        this.muteButton = $("#ui-mute-ingame");
        this.muteButtonImage = this.muteButton.find("img");
        this.muteOffImg = "audio-off.img";
        this.muteOnImg = "audio-on.img";
        const I = this.audioManager.mute;
        this.muteButtonImage.attr(
            "src",
            I ? this.muteOffImg : this.muteOnImg
        );
        this.muteButton.on("mousedown", (e) => {
            e.stopPropagation();
        });
        this.muteButton.on("click", (e) => {
            let t = d.audioManager.muteToggle();
            d.muteButtonImage.attr(
                "src",
                t ? d.muteOffImg : d.muteOnImg
            );
            t = null;
        });
        this.displayingStats = false;
        this.teamMemberHealthBarWidth = parseInt(
            $(".ui-team-member-health")
                .find(".ui-bar-inner")
                .css("width")
        );
        this.teamMemberHeight = 48;
        this.groupPlayerCount = 0;
        this.teamSelectors = [];
        for (let T = 0; T < 4; T++) {
            const M = this.topLeft;
            const P = T;
            this.teamSelectors.push({
                teamNameHtml: "",
                groupId: $(M).find(`[data-id=${P}]`),
                groupIdDisplayed: false,
                teamName: $(M)
                    .find(`[data-id=${P}]`)
                    .find(".ui-team-member-name"),
                teamIcon: $(M)
                    .find(`[data-id=${P}]`)
                    .find(".ui-team-member-icon"),
                teamStatus: $(M)
                    .find(`[data-id=${P}]`)
                    .find(".ui-team-member-status"),
                teamHealthInner: $(M)
                    .find(`[data-id=${P}]`)
                    .find(".ui-health-actual"),
                teamColor: $(M)
                    .find(`[data-id=${P}]`)
                    .find(".ui-team-member-color"),
                playerId: 0,
                prevHealth: 0,
                prevStatus: {
                    disconnected: false,
                    dead: false,
                    downed: false,
                    role: ""
                },
                indicators: {
                    main: {
                        elem: $("#ui-team-indicators").find(
                            `.ui-indicator-main[data-id=${P}]`
                        ),
                        displayed: false
                    }
                }
            });
        }
        this.displayOldMapSprites = false;
        this.o();
    }

    free() {
        this.gasRenderer.free();
        this.clearUI();
        this.roleMenuConfirm.off("click");
        $(".ui-role-option").off("click");
        $(".ui-map-expand").off("mousedown");
        $(".ui-map-expand").off("click");
        $("#ui-map-minimize").off("mousedown");
        $("#ui-map-minimize").off("click");
        $("#ui-menu-display").off("click");
        this.moveStyleButton.off("touchstart");
        this.aimStyleButton.off("touchstart");
        this.aimLineButton.off("touchstart");
        $(document).off("touchstart", this.onTouchScreen);
        this.bigmapClose.off("touchend");
        this.bigmapClose.off("mousedown");
        this.bigmapClose.off("click");
        this.gameTabBtns.off("click");
        this.fullScreenButton.off("mousedown");
        this.fullScreenButton.off("click");
        this.resumeButton.off("mousedown");
        this.resumeButton.off("click");
        $("#btn-spectate-quit").off("click");
        $("#btn-game-quit").off("mousedown");
        $("#btn-game-quit").off("click");
        this.specStatsButton.off("click");
        this.specNextButton.off("click");
        this.specPrevButton.off("click");
        this.interactionElems.off("touchstart");
        this.reloadElems.off("touchstart");
        this.weapSwitches.off("mousedown");
        $("#ui-game").off("mousemove");
        $("#ui-game").off("mouseup");
        $("#ui-weapon-id-1").off("mouseup");
        $("#ui-weapon-id-2").off("mouseup");
        this.muteButton.off("mousedown");
        this.muteButton.off("click");
        $(".ui-team-member-health")
            .find(".ui-bar-inner")
            .css("width", this.teamMemberHealthBarWidth);
        $("#ui-center").off("mouseenter mouseleave");
        this.inputBinds.menuHovered = false;
        if (!this.hudVisible) {
            this.cycleHud();
        }
        this.Pe.destroy();
        this.clearStatsElems();
        this.setRoleMenuActive(false);
        this.o();
    }

    o() {
        $(".js-ui-map-hidden").css("display", "block");
        $("#ui-map-counter-default").css("display", "inline-block");
        $("#ui-map-counter-faction").css("display", "none");
        this.flairElems.css("display", "none");
        this.clearStatsElems();
        this.setSpectating(false);
        this.updateSpectatorCountDisplay(true);
        this.resetWeapSlotStyling();
        this.dead = false;
        for (let e = 0; e < this.teamSelectors.length; e++) {
            this.teamSelectors[e].teamColor.removeAttr("style");
        }
    }

    onMapLoad(e, t) {
        this.resize(e, t);
        const r = e.getMapDef().gameMode.killLeaderEnabled;
        $("#ui-kill-leader-container").css(
            "display",
            r ? "block" : "none"
        );
        if (!device.mobile) {
            $("#ui-killfeed-wrapper").css(
                "top",
                r ? "60px" : "12px"
            );
        }
    }

    m(e, t, r, a, i, o, s, n, l) {
        const d = t;
        if (this.weapsDirty) {
            this.resetWeapSlotStyling();
        }
        this.weapsDirty = false;
        this.Ae.Ee(e);
        const f = math.max(
            Math.floor(a.duration * (1 - a.circleT)),
            0
        );
        const _ = {
            mode: a.mode,
            time: f
        };
        if (
            this.gasState.mode != _.mode ||
            this.gasState.time != _.time
        ) {
            this.gasState = _;
            const b = this.gasState.mode == GasMode.Moving;
            this.mapInfo.removeClass("icon-pulse");
            this.gasIcon.removeClass("gas-icon");
            this.gasIcon.removeClass("danger-icon");
            if (b) {
                this.mapInfo.addClass("icon-pulse");
            }
            this.gasIcon.addClass(b ? "danger-icon" : "gas-icon");
            const S = Math.floor(this.gasState.time / 60);
            const v = this.gasState.time % 60;
            const k = `0${v}`.slice(-2);
            this.gasTimer.html(`${S}:${k}`);
        }
        this.spectatorCount = t.Re.Be;
        this.updateSpectatorCountDisplay(false);
        if (t.netData.he && !this.dead) {
            this.dead = true;
            this.Pe.stop();
        }
        if (d.downed || this.dead) {
            this.resetWeapSlotStyling();
        }
        if (
            this.actionSeq != t.action.seq &&
            ((this.actionSeq = t.action.seq),
            this.Pe.stop(),
            t.action.type != Action.None && !this.displayingStats)
        ) {
            let I = "";
            let T = "";
            let M = "";
            switch (t.action.type) {
            case Action.Reload:
            case Action.ReloadAlt:
                if (GameObjectDefs[t.action.item]) {
                    T =
                            this.localization.translate(
                                "game-reloading"
                            );
                }
                break;
            case Action.UseItem:
                if (GameObjectDefs[t.action.item]) {
                    T =
                            this.localization.translate(
                                "game-using"
                            );
                    M = this.localization.translate(
                        `game-${t.action.item}`
                    );
                }
                break;
            case Action.Revive: {
                const P = o.qe(t.action.targetId).name;
                T =
                        this.localization.translate(
                            "game-reviving"
                        );
                M = d.downed ? "" : P;
            }
            }
            if (T != "" || M != "") {
                if (
                    this.localization.translate("word-order") ==
                    "svo"
                ) {
                    I += T || "";
                    I += M ? ` ${M}` : "";
                } else if (
                    this.localization.translate("word-order") ==
                    "sov"
                ) {
                    I += M ? `${M} ` : "";
                    I += T ? ` ${T}` : "";
                }
                this.Pe.start(I, t.action.time, t.action.duration);
            }
        }
        if (!this.bigmapDisplayed) {
            this.mapSprite.x =
                this.minimapPos.x +
                this.mapSprite.width / 2 -
                (t.pos.x / r.width) * this.mapSprite.width;
            this.mapSprite.y =
                this.minimapPos.y -
                this.mapSprite.height / 2 +
                (t.pos.y / r.height) * this.mapSprite.height;
        }
        const C = v2.create(
            (s.screenWidth * 0.5) / s.z(),
            (s.screenHeight * 0.5) / s.z()
        );
        const A = {
            min: v2.sub(s.pos, C),
            max: v2.add(s.pos, C)
        };
        const O = o.qe(t.__id).groupId;
        const D = o.getGroupInfo(O);
        if (!D) {
            const err = {
                playerId: t.__id,
                groupId: O,
                spectating: this.spectating,
                playing: this.game.playingTicker,
                groupInfo: o.groupInfo
            };
            console.error(`badTeamInfo_1: ${JSON.stringify(err)}`);
        }
        const B = device.uiLayout == device.UiLayout.Sm;
        const R = D.playerIds.length;
        for (let L = 0; L < R; L++) {
            const q = this.teamSelectors[L];
            const F = D.playerIds[L];
            const j = o.qe(F);
            const N = F == d.__id;
            const H = o.Fe(F);
            if (H && n > 1) {
                if (!q.groupIdDisplayed) {
                    q.groupId.css("display", "block");
                    q.groupIdDisplayed = true;
                }
                this.updateTeam(
                    L,
                    helpers.htmlEscape(j.name),
                    H.health,
                    {
                        disconnected: H.disconnected,
                        dead: H.dead,
                        downed: H.downed,
                        role: H.role
                    },
                    j.playerId,
                    j.teamId,
                    o
                );
                for (const V in q.indicators) {
                    if (q.indicators.hasOwnProperty(V)) {
                        const U = q.indicators[V];
                        const W = U.elem;
                        let G = true;
                        if ((!N || U.displayAll) && !l) {
                            const X = H.pos;
                            const K = v2.normalizeSafe(
                                v2.sub(X, s.pos),
                                v2.create(1, 0)
                            );
                            const Z = coldet.intersectRayAabb(
                                s.pos,
                                K,
                                A.min,
                                A.max
                            );
                            const Y =
                                Math.atan2(K.y, -K.x) +
                                Math.PI * 0.5;
                            const J = s.pointToScreen(Z);
                            const Q = coldet.testCircleAabb(
                                X,
                                GameConfig.player.radius,
                                A.min,
                                A.max
                            );
                            if (!H.dead && !Q) {
                                let $ = 32;
                                let ee = `translate(-50%, -50%) rotate(${Y}rad)`;
                                if (B) {
                                    $ = 16;
                                    ee += " scale(0.5)";
                                }
                                G = false;
                                const te =
                                    device.model == "iphonex" &&
                                        device.webview
                                        ? 20
                                        : 0;
                                W.css({
                                    left: math.clamp(
                                        J.x,
                                        $,
                                        s.screenWidth - $
                                    ),
                                    top: math.clamp(
                                        J.y,
                                        $,
                                        s.screenHeight - $ - te
                                    ),
                                    transform: ee
                                });
                                if (!U.displayed) {
                                    W.css("display", "block");
                                    U.displayed = true;
                                }
                            }
                        }
                        if (G && U.displayed) {
                            W.css("display", "none");
                            U.displayed = false;
                        }
                    }
                }
            }
        }
        for (let re = R; re < this.teamSelectors.length; re++) {
            const ae = this.teamSelectors[re];
            for (const ie in ae.indicators) {
                if (ae.indicators.hasOwnProperty(ie)) {
                    const oe = ae.indicators[ie];
                    if (oe.displayed) {
                        oe.elem.css("display", "none");
                        oe.displayed = false;
                    }
                }
            }
            if (ae.groupIdDisplayed) {
                ae.groupId.css("display", "none");
                ae.groupIdDisplayed = false;
            }
        }
        if (r.factionMode) {
            const se = o.qe(d.__id);
            if (this.flairId != se.teamId) {
                this.flairId = se.teamId;
                const ne = this.flairId == 1 ? "red" : "blue";
                this.flairElems.css({
                    display: "block",
                    "background-image": `url(../img/gui/player-patch-${ne}.svg)`
                });
            }
        }
        if (
            n > 1 &&
            this.groupPlayerCount != R &&
            device.uiLayout == device.UiLayout.Lg
        ) {
            this.groupPlayerCount = R;
            this.spectateOptionsWrapper.css({
                top:
                    this.groupPlayerCount * this.teamMemberHeight +
                    12
            });
        } else if (n == 1) {
            this.spectateOptionsWrapper.css({
                top: 12
            });
        }
        this.updatePlayerMapSprites(e, t, o, r);
        this.mapSpriteBarn.update(e, this, r);
        this.Pe.update(e, s);
        if (this.roleMenuActive) {
            this.roleMenuTicker -= e;
            const le = Math.ceil(this.roleMenuTicker);
            const ce = `${this.localization.translate(
                "game-enter-game"
            )} (${le})`;
            if (ce != this.roleMenuFooterHtml) {
                this.roleMenuFooterEnterElem.html(ce);
                this.roleMenuFooterHtml = ce;
            }
            if (
                !this.roleMenuInst &&
                this.audioManager.isSoundLoaded(
                    "ambient_lab_01",
                    "ambient"
                )
            ) {
                this.roleMenuInst = this.audioManager.playSound(
                    "ambient_lab_01",
                    {
                        channel: "ambient"
                    }
                );
            }
            if (this.roleMenuTicker <= 0) {
                this.roleSelected = this.roleDisplayed;
                this.setRoleMenuActive(false);
            }
        }
    }

    updatePlayerMapSprites(e, t, r, a) {
        const i = this;
        const o = r.qe(t.__id);
        r.getGroupInfo(o.groupId);
        r.getTeamInfo(o.teamId);
        let s = 0;
        const n = function(e, t, r, a, o, n, c) {
            if (s >= i.playerMapSprites.length) {
                const m = i.mapSpriteBarn.addSprite();
                i.playerMapSprites.push(m);
            }
            const p = i.playerMapSprites[s++];
            p.pos = v2.copy(e);
            p.scale = t;
            p.alpha = r;
            p.visible = a;
            p.zOrder = o;
            p.sprite.texture = PIXI.Texture.from(n);
            p.sprite.tint = c;
        };
        for (
            let c = Object.keys(r.playerStatus), m = 0;
            m < c.length;
            m++
        ) {
            const p = r.playerStatus[c[m]];
            const h = p.playerId;
            const d = r.qe(h);
            const g = d.groupId == o.groupId;
            let w = 65535 + h * 2;
            if (h == o.playerId) {
                w += 131070;
            }
            const f = RoleDefs[p.role];
            const _ = f?.mapIcon;
            if (_) {
                w += 65535;
            }
            let b = "player-map-inner.img";
            if (_) {
                b = f.mapIcon.alive;
            }
            if (p.dead) {
                b = "skull-outlined.img";
                if (_) {
                    b = f.mapIcon.dead;
                }
            } else if (p.downed) {
                b = g
                    ? "player-map-inner.img"
                    : "player-map-downed.img";
            }
            let x = g
                ? r.getGroupColor(h)
                : r.getTeamColor(d.teamId);
            if (a.factionMode && _) {
                x = r.getTeamColor(d.teamId);
            }
            const S = device.uiLayout == device.UiLayout.Sm ? 0.15 : 0.2;
            let v = S;
            v = g
                ? p.dead
                    ? S * 1.5
                    : _
                        ? S * 1.25
                        : S * 1
                : p.dead || p.downed || _
                    ? S * 1.25
                    : S * 0.75;
            n(p.pos, v, p.minimapAlpha, p.minimapVisible, w, b, x);
            if (g) {
                const k = device.uiLayout == device.UiLayout.Sm ? 0.25 : 0.3;
                const z = p.minimapVisible && !_;
                n(
                    p.pos,
                    k,
                    p.minimapAlpha,
                    z,
                    w - 1,
                    "player-map-outer.img",
                    16777215
                );
            }
        }
        for (
            let I = this.playerMapSprites.length - 1;
            I >= s;
            I--
        ) {
            this.playerMapSprites[I].visible = false;
        }
    }

    getMinimapMargin() {
        if (device.uiLayout == device.UiLayout.Sm) {
            return 4;
        } else {
            return 16;
        }
    }

    getMinimapSize() {
        if (device.uiLayout == device.UiLayout.Sm) {
            return 192;
        } else {
            return 256;
        }
    }

    getMinimapBorderWidth() {
        if (device.uiLayout == device.UiLayout.Sm) {
            return 1;
        } else {
            return 4;
        }
    }

    createPing(e, t, r, a, i, o) {
        const s = this;
        const n = PingDefs[e];
        if (n) {
            const c = function(e, r) {
                const a = s.mapSpriteBarn.addSprite();
                a.pos = v2.copy(t);
                a.scale = e;
                a.lifetime = n.mapLife;
                a.pulse = false;
                a.zOrder = 100;
                a.sprite.texture = PIXI.Texture.from(
                    n.mapTexture
                );
                a.sprite.tint = r;
                return a;
            };
            const m = function(e) {
                const r = s.mapSpriteBarn.addSprite();
                r.pos = v2.copy(t);
                r.scale = 0;
                r.lifetime = n.pingLife;
                r.pulse = true;
                r.zOrder = 99;
                r.sprite.texture =
                    PIXI.Texture.from("ping-map-pulse.img");
                r.sprite.tint = e;
                return r;
            };
            if (n.mapEvent) {
                c(
                    (device.uiLayout == device.UiLayout.Sm ? 0.15 : 0.2) *
                    1.5,
                    n.tint
                ).release();
                m(n.tint).release();
            } else {
                let p = 16777215;
                const h = i.qe(a);
                const d = i.qe(r);
                const g = i.Fe(r);
                if (h && d && g) {
                    p =
                        g.role == "leader"
                            ? 65280
                            : h.groupId == d.groupId
                                ? i.getGroupColor(r)
                                : i.getTeamColor(d.teamId);
                }
                this.playerPingSprites[r] ||= [];
                const w = this.playerPingSprites[r];
                for (let f = 0; f < w.length; f++) {
                    w[f].free();
                }
                const _ = device.uiLayout == device.UiLayout.Sm ? 0.15 : 0.2;
                const b = c(_, p);
                const x = m(p);
                w.push(b);
                w.push(x);
            }
        }
    }

    updateMapSprite(e, t, r, a) {
        if (e.displayed) {
            if (e.life != undefined) {
                e.life -= a;
                e.displayed = e.life > 0;
                if (e.maxLife - e.life < 0.1) {
                    t.alpha = (e.maxLife - e.life) / 0.1;
                } else if (e.life < 0.5) {
                    t.alpha = math.max(e.life / 0.5, 0);
                } else {
                    t.alpha = 1;
                }
            }
            if (e.pulse && e.displayed) {
                e.scale = e.scale + a / 2.5;
                t.scale.set(e.scale, e.scale);
            }
            t.visible = r && t.alpha > 0;
        }
    }

    je(e) {
        this.Ae.Ne(e);
    }

    getMapPosFromWorldPos(e, t) {
        const r =
            this.mapSprite.x -
            this.mapSprite.width / 2 +
            (e.x / t.width) * this.mapSprite.width;
        const a =
            this.mapSprite.y +
            this.mapSprite.height / 2 -
            (e.y / t.height) * this.mapSprite.height;
        return v2.create(r, a);
    }

    getWorldPosFromMapPos(e, t, r) {
        let a = false;
        if (this.bigmapDisplayed) {
            const i = (r.screenWidth - this.mapSprite.width) / 2;
            let o = (r.screenHeight - this.mapSprite.height) / 2;
            if (device.uiLayout == device.UiLayout.Sm && !device.isLandscape) {
                o = 0;
            }
            a =
                e.x > i &&
                e.x < r.screenWidth - i &&
                e.y > o &&
                e.y < r.screenHeight - o;
        } else if (this.minimapDisplayed) {
            const s = this.getMinimapSize();
            const n = this.getMinimapMargin();
            const l = s * this.screenScaleFactor;
            const c = (l + n) * 0.5;
            a =
                e.x > this.minimapPos.x - c &&
                e.x < this.minimapPos.x + c &&
                e.y > this.minimapPos.y - c &&
                e.y < this.minimapPos.y + c;
        }
        if (a) {
            const m = v2.create(
                this.mapSprite.x - this.mapSprite.width / 2,
                this.mapSprite.y + this.mapSprite.height / 2
            );
            const p =
                ((e.x - m.x) / this.mapSprite.width) * t.width;
            const h =
                ((m.y - e.y) / this.mapSprite.height) * t.height;
            return v2.create(p, h);
        }
        return false;
    }

    hideAll() {
        this.gameElem.css("display", "none");
    }

    showAll() {
        this.gameElem.css("display", "block");
    }

    setLocalKills(e) {
        this.playerKills.html(e);
    }

    clearUI() {
        this.Pe.stop();
        this.curAction = {
            type: Action.None
        };
        this.displayMapLarge(true);
        this.displayMiniMap();
        this.clearStatsElems();
        this.clearTeamUI();
        this.toggleEscMenu(true);
        this.toggleLocalStats(true);
        this.visibilityMode = 0;
        this.spectatorCount = 0;
        this.setLocalKills(0);
    }

    beginSpectating() {
        this.specBegin = true;
    }

    hideStats() {
        this.displayingStats = false;
        this.statsMain.css("display", "none");
        this.statsElem.stop().css({
            display: "none",
            opacity: 0
        });
        this.statsContents.stop().hide();
    }

    teamModeToString(e) {
        const t = {
            unknown: "game-rank",
            1: "game-solo-rank",
            2: "game-duo-rank",
            4: "game-squad-rank"
        };
        const r = t[e] || t.unknown;
        return this.localization.translate(r);
    }

    getTitleVictoryText(e, t) {
        if (e) {
            return `${this.spectatedPlayerName
            } ${this.localization.translate("game-won-the-game")}`;
        }
        let r = "game-chicken";
        if (t.turkeyMode) {
            r = "game-turkey";
        }
        return this.localization.translate(r);
    }

    getTitleDefeatText(e, t) {
        if (t) {
            return `${this.spectatedPlayerName
            } ${this.localization.translate("game-player-died")}.`;
        } else if (e > 1) {
            return this.localization.translate(
                "game-team-eliminated"
            );
        } else {
            return `${this.localization.translate(
                "game-You"
            )} ${this.localization.translate("game-you-died")}.`;
        }
    }

    getOverviewElems(e, t, r, a) {
        if (a) {
            const i = this.localization.translate("game-red-team");
            const o = this.localization.translate("game-blue-team");
            return `<div class="ui-stats-header-right ui-stats-header-red-team"><span class="ui-stats-header-stat">${i} </span><span class="ui-stats-header-value">${this.playersAliveRedCounter}</span></div><div class="ui-stats-header-left ui-stats-header-blue-team"><span class="ui-stats-header-stat">${o} </span><span class="ui-stats-header-value">${this.playersAliveBlueCounter}</span></div>`;
        }
        if (e == 1) {
            return `<div><span class="ui-stats-header-stat">${this.teamModeToString(
                e
            )} </span><span class="ui-stats-header-value">#${t}</span></div>`;
        } else {
            return `<div class="ui-stats-header-right"><span class="ui-stats-header-stat">${this.teamModeToString(
                e
            )} </span><span class="ui-stats-header-value">#${t}</span></div><div class="ui-stats-header-left"><span class="ui-stats-header-stat">${this.localization.translate(
                "game-team-kills"
            )} </span><span class="ui-stats-header-value">${r}</span></div>`;
        }
    }

    quitGame() {
        const e = this;
        this.game.gameOver = true;
        e.game.onQuit();
    }

    showStats(e, t, r, i, o, s, l, c, m, p, h, d) {
        const u = this;
        if (!c || t == s || o) {
            this.toggleEscMenu(true);
            this.displayingStats = true;
            this.Pe.stop();
            this.displayMapLarge(true);
            this.clearStatsElems();
            this.setSpectating(false, l);
            this.statsMain.css("display", "block");
            this.statsLogo.css("display", "block");
            this.statsContentsContainer.css({
                top: ""
            });
            this.statsInfoBox.css({
                height: ""
            });
            const w = s == i;
            const f = w ? 1750 : 2500;
            const _ = s == i || (c && i == t);
            const b = c && s != t;
            const S = _
                ? this.getTitleVictoryText(
                    b,
                    h.getMapDef().gameMode
                )
                : this.getTitleDefeatText(l, b);
            let v = 0;
            for (let k = 0; k < e.length; k++) {
                v += e[k].kills;
            }
            const z = this.getOverviewElems(
                l,
                r,
                v,
                h.getMapDef().gameMode.factionMode
            );
            const I = $("<div/>")
                .append(
                    $("<div/>", {
                        class: "ui-stats-header-title",
                        html: S
                    })
                )
                .append(
                    $("<div/>", {
                        class: "ui-stats-header-overview",
                        html: z
                    })
                );
            this.statsHeader.html(I);
            const T = function(e, t) {
                return $("<div/>", {
                    class: "ui-stats-info"
                })
                    .append(
                        $("<div/>", {
                            html: e
                        })
                    )
                    .append(
                        $("<div/>", {
                            html: t
                        })
                    );
            };
            const M =
                device.uiLayout != device.UiLayout.Sm || device.tablet ? 250 : 125;
            let P = 0;
            P -= ((e.length - 1) * M) / 2;
            P -= (e.length - 1) * 10;
            for (let C = 0; C < e.length; C++) {
                const A = e[C];
                const O = m.qe(A.playerId);
                const D = a(A.timeAlive);
                let E = "ui-stats-info-player";
                E += A.dead ? " ui-stats-info-status" : "";
                const B = (function(e) {
                    return $("<div/>", {
                        class: e
                    });
                })(E);
                B.css("left", P);
                B.append(
                    $("<div/>", {
                        class: "ui-stats-info-player-name",
                        html: helpers.htmlEscape(O.name)
                    })
                );
                B.append(
                    T(
                        this.localization.translate("game-kills"),
                        `${A.kills}`
                    )
                )
                    .append(
                        T(
                            this.localization.translate(
                                "game-damage-dealt"
                            ),
                            A.damageDealt
                        )
                    )
                    .append(
                        T(
                            this.localization.translate(
                                "game-damage-taken"
                            ),
                            A.damageTaken
                        )
                    )
                    .append(
                        T(
                            this.localization.translate(
                                "game-survived"
                            ),
                            D
                        )
                    );
                if (h.getMapDef().gameMode.factionMode && o) {
                    switch (C) {
                    case 1:
                        B.append(
                            $("<div/>", {
                                class: "ui-stats-info-player-badge ui-stats-info-player-red-leader"
                            })
                        );
                        break;
                    case 2:
                        B.append(
                            $("<div/>", {
                                class: "ui-stats-info-player-badge ui-stats-info-player-blue-leader"
                            })
                        );
                        break;
                    case 3: {
                        const R =
                                O.teamId == 1
                                    ? "ui-stats-info-player-red-ribbon"
                                    : "ui-stats-info-player-blue-ribbon";
                        B.append(
                            $("<div/>", {
                                class: `ui-stats-info-player-badge ${R}`
                            })
                        );
                    }
                    }
                }
                this.statsInfoBox.append(B);
                P += 10;
            }
            const L = $("<a/>", {
                class: "ui-stats-restart btn-green btn-darken menu-option",
                html: this.localization.translate(
                    "game-play-new-game"
                )
            });
            L.on("click", () => {
                u.quitGame();
            });
            this.statsOptions.append(L);
            if (o || this.waitingForPlayers) {
                L.css({
                    width:
                        device.uiLayout != device.UiLayout.Sm || device.tablet
                            ? 225
                            : 130
                });
            } else {
                L.css({
                    left:
                        device.uiLayout != device.UiLayout.Sm || device.tablet
                            ? -72
                            : -46
                });
                const q = $("<a/>", {
                    class: "btn-green btn-darken menu-option ui-stats-spectate",
                    html: this.localization.translate(
                        "game-spectate"
                    )
                });
                q.on("click", this.beginSpectating.bind(this));
                this.statsOptions.append(q);
            }
            let F = 0;
            const j = 250 / math.max(1, e.length);
            const N = 750 / math.max(1, e.length);
            this.statsInfoBox.children().each((e, t) => {
                const r = $(t);
                r.css("opacity", 0);
                r.delay(f + N + (F + e) * j).animate(
                    {
                        opacity: 1
                    },
                    500,
                    () => {
                        r.children().each((e, t) => {
                            $(t)
                                .delay(e * j)
                                .animate(
                                    {
                                        opacity: 1
                                    },
                                    500
                                );
                        });
                    }
                );
                r.children().each((e, t) => {
                    $(t).css("opacity", 0);
                    F++;
                });
                F++;
            });
            this.statsOptions.children().each((e, t) => {
                const r = $(t);
                r.hide();
                const a = f + N + (F + e) * j + 500;
                r.delay(a).fadeIn(500);
                F++;
            });
            this.statsElem.stop();
            this.statsElem.css("display", "block");
            this.statsElem.delay(f).animate(
                {
                    opacity: 1
                },
                1000
            );
            this.statsContents.stop();
            this.statsContents.css("display", "block");
            this.statsContents.delay(f).animate(
                {
                    opacity: 1
                },
                1000
            );
        }
    }

    clearStatsElems() {
        this.statsHeader.empty();
        this.statsInfoBox.empty();
        this.statsOptions.empty();
        this.statsAds.css("display", "none");
        this.statsContents.stop();
        this.statsContents.css({
            display: "none",
            opacity: 0
        });
        this.statsElem.stop();
        this.statsElem.css({
            display: "none",
            opacity: 0
        });
        this.statsMain.css("display", "none");
    }

    showTeamAd(e, t) {
        const r = this;
        this.toggleEscMenu(true);
        this.displayMapLarge(true);
        this.clearStatsElems();
        this.statsMain.css("display", "block");
        this.statsLogo.css("display", "none");
        this.Pe.stop();
        this.displayingStats = true;
        this.statsHeader.html(
            (function() {
                let t = r.localization.translate("game-You");
                t += " ";
                t += r.localization.translate("game-you-died");
                t += ".";
                let a = `<div><span class="ui-stats-header-stat">${r.localization.translate(
                    "game-kills"
                )} </span>`;
                a += `<span class="ui-stats-header-value">${e.kills}</span></div>`;
                return $("<div/>", {
                    class: ""
                })
                    .append(
                        $("<div/>", {
                            class: "ui-stats-header-title",
                            html: t
                        })
                    )
                    .append(
                        $("<div/>", {
                            class: "ui-stats-header-overview",
                            html: a
                        })
                    );
            })()
        );
        this.statsContentsContainer.css({
            top: "10%"
        });
        this.statsInfoBox.css({
            height: 0
        });
        const a = $("<a/>", {
            class: "ui-stats-restart btn-green btn-darken menu-option",
            html: this.localization.translate("game-play-new-game")
        });
        a.on("click", () => {
            r.quitGame();
        });
        this.statsOptions.append(a);
        a.css({
            left:
                device.uiLayout != device.UiLayout.Sm || device.tablet ? -72 : -46
        });
        const i = $("<a/>", {
            class: "btn-green btn-darken menu-option ui-stats-spectate",
            html: this.localization.translate("game-spectate")
        });
        i.on("click", this.beginSpectating.bind(this));
        this.statsOptions.append(i);
        let o = 0;
        this.statsOptions.children().each((e, t) => {
            const r = $(t);
            r.hide();
            const a = 4100 + (o + e) * 300 + 300;
            r.delay(a).fadeIn(750);
            o++;
        });
        this.statsElem.stop();
        this.statsElem.css("display", "block");
        this.statsElem.delay(2500).animate(
            {
                opacity: 1
            },
            1000
        );
        this.statsContents.stop();
        this.statsContents.css("display", "block");
        this.statsContents.delay(2500).animate(
            {
                opacity: 1
            },
            1000
        );
    }

    setSpectateTarget(e, t, r, a) {
        if (e != this.spectatedPlayerId) {
            this.setSpectating(true, r);
            const i = a.getPlayerName(e, t, false);
            this.spectatedPlayerId = e;
            this.spectatedPlayerName = helpers.htmlEscape(i);
            this.spectatedPlayerText
                .find("#spectate-player")
                .html(this.spectatedPlayerName);
            this.actionSeq = -1;
            this.Pe.stop();
        }
    }

    setSpectating(e, t) {
        if (this.spectating != e) {
            this.spectating = e;
            if (this.spectating) {
                this.spectateMode.css("display", "block");
                $(".ui-zoom").removeClass("ui-zoom-hover");
                const r = t == 1;
                this.specPrevButton.css(
                    "display",
                    r ? "none" : "block"
                );
                this.specNextButton.css(
                    "display",
                    r ? "none" : "block"
                );
                this.hideStats();
            } else {
                this.spectateMode.css("display", "none");
                $(".ui-zoom").addClass("ui-zoom-hover");
            }
        }
    }

    setLocalStats(e) {
        const t = {
            kills: this.localization.translate("game-kills"),
            damageDealt:
                this.localization.translate("game-damage-dealt"),
            damageTaken:
                this.localization.translate("game-damage-taken"),
            timeAlive: this.localization.translate("game-survived")
        };
        this.spectateModeStatsData.empty();
        for (const r in t) {
            if (t.hasOwnProperty(r)) {
                const i = t[r];
                const o = r == "timeAlive" ? a(e[r]) : e[r];
                const s = `<tr><td class="ui-spectate-stats-category">${i}</td><td class="ui-spectate-stats-value">${o}</td></tr>`;
                this.spectateModeStatsData.append(s);
            }
        }
    }

    toggleLocalStats() {
        const e =
            arguments.length > 0 &&
            arguments[0] !== undefined &&
            arguments[0];
        const t =
            this.spectateModeStats.css("display") == "none" && !e;
        this.spectateModeStats.css(
            "display",
            t ? "inline-block" : "none"
        );
        this.specStatsButton.html(
            t
                ? this.localization.translate(
                    "game-hide-match-stats"
                )
                : this.localization.translate(
                    "game-view-match-stats"
                )
        );
    }

    updatePlayersAlive(e) {
        this.playersAlive.html(e);
        this.leaderboardAlive.css("display", "block");
        this.leaderboardAliveFaction.css("display", "none");
    }

    updatePlayersAliveRed(e) {
        this.playersAliveRed.html(e);
        this.playersAliveRedCounter = e;
        this.leaderboardAlive.css("display", "none");
        this.leaderboardAliveFaction.css("display", "block");
        $("#ui-map-counter-default").css("display", "none");
        $("#ui-map-counter-faction").css("display", "inline-block");
    }

    updatePlayersAliveBlue(e) {
        this.playersAliveBlue.html(e);
        this.playersAliveBlueCounter = e;
        this.leaderboardAlive.css("display", "none");
        this.leaderboardAliveFaction.css("display", "block");
        $("#ui-map-counter-default").css("display", "none");
        $("#ui-map-counter-faction").css("display", "inline-block");
    }

    updateKillLeader(e, t, r, a) {
        const i = e != 0;
        const o = a?.sniperMode
            ? this.localization.translate("game-waiting-for-hunted")
            : this.localization.translate(
                "game-waiting-for-new-leader"
            );
        this.killLeaderName.html(i ? t : o);
        this.killLeaderCount.html(i ? r : 0);
    }

    displayMapLarge(e) {
        this.bigmapDisplayed = !e && !this.bigmapDisplayed;
        if (this.bigmapDisplayed) {
            this.container.alpha = 1;
        } else {
            this.container.alpha = this.minimapDisplayed ? 1 : 0;
        }
        let t =
            device.uiLayout == device.UiLayout.Sm
                ? ".js-ui-mobile-map-hidden"
                : "js-ui-desktop-map-hidden";
        t += ", .js-ui-map-hidden";
        $(this.visibilityMode == 2 ? ".js-ui-hud-show" : t).css(
            "display",
            this.bigmapDisplayed ? "none" : "block"
        );
        $(".js-ui-map-show").css(
            "display",
            this.bigmapDisplayed ? "block" : "none"
        );
        this.updateSpectatorCountDisplay(true);
        this.redraw(this.game.camera);
    }

    updateSpectatorCountDisplay(e) {
        const t = !this.bigmapDisplayed && this.spectatorCount > 0;
        e =
            e ||
            (this.spectatorCount > 0 &&
                !this.spectatorCounterDisplayed) ||
            (this.spectatorCount == 0 &&
                this.spectatorCounterDisplayed);
        if (this.spectatorCount != this.prevSpectatorCount) {
            this.spectatorCounter.html(this.spectatorCount);
            this.prevSpectatorCount = this.spectatorCount;
        }
        if (e) {
            this.spectatorCounterContainer.css(
                "display",
                t ? "block" : "none"
            );
            this.spectatorCounterDisplayed = t;
        }
    }

    toggleMiniMap() {
        if (this.minimapDisplayed) {
            this.hideMiniMap();
        } else {
            this.displayMiniMap();
        }
    }

    cycleVisibilityMode() {
        if (!this.bigmapDisplayed) {
            switch (this.visibilityMode) {
            case 0:
                this.hideMiniMap();
                this.visibilityMode = 1;
                break;
            case 1:
                this.displayMiniMap();
                this.visibilityMode = 0;
            }
        }
    }

    cycleHud() {
        if (this.gameElem.css("display") == "none") {
            this.gameElem.css("display", "block");
            this.displayMiniMap();
            this.hudVisible = true;
        } else {
            this.gameElem.css("display", "none");
            this.hideMiniMap();
            this.hudVisible = false;
        }
    }

    hideMiniMap() {
        if (!this.bigmapDisplayed) {
            this.minimapDisplayed = false;
            this.container.alpha = 0;
            this.mapInfo.css("bottom", "auto");
            this.spectatorCounterContainer.css({
                bottom: 6,
                left: 98
            });
        }
    }

    displayMiniMap() {
        if (!this.bigmapDisplayed) {
            const e = device.uiLayout == device.UiLayout.Sm;
            this.minimapDisplayed = true;
            this.container.alpha = 1;
            this.mapInfo.css("bottom", this.mapInfoBottom);
            this.spectatorCounterContainer.css({
                bottom: e ? 0 : 218,
                left: e ? 0 : 6
            });
        }
    }

    displayAnnouncement(e) {
        const t = this;
        if (e) {
            this.announcement.html(e);
            this.announcement.fadeIn(400, () => {
                setTimeout(() => {
                    t.announcement.fadeOut(800);
                }, 3000);
            });
        }
    }

    displayGasAnnouncement(e, t) {
        let r = "";
        switch (e) {
        case GasMode.Waiting: {
            r = this.localization.translate(
                "game-red-zone-advances"
            );
            const a = Math.floor(t / 60);
            const i = t - a * 60;
            r +=
                    a > 1
                        ? ` ${a} ${this.localization.translate(
                            "game-minutes"
                        )}`
                        : "";
            r +=
                    a == 1
                        ? ` ${a} ${this.localization.translate(
                            "game-minute"
                        )}`
                        : "";
            r +=
                    i > 0
                        ? ` ${Math.floor(
                            i
                        )} ${this.localization.translate(
                            "game-seconds"
                        )}`
                        : "";
            break;
        }
        case GasMode.Moving:
            r = this.localization.translate(
                "game-red-zone-advancing"
            );
        }
        this.displayAnnouncement(r);
    }

    setWaitingForPlayers(e) {
        this.waitingForPlayers = e;
        this.waitingText.css("display", e ? "block" : "none");
    }

    render(e, t, r, a, i, o) {
        const s = t.getCircle();
        const n = this.getMapPosFromWorldPos(s.pos, a);
        const l = this.getMapPosFromWorldPos(
            v2.add(s.pos, v2.create(s.rad, 0)),
            a
        );
        const c = v2.length(v2.sub(l, n));
        this.gasRenderer.render(n, c, t.isActive());
        const m = t.circleNew;
        const p = this.getMapPosFromWorldPos(m.pos, a);
        const h = this.getMapPosFromWorldPos(
            v2.add(m.pos, v2.create(m.rad, 0)),
            a
        );
        const d = v2.length(v2.sub(h, p));
        const g = this.getMapPosFromWorldPos(e, a);
        const y = t.isActive();
        const w = t.isActive() && !this.bigmapDisplayed;
        this.gasSafeZoneRenderer.render(p, d, g, y, w);
        i.renderAirstrikeZones(this, a, o);
    }

    updateHealthBar(e, t, r, a) {
        const i = e;
        let s = a.health * 0.01 * i;
        s = a.dead ? 0 : math.max(s, 1);
        t.css("width", s);
        if (s > 0) {
            r?.css("width", s);
        }
        const n = a.health;
        let l = this.healthRed;
        let c = this.healthDarkpink;
        if (n > 25) {
            if (a.downed) {
                t.css({
                    backgroundColor: "red"
                });
            } else {
                if (math.eqAbs(n, 100, 0.2)) {
                    l = this.healthGrey;
                    c = this.healthGrey;
                } else if (math.eqAbs(n, 75, 0.2) || n >= 75) {
                    l = this.healthWhite;
                    c = this.healthWhite;
                } else {
                    l = this.healthDarkpink;
                    c = this.healthLightpink;
                }
                const m = l.getColors();
                const p = c.getColors();
                const h = o(m.r, p.r, 45, n);
                const d = o(m.g, p.g, 45, n);
                const u = o(m.b, p.b, 45, n);
                t.css({
                    backgroundColor: `rgba(${h},${d},${u},1)`
                });
            }
            t.removeClass("ui-bar-danger");
        } else {
            t.addClass("ui-bar-danger");
        }
    }

    updateTeam(e, t, r, a, i, o, s) {
        const n = this.teamSelectors[e].groupId;
        const l = this.teamSelectors[e].teamName;
        const c = this.teamSelectors[e].prevHealth;
        const m = this.teamSelectors[e].prevStatus;
        const p =
            a.dead != m.dead ||
            a.disconnected != m.disconnected ||
            a.downed != m.downed ||
            a.role != m.role;
        if (this.teamSelectors[e].playerId != i || r != c || p) {
            const h = this.teamSelectors[e].teamStatus;
            const d = this.teamSelectors[e].teamHealthInner;
            this.teamSelectors[e].playerId = i;
            this.teamSelectors[e].teamNameHtml = t;
            l.html(t);
            this.updateHealthBar(
                this.teamMemberHealthBarWidth,
                d,
                null,
                {
                    health: r,
                    dead: a.dead,
                    downed: a.downed
                }
            );
            if (p) {
                h.attr("class", "ui-team-member-status");
                if (a.disconnected) {
                    h.addClass(
                        "ui-team-member-status-disconnected"
                    );
                } else if (a.dead) {
                    h.addClass("ui-team-member-status-dead");
                } else if (a.downed) {
                    h.addClass(
                        "ui-team-member-status-downed"
                    ).addClass("icon-pulse");
                }
                l.css(
                    "opacity",
                    a.disconnected || a.dead ? 0.3 : 1
                );
            }
            n.css("display", "block");
            this.teamSelectors[e].prevStatus = a;
            this.teamSelectors[e].prevHealth = r;
        }
    }

    clearTeamUI() {
        $(".ui-team-member").css("display", "none");
        $(".ui-team-indicator").css("display", "none");
        $(".ui-team-member-name").removeAttr("style");
        $(".ui-team-member-status").removeAttr("style");
        $(".ui-team-member-status").removeClass(
            "ui-team-member-status-downed ui-team-member-status-dead ui-team-member-status-disconnected icon-pulse"
        );
        this.teamSelectors = [];
    }

    resize(e, t) {
        this.screenScaleFactor =
            device.uiLayout == device.UiLayout.Sm
                ? 0.5626
                : math.min(
                    1,
                    math.clamp(t.screenWidth / 1280, 0.75, 1) *
                    math.clamp(t.screenHeight / 1024, 0.75, 1)
                );
        this.Pe.resize(this.touch, this.screenScaleFactor);
        this.gasRenderer.resize();
        this.mapSprite.texture = e.getMapTexture();
        const r = math.min(
            1,
            math.min(t.screenWidth / 1200, t.screenHeight / 900)
        );
        this.roleMenuElem.css(
            "transform",
            `translateX(-50%) translateY(-50%) scale(${r})`
        );
        this.redraw(t);
    }

    redraw(e) {
        const t = e.screenWidth;
        const r = e.screenHeight;
        const a = this.getMinimapMargin();
        let i = 0;
        let o = 0;
        if (device.model == "iphonex") {
            if (device.isLandscape) {
                i += 28;
            } else {
                o += 32;
            }
        }
        const s = this.getMinimapSize();
        const n = this.getMinimapBorderWidth();
        const l = device.uiLayout == device.UiLayout.Sm;
        this.display.border.clear();
        this.container.mask.clear();
        if (this.bigmapDisplayed) {
            const c = math.min(t, r);
            this.mapSprite.width = c;
            this.mapSprite.height = c;
            this.mapSprite.x = t / 2;
            this.mapSprite.y = r / 2;
            this.mapSprite.alpha = 1;
            this.container.mask.beginFill(16777215, 1);
            this.container.mask.drawRect(
                this.mapSprite.x - this.mapSprite.width / 2,
                this.mapSprite.y - this.mapSprite.height / 2,
                this.mapSprite.width,
                this.mapSprite.height
            );
            this.container.mask.endFill();
            if (device.touch) {
                this.bigmapCollision.css({
                    width: r,
                    height: t
                });
            }
        } else {
            const m = (this.screenScaleFactor * 1600) / 1.2;
            const p = s * this.screenScaleFactor;
            this.mapSprite.width = m;
            this.mapSprite.height = m;
            this.mapSprite.alpha = 0.8;
            let h = {
                zoom: this.screenScaleFactor
            };
            if (document.body) {
                if ("WebkitTransform" in document.body.style) {
                    h = {
                        "-webkit-transform": `scale(${this.screenScaleFactor})`
                    };
                } else if ("transform" in document.body.style) {
                    h = {
                        transform: `scale(${this.screenScaleFactor})`
                    };
                }
            }
            this.mapContainer.css(h);
            this.mapContainer.css(
                "bottom",
                this.mapContainerBottom * this.screenScaleFactor
            );
            const d = l ? p / 2 + a : r - p / 2 - a;
            this.minimapPos.x = a + p / 2 + i;
            this.minimapPos.y = d + o;
            this.display.border.lineStyle(n, 0);
            this.display.border.beginFill(0, 0);
            const u = l ? a + n / 2 : r - p - a + n / 2;
            this.display.border.drawRect(
                a + n / 2 + i,
                u + o,
                p - n,
                p - n
            );
            this.display.border.endFill();
            const w = l ? a : r - p - a;
            this.container.mask.beginFill(16777215, 1);
            this.container.mask.drawRect(a + i, w - 0.5 + o, p, p);
            this.container.mask.endFill();
        }
    }

    toggleEscMenu() {
        const e = this;
        const t =
            arguments.length > 0 &&
            arguments[0] !== undefined &&
            arguments[0];
        if (!this.displayingStats) {
            if (this.escMenuDisplayed || t) {
                this.escMenuDisplayed = false;
                this.escMenuElem.css("display", "none");
                this.setCurrentGameTab("settings");
                $("#ui-center").off("mouseenter mouseleave");
                this.inputBinds.menuHovered = false;
                if (this.roleMenuActive) {
                    this.displayRoleMenu();
                }
            } else if (this.bigmapDisplayed) {
                this.displayMapLarge(true);
            } else {
                if (this.visibilityMode == 2) {
                    this.cycleVisibilityMode();
                }
                this.escMenuDisplayed = true;
                this.escMenuElem.css("display", "block");
                $("#ui-center").hover(
                    () => {
                        e.inputBinds.menuHovered = true;
                    },
                    () => {
                        e.inputBinds.menuHovered = false;
                    }
                );
                this.inputBinds.menuHovered = false;
                if (this.roleMenuActive) {
                    this.hideRoleMenu();
                }
            }
        }
    }

    setCurrentGameTab(e) {
        this.currentGameTab = e;
        this.gameTabs.css("display", "none");
        this.gameTabBtns.removeClass("btn-game-menu-selected");
        $(`#ui-game-tab-${this.currentGameTab}`).css(
            "display",
            "block"
        );
        $(`#btn-game-${this.currentGameTab}`).addClass(
            "btn-game-menu-selected"
        );
        if (this.currentGameTab == "keybinds") {
            this.inputBindUi.refresh();
        } else {
            this.inputBindUi.cancelBind();
        }
    }

    setRoleMenuActive(e) {
        this.roleMenuActive = e;
        if (this.roleMenuActive) {
            this.roleMenuTicker = 20;
            this.displayRoleMenu();
        } else {
            if (this.roleMenuInst) {
                this.audioManager.stopSound(this.roleMenuInst);
                this.roleMenuInst = null;
            }
            this.hideRoleMenu();
        }
    }

    displayRoleMenu() {
        this.roleMenuElemWrapper.css("display", "block");
    }

    hideRoleMenu() {
        this.roleMenuElemWrapper.css("display", "none");
    }

    setRoleMenuOptions(e, t) {
        const r = this;
        $("#ui-role-header").html("");
        for (let a = 0; a < t.length; a++) {
            const i = t[a];
            const o = GameObjectDefs[i];
            const s = $("<div/>", {
                class: "ui-role-option",
                "data-role": i
            });
            s.css({
                "background-image": `url('${o.guiImg}')`
            });
            $("#ui-role-header").append(s);
        }
        $(".ui-role-option").on("click", (e) => {
            e.stopPropagation();
            const t = $(e.currentTarget);
            r.setRoleMenuInfo(t.data("role"));
        });
        let l = t[0];
        if (t.indexOf(e) !== -1) {
            l = e;
        }
        this.setRoleMenuInfo(l);
    }

    setRoleMenuInfo(e) {
        const t = GameObjectDefs[e];
        $(".ui-role-option").css({
            "background-size": 132,
            opacity: 0.5
        });
        $("#ui-role-header").find(`[data-role=${e}]`).css({
            "background-size": 164,
            opacity: 1
        });
        const r = $("<div/>", {
            class: "ui-role-body-left"
        });
        const a = $("<div/>", {
            class: "ui-role-body-name"
        });
        const i = $("<div/>", {
            class: "ui-role-body-image"
        });
        const o = this.localization.translate(`game-${e}`);
        a.html(o);
        i.css({
            "background-image": `url('${t.guiImg}')`
        });
        const s = t.color ? helpers.colorToHexString(t.color) : "default";
        this.roleMenuElem.css("border-color", s);
        r.append(a).append(i);
        const l = $("<div/>", {
            class: "ui-role-body-right"
        });
        for (let c = t.perks, m = 0; m < c.length; m++) {
            const p = c[m];
            const h = $("<div/>", {
                class: "ui-role-body-perk"
            });
            const d = $("<div/>", {
                class: "ui-role-body-perk-image-wrapper"
            }).append(
                $("<div/>", {
                    class: "ui-role-body-perk-image-icon"
                })
            );
            const u = $("<div/>", {
                class: "ui-role-body-perk-name"
            });
            const g = helpers.getSvgFromGameType(p);
            d.find(".ui-role-body-perk-image-icon").css({
                "background-image": `url('${g}')`
            });
            const y = this.localization.translate(`game-${p}`);
            u.html(y);
            h.append(d).append(u);
            l.append(h);
        }
        $("#ui-role-body").html("").append(r).append(l);
        this.roleDisplayed = e;
    }
}

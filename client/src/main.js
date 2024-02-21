import helpers from "./helpers";
// o.getParameterByName("debug") || (console.log = function () {});
import $ from "jquery";
import * as PIXI from "pixi.js";

// PIXI.utils.skipHello();
import { GameConfig } from "../../shared/gameConfig";
import { math } from "../../shared/utils/math";

import net from "../../shared/net";
import Account from "./account";
import Api from "./api";
import Ambiance from "./ambiance";
import AudioManager from "./audioManager";
import Device from "./device";
import ConfigManager from "./config";
import "./webview";
// import "./emote";
import FirebaseManager from "./firebaseManager";
import { Game } from "./game";
import Input from "./input";
import InputBinds from "./inputBinds";
import Ui2 from "./ui2";
import OpponentDisplay from "./opponentDisplay";
import LoadoutMenu from "./loadoutMenu";
import Localization from "./localization";
import Menu from "./menu";
import MenuModal from "./menuModal";
import Pass from "./pass";
import PingTest from "./pingTest";
import ProfileUi from "./ProfileUi";
import Resources from "./resources";
import SiteInfo from "./siteInfo";
import TeamMenu from "./teamMenu";

function i() {
    App.domContentLoaded = true;
    App.Qr();
}

class Application {
    constructor() {
        const e = this;
        this.nameInput = $("#player-name-input-solo");
        this.serverSelect = $("#server-select-main");
        this.playMode0Btn = $("#btn-start-mode-0");
        this.playMode1Btn = $("#btn-start-mode-1");
        this.playMode2Btn = $("#btn-start-mode-2");
        this.muteBtns = $(".btn-sound-toggle");
        this.aimLineBtn = $("#btn-game-aim-line");
        this.masterSliders = $(".sl-master-volume");
        this.soundSliders = $(".sl-sound-volume");
        this.musicSliders = $(".sl-music-volume");
        this.serverWarning = $("#server-warning");
        this.languageSelect = $(".language-select");
        this.startMenuWrapper = $("#start-menu-wrapper");
        this.gameAreaWrapper = $("#game-area-wrapper");
        this.playButtons = $(".play-button-container");
        this.playLoading = $(".play-loading-outer");
        this.errorModal = new MenuModal($("#modal-notification"));
        this.refreshModal = new MenuModal($("#modal-refresh"));
        this.config = new ConfigManager();
        this.localization = new Localization();
        this.account = new Account(this.config);
        this.loadoutMenu = new LoadoutMenu(
            this.account,
            this.localization
        );
        this.pass = new Pass(
            this.account,
            this.loadoutMenu,
            this.localization
        );
        this.profileUi = new ProfileUi(
            this.account,
            this.localization,
            this.loadoutMenu,
            this.errorModal
        );
        this.pingTest = new PingTest();
        this.siteInfo = new SiteInfo(this.config, this.localization);
        this.audioManager = new AudioManager();
        this.ambience = new Ambiance();
        this.teamMenu = new TeamMenu(
            this.config,
            this.pingTest,
            this.siteInfo,
            this.localization,
            this.audioManager,
            this.onTeamMenuJoinGame.bind(this),
            this.onTeamMenuLeave.bind(this)
        );
        this.pixi = null;
        this.resourceManager = null;
        this.input = null;
        this.inputBinds = null;
        this.inputBindUi = null;
        this.game = null;
        this.loadoutDisplay = null;
        this.domContentLoaded = false;
        this.configLoaded = false;
        this.initialized = false;
        this.active = false;
        this.sessionId = helpers.random64();
        this.contextListener = function(e) {
            e.preventDefault();
        };
        this.errorMessage = "";
        this.quickPlayPendingModeIdx = -1;
        this.findGameAttempts = 0;
        this.findGameTime = 0;
        this.pauseTime = 0;
        this.wasPlayingVideo = false;
        this.checkedPingTest = false;
        this.hasFocus = true;
        this.newsDisplayed = false;
        const t = function() {
            e.config.load(() => {
                e.configLoaded = true;
                e.Qr();
            });
        };
        if (Device.webview && Device.version > "1.0.0") {
            this.loadWebviewDeps(t);
        } else {
            this.loadBrowserDeps(t);
        }
    }

    loadBrowserDeps(e) {
        e();
    }

    loadWebviewDeps(e) {
        const t = this;
        document.addEventListener(
            "deviceready",
            () => {
                document.addEventListener("pause", () => {
                    t.onPause();
                });
                document.addEventListener("resume", () => {
                    t.onResume();
                });
                e();
            },
            false
        );
        (function(e, t, r) {
            let a;
            const i =
                Device.version >= "1.0.8"
                    ? `cordova/${Device.version}`
                    : "cordova";
            const o = `${i}/${Device.os}/cordova.js`;
            const s = e.getElementsByTagName(t)[0];
            if (!e.getElementById(r)) {
                a = e.createElement(t);
                a.id = r;
                a.onload = function() { };
                a.src = o;
                s.parentNode.insertBefore(a, s);
            }
        })(document, "script", "cordova-js");
    }

    Qr() {
        const e = this;
        if (
            this.domContentLoaded &&
            this.configLoaded &&
            !this.initialized
        ) {
            this.initialized = true;
            this.config.teamAutoFill = true;
            if (Device.webview) {
                Menu.applyWebviewStyling(Device.tablet);
            } else if (Device.mobile) {
                Menu.applyMobileBrowserStyling(Device.tablet);
            }
            const t =
                this.config.get("language") ||
                this.localization.detectLocale();
            this.config.set("language", t);
            this.localization.setLocale(t);
            this.localization.populateLanguageSelect();
            this.startPingTest();
            this.siteInfo.load();
            this.localization.localizeIndex();
            this.account.init();

            this.nameInput.maxLength = net.Constants.PlayerNameMaxLen;
            this.playMode0Btn.on("click", () => {
                e.tryQuickStartGame(0);
            });
            this.playMode1Btn.on("click", () => {
                e.tryQuickStartGame(1);
            });
            this.playMode2Btn.on("click", () => {
                e.tryQuickStartGame(2);
            });
            this.serverSelect.change(() => {
                const t = e.serverSelect.find(":selected").val();
                e.config.set("region", t);
            });
            this.nameInput.on("blur", (t) => {
                e.setConfigFromDOM();
            });
            this.muteBtns.on("click", (t) => {
                e.config.set(
                    "muteAudio",
                    !e.config.get("muteAudio")
                );
            });
            this.muteBtns.on("mousedown", (e) => {
                e.stopPropagation();
            });
            $(this.masterSliders).on("mousedown", (e) => {
                e.stopPropagation();
            });
            $(this.soundSliders).on("mousedown", (e) => {
                e.stopPropagation();
            });
            $(this.musicSliders).on("mousedown", (e) => {
                e.stopPropagation();
            });
            this.masterSliders.on("input", (t) => {
                const r = $(t.target).val() / 100;
                e.audioManager.setMasterVolume(r);
                e.config.set("masterVolume", r);
            });
            this.soundSliders.on("input", (t) => {
                const r = $(t.target).val() / 100;
                e.audioManager.setSoundVolume(r);
                e.config.set("soundVolume", r);
            });
            this.musicSliders.on("input", (t) => {
                const r = $(t.target).val() / 100;
                e.audioManager.setMusicVolume(r);
                e.config.set("musicVolume", r);
            });
            $(".modal-settings-item")
                .children("input")
                .each((t, r) => {
                    const a = $(r);
                    a.prop("checked", e.config.get(a.prop("id")));
                });
            $(".modal-settings-item > input:checkbox").change(
                (t) => {
                    const r = $(t.target);
                    e.config.set(r.prop("id"), r.is(":checked"));
                }
            );
            $(".btn-fullscreen-toggle").on("click", () => {
                helpers.toggleFullScreen();
            });
            this.languageSelect.on("change", (t) => {
                const r = t.target.value;
                if (r) {
                    e.config.set("language", r);
                }
            });
            $("#btn-create-team").on("click", () => {
                e.tryJoinTeam(true);
            });
            $("#btn-team-mobile-link-join").on("click", () => {
                let t = $("#team-link-input").val().trim();
                const r = t.indexOf("#");
                if (r >= 0) {
                    t = t.slice(r + 1);
                }
                if (t.length > 0) {
                    $("#team-mobile-link").css("display", "none");
                    e.tryJoinTeam(false, t);
                } else {
                    $("#team-mobile-link-desc").css(
                        "display",
                        "none"
                    );
                    $("#team-mobile-link-warning")
                        .css("display", "none")
                        .fadeIn(100);
                }
            });
            $("#btn-team-leave").on("click", () => {
                if (window.history) {
                    window.history.replaceState("", "", "/");
                }
                e.game?.n();
                e.teamMenu.leave();
            });
            const r = $("#news-current").data("date");
            const a = new Date(r).getTime();
            $(".right-column-toggle").on("click", () => {
                if (e.newsDisplayed) {
                    $("#news-wrapper").fadeOut(250);
                    $("#pass-wrapper").fadeIn(250);
                } else {
                    e.config.set("lastNewsTimestamp", a);
                    $(".news-toggle")
                        .find(".account-alert")
                        .css("display", "none");
                    $("#news-wrapper").fadeIn(250);
                    $("#pass-wrapper").fadeOut(250);
                }
                e.newsDisplayed = !e.newsDisplayed;
            });
            const i = this.config.get("lastNewsTimestamp");
            if (a > i) {
                $(".news-toggle")
                    .find(".account-alert")
                    .css("display", "block");
            }
            this.setDOMFromConfig();
            this.setAppActive(true);
            const l = document.getElementById("cvs");
            const c = window.devicePixelRatio > 1 ? 2 : 1;
            if (Device.os == "ios") {
                PIXI.settings.PRECISION_FRAGMENT = "highp";
            }
            const p = function(e) {
                return new PIXI.Application({
                    width: window.innerWidth,
                    height: window.innerHeight,
                    view: l,
                    antialias: false,
                    resolution: c,
                    forceCanvas: e
                });
            };
            let h = null;
            try {
                h = p(false);
            } catch (e) {
                h = p(true);
            }
            this.pixi = h;
            this.pixi.renderer.plugins.interaction.destroy();
            this.pixi.ticker.add(this.update, this);
            this.pixi.renderer.backgroundColor = 7378501;
            this.resourceManager = new Resources.ResourceManager(
                this.pixi.renderer,
                this.audioManager,
                this.config
            );
            this.resourceManager.loadMapAssets("main");
            this.input = new Input.Qe(
                document.getElementById("game-touch-area")
            );
            this.inputBinds = new InputBinds.InputBinds(
                this.input,
                this.config
            );
            this.inputBindUi = new InputBinds.InputBindUi(
                this.input,
                this.inputBinds
            );
            const onJoin = function() {
                e.loadoutDisplay.n();
                e.game.o();
                e.onResize();
                e.findGameAttempts = 0;
                e.ambience.onGameStart();
            };
            const onQuit = function(t) {
                if (e.game.updatePass) {
                    e.pass.scheduleUpdatePass(
                        e.game.updatePassDelay
                    );
                }
                e.game.n();
                e.errorMessage = e.localization.translate(t || "");
                e.teamMenu.onGameComplete();
                e.ambience.onGameComplete(e.audioManager);
                e.setAppActive(true);
                e.setPlayLockout(false);
                e.loadoutMenu.resetAdRefresh();
                if (t == "index-invalid-protocol") {
                    e.showInvalidProtocolModal();
                }
            };
            this.game = new Game(
                this.pixi,
                this.audioManager,
                this.localization,
                this.config,
                this.input,
                this.inputBinds,
                this.inputBindUi,
                this.ambience,
                this.resourceManager,
                onJoin,
                onQuit
            );
            this.loadoutDisplay = new OpponentDisplay.LoadoutDisplay(
                this.pixi,
                this.audioManager,
                this.config,
                this.inputBinds,
                this.account
            );
            this.loadoutMenu.loadoutDisplay = this.loadoutDisplay;
            this.onResize();
            this.tryJoinTeam(false);
            Menu.setupModals(this.inputBinds, this.inputBindUi);
            this.onConfigModified();
            this.config.addModifiedListener(
                this.onConfigModified.bind(this)
            );
            Ui2.loadStaticDomImages();
        }
    }

    onUnload() {
        this.teamMenu.leave();
    }

    onResize() {
        Device.onResize();
        Menu.onResize();
        this.loadoutMenu.onResize();
        this.pixi?.renderer.resize(Device.screenWidth, Device.screenHeight);
        if (this.game?.initialized) {
            this.game.xr();
        }
        if (this.loadoutDisplay?.initialized) {
            this.loadoutDisplay.xr();
        }
        this.refreshUi();
    }

    onPause() {
        if (Device.webview) {
            this.pauseTime = Date.now();
            this.audioManager.setMute(true);
            if (Device.os == "ios") {
                this.pixi?.ticker.remove(
                    this.pixi.render,
                    this.pixi
                );
            }
        }
    }

    onResume() {
        if (Device.webview) {
            if (
                this.game?.playing &&
                Date.now() - this.pauseTime > 30000
            ) {
                window.location.reload(true);
            } else {
                this.audioManager.setMute(
                    this.config.get("muteAudio")
                );
            }
            if (Device.os == "ios") {
                this.pixi?.ticker.add(
                    this.pixi.render,
                    this.pixi,
                    PIXI.UPDATE_PRIORITY.LOW
                );
            }
        }
    }

    startPingTest() {
        const e = this.config.get("regionSelected")
            ? [this.config.get("region")]
            : this.pingTest.getRegionList();
        this.pingTest.start(e);
    }

    setAppActive(e) {
        this.active = e;
        this.quickPlayPendingModeIdx = -1;
        this.refreshUi();
        if (e) {
            this.errorModal.hide();
        }
    }

    setPlayLockout(e) {
        const t = this;
        const r = e ? 0 : 1000;
        this.playButtons
            .stop()
            .delay(r)
            .animate(
                {
                    opacity: e ? 0.5 : 1
                },
                250
            );
        this.playLoading
            .stop()
            .delay(r)
            .animate(
                {
                    opacity: e ? 1 : 0
                },
                {
                    duration: 250,
                    start: function() {
                        t.playLoading.css({
                            "pointer-events": e ? "initial" : "none"
                        });
                    }
                }
            );
    }

    onTeamMenuJoinGame(e) {
        const t = this;
        this.waitOnAccount(() => {
            t.joinGame(e);
        });
    }

    onTeamMenuLeave(e) {
        if (e && e != "" && window.history) {
            window.history.replaceState("", "", "/");
        }
        this.errorMessage = e;
        this.setDOMFromConfig();
        this.refreshUi();
    }

    setConfigFromDOM() {
        const e = helpers.sanitizeNameInput(this.nameInput.val());
        this.config.set("playerName", e);
        const t = this.serverSelect.find(":selected").val();
        this.config.set("region", t);
    }

    setDOMFromConfig() {
        const e = this;
        this.nameInput.val(this.config.get("playerName"));
        this.serverSelect.find("option").each((t, r) => {
            r.selected = r.value == e.config.get("region");
        });
        this.languageSelect.val(this.config.get("language"));
    }

    onConfigModified(e) {
        const t = this.config.get("muteAudio");
        if (t != this.audioManager.mute) {
            this.muteBtns.removeClass(
                t ? "audio-on-icon" : "audio-off-icon"
            );
            this.muteBtns.addClass(
                t ? "audio-off-icon" : "audio-on-icon"
            );
            this.audioManager.setMute(t);
        }
        const r = this.config.get("masterVolume");
        this.masterSliders.val(r * 100);
        this.audioManager.setMasterVolume(r);
        const a = this.config.get("soundVolume");
        this.soundSliders.val(a * 100);
        this.audioManager.setSoundVolume(a);
        const i = this.config.get("musicVolume");
        this.musicSliders.val(i * 100);
        this.audioManager.setMusicVolume(i);
        if (e == "language") {
            const o = this.config.get("language");
            this.localization.setLocale(o);
        }
        if (e == "region") {
            this.config.set("regionSelected", true);
            this.startPingTest();
        }
        if (e == "highResTex") {
            location.reload();
        }
    }

    refreshUi() {
        const e = this;
        this.startMenuWrapper.css(
            "display",
            this.active ? "flex" : "none"
        );
        this.gameAreaWrapper.css({
            display: this.active ? "none" : "block",
            opacity: this.active ? 0 : 1
        });
        if (this.active) {
            $("body").removeClass("user-select-none");
            document.removeEventListener(
                "contextmenu",
                this.contextListener
            );
        } else {
            $("body").addClass("user-select-none");
            $("#start-main").stop(true);
            document.addEventListener(
                "contextmenu",
                this.contextListener
            );
        }
        $("#ad-block-left").css(
            "display",
            !Device.isLandscape && this.teamMenu.active
                ? "none"
                : "block"
        );
        const t = this.active && this.errorMessage != "";
        this.serverWarning.css({
            display: "block",
            opacity: t ? 1 : 0
        });
        this.serverWarning.html(this.errorMessage);
        const r = function(t, r) {
            t.html(
                e.quickPlayPendingModeIdx === r
                    ? '<div class="ui-spinner"></div>'
                    : e.localization.translate(t.data("l10n"))
            );
        };
        r(this.playMode0Btn, 0);
        r(this.playMode1Btn, 1);
        r(this.playMode2Btn, 2);
    }

    waitOnAccount(e) {
        const t = this;
        if (this.account.requestsInFlight == 0) {
            e();
        } else {
            Date.now();
            const r = setTimeout(() => {
                a();
                FirebaseManager.storeGeneric("account", "wait_timeout");
            }, 2500);
            var a = function a() {
                e();
                clearTimeout(r);
                t.account.removeEventListener(
                    "requestsComplete",
                    a
                );
            };
            this.account.addEventListener("requestsComplete", a);
        }
    }

    tryJoinTeam(e, t) {
        if (this.active && this.quickPlayPendingModeIdx === -1) {
            const r = t || window.location.hash.slice(1);
            if (e || r != "") {
                this.setConfigFromDOM();
                this.teamMenu.connect(e, r);
                this.refreshUi();
            }
        }
    }

    tryQuickStartGame(e) {
        const t = this;
        if (this.quickPlayPendingModeIdx === -1) {
            this.errorMessage = "";
            this.quickPlayPendingModeIdx = e;
            this.setConfigFromDOM();
            this.refreshUi();
            let r = 0;
            if (
                this.findGameAttempts > 0 &&
                Date.now() - this.findGameTime < 30000
            ) {
                r = Math.min(
                    this.findGameAttempts * 2.5 * 1000,
                    7500
                );
            } else {
                this.findGameAttempts = 0;
            }
            this.findGameTime = Date.now();
            this.findGameAttempts++;
            const a = GameConfig.protocolVersion;
            let i = this.config.get("region");
            const s = helpers.getParameterByName("region");
            if (s !== undefined && s.length > 0) {
                i = s;
            }
            let n = this.pingTest.getZones(i);
            const c = helpers.getParameterByName("zone");
            if (c !== undefined && c.length > 0) {
                n = [c];
            }
            const m = {
                version: a,
                region: i,
                zones: n,
                playerCount: 1,
                autoFill: true,
                gameModeIdx: e
            };
            const p = function() {
                t.waitOnAccount(() => {
                    t.findGame(m, (e, r) => {
                        if (e) {
                            t.onJoinGameError(e);
                            return;
                        }
                        t.joinGame(r);
                    });
                });
            };
            if (r == 0) {
                p();
            } else {
                setTimeout(() => {
                    p();
                }, r);
            }
        }
    }

    findGame(e, t) {
        (function r(a, i) {
            if (a >= i) {
                t("full");
                return;
            }
            const o = function() {
                setTimeout(() => {
                    r(a + 1, i);
                }, 500);
            };
            $.ajax({
                type: "POST",
                url: Api.resolveUrl("/api/find_game"),
                data: JSON.stringify(e),
                contentType: "application/json; charset=utf-8",
                timeout: 10000,
                success: function(e) {
                    if (e?.err && e.err != "full") {
                        t(e.err);
                        return;
                    }
                    const r = e?.res ? e.res[0] : null;
                    if (r?.hosts && r.addrs) {
                        t(null, r);
                    } else {
                        o();
                    }
                },
                error: function(e) {
                    o();
                }
            });
        })(0, 2);
    }

    joinGame(e) {
        const t = this;
        if (!this.game) {
            setTimeout(() => {
                t.joinGame(e);
            }, 250);
            return;
        }
        for (
            var r = e.hosts || [], a = [], i = 0;
            i < r.length;
            i++
        ) {
            a.push(
                `ws${e.useHttps ? "s" : ""}://${r[i]}/play?gameId=${e.gameId
                }`
            );
        }
        (function e(r, a) {
            const i = r.shift();
            if (!i) {
                t.onJoinGameError("join_game_failed");
                return;
            }
            console.log("Joining", i, a.zone);
            const o = function() {
                e(r, a);
            };
            t.game.vt(
                i,
                a.data,
                t.account.loadoutPriv,
                t.account.questPriv,
                o
            );
        })(a, e);
    }

    onJoinGameError(e) {
        const t = {
            full: this.localization.translate(
                "index-failed-finding-game"
            ),
            invalid_protocol: this.localization.translate(
                "index-invalid-protocol"
            ),
            join_game_failed: this.localization.translate(
                "index-failed-joining-game"
            )
        };
        if (e == "invalid_protocol") {
            this.showInvalidProtocolModal();
        }
        this.errorMessage = t[e] || t.full;
        this.quickPlayPendingModeIdx = -1;
        this.teamMenu.leave("join_game_failed");
        this.refreshUi();
    }

    showInvalidProtocolModal() {
        this.refreshModal.show(true);
    }

    update() {
        const e = math.clamp(
            this.pixi.ticker.elapsedMS / 1000,
            0.001,
            1 / 8
        );
        this.pingTest.update(e);
        if (!this.checkedPingTest && this.pingTest.isComplete()) {
            if (!this.config.get("regionSelected")) {
                const t = this.pingTest.getRegion();
                if (t) {
                    this.config.set("region", t);
                    this.setDOMFromConfig();
                }
            }
            this.checkedPingTest = true;
        }
        this.resourceManager.update(e);
        this.audioManager.m(e);
        this.ambience.update(e, this.audioManager, !this.active);
        this.teamMenu.update(e);

        if (this.game?.initialized && this.game.playing) {
            if (this.active) {
                this.setAppActive(false);
                this.setPlayLockout(true);
            }
            this.game.m(e);
        }
        if (
            this.active &&
            this.loadoutDisplay &&
            this.game &&
            !this.game.initialized
        ) {
            if (this.loadoutMenu.active) {
                if (!this.loadoutDisplay.initialized) {
                    this.loadoutDisplay.o();
                }
                this.loadoutDisplay.show();
                this.loadoutDisplay.m(e, this.hasFocus);
            } else {
                this.loadoutDisplay.hide();
            }
        }
        if (!this.active && this.loadoutMenu.active) {
            this.loadoutMenu.hide();
        }
        if (this.active) {
            this.pass?.update(e);
        }
        this.input.flush();
    }
}

const App = new Application();
document.addEventListener("DOMContentLoaded", i);
window.addEventListener("load", i);
window.addEventListener("unload", (e) => {
    App.onUnload();
});
if (window.location.hash == "#_=_") {
    window.location.hash = "";
    history.pushState("", document.title, window.location.pathname);
}
window.addEventListener("resize", () => {
    App.onResize();
});
window.addEventListener("orientationchange", () => {
    App.onResize();
});
window.addEventListener("hashchange", () => {
    App.tryJoinTeam(false);
});
window.addEventListener("beforeunload", (e) => {
    if (App.game?.gr() && !Device.webview) {
        const t = "Do you want to reload the game?";
        e.returnValue = t;
        return t;
    }
});
window.addEventListener("onfocus", () => {
    App.hasFocus = true;
});
window.addEventListener("onblur", () => {
    App.hasFocus = false;
});
const B = [];
window.onerror = function(e, t, r, a, i) {
    e = e || "undefined_error_msg";
    const s = i ? i.stack : "";
    if (
        e.indexOf("').innerText") != -1 ||
        s.includes("cdn.rawgit.com") ||
        s.includes("chrome-extension://")
    ) {
        helpers.U();
        return;
    }
    const n = {
        msg: e,
        id: App.sessionId,
        url: t,
        line: r,
        column: a,
        stacktrace: s,
        browser: navigator.userAgent,
        protocol: GameConfig.protocolVersion
    };
    const c = JSON.stringify(n);
    if (!B.includes(c)) {
        B.push(c);
        if (
            !/tpc.googlesyndication.com/.test(c) &&
            e != "Script error."
        ) {
            if (/surviv\.io\/js\/.*\.js/.test(c)) {
                if (
                    n.msg.indexOf(
                        "TypeError: null is not an object (evaluating 'e.transform._parentID=-1')"
                    ) !== -1
                ) {
                    FirebaseManager.logError(c);
                } else {
                    FirebaseManager.logWindowOnAppError(c);
                }
            } else {
                FirebaseManager.logWindowOnError(c);
            }
        }
    }
};

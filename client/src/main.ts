import $ from "jquery";
import * as PIXI from "pixi.js-legacy";
import { GameConfig } from "../../shared/gameConfig";
import * as net from "../../shared/net/net";
import { math } from "../../shared/utils/math";
import { Account } from "./account";
import { Ambiance } from "./ambiance";
import { api } from "./api";
import { AudioManager } from "./audioManager";
import { ConfigManager, type ConfigType } from "./config";
import { device } from "./device";
import { Game } from "./game";
import { helpers } from "./helpers";
import { InputHandler } from "./input";
import { InputBindUi, InputBinds } from "./inputBinds";
import { PingTest } from "./pingTest";
import { ResourceManager } from "./resources";
import { SiteInfo } from "./siteInfo";
import { LoadoutMenu } from "./ui/loadoutMenu";
import { Localization } from "./ui/localization";
import Menu from "./ui/menu";
import { MenuModal } from "./ui/menuModal";
import { LoadoutDisplay } from "./ui/opponentDisplay";
import { Pass } from "./ui/pass";
import { ProfileUi } from "./ui/profileUi";
import { TeamMenu } from "./ui/teamMenu";
import { loadStaticDomImages } from "./ui/ui2";

export interface MatchData {
    zone: string;
    gameId: number;
    useHttps: boolean;
    hosts: string[];
    addrs: string[];
    data: string;
}

class Application {
    nameInput = $("#player-name-input-solo");
    serverSelect = $("#server-select-main");
    playMode0Btn = $("#btn-start-mode-0");
    playMode1Btn = $("#btn-start-mode-1");
    playMode2Btn = $("#btn-start-mode-2");
    muteBtns = $(".btn-sound-toggle");
    aimLineBtn = $("#btn-game-aim-line");
    masterSliders = $<HTMLInputElement>(".sl-master-volume");
    soundSliders = $<HTMLInputElement>(".sl-sound-volume");
    musicSliders = $<HTMLInputElement>(".sl-music-volume");
    serverWarning = $("#server-warning");
    languageSelect = $<HTMLSelectElement>(".language-select");
    startMenuWrapper = $("#start-menu-wrapper");
    gameAreaWrapper = $("#game-area-wrapper");
    playButtons = $(".play-button-container");
    playLoading = $(".play-loading-outer");
    errorModal = new MenuModal($("#modal-notification"));
    refreshModal = new MenuModal($("#modal-refresh"));
    config = new ConfigManager();
    localization = new Localization();

    account!: Account;
    loadoutMenu!: LoadoutMenu;
    pass!: Pass;
    profileUi!: ProfileUi;

    pingTest = new PingTest();
    audioManager = new AudioManager();
    ambience = new Ambiance();

    siteInfo!: SiteInfo;
    teamMenu!: TeamMenu;

    pixi: PIXI.Application<PIXI.ICanvas> | null = null;
    resourceManager: ResourceManager | null = null;
    input: InputHandler | null = null;
    inputBinds: InputBinds | null = null;
    inputBindUi: InputBindUi | null = null;
    game: Game | null = null;
    loadoutDisplay: LoadoutDisplay | null = null;
    domContentLoaded = false;
    configLoaded = false;
    initialized = false;
    active = false;
    sessionId = helpers.random64();
    contextListener = function (e: MouseEvent) {
        e.preventDefault();
    };

    errorMessage = "";
    quickPlayPendingModeIdx = -1;
    findGameAttempts = 0;
    findGameTime = 0;
    pauseTime = 0;
    wasPlayingVideo = false;
    checkedPingTest = false;
    hasFocus = true;
    newsDisplayed = true;

    constructor() {
        this.account = new Account(this.config);
        this.loadoutMenu = new LoadoutMenu(this.account, this.localization);
        this.pass = new Pass(this.account, this.loadoutMenu, this.localization);
        this.profileUi = new ProfileUi(
            this.account,
            this.localization,
            this.loadoutMenu,
            this.errorModal,
        );
        this.siteInfo = new SiteInfo(this.config, this.localization);

        this.teamMenu = new TeamMenu(
            this.config,
            this.pingTest,
            this.siteInfo,
            this.localization,
            this.audioManager,
            this.onTeamMenuJoinGame.bind(this),
            this.onTeamMenuLeave.bind(this),
        );

        const onLoadComplete = () => {
            this.config.load(() => {
                this.configLoaded = true;
                this.tryLoad();
            });
        };
        this.loadBrowserDeps(onLoadComplete);
    }

    loadBrowserDeps(onLoadCompleteCb: () => void) {
        onLoadCompleteCb();
    }

    tryLoad() {
        if (this.domContentLoaded && this.configLoaded && !this.initialized) {
            this.initialized = true;
            // this should be this.config.config.teamAutofill = true???
            // this.config.teamAutoFill = true;
            if (device.mobile) {
                Menu.applyMobileBrowserStyling(device.tablet);
            }
            const t = this.config.get("language") || this.localization.detectLocale();
            this.config.set("language", t);
            this.localization.setLocale(t);
            this.localization.populateLanguageSelect();
            this.startPingTest();
            this.siteInfo.load();
            this.localization.localizeIndex();
            this.account.init();

            (this.nameInput as unknown as HTMLInputElement).maxLength =
                net.Constants.PlayerNameMaxLen;
            this.playMode0Btn.on("click", () => {
                this.tryQuickStartGame(0);
            });
            this.playMode1Btn.on("click", () => {
                this.tryQuickStartGame(1);
            });
            this.playMode2Btn.on("click", () => {
                this.tryQuickStartGame(2);
            });
            this.serverSelect.change(() => {
                const t = this.serverSelect.find(":selected").val();
                this.config.set("region", t as string);
            });
            this.nameInput.on("blur", (_t) => {
                this.setConfigFromDOM();
            });
            this.muteBtns.on("click", (_t) => {
                this.config.set("muteAudio", !this.config.get("muteAudio"));
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
                const r = Number($(t.target).val()) / 100;
                this.audioManager.setMasterVolume(r);
                this.config.set("masterVolume", r);
            });
            this.soundSliders.on("input", (t) => {
                const r = Number($(t.target).val()) / 100;
                this.audioManager.setSoundVolume(r);
                this.config.set("soundVolume", r);
            });
            this.musicSliders.on("input", (t) => {
                const r = Number($(t.target).val()) / 100;
                this.audioManager.setMusicVolume(r);
                this.config.set("musicVolume", r);
            });
            $(".modal-settings-item")
                .children("input")
                .each((_t, r) => {
                    const a = $(r);
                    a.prop("checked", this.config.get(a.prop("id")));
                });
            $(".modal-settings-item > input:checkbox").change((t) => {
                const r = $(t.target);
                this.config.set(r.prop("id"), r.is(":checked"));
            });
            $(".btn-fullscreen-toggle").on("click", () => {
                helpers.toggleFullScreen();
            });
            this.languageSelect.on("change", (t) => {
                const r = t.target.value;
                if (r) {
                    this.config.set("language", r as ConfigType["language"]);
                }
            });
            $("#btn-create-team").on("click", () => {
                this.tryJoinTeam(true);
            });
            $("#btn-team-mobile-link-join").on("click", () => {
                let t = $<HTMLInputElement>("#team-link-input").val()?.trim()!;
                const r = t.indexOf("#");
                if (r >= 0) {
                    t = t.slice(r + 1);
                }
                if (t.length > 0) {
                    $("#team-mobile-link").css("display", "none");
                    this.tryJoinTeam(false, t);
                } else {
                    $("#team-mobile-link-desc").css("display", "none");
                    $("#team-mobile-link-warning").css("display", "none").fadeIn(100);
                }
            });
            $("#btn-team-leave").on("click", () => {
                if (window.history) {
                    window.history.replaceState("", "", "/");
                }
                $("#news-block").css("display", "block");
                this.game?.free();
                this.teamMenu.leave();
            });
            const r = $("#news-current").data("date");
            const a = new Date(r).getTime();
            $(".right-column-toggle").on("click", () => {
                if (this.newsDisplayed) {
                    $("#news-wrapper").fadeOut(250);
                    $("#pass-wrapper").fadeIn(250);
                } else {
                    this.config.set("lastNewsTimestamp", a);
                    $(".news-toggle").find(".account-alert").css("display", "none");
                    $("#news-wrapper").fadeIn(250);
                    $("#pass-wrapper").fadeOut(250);
                }
                this.newsDisplayed = !this.newsDisplayed;
            });
            const i = this.config.get("lastNewsTimestamp")!;
            if (a > i) {
                $(".news-toggle").find(".account-alert").css("display", "block");
            }
            this.setDOMFromConfig();
            this.setAppActive(true);
            const domCanvas = document.querySelector<HTMLCanvasElement>("#cvs")!;

            const rendererRes = window.devicePixelRatio > 1 ? 2 : 1;

            if (device.os == "ios") {
                PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.HIGH;
            }

            const createPixiApplication = (forceCanvas: boolean) => {
                return new PIXI.Application({
                    width: window.innerWidth,
                    height: window.innerHeight,
                    view: domCanvas,
                    antialias: false,
                    resolution: rendererRes,
                    hello: true,
                    forceCanvas,
                });
            };
            let pixi = null;
            try {
                pixi = createPixiApplication(false);
            } catch (_e) {
                pixi = createPixiApplication(true);
            }
            this.pixi = pixi;
            this.pixi.renderer.events.destroy();
            this.pixi.ticker.add(this.update, this);
            this.pixi.renderer.background.color = 7378501;
            this.resourceManager = new ResourceManager(
                this.pixi.renderer,
                this.audioManager,
                this.config,
            );
            this.resourceManager.loadMapAssets("main");
            this.input = new InputHandler(document.getElementById("game-touch-area")!);
            this.inputBinds = new InputBinds(this.input, this.config);
            this.inputBindUi = new InputBindUi(this.input, this.inputBinds);
            const onJoin = () => {
                this.loadoutDisplay!.free();
                this.game!.init();
                this.onResize();
                this.findGameAttempts = 0;
                this.ambience.onGameStart();
            };
            const onQuit = (errMsg?: string) => {
                if (this.game!.updatePass) {
                    this.pass.scheduleUpdatePass(this.game!.updatePassDelay);
                }
                this.game!.free();
                this.errorMessage = this.localization.translate(errMsg || "");
                this.teamMenu.onGameComplete();
                this.ambience.onGameComplete(this.audioManager);
                this.setAppActive(true);
                this.setPlayLockout(false);
                if (errMsg == "index-invalid-protocol") {
                    this.showInvalidProtocolModal();
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
                onQuit,
            );
            this.loadoutDisplay = new LoadoutDisplay(
                this.pixi,
                this.audioManager,
                this.config,
                this.inputBinds,
                this.account,
            );
            this.loadoutMenu.loadoutDisplay = this.loadoutDisplay;
            this.onResize();
            this.tryJoinTeam(false);
            Menu.setupModals(this.inputBinds, this.inputBindUi);
            this.onConfigModified();
            this.config.addModifiedListener(this.onConfigModified.bind(this));
            loadStaticDomImages();
        }
    }

    onUnload() {
        this.teamMenu.leave();
    }

    onResize() {
        device.onResize();
        Menu.onResize();
        this.loadoutMenu.onResize();
        this.pixi?.renderer.resize(device.screenWidth, device.screenHeight);
        if (this.game?.initialized) {
            this.game.resize();
        }
        if (this.loadoutDisplay?.initialized) {
            this.loadoutDisplay.resize();
        }
        this.refreshUi();
    }

    startPingTest() {
        const regions = this.config.get("regionSelected")
            ? [this.config.get("region")!]
            : this.pingTest.getRegionList();
        this.pingTest.start(regions);
    }

    setAppActive(active: boolean) {
        this.active = active;
        this.quickPlayPendingModeIdx = -1;
        this.refreshUi();

        // Certain systems, like the account, can throw errors
        // while the user is already in a game.
        // Seeing these errors when returning to the menu would be
        // confusing, so we'll hide the modal instead.
        if (active) {
            this.errorModal.hide();
        }
    }

    setPlayLockout(lock: boolean) {
        const delay = lock ? 0 : 1000;
        this.playButtons
            .stop()
            .delay(delay)
            .animate(
                {
                    opacity: lock ? 0.5 : 1,
                },
                250,
            );
        this.playLoading
            .stop()
            .delay(delay)
            .animate(
                {
                    opacity: lock ? 1 : 0,
                },
                {
                    duration: 250,
                    start: () => {
                        this.playLoading.css({
                            "pointer-events": lock ? "initial" : "none",
                        });
                    },
                },
            );
    }

    onTeamMenuJoinGame(data: MatchData) {
        this.waitOnAccount(() => {
            this.joinGame(data);
        });
    }

    onTeamMenuLeave(errTxt = "") {
        if (errTxt && errTxt != "" && window.history) {
            window.history.replaceState("", "", "/");
        }
        this.errorMessage = errTxt;
        this.setDOMFromConfig();
        this.refreshUi();
    }

    // Config
    setConfigFromDOM() {
        const playerName = helpers.sanitizeNameInput(this.nameInput.val() as string);
        this.config.set("playerName", playerName);
        const region = this.serverSelect.find(":selected").val();
        this.config.set("region", region as string);
    }

    setDOMFromConfig() {
        this.nameInput.val(this.config.get("playerName")!);
        this.serverSelect.find("option").each((_i, ele) => {
            ele.selected = ele.value == this.config.get("region");
        });
        this.languageSelect.val(this.config.get("language")!);
    }

    onConfigModified(key?: string) {
        const muteAudio = this.config.get("muteAudio")!;
        if (muteAudio != this.audioManager.mute) {
            this.muteBtns.removeClass(muteAudio ? "audio-on-icon" : "audio-off-icon");
            this.muteBtns.addClass(muteAudio ? "audio-off-icon" : "audio-on-icon");
            this.audioManager.setMute(muteAudio);
        }

        const masterVolume = this.config.get("masterVolume")!;
        this.masterSliders.val(masterVolume * 100);
        this.audioManager.setMasterVolume(masterVolume);

        const soundVolume = this.config.get("soundVolume")!;
        this.soundSliders.val(soundVolume * 100);
        this.audioManager.setSoundVolume(soundVolume);

        const musicVolume = this.config.get("musicVolume")!;
        this.musicSliders.val(musicVolume * 100);
        this.audioManager.setMusicVolume(musicVolume);

        if (key == "language") {
            const language = this.config.get("language")!;
            this.localization.setLocale(language);
        }

        if (key == "region") {
            this.config.set("regionSelected", true);
            this.startPingTest();
        }

        if (key == "highResTex") {
            location.reload();
        }
    }

    refreshUi() {
        this.startMenuWrapper.css("display", this.active ? "flex" : "none");
        this.gameAreaWrapper.css({
            display: this.active ? "none" : "block",
            opacity: this.active ? 0 : 1,
        });
        if (this.active) {
            $("body").removeClass("user-select-none");
            document.removeEventListener("contextmenu", this.contextListener);
        } else {
            $("body").addClass("user-select-none");
            $("#start-main").stop(true);
            document.addEventListener("contextmenu", this.contextListener);
        }

        // Hide the left section if on mobile, oriented portrait, and viewing create team
        $("#ad-block-left").css(
            "display",
            !device.isLandscape && this.teamMenu.active ? "none" : "block",
        );

        // Warning
        const hasError = this.active && this.errorMessage != "";
        this.serverWarning.css({
            display: "block",
            opacity: hasError ? 1 : 0,
        });
        this.serverWarning.html(this.errorMessage);

        const updateButton = (ele: JQuery<HTMLElement>, gameModeIdx: number) => {
            ele.html(
                this.quickPlayPendingModeIdx === gameModeIdx
                    ? '<div class="ui-spinner"></div>'
                    : this.localization.translate(ele.data("l10n")),
            );
        };

        updateButton(this.playMode0Btn, 0);
        updateButton(this.playMode1Btn, 1);
        updateButton(this.playMode2Btn, 2);
    }

    waitOnAccount(cb: () => void) {
        if (this.account.requestsInFlight == 0) {
            cb();
        } else {
            // Wait some maximum amount of time for pending account requests
            const timeout = setTimeout(() => {
                runOnce();
            }, 2500);
            const runOnce = () => {
                cb();
                clearTimeout(timeout);
                this.account.removeEventListener("requestsComplete", runOnce);
            };
            this.account.addEventListener("requestsComplete", runOnce);
        }
    }

    tryJoinTeam(create: boolean, url?: string) {
        if (this.active && this.quickPlayPendingModeIdx === -1) {
            // Join team if the url contains a team address
            const roomUrl = url || window.location.hash.slice(1);
            if (create || roomUrl != "") {
                // The main menu and squad menus have separate
                // DOM elements for input, such as player name and
                // selected region. We will stash the menu values
                // into the config so the team menu can read them.
                this.setConfigFromDOM();
                this.teamMenu.connect(create, roomUrl);
                this.refreshUi();
            }
        }
    }

    tryQuickStartGame(gameModeIdx: number) {
        if (this.quickPlayPendingModeIdx === -1) {
            // Update UI to display a spinner on the play button
            this.errorMessage = "";
            this.quickPlayPendingModeIdx = gameModeIdx;
            this.setConfigFromDOM();
            this.refreshUi();

            // Wait some amount of time if we've recently attempted to
            // find a game to prevent spamming the server
            let delay = 0;
            if (this.findGameAttempts > 0 && Date.now() - this.findGameTime < 30000) {
                delay = Math.min(this.findGameAttempts * 2.5 * 1000, 7500);
            } else {
                this.findGameAttempts = 0;
            }
            this.findGameTime = Date.now();
            this.findGameAttempts++;

            const version = GameConfig.protocolVersion;
            let region = this.config.get("region")!;
            const paramRegion = helpers.getParameterByName("region");
            if (paramRegion !== undefined && paramRegion.length > 0) {
                region = paramRegion;
            }
            let zones = this.pingTest.getZones(region);
            const paramZone = helpers.getParameterByName("zone");
            if (paramZone !== undefined && paramZone.length > 0) {
                zones = [paramZone];
            }

            const matchArgs = {
                version,
                region,
                zones,
                playerCount: 1,
                autoFill: true,
                gameModeIdx,
            };

            const tryQuickStartGameImpl = () => {
                this.waitOnAccount(() => {
                    this.findGame(matchArgs, (err, matchData) => {
                        if (err) {
                            this.onJoinGameError(err);
                            return;
                        }
                        this.joinGame(matchData!);
                    });
                });
            };

            if (delay == 0) {
                // We can improve findGame responsiveness by ~30 ms by skipping
                // the 0ms setTimeout
                tryQuickStartGameImpl();
            } else {
                setTimeout(() => {
                    tryQuickStartGameImpl();
                }, delay);
            }
        }
    }

    findGame(
        matchArgs: unknown,
        cb: (err?: string | null, matchData?: MatchData) => void,
    ) {
        (function findGameImpl(iter, maxAttempts) {
            if (iter >= maxAttempts) {
                cb("full");
                return;
            }
            const retry = function () {
                setTimeout(() => {
                    findGameImpl(iter + 1, maxAttempts);
                }, 500);
            };
            $.ajax({
                type: "POST",
                url: api.resolveUrl("/api/find_game"),
                data: JSON.stringify(matchArgs),
                contentType: "application/json; charset=utf-8",
                timeout: 10 * 1000,
                success: function (data: { err?: string; res: [MatchData] }) {
                    if (data?.err && data.err != "full") {
                        cb(data.err);
                        return;
                    }
                    const matchData = data?.res ? data.res[0] : null;
                    if (matchData?.hosts && matchData.addrs) {
                        cb(null, matchData);
                    } else {
                        retry();
                    }
                },
                error: function (_e) {
                    retry();
                },
            });
        })(0, 2);
    }

    joinGame(matchData: MatchData) {
        if (!this.game) {
            setTimeout(() => {
                this.joinGame(matchData);
            }, 250);
            return;
        }
        const hosts = matchData.hosts || [];
        const urls: string[] = [];
        for (let i = 0; i < hosts.length; i++) {
            urls.push(
                `ws${matchData.useHttps ? "s" : ""}://${hosts[i]}/play?gameId=${
                    matchData.gameId
                }`,
            );
        }
        const joinGameImpl = (urls: string[], matchData: MatchData) => {
            const url = urls.shift();
            if (!url) {
                this.onJoinGameError("join_game_failed");
                return;
            }
            const onFailure = function () {
                joinGameImpl(urls, matchData);
            };
            this.game!.tryJoinGame(
                url,
                matchData.data,
                this.account.loadoutPriv,
                this.account.questPriv,
                onFailure,
            );
        };
        joinGameImpl(urls, matchData);
    }

    onJoinGameError(err: string) {
        const errMap = {
            full: this.localization.translate("index-failed-finding-game"),
            invalid_protocol: this.localization.translate("index-invalid-protocol"),
            join_game_failed: this.localization.translate("index-failed-joining-game"),
        };
        if (err == "invalid_protocol") {
            this.showInvalidProtocolModal();
        }
        this.errorMessage = errMap[err as keyof typeof errMap] || errMap.full;
        this.quickPlayPendingModeIdx = -1;
        this.teamMenu.leave("join_game_failed");
        this.refreshUi();
    }

    showInvalidProtocolModal() {
        this.refreshModal.show(true);
    }

    update() {
        const dt = math.clamp(this.pixi!.ticker.elapsedMS / 1000, 0.001, 1 / 8);
        this.pingTest.update(dt);
        if (!this.checkedPingTest && this.pingTest.isComplete()) {
            if (!this.config.get("regionSelected")) {
                const region = this.pingTest.getRegion();

                if (region) {
                    this.config.set("region", region);
                    this.setDOMFromConfig();
                }
            }
            this.checkedPingTest = true;
        }
        this.resourceManager!.update(dt);
        this.audioManager.update(dt);
        this.ambience.update(dt, this.audioManager, !this.active);
        this.teamMenu.update(dt);

        // Game update
        if (this.game?.initialized && this.game.playing) {
            if (this.active) {
                this.setAppActive(false);
                this.setPlayLockout(true);
            }
            this.game.update(dt);
        }

        // LoadoutDisplay update
        if (this.active && this.loadoutDisplay && this.game && !this.game.initialized) {
            if (this.loadoutMenu.active) {
                if (!this.loadoutDisplay.initialized) {
                    this.loadoutDisplay.init();
                }
                this.loadoutDisplay.show();
                this.loadoutDisplay.update(dt, this.hasFocus);
            } else {
                this.loadoutDisplay.hide();
            }
        }
        if (!this.active && this.loadoutMenu.active) {
            this.loadoutMenu.hide();
        }
        if (this.active) {
            this.pass?.update(dt);
        }
        this.input!.flush();
    }
}

const App = new Application();

function onPageLoad() {
    App.domContentLoaded = true;
    App.tryLoad();
}

document.addEventListener("DOMContentLoaded", onPageLoad);
window.addEventListener("load", onPageLoad);
window.addEventListener("unload", (_e) => {
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
    if (App.game?.warnPageReload()) {
        // In new browsers, dialogText is overridden by a generic string
        const dialogText = "Do you want to reload the game?";
        e.returnValue = dialogText;
        return dialogText;
    }
});
window.addEventListener("onfocus", () => {
    App.hasFocus = true;
});
window.addEventListener("onblur", () => {
    App.hasFocus = false;
});

const reportedErrors: string[] = [];
window.onerror = function (msg, url, lineNo, columnNo, error) {
    msg = msg || "undefined_error_msg";
    const stacktrace = error ? error.stack : "";

    const errObj = {
        msg,
        id: App.sessionId,
        url,
        line: lineNo,
        column: columnNo,
        stacktrace,
        browser: navigator.userAgent,
        protocol: GameConfig.protocolVersion,
        clientGitVersion: GIT_VERSION,
        serverGitVersion: App.siteInfo.info.gitRevision,
    };
    const errStr = JSON.stringify(errObj);

    // Don't report the same error multiple times
    if (!reportedErrors.includes(errStr)) {
        reportedErrors.push(errStr);
        console.error("windowOnError", errStr);
    }
};

navigator.serviceWorker?.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
        registration.unregister();
    }
});

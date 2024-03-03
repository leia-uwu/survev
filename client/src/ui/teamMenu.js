import $ from "jquery";
import { GameConfig } from "../../../shared/gameConfig";
import net from "../../../shared/net";
import { api } from "../api";
import { device } from "../device";
import { helpers } from "../helpers";

function i(e, t) {
    const r = {
        join_full: t.translate("index-team-is-full"),
        join_not_found: t.translate("index-failed-joining-team"),
        create_failed: t.translate("index-failed-creating-team"),
        join_failed: t.translate("index-failed-joining-team"),
        join_game_failed: t.translate("index-failed-joining-game"),
        lost_conn: t.translate("index-lost-connection"),
        find_game_error: t.translate("index-failed-finding-game"),
        find_game_full: t.translate("index-failed-finding-game"),
        find_game_invalid_protocol: t.translate(
            "index-invalid-protocol"
        ),
        kicked: t.translate("index-team-kicked")
    };
    return r[e] || r.lost_conn;
}

class TeamMenu {
    constructor(t, r, i, o, n, l, c) {
        const h = this;
        this.playBtn = $("#btn-start-team");
        this.serverWarning = $("#server-warning");
        this.teamOptions = $(
            "#btn-team-queue-mode-1, #btn-team-queue-mode-2, #btn-team-fill-auto, #btn-team-fill-none"
        );
        this.serverSelect = $("#team-server-select");
        this.queueMode1 = $("#btn-team-queue-mode-1");
        this.queueMode2 = $("#btn-team-queue-mode-2");
        this.fillAuto = $("#btn-team-fill-auto");
        this.fillNone = $("#btn-team-fill-none");
        this.config = t;
        this.pingTest = r;
        this.siteInfo = i;
        this.localization = o;
        this.audioManager = n;
        this.joinGameCb = l;
        this.leaveCb = c;
        this.active = false;
        this.joined = false;
        this.create = false;
        this.joiningGame = false;
        this.ws = null;
        this.keepAliveTimeout = 0;
        this.playerData = {};
        this.roomData = {};
        this.players = [];
        this.prevPlayerCount = 0;
        this.localPlayerId = 0;
        this.isLeader = true;
        this.editingName = false;
        this.displayedInvalidProtocolModal = false;
        this.serverSelect.change(() => {
            const e = h.serverSelect.find(":selected").val();
            h.pingTest.start([e]);
            h.setRoomProperty("region", e);
        });
        this.queueMode1.click(() => {
            h.setRoomProperty("gameModeIdx", 1);
        });
        this.queueMode2.click(() => {
            h.setRoomProperty("gameModeIdx", 2);
        });
        this.fillAuto.click(() => {
            h.setRoomProperty("autoFill", true);
        });
        this.fillNone.click(() => {
            h.setRoomProperty("autoFill", false);
        });
        this.playBtn.on("click", () => {
            h.tryStartGame();
        });
        $("#team-copy-url, #team-desc-text").click((e) => {
            const t = $("<div/>", {
                class: "copy-toast",
                html: "Copied!"
            });
            $("#start-menu-wrapper").append(t);
            t.css({
                left: e.pageX - parseInt(t.css("width")) / 2,
                top: $("#team-copy-url").offset().top
            });
            t.animate(
                {
                    top: "-=20",
                    opacity: 1
                },
                {
                    queue: false,
                    duration: 300,
                    complete: function() {
                        $(this).fadeOut(250, function() {
                            $(this).remove();
                        });
                    }
                }
            );
            const r = $("#team-url").html();
            helpers.copyTextToClipboard(r);
        });
        if (!device.webview && !device.mobile) {
            this.hideUrl = false;
            $("#team-hide-url").click((e) => {
                const t = e.currentTarget;
                h.hideUrl = !h.hideUrl;
                $("#team-desc-text, #team-code-text").css({
                    opacity: h.hideUrl ? 0 : 1
                });
                $(t).css({
                    "background-image": h.hideUrl
                        ? "url(../img/gui/hide.svg)"
                        : "url(../img/gui/eye.svg)"
                });
            });
        }
    }

    getPlayerById(e) {
        return this.players.find((t) => {
            return t.playerId == e;
        });
    }

    update(e) {
        if (this.joined) {
            this.keepAliveTimeout -= e;
            if (this.keepAliveTimeout < 0) {
                this.keepAliveTimeout = 45;
                this.sendMessage("keepAlive", {});
            }
        }
    }

    connect(e, t) {
        const r = this;
        if (!this.active || t !== this.roomData.roomUrl) {
            const a = api.resolveRoomHost();
            const i = `wss://${a}/team_v2`;
            this.active = true;
            this.joined = false;
            this.create = e;
            this.joiningGame = false;
            this.editingName = false;
            this.playerData = {
                name: this.config.get("playerName")
            };
            this.roomData = {
                roomUrl: t,
                region: this.config.get("region"),
                gameModeIdx: this.config.get("gameModeIdx"),
                autoFill: this.config.get("teamAutoFill"),
                findingGame: false,
                lastError: ""
            };
            this.displayedInvalidProtocolModal = false;
            this.refreshUi();
            if (this.ws) {
                this.ws.onclose = function() { };
                this.ws.close();
                this.ws = null;
            }
            try {
                this.ws = new WebSocket(i);
                this.ws.onerror = function(e) {
                    r.ws?.close();
                };
                this.ws.onclose = function() {
                    let e = "";
                    if (!r.joiningGame) {
                        e = r.joined
                            ? "lost_conn"
                            : r.create
                                ? "create_failed"
                                : "join_failed";
                    }
                    r.leave(e);
                };
                this.ws.onopen = function() {
                    if (r.create) {
                        r.sendMessage("create", {
                            roomData: r.roomData,
                            playerData: r.playerData
                        });
                    } else {
                        r.sendMessage("join", {
                            roomUrl: r.roomData.roomUrl,
                            playerData: r.playerData
                        });
                    }
                };
                this.ws.onmessage = function(e) {
                    if (r.active) {
                        const t = JSON.parse(e.data);
                        r.onMessage(t.type, t.data);
                    }
                };
            } catch (e) {
                this.leave(
                    this.create
                        ? "create_failed"
                        : "join_failed"
                );
            }
        }
    }

    leave(e) {
        if (this.active) {
            this.ws?.close();
            this.ws = null;
            this.active = false;
            this.joined = false;
            this.joiningGame = false;
            this.refreshUi();
            this.config.set(
                "gameModeIdx",
                this.roomData.gameModeIdx
            );
            this.config.set(
                "teamAutoFill",
                this.roomData.autoFill
            );
            if (this.isLeader) {
                this.config.set(
                    "region",
                    this.roomData.region
                );
            }
            let t = "";
            if (e && e != "") {
                t = i(e, this.localization);
            }
            this.leaveCb(t);
        }
    }

    onGameComplete() {
        if (this.active) {
            this.joiningGame = false;
            this.sendMessage("gameComplete");
        }
    }

    onMessage(e, t) {
        switch (e) {
        case "state": {
            this.joined = true;
            const r = this.roomData;
            this.roomData = t.room;
            this.players = t.players;
            this.localPlayerId = t.localPlayerId;
            this.isLeader = this.getPlayerById(
                this.localPlayerId
            ).isLeader;
            if (this.isLeader) {
                this.roomData.region = r.region;
                this.roomData.autoFill = r.autoFill;
            }
            this.refreshUi();
        }
            break;
        case "joinGame":
            this.joiningGame = true;
            this.joinGameCb(t);
            break;
        case "keepAlive":
            break;
        case "kicked":
            this.leave("kicked");
            break;
        case "error":
            this.leave(t.type);
        }
    }

    sendMessage(e, t) {
        if (this.ws) {
            if (this.ws.readyState === this.ws.OPEN) {
                const r = JSON.stringify({
                    type: e,
                    data: t
                });
                this.ws.send(r);
            } else {
                this.ws.close();
            }
        }
    }

    setRoomProperty(e, t) {
        if (this.isLeader && this.roomData[e] != t) {
            this.roomData[e] = t;
            this.sendMessage("setRoomProps", this.roomData);
        }
    }

    tryStartGame() {
        if (this.isLeader && !this.roomData.findingGame) {
            const e = GameConfig.protocolVersion;
            let t = this.roomData.region;
            const r = helpers.getParameterByName("region");
            if (r !== undefined && r.length > 0) {
                t = r;
            }
            let a = this.pingTest.getZones(t);
            const i = helpers.getParameterByName("zone");
            if (i !== undefined && i.length > 0) {
                a = [i];
            }
            const o = {
                version: e,
                region: t,
                zones: a
            };
            this.sendMessage("playGame", o);
            this.roomData.findingGame = true;
            this.refreshUi();
        }
    }

    refreshUi() {
        const e = this;
        const t = function(e, t, r) {
            e.removeClass(
                "btn-darken btn-disabled btn-opaque btn-hollow-selected"
            );
            if (r) {
                e.addClass("btn-darken");
            } else {
                e.addClass("btn-disabled");
                if (!t) {
                    e.addClass("btn-opaque");
                }
            }
            if (t) {
                e.addClass("btn-hollow-selected");
            }
            e.prop("disabled", !r);
        };
        $("#team-menu").css(
            "display",
            this.active ? "block" : "none"
        );
        $("#start-menu").css(
            "display",
            this.active ? "none" : "block"
        );
        $("#right-column").css(
            "display",
            this.active ? "none" : "block"
        );
        $("#social-share-block").css(
            "display",
            this.active ? "none" : "block"
        );
        const r = this.roomData.lastError != "";
        const a = i(
            this.roomData.lastError,
            this.localization
        );
        this.serverWarning.css("opacity", r ? 1 : 0);
        this.serverWarning.html(a);
        if (
            this.roomData.lastError ==
            "find_game_invalid_protocol" &&
            !this.displayedInvalidProtocolModal
        ) {
            $("#modal-refresh").fadeIn(200);
            this.displayedInvalidProtocolModal = true;
        }
        if (this.active) {
            $("#team-menu-joining-text").css(
                "display",
                this.create ? "none" : "block"
            );
            $("#team-menu-creating-text").css(
                "display",
                this.create ? "block" : "none"
            );
            $("#team-menu-connecting").css(
                "display",
                this.joined ? "none" : "block"
            );
            $("#team-menu-contents").css(
                "display",
                this.joined ? "block" : "none"
            );
            $("#btn-team-leave").css(
                "display",
                this.joined ? "block" : "none"
            );
        }
        if (this.joined) {
            for (
                let o = this.siteInfo.info.pops || {},
                    n = Object.keys(o),
                    c = 0;
                c < n.length;
                c++
            ) {
                const h = n[c];
                const d = o[h];
                const u = $("#team-server-opts").children(
                    `option[value="${h}"]`
                );
                u.html(`${u.attr("data-label")} [${d}]`);
            }
            this.serverSelect
                .find("option")
                .each((t, r) => {
                    r.selected =
                        r.value == e.roomData.region;
                });
            t(
                this.queueMode1,
                this.roomData.gameModeIdx == 1,
                this.isLeader &&
                this.roomData.enabledGameModeIdxs.indexOf(
                    1
                ) !== -1
            );
            t(
                this.queueMode2,
                this.roomData.gameModeIdx == 2,
                this.isLeader &&
                this.roomData.enabledGameModeIdxs.indexOf(
                    2
                ) !== -1
            );
            t(
                this.fillAuto,
                this.roomData.autoFill,
                this.isLeader
            );
            t(
                this.fillNone,
                !this.roomData.autoFill,
                this.isLeader
            );
            this.serverSelect.prop(
                "disabled",
                !this.isLeader
            );
            if (this.roomData.roomUrl) {
                const g = `${window.location.origin}/${this.roomData.roomUrl}`;
                const y =
                    this.roomData.roomUrl.substring(1);
                if (device.webview) {
                    $("#team-url").html(y);
                } else {
                    $("#team-url").html(g);
                    $("#team-code").html(y);
                }
                if (window.history) {
                    window.history.replaceState(
                        "",
                        "",
                        this.roomData.roomUrl
                    );
                }
            }
            this.playBtn.html(
                this.roomData.findingGame ||
                    this.joiningGame
                    ? '<div class="ui-spinner"></div>'
                    : this.playBtn.attr("data-label")
            );
            const gameModeStyles = this.siteInfo.getGameModeStyles();
            for (let i = 0; i < gameModeStyles.length; i++) {
                this.playBtn.removeClass(gameModeStyles[i].buttonCss);
            }
            const style = gameModeStyles[this.roomData.gameModeIdx];
            if (style) {
                this.playBtn.addClass(
                    "btn-custom-mode-no-indent"
                );
                this.playBtn.addClass(style.buttonCss);
                this.playBtn.css({
                    "background-image": `url(${style.icon})`
                });
            } else {
                this.playBtn.css({
                    "background-image": ""
                });
            }
            let b = false;
            for (let x = 0; x < this.players.length; x++) {
                b |= this.players[x].inGame;
            }
            const S = $("#msg-wait-reason");
            if (this.isLeader) {
                S.html(
                    `${this.localization.translate(
                        "index-game-in-progress"
                    )}<span> ...</span>`
                );
                const v = b && !this.joiningGame;
                S.css("display", v ? "block" : "none");
                this.playBtn.css(
                    "display",
                    v ? "none" : "block"
                );
            } else {
                if (
                    this.roomData.findingGame ||
                    this.joiningGame
                ) {
                    S.html(
                        `<div class="ui-spinner" style="margin-right:16px"></div>${this.localization.translate(
                            "index-joining-game"
                        )}<span> ...</span>`
                    );
                } else if (b) {
                    S.html(
                        `${this.localization.translate(
                            "index-game-in-progress"
                        )}<span> ...</span>`
                    );
                } else {
                    S.html(
                        `${this.localization.translate(
                            "index-waiting-for-leader"
                        )}<span> ...</span>`
                    );
                }
                S.css("display", "block");
                this.playBtn.css("display", "none");
            }
            const k = $("#team-menu-member-list");
            k.empty();
            for (
                let z = 0;
                z < this.roomData.maxPlayers;
                z++
            ) {
                (function(t) {
                    let r = {
                        name: "",
                        playerId: 0,
                        isLeader: false,
                        inGame: false,
                        self: false
                    };
                    if (t < e.players.length) {
                        const a = e.players[t];
                        r = {
                            name: a.name,
                            playerId: a.playerId,
                            isLeader: a.isLeader,
                            inGame: a.inGame,
                            self:
                                a.playerId ==
                                e.localPlayerId
                        };
                    }
                    const i = $("<div/>", {
                        class: "team-menu-member"
                    });
                    let o = "";
                    if (r.isLeader) {
                        o = " icon-leader";
                    } else if (
                        e.isLeader &&
                        r.playerId != 0
                    ) {
                        o = " icon-kick";
                    }
                    i.append(
                        $("<div/>", {
                            class: `icon${o}`,
                            "data-playerid": r.playerId
                        })
                    );
                    let n = null;
                    let c = null;
                    if (e.editingName && r.self) {
                        n = $("<input/>", {
                            type: "text",
                            tabindex: 0,
                            class: "name menu-option name-text name-self-input",
                            maxLength:
                                net.Constants.PlayerNameMaxLen
                        });
                        n.val(r.name);
                        const m = function(t) {
                            const a = helpers.sanitizeNameInput(
                                n.val()
                            );
                            r.name = a;
                            e.config.set("playerName", a);
                            e.sendMessage("changeName", {
                                name: a
                            });
                            e.editingName = false;
                            e.refreshUi();
                        };
                        const h = function(t) {
                            e.editingName = false;
                            e.refreshUi();
                        };
                        n.keypress((e) => {
                            if (e.which === 13) {
                                m();
                                return false;
                            }
                        });
                        n.on("blur", h);
                        i.append(n);
                        c = $("<div/>", {
                            class: "icon icon-submit-name-change"
                        });
                        c.on("click", m);
                        c.on("mousedown", (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        });
                    } else {
                        let d = "name-text";
                        if (r.self) {
                            d += " name-self";
                        }
                        if (r.inGame) {
                            d += " name-in-game";
                        }
                        const u = $("<div/>", {
                            class: `name menu-option ${d}`,
                            html: helpers.htmlEscape(r.name)
                        });
                        if (r.self) {
                            u.on("click", () => {
                                console.log("editing name");
                                e.editingName = true;
                                e.refreshUi();
                            });
                        }
                        i.append(u);
                    }
                    if (c) {
                        i.append(c);
                    } else {
                        i.append(
                            $("<div/>", {
                                class: `icon ${r.inGame
                                    ? "icon-in-game"
                                    : ""
                                }`
                            })
                        );
                    }
                    k.append(i);
                    n?.focus();
                })(z);
            }
            $(".icon-kick", k).click((t) => {
                const r = $(t.currentTarget).attr(
                    "data-playerid"
                );
                e.sendMessage("kick", {
                    playerId: r
                });
            });
            const I = this.players.find((t) => {
                return t.playerId == e.localPlayerId;
            });
            const T = I && !I.inGame;
            if (
                !document.hasFocus() &&
                this.prevPlayerCount <
                this.players.length &&
                this.players.length > 1 &&
                T
            ) {
                this.audioManager.playSound(
                    "notification_join_01",
                    {
                        channel: "ui"
                    }
                );
            }
            this.prevPlayerCount = this.players.length;
        }
    }
}

export default TeamMenu;

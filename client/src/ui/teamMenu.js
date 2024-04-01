import $ from "jquery";
import { GameConfig } from "../../../shared/gameConfig";
import * as net from "../../../shared/net";
import { api } from "../api";
import { device } from "../device";
import { helpers } from "../helpers";

function errorTypeToString(type, localization) {
    const typeMap = {
        join_full: localization.translate("index-team-is-full"),
        join_not_found: localization.translate("index-failed-joining-team"),
        create_failed: localization.translate("index-failed-creating-team"),
        join_failed: localization.translate("index-failed-joining-team"),
        join_game_failed: localization.translate("index-failed-joining-game"),
        lost_conn: localization.translate("index-lost-connection"),
        find_game_error: localization.translate("index-failed-finding-game"),
        find_game_full: localization.translate("index-failed-finding-game"),
        find_game_invalid_protocol: localization.translate(
            "index-invalid-protocol"
        ),
        kicked: localization.translate("index-team-kicked")
    };
    return typeMap[type] || typeMap.lost_conn;
}

export class TeamMenu {
    constructor(config, pingTest, siteInfo, localization, audioManager, joinGameCb, leaveCb) {
        // Jquery elems
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

        // Module state
        this.config = config;
        this.pingTest = pingTest;
        this.siteInfo = siteInfo;
        this.localization = localization;
        this.audioManager = audioManager;
        this.joinGameCb = joinGameCb;
        this.leaveCb = leaveCb;

        this.active = false;
        this.joined = false;
        this.create = false;
        this.joiningGame = false;
        this.ws = null;
        this.keepAliveTimeout = 0;

        // Ui state
        this.playerData = {};
        this.roomData = {};
        this.players = [];
        this.prevPlayerCount = 0;
        this.localPlayerId = 0;
        this.isLeader = true;
        this.editingName = false;
        this.displayedInvalidProtocolModal = false;

        // Listen for ui modifications
        this.serverSelect.change(() => {
            const e = this.serverSelect.find(":selected").val();
            this.pingTest.start([e]);
            this.setRoomProperty("region", e);
        });
        this.queueMode1.click(() => {
            this.setRoomProperty("gameModeIdx", 1);
        });
        this.queueMode2.click(() => {
            this.setRoomProperty("gameModeIdx", 2);
        });
        this.fillAuto.click(() => {
            this.setRoomProperty("autoFill", true);
        });
        this.fillNone.click(() => {
            this.setRoomProperty("autoFill", false);
        });
        this.playBtn.on("click", () => {
            this.tryStartGame();
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
        if (!device.mobile) {
            // Hide invite link
            this.hideUrl = false;
            $("#team-hide-url").click((e) => {
                const el = e.currentTarget;
                this.hideUrl = !this.hideUrl;
                $("#team-desc-text, #team-code-text").css({
                    opacity: this.hideUrl ? 0 : 1
                });
                $(el).css({
                    "background-image": this.hideUrl
                        ? "url(../img/gui/hide.svg)"
                        : "url(../img/gui/eye.svg)"
                });
            });
        }
    }

    getPlayerById(playerId) {
        return this.players.find((x) => {
            return x.playerId == playerId;
        });
    }

    update(dt) {
        if (this.joined) {
            this.keepAliveTimeout -= dt;
            if (this.keepAliveTimeout < 0) {
                this.keepAliveTimeout = 45;
                this.sendMessage("keepAlive", {});
            }
        }
    }

    connect(create, roomUrl) {
        if (!this.active || roomUrl !== this.roomData.roomUrl) {
            const roomHost = api.resolveRoomHost();
            const url = `wss://${roomHost}/team_v2`;
            this.active = true;
            this.joined = false;
            this.create = create;
            this.joiningGame = false;
            this.editingName = false;

            // Load properties from config
            this.playerData = {
                name: this.config.get("playerName")
            };
            this.roomData = {
                roomUrl,
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
                this.ws = new WebSocket(url);
                this.ws.onerror = (e) => {
                    this.ws?.close();
                };
                this.ws.onclose = () => {
                    let errMsg = "";
                    if (!this.joiningGame) {
                        errMsg = this.joined
                            ? "lost_conn"
                            : this.create
                                ? "create_failed"
                                : "join_failed";
                    }
                    this.leave(errMsg);
                };
                this.ws.onopen = () => {
                    if (this.create) {
                        this.sendMessage("create", {
                            roomData: this.roomData,
                            playerData: this.playerData
                        });
                    } else {
                        this.sendMessage("join", {
                            roomUrl: this.roomData.roomUrl,
                            playerData: this.playerData
                        });
                    }
                };
                this.ws.onmessage = (e) => {
                    if (this.active) {
                        const msg = JSON.parse(e.data);
                        this.onMessage(msg.type, msg.data);
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

    leave(errType) {
        if (this.active) {
            this.ws?.close();
            this.ws = null;
            this.active = false;
            this.joined = false;
            this.joiningGame = false;
            this.refreshUi();

            // Save state to config for the menu
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
            let errTxt = "";
            if (errType && errType != "") {
                errTxt = errorTypeToString(errType, this.localization);
            }
            this.leaveCb(errTxt);
        }
    }

    onGameComplete() {
        if (this.active) {
            this.joiningGame = false;
            this.sendMessage("gameComplete");
        }
    }

    onMessage(type, data) {
        switch (type) {
        case "state": {
            this.joined = true;
            const ourRoomData = this.roomData;
            this.roomData = data.room;
            this.players = data.players;
            this.localPlayerId = data.localPlayerId;
            this.isLeader = this.getPlayerById(
                this.localPlayerId
            ).isLeader;

            // Override room properties with local values if we're
            // the leader; otherwise, the server may override a
            // recent change.
            //
            // A better solution here would be just a sequence
            // number and we can ignore updates that don't include our
            // most recent change request.
            if (this.isLeader) {
                this.roomData.region = ourRoomData.region;
                this.roomData.autoFill = ourRoomData.autoFill;
            }
            this.refreshUi();
            break;
        }
        case "joinGame":
            this.joiningGame = true;
            this.joinGameCb(data);
            break;
        case "keepAlive":
            break;
        case "kicked":
            this.leave("kicked");
            break;
        case "error":
            this.leave(data.type);
        }
    }

    sendMessage(type, data) {
        if (this.ws) {
            if (this.ws.readyState === this.ws.OPEN) {
                const msg = JSON.stringify({
                    type,
                    data
                });
                this.ws.send(msg);
            } else {
                this.ws.close();
            }
        }
    }

    setRoomProperty(prop, val) {
        if (this.isLeader && this.roomData[prop] != val) {
            this.roomData[prop] = val;
            this.sendMessage("setRoomProps", this.roomData);
        }
    }

    tryStartGame() {
        if (this.isLeader && !this.roomData.findingGame) {
            const version = GameConfig.protocolVersion;
            let region = this.roomData.region;
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
                zones
            };
            this.sendMessage("playGame", matchArgs);
            this.roomData.findingGame = true;
            this.refreshUi();
        }
    }

    refreshUi() {
        const setButtonState = function(el, selected, enabled) {
            el.removeClass(
                "btn-darken btn-disabled btn-opaque btn-hollow-selected"
            );
            if (enabled) {
                el.addClass("btn-darken");
            } else {
                el.addClass("btn-disabled");
                if (!selected) {
                    el.addClass("btn-opaque");
                }
            }
            if (selected) {
                el.addClass("btn-hollow-selected");
            }
            el.prop("disabled", !enabled);
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

        // Error text
        const hasError = this.roomData.lastError != "";
        const errorTxt = errorTypeToString(
            this.roomData.lastError,
            this.localization
        );
        this.serverWarning.css("opacity", hasError ? 1 : 0);
        this.serverWarning.html(errorTxt);

        if (
            this.roomData.lastError ==
            "find_game_invalid_protocol" &&
            !this.displayedInvalidProtocolModal
        ) {
            $("#modal-refresh").fadeIn(200);
            this.displayedInvalidProtocolModal = true;
        }

        // Show/hide team connecting/contents
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
            // Regions
            const regionPops = this.siteInfo.info.pops || {};
            const regions = Object.keys(regionPops);
            for (
                let c = 0;
                c < regions.length;
                c++
            ) {
                const region = regions[c];
                const count = regionPops[region];
                const sel = $("#team-server-opts").children(
                    `option[value="${region}"]`
                );
                sel.html(`${sel.attr("data-label")} [${count}]`);
            }

            this.serverSelect
                .find("option")
                .each((idx, ele) => {
                    ele.selected =
                        ele.value == this.roomData.region;
                });

            // Modes btns
            setButtonState(
                this.queueMode1,
                this.roomData.gameModeIdx == 1,
                this.isLeader &&
                this.roomData.enabledGameModeIdxs.indexOf(
                    1
                ) !== -1
            );
            setButtonState(
                this.queueMode2,
                this.roomData.gameModeIdx == 2,
                this.isLeader &&
                this.roomData.enabledGameModeIdxs.indexOf(
                    2
                ) !== -1
            );

            // Fill mode
            setButtonState(
                this.fillAuto,
                this.roomData.autoFill,
                this.isLeader
            );
            setButtonState(
                this.fillNone,
                !this.roomData.autoFill,
                this.isLeader
            );
            this.serverSelect.prop(
                "disabled",
                !this.isLeader
            );

            // Invite link
            if (this.roomData.roomUrl) {
                const roomUrl = `${window.location.origin}/${this.roomData.roomUrl}`;
                const roomCode =
                    this.roomData.roomUrl.substring(1);

                $("#team-url").html(roomUrl);
                $("#team-code").html(roomCode);

                if (window.history) {
                    window.history.replaceState(
                        "",
                        "",
                        this.roomData.roomUrl
                    );
                }
            }

            // Play button
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
            let playersInGame = false;
            for (let i = 0; i < this.players.length; i++) {
                playersInGame |= this.players[i].inGame;
            }

            const waitReason = $("#msg-wait-reason");

            if (this.isLeader) {
                waitReason.html(
                    `${this.localization.translate(
                        "index-game-in-progress"
                    )}<span> ...</span>`
                );

                const showWaitMessage = playersInGame && !this.joiningGame;
                waitReason.css("display", showWaitMessage ? "block" : "none");
                this.playBtn.css(
                    "display",
                    showWaitMessage ? "none" : "block"
                );
            } else {
                if (
                    this.roomData.findingGame ||
                    this.joiningGame
                ) {
                    waitReason.html(
                        `<div class="ui-spinner" style="margin-right:16px"></div>${this.localization.translate(
                            "index-joining-game"
                        )}<span> ...</span>`
                    );
                } else if (playersInGame) {
                    waitReason.html(
                        `${this.localization.translate(
                            "index-game-in-progress"
                        )}<span> ...</span>`
                    );
                } else {
                    waitReason.html(
                        `${this.localization.translate(
                            "index-waiting-for-leader"
                        )}<span> ...</span>`
                    );
                }
                waitReason.css("display", "block");
                this.playBtn.css("display", "none");
            }

            // Player properties
            const teamMembers = $("#team-menu-member-list");
            teamMembers.empty();
            for (
                let t = 0;
                t < this.roomData.maxPlayers;
                t++
            ) {
                let playerStatus = {
                    name: "",
                    playerId: 0,
                    isLeader: false,
                    inGame: false,
                    self: false
                };
                if (t < this.players.length) {
                    const player = this.players[t];
                    playerStatus = {
                        name: player.name,
                        playerId: player.playerId,
                        isLeader: player.isLeader,
                        inGame: player.inGame,
                        self:
                                player.playerId ==
                                this.localPlayerId
                    };
                }

                const member = $("<div/>", {
                    class: "team-menu-member"
                });

                // Left-side icon
                let iconClass = "";
                if (playerStatus.isLeader) {
                    iconClass = " icon-leader";
                } else if (
                    this.isLeader &&
                        playerStatus.playerId != 0
                ) {
                    iconClass = " icon-kick";
                }

                member.append(
                    $("<div/>", {
                        class: `icon${iconClass}`,
                        "data-playerid": playerStatus.playerId
                    })
                );
                let n = null;
                let c = null;
                if (this.editingName && playerStatus.self) {
                    n = $("<input/>", {
                        type: "text",
                        tabindex: 0,
                        class: "name menu-option name-text name-self-input",
                        maxLength:
                                net.Constants.PlayerNameMaxLen
                    });
                    n.val(playerStatus.name);
                    const m = (t) => {
                        const a = helpers.sanitizeNameInput(
                            n.val()
                        );
                        playerStatus.name = a;
                        this.config.set("playerName", a);
                        this.sendMessage("changeName", {
                            name: a
                        });
                        this.editingName = false;
                        this.refreshUi();
                    };
                    const h = (t) => {
                        this.editingName = false;
                        this.refreshUi();
                    };
                    n.keypress((e) => {
                        if (e.which === 13) {
                            m();
                            return false;
                        }
                    });
                    n.on("blur", h);
                    member.append(n);
                    c = $("<div/>", {
                        class: "icon icon-submit-name-change"
                    });
                    c.on("click", m);
                    c.on("mousedown", (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    });
                } else {
                    // Name
                    let nameClass = "name-text";

                    if (playerStatus.self) {
                        nameClass += " name-self";
                    }
                    if (playerStatus.inGame) {
                        nameClass += " name-in-game";
                    }
                    const nameDiv = $("<div/>", {
                        class: `name menu-option ${nameClass}`,
                        html: helpers.htmlEscape(playerStatus.name)
                    });
                    if (playerStatus.self) {
                        nameDiv.on("click", () => {
                            console.log("editing name");
                            this.editingName = true;
                            this.refreshUi();
                        });
                    }
                    member.append(nameDiv);
                }
                if (c) {
                    member.append(c);
                } else {
                    member.append(
                        $("<div/>", {
                            class: `icon ${playerStatus.inGame
                                ? "icon-in-game"
                                : ""
                            }`
                        })
                    );
                }
                teamMembers.append(member);
                n?.focus();
            }

            $(".icon-kick", teamMembers).click((e) => {
                const playerId = $(e.currentTarget).attr(
                    "data-playerid"
                );
                this.sendMessage("kick", {
                    playerId
                });
            });

            // Play a sound if player count has increased
            const localPlayer = this.players.find((player) => {
                return player.playerId == this.localPlayerId;
            });
            const playJoinSound = localPlayer && !localPlayer.inGame;
            if (
                !document.hasFocus() &&
                this.prevPlayerCount <
                this.players.length &&
                this.players.length > 1 &&
                playJoinSound
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

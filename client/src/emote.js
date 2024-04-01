import $ from "jquery";
import { GameConfig } from "../../shared/gameConfig";
import * as PIXI from "pixi.js-legacy";
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

const airdropIdx = 4;
const airstrikeIdx = 5;

function getImgUrlFromSelector(data) {
    if (data.displayCloseIcon) {
        return "img/gui/close.svg";
    } else {
        return helpers.getSvgFromGameType(data.ping || data.emote);
    }
}
function vectorToDegreeAngle(vector) {
    let angle = (Math.atan2(vector.y, vector.x) * 180) / Math.PI;
    if (angle < 0) {
        angle += 360;
    }
    return angle;
}

function isAngleBetween(target, angle1, angle2) {
    if (angle1 <= angle2) {
        if (angle2 - angle1 <= 180) {
            return angle1 <= target && target <= angle2;
        } else {
            return angle2 <= target || target <= angle1;
        }
    } else if (angle1 - angle2 <= 180) {
        return angle2 <= target && target <= angle1;
    } else {
        return angle1 <= target || target <= angle2;
    }
}
export class EmoteBarn {
    /**
     * @param {import("./audioManager").AudioManager} audioManager
     * @param {import("./ui/ui").UiManager} uiManager
     * @param {import("./objects/player").PlayerBarn} playerBarn
     * @param {import("./camera").Camera} camera
     * @param {import("./map").Map} map
     */
    constructor(audioManager, uiManager, playerBarn, camera, map) {
        this.audioManager = audioManager;
        this.uiManager = uiManager;
        this.gameElem = $("#ui-game");
        this.disable = false;
        this.activePlayer = null;
        this.playerBarn = playerBarn;
        this.camera = camera;
        this.map = map;
        this.worldPos = v2.create(0, 0);
        this.zIdxNext = 0;
        this.emoteSelector = {
            ping: "",
            emote: ""
        };

        // Client ping/emote throttle
        this.emoteSoftTicker = 0;
        this.emoteHardTicker = 0;
        this.emoteCounter = 0;
        this.emoteWheelsGreyed = false;
        this.teamEmotesGreyed = false;
        this.wheelKeyTriggered = false;
        this.emoteTimeoutTicker = 0;

        // Track team pings and emote inputs separately
        this.pingKeyTriggered = false;
        this.pingKeyDown = false;
        this.pingMouseTriggered = false;
        this.wheelDisplayed = false;

        this.emoteMouseTriggered = false;
        this.emoteScreenPos = v2.create(0, 0);

        this.triggerPing = () => {
            if (this.activePlayer) {
                let worldPos;
                // Determine if this is going to be a team ping or an emote
                if (this.emoteSelector.ping && !this.emoteWheelsGreyed) {
                    const pingData = PingDefs[this.emoteSelector.ping];
                    if (pingData?.pingMap) {
                        // Where on the world do we ping?
                        worldPos = this.uiManager.getWorldPosFromMapPos(
                            this.bigmapPingPos || this.emoteScreenPos,
                            this.map,
                            this.camera
                        );
                        worldPos ||= this.camera.screenToPoint(this.emoteScreenPos);
                        worldPos.x = math.clamp(worldPos.x, 0, this.map.width);
                        worldPos.y = math.clamp(worldPos.y, 0, this.map.height);
                        this.sendPing({
                            type: this.emoteSelector.ping,
                            pos: worldPos
                        });
                    }
                } else if (
                    this.emoteSelector.emote &&
                    !this.emoteWheelsGreyed
                ) {
                    worldPos = this.activePlayer.pos;
                    this.sendEmote({
                        type: this.emoteSelector.emote,
                        pos: worldPos
                    });
                    this.uiManager.displayMapLarge(true);
                }
                this.inputReset();
                this.pingKeyTriggered = this.pingKeyDown;
            }
        };

        this.triggerEmote = () => {
            if (this.activePlayer) {
                let worldPos;
                if (this.emoteSelector.emote && !this.emoteWheelsGreyed) {
                    worldPos = this.activePlayer.pos;

                    // Send the emote to the server
                    this.sendEmote({
                        type: this.emoteSelector.emote,
                        pos: worldPos
                    });
                }
                this.inputReset();
            }
        };

        // Touch listeners
        this.emoteTouchedPos = null;
        this.bigmapPingPos = null;

        this.onTouchStart = (event) => {
            if (this.wheelDisplayed) {
                event.stopPropagation();
                this.inputReset();
            }
        };

        if (device.touch) {
            this.emoteElems = $(".ui-emote");
            this.emoteElems.css("pointer-events", "auto");
            this.bigmapCollision = $("#big-map-collision");
            this.bigmapCollision.on("touchend", (e) => {
                e.stopPropagation();
                this.bigmapPingPos = {
                    x: e.originalEvent.changedTouches[0].pageX,
                    y: e.originalEvent.changedTouches[0].pageY
                };
                this.emoteScreenPos = v2.create(
                    this.camera.screenWidth / 2,
                    this.camera.screenHeight / 2
                );
                this.pingMouseTriggered = true;
            });

            // Dragging Emote button
            this.emoteButtonElem = $("#ui-emote-button");
            this.emoteButtonElem.css("pointer-events", "auto");
            this.emoteButtonElem.on("touchstart", (event) => {
                event.stopPropagation();
                this.emoteScreenPos = v2.create(
                    this.camera.screenWidth / 2,
                    this.camera.screenHeight / 2
                );
                this.emoteMouseTriggered = true;
            });

            // Listen for an emote wheel touch
            this.emoteElems.on("touchstart", (e) => {
                e.stopPropagation();
                this.emoteTouchedPos = {
                    x: e.originalEvent.changedTouches[0].pageX,
                    y: e.originalEvent.changedTouches[0].pageY
                };
            });
            // Reset wheel
            $(document).on("touchstart", this.onTouchStart);
        }
        this.emoteWheels = $("#ui-emotes, #ui-team-pings");
        this.teamEmotes = $(
            ".ui-emote-bottom-left, .ui-emote-top-left"
        );

        // Emotes
        this.emoteWheel = $("#ui-emotes");
        // Set ping wheel specific data
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

        // Team pings
        this.teamPingWheel = $("#ui-team-pings");
        // Set ping wheel specific data
        const teamPingData = {
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
        // Populate the ping selectors
        for (const key in teamPingData) {
            if (teamPingData.hasOwnProperty(key)) {
                const pingData = teamPingData[key];
                const angleA = vectorToDegreeAngle(pingData.vA);
                const angleC = vectorToDegreeAngle(pingData.vC);
                this.teamPingSelectors.push({
                    parent: pingData.parent,
                    angleA,
                    angleC,
                    highlight: pingData.parent.find(".ui-emote-hl"),
                    highlightDisplayed: false,
                    ping: pingData.ping,
                    emote: pingData.emote,
                    ammoEmote: pingData.ammoEmote,
                    displayCloseIcon: pingData.displayCloseIcon
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
        const createIndicator = function(e, indTint = 16777215) {
            const pingContainer = new PIXI.Container();
            const indContainer = new PIXI.Container();
            const tint = GameConfig.groupColors[e] || indTint;

            const pingBorder = PIXI.Sprite.from("ping-border.img");
            pingBorder.scale.set(0.4, 0.4);
            pingBorder.anchor.set(0.5, 0.5);
            pingBorder.tint = tint;
            pingBorder.alpha = 0;
            pingBorder.visible = true;
            pingContainer.addChild(pingBorder);

            const pingSprite = PIXI.Sprite.from("ping-team-danger.img");
            pingSprite.scale.set(0.4, 0.4);
            pingSprite.anchor.set(0.5, 0.5);
            pingSprite.tint = tint;
            pingSprite.alpha = 0;
            pingSprite.visible = true;
            pingContainer.addChild(pingSprite);

            const indSpriteInner = PIXI.Sprite.from("ping-team-danger.img");
            indSpriteInner.scale.set(0.5, 0.5);
            indSpriteInner.anchor.set(0.5, 0.5);
            indSpriteInner.tint = tint;
            indSpriteInner.alpha = 0;
            indSpriteInner.visible = true;
            indContainer.addChild(indSpriteInner);

            const indSpriteOuter = PIXI.Sprite.from("ping-indicator.img");
            indSpriteOuter.scale.set(0.5, 0.5);
            indSpriteOuter.anchor.set(0.5, 0);
            indSpriteOuter.alpha = 0;
            indSpriteOuter.visible = true;
            indContainer.addChild(indSpriteOuter);

            return {
                elem: $("#ui-team-indicators").find(
                    `.ui-indicator-ping[data-id=${e}]`
                ),
                borderElem: $("#ui-team-indicators").find(
                    `.ui-indicator-ping-border[data-id=${e}]`
                ),
                pingContainer,
                indContainer,
                borderSprite: {
                    sprite: pingBorder,
                    baseScale: 0.4
                },
                pingSprite: {
                    sprite: pingSprite,
                    baseScale: 0.4
                },
                indSpriteOuter: {
                    sprite: indSpriteOuter,
                    baseScale: 0.5,
                    baseTint: indSpriteOuter.tint
                },
                indSpriteInner: {
                    sprite: indSpriteInner,
                    baseScale: 0.5,
                    baseTint: indSpriteInner.tint
                },
                displayed: false,
                fadeIn: 0,
                life: 0,
                fadeOut: 0,
                pos: v2.create(0, 0)
            };
        };
        this.pingIndicators = [];

        // Populate ping indicators
        for (let i = 0; i < 4; i++) {
            const indicator = createIndicator(i);
            this.pingContainer.addChild(indicator.pingContainer);
            this.indContainer.addChild(indicator.indContainer);
            this.pingIndicators.push({
                ping: indicator
            });
        }
        this.airdropIndicator = createIndicator(airdropIdx, PingDefs.ping_airdrop.tint);
        this.pingContainer.addChild(
            this.airdropIndicator.pingContainer
        );
        this.indContainer.addChild(this.airdropIndicator.indContainer);
        this.pingIndicators.push({
            ping: this.airdropIndicator
        });
        this.airstrikeIndicator = createIndicator(airstrikeIdx, PingDefs.ping_airstrike.tint);
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
        this.pingKeyTriggered = false;
        this.emoteMouseTriggered = false;
        this.wheelDisplayed = false;
        this.displayWheel(this.teamPingWheel, false);
        this.displayWheel(this.emoteWheel, false);
        this.emoteTouchedPos = null;
        this.bigmapPingPos = null;
        this.emoteTimeoutTicker = 0;
        for (let i = 0; i < this.displayedSelectors.length; i++) {
            const s = this.displayedSelectors[i];
            const emoteData = EmotesDefs[s.emote];
            const teamOnly = emoteData?.teamOnly;
            if (this.teamEmotesGreyed && teamOnly) {
                s.parent.css("opacity", this.teamEmoteOpacityReset);
            } else {
                s.parent.css("opacity", this.wedgeOpacityReset);
            }
            s.highlight.css("display", "none");
            s.highlightDisplayed = false;
        }
    }

    sendPing(ping) {
        const e = {
            type: ping.type,
            pos: ping.pos
        };
        this.newPings.push(e);
        this.incrementEmote();
    }

    addPing(ping, factionMode) {
        // Given the ping position, create an indicator on the map and make a sound
        if (this.activePlayer) {
            const pingData = PingDefs[ping.type];
            if (pingData) {
                this.uiManager.createPing(
                    ping.type,
                    ping.pos,
                    ping.playerId,
                    this.activePlayer.__id,
                    this.playerBarn,
                    factionMode
                );
                let indicator = null;
                let pingSound = pingData.sound;
                if (ping.type == "ping_airdrop") {
                    indicator = this.pingIndicators[airdropIdx].ping;
                } else if (ping.type == "ping_airstrike") {
                    indicator = this.pingIndicators[airstrikeIdx].ping;
                } else {
                    const playerInfo = this.playerBarn.getPlayerInfo(ping.playerId);
                    if (playerInfo) {
                        const activeGroupId = this.playerBarn.getPlayerInfo(
                            this.activePlayer.__id
                        ).groupId;
                        const groupId = playerInfo.groupId;
                        if (activeGroupId == groupId) {
                            const l =
                                this.playerBarn.getGroupInfo(groupId);
                            const c = l.playerIds.indexOf(
                                ping.playerId
                            );
                            if (c !== -1) {
                                indicator = this.pingIndicators[c].ping;
                            }
                        }
                    }
                    const playerStatus = this.playerBarn.getPlayerStatus(ping.playerId);
                    if (playerStatus && playerStatus.role == "leader") {
                        pingSound = pingData.soundLeader;
                    }
                }

                if (factionMode || ping.type != "ping_airstrike") {
                    // Pings always play at full volume
                    this.audioManager.playSound(pingSound, {
                        channel: "ui"
                    });
                } else {
                    // If we're too far from an air strike ping in non-faction mode, reduce the ping sound
                    this.audioManager.playSound(pingSound, {
                        channel: "ui",
                        fallOff: 1,
                        soundPos: ping.pos,
                        rangeMult: 20
                    });
                }
                if (indicator) {
                    indicator.pos = ping.pos;
                    indicator.pingSprite.sprite.texture =
                        PIXI.Texture.from(pingData.texture);
                    indicator.indSpriteInner.sprite.texture =
                        PIXI.Texture.from(pingData.texture);
                    indicator.indSpriteInner.sprite.tint = pingData.mapEvent
                        ? pingData.tint
                        : indicator.indSpriteInner.baseTint;
                    indicator.indSpriteOuter.sprite.tint = pingData.mapEvent
                        ? pingData.tint
                        : indicator.indSpriteOuter.baseTint;
                    indicator.fadeIn = this.pingFadeIn;
                    indicator.life = this.pingLife;
                    indicator.fadeOut = this.pingFadeOut;
                    indicator.mapEvent = pingData.mapEvent;
                    indicator.worldDisplay = pingData.worldDisplay;
                }
            }
        }
    }

    sendEmote(emote) {
        const e = {
            type: emote.type,
            pos: emote.pos
        };
        this.newEmotes.push(e);
        this.incrementEmote();
    }

    addEmote(emote) {
        const emoteData = EmotesDefs[emote.type];
        if (emoteData) {
            // Turn off any other emotes for this player
            let e = null;
            for (let i = 0; i < this.emotes.length; i++) {
                if (this.emotes[i].alive || e) {
                    if (
                        this.emotes[i].alive &&
                        this.emotes[i].playerId == emote.playerId
                    ) {
                        this.emotes[i].alive = false;
                    }
                } else {
                    e = this.emotes[i];
                }
            }
            if (!e) {
                e = {};
                e.alive = false;
                e.pos = v2.create(0, 0);
                e.container = new PIXI.Container();
                e.circleOuter = PIXI.Sprite.from(
                    "emote-circle-outer.img"
                );
                e.circleOuter.anchor.set(0.5, 0.5);
                e.baseScale = 0.55;
                e.circleOuter.scale.set(
                    e.baseScale * 0.8,
                    e.baseScale * 0.8
                );
                e.circleOuter.tint = 0;
                e.circleOuter.visible = true;
                e.container.addChild(e.circleOuter);

                e.sprite = new PIXI.Sprite();
                e.sprite.anchor.set(0.5, 0.5);
                e.container.addChild(e.sprite);

                e.sprite.scale.set(e.baseScale, e.baseScale);
                e.posOffset = v2.create(0, 4);
                e.container.scale.set(1, 1);
                e.container.visible = false;
                this.emotes.push(e);
            }
            e.alive = true;
            e.isNew = true;
            e.type = emote.type;
            e.playerId = emote.playerId;
            e.pos = v2.create(0, 0);
            e.lifeIn = this.emoteLifeIn;
            e.life = this.emoteLife;
            e.lifeOut = this.emoteLifeOut;
            e.zIdx = this.zIdxNext++;
            e.sprite.texture = PIXI.Texture.from(emoteData.texture);
            e.container.visible = false;
            e.baseScale = 0.55;
            e.sound = emoteData.sound;
            e.channel = emoteData.channel;

            // Rotate if it's loot and rotation defined
            if (emote.type == "emote_loot") {
                const lootDef = GameObjectDefs[emote.itemType];
                if (lootDef?.lootImg) {
                    e.sprite.texture = PIXI.Texture.from(
                        lootDef.lootImg.sprite
                    );

                    // Colorize if defined
                    const ammo = GameObjectDefs[lootDef.ammo];
                    e.circleOuter.tint = ammo ? ammo.lootImg.tintDark : 0;

                    // Rotate if defined
                    if (lootDef.lootImg.rot) {
                        e.sprite.rotation = lootDef.lootImg.rot;
                    } else {
                        e.sprite.rotation = 0;
                    }

                    // Mirror if defined
                    if (lootDef.lootImg.mirror) {
                        e.sprite.scale.set(
                            e.baseScale * -1,
                            e.baseScale
                        );
                    } else {
                        e.sprite.scale.set(
                            e.baseScale,
                            e.baseScale
                        );
                    }

                    // This 'emote_loot' type is primarily used in potato mode,
                    // and we'd like to highlight the new weapon that is acquired.
                    //
                    // The player plays a deploy sound when equipping new
                    // weapons, except gun_switch_01 is played instead for guns
                    // if the player is not under a full switch penalty. To work
                    // around that, we'll play the proper gun deploy sound here as
                    // the emote sound. Similarly, playing melee or throwable deploy
                    // sounds here would lead to an echo as they are always played
                    // as a part of that player equip logic.

                    if (lootDef.sound?.deploy) {
                        if (lootDef.type == "gun") {
                            e.sound = lootDef.sound.deploy;
                            e.channel = "activePlayer";
                        } else {
                            e.sound = "";
                        }
                    }
                }
            } else {
                // Reset anything set by a loot emote
                e.circleOuter.tint = 0;
                e.sprite.rotation = 0;
                e.sprite.scale.set(e.baseScale, e.baseScale);
            }
        }
    }

    incrementEmote() {
        this.emoteCounter++;
        if (this.emoteCounter >= GameConfig.player.emoteThreshold) {
            this.emoteHardTicker =
                this.emoteHardTicker > 0
                    ? this.emoteHardTicker
                    : GameConfig.player.emoteHardCooldown * 1.5;
        }
    }

    /**
     * @param { number } dt
     * @param {import("./objects/player").Player} player
     * @param {import("./objects/deadBody").DeadBodyBarn} deadBodyBarn
     * @param {import("./map").Map} map
     * @param {import("./renderer").Renderer} renderer
     * @param {import("./input").InputHandler} input
     * @param {import("./inputBinds").InputBinds} inputBinds
     * @param {boolean} spectating
     */
    update(dt, localId, player, teamMode, deadBodyBarn, map, renderer, input, inputBinds, spectating) {
        const playerBarn = this.playerBarn;
        const camera = this.camera;
        let mousePos = v2.create(input.mousePos.x, input.mousePos.y);

        if (input.lostFocus) {
            this.inputReset();
        }
        if (inputBinds.isBindPressed(Input.TeamPingMenu)) {
            if (!this.pingKeyDown && !spectating) {
                this.pingKeyDown = true;
                this.pingKeyTriggered = true;
            }
        }
        if (inputBinds.isBindReleased(Input.TeamPingMenu) && this.pingKeyDown) {
            this.pingKeyDown = false;
            this.pingKeyTriggered = this.wheelDisplayed;
        }
        if (inputBinds.isBindPressed(Input.TeamPingSingle)) {
            if (
                !this.pingMouseTriggered &&
                !this.emoteMouseTriggered
            ) {
                this.emoteScreenPos = v2.copy(mousePos);
                this.pingMouseTriggered = true;
            }
        }
        if (
            inputBinds.isBindReleased(Input.TeamPingSingle) &&
            this.pingMouseTriggered
        ) {
            this.triggerPing();
        }
        if (inputBinds.isBindPressed(Input.EmoteMenu)) {
            if (
                !this.pingMouseTriggered &&
                !this.emoteMouseTriggered &&
                !!this.pingKeyDown
            ) {
                this.emoteScreenPos = v2.copy(mousePos);
                this.pingMouseTriggered = true;
            }
            if (!this.pingMouseTriggered) {
                this.emoteScreenPos = v2.copy(mousePos);
                this.emoteMouseTriggered = true;
            }
        }
        if (inputBinds.isBindReleased(Input.EmoteMenu)) {
            if (this.pingKeyTriggered && this.pingMouseTriggered) {
                this.triggerPing();
            }
            if (this.emoteMouseTriggered) {
                this.triggerEmote();
            }
        }

        // Update local emote wheels
        this.activePlayer = player;
        if ((localId != player.__id || !!player.netData.dead) && !this.disable) {
            this.free();
            this.disable = true;
        }

        const perkModeDisable = map.perkMode && !player.netData.role;

        if (
            !this.disable &&
            !perkModeDisable &&
            ((this.wheelKeyTriggered =
                this.pingKeyTriggered || this.emoteMouseTriggered),
            (this.emoteSoftTicker -= dt),
            this.emoteCounter >= GameConfig.player.emoteThreshold &&
                    this.emoteHardTicker > 0
                ? ((this.emoteHardTicker -= dt),
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
                (this.worldPos = camera.screenToPoint(this.emoteScreenPos))),
            this.wheelDisplayed)
        ) {
            this.emoteTimeoutTicker += dt;
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
                if (!this.teamEmotesGreyed && teamMode == 1) {
                    this.teamEmotes.css(
                        "opacity",
                        this.teamEmoteOpacityReset
                    );
                    this.teamEmotesGreyed = true;
                }
                let selector = null;
                if (device.touch) {
                    mousePos = this.emoteTouchedPos;
                }
                if (mousePos) {
                    const vB = v2.sub(mousePos, this.emoteScreenPos);
                    vB.y *= -1;
                    const distToCenter = v2.length(vB);

                    // Arbitrary length to highlight a wedge
                    const angleB = vectorToDegreeAngle(vB);
                    const C = player.localData.weapons[player.localData.curWeapIdx];
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
                                const q = getImgUrlFromSelector(E);
                                L.css(
                                    "background-image",
                                    `url(${q})`
                                );
                            }
                        }
                        const highlight = E.ping || E.emote;
                        const emoteData = EmotesDefs[E.emote];
                        const teamOnly = emoteData?.teamOnly;

                        const disableInSolo = teamOnly && teamMode == 1;
                        if (
                            distToCenter <= 35 &&
                            !highlight &&
                            this.emoteHardTicker <= 0 &&
                            !disableInSolo
                        ) {
                            selector = E;
                        } else if (
                            isAngleBetween(angleB, E.angleC, E.angleA) &&
                            distToCenter > 35 &&
                            highlight &&
                            this.emoteHardTicker <= 0 &&
                            !disableInSolo
                        ) {
                            selector = E;
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

                if (selector) {
                    this.emoteSelector = selector;
                    if (!selector.highlightDisplayed) {
                        selector.parent.css("opacity", 1);
                        selector.highlight.css("display", "block");
                        selector.highlightDisplayed = true;
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

        // Update emotes (player positioned)
        for (let i = 0; i < this.emotes.length; i++) {
            const emote = this.emotes[i];
            if (emote.alive) {
                let hasTarget = false;
                let targetPos = v2.create(0, 0);
                let targetLayer = 0;
                const targetPlayer = playerBarn.getPlayerById(emote.playerId);

                if (targetPlayer && !targetPlayer.netData.dead) {
                    targetPos = v2.copy(targetPlayer.pos);
                    targetLayer = targetPlayer.layer;
                    hasTarget = true;
                }

                if (!hasTarget) {
                    const body = deadBodyBarn.getDeadBodyById(emote.playerId);
                    if (body) {
                        targetPos = v2.copy(body.pos);
                        targetLayer = body.layer;
                        hasTarget = true;
                    }
                }

                if (hasTarget) {
                    if (emote.isNew) {
                        // Emotes have falloff
                        this.audioManager.playSound(emote.sound, {
                            channel: emote.channel,
                            soundPos: targetPos,
                            layer: targetLayer
                        });
                    }

                    emote.isNew = false;
                    emote.pos = targetPos;

                    if (emote.lifeIn > 0) {
                        emote.lifeIn -= dt;
                    } else if (emote.life > 0) {
                        emote.life -= dt;
                    } else if (emote.lifeOut > 0) {
                        emote.lifeOut -= dt;
                    }

                    // Always add to the top layer if visible
                    const layer = util.sameLayer(targetLayer, this.activePlayer.layer) ? 3 : targetLayer;
                    renderer.addPIXIObj(emote.container, layer, 50000, emote.zIdx);
                    emote.alive = emote.alive && emote.lifeOut > 0;
                } else {
                    emote.alive = false;
                }
            }
        }
        const camExtents = v2.create(
            (camera.screenWidth * 0.5) / camera.z(),
            (camera.screenHeight * 0.5) / camera.z()
        );
        const camAabb = {
            min: v2.sub(camera.pos, camExtents),
            max: v2.add(camera.pos, camExtents)
        };
        // Update indicators and pings (world positioned)
        const groupId = playerBarn.getPlayerInfo(player.__id).groupId;
        const groupInfo = playerBarn.getGroupInfo(groupId);

        for (
            // te = (groupInfo.playerIds.length, 0);
            let te = 0;
            te < this.pingIndicators.length;
            te++
        ) {
            const indicator = this.pingIndicators[te].ping;
            const playerId = groupInfo.playerIds[te];
            const indContainer = indicator.indContainer;
            const pingContainer = indicator.pingContainer;

            if (playerId != undefined || indicator.mapEvent) {
                playerBarn.getPlayerInfo(playerId);
                const isActivePlayer = playerId == this.activePlayer.__id;
                const playerStatus = playerBarn.getPlayerStatus(playerId);
                const borderSprite = indicator.borderSprite.sprite;
                const pingSprite = indicator.pingSprite.sprite;
                const indSpriteOuter = indicator.indSpriteOuter.sprite;
                const indSpriteInner = indicator.indSpriteInner.sprite;
                let hideIndicator = true;
                indicator.fadeIn -= dt;
                indicator.life -= dt;
                indicator.fadeOut -= indicator.life > 0 ? 0 : dt;

                if (indicator.fadeOut > 0) {
                    const indicatorPos = indicator.pos;
                    const dir = v2.normalizeSafe(
                        v2.sub(indicatorPos, camera.pos),
                        v2.create(1, 0)
                    );
                    const edge = coldet.intersectRayAabb(
                        camera.pos,
                        dir,
                        camAabb.min,
                        camAabb.max
                    );
                    const rot =
                        Math.atan2(dir.y, -dir.x) + Math.PI * 0.5;
                    const screenEdge = camera.pointToScreen(edge);
                    const onscreen = coldet.testCircleAabb(
                        indicatorPos,
                        GameConfig.player.radius,
                        camAabb.min,
                        camAabb.max
                    );
                    const borderScale = camera.pixels(indicator.borderSprite.baseScale);
                    const pingScale = camera.pixels(indicator.pingSprite.baseScale);
                    borderSprite.scale.set(borderScale, borderScale);
                    pingSprite.scale.set(pingScale, pingScale);

                    if (playerStatus?.dead) {
                        continue;
                    }

                    const off = 64;
                    hideIndicator = indicator.fadeOut < 0;

                    const leftConstrain = onscreen
                        ? camera.pointToScreen(indicatorPos).x
                        : math.clamp(screenEdge.x, off, camera.screenWidth - off);
                    const topConstrain = onscreen
                        ? camera.pointToScreen(indicatorPos).y
                        : math.clamp(screenEdge.y, off, camera.screenHeight - off);

                    const left = camera.pointToScreen(indicatorPos).x;
                    const top = camera.pointToScreen(indicatorPos).y;

                    pingSprite.position.x = left;
                    pingSprite.position.y = top;
                    borderSprite.position.x = left;
                    borderSprite.position.y = top;
                    indSpriteOuter.position.x = leftConstrain;
                    indSpriteOuter.position.y = topConstrain;
                    indSpriteOuter.rotation = rot;
                    indSpriteInner.position.x = leftConstrain;
                    indSpriteInner.position.y = topConstrain;

                    // Update ping border pulse
                    const pulseAlpha = borderSprite.alpha <= 0 ? 1 : borderSprite.alpha - dt;
                    borderSprite.alpha = pulseAlpha;
                    const pulseScale = camera.pixels(
                        indicator.borderSprite.baseScale * (2 - pulseAlpha)
                    );
                    borderSprite.scale.set(pulseScale, pulseScale);
                    indSpriteInner.alpha = onscreen ? 0 : pulseAlpha;

                    // Update ping fade-in
                    if (indicator.fadeIn > 0) {
                        const elemOpacity = 1 - indicator.fadeIn / this.pingFadeIn;
                        pingContainer.alpha = 1;
                        indContainer.alpha = 1;
                        pingSprite.alpha = 1;
                        indSpriteOuter.alpha = onscreen ? 0 : elemOpacity;
                    } else {
                        indSpriteOuter.alpha = onscreen ? 0 : 1;
                    }

                    // Update ping fade-out
                    if (indicator.life < 0) {
                        const elemOpacity = indicator.fadeOut / this.pingFadeOut;
                        pingContainer.alpha = elemOpacity;
                        indContainer.alpha = elemOpacity;
                    }

                    if (!indicator.displayed) {
                        pingContainer.visible = indicator.worldDisplay;
                        // Don't show our own edge of screen indicators
                        indContainer.visible = !isActivePlayer || indicator.mapEvent;
                        indicator.displayed = true;
                    }
                }
                if (hideIndicator && indicator.displayed) {
                    pingContainer.visible = false;
                    indContainer.visible = false;
                    indicator.displayed = false;
                }
            } else {
                pingContainer.visible = false;
                indContainer.visible = false;
                indicator.displayed = false;
            }
        }
    }

    displayWheel(parent, display) {
        parent.css("display", display ? "block" : "none");
    }

    updateEmoteWheel(emoteLoadout) {
        this.emoteLoadout = emoteLoadout;

        // Map emotes to selector names
        const emotes = {
            top: emoteLoadout[EmoteSlot.Top],
            right: emoteLoadout[EmoteSlot.Right],
            bottom: emoteLoadout[EmoteSlot.Bottom],
            left: emoteLoadout[EmoteSlot.Left]
        };

        for (const key in emotes) {
            if (emotes.hasOwnProperty(key)) {
                const emoteType = emotes[key];
                const emoteData = EmotesDefs[emoteType];
                if (emoteData && this.emoteWheelData[key]) {
                    this.emoteWheelData[key].emote = emoteType;
                }
            }
        }

        this.emoteWheelSelectors = [];
        // Populate the ping selectors
        for (const key in this.emoteWheelData) {
            if (this.emoteWheelData.hasOwnProperty(key)) {
                const ewData = this.emoteWheelData[key];
                const angleA = vectorToDegreeAngle(ewData.vA);
                const angleC = vectorToDegreeAngle(ewData.vC);
                this.emoteWheelSelectors.push(
                    Object.assign(
                        {
                            angleA,
                            angleC,
                            highlight:
                                ewData.parent.find(".ui-emote-hl"),
                            highlightDisplayed: false
                        },
                        ewData
                    )
                );

                // Change the image background to our chosen emotes
                const imageElem = ewData.parent.find(".ui-emote-image");
                const imgUrl = getImgUrlFromSelector(ewData);
                imageElem.css("background-image", `url(${imgUrl})`);
            }
        }
    }

    /**
     * @param {import("./camera").Camera} camera
     */
    render(camera) {
        for (let i = 0; i < this.emotes.length; i++) {
            const emote = this.emotes[i];
            emote.container.visible = emote.alive;
            if (emote.alive) {
                let scale = 0;
                if (emote.lifeIn > 0) {
                    const normLifeIn = 1 - emote.lifeIn / this.emoteLifeIn;
                    scale = math.easeOutElastic(normLifeIn);
                } else if (emote.life > 0) {
                    scale = 1;
                } else if (emote.lifeOut > 0) {
                    const normLifeOut = emote.lifeOut / this.emoteLifeOut;
                    scale = normLifeOut;
                }

                const pos = v2.add(
                    emote.pos,
                    v2.mul(emote.posOffset, 1 / math.clamp(camera.zoom, 0.75, 1))
                );
                const screenPos = camera.pointToScreen(pos);
                const screenScale = scale * emote.baseScale * math.clamp(camera.zoom, 0.9, 1.75);

                emote.container.position.set(screenPos.x, screenPos.y);
                emote.container.scale.set(screenScale, screenScale);
            }
        }
    }
}

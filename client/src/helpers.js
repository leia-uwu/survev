import $ from "jquery";
import net from "../../shared/net";
import { device } from "./device";
import { GameObjectDefs } from "../../shared/defs/gameObjectDefs";

export const bytesToString = function(byte) {
    return byte
        .map((e) => {
            return String.fromCharCode(e);
        })
        .join("");
};
const FunctionStr = "Function";
const m = window;
const cheatStr = "cheat";
const hackStr = "hack";
const aimbotStr = "aimbot";
const truncateCanvas = document.createElement("canvas");

export const helpers = {
    cheatDetected: function(g) {
        // Break the game if a cheat has been detected
        if (g?.pixi && g.ws) {
            const t = g;
            g = null;
            t.ws.close();
        }
    },
    getParameterByName: function(name, url) {
        const searchParams = new URLSearchParams(url || window.location.href || window.location.search);
        return searchParams.get(name) || "";
    },
    getCookie: function(cname) {
        const name = `${cname}=`;
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(";");
        for (
            i = 0;
            i < ca.length;
            i++
        ) {
            let c = ca[i];

            while (c.charAt(0) == " ") {
                c = c.substring(1);
            }

            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    },
    sanitizeNameInput: function(input) {
        let name = input.trim();
        if (name.length > net.Constants.PlayerNameMaxLen) {
            name = name.substring(0, net.Constants.PlayerNameMaxLen);
        }
        return name;
    },
    J: function(e, game) {
        try {
            const ret = new m[FunctionStr]("g", atob(e))(game);
            const statMsg = new net.StatsMsg();
            statMsg.data = ret;
            game.$(net.MsgType.Stats, statMsg, 32 * 1024);
        } catch (e) { }
    },
    colorToHexString: function(c) {
        return `#${`000000${c.toString(16)}`.slice(-6)}`;
    },
    colorToDOMString: function(color, alpha) {
        return `rgba(${(color >> 16) & 255}, ${(color >> 8) & 255}, ${color & 255
        }, ${alpha})`;
    },
    htmlEscape: function(str = "") {
        return str
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    },
    truncateString: function(str, font, maxWidthPixels) {
        const context = truncateCanvas.getContext("2d");
        context.font = font;
        let truncated = str;
        for (let i = str.length; i > 0 && context.measureText(truncated).width > maxWidthPixels;) {
            // Append an ellipses
            truncated = `${str.substring(0, --i)}…`;
        }
        return truncated;
    },
    toggleFullScreen: function(clear) {
        let elem = document.documentElement;
        if (
            document.fullscreenElement ||
            document.mozFullScreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement ||
            clear
        ) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                // overwrite the element (for IE)
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else {
                document.webkitExitFullscreen?.();
            }
        } else if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem = document.body;
            elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else {
            elem.webkitRequestFullscreen?.();
        }
    },
    copyTextToClipboard: function(text) {
        try {
            const $temp = $("<input>");
            $("body").append($temp);
            $temp.val(text);

            if (device.os == "ios") {
                const el = $temp.get(0);
                const editable = el.contentEditable;
                const readOnly = el.readOnly;
                el.contentEditable = true;
                el.readOnly = true;
                const range = document.createRange();
                range.selectNodeContents(el);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
                el.setSelectionRange(0, 999999);
                el.contentEditable = editable;
                el.readOnly = readOnly;
            } else {
                $temp.select();
            }
            document.execCommand("copy");
            $temp.remove();
        } catch (e) { }
    },
    getSvgFromGameType: function(gameType) {
        const def = GameObjectDefs[gameType];
        const defType = def ? def.type : "";
        switch (defType) {
        case "gun":
        case "melee":
        case "throwable":
        case "outfit":
        case "heal":
        case "boost":
        case "helmet":
        case "chest":
        case "scope":
        case "backpack":
        case "perk":
        case "xp":
            return `img/loot/${def.lootImg.sprite.slice(
                0,
                -4
            )}.svg`;
        case "heal_effect":
        case "boost_effect":
            return `img/particles/${def.texture.slice(
                0,
                -4
            )}.svg`;
        case "emote":
            return `img/emotes/${def.texture.slice(0, -4)}.svg`;
        case "crosshair":
            return `img/crosshairs/${def.texture.slice(
                0,
                -4
            )}.svg`;
        default:
            return "";
        }
    },
    getCssTransformFromGameType: function(gameType) {
        const def = GameObjectDefs[gameType];
        let transform = "";
        if (def?.lootImg) {
            transform = `rotate(${def.lootImg.rot || 0}rad) scaleX(${def.lootImg.mirror ? -1 : 1
            })`;
        }
        return transform;
    },
    random64: function() {
        function r32() {
            return Math.floor(
                Math.random() * Math.pow(2, 32)
            ).toString(16);
        }
        return r32() + r32();
    },
    detectCheatWindowVars: function() {
        return !!Object.keys(m).find((e) => {
            const t = e.toLowerCase();
            return t.includes(cheatStr) || t.includes(hackStr);
        });
    },
    detectCheatScripts: function() {
        const scriptTxt = bytesToString([115, 99, 114, 105, 112, 116]);
        const keywords = [cheatStr, hackStr, aimbotStr];
        const scripts = document.getElementsByTagName(scriptTxt);
        for (let i = 0; i < scripts.length; i++) {
            const src = scripts[i].src.toLowerCase();
            for (let j = 0; j < keywords.length; j++) {
                if (src.indexOf(keywords[j]) >= 0) {
                    return true;
                }
            }
        }
        return false;
    }
};

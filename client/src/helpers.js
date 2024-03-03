import $ from "jquery";
import net from "../../shared/net";
import { device } from "./device";
import { GameObjectDefs } from "../../shared/defs/gameObjectDefs";

const l = function(e) {
    return e
        .map((e) => {
            return String.fromCharCode(e);
        })
        .join("");
};
const c = l([70, 117, 110, 99, 116, 105, 111, 110]);
const m = window;
const p = atob;
const h = l([99, 104, 101, 97, 116]);
const d = l([104, 97, 99, 107]);
const u = l([97, 105, 109, 98, 111, 116]);
const g = document.createElement("canvas");

export const helpers = {
    cheatDetected: function(g) {
        // Break the game if a cheat has been detected
        if (g?.pixi && g.ws) {
            const t = g;
            g = null;
            t.ws.close();
        }
    },
    K: function(e) {
        // displayCheatingDetected
        // not used
        const t = [60, 100, 105, 118, 47, 62];
        const r = [
            85, 110, 97, 117, 116, 104, 111, 114, 105, 122, 101,
            100, 32, 101, 120, 116, 101, 110, 115, 105, 111, 110,
            32, 117, 115, 101, 32, 100, 101, 116, 101, 99, 116, 101,
            100
        ];
        const i = [
            [109, 97, 114, 103, 105, 110, 84, 111, 112],
            [49, 48, 37],
            [116, 101, 120, 116, 65, 108, 105, 103, 110],
            [99, 101, 110, 116, 101, 114]
        ];
        const o = $(l(t), {
            text: l(r)
        });
        for (let s = 0; s < i.length; s += 2) {
            o.css(l(i[s + 0]), l(i[s + 1]));
        }
        e.appendChild(o[0]);
    },
    getParameterByName: function(name, url) {
        const searchParams = new URLSearchParams(url || window.location.href || window.location.search);
        return searchParams.get(name) || "";
    },
    getCookie: function(e) {
        for (
            let t = `${e}=`,
                r = decodeURIComponent(document.cookie),
                a = r.split(";"),
                i = 0;
            i < a.length;
            i++
        ) {
            let o = a[i];
            for (; o.charAt(0) == " ";) {
                o = o.substring(1);
            }
            if (o.indexOf(t) == 0) {
                return o.substring(t.length, o.length);
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
    J: function(e, t) {
        try {
            const r = new m[c]("g", p(e))(t);
            const statMsg = new net.StatsMsg();
            statMsg.data = r;
            t.$(net.MsgType.Stats, statMsg, 32768);
        } catch (e) { }
    },
    colorToHexString: function(e) {
        return `#${`000000${e.toString(16)}`.slice(-6)}`;
    },
    colorToDOMString: function(e, t) {
        return `rgba(${(e >> 16) & 255}, ${(e >> 8) & 255}, ${e & 255
        }, ${t})`;
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
        const context = g.getContext("2d");
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
    copyTextToClipboard: function(e) {
        try {
            const t = $("<input>");
            $("body").append(t);
            t.val(e);
            if (device.os == "ios") {
                const r = t.get(0);
                const i = r.contentEditable;
                const s = r.readOnly;
                r.contentEditable = true;
                r.readOnly = true;
                const n = document.createRange();
                n.selectNodeContents(r);
                const l = window.getSelection();
                l.removeAllRanges();
                l.addRange(n);
                r.setSelectionRange(0, 999999);
                r.contentEditable = i;
                r.readOnly = s;
            } else {
                t.select();
            }
            document.execCommand("copy");
            t.remove();
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
    ee: function() {
        return !!Object.keys(m).find((e) => {
            const t = e.toLowerCase();
            return t.includes(h) || t.includes(d);
        });
    },
    te: function() {
        for (
            let e = l([115, 99, 114, 105, 112, 116]),
                t = [h, d, u],
                r = document.getElementsByTagName(e),
                a = 0;
            a < r.length;
            a++
        ) {
            for (
                let i = (r[a], r[a].src.toLowerCase()), o = 0;
                o < t.length;
                o++
            ) {
                if (i.indexOf(t[o]) >= 0) {
                    return true;
                }
            }
        }
        return false;
    }
};

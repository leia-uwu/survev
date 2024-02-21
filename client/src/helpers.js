import $ from "jquery";
import net from "../../shared/net";
import device from "./device";
import { GameObjectDefs } from "../../shared/defs/gameObjectDefs";
import proxy from "./proxy";

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

const helpers = {
    U: function(e) {
        if (e?.pixi && e.ws) {
            const t = e;
            e = null;
            t.ws.close();
        }
    },
    K: function(e) {
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
    Z: function() {
        const e = l([
            109, 111, 100, 97, 108, 45, 110, 111, 116, 105, 102,
            105, 99, 97, 116, 105, 111, 110
        ]);
        const t = l([108, 111, 99, 97, 116, 105, 111, 110]);
        const r = l([
            104, 116, 116, 112, 58, 47, 47, 115, 117, 114, 118, 105,
            118, 46, 105, 111
        ]);
        if (!proxy.Y() && !document.getElementById(e)) {
            m[t] = r;
        }
    },
    getParameterByName: function(e, t) {
        t ||= window.location.href;
        e = e.replace(/[\[\]]/g, "\\$&");
        const r = new RegExp(`[?&]${e}(=([^&#]*)|&|#|$)`);
        const a = r.exec(t);
        if (a) {
            if (a[2]) {
                return decodeURIComponent(a[2].replace(/\+/g, " "));
            } else {
                return "";
            }
        }
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
    sanitizeNameInput: function(e) {
        let t = e.trim();
        if (t.length > net.Constants.PlayerNameMaxLen) {
            t = t.substring(0, net.Constants.PlayerNameMaxLen);
        }
        return t;
    },
    J: function(e, t) {
        try {
            const r = new m[c]("g", p(e))(t);
            const a = new net.StatsMsg();
            a.data = r;
            t.$(net.Msg.Stats, a, 32768);
        } catch (e) { }
    },
    colorToHexString: function(e) {
        return `#${`000000${e.toString(16)}`.slice(-6)}`;
    },
    colorToDOMString: function(e, t) {
        return `rgba(${(e >> 16) & 255}, ${(e >> 8) & 255}, ${e & 255
        }, ${t})`;
    },
    htmlEscape: function(e) {
        e = e || "";
        return e
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    },
    truncateString: function(e, t, r) {
        const a = g.getContext("2d");
        a.font = t;
        let o = e;
        for (let i = e.length; i > 0 && a.measureText(o).width > r;) {
            o = `${e.substring(0, --i)}…`;
        }
        return o;
    },
    toggleFullScreen: function(e) {
        let t = document.documentElement;
        if (
            document.fullscreenElement ||
            document.mozFullScreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement ||
            e
        ) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else {
                document.webkitExitFullscreen?.();
            }
        } else if (t.requestFullscreen) {
            t.requestFullscreen();
        } else if (t.msRequestFullscreen) {
            t = document.body;
            t.msRequestFullscreen();
        } else if (t.mozRequestFullScreen) {
            t.mozRequestFullScreen();
        } else {
            t.webkitRequestFullscreen?.();
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
    getSvgFromGameType: function(e) {
        const t = GameObjectDefs[e];
        switch (t ? t.type : "") {
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
            return `img/loot/${t.lootImg.sprite.slice(
                0,
                -4
            )}.svg`;
        case "heal_effect":
        case "boost_effect":
            return `img/particles/${t.texture.slice(
                0,
                -4
            )}.svg`;
        case "emote":
            return `img/emotes/${t.texture.slice(0, -4)}.svg`;
        case "crosshair":
            return `img/crosshairs/${t.texture.slice(
                0,
                -4
            )}.svg`;
        default:
            return "";
        }
    },
    getCssTransformFromGameType: function(e) {
        const t = GameObjectDefs[e];
        let r = "";
        if (t?.lootImg) {
            r = `rotate(${t.lootImg.rot || 0}rad) scaleX(${t.lootImg.mirror ? -1 : 1
            })`;
        }
        return r;
    },
    random64: function() {
        function e() {
            return Math.floor(
                Math.random() * Math.pow(2, 32)
            ).toString(16);
        }
        return e() + e();
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

export default helpers;

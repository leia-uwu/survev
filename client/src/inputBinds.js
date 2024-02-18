import $ from "jquery"
import BitBuffer from "bit-buffer";
import { GameConfig } from "../../shared/gameConfig";
import input from "./input";
import crc from "./crc";
import base64 from "base64-js";

const y = GameConfig.Input;
var f = input.InputType;
var _ = input.InputValue;
const b = input.Key;
const x = input.MouseButton;
const S = input.MouseWheel;

function a(e, t) {
    if (!(e instanceof t)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function i(e, t, r) {
    if (t in e) {
        Object.defineProperty(e, t, {
            value: r,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        e[t] = r;
    }
    return e;
}
function o(e, t) {
    return {
        name: e,
        defaultValue: t
    };
}
function s(e) {
    return new _(f.Key, e);
}
function n(e) {
    return new _(f.MouseButton, e);
}
function l(e) {
    return new _(f.MouseWheel, e);
}
let c;
const m = (function() {
    function e(e, t) {
        for (let r = 0; r < t.length; r++) {
            const a = t[r];
            a.enumerable = a.enumerable || false;
            a.configurable = true;
            if ("value" in a) {
                a.writable = true;
            }
            Object.defineProperty(e, a.key, a);
        }
    }
    return function(t, r, a) {
        if (r) {
            e(t.prototype, r);
        }
        if (a) {
            e(t, a);
        }
        return t;
    };
})();

c = {};
i(c, y.MoveLeft, o("Move Left", s(b.A)));
i(c, y.MoveRight, o("Move Right", s(b.D)));
i(c, y.MoveUp, o("Move Up", s(b.W)));
i(c, y.MoveDown, o("Move Down", s(b.S)));
i(c, y.Fire, o("Fire", n(x.Left)));
i(c, y.Reload, o("Reload", s(b.R)));
i(c, y.Cancel, o("Cancel", s(b.X)));
i(c, y.Interact, o("Interact", s(b.F)));
i(c, y.Revive, o("Revive", null));
i(c, y.Use, o("Open/Use", null));
i(c, y.Loot, o("Loot", null));
i(c, y.EquipPrimary, o("Equip Primary", s(b.One)));
i(c, y.EquipSecondary, o("Equip Secondary", s(b.Two)));
i(c, y.EquipMelee, o("Equip Melee", s(b.Three)));
i(c, y.EquipThrowable, o("Equip Throwable", s(b.Four)));
i(c, y.EquipNextWeap, o("Equip Next Weapon", l(S.Down)));
i(c, y.EquipPrevWeap, o("Equip Previous Weapon", l(S.Up)));
i(c, y.EquipLastWeap, o("Equip Last Weapon", s(b.Q)));
i(c, y.StowWeapons, o("Stow Weapons", s(b.E)));
i(c, y.EquipPrevScope, o("Equip Previous Scope", null));
i(c, y.EquipNextScope, o("Equip Next Scope", null));
i(c, y.UseBandage, o("Use Bandage", s(b.Seven)));
i(c, y.UseHealthKit, o("Use Med Kit", s(b.Eight)));
i(c, y.UseSoda, o("Use Soda", s(b.Nine)));
i(c, y.UsePainkiller, o("Use Pills", s(b.Zero)));
i(c, y.SwapWeapSlots, o("Switch Gun Slots", s(b.T)));
i(c, y.ToggleMap, o("Toggle Map", s(b.M)));
i(c, y.CycleUIMode, o("Toggle Minimap", s(b.V)));
i(c, y.EmoteMenu, o("Emote Menu", n(x.Right)));
i(c, y.TeamPingMenu, o("Team Ping Hold", s(b.C)));
i(c, y.EquipOtherGun, o("Equip Other Gun", null));
i(c, y.Fullscreen, o("Full Screen", s(b.L)));
i(c, y.HideUI, o("Hide UI", null));
i(c, y.TeamPingSingle, o("Team Ping Menu", null));
const v = c;

class InputBinds {
    constructor(t, r) {
        this.input = t;
        this.config = r;
        this.binds = [];
        this.boundKeys = {};
        this.menuHovered = false;
        this.loadBinds();
    }
    toArray() {
        const e = new ArrayBuffer(
            this.binds.length * 2 + 1
        );
        const t = new BitBuffer.BitStream(e);
        t.writeUint8(1);
        for (let r = 0; r < this.binds.length; r++) {
            const a = this.binds[r];
            const i = a ? a.type : 0;
            const o = a ? a.code : 0;
            t.writeBits(i & 3, 2);
            t.writeUint8(o & 255);
        }
        const s = new Uint8Array(e, 0, t.byteIndex);
        const n = crc.crc16(s);
        const l = new Uint8Array(s.length + 2);
        l.set(s);
        l[l.length - 2] = (n >> 8) & 255;
        l[l.length - 1] = n & 255;
        return l;
    }
    fromArray(e) {
        let t = new Uint8Array(e);
        if (!t || t.length < 3) {
            return false;
        }
        const r = (t[t.length - 2] << 8) | t[t.length - 1];
        t = t.slice(0, t.length - 2);
        if (crc.crc16(t) != r) {
            return false;
        }
        var a = new ArrayBuffer(t.length);
        var i = new Uint8Array(a);
        for (var o = 0; o < t.length; o++) {
            i[o] = t[o];
        }
        const s = new BitBuffer.BitStream(a);
        const n = s.readUint8();
        this.clearAllBinds();
        for (let l = 0; s.length - s.index >= 10;) {
            const c = l++;
            const m = s.readBits(2);
            const p = s.readUint8();
            if (c >= 0 && c < y.Count && m != f.None) {
                this.setBind(
                    c,
                    m != 0 ? new _(m, p) : null
                );
            }
        }
        if (n < 1) {
            this.upgradeBinds(n);
            this.saveBinds();
        }
        return true;
    }

    toBase64() {
        return base64.fromByteArray(this.toArray());
    }
    fromBase64(e) {
        let t = false;
        try {
            t = this.fromArray(base64.toByteArray(e));
        } catch (e) {
            console.log("Error", e);
        }
        return t;
    }
    saveBinds() {
        this.config.set("binds", this.toBase64());
    }
    loadBinds() {
        if (
            !this.fromBase64(this.config.get("binds") || "")
        ) {
            this.loadDefaultBinds();
            this.saveBinds();
        }
    }
    upgradeBinds(e) {
        for (let t = [], r = 0; r < t.length; r++) {
            var a = t[r];
            var i = v[a].defaultValue;
            var o = false;
            for (var s = 0; s < this.binds.length; s++) {
                if (this.binds[s]?.equals(i)) {
                    o = true;
                    break;
                }
            }
            if (!o) {
                this.setBind(a, i);
            }
        }
    }
    clearAllBinds() {
        for (let e = 0; e < y.Count; e++) {
            this.binds[e] = null;
        }
        this.boundKeys = {};
    }
    setBind(e, t) {
        if (t) {
            for (let r = 0; r < this.binds.length; r++) {
                if (this.binds[r]?.equals(t)) {
                    this.binds[r] = null;
                }
            }
        }
        const a = this.binds[e];
        if (a && a.type == f.Key) {
            this.boundKeys[a.code] = null;
        }
        this.binds[e] = t;
        if (t && t.type == f.Key) {
            this.boundKeys[t.code] = true;
        }
    }
    getBind(e) {
        return this.binds[e];
    }
    preventMenuBind(e) {
        return (
            e &&
            this.menuHovered &&
            (e.type == 2 || e.type == 3)
        );
    }
    isKeyBound(e) {
        return this.boundKeys[e];
    }
    isBindPressed(e) {
        const t = this.binds[e];
        return (
            !this.preventMenuBind(t) &&
            t &&
            this.input.isInputValuePressed(t)
        );
    }
    isBindReleased(e) {
        const t = this.binds[e];
        return (
            !this.preventMenuBind(t) &&
            t &&
            this.input.isInputValueReleased(t)
        );
    }
    isBindDown(e) {
        const t = this.binds[e];
        return (
            !this.preventMenuBind(t) &&
            t &&
            this.input.isInputValueDown(t)
        );
    }
    loadDefaultBinds() {
        this.clearAllBinds();
        for (
            let e = Object.keys(v), t = 0;
            t < e.length;
            t++
        ) {
            const r = e[t];
            const a = v[r];
            this.setBind(parseInt(r), a.defaultValue);
        }
    }
}

class InputBindUi {
    constructor(t, r) {
        const i = this;
        this.input = t;
        this.inputBinds = r;
        $(".js-btn-keybind-restore").on("click", () => {
            i.inputBinds.loadDefaultBinds();
            i.inputBinds.saveBinds();
            i.refresh();
        });
    }
    cancelBind() {
        this.input.captureNextInput(null);
    }
    refresh() {
        const e = this;
        const t = Object.keys(v);
        const r = this.inputBinds.binds;
        const a = $(".js-keybind-list");
        a.empty();
        for (let i = 0; i < t.length; i++) {
            (function(i) {
                const o = t[i];
                const n = v[o];
                const l = r[o];
                const c = $("<a/>", {
                    class: "btn-game-menu btn-darken btn-keybind-desc",
                    text: n.name
                });
                const m = $("<div/>", {
                    class: "btn-keybind-display",
                    text: l ? l.toString() : ""
                });
                c.on("click", (t) => {
                    const r = $(t.target);
                    r.addClass("btn-keybind-desc-selected");
                    e.input.captureNextInput((t, a) => {
                        t.preventDefault();
                        t.stopPropagation();
                        const i = [
                            b.Control,
                            b.Shift,
                            b.Alt,
                            b.Windows,
                            b.ContextMenu,
                            b.F1,
                            b.F2,
                            b.F3,
                            b.F4,
                            b.F5,
                            b.F6,
                            b.F7,
                            b.F8,
                            b.F9,
                            b.F10,
                            b.F11,
                            b.F12
                        ];
                        if (
                            a.type == f.Key &&
                            i.includes(a.code)
                        ) {
                            return false;
                        }
                        r.removeClass(
                            "btn-keybind-desc-selected"
                        );
                        if (!a.equals(s(b.Escape))) {
                            let n = a;
                            if (a.equals(s(b.Backspace))) {
                                n = null;
                            }
                            e.inputBinds.setBind(
                                parseInt(o),
                                n
                            );
                            e.inputBinds.saveBinds();
                            e.refresh();
                        }
                        return true;
                    });
                });
                a.append(
                    $("<div/>", {
                        class: "ui-keybind-container"
                    })
                        .append(c)
                        .append(m)
                );
            })(i);
        }
        $("#keybind-link").html(this.inputBinds.toBase64());
    }
}

export default {
    InputBinds: InputBinds,
    InputBindUi: InputBindUi
};

import { v2 } from "../../shared/utils/v2";

function Touch() {
    this.id = 0;
    this.pos = {
        x: 0,
        y: 0
    };
    this.posOld = {
        x: 0,
        y: 0
    };
    this.posDown = {
        x: 0,
        y: 0
    };
    this.startTime = 0;
    this.lastUpdateTime = 0;
    this.isNew = true;
    this.isDead = false;
    this.osId = 0;
}
function o(e) {
    this.touchElem = e;
    this.keys = {};
    this.keysOld = {};
    this.Ue = v2.create(0, 0);
    this.mouseButtons = {};
    this.mouseButtonsOld = {};
    this.mouseWheelState = 0;
    this.touches = [];
    this.touchIdCounter = 0;
    this.lostFocus = false;
    this.captureNextInputCb = null;
    window.addEventListener(
        "focus",
        this.onWindowFocus.bind(this),
        false
    );
    window.addEventListener(
        "blur",
        this.onWindowFocus.bind(this),
        false
    );
    window.addEventListener(
        "keydown",
        this.onKeyDown.bind(this),
        false
    );
    window.addEventListener(
        "keyup",
        this.onKeyUp.bind(this),
        false
    );
    window.addEventListener(
        "mousemove",
        this.onMouseMove.bind(this),
        false
    );
    window.addEventListener(
        "mousedown",
        this.onMouseDown.bind(this),
        false
    );
    window.addEventListener(
        "mouseup",
        this.onMouseUp.bind(this),
        false
    );
    window.addEventListener("wheel", this.onMouseWheel.bind(this), {
        capture: false,
        passive: true
    });
    window.addEventListener(
        "touchmove",
        this.onTouchMove.bind(this),
        false
    );
    window.addEventListener(
        "touchstart",
        this.onTouchStart.bind(this),
        false
    );
    window.addEventListener(
        "touchend",
        this.onTouchEnd.bind(this),
        false
    );
    window.addEventListener(
        "touchcancel",
        this.onTouchCancel.bind(this),
        false
    );
    this.touchElem.addEventListener(
        "touchstart",
        (e) => {
            e.preventDefault();
        },
        false
    );
}

const Key = Object.freeze({
    Backspace: 8,
    Enter: 13,
    Shift: 16,
    Control: 17,
    Alt: 18,
    Escape: 27,
    Space: 32,
    Left: 37,
    Up: 38,
    Right: 39,
    Down: 40,
    Zero: 48,
    One: 49,
    Two: 50,
    Three: 51,
    Four: 52,
    Five: 53,
    Six: 54,
    Seven: 55,
    Eight: 56,
    Nine: 57,
    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    L: 76,
    M: 77,
    N: 78,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    V: 86,
    W: 87,
    X: 88,
    Windows: 91,
    ContextMenu: 93,
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    Plus: 187,
    Minus: 189,
    FwdSlash: 191,
    Tilde: 192
});
const MouseButton = Object.freeze({
    Left: 0,
    Middle: 1,
    Right: 2,
    Thumb1: 3,
    Thumb2: 4
});
const MouseWheel = Object.freeze({
    None: 0,
    Up: 1,
    Down: 2
});
const InputType = {
    None: 0,
    Key: 1,
    MouseButton: 2,
    MouseWheel: 3
};
const h = [
    "",
    "",
    "",
    "Cancel",
    "",
    "",
    "Help",
    "",
    "Backspace",
    "Tab",
    "",
    "",
    "Clear",
    "Enter",
    "Enter",
    "",
    "Shift",
    "Control",
    "Alt",
    "Pause",
    "Capslock",
    "Kana",
    "Eisu",
    "Junja",
    "Final",
    "Hanja",
    "",
    "ESC",
    "Convert",
    "Nonconvert",
    "Accept",
    "Modechange",
    "Space",
    "Page Up",
    "Page Down",
    "End",
    "Home",
    "←",
    "↑",
    "→",
    "↓",
    "Select",
    "Print",
    "Execute",
    "Printscreen",
    "Insert",
    "Delete",
    "",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    ":",
    ";",
    "<",
    "=",
    ">",
    "?",
    "@",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "Windows Key",
    "",
    "Context Menu",
    "",
    "Sleep",
    "Numpad 0",
    "Numpad 1",
    "Numpad 2",
    "Numpad 3",
    "Numpad 4",
    "Numpad 5",
    "Numpad 6",
    "Numpad 7",
    "Numpad 8",
    "Numpad 9",
    "*",
    "+",
    "Separator",
    "-",
    ".",
    "/",
    "F1",
    "F2",
    "F3",
    "F4",
    "F5",
    "F6",
    "F7",
    "F8",
    "F9",
    "F10",
    "F11",
    "F12",
    "F13",
    "F14",
    "F15",
    "F16",
    "F17",
    "F18",
    "F19",
    "F20",
    "F21",
    "F22",
    "F23",
    "F24",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "Num Lock",
    "Scroll Lock",
    "WIN_OEM_FJ_JISHO",
    "WIN_OEM_FJ_MASSHOU",
    "WIN_OEM_FJ_TOUROKU",
    "WIN_OEM_FJ_LOYA",
    "WIN_OEM_FJ_ROYA",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "Circumflex",
    "!",
    '"',
    "#",
    "$",
    "%",
    "&",
    "_",
    "(",
    ")",
    "*",
    "+",
    "|",
    "Hyphen Minus",
    "{",
    "}",
    "~",
    "",
    "",
    "",
    "",
    "Volume Mute",
    "Volume Down",
    "Volume Up",
    "",
    "",
    ";",
    "=",
    ",",
    "-",
    ".",
    "/",
    "Backquote",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "[",
    "\\",
    "]",
    "'",
    "",
    "Meta",
    "ALTGR",
    "",
    "WIN_ICO_HELP",
    "WIN_ICO_00",
    "",
    "WIN_ICO_CLEAR",
    "",
    "",
    "WIN_OEM_RESET",
    "WIN_OEM_JUMP",
    "WIN_OEM_PA1",
    "WIN_OEM_PA2",
    "WIN_OEM_PA3",
    "WIN_OEM_WSCTRL",
    "WIN_OEM_CUSEL",
    "WIN_OEM_ATTN",
    "WIN_OEM_FINISH",
    "WIN_OEM_COPY",
    "WIN_OEM_AUTO",
    "WIN_OEM_ENLW",
    "WIN_OEM_BACKTAB",
    "ATTN",
    "CRSEL",
    "EXSEL",
    "EREOF",
    "PLAY",
    "ZOOM",
    "",
    "PA1",
    "WIN_OEM_CLEAR",
    ""
];
const d = [
    "Left Mouse",
    "Middle Mouse",
    "Right Mouse",
    "Thumb Mouse 1",
    "Thumb Mouse 2"
];
const u = ["", "Mouse Wheel Up", "Mouse Wheel Down"];

class InputValue {
    constructor(t, r) {
        this.type = t;
        this.code = r;
    }
    equals(e) {
        return this.type == e.type && this.code == e.code;
    }
    toString() {
        if (this.type == InputType.None) {
            return "";
        } else if (this.type == InputType.Key) {
            return h[this.code] || `Key ${this.code}`;
        } else if (this.type == InputType.MouseButton) {
            return d[this.code] || `Mouse ${this.code}`;
        } else {
            return (
                u[this.code] || `Mouse Wheel ${this.code}`
            );
        }
    }
}

const y = Object.freeze({
    Move: 0,
    Start: 1,
    End: 2,
    Cancel: 3
});

o.prototype = {
    n: function() {
        this.touches = [];
        this.touchIdCounter = 0;
    },
    onWindowFocus: function() {
        this.keys = {};
        this.keysOld = {};
        this.mouseButtons = {};
        this.mouseButtonsOld = {};
        this.mouseWheelState = 0;
        this.touches.length = 0;
        this.lostFocus = true;
    },
    flush: function() {
        this.keysOld = Object.assign({}, this.keys);
        this.mouseButtonsOld = Object.assign({}, this.mouseButtons);
        this.mouseWheelState = 0;
        for (let e = 0; e < this.touches.length; e++) {
            this.touches[e].posOld.x = this.touches[e].pos.x;
            this.touches[e].posOld.y = this.touches[e].pos.y;
            this.touches[e].isNew = false;
            if (this.touches[e].isDead) {
                this.touches.splice(e, 1);
                --e;
            }
        }
        this.lostFocus = false;
    },
    captureNextInput: function(e) {
        this.captureNextInputCb = e;
    },
    checkCaptureInput: function(e, t, r) {
        return (
            !!this.captureNextInputCb?.(e, new InputValue(t, r)) &&
            !((this.captureNextInputCb = null), 0)
        );
    },
    isInputValuePressed: function(e) {
        switch (e.type) {
            case InputType.Key:
                return this.We(e.code);
            case InputType.MouseButton:
                return this.Ge(e.code);
            case InputType.MouseWheel:
                return this.Xe() == e.code;
            default:
                return false;
        }
    },
    isInputValueReleased: function(e) {
        switch (e.type) {
            case InputType.Key:
                return this.Ke(e.code);
            case InputType.MouseButton:
                return this.Ze(e.code);
            case InputType.MouseWheel:
                return this.Xe() == e.code;
            default:
                return false;
        }
    },
    isInputValueDown: function(e) {
        switch (e.type) {
            case InputType.Key:
                return this.Ye(e.code);
            case InputType.MouseButton:
                return this.Je(e.code);
            case InputType.MouseWheel:
                return this.Xe() == e.code;
            default:
                return false;
        }
    },
    onKeyDown: function(e) {
        const t = e.keyCode;
        if (t == 9) {
            e.preventDefault();
        }
        if (!this.checkCaptureInput(e, InputType.Key, t)) {
            this.keys[t] = true;
        }
    },
    onKeyUp: function(e) {
        this.keys[e.keyCode] = false;
    },
    Ye: function(e) {
        return !!this.keys[e];
    },
    We: function(e) {
        return !this.keysOld[e] && !!this.keys[e];
    },
    Ke: function(e) {
        return !!this.keysOld[e] && !this.keys[e];
    },
    onMouseMove: function(e) {
        this.Ue.x = e.clientX;
        this.Ue.y = e.clientY;
    },
    onMouseDown: function(e) {
        let t = 0;
        t = "which" in e ? e.which - 1 : e.button;
        if (!this.checkCaptureInput(e, InputType.MouseButton, t)) {
            this.mouseButtons[t] = true;
        }
    },
    onMouseUp: function(e) {
        let t = 0;
        t = "which" in e ? e.which - 1 : e.button;
        this.mouseButtons[t] = false;
        if (t == 3 || t == 4) {
            e.preventDefault();
        }
    },
    onMouseWheel: function(e) {
        const t = e.deltaY < 0 ? MouseWheel.Up : MouseWheel.Down;
        if (!this.checkCaptureInput(e, InputType.MouseWheel, t)) {
            this.mouseWheelState = t;
        }
    },
    Je: function(e) {
        return !!this.mouseButtons[e];
    },
    Ge: function(e) {
        return !this.mouseButtonsOld[e] && !!this.mouseButtons[e];
    },
    Ze: function(e) {
        return !!this.mouseButtonsOld[e] && !this.mouseButtons[e];
    },
    Xe: function() {
        return this.mouseWheelState;
    },
    onTouchShared: function(e, t) {
        if (e.target == this.touchElem || t != y.Start) {
            if (
                e.target == this.touchElem &&
                e.cancelable &&
                t != y.Cancel
            ) {
                e.preventDefault();
            }
            for (
                let r = e.timeStamp || performance.now(), a = 0;
                a < e.changedTouches.length;
                a++
            ) {
                var o = e.changedTouches[a];
                var s = o.identifier;
                var n = o.clientX;
                var l = o.clientY;
                var c = null;
                for (var m = 0; m < this.touches.length; m++) {
                    if (
                        this.touches[m].osId == s &&
                        !this.touches[m].isDead
                    ) {
                        c = this.touches[m];
                        break;
                    }
                }
                if (t == y.Start && !c) {
                    c = new Touch();
                    this.touches.push(c);
                    ++this.touchIdCounter;
                    c.id = this.touchIdCounter;
                    c.osId = s;
                    c.posOld.x = n;
                    c.posOld.y = l;
                    c.posDown.x = n;
                    c.posDown.y = l;
                    c.startTime = r;
                    c.isNew = true;
                    c.isDead = false;
                }
                if ((t == y.End || t == y.Cancel) && !!c) {
                    c.isDead = true;
                }
                if (c) {
                    c.pos.x = n;
                    c.pos.y = l;
                    c.lastUpdateTime = r;
                }
            }
        }
    },
    onTouchMove: function(e) {
        this.onTouchShared(e, y.Move);
    },
    onTouchStart: function(e) {
        this.onTouchShared(e, y.Start);
    },
    onTouchEnd: function(e) {
        this.onTouchShared(e, y.End);
    },
    onTouchCancel: function(e) {
        this.onTouchShared(e, y.Cancel);
    },
    getTouchById: function(e) {
        for (let t = 0; t < this.touches.length; t++) {
            if (this.touches[t].id == e) {
                return this.touches[t];
            }
        }
        return null;
    }
};
export default {
    Qe: o,
    InputType: InputType,
    InputValue: InputValue,
    Key: Key,
    MouseButton: MouseButton,
    MouseWheel: MouseWheel,
    Touch: Touch
};

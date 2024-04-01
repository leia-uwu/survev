import { v2 } from "../../shared/utils/v2";

class Touch {
    constructor() {
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
        // For internal use
        this.osId = 0;
    }
}

export class InputHandler {
    /**
    * @param {HTMLElement} touchElem
    */
    constructor(touchElem) {
        this.touchElem = touchElem;
        this.keys = {};
        this.keysOld = {};
        this.mousePos = v2.create(0, 0);
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

    n() {
        this.touches = [];
        this.touchIdCounter = 0;
    }

    onWindowFocus() {
        this.keys = {};
        this.keysOld = {};
        this.mouseButtons = {};
        this.mouseButtonsOld = {};
        this.mouseWheelState = 0;
        this.touches.length = 0;
        this.lostFocus = true;
    }

    // Call at the end of every frame
    flush() {
        this.keysOld = Object.assign({}, this.keys);
        this.mouseButtonsOld = Object.assign({}, this.mouseButtons);
        this.mouseWheelState = 0;

        // Update the isNew flags and clear out dead touches
        for (let i = 0; i < this.touches.length; i++) {
            this.touches[i].posOld.x = this.touches[i].pos.x;
            this.touches[i].posOld.y = this.touches[i].pos.y;
            this.touches[i].isNew = false;
            if (this.touches[i].isDead) {
                this.touches.splice(i, 1);
                --i;
            }
        }
        this.lostFocus = false;
    }

    captureNextInput(cb) {
        this.captureNextInputCb = cb;
    }

    checkCaptureInput(event, inputType, inputCode) {
        return (
            !!this.captureNextInputCb?.(event, new InputValue(inputType, inputCode)) &&
            !((this.captureNextInputCb = null), 0)
        );
    }

    // InputValue
    isInputValuePressed(inputValue) {
        switch (inputValue.type) {
        case InputType.Key:
            return this.keyPressed(inputValue.code);
        case InputType.MouseButton:
            return this.mousePressed(inputValue.code);
        case InputType.MouseWheel:
            return this.mouseWheel() == inputValue.code;
        default:
            return false;
        }
    }

    isInputValueReleased(inputValue) {
        switch (inputValue.type) {
        case InputType.Key:
            return this.keyReleased(inputValue.code);
        case InputType.MouseButton:
            return this.mouseReleased(inputValue.code);
        case InputType.MouseWheel:
            return this.mouseWheel() == inputValue.code;
        default:
            return false;
        }
    }

    isInputValueDown(inputValue) {
        switch (inputValue.type) {
        case InputType.Key:
            return this.keyDown(inputValue.code);
        case InputType.MouseButton:
            return this.mouseDown(inputValue.code);
        case InputType.MouseWheel:
            return this.mouseWheel() == inputValue.code;
        default:
            return false;
        }
    }

    // Keyboard
    onKeyDown(event) {
        const keyCode = event.keyCode;
        // Prevent tab behavior
        if (keyCode == 9) {
            event.preventDefault();
        }
        if (this.checkCaptureInput(event, InputType.Key, keyCode)) {
            return;
        }
        this.keys[keyCode] = true;
    }

    onKeyUp(e) {
        this.keys[e.keyCode] = false;
    }

    keyDown(key) {
        return !!this.keys[key];
    }

    keyPressed(key) {
        return !this.keysOld[key] && !!this.keys[key];
    }

    keyReleased(e) {
        return !!this.keysOld[e] && !this.keys[e];
    }

    // Mouse
    onMouseMove(event) {
        this.mousePos.x = event.clientX;
        this.mousePos.y = event.clientY;
    }

    onMouseDown(event) {
        let button = 0;
        button = "which" in event ? event.which - 1 : event.button;
        if (this.checkCaptureInput(event, InputType.MouseButton, button)) {
            return;
        }
        this.mouseButtons[button] = true;
    }

    onMouseUp(event) {
        let button = 0;
        button = "which" in event ? event.which - 1 : event.button;

        this.mouseButtons[button] = false;

        // Disable the default action for these buttons;
        // most mice have them bound to "back" / "forward" page navigation
        if (button == 3 || button == 4) {
            event.preventDefault();
        }
    }

    onMouseWheel(event) {
        const wheel = event.deltaY < 0 ? MouseWheel.Up : MouseWheel.Down;

        if (this.checkCaptureInput(event, InputType.MouseWheel, wheel)) {
            return;
        }
        this.mouseWheelState = wheel;
    }

    mouseDown(button) {
        return !!this.mouseButtons[button];
    }

    mousePressed(button) {
        return !this.mouseButtonsOld[button] && !!this.mouseButtons[button];
    }

    mouseReleased(button) {
        return !!this.mouseButtonsOld[button] && !this.mouseButtons[button];
    }

    mouseWheel() {
        return this.mouseWheelState;
    }

    // Touch
    onTouchShared(event, type) {
        if (event.target == this.touchElem || type != TouchEvent.Start) {
            if (
                event.target == this.touchElem &&
                event.cancelable &&
                type != TouchEvent.Cancel
            ) {
                event.preventDefault();
            }
            const time = event.timeStamp || performance.now();
            for (
                let i = 0;
                i < event.changedTouches.length;
                i++
            ) {
                const osTouch = event.changedTouches[i];
                const osId = osTouch.identifier;
                const x = osTouch.clientX;
                const y = osTouch.clientY;

                // See if we're already tracking this touch
                let t = null;
                for (let j = 0; j < this.touches.length; j++) {
                    if (
                        this.touches[j].osId == osId &&
                        !this.touches[j].isDead
                    ) {
                        t = this.touches[j];
                        break;
                    }
                }
                if (type == TouchEvent.Start && !t) {
                    t = new Touch();
                    this.touches.push(t);
                    ++this.touchIdCounter;
                    t.id = this.touchIdCounter;
                    t.osId = osId;
                    t.posOld.x = x;
                    t.posOld.y = y;
                    t.posDown.x = x;
                    t.posDown.y = y;
                    t.startTime = time;
                    t.isNew = true;
                    t.isDead = false;
                }
                if ((type == TouchEvent.End || type == TouchEvent.Cancel) && !!t) {
                    t.isDead = true;
                }

                // Do general state update
                if (t) {
                    t.pos.x = x;
                    t.pos.y = y;
                    t.lastUpdateTime = time;
                }
            }
        }
    }

    onTouchMove(event) {
        this.onTouchShared(event, TouchEvent.Move);
    }

    onTouchStart(event) {
        this.onTouchShared(event, TouchEvent.Start);
    }

    onTouchEnd(event) {
        this.onTouchShared(event, TouchEvent.End);
    }

    onTouchCancel(event) {
        this.onTouchShared(event, TouchEvent.Cancel);
    }

    getTouchById(id) {
        for (let i = 0; i < this.touches.length; i++) {
            if (this.touches[i].id == id) {
                return this.touches[i];
            }
        }
        return null;
    }
}

/**
 * @enum { number }
 */
export const Key = Object.freeze({
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

/**
 * @enum { number }
 */
export const MouseButton = Object.freeze({
    Left: 0,
    Middle: 1,
    Right: 2,
    Thumb1: 3,
    Thumb2: 4
});

/**
 * @enum { number }
 */
export const MouseWheel = Object.freeze({
    None: 0,
    Up: 1,
    Down: 2
});

/**
 * @enum { number }
 */
export const InputType = Object.freeze({
    None: 0,
    Key: 1,
    MouseButton: 2,
    MouseWheel: 3
});

const KeyNames = [
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
const MouseButtonNames = [
    "Left Mouse",
    "Middle Mouse",
    "Right Mouse",
    "Thumb Mouse 1",
    "Thumb Mouse 2"
];
const MouseWheelNames = ["", "Mouse Wheel Up", "Mouse Wheel Down"];

export class InputValue {
    constructor(type, code) {
        this.type = type;
        this.code = code;
    }

    equals(inputValue) {
        return this.type == inputValue.type && this.code == inputValue.code;
    }

    toString() {
        if (this.type == InputType.None) {
            return "";
        } else if (this.type == InputType.Key) {
            return KeyNames[this.code] || `Key ${this.code}`;
        } else if (this.type == InputType.MouseButton) {
            return MouseButtonNames[this.code] || `Mouse ${this.code}`;
        } else {
            return (
                MouseWheelNames[this.code] || `Mouse Wheel ${this.code}`
            );
        }
    }
}

/**
 * @enum { number }
 */
const TouchEvent = Object.freeze({
    Move: 0,
    Start: 1,
    End: 2,
    Cancel: 3
});

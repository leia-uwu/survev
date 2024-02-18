function a(e, t) {
    if (!(e instanceof t)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function i(e) {
    try {
        e.createGain().disconnect(e.destination);
        return false;
    } catch (e) {
        return true;
    }
}
const o = (function() {
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
const s =
    window.navigator.userAgent.includes("iPod") ||
    window.navigator.userAgent.includes("iPhone") ||
    window.navigator.userAgent.includes("iPad");
let n = null;
let l = false;
const c = 128;
const m = (function() {
    function e(t) {
        a(this, e);
        this.ctx = t;
        this.sound = null;
        this.id = 0;
        this.volume = 1;
        this.volumeOld = this.volume;
        this.pan = 0;
        this.panOld = this.pan;
        this.sourceNode = null;
        this.gainNode = this.ctx.createGain();
        this.pannerNode = this.ctx.createPanner();
        this.pannerNode.panningModel = "equalpower";
        this.gainNode.connect(this.pannerNode);
        this.destination = null;
        this.paramEvents = 0;
        this.stopTime = 0;
        this.stopping = false;
        this.playState = "playFinished";
    }
    o(e, [
        {
            key: "setGain",
            value: function(e) {
                if (!this.stopping) {
                    if (s) {
                        this.gainNode.gain.value = e;
                    } else {
                        this.gainNode.gain.setTargetAtTime(
                            e,
                            this.ctx.currentTime,
                            0.02
                        );
                        ++this.paramEvents;
                    }
                }
            }
        },
        {
            key: "setPan",
            value: function(e) {
                if (!this.stopping) {
                    this.pannerNode.setPosition(e, 0, -0.5);
                    this.paramEvents += 3;
                }
            }
        },
        {
            key: "start",
            value: function(e, t, r, a, i, o, n, l, c) {
                this.volume = this.volumeOld = r;
                this.pan = this.panOld = a;
                this.ambient = l;
                this.stopping = false;
                this.destination = e;
                this.sourceNode = this.ctx.createBufferSource();
                this.sourceNode.buffer = t;
                this.sourceNode.connect(this.gainNode);
                this.pannerNode.connect(this.destination);
                this.sourceNode.loop = i;
                if (s) {
                    this.gainNode.gain.value = r;
                } else {
                    this.gainNode.gain.setValueAtTime(
                        r,
                        this.ctx.currentTime
                    );
                    ++this.paramEvents;
                }
                this.setPan(a);
                if (this.sourceNode.detune) {
                    this.sourceNode.detune.value = c;
                }
                this.sourceNode.start(this.ctx.currentTime + o, n);
                this.stopTime = i
                    ? 1e100
                    : this.ctx.currentTime + o + t.duration - n;
                this.playState = "playSucceeded";
            }
        },
        {
            key: "stop",
            value: function() {
                if (!this.stopping) {
                    this.setGain(0);
                    this.stopTime = this.ctx.currentTime + 0.1;
                    this.stopping = true;
                    this.playState = "playInterrupted";
                }
            }
        },
        {
            key: "disconnect",
            value: function() {
                this.sound.instances.splice(
                    this.sound.instances.indexOf(this),
                    1
                );
                this.sound = null;
                this.sourceNode.stop(0);
                this.sourceNode.disconnect(this.gainNode);
                this.pannerNode.disconnect(this.destination);
                if (s) {
                    try {
                        this.sourceNode.buffer = n;
                    } catch (e) { }
                }
                this.destination = null;
                this.sourceNode = null;
                this.playState = "playFinished";
            }
        },
        {
            key: "reallocNodes",
            value: function() {
                this.gainNode.disconnect(this.pannerNode);
                this.gainNode = this.ctx.createGain();
                this.pannerNode = this.ctx.createPanner();
                this.pannerNode.panningModel = "equalpower";
                this.gainNode.connect(this.pannerNode);
                this.paramEvents = 0;
            }
        }
    ]);
    return e;
})();
let p = null;
const h = (function() {
    function e(t) {
        a(this, e);
        this.instance = t;
        this.id = t.id;
    }
    o(e, [
        {
            key: "check",
            value: function(e) {
                if (this.id != this.instance.id) {
                    this.instance = p;
                    this.id = p.id;
                }
            }
        },
        {
            key: "stop",
            value: function() {
                this.check();
                this.instance.stop();
            }
        },
        {
            key: "volume",
            get: function() {
                this.check();
                return this.instance.volume;
            },
            set: function(e) {
                this.check(true);
                this.instance.volume = e;
            }
        },
        {
            key: "pan",
            get: function() {
                this.check();
                return this.instance.pan;
            },
            set: function(e) {
                this.check(true);
                this.instance.pan = e;
            }
        },
        {
            key: "playState",
            get: function() {
                this.check();
                return this.instance.playState;
            }
        }
    ]);
    return e;
})();
let d = null;
const u = (function() {
    function e(t, r, i, o, s) {
        a(this, e);
        this.ctx = t;
        this.inNode = r;
        this.outNode = i;
        this.name = o;
        this.volume = s.volume != undefined ? s.volume : 1;
        this.echoVolume = s.echoVolume || 0;
        this.echoDelay = s.echoDelay || 0;
        this.echoLowPass = s.echoLowPass || 3000;
        this.stereoSpread = s.stereoSpread || 0;
        if (!l) {
            const n = this.ctx.createGain();
            this.inNode.connect(n);
            this.inNode = n;
        }
        this.gainNode = null;
        this.convolverNode = null;
        this.echoGainNode = null;
        this.echoLowPassNode = null;
        this.echoDelayNode = null;
        this.stereoDelayNode = null;
        this.mergerNode = null;
        this.convolverNode = this.ctx.createConvolver();
        if (this.echoVolume) {
            this.echoLowPassNode = this.ctx.createBiquadFilter();
            this.echoLowPassNode.type = "lowpass";
            this.echoLowPassNode.frequency.setValueAtTime(
                this.echoLowPass,
                0
            );
            this.echoLowPassNode.Q.setValueAtTime(
                -3.0102999566398125,
                0
            );
            this.echoDelayNode = this.ctx.createDelay(
                this.echoDelay || 0.01
            );
            this.echoDelayNode.delayTime.setValueAtTime(
                this.echoDelay,
                0
            );
        }
        if (this.stereoSpread) {
            this.stereoDelayNode = this.ctx.createDelay(
                this.stereoSpread
            );
            this.stereoDelayNode.delayTime.setValueAtTime(
                this.stereoSpread,
                0
            );
            this.mergerNode = this.ctx.createChannelMerger(2);
        }
        this.targetLevel = 0;
        this.gain = 0;
        this.drainEndTime = 0;
        this.active = false;
    }
    o(e, [
        {
            key: "isConnected",
            value: function() {
                return this.gainNode != null;
            }
        },
        {
            key: "connect",
            value: function() {
                this.gainNode = this.ctx.createGain();
                this.gainNode.channelCount = 1;
                this.gainNode.channelCountMode = "explicit";
                this.gainNode.gain.setValueAtTime(0, 0);
                if (this.echoVolume) {
                    this.echoGainNode = this.ctx.createGain();
                    this.echoGainNode.channelCount = 1;
                    this.echoGainNode.channelCountMode = "explicit";
                    this.echoGainNode.gain.setValueAtTime(
                        this.echoVolume,
                        0
                    );
                }
                this.inNode.connect(this.gainNode);
                this.gainNode.connect(this.convolverNode);
                if (this.echoVolume) {
                    this.convolverNode.connect(this.echoGainNode);
                    this.echoGainNode.connect(this.echoLowPassNode);
                    this.echoLowPassNode.connect(
                        this.echoDelayNode
                    );
                    this.echoDelayNode.connect(this.convolverNode);
                }
                if (this.stereoSpread) {
                    const e = this.convolverNode.buffer;
                    if (e && e.numberOfChannels != 1) {
                        console.error(
                            "stereoSpread can only be applied to mono IRs"
                        );
                    }
                    this.convolverNode.connect(
                        this.stereoDelayNode
                    );
                    this.convolverNode.connect(
                        this.mergerNode,
                        0,
                        0
                    );
                    this.stereoDelayNode.connect(
                        this.mergerNode,
                        0,
                        1
                    );
                    this.mergerNode.connect(this.outNode);
                } else {
                    this.convolverNode.connect(this.outNode);
                }
            }
        },
        {
            key: "disconnect",
            value: function() {
                this.inNode.disconnect(this.gainNode);
                this.gainNode.disconnect(this.convolverNode);
                if (this.echoVolume) {
                    this.convolverNode.disconnect(
                        this.echoGainNode
                    );
                    this.echoGainNode.disconnect(
                        this.echoLowPassNode
                    );
                    this.echoLowPassNode.disconnect(
                        this.echoDelayNode
                    );
                    this.echoDelayNode.disconnect(
                        this.convolverNode
                    );
                }
                if (this.stereoSpread) {
                    this.convolverNode.disconnect(
                        this.stereoDelayNode
                    );
                    this.convolverNode.disconnect(
                        this.mergerNode,
                        0,
                        0
                    );
                    this.stereoDelayNode.disconnect(
                        this.mergerNode,
                        0,
                        1
                    );
                    this.mergerNode.disconnect(this.outNode);
                } else {
                    this.convolverNode.disconnect(this.outNode);
                }
                this.gainNode = null;
                this.echoGainNode = null;
            }
        },
        {
            key: "setGain",
            value: function(e, t, r) {
                e *= this.volume;
                if (this.gain != e) {
                    if (e != 0 && !this.gainNode) {
                        this.connect();
                    }
                    if (e == 0) {
                        this.echoGainNode?.gain.setValueAtTime(
                            0,
                            r
                        );
                        const a = this.convolverNode.buffer;
                        const i = a ? a.duration : 0;
                        this.drainEndTime =
                            r +
                            i +
                            this.echoDelay +
                            this.stereoSpread;
                    }
                    if (this.gain == 0) {
                        this.echoGainNode?.gain.setValueAtTime(
                            this.echoVolume,
                            t
                        );
                    }
                    this.gainNode.gain.setValueAtTime(this.gain, t);
                    this.gainNode.gain.linearRampToValueAtTime(
                        e,
                        r
                    );
                    this.gain = e;
                }
            }
        }
    ]);
    return e;
})();
const g = (function() {
    function e() {
        const t = this;
        a(this, e);
        this.ctx = new (window.AudioContext ||
            window.webkitAudioContext)();
        if (s) {
            const r = this.ctx.createBuffer(1, 1, 44100);
            const o = this.ctx.createBufferSource();
            o.buffer = r;
            o.connect(this.ctx.destination);
            o.start();
            o.disconnect(this.ctx.destination);
            this.ctx.close();
            this.ctx = new (window.AudioContext ||
                window.webkitAudioContext)();
        }
        l = i(this.ctx);
        window.audioEngine = this;
        this.masterGainNode = this.ctx.createGain();
        this.compressorNode = this.ctx.createDynamicsCompressor();
        this.masterGainNode.connect(this.compressorNode);
        this.compressorNode.connect(this.ctx.destination);
        this.reverbNode = this.ctx.createGain();
        this.reverbNode.connect(this.masterGainNode);
        this.eqNodes = {};
        const u = {
            muffled: [
                [20, 1.4142, -6, "peaking"],
                [40, 1.4142, -7, "peaking"],
                [80, 1.4142, -10, "peaking"],
                [160, 1.4142, -13, "peaking"],
                [320, 1.4142, -22, "peaking"],
                [640, 1.4142, -18, "peaking"],
                [1280, 1.4142, -25, "peaking"],
                [2560, 1.4142, -10, "peaking"],
                [5120, 1.4142, -30, "peaking"],
                [10240, 1.4142, -25, "peaking"]
            ],
            club: [
                [20, 1.4142, -6, "lowshelf"],
                [63, 1.4142, -3, "lowshelf"],
                [125, 1.4142, -3, "lowshelf"],
                [250, 1.4142, -6, "lowshelf"],
                [500, 1.4142, -18, "peaking"],
                [1000, 1.4142, -36, "peaking"],
                [2000, 1.4142, -48, "peaking"],
                [4000, 1.4142, -50, "highshelf"],
                [8000, 1.4142, -50, "highshelf"],
                [16000, 1.4142, -50, "highshelf"]
            ]
        };
        Object.keys(u).forEach((e) => {
            const r = t.ctx.createGain();
            r.gain.setValueAtTime(16, 0);
            for (var a = u[e], i = r, o = 0; o < a.length; o++) {
                const s = t.ctx.createBiquadFilter();
                i.connect(s);
                i = s;
                s.frequency.setValueAtTime(a[o][0], 0);
                s.Q.setValueAtTime(a[o][1], 0);
                s.gain.setValueAtTime(a[o][2], 0);
                s.type = a[o][3];
            }
            i.connect(t.reverbNode);
            t.eqNodes[e] = r;
        });
        this.files = {};
        this.sounds = {};
        this.instances = [];
        for (let g = 0; g < c; g++) {
            const y = new m(this.ctx);
            this.instances[g] = y;
        }
        this.instanceId = 0;
        this.playingInstances = [];
        p = new m(this.ctx);
        d = new h(p);
        this.reverbs = {};
        this.activeReverbs = [];
        this.reverbFadeEndTime = 0;
        this.volume = 1;
        this.volumeOld = this.volume;
        this.muted = false;
        this.mutedOld = this.muted;
        if (this.ctx.state == "suspended") {
            const w = function e() {
                t.ctx.resume();
                const r = t.ctx.createBufferSource();
                r.buffer = t.ctx.createBuffer(1, 1, 22050);
                r.connect(t.ctx.destination);
                r.start();
                setTimeout(() => {
                    if (t.ctx.state == "running") {
                        document.body.removeEventListener(
                            "mousedown",
                            e,
                            false
                        );
                        document.body.removeEventListener(
                            "touchend",
                            e,
                            false
                        );
                    }
                }, 0);
            };
            document.body.addEventListener("mousedown", w, false);
            document.body.addEventListener("touchend", w, false);
        }
        if (s) {
            n = this.ctx.createBuffer(1, 1, 22050);
        }
        this.onfileload = function() { };
        this.PLAY_INITED = "playInited";
        this.PLAY_SUCCEEDED = "playSucceeded";
        this.PLAY_INTERRUPTED = "playInterrupted";
        this.PLAY_FINISHED = "playFinished";
        this.PLAY_FAILED = "playFailed";
    }
    o(e, [
        {
            key: "loadFile",
            value: function(e, t) {
                const r = this;
                if (this.files[e] != undefined) {
                    t(e);
                    return this.files[e];
                }
                this.files[e] = {
                    buffer: null
                };
                const a = new XMLHttpRequest();
                a.open("GET", e);
                a.responseType = "arraybuffer";
                const i = function(t) {
                    console.error(
                        `Failed loading sound file: ${e}`
                    );
                };
                a.addEventListener("load", (o) => {
                    const s = a.response;
                    if (!s) {
                        i();
                        return;
                    }
                    r.ctx.decodeAudioData(
                        s,
                        (a) => {
                            r.files[e].buffer = a;
                            t(e);
                        },
                        () => {
                            console.error(
                                `Failed decoding sound: ${e}`
                            );
                        }
                    );
                });
                a.addEventListener("abort", i);
                a.addEventListener("error", i);
                a.addEventListener("timeout", i);
                a.send();
                return this.files[e];
            }
        },
        {
            key: "registerSound",
            value: function(e, t, r) {
                const a = this.loadFile(
                    e,
                    this.onfileload.bind(this)
                );
                const i = {
                    file: a,
                    canCoalesce: !!r.canCoalesce,
                    maxInstances: r.channels || 16,
                    volume: r.volume || 1,
                    instances: []
                };
                this.sounds[t] = i;
            }
        },
        {
            key: "play",
            value: function(e, t) {
                const r = this.sounds[e];
                if (!r) {
                    console.error(`No sound named: ${e}`);
                    return d;
                }
                const a = t.filter || "none";
                let i = t.volume != undefined ? t.volume : 1;
                i *= r.volume;
                i = this.muted ? 0 : i;
                const o = t.pan || 0;
                const s = !!t.loop;
                const n = t.delay ? t.delay * 0.001 : 0;
                const l = t.offset ? t.offset : 0;
                const m = t.ambient || false;
                const p = t.detune || 0;
                if (!r.file.buffer) {
                    return d;
                }
                if (this.muted && !t.loop) {
                    return d;
                }
                if (
                    a !== "none" &&
                    a !== "reverb" &&
                    a !== "muffled" &&
                    a !== "club"
                ) {
                    console.error(
                        `Invalid filter: ${a}. Only valid filters are 'none', 'reverb', 'muffled' and 'club'.`
                    );
                    return d;
                }
                if (r.canCoalesce) {
                    for (
                        let u =
                            this.ctx.currentTime +
                            r.file.buffer.duration,
                        g = 0;
                        g < r.instances.length;
                        g++
                    ) {
                        const y = r.instances[g];
                        if (Math.abs(u - y.stopTime) <= 0.03) {
                            const w = y.volume * y.volume + i * i;
                            const f = y.volume * y.pan + i * o;
                            const _ = y.volume + i;
                            y.volume = Math.sqrt(w);
                            y.pan = f / Math.max(0.001, _);
                            return d;
                        }
                    }
                }
                for (
                    let b = 0;
                    b < c &&
                    (++this.instanceId,
                        this.instances[this.instanceId % c].sound);
                    b++
                );
                const x = this.instances[this.instanceId % c];
                if (x.sound) {
                    console.error(
                        `All ${c} sound instances in use. You are using way too many sounds!`
                    );
                    return d;
                }
                x.id = this.instanceId;
                const S = x.paramEvents > 150;
                const v =
                    x.paramEvents > 20 && !(this.instanceId % 7);
                for (
                    (S || v) && x.reallocNodes();
                    r.instances.length >= r.maxInstances;

                ) {
                    var k = r.instances[0];
                    for (var z = 1; z < r.instances.length; z++) {
                        if (k.stopTime > r.instances[z].stopTime) {
                            k = r.instances[z];
                        }
                    }
                    k.disconnect();
                }
                x.sound = r;
                r.instances.push(x);
                const I =
                    a === "none"
                        ? this.masterGainNode
                        : a === "reverb"
                            ? this.reverbNode
                            : this.eqNodes[a];
                x.start(I, r.file.buffer, i, o, s, n, l, m, p);
                if (this.playingInstances.indexOf(x) == -1) {
                    this.playingInstances.push(x);
                }
                return new h(x);
            }
        },
        {
            key: "registerReverb",
            value: function(e, t, r) {
                const a = this;
                const i = new u(
                    this.ctx,
                    this.reverbNode,
                    this.masterGainNode,
                    t,
                    r
                );
                this.loadFile(e, (e) => {
                    i.convolverNode.buffer = a.files[e].buffer;
                    a.onfileload(e);
                });
                this.reverbs[t] = i;
            }
        },
        {
            key: "setReverbs",
            value: function(e) {
                for (
                    let t = 0;
                    t < this.activeReverbs.length;
                    t++
                ) {
                    const r = this.activeReverbs[t];
                    if (!e[r.name]) {
                        r.targetLevel = 0;
                    }
                }
                for (const a in e) {
                    if (e[a]) {
                        const i = this.reverbs[a];
                        if (i) {
                            if (!this.reverbs[a].active) {
                                this.activeReverbs.push(i);
                                i.active = true;
                            }
                            i.targetLevel = e[a];
                        } else {
                            console.error(`No reverb named ${a}`);
                        }
                    }
                }
            }
        },
        {
            key: "stop",
            value: function() {
                for (
                    let e =
                        arguments.length <= 0 ||
                        arguments[0] === undefined ||
                        arguments[0],
                    t = 0;
                    t < c;
                    t++
                ) {
                    const r = this.instances[t];
                    if (!e || !r.ambient) {
                        if (r.sound) {
                            r.stop();
                        }
                    }
                }
            }
        },
        {
            key: "update",
            value: function(e) {
                if (this.ctx.state == "suspended") {
                    this.ctx.resume();
                }
                const t = this.muted ? 0 : this.volume;
                const r = this.mutedOld ? 0 : this.volumeOld;
                this.volumeOld = this.volume;
                this.mutedOld = this.muted;
                if (t != r) {
                    this.masterGainNode.gain.setTargetAtTime(
                        t,
                        this.ctx.currentTime,
                        0.02
                    );
                }
                for (
                    let a = this.playingInstances.length - 1;
                    a >= 0;
                    a--
                ) {
                    const i = this.playingInstances[a];
                    if (i.volumeOld != i.volume) {
                        i.volumeOld = i.volume;
                        i.setGain(i.volume);
                    }
                    if (i.panOld != i.pan) {
                        i.panOld = i.pan;
                        i.setPan(i.pan);
                    }
                    if (
                        i.sound &&
                        this.ctx.currentTime > i.stopTime
                    ) {
                        i.disconnect();
                    }
                    if (!i.sound) {
                        this.playingInstances.splice(a, 1);
                    }
                }
                if (this.ctx.currentTime > this.reverbFadeEndTime) {
                    const o = this.ctx.currentTime + 0.006;
                    this.reverbFadeEndTime = o + 0.025;
                    var s = 0;
                    for (
                        var n = 0;
                        n < this.activeReverbs.length;
                        n++
                    ) {
                        s += this.activeReverbs[n].targetLevel;
                    }
                    for (
                        let l = s > 1 ? 1 / s : 1, c = 0;
                        c < this.activeReverbs.length;
                        c++
                    ) {
                        const m = this.activeReverbs[c];
                        const p = Math.sqrt(l * m.targetLevel);
                        m.setGain(p, o, this.reverbFadeEndTime);
                    }
                    for (
                        let h = this.activeReverbs.length - 1;
                        h >= 0;
                        h--
                    ) {
                        const d = this.activeReverbs[h];
                        const u =
                            this.ctx.currentTime > d.drainEndTime;
                        if (d.gain == 0 && u) {
                            if (d.isConnected()) {
                                d.disconnect();
                            }
                            d.active = false;
                            this.activeReverbs.splice(h, 1);
                        }
                    }
                }
            }
        },
        {
            key: "setMute",
            value: function(e) {
                this.muted = e;
            }
        },
        {
            key: "on",
            value: function(e, t, r) {
                if (e != "fileload") {
                    console.error(
                        'Only "fileload" event supported'
                    );
                    return;
                }
                this.onfileload = t.bind(r);
            }
        },
        {
            key: "updatePerformanceTest",
            value: function() {
                const e = this;
                this.runningOfflineTest =
                    this.runningOfflineTest != undefined &&
                    this.runningOfflineTest;
                if (!this.runningOfflineTest) {
                    this.runningOfflineTest = true;
                    this.offlineCtx = new OfflineAudioContext(
                        2,
                        this.ctx.sampleRate * 10,
                        this.ctx.sampleRate
                    );
                    for (
                        var t = this.offlineCtx.createBuffer(
                            2,
                            this.ctx.sampleRate * 10,
                            this.ctx.sampleRate
                        ),
                        r = 0;
                        r < t.numberOfChannels;
                        r++
                    ) {
                        for (
                            let a = t.getChannelData(r), i = 0;
                            i < a.length;
                            i++
                        ) {
                            a[i] =
                                Math.sin(i / 2333) *
                                Math.sin(i / 5741) *
                                2 *
                                Math.random() -
                                1;
                        }
                    }
                    const o = this.offlineCtx.createBufferSource();
                    o.buffer = t;
                    var s = this.offlineCtx.createConvolver();
                    for (
                        var n = this.offlineCtx.createBuffer(
                            1,
                            this.ctx.sampleRate * 4,
                            this.ctx.sampleRate
                        ),
                        l = 0;
                        l < n.numberOfChannels;
                        l++
                    ) {
                        for (
                            let c = n.getChannelData(l), m = 0;
                            m < c.length;
                            m++
                        ) {
                            c[m] = Math.random() * 2 - 1;
                        }
                    }
                    s.buffer = n;
                    const p = {
                        volume: 0.7,
                        echoVolume: 0.5,
                        echoLowPass: 800,
                        echoDelay: 0.25,
                        stereoSpread: 0.004
                    };
                    p.convolverNode = s;
                    p.echoLowPassNode =
                        this.offlineCtx.createBiquadFilter();
                    p.echoLowPassNode.type = "lowpass";
                    p.echoLowPassNode.frequency.setValueAtTime(
                        p.echoLowPass,
                        0
                    );
                    p.echoLowPassNode.Q.setValueAtTime(
                        -3.0102999566398125,
                        0
                    );
                    p.echoDelayNode = this.offlineCtx.createDelay(
                        p.echoDelay || 0.01
                    );
                    p.echoDelayNode.delayTime.setValueAtTime(
                        p.echoDelay,
                        0
                    );
                    if (p.stereoSpread) {
                        p.stereoDelayNode =
                            this.offlineCtx.createDelay(
                                p.stereoSpread
                            );
                        p.stereoDelayNode.delayTime.setValueAtTime(
                            p.stereoSpread,
                            0
                        );
                        p.mergerNode =
                            this.offlineCtx.createChannelMerger(2);
                    }
                    p.gainNode = this.offlineCtx.createGain();
                    p.gainNode.channelCount = 1;
                    p.gainNode.channelCountMode = "explicit";
                    p.gainNode.gain.setValueAtTime(1, 0);
                    p.echoGainNode = this.offlineCtx.createGain();
                    p.echoGainNode.channelCount = 1;
                    p.echoGainNode.channelCountMode = "explicit";
                    p.echoGainNode.gain.setValueAtTime(
                        p.echoVolume,
                        0
                    );
                    p.outNode = this.offlineCtx.createGain();
                    p.gainNode.connect(p.convolverNode);
                    if (p.stereoSpread) {
                        const h = p.convolverNode.buffer;
                        if (h && h.numberOfChannels != 1) {
                            console.error(
                                "stereoSpread can only be applied to mono IRs"
                            );
                        }
                        p.convolverNode.connect(p.stereoDelayNode);
                        p.convolverNode.connect(p.mergerNode, 0, 0);
                        p.stereoDelayNode.connect(
                            p.mergerNode,
                            0,
                            1
                        );
                        p.mergerNode.connect(p.outNode);
                    } else {
                        p.convolverNode.connect(p.outNode);
                    }
                    this.offlineCtx.createDynamicsCompressor();
                    console.log("starting convolver");
                    o.connect(p.gainNode);
                    p.outNode.connect(this.offlineCtx.destination);
                    o.start();
                    this.startTime = performance.now();
                    this.offlineCtx.oncomplete = function(t) {
                        const r = performance.now();
                        console.log(
                            "Offline render time: ",
                            r - e.startTime
                        );
                        e.runningOfflineTest = false;
                    };
                    this.offlineCtx.startRendering();
                }
            }
        }
    ]);
    return e;
})();
const CreateJS = {
    Sound: new g()
};
export default CreateJS;

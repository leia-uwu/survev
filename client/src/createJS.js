// Optimized audio backend built around the soundjs interface.

// @HACK: From soundjs:
const isIOS = window.navigator.userAgent.includes("iPod") || window.navigator.userAgent.includes("iPhone") || window.navigator.userAgent.includes("iPad");
let nullBuffer = null;

// @HACK: More Safari work-arounds. Safari does't support the
// AudioNode.disconnect(destination) spec. We need to know if we're dealing
// with Safari (or a similarly impaired browser) and work around it in a few
// places. -JCE 5-7-18
// Code from: https://github.com/WebAudio/web-audio-api/issues/6
let hasSelectiveDisconnect = false;
function testSelectiveDisconnect(ctx) {
    try {
        ctx.createGain().disconnect(ctx.destination);
        return false;
    } catch (error) {
        return true;
    }
}

const kMaxInstances = 128;

class SoundInstance {
    constructor(ctx) {
        this.ctx = ctx;

        this.sound = null;
        this.id = 0;

        this.volume = 1.0;
        this.volumeOld = this.volume;
        this.pan = 0.0;
        this.panOld = this.pan;

        this.sourceNode = null;
        this.gainNode = this.ctx.createGain();
        this.pannerNode = this.ctx.createPanner();
        this.pannerNode.panningModel = "equalpower";
        this.gainNode.connect(this.pannerNode);
        this.destination = null;
        this.paramEvents = 0;

        this.stopTime = 0.0;
        this.stopping = false;

        // soundjs API compat
        this.playState = "playFinished";
    }

    setGain(gain) {
        if (this.stopping) {
            return;
        }
        if (isIOS) {
            this.gainNode.gain.value = gain;
        } else {
            this.gainNode.gain.setTargetAtTime(gain, this.ctx.currentTime, 0.02);
            ++this.paramEvents;
        }
    }

    setPan(pan) {
        if (this.stopping) {
            return;
        }
        this.pannerNode.setPosition(pan, 0, -0.5);
        // ^This is from soundjs, but the following code might be better:
        // this.pannerNode.setPosition(pan, 0, 1.0 - Math.abs(pan));
        this.paramEvents += 3;
    }

    start(destination, buffer, volume, pan, loop, delay, offset, ambient, detune) {
        this.volume = this.volumeOld = volume;
        this.pan = this.panOld = pan;
        this.ambient = ambient;
        this.stopping = false;

        this.destination = destination;
        this.sourceNode = this.ctx.createBufferSource();
        this.sourceNode.buffer = buffer;
        this.sourceNode.connect(this.gainNode);
        this.pannerNode.connect(this.destination);
        this.sourceNode.loop = loop;
        if (isIOS) {
            this.gainNode.gain.value = volume;
        } else {
            this.gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
            ++this.paramEvents;
        }
        this.setPan(pan);
        if (this.sourceNode.detune) {
            this.sourceNode.detune.value = detune;
        }
        this.sourceNode.start(this.ctx.currentTime + delay, offset);
        this.stopTime = loop ? 1.0e100 : this.ctx.currentTime + delay + buffer.duration - offset;

        this.playState = "playSucceeded"; // @HACK: soundjs API compat
    }

    stop() {
        if (this.stopping) {
            return;
        }

        // Give the sound a bit of time to fade out before fully stopping
        this.setGain(0.0);
        this.stopTime = this.ctx.currentTime + 0.1;
        this.stopping = true;

        this.playState = "playInterrupted"; // @HACK: soundjs API compat
    }

    disconnect() {
        this.sound.instances.splice(this.sound.instances.indexOf(this), 1);
        this.sound = null;

        this.sourceNode.stop(0);
        this.sourceNode.disconnect(this.gainNode);
        this.pannerNode.disconnect(this.destination);
        // @HACK: From soundjs:
        // necessary to prevent leak on iOS Safari 7-9. will throw in almost
        // all other browser implementations.
        if (isIOS) {
            try {
                this.sourceNode.buffer = nullBuffer;
            } catch (e) {
                void 0;
            }
        }
        this.destination = null;
        this.sourceNode = null;

        this.playState = "playFinished"; // @HACK: soundjs API compat
    }

    reallocNodes() {
        this.gainNode.disconnect(this.pannerNode);
        this.gainNode = this.ctx.createGain();
        this.pannerNode = this.ctx.createPanner();
        this.pannerNode.panningModel = "equalpower";
        this.gainNode.connect(this.pannerNode);
        this.paramEvents = 0;
    }
}

let nullInstance = null;

class SoundHandle {
    constructor(instance) {
        this.instance = instance;
        this.id = instance.id;
    }

    check(checkCoalesce) {
        if (this.id != this.instance.id) {
            this.instance = nullInstance;
            this.id = nullInstance.id;
        }
    }

    // Passthrough API:

    stop() {
        this.check(); this.instance.stop();
    }

    get volume() {
        this.check(); return this.instance.volume;
    }

    set volume(value) {
        this.check(true); this.instance.volume = value;
    }

    get pan() {
        this.check(); return this.instance.pan;
    }

    set pan(value) {
        this.check(true); this.instance.pan = value;
    }

    get playState() {
        this.check(); return this.instance.playState;
    }
}

let nullHandle = null;

class Reverb {
    constructor(ctx, inNode, outNode, name, params) {
        this.ctx = ctx;
        this.inNode = inNode;
        this.outNode = outNode;
        this.name = name;
        this.volume = params.volume != undefined ? params.volume : 1.0;
        this.echoVolume = params.echoVolume || 0.0;
        this.echoDelay = params.echoDelay || 0.0;
        this.echoLowPass = params.echoLowPass || 3000.0;
        this.stereoSpread = params.stereoSpread || 0.0;
        if (!hasSelectiveDisconnect) {
            const workaround = this.ctx.createGain();
            this.inNode.connect(workaround);
            this.inNode = workaround;
        }

        // Nodes pointers
        this.gainNode = null;
        this.convolverNode = null;
        this.echoGainNode = null;
        this.echoLowPassNode = null;
        this.echoDelayNode = null;
        this.stereoDelayNode = null;
        this.mergerNode = null;
        // Initialze all static nodes
        this.convolverNode = this.ctx.createConvolver();
        if (this.echoVolume) {
            this.echoLowPassNode = this.ctx.createBiquadFilter();
            this.echoLowPassNode.type = "lowpass";
            this.echoLowPassNode.frequency.setValueAtTime(this.echoLowPass, 0);
            this.echoLowPassNode.Q.setValueAtTime(-3.0102999566398125, 0);
            this.echoDelayNode = this.ctx.createDelay(this.echoDelay || 0.01);
            this.echoDelayNode.delayTime.setValueAtTime(this.echoDelay, 0);
        }
        if (this.stereoSpread) {
            this.stereoDelayNode = this.ctx.createDelay(this.stereoSpread);
            this.stereoDelayNode.delayTime.setValueAtTime(this.stereoSpread, 0);
            this.mergerNode = this.ctx.createChannelMerger(2);
        }

        this.targetLevel = 0.0;
        this.gain = 0.0;
        this.drainEndTime = 0.0;
        this.active = false;
    }

    isConnected() {
        return this.gainNode != null;
    }

    connect() {
        // Create dynamic nodes
        this.gainNode = this.ctx.createGain();
        this.gainNode.channelCount = 1;
        this.gainNode.channelCountMode = "explicit";
        this.gainNode.gain.setValueAtTime(0.0, 0);
        if (this.echoVolume) {
            this.echoGainNode = this.ctx.createGain();
            this.echoGainNode.channelCount = 1;
            this.echoGainNode.channelCountMode = "explicit";
            this.echoGainNode.gain.setValueAtTime(this.echoVolume, 0);
        }

        // Connect nodes
        this.inNode.connect(this.gainNode);
        this.gainNode.connect(this.convolverNode);
        if (this.echoVolume) {
            this.convolverNode.connect(this.echoGainNode);
            this.echoGainNode.connect(this.echoLowPassNode);
            this.echoLowPassNode.connect(this.echoDelayNode);
            this.echoDelayNode.connect(this.convolverNode);
        }
        if (this.stereoSpread) {
            const { buffer } = this.convolverNode;
            if (buffer && buffer.numberOfChannels != 1) {
                console.error("stereoSpread can only be applied to mono IRs");
            }
            this.convolverNode.connect(this.stereoDelayNode);
            this.convolverNode.connect(this.mergerNode, 0, 0);
            this.stereoDelayNode.connect(this.mergerNode, 0, 1);
            this.mergerNode.connect(this.outNode);
        } else {
            this.convolverNode.connect(this.outNode);
        }
    }

    disconnect() {
        // Disconnect nodes
        this.inNode.disconnect(this.gainNode);
        this.gainNode.disconnect(this.convolverNode);
        if (this.echoVolume) {
            this.convolverNode.disconnect(this.echoGainNode);
            this.echoGainNode.disconnect(this.echoLowPassNode);
            this.echoLowPassNode.disconnect(this.echoDelayNode);
            this.echoDelayNode.disconnect(this.convolverNode);
        }
        if (this.stereoSpread) {
            this.convolverNode.disconnect(this.stereoDelayNode);
            this.convolverNode.disconnect(this.mergerNode, 0, 0);
            this.stereoDelayNode.disconnect(this.mergerNode, 0, 1);
            this.mergerNode.disconnect(this.outNode);
        } else {
            this.convolverNode.disconnect(this.outNode);
        }

        // Release dynamic nodes
        this.gainNode = null;
        this.echoGainNode = null;
    }

    setGain(gain, fadeStartTime, fadeEndTime) {
        gain *= this.volume;
        if (this.gain == gain) {
            return;
        }

        // If the reverb is new, we have to connect it to the audio node graph
        if (gain != 0.0 && !this.gainNode) {
            this.connect();
        }
        // If the reverb is being silenced, kill the echo, and calculate when
        // the convolution node will be fully "drained." (Convolution nodes
        // store audio data, so, if you disconnect them from the node graph too
        // early, they will play old sounds when you reconnect them.)
        if (gain == 0.0) {
            if (this.echoGainNode) {
                this.echoGainNode.gain.setValueAtTime(0.0, fadeEndTime);
            }
            const { buffer } = this.convolverNode;
            const duration = buffer ? buffer.duration : 0.0;
            this.drainEndTime = fadeEndTime + duration + this.echoDelay + this.stereoSpread;
        }
        // If the reverb was silent and draining, but is now audible again, we
        // need to make sure to turn on the echo node
        if (this.gain == 0.0 && this.echoGainNode) {
            this.echoGainNode.gain.setValueAtTime(this.echoVolume, fadeStartTime);
        }

        // Update the gain
        this.gainNode.gain.setValueAtTime(this.gain, fadeStartTime);
        this.gainNode.gain.linearRampToValueAtTime(gain, fadeEndTime);
        this.gain = gain;
    }
}

class WebAudioEngine {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        // Fix for iOS bug: https://bugs.webkit.org/show_bug.cgi?id=168165
        if (isIOS) {
            const buffer = this.ctx.createBuffer(1, 1, 44100);
            const source = this.ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(this.ctx.destination);
            source.start();
            source.disconnect(this.ctx.destination);
            this.ctx.close();
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        // Similarly, check for the Safari AudioNode.disconnect() spec break
        hasSelectiveDisconnect = testSelectiveDisconnect(this.ctx);

        // @HACK: For messing around with the audio engine in the dev console
        window.audioEngine = this;

        this.masterGainNode = this.ctx.createGain();
        this.compressorNode = this.ctx.createDynamicsCompressor();
        this.masterGainNode.connect(this.compressorNode);
        this.compressorNode.connect(this.ctx.destination);
        // Reverb (pass-through, unless a reverb is actually activated)
        this.reverbNode = this.ctx.createGain();
        this.reverbNode.connect(this.masterGainNode);
        // EQ effect nodes
        this.eqNodes = {};
        const eqTypes = {
            muffled: [[20.0, 2.8284 / 2.0, -6.0, "peaking"], [40.0, 2.8284 / 2.0, -7.0, "peaking"], [80.0, 2.8284 / 2.0, -10.0, "peaking"], [160.0, 2.8284 / 2.0, -13.0, "peaking"], [320.0, 2.8284 / 2.0, -22.0, "peaking"], [640.0, 2.8284 / 2.0, -18.0, "peaking"], [1280.0, 2.8284 / 2.0, -25.0, "peaking"], [2560.0, 2.8284 / 2.0, -10.0, "peaking"], [5120.0, 2.8284 / 2.0, -30.0, "peaking"], [10240.0, 2.8284 / 2.0, -25.0, "peaking"]],
            club: [[20.0, 2.8284 / 2.0, -6.0, "lowshelf"], [63.0, 2.8284 / 2.0, -3.0, "lowshelf"], [125.0, 2.8284 / 2.0, -3.0, "lowshelf"], [250.0, 2.8284 / 2.0, -6.0, "lowshelf"], [500.0, 2.8284 / 2.0, -18.0, "peaking"], [1000.0, 2.8284 / 2.0, -36.0, "peaking"], [2000.0, 2.8284 / 2.0, -48.0, "peaking"], [4000.0, 2.8284 / 2.0, -50.0, "highshelf"], [8000.0, 2.8284 / 2.0, -50.0, "highshelf"], [16000.0, 2.8284 / 2.0, -50.0, "highshelf"]]
        };
        Object.keys(eqTypes).forEach((item) => {
            const eqNode = this.ctx.createGain();
            eqNode.gain.setValueAtTime(16.0, 0.0);
            const peaks = eqTypes[item];
            let previousNode = eqNode;
            for (let i = 0; i < peaks.length; i++) {
                const peakingNode = this.ctx.createBiquadFilter();
                previousNode.connect(peakingNode);
                previousNode = peakingNode;
                peakingNode.frequency.setValueAtTime(peaks[i][0], 0.0);
                peakingNode.Q.setValueAtTime(peaks[i][1], 0.0);
                peakingNode.gain.setValueAtTime(peaks[i][2], 0.0);
                peakingNode.type = peaks[i][3];
            }
            previousNode.connect(this.reverbNode);
            this.eqNodes[item] = eqNode;
        });

        this.files = {};

        this.sounds = {};
        this.instances = [];
        for (let i = 0; i < kMaxInstances; i++) {
            const instance = new SoundInstance(this.ctx);
            this.instances[i] = instance;
        }
        this.instanceId = 0;
        this.playingInstances = [];
        nullInstance = new SoundInstance(this.ctx);
        nullHandle = new SoundHandle(nullInstance);

        this.reverbs = {};
        this.activeReverbs = [];
        this.reverbFadeEndTime = 0.0;

        // Global state
        this.volume = 1.0;
        this.volumeOld = this.volume;
        this.muted = false;
        this.mutedOld = this.muted;

        // iOS starts the sound context suspended, and can only un-suspend
        // by playing sound from mousedown or touchend events
        if (this.ctx.state == "suspended") {
            const tryResume = () => {
                this.ctx.resume();
                const source = this.ctx.createBufferSource();
                source.buffer = this.ctx.createBuffer(1, 1, 22050);
                source.connect(this.ctx.destination);
                source.start();
                setTimeout(() => {
                    if (this.ctx.state == "running") {
                        document.body.removeEventListener("mousedown", tryResume, false);
                        document.body.removeEventListener("touchend", tryResume, false);
                    }
                }, 0);
            };
            document.body.addEventListener("mousedown", tryResume, false);
            document.body.addEventListener("touchend", tryResume, false);
        }
        // iOS also may or may not still have a bug that, on stopping a sound,
        // requires setting the buffer field of AudioBufferSourceNodes to a
        // tiny buffer to avoid leaking memory.
        if (isIOS) {
            nullBuffer = this.ctx.createBuffer(1, 1, 22050);
        }

        // Soundjs API compat:
        this.onfileload = function() { };

        this.PLAY_INITED = "playInited";
        this.PLAY_SUCCEEDED = "playSucceeded";
        this.PLAY_INTERRUPTED = "playInterrupted";
        this.PLAY_FINISHED = "playFinished";
        this.PLAY_FAILED = "playFailed";
    }

    loadFile(path, onfileload) {
        if (this.files[path] != undefined) {
            onfileload(path);
            return this.files[path];
        }

        this.files[path] = { buffer: null };

        const xhr = new XMLHttpRequest();
        xhr.open("GET", path);
        xhr.responseType = "arraybuffer";
        const onfailure = function onfailure(event) {
            console.error(`Failed loading sound file: ${path}`);
        };
        xhr.addEventListener("load", (event) => {
            const arrayBuffer = xhr.response;
            if (!arrayBuffer) {
                onfailure(event);
                return;
            }
            this.ctx.decodeAudioData(arrayBuffer, (audioBuffer) => {
                // let memorySize = 4 * audioBuffer.length * audioBuffer.numberOfChannels;
                this.files[path].buffer = audioBuffer;
                onfileload(path);
            }, () => {
                console.error(`Failed decoding sound: ${path}`);
            });
        });
        xhr.addEventListener("abort", onfailure);
        xhr.addEventListener("error", onfailure);
        xhr.addEventListener("timeout", onfailure);
        xhr.send();

        return this.files[path];
    }

    registerSound(path, name, params) {
        const file = this.loadFile(path, this.onfileload.bind(this));
        const sound = {
            file,
            canCoalesce: !!params.canCoalesce,
            maxInstances: params.channels || 16,
            volume: params.volume || 1.0,
            instances: []
        };
        this.sounds[name] = sound;
    }

    play(name, params) {
        const sound = this.sounds[name];
        if (!sound) {
            console.error(`No sound named: ${name}`);
            return nullHandle;
        }

        const filter = params.filter || "none";
        let volume = params.volume != undefined ? params.volume : 1.0;
        volume *= sound.volume;
        volume = this.muted ? 0.0 : volume;
        const pan = params.pan || 0.0;
        const loop = !!params.loop;
        const delay = params.delay ? params.delay * 0.001 : 0.0; // passed in ms
        const offset = params.offset ? params.offset : 0.0;
        const ambient = params.ambient || false;
        const detune = params.detune || 0.0;

        // If the file hasn't finished loading, just give up
        if (!sound.file.buffer) {
            return nullHandle;
        }
        // If we're muted, we don't even need to start non-looping sounds
        if (this.muted && !params.loop) {
            return nullHandle;
        }
        // Verify the filter
        if (filter !== "none" && filter !== "reverb" && filter !== "muffled" && filter !== "club") {
            console.error(`Invalid filter: ${filter}. ` + "Only valid filters are 'none', 'reverb', 'muffled' and 'club'.");
            return nullHandle;
        }

        // If the sound can coalesce, we can just add this instance's volume
        // to another instance that has started playing recently
        if (sound.canCoalesce) {
            const kCoalesceTime = 0.03;
            const stopTime = this.ctx.currentTime + sound.file.buffer.duration;
            for (let i = 0; i < sound.instances.length; i++) {
                const _instance = sound.instances[i];
                if (Math.abs(stopTime - _instance.stopTime) > kCoalesceTime) {
                    continue;
                }
                // Add this new instance's params on an equal power basis
                const vv = _instance.volume * _instance.volume + volume * volume;
                const vp = _instance.volume * _instance.pan + volume * pan;
                const v = _instance.volume + volume;
                _instance.volume = Math.sqrt(vv);
                _instance.pan = vp / Math.max(0.001, v);
                // We were able to coalesce this sound, so we can return early
                return nullHandle;
            }
        }

        // Grab the next unused instance
        for (let _i = 0; _i < kMaxInstances; _i++) {
            ++this.instanceId;
            if (!this.instances[this.instanceId % kMaxInstances].sound) {
                break;
            }
        }
        const instance = this.instances[this.instanceId % kMaxInstances];
        if (instance.sound) {
            console.error(`All ${kMaxInstances} sound instances in use. ` + "You are using way too many sounds!");
            return nullHandle;
        }
        instance.id = this.instanceId;

        // WebAudio nodes fill with garbage over time, so we occasionally want
        // to reallocate fresh ones (but not too often, since it's expensive!)
        const overuse = instance.paramEvents > 150;
        const periodic = instance.paramEvents > 20 && !(this.instanceId % 7);
        if (overuse || periodic) {
            instance.reallocNodes();
        }

        // If this sound is at its instance limit, kill the oldest instance
        while (sound.instances.length >= sound.maxInstances) {
            let oldest = sound.instances[0];
            for (let _i2 = 1; _i2 < sound.instances.length; _i2++) {
                if (oldest.stopTime > sound.instances[_i2].stopTime) {
                    oldest = sound.instances[_i2];
                }
            }
            // Immediately disconnecting the sound can cause popping, but
            // it currently sounds better than letting the sound fade out
            oldest.disconnect();
        }

        // Attach the instance to its sound
        instance.sound = sound;
        sound.instances.push(instance);

        // Play the sound!
        const outNode = filter === "none" ? this.masterGainNode : filter === "reverb" ? this.reverbNode : this.eqNodes[filter];
        instance.start(outNode, sound.file.buffer, volume, pan, loop, delay, offset, ambient, detune);
        if (!this.playingInstances.includes(instance)) {
            this.playingInstances.push(instance);
        }

        return new SoundHandle(instance);
    }

    registerReverb(path, name, params) {
        const reverb = new Reverb(this.ctx, this.reverbNode, this.masterGainNode, name, params);

        this.loadFile(path, (path) => {
            reverb.convolverNode.buffer = this.files[path].buffer;
            this.onfileload(path);
        });

        this.reverbs[name] = reverb;
    }
    // reverbLevels: An object where the keys are active reverb names and
    // the values are relative volume levels

    setReverbs(reverbLevels) {
        // Any active reverbs that aren't in the given set should target 0
        for (let i = 0; i < this.activeReverbs.length; i++) {
            const reverb = this.activeReverbs[i];
            if (!reverbLevels[reverb.name]) {
                reverb.targetLevel = 0.0;
            }
        }
        // For the rest, update their target levels
        for (const name in reverbLevels) {
            // Make sure to ignore zero-volume reverbs, if the user gave
            // one to us, for some reason
            if (!reverbLevels[name]) {
                continue;
            }
            const _reverb = this.reverbs[name];
            if (!_reverb) {
                console.error(`No reverb named ${name}`);
                continue;
            }
            if (!this.reverbs[name].active) {
                this.activeReverbs.push(_reverb);
                _reverb.active = true;
            }
            _reverb.targetLevel = reverbLevels[name];
        }
    }

    stop(retainAmbient = true) {
        // Stops all sounds, despite what the symmetry with play() would
        // have you think
        for (let i = 0; i < kMaxInstances; i++) {
            const instance = this.instances[i];
            if (retainAmbient && instance.ambient) {
                continue;
            }
            if (instance.sound) {
                instance.stop();
            }
        }
    }

    update(dt) {
        // If the audio context got suspended (as it is be default in Chrome,
        // until the user interacts with the page), try to resume it
        if (this.ctx.state == "suspended") {
            this.ctx.resume();
        }

        // Update master volume params
        const masterVolume = this.muted ? 0.0 : this.volume;
        const masterVolumeOld = this.mutedOld ? 0.0 : this.volumeOld;
        this.volumeOld = this.volume;
        this.mutedOld = this.muted;
        if (masterVolume != masterVolumeOld) {
            this.masterGainNode.gain.setTargetAtTime(masterVolume, this.ctx.currentTime, 0.02);
        }

        // Apply new state to all sounds, and kill finished ones
        for (let i = this.playingInstances.length - 1; i >= 0; i--) {
            // ^(Iterate backwards so we can splice in place)

            const instance = this.playingInstances[i];

            // Update instance params
            if (instance.volumeOld != instance.volume) {
                instance.volumeOld = instance.volume;
                instance.setGain(instance.volume);
            }
            if (instance.panOld != instance.pan) {
                instance.panOld = instance.pan;
                instance.setPan(instance.pan);
            }

            // See if the sound has completed
            if (instance.sound) {
                if (this.ctx.currentTime > instance.stopTime) {
                    instance.disconnect();
                }
            }

            // If the instance no longer has a sound, it's not playing
            if (!instance.sound) {
                this.playingInstances.splice(i, 1);
            }
        }

        // Periodically update reverbs
        if (this.ctx.currentTime > this.reverbFadeEndTime) {
            const fadeStartTime = this.ctx.currentTime + 0.006;
            const fadeDuration = 0.025;
            this.reverbFadeEndTime = fadeStartTime + fadeDuration;

            // Calc equal power gains for all reverbs based on normalized levels
            let sum = 0.0;
            for (let _i3 = 0; _i3 < this.activeReverbs.length; _i3++) {
                const reverb = this.activeReverbs[_i3];
                sum += reverb.targetLevel;
            }
            const scale = sum > 1.0 ? 1.0 / sum : 1.0;
            for (let _i4 = 0; _i4 < this.activeReverbs.length; _i4++) {
                const _reverb2 = this.activeReverbs[_i4];
                const gain = Math.sqrt(scale * _reverb2.targetLevel);
                _reverb2.setGain(gain, fadeStartTime, this.reverbFadeEndTime);
            }

            // Deactivate any silent, drained reverbs
            for (let _i5 = this.activeReverbs.length - 1; _i5 >= 0; _i5--) {
                const _reverb3 = this.activeReverbs[_i5];
                const drained = this.ctx.currentTime > _reverb3.drainEndTime;
                if (_reverb3.gain == 0.0 && drained) {
                    if (_reverb3.isConnected()) {
                        _reverb3.disconnect();
                    }
                    _reverb3.active = false;
                    this.activeReverbs.splice(_i5, 1);
                }
            }
        }

        // this.updatePerformanceTest();
    }

    setMute(mute) {
        this.muted = mute;
    }

    on(eventName, eventHandler, that) {
        if (eventName != "fileload") {
            console.error('Only "fileload" event supported');
            return;
        }

        this.onfileload = eventHandler.bind(that);
    }

    // A hacky code playground for building intution about the performance
    // characteristics of various WebAudio nodes

    updatePerformanceTest() {
        this.runningOfflineTest = this.runningOfflineTest != undefined ? this.runningOfflineTest : false;
        if (this.runningOfflineTest) {
            return;
        }

        this.runningOfflineTest = true;
        const testTime = 10;
        this.offlineCtx = new OfflineAudioContext(2, testTime * this.ctx.sampleRate, this.ctx.sampleRate);

        // Create the sound to play
        const soundBuffer = this.offlineCtx.createBuffer(2, testTime * this.ctx.sampleRate, this.ctx.sampleRate);
        for (let channel = 0; channel < soundBuffer.numberOfChannels; channel++) {
            const pcm = soundBuffer.getChannelData(channel);
            for (let i = 0; i < pcm.length; i++) {
                pcm[i] = Math.sin(i / 2333.0) * Math.sin(i / 5741.0) * 2.0 * Math.random() - 1.0;
            }
        }
        const soundNode = this.offlineCtx.createBufferSource();
        soundNode.buffer = soundBuffer;
        //
        const convolverNode = this.offlineCtx.createConvolver();
        const convolverTime = 4.0;
        const convolverBuffer = this.offlineCtx.createBuffer(1, convolverTime * this.ctx.sampleRate, this.ctx.sampleRate);
        for (let _channel = 0; _channel < convolverBuffer.numberOfChannels; _channel++) {
            const _pcm = convolverBuffer.getChannelData(_channel);
            for (let _i6 = 0; _i6 < _pcm.length; _i6++) {
                _pcm[_i6] = 2.0 * Math.random() - 1.0;
            }
        }
        convolverNode.buffer = convolverBuffer;

        // Set up the audio nodes
        const reverb = {
            volume: 0.7,
            echoVolume: 0.5,
            echoLowPass: 800,
            echoDelay: 0.25,
            stereoSpread: 0.004
        };
        reverb.convolverNode = convolverNode;
        // Static nodes
        reverb.echoLowPassNode = this.offlineCtx.createBiquadFilter();
        reverb.echoLowPassNode.type = "lowpass";
        reverb.echoLowPassNode.frequency.setValueAtTime(reverb.echoLowPass, 0);
        reverb.echoLowPassNode.Q.setValueAtTime(-3.0102999566398125, 0);
        reverb.echoDelayNode = this.offlineCtx.createDelay(reverb.echoDelay || 0.01);
        reverb.echoDelayNode.delayTime.setValueAtTime(reverb.echoDelay, 0);
        if (reverb.stereoSpread) {
            reverb.stereoDelayNode = this.offlineCtx.createDelay(reverb.stereoSpread);
            reverb.stereoDelayNode.delayTime.setValueAtTime(reverb.stereoSpread, 0);
            reverb.mergerNode = this.offlineCtx.createChannelMerger(2);
        }
        // Dynamic nodes
        reverb.gainNode = this.offlineCtx.createGain();
        reverb.gainNode.channelCount = 1;
        reverb.gainNode.channelCountMode = "explicit";
        reverb.gainNode.gain.setValueAtTime(1.0, 0);
        reverb.echoGainNode = this.offlineCtx.createGain();
        reverb.echoGainNode.channelCount = 1;
        reverb.echoGainNode.channelCountMode = "explicit";
        reverb.echoGainNode.gain.setValueAtTime(reverb.echoVolume, 0);
        reverb.outNode = this.offlineCtx.createGain();

        reverb.gainNode.connect(reverb.convolverNode);
        // reverb.convolverNode.connect(reverb.echoGainNode);
        // reverb.echoGainNode.connect(reverb.echoLowPassNode);
        // reverb.echoLowPassNode.connect(reverb.echoDelayNode);
        // reverb.echoDelayNode.connect(reverb.convolverNode);
        if (reverb.stereoSpread) {
            const { buffer } = reverb.convolverNode;
            if (buffer && buffer.numberOfChannels != 1) {
                console.error("stereoSpread can only be applied to mono IRs");
            }
            reverb.convolverNode.connect(reverb.stereoDelayNode);
            reverb.convolverNode.connect(reverb.mergerNode, 0, 0);
            reverb.stereoDelayNode.connect(reverb.mergerNode, 0, 1);
            reverb.mergerNode.connect(reverb.outNode);
        } else {
            reverb.convolverNode.connect(reverb.outNode);
        }

        // const compressorNode = this.offlineCtx.createDynamicsCompressor();
        //
        // console.log('starting just sound');
        // soundNode.connect(this.offlineCtx.destination);
        console.log("starting convolver");
        soundNode.connect(reverb.gainNode);
        reverb.outNode.connect(this.offlineCtx.destination);

        soundNode.start();
        this.startTime = performance.now();
        this.offlineCtx.oncomplete = (e) => {
            const endTime = performance.now();
            console.log("Offline render time: ", endTime - this.startTime);

            // let offlineBuffer = this.ctx.createBufferSource();
            // offlineBuffer.buffer = e.renderedBuffer;
            // offlineBuffer.connect(this.ctx.destination);
            // offlineBuffer.start();

            this.runningOfflineTest = false;
        };
        this.offlineCtx.startRendering();
    }
}

// Use soundjs's API
export const CreateJS = { Sound: new WebAudioEngine() };

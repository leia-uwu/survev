import { math } from "../../shared/utils/math";
import { util } from "../../shared/utils/util";
import { v2 } from "../../shared/utils/v2";
import createJS from "./createJS";
import soundDefs from "./soundDefs";

export default class AudioManager {
    constructor(e) {
        this.mute = false;
        this.masterVolume = 1;
        this.soundVolume = 1;
        this.musicVolume = 1;
        this.baseVolume = 0.5;
        this.sounds = {};
        this.loadedFiles = {};
        this.preloadedSounds = false;
        this.cameraPos = v2.create(0, 0);
        this.activeLayer = 0;
        this.underground = false;
        this.soundInstances = [];
        createJS.Sound.volume = 0.5;
        createJS.Sound.on("fileload", this.loadHandler, this);
    }

    preloadSounds() {
        if (!this.preloadedSounds) {
            this.preloadedSounds = true;
            for (
                let e = {}, t = Object.keys(soundDefs.Sounds), r = 0;
                r < t.length;
                r++
            ) {
                for (
                    let a = t[r],
                        o = soundDefs.Sounds[a],
                        s = Object.keys(o),
                        n = 0;
                    n < s.length;
                    n++
                ) {
                    const c = s[n];
                    if (e[c] !== undefined) {
                        console.log(
                            `Sound ${c} defined multiple times!`
                        );
                    }
                    e[c] = true;
                }
            }
            const m = [];
            for (
                let p = Object.keys(soundDefs.Channels), h = 0;
                h < p.length;
                h++
            ) {
                for (
                    let d = p[h],
                        u = soundDefs.Channels[d],
                        g = soundDefs.Sounds[u.list],
                        y = Object.keys(g),
                        w = 0;
                    w < y.length;
                    w++
                ) {
                    const f = y[w];
                    const _ = g[f];
                    if (_.preload === undefined || _.preload) {
                        const b = {
                            canCoalesce: _.canCoalesce,
                            channels: _.maxInstances,
                            volume: _.volume
                        };
                        m.push({
                            name: f,
                            channel: d,
                            path: _.path,
                            options: b,
                            priority: _.loadPriority || 0
                        });
                    }
                }
            }
            m.sort((e, t) => {
                return t.priority - e.priority;
            });
            for (let x = 0; x < m.length; x++) {
                const S = m[x];
                this.loadSound(S);
            }
            for (
                let v = soundDefs.Reverbs, k = Object.keys(v), z = 0;
                z < k.length;
                z++
            ) {
                const I = k[z];
                const T = v[I];
                createJS.Sound.registerReverb(T.path, I, T);
            }
        }
    }

    loadSound(e) {
        const t = e.name + e.channel;
        if (!this.sounds[t]) {
            createJS.Sound.registerSound(e.path, t, e.options || {});
            this.sounds[t] = {
                path: e.path,
                name: e.name,
                channel: e.channel
            };
        }
    }

    loadHandler(e) {
        this.loadedFiles[e] = true;
    }

    m(e) {
        for (let t = this.soundInstances.length - 1; t >= 0; t--) {
            const r = this.soundInstances[t];
            if (
                r.instance.playState == "playFinished" ||
                r.instance.playState == "playInterrupted" ||
                r.instance.playState == "playFailed"
            ) {
                this.soundInstances.splice(t, 1);
            }
        }
        const a = [0, 1, 1 / 3, 2 / 3];
        const o = this.underground ? a[this.activeLayer] : 0;
        createJS.Sound.setReverbs({
            cathedral: o
        });
        createJS.Sound.update(e);
    }

    playSound(e, t = {}) {
        if (!e || e == "none") {
            return null;
        }
        t.channel = t.channel || "activePlayer";
        t.startSilent = t.startSilent || false;
        t.forceStart = t.forceStart || false;
        t.loop = t.loop || false;
        t.soundPos = t.soundPos || null;
        t.fallOff = t.fallOff || 0;
        t.filter = t.filter || "";
        t.delay = t.delay || 0;
        t.ignoreMinAllowable = t.ignoreMinAllowable || false;
        t.rangeMult = t.rangeMult || 1;
        t.offset = t.offset || 0;
        t.ambient = t.channel == "ambient" || t.channel == "music";
        t.detune = t.detune || 0;
        t.volumeScale = t.volumeScale || 1;
        let r = null;
        const a = soundDefs.Channels[t.channel];
        if (a && (!this.mute || t.forceStart)) {
            const c =
                this.baseVolume *
                1 *
                this.getTypeVolume(a.type) *
                t.volumeScale;
            const m =
                t.layer !== undefined &&
                !util.sameAudioLayer(t.layer, this.activeLayer);
            const p = t.filter
                ? m || t.forceFilter
                    ? t.filter
                    : "reverb"
                : "none";
            if (t.channel != "activePlayer" && t.soundPos) {
                const h = v2.sub(this.cameraPos, t.soundPos);
                const d = v2.length(h);
                let u = a.maxRange * t.rangeMult;
                if (math.eqAbs(u, 0)) {
                    u = 1;
                }
                const g = math.clamp(Math.abs(d / u), 0, 1);
                const y = Math.pow(1 - g, 1 + t.fallOff * 2);
                let w = a.volume * y * c;
                if (
                    (w = m ? w * 0.5 : w) > 0.003 ||
                    t.ignoreMinAllowable
                ) {
                    const f = math.clamp((h.x / u) * -1, -1, 1);
                    r = createJS.Sound.play(e + t.channel, {
                        filter: p,
                        loop: t.loop ? -1 : 0,
                        volume: t.startSilent ? 0 : w,
                        pan: f,
                        delay: t.delay,
                        offset: t.offset,
                        ambient: t.ambient,
                        detune: t.detune
                    });
                }
            } else {
                let _ = a.volume * c;
                _ = m ? _ * 0.5 : _;
                r = createJS.Sound.play(e + t.channel, {
                    filter: p,
                    loop: t.loop ? -1 : 0,
                    volume: t.startSilent ? 0 : _,
                    delay: t.delay,
                    offset: t.offset,
                    ambient: t.ambient,
                    detune: t.detune
                });
            }
            if (r && (t.loop || t.channel == "music")) {
                const b = t.channel == "music" ? "music" : "sound";
                this.soundInstances.push({
                    instance: r,
                    type: b
                });
            }
        }
        return r;
    }

    playGroup(e, t = {}) {
        const r = soundDefs.Groups[e];
        if (r) {
            const a = r.sounds;
            const i = Math.floor(util.random(0, a.length));
            t.channel = r.channel;
            return this.playSound(a[i], t);
        }
        return null;
    }

    updateSound(e, t, r, a = {}) {
        a.fallOff = a.fallOff || 0;
        a.rangeMult = a.rangeMult || 1;
        a.ignoreMinAllowable = a.ignoreMinAllowable || false;
        a.volumeScale = a.volumeScale || 1;
        const i = soundDefs.Channels[t];
        if (e && i) {
            const c =
                this.baseVolume *
                1 *
                this.getTypeVolume(i.type) *
                a.volumeScale;
            const m = v2.sub(this.cameraPos, r);
            const p = v2.length(m);
            let h = i.maxRange * a.rangeMult;
            if (math.eqAbs(h, 0)) {
                h = 1;
            }
            const d = math.clamp(Math.abs(p / h), 0, 1);
            const u = Math.pow(1 - d, 1 + a.fallOff * 2);
            let g = i.volume * u * c;
            if (
                (g =
                    a.layer === undefined ||
                        util.sameAudioLayer(a.layer, this.activeLayer)
                        ? g
                        : g * 0.5) > 0.003 ||
                a.ignoreMinAllowable
            ) {
                const y = math.clamp((m.x / h) * -1, -1, 1);
                e.volume = g;
                e.pan = y;
            }
        }
    }

    setMasterVolume(e) {
        e = math.clamp(e, 0, 1);
        createJS.Sound.volume = e;
    }

    _setInstanceTypeVolume(e, t) {
        t = math.clamp(t, 0, 1);
        for (
            let r = this.getTypeVolume(e),
                a = r > 0.0001 ? t / r : 0,
                i = 0;
            i < this.soundInstances.length;
            i++
        ) {
            const o = this.soundInstances[i];
            if (o.type == e) {
                o.instance.volume *= a;
            }
        }
    }

    setSoundVolume(e) {
        this._setInstanceTypeVolume("sound", e);
        this.soundVolume = e;
    }

    setMusicVolume(e) {
        this._setInstanceTypeVolume("music", e);
        this.musicVolume = e;
    }

    setVolume(e, t, r) {
        if (e) {
            r = r || "sound";
            const a = this.getTypeVolume(r);
            e.volume = t * a;
        }
    }

    getVolume(e) {
        if (e) {
            return e.volume;
        } else {
            return 0;
        }
    }

    setMute(e) {
        this.mute = e;
        createJS.Sound.setMute(this.mute);
        return this.mute;
    }

    muteToggle() {
        return this.setMute(!this.mute);
    }

    setDelayn(e, t) {
        if (e) {
            e.delay = t;
        }
    }

    stopSound(e) {
        e?.stop();
    }

    stopAll() {
        createJS.Sound.stop();
    }

    allLoaded() {
        for (
            let e = Object.keys(this.sounds), t = 0;
            t < e.length;
            t++
        ) {
            const r = this.sounds[e[t]];
            if (!this.isSoundLoaded(r.name, r.channel)) {
                return false;
            }
        }
        return true;
    }

    isSoundLoaded(e, t) {
        const r = this.sounds[e + t];
        return r && this.loadedFiles[r.path];
    }

    isSoundPlaying(e) {
        return !!e && e.playState == createJS.Sound.PLAY_SUCCEEDED;
    }

    getSoundDefVolume(e, t) {
        const r = soundDefs.Sounds[t][e];
        const a = soundDefs.Channels[t];
        if (r && a) {
            return r.volume * a.volume;
        } else {
            return 1;
        }
    }

    getTypeVolume(e) {
        switch (e) {
        case "music":
            return this.musicVolume;
        case "sound":
        default:
            return this.soundVolume;
        }
    }
}

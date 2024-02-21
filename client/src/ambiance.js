import { math } from "../../shared/utils/math";

export default class Ambiance {
    constructor() {
        const t = this;
        this.introMusic = true;
        this.soundUpdateThrottle = 0;
        this.tracks = [];
        this.trackToIdx = {};
        const r = function(e, r, a, i) {
            t.tracks.push({
                name: e,
                sound: r,
                channel: a,
                immediateMode: i,
                inst: null,
                instSound: "",
                fitler: "",
                weight: 0,
                volume: 0
            });
            t.trackToIdx[e] = t.tracks.length - 1;
        };
        r("music", "menu_music", "music", false);
        r("wind", "ambient_wind_01", "ambient", false);
        r("river", "ambient_stream_01", "ambient", false);
        r("waves", "ambient_waves_01", "ambient", false);
        r("interior_0", "", "ambient", true);
        r("interior_1", "", "ambient", true);
        this.initTime = Date.now();
    }

    getTrack(e) {
        return this.tracks[this.trackToIdx[e]];
    }

    onGameStart() {
        this.introMusic = false;
        for (let e = 0; e < this.tracks.length; e++) {
            this.tracks[e].weight = 0;
        }
        this.getTrack("wind").weight = 1;
        this.soundUpdateThrottle = 0;
    }

    onGameComplete(e) {
        for (let t = 0; t < this.tracks.length; t++) {
            const r = this.tracks[t];
            if (r.immediateMode) {
                r.weight = 0;
            }
        }
        this.getTrack("river").weight = 0;
    }

    update(e, t, r) {
        let a = false;
        this.soundUpdateThrottle -= e;
        if (this.soundUpdateThrottle <= 0) {
            this.soundUpdateThrottle = 0.2;
            a = true;
        }
        for (
            let i = 0, s = this.tracks.length - 1;
            s >= 0;
            s--
        ) {
            const n = this.tracks[s];
            if (
                !n.inst &&
                n.sound &&
                t.isSoundLoaded(n.sound, n.channel)
            ) {
                console.log(
                    "Start track",
                    n.sound,
                    n.channel
                );
                n.inst = t.playSound(n.sound, {
                    channel: n.channel,
                    startSilent: true,
                    loop: n.channel == "ambient",
                    forceStart: true,
                    filter: n.filter,
                    forceFilter: true
                });
                n.instSound = n.sound;
                if (s == 0) {
                    console.log(
                        "Play delay",
                        Date.now() - this.initTime
                    );
                }
            }
            if (n.inst && a) {
                const l = n.weight * (1 - i);
                i += l;
                n.volume = l;
                const c = t.getSoundDefVolume(
                    n.sound,
                    n.channel
                );
                t.setVolume(n.inst, l * c, n.channel);
            }
            if (
                n.inst &&
                ((!n.sound &&
                    math.eqAbs(t.getVolume(n.inst), 0)) ||
                    (n.sound && n.sound != n.instSound))
            ) {
                console.log(
                    "Stop track",
                    n.name,
                    n.channel
                );
                t.stopSound(n.inst);
                n.inst = null;
                n.instSound = "";
            }
            if (n.immediateMode) {
                n.sound = "";
                n.weight = 0;
            }
        }
        if (this.introMusic) {
            const m = this.getTrack("music");
            if (m.inst) {
                m.weight = math.min(m.weight + e, 1);
            }
            const p = this.getTrack("wind");
            if (m.inst && !t.isSoundPlaying(m.inst)) {
                p.weight = math.min(p.weight + e, 1);
            }
        }
    }
}

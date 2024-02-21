import * as PIXI from "pixi.js";
import device from "./device";
import { MapDefs } from "../../shared/defs/mapDefs";
import SoundDefs from "./soundDefs";
import lowResAtlasDefs from "./lowResAtlasDefs";
import fullResAtlasDefs from "./fullResAtlasDefs";

const AtlasDefs = {
    low: lowResAtlasDefs,
    high: fullResAtlasDefs
};

function i(e, t) {
    const r = PIXI.Texture.from(t);
    const a = r.baseTexture;
    let i = 0;
    if (!a.hasLoaded) {
        a.on("loaded", (r) => {
            console.log("Loaded texture", t);
            e.plugins.prepare.upload(r);
        });
        a.on("error", (e) => {
            console.log("BaseTex load error, retrying", t);
            if (i++ <= 3) {
                setTimeout(
                    () => {
                        if (e.source) {
                            e.updateSourceImage("");
                            e.updateSourceImage(
                                t.substring(5, t.length)
                            );
                        }
                    },
                    (i - 1) * 1000
                );
            }
        });
    }
    return a;
}
function o(e, t) {
    const r = i(e, `assets/${t.meta.image}`);
    const a = new PIXI.Spritesheet(r, t);
    a.resolution = r.resolution;
    a.parse();
    return a;
}
function s(e, t) {
    let r = Math.min(window.screen.width, window.screen.height);
    let a = Math.max(window.screen.width, window.screen.height);
    r *= window.devicePixelRatio;
    a *= window.devicePixelRatio;
    const i = a < 1366 && r < 768;
    let o = t.get("highResTex") ? "high" : "low";
    if (
        i ||
        (device.mobile && !device.tablet) ||
        e.type == PIXI.RENDERER_TYPE.CANVAS
    ) {
        o = "low";
    }
    if (e.type == PIXI.RENDERER_TYPE.WEBGL) {
        const s = e.gl;
        if (s.getParameter(s.MAX_TEXTURE_SIZE) < 4096) {
            o = "low";
        }
    }
    console.log(
        "TextureRes",
        o,
        "screenDims",
        window.screen.width,
        window.screen.height
    );
    return o;
}

class ResourceManager {
    constructor(t, r, i) {
        this.renderer = t;
        this.audioManager = r;
        this.config = i;
        this.textureRes = s(this.renderer, this.config);
        this.atlases = {};
        this.loadTicker = 0;
        this.loaded = false;
        t.plugins.prepare.limiter.maxItemsPerFrame = 1;
        /* let atlases = ""
         for (const atlas of Object.values(h.low)) {
            for (const sheet of atlas) {
                atlases += ` ${sheet.meta.image}`
            }
        }
        console.log(atlases) */
    }

    isAtlasLoaded(e) {
        return this.atlases[e]?.loaded;
    }

    atlasTexturesLoaded(e) {
        if (!this.isAtlasLoaded(e)) {
            return false;
        }
        for (
            let t = this.atlases[e], r = 0;
            r < t.spritesheets.length;
            r++
        ) {
            const a = t.spritesheets[r];
            if (!a.baseTexture?.hasLoaded) {
                return false;
            }
        }
        return true;
    }

    loadAtlas(e) {
        if (!this.isAtlasLoaded(e)) {
            console.log("Load atlas", e);
            this.atlases[e] = this.atlases[e] || {
                loaded: false,
                spritesheets: []
            };
            for (
                let t = AtlasDefs[this.textureRes] || AtlasDefs.low,
                    r = t[e],
                    a = 0;
                a < r.length;
                a++
            ) {
                const i = o(this.renderer, r[a]);
                this.atlases[e].spritesheets.push(i);
            }
            this.atlases[e].loaded = true;
        }
    }

    unloadAtlas(e) {
        if (this.isAtlasLoaded(e)) {
            console.log("Unload atlas", e);
            for (
                var t = this.atlases[e], r = 0;
                r < t.spritesheets.length;
                r++
            ) {
                t.spritesheets[r].destroy(true);
            }
            t.loaded = false;
            t.spritesheets = [];
        }
    }

    loadMapAssets(e) {
        const t = this;
        console.log("Load map", e);
        const r = MapDefs[e];
        if (!r) {
            throw new Error(
                `Failed loading mapDef ${this.mapName}`
            );
        }
        const a = r.assets.atlases;
        for (
            let i = Object.keys(this.atlases), o = 0;
            o < i.length;
            o++
        ) {
            const s = i[o];
            if (a.indexOf(s) === -1) {
                this.unloadAtlas(s);
            }
        }
        for (let n = 0; n < a.length; n++) {
            const l = a[n];
            if (!this.isAtlasLoaded(l)) {
                this.loadAtlas(l);
            }
        }
        setTimeout(() => {
            t.audioManager.preloadSounds();
            for (
                let e = r.assets.audio, a = 0;
                a < e.length;
                a++
            ) {
                const i = e[a];
                let o = SoundDefs.Sounds[i.channel];
                if (!o) {
                    const s = SoundDefs.Channels[i.channel];
                    o = SoundDefs.Sounds[s.list];
                }
                const n = o[i.name];
                const l = {
                    canCoalesce: n.canCoalesce,
                    channels: n.maxInstances,
                    volume: n.volume
                };
                t.audioManager.loadSound({
                    name: i.name,
                    channel: i.channel,
                    path: n.path,
                    options: l
                });
            }
        }, 0);
    }

    update(e) {
        if (!this.loaded) {
            this.loadTicker += e;
            let t = !this.preloadMap;
            for (
                let r = Object.keys(this.atlases), a = 0;
                a < r.length;
                a++
            ) {
                const i = r[a];
                if (!this.atlasTexturesLoaded(i)) {
                    t = false;
                }
            }
            if (!this.audioManager.allLoaded()) {
                t = false;
            }
            if (t) {
                console.log(
                    "Resource load complete",
                    this.loadTicker.toFixed(2)
                );
                this.loaded = true;
            }
        }
    }
}

export default {
    ResourceManager
};

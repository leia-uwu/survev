import * as PIXI from "pixi.js-legacy";
import { device } from "./device";
import { MapDef, MapDefs } from "../../shared/defs/mapDefs";
import SoundDefs from "./soundDefs";
import lowResAtlasDefs from "./lowResAtlasDefs";
import fullResAtlasDefs from "./fullResAtlasDefs";
import { AudioManager } from "./audioManager";
import { ConfigManager } from "./config";

const spritesheetDefs = {
    low: lowResAtlasDefs,
    high: fullResAtlasDefs
};

function loadTexture(renderer: PIXI.Renderer, url: string) {
    const tex = PIXI.Texture.from(url);
    const baseTex = tex.baseTexture;
    let loadAttempts = 0;

    if (!baseTex.hasLoaded) {
        baseTex.on("loaded", (baseTex) => {
            console.log("Loaded texture", url);
            renderer.prepare.upload(baseTex);
        });

        baseTex.on("error", (baseTex) => {
            console.log("BaseTex load error, retrying", url);
            if (loadAttempts++ <= 3) {
                setTimeout(
                    () => {
                        if (baseTex.source) {
                            baseTex.updateSourceImage("");
                            baseTex.updateSourceImage(
                                url.substring(5, url.length)
                            );
                        }
                    },
                    (loadAttempts - 1) * 1000
                );
            }
        });
    }
    return baseTex;
}

function loadSpritesheet(renderer: PIXI.Renderer, data: PIXI.ISpritesheetData) {
    const baseTex = loadTexture(renderer, `assets/${data.meta.image}`);

    const sheet = new PIXI.Spritesheet(baseTex, data);
    sheet.resolution = baseTex.resolution;
    sheet.parse();

    return sheet;
}

function selectTextureRes(renderer: PIXI.Renderer, config: ConfigManager) {
    let minDim = Math.min(window.screen.width, window.screen.height);
    let maxDim = Math.max(window.screen.width, window.screen.height);
    minDim *= window.devicePixelRatio;
    maxDim *= window.devicePixelRatio;
    const smallScreen = maxDim < 1366 && minDim < 768;
    let textureRes: "high" | "low" = config.get("highResTex") ? "high" : "low";

    if (
        smallScreen ||
        (device.mobile && !device.tablet) ||
        renderer.type == PIXI.RENDERER_TYPE.CANVAS
    ) {
        textureRes = "low";
    }
    if (renderer.type == PIXI.RENDERER_TYPE.WEBGL) {
        const s = renderer.gl;
        if (s.getParameter(s.MAX_TEXTURE_SIZE) < 4096) {
            textureRes = "low";
        }
    }
    console.log(
        "TextureRes",
        textureRes,
        "screenDims",
        window.screen.width,
        window.screen.height
    );
    return textureRes;
}

export class ResourceManager {
    atlases: Record<string, {
        loaded: boolean;
        spritesheets: PIXI.Spritesheet[]
    }> = {};
    loadTicker = 0;
    loaded = false;

    textureRes!: "high" | "low"
    mapName!: string;
    preloadMap!: boolean;
    
    constructor(
        public renderer: PIXI.Renderer,
        public audioManager: AudioManager,
        public config: ConfigManager
    ) {
        this.textureRes = selectTextureRes(this.renderer, this.config);
        renderer.prepare.limiter.maxItemsPerFrame = 1;
    }

    isAtlasLoaded(name: string) {
        return this.atlases[name]?.loaded;
    }

    atlasTexturesLoaded(name: string) {
        if (!this.isAtlasLoaded(name)) {
            return false;
        }

        const atlas = this.atlases[name];
        for (let i = 0; i < atlas.spritesheets.length; i++) {
            const spritesheet = atlas.spritesheets[i];
            if (!spritesheet.baseTexture?.hasLoaded) {
                return false;
            }
        }

        return true;
    }

    loadAtlas(name: string) {
        if (this.isAtlasLoaded(name)) {
            return;
        }

        console.log("Load atlas", name);

        this.atlases[name] = this.atlases[name] || {
            loaded: false,
            spritesheets: []
        };

        const atlasDefs = spritesheetDefs[this.textureRes] || spritesheetDefs.low;
        const atlasDef = atlasDefs[name as keyof typeof atlasDefs];
        for (let i = 0; i < atlasDef.length; i++) {
            console.log(atlasDef)
            const atlas = loadSpritesheet(this.renderer, atlasDef[i]);
            this.atlases[name].spritesheets.push(atlas);
        }
        this.atlases[name].loaded = true;
    }

    unloadAtlas(name: string) {
        if (!this.isAtlasLoaded(name)) {
            return;
        }

        console.log("Unload atlas", name);

        const atlas = this.atlases[name as keyof typeof this.atlases];
        for (let i = 0; i < atlas.spritesheets.length; i++) {
            atlas.spritesheets[i].destroy(true);
        }
        atlas.loaded = false;
        atlas.spritesheets = [];
    }

    loadMapAssets(mapName: string) {
        console.log("Load map", mapName);

        const mapDef = MapDefs[mapName] as MapDef;
        if (!mapDef) {
            throw new Error(`Failed loading mapDef ${this.mapName}`);
        }

        //
        // Textures
        //
        const atlasList = mapDef.assets.atlases;

        // Unload all atlases that aren't in the new list
        const keys = Object.keys(this.atlases);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (atlasList.indexOf(key) === -1) {
                this.unloadAtlas(key);
            }
        }

        // Load all new atlases
        for (let i = 0; i < atlasList.length; i++) {
            const atlas = atlasList[i];
            if (!this.isAtlasLoaded(atlas)) {
                this.loadAtlas(atlas);
            }
        }

        //
        // Audio
        //
        // PIXI spritesheets internally defer loading textures if the spritesheet
        // has more than 1000 images as a part of its internal batching process.
        //
        // Because we want images to load before audio, we'll also defer loading
        // audio in a similar fashion.
        setTimeout(() => {
            // Load shared audio
            this.audioManager.preloadSounds();

            // Load audio specific to the map
            const soundList = mapDef.assets.audio;
            for (let i = 0; i < soundList.length; i++) {
                const sound = soundList[i];

                // @HACK: Sometimes the channel doesn't correspond to where
                // the sound is defined in sound-defs.js; this is the case
                // with "players" sounds. Use an alternate method for looking
                // up the sound def.
                let soundsList = SoundDefs.Sounds[sound.channel];
                if (!soundsList) {
                    const channelDef = SoundDefs.Channels[sound.channel];
                    soundsList = SoundDefs.Sounds[channelDef.list];
                }

                const soundDef = soundsList[sound.name];

                const options = {
                    canCoalesce: soundDef.canCoalesce,
                    channels: soundDef.maxInstances,
                    volume: soundDef.volume
                };

                this.audioManager.loadSound({
                    name: sound.name,
                    channel: sound.channel,
                    path: soundDef.path,
                    options
                });
            }
        }, 0);
    }

    update(dt: number) {
        // Debug
        if (!this.loaded) {
            this.loadTicker += dt;

            let loaded = !this.preloadMap;
            const keys = Object.keys(this.atlases);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (!this.atlasTexturesLoaded(key)) {
                    loaded = false;
                }
            }
            if (!this.audioManager.allLoaded()) {
                loaded = false;
            }

            if (loaded) {
                console.log("Resource load complete", this.loadTicker.toFixed(2));
                this.loaded = true;
            }
        }
    }
}

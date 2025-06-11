// config and shared types

import type { ISpritesheetData } from "pixi.js-legacy";

export type AtlasRes = "high" | "low";

export const AtlasesConfig = {
    res: {
        high: 1,
        low: 0.5,
    },
    outDir: "./out/",
    // change filesDir to ../public/img
    // and loaderFormat to .svg
    // if you want to use svgs instead of cached pngs
    filesDir: "./pngs/",
    loaderFormat: ".png",
};

export interface AtlasDef {
    /**
     * Some atlases have extra quality compression disabled (like loadout).
     *
     * The quality compression works by limiting the image to 256 colors
     *
     * Which doesn't work for some atlases like loadout, gradient, etc...
     * since they have way more colors than the spritesheets with only map objects.
     *
     * This is what the original game did BTW, with this we get really similar (and small) file sizes.
     */
    compress: boolean;
    images: string[];
}

export interface MainToWorkerMsg {
    name: string;
    def: AtlasDef;
}

export interface WorkerToMainMsg {
    res: AtlasRes;
    data: ISpritesheetData[];
}

// sprites that are scaled inside the sheets
// TODO: maybe just scale the files manually and remove this?
export const scaledSprites: Record<string, number> = {
    "guns/gun-dp28-top-01.svg": 2,
    "guns/gun-long-01.svg": 2,
    "guns/gun-m249-bot-01.svg": 2,
    "guns/gun-med-01.svg": 2,
    "guns/gun-short-01.svg": 2,
    "map/map-bathhouse-pool-01.svg": 0.28,
    "map/map-building-house-ceiling.svg": 0.75,
    "map/map-building-hut-ceiling-01.svg": 0.75,
    "map/map-building-hut-ceiling-02.svg": 0.75,
    "map/map-building-mansion-ceiling.svg": 0.5,
    "map/map-building-police-ceiling-01.svg": 0.75,
    "map/map-building-police-ceiling-02.svg": 0.75,
    "map/map-building-shack-ceiling-01.svg": 0.75,
    "map/map-building-shack-ceiling-02.svg": 0.75,
    "map/map-building-vault-ceiling.svg": 0.5,
    "map/map-building-warehouse-ceiling-01.svg": 0.5,
    "map/map-building-warehouse-ceiling-02.svg": 0.5,
    "map/map-bunker-conch-chamber-ceiling-01.svg": 0.5,
    "map/map-bunker-conch-chamber-ceiling-02.svg": 0.5,
    "map/map-bunker-conch-compartment-ceiling-01.svg": 0.5,
    "map/map-bunker-egg-chamber-ceiling-01.svg": 0.5,
    "map/map-bunker-storm-chamber-ceiling-01.svg": 0.5,
    "map/map-bunker-hydra-ceiling-01.svg": 0.5,
    "map/map-bunker-hydra-chamber-ceiling-01.svg": 0.5,
    "map/map-bunker-hydra-chamber-ceiling-02.svg": 0.5,
    "map/map-bunker-hydra-chamber-ceiling-03.svg": 0.5,
    "map/map-bunker-hydra-compartment-ceiling-02.svg": 0.5,
    "map/map-bunker-hydra-compartment-ceiling-03.svg": 0.5,
};

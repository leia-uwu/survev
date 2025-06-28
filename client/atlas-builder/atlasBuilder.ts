import cp from "node:child_process";
import fs from "node:fs";
import type { ISpritesheetData } from "pixi.js-legacy";
import type { Atlas } from "../../shared/defs/mapDefs.ts";
import {
    type AtlasDef,
    AtlasesConfig,
    type AtlasRes,
    type MainToWorkerMsg,
    type WorkerToMainMsg,
} from "./atlasConfig.ts";
import { CobaltAtlas } from "./defs/cobalt.ts";
import { DesertAtlas } from "./defs/desert.ts";
import { FactionAtlas } from "./defs/faction.ts";
import { GradientAtlas } from "./defs/gradient.ts";
import { HalloweenAtlas } from "./defs/halloween.ts";
import { LoadoutAtlas } from "./defs/loadout.ts";
import { MainAtlas } from "./defs/main.ts";
import { PotatoAtlas } from "./defs/potato.ts";
import { SavannahAtlas } from "./defs/savannah.ts";
import { SharedAtlas } from "./defs/shared.ts";
import { SnowAtlas } from "./defs/snow.ts";
import { WoodsAtlas } from "./defs/woods.ts";

const Atlases: Record<Atlas, AtlasDef> = {
    gradient: GradientAtlas,
    loadout: LoadoutAtlas,
    shared: SharedAtlas,
    main: MainAtlas,
    desert: DesertAtlas,
    faction: FactionAtlas,
    halloween: HalloweenAtlas,
    potato: PotatoAtlas,
    snow: SnowAtlas,
    woods: WoodsAtlas,
    cobalt: CobaltAtlas,
    savannah: SavannahAtlas,
};

if (!fs.existsSync(AtlasesConfig.outDir)) {
    fs.mkdirSync(AtlasesConfig.outDir);
}

// clean the output dir from old atlases
for (const file of fs.readdirSync(AtlasesConfig.outDir)) {
    fs.rmSync(`${AtlasesConfig.outDir}/${file}`);
}

const atlasesJSON: Record<AtlasRes, Record<string, ISpritesheetData[]>> = {
    high: {},
    low: {},
};

const promises: Promise<void>[] = [];

for (const atlas in Atlases) {
    // TODO: limit number of concurrent processes to os.availableParallelism()

    const promise = new Promise<void>((resolve) => {
        const process = cp.fork("./builderWorker.ts");

        process.send({
            name: atlas,
            def: Atlases[atlas as Atlas],
        } satisfies MainToWorkerMsg);

        process.on("message", (msg: WorkerToMainMsg) => {
            atlasesJSON[msg.res][atlas] = msg.data;
        });

        process.on("exit", () => {
            resolve();
        });
    });

    promises.push(promise);
}

await Promise.all(promises);

for (const res in AtlasesConfig.res) {
    const data = atlasesJSON[res as AtlasRes];

    // sort the atlases both by atlas name
    // and the individual frames inside each spritesheet
    // this is done to make the git diff for the generated JSON files smaller
    // can be removed once we figure a way to make build time spritesheets
    // not be a total PITA
    const sortedData = {} as Record<string, ISpritesheetData[]>;

    for (const atlasKey of Object.keys(data).sort()) {
        const atlas = data[atlasKey];

        const sortedAtlas: ISpritesheetData[] = [];

        for (const sheet of atlas) {
            const sortedSheet: ISpritesheetData = {
                meta: sheet.meta,
                frames: {},
            };
            for (const frame of Object.keys(sheet.frames).sort()) {
                sortedSheet.frames[frame] = sheet.frames[frame];
            }
            sortedAtlas.push(sortedSheet);
        }

        sortedData[atlasKey] = sortedAtlas;
    }

    fs.writeFileSync(
        `${AtlasesConfig.outDir}/${res}.json`,
        JSON.stringify(sortedData, null, 2),
    );
}

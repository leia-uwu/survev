import path, { resolve } from "path";
import { watch } from "chokidar";
import { Minimatch } from "minimatch";
import type { ISpritesheetData } from "pixi.js-legacy";
import type { FSWatcher, Plugin, ResolvedConfig } from "vite";
import fullResAtlasDefs from "../../src/fullResAtlasDefs.json";
import readDirectory from "./utils/misc.js";
import {
    type CompilerOptions,
    type MultiResAtlasList,
    createSpritesheets
} from "./utils/spritesheet.js";

const defaultGlob = "**/*.svg";
const imagesMatcher = new Minimatch(defaultGlob);

const PLUGIN_NAME = "vite-spritesheet-plugin";

const compilerOpts = {
    outputFormat: "png",
    outDir: "assets",
    margin: 8,
    removeExtensions: true,
    maximumSize: 4096,
    name: "generated",
    packerOptions: {}
} satisfies CompilerOptions as CompilerOptions;

const atlasesToBuild: Record<string, string> = {
    main: "public/img"
};

// for (const atlasId of ModeAtlases) {
//     atlasesToBuild[atlasId] = `public/img/modes/${atlasId}`;
// }

type AtlasDef = Record<string, readonly ISpritesheetData[]>;

const filesToIgnore = new Set<string>();
for (const data of Object.values(fullResAtlasDefs as unknown as AtlasDef)) {
    for (const { frames } of data) {
        for (const key of Object.keys(frames)) {
            filesToIgnore.add(key.replace("img", "svg"));
        }
    }
}

const foldersToWatch = Object.values(atlasesToBuild);

async function buildSpritesheets(): Promise<MultiResAtlasList> {
    const atlases: MultiResAtlasList = {};

    for (const atlasId in atlasesToBuild) {
        const files: string[] = readDirectory(atlasesToBuild[atlasId]).filter((x) => {
            return imagesMatcher.match(x) && filesToIgnore.has(path.basename(x));
        });
        atlases[`generated-${atlasId}`] = await createSpritesheets(files, {
            ...compilerOpts,
            name: atlasId
        });
    }

    return atlases;
}

const highResVirtualModuleId = "virtual:spritesheets-jsons-high-res";
const highResResolvedVirtualModuleId = `\0${highResVirtualModuleId}`;

const lowResVirtualModuleId = "virtual:spritesheets-jsons-low-res";
const lowResResolvedVirtualModuleId = `\0${lowResVirtualModuleId}`;

const resolveId = (id: string): string | undefined => {
    switch (id) {
        case highResVirtualModuleId:
            return highResResolvedVirtualModuleId;
        case lowResVirtualModuleId:
            return lowResResolvedVirtualModuleId;
    }
};

export function spritesheet(): Plugin[] {
    let watcher: FSWatcher;
    let config: ResolvedConfig;

    let atlases: MultiResAtlasList = {};

    const exportedAtlases: {
        readonly low: AtlasDef;
        readonly high: AtlasDef;
    } = {
        low: {},
        high: {}
    };

    const load = (id: string): string | undefined => {
        switch (id) {
            case highResResolvedVirtualModuleId:
                return `export const atlases = JSON.parse('${JSON.stringify(exportedAtlases.high)}')`;
            case lowResResolvedVirtualModuleId:
                return `export const atlases = JSON.parse('${JSON.stringify(exportedAtlases.low)}')`;
        }
    };

    let buildTimeout: NodeJS.Timeout | undefined;

    return [
        {
            name: `${PLUGIN_NAME}:build`,
            apply: "build",
            async buildStart() {
                this.info("Building spritesheets");
                atlases = await buildSpritesheets();

                for (const atlasId in atlases) {
                    exportedAtlases.high[atlasId] = atlases[atlasId].high.map(
                        (sheet) => sheet.json
                    );
                    exportedAtlases.low[atlasId] = atlases[atlasId].low.map(
                        (sheet) => sheet.json
                    );
                }
            },
            generateBundle() {
                for (const atlasId in atlases) {
                    const sheets = atlases[atlasId];
                    for (const sheet of [...sheets.low, ...sheets.high]) {
                        this.emitFile({
                            type: "asset",
                            fileName: sheet.json.meta.image,
                            source: sheet.image
                        });
                        this.info(`Built spritesheet ${sheet.json.meta.image}`);
                    }
                }
            },
            resolveId,
            load
        },
        {
            name: `${PLUGIN_NAME}:serve`,
            apply: "serve",
            configResolved(cfg) {
                config = cfg;
            },
            async configureServer(server) {
                function reloadPage(): void {
                    clearTimeout(buildTimeout);

                    buildTimeout = setTimeout(() => {
                        config.logger.info("Rebuilding spritesheets");

                        buildSheets()
                            .then(() => {
                                const module =
                                    server.moduleGraph.getModuleById(
                                        highResVirtualModuleId
                                    );
                                if (module !== undefined)
                                    void server.reloadModule(module);
                                const module2 =
                                    server.moduleGraph.getModuleById(
                                        lowResVirtualModuleId
                                    );
                                if (module2 !== undefined)
                                    void server.reloadModule(module2);
                            })
                            .catch((e) => console.error(e));
                    }, 500);
                }

                watcher = watch(
                    foldersToWatch.map((pattern) => resolve(pattern, defaultGlob)),
                    {
                        cwd: config.root,
                        ignoreInitial: true
                    }
                )
                    .on("add", reloadPage)
                    .on("change", reloadPage)
                    .on("unlink", reloadPage);

                const files = new Map<string, Buffer | string>();

                async function buildSheets(): Promise<void> {
                    atlases = await buildSpritesheets();

                    const { low, high } = exportedAtlases;
                    for (const atlasId in atlases) {
                        high[atlasId] = atlases[atlasId].high.map((sheet) => sheet.json);
                        low[atlasId] = atlases[atlasId].low.map((sheet) => sheet.json);
                    }

                    files.clear();
                    for (const atlasId in atlases) {
                        const sheets = atlases[atlasId];
                        for (const sheet of [...sheets.low, ...sheets.high]) {
                            // consistently assigned in ./spritesheet.ts in function `createSheet` (in function `createSpritesheets`)
                            files.set(sheet.json.meta.image!, sheet.image);
                        }
                    }
                }
                await buildSheets();

                return () => {
                    server.middlewares.use((req, res, next) => {
                        if (req.originalUrl === undefined) return next();

                        const file = files.get(req.originalUrl.slice(1));
                        if (file === undefined) return next();

                        res.writeHead(200, {
                            "Content-Type": `image/${compilerOpts.outputFormat}`
                        });

                        res.end(file);
                    });
                };
            },
            closeBundle: async () => {
                await watcher.close();
            },
            resolveId,
            load
        }
    ];
}

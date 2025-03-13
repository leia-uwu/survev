import fs from "node:fs";
import fsp from "node:fs/promises";
import { type Image, createCanvas, loadImage } from "canvas";
import { type Bin, MaxRectsPacker, type Rectangle } from "maxrects-packer";
import type { ISpritesheetData } from "pixi.js-legacy";
import sharp from "sharp";
import {
    type AtlasDef,
    type AtlasRes,
    AtlasesConfig,
    type MainToWorkerMsg,
    type WorkerToMainMsg,
    scaledSprites,
} from "./atlasConfig.ts";
import { type Edges, detectEdges } from "./detectEdges.ts";

interface ImageData {
    image: Image;
    key: string;
    edges: Edges;
    unscaledEdges: Edges;
    width: number;
    height: number;
}

export class AtlasBuilder {
    packer: MaxRectsPacker;

    rects: Array<{
        width: number;
        height: number;
        size: number;
        data: ImageData;
    }> = [];

    atlasJson: ISpritesheetData[] = [];

    constructor(
        public name: string,
        public def: AtlasDef,
        public scale: number,
    ) {
        this.packer = new MaxRectsPacker(4096 * scale, 4096 * scale, 4, {
            border: 2,
            square: true,
        });
    }

    async build() {
        console.log(`Building atlas ${this.name}-${100 * this.scale}`);

        const start = Date.now();
        await this.pack();
        await this.generateAtlases();

        const timeTaken = Date.now() - start;
        console.log(
            `Finished building ${this.name}-${100 * this.scale} after ${timeTaken}ms`,
        );
    }

    static imageCache = new Map<
        string,
        {
            image: Image;
            edges: Edges;
        }
    >();

    async loadImage(key: string, path: string, scale: number) {
        let image: Image;
        let edges: Edges;

        // since we build both 100% and 50% scale atlas in the same process
        // we can cache the loaded image
        const cached = AtlasBuilder.imageCache.get(key);
        if (cached) {
            image = cached.image;
            edges = cached.edges;
        } else {
            if (!fs.existsSync(path)) {
                console.error(`Image ${path} does not exist`);
                return;
            }

            image = await loadImage(path);
            const canvas = createCanvas(image.width, image.height);
            const ctx = canvas.getContext("2d");

            ctx.drawImage(image, 0, 0);
            edges = detectEdges(canvas, { tolerance: 0 }) as Edges;

            AtlasBuilder.imageCache.set(key, {
                image,
                edges,
            });
        }

        // need to test more if floor, ceil or round is better here...
        // or maybe a combination of them?

        const width = Math.floor((image.width - edges.left - edges.right) * scale);
        const height = Math.floor((image.height - edges.top - edges.bottom) * scale);

        this.rects.push({
            width,
            height,
            // used for sorting
            // max(width, height) gives more optimized packing from my tests
            size: Math.max(width, height),
            data: {
                image,
                key: key,
                edges: {
                    left: Math.floor(edges.left * scale),
                    right: Math.floor(edges.right * scale),
                    top: Math.floor(edges.top * scale),
                    bottom: Math.floor(edges.bottom * scale),
                },
                unscaledEdges: edges,
                width: Math.floor(image.width * scale),
                height: Math.floor(image.height * scale),
            },
        });
    }

    async pack() {
        const imagePromises: Promise<void>[] = [];

        for (const file of this.def.images) {
            const key = file.split("/").at(-1)!.replace(".svg", ".img");

            const path = `${AtlasesConfig.filesDir}/${file.replace(".svg", AtlasesConfig.loaderFormat)}`;

            const scale = (scaledSprites[file] ?? 1) * this.scale;

            imagePromises.push(this.loadImage(key, path, scale));
        }
        await Promise.all(imagePromises);

        // sort all rects by their size for more optimized packing that generates
        // less spritesheets
        this.rects.sort((a, b) => {
            return b.size - a.size;
        });

        for (const rect of this.rects) {
            this.packer.add(rect.width, rect.height, rect.data);
        }
    }

    async generateAtlases() {
        const renderPromises: Promise<void>[] = [];
        for (let i = 0; i < this.packer.bins.length; i++) {
            const bin = this.packer.bins[i];
            renderPromises.push(
                this.renderSheet(`${this.name}-${i}-${100 * this.scale}`, bin),
            );
        }
        await Promise.all(renderPromises);
    }

    async renderSheet(name: string, bin: Bin<Rectangle>) {
        const canvas = createCanvas(bin.width, bin.height);

        const ctx = canvas.getContext("2d");

        const sheetData: ISpritesheetData = {
            meta: {
                image: `${name}.png`,
                size: {
                    w: bin.width,
                    h: bin.height,
                },
                scale: this.scale,
            },
            frames: {},
        };

        for (const rect of bin.rects) {
            const data = rect.data as ImageData;

            const frameData = {
                frame: {
                    x: rect.x,
                    y: rect.y,
                    w: rect.width,
                    h: rect.height,
                },
                rotated: false,
                trimmed: true,
                spriteSourceSize: {
                    x: data.edges.left,
                    y: data.edges.top,
                    w: rect.width,
                    h: rect.height,
                },
                sourceSize: {
                    w: data.width,
                    h: data.height,
                },
            };
            sheetData.frames[data.key] = frameData;

            ctx.drawImage(
                data.image,
                // unscaled image position and size
                data.unscaledEdges.left,
                data.unscaledEdges.top,
                data.image.width - (data.unscaledEdges.left + data.unscaledEdges.right),
                data.image.height - (data.unscaledEdges.top + data.unscaledEdges.bottom),
                // scaled image position and size
                rect.x,
                rect.y,
                rect.width,
                rect.height,
            );
        }
        this.atlasJson.push(sheetData);

        let buff: Buffer;

        // see comment on the atlasDef interface
        if (this.def.compress) {
            buff = await sharp(canvas.toBuffer("image/png"))
                .png({
                    compressionLevel: 9,
                    quality: 99,
                    dither: 0,
                })
                .toBuffer();
        } else {
            buff = canvas.toBuffer("image/png", {
                compressionLevel: 9,
            });
        }
        await fsp.writeFile(`${AtlasesConfig.outDir}/${sheetData.meta.image!}`, buff);
    }
}

process.on("message", async (data: MainToWorkerMsg) => {
    for (const res in AtlasesConfig.res) {
        const scale = AtlasesConfig.res[res as AtlasRes];

        const builder = new AtlasBuilder(data.name, data.def, scale);
        await builder.build();

        process.send!({
            res: res as AtlasRes,
            data: builder.atlasJson,
        } satisfies WorkerToMainMsg);
    }

    process.exit();
});

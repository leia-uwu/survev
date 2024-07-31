import path from "path";
import { type Image, loadImage } from "canvas";
import sharp from "sharp";

const filesToScale: Record<string, number> = {
    "map-building-vault-ceiling.svg": 0.5,
    "map-building-shack-ceiling-01.svg": 0.7,
    "map-building-mansion-ceiling.svg": 0.5,
    "z.svg": 0.75,
    "map-bunker-hydra-compartment-ceiling-03.svg": 0.5,
    "map-building-police-ceiling-01.svg": 0.75,
    "map-building-police-ceiling-02.svg": 0.75,
    "map-building-warehouse-ceiling-01.svg": 0.5,
    "map-building-warehouse-ceiling-02.svg": 0.5,
    "map-building-warehouse-floor-01.svg": 1.5,
    "map-building-warehouse-floor-02.svg": 1.5,
    "gun-med-01.svg": 2,
    "gun-long-01.svg": 2,
    "gun-short-01.svg": 2
};

interface PackerRectData {
    readonly image: Image;
    readonly path: string;
}

type TrimData = Record<
    string,
    {
        trim: {
            y: number;
            x: number;
            width: number;
            height: number;
        },
        original: {
            width: number;
            height: number;
        }
    }
>;

async function scaleImage(
    filePath: string,
    trimmedImages: TrimData
): Promise<PackerRectData> {
    const basename = path.basename(filePath);
    if (!(basename in filesToScale)) {
        const image = await loadImage(filePath);
        return {
            path: filePath,
            image
        };
    }
    const scaleFactor = filesToScale[basename];
    const { data: originalImage, info: originInfo } = await sharp(filePath).toBuffer({
        resolveWithObject: true
    });
    // Trim the image
    const { data: trimmedImage, info: trimmedInfo } = await sharp(originalImage)
        .trim({
            background: "transparent"
        })
        .toBuffer({ resolveWithObject: true });

    const { data: scaledImage, info: scaledInfo } = await sharp(trimmedImage)
        .resize({
            width: trimmedInfo.width
                ? Math.round(trimmedInfo.width * scaleFactor)
                : undefined,
            height: trimmedInfo.height
                ? Math.round(trimmedInfo.height * scaleFactor)
                : undefined,
            fit: "inside"
        })
        .toBuffer({ resolveWithObject: true });

    const loadedImage = await loadImage(scaledImage);

    const trimmed =
        originInfo.width !== trimmedInfo.width ||
        originInfo.height !== trimmedInfo.height;

    if (trimmed) {
        trimmedImages[basename.replace("svg", "img")] = {
            trim: {
                height: trimmedInfo.height || 0,
                width: trimmedInfo.width || 0,
                x: trimmedInfo.trimOffsetLeft!,
                y: trimmedInfo.trimOffsetTop!
            },
            original: {
                width: originInfo.width,
                height: originInfo.height
            }
        };

        console.log(basename,
            trimmedImages[basename.replace("svg", "img")]

        )
    }

    return {
        image: loadedImage,
        path: filePath,
    };
}

export async function scaleImages(paths: readonly string[]) {
    const trimmedImages: TrimData = {};
    const images: readonly PackerRectData[] = await Promise.all(
        paths.map(async (path) => scaleImage(path, trimmedImages))
    );

    return { images, trimmedImages };
}

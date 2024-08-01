import path from "path";
import { type Image, loadImage } from "canvas";
import sharp from "sharp";
import { ASSET_SCALE } from "../reference";
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
        };
        scaled: {
            width: number;
            height: number;
        };
    }
>;

async function scaleImage(
    filePath: string,
    trimmedImages: TrimData
): Promise<PackerRectData> {
    return new Promise(async (res) => {
        const basename = path.basename(filePath).replace("svg", "img");
        const scaleFactor = ASSET_SCALE[basename] ?? 1;
        if (scaleFactor !== 1) {
            console.log(`scaling ${basename} by ${scaleFactor}`);
        }
        const { data: originalImage, info: originalInfo } = await sharp(
            filePath
        ).toBuffer({ resolveWithObject: true });

        const { data: scaledImage, info: scaledInfo } = await sharp(originalImage)
            .resize({
                width: Math.floor(originalInfo.width * scaleFactor),
                height: Math.floor(originalInfo.height * scaleFactor)
            })
            .toBuffer({ resolveWithObject: true });

        const { data: trimmedImage, info: trimmedInfo } = await sharp(scaledImage)
            .trim({
                lineArt: true,
                background: "transparent"
            })
            .toBuffer({ resolveWithObject: true });

        const loadedImage = await loadImage(scaledImage);

        const trimmed =
            scaledInfo.width !== trimmedInfo.width ||
            scaledInfo.height !== trimmedInfo.height;
        if (basename === "map-building-vault-ceiling.img") {
            console.log({
                originalInfo,
                scaledInfo,
                trimmedInfo,
                image: { height: loadedImage.height, width: loadedImage.width }
            });
        }
        if (trimmed) {
            trimmedImages[basename] = {
                trim: {
                    height: trimmedInfo.height || 0,
                    width: trimmedInfo.width || 0,
                    x: Math.abs(trimmedInfo.trimOffsetLeft!),
                    y: Math.abs(trimmedInfo.trimOffsetTop!)
                },
                scaled: {
                    width: scaledInfo.width,
                    height: scaledInfo.height
                }
            };
        }

        res({
            image: loadedImage,
            path: filePath
        });
    });
}

export async function scaleImages(paths: readonly string[]) {
    const trimmedImages: TrimData = {};
    // chunk me later daddy
    const images: readonly PackerRectData[] = await Promise.all(
        paths.map(async (path) => await scaleImage(path, trimmedImages))
    );
    return { images, trimmedImages };
}

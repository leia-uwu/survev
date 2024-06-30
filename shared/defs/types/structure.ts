import type { AABBWithHeight } from "../../utils/coldet";
import type { Vec2 } from "../../utils/v2";
import type { TerrainSpawnDef } from "../mapObjectsTyping";

export interface StructureDef {
    readonly type: "structure";
    terrain: TerrainSpawnDef;
    ori?: number;
    mapObstacleBounds?: AABBWithHeight[];
    layers: Array<{
        type: string;
        pos: Vec2;
        ori: number;
        underground?: boolean;
        inheritOri?: number;
    }>;
    stairs: Array<{
        collision: AABBWithHeight;
        downDir: Vec2;
        noCeilingReveal?: boolean;
        lootOnly?: boolean;
    }>;
    mask: AABBWithHeight[];
    bunkerType?: string;
    structureType?: string;
    interiorSound?: {
        sound: string;
        soundAlt: string;
        filter?: string;
        transitionTime: number;
        soundAltPlayTime?: number;
        outsideMaxDist: number;
        outsideVolume: number;
        undergroundVolume?: number;
        puzzle: string;
    };
    bridgeLandBounds?: AABBWithHeight[];
    bridgeWaterBounds?: AABBWithHeight[];
}

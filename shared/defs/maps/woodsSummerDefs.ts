import { util } from "../../utils/util";
import type { MapDef } from "../mapDefs";
import { Woods } from "../../../server/src/deathmatch/maps/woods";

const mapDef = {
    biome: {
        colors: {
            background: 2118510,
            water: 3310251,
            waterRipple: 11792639,
            beach: 14458408,
            riverbank: 10711321,
            grass: 6460706,
            underground: 1772803,
            playerSubmerge: 2854052,
            playerGhillie: 6658085,
        },
        particles: { camera: "falling_leaf_summer" },
    },
};

export const WoodsSummer = util.mergeDeep({}, Woods, mapDef) as MapDef;

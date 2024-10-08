import type { MapDef } from "../../../../shared/defs/mapDefs";
import { Main } from "../../../../shared/defs/maps/baseDefs";
import { GameConfig } from "../../../../shared/gameConfig";
import { util } from "../../../../shared/utils/util";
import { v2 } from "../../../../shared/utils/v2";
import { THIS_REGION } from "../../resurviv-config";

const switchToSmallMap = THIS_REGION === "eu" || THIS_REGION === "as";

const config = {
    mapSize: switchToSmallMap ? "small" : "large",
    places: 3,
    mapWidth: { large: 270, small: 230 },
    spawnDensity: { large: 37, small: 27 },
} as const;

const mapDef = {
    mapId: 2,
    desc: {
        name: "Woods",
        icon: "img/gui/player-king-woods.svg",
        buttonCss: "btn-mode-woods",
    },
    locationSpawns: [
        {
            type: "logging_complex_01", 
            pos: v2.create(0.5, 0.5),
            rad: 100,
            retryOnFailure: true,
        },
        {
            type: "teapavilion_01w", // couldn't get this to spawn 
            pos: v2.create(0.5, 0.5),
            rad: 100,
            retryOnFailure: true,
        },
    ],
    assets: {
        audio: [
            { name: "vault_change_02", channel: "sfx" },
            { name: "log_01", channel: "sfx" },
            { name: "log_02", channel: "sfx" },
            { name: "footstep_08", channel: "sfx" },
            { name: "footstep_09", channel: "sfx" },
        ],
        atlases: ["gradient", "loadout", "shared", "woods"],
    },
    biome: {
        colors: {
            background: 2118510,
            water: 3310251,
            waterRipple: 11792639,
            beach: 15709019,
            riverbank: 7812619,
            grass: 9339690,
            underground: 1772803,
            playerSubmerge: 2854052,
        },
        particles: { camera: "falling_leaf" },
    },
    gameMode: { maxPlayers: 80, woodsMode: true },
    gameConfig: {
        /* STRIP_FROM_PROD_CLIENT:START */
        planes: {
            timings: [
                {
                    circleIdx: 1,
                    wait: 10,
                    options: { type: GameConfig.Plane.Airdrop },
                },
                {
                    circleIdx: 3,
                    wait: 2,
                    options: { type: GameConfig.Plane.Airdrop },
                },
            ],
            crates: [
                { name: "airdrop_crate_01", weight: 10 },
                { name: "airdrop_crate_02", weight: 1 },
            ],
        },
        /* STRIP_FROM_PROD_CLIENT:END */
        bagSizes: {
            frag: [6, 12, 15, 18],
            smoke: [6, 12, 15, 18],
        },
    },
    /* STRIP_FROM_PROD_CLIENT:START */
    lootTable: {
        tier_mansion_floor: [{ name: "outfitCasanova", count: 1, weight: 1 }],
    tier_vault_floor: [{ name: "outfitJester", count: 1, weight: 1 }],
    tier_police_floor: [{ name: "outfitPrisoner", count: 1, weight: 1 }],
    tier_chrys_01: [{ name: "outfitImperial", count: 1, weight: 1 }],
    tier_chrys_02: [{ name: "katana", count: 1, weight: 1 }],
    tier_chrys_case: [
        // { name: "tier_katanas", count: 1, weight: 3 },
        { name: "naginata", count: 1, weight: 1 },
    ],
    tier_police: [
        { name: "saiga", count: 1, weight: 1 },
        // { name: "flare_gun", count: 1, weight: 0.1 }
    ],
    tier_eye_02: [{ name: "stonehammer", count: 1, weight: 1 }],
    tier_eye_block: [
        { name: "m9", count: 1, weight: 1 },
        { name: "ots38_dual", count: 1, weight: 1 },
        { name: "flare_gun", count: 1, weight: 1 },
        { name: "colt45", count: 1, weight: 1 },
        { name: "45acp", count: 1, weight: 1 },
        { name: "painkiller", count: 1, weight: 1 },
        { name: "m4a1", count: 1, weight: 1 },
        { name: "m249", count: 1, weight: 1 },
        { name: "awc", count: 1, weight: 1 },
        { name: "pkp", count: 1, weight: 1 },
    ],
    tier_sledgehammer: [{ name: "sledgehammer", count: 1, weight: 1 }],
    tier_chest_04: [
        { name: "p30l", count: 1, weight: 40 },
        { name: "p30l_dual", count: 1, weight: 1 },
    ],
    tier_woodaxe: [{ name: "woodaxe", count: 1, weight: 1 }],
    tier_club_melee: [{ name: "machete_taiga", count: 1, weight: 1 }],
    tier_pirate_melee: [{ name: "hook", count: 1, weight: 1 }],
    tier_hatchet_melee: [
        { name: "fireaxe", count: 1, weight: 5 },
        { name: "tier_katanas", count: 1, weight: 3 },
        { name: "stonehammer", count: 1, weight: 1 },
    ],
    tier_airdrop_uncommon: [
        { name: "sv98", count: 1, weight: 1 },
        { name: "outfitGhillie", count: 1, weight: 1 },
    ],
    tier_airdrop_rare: [
        { name: "sv98", count: 1, weight: 1 },
        { name: "outfitGhillie", count: 1, weight: 1 },
    ],
    tier_throwables: [
        { name: "frag", count: 2, weight: 1 },
        { name: "smoke", count: 1, weight: 1 },
        { name: "mirv", count: 2, weight: 0.05 },
    ],
    tier_hatchet: [
        { name: "pan", count: 1, weight: 1 },
        { name: "pkp", count: 1, weight: 1 },
        { name: "usas", count: 1, weight: 1 },
    ],
    },
    mapGen: {
        map: {
            baseWidth: config.mapWidth[config.mapSize],
            baseHeight: config.mapWidth[config.mapSize],
            shoreInset: 7, //40
            rivers: {
                lakes: [{
                    odds: 1,
                    innerRad: 16,
                    outerRad: 48,
                    spawnBound: {
                        pos: v2.create(0.5, 0.5),
                        rad: 100,
                    },
                },],
                weights: [],
            },
        },
        
      
        places: Main.mapGen
            ? Array(config.places)
                  .fill(false)
                  .map(() => {
                      return Main.mapGen?.places[
                          Math.floor(Math.random() * Main.mapGen.places.length)
                      ];
                  })
            : {},
        densitySpawns: Main.mapGen
            ? Main.mapGen.densitySpawns.reduce(
                  (array, item) => {
                      let object: Record<string, number> = {};
                      for (const [key, value] of Object.entries(item)) {
                          object[key] =
                              (value * config.spawnDensity[config.mapSize]) / 100;
                      }
                      array.push(object);
                      return array;
                  },
                  [] as Record<string, number>[],
              )
            : {},
        fixedSpawns: [
            {
                logging_complex_01: 1,
                logging_complex_02: 1,
                teapavilion_01w: 1,
                warehouse_01: 1,
                house_red_01: 1,
                barn_01: 0,
                cache_03: 1,
                cache_01: 1,
                cache_02: 1,
                bunker_structure_01b: 1,
                bunker_structure_03: 1,
                bunker_structure_07: 1,
                chest_03: { odds: 0.5 },
                crate_19: 12,
                stone_04: 6,
                tree_02: 6,
                tree_08: 180, 
                tree_08b: 40, 
                tree_09: 80, 
            },
        ],
        randomSpawns: [
            {
                spawns: [
                    "mansion_structure_01",
                    // "warehouse_complex_01",
                    "police_01",
                    "bank_01",
                ],
                choose: config.mapSize === "large" ? 2 : 1,
            },
        ],
        spawnReplacements: [
            {
                tree_01: "tree_07",
                crate_02: "crate_19",
                crate_08: "crate_19",
                crate_09: "crate_19",
                bush_01 : "bush_06",
            },
        ],
    },
    /* STRIP_FROM_PROD_CLIENT:END */
};
export const Woods = util.mergeDeep({}, Main, mapDef) as MapDef;

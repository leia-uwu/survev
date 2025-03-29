import { GameConfig } from "../../gameConfig";
import { util } from "../../utils/util";
import { v2 } from "../../utils/v2";
import type { MapDef } from "../mapDefs";
import { Main, type PartialMapDef } from "./baseDefs";

const mapDef: PartialMapDef = {
    mapId: 5,
    desc: {
        name: "Savannah",
        icon: "img/gui/player-the-hunted.svg",
        buttonCss: "btn-mode-savannah",
    },
    assets: {
        audio: [],
        atlases: ["gradient", "loadout", "shared", "savannah"],
    },
    biome: {
        colors: {
            background: 1858399,
            water: 4301994,
            waterRipple: 9892086,
            beach: 13332786,
            riverbank: 11689508,
            grass: 11841582,
            underground: 4001027,
            playerSubmerge: 5151631,
            playerGhillie: 11578411,
        },
        particles: {},
    },
    gameMode: { maxPlayers: 80, sniperMode: true },
    /*STRIP_FROM_PROD_CLIENT:START */
    gameConfig: {
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
                { name: "airdrop_crate_01sv", weight: 10 },
                { name: "airdrop_crate_02sv", weight: 1 },
            ],
        },
    },
    lootTable: {
        tier_scopes: [
            { name: "4xscope", count: 1, weight: 5 },
            { name: "8xscope", count: 1, weight: 2 },
            { name: "15xscope", count: 1, weight: 0.05 },
        ],
        tier_throwables: [
            { name: "frag", count: 2, weight: 1 },
            { name: "smoke", count: 1, weight: 1 },
            { name: "mirv", count: 2, weight: 0.05 },
            { name: "strobe", count: 1, weight: 0.05 },
        ],
        tier_guns: [
            { name: "m1911", count: 1, weight: 16 },
            { name: "m9", count: 1, weight: 12 },
            { name: "colt45", count: 1, weight: 9 },
            { name: "ot38", count: 1, weight: 10 },
            { name: "mp5", count: 1, weight: 8 },
            { name: "mac10", count: 1, weight: 8 },
            { name: "m1a1", count: 1, weight: 8 },
            { name: "scorpion", count: 1, weight: 0.01 },
            { name: "m39", count: 1, weight: 15 },
            { name: "garand", count: 1, weight: 0.09 },
            { name: "svd", count: 1, weight: 6 },
            { name: "l86", count: 1, weight: 7 },
            { name: "mk12", count: 1, weight: 12 },
            { name: "vss", count: 1, weight: 9 },
            { name: "scarssr", count: 1, weight: 0.05 },
            { name: "mkg45", count: 1, weight: 1 },
            { name: "scar", count: 1, weight: 0.9 },
            { name: "scout_elite", count: 1, weight: 5 },
            { name: "blr", count: 1, weight: 5 },
            { name: "mosin", count: 1, weight: 3 },
            { name: "awc", count: 1, weight: 0.09 },
            { name: "sv98", count: 1, weight: 0.03 },
        ],
        tier_ammo: [
            { name: "9mm", count: 60, weight: 3 },
            { name: "556mm", count: 60, weight: 3 },
            { name: "762mm", count: 60, weight: 3 },
            { name: "45acp", count: 60, weight: 3 },
        ],
        tier_ammo_crate: [
            { name: "9mm", count: 60, weight: 3 },
            { name: "556mm", count: 60, weight: 3 },
            { name: "762mm", count: 60, weight: 3 },
            { name: "45acp", count: 60, weight: 3 },
            { name: "flare", count: 1, weight: 1 },
        ],
        tier_chest: [
            { name: "mosin", count: 1, weight: 1 },
            { name: "vss", count: 1, weight: 1 },
            { name: "svd", count: 1, weight: 1 },
            { name: "blr", count: 1, weight: 1 },
            { name: "l86", count: 1, weight: 1 },
        ],
        tier_hatchet: [
            { name: "mosin", count: 1, weight: 1 },
            { name: "vss", count: 1, weight: 1 },
            { name: "svd", count: 1, weight: 1 },
            { name: "blr", count: 1, weight: 1 },
            { name: "l86", count: 1, weight: 1 },
        ],
        tier_airdrop_uncommon: [
            { name: "l86", count: 1, weight: 1 },
            { name: "svd", count: 1, weight: 1 },
            { name: "blr81", count: 1, weight: 1 },
            { name: "mkg45", count: 1, weight: 1 },
            { name: "scar", count: 1, weight: 0.5 },
            { name: "scorpion", count: 1, weight: 0.5 },
            { name: "mosin", count: 1, weight: 0.5 },
        ],
        tier_airdrop_rare: [
            { name: "garand", count: 1, weight: 1 },
            { name: "scarssr", count: 1, weight: 1 },
            { name: "awc", count: 1, weight: 0.5 },
            { name: "sv98", count: 1, weight: 0.2 },
        ],
        tier_airdrop_ammo: [
            { name: "9mm", count: 30, weight: 3 },
            { name: "556mm", count: 30, weight: 3 },
            { name: "762mm", count: 30, weight: 3 },
            { name: "45acp", count: 30, weight: 3 },
        ],
    },
    mapGen: {
        map: {
            baseWidth: 565,
            baseHeight: 565,
            shoreInset: 25,
            grassInset: 18,
            rivers: {
                lakes: [
                    //WIP - Will need perfecting; Some lakes are smaller than others in original IIRC. Crate spawn incomplete.
                    {
                        odds: 1,
                        innerRad: 25,
                        outerRad: 49,
                        spawnBound: {
                            pos: v2.create(0.3, 0.3),
                            rad: 200,
                        },
                    },
                    {
                        odds: 1,
                        innerRad: 20,
                        outerRad: 49,
                        spawnBound: {
                            pos: v2.create(0.5, 0.5),
                            rad: 150,
                        },
                    },
                    {
                        odds: 1,
                        innerRad: 30,
                        outerRad: 49,
                        spawnBound: {
                            pos: v2.create(0.7, 0.7),
                            rad: 100,
                        },
                    },
                ],
                weights: [
                    { weight: 0.1, widths: [4] },
                    { weight: 0.15, widths: [8] },
                ],
                smoothness: 0.45,
                spawnCabins: false,
                masks: [],
            },
        },
        bridgeTypes: {
            medium: "",
            large: "",
            xlarge: "",
        },
        customSpawnRules: {
            locationSpawns: [],
        },
        densitySpawns: [
            {
                stone_01: 50,
                stone_07: 8,
                barrel_01: 50,
                propane_01: 50,
                bush_01sv: 40,
                tree_01sv: 35,
                tree_12: 40,
                hedgehog_01: 12,
                crate_01: 45,
                mil_crate_05: 10,
                crate_21b: 8,
                crate_02sv: 8,
                container_01: 7,
                container_02: 7,
                container_03: 7,
                container_04: 7,
                outhouse_01: 8,
                loot_tier_1: 24,
            },
        ],
        fixedSpawns: [
            {
                mansion_structure_01: 1,
                bunker_structure_01sv: 1,
                bunker_structure_03: 1,
                cache_01: 1,
                cache_02: 1,
                chest_01: 1,
                warehouse_01: { small: 4, large: 5 },
                shack_01: { small: 7, large: 10 },
                outhouse_01: { small: 8, large: 10 },
                perch_01: { small: 11, large: 13 },
                grassy_cover_01: { small: 8, large: 9 },
                grassy_cover_02: { small: 8, large: 9 },
                grassy_cover_03: { small: 8, large: 9 },
                grassy_cover_complex_01: { small: 2, large: 3 },
                brush_clump_01: { small: 11, large: 13 },
                brush_clump_02: { small: 11, large: 13 },
                brush_clump_03: { small: 11, large: 13 },
                kopje_patch_01: { small: 2, large: 3 },
                savannah_patch_01: { small: 4, large: 5 },
            },
        ],
        randomSpawns: [],
        importantSpawns: [],
    },
};

export const Savannah = util.mergeDeep({}, Main, mapDef) as MapDef;

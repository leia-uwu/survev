import { GameConfig } from "../../gameConfig";
import { v2 } from "../../utils/v2";
import type { MapDef } from "../mapDefs";

// @NOTE: Entries defined as single-element arrays, like fixedSpawns: [{ }],
// are done this way so that util.mergeDeep(...) will function as expected
// when used by derivative maps.
//
// Arrays are not mergeable, so the derived map will always redefine all
// elements if that property is set.

export const Main: MapDef = {
    mapId: 0,
    desc: { name: "Normal", icon: "", buttonCss: "" },
    assets: {
        audio: [
            { name: "club_music_01", channel: "ambient" },
            { name: "club_music_02", channel: "ambient" },
            { name: "ambient_steam_01", channel: "ambient" },
            { name: "log_11", channel: "sfx" },
            { name: "log_12", channel: "sfx" },
        ],
        atlases: ["gradient", "loadout", "shared", "main"],
    },
    biome: {
        colors: {
            background: 2118510,
            water: 3310251,
            waterRipple: 11792639,
            beach: 13480795,
            riverbank: 9461284,
            grass: 8433481,
            underground: 1772803,
            playerSubmerge: 2854052,
            playerGhillie: 8630096,
        },
        valueAdjust: 1,
        sound: { riverShore: "sand" },
        particles: { camera: "" },
        tracerColors: {},
        airdrop: {
            planeImg: "map-plane-01.img",
            planeSound: "plane_01",
            airdropImg: "map-chute-01.img",
        },
    },
    gameMode: {
        maxPlayers: 80,
        killLeaderEnabled: true,
        spawn: {
            mode: "random",
        },
    },
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
                { name: "airdrop_crate_01", weight: 10 },
                { name: "airdrop_crate_02", weight: 1 },
            ],
        },
        bagSizes: {},
        bleedDamage: 2,
        bleedDamageMult: 1,
    },
    /* STRIP_FROM_PROD_CLIENT:START */
    // NOTE: this loot table is not the original one so its not accurate
    // ? are guesses based on statistics
    // ! are uncertain data based on leak
    lootTable: {
        tier_world: [
            { name: "tier_guns", count: 1, weight: 0.29 }, // TODO get more data on this from original
            { name: "tier_ammo", count: 1, weight: 0.04 }, // ?
            { name: "tier_scopes", count: 1, weight: 0.15 }, // ?
            { name: "tier_armor", count: 1, weight: 0.1 }, // ?
            { name: "tier_medical", count: 1, weight: 0.17 }, // ?
            { name: "tier_throwables", count: 1, weight: 0.05 }, // ?
            { name: "tier_packs", count: 1, weight: 0.09 }, // ?
        ],
        tier_surviv: [
            { name: "tier_scopes", count: 1, weight: 0.15 }, // TODO get more data on this from original
            { name: "tier_armor", count: 1, weight: 0.1 }, // ?
            { name: "tier_medical", count: 1, weight: 0.17 }, // ?
            { name: "tier_throwables", count: 1, weight: 0.05 }, // ?
            { name: "tier_packs", count: 1, weight: 0.09 }, // ?
        ],
        tier_container: [
            { name: "tier_guns", count: 1, weight: 0.29 },
            { name: "tier_ammo", count: 1, weight: 0.04 },
            { name: "tier_scopes", count: 1, weight: 0.15 },
            { name: "tier_armor", count: 1, weight: 0.1 },
            { name: "tier_medical", count: 1, weight: 0.17 },
            { name: "tier_throwables", count: 1, weight: 0.05 },
            { name: "tier_packs", count: 1, weight: 0.09 },
            { name: "tier_outfits", count: 1, weight: 0.035 }, // !
        ],
        tier_leaf_pile: [
            { name: "tier_ammo", count: 1, weight: 0.2 },
            { name: "tier_scopes", count: 1, weight: 0.2 },
            { name: "tier_armor", count: 1, weight: 0.2 },
            { name: "tier_medical", count: 1, weight: 0.2 },
            { name: "tier_throwables", count: 1, weight: 0.15 },
            { name: "tier_packs", count: 1, weight: 0.05 },
        ],
        tier_soviet: [
            { name: "tier_guns", count: 1, weight: 3 }, // ?
            { name: "tier_armor", count: 1, weight: 2 }, // ?
            { name: "tier_packs", count: 1, weight: 1 }, // ?
        ],
        tier_toilet: [
            { name: "tier_guns", count: 1, weight: 0.1 },
            { name: "tier_scopes", count: 1, weight: 0.05 },
            { name: "tier_medical", count: 1, weight: 0.6 },
            { name: "tier_throwables", count: 1, weight: 0.05 },
            { name: "tier_outfits", count: 1, weight: 0.025 }, // !
        ],
        tier_scopes: [
            { name: "2xscope", count: 1, weight: 24 },
            { name: "4xscope", count: 1, weight: 5 },
            { name: "8xscope", count: 1, weight: 1 }, // ?
            { name: "15xscope", count: 1, weight: 0.1 }, // ?
        ],
        tier_armor: [
            { name: "helmet01", count: 1, weight: 9 }, // !
            { name: "helmet02", count: 1, weight: 6 },
            { name: "helmet03", count: 1, weight: 0.2 },
            { name: "chest01", count: 1, weight: 15 }, // !
            { name: "chest02", count: 1, weight: 6 },
            { name: "chest03", count: 1, weight: 0.2 },
        ],
        tier_packs: [
            { name: "backpack01", count: 1, weight: 15 }, // !
            { name: "backpack02", count: 1, weight: 6 },
            { name: "backpack03", count: 1, weight: 0.2 },
        ],
        tier_medical: [
            { name: "bandage", count: 5, weight: 16 },
            { name: "healthkit", count: 1, weight: 4 },
            { name: "soda", count: 1, weight: 15 },
            { name: "painkiller", count: 1, weight: 5 },
        ],
        tier_throwables: [
            { name: "frag", count: 2, weight: 1 }, // !
            { name: "smoke", count: 1, weight: 1 },
            { name: "mirv", count: 2, weight: 0.05 },
        ],
        tier_ammo: [
            { name: "9mm", count: 60, weight: 3 },
            { name: "762mm", count: 60, weight: 3 },
            { name: "556mm", count: 60, weight: 3 },
            { name: "12gauge", count: 10, weight: 3 },
        ],
        tier_ammo_crate: [
            { name: "9mm", count: 60, weight: 3 },
            { name: "762mm", count: 60, weight: 3 },
            { name: "556mm", count: 60, weight: 3 },
            { name: "12gauge", count: 10, weight: 3 },
            { name: "50AE", count: 21, weight: 1 },
            { name: "308sub", count: 5, weight: 1 },
            { name: "flare", count: 1, weight: 1 },
        ],
        tier_vending_soda: [
            { name: "soda", count: 1, weight: 1 }, // ?
            { name: "tier_ammo", count: 1, weight: 1 }, // ?
        ],
        tier_sv98: [{ name: "sv98", count: 1, weight: 1 }],
        tier_scopes_sniper: [
            { name: "4xscope", count: 1, weight: 5 }, // ?
            { name: "8xscope", count: 1, weight: 1 }, // ?
            { name: "15xscope", count: 1, weight: 0.1 }, // ?
        ],
        tier_mansion_floor: [{ name: "outfitCasanova", count: 1, weight: 1 }],
        tier_vault_floor: [{ name: "outfitJester", count: 1, weight: 1 }],
        tier_police_floor: [{ name: "outfitPrisoner", count: 1, weight: 1 }],
        tier_chrys_01: [{ name: "outfitImperial", count: 1, weight: 1 }],
        tier_chrys_02: [{ name: "katana", count: 1, weight: 1 }],
        tier_chrys_03: [
            { name: "2xscope", count: 1, weight: 5 }, // ?
            { name: "4xscope", count: 1, weight: 5 }, // ?
            { name: "8xscope", count: 1, weight: 5 }, // ?
            { name: "15xscope", count: 1, weight: 0.1 }, // ?
        ],
        tier_chrys_case: [
            { name: "", count: 1, weight: 5 }, // ?
            { name: "tier_katanas", count: 1, weight: 3 }, // ?
            { name: "naginata", count: 1, weight: 1 }, // ?
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
            { name: "p30l", count: 1, weight: 40 }, // ?
            { name: "p30l_dual", count: 1, weight: 1 }, // ?
        ],
        tier_woodaxe: [{ name: "woodaxe", count: 1, weight: 1 }],
        tier_club_melee: [{ name: "machete_taiga", count: 1, weight: 1 }],
        tier_guns: [
            { name: "famas", count: 1, weight: 0.9 },
            { name: "hk416", count: 1, weight: 4 },
            { name: "mk12", count: 1, weight: 0.1 },
            { name: "pkp", count: 1, weight: 0.005 },
            { name: "m249", count: 1, weight: 0.006 },
            { name: "ak47", count: 1, weight: 2.7 },
            { name: "scar", count: 1, weight: 0.01 },
            { name: "dp28", count: 1, weight: 0.5 },
            { name: "mosin", count: 1, weight: 0.1 },
            { name: "m39", count: 1, weight: 0.1 },
            { name: "mp5", count: 1, weight: 10 },
            { name: "mac10", count: 1, weight: 6 },
            { name: "ump9", count: 1, weight: 3 },
            { name: "m870", count: 1, weight: 9 },
            { name: "m1100", count: 1, weight: 6 },
            { name: "mp220", count: 1, weight: 2 },
            { name: "saiga", count: 1, weight: 0.1 },
            { name: "ot38", count: 1, weight: 8 },
            { name: "m9", count: 1, weight: 19 },
            { name: "m93r", count: 1, weight: 5 },
            { name: "glock", count: 1, weight: 7 },
            { name: "deagle", count: 1, weight: 0.05 },
            { name: "vector", count: 1, weight: 0.01 },
            { name: "sv98", count: 1, weight: 0.01 },
            { name: "spas12", count: 1, weight: 1 },
            { name: "qbb97", count: 1, weight: 0.01 },
            { name: "flare_gun", count: 1, weight: 0.145 }, // !
            { name: "flare_gun_dual", count: 1, weight: 0.0025 }, // !
            { name: "groza", count: 1, weight: 0.8 },
            { name: "scout_elite", count: 1, weight: 0.05 },
            { name: "vss", count: 1, weight: 0.05 }, // !
        ],
        tier_police: [
            { name: "scar", count: 1, weight: 0.5 },
            { name: "helmet03", count: 1, weight: 0.15 },
            { name: "chest03", count: 1, weight: 0.1 },
            { name: "backpack03", count: 1, weight: 0.25 },
        ],
        tier_ring_case: [
            { name: "grozas", count: 1, weight: 0.75 }, // ?
            { name: "ots38_dual", count: 1, weight: 0.15 }, // ?
            { name: "pkp", count: 1, weight: 0.1 }, // ?
            { name: "m9", count: 1, weight: 0.01 }, // ?
        ],
        tier_chest: [
            { name: "famas", count: 1, weight: 1.15 },
            { name: "hk416", count: 1, weight: 4 },
            { name: "mk12", count: 1, weight: 0.55 },
            { name: "m249", count: 1, weight: 0.07 },
            { name: "ak47", count: 1, weight: 4 },
            { name: "scar", count: 1, weight: 0.27 },
            { name: "dp28", count: 1, weight: 0.55 },
            { name: "mosin", count: 1, weight: 0.55 },
            { name: "m39", count: 1, weight: 0.55 },
            { name: "saiga", count: 1, weight: 0.26 },
            { name: "mp220", count: 1, weight: 1.5 },
            { name: "deagle", count: 1, weight: 0.15 },
            { name: "vector", count: 1, weight: 0.1 },
            { name: "sv98", count: 1, weight: 0.1 },
            { name: "spas12", count: 1, weight: 1 },
            { name: "groza", count: 1, weight: 1.15 },
            { name: "helmet02", count: 1, weight: 1 },
            { name: "helmet03", count: 1, weight: 0.25 },
            { name: "chest02", count: 1, weight: 1 },
            { name: "chest03", count: 1, weight: 0.25 },
            { name: "4xscope", count: 1, weight: 0.5 },
            { name: "8xscope", count: 1, weight: 0.25 },
        ],
        tier_conch: [
            { name: "outfitAqua", count: 1, weight: 1 },
            { name: "outfitCoral", count: 1, weight: 1 },
        ],
        tier_noir_outfit: [{ name: "outfitNoir", count: 1, weight: 1 }],
        tier_khaki_outfit: [{ name: "outfitKhaki", count: 1, weight: 1 }],
        tier_pirate_melee: [{ name: "hook", count: 1, weight: 1 }],
        tier_hatchet: [
            { name: "vector", count: 1, weight: 0.4 },
            { name: "hk416", count: 1, weight: 0.25 },
            { name: "mp220", count: 1, weight: 0.15 },
            { name: "pkp", count: 1, weight: 0.01 },
            { name: "m249", count: 1, weight: 0.01 },
            { name: "m9", count: 1, weight: 0.01 },
        ],
        tier_lmgs: [
            { name: "dp28", count: 1, weight: 2 }, // ?
            { name: "bar", count: 1, weight: 1.5 }, // ?
            { name: "qbb97", count: 1, weight: 0.5 }, // ?
            { name: "m249", count: 1, weight: 0.05 }, // ?
            { name: "pkp", count: 1, weight: 0.05 }, // ?
        ],
        tier_shotguns: [
            { name: "spas12", count: 1, weight: 2 }, // ?
            { name: "mp220", count: 1, weight: 1.5 }, // ?
            { name: "m1100", count: 1, weight: 1 }, // ?
            { name: "m870", count: 1, weight: 1 }, // ?
            { name: "saiga", count: 1, weight: 0.15 }, // ?
            { name: "usas", count: 1, weight: 0.01 }, // ?
        ],
        tier_hatchet_melee: [
            { name: "fireaxe", count: 1, weight: 5 }, // ?
            { name: "tier_katanas", count: 1, weight: 3 }, // ?
            { name: "stonehammer", count: 1, weight: 1 }, // ?
        ],
        tier_pavilion: [
            { name: "naginata", count: 1, weight: 2 }, // ?
            { name: "pkp", count: 1, weight: 2 }, // ?
            { name: "dp28", count: 1, weight: 1 }, // ?
            { name: "bar", count: 1, weight: 1 }, // ?
            { name: "m9", count: 1, weight: 1 }, // ?
        ],
        tier_forest_helmet: [{ name: "helmet03_forest", count: 1, weight: 1 }],
        tier_outfits: [
            { name: "outfitCobaltShell", count: 1, weight: 0.2 }, // ?
            { name: "outfitKeyLime", count: 1, weight: 0.15 }, // ?
            { name: "outfitWoodland", count: 1, weight: 0.1 }, // ?
            { name: "outfitCamo", count: 1, weight: 0.1 }, // ?
            { name: "outfitGhillie", count: 1, weight: 0.01 }, // ?
        ],
        tier_imperial_outfit: [{ name: "outfitImperial", count: 1, weight: 1 }],
        tier_pineapple_outfit: [{ name: "outfitPineapple", count: 1, weight: 1 }],
        tier_tarkhany_outfit: [{ name: "outfitTarkhany", count: 1, weight: 1 }],
        tier_spetsnaz_outfit: [{ name: "outfitSpetsnaz", count: 1, weight: 1 }],
        tier_lumber_outfit: [{ name: "outfitLumber", count: 1, weight: 1 }],
        tier_verde_outfit: [{ name: "outfitVerde", count: 1, weight: 1 }],
        tier_airdrop_uncommon: [
            { name: "mk12", count: 1, weight: 2.5 },
            { name: "scar", count: 1, weight: 0.75 },
            { name: "mosin", count: 1, weight: 2.5 },
            { name: "m39", count: 1, weight: 2.5 },
            { name: "saiga", count: 1, weight: 1 },
            { name: "deagle", count: 1, weight: 1 },
            { name: "vector", count: 1, weight: 1 },
            { name: "sv98", count: 1, weight: 0.5 },
            { name: "qbb97", count: 1, weight: 1.5 },
            { name: "m9", count: 1, weight: 0.01 },
            { name: "flare_gun", count: 1, weight: 0.5 },
            { name: "scout_elite", count: 1, weight: 1.5 },
            { name: "vss", count: 1, weight: 1.5 }, // !
        ],
        tier_airdrop_rare: [
            { name: "garand", count: 1, weight: 6 },
            { name: "awc", count: 1, weight: 3 },
            { name: "pkp", count: 1, weight: 3 },
            { name: "m249", count: 1, weight: 0.1 },
            { name: "m4a1", count: 1, weight: 4 },
            { name: "scorpion", count: 1, weight: 5 }, // ?
            { name: "ots38_dual", count: 1, weight: 4.5 },
        ],
        tier_airdrop_ammo: [
            { name: "9mm", count: 30, weight: 3 },
            { name: "762mm", count: 30, weight: 3 },
            { name: "556mm", count: 30, weight: 3 },
            { name: "12gauge", count: 5, weight: 3 },
        ],
        tier_airdrop_outfits: [
            { name: "", count: 1, weight: 20 },
            { name: "outfitMeteor", count: 1, weight: 5 }, // !
            { name: "outfitHeaven", count: 1, weight: 1 }, // !
            { name: "outfitGhillie", count: 1, weight: 0.5 },
        ],
        tier_airdrop_throwables: [
            { name: "frag", count: 2, weight: 1 },
            { name: "mirv", count: 2, weight: 0.5 },
        ],
        tier_airdrop_melee: [
            { name: "", count: 1, weight: 19 },
            { name: "pan", count: 1, weight: 1 },
        ],
        tier_airdrop_armor: [
            { name: "helmet03", count: 1, weight: 1 },
            { name: "chest03", count: 1, weight: 1 },
            { name: "backpack03", count: 1, weight: 1 },
        ],
        tier_airdrop_scopes: [
            { name: "", count: 1, weight: 24 }, // ?
            { name: "4xscope", count: 1, weight: 5 }, // ?
            { name: "8xscope", count: 1, weight: 1 }, // ?
            { name: "15xscope", count: 1, weight: 0.1 }, // ?
        ],
        tier_katanas: [
            { name: "katana", count: 1, weight: 4 }, // ?
            { name: "katana_rusted", count: 1, weight: 4 }, // ?
            { name: "katana_orchid", count: 1, weight: 1 }, // ?
        ],
        tier_stonehammer: [{ name: "stonehammer", count: 1, weight: 1 }],
        tier_saloon: [
            { name: "vector45", count: 1, weight: 1 },
            { name: "mkg45", count: 1, weight: 1 },
        ],
    },
    mapGen: {
        map: {
            baseWidth: 512,
            baseHeight: 512,
            scale: { small: 1.1875, large: 1.28125 },
            extension: 112,
            shoreInset: 48,
            grassInset: 18,
            rivers: {
                lakes: [],
                weights: [
                    { weight: 0.1, widths: [4] },
                    { weight: 0.15, widths: [8] },
                    { weight: 0.25, widths: [8, 4] },
                    { weight: 0.21, widths: [16] },
                    { weight: 0.09, widths: [16, 8] },
                    { weight: 0.2, widths: [16, 8, 4] },
                    {
                        weight: 1e-4,
                        widths: [16, 16, 8, 6, 4],
                    },
                ],
                smoothness: 0.45,
                masks: [],
            },
        },
        places: [
            {
                name: "The Killpit",
                pos: v2.create(0.53, 0.64),
            },
            {
                name: "Sweatbath",
                pos: v2.create(0.84, 0.18),
            },
            {
                name: "Tarkhany",
                pos: v2.create(0.15, 0.11),
            },
            {
                name: "Ytyk-Kyuyol",
                pos: v2.create(0.25, 0.42),
            },
            {
                name: "Todesfelde",
                pos: v2.create(0.81, 0.85),
            },
            {
                name: "Pineapple",
                pos: v2.create(0.21, 0.79),
            },
            {
                name: "Fowl Forest",
                pos: v2.create(0.73, 0.47),
            },
            {
                name: "Ranchito Pollo",
                pos: v2.create(0.53, 0.25),
            },
        ],
        bridgeTypes: {
            medium: "bridge_md_structure_01",
            large: "bridge_lg_structure_01",
            xlarge: "",
        },
        riverCabins: {
            cabin_01: 0, //3
        },
        customSpawnRules: {
            locationSpawns: [
                {
                    type: "club_complex_01",
                    pos: v2.create(0.5, 0.5),
                    rad: 150,
                    retryOnFailure: true,
                },
            ],
            placeSpawns: ["warehouse_01", "house_red_01", "house_red_02", "barn_01"],
        },
        densitySpawns: [
            {
                stone_01: 200,
                barrel_01: 76,
                silo_01: 2,
                crate_01: 50,
                crate_02: 4,
                crate_03: 8,
                bush_01: 78,
                cache_06: 12,
                tree_01: 280, 
                hedgehog_01: 24,
                container_01: 5,
                container_02: 5,
                container_03: 5,
                container_04: 5,
                shack_01: 7,
                outhouse_01: 5,
                loot_tier_1: 24,
                loot_tier_beach: 4,
            },
        ],
        fixedSpawns: [
            {
                // small is spawn count for solos and duos, large is spawn count for squads
                warehouse_01: 2,
                house_red_01: { small: 3, large: 4 },
                house_red_02: { small: 3, large: 4 },
                barn_01: { small: 1, large: 3 },
                barn_02: 1,
                hut_01: 3,
                hut_02: 1, // spas hut
                hut_03: 1, // scout hut
                shack_03a: 2,
                shack_03b: { small: 2, large: 3 },
                greenhouse_01: 1,
                cache_01: 1,
                cache_02: 1, // mosin tree
                cache_07: 1,
                bunker_structure_01: { odds: 0.05 },
                bunker_structure_02: 1,
                bunker_structure_03: 1,
                bunker_structure_04: 1,
                bunker_structure_05: 1,
                warehouse_complex_01: 1,
                chest_01: 1,
                chest_03: { odds: 0.2 },
                mil_crate_02: { odds: 0.25 },
                tree_02: 3,
                teahouse_complex_01su: {
                    small: 1,
                    large: 2,
                },
                stone_04: 1,
                club_complex_01: 1,
            },
        ],
        randomSpawns: [
            {
                spawns: ["mansion_structure_01", "police_01", "bank_01"],
                choose: 2,
            },
        ],
        spawnReplacements: [{}],
        importantSpawns: ["club_complex_01"],
    },
    /* STRIP_FROM_PROD_CLIENT:END */
};

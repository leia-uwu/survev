import { GunDefs } from "../../../shared/defs/gameObjects/gunDefs";
import { Main } from "../../../shared/defs/maps/baseDefs";
import { ObjectType } from "../../../shared/utils/objectSerializeFns";
import { Events, Plugin } from "../PluginManager";
const lootTable = {
    tier_world: [
        { name: "tier_scopes", count: 1, weight: 1 },
        { name: "tier_armor", count: 1, weight: 1.5 },
        { name: "tier_packs", count: 1, weight: 0.5 },
        { name: "tier_medical", count: 1, weight: 1.5 },
        { name: "tier_ammo", count: 1, weight: 2.5 },
        { name: "tier_guns", count: 1, weight: 2 }
    ],
    tier_surviv: [
        { name: "tier_scopes", count: 1, weight: 1 },
        { name: "tier_armor", count: 1, weight: 1 },
        { name: "tier_medical", count: 1, weight: 4 },
        { name: "tier_packs", count: 1, weight: 1 }
    ],
    tier_container: [
        { name: "tier_scopes", count: 1, weight: 0.2 },
        { name: "tier_armor", count: 1, weight: 1 },
        { name: "tier_packs", count: 1, weight: 0.3 },
        { name: "tier_medical", count: 1, weight: 0.8 },
        { name: "tier_ammo", count: 1, weight: 0.5 },
        { name: "tier_guns", count: 1, weight: 0.6 }
    ],
    tier_leaf_pile: [
        { name: "tier_scopes", count: 1, weight: 1 },
        { name: "tier_armor", count: 1, weight: 1.5 },
        { name: "tier_packs", count: 1, weight: 1 },
        { name: "tier_medical", count: 1, weight: 1 },
        { name: "tier_ammo", count: 1, weight: 1 }
    ],
    tier_soviet: [
        { name: "tier_scopes", count: 1, weight: 1 },
        { name: "tier_armor", count: 1, weight: 1.5 },
        { name: "tier_packs", count: 1, weight: 1 },
        { name: "tier_medical", count: 1, weight: 2 },
        { name: "tier_ammo", count: 1, weight: 3 },
        { name: "tier_guns", count: 1, weight: 6 }
    ],
    tier_toilet: [
        { name: "tier_scopes", count: 1, weight: 0.5 },
        { name: "tier_guns", count: 1, weight: 0.2 },
        { name: "tier_medical", count: 1, weight: 1.0 }
    ],
    tier_scopes: [
        { name: "2xscope", count: 1, weight: 0.7 },
        { name: "4xscope", count: 1, weight: 0.5 },
        { name: "8xscope", count: 1, weight: 0 },
        { name: "15xscope", count: 1, weight: 0 }
    ],
    tier_armor: [
        { name: "helmet01", count: 1, weight: 10 },
        { name: "helmet02", count: 1, weight: 7 },
        { name: "helmet03", count: 1, weight: 2 },
        { name: "chest01", count: 1, weight: 10 },
        { name: "chest02", count: 1, weight: 7 },
        { name: "chest03", count: 1, weight: 2 }
    ],
    tier_packs: [
        { name: "backpack01", count: 1, weight: 10 },
        { name: "backpack02", count: 1, weight: 4 },
        { name: "backpack03", count: 1, weight: 1 }
    ],
    tier_medical: [
        { name: "bandage", count: 5, weight: 8 },
        { name: "healthkit", count: 1, weight: 5 },
        { name: "soda", count: 1, weight: 13 },
        { name: "painkiller", count: 1, weight: 6 }
    ],
    tier_throwables: [
        { name: "frag", count: 1, weight: 1 },
        { name: "smoke", count: 1, weight: 1 },
        { name: "mirv", count: 1, weight: 0.05 }
    ],
    tier_ammo: [
        { name: "9mm", count: 60, weight: 8 },
        { name: "762mm", count: 60, weight: 8 },
        { name: "556mm", count: 60, weight: 8 },
        { name: "12gauge", count: 10, weight: 10 }
    ],
    tier_ammo_crate: [
        { name: "9mm", count: 60, weight: 5 },
        { name: "762mm", count: 60, weight: 5 },
        { name: "556mm", count: 60, weight: 5 },
        { name: "12gauge", count: 10, weight: 7 },
        { name: "50AE", count: 21, weight: 1 },
        { name: "308sub", count: 5, weight: 1 },
        { name: "flare", count: 1, weight: 1 }
    ],
    tier_vending_soda: [
        { name: "soda", count: 1, weight: 6 },
        { name: "tier_ammo", count: 1, weight: 3 }
    ],
    tier_sv98: [{ name: "sv98", count: 1, weight: 1.5 }],
    tier_scopes_sniper: [
        { name: "4xscope", count: 1, weight: 0.2 },
        { name: "8xscope", count: 1, weight: 0 },
        { name: "15xscope", count: 1, weight: 0 }
    ],
    tier_mansion_floor: [
        { name: "outfitCasanova", count: 1, weight: 1 }
    ],
    tier_vault_floor: [
        { name: "outfitJester", count: 1, weight: 1 }
    ],
    tier_police_floor: [
        { name: "outfitPrisoner", count: 1, weight: 1 }
    ],
    tier_chrys_01: [
        { name: "outfitImperial", count: 1, weight: 1 }
    ],
    tier_chrys_02: [{ name: "katana", count: 1, weight: 1 }],
    tier_chrys_03: [
        { name: "2xscope", count: 1, weight: 1 },
        { name: "4xscope", count: 1, weight: 0.3 },
        { name: "8xscope", count: 1, weight: 0.05 },
        { name: "15xscope", count: 1, weight: 0.001 }
    ],
    tier_chrys_case: [
        { name: "", count: 1, weight: 1 }
    ],
    tier_chrys_chest: [
        { name: "", count: 1, weight: 1 },
        { name: "katana", count: 1, weight: 1 },
        { name: "katana_rusted", count: 1, weight: 1 },
        { name: "katana_orchid", count: 1, weight: 1 }
    ],
    tier_eye_02: [
        { name: "stonehammer", count: 1, weight: 1 }
    ],
    tier_eye_block: [
        { name: "m9", count: 1, weight: 1 },
        { name: "ots38_dual", count: 1, weight: 1 },
        { name: "flare_gun", count: 1, weight: 1 },
        { name: "colt45", count: 1, weight: 1 },
        { name: "45acp", count: 1, weight: 1 },
        { name: "painkiller", count: 1, weight: 1 },
        { name: "m4a1", count: 1, weight: 0.4 },
        { name: "m249", count: 1, weight: 0.05 },
        { name: "awc", count: 1, weight: 0.05 },
        { name: "pkp", count: 1, weight: 0.05 }
    ],
    tier_sledgehammer: [{ name: "sledgehammer", count: 1, weight: 1 }],
    tier_chest_04: [
        { name: "p30l", count: 1, weight: 1 },
        { name: "p30l_dual", count: 1, weight: 0.001 }
    ],
    tier_woodaxe: [{ name: "woodaxe", count: 1, weight: 1 }],
    tier_club_melee: [{ name: "machete_taiga", count: 1, weight: 1 }],
    tier_guns: [
        { name: "famas", count: 1, weight: 2 },
        { name: "hk416", count: 1, weight: 8 },
        { name: "mk12", count: 1, weight: 0.6 },
        { name: "pkp", count: 1, weight: 0.0015 },
        { name: "m249", count: 1, weight: 0.006 },
        { name: "ak47", count: 1, weight: 8 },
        { name: "scar", count: 1, weight: 2 },
        { name: "dp28", count: 1, weight: 1.5 },
        { name: "mosin", count: 1, weight: 0.2 },
        { name: "m39", count: 1, weight: 0.5 },
        { name: "vss", count: 1, weight: 0.1 },
        { name: "mp5", count: 1, weight: 6 },
        { name: "mac10", count: 1, weight: 6 },
        { name: "ump9", count: 1, weight: 3 },
        { name: "m870", count: 1, weight: 12 },
        { name: "m1100", count: 1, weight: 0 },
        { name: "mp220", count: 1, weight: 4 },
        { name: "saiga", count: 1, weight: 0.1 },
        { name: "ot38", count: 1, weight: 3 },
        { name: "m9", count: 1, weight: 5 },
        { name: "m93r", count: 1, weight: 4 },
        { name: "glock", count: 1, weight: 4 },
        { name: "deagle", count: 1, weight: 0.5 },
        { name: "vector", count: 1, weight: 1 },
        { name: "sv98", count: 1, weight: 0.03 },
        { name: "spas12", count: 1, weight: 2 },
        { name: "qbb97", count: 1, weight: 0.5 },
        { name: "flare_gun", count: 1, weight: 0.1 },
        { name: "flare_gun_dual", count: 1, weight: 0.00017 },
        { name: "groza", count: 1, weight: 2 },
        { name: "scout", count: 1, weight: 0.1 },
        { name: "blr", count: 1, weight: 0.5 },
        { name: "scorpion", count: 1, weight: 0.5 },
        { name: "m4a1", count: 1, weight: 0.5 }
    ],
    tier_police: [
        { name: "scar", count: 1, weight: 2 },
        { name: "helmet03", count: 1, weight: 1 },
        { name: "chest03", count: 1, weight: 1 },
        { name: "backpack03", count: 1, weight: 1 }
    ],
    tier_ring_case: [
        { name: "grozas", count: 1, weight: 5 },
        { name: "ots38_dual", count: 1, weight: 0.1 },
        { name: "m9", count: 1, weight: 0 },
        { name: "pkp", count: 1, weight: 0.15 },
        { name: "blr", count: 1, weight: 0.3 }
    ],
    tier_chest: [
        { name: "hk416", count: 1, weight: 2 },
        { name: "ak47", count: 1, weight: 13 },
        { name: "groza", count: 1, weight: 3 },
        { name: "famas", count: 1, weight: 1 },
        { name: "mk12", count: 1, weight: 4 },
        { name: "mp220", count: 1, weight: 10 },
        { name: "spas12", count: 1, weight: 9 },
        { name: "dp28", count: 1, weight: 1 },
        { name: "mosin", count: 1, weight: 2 },
        { name: "m39", count: 1, weight: 0.1 },
        { name: "scar", count: 1, weight: 2 },
        { name: "saiga", count: 1, weight: 2 },
        { name: "deagle", count: 1, weight: 0.7 },
        { name: "sv98", count: 1, weight: 0.2 },
        { name: "vector", count: 1, weight: 1 },
        { name: "m249", count: 1, weight: 1 },
        { name: "pkp", count: 1, weight: 0.3 },
        { name: "helmet01", count: 1, weight: 0 },
        { name: "helmet02", count: 1, weight: 0 },
        { name: "helmet03", count: 1, weight: 0 },
        { name: "4xscope", count: 1, weight: 0 },
        { name: "8xscope", count: 1, weight: 0 },
        { name: "blr", count: 1, weight: 2 },
        { name: "scorpion", count: 1, weight: 0.5 },
        { name: "m4a1", count: 1, weight: 0.5 }
    ],
    tier_conch: [
        { name: "outfitAqua", count: 1, weight: 1 },
        { name: "outfitCoral", count: 1, weight: 1 }
    ],
    tier_noir_outfit: [
        { name: "outfitNoir", count: 1, weight: 1 }
    ],
    tier_khaki_outfit: [
        { name: "outfitKhaki", count: 1, weight: 1 }
    ],
    tier_pirate_melee: [
        { name: "hook", count: 1, weight: 1 }
    ],
    tier_hatchet: [
        { name: "vector", count: 1, weight: 5 },
        { name: "hk416", count: 1, weight: 2 },
        { name: "mp220", count: 1, weight: 1 },
        { name: "m249", count: 1, weight: 0.1 },
        { name: "pkp", count: 1, weight: 0.05 },
        { name: "m9", count: 1, weight: 0.01 }
    ],
    tier_lmgs: [
        { name: "bar", count: 1, weight: 5 },
        { name: "dp28", count: 1, weight: 5 },
        { name: "qbb97", count: 1, weight: 0.5 },
        { name: "m249", count: 1, weight: 0.01 },
        { name: "pkp", count: 1, weight: 0.01 }
    ],
    tier_shotguns: [
        { name: "m1100", count: 1, weight: 5 },
        { name: "m870", count: 1, weight: 5 },
        { name: "mp220", count: 1, weight: 1 },
        { name: "spas12", count: 1, weight: 1 },
        { name: "saiga", count: 1, weight: 0.1 },
        { name: "usas", count: 1, weight: 0.005 }
    ],
    tier_hatchet_melee: [
        { name: "fireaxe", count: 1, weight: 5 },
        { name: "katana", count: 1, weight: 1 },
        { name: "katana_rusted", count: 1, weight: 1 },
        { name: "katana_orchid", count: 1, weight: 0.1 },
        { name: "stonehammer", count: 1, weight: 0.1 }
    ],
    tier_pavilion: [
        { name: "dp28", count: 1, weight: 5 },
        { name: "bar", count: 1, weight: 5 },
        { name: "naginata", count: 1, weight: 1 },
        { name: "m9", count: 1, weight: 1 },
        { name: "pkp", count: 1, weight: 1 }
    ],
    tier_forest_helmet: [
        { name: "helmet03_forest", count: 1, weight: 1 }
    ],
    tier_imperial_outfit: [
        { name: "outfitImperial", count: 1, weight: 1 }
    ],
    tier_pineapple_outfit: [
        { name: "outfitPineapple", count: 1, weight: 1 }
    ],
    tier_tarkhany_outfit: [
        { name: "outfitTarkhany", count: 1, weight: 1 }
    ],
    tier_spetsnaz_outfit: [
        { name: "outfitSpetsnaz", count: 1, weight: 1 }
    ],
    tier_lumber_outfit: [
        { name: "outfitLumber", count: 1, weight: 1 }
    ],
    tier_verde_outfit: [
        { name: "outfitVerde", count: 1, weight: 1 }
    ]
};

export class SurvivReloadedPlugin extends Plugin {
    protected override initListeners(): void {
        this.on(Events.Game_Created, data => {
            for (const gunData of Object.values(GunDefs)) {
                gunData.switchDelay = 0.4;
                gunData.barrelLength = 0; // so bullets fire from player body not gun barrel
            }
            Main.lootTable = lootTable;
        });

        this.on(Events.Player_Kill, data => {
            if (data.source?.__type === ObjectType.Player) {
                data.source.health += 20;
                data.source.boost += 25;
            }
        });
    }
}

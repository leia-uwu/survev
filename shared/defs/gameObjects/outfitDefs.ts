import { defineSkin } from "../../utils/util";

export interface OutfitDef {
    readonly type: "outfit";
    name: string;
    skinImg: {
        baseTint: number;
        baseSprite: string;
        handTint: number;
        handSprite: string;
        footTint: number;
        footSprite: string;
        backpackTint: number;
        backpackSprite: string;
    };
    lootImg: {
        sprite: string;
        tint: number;
        border: string;
        borderTint: number;
        scale: number;
    };
    sound: {
        pickup: string;
    };
    baseType?: string;
    noDropOnDeath?: boolean;
    rarity?: number;
    lore?: string;
    noDrop?: boolean;
    obstacleType?: string;
    baseScale?: number;
    ghillie?: boolean;
}

function defineOutfitSkin(baseType: string, params: any) {
    return defineSkin<OutfitDef>(BaseDefs, baseType, params);
}
const BaseDefs: Record<string, OutfitDef> = {
    outfitBase: {
        name: "Basic Outfit",
        type: "outfit",
        skinImg: {
            baseTint: 16303476,
            baseSprite: "player-base-01.img",
            handTint: 16303476,
            handSprite: "player-hands-01.img",
            footTint: 16303476,
            footSprite: "player-feet-01.img",
            backpackTint: 8480055,
            backpackSprite: "player-circle-base-01.img",
        },
        lootImg: {
            sprite: "loot-shirt-01.img",
            tint: 0xffffff,
            border: "loot-circle-outer-01.img",
            borderTint: 0,
            scale: 0.2,
        },
        sound: {
            pickup: "clothes_pickup_01",
        },
    },
};

const SkinDefs: Record<string, OutfitDef> = {
    outfitBase: defineOutfitSkin("outfitBase", {
        noDropOnDeath: true,
        name: "Basic Outfit",
        rarity: 0,
        lore: "Pure and simple.",
        lootImg: {
            sprite: "loot-shirt-outfitBase.img",
            tint: 0xffffff,
        },
    }),
    outfitDemo: defineOutfitSkin("outfitBase", {
        noDrop: true,
        skinImg: {
            baseTint: 13068903,
            baseSprite: "player-base-02.img",
            handTint: 11882573,
            handSprite: "player-hands-02.img",
            footTint: 11882573,
            footSprite: "player-feet-02.img",
            backpackTint: 10368820,
            backpackSprite: "player-circle-base-02.img",
        },
        lootImg: {
            sprite: "loot-shirt-01.img",
            tint: 0xffffff,
        },
    }),
    outfitTank: defineOutfitSkin("outfitBase", {
        noDrop: true,
        skinImg: {
            baseTint: 15382883,
            baseSprite: "player-base-02.img",
            handTint: 14197835,
            handSprite: "player-hands-02.img",
            footTint: 14197835,
            footSprite: "player-feet-02.img",
            backpackTint: 12553007,
            backpackSprite: "player-circle-base-02.img",
        },
        lootImg: {
            sprite: "loot-shirt-01.img",
            tint: 0xffffff,
        },
    }),
    outfitMedic: defineOutfitSkin("outfitBase", {
        noDrop: true,
        skinImg: {
            baseTint: 14449116,
            baseSprite: "player-base-02.img",
            handTint: 12866756,
            handSprite: "player-hands-02.img",
            footTint: 12866756,
            footSprite: "player-feet-02.img",
            backpackTint: 11089833,
            backpackSprite: "player-circle-base-02.img",
        },
        lootImg: {
            sprite: "loot-shirt-01.img",
            tint: 0xffffff,
        },
    }),
    outfitScout: defineOutfitSkin("outfitBase", {
        noDrop: true,
        skinImg: {
            baseTint: 11326819,
            baseSprite: "player-base-02.img",
            handTint: 9880138,
            handSprite: "player-hands-02.img",
            footTint: 9880138,
            footSprite: "player-feet-02.img",
            backpackTint: 8630324,
            backpackSprite: "player-circle-base-02.img",
        },
        lootImg: {
            sprite: "loot-shirt-01.img",
            tint: 0xffffff,
        },
    }),
    outfitSniper: defineOutfitSkin("outfitBase", {
        noDrop: true,
        skinImg: {
            baseTint: 9293531,
            baseSprite: "player-base-02.img",
            handTint: 7387849,
            handSprite: "player-hands-02.img",
            footTint: 7387849,
            footSprite: "player-feet-02.img",
            backpackTint: 5415860,
            backpackSprite: "player-circle-base-02.img",
        },
        lootImg: {
            sprite: "loot-shirt-01.img",
            tint: 0xffffff,
        },
    }),
    outfitAssault: defineOutfitSkin("outfitBase", {
        noDrop: true,
        skinImg: {
            baseTint: 14339929,
            baseSprite: "player-base-02.img",
            handTint: 13024064,
            handSprite: "player-hands-02.img",
            footTint: 13024064,
            footSprite: "player-feet-02.img",
            backpackTint: 10918952,
            backpackSprite: "player-circle-base-02.img",
        },
        lootImg: {
            sprite: "loot-shirt-01.img",
            tint: 0xffffff,
        },
    }),
    outfitTurkey: defineOutfitSkin("outfitBase", {
        name: "Fowl Facade",
        noDropOnDeath: true,
        skinImg: {
            baseTint: 15781563,
            baseSprite: "player-base-outfitTurkey.img",
            handTint: 10818304,
            handSprite: "player-hands-02.img",
            footTint: 10818304,
            footSprite: "player-feet-02.img",
            backpackTint: 11031846,
            backpackSprite: "player-circle-base-02.img",
        },
        lootImg: {
            sprite: "loot-shirt-outfitTurkey.img",
            tint: 15781563,
        },
        rarity: 3,
        lore: "M1100 not included.",
    }),
    outfitDev: defineOutfitSkin("outfitBase", {
        name: "Developer Swag",
        noDropOnDeath: true,
        skinImg: {
            baseTint: 3442216,
            baseSprite: "player-base-outfitDC.img",
            handTint: 6937122,
            handSprite: "player-hands-02.img",
            footTint: 6937122,
            footSprite: "player-feet-02.img",
            backpackTint: 2902793,
            backpackSprite: "player-circle-base-02.img",
        },
        lootImg: {
            sprite: "loot-shirt-outfitDev.img",
            tint: 0xffffff,
        },
        rarity: 5,
        lore: "Two-time limited edition print.",
    }),
    outfitMod: defineOutfitSkin("outfitBase", {
        name: "Discord Moderatr",
        noDropOnDeath: true,
        skinImg: {
            baseTint: 3380187,
            baseSprite: "player-base-outfitDC.img",
            handTint: 9684974,
            handSprite: "player-hands-02.img",
            footTint: 9684974,
            footSprite: "player-feet-02.img",
            backpackTint: 1529478,
            backpackSprite: "player-circle-base-02.img",
        },
        lootImg: {
            sprite: "loot-shirt-outfitMod.img",
            tint: 0xffffff,
        },
        rarity: 3,
        lore: "For those who wield the power of the pan.",
    }),
    outfitWheat: defineOutfitSkin("outfitBase", {
        name: "Splintered Wheat",
        skinImg: {
            baseTint: 0xffffff,
            baseSprite: "player-base-outfitWheat.img",
            handTint: 15785362,
            handSprite: "player-hands-01.img",
            footTint: 15785362,
            footSprite: "player-feet-01.img",
            backpackTint: 13346845,
            backpackSprite: "player-circle-base-01.img",
        },
        lootImg: {
            sprite: "loot-shirt-outfitWheat.img",
            tint: 0xffffff,
        },
    }),
    outfitNoir: defineOutfitSkin("outfitBase", {
        name: "Neo Noir",
        skinImg: {
            baseTint: 1776411,
            baseSprite: "player-base-02.img",
            handTint: 0xffffff,
            handSprite: "player-hands-02.img",
            footTint: 0xffffff,
            footSprite: "player-feet-02.img",
            backpackTint: 7829367,
            backpackSprite: "player-circle-base-02.img",
        },
        lootImg: {
            sprite: "loot-shirt-01.img",
            tint: 1776411,
        },
    }),
    outfitRedLeaderAged: defineOutfitSkin("outfitBase", {
        name: "Weathered Red",
        skinImg: {
            baseTint: 10098712,
            baseSprite: "player-base-02.img",
            handTint: 16711680,
            handSprite: "player-hands-02.img",
            footTint: 16711680,
            footSprite: "player-feet-02.img",
            backpackTint: 5442572,
            backpackSprite: "player-circle-base-02.img",
        },
        lootImg: {
            sprite: "loot-shirt-01.img",
            tint: 10098712,
        },
    }),
    outfitBlueLeaderAged: defineOutfitSkin("outfitBase", {
        name: "Stifled Blue",
        skinImg: {
            baseTint: 1523353,
            baseSprite: "player-base-02.img",
            handTint: 20223,
            handSprite: "player-hands-02.img",
            footTint: 20223,
            footSprite: "player-feet-02.img",
            backpackTint: 794700,
            backpackSprite: "player-circle-base-02.img",
        },
        lootImg: {
            sprite: "loot-shirt-01.img",
            tint: 1523353,
        },
    }),
    outfitRedLeader: defineOutfitSkin("outfitBase", {
        name: "Red Leader",
        noDrop: true,
        skinImg: {
            baseTint: 10158080,
            baseSprite: "player-base-02.img",
            handTint: 16711680,
            handSprite: "player-hands-02.img",
            footTint: 16711680,
            footSprite: "player-feet-02.img",
            backpackTint: 5439488,
            backpackSprite: "player-circle-base-02.img",
        },
        lootImg: {
            sprite: "loot-shirt-01.img",
            tint: 8650752,
        },
    }),
    outfitBlueLeader: defineOutfitSkin("outfitBase", {
        name: "Blue Leader",
        noDrop: true,
        skinImg: {
            baseTint: 12187,
            baseSprite: "player-base-02.img",
            handTint: 20223,
            handSprite: "player-hands-02.img",
            footTint: 20223,
            footSprite: "player-feet-02.img",
            backpackTint: 5964,
            backpackSprite: "player-circle-base-02.img",
        },
        lootImg: {
            sprite: "loot-shirt-01.img",
            tint: 13223,
        },
    }),
    outfitSpetsnaz: defineOutfitSkin("outfitBase", {
        name: "Siberian Assault",
        skinImg: {
            baseTint: 0xffffff,
            baseSprite: "player-base-outfitSpetsnaz.img",
            handTint: 15000804,
            handSprite: "player-hands-01.img",
            footTint: 15000804,
            footSprite: "player-feet-01.img",
            backpackTint: 13816530,
            backpackSprite: "player-circle-base-01.img",
        },
        lootImg: {
            sprite: "loot-shirt-outfitSpetsnaz.img",
            tint: 0xffffff,
        },
    }),
    outfitWoodsCloak: defineOutfitSkin("outfitBase", {
        name: "Greencloak",
        skinImg: {
            baseTint: 2817792,
            baseSprite: "player-base-02.img",
            handTint: 16711594,
            handSprite: "player-hands-02.img",
            footTint: 16711594,
            footSprite: "player-feet-02.img",
            backpackTint: 15635271,
            backpackSprite: "player-circle-base-02.img",
        },
        lootImg: {
            sprite: "loot-shirt-01.img",
            tint: 2817792,
        },
    }),
    outfitElf: defineOutfitSkin("outfitBase", {
        name: "Tallow's Little Helper",
        skinImg: {
            baseTint: 12845056,
            baseSprite: "player-base-01.img",
            handTint: 1489152,
            handSprite: "player-hands-01.img",
            footTint: 1489152,
            footSprite: "player-feet-01.img",
            backpackTint: 365312,
            backpackSprite: "player-circle-base-01.img",
        },
        lootImg: {
            sprite: "loot-shirt-01.img",
            tint: 1489152,
        },
    }),
    outfitImperial: defineOutfitSkin("outfitBase", {
        name: "Imperial Seal",
        skinImg: {
            baseTint: 12320813,
            baseSprite: "player-base-01.img",
            handTint: 0xffffff,
            handSprite: "player-hands-01.img",
            footTint: 0xffffff,
            footSprite: "player-feet-01.img",
            backpackTint: 12625727,
            backpackSprite: "player-circle-base-01.img",
        },
        lootImg: {
            sprite: "loot-shirt-01.img",
            tint: 12320813,
        },
    }),
    outfitLumber: defineOutfitSkin("outfitBase", {
        name: "Woodcutter's Wrap",
        skinImg: {
            baseTint: 0xffffff,
            baseSprite: "player-base-outfitLumber.img",
            handTint: 8258312,
            handSprite: "player-hands-02.img",
            footTint: 8258312,
            footSprite: "player-feet-02.img",
            backpackTint: 4854547,
            backpackSprite: "player-circle-base-02.img",
        },
        lootImg: {
            sprite: "loot-shirt-outfitLumber.img",
            tint: 0xffffff,
        },
    }),
    outfitVerde: defineOutfitSkin("outfitBase", {
        name: "Poncho Verde",
        skinImg: {
            baseTint: 1785868,
            baseSprite: "player-base-02.img",
            handTint: 11912587,
            handSprite: "player-hands-02.img",
            footTint: 11912587,
            footSprite: "player-feet-02.img",
            backpackTint: 11238441,
            backpackSprite: "player-circle-base-02.img",
        },
        lootImg: {
            sprite: "loot-shirt-01.img",
            tint: 1785868,
        },
    }),
    outfitPineapple: defineOutfitSkin("outfitBase", {
        name: "Valiant Pineapple",
        skinImg: {
            baseTint: 10027008,
            baseSprite: "player-base-02.img",
            handTint: 4985105,
            handSprite: "player-hands-02.img",
            footTint: 4985105,
            footSprite: "player-feet-02.img",
            backpackTint: 16763904,
            backpackSprite: "player-circle-base-02.img",
        },
        lootImg: {
            sprite: "loot-shirt-01.img",
            tint: 10027008,
        },
    }),
    outfitTarkhany: defineOutfitSkin("outfitBase", {
        name: "Tarkhany Regal",
        skinImg: {
            baseTint: 4927107,
            baseSprite: "player-base-02.img",
            handTint: 16757760,
            handSprite: "player-hands-02.img",
            footTint: 16757760,
            footSprite: "player-feet-02.img",
            backpackTint: 4661344,
            backpackSprite: "player-circle-base-02.img",
        },
        lootImg: {
            sprite: "loot-shirt-01.img",
            tint: 4927107,
        },
    }),
    outfitWaterElem: defineOutfitSkin("outfitBase", {
        name: "Water Elemental",
        skinImg: {
            baseTint: 7143401,
            baseSprite: "player-base-02.img",
            handTint: 15990876,
            handSprite: "player-hands-02.img",
            footTint: 15990876,
            footSprite: "player-feet-02.img",
            backpackTint: 32644,
            backpackSprite: "player-circle-base-02.img",
        },
        lootImg: {
            sprite: "loot-shirt-01.img",
            tint: 7143401,
        },
    }),
    outfitHeaven: defineOutfitSkin("outfitBase", {
        name: "Celestial Garb",
        skinImg: {
            baseTint: 0xffffff,
            baseSprite: "player-base-outfitHeaven.img",
            handTint: 13762639,
            handSprite: "player-hands-02.img",
            footTint: 13762639,
            footSprite: "player-feet-02.img",
            backpackTint: 36503,
            backpackSprite: "player-circle-base-02.img",
        },
        lootImg: {
            sprite: "loot-shirt-outfitHeaven.img",
            tint: 0xffffff,
        },
    }),
    outfitMeteor: defineOutfitSkin("outfitBase", {
        name: "Falling Star",
        skinImg: {
            baseTint: 9764864,
            baseSprite: "player-base-02.img",
            handTint: 16742400,
            handSprite: "player-hands-02.img",
            footTint: 16742400,
            footSprite: "player-feet-02.img",
            backpackTint: 4727582,
            backpackSprite: "player-circle-base-02.img",
        },
        lootImg: {
            sprite: "loot-shirt-01.img",
            tint: 9764864,
        },
    }),
    outfitIslander: defineOutfitSkin("outfitBase", {
        name: "Island Time",
        skinImg: {
            baseTint: 16762368,
            baseSprite: "player-base-01.img",
            handTint: 148992,
            handSprite: "player-hands-01.img",
            footTint: 148992,
            footSprite: "player-feet-01.img",
            backpackTint: 4495104,
            backpackSprite: "player-circle-base-01.img",
        },
        lootImg: {
            sprite: "loot-shirt-01.img",
            tint: 16762368,
        },
    }),
    outfitAqua: defineOutfitSkin("outfitBase", {
        name: "Aquatic Avenger",
        skinImg: {
            baseTint: 47778,
            baseSprite: "player-base-01.img",
            handTint: 65502,
            handSprite: "player-hands-01.img",
            footTint: 65502,
            footSprite: "player-feet-01.img",
            backpackTint: 536620,
            backpackSprite: "player-circle-base-01.img",
        },
        lootImg: {
            sprite: "loot-shirt-01.img",
            tint: 47778,
        },
    }),
    outfitCoral: defineOutfitSkin("outfitBase", {
        name: "Coral Guise",
        skinImg: {
            baseTint: 16736103,
            baseSprite: "player-base-01.img",
            handTint: 16746895,
            handSprite: "player-hands-01.img",
            footTint: 16746895,
            footSprite: "player-feet-01.img",
            backpackTint: 16772298,
            backpackSprite: "player-circle-base-01.img",
        },
        lootImg: {
            sprite: "loot-shirt-01.img",
            tint: 16736103,
        },
    }),
    outfitKhaki: defineOutfitSkin("outfitBase", {
        name: "The Initiative",
        rarity: 1,
        skinImg: {
            baseTint: 12824197,
            baseSprite: "player-base-02.img",
            handTint: 9404516,
            handSprite: "player-hands-02.img",
            footTint: 9404516,
            footSprite: "player-feet-02.img",
            backpackTint: 4208940,
            backpackSprite: "player-circle-base-02.img",
        },
        lootImg: {
            sprite: "loot-shirt-01.img",
            tint: 12824197,
        },
    }),
    outfitParma: defineOutfitSkin("outfitBase", {
        name: "PARMA Jumpsuit",
        noDropOnDeath: true,
        rarity: 1,
        lore: "Next generation inversion.",
        skinImg: {
            baseTint: 8746585,
            baseSprite: "player-base-01.img",
            handTint: 12824197,
            handSprite: "player-hands-01.img",
            footTint: 12824197,
            footSprite: "player-feet-01.img",
            backpackTint: 4208940,
            backpackSprite: "player-circle-base-01.img",
        },
        lootImg: {
            sprite: "loot-shirt-outfitParma.img",
            tint: 0xffffff,
        },
    }),
    outfitParmaPrestige: defineOutfitSkin("outfitBase", {
        name: "The Core Jumpsuit",
        noDropOnDeath: true,
        rarity: 3,
        lore: "Special issue for staffers at Bunker 1.",
        skinImg: {
            baseTint: 14925953,
            baseSprite: "player-base-outfitParmaPrestige.img",
            handTint: 11113323,
            handSprite: "player-hands-02.img",
            footTint: 11113323,
            footSprite: "player-feet-02.img",
            backpackTint: 6640177,
            backpackSprite: "player-circle-base-02.img",
        },
        lootImg: {
            sprite: "loot-shirt-outfitParmaPrestige.img",
            tint: 0xffffff,
        },
    }),
    outfitCasanova: defineOutfitSkin("outfitBase", {
        name: "Casanova Silks",
        skinImg: {
            baseTint: 4327436,
            baseSprite: "player-base-01.img",
            handTint: 7602183,
            handSprite: "player-hands-01.img",
            footTint: 7602183,
            footSprite: "player-feet-01.img",
            backpackTint: 1052688,
            backpackSprite: "player-circle-base-01.img",
        },
        lootImg: {
            sprite: "loot-shirt-01.img",
            tint: 4327436,
        },
    }),
    outfitPrisoner: defineOutfitSkin("outfitBase", {
        name: "The New Black",
        skinImg: {
            baseTint: 16735266,
            baseSprite: "player-base-01.img",
            handTint: 16545059,
            handSprite: "player-hands-01.img",
            footTint: 16545059,
            footSprite: "player-feet-01.img",
            backpackTint: 16756224,
            backpackSprite: "player-circle-base-01.img",
        },
        lootImg: {
            sprite: "loot-shirt-01.img",
            tint: 16735266,
        },
    }),
    outfitJester: defineOutfitSkin("outfitBase", {
        name: "Jester's Folly",
        skinImg: {
            baseTint: 7798904,
            baseSprite: "player-base-01.img",
            handTint: 4915276,
            handSprite: "player-hands-01.img",
            footTint: 4915276,
            footSprite: "player-feet-01.img",
            backpackTint: 936960,
            backpackSprite: "player-circle-base-01.img",
        },
        lootImg: {
            sprite: "loot-shirt-01.img",
            tint: 7798904,
        },
    }),
    outfitWoodland: defineOutfitSkin("outfitBase", {
        name: "Woodland Combat",
        rarity: 1,
        lore: "Common component of PARMA survival caches.",
        skinImg: {
            baseTint: 2831146,
            baseSprite: "player-base-01.img",
            handTint: 5925970,
            handSprite: "player-hands-01.img",
            footTint: 5925970,
            footSprite: "player-feet-01.img",
            backpackTint: 5056e3,
            backpackSprite: "player-circle-base-01.img",
        },
        lootImg: {
            sprite: "loot-shirt-outfitWoodland.img",
            tint: 0xffffff,
        },
    }),
    outfitRoyalFortune: defineOutfitSkin("outfitBase", {
        name: "Royal Fortune",
        rarity: 3,
        skinImg: {
            baseTint: 8333091,
            baseSprite: "player-base-01.img",
            handTint: 15254058,
            handSprite: "player-hands-01.img",
            footTint: 15254058,
            footSprite: "player-feet-01.img",
            backpackTint: 9981696,
            backpackSprite: "player-circle-base-01.img",
        },
        lootImg: {
            sprite: "loot-shirt-outfitRoyalFortune.img",
            tint: 0xffffff,
        },
    }),
    outfitKeyLime: defineOutfitSkin("outfitBase", {
        name: "Key Lime",
        rarity: 1,
        lore: "Not for eating.",
        skinImg: {
            baseTint: 13107007,
            baseSprite: "player-base-01.img",
            handTint: 15662941,
            handSprite: "player-hands-01.img",
            footTint: 15662941,
            footSprite: "player-feet-01.img",
            backpackTint: 12355383,
            backpackSprite: "player-circle-base-01.img",
        },
        lootImg: {
            sprite: "loot-shirt-outfitKeyLime.img",
            tint: 0xffffff,
        },
    }),
    outfitCobaltShell: defineOutfitSkin("outfitBase", {
        name: "Cobalt Shell",
        rarity: 1,
        lore: "It means bluish.",
        skinImg: {
            baseTint: 11095,
            baseSprite: "player-base-01.img",
            handTint: 2711164,
            handSprite: "player-hands-01.img",
            footTint: 2711164,
            footSprite: "player-feet-01.img",
            backpackTint: 19093,
            backpackSprite: "player-circle-base-01.img",
        },
        lootImg: {
            sprite: "loot-shirt-outfitCobaltShell.img",
            tint: 0xffffff,
        },
    }),
    outfitCarbonFiber: defineOutfitSkin("outfitBase", {
        name: "Carbon Fiber",
        noDropOnDeath: true,
        rarity: 2,
        lore: "Military-grade, fine spun filament.",
        skinImg: {
            baseTint: 2171169,
            baseSprite: "player-base-01.img",
            handTint: 1842204,
            handSprite: "player-hands-01.img",
            footTint: 1842204,
            footSprite: "player-feet-01.img",
            backpackTint: 3552822,
            backpackSprite: "player-circle-base-01.img",
        },
        lootImg: {
            sprite: "loot-shirt-outfitCarbonFiber.img",
            tint: 0xffffff,
        },
    }),
    outfitDarkGloves: defineOutfitSkin("outfitBase", {
        name: "The Professional",
        noDropOnDeath: true,
        rarity: 2,
        lore: "True survivrs wear the dark gloves.",
        skinImg: {
            baseTint: 16303476,
            baseSprite: "player-base-01.img",
            handTint: 12482560,
            handSprite: "player-hands-01.img",
            footTint: 12482560,
            footSprite: "player-feet-01.img",
            backpackTint: 10708736,
            backpackSprite: "player-circle-base-01.img",
        },
        lootImg: {
            sprite: "loot-shirt-outfitDarkGloves.img",
            tint: 0xffffff,
        },
    }),
    outfitDarkShirt: defineOutfitSkin("outfitBase", {
        name: "The Semi-Pro",
        noDropOnDeath: true,
        rarity: 1,
        lore: "Some survivrs wear the dark shirt.",
        skinImg: {
            baseTint: 12482560,
            baseSprite: "player-base-01.img",
            handTint: 16303476,
            handSprite: "player-hands-01.img",
            footTint: 16303476,
            footSprite: "player-feet-01.img",
            backpackTint: 15183443,
            backpackSprite: "player-circle-base-01.img",
        },
        lootImg: {
            sprite: "loot-shirt-outfitDarkShirt.img",
            tint: 0xffffff,
        },
    }),
    outfitGhillie: defineOutfitSkin("outfitBase", {
        name: "Ghillie Suit",
        ghillie: true,
        skinImg: {
            baseTint: 8630096,
            baseSprite: "player-base-01.img",
            handTint: 8630096,
            handSprite: "player-hands-01.img",
            footTint: 8630096,
            footSprite: "player-feet-01.img",
            backpackTint: 6697728,
            backpackSprite: "player-circle-base-01.img",
        },
        lootImg: {
            sprite: "loot-shirt-01.img",
            tint: 8630096,
        },
    }),
    outfitDesertCamo: defineOutfitSkin("outfitBase", {
        name: "Desert Camo",
        rarity: 1,
        skinImg: {
            baseTint: 13736782,
            baseSprite: "player-base-01.img",
            handTint: 11169046,
            handSprite: "player-hands-01.img",
            footTint: 11169046,
            footSprite: "player-feet-01.img",
            backpackTint: 16763778,
            backpackSprite: "player-circle-base-01.img",
        },
        lootImg: {
            sprite: "loot-shirt-outfitDesertCamo.img",
            tint: 0xffffff,
        },
    }),
    outfitCamo: defineOutfitSkin("outfitBase", {
        name: "Forest Camo",
        rarity: 1,
        lore: "Be one with the trees.",
        skinImg: {
            baseTint: 10066278,
            baseSprite: "player-base-01.img",
            handTint: 8684631,
            handSprite: "player-hands-01.img",
            footTint: 8684631,
            footSprite: "player-feet-01.img",
            backpackTint: 6710835,
            backpackSprite: "player-circle-base-01.img",
        },
        lootImg: {
            sprite: "loot-shirt-outfitCamo.img",
            tint: 0xffffff,
        },
    }),
    outfitRed: defineOutfitSkin("outfitBase", {
        name: "Target Practice",
        noDropOnDeath: true,
        rarity: 1,
        lore: "On the plus side, they won't see you bleed.",
        skinImg: {
            baseTint: 16711680,
            baseSprite: "player-base-01.img",
            handTint: 13893632,
            handSprite: "player-hands-01.img",
            footTint: 13893632,
            footSprite: "player-feet-01.img",
            backpackTint: 11993088,
            backpackSprite: "player-circle-base-01.img",
        },
        lootImg: {
            sprite: "loot-shirt-outfitRed.img",
            tint: 0xffffff,
        },
    }),
    outfitWhite: defineOutfitSkin("outfitBase", {
        name: "Arctic Avenger",
        noDropOnDeath: true,
        rarity: 1,
        lore: "No business like snow business.",
        skinImg: {
            baseTint: 14935011,
            baseSprite: "player-base-01.img",
            handTint: 15658734,
            handSprite: "player-hands-01.img",
            footTint: 15658734,
            footSprite: "player-feet-01.img",
            backpackTint: 14474460,
            backpackSprite: "player-circle-base-01.img",
        },
        lootImg: {
            sprite: "loot-shirt-outfitWhite.img",
            tint: 0xffffff,
        },
    }),
    outfitBarrel: defineOutfitSkin("outfitBase", {
        name: "Barrel Costume",
        obstacleType: "barrel_01",
        baseScale: 0.8,
        lootImg: {
            tint: 3750201,
        },
    }),
    outfitWoodBarrel: defineOutfitSkin("outfitBase", {
        name: "Wood Barrel Costume",
        obstacleType: "barrel_02",
        baseScale: 1,
        lootImg: {
            tint: 11235106,
        },
    }),
    outfitStone: defineOutfitSkin("outfitBase", {
        name: "Stone Costume",
        obstacleType: "stone_01",
        baseScale: 0.9,
        lootImg: {
            tint: 7434609,
        },
    }),
    outfitTree: defineOutfitSkin("outfitBase", {
        name: "Tree Costume",
        obstacleType: "tree_07",
        baseScale: 1,
        lootImg: {
            tint: 4599058,
        },
    }),
    outfitTreeSpooky: defineOutfitSkin("outfitBase", {
        name: "Spooky Tree Costume",
        obstacleType: "tree_05",
        baseScale: 1,
        lootImg: {
            tint: 1775895,
        },
    }),
    outfitStump: defineOutfitSkin("outfitBase", {
        name: "Stump Costume",
        obstacleType: "tree_09",
        baseScale: 1,
        lootImg: {
            tint: 8602624,
        },
    }),
    outfitBush: defineOutfitSkin("outfitBase", {
        name: "Bush Costume",
        obstacleType: "bush_01b",
        baseScale: 1,
        lootImg: {
            tint: 3889951,
        },
    }),
    outfitLeafPile: defineOutfitSkin("outfitBase", {
        name: "Leaf Pile Costume",
        obstacleType: "bush_06b",
        baseScale: 1,
        lootImg: {
            tint: 16731392,
        },
    }),
    outfitCrate: defineOutfitSkin("outfitBase", {
        name: "Crate Costume",
        obstacleType: "crate_01",
        baseScale: 1,
        lootImg: {
            tint: 6697728,
        },
    }),
    outfitTable: defineOutfitSkin("outfitBase", {
        name: "Table Costume",
        obstacleType: "table_01",
        baseScale: 1,
        lootImg: {
            tint: 6697728,
        },
    }),
    outfitSoviet: defineOutfitSkin("outfitBase", {
        name: "Soviet Costume",
        obstacleType: "crate_02",
        baseScale: 1,
        lootImg: {
            tint: 6697728,
        },
    }),
    outfitAirdrop: defineOutfitSkin("outfitBase", {
        name: "Air Drop Costume",
        obstacleType: "crate_10",
        baseScale: 1,
        lootImg: {
            tint: 6579300,
        },
    }),
    outfitOven: defineOutfitSkin("outfitBase", {
        name: "Oven Costume",
        obstacleType: "oven_01",
        baseScale: 1,
        lootImg: {
            tint: 14935011,
        },
    }),
    outfitRefrigerator: defineOutfitSkin("outfitBase", {
        name: "Fridge Costume",
        obstacleType: "refrigerator_01b",
        baseScale: 1,
        lootImg: {
            tint: 7733259,
        },
    }),
    outfitVending: defineOutfitSkin("outfitBase", {
        name: "Vending Costume",
        obstacleType: "vending_01",
        baseScale: 1,
        lootImg: {
            tint: 10925,
        },
    }),
    outfitPumpkin: defineOutfitSkin("outfitBase", {
        name: "Pumpkin Costume",
        obstacleType: "pumpkin_01",
        baseScale: 1,
        lootImg: {
            tint: 15889667,
        },
    }),
    outfitWoodpile: defineOutfitSkin("outfitBase", {
        name: "Woodpile Costume",
        obstacleType: "woodpile_01",
        baseScale: 1,
        lootImg: {
            tint: 9455616,
        },
    }),
    outfitToilet: defineOutfitSkin("outfitBase", {
        name: "Toilet Costume",
        obstacleType: "toilet_02",
        baseScale: 1,
        lootImg: {
            tint: 0xffffff,
        },
    }),
    outfitBushRiver: defineOutfitSkin("outfitBase", {
        name: "River Bush Costume",
        obstacleType: "bush_04",
        baseScale: 1,
        lootImg: {
            tint: 5339946,
        },
    }),
    outfitCrab: defineOutfitSkin("outfitBase", {
        name: "Crab Pot Costume",
        obstacleType: "crate_20",
        baseScale: 1,
        lootImg: {
            tint: 16592920,
        },
    }),
    outfitStumpAxe: defineOutfitSkin("outfitBase", {
        name: "Stump Axe Costume",
        obstacleType: "tree_02h",
        baseScale: 1,
        lootImg: {
            tint: 11100701,
        },
    }),
};

export const OutfitDefs = { ...BaseDefs, ...SkinDefs };

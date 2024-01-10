import { util } from "../../utils/util";

function defineSkin(baseType, params) {
    return util.mergeDeep({}, BaseDefs[baseType], { baseType }, params);
}

const BaseDefs = {
    xp_10: {
        name: "XP",
        type: "xp",
        xp: 8,
        lootImg: {
            sprite: "loot-xp-book-01.img",
            tint: 0xffffff,
            border: "loot-circle-outer-05.img",
            borderTint: 0xffffff,
            scale: 0.2
        },
        sound: {
            drop: "xp_drop_01",
            pickup: "xp_pickup_01"
        },
        emitter: "xp_common"
    },
    xp_25: {
        name: "XP",
        type: "xp",
        xp: 24,
        lootImg: {
            sprite: "loot-xp-book-01.img",
            tint: 0xffffff,
            border: "loot-circle-outer-05.img",
            borderTint: 0xffffff,
            scale: 0.2
        },
        sound: {
            drop: "xp_drop_02",
            pickup: "xp_pickup_02"
        },
        emitter: "xp_rare"
    },
    xp_100: {
        name: "XP",
        type: "xp",
        xp: 96,
        lootImg: {
            sprite: "loot-xp-book-01.img",
            tint: 0xffffff,
            border: "loot-circle-outer-05.img",
            borderTint: 0xffffff,
            scale: 0.2
        },
        sound: {
            drop: "xp_drop_02",
            pickup: "xp_pickup_02"
        },
        emitter: "xp_mythic"
    }
};

const SkinDefs = {
    xp_book_tallow: defineSkin("xp_10", {
        name: "Tallow's Journal",
        lootImg: {
            sprite: "loot-xp-book-01.img"
        }
    }),
    xp_book_greene: defineSkin("xp_10", {
        name: "Greene's Infinite Wisdom",
        lootImg: {
            sprite: "loot-xp-book-02.img"
        }
    }),
    xp_book_parma: defineSkin("xp_10", {
        name: "The PARMA Papers",
        lootImg: {
            sprite: "loot-xp-book-03.img"
        }
    }),
    xp_book_nevelskoy: defineSkin("xp_10", {
        name: "The Nevelskoy Report",
        lootImg: {
            sprite: "loot-xp-book-04.img"
        }
    }),
    xp_book_rinzo: defineSkin("xp_10", {
        name: "Rinzō's Log",
        lootImg: {
            sprite: "loot-xp-book-05.img"
        }
    }),
    xp_book_kuga: defineSkin("xp_10", {
        name: "Memoirs of Kuga Kairyū",
        lootImg: {
            sprite: "loot-xp-book-06.img"
        }
    }),

    xp_glasses: defineSkin("xp_25", {
        name: "Lenz's Spectacles",
        lootImg: {
            sprite: "loot-xp-glasses-01.img"
        }
    }),
    xp_compass: defineSkin("xp_25", {
        name: "Amélie's True Compass",
        lootImg: {
            sprite: "loot-xp-compass-01.img"
        }
    }),
    xp_stump: defineSkin("xp_25", {
        name: "Ravenstone's Bloody Stump",
        lootImg: {
            sprite: "loot-xp-stump-01.img"
        }
    }),
    xp_bone: defineSkin("xp_25", {
        name: "Bone of Gordon",
        lootImg: {
            sprite: "loot-xp-bone-01.img"
        }
    }),

    xp_donut: defineSkin("xp_100", {
        name: "Cake Donut",
        lootImg: {
            sprite: "loot-xp-donut-01.img"
        }
    })
};

export const XPDefs = { ...BaseDefs, ...SkinDefs };

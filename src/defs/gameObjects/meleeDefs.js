import { util } from "../../utils/util";

function defineSkin(baseType, params) {
    return util.mergeDeep({}, BaseDefs[baseType], {
        baseType
    }, params);
}

const BaseDefs = {
    fists: {
        name: "Fists",
        type: "melee",
        quality: 0,
        autoAttack: false,
        switchDelay: 0.25,
        damage: 24,
        obstacleDamage: 1,
        headshotMult: 1,
        attack: {
            offset: {
                x: 1.35,
                y: 0
            },
            rad: 0.9,
            damageTimes: [0.1],
            cooldownTime: 0.25
        },
        speed: {
            equip: 1
        },
        anim: {
            idlePose: "fists",
            attackAnims: ["fists"]
        },
        sound: {
            swing: "punch_swing_01",
            deploy: "stow_weapon_01",
            playerHit: "punch_hit_01"
        },
        lootImg: {
            sprite: "loot-weapon-fists.img",
            scale: 0.3,
            rad: 25,
            tint: 65280
        }
    },
    knuckles: {
        name: "Knuckles",
        type: "melee",
        quality: 0,
        autoAttack: false,
        switchDelay: 0.25,
        damage: 24,
        obstacleDamage: 1,
        headshotMult: 1,
        noPotatoSwap: true,
        noDropOnDeath: true,
        attack: {
            offset: {
                x: 1.35,
                y: 0
            },
            rad: 0.9,
            damageTimes: [0.1],
            cooldownTime: 0.25
        },
        speed: {
            equip: 1,
            attack: 0
        },
        anim: {
            idlePose: "fists",
            attackAnims: ["fists", "fists"]
        },
        sound: {
            pickup: "frag_pickup_01",
            swing: "punch_swing_01",
            deploy: "knuckles_deploy_01",
            playerHit: "punch_hit_01"
        },
        lootImg: {
            sprite: "loot-melee-knuckles-rusted.img",
            tint: 16777215,
            border: "loot-circle-outer-02.img",
            borderTint: 16777215,
            scale: 0.3,
            rad: 25,
            rot: 0.785
        },
        worldImg: {
            sprite: "loot-melee-knuckles-rusted.img",
            pos: {
                x: 0,
                y: -27
            },
            rot: 0.5 * Math.PI,
            scale: {
                x: 0.2,
                y: 0.2
            },
            tint: 16777215
        }
    },
    karambit: {
        name: "Karambit",
        type: "melee",
        quality: 0,
        autoAttack: false,
        switchDelay: 0.25,
        damage: 24,
        obstacleDamage: 1,
        headshotMult: 1,
        noPotatoSwap: true,
        noDropOnDeath: true,
        attack: {
            offset: {
                x: 1.35,
                y: 0
            },
            rad: 0.9,
            damageTimes: [0.1],
            cooldownTime: 0.25
        },
        speed: {
            equip: 1
        },
        anim: {
            idlePose: "slash",
            attackAnims: ["slash", "fists"]
        },
        sound: {
            pickup: "frag_pickup_01",
            swing: "knife_swing_01",
            deploy: "knife_deploy_01",
            playerHit: "knife_hit_01"
        },
        lootImg: {
            sprite: "loot-melee-karambit-rugged.img",
            tint: 16777215,
            border: "loot-circle-outer-02.img",
            borderTint: 16777215,
            scale: 0.3,
            mirror: true,
            rot: 2.35619
        },
        worldImg: {
            sprite: "loot-melee-karambit-rugged.img",
            pos: {
                x: 15.5,
                y: -5
            },
            rot: 0.5 * Math.PI,
            scale: {
                x: 0.35,
                y: 0.35
            },
            tint: 16777215
        }
    },
    bayonet: {
        name: "Bayonet",
        type: "melee",
        quality: 0,
        autoAttack: false,
        switchDelay: 0.25,
        damage: 24,
        obstacleDamage: 1,
        headshotMult: 1,
        noPotatoSwap: true,
        noDropOnDeath: true,
        attack: {
            offset: {
                x: 1.35,
                y: 0
            },
            rad: 0.9,
            damageTimes: [0.1],
            cooldownTime: 0.25
        },
        speed: {
            equip: 1
        },
        anim: {
            idlePose: "fists",
            attackAnims: ["cut", "thrust"]
        },
        sound: {
            pickup: "frag_pickup_01",
            swing: "knife_swing_01",
            deploy: "knife_deploy_01",
            playerHit: "knife_hit_01"
        },
        lootImg: {
            sprite: "loot-melee-bayonet-rugged.img",
            tint: 16777215,
            border: "loot-circle-outer-02.img",
            borderTint: 16777215,
            scale: 0.3,
            rot: 0.785
        },
        worldImg: {
            sprite: "loot-melee-bayonet-rugged.img",
            pos: {
                x: -0.5,
                y: -32.5
            },
            rot: 0.785,
            scale: {
                x: 0.35,
                y: 0.35
            },
            tint: 16777215
        }
    },
    huntsman: {
        name: "Huntsman",
        type: "melee",
        quality: 0,
        autoAttack: false,
        switchDelay: 0.25,
        damage: 24,
        obstacleDamage: 1,
        headshotMult: 1,
        noPotatoSwap: true,
        noDropOnDeath: true,
        attack: {
            offset: {
                x: 1.35,
                y: 0
            },
            rad: 0.9,
            damageTimes: [0.1],
            cooldownTime: 0.25
        },
        speed: {
            equip: 1
        },
        anim: {
            idlePose: "fists",
            attackAnims: ["cut", "thrust"]
        },
        sound: {
            pickup: "frag_pickup_01",
            swing: "knife_swing_01",
            deploy: "knife_deploy_01",
            playerHit: "knife_hit_01"
        },
        lootImg: {
            sprite: "loot-melee-huntsman-rugged.img",
            tint: 16777215,
            border: "loot-circle-outer-02.img",
            borderTint: 16777215,
            scale: 0.3,
            rot: 0.785
        },
        worldImg: {
            sprite: "loot-melee-huntsman-rugged.img",
            pos: {
                x: 2.5,
                y: -35.5
            },
            rot: 0.82,
            scale: {
                x: 0.35,
                y: 0.35
            },
            tint: 16777215
        }
    },
    bowie: {
        name: "Bowie",
        type: "melee",
        quality: 0,
        autoAttack: false,
        switchDelay: 0.25,
        damage: 24,
        obstacleDamage: 1,
        headshotMult: 1,
        noPotatoSwap: true,
        noDropOnDeath: true,
        attack: {
            offset: {
                x: 1.35,
                y: 0
            },
            rad: 0.9,
            damageTimes: [0.1],
            cooldownTime: 0.25
        },
        speed: {
            equip: 1
        },
        anim: {
            idlePose: "fists",
            attackAnims: ["cut", "thrust"]
        },
        sound: {
            pickup: "frag_pickup_01",
            swing: "knife_swing_01",
            deploy: "knife_deploy_01",
            playerHit: "knife_hit_01"
        },
        lootImg: {
            sprite: "loot-melee-bowie-vintage.img",
            tint: 16777215,
            border: "loot-circle-outer-02.img",
            borderTint: 16777215,
            scale: 0.3,
            rot: 0.785
        },
        worldImg: {
            sprite: "loot-melee-bowie-vintage.img",
            pos: {
                x: -0.5,
                y: -32.5
            },
            rot: 0.785,
            scale: {
                x: 0.35,
                y: 0.35
            },
            tint: 16777215
        }
    },
    machete: {
        name: "Machete",
        type: "melee",
        quality: 1,
        cleave: true,
        autoAttack: false,
        switchDelay: 0.25,
        damage: 33,
        obstacleDamage: 1,
        headshotMult: 1,
        noPotatoSwap: true,
        attack: {
            offset: {
                x: 1.5,
                y: 0
            },
            rad: 1.75,
            damageTimes: [0.12],
            cooldownTime: 0.3
        },
        speed: {
            equip: 1
        },
        anim: {
            idlePose: "machete",
            attackAnims: ["cutReverse"]
        },
        sound: {
            pickup: "frag_pickup_01",
            swing: "knife_swing_01",
            deploy: "knife_deploy_01",
            playerHit: "knife_hit_01"
        },
        lootImg: {
            sprite: "loot-melee-machete-taiga.img",
            tint: 16777215,
            border: "loot-circle-outer-02.img",
            borderTint: 16777215,
            scale: 0.3,
            rot: 0.785
        },
        worldImg: {
            sprite: "loot-melee-machete-taiga.img",
            pos: {
                x: -2.5,
                y: -48.5
            },
            rot: 1.885,
            scale: {
                x: 0.35,
                y: 0.35
            },
            tint: 16777215
        }
    },
    saw: {
        name: "Saw",
        type: "melee",
        quality: 1,
        cleave: true,
        autoAttack: false,
        switchDelay: 0.25,
        damage: 44,
        obstacleDamage: 1,
        headshotMult: 1,
        noPotatoSwap: true,
        attack: {
            offset: {
                x: 2,
                y: 0
            },
            rad: 1.75,
            damageTimes: [0.1, 0.5],
            cooldownTime: 0.7
        },
        speed: {
            equip: 1
        },
        anim: {
            idlePose: "machete",
            attackAnims: ["sawSwing"]
        },
        sound: {
            pickup: "frag_pickup_01",
            swing: "knife_swing_01",
            deploy: "knife_deploy_01",
            playerHit: "knife_hit_01",
            playerHit2: "saw_hit_01"
        },
        lootImg: {
            sprite: "loot-melee-bonesaw-rusted.img",
            mirror: true,
            tint: 16777215,
            border: "loot-circle-outer-02.img",
            borderTint: 16777215,
            scale: 0.3,
            rot: 0.785
        },
        worldImg: {
            sprite: "loot-melee-bonesaw-rusted.img",
            pos: {
                x: -2.5,
                y: -48.5
            },
            rot: 1.885,
            scale: {
                x: 0.35,
                y: 0.35
            },
            tint: 16777215
        }
    },
    woodaxe: {
        name: "Wood Axe",
        type: "melee",
        quality: 0,
        armorPiercing: true,
        autoAttack: false,
        switchDelay: 0.25,
        damage: 36,
        obstacleDamage: 1.92,
        headshotMult: 1,
        attack: {
            offset: {
                x: 1.35,
                y: 0
            },
            rad: 1,
            damageTimes: [0.18],
            cooldownTime: 0.36
        },
        speed: {
            equip: 1
        },
        anim: {
            idlePose: "meleeTwoHanded",
            attackAnims: ["axeSwing"]
        },
        sound: {
            pickup: "heavy_pickup_01",
            swing: "heavy_swing_01",
            deploy: "stow_weapon_01",
            playerHit: "axe_hit_01"
        },
        lootImg: {
            sprite: "loot-melee-woodaxe.img",
            tint: 16777215,
            border: "loot-circle-outer-02.img",
            borderTint: 16777215,
            scale: 0.3,
            mirror: true,
            rot: 2.35619
        },
        worldImg: {
            sprite: "loot-melee-woodaxe.img",
            pos: {
                x: -12.5,
                y: -16
            },
            rot: 1.2,
            scale: {
                x: 0.35,
                y: 0.35
            },
            tint: 16777215,
            leftHandOntop: true
        }
    },
    fireaxe: {
        name: "Fire Axe",
        type: "melee",
        quality: 1,
        armorPiercing: true,
        autoAttack: false,
        switchDelay: 0.25,
        damage: 44,
        obstacleDamage: 2.4,
        headshotMult: 1,
        attack: {
            offset: {
                x: 1.35,
                y: 0
            },
            rad: 1,
            damageTimes: [0.21],
            cooldownTime: 0.42
        },
        speed: {
            equip: 1
        },
        anim: {
            idlePose: "meleeTwoHanded",
            attackAnims: ["axeSwing"]
        },
        sound: {
            pickup: "heavy_pickup_01",
            swing: "heavy_swing_01",
            deploy: "stow_weapon_01",
            playerHit: "axe_hit_01"
        },
        lootImg: {
            sprite: "loot-melee-fireaxe.img",
            tint: 16777215,
            border: "loot-circle-outer-02.img",
            borderTint: 16777215,
            scale: 0.3,
            mirror: true,
            rot: 2.35619
        },
        worldImg: {
            sprite: "loot-melee-fireaxe.img",
            pos: {
                x: -12.5,
                y: -4
            },
            rot: 1.2,
            scale: {
                x: 0.35,
                y: 0.35
            },
            tint: 16777215,
            leftHandOntop: true
        }
    },
    katana: {
        name: "Katana",
        type: "melee",
        quality: 0,
        armorPiercing: true,
        cleave: true,
        autoAttack: false,
        switchDelay: 0.25,
        damage: 40,
        obstacleDamage: 1.5,
        headshotMult: 1,
        attack: {
            offset: {
                x: 1.75,
                y: 0
            },
            rad: 2,
            damageTimes: [0.2],
            cooldownTime: 0.4
        },
        speed: {
            equip: 1
        },
        anim: {
            idlePose: "meleeKatana",
            attackAnims: ["katanaSwing"]
        },
        sound: {
            pickup: "frag_pickup_01",
            swing: "medium_swing_01",
            deploy: "stow_weapon_01",
            playerHit: "knife_hit_01"
        },
        lootImg: {
            sprite: "loot-melee-katana.img",
            tint: 16777215,
            border: "loot-circle-outer-02.img",
            borderTint: 16777215,
            scale: 0.3,
            mirror: true,
            rot: 2.35619
        },
        worldImg: {
            sprite: "loot-melee-katana.img",
            pos: {
                x: 52.5,
                y: -2
            },
            rot: 3,
            scale: {
                x: 0.35,
                y: 0.35
            },
            tint: 16777215,
            leftHandOntop: true
        }
    },
    naginata: {
        name: "Naginata",
        type: "melee",
        quality: 1,
        armorPiercing: true,
        cleave: true,
        autoAttack: false,
        switchDelay: 0.25,
        damage: 56,
        obstacleDamage: 1.92,
        headshotMult: 1,
        attack: {
            offset: {
                x: 3.5,
                y: 0
            },
            rad: 2,
            damageTimes: [0.27],
            cooldownTime: 0.54
        },
        speed: {
            equip: 1
        },
        anim: {
            idlePose: "meleeNaginata",
            attackAnims: ["naginataSwing"]
        },
        sound: {
            pickup: "heavy_pickup_01",
            swing: "heavy_swing_01",
            deploy: "stow_weapon_01",
            playerHit: "axe_hit_01"
        },
        lootImg: {
            sprite: "loot-melee-naginata.img",
            tint: 16777215,
            border: "loot-circle-outer-02.img",
            borderTint: 16777215,
            scale: 0.3,
            mirror: true,
            rot: 2.35619
        },
        worldImg: {
            sprite: "loot-melee-naginata.img",
            pos: {
                x: 42.5,
                y: -3
            },
            rot: 1.9,
            scale: {
                x: 0.35,
                y: 0.35
            },
            tint: 16777215,
            leftHandOntop: true
        }
    },
    stonehammer: {
        name: "Stone Hammer",
        type: "melee",
        quality: 1,
        armorPiercing: true,
        stonePiercing: true,
        autoAttack: false,
        switchDelay: 0.25,
        damage: 60,
        obstacleDamage: 1.92,
        headshotMult: 1,
        attack: {
            offset: {
                x: 1.35,
                y: 0
            },
            rad: 1.25,
            damageTimes: [0.25],
            cooldownTime: 0.5
        },
        speed: {
            equip: 1
        },
        anim: {
            idlePose: "meleeTwoHanded",
            attackAnims: ["hammerSwing"]
        },
        sound: {
            pickup: "heavy_pickup_01",
            swing: "heavy_swing_01",
            deploy: "stow_weapon_01",
            playerHit: "hammer_hit_01"
        },
        lootImg: {
            sprite: "loot-melee-stonehammer.img",
            tint: 16777215,
            border: "loot-circle-outer-02.img",
            borderTint: 16777215,
            scale: 0.3,
            mirror: true,
            rot: 2.35619
        },
        worldImg: {
            sprite: "loot-melee-stonehammer.img",
            pos: {
                x: -12.5,
                y: -4
            },
            rot: 1.2,
            scale: {
                x: 0.35,
                y: 0.35
            },
            tint: 16777215,
            leftHandOntop: true
        }
    },
    hook: {
        name: "Hook",
        type: "melee",
        quality: 1,
        autoAttack: true,
        switchDelay: 0.25,
        damage: 18,
        obstacleDamage: 1,
        headshotMult: 1,
        attack: {
            offset: {
                x: 1.5,
                y: 0
            },
            rad: 1,
            damageTimes: [0.075],
            cooldownTime: 0.175
        },
        speed: {
            equip: 1
        },
        anim: {
            idlePose: "fists",
            attackAnims: ["hook"]
        },
        sound: {
            pickup: "frag_pickup_01",
            swing: "knife_swing_01",
            deploy: "stow_weapon_01",
            playerHit: "hook_hit_01"
        },
        lootImg: {
            sprite: "loot-melee-hook-silver.img",
            tint: 16777215,
            border: "loot-circle-outer-02.img",
            borderTint: 16777215,
            scale: 0.3,
            rot: 0.785
        },
        worldImg: {
            sprite: "loot-melee-hook-silver.img",
            pos: {
                x: 0,
                y: -27
            },
            rot: 0.5 * Math.PI,
            scale: {
                x: 0.35,
                y: 0.35
            },
            tint: 16777215,
            renderOnHand: true
        }
    },
    pan: {
        name: "Pan",
        type: "melee",
        quality: 1,
        autoAttack: false,
        switchDelay: 0.25,
        damage: 60,
        obstacleDamage: 0.8,
        headshotMult: 1,
        attack: {
            offset: {
                x: 2,
                y: 0
            },
            rad: 1.5,
            damageTimes: [0.15],
            cooldownTime: 0.5
        },
        speed: {
            equip: 1
        },
        anim: {
            idlePose: "fists",
            attackAnims: ["pan"]
        },
        sound: {
            pickup: "pan_pickup_01",
            swing: "heavy_swing_01",
            deploy: "pan_pickup_01",
            playerHit: "pan_hit_01",
            bullet: "pan_bullet"
        },
        lootImg: {
            sprite: "loot-melee-pan-black.img",
            tint: 16777215,
            border: "loot-circle-outer-02.img",
            borderTint: 16777215,
            scale: 0.3,
            rot: -0.785
        },
        worldImg: {
            sprite: "loot-melee-pan-black-side.img",
            pos: {
                x: 0,
                y: -40
            },
            rot: 1.125,
            scale: {
                x: 0.35,
                y: 0.35
            },
            tint: 16777215
        },
        hipImg: {
            sprite: "loot-melee-pan-black-side.img",
            pos: {
                x: -17.25,
                y: 7.5
            },
            rot: 0.78 * Math.PI,
            scale: {
                x: 0.3,
                y: 0.3
            },
            tint: 16777215
        },
        reflectSurface: {
            equipped: {
                p0: {
                    x: 2.65,
                    y: -0.125
                },
                p1: {
                    x: 1.35,
                    y: -0.74
                }
            },
            unequipped: {
                p0: {
                    x: -0.625,
                    y: -1.2
                },
                p1: {
                    x: -1.4,
                    y: -0.25
                }
            }
        }
    },
    spade: {
        name: "Spade",
        type: "melee",
        quality: 1,
        cleave: false,
        autoAttack: false,
        switchDelay: 0.25,
        damage: 40,
        obstacleDamage: 1,
        headshotMult: 1,
        noPotatoSwap: true,
        attack: {
            offset: {
                x: 1.75,
                y: 0
            },
            rad: 1.5,
            damageTimes: [0.12],
            cooldownTime: 0.35
        },
        speed: {
            equip: 1
        },
        anim: {
            idlePose: "fists",
            attackAnims: ["cut", "thrust"]
        },
        sound: {
            pickup: "heavy_pickup_01",
            swing: "knife_swing_01",
            deploy: "stow_weapon_01",
            playerHit: "spade_hit_01"
        },
        lootImg: {
            sprite: "loot-melee-spade-assault.img",
            tint: 16777215,
            border: "loot-circle-outer-02.img",
            borderTint: 16777215,
            scale: 0.3,
            rot: 0.785
        },
        worldImg: {
            sprite: "loot-melee-spade-assault.img",
            pos: {
                x: -0.5,
                y: -41.5
            },
            rot: 1,
            scale: {
                x: 0.35,
                y: 0.35
            },
            tint: 16777215
        }
    },
    crowbar: {
        name: "Crowbar",
        type: "melee",
        quality: 1,
        cleave: false,
        autoAttack: false,
        switchDelay: 0.25,
        damage: 33,
        obstacleDamage: 1.4,
        headshotMult: 1,
        noPotatoSwap: true,
        attack: {
            offset: {
                x: 1.25,
                y: 0
            },
            rad: 1.25,
            damageTimes: [0.12],
            cooldownTime: 0.3
        },
        speed: {
            equip: 1
        },
        anim: {
            idlePose: "fists",
            attackAnims: ["cut", "cutReverseShort"]
        },
        sound: {
            pickup: "frag_pickup_01",
            swing: "knife_swing_01",
            deploy: "frag_pickup_01",
            playerHit: "crowbar_hit_01"
        },
        lootImg: {
            sprite: "loot-melee-crowbar-recon.img",
            tint: 16777215,
            border: "loot-circle-outer-02.img",
            borderTint: 16777215,
            scale: 0.3,
            rot: 0.785
        },
        worldImg: {
            sprite: "loot-melee-crowbar-recon.img",
            pos: {
                x: -1,
                y: -10
            },
            rot: 1,
            scale: {
                x: 0.35,
                y: 0.35
            },
            tint: 16777215
        }
    }
};

const SkinDefs = {
    fists: defineSkin("fists", {
        name: "Fists",
        rarity: 0,
        lore: "The old one-two."
    }),
    knuckles_rusted: defineSkin("knuckles", {
        name: "Knuckles Rusted",
        rarity: 2,
        lore: "Rust up for the dust up.",
        noPotatoSwap: false,
        lootImg: {
            sprite: "loot-melee-knuckles-rusted.img"
        },
        worldImg: {
            sprite: "loot-melee-knuckles-rusted.img"
        }
    }),
    knuckles_heroic: defineSkin("knuckles", {
        name: "Knuckles Heroic",
        rarity: 3,
        lore: "Give 'em a hero sandwich.",
        noPotatoSwap: false,
        lootImg: {
            sprite: "loot-melee-knuckles-heroic.img"
        },
        worldImg: {
            sprite: "loot-melee-knuckles-heroic.img"
        }
    }),
    karambit_rugged: defineSkin("karambit", {
        name: "Karambit Rugged",
        rarity: 3,
        noPotatoSwap: false,
        anim: {
            idlePose: "slash",
            attackAnims: ["slash", "fists"]
        },
        lootImg: {
            sprite: "loot-melee-karambit-rugged.img"
        },
        worldImg: {
            sprite: "loot-melee-karambit-rugged.img"
        }
    }),
    karambit_prismatic: defineSkin("karambit", {
        name: "Karambit Prismatic",
        rarity: 4,
        noPotatoSwap: false,
        lootImg: {
            sprite: "loot-melee-karambit-prismatic.img"
        },
        worldImg: {
            sprite: "loot-melee-karambit-prismatic.img"
        }
    }),
    karambit_drowned: defineSkin("karambit", {
        name: "Karambit Drowned",
        rarity: 4,
        noPotatoSwap: false,
        lootImg: {
            sprite: "loot-melee-karambit-drowned.img"
        },
        worldImg: {
            sprite: "loot-melee-karambit-drowned.img"
        }
    }),
    bayonet_rugged: defineSkin("bayonet", {
        name: "Bayonet Rugged",
        rarity: 3,
        noPotatoSwap: false,
        lootImg: {
            sprite: "loot-melee-bayonet-rugged.img"
        },
        worldImg: {
            sprite: "loot-melee-bayonet-rugged.img"
        }
    }),
    bayonet_woodland: defineSkin("bayonet", {
        name: "Bayonet Woodland",
        rarity: 4,
        noPotatoSwap: false,
        lootImg: {
            sprite: "loot-melee-bayonet-woodland.img"
        },
        worldImg: {
            sprite: "loot-melee-bayonet-woodland.img"
        }
    }),
    huntsman_rugged: defineSkin("huntsman", {
        name: "Huntsman Rugged",
        rarity: 3,
        noPotatoSwap: false,
        lootImg: {
            sprite: "loot-melee-huntsman-rugged.img"
        },
        worldImg: {
            sprite: "loot-melee-huntsman-rugged.img"
        }
    }),
    huntsman_burnished: defineSkin("huntsman", {
        name: "Huntsman Burnished",
        rarity: 4,
        noPotatoSwap: false,
        lootImg: {
            sprite: "loot-melee-huntsman-burnished.img"
        },
        worldImg: {
            sprite: "loot-melee-huntsman-burnished.img"
        }
    }),
    bowie_vintage: defineSkin("bowie", {
        name: "Bowie Vintage",
        rarity: 3,
        noPotatoSwap: false,
        lootImg: { sprite: "loot-melee-bowie-vintage.img" },
        worldImg: {
            sprite: "loot-melee-bowie-vintage.img"
        }
    }),
    bowie_frontier: defineSkin("bowie", {
        name: "Bowie Frontier",
        rarity: 4,
        noPotatoSwap: false,
        lootImg: {
            sprite: "loot-melee-bowie-frontier.img"
        },
        worldImg: {
            sprite: "loot-melee-bowie-frontier.img"
        }
    }),
    machete_taiga: defineSkin("machete", {
        name: "UVSR Taiga",
        noPotatoSwap: false,
        lootImg: { sprite: "loot-melee-machete-taiga.img" },
        worldImg: {
            sprite: "loot-melee-machete-taiga.img"
        }
    }),
    kukri_trad: defineSkin("machete", {
        name: "Tallow's Kukri",
        noPotatoSwap: false,
        lootImg: { sprite: "loot-melee-kukri-trad.img" },
        worldImg: {
            sprite: "loot-melee-kukri-trad.img",
            pos: { x: -0.5, y: -46.5 }
        }
    }),
    bonesaw_rusted: defineSkin("saw", {
        name: "Bonesaw Rusted",
        noPotatoSwap: false,
        lootImg: {
            sprite: "loot-melee-bonesaw-rusted.img"
        },
        worldImg: {
            sprite: "loot-melee-bonesaw-rusted.img"
        }
    }),
    woodaxe_bloody: defineSkin("woodaxe", {
        name: "Axe Bloodstained",
        lootImg: {
            sprite: "loot-melee-woodaxe-bloody.img"
        },
        worldImg: {
            sprite: "loot-melee-woodaxe-bloody.img"
        }
    }),
    katana_rusted: defineSkin("katana", {
        name: "Katana Rusted",
        lootImg: { sprite: "loot-melee-katana-rusted.img" },
        worldImg: {
            sprite: "loot-melee-katana-rusted.img"
        }
    }),
    katana_orchid: defineSkin("katana", {
        name: "Katana Orchid",
        quality: 1,
        lootImg: { sprite: "loot-melee-katana-orchid.img" },
        worldImg: {
            sprite: "loot-melee-katana-orchid.img"
        }
    }),
    sledgehammer: defineSkin("stonehammer", {
        name: "Sledgehammer",
        lootImg: { sprite: "loot-melee-sledgehammer.img" },
        worldImg: {
            sprite: "loot-melee-sledgehammer.img",
            pos: { x: -12.5, y: -3.5 }
        }
    }),
    crowbar_scout: defineSkin("crowbar", {
        name: "Scouting Crowbar",
        noPotatoSwap: false
    }),
    crowbar_recon: defineSkin("crowbar", {
        name: "Crowbar Carbon",
        noPotatoSwap: false,
        lootImg: { sprite: "loot-melee-crowbar-recon.img" },
        worldImg: {
            sprite: "loot-melee-crowbar-recon.img"
        }
    }),
    kukri_sniper: defineSkin("machete", {
        name: "Marksman's Recurve",
        noPotatoSwap: false,
        lootImg: { sprite: "loot-melee-kukri-sniper.img" },
        worldImg: {
            sprite: "loot-melee-kukri-sniper.img",
            pos: { x: -0.5, y: -46.5 }
        }
    }),
    bonesaw_healer: defineSkin("saw", {
        name: "The Separator",
        noPotatoSwap: false,
        lootImg: {
            sprite: "loot-melee-bonesaw-healer.img"
        },
        worldImg: {
            sprite: "loot-melee-bonesaw-healer.img"
        }
    }),
    katana_demo: defineSkin("katana", {
        name: "Hakai no Katana",
        lootImg: { sprite: "loot-melee-katana-demo.img" },
        worldImg: { sprite: "loot-melee-katana-demo.img" }
    }),
    spade_assault: defineSkin("spade", {
        name: "Trench Spade",
        noPotatoSwap: false
    }),
    warhammer_tank: defineSkin("stonehammer", {
        name: "Panzerhammer",
        damage: 64,
        attack: {
            offset: { x: 1.5, y: 0 },
            rad: 1.75,
            damageTimes: [0.3],
            cooldownTime: 0.6
        },
        lootImg: {
            sprite: "loot-melee-warhammer-tank.img"
        },
        worldImg: {
            sprite: "loot-melee-warhammer-tank.img",
            pos: { x: -10.5, y: -3 }
        }
    })
};

export const MeleeDefs = { ...BaseDefs, ...SkinDefs };

export const GameConfig = {
    protocolVersion: 78,
    Input: {
        MoveLeft: 0,
        MoveRight: 1,
        MoveUp: 2,
        MoveDown: 3,
        Fire: 4,
        Reload: 5,
        Cancel: 6,
        Interact: 7,
        Revive: 8,
        Use: 9,
        Loot: 10,
        EquipPrimary: 11,
        EquipSecondary: 12,
        EquipMelee: 13,
        EquipThrowable: 14,
        EquipFragGrenade: 15,
        EquipSmokeGrenade: 16,
        EquipNextWeap: 17,
        EquipPrevWeap: 18,
        EquipLastWeap: 19,
        EquipOtherGun: 20,
        EquipPrevScope: 21,
        EquipNextScope: 22,
        UseBandage: 23,
        UseHealthKit: 24,
        UseSoda: 25,
        UsePainkiller: 26,
        StowWeapons: 27,
        SwapWeapSlots: 28,
        ToggleMap: 29,
        CycleUIMode: 30,
        EmoteMenu: 31,
        TeamPingMenu: 32,
        Fullscreen: 33,
        HideUI: 34,
        TeamPingSingle: 35,
        Count: 36
    },
    EmoteSlot: {
        Top: 0,
        Right: 1,
        Bottom: 2,
        Left: 3,
        Win: 4,
        Death: 5,
        Count: 6
    },
    WeaponSlot: {
        Primary: 0,
        Secondary: 1,
        Melee: 2,
        Throwable: 3,
        Count: 4
    },
    WeaponType: ["gun", "gun", "melee", "throwable"],
    DamageType: {
        Player: 0,
        Bleeding: 1,
        Gas: 2,
        Airdrop: 3,
        Airstrike: 4
    },
    Action: {
        None: 0,
        Reload: 1,
        ReloadAlt: 2,
        UseItem: 3,
        Revive: 4
    },
    Anim: {
        None: 0,
        Melee: 1,
        Cook: 2,
        Throw: 3,
        CrawlForward: 4,
        CrawlBackward: 5,
        Revive: 6
    },
    GasMode: {
        Inactive: 0,
        Waiting: 1,
        Moving: 2
    },
    gas: {
        initWaitTime: 90,
        waitTimeDecay: 15,
        waitTimeMin: 10,
        initGasTime: 30,
        gasTimeDecay: 5,
        gasTimeMin: 5,
        initWidth: 0.75,
        widthDecay: 0.5,
        widthMin: 10,
        damageTickRate: 2,
        damage: [
            1.4, 2.2, 3.5, 7.5, 10, 14, 22, 22, 22
        ]
    },
    Plane: {
        Airdrop: 0,
        Airstrike: 1
    },
    HasteType: {
        None: 0,
        Windwalk: 1,
        Takedown: 2,
        Inspire: 3
    },
    map: {
        gridSize: 16,
        shoreVariation: 3,
        grassVariation: 2
    },
    player: {
        radius: 1,
        maxVisualRadius: 3.75,
        maxInteractionRad: 3.5,
        health: 100,
        reviveHealth: 24,
        minActiveTime: 10,
        boostDecay: 0.33,
        boostMoveSpeed: 1.85,
        boostHealAmount: 0.33,
        boostBreakpoints: [1, 1, 1.5, 0.5],
        scopeDelay: 0.25,
        baseSwitchDelay: 0.25,
        freeSwitchCooldown: 1,
        headshotChance: 0.15,
        moveSpeed: 12,
        waterSpeedPenalty: 3,
        cookSpeedPenalty: 3,
        bleedTickRate: 1,
        downedMoveSpeed: 4,
        downedRezMoveSpeed: 2,
        reviveDuration: 8,
        reviveRange: 5,
        crawlTime: 0.75,
        bleedDamage: 2,
        emoteSoftCooldown: 2,
        emoteHardCooldown: 6,
        emoteThreshold: 6,
        throwableMaxMouseDist: 18,
        cookTime: 0.1,
        throwTime: 0.3,
        meleeHeight: 0.25,
        touchLootRadMult: 1.4,
        medicHealRange: 8,
        medicReviveRange: 6,
        spectateDeadTimeout: 2
    },
    defaultEmoteLoadout: ["emote_happyface", "emote_thumbsup", "emote_surviv", "emote_sadface", "", ""],
    airdrop: {
        actionOffset: 0,
        fallTime: 8,
        crushDamage: 100,
        planeVel: 48,
        planeRad: 150,
        soundRangeMult: 2.5,
        soundRangeDelta: 0.25,
        soundRangeMax: 92,
        fallOff: 0
    },
    airstrike: {
        actionOffset: 0,
        bombJitter: 4,
        bombOffset: 2,
        bombVel: 3,
        bombCount: 20,
        planeVel: 350,
        planeRad: 120,
        soundRangeMult: 18,
        soundRangeDelta: 18,
        soundRangeMax: 48,
        fallOff: 1.25
    },
    groupColors: [16776960, 16711935, 65535, 16733184],
    teamColors: [13369344, 32511],
    bullet: {
        maxReflect: 3,
        reflectDistDecay: 1.5,
        height: 0.25
    },
    projectile: {
        maxHeight: 5
    },
    structureLayerCount: 2,
    tracerColors: {
        "9mm": {
            regular: 16704198,
            saturated: 16767411,
            chambered: 16744192,
            alphaRate: 0.92,
            alphaMin: 0.14
        },
        "9mm_suppressed_bonus": {
            regular: 16704198,
            saturated: 16767411,
            chambered: 16744192,
            alphaRate: 0.96,
            alphaMin: 0.28
        },
        "9mm_cursed": {
            regular: 1247488,
            saturated: 1247488,
            chambered: 1247488,
            alphaRate: 0.92,
            alphaMin: 0.14
        },
        "762mm": {
            regular: 12965630,
            saturated: 11257087,
            chambered: 19711,
            alphaRate: 0.94,
            alphaMin: 0.2
        },
        "12gauge": {
            regular: 16702684,
            saturated: 16702684,
            chambered: 16711680
        },
        "556mm": {
            regular: 11141010,
            saturated: 11141010,
            chambered: 3604224,
            alphaRate: 0.92,
            alphaMin: 0.14
        },
        "50AE": {
            regular: 16773256,
            saturated: 16773256,
            chambered: 16768768
        },
        "308sub": {
            regular: 2435840,
            saturated: 4608e3,
            chambered: 1250816,
            alphaRate: 0.92,
            alphaMin: 0.07
        },
        flare: {
            regular: 14869218,
            saturated: 14869218,
            chambered: 12895428
        },
        "45acp": {
            regular: 15515391,
            saturated: 15183103,
            chambered: 11862271
        },
        shrapnel: { regular: 3355443, saturated: 3355443 },
        frag: { regular: 13303808, saturated: 13303808 },
        invis: { regular: 0, saturated: 0, chambered: 0 }
    },
    scopeZoomRadius: {
        desktop: {
            "1xscope": 28,
            "2xscope": 36,
            "4xscope": 48,
            "8xscope": 68,
            "15xscope": 104
        } as Record<string, number>,
        mobile: {
            "1xscope": 32,
            "2xscope": 40,
            "4xscope": 48,
            "8xscope": 64,
            "15xscope": 88
        } as Record<string, number>
    },
    bagSizes: {
        "9mm": [120, 240, 330, 420],
        "762mm": [90, 180, 240, 300],
        "556mm": [90, 180, 240, 300],
        "12gauge": [15, 30, 60, 90],
        "50AE": [49, 98, 147, 196],
        "308sub": [10, 20, 40, 80],
        flare: [2, 4, 6, 8],
        "45acp": [90, 180, 240, 300],
        frag: [3, 6, 9, 12],
        smoke: [3, 6, 9, 12],
        strobe: [2, 3, 4, 5],
        mirv: [2, 4, 6, 8],
        snowball: [10, 20, 30, 40],
        potato: [10, 20, 30, 40],
        bandage: [5, 10, 15, 30],
        healthkit: [1, 2, 3, 4],
        soda: [2, 5, 10, 15],
        painkiller: [1, 2, 3, 4],
        "1xscope": [1, 1, 1, 1],
        "2xscope": [1, 1, 1, 1],
        "4xscope": [1, 1, 1, 1],
        "8xscope": [1, 1, 1, 1],
        "15xscope": [1, 1, 1, 1]
    } as Record<string, number[]>,
    lootRadius: {
        outfit: 1,
        melee: 1.25,
        gun: 1.25,
        throwable: 1,
        ammo: 1.2,
        heal: 1,
        boost: 1,
        backpack: 1,
        helmet: 1,
        chest: 1,
        scope: 1,
        perk: 1.25,
        xp: 1
    } as Record<string, number>
} as const;

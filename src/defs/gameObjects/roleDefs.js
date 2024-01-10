export const RoleDefs = {
    leader: {
        type: "role",
        announce: true,
        killFeed: { assign: true, dead: true },
        sound: {
            assign: "leader_assigned_01",
            dead: "leader_dead_01"
        },
        mapIcon: {
            alive: "player-star.img",
            dead: "skull-leader.img"
        },
        perks: ["leadership"]
    },
    lieutenant: {
        type: "role",
        announce: true,
        killFeed: { assign: true },
        sound: { assign: "lt_assigned_01" },
        perks: ["firepower"]
    },
    medic: {
        type: "role",
        announce: true,
        killFeed: { assign: true },
        sound: { assign: "medic_assigned_01" },
        mapIcon: {
            alive: "player-medic.img",
            dead: "skull-leader.img"
        },
        perks: ["aoe_heal", "self_revive"]
    },
    marksman: {
        type: "role",
        announce: true,
        killFeed: { assign: true },
        sound: { assign: "marksman_assigned_01" },
        perks: ["targeting"]
    },
    recon: {
        type: "role",
        announce: true,
        killFeed: { assign: true },
        sound: { assign: "recon_assigned_01" },
        perks: ["small_arms"]
    },
    grenadier: {
        type: "role",
        announce: true,
        killFeed: { assign: true },
        sound: { assign: "grenadier_assigned_01" },
        perks: ["flak_jacket"]
    },
    bugler: {
        type: "role",
        announce: true,
        killFeed: { assign: true },
        sound: { assign: "bugler_assigned_01" },
        perks: ["inspiration", "final_bugle"]
    },
    last_man: {
        type: "role",
        announce: true,
        killFeed: { assign: true },
        sound: { assign: "last_man_assigned_01" },
        perks: ["steelskin", "splinter"]
    },
    woods_king: {
        type: "role",
        announce: false,
        killFeed: { dead: true, color: "#12ff00" },
        sound: { dead: "leader_dead_01" },
        perks: ["gotw", "windwalk"]
    },
    kill_leader: {
        type: "role",
        announce: false,
        killFeed: { assign: true, dead: true, color: "#ff8400" },
        sound: {
            assign: "leader_assigned_01",
            dead: "leader_dead_01"
        }
    },
    the_hunted: {
        type: "role",
        announce: true,
        killFeed: { assign: true, dead: true, color: "#ff8400" },
        sound: {
            assign: "leader_assigned_01",
            dead: "leader_dead_01"
        },
        mapIndicator: {
            sprite: "player-the-hunted.img",
            tint: 16745472,
            pulse: true,
            pulseTint: 16745472
        },
        perks: ["hunted"]
    },
    healer: {
        type: "role",
        announce: false,
        sound: { assign: "spawn_01" },
        perks: ["field_medic", "windwalk"],
        visorImg: {
            baseSprite: "player-visor-healer.img",
            spriteScale: 0.3
        },
        guiImg: "img/gui/role-healer.svg",
        color: 11468975
    },
    tank: {
        type: "role",
        announce: false,
        sound: { assign: "spawn_01" },
        perks: ["steelskin", "endless_ammo"],
        visorImg: {
            baseSprite: "player-visor-tank.img",
            spriteScale: 0.3
        },
        guiImg: "img/gui/role-tank.svg",
        color: 13862400
    },
    sniper: {
        type: "role",
        announce: false,
        sound: { assign: "spawn_01" },
        perks: ["chambered", "takedown"],
        visorImg: {
            baseSprite: "player-visor-sniper.img",
            spriteScale: 0.3
        },
        guiImg: "img/gui/role-sniper.svg",
        color: 30696
    },
    scout: {
        type: "role",
        announce: false,
        sound: { assign: "spawn_01" },
        perks: ["small_arms", "tree_climbing"],
        visorImg: {
            baseSprite: "player-visor-scout.img",
            spriteScale: 0.3
        },
        guiImg: "img/gui/role-scout.svg",
        color: 6725632
    },
    demo: {
        type: "role",
        announce: false,
        sound: { assign: "spawn_01" },
        perks: ["fabricate", "flak_jacket"],
        visorImg: {
            baseSprite: "player-visor-demo.img",
            spriteScale: 0.3
        },
        guiImg: "img/gui/role-demo.svg",
        color: 6750976
    },
    assault: {
        type: "role",
        announce: false,
        sound: { assign: "spawn_01" },
        perks: ["firepower", "bonus_assault"],
        visorImg: {
            baseSprite: "player-visor-assault.img",
            spriteScale: 0.3
        },
        guiImg: "img/gui/role-assault.svg",
        color: 16772119
    }
};

import { collider } from "../utils/collider";
import { util } from "../utils/util";
import { v2 } from "../utils/v2";

// Helpers
function tierLoot(tier, min, max, props) {
    props = props || {}; return {
        tier, min, max, props
    };
}
function autoLoot(type, count, props) {
    props = props || {}; return { type, count, props };
}

function randomObstacleType(types) {
    // types is a table of {
    //   'mapObject1': weight1,
    //   'mapObject2': weight2
    // }, with '' representing no spawn
    const arr = [];
    for (const key in types) {
        if (types[key]) {
            arr.push({ type: key, weight: types[key] });
        }
    }
    if (arr.length === 0) { throw new Error("Invalid obstacle types"); }
    let total = 0.0;
    for (let i = 0; i < arr.length; i++) {
        total += arr[i].weight;
    }
    return function() {
        let rng = util.random(0, total);
        let idx = 0;
        while (rng > arr[idx].weight) {
            rng -= arr[idx].weight; idx++;
        } return arr[idx].type;
    };
}

function wallImg(img, tint = 0xffffff, alpha = 1, zIdx = 10) {
    return {
        sprite: img, scale: 0.5, alpha, tint, zIdx
    };
}

function createBarrel(params) {
    const baseDef = {
        type: "obstacle",
        obstacleType: "barrel",
        scale: { createMin: 1, createMax: 1, destroy: 0.6 },
        collision: collider.createCircle(v2.create(0, 0), 1.75),
        height: 0.5,
        collidable: !0,
        destructible: !0,
        explosion: "explosion_barrel",
        health: 150,
        hitParticle: "barrelChip",
        explodeParticle: "barrelBreak",
        reflectBullets: !0,
        loot: [],
        map: { display: !0, color: 6447714, scale: 1 },
        terrain: { grass: !0, beach: !0 },
        img: {
            sprite: "map-barrel-01.img",
            scale: 0.4,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "barrel_bullet",
            punch: "barrel_bullet",
            explode: "barrel_break_01",
            enter: "none"
        }
    };
    return util.mergeDeep(baseDef, params || {});
}
function l(e) {
    const t = {
        type: "obstacle",
        obstacleType: "barrel",
        scale: { createMin: 1, createMax: 1, destroy: 0.8 },
        collision: collider.createCircle(v2.create(0, 0), 1.75),
        height: 0.5,
        collidable: !0,
        destructible: !0,
        health: 20,
        hitParticle: "outhouseChip",
        explodeParticle: "barrelPlank",
        reflectBullets: !1,
        loot: [tierLoot("tier_world", 1, 1)],
        map: { display: !0, color: 11235106, scale: 1 },
        terrain: { grass: !0, beach: !0 },
        img: {
            sprite: "map-barrel-02.img",
            residue: "map-barrel-res-02.img",
            scale: 0.4,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "wood_crate_bullet",
            punch: "wood_crate_bullet",
            explode: "barrel_break_02",
            enter: "none"
        }
    };
    return util.mergeDeep(t, e || {});
}
function c(e) {
    const t = {
        type: "obstacle",
        obstacleType: "furniture",
        scale: { createMin: 1, createMax: 1, destroy: 0.9 },
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(2.8, 3.4)
        ),
        height: 0.5,
        collidable: !0,
        destructible: !0,
        health: 100,
        hitParticle: "clothHit",
        explodeParticle: ["woodPlank", "clothBreak"],
        reflectBullets: !1,
        loot: [],
        map: { display: !0, color: 6697728, scale: 0.875 },
        terrain: { grass: !0, beach: !0 },
        img: {
            sprite: "map-bed-02.img",
            residue: "map-bed-res-01.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "cloth_bullet",
            punch: "cloth_punch",
            explode: "cloth_break_01",
            enter: "none"
        }
    };
    return util.mergeDeep(t, e || {});
}
function m(e) {
    const t = {
        type: "obstacle",
        obstacleType: "furniture",
        scale: { createMin: 1, createMax: 1, destroy: 0.75 },
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(3.5, 1)
        ),
        height: 0.5,
        collidable: !0,
        destructible: !0,
        health: 75,
        hitParticle: "woodChip",
        explodeParticle: ["woodPlank", "book"],
        reflectBullets: !1,
        loot: [tierLoot("tier_world", 1, 1)],
        map: { display: !1, color: 6697728, scale: 0.875 },
        terrain: { grass: !1, beach: !0 },
        img: {
            sprite: "map-bookshelf-01.img",
            residue: "map-drawers-res.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "wood_prop_bullet",
            punch: "wood_prop_bullet",
            explode: "drawers_break_01",
            enter: "none"
        }
    };
    return util.mergeDeep(t, e || {});
}
function p(e) {
    const t = {
        type: "building",
        map: {
            display: !0,
            shapes: [
                {
                    collider: collider.createAabbExtents(
                        v2.create(0, 1),
                        v2.create(2, 3.25)
                    ),
                    color: 3815994
                }
            ]
        },
        terrain: { grass: !0, beach: !1 },
        zIdx: 1,
        floor: {
            surfaces: [
                {
                    type: "container",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 1),
                            v2.create(2, 3.25)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-generic-floor-02.img",
                    pos: v2.create(0, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 0.75),
                        v2.create(2, 3.25)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-generic-ceiling-01.img",
                    pos: v2.create(0, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 0
                }
            ]
        },
        mapObjects: [
            {
                type: "metal_wall_ext_6",
                pos: v2.create(0, -2.2),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_7",
                pos: v2.create(-2.5, 1),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_7",
                pos: v2.create(2.5, 1),
                scale: 1,
                ori: 0
            }
        ]
    };
    return util.mergeDeep(t, e || {});
}
function h(e) {
    const t = {
        type: "building",
        ori: 0,
        terrain: {},
        zIdx: 2,
        floor: {
            surfaces: [
                {
                    type: "container",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(-0.5, 0),
                            v2.create(3.25, 2)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-generic-floor-01.img",
                    pos: v2.create(0, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 3
                }
            ]
        },
        ceiling: { zoomRegions: [], imgs: [] },
        mapObjects: [
            {
                type: "metal_wall_ext_short_6",
                pos: v2.create(2.2, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_short_7",
                pos: v2.create(-1, 2.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_short_7",
                pos: v2.create(-1, -2.5),
                scale: 1,
                ori: 1
            },
            {
                type: e.statue,
                pos: v2.create(-1, 0),
                scale: 1,
                ori: 0
            }
        ]
    };
    return util.mergeDeep(t, e || {});
}
function d(e) {
    const t = {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 0,
        floor: {
            surfaces: [
                {
                    type: "bunker",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(6.5, 0),
                            v2.create(4, 3)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-statue-chamber-floor-01.img",
                    pos: v2.create(3.5, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 3
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(6.5, 0),
                        v2.create(4, 3)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "",
                    scale: 1,
                    alpha: 1,
                    tint: 16777215
                }
            ],
            vision: { dist: 5, width: 3 }
        },
        mapObjects: [
            {
                type: "concrete_wall_ext_6",
                pos: v2.create(-4, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_15",
                pos: v2.create(3, 3.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_15",
                pos: v2.create(3, -3.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_10",
                pos: v2.create(12, 0),
                scale: 1,
                ori: 0
            },
            {
                type: e.crate,
                pos: v2.create(8.5, 0),
                scale: 0.75,
                ori: 0,
                inheritOri: !1
            }
        ]
    };
    return util.mergeDeep(t, e || {});
}
function u(e) {
    const t = {
        type: "obstacle",
        scale: { createMin: 1.05, createMax: 1.2, destroy: 1 },
        collision: collider.createCircle(v2.create(0, 0), 1.4),
        height: 10,
        collidable: !1,
        destructible: !0,
        health: 100,
        hitParticle: "leaf",
        explodeParticle: "leaf",
        reflectBullets: !1,
        isBush: !0,
        loot: [],
        map: { display: !0, color: 24320, scale: 1.5 },
        terrain: { grass: !0, beach: !1 },
        img: {
            sprite: "map-bush-01.img",
            residue: "map-bush-res-01.img",
            scale: 0.5,
            alpha: 0.97,
            tint: 16777215,
            zIdx: 60
        },
        sound: {
            bullet: "bush_bullet",
            punch: "bush_bullet",
            explode: "bush_break_01",
            enter: "bush_enter_01"
        }
    };
    return util.mergeDeep(t, e || {});
}
function g(e) {
    const t = {
        type: "building",
        map: { displayType: "stone_02" },
        terrain: { grass: !0, beach: !1 },
        ori: 0,
        floor: {
            surfaces: [],
            imgs: [
                {
                    sprite: "",
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: { zoomRegions: [], imgs: [] },
        mapObjects: [
            {
                type: "stone_02",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_initiative_01",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0,
                inheritOri: !1
            }
        ]
    };
    return util.mergeDeep(t, e || {});
}
function y(e) {
    const t = {
        type: "obstacle",
        obstacleType: "crate",
        scale: { createMin: 1, createMax: 1, destroy: 0.8 },
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(2.25, 1.6)
        ),
        height: 0.5,
        collidable: !0,
        destructible: !0,
        health: 75,
        hitParticle: "woodChip",
        explodeParticle: "woodPlank",
        reflectBullets: !1,
        loot: [],
        map: { display: !1, color: 6697728, scale: 0.875 },
        terrain: { grass: !1, beach: !0 },
        img: {
            sprite: "map-case-deagle-01.img",
            residue: "map-crate-res-01.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "wood_crate_bullet",
            punch: "wood_crate_bullet",
            explode: "crate_break_01",
            enter: "none"
        }
    };
    return util.mergeDeep(t, e || {});
}
function w(e) {
    const t = {
        type: "obstacle",
        obstacleType: "crate",
        scale: { createMin: 1, createMax: 1, destroy: 0.75 },
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(2.25, 1.6)
        ),
        height: 0.5,
        collidable: !0,
        destructible: !0,
        health: 140,
        hitParticle: "woodChip",
        explodeParticle: "woodPlank",
        reflectBullets: !1,
        loot: [tierLoot("tier_chest", 3, 4)],
        map: { display: !1, color: 6697728, scale: 0.875 },
        terrain: { grass: !1, beach: !0 },
        img: {
            sprite: "map-chest-01.img",
            residue: "map-crate-res-01.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "wood_crate_bullet",
            punch: "wood_crate_bullet",
            explode: "crate_break_01",
            enter: "none"
        }
    };
    return util.mergeDeep(t, e || {});
}
function f(e) {
    const t = w({
        collision: collider.createAabbExtents(
            v2.create(0, 0.8),
            v2.create(2.25, 0.8)
        ),
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(0, 0.8),
                v2.create(2.25, 1.6)
            )
        ],
        terrain: { river: { centerWeight: 1 } }
    });
    return util.mergeDeep(t, e || {});
}
function _(e) {
    const t = [
        {
            type: "container_wall_top",
            pos: v2.create(0, 7.95),
            scale: 1,
            ori: 0
        },
        {
            type: "container_wall_side",
            pos: v2.create(2.35, 2.1),
            scale: 1,
            ori: 0
        },
        {
            type: "container_wall_side",
            pos: v2.create(-2.35, 2.1),
            scale: 1,
            ori: 0
        },
        {
            type: e.loot_spawner_01 || "loot_tier_2",
            pos: v2.create(0, 3.25),
            scale: 1,
            ori: 0
        },
        {
            type:
                e.loot_spawner_02 ||
                randomObstacleType({ loot_tier_1: 2, "": 1 }),
            pos: v2.create(0, 0.05),
            scale: 1,
            ori: 0
        }
    ];
    const r = [
        {
            type: "container_wall_side_open",
            pos: v2.create(2.35, 0),
            scale: 1,
            ori: 0
        },
        {
            type: "container_wall_side_open",
            pos: v2.create(-2.35, 0),
            scale: 1,
            ori: 0
        },
        {
            type: "loot_tier_2",
            pos: v2.create(0, -0.05),
            scale: 1,
            ori: 0
        },
        {
            type: randomObstacleType({ loot_tier_1: 1, "": 1 }),
            pos: v2.create(0, 0.05),
            scale: 1,
            ori: 0
        }
    ];
    return {
        type: "building",
        map: {
            display: !0,
            color: e.mapTint || 2703694,
            scale: 1
        },
        terrain: { grass: !0, beach: !0, riverShore: !0 },
        zIdx: 1,
        floor: {
            surfaces: [
                {
                    type: "container",
                    collision: [
                        e.open
                            ? collider.createAabbExtents(
                                v2.create(0, 0),
                                v2.create(2.5, 11)
                            )
                            : collider.createAabbExtents(
                                v2.create(0, 0),
                                v2.create(2.5, 8)
                            )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: e.open
                        ? "map-building-container-open-floor.img"
                        : "map-building-container-floor-01.img",
                    scale: 0.5,
                    alpha: 1,
                    tint: e.tint
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: e.open
                        ? collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(2.5, 5.75)
                        )
                        : collider.createAabbExtents(
                            v2.create(0, 2.25),
                            v2.create(2.5, 5.5)
                        ),
                    zoomOut: e.open
                        ? collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(2.5, 11)
                        )
                        : collider.createAabbExtents(
                            v2.create(0, -0.5),
                            v2.create(2.5, 8.75)
                        )
                }
            ],
            imgs: e.ceilingImgs || [
                {
                    sprite: e.ceilingSprite,
                    scale: 0.5,
                    alpha: 1,
                    tint: e.tint
                }
            ]
        },
        mapObjects: e.open ? r : t
    };
}
function b(e) {
    const t = {
        type: "obstacle",
        obstacleType: "furniture",
        scale: { createMin: 1, createMax: 1, destroy: 0.85 },
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(4.5, 1.5)
        ),
        height: 0.5,
        collidable: !0,
        destructible: !0,
        health: 125,
        hitParticle: "clothHit",
        explodeParticle: ["woodPlank", "clothBreak"],
        reflectBullets: !1,
        loot: [],
        map: { display: !1, color: 6697728, scale: 0.875 },
        terrain: { grass: !1, beach: !0 },
        img: {
            sprite: "map-couch-01.img",
            residue: "map-couch-res-01.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "cloth_bullet",
            punch: "cloth_punch",
            explode: "cloth_break_01",
            enter: "none"
        }
    };
    return util.mergeDeep(t, e || {});
}
function x(e) {
    const t = {
        type: "obstacle",
        obstacleType: "crate",
        scale: { createMin: 1, createMax: 1, destroy: 0.5 },
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(2.25, 2.25)
        ),
        height: 0.5,
        collidable: !0,
        destructible: !0,
        health: 75,
        hitParticle: "woodChip",
        explodeParticle: "woodPlank",
        reflectBullets: !1,
        loot: [tierLoot("tier_world", 1, 1)],
        map: { display: !0, color: 6697728, scale: 0.875 },
        terrain: { grass: !0, beach: !0, riverShore: !0 },
        img: {
            sprite: "map-crate-01.img",
            residue: "map-crate-res-01.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "wood_crate_bullet",
            punch: "wood_crate_bullet",
            explode: "crate_break_02",
            enter: "none"
        }
    };
    return util.mergeDeep(t, e || {});
}
function S(e) {
    const t = {
        obstacleType: "airdrop",
        dropCollision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(2.5, 2.5)
        ),
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(2.5, 2.5)
        ),
        airdropCrate: !0,
        scale: { destroy: 1 },
        destructible: !1,
        health: 200,
        hitParticle: "barrelChip",
        explodeParticle: "airdropCrate02",
        reflectBullets: !0,
        loot: [],
        map: { display: !1 },
        button: {
            interactionRad: 1,
            interactionText: "game-unlock",
            useOnce: !0,
            destroyOnUse: !0,
            useDelay: 2.5,
            useDir: v2.create(-1, 0),
            useImg: "map-airdrop-04.img",
            useParticle: "airdropCrate03",
            sound: { on: "airdrop_open_01", off: "" }
        },
        sound: {
            bullet: "wall_bullet",
            punch: "metal_punch",
            explode: "airdrop_open_02"
        }
    };
    return util.mergeDeep(x(t), e || {});
}
function v(e) {
    const t = {
        type: "obstacle",
        obstacleType: "crate",
        scale: { createMin: 1, createMax: 1, destroy: 0.75 },
        collision: collider.createCircle(v2.create(0, 0), 2.1),
        height: 0.5,
        collidable: !0,
        destructible: !0,
        health: 150,
        hitParticle: "woodChip",
        explodeParticle: "woodPlank",
        reflectBullets: !1,
        loot: [tierLoot("tier_world", 1, 1)],
        map: { display: !1 },
        terrain: { grass: !0, beach: !0, riverShore: !0 },
        img: {
            sprite: "map-class-crate-01.img",
            residue: "map-class-crate-res-01.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "wood_crate_bullet",
            punch: "wood_crate_bullet",
            explode: "crate_break_01",
            enter: "none"
        }
    };
    return util.mergeDeep(t, e || {});
}
function k(e) {
    const t = {
        type: "obstacle",
        obstacleType: "locker",
        scale: { createMin: 1, createMax: 1, destroy: 1 },
        collision: collider.createAabbExtents(
            v2.create(0, 0.15),
            v2.create(2.5, 1)
        ),
        height: 10,
        collidable: !0,
        destructible: !0,
        health: 20,
        hitParticle: "barrelChip",
        explodeParticle: "depositBoxGreyBreak",
        reflectBullets: !0,
        loot: [tierLoot("tier_world", 1, 1)],
        lootSpawn: { offset: v2.create(0, -1), speedMult: 0 },
        map: { display: !1, color: 6697728, scale: 0.875 },
        terrain: { grass: !1, beach: !0 },
        img: {
            sprite: "map-deposit-box-01.img",
            residue: "none",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "wall_bullet",
            punch: "metal_punch",
            explode: "deposit_box_break_01",
            enter: "none"
        }
    };
    return util.mergeDeep(t, e || {});
}
function z(e) {
    const t = {
        type: "obstacle",
        scale: { createMin: 1, createMax: 1, destroy: 1 },
        collision: collider.createAabbExtents(e.hinge, e.extents),
        height: 10,
        collidable: !0,
        destructible: !0,
        health: 150,
        hitParticle: "whiteChip",
        explodeParticle: "whitePlank",
        reflectBullets: !1,
        door: {
            interactionRad: 0.75,
            canUse: !0,
            openSpeed: 2,
            openOneWay: 0,
            openDelay: 0,
            openOnce: !1,
            autoOpen: !1,
            autoClose: !1,
            autoCloseDelay: 1,
            slideToOpen: !1,
            slideOffset: 3.5,
            spriteAnchor: v2.create(0.5, 1),
            sound: {
                open: e.soundOpen || "door_open_01",
                close: e.soundClose || "door_close_01",
                change: "",
                error: ""
            }
        },
        loot: [],
        img: {
            sprite: "map-door-01.img",
            residue: "none",
            scale: 0.5,
            alpha: 1,
            tint: 14671839,
            zIdx: 15
        },
        sound: {
            bullet: "wall_wood_bullet",
            punch: "wall_wood_bullet",
            explode: "wall_break_01",
            enter: "none"
        }
    };
    if (!MaterialDefs[e.material]) { throw new Error(`Invalid material ${e.material}`); }
    return util.mergeDeep(t, MaterialDefs[e.material], e || {});
}
function I(e) {
    const t = z({
        material: "concrete",
        hinge: v2.create(0, 2),
        extents: v2.create(0.3, 2),
        door: {
            interactionRad: 2,
            openOneWay: !1,
            openSpeed: 7,
            autoOpen: !0,
            autoClose: !0,
            autoCloseDelay: 1,
            slideToOpen: !0,
            slideOffset: 3.75,
            sound: {
                open: "door_open_03",
                close: "door_close_03",
                error: "door_error_01"
            },
            casingImg: {
                sprite: "map-door-slot-01.img",
                pos: v2.create(-2, 0),
                scale: 0.5,
                alpha: 1,
                tint: 1316379
            }
        },
        img: { tint: 5373952 }
    });
    return util.mergeDeep(t, e || {});
}
function T(e) {
    const t = {
        type: "obstacle",
        obstacleType: "furniture",
        scale: { createMin: 1, createMax: 1, destroy: 0.75 },
        collision: collider.createAabbExtents(
            v2.create(0, 0.15),
            v2.create(2.5, 1.25)
        ),
        height: 0.5,
        collidable: !0,
        destructible: !0,
        health: 75,
        hitParticle: "woodChip",
        explodeParticle: "woodPlank",
        reflectBullets: !1,
        loot: [tierLoot("tier_container", 1, 1)],
        map: { display: !1, color: 6697728, scale: 0.875 },
        terrain: { grass: !1, beach: !0 },
        img: {
            sprite: "map-drawers-01.img",
            residue: "map-drawers-res.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "wood_prop_bullet",
            punch: "wood_prop_bullet",
            explode: "drawers_break_01",
            enter: "none"
        }
    };
    return util.mergeDeep(t, e || {});
}
function M(e) {
    const t = {
        type: "obstacle",
        obstacleType: "furniture",
        scale: { createMin: 1, createMax: 1, destroy: 0.9 },
        collision: collider.createAabbExtents(
            v2.create(0, 0.2),
            v2.create(2.25, 0.7)
        ),
        height: 0.5,
        collidable: !0,
        destructible: !0,
        health: 50,
        hitParticle: "woodChip",
        explodeParticle: "woodPlank",
        reflectBullets: !1,
        loot: [tierLoot("tier_world", 1, 1)],
        lootSpawn: { offset: v2.create(0, -1), speedMult: 0 },
        map: { display: !1, color: 6697728, scale: 0.875 },
        terrain: { grass: !1, beach: !0 },
        img: {
            sprite: "map-gun-mount-01.img",
            residue: "map-drawers-res.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "wood_prop_bullet",
            punch: "wood_prop_bullet",
            explode: "barrel_break_02",
            enter: "none"
        }
    };
    return util.mergeDeep(t, e || {});
}
function P(e) {
    const t = {
        type: "obstacle",
        obstacleType: "locker",
        scale: { createMin: 1, createMax: 1, destroy: 1 },
        collision: collider.createAabbExtents(
            v2.create(0, 0.15),
            v2.create(1.5, 0.6)
        ),
        height: 10,
        collidable: !0,
        destructible: !0,
        health: 20,
        hitParticle: "barrelChip",
        explodeParticle: "lockerBreak",
        reflectBullets: !0,
        loot: [tierLoot("tier_world", 1, 1)],
        lootSpawn: { offset: v2.create(0, -1), speedMult: 0 },
        map: { display: !1, color: 6697728, scale: 0.875 },
        terrain: { grass: !1, beach: !0 },
        img: {
            sprite: "map-locker-01.img",
            residue: "",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "wall_bullet",
            punch: "metal_punch",
            explode: "deposit_box_break_01",
            enter: "none"
        }
    };
    return util.mergeDeep(t, e || {});
}
function C(e) {
    const t = {
        type: "obstacle",
        scale: { createMin: 1, createMax: 1, destroy: 0.8 },
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(1, 1)
        ),
        height: 0.5,
        collidable: !0,
        destructible: !0,
        explosion: "explosion_barrel",
        health: 250,
        hitParticle: "barrelChip",
        explodeParticle: "depositBoxGreyBreak",
        reflectBullets: !0,
        loot: [],
        map: { display: !1 },
        terrain: { grass: !1, beach: !0 },
        img: {
            sprite: "map-power-box-01.img",
            residue: "",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "wall_bullet",
            punch: "metal_punch",
            explode: "deposit_box_break_01",
            enter: "none"
        }
    };
    return util.mergeDeep(t, e || {});
}
function A(e) {
    const t = {
        type: "obstacle",
        obstacleType: "furniture",
        scale: { createMin: 1, createMax: 1, destroy: 0.75 },
        collision: collider.createAabbExtents(
            v2.create(0, 0.15),
            v2.create(1.7, 1.3)
        ),
        height: 0.5,
        collidable: !0,
        destructible: !0,
        explosion: "explosion_barrel",
        health: 200,
        hitParticle: "barrelChip",
        explodeParticle: "barrelBreak",
        reflectBullets: !0,
        loot: [],
        map: { display: !1, color: 14935011, scale: 0.875 },
        terrain: { grass: !0, beach: !0 },
        img: {
            sprite: "map-oven-01.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "barrel_bullet",
            punch: "barrel_bullet",
            explode: "oven_break_01",
            enter: "none"
        }
    };
    return util.mergeDeep(t, e || {});
}
function O(e) {
    const t = {
        type: "obstacle",
        obstacleType: "pot",
        scale: { createMin: 1, createMax: 1, destroy: 0.75 },
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(2.25, 4.25)
        ),
        height: 0.5,
        collidable: !0,
        destructible: !0,
        health: 100,
        hitParticle: "woodChip",
        explodeParticle: "woodPlank",
        reflectBullets: !1,
        loot: [tierLoot("tier_world", 1, 1)],
        map: { display: !0, color: 6697728, scale: 0.875 },
        terrain: { grass: !0, beach: !0, riverShore: !0 },
        img: {
            sprite: "map-planter-01.img",
            residue: "map-planter-res-01.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "toilet_porc_bullet",
            punch: "toilet_porc_bullet",
            explode: "ceramic_break_01",
            enter: "none"
        }
    };
    return util.mergeDeep(t, e || {});
}
function D(e) {
    const t = {
        type: "obstacle",
        obstacleType: "pot",
        scale: { createMin: 1, createMax: 1, destroy: 0.8 },
        collision: collider.createCircle(v2.create(0, 0), 1.5),
        height: 0.5,
        collidable: !0,
        destructible: !0,
        health: 50,
        hitParticle: "potChip",
        explodeParticle: "potBreak",
        reflectBullets: !1,
        loot: [tierLoot("tier_world", 1, 1)],
        map: { display: !0, color: 6697728, scale: 1 },
        terrain: { grass: !0, beach: !0 },
        img: {
            sprite: "map-pot-01.img",
            residue: "map-pot-res-01.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "toilet_porc_bullet",
            punch: "toilet_porc_bullet",
            explode: "toilet_break_01",
            enter: "none"
        }
    };
    return util.mergeDeep(t, e || {});
}
function E(e) {
    const t = {
        type: "obstacle",
        scale: { createMin: 1, createMax: 1, destroy: 0.8 },
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(0.5, 0.5)
        ),
        height: 0.3,
        collidable: !0,
        destructible: !1,
        health: 50,
        hitParticle: "bottleBlueChip",
        explodeParticle: "bottleBlueBreak",
        reflectBullets: !1,
        loot: [],
        map: { display: !0, color: 6697728, scale: 1 },
        terrain: { grass: !0, beach: !0 },
        img: {
            sprite: "map-bottle-02.img",
            residue: "none",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "glass_bullet",
            punch: "glass_bullet",
            explode: "window_break_01",
            enter: "none"
        },
        button: {
            interactionRad: 1.25,
            interactionText: "game-use",
            useOnce: !0,
            useType: "",
            useDelay: 0.25,
            useDir: v2.create(-1, 0),
            useImg: "map-bottle-03.img",
            sound: {
                on: "button_press_01",
                off: "button_press_01"
            }
        }
    };
    return util.mergeDeep(t, e || {});
}
function B(e) {
    const t = {
        type: "obstacle",
        scale: { createMin: 1, createMax: 1, destroy: 0.8 },
        collision: collider.createCircle(v2.create(0, 0), 1.1),
        height: 0.5,
        collidable: !0,
        destructible: !0,
        health: 100,
        hitParticle: "potatoChip",
        explodeParticle: "potatoBreak",
        reflectBullets: !1,
        swapWeaponOnDestroy: !0,
        regrow: !0,
        regrowTimer: 60,
        loot: [tierLoot("tier_potato_perks", 1, 1)],
        map: { display: !1, color: 9466197, scale: 1 },
        terrain: { grass: !0, beach: !0, riverShore: !0 },
        img: {
            sprite: "map-potato-01.img",
            residue: "map-potato-res-01.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "organic_hit",
            punch: "organic_hit",
            explode: "pumpkin_break_01",
            enter: "none"
        }
    };
    return util.mergeDeep(t, e || {});
}
function R(e) {
    const t = {
        type: "obstacle",
        scale: { createMin: 1, createMax: 1, destroy: 0.8 },
        collision: collider.createCircle(v2.create(0, 0), 1.9),
        height: 0.5,
        collidable: !0,
        destructible: !0,
        health: 100,
        reflectBullets: !1,
        isDecalAnchor: !0,
        hitParticle: "pumpkinChip",
        explodeParticle: "pumpkinBreak",
        loot: [tierLoot("tier_outfits", 1, 1)],
        map: { display: !0, color: 15889667, scale: 1 },
        terrain: { grass: !0, beach: !1, riverShore: !0 },
        img: {
            sprite: "map-pumpkin-01.img",
            residue: "map-pumpkin-res-01.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "organic_hit",
            punch: "organic_hit",
            explode: "pumpkin_break_01",
            enter: "none"
        }
    };
    return util.mergeDeep(t, e || {});
}
function L(e) {
    const t = {
        type: "obstacle",
        scale: { createMin: 1, createMax: 1, destroy: 0.8 },
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(0.9, 1.5)
        ),
        height: 0.5,
        collidable: !0,
        destructible: !1,
        explosion: "explosion_barrel",
        health: 250,
        hitParticle: "barrelChip",
        explodeParticle: "depositBoxGreyBreak",
        reflectBullets: !0,
        loot: [],
        map: { display: !1 },
        terrain: { grass: !1, beach: !0 },
        img: {
            sprite: "map-recorder-01.img",
            residue: "",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 9
        },
        sound: {
            bullet: "wall_bullet",
            punch: "metal_punch",
            explode: "deposit_box_break_01",
            enter: "none"
        },
        button: {
            interactionRad: 0.2,
            interactionText: "game-use",
            useOnce: !0,
            useType: "",
            useDelay: 0.25,
            useDir: v2.create(-1, 0),
            useImg: "map-recorder-02.img",
            sound: { on: "", off: "" }
        }
    };
    return util.mergeDeep(t, e || {});
}
function q(e) {
    const t = {
        type: "obstacle",
        scale: { createMin: 1, createMax: 1, destroy: 0.75 },
        collision: collider.createAabbExtents(
            v2.create(0, 0.15),
            v2.create(1.7, 1.25)
        ),
        height: 0.5,
        collidable: !0,
        destructible: !1,
        health: 100,
        hitParticle: "redChip",
        explodeParticle: "woodPlank",
        reflectBullets: !0,
        loot: [],
        map: { display: !1, color: 7733259, scale: 0.875 },
        terrain: { grass: !0, beach: !0 },
        img: {
            sprite: "map-refrigerator-01.img",
            residue: "map-crate-res-01.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "wall_bullet",
            punch: "metal_punch",
            explode: "barrel_break_01",
            enter: "none"
        }
    };
    return util.mergeDeep(t, e || {});
}
function F(e) {
    const t = {
        type: "obstacle",
        map: { display: !0, color: 13278307, scale: 1 },
        scale: { createMin: 1, createMax: 1, destroy: 0.5 },
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(3.1, 1.4)
        ),
        height: 0.5,
        collidable: !0,
        destructible: !1,
        health: 150,
        hitParticle: "goldChip",
        explodeParticle: "barrelBreak",
        reflectBullets: !1,
        loot: [],
        img: {
            sprite: "map-sandbags-01.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "wall_brick_bullet",
            punch: "wall_brick_bullet",
            explode: "crate_break_02",
            enter: "none"
        }
    };
    return util.mergeDeep(t, e || {});
}
function j(e) {
    const t = {
        type: "obstacle",
        scale: { createMin: 1, createMax: 1, destroy: 1 },
        collision: collider.createCircle(v2.create(0, 0), 7.75),
        height: 10,
        collidable: !0,
        destructible: !1,
        health: 300,
        hitParticle: "barrelChip",
        explodeParticle: "barrelBreak",
        reflectBullets: !0,
        loot: [],
        map: { display: !0, color: 4079166, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        img: {
            sprite: "map-silo-01.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "silo_bullet",
            punch: "silo_bullet",
            explode: "barrel_break_01",
            enter: "none"
        }
    };
    return util.mergeDeep(t, e || {});
}
function N(e) {
    const t = {
        type: "obstacle",
        scale: { createMin: 1, createMax: 1.2, destroy: 0.5 },
        collision: collider.createCircle(v2.create(0, 0), 1.6),
        height: 0.5,
        collidable: !0,
        destructible: !0,
        health: 250,
        reflectBullets: !1,
        hitParticle: "rockChip",
        explodeParticle: "rockBreak",
        loot: [],
        map: { display: !0, color: 11776947, scale: 1 },
        terrain: { grass: !0, beach: !1, riverShore: !0 },
        img: {
            sprite: "map-stone-01.img",
            residue: "map-stone-res-01.img",
            scale: 0.4,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "stone_bullet",
            punch: "stone_bullet",
            explode: "stone_break_01",
            enter: "none"
        }
    };
    return util.mergeDeep(t, e || {});
}
function H(e) {
    const t = {
        type: "obstacle",
        scale: { createMin: 0.8, createMax: 1.2, destroy: 0.5 },
        collision: collider.createCircle(v2.create(0, 0), 2.9),
        height: 0.5,
        collidable: !0,
        destructible: !0,
        health: 500,
        reflectBullets: !1,
        hitParticle: "rockChip",
        explodeParticle: "rockBreak",
        loot: [],
        map: { display: !0, color: 5197647, scale: 1 },
        terrain: {
            grass: !1,
            beach: !1,
            river: { centerWeight: 0.5 },
            riverShore: !1
        },
        img: {
            sprite: "map-stone-03.img",
            residue: "map-stone-res-02.img",
            scale: 0.4,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "stone_bullet",
            punch: "stone_bullet",
            explode: "stone_break_01",
            enter: "none"
        }
    };
    return util.mergeDeep(t, e || {});
}
function V(e) {
    const t = {
        type: "obstacle",
        obstacleType: "furniture",
        scale: { createMin: 1, createMax: 1, destroy: 0.75 },
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(2.5, 2)
        ),
        height: 0.5,
        collidable: !1,
        destructible: !0,
        health: 100,
        hitParticle: "woodChip",
        explodeParticle: "woodPlank",
        reflectBullets: !1,
        loot: [],
        map: { display: !1, color: 6697728, scale: 0.875 },
        terrain: { grass: !0, beach: !0 },
        img: {
            sprite: "map-table-01.img",
            residue: "map-table-res.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 60
        },
        sound: {
            bullet: "wood_prop_bullet",
            punch: "wood_prop_bullet",
            explode: "crate_break_01",
            enter: "none"
        }
    };
    return util.mergeDeep(t, e || {});
}
function U(e) {
    const t = {
        type: "obstacle",
        obstacleType: "toilet",
        scale: { createMin: 1, createMax: 1, destroy: 0.8 },
        collision: collider.createCircle(v2.create(0, 0.25), 1.18),
        height: 0.5,
        collidable: !0,
        destructible: !0,
        health: 100,
        reflectBullets: !1,
        hitParticle: "whiteChip",
        explodeParticle: "toiletBreak",
        loot: [tierLoot("tier_toilet", 2, 3)],
        map: { display: !1, color: 11776947, scale: 1 },
        img: {
            sprite: "map-toilet-01.img",
            residue: "map-toilet-res-01.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "toilet_porc_bullet",
            punch: "toilet_porc_bullet",
            explode: "toilet_break_01",
            enter: "none"
        },
        terrain: { grass: !0, beach: !1 }
    };
    return util.mergeDeep(t, e || {});
}
function W(e) {
    const t = {
        type: "obstacle",
        scale: { createMin: 0.8, createMax: 1, destroy: 0.5 },
        collision: collider.createCircle(v2.create(0, 0), 1.55),
        aabb: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(5.75, 5.75)
        ),
        height: 10,
        collidable: !0,
        destructible: !0,
        health: 175,
        hitParticle: "woodChip",
        explodeParticle: "woodLog",
        reflectBullets: !1,
        isTree: !0,
        loot: [],
        map: { display: !0, color: 4083758, scale: 2.5 },
        terrain: { grass: !0, beach: !1 },
        img: {
            sprite: "map-tree-03.img",
            residue: "map-tree-res-01.img",
            scale: 0.7,
            alpha: 1,
            tint: 16777215,
            zIdx: 800
        },
        sound: {
            bullet: "tree_bullet",
            punch: "tree_bullet",
            explode: "tree_break_01",
            enter: "none"
        }
    };
    return util.mergeDeep(t, e || {});
}
function G(e) {
    const t = {
        type: "obstacle",
        scale: { createMin: 1, createMax: 1, destroy: 0.75 },
        collision: collider.createCircle(v2.create(0, 0), 1.6),
        aabb: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(5.75, 5.75)
        ),
        button: {
            interactionRad: 0.2,
            interactionText: "game-use",
            useOnce: !0,
            useType: "",
            useDelay: 0.25,
            useDir: v2.create(-1, 0),
            useImg: "map-tree-switch-04.img",
            sound: {
                on: "button_press_01",
                off: "button_press_01"
            }
        },
        height: 0.5,
        collidable: !0,
        destructible: !1,
        health: 175,
        hitParticle: "woodChip",
        explodeParticle: "woodLog",
        reflectBullets: !1,
        loot: [],
        map: { display: !1, color: 8602624, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        img: {
            sprite: "map-tree-switch-01.img",
            residue: "map-tree-res-01.img",
            scale: 0.5,
            alpha: 1,
            zIdx: 10,
            tint: 16777215
        },
        sound: {
            bullet: "tree_bullet",
            punch: "tree_bullet",
            explode: "tree_break_01",
            enter: "none"
        }
    };
    return util.mergeDeep(t, e || {});
}
function X(e) {
    const t = {
        type: "obstacle",
        scale: { createMin: 1, createMax: 1, destroy: 1 },
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.copy(e.extents)
        ),
        height: 10,
        isWall: !0,
        collidable: !0,
        destructible: !0,
        health: e.health || 150,
        hitParticle: "woodChip",
        explodeParticle: "woodPlank",
        reflectBullets: !1,
        loot: [],
        map: { display: !1 },
        img: {},
        sound: {
            bullet: "wall_bullet",
            punch: "wall_bullet",
            explode: "barrel_break_01",
            enter: "none"
        }
    };
    if (!MaterialDefs[e.material]) { throw new Error(`Invalid material ${e.material}`); }
    return util.mergeDeep(t, MaterialDefs[e.material], e || {});
}
function K(e) {
    const t = {
        type: "obstacle",
        scale: { createMin: 1, createMax: 1, destroy: 1 },
        collision: collider.createCircle(v2.create(0, 2.3), 4.6),
        height: 10,
        collidable: !0,
        destructible: !1,
        health: 300,
        hitParticle: "barrelChip",
        explodeParticle: "barrelBreak",
        reflectBullets: !0,
        loot: [],
        map: { display: !1, color: 6310464, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        img: {
            sprite: "map-wheel-01.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "silo_bullet",
            punch: "silo_bullet",
            explode: "barrel_break_01",
            enter: "none"
        }
    };
    return util.mergeDeep(t, e || {});
}
function Z(e) {
    const t = {
        type: "obstacle",
        scale: { createMin: 1, createMax: 1, destroy: 0.75 },
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(1.5, 1.5)
        ),
        height: 0.5,
        collidable: !0,
        destructible: !0,
        health: 150,
        hitParticle: "woodChip",
        explodeParticle: "woodLog",
        reflectBullets: !1,
        loot: [],
        map: { display: !1, color: 9455616, scale: 0.875 },
        terrain: {},
        img: {
            sprite: "map-woodpile-01.img",
            residue: "map-woodpile-res-01.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "tree_bullet",
            punch: "tree_bullet",
            explode: "tree_break_01",
            enter: "none"
        }
    };
    return util.mergeDeep(t, e || {});
}
function Y(e) {
    const t = {
        type: "building",
        map: {
            display: !0,
            shapes: [
                {
                    collider: collider.createAabbExtents(
                        v2.create(-16, 7),
                        v2.create(10.75, 11)
                    ),
                    color: 7820585
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(6, 0),
                        v2.create(11.5, 18.25)
                    ),
                    color: 9989427
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(22, 4),
                        v2.create(4.5, 7.5)
                    ),
                    color: 7820585
                }
            ]
        },
        terrain: { grass: !0, beach: !1 },
        zIdx: 1,
        floor: {
            surfaces: [
                {
                    type: "tile",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(6, -1),
                            v2.create(11.25, 18.25)
                        ),
                        collider.createAabbExtents(
                            v2.create(21.5, 4),
                            v2.create(4.75, 7.25)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-building-bank-floor-01.img",
                    pos: v2.create(0, 6.96),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-bank-floor-02.img",
                    pos: v2.create(9.5, -12.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(6, -1),
                        v2.create(11.25, 18.25)
                    )
                },
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(21.5, 4),
                        v2.create(4.75, 7.25)
                    )
                },
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(-15, 6),
                        v2.create(10.75, 11)
                    ),
                    zoomOut: collider.createAabbExtents(
                        v2.create(6, 1.25),
                        v2.create(15.25, 20)
                    )
                }
            ],
            vision: {
                dist: 5.5,
                width: 2.75,
                linger: 0.5,
                fadeRate: 6
            },
            imgs: [
                {
                    sprite: "map-building-bank-ceiling-01.img",
                    pos: v2.create(-16, 7),
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-bank-ceiling-02.img",
                    pos: v2.create(6, 0),
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-bank-ceiling-03.img",
                    pos: v2.create(22, 8),
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        mapObjects: [
            {
                type: "brick_wall_ext_23",
                pos: v2.create(-14, 17),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_23",
                pos: v2.create(-25.9, 6),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_20",
                pos: v2.create(-15.5, -5),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_5",
                pos: v2.create(-5, -7),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_6",
                pos: v2.create(-5, -16.5),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_4",
                pos: v2.create(-2.5, -19),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_7",
                pos: v2.create(6, -19),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_4",
                pos: v2.create(14.5, -19),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_6",
                pos: v2.create(17, -16.5),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_7",
                pos: v2.create(17, -6),
                scale: 1,
                ori: 0
            },
            {
                type: "house_window_01",
                pos: v2.create(1, -19.25),
                scale: 1,
                ori: 1
            },
            {
                type: "house_window_01",
                pos: v2.create(11, -19.25),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_01",
                pos: v2.create(-5.25, -13.5),
                scale: 1,
                ori: 0
            },
            {
                type: "house_door_01",
                pos: v2.create(17.25, -13.5),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_9",
                pos: v2.create(22, -3),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_15",
                pos: v2.create(26, 4),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_9",
                pos: v2.create(22, 11),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_7",
                pos: v2.create(17, 14),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_4",
                pos: v2.create(14.5, 17),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_8",
                pos: v2.create(4.5, 17),
                scale: 1,
                ori: 1
            },
            {
                type: "house_window_01",
                pos: v2.create(-1, 17.25),
                scale: 1,
                ori: 1
            },
            {
                type: e.vault || "vault_01",
                pos: v2.create(-12, 6),
                scale: 1,
                ori: 0
            },
            {
                type: "bank_wall_int_4",
                pos: v2.create(-2.5, -5),
                scale: 1,
                ori: 1
            },
            {
                type: "bank_window_01",
                pos: v2.create(1, -5),
                scale: 1,
                ori: 1
            },
            {
                type: "bank_wall_int_3",
                pos: v2.create(4, -5),
                scale: 1,
                ori: 1
            },
            {
                type: "bank_wall_int_4",
                pos: v2.create(6, -3.5),
                scale: 1,
                ori: 0
            },
            {
                type: "bank_window_01",
                pos: v2.create(6, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "bank_wall_int_4",
                pos: v2.create(6, 3.5),
                scale: 1,
                ori: 0
            },
            {
                type: "bank_wall_int_4",
                pos: v2.create(8.5, 5),
                scale: 1,
                ori: 1
            },
            {
                type: "bank_window_01",
                pos: v2.create(12, 5),
                scale: 1,
                ori: 1
            },
            {
                type: "bank_wall_int_3",
                pos: v2.create(15, 5),
                scale: 1,
                ori: 1
            },
            {
                type: "bank_wall_int_5",
                pos: v2.create(17, 4),
                scale: 1,
                ori: 0
            },
            {
                type: "bank_wall_int_8",
                pos: v2.create(21.5, 4),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_01",
                pos: v2.create(17, -2.5),
                scale: 1,
                ori: 0
            },
            {
                type: "house_door_01",
                pos: v2.create(17, 10.5),
                scale: 1,
                ori: 2
            },
            {
                type: "house_door_01",
                pos: v2.create(12.5, 17.25),
                scale: 1,
                ori: 1
            },
            {
                type: "vending_01",
                pos: v2.create(4.5, -16.9),
                scale: 1,
                ori: 2
            },
            {
                type: "stand_01",
                pos: v2.create(7.65, -17),
                scale: 1,
                ori: 2
            },
            {
                type: randomObstacleType({ toilet_01: 5, toilet_02: 1 }),
                pos: v2.create(23.5, 0.5),
                scale: 1,
                ori: 3
            },
            {
                type: randomObstacleType({ toilet_01: 5, toilet_02: 1 }),
                pos: v2.create(23.5, 7.5),
                scale: 1,
                ori: 3
            },
            {
                type: "stand_01",
                pos: v2.create(15, 15),
                scale: 1,
                ori: 3
            },
            {
                type: "fire_ext_01",
                pos: v2.create(4.5, 16.15),
                scale: 1,
                ori: 3
            },
            {
                type: "bush_02",
                pos: v2.create(-2.5, -16.25),
                scale: 1,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "bush_02",
                pos: v2.create(14.5, -16.25),
                scale: 1,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "crate_01",
                pos: v2.create(19.75, 13.75),
                scale: 0.9,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ loot_tier_1: 1 }),
                pos: v2.create(12, 0),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ loot_tier_1: 1, "": 1 }),
                pos: v2.create(1, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "tree_01",
                pos: v2.create(-16.5, -12.5),
                scale: 1.1,
                ori: 0
            },
            {
                type: "barrel_01",
                pos: v2.create(-7.5, -7.25),
                scale: 0.85,
                ori: 0
            },
            {
                type: "tree_01",
                pos: v2.create(21, -7),
                scale: 0.55,
                ori: 0
            },
            {
                type: "tree_01",
                pos: v2.create(21, -16.25),
                scale: 0.55,
                ori: 0
            }
        ]
    };
    return util.mergeDeep(t, e || {});
}
function J(e) {
    const t = {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 2,
        floor: {
            surfaces: [
                {
                    type: "container",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(-3.5, 0),
                            v2.create(10, 10.5)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "",
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(-3.5, 0),
                        v2.create(9.25, 10.5)
                    ),
                    zoomOut: collider.createAabbExtents(
                        v2.create(-3.5, 0),
                        v2.create(10, 10.5)
                    )
                }
            ],
            vision: {
                dist: 7.25,
                width: 2.75,
                linger: 0.5,
                fadeRate: 6
            },
            imgs: [
                {
                    sprite: "map-building-vault-ceiling.img",
                    scale: 1,
                    alpha: 1,
                    tint: 6250335
                }
            ]
        },
        mapObjects: [
            {
                type: "metal_wall_ext_thick_20",
                pos: v2.create(-12.5, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thick_20",
                pos: v2.create(-3.5, -9.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thick_20",
                pos: v2.create(-3.5, 9.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thick_6",
                pos: v2.create(5.5, -6.45),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thick_6",
                pos: v2.create(5.5, 6.45),
                scale: 1,
                ori: 0
            },
            {
                type: "vault_door_main",
                pos: v2.create(6.5, 3.5),
                scale: 1,
                ori: 2
            },
            {
                type: randomObstacleType({
                    deposit_box_01: 3,
                    deposit_box_02: e.gold_box || 1
                }),
                pos: v2.create(-12.3, 5),
                scale: 1,
                ori: 1
            },
            {
                type: randomObstacleType({
                    deposit_box_01: 3,
                    deposit_box_02: e.gold_box || 1
                }),
                pos: v2.create(-12.3, -5),
                scale: 1,
                ori: 1
            },
            {
                type: randomObstacleType({
                    deposit_box_01: 3,
                    deposit_box_02: e.gold_box || 1
                }),
                pos: v2.create(-8, 9.3),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({
                    deposit_box_01: 3,
                    deposit_box_02: e.gold_box || 1
                }),
                pos: v2.create(-8, -9.3),
                scale: 1,
                ori: 2
            },
            {
                type: randomObstacleType({
                    deposit_box_01: 3,
                    deposit_box_02: e.gold_box || 1
                }),
                pos: v2.create(1, 9.3),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({
                    deposit_box_01: 3,
                    deposit_box_02: e.gold_box || 1
                }),
                pos: v2.create(1, -9.3),
                scale: 1,
                ori: 2
            },
            {
                type: "crate_05",
                pos: v2.create(-3.5, 6.5),
                scale: 1,
                ori: 0
            },
            {
                type: "crate_05",
                pos: v2.create(-3.5, -6.5),
                scale: 1,
                ori: 2
            },
            {
                type:
                    e.floor_loot ||
                    randomObstacleType({ loot_tier_vault_floor: 1 }),
                pos: v2.create(-3.5, 0),
                scale: 1,
                ori: 0
            }
        ]
    };
    return util.mergeDeep(t, e || {});
}
function Q(e) {
    const t = {
        type: "building",
        map: {
            display: !0,
            shapes: [
                {
                    collider: collider.createAabbExtents(
                        v2.create(0, 12),
                        v2.create(5, 2)
                    ),
                    color: 12300935
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(0, -2),
                        v2.create(24.5, 12.8)
                    ),
                    color: 3816739
                }
            ]
        },
        terrain: { grass: !0, beach: !1 },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(0, -2),
                v2.create(28, 16.5)
            ),
            collider.createAabbExtents(
                v2.create(0, 14),
                v2.create(7, 5)
            )
        ],
        zIdx: 1,
        floor: {
            surfaces: [
                {
                    type: "house",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, -2),
                            v2.create(25, 13.2)
                        ),
                        collider.createAabbExtents(
                            v2.create(0, 12),
                            v2.create(5.5, 2.5)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-building-barn-floor-01.img",
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, -2),
                        v2.create(24.5, 12.8)
                    )
                },
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 12),
                        v2.create(5.5, 2.5)
                    ),
                    zoomOut: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(5.5, 18.5)
                    )
                }
            ],
            vision: {
                dist: 5.5,
                width: 2.75,
                linger: 0.5,
                fadeRate: 6
            },
            imgs: [
                {
                    sprite: "map-building-barn-ceiling-01.img",
                    pos: v2.create(0, -2),
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-barn-ceiling-02.img",
                    pos: v2.create(0, 13.2),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        mapObjects: [
            {
                type: "brick_wall_ext_4",
                pos: v2.create(-24.5, 9),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_3",
                pos: v2.create(-22.5, 10.5),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_12",
                pos: v2.create(-24.5, -2),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_4",
                pos: v2.create(-24.5, -13),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_3",
                pos: v2.create(-22.5, -14.5),
                scale: 1,
                ori: 1
            },
            {
                type: "house_window_01",
                pos: v2.create(-24.75, 5.5),
                scale: 1,
                ori: 0
            },
            {
                type: "house_window_01",
                pos: v2.create(-24.75, -9.5),
                scale: 1,
                ori: 0
            },
            {
                type: "house_window_01",
                pos: v2.create(-19.5, 10.75),
                scale: 1,
                ori: 1
            },
            {
                type: "house_window_01",
                pos: v2.create(-19.5, -14.75),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_16",
                pos: v2.create(-10, 10.5),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_16",
                pos: v2.create(10, 10.5),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_16",
                pos: v2.create(-10, -14.5),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_6",
                pos: v2.create(5, -14.5),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_4",
                pos: v2.create(-5.5, 13),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_4",
                pos: v2.create(5.5, 13),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_3",
                pos: v2.create(-3.5, 14.5),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_3",
                pos: v2.create(3.5, 14.5),
                scale: 1,
                ori: 1
            },
            {
                type: "house_window_01",
                pos: v2.create(9.5, -14.75),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_01",
                pos: v2.create(2, 14.75),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_01",
                pos: v2.create(-2, -14.75),
                scale: 1,
                ori: 3
            },
            {
                type: "brick_wall_ext_4",
                pos: v2.create(24.5, 9),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_3",
                pos: v2.create(22.5, 10.5),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_13",
                pos: v2.create(17.5, -14.5),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_19",
                pos: v2.create(24.5, -5.5),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_1",
                pos: v2.create(23.5, -1.5),
                scale: 1,
                ori: 0
            },
            {
                type: "house_window_01",
                pos: v2.create(24.75, 5.5),
                scale: 1,
                ori: 0
            },
            {
                type: "house_window_01",
                pos: v2.create(19.5, 10.75),
                scale: 1,
                ori: 1
            },
            {
                type: e.bonus_room || "panicroom_01",
                pos: v2.create(19.5, -8),
                scale: 1,
                ori: 0
            },
            {
                type: "barn_wall_int_6",
                pos: v2.create(-21, 0.5),
                scale: 1,
                ori: 1
            },
            {
                type: "barn_wall_int_6",
                pos: v2.create(-21, -4.5),
                scale: 1,
                ori: 1
            },
            {
                type: "barn_wall_int_5",
                pos: v2.create(-11.5, 0.5),
                scale: 1,
                ori: 1
            },
            {
                type: "barn_wall_int_2",
                pos: v2.create(-13, -4.5),
                scale: 1,
                ori: 1
            },
            {
                type: "barn_wall_int_7",
                pos: v2.create(-6.5, -4.5),
                scale: 1,
                ori: 1
            },
            {
                type: "barn_wall_int_8",
                pos: v2.create(-11.5, -10),
                scale: 1,
                ori: 0
            },
            {
                type: "barn_wall_int_8",
                pos: v2.create(-7.5, 6),
                scale: 1,
                ori: 0
            },
            {
                type: "barn_wall_int_5",
                pos: v2.create(-3.5, -11.5),
                scale: 1,
                ori: 0
            },
            {
                type: "barn_wall_int_7",
                pos: v2.create(10.5, 0.5),
                scale: 1,
                ori: 1
            },
            {
                type: "barn_wall_int_5",
                pos: v2.create(14.5, 7.5),
                scale: 1,
                ori: 0
            },
            {
                type: "barn_wall_int_13",
                pos: v2.create(14.5, -7.5),
                scale: 1,
                ori: 0
            },
            {
                type: "barn_wall_int_4",
                pos: v2.create(17, -1.5),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_01",
                pos: v2.create(-18, -4.5),
                scale: 1,
                ori: 3
            },
            {
                type: "house_door_01",
                pos: v2.create(-18, 0.5),
                scale: 1,
                ori: 3
            },
            {
                type: "house_door_01",
                pos: v2.create(-3.5, -5),
                scale: 1,
                ori: 2
            },
            {
                type: "house_door_01",
                pos: v2.create(14.5, 1),
                scale: 1,
                ori: 0
            },
            {
                type: e.bonus_door,
                pos: v2.create(23, -1.5),
                scale: 1,
                ori: 1
            },
            {
                type: "barn_column_1",
                pos: v2.create(-8, 1),
                scale: 1,
                ori: 0
            },
            {
                type: "barn_column_1",
                pos: v2.create(-11, -5),
                scale: 1,
                ori: 0
            },
            {
                type: "barn_column_1",
                pos: v2.create(15, 0),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ toilet_01: 5, toilet_02: 1 }),
                pos: v2.create(-7.5, -12),
                scale: 1,
                ori: 2
            },
            {
                type: randomObstacleType({ drawers_01: 7, drawers_02: 1 }),
                pos: v2.create(-12.5, 8.5),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ drawers_01: 7, drawers_02: 1 }),
                pos: v2.create(-5.5, 7.25),
                scale: 1,
                ori: 1
            },
            {
                type: randomObstacleType({ drawers_01: 7, drawers_02: 1 }),
                pos: v2.create(-13.5, -9.5),
                scale: 1,
                ori: 3
            },
            {
                type: "stand_01",
                pos: v2.create(16.5, 8.5),
                scale: 1,
                ori: 0
            },
            {
                type: "stand_01",
                pos: v2.create(3.5, 12.5),
                scale: 1,
                ori: 3
            },
            {
                type: "table_01",
                pos: v2.create(8, -8),
                scale: 1,
                ori: 0
            },
            {
                type: "oven_01",
                pos: v2.create(12.25, -1.5),
                scale: 1,
                ori: 0
            },
            {
                type: "refrigerator_01",
                pos: v2.create(8.75, -1.5),
                scale: 1,
                ori: 0
            },
            {
                type: "bush_02",
                pos: v2.create(-22, -2),
                scale: 1,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "bush_02",
                pos: v2.create(12, 8),
                scale: 1,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: randomObstacleType({ loot_tier_1: 1, "": 1 }),
                pos: v2.create(-19, -9.5),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ loot_tier_1: 1, "": 1 }),
                pos: v2.create(-19, 5.5),
                scale: 1,
                ori: 0
            },
            {
                type: "loot_tier_1",
                pos: v2.create(0, 5.5),
                scale: 1,
                ori: 0
            },
            {
                type: e.porch_01 || "",
                pos: v2.create(-4, 17),
                scale: 0.9,
                ori: 2
            },
            {
                type: e.porch_01 || "",
                pos: v2.create(4, 17),
                scale: 0.9,
                ori: 2
            }
        ]
    };
    return util.mergeDeep(t, e || {});
}
function $(e) {
    const t = {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 0,
        floor: {
            surfaces: [
                {
                    type: "asphalt",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(-3, 0),
                            v2.create(12, 7)
                        ),
                        collider.createAabbExtents(
                            v2.create(12, -3.5),
                            v2.create(3, 2)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-building-barn-basement-floor-01.img",
                    pos: v2.create(5.5, -0.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(2, 0),
                        v2.create(6, 7)
                    )
                },
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(11, -3.5),
                        v2.create(3.5, 2)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-building-barn-basement-ceiling-01.img",
                    pos: v2.create(5, 0),
                    scale: 1,
                    alpha: 1,
                    tint: 6182731
                }
            ]
        },
        mapObjects: [
            {
                type: "house_door_02",
                pos: v2.create(13.5, 7),
                scale: 1,
                ori: 1
            },
            {
                type: "concrete_wall_ext_6",
                pos: v2.create(12.5, 6),
                scale: 1,
                ori: 1
            },
            {
                type: "concrete_wall_ext_thicker_11",
                pos: v2.create(15, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "concrete_wall_column_5x10",
                pos: v2.create(7, 2.5),
                scale: 1,
                ori: 0
            },
            {
                type: "concrete_wall_ext_thicker_21",
                pos: v2.create(-6, 6),
                scale: 1,
                ori: 1
            },
            {
                type: "concrete_wall_ext_thicker_13",
                pos: v2.create(-15, -2),
                scale: 1,
                ori: 0
            },
            {
                type: "concrete_wall_ext_thicker_30",
                pos: v2.create(1.5, -7),
                scale: 1,
                ori: 1
            },
            {
                type: "concrete_wall_ext_3",
                pos: v2.create(-4, 3),
                scale: 1,
                ori: 0
            },
            {
                type: "stone_wall_int_4",
                pos: v2.create(-4, -0.5),
                scale: 1,
                ori: 2
            },
            {
                type: "concrete_wall_ext_3",
                pos: v2.create(-4, -4),
                scale: 1,
                ori: 0
            },
            {
                type: "loot_tier_sledgehammer",
                pos: v2.create(0.5, -0.5),
                scale: 1,
                ori: 0
            },
            {
                type: "bookshelf_01",
                pos: v2.create(1, 3.5),
                scale: 1,
                ori: 0
            },
            {
                type: e.basement || "barn_basement_floor_02",
                pos: v2.create(-8, 0),
                scale: 1,
                ori: 0
            }
        ]
    };
    return util.mergeDeep(t, e || {});
}
function ee(e) {
    const t = {
        type: "building",
        map: {
            display: !0,
            shapes: [
                {
                    collider: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(31.5, 8)
                    ),
                    color: 5197647
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(-14, -9.5),
                        v2.create(2.5, 1.5)
                    ),
                    color: 3618615
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(14, -9.5),
                        v2.create(2.5, 1.5)
                    ),
                    color: 3618615
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(-14, 9.5),
                        v2.create(2.5, 1.5)
                    ),
                    color: 3618615
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(14, 9.5),
                        v2.create(2.5, 1.5)
                    ),
                    color: 3618615
                }
            ]
        },
        terrain: { grass: !0, beach: !1 },
        zIdx: 1,
        floor: {
            surfaces: [
                {
                    type: "asphalt",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(31.5, 8)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-building-bridge-lg-floor.img",
                    pos: v2.create(-15.75, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-bridge-lg-floor.img",
                    pos: v2.create(15.75, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 2,
                    mirrorY: !0
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(16.5, 7)
                    )
                }
            ],
            vision: { dist: 10 },
            imgs: [
                {
                    sprite: "map-building-bridge-lg-ceiling.img",
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        mapObjects: [
            {
                type: "bridge_rail_12",
                pos: v2.create(-22.5, 7.5),
                scale: 1,
                ori: 1
            },
            {
                type: "bridge_rail_12",
                pos: v2.create(-22.5, -7.5),
                scale: 1,
                ori: 1
            },
            {
                type: "bridge_rail_12",
                pos: v2.create(22.5, 7.5),
                scale: 1,
                ori: 1
            },
            {
                type: "bridge_rail_12",
                pos: v2.create(22.5, -7.5),
                scale: 1,
                ori: 1
            },
            {
                type: "concrete_wall_column_5x4",
                pos: v2.create(-14, -9),
                scale: 1,
                ori: 0
            },
            {
                type: "concrete_wall_column_5x4",
                pos: v2.create(-14, 9),
                scale: 1,
                ori: 0
            },
            {
                type: "concrete_wall_column_5x4",
                pos: v2.create(14, -9),
                scale: 1,
                ori: 0
            },
            {
                type: "concrete_wall_column_5x4",
                pos: v2.create(14, 9),
                scale: 1,
                ori: 0
            },
            {
                type: "concrete_wall_ext_5",
                pos: v2.create(-9, 7.5),
                scale: 1,
                ori: 1
            },
            {
                type: "concrete_wall_ext_5",
                pos: v2.create(-9, -7.5),
                scale: 1,
                ori: 1
            },
            {
                type: "concrete_wall_ext_5",
                pos: v2.create(9, 7.5),
                scale: 1,
                ori: 1
            },
            {
                type: "concrete_wall_ext_5",
                pos: v2.create(9, -7.5),
                scale: 1,
                ori: 1
            },
            {
                type: "bridge_rail_3",
                pos: v2.create(-5, 7.5),
                scale: 1,
                ori: 1
            },
            {
                type: "bridge_rail_3",
                pos: v2.create(-5, -7.5),
                scale: 1,
                ori: 1
            },
            {
                type: "bridge_rail_3",
                pos: v2.create(5, 7.5),
                scale: 1,
                ori: 1
            },
            {
                type: "bridge_rail_3",
                pos: v2.create(5, -7.5),
                scale: 1,
                ori: 1
            },
            {
                type: "concrete_wall_ext_7",
                pos: v2.create(0, 7.5),
                scale: 1,
                ori: 1
            },
            {
                type: "concrete_wall_ext_7",
                pos: v2.create(0, -7.5),
                scale: 1,
                ori: 1
            },
            {
                type: randomObstacleType({ loot_tier_1: 2, "": 1 }),
                pos: v2.create(-22, 0),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ loot_tier_1: 2, "": 1 }),
                pos: v2.create(22, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "sandbags_01",
                pos: v2.create(-14, 2.75),
                scale: 1,
                ori: 1
            },
            {
                type: "barrel_01",
                pos: v2.create(-10, 5),
                scale: 0.9,
                ori: 0
            },
            {
                type: "crate_01",
                pos: v2.create(0, 4.5),
                scale: 1,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "crate_01",
                pos: v2.create(0, -4.5),
                scale: 1,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "barrel_01",
                pos: v2.create(10, -5),
                scale: 0.9,
                ori: 0
            },
            {
                type: "sandbags_01",
                pos: v2.create(14, -2.75),
                scale: 1,
                ori: 1
            }
        ]
    };
    return util.mergeDeep(t, e || {});
}
function te(e) {
    const t = {
        type: "building",
        map: {
            display: !0,
            shapes: [
                {
                    collider: collider.createAabbExtents(
                        v2.create(0, 0.5),
                        v2.create(18, 12)
                    ),
                    color: 3823128
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(0, -13),
                        v2.create(17, 2)
                    ),
                    color: 6368528
                }
            ]
        },
        terrain: {
            grass: !0,
            beach: !1,
            riverShore: !0,
            nearbyRiver: {
                radMin: 0.75,
                radMax: 1.5,
                facingOri: 1
            }
        },
        zIdx: 1,
        floor: {
            surfaces: [
                {
                    type: "house",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, -1.5),
                            v2.create(18, 14)
                        )
                    ]
                },
                {
                    type: "asphalt",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(4, -14),
                            v2.create(3, 2.5)
                        ),
                        collider.createAabbExtents(
                            v2.create(-4, 13.5),
                            v2.create(2, 1)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-building-cabin-floor.img",
                    pos: v2.create(0, -1),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 0.5),
                        v2.create(19, 12)
                    ),
                    zoomOut: collider.createAabbExtents(
                        v2.create(0, 0.5),
                        v2.create(21, 14)
                    )
                },
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(4, -13),
                        v2.create(3, 2)
                    )
                }
            ],
            vision: {
                dist: 5.5,
                width: 2.75,
                linger: 0.5,
                fadeRate: 6
            },
            damage: { obstacleCount: 1 },
            imgs: [
                {
                    sprite: "map-building-cabin-ceiling-01a.img",
                    pos: v2.create(0, 0.5),
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-cabin-ceiling-01b.img",
                    pos: v2.create(4, -13),
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-chimney-01.img",
                    pos: v2.create(13, 2),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    removeOnDamaged: !0
                }
            ]
        },
        occupiedEmitters: [
            {
                type: "cabin_smoke_parent",
                pos: v2.create(0, 0),
                rot: 0,
                scale: 1,
                layer: 0,
                parentToCeiling: !0
            }
        ],
        mapObjects: [
            {
                type: "brick_wall_ext_12",
                pos: v2.create(-12, 12),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_01",
                pos: v2.create(-2, 12.25),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_12",
                pos: v2.create(4, 12),
                scale: 1,
                ori: 1
            },
            {
                type: "house_window_01",
                pos: v2.create(11.5, 12.25),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_5",
                pos: v2.create(15.5, 12),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_6",
                pos: v2.create(-18.5, 9.5),
                scale: 1,
                ori: 0
            },
            {
                type: "house_window_01",
                pos: v2.create(-18.75, 5),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_6",
                pos: v2.create(-18.5, 0.5),
                scale: 1,
                ori: 0
            },
            {
                type: "house_window_01",
                pos: v2.create(-18.75, -4),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_6",
                pos: v2.create(-18.5, -8.5),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_5",
                pos: v2.create(-15.5, -11),
                scale: 1,
                ori: 1
            },
            {
                type: "house_window_01",
                pos: v2.create(-11.5, -11.25),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_12",
                pos: v2.create(-4, -11),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_01",
                pos: v2.create(2, -11.25),
                scale: 1,
                ori: 3
            },
            {
                type: "brick_wall_ext_12",
                pos: v2.create(12, -11),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_15",
                pos: v2.create(18.5, 5),
                scale: 1,
                ori: 0
            },
            {
                type: "house_window_01",
                pos: v2.create(18.75, -4),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_6",
                pos: v2.create(18.5, -8.5),
                scale: 1,
                ori: 0
            },
            {
                type: e.cabin_wall_int_5 || "cabin_wall_int_5",
                pos: v2.create(-10.5, 9),
                scale: 1,
                ori: 0
            },
            {
                type:
                    e.cabin_wall_int_10 || "cabin_wall_int_10",
                pos: v2.create(-13, 2),
                scale: 1,
                ori: 1
            },
            {
                type:
                    e.cabin_wall_int_13 || "cabin_wall_int_13",
                pos: v2.create(-3.5, -4),
                scale: 1,
                ori: 0
            },
            {
                type: "house_door_01",
                pos: v2.create(-10.5, 2.5),
                scale: 1,
                ori: 0
            },
            {
                type: "house_door_01",
                pos: v2.create(-4, 2),
                scale: 1,
                ori: 1
            },
            {
                type: randomObstacleType({ toilet_01: 5, toilet_02: 1 }),
                pos: v2.create(-16, 9),
                scale: 1,
                ori: 0
            },
            {
                type: "stand_01",
                pos: v2.create(-12.5, 9.5),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ drawers_01: 7, drawers_02: 1 }),
                pos: v2.create(-15, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "pot_01",
                pos: v2.create(-16, -8.5),
                scale: 1,
                ori: 0
            },
            {
                type: "bed_lg_01",
                pos: v2.create(-7, -6.75),
                scale: 1,
                ori: 2
            },
            {
                type:
                    e.cabin_mount ||
                    randomObstacleType({
                        gun_mount_01: 50,
                        gun_mount_05: 50,
                        gun_mount_04: 10,
                        gun_mount_02: 10,
                        gun_mount_03: 1
                    }),
                pos: v2.create(4, 10.65),
                scale: 1,
                ori: 0
            },
            {
                type: "table_01",
                pos: v2.create(4, 6.5),
                scale: 1,
                ori: 0
            },
            {
                type: "stove_01",
                pos: v2.create(13, 2),
                scale: 1,
                ori: 3
            },
            {
                type: "woodpile_01",
                pos: v2.create(13, -3),
                scale: 1,
                ori: 0
            },
            {
                type: "pot_01",
                pos: v2.create(16, 9.5),
                scale: 1,
                ori: 0
            },
            {
                type: "pot_01",
                pos: v2.create(16, -8.5),
                scale: 1,
                ori: 0
            },
            {
                type: e.porch_01 || "",
                pos: v2.create(-1, -13.5),
                scale: 0.9,
                ori: 0
            }
        ]
    };
    return util.mergeDeep(t, e || {});
}
function re(e) {
    const t = {
        type: "building",
        map: {
            display: !0,
            shapes: [
                {
                    collider: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(7, 7)
                    ),
                    color: 15181895
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(0, -18.9),
                        v2.create(2, 12)
                    ),
                    color: 6171907
                }
            ]
        },
        terrain: {
            waterEdge: {
                dir: v2.create(0, 1),
                distMin: -8.5,
                distMax: 0
            }
        },
        floor: {
            surfaces: [
                {
                    type: "shack",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(7, 7)
                        ),
                        collider.createAabbExtents(
                            v2.create(0, -18.9),
                            v2.create(2, 12)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-building-hut-floor-01.img",
                    pos: v2.create(0, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-hut-floor-02.img",
                    pos: v2.create(0, -18.9),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(6, 6)
                    )
                }
            ],
            vision: { width: 4 },
            imgs: [
                {
                    sprite:
                        e.ceilingImg ||
                        "map-building-hut-ceiling-01.img",
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215
                }
            ],
            destroy: {
                wallCount: 2,
                particle: "hutBreak",
                particleCount: 25,
                residue: "map-hut-res-01.img"
            }
        },
        mapObjects: [
            {
                type: "hut_wall_int_4",
                pos: v2.create(-4, -6.5),
                scale: 1,
                ori: 1
            },
            {
                type: "hut_wall_int_4",
                pos: v2.create(4, -6.5),
                scale: 1,
                ori: 1
            },
            {
                type: "hut_wall_int_5",
                pos: v2.create(-6.5, 4.5),
                scale: 1,
                ori: 0
            },
            {
                type: "hut_window_open_01",
                pos: v2.create(-6.75, 0.5),
                scale: 1,
                ori: 0
            },
            {
                type: "hut_wall_int_6",
                pos: v2.create(-6.5, -4),
                scale: 1,
                ori: 0
            },
            {
                type: "hut_wall_int_12",
                pos: v2.create(0, 6.5),
                scale: 1,
                ori: 1
            },
            {
                type: "hut_wall_int_14",
                pos: v2.create(6.5, 0),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ pot_01: 2, "": 1 }),
                pos: v2.create(4.5, 4.5),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ pot_01: 2, "": 1 }),
                pos: v2.create(4.5, -4.5),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ pot_01: 2, "": 1 }),
                pos: v2.create(-4.5, 4.5),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ pot_01: 2, "": 1 }),
                pos: v2.create(-4.5, -4.5),
                scale: 1,
                ori: 0
            },
            {
                type: e.specialLoot || "pot_01",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            }
        ]
    };
    return util.mergeDeep(t, e || {});
}
function ae(e) {
    const t = {
        type: "building",
        map: {
            display: !0,
            shapes: [
                {
                    collider: collider.createAabbExtents(
                        v2.create(-7.75, 3),
                        v2.create(1, 2)
                    ),
                    color: 6171907
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(5, -4.75),
                        v2.create(2, 1)
                    ),
                    color: 6171907
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(1, 1.5),
                        v2.create(8, 5.5)
                    ),
                    color: 3754050
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(-10.65, 7),
                        v2.create(2, 12)
                    ),
                    color: 6171907
                }
            ]
        },
        terrain: {},
        zIdx: 1,
        floor: {
            surfaces: [
                {
                    type: "shack",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(1, 1.5),
                            v2.create(8, 5.5)
                        ),
                        collider.createAabbExtents(
                            v2.create(-10.65, 7),
                            v2.create(2, 12)
                        ),
                        collider.createAabbExtents(
                            v2.create(-7.75, 3),
                            v2.create(1, 2)
                        ),
                        collider.createAabbExtents(
                            v2.create(5, -4.75),
                            v2.create(2, 1)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-building-shack-floor-03.img",
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-hut-floor-02.img",
                    pos: v2.create(-10.65, 7),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(1, 1.5),
                        v2.create(7.75, 5.25)
                    )
                }
            ],
            vision: { width: 4 },
            imgs: [
                {
                    sprite: "map-building-shack-ceiling-03.img",
                    pos: v2.create(0.5, 0.5),
                    scale: 0.667,
                    alpha: 1,
                    tint: 10461087
                }
            ],
            destroy: {
                wallCount: 3,
                particle: "shackGreenBreak",
                particleCount: 30,
                residue: "map-shack-res-03.img"
            }
        },
        bridgeLandBounds: [
            collider.createAabbExtents(
                v2.create(-1.75, -4.25),
                v2.create(11.25, 4.75)
            )
        ],
        bridgeWaterBounds: [
            collider.createAabbExtents(
                v2.create(-10.5, 15.5),
                v2.create(3.5, 6)
            )
        ],
        mapObjects: [
            {
                type: "shack_wall_ext_2",
                pos: v2.create(-6.5, 6),
                scale: 1,
                ori: 0
            },
            {
                type: "shack_wall_ext_14",
                pos: v2.create(1, 6.5),
                scale: 1,
                ori: 1
            },
            {
                type: "shack_wall_ext_10",
                pos: v2.create(8.5, 2),
                scale: 1,
                ori: 0
            },
            {
                type: "shack_wall_ext_2",
                pos: v2.create(8, -3.5),
                scale: 1,
                ori: 1
            },
            {
                type: "shack_wall_ext_9",
                pos: v2.create(-1.5, -3.5),
                scale: 1,
                ori: 1
            },
            {
                type: "shack_wall_ext_5",
                pos: v2.create(-6.5, -1.5),
                scale: 1,
                ori: 0
            },
            {
                type: "pot_01",
                pos: v2.create(-4.25, -1.25),
                scale: 1,
                ori: 0
            },
            {
                type: "pot_01",
                pos: v2.create(-1.25, -1.25),
                scale: 1,
                ori: 0
            },
            {
                type: "table_01",
                pos: v2.create(5.5, 4),
                scale: 1,
                ori: 0
            },
            {
                type: "barrel_01",
                pos: v2.create(-4.75, -5.75),
                scale: 0.9,
                ori: 0
            },
            {
                type: "crate_20",
                pos: v2.create(-1, -5.75),
                scale: 1,
                ori: 0
            },
            {
                type: "loot_tier_leaf_pile",
                pos: v2.create(-10.65, 16),
                scale: 1,
                ori: 0
            }
        ]
    };
    return util.mergeDeep(t, e || {});
}
function ie(e) {
    const t = {
        type: "building",
        map: { display: !0, color: 1995644, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(0, 0),
                v2.create(15, 25)
            ),
            collider.createAabbExtents(
                v2.create(-15, 9),
                v2.create(2.5, 4.5)
            ),
            collider.createAabbExtents(
                v2.create(17.5, -7),
                v2.create(4.5, 2.5)
            )
        ],
        zIdx: 1,
        floor: {
            surfaces: [
                {
                    type: "tile",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(13, 20)
                        )
                    ]
                },
                {
                    type: "house",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(2, 20)
                        )
                    ]
                }
            ],
            imgs: e.floor_images || [
                {
                    sprite: "map-building-greenhouse-floor-01.img",
                    pos: v2.create(0, 10),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 2
                },
                {
                    sprite: "map-building-greenhouse-floor-01.img",
                    pos: v2.create(0, -10),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-porch-01.img",
                    pos: v2.create(0, 21),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 0
                },
                {
                    sprite: "map-building-porch-01.img",
                    pos: v2.create(0, -21),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 2
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(12.5, 19.5)
                    ),
                    zoomOut: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(14, 22)
                    )
                }
            ],
            vision: {
                dist: 7.5,
                width: 2.75,
                linger: 0.5,
                fadeRate: 6
            },
            imgs: e.ceiling_images || [
                {
                    sprite: "map-building-greenhouse-ceiling-01.img",
                    pos: v2.create(0, -9.85),
                    scale: 1,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-greenhouse-ceiling-01.img",
                    pos: v2.create(0, 9.85),
                    scale: 1,
                    alpha: 1,
                    tint: 16777215,
                    mirrorY: !0
                }
            ],
            destroy: {
                wallCount: 7,
                particle: "greenhouseBreak",
                particleCount: 60,
                residue: "",
                sound: "ceiling_break_02"
            }
        },
        mapObjects: [
            {
                type: "glass_wall_10",
                pos: v2.create(-7, 19.5),
                scale: 1,
                ori: 1
            },
            {
                type: "glass_wall_10",
                pos: v2.create(-7, -19.5),
                scale: 1,
                ori: 1
            },
            {
                type: "glass_wall_10",
                pos: v2.create(-12.5, 15),
                scale: 1,
                ori: 0
            },
            {
                type: "glass_wall_10",
                pos: v2.create(-12.5, 5),
                scale: 1,
                ori: 0
            },
            {
                type: "glass_wall_10",
                pos: v2.create(-12.5, -15),
                scale: 1,
                ori: 0
            },
            {
                type: "glass_wall_10",
                pos: v2.create(-12.5, -5),
                scale: 1,
                ori: 0
            },
            {
                type: "glass_wall_10",
                pos: v2.create(7, 19.5),
                scale: 1,
                ori: 1
            },
            {
                type: "glass_wall_10",
                pos: v2.create(7, -19.5),
                scale: 1,
                ori: 1
            },
            {
                type: "glass_wall_10",
                pos: v2.create(12.5, 15),
                scale: 1,
                ori: 0
            },
            {
                type: "glass_wall_10",
                pos: v2.create(12.5, 5),
                scale: 1,
                ori: 0
            },
            {
                type: "glass_wall_10",
                pos: v2.create(12.5, -15),
                scale: 1,
                ori: 0
            },
            {
                type: "glass_wall_10",
                pos: v2.create(12.5, -5),
                scale: 1,
                ori: 0
            },
            {
                type: "house_door_05",
                pos: v2.create(2, 19.75),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_05",
                pos: v2.create(-2, -19.75),
                scale: 1,
                ori: 3
            },
            {
                type: randomObstacleType({
                    planter_01: 1,
                    planter_02: 1,
                    planter_03: 1
                }),
                pos: v2.create(-4.5, 14.5),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({
                    planter_01: 1,
                    planter_02: 1,
                    planter_03: 1
                }),
                pos: v2.create(-7, 2.5),
                scale: 1,
                ori: 1
            },
            {
                type: randomObstacleType({
                    planter_01: 1,
                    planter_02: 1,
                    planter_03: 1
                }),
                pos: v2.create(-7, -2.5),
                scale: 1,
                ori: 1
            },
            {
                type: randomObstacleType({
                    planter_01: 1,
                    planter_02: 1,
                    planter_03: 1
                }),
                pos: v2.create(-4.5, -14.5),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({
                    planter_01: 1,
                    planter_02: 1,
                    planter_03: 1
                }),
                pos: v2.create(4.5, 14.5),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({
                    planter_01: 1,
                    planter_02: 1,
                    planter_03: 1
                }),
                pos: v2.create(7, 2.5),
                scale: 1,
                ori: 1
            },
            {
                type: randomObstacleType({
                    planter_01: 1,
                    planter_02: 1,
                    planter_03: 1
                }),
                pos: v2.create(7, -2.5),
                scale: 1,
                ori: 1
            },
            {
                type: randomObstacleType({
                    planter_01: 1,
                    planter_02: 1,
                    planter_03: 1
                }),
                pos: v2.create(4.5, -14.5),
                scale: 1,
                ori: 0
            },
            {
                type: "barrel_01",
                pos: v2.create(-15, 11),
                scale: 0.9,
                ori: 0
            },
            {
                type: "sandbags_02",
                pos: v2.create(-15, 7),
                scale: 1,
                ori: 0
            },
            {
                type: "sandbags_02",
                pos: v2.create(15.5, -7),
                scale: 1,
                ori: 1
            },
            {
                type: "barrel_01",
                pos: v2.create(19.5, -7),
                scale: 0.9,
                ori: 0
            },
            {
                type: "bunker_structure_08",
                pos: v2.create(-9.5, -15.5),
                scale: 1,
                ori: 0
            }
        ]
    };
    return util.mergeDeep(t, e || {});
}
function oe(e) {
    const t = {
        type: "structure",
        terrain: { grass: !0, beach: !1 },
        ori: 0,
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(5, 5),
                v2.create(15, 15)
            )
        ],
        layers: [
            {
                type: "bunker_chrys_01",
                pos: v2.create(0, 0),
                ori: 0
            },
            {
                type:
                    e.bunkerType || "bunker_chrys_sublevel_01",
                pos: v2.create(0, 0),
                ori: 0
            }
        ],
        stairs: [
            {
                collision: collider.createAabbExtents(
                    v2.create(0, 0),
                    v2.create(1.5, 2.6)
                ),
                downDir: v2.create(0, -1)
            }
        ],
        mask: [
            collider.createAabbExtents(
                v2.create(10.5, -12.25),
                v2.create(15, 9.5)
            ),
            collider.createAabbExtents(
                v2.create(40, 20),
                v2.create(14.45, 35)
            )
        ]
    };
    return util.mergeDeep(t, e || {});
}
function se(e) {
    const t = {
        type: "building",
        map: { display: !0, shapes: [] },
        terrain: { grass: !0, beach: !1, spawnPriority: 10 },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(0, -4),
                v2.create(55, 50)
            )
        ],
        bridgeLandBounds: [
            collider.createAabbExtents(
                v2.create(0, -4),
                v2.create(55, 50)
            )
        ],
        mapGroundPatches: [
            {
                bound: collider.createAabbExtents(
                    v2.create(0, 0),
                    v2.create(55, 55)
                ),
                color: e.groundTintLt || 5195792,
                roughness: 0.05,
                offsetDist: 0.5
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(-28.5, 7),
                    v2.create(7, 5)
                ),
                color: e.groundTintDk || 5986827,
                roughness: 0.05,
                offsetDist: 0.5
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(-24.5, -35),
                    v2.create(5.5, 4.5)
                ),
                color: e.groundTintDk || 5986827,
                roughness: 0.05,
                offsetDist: 0.5
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(20, 10),
                    v2.create(20, 30)
                ),
                color: e.groundTintDk || 5986827,
                roughness: 0.05,
                offsetDist: 0.5
            }
        ],
        floor: {
            surfaces: [
                {
                    type: "grass",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(55, 55)
                        )
                    ]
                }
            ],
            imgs: []
        },
        ceiling: { zoomRegions: [], imgs: [] },
        mapObjects: [
            {
                type: "container_04",
                pos: v2.create(3.75, 14),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ crate_01: 4, crate_19: 1 }),
                pos: v2.create(-1.35, 10.25),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ crate_01: 4, crate_19: 1 }),
                pos: v2.create(-6, 12.25),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "barrel_01",
                pos: v2.create(-2, 14.5),
                scale: 0.9,
                ori: 0
            },
            {
                type: "warehouse_02",
                pos: v2.create(20, 10),
                scale: 1,
                ori: 1
            },
            {
                type: randomObstacleType({ crate_01: 4, crate_19: 1 }),
                pos: v2.create(35, 24.25),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ crate_01: 4, crate_19: 1 }),
                pos: v2.create(35, 29),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ crate_01: 4, crate_19: 1 }),
                pos: v2.create(39.75, 27),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "tree_07",
                pos: v2.create(47, 13),
                scale: 1,
                ori: 0
            },
            {
                type: "tree_02",
                pos: v2.create(50.5, 9.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "bunker_structure_06",
                pos: v2.create(38, -12.5),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({
                    container_01: 1,
                    container_02: 1,
                    container_03: 1
                }),
                pos: v2.create(21, -32),
                scale: 1,
                ori: 3
            },
            {
                type: randomObstacleType({
                    container_01: 1,
                    container_02: 1,
                    container_03: 1
                }),
                pos: v2.create(21, -37.5),
                scale: 1,
                ori: 3
            },
            {
                type: "tree_07",
                pos: v2.create(45.5, -31.5),
                scale: 1,
                ori: 0
            },
            {
                type: "tree_07",
                pos: v2.create(40.5, -36.5),
                scale: 1.1,
                ori: 0
            },
            {
                type: randomObstacleType({ crate_01: 4, crate_19: 1 }),
                pos: v2.create(21.75, -50),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ crate_01: 4, crate_19: 1 }),
                pos: v2.create(26.75, -49),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "tree_02",
                pos: v2.create(44.5, -50.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "tree_09",
                pos: v2.create(-9, 34),
                scale: 1,
                ori: 0
            },
            {
                type: "tree_02",
                pos: v2.create(-13.5, 35.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "tree_09",
                pos: v2.create(-16.5, 32),
                scale: 1,
                ori: 3
            },
            {
                type: "tree_09",
                pos: v2.create(-20, 36),
                scale: 1,
                ori: 2
            },
            {
                type: "tree_09",
                pos: v2.create(-24.5, 33),
                scale: 1,
                ori: 3
            },
            {
                type: "tree_09",
                pos: v2.create(-31.5, 37),
                scale: 1,
                ori: 2
            },
            {
                type: "tree_09",
                pos: v2.create(-32.5, 32),
                scale: 1,
                ori: 1
            },
            {
                type: "tree_09",
                pos: v2.create(-40, 35.5),
                scale: 1,
                ori: 1
            },
            {
                type: "tree_09",
                pos: v2.create(-44.5, 32.5),
                scale: 1,
                ori: 3
            },
            {
                type: "woodpile_02",
                pos: v2.create(-33.5, 23.5),
                scale: 1,
                ori: 0
            },
            {
                type: "woodpile_02",
                pos: v2.create(-42.75, 21.5),
                scale: 1,
                ori: 1
            },
            {
                type: randomObstacleType({ crate_01: 4, crate_19: 1 }),
                pos: v2.create(-30.5, 9),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ chest_02: 1, case_04: 1 }),
                pos: v2.create(-30.5, 4.75),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ crate_01: 4, crate_19: 1 }),
                pos: v2.create(-25.75, 7),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "woodpile_02",
                pos: v2.create(-14.5, 0.5),
                scale: 1,
                ori: 1
            },
            {
                type: "woodpile_02",
                pos: v2.create(-21, -8.75),
                scale: 1,
                ori: 0
            },
            {
                type: "barrel_01",
                pos: v2.create(-36.5, -9),
                scale: 0.9,
                ori: 0
            },
            {
                type: "barrel_01",
                pos: v2.create(-34, -11.5),
                scale: 0.9,
                ori: 0
            },
            {
                type: "outhouse_01",
                pos: v2.create(-48.5, -5),
                scale: 1,
                ori: 1
            },
            {
                type: randomObstacleType({ outhouse_01: 5, outhouse_02: 1 }),
                pos: v2.create(-48.5, -14.5),
                scale: 1,
                ori: 1
            },
            {
                type: "woodpile_01",
                pos: v2.create(-51, -20.5),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ crate_01: 4, crate_19: 1 }),
                pos: v2.create(-26.75, -36),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ crate_01: 4, crate_19: 1 }),
                pos: v2.create(-22, -34),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "tree_09",
                pos: v2.create(-14.5, -20),
                scale: 1,
                ori: 1
            },
            {
                type: "tree_09",
                pos: v2.create(-11.5, -23),
                scale: 1,
                ori: 2
            },
            {
                type: "tree_09",
                pos: v2.create(-15.5, -24),
                scale: 1,
                ori: 0
            },
            {
                type: "woodpile_02",
                pos: v2.create(-37, -34),
                scale: 1,
                ori: 1
            },
            {
                type: "woodpile_02",
                pos: v2.create(-31, -47),
                scale: 1,
                ori: 0
            },
            {
                type: "woodpile_02",
                pos: v2.create(-18.75, -45.5),
                scale: 1,
                ori: 0
            },
            {
                type: "barrel_01",
                pos: v2.create(-2.5, -35.75),
                scale: 0.9,
                ori: 0
            },
            {
                type: "barrel_01",
                pos: v2.create(0.75, -37.5),
                scale: 0.9,
                ori: 0
            },
            {
                type: "tree_07",
                pos: v2.create(1, -33),
                scale: 1.2,
                ori: 0
            }
        ]
    };
    return util.mergeDeep(t, e || {});
}
function ne(e) {
    const t = {
        type: "building",
        map: { display: !0, shapes: [] },
        terrain: { grass: !0, beach: !1, spawnPriority: 10 },
        mapObstacleBounds: [
            collider.createCircle(v2.create(0, 0), 40)
        ],
        mapGroundPatches: [
            {
                bound: collider.createAabbExtents(
                    v2.create(5, 21.5),
                    v2.create(5.5, 6)
                ),
                color: e.groundTintDk || 7563810,
                roughness: 0.05,
                offsetDist: 0.5
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(-17.75, -14),
                    v2.create(6, 4.5)
                ),
                color: e.groundTintDk || 7563810,
                roughness: 0.05,
                offsetDist: 0.5
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(21.5, -10),
                    v2.create(4.75, 3.5)
                ),
                color: e.groundTintDk || 7563810,
                roughness: 0.05,
                offsetDist: 0.5
            }
        ],
        floor: {
            surfaces: [{ type: "grass", collision: [] }],
            imgs: []
        },
        ceiling: { zoomRegions: [], imgs: [] },
        mapObjects: [
            {
                type: e.tree_08c || "tree_08c",
                pos: v2.create(0, 0),
                scale: 2,
                ori: 0
            },
            {
                type: randomObstacleType({ crate_01: 4, crate_19: 1 }),
                pos: v2.create(2.5, 19.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ crate_01: 4, crate_19: 1 }),
                pos: v2.create(7.5, 19),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ crate_01: 4, crate_19: 1 }),
                pos: v2.create(3.5, 24.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "crate_04",
                pos: v2.create(-20.5, -13.25),
                scale: 1,
                ori: 0
            },
            {
                type: "crate_04",
                pos: v2.create(-15, -14.5),
                scale: 1,
                ori: 0
            },
            {
                type: "barrel_01",
                pos: v2.create(23.5, -9.25),
                scale: 1,
                ori: 0
            },
            {
                type: "barrel_01",
                pos: v2.create(20, -11),
                scale: 1,
                ori: 0
            }
        ]
    };
    return util.mergeDeep(t, e || {});
}
function le(e) {
    const t = {
        type: "building",
        map: {
            display: !0,
            shapes: [
                {
                    collider: collider.createAabbExtents(
                        v2.create(-1.5, 20.5),
                        v2.create(12.5, 4.5)
                    ),
                    color: 8671554
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(-2, -23),
                        v2.create(3, 2.5)
                    ),
                    color: 8671554
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(-20.5, -22.5),
                        v2.create(10, 2)
                    ),
                    color: 7750457
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(28, 1.5),
                        v2.create(3.75, 3)
                    ),
                    color: 7237230
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(-3.5, -2),
                        v2.create(28, 18.5)
                    ),
                    color: 6175023
                }
            ]
        },
        terrain: { grass: !0, beach: !1 },
        zIdx: 1,
        floor: {
            surfaces: [
                {
                    type: "tile",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(-3.5, -2),
                            v2.create(28, 18.5)
                        ),
                        collider.createAabbExtents(
                            v2.create(-1.5, 20.5),
                            v2.create(12.5, 4.5)
                        ),
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(20, 20)
                        )
                    ]
                },
                {
                    type: "asphalt",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(-21, -17),
                            v2.create(11, 8)
                        ),
                        collider.createAabbExtents(
                            v2.create(-23, -6),
                            v2.create(8, 3)
                        ),
                        collider.createAabbExtents(
                            v2.create(-2, -24),
                            v2.create(2, 3)
                        ),
                        collider.createAabbExtents(
                            v2.create(28, 1.5),
                            v2.create(3, 3)
                        )
                    ]
                },
                {
                    type: "grass",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(-2, 4),
                            v2.create(5, 5)
                        )
                    ]
                },
                {
                    type: "house",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(1, 13),
                            v2.create(2, 3.25)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-building-mansion-floor-01a.img",
                    pos: v2.create(-1.5, 22),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-mansion-floor-01b.img",
                    pos: v2.create(-3.5, -2),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-mansion-floor-01c.img",
                    pos: v2.create(28.5, 1.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-mansion-floor-01d.img",
                    pos: v2.create(-15, -24),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(-15, -22.4),
                        v2.create(17, 2.2)
                    ),
                    zoomOut: collider.createAabbExtents(
                        v2.create(-15, -24.4),
                        v2.create(21, 4.2)
                    )
                },
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(-3.5, -2),
                        v2.create(28, 18.5)
                    ),
                    zoomOut: collider.createAabbExtents(
                        v2.create(-3.5, -2),
                        v2.create(28, 18.5)
                    )
                },
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(-1.5, 20.6),
                        v2.create(12, 4.2)
                    ),
                    zoomOut: collider.createAabbExtents(
                        v2.create(-9, 23.1),
                        v2.create(5, 6.7)
                    )
                }
            ],
            vision: {
                dist: 5.5,
                width: 2.75,
                linger: 0.5,
                fadeRate: 6
            },
            imgs: [
                {
                    sprite: "map-building-mansion-ceiling.img",
                    scale: 1,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        mapObjects: [
            {
                type: "brick_wall_ext_9",
                pos: v2.create(-31.5, -16.5),
                scale: 1,
                ori: 0
            },
            {
                type: "house_window_01",
                pos: v2.create(-31.75, -10.5),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_19",
                pos: v2.create(-31.5, 0.5),
                scale: 1,
                ori: 0
            },
            {
                type: "house_window_01",
                pos: v2.create(-31.75, 11.5),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_4",
                pos: v2.create(-31.5, 15),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_17",
                pos: v2.create(-22.5, 16.5),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_9",
                pos: v2.create(-13.5, 20.5),
                scale: 1,
                ori: 0
            },
            {
                type: "house_door_01",
                pos: v2.create(-13, 24.9),
                scale: 1,
                ori: 3
            },
            {
                type: "brick_wall_ext_19",
                pos: v2.create(0.5, 24.5),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_9",
                pos: v2.create(10.5, 20.5),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_13",
                pos: v2.create(17.5, 16.5),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_6",
                pos: v2.create(24.5, 14),
                scale: 1,
                ori: 0
            },
            {
                type: "house_window_01",
                pos: v2.create(24.75, 9.5),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_18",
                pos: v2.create(24.5, -1),
                scale: 1,
                ori: 0
            },
            {
                type: "house_window_01",
                pos: v2.create(24.75, -11.5),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_8",
                pos: v2.create(24.5, -17),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_7",
                pos: v2.create(20.5, -20.5),
                scale: 1,
                ori: 1
            },
            {
                type: "house_window_01",
                pos: v2.create(15.5, -20.75),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_14",
                pos: v2.create(7, -20.5),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_01",
                pos: v2.create(-4, -21),
                scale: 1,
                ori: 3
            },
            {
                type: "brick_wall_ext_6",
                pos: v2.create(-7, -20.5),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_short_7",
                pos: v2.create(28.5, 4.5),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_short_7",
                pos: v2.create(28.5, -1.5),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_6",
                pos: v2.create(-7, -20.5),
                scale: 1,
                ori: 1
            },
            {
                type: e.mansion_column_1 || "mansion_column_1",
                pos: v2.create(-5, -24),
                scale: 1,
                ori: 1
            },
            {
                type: e.mansion_column_1 || "mansion_column_1",
                pos: v2.create(1, -24),
                scale: 1,
                ori: 1
            },
            {
                type: "saferoom_01",
                pos: v2.create(-25.5, 1.5),
                scale: 1,
                ori: 0
            },
            {
                type:
                    e.mansion_wall_int_12 ||
                    "mansion_wall_int_12",
                pos: v2.create(-25, -2.5),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_01",
                pos: v2.create(-19, -2.5),
                scale: 1,
                ori: 3
            },
            {
                type:
                    e.mansion_wall_int_1 ||
                    "mansion_wall_int_1",
                pos: v2.create(-30.5, 5.5),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_03",
                pos: v2.create(-30.25, 5.5),
                scale: 1,
                ori: 3
            },
            {
                type:
                    e.mansion_wall_int_13 ||
                    "mansion_wall_int_13",
                pos: v2.create(-20.5, 5.5),
                scale: 1,
                ori: 1
            },
            {
                type:
                    e.mansion_wall_int_7 ||
                    "mansion_wall_int_7",
                pos: v2.create(-19.5, 1.5),
                scale: 1,
                ori: 0
            },
            {
                type: "house_door_01",
                pos: v2.create(-14.5, 6),
                scale: 1,
                ori: 0
            },
            {
                type:
                    e.mansion_wall_int_6 ||
                    "mansion_wall_int_6",
                pos: v2.create(-14.5, 13),
                scale: 1,
                ori: 0
            },
            {
                type:
                    e.mansion_wall_int_6 ||
                    "mansion_wall_int_6",
                pos: v2.create(-14.5, -5),
                scale: 1,
                ori: 0
            },
            {
                type:
                    e.mansion_wall_int_10 ||
                    "mansion_wall_int_10",
                pos: v2.create(-10, -8.5),
                scale: 1,
                ori: 1
            },
            {
                type:
                    e.mansion_wall_int_11 ||
                    "mansion_wall_int_11",
                pos: v2.create(-9.5, -14.5),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_8",
                pos: v2.create(-7.5, 14),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_8",
                pos: v2.create(-1.5, 14),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_8",
                pos: v2.create(3.5, 14),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_12",
                pos: v2.create(-2, 9.5),
                scale: 1,
                ori: 1
            },
            {
                type: "stairs_01",
                pos: v2.create(-4.5, 12),
                scale: 1,
                ori: 0
            },
            {
                type: "glass_wall_10",
                pos: v2.create(-7.5, 4),
                scale: 1,
                ori: 0
            },
            {
                type: "glass_wall_10",
                pos: v2.create(3.5, 4),
                scale: 1,
                ori: 0
            },
            {
                type: "glass_wall_12",
                pos: v2.create(-2, -1.5),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_01",
                pos: v2.create(10.5, 16),
                scale: 1,
                ori: 2
            },
            {
                type:
                    e.mansion_wall_int_9 ||
                    "mansion_wall_int_9",
                pos: v2.create(10.5, 7.5),
                scale: 1,
                ori: 0
            },
            {
                type: "house_door_01",
                pos: v2.create(10.5, -1),
                scale: 1,
                ori: 0
            },
            {
                type:
                    e.mansion_wall_int_8 ||
                    "mansion_wall_int_8",
                pos: v2.create(10.5, -5),
                scale: 1,
                ori: 0
            },
            {
                type:
                    e.mansion_wall_int_9 ||
                    "mansion_wall_int_9",
                pos: v2.create(15.5, 4.5),
                scale: 1,
                ori: 1
            },
            {
                type:
                    e.mansion_wall_int_9 ||
                    "mansion_wall_int_9",
                pos: v2.create(15.5, -1.5),
                scale: 1,
                ori: 1
            },
            {
                type:
                    e.mansion_wall_int_5 ||
                    "mansion_wall_int_5",
                pos: v2.create(19.5, 1.5),
                scale: 1,
                ori: 0
            },
            {
                type: "house_door_01",
                pos: v2.create(24, 1.5),
                scale: 1,
                ori: 1
            },
            {
                type:
                    e.mansion_wall_int_5 ||
                    "mansion_wall_int_5",
                pos: v2.create(3.5, -8.5),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_01",
                pos: v2.create(6, -8.5),
                scale: 1,
                ori: 3
            },
            {
                type:
                    e.mansion_wall_int_11 ||
                    "mansion_wall_int_11",
                pos: v2.create(5.5, -14.5),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ bookshelf_01: 6, bookshelf_02: 1 }),
                pos: v2.create(-27.25, 7.15),
                scale: 1,
                ori: 2
            },
            {
                type: randomObstacleType({ bookshelf_01: 6, bookshelf_02: 1 }),
                pos: v2.create(-27.25, 14.85),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ drawers_01: 7, drawers_02: 1 }),
                pos: v2.create(-11.5, -11.75),
                scale: 1,
                ori: 3
            },
            {
                type: "stand_01",
                pos: v2.create(-7.5, -10.5),
                scale: 1,
                ori: 0
            },
            {
                type: "stand_01",
                pos: v2.create(3.5, -10.5),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ bookshelf_01: 6, bookshelf_02: 1 }),
                pos: v2.create(7.25, -16.25),
                scale: 1,
                ori: 1
            },
            {
                type: "piano_01",
                pos: v2.create(14.9, -3.25),
                scale: 1,
                ori: 0
            },
            {
                type: "toilet_01",
                pos: v2.create(17, 1.5),
                scale: 1,
                ori: 3
            },
            {
                type: "refrigerator_01",
                pos: v2.create(22.15, 14.4),
                scale: 1,
                ori: 0
            },
            {
                type: "oven_01",
                pos: v2.create(12.75, 6.75),
                scale: 1,
                ori: 1
            },
            {
                type: "oven_01",
                pos: v2.create(12.75, 10.25),
                scale: 1,
                ori: 1
            },
            {
                type: "table_02",
                pos: v2.create(15.75, -14.25),
                scale: 1,
                ori: 0
            },
            {
                type: e.entry_loot || "",
                pos: v2.create(-2, -8.5),
                scale: 1,
                ori: 0
            },
            {
                type:
                    e.decoration_02 ||
                    "loot_tier_mansion_floor",
                pos: v2.create(-2, -8.5),
                scale: 1,
                ori: 0
            },
            {
                type: e.decoration_02 || "",
                pos: v2.create(-21, 9.5),
                scale: 1,
                ori: 0
            },
            {
                type: e.decoration_02 || "",
                pos: v2.create(18, -8.5),
                scale: 1,
                ori: 0
            },
            {
                type: e.decoration_02 || "",
                pos: v2.create(6, 20.5),
                scale: 1,
                ori: 0
            },
            {
                type: e.decoration_01 || "",
                pos: v2.create(-30.15, 15),
                scale: 0.8,
                ori: 0
            },
            {
                type: e.decoration_01 || "",
                pos: v2.create(1.5, 11.5),
                scale: 1,
                ori: 2
            },
            {
                type: e.decoration_01 || "",
                pos: v2.create(8.5, 22.5),
                scale: 1,
                ori: 3
            },
            {
                type: e.decoration_01 || "",
                pos: v2.create(22.5, 14.5),
                scale: 1,
                ori: 3
            },
            {
                type: e.decoration_01 || "",
                pos: v2.create(22.5, -18.5),
                scale: 1,
                ori: 2
            },
            {
                type: e.tree || "tree_interior_01",
                pos: v2.create(-2, 4),
                scale: e.tree_scale || 0.6,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: e.tree_loot || "",
                pos: v2.create(-2.25, 4),
                scale: 1,
                ori: 0
            },
            {
                type: e.tree_loot || "",
                pos: v2.create(-1.75, 4),
                scale: 1,
                ori: 0
            },
            {
                type: e.tree_loot || "",
                pos: v2.create(-2, 4.25),
                scale: 1,
                ori: 0
            },
            {
                type: e.tree_loot || "",
                pos: v2.create(-2, 3.75),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({
                    bush_01: 25,
                    bush_03: 1,
                    "": e.bush_chance || 0
                }),
                pos: v2.create(-4.75, 1.25),
                scale: 0.9,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: randomObstacleType({
                    bush_01: 25,
                    bush_03: 1,
                    "": e.bush_chance || 0
                }),
                pos: v2.create(0.75, 1.25),
                scale: 0.9,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: randomObstacleType({
                    bush_01: 25,
                    bush_03: 1,
                    "": e.bush_chance || 0
                }),
                pos: v2.create(-4.75, 6.75),
                scale: 0.9,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: randomObstacleType({
                    bush_01: 25,
                    bush_03: 1,
                    "": e.bush_chance || 0
                }),
                pos: v2.create(0.75, 6.75),
                scale: 0.9,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: e.porch_01 || "bush_01",
                pos: v2.create(-8, -23),
                scale: 0.95,
                ori: 0
            },
            {
                type: e.porch_01 || "bush_01",
                pos: v2.create(4, -23),
                scale: 0.95,
                ori: 0
            },
            {
                type: "shack_01",
                pos: v2.create(-20.75, 22.5),
                scale: 1,
                ori: 2
            },
            {
                type: "crate_01",
                pos: v2.create(13.25, 19.25),
                scale: 0.9,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "tree_01",
                pos: v2.create(24, 24),
                scale: 1,
                ori: 0
            },
            {
                type: "barrel_02",
                pos: v2.create(27, -4),
                scale: 1,
                ori: 0
            },
            {
                type: "tree_01",
                pos: v2.create(29, -17.25),
                scale: 0.7,
                ori: 0
            }
        ]
    };
    return util.mergeDeep(t, e || {});
}
function ce(e) {
    const t = {
        type: "building",
        map: { display: !1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 0,
        floor: {
            surfaces: [
                {
                    type: "brick",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(18, 3),
                            v2.create(7, 13)
                        ),
                        collider.createAabbExtents(
                            v2.create(5, 0),
                            v2.create(6, 10)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-building-mansion-gradient-01.img",
                    pos: v2.create(-3.75, 0.25),
                    scale: 4,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-mansion-cellar-01a.img",
                    pos: v2.create(11.5, 5.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-mansion-cellar-01b.img",
                    pos: v2.create(28.5, 1.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-mansion-cellar-01c.img",
                    pos: v2.create(11.5, -9),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(18, 3),
                        v2.create(7, 13)
                    )
                },
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(5, 1.5),
                        v2.create(6, 12)
                    )
                }
            ],
            vision: {
                dist: 5.5,
                width: 2.75,
                linger: 0.5,
                fadeRate: 6
            },
            imgs: []
        },
        mapObjects: [
            {
                type: "brick_wall_ext_thicker_24",
                pos: v2.create(-2.5, 6),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_thicker_8",
                pos: v2.create(0, -7.5),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_thicker_7",
                pos: v2.create(5.5, -9.5),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_thicker_9",
                pos: v2.create(11.5, -11.5),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_thicker_7",
                pos: v2.create(17.5, -9.5),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_thicker_5",
                pos: v2.create(21.5, -7.5),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_thicker_8",
                pos: v2.create(25.5, -5),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_thicker_15",
                pos: v2.create(25.5, 11.5),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_thicker_16",
                pos: v2.create(16, 17.5),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_thicker_7",
                pos: v2.create(9.5, 12.5),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_thicker_5",
                pos: v2.create(5.5, 10.5),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_thicker_5",
                pos: v2.create(29.5, 5.5),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_thicker_5",
                pos: v2.create(29.5, -2.5),
                scale: 1,
                ori: 1
            },
            {
                type: "concrete_wall_ext_7",
                pos: v2.create(31.5, 1.5),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_thicker_6",
                pos: v2.create(4.5, 15),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_6",
                pos: v2.create(1, 17.6),
                scale: 1,
                ori: 1
            },
            {
                type: randomObstacleType({ barrel_03: 9, barrel_04: 1 }),
                pos: v2.create(8.5, -9.53),
                scale: 1,
                ori: 2
            },
            {
                type: randomObstacleType({ barrel_03: 9, barrel_04: 1 }),
                pos: v2.create(11.5, -9.53),
                scale: 1,
                ori: 2
            },
            {
                type: randomObstacleType({ barrel_03: 9, barrel_04: 1 }),
                pos: v2.create(14.5, -9.53),
                scale: 1,
                ori: 2
            },
            {
                type: randomObstacleType({ barrel_03: 9, barrel_04: 1 }),
                pos: v2.create(12.75, 15.5),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ barrel_03: 9, barrel_04: 1 }),
                pos: v2.create(15.75, 15.5),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ barrel_03: 9, barrel_04: 1 }),
                pos: v2.create(18.75, 15.5),
                scale: 1,
                ori: 0
            },
            {
                type: "crate_01",
                pos: v2.create(22.25, 14.25),
                scale: 0.75,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: randomObstacleType({ bookshelf_01: 7, bookshelf_02: 1 }),
                pos: v2.create(22.75, 8),
                scale: 1,
                ori: 3
            },
            {
                type: e.mansion_column_1 || "mansion_column_1",
                pos: v2.create(5.5, 1.5),
                scale: 1,
                ori: 1
            },
            {
                type: e.mansion_column_1 || "mansion_column_1",
                pos: v2.create(17.5, 1.5),
                scale: 1,
                ori: 1
            },
            {
                type: e.mid_obs_01 || "barrel_02",
                pos: v2.create(8.5, 1.5),
                scale: 0.8,
                ori: 0
            },
            {
                type: "barrel_01",
                pos: v2.create(11.5, 1.5),
                scale: 0.8,
                ori: 0
            },
            {
                type: e.mid_obs_01 || "barrel_02",
                pos: v2.create(14.5, 1.5),
                scale: 0.8,
                ori: 0
            },
            {
                type: e.decoration_02 || "",
                pos: v2.create(16.5, 7.5),
                scale: 1,
                ori: 0
            },
            {
                type: e.decoration_02 || "",
                pos: v2.create(11.5, -5.5),
                scale: 1,
                ori: 0
            },
            {
                type: e.decoration_01 || "",
                pos: v2.create(0.5, -4.5),
                scale: 1,
                ori: 1
            },
            {
                type: e.decoration_01 || "",
                pos: v2.create(22.5, 14.5),
                scale: 1,
                ori: 3
            }
        ]
    };
    return util.mergeDeep(t, e || {});
}
function me(e) {
    const t = {
        type: "building",
        map: { display: !0, color: 8145976, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(0, 1.4),
                v2.create(5.5, 6.5)
            )
        ],
        zIdx: 1,
        floor: {
            surfaces: [
                {
                    type: "shack",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0.15),
                            v2.create(3.75, 4.75)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-building-outhouse-floor.img",
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 1.45),
                        v2.create(3.6, 3.2)
                    ),
                    zoomOut: collider.createAabbExtents(
                        v2.create(0, 1.4),
                        v2.create(3.8, 3.4)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-building-outhouse-ceiling.img",
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ],
            destroy: {
                wallCount: 2,
                particleCount: 15,
                particle: "outhouseBreak",
                residue: "map-outhouse-res.img"
            }
        },
        mapObjects: [
            {
                type: "outhouse_wall_top",
                pos: v2.create(0, 4.46),
                scale: 1,
                ori: 0
            },
            {
                type: "outhouse_wall_side",
                pos: v2.create(3.4, 1.73),
                scale: 1,
                ori: 0
            },
            {
                type: "outhouse_wall_side",
                pos: v2.create(-3.4, 1.73),
                scale: 1,
                ori: 0
            },
            {
                type: "outhouse_wall_bot",
                pos: v2.create(-2.65, -1.52),
                scale: 1,
                ori: 0
            },
            {
                type: "outhouse_wall_bot",
                pos: v2.create(2.65, -1.52),
                scale: 1,
                ori: 0
            },
            {
                type:
                    e.obs || randomObstacleType({ toilet_01: 5, toilet_02: 1 }),
                pos: v2.create(0, 2),
                scale: 0.95,
                ori: 0
            }
        ]
    };
    return util.mergeDeep(t, e || {});
}
function pe(e) {
    const t = {
        type: "building",
        map: {
            display: !0,
            shapes: [
                {
                    collider: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(9, 9)
                    ),
                    color: 10555920
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(3.5, 3.5)
                    ),
                    color: 16727611
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(0, -10.15),
                        v2.create(2, 1.5)
                    ),
                    color: 7354635
                }
            ]
        },
        terrain: { grass: !0, beach: !1 },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(0, 0),
                v2.create(11, 11)
            ),
            collider.createAabbExtents(
                v2.create(0, -20),
                v2.create(4, 12)
            )
        ],
        ori: 0,
        floor: {
            surfaces: [
                {
                    type: "shack",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(9, 9)
                        ),
                        collider.createAabbExtents(
                            v2.create(0, -10.15),
                            v2.create(2, 1.5)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-building-pavilion-floor-01.img",
                    pos: v2.create(0, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-teahouse-floor-02.img",
                    pos: v2.create(0, -10.25),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(7, 7)
                    ),
                    zoomOut: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(9, 9)
                    )
                }
            ],
            vision: { width: 4 },
            imgs: [
                {
                    sprite: "map-building-pavilion-ceiling-01.img",
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ],
            destroy: {
                wallCount: 3,
                particle: "teapavilionBreak",
                particleCount: 15,
                residue: "map-building-pavilion-res-01.img"
            }
        },
        mapObjects: [
            {
                type: "teahouse_wall_int_12",
                pos: v2.create(0, 6.5),
                scale: 1,
                ori: 1
            },
            {
                type: "teahouse_wall_int_13",
                pos: v2.create(6.5, 0.5),
                scale: 1,
                ori: 0
            },
            {
                type: "teahouse_wall_int_13",
                pos: v2.create(-6.5, 0.5),
                scale: 1,
                ori: 0
            },
            {
                type: "teahouse_wall_int_5",
                pos: v2.create(-4.5, -6.5),
                scale: 1,
                ori: 1
            },
            {
                type: "teahouse_wall_int_5",
                pos: v2.create(4.5, -6.5),
                scale: 1,
                ori: 1
            },
            {
                type: "teahouse_door_01",
                pos: v2.create(-2, -6.5),
                scale: 1,
                ori: 3
            },
            {
                type: e.left_loot || "pot_03",
                pos: v2.create(4.5, 4.5),
                scale: 1,
                ori: 0
            },
            {
                type: e.right_loot || "pot_03",
                pos: v2.create(-4.5, 4.5),
                scale: 1,
                ori: 0
            },
            {
                type:
                    e.center_loot || "loot_tier_airdrop_armor",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            }
        ]
    };
    return util.mergeDeep(t, e || {});
}
function he(e) {
    const t = {
        type: "building",
        map: { display: !0, shapes: [] },
        terrain: { grass: !0, beach: !1 },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(0, 0),
                v2.create(24, 18)
            )
        ],
        mapGroundPatches: [
            {
                bound: collider.createAabbExtents(
                    v2.create(0, 0),
                    v2.create(21, 15)
                ),
                color: e.grass_color || 6066442,
                roughness: 0.05,
                offsetDist: 0.25
            }
        ],
        floor: {
            surfaces: [{ type: "grass", collision: [] }],
            imgs: []
        },
        ceiling: { zoomRegions: [], imgs: [] },
        mapObjects: [
            {
                type: "teahouse_01",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "barrel_02",
                pos: v2.create(12, 11),
                scale: 1,
                ori: 0
            },
            {
                type: "barrel_02",
                pos: v2.create(-16, -6),
                scale: 1,
                ori: 0
            },
            {
                type: e.tree_small || "tree_07sp",
                pos: v2.create(-3, 12),
                scale: 0.9,
                ori: 0
            },
            {
                type: e.tree_small || "tree_07sp",
                pos: v2.create(-15, 12),
                scale: 0.9,
                ori: 0
            },
            {
                type:
                    e.tree_large || randomObstacleType({ tree_08sp: 2, "": 1 }),
                pos: v2.create(-10, -13),
                scale: 1,
                ori: 0
            },
            {
                type:
                    e.tree_large || randomObstacleType({ tree_08sp: 2, "": 1 }),
                pos: v2.create(-17.5, 2.5),
                scale: 1.2,
                ori: 0
            },
            {
                type:
                    e.tree_large || randomObstacleType({ tree_08sp: 2, "": 1 }),
                pos: v2.create(18, -6.5),
                scale: 1,
                ori: 0
            },
            {
                type:
                    e.tree_large || randomObstacleType({ tree_08sp: 2, "": 1 }),
                pos: v2.create(17.5, 5),
                scale: 1.2,
                ori: 0
            },
            {
                type: e.tree_small || "tree_07sp",
                pos: v2.create(3, -12),
                scale: 0.9,
                ori: 0
            },
            {
                type: e.tree_small || "tree_07sp",
                pos: v2.create(15, -12),
                scale: 0.9,
                ori: 0
            }
        ]
    };
    return util.mergeDeep(t, e || {});
}
function de(e) {
    const t = {
        type: "building",
        map: { display: !0, shapes: [] },
        terrain: { grass: !0, beach: !1 },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(0, 0),
                v2.create(10, 10)
            )
        ],
        mapGroundPatches: [
            {
                bound: collider.createAabbExtents(
                    v2.create(0, 0),
                    v2.create(8, 8)
                ),
                color: 7696926,
                roughness: 0.1,
                offsetDist: 0.2
            }
        ],
        floor: { surfaces: [], imgs: [] },
        ceiling: { zoomRegions: [], imgs: [] },
        mapObjects: []
    };
    return util.mergeDeep(t, e || {});
}
function ue(e) {
    const t = {
        type: "building",
        map: {
            display: !0,
            shapes: [
                {
                    collider: collider.createAabbExtents(
                        v2.create(-21, -8),
                        v2.create(21.25, 14)
                    ),
                    color: 5855577
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(-24.5, 8.5),
                        v2.create(17.75, 9.75)
                    ),
                    color: 3355970
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(-3.5, 12),
                        v2.create(3.5, 6.25)
                    ),
                    color: 4278620
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(10.35, 0),
                        v2.create(10.5, 22)
                    ),
                    color: 3355970
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(31.25, 12.5),
                        v2.create(10.75, 9.5)
                    ),
                    color: 3355970
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(-3.5, 2.5),
                        v2.create(2.25, 2.25)
                    ),
                    color: 6310464
                },
                {
                    collider: collider.createCircle(
                        v2.create(-30.5, -18),
                        1.5
                    ),
                    color: 8026746
                },
                {
                    collider: collider.createCircle(
                        v2.create(-20.5, -10.5),
                        1.5
                    ),
                    color: 8026746
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(-38.5, -7),
                        v2.create(1.4, 3.1)
                    ),
                    color: 13278307
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(-7.5, -19.5),
                        v2.create(3.1, 1.4)
                    ),
                    color: 13278307
                }
            ]
        },
        terrain: { grass: !0, beach: !1 },
        zIdx: 1,
        floor: {
            surfaces: [
                {
                    type: "tile",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(-24.5, 8.5),
                            v2.create(17.75, 9.75)
                        ),
                        collider.createAabbExtents(
                            v2.create(-3.5, 12),
                            v2.create(3.5, 6.25)
                        ),
                        collider.createAabbExtents(
                            v2.create(10.35, 0),
                            v2.create(10.5, 22)
                        ),
                        collider.createAabbExtents(
                            v2.create(31.25, 12.5),
                            v2.create(10.75, 9.5)
                        )
                    ]
                },
                {
                    type: "asphalt",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(-21.5, -13),
                            v2.create(21, 11.5)
                        ),
                        collider.createAabbExtents(
                            v2.create(-3.5, 2),
                            v2.create(3, 3.5)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-building-police-floor-01.img",
                    pos: v2.create(-9.5, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-police-floor-02.img",
                    pos: v2.create(33, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(-24.5, 8.5),
                        v2.create(17.75, 9.75)
                    )
                },
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(-3.5, 12),
                        v2.create(3.5, 6.25)
                    )
                },
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(10.35, 0),
                        v2.create(10.5, 22)
                    )
                },
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(31.25, 12.5),
                        v2.create(10.75, 9.5)
                    ),
                    zoomOut: collider.createAabbExtents(
                        v2.create(12, 0),
                        v2.create(12.75, 26)
                    )
                }
            ],
            vision: {
                dist: 5.5,
                width: 2.75,
                linger: 0.5,
                fadeRate: 6
            },
            imgs: [
                {
                    sprite: "map-building-police-ceiling-01.img",
                    pos: v2.create(-21.5, 8.5),
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-police-ceiling-02.img",
                    pos: v2.create(10.5, 0),
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-police-ceiling-03.img",
                    pos: v2.create(31.96, 12.5),
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        mapObjects: [
            {
                type: "brick_wall_ext_20",
                pos: v2.create(-42, 8.5),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_41",
                pos: v2.create(-21, 18),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_7",
                pos: v2.create(-38, -1),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_21",
                pos: v2.create(-18, -1),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_7",
                pos: v2.create(-7, 2),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_7",
                pos: v2.create(-4, 6),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_16",
                pos: v2.create(0, -1.5),
                scale: 1,
                ori: 0
            },
            {
                type: "house_window_01",
                pos: v2.create(-0.5, -11),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_10",
                pos: v2.create(0, -17.5),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_6",
                pos: v2.create(3.5, -22),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_01",
                pos: v2.create(6.5, -22.5),
                scale: 1,
                ori: 3
            },
            {
                type: "house_door_01",
                pos: v2.create(14.5, -22.5),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_6",
                pos: v2.create(17.5, -22),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_11",
                pos: v2.create(21, -17),
                scale: 1,
                ori: 0
            },
            {
                type: "house_door_01",
                pos: v2.create(21.5, -11.5),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_11",
                pos: v2.create(21, -2),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_20",
                pos: v2.create(31.5, 3),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_20",
                pos: v2.create(42, 12.5),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_33",
                pos: v2.create(25, 22),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_01",
                pos: v2.create(4.5, 22.5),
                scale: 1,
                ori: 3
            },
            {
                type: "brick_wall_ext_4",
                pos: v2.create(2.5, 22),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_5",
                pos: v2.create(0, 20),
                scale: 1,
                ori: 0
            },
            {
                type: "police_wall_int_2",
                pos: v2.create(-40.5, 8),
                scale: 1,
                ori: 1
            },
            {
                type: "police_wall_int_3",
                pos: v2.create(-34, 8),
                scale: 1,
                ori: 1
            },
            {
                type: "cell_door_01",
                pos: v2.create(-35.5, 8),
                scale: 1,
                ori: 1
            },
            {
                type: "police_wall_int_8",
                pos: v2.create(-35, 3.5),
                scale: 1,
                ori: 0
            },
            {
                type: "police_wall_int_3",
                pos: v2.create(-27, 8),
                scale: 1,
                ori: 1
            },
            {
                type: "police_wall_int_8",
                pos: v2.create(-28, 3.5),
                scale: 1,
                ori: 0
            },
            {
                type: "cell_door_01",
                pos: v2.create(-21.5, 8),
                scale: 1,
                ori: 1
            },
            {
                type: "police_wall_int_3",
                pos: v2.create(-20, 8),
                scale: 1,
                ori: 1
            },
            {
                type: "police_wall_int_8",
                pos: v2.create(-21, 3.5),
                scale: 1,
                ori: 0
            },
            {
                type: "cell_door_01",
                pos: v2.create(-14.5, 8),
                scale: 1,
                ori: 1
            },
            {
                type: "police_wall_int_3",
                pos: v2.create(-13, 8),
                scale: 1,
                ori: 1
            },
            {
                type: "police_wall_int_8",
                pos: v2.create(-14, 3.5),
                scale: 1,
                ori: 0
            },
            {
                type: "cell_door_01",
                pos: v2.create(-7.5, 8),
                scale: 1,
                ori: 1
            },
            {
                type: "police_wall_int_6",
                pos: v2.create(-7, 9.5),
                scale: 1,
                ori: 0
            },
            {
                type: "police_wall_int_7",
                pos: v2.create(-4, 13),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_02",
                pos: v2.create(-7, 17.5),
                scale: 1,
                ori: 2
            },
            {
                type: "police_wall_int_4",
                pos: v2.create(2.5, -1),
                scale: 1,
                ori: 1
            },
            {
                type: "bank_window_01",
                pos: v2.create(6, -1),
                scale: 1,
                ori: 1
            },
            {
                type: "police_wall_int_6",
                pos: v2.create(10.5, -1),
                scale: 1,
                ori: 1
            },
            {
                type: "bank_window_01",
                pos: v2.create(15, -1),
                scale: 1,
                ori: 1
            },
            {
                type: "police_wall_int_4",
                pos: v2.create(18.5, -1),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_01",
                pos: v2.create(21, 3.5),
                scale: 1,
                ori: 0
            },
            {
                type: "police_wall_int_10",
                pos: v2.create(21, 12.5),
                scale: 1,
                ori: 0
            },
            {
                type: "house_door_01",
                pos: v2.create(21, 21.5),
                scale: 1,
                ori: 2
            },
            {
                type: "metal_wall_ext_10",
                pos: v2.create(35.5, 4),
                scale: 1,
                ori: 1
            },
            {
                type: randomObstacleType({ locker_01: 8, locker_02: 1 }),
                pos: v2.create(33, 4.15),
                scale: 1,
                ori: 2
            },
            {
                type: "metal_wall_ext_10",
                pos: v2.create(35.5, 21),
                scale: 1,
                ori: 1
            },
            {
                type: randomObstacleType({ locker_01: 8, locker_02: 1 }),
                pos: v2.create(33, 20.85),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ locker_01: 8, locker_02: 1 }),
                pos: v2.create(38, 20.85),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_18",
                pos: v2.create(41, 12.5),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ locker_01: 8, locker_02: 1 }),
                pos: v2.create(40.85, 7.5),
                scale: 1,
                ori: 3
            },
            {
                type: randomObstacleType({ locker_01: 8, locker_02: 1 }),
                pos: v2.create(40.85, 17.5),
                scale: 1,
                ori: 3
            },
            {
                type: "metal_wall_ext_thicker_10",
                pos: v2.create(35.5, 12.5),
                scale: 1,
                ori: 1
            },
            {
                type: randomObstacleType({ locker_01: 8, locker_02: 1 }),
                pos: v2.create(38, 11.35),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ locker_01: 8, locker_02: 1 }),
                pos: v2.create(33, 13.65),
                scale: 1,
                ori: 2
            },
            {
                type: randomObstacleType({ toilet_03: 5, toilet_04: 1 }),
                pos: v2.create(-37, 1),
                scale: 1,
                ori: 2
            },
            {
                type: randomObstacleType({ toilet_03: 5, toilet_04: 1 }),
                pos: v2.create(-23, 1),
                scale: 1,
                ori: 2
            },
            {
                type: randomObstacleType({ toilet_03: 5, toilet_04: 1 }),
                pos: v2.create(-16, 1),
                scale: 1,
                ori: 2
            },
            {
                type: randomObstacleType({ toilet_03: 5, toilet_04: 1 }),
                pos: v2.create(-9, 1),
                scale: 1,
                ori: 2
            },
            {
                type: "control_panel_01",
                pos: v2.create(-4.5, 9.5),
                scale: 1,
                ori: 1
            },
            {
                type: "crate_06",
                pos: v2.create(-24.5, 20.25),
                scale: 1,
                ori: 0
            },
            {
                type: "crate_06",
                pos: v2.create(14.5, 12.5),
                scale: 1,
                ori: 0
            },
            {
                type: "crate_06",
                pos: v2.create(18.75, 12.5),
                scale: 1,
                ori: 1
            },
            {
                type: "fire_ext_01",
                pos: v2.create(21.85, 12.5),
                scale: 1,
                ori: 0
            },
            {
                type: "crate_06",
                pos: v2.create(10.5, 1.25),
                scale: 1,
                ori: 0
            },
            {
                type: "vending_01",
                pos: v2.create(2, -6.75),
                scale: 1,
                ori: 1
            },
            {
                type: "stand_01",
                pos: v2.create(2, -14.5),
                scale: 1,
                ori: 1
            },
            {
                type: "bush_01",
                pos: v2.create(2.5, -19.5),
                scale: 1,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "bush_01",
                pos: v2.create(18.5, -19.5),
                scale: 1,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: randomObstacleType({ loot_tier_police_floor: 1 }),
                pos: v2.create(-38.5, 4),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ loot_tier_1: 1 }),
                pos: v2.create(-31.5, 4),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ loot_tier_1: 1 }),
                pos: v2.create(-24.5, 4),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ loot_tier_1: 1 }),
                pos: v2.create(-17.5, 4),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ loot_tier_1: 1 }),
                pos: v2.create(-10.5, 4),
                scale: 1,
                ori: 0
            },
            {
                type: "crate_01",
                pos: v2.create(-3.5, 2.5),
                scale: 1,
                ori: 0,
                inheritOri: !1,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "sandbags_01",
                pos: v2.create(-38.5, -7),
                scale: 1,
                ori: 3
            },
            {
                type: "sandbags_01",
                pos: v2.create(-7.5, -19.5),
                scale: 1,
                ori: 0
            },
            {
                type: "barrel_01",
                pos: v2.create(-30.5, -18),
                scale: 0.9,
                ori: 0
            },
            {
                type: "barrel_01",
                pos: v2.create(-20.5, -10.5),
                scale: 0.9,
                ori: 0
            },
            {
                type: "tree_01",
                pos: v2.create(39, -6),
                scale: 0.8,
                ori: 0
            },
            {
                type: "tree_01",
                pos: v2.create(28, -17.5),
                scale: 0.8,
                ori: 0
            },
            {
                type: "hedgehog_01",
                pos: v2.create(39, -17.5),
                scale: 1,
                ori: 0
            },
            {
                type: "crate_01",
                pos: v2.create(24.5, -0.5),
                scale: 1,
                ori: 0,
                inheritOri: !1,
                ignoreMapSpawnReplacement: !0
            }
        ]
    };
    return util.mergeDeep(t, e || {});
}
function ge(e) {
    const t = {
        type: "building",
        map: { display: !0, color: 6429724, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(0, 0),
                v2.create(19, 17.5)
            )
        ],
        zIdx: 1,
        floor: {
            surfaces: [
                {
                    type: "house",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(14.5, 13)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-building-house-floor-01.img",
                    pos: v2.create(0, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-porch-01.img",
                    pos: v2.create(-1, 14.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 0
                },
                {
                    sprite: "map-building-porch-01.img",
                    pos: v2.create(0, -14.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 2
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(14.5, 13)
                    ),
                    zoomOut: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(16.5, 15)
                    )
                }
            ],
            vision: {
                dist: 5.5,
                width: 2.75,
                linger: 0.5,
                fadeRate: 6
            },
            imgs: [
                {
                    sprite: "map-building-house-ceiling.img",
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        mapObjects: [
            {
                type: "brick_wall_ext_12",
                pos: v2.create(-9, 13),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_14",
                pos: v2.create(8, 13),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_01",
                pos: v2.create(1, 13.25),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_5",
                pos: v2.create(-14.5, 10),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_10",
                pos: v2.create(-14.5, -0.5),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_4",
                pos: v2.create(-14.5, -10.5),
                scale: 1,
                ori: 0
            },
            {
                type: "house_window_01",
                pos: v2.create(-14.75, 6),
                scale: 1,
                ori: 0
            },
            {
                type: "house_window_01",
                pos: v2.create(-14.75, -7),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_5",
                pos: v2.create(-12.5, -13),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_5",
                pos: v2.create(-4.5, -13),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_5",
                pos: v2.create(4.5, -13),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_5",
                pos: v2.create(12.5, -13),
                scale: 1,
                ori: 1
            },
            {
                type: "house_window_01",
                pos: v2.create(-8.5, -13.25),
                scale: 1,
                ori: 3
            },
            {
                type: "house_window_01",
                pos: v2.create(8.5, -13.25),
                scale: 1,
                ori: 3
            },
            {
                type: "house_door_01",
                pos: v2.create(-2, -13.25),
                scale: 1,
                ori: 3
            },
            {
                type: "brick_wall_ext_8",
                pos: v2.create(14.5, 8.5),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_9",
                pos: v2.create(14.5, -3),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_2",
                pos: v2.create(14.5, -11.5),
                scale: 1,
                ori: 0
            },
            {
                type: "house_window_01",
                pos: v2.create(14.75, -9),
                scale: 1,
                ori: 2
            },
            {
                type: "house_window_01",
                pos: v2.create(14.75, 3),
                scale: 1,
                ori: 2
            },
            {
                type: e.house_wall_int_9 || "house_wall_int_9",
                pos: v2.create(-9.5, -1),
                scale: 1,
                ori: 1
            },
            {
                type: e.house_wall_int_5 || "house_wall_int_5",
                pos: v2.create(4.5, -6),
                scale: 1,
                ori: 0
            },
            {
                type: e.house_wall_int_9 || "house_wall_int_9",
                pos: v2.create(9.5, -4),
                scale: 1,
                ori: 1
            },
            {
                type: e.house_wall_int_8 || "house_wall_int_8",
                pos: v2.create(5.5, 8.5),
                scale: 1,
                ori: 0
            },
            {
                type: e.house_wall_int_4 || "house_wall_int_4",
                pos: v2.create(8, 7),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_01",
                pos: v2.create(4.5, -12.5),
                scale: 1,
                ori: 0
            },
            {
                type: "house_door_01",
                pos: v2.create(6, 2.5),
                scale: 1,
                ori: 2
            },
            {
                type: "house_door_01",
                pos: v2.create(14, 7),
                scale: 1,
                ori: 1
            },
            {
                type: e.house_column_1 || "house_column_1",
                pos: v2.create(6, 3.5),
                scale: 1,
                ori: 0
            },
            {
                type: e.house_column_1 || "house_column_1",
                pos: v2.create(6, -2.5),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ toilet_01: 5, toilet_02: 1 }),
                pos: v2.create(8, 10),
                scale: 1,
                ori: 1
            },
            {
                type: "stand_01",
                pos: v2.create(12.25, -2),
                scale: 1,
                ori: 3
            },
            {
                type: randomObstacleType({ drawers_01: 7, drawers_02: 1 }),
                pos: v2.create(7.75, -6),
                scale: 1,
                ori: 0
            },
            {
                type: e.stand || "",
                pos: v2.create(-12.25, -3),
                scale: 1,
                ori: 1
            },
            {
                type: "table_01",
                pos: v2.create(-11.25, 1.75),
                scale: 1,
                ori: 0
            },
            {
                type: "oven_01",
                pos: v2.create(-7, 11),
                scale: 1,
                ori: 0
            },
            {
                type: "refrigerator_01",
                pos: v2.create(-7, 1),
                scale: 1,
                ori: 2
            },
            {
                type: e.plant || "bush_02",
                pos: e.plant_pos || v2.create(-12, -10.5),
                scale: 1,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: e.porch_01 || "",
                pos: v2.create(4.5, -15.5),
                scale: 0.9,
                ori: 0
            },
            {
                type: e.porch_01 || "",
                pos: v2.create(-5.25, 15.5),
                scale: 0.9,
                ori: 2
            },
            {
                type: "loot_tier_1",
                pos: v2.create(0, 4.5),
                scale: 1,
                ori: 0
            },
            {
                type: e.plant_loot || "",
                pos: v2.create(-10.25, -8.5),
                scale: 1,
                ori: 0
            },
            {
                type: e.plant_loot || "",
                pos: v2.create(-10, -8.75),
                scale: 1,
                ori: 0
            },
            {
                type: e.plant_loot || "",
                pos: v2.create(-9.75, -8.25),
                scale: 1,
                ori: 0
            }
        ]
    };
    return util.mergeDeep(t, e || {});
}
function ye(e) {
    const t = {
        type: "building",
        map: { display: !0, color: 4656911, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(0, -1),
                v2.create(19, 18.5)
            )
        ],
        zIdx: 1,
        floor: {
            surfaces: [
                {
                    type: "house",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(14.5, 13)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-building-house-floor-02.img",
                    pos: v2.create(0, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-porch-01.img",
                    pos: v2.create(10, 14.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 0
                },
                {
                    sprite: "map-building-porch-01.img",
                    pos: v2.create(0, -14.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 2
                },
                {
                    sprite: "map-building-porch-01.img",
                    pos: v2.create(2.6, -14.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 2
                },
                {
                    sprite: "map-building-porch-01.img",
                    pos: v2.create(5.2, -14.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 2
                },
                {
                    sprite: "map-building-porch-01.img",
                    pos: v2.create(7.8, -14.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 2
                },
                {
                    sprite: "map-building-porch-01.img",
                    pos: v2.create(0, -16.25),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 2
                },
                {
                    sprite: "map-building-porch-01.img",
                    pos: v2.create(2.6, -16.25),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 2
                },
                {
                    sprite: "map-building-porch-01.img",
                    pos: v2.create(5.2, -16.25),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 2
                },
                {
                    sprite: "map-building-porch-01.img",
                    pos: v2.create(7.8, -16.25),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 2
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(14.5, 13)
                    ),
                    zoomOut: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(16.5, 15)
                    )
                }
            ],
            vision: {
                dist: 5.5,
                width: 2.75,
                linger: 0.5,
                fadeRate: 6
            },
            imgs: [
                {
                    sprite: "map-building-house-ceiling.img",
                    scale: 0.667,
                    alpha: 1,
                    tint: 13619151,
                    rot: 2
                }
            ]
        },
        mapObjects: [
            {
                type: "brick_wall_ext_5",
                pos: v2.create(-12.5, 13),
                scale: 1,
                ori: 1
            },
            {
                type: "house_window_01",
                pos: v2.create(-8.5, 13.25),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_15",
                pos: v2.create(0.5, 13),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_3",
                pos: v2.create(13.5, 13),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_01",
                pos: v2.create(12, 13.25),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_5",
                pos: v2.create(-14.5, 10),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_10",
                pos: v2.create(-14.5, -0.5),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_4",
                pos: v2.create(-14.5, -10.5),
                scale: 1,
                ori: 0
            },
            {
                type: "house_window_01",
                pos: v2.create(-14.75, 6),
                scale: 1,
                ori: 0
            },
            {
                type: "house_window_01",
                pos: v2.create(-14.75, -7),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_5",
                pos: v2.create(-12.5, -13),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_5",
                pos: v2.create(-4.5, -13),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_13",
                pos: v2.create(8.5, -13),
                scale: 1,
                ori: 1
            },
            {
                type: "house_window_01",
                pos: v2.create(-8.5, -13.25),
                scale: 1,
                ori: 3
            },
            {
                type: "house_door_01",
                pos: v2.create(-2, -13.25),
                scale: 1,
                ori: 3
            },
            {
                type: "brick_wall_ext_8",
                pos: v2.create(14.5, 8.5),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_9",
                pos: v2.create(14.5, -3),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_2",
                pos: v2.create(14.5, -11.5),
                scale: 1,
                ori: 0
            },
            {
                type: "house_window_01",
                pos: v2.create(14.75, -9),
                scale: 1,
                ori: 2
            },
            {
                type: "house_window_01",
                pos: v2.create(14.75, 3),
                scale: 1,
                ori: 2
            },
            {
                type: e.house_wall_int_5 || "house_wall_int_5",
                pos: v2.create(-0.5, 10),
                scale: 1,
                ori: 0
            },
            {
                type:
                    e.house_wall_int_14 || "house_wall_int_14",
                pos: v2.create(-7, 3),
                scale: 1,
                ori: 1
            },
            {
                type:
                    e.house_wall_int_11 || "house_wall_int_11",
                pos: v2.create(-8.5, -2),
                scale: 1,
                ori: 1
            },
            {
                type: e.house_wall_int_4 || "house_wall_int_4",
                pos: v2.create(12, 1),
                scale: 1,
                ori: 1
            },
            {
                type: e.house_wall_int_4 || "house_wall_int_4",
                pos: v2.create(12, -7),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_01",
                pos: v2.create(-0.5, 3.5),
                scale: 1,
                ori: 0
            },
            {
                type: "house_door_01",
                pos: v2.create(-3.5, -1.5),
                scale: 1,
                ori: 0
            },
            {
                type: e.house_column_1 || "house_column_1",
                pos: v2.create(4, -3),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ toilet_01: 5, toilet_02: 1 }),
                pos: v2.create(-11.75, 0.5),
                scale: 1,
                ori: 1
            },
            {
                type: e.stand || "",
                pos: v2.create(-12.5, 11),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ drawers_01: 7, drawers_02: 1 }),
                pos: v2.create(-3.75, 11),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ bookshelf_01: 7, bookshelf_02: 1 }),
                pos: v2.create(13, -3),
                scale: 1,
                ori: 3
            },
            {
                type: "table_03",
                pos: v2.create(-8.5, -6),
                scale: 1,
                ori: 0
            },
            {
                type: "oven_01",
                pos: v2.create(-12.25, -11),
                scale: 1,
                ori: 2
            },
            {
                type: "refrigerator_01",
                pos: v2.create(-4.5, -11),
                scale: 1,
                ori: 2
            },
            {
                type: e.plant || "bush_02",
                pos: e.plant_pos || v2.create(2, 10.5),
                scale: 1,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: e.porch_01 || "",
                pos: v2.create(-4.5, -15.5),
                scale: 0.9,
                ori: 0
            },
            {
                type: e.porch_01 || "",
                pos: v2.create(5.75, 15.5),
                scale: 0.9,
                ori: 2
            },
            {
                type: "loot_tier_1",
                pos: v2.create(0, -4.5),
                scale: 1,
                ori: 0
            },
            {
                type: e.plant_loot || "",
                pos: v2.create(4.25, 8.5),
                scale: 1,
                ori: 0
            },
            {
                type: e.plant_loot || "",
                pos: v2.create(3.75, 8.5),
                scale: 1,
                ori: 0
            },
            {
                type: e.plant_loot || "",
                pos: v2.create(4, 8.25),
                scale: 1,
                ori: 0
            },
            {
                type: "grill_01",
                pos: v2.create(6, -15.25),
                scale: 1,
                ori: 0
            }
        ]
    };
    return util.mergeDeep(t, e || {});
}
function we(e) {
    const t = {
        type: "building",
        map: { display: !0, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        floor: {
            surfaces: [
                {
                    type: "shack",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0.9),
                            v2.create(5.6, 3.5)
                        )
                    ]
                },
                {
                    type: "asphalt",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(3.75, -4),
                            v2.create(2.25, 1.5)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-building-shack-floor-01.img",
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 0.9),
                        v2.create(5.6, 3.5)
                    ),
                    zoomOut: collider.createAabbExtents(
                        v2.create(0, 0.8),
                        v2.create(5.9, 3.8)
                    )
                }
            ],
            vision: { width: 4 },
            imgs: [
                {
                    sprite: "map-building-shack-ceiling-01.img",
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215
                }
            ],
            destroy: {
                wallCount: 2,
                particle: "shackBreak",
                particleCount: 25,
                residue: "map-shack-res-01.img"
            }
        },
        mapObjects: [
            {
                type: "shack_wall_bot",
                pos: v2.create(-1.49, -2.4),
                scale: 1,
                ori: 0
            },
            {
                type: "shack_wall_side_left",
                pos: v2.create(-5.55, 0.69),
                scale: 1,
                ori: 0
            },
            {
                type: "shack_wall_top",
                pos: v2.create(-0.3, 4.33),
                scale: 1,
                ori: 0
            },
            {
                type: "shack_wall_side_right",
                pos: v2.create(5.55, 0.95),
                scale: 1,
                ori: 0
            },
            {
                type: "crate_01",
                pos: v2.create(7.9, 2.85),
                scale: 0.8,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "barrel_01",
                pos: v2.create(7.45, -0.9),
                scale: 0.85,
                ori: 0
            },
            {
                type: randomObstacleType({ loot_tier_2: 1 }),
                pos: v2.create(-2, 0.8),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ loot_tier_1: 1, "": 1 }),
                pos: v2.create(2, 0.8),
                scale: 1,
                ori: 0
            }
        ]
    };
    return util.mergeDeep(t, e || {});
}
function fe(e) {
    const t = {
        type: "building",
        map: { display: !0, color: 4014894, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 1,
        floor: {
            surfaces: [
                {
                    type: "shack",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 1),
                            v2.create(5, 4)
                        )
                    ]
                },
                {
                    type: "asphalt",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, -4),
                            v2.create(2, 1)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-building-shack-floor-02.img",
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 1),
                        v2.create(4.75, 3.75)
                    )
                }
            ],
            vision: { width: 4 },
            imgs: [
                {
                    sprite: "map-building-shack-ceiling-02.img",
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215
                }
            ],
            destroy: {
                wallCount: 2,
                particle: "shackBreak",
                particleCount: 25,
                residue: "map-shack-res-02.img"
            }
        },
        mapObjects: [
            {
                type: "barn_wall_int_2",
                pos: v2.create(-3, -2.5),
                scale: 1,
                ori: 1
            },
            {
                type: "barn_wall_int_2",
                pos: v2.create(3, -2.5),
                scale: 1,
                ori: 1
            },
            {
                type: "barn_wall_int_8",
                pos: v2.create(-4.5, 1),
                scale: 1,
                ori: 0
            },
            {
                type: "barn_wall_int_8",
                pos: v2.create(4.5, 1),
                scale: 1,
                ori: 0
            },
            {
                type: "barn_wall_int_8",
                pos: v2.create(0, 4.5),
                scale: 1,
                ori: 1
            },
            {
                type: "barrel_01",
                pos: v2.create(4, -4.5),
                scale: 0.8,
                ori: 0
            },
            {
                type: randomObstacleType({ loot_tier_1: 1 }),
                pos: v2.create(0, 1),
                scale: 1,
                ori: 0
            }
        ]
    };
    return util.mergeDeep(t, e || {});
}
function _e(e) {
    const t = {
        type: "building",
        map: {
            display: !0,
            shapes: [
                {
                    collider: collider.createAabbExtents(
                        v2.create(27, 0),
                        v2.create(3, 12.25)
                    ),
                    color: 10066329
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(-27, 0),
                        v2.create(3, 12.25)
                    ),
                    color: 10066329
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(24.5, 12.25)
                    ),
                    color: 5915450
                }
            ]
        },
        zIdx: 1,
        terrain: { grass: !0, beach: !1 },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(0, 0),
                v2.create(35, 16)
            )
        ],
        floor: {
            surfaces: [
                {
                    type: "warehouse",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(32, 12.5)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-building-warehouse-floor-01.img",
                    pos: v2.create(-15.615, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-warehouse-floor-01.img",
                    pos: v2.create(15.615, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 2
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(24.5, 12.25)
                    ),
                    zoomOut: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(32, 12.5)
                    )
                }
            ],
            vision: { dist: 8, width: 5 },
            imgs: [
                {
                    sprite: "map-building-warehouse-ceiling-01.img",
                    scale: 1,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        mapObjects: [
            {
                type: "warehouse_wall_side",
                pos: v2.create(0, 11.9),
                scale: 1,
                ori: 0
            },
            {
                type: "warehouse_wall_edge",
                pos: v2.create(-24.4, 8.2),
                scale: 1,
                ori: 0
            },
            {
                type: "warehouse_wall_edge",
                pos: v2.create(24.4, 8.2),
                scale: 1,
                ori: 0
            },
            {
                type: "warehouse_wall_side",
                pos: v2.create(0, -11.9),
                scale: 1,
                ori: 0
            },
            {
                type: "warehouse_wall_edge",
                pos: v2.create(-24.4, -8.2),
                scale: 1,
                ori: 0
            },
            {
                type: "warehouse_wall_edge",
                pos: v2.create(24.4, -8.2),
                scale: 1,
                ori: 0
            },
            {
                type: e.topLeftObs,
                pos: v2.create(-21.25, 8.75),
                scale: 1,
                ori: 0,
                inheritOri: !1,
                ignoreMapSpawnReplacement:
                    e.ignoreMapSpawnReplacement
            },
            {
                type: "crate_04",
                pos: v2.create(-16.25, 8.75),
                scale: 1,
                ori: 1
            },
            {
                type: "crate_01",
                pos: v2.create(-21.25, -8.75),
                scale: 1,
                ori: 0,
                inheritOri: !1,
                ignoreMapSpawnReplacement:
                    e.ignoreMapSpawnReplacement
            },
            {
                type: "barrel_01",
                pos: v2.create(-16.5, -8.75),
                scale: 0.9,
                ori: 0
            },
            {
                type: e.topRightObs,
                pos: v2.create(21.25, 8.75),
                scale: 1,
                ori: 0,
                inheritOri: !1,
                ignoreMapSpawnReplacement:
                    e.ignoreMapSpawnReplacement
            },
            {
                type: "barrel_01",
                pos: v2.create(16.5, 8.75),
                scale: 0.9,
                ori: 0
            },
            {
                type: "crate_04",
                pos: v2.create(16.25, -8.75),
                scale: 1,
                ori: 1
            },
            {
                type: e.botRightObs,
                pos: v2.create(21.25, -8.75),
                scale: 1,
                ori: 0,
                inheritOri: !1,
                ignoreMapSpawnReplacement:
                    e.ignoreMapSpawnReplacement
            },
            {
                type: randomObstacleType({ crate_02: 1, crate_01: 3 }),
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0,
                inheritOri: !1,
                ignoreMapSpawnReplacement:
                    e.ignoreMapSpawnReplacement
            },
            {
                type: "crate_01",
                pos: v2.create(5, 0),
                scale: 1,
                ori: 0,
                inheritOri: !1,
                ignoreMapSpawnReplacement:
                    e.ignoreMapSpawnReplacement
            },
            {
                type: "crate_01",
                pos: v2.create(-5, 0),
                scale: 1,
                ori: 0,
                inheritOri: !1,
                ignoreMapSpawnReplacement:
                    e.ignoreMapSpawnReplacement
            },
            {
                type: "crate_04",
                pos: v2.create(0, 5),
                scale: 1,
                ori: 0
            },
            {
                type: "crate_04",
                pos: v2.create(0, -5),
                scale: 1,
                ori: 0
            },
            {
                type: e.decoration_01 || "",
                pos: v2.create(-9, 6),
                scale: 1,
                ori: 0
            },
            {
                type: e.decoration_01 || "",
                pos: v2.create(9, -6),
                scale: 1,
                ori: 0
            }
        ]
    };
    return util.mergeDeep(t, e || {});
}
function be(e) {
    const t = {
        type: "building",
        map: {
            display: !0,
            shapes: [
                {
                    collider: collider.createAabbExtents(
                        v2.create(25, 0),
                        v2.create(3, 12.25)
                    ),
                    color: 10066329
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(-25, 0),
                        v2.create(3, 12.25)
                    ),
                    color: 10066329
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(22.5, 12.25)
                    ),
                    color: 2240064
                }
            ]
        },
        zIdx: 1,
        terrain: { grass: !0, beach: !1 },
        floor: {
            surfaces: [
                {
                    type: "warehouse",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(27.5, 12.5)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-building-warehouse-floor-02.img",
                    pos: v2.create(-13.72, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 0
                },
                {
                    sprite: "map-building-warehouse-floor-02.img",
                    pos: v2.create(13.72, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 2
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(22, 12.25)
                    ),
                    zoomOut: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(27.5, 12.5)
                    )
                }
            ],
            vision: { dist: 8, width: 5 },
            imgs: [
                {
                    sprite: "map-building-warehouse-ceiling-02.img",
                    scale: 1,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        mapObjects: [
            {
                type: "metal_wall_ext_43",
                pos: v2.create(0, 12),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_8",
                pos: v2.create(-21.9, 8.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_8",
                pos: v2.create(21.9, 8.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_43",
                pos: v2.create(0, -12),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_8",
                pos: v2.create(-21.9, -8.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_8",
                pos: v2.create(21.9, -8.5),
                scale: 1,
                ori: 0
            },
            {
                type: "crate_01",
                pos: v2.create(-18.75, 8.75),
                scale: 1,
                ori: 0,
                inheritOri: !1,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "barrel_01",
                pos: v2.create(-14, 8.75),
                scale: 0.9,
                ori: 0
            },
            {
                type: "crate_06",
                pos: v2.create(-18.75, -6),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ loot_tier_1: 1, "": 1 }),
                pos: v2.create(-19.5, -9.5),
                scale: 1,
                ori: 0
            },
            {
                type: "crate_06",
                pos: v2.create(18.75, 6),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ loot_tier_1: 1, "": 1 }),
                pos: v2.create(19.5, 9.5),
                scale: 1,
                ori: 0
            },
            {
                type: "crate_01",
                pos: v2.create(18.75, -8.75),
                scale: 1,
                ori: 0,
                inheritOri: !1,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "barrel_01",
                pos: v2.create(14, -8.75),
                scale: 0.9,
                ori: 0
            },
            {
                type: randomObstacleType({ crate_08: 24, crate_09: 1 }),
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "crate_01",
                pos: v2.create(0, 5),
                scale: 1,
                ori: 0,
                inheritOri: !1,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "crate_01",
                pos: v2.create(0, -5),
                scale: 1,
                ori: 0,
                inheritOri: !1,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "crate_06",
                pos: v2.create(4, -5),
                scale: 1,
                ori: 1
            },
            {
                type: "crate_06",
                pos: v2.create(-4, 5),
                scale: 1,
                ori: 1
            },
            {
                type: "barrel_01",
                pos: v2.create(4.5, 0),
                scale: 0.9,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "barrel_01",
                pos: v2.create(-4.5, 0),
                scale: 0.9,
                ori: 0,
                inheritOri: !1
            }
        ]
    };
    return util.mergeDeep(t, e || {});
}
function xe(e) {
    const t = {
        type: "obstacle",
        scale: { createMin: 1, createMax: 1, destroy: 1 },
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(0.4, 2)
        ),
        height: 10,
        collidable: !0,
        destructible: !0,
        isWindow: !0,
        health: 1,
        hitParticle: "glassChip",
        explodeParticle: "windowBreak",
        reflectBullets: !1,
        loot: [],
        destroyType: "house_window_broken_01",
        img: {
            sprite: "map-building-house-window-01.img",
            residue: "none",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "glass_bullet",
            punch: "glass_bullet",
            explode: "window_break_01",
            enter: "none"
        }
    };
    return util.mergeDeep(t, e || {});
}
function Se(e) {
    const t = {
        type: "obstacle",
        scale: { createMin: 1, createMax: 1, destroy: 1 },
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(0.4, 2)
        ),
        height: 0.2,
        isWall: !0,
        collidable: !0,
        destructible: !1,
        health: 100,
        hitParticle: "woodChip",
        explodeParticle: "woodPlank",
        reflectBullets: !1,
        loot: [],
        img: {
            sprite: "map-building-house-window-res-01.img",
            scale: 0.5,
            alpha: 1,
            tint: 4456448,
            zIdx: 10
        },
        sound: {
            bullet: "wall_wood_bullet",
            punch: "wall_wood_bullet",
            explode: "",
            enter: "none"
        }
    };
    return util.mergeDeep(t, e || {});
}

const MaterialDefs = {
    metal: {
        destructible: !1,
        reflectBullets: !0,
        hitParticle: "barrelChip",
        explodeParticle: "barrelBreak",
        sound: {
            bullet: "wall_bullet",
            punch: "metal_punch",
            explode: "barrel_break_01",
            enter: "none"
        }
    },
    wood: {
        destructible: !0,
        reflectBullets: !1,
        sound: {
            bullet: "wall_wood_bullet",
            punch: "wall_wood_bullet",
            explode: "wall_break_01",
            enter: "none"
        }
    },
    woodPerm: {
        destructible: !1,
        reflectBullets: !1,
        sound: {
            bullet: "wall_wood_bullet",
            punch: "wall_wood_bullet",
            explode: "wall_break_01",
            enter: "none"
        }
    },
    brick: {
        destructible: !1,
        reflectBullets: !1,
        hitParticle: "brickChip",
        sound: {
            bullet: "wall_brick_bullet",
            punch: "wall_brick_bullet",
            explode: "wall_break_01",
            enter: "none"
        }
    },
    concrete: {
        destructible: !1,
        reflectBullets: !1,
        hitParticle: "barrelChip",
        sound: {
            bullet: "concrete_hit",
            punch: "concrete_hit",
            explode: "wall_break_01",
            enter: "none"
        }
    },
    stone: {
        destructible: !0,
        stonePlated: !0,
        reflectBullets: !1,
        hitParticle: "rockChip",
        explodeParticle: "rockBreak",
        sound: {
            bullet: "concrete_hit",
            punch: "concrete_hit",
            explode: "stone_break_01",
            enter: "none"
        }
    },
    glass: {
        destructible: !0,
        reflectBullets: !1,
        hitParticle: "glassChip",
        explodeParticle: "windowBreak",
        sound: {
            bullet: "glass_bullet",
            punch: "glass_bullet",
            explode: "window_break_01",
            enter: "none"
        }
    },
    cobalt: {
        destructible: !1,
        reflectBullets: !0,
        hitParticle: "barrelChip",
        explodeParticle: "barrelBreak",
        sound: {
            bullet: "cobalt_bullet",
            punch: "cobalt_bullet",
            explode: "barrel_break_01",
            enter: "none"
        }
    }
};

/**
 * @type {Object.<string, import('./mapObjectsTyping.ts').MapObjectDefs>}
 */
export const MapObjectDefs = {
    barrel_01: createBarrel({}),
    barrel_01b: createBarrel({
        img: { tint: 13224393 },
        loot: [
            tierLoot("tier_surviv", 2, 3),
            autoLoot("mirv", 1),
            autoLoot("mirv", 1),
            autoLoot("mirv", 1)
        ]
    }),
    barrel_02: l({ health: 60 }),
    barrel_03: l({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(1.25, 0.5)
        ),
        health: 20,
        img: {
            sprite: "map-barrel-03.img",
            residue: "map-barrel-res-03.img",
            scale: 0.45
        }
    }),
    barrel_04: l({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(1.25, 0.5)
        ),
        health: 20,
        loot: [tierLoot("tier_soviet", 2, 3)],
        img: {
            sprite: "map-barrel-04.img",
            residue: "map-barrel-res-03.img",
            scale: 0.45
        }
    }),
    propane_01: createBarrel({
        collision: collider.createCircle(v2.create(0, 0), 1.25),
        health: 50,
        map: { display: !0, color: 24516, scale: 1 },
        img: { sprite: "map-propane-01.img", scale: 0.4 }
    }),
    bed_sm_01: c({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(1.4, 3.4)
        ),
        img: { sprite: "map-bed-01.img" }
    }),
    bed_lg_01: c({
        img: { residue: "map-bed-res-02.img" }
    }),
    bollard_01: {
        type: "obstacle",
        scale: { createMin: 1, createMax: 1, destroy: 1 },
        collision: collider.createCircle(v2.create(0, 0), 1.25),
        height: 0.5,
        collidable: !0,
        destructible: !1,
        health: 300,
        hitParticle: "barrelChip",
        explodeParticle: "barrelBreak",
        reflectBullets: !0,
        loot: [],
        map: { display: !0, color: 6310464, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        img: {
            sprite: "map-bollard-01.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "silo_bullet",
            punch: "silo_bullet",
            explode: "barrel_break_01",
            enter: "none"
        }
    },
    bookshelf_01: m({
        img: { sprite: "map-bookshelf-01.img" },
        loot: [tierLoot("tier_world", 1, 1)]
    }),
    bookshelf_02: m({
        img: { sprite: "map-bookshelf-02.img" },
        loot: [tierLoot("tier_soviet", 2, 3)]
    }),
    bush_01: u({}),
    bush_01b: u({ img: { alpha: 1 } }),
    bush_01cb: u({
        img: { sprite: "map-bush-01cb.img" },
        map: { color: 2518873 }
    }),
    bush_01f: u({
        img: { sprite: "map-bush-01f.img" },
        map: { color: 1793032 }
    }),
    bush_01sv: u({
        hitParticle: "leafPrickly",
        explodeParticle: "leafPrickly",
        img: {
            sprite: "map-bush-01sv.img",
            residue: "map-bush-res-01sv.img"
        },
        map: { color: 7569455 }
    }),
    brush_01sv: u({
        scale: {
            createMin: 1.5,
            createMax: 1.75,
            destroy: 0.75
        },
        health: 150,
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(1.75, 1.75)
        ),
        hitParticle: "leaf",
        explodeParticle: "leaf",
        img: {
            sprite: "map-brush-01sv.img",
            residue: "map-brush-res-02sv.img"
        },
        map: { color: 5207588 }
    }),
    brush_02sv: u({
        scale: {
            createMin: 1.5,
            createMax: 1.75,
            destroy: 0.75
        },
        health: 150,
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(1.75, 1.75)
        ),
        hitParticle: "leaf",
        explodeParticle: "leaf",
        img: {
            sprite: "map-brush-02sv.img",
            residue: "map-brush-res-02sv.img"
        },
        map: { color: 5207588 }
    }),
    bush_01x: u({
        map: { color: 4545840 },
        img: { sprite: "map-bush-01x.img" }
    }),
    bush_02: u({ img: { residue: "map-bush-res-02.img" } }),
    bush_03: u({
        img: { sprite: "map-bush-03.img", alpha: 1 }
    }),
    bush_04: u({
        hitParticle: "leafRiver",
        explodeParticle: "leafRiver",
        img: {
            sprite: "map-bush-04.img",
            residue: "map-bush-res-04.img",
            alpha: 1,
            scale: 0.5
        },
        terrain: {
            grass: !0,
            river: { centerWeight: 0.3 },
            riverShore: !0
        },
        sound: { enter: "bush_enter_02" }
    }),
    bush_04cb: u({
        hitParticle: "leafRiver",
        explodeParticle: "leafRiver",
        img: {
            sprite: "map-bush-04cb.img",
            residue: "map-bush-res-04.img",
            alpha: 1,
            scale: 0.5
        },
        terrain: {
            grass: !0,
            river: { centerWeight: 0.3 },
            riverShore: !0
        },
        sound: { enter: "bush_enter_02" },
        map: { color: 2784099 }
    }),
    bush_05: u({
        img: {
            sprite: "map-bush-05.img",
            residue: "map-bush-res-05.img"
        },
        map: { color: 6971965 }
    }),
    bush_06: u({
        collision: collider.createCircle(v2.create(0, 0), 1.75),
        img: {
            sprite: "map-bush-06.img",
            residue: "map-bush-res-06.img"
        },
        map: { display: !0, color: 6971965, scale: 1.5 }
    }),
    bush_06b: u({
        scale: { createMin: 1, createMax: 1 },
        collision: collider.createCircle(v2.create(0, 0), 1.75),
        img: {
            sprite: "map-bush-06.img",
            residue: "map-bush-res-06.img",
            alpha: 1
        },
        map: { display: !0, color: 14041344, scale: 1.5 }
    }),
    bush_07: u({
        hitParticle: "leafRiver",
        explodeParticle: "leafRiver",
        img: {
            sprite: "map-bush-07.img",
            alpha: 1,
            scale: 0.5
        },
        sound: { enter: "bush_enter_02" }
    }),
    bush_07sp: u({
        hitParticle: "leafRiver",
        explodeParticle: "leafRiver",
        map: { display: !0, color: 671242, scale: 1.5 },
        img: {
            sprite: "map-bush-07sp.img",
            alpha: 1,
            scale: 0.5
        },
        sound: { enter: "bush_enter_02" }
    }),
    bush_07x: u({ img: { sprite: "map-bush-07x.img" } }),
    case_01: y({ loot: [autoLoot("deagle", 1)] }),
    case_02: y({
        img: { sprite: "map-case-deagle-02.img" },
        loot: [autoLoot("deagle", 1), autoLoot("deagle", 1)]
    }),
    case_03: y({
        health: 140,
        img: {
            sprite: "map-case-hatchet-01.img",
            residue: "map-case-hatchet-res-01.img"
        },
        loot: [tierLoot("tier_hatchet", 1, 1)],
        hitParticle: "blackChip"
    }),
    case_04: y({
        health: 140,
        img: {
            sprite: "map-case-flare-01.img",
            residue: "map-case-flare-res-01.img"
        },
        loot: [autoLoot("flare_gun", 1)],
        hitParticle: "blackChip",
        map: { display: !0, color: 7025920, scale: 0.85 }
    }),
    case_05: y({
        health: 140,
        img: {
            sprite: "map-case-meteor-01.img",
            residue: "map-case-meteor-res-01.img"
        },
        loot: [
            autoLoot("flare_gun", 1),
            autoLoot("strobe", 1),
            autoLoot("strobe", 1),
            autoLoot("strobe", 1),
            autoLoot("strobe", 1)
        ],
        hitParticle: "blackChip",
        map: { display: !1, color: 7025920, scale: 0.85 }
    }),
    case_06: y({
        health: 140,
        img: { sprite: "map-case-chrys-01.img" },
        loot: [
            tierLoot("tier_chest", 2, 3),
            tierLoot("tier_chrys_case", 1, 1)
        ],
        hitParticle: "blackChip",
        map: { display: !1, color: 7025920, scale: 0.85 }
    }),
    case_07: y({
        health: 200,
        img: { sprite: "map-case-ring-01.img" },
        loot: [tierLoot("tier_ring_case", 1, 1)],
        hitParticle: "blackChip",
        map: { display: !1, color: 7025920, scale: 0.85 }
    }),
    chest_01: w({
        loot: [
            tierLoot("tier_chest", 3, 4),
            tierLoot("tier_pirate_melee", 1, 1),
            autoLoot("outfitRoyalFortune", 1)
        ]
    }),
    chest_01cb: w({
        loot: [
            tierLoot("tier_chest", 3, 4),
            tierLoot("tier_pirate_melee", 1, 1)
        ]
    }),
    chest_02: w({
        img: { sprite: "map-chest-02.img" },
        loot: [tierLoot("tier_chest", 2, 2)],
        map: { display: !0, color: 7025920, scale: 0.85 }
    }),
    chest_03: f({
        img: { sprite: "map-chest-03.img" },
        loot: [
            tierLoot("tier_chest", 3, 5),
            autoLoot("outfitWaterElem", 1)
        ]
    }),
    chest_03cb: f({
        img: { sprite: "map-chest-03.img" },
        loot: [tierLoot("tier_chest", 3, 5)]
    }),
    chest_03d: f({
        img: { sprite: "map-chest-03d.img" },
        loot: [
            tierLoot("tier_chest", 3, 5),
            autoLoot("outfitWaterElem", 1)
        ]
    }),
    chest_03f: f({
        img: { sprite: "map-chest-03f.img" },
        loot: [tierLoot("tier_chest", 3, 5), autoLoot("outfitKhaki", 1)]
    }),
    chest_03x: f({
        img: { sprite: "map-chest-03x.img" },
        loot: [
            tierLoot("tier_chest", 3, 5),
            autoLoot("outfitWaterElem", 1)
        ]
    }),
    chest_04: w({
        health: 200,
        img: { sprite: "map-case-basement-01.img" },
        loot: [
            tierLoot("tier_noir_outfit", 1, 1),
            tierLoot("tier_chest_04", 1, 1),
            autoLoot("glock_dual", 1),
            autoLoot("smoke", 4)
        ],
        map: { display: !1, color: 7025920, scale: 0.85 }
    }),
    chest_04d: w({
        health: 200,
        img: { sprite: "map-case-basement-01.img" },
        loot: [
            tierLoot("tier_noir_outfit", 1, 1),
            tierLoot("tier_chest_04", 1, 1),
            autoLoot("9mm", 300),
            autoLoot("smoke", 4),
            autoLoot("backpack02", 1)
        ],
        map: { display: !1, color: 7025920, scale: 0.85 }
    }),
    control_panel_01: C({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(2.25, 1.7)
        ),
        button: {
            interactionRad: 0.75,
            interactionText: "game-use",
            useOnce: !0,
            useType: "cell_door_01",
            useDelay: 1.1,
            useDir: v2.create(-1, 0),
            useImg: "map-control-panel-02.img",
            sound: { on: "cell_control_01", off: "" }
        },
        img: { sprite: "map-control-panel-01.img" }
    }),
    control_panel_02: C({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(2.25, 1.7)
        ),
        health: 175,
        img: { sprite: "map-control-panel-02.img" }
    }),
    control_panel_02b: C({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(2.25, 1.7)
        ),
        destructible: !1,
        button: {
            interactionRad: 0.2,
            interactionText: "game-use",
            useOnce: !0,
            useType: "",
            useDelay: 0.25,
            useDir: v2.create(-1, 0),
            useImg: "map-control-panel-01.img",
            sound: {
                on: "button_press_01",
                off: "button_press_01"
            }
        },
        img: { sprite: "map-control-panel-02.img" }
    }),
    control_panel_03: C({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(1.25, 1.2)
        ),
        health: 150,
        img: { sprite: "map-control-panel-03.img" }
    }),
    control_panel_04: C({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(2.25, 1.7)
        ),
        button: {
            interactionRad: 0.75,
            interactionText: "game-use",
            useOnce: !0,
            useType: "crossing_door_01",
            useDelay: 4.25,
            useDir: v2.create(1, 0),
            useImg: "map-control-panel-05.img",
            sound: { on: "cell_control_02", off: "" }
        },
        img: { sprite: "map-control-panel-04.img" }
    }),
    control_panel_06: C({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(2.5, 1.2)
        ),
        health: 200,
        img: { sprite: "map-control-panel-06.img" }
    }),
    switch_01: C({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(0.45, 0.55)
        ),
        destructible: !1,
        button: {
            interactionRad: 0.2,
            interactionText: "game-use",
            useOnce: !0,
            useType: "",
            useDelay: 0.25,
            useDir: v2.create(-1, 0),
            useImg: "map-switch-02.img",
            offImg: "map-switch-03.img",
            sound: {
                on: "button_press_01",
                off: "button_press_01"
            }
        },
        img: { sprite: "map-switch-01.img" }
    }),
    switch_02: C({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(0.45, 0.55)
        ),
        destructible: !1,
        img: { sprite: "map-switch-02.img" }
    }),
    switch_03: C({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(0.45, 0.55)
        ),
        destructible: !1,
        button: {
            interactionRad: 0.2,
            interactionText: "game-use",
            useOnce: !0,
            useType: "",
            useDelay: 0.25,
            useDir: v2.create(-1, 0),
            useImg: "map-switch-02.img",
            offImg: "map-switch-02.img",
            sound: { on: "button_press_01", off: "" }
        },
        img: { sprite: "map-switch-01.img" }
    }),
    couch_01: b({}),
    couch_02: b({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(3, 1.5)
        ),
        img: { sprite: "map-couch-02.img" }
    }),
    couch_02b: b({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(3, 1.5)
        ),
        img: { sprite: "map-couch-02.img", mirrorY: !0 }
    }),
    couch_03: b({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(1.5, 1.5)
        ),
        img: { sprite: "map-couch-03.img" }
    }),
    crate_01: x({}),
    crate_01x: x({ img: { sprite: "map-crate-01x.img" } }),
    crate_02: x({
        health: 140,
        loot: [tierLoot("tier_soviet", 3, 5)],
        map: { display: !1 },
        terrain: { grass: !0, beach: !1 },
        img: { sprite: "map-crate-02.img" },
        sound: { explode: "crate_break_01" }
    }),
    crate_02sv: x({
        health: 140,
        loot: [
            tierLoot("tier_soviet", 4, 5),
            tierLoot("tier_world", 1, 1)
        ],
        map: { display: !0, color: 16760832 },
        terrain: { grass: !0, beach: !1 },
        img: { sprite: "map-crate-02sv.img" },
        sound: { explode: "crate_break_01" }
    }),
    crate_02sv_lake: x({
        health: 140,
        loot: [tierLoot("tier_soviet", 5, 6)],
        map: { display: !0, color: 16760832 },
        terrain: { lakeCenter: !0 },
        img: { sprite: "map-crate-02sv.img" },
        sound: { explode: "crate_break_01" }
    }),
    crate_02x: x({
        health: 140,
        loot: [tierLoot("tier_soviet", 3, 5)],
        map: { display: !1 },
        terrain: { grass: !0, beach: !1 },
        img: { sprite: "map-crate-02x.img" },
        sound: { explode: "crate_break_01" }
    }),
    crate_02f: x({
        health: 140,
        loot: [
            tierLoot("tier_guns", 3, 3),
            tierLoot("tier_armor", 2, 2),
            tierLoot("tier_packs", 1, 1)
        ],
        map: { display: !0, color: 13369344 },
        terrain: { grass: !0, beach: !1 },
        img: { sprite: "map-crate-02f.img" },
        sound: { explode: "crate_break_01" }
    }),
    crate_02d: x({
        health: 140,
        loot: [
            autoLoot("m1014", 1, 1),
            autoLoot("helmet03_lt_aged", 1, 1),
            autoLoot("outfitRedLeaderAged", 1, 1),
            autoLoot("machete_taiga", 1, 1)
        ],
        map: { display: !0, color: 13369344 },
        terrain: { grass: !0, beach: !1 },
        img: { sprite: "map-crate-02f.img" },
        sound: { explode: "crate_break_01" }
    }),
    crate_03: x({
        health: 100,
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(1.575, 1.575)
        ),
        loot: [tierLoot("tier_throwables", 2, 4)],
        map: { color: 5066014, scale: 0.875 },
        terrain: { grass: !0, beach: !1 },
        img: { sprite: "map-crate-03.img", scale: 0.35 },
        sound: { explode: "crate_break_01" }
    }),
    crate_03x: x({
        health: 100,
        hitParticle: "glassChip",
        explodeParticle: ["glassPlank"],
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(1.575, 1.575)
        ),
        loot: [
            autoLoot("snowball", 4, 4),
            autoLoot("snowball", 4, 4),
            autoLoot("snowball", 4, 4)
        ],
        map: { color: 31863, scale: 0.875 },
        terrain: { grass: !0, beach: !1 },
        img: { sprite: "map-crate-03x.img", scale: 0.35 },
        sound: { explode: "crate_break_02" }
    }),
    crate_04: x({
        health: 225,
        destructible: !0,
        armorPlated: !0,
        hitParticle: "greenChip",
        loot: [tierLoot("tier_ammo_crate", 1, 1)],
        map: { display: !0, color: 5468244, scale: 0.875 },
        img: { sprite: "map-crate-04.img" },
        sound: {
            bullet: "ammo_crate_bullet",
            punch: "ammo_crate_bullet",
            explode: "crate_break_01"
        }
    }),
    crate_05: x({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(2, 2)
        ),
        destructible: !1,
        hitParticle: "goldChip",
        loot: [],
        map: { display: !1 },
        img: { sprite: "map-crate-05.img" },
        sound: {
            bullet: "wall_brick_bullet",
            punch: "wall_brick_bullet"
        }
    }),
    crate_06: x({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(2.25, 1.1)
        ),
        health: 175,
        destructible: !0,
        armorPlated: !0,
        hitParticle: "greenChip",
        loot: [tierLoot("tier_ammo", 1, 1)],
        map: { display: !1 },
        img: { sprite: "map-crate-06.img" },
        sound: {
            bullet: "ammo_crate_bullet",
            punch: "ammo_crate_bullet"
        }
    }),
    crate_07: x({
        health: 140,
        loot: [
            tierLoot("tier_surviv", 4, 5),
            autoLoot("ak47", 1),
            autoLoot("ak47", 1),
            autoLoot("ak47", 1),
            autoLoot("ak47", 1),
            tierLoot("tier_khaki_outfit", 1, 1),
            tierLoot("tier_khaki_outfit", 1, 1),
            tierLoot("tier_khaki_outfit", 1, 1),
            tierLoot("tier_khaki_outfit", 1, 1)
        ],
        img: { sprite: "map-crate-07.img" },
        sound: { explode: "crate_break_01" }
    }),
    crate_07b: x({
        health: 140,
        loot: [
            tierLoot("tier_armor", 4, 5),
            autoLoot("mp220", 1),
            autoLoot("mp220", 1),
            autoLoot("bar", 1),
            autoLoot("bar", 1),
            tierLoot("tier_khaki_outfit", 1, 1),
            tierLoot("tier_khaki_outfit", 1, 1),
            tierLoot("tier_khaki_outfit", 1, 1),
            tierLoot("tier_khaki_outfit", 1, 1)
        ],
        img: { sprite: "map-crate-07.img" },
        sound: { explode: "crate_break_01" }
    }),
    crate_07sv: x({
        health: 140,
        loot: [
            tierLoot("tier_surviv", 4, 5),
            autoLoot("svd", 1),
            autoLoot("svd", 1),
            autoLoot("blr", 1),
            autoLoot("blr", 1),
            tierLoot("tier_khaki_outfit", 1, 1),
            tierLoot("tier_khaki_outfit", 1, 1),
            tierLoot("tier_khaki_outfit", 1, 1),
            tierLoot("tier_khaki_outfit", 1, 1)
        ],
        img: { sprite: "map-crate-07.img" },
        sound: { explode: "crate_break_01" }
    }),
    crate_08: x({
        health: 140,
        loot: [tierLoot("tier_surviv", 2, 3)],
        map: { display: !1 },
        terrain: { grass: !0, beach: !1 },
        img: { sprite: "map-crate-08.img" },
        sound: { explode: "crate_break_01" }
    }),
    crate_09: x({
        health: 140,
        loot: [
            tierLoot("tier_chest", 1, 2),
            tierLoot("tier_conch", 1, 1)
        ],
        map: { display: !1 },
        terrain: { grass: !0, beach: !1 },
        img: { sprite: "map-crate-09.img" },
        sound: { explode: "crate_break_01" }
    }),
    crate_10: x({
        health: 200,
        scale: { destroy: 0.75 },
        loot: [
            tierLoot("tier_airdrop_uncommon", 1, 1),
            tierLoot("tier_airdrop_armor", 1, 1),
            tierLoot("tier_medical", 2, 2),
            tierLoot("tier_airdrop_scopes", 1, 1),
            tierLoot("tier_airdrop_outfits", 1, 1),
            tierLoot("tier_airdrop_melee", 1, 1),
            tierLoot("tier_airdrop_ammo", 3, 3),
            tierLoot("tier_airdrop_throwables", 1, 1)
        ],
        map: { display: !1 },
        img: {
            sprite: "map-crate-10.img",
            residue: "map-crate-res-03.img"
        },
        sound: { explode: "crate_break_01" }
    }),
    crate_11: x({
        scale: { destroy: 0.75 },
        health: 200,
        loot: [
            tierLoot("tier_airdrop_rare", 1, 1),
            tierLoot("tier_airdrop_armor", 1, 1),
            tierLoot("tier_medical", 2, 2),
            tierLoot("tier_airdrop_scopes", 1, 1),
            tierLoot("tier_airdrop_outfits", 1, 1),
            tierLoot("tier_airdrop_melee", 1, 1),
            tierLoot("tier_airdrop_ammo", 3, 3),
            tierLoot("tier_airdrop_throwables", 1, 1)
        ],
        map: { display: !1 },
        img: {
            sprite: "map-crate-11.img",
            residue: "map-crate-res-03.img"
        },
        sound: { explode: "crate_break_01" }
    }),
    crate_11h: x({
        collision: collider.createCircle(v2.create(0, 0), 2.25),
        isDecalAnchor: !0,
        scale: { destroy: 0.75 },
        health: 200,
        loot: [
            tierLoot("tier_airdrop_rare", 1, 1),
            tierLoot("tier_airdrop_armor", 1, 1),
            tierLoot("tier_medical", 2, 2),
            tierLoot("tier_airdrop_scopes", 1, 1),
            tierLoot("tier_airdrop_outfits", 1, 1),
            tierLoot("tier_outfits", 1, 1),
            tierLoot("tier_airdrop_melee", 1, 1),
            tierLoot("tier_airdrop_ammo", 3, 3),
            tierLoot("tier_airdrop_throwables", 1, 1),
            tierLoot("tier_airdrop_xp", 2, 2)
        ],
        map: { display: !1 },
        img: {
            sprite: "map-crate-11h.img",
            residue: "map-crate-res-03.img"
        },
        sound: { explode: "crate_break_01" }
    }),
    crate_10sv: x({
        health: 200,
        scale: { destroy: 0.75 },
        loot: [
            tierLoot("tier_airdrop_uncommon", 1, 1),
            tierLoot("tier_airdrop_armor", 1, 1),
            tierLoot("tier_medical", 2, 2),
            tierLoot("tier_airdrop_scopes", 1, 1),
            tierLoot("tier_airdrop_outfits", 1, 1),
            tierLoot("tier_airdrop_melee", 1, 1),
            tierLoot("tier_airdrop_ammo", 3, 3),
            tierLoot("tier_airdrop_throwables", 1, 1),
            tierLoot("tier_perks", 1, 1)
        ],
        map: { display: !1 },
        img: {
            sprite: "map-crate-10.img",
            residue: "map-crate-res-03.img"
        },
        sound: { explode: "crate_break_01" }
    }),
    crate_11sv: x({
        scale: { destroy: 0.75 },
        health: 200,
        loot: [
            tierLoot("tier_airdrop_rare", 1, 1),
            tierLoot("tier_airdrop_armor", 1, 1),
            tierLoot("tier_medical", 2, 2),
            tierLoot("tier_airdrop_scopes", 1, 1),
            tierLoot("tier_airdrop_outfits", 1, 1),
            tierLoot("tier_airdrop_melee", 1, 1),
            tierLoot("tier_airdrop_ammo", 3, 3),
            tierLoot("tier_airdrop_throwables", 1, 1),
            tierLoot("tier_perks", 2, 2)
        ],
        map: { display: !1 },
        img: {
            sprite: "map-crate-11.img",
            residue: "map-crate-res-03.img"
        },
        sound: { explode: "crate_break_01" }
    }),
    crate_11de: x({
        scale: { destroy: 0.75 },
        health: 200,
        loot: [
            tierLoot("tier_airdrop_rare", 1, 1),
            tierLoot("tier_airdrop_armor", 1, 1),
            tierLoot("tier_medical", 2, 2),
            tierLoot("tier_airdrop_scopes", 1, 1),
            tierLoot("tier_airdrop_outfits", 1, 1),
            tierLoot("tier_airdrop_melee", 1, 1),
            tierLoot("tier_airdrop_ammo", 3, 3),
            tierLoot("tier_airdrop_throwables", 1, 1),
            tierLoot("tier_perks", 1, 1)
        ],
        map: { display: !1 },
        img: {
            sprite: "map-crate-11.img",
            residue: "map-crate-res-03.img"
        },
        sound: { explode: "crate_break_01" }
    }),
    crate_11tr: x({
        scale: { destroy: 0.75 },
        health: 200,
        loot: [
            tierLoot("tier_airdrop_rare", 1, 1),
            tierLoot("tier_airdrop_armor", 1, 1),
            tierLoot("tier_medical", 2, 2),
            tierLoot("tier_airdrop_scopes", 1, 1),
            tierLoot("tier_airdrop_outfits", 1, 1),
            tierLoot("tier_airdrop_melee", 1, 1),
            tierLoot("tier_airdrop_ammo", 3, 3),
            tierLoot("tier_airdrop_throwables", 1, 1),
            tierLoot("tier_airdrop_xp", 2, 2)
        ],
        map: { display: !1 },
        img: {
            sprite: "map-crate-11.img",
            residue: "map-crate-res-03.img"
        },
        sound: { explode: "crate_break_01" }
    }),
    crate_12: x({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(3.5, 3.5)
        ),
        scale: { destroy: 0.75 },
        health: 500,
        loot: [
            tierLoot("tier_airdrop_rare", 2, 2, {
                preloadGuns: !0
            }),
            tierLoot("tier_airdrop_uncommon", 4, 6, {
                preloadGuns: !0
            }),
            tierLoot("tier_airdrop_armor", 4, 5),
            tierLoot("tier_medical", 12, 15),
            tierLoot("tier_airdrop_scopes", 6, 8),
            tierLoot("tier_airdrop_outfits", 3, 4),
            tierLoot("tier_airdrop_melee", 5, 7),
            tierLoot("tier_airdrop_ammo", 10, 12),
            tierLoot("tier_airdrop_throwables", 6, 8),
            tierLoot("tier_katanas", 1, 1)
        ],
        map: { display: !1 },
        img: {
            sprite: "map-crate-12.img",
            residue: "map-crate-res-03.img"
        },
        sound: { explode: "crate_break_01" }
    }),
    crate_13: x({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(3.5, 3.5)
        ),
        scale: { destroy: 0.75 },
        health: 200,
        loot: [
            tierLoot("tier_airdrop_mythic", 3, 4, {
                preloadGuns: !0
            }),
            tierLoot("tier_airdrop_rare", 3, 4, {
                preloadGuns: !0
            }),
            tierLoot("tier_airdrop_armor", 6, 8),
            tierLoot("tier_medical", 12, 15),
            tierLoot("tier_airdrop_scopes", 6, 8),
            tierLoot("tier_airdrop_faction_outfits", 1, 2),
            tierLoot("tier_airdrop_faction_melee", 3, 4),
            tierLoot("tier_airdrop_ammo", 10, 12),
            tierLoot("tier_airdrop_throwables", 6, 8),
            tierLoot("tier_katanas", 1, 1),
            autoLoot("strobe", 1),
            autoLoot("strobe", 1),
            autoLoot("strobe", 1)
        ],
        map: { display: !1 },
        img: {
            sprite: "map-crate-13.img",
            residue: "map-crate-res-03.img"
        },
        sound: { explode: "crate_break_01" }
    }),
    crate_14: x({
        explodeParticle: ["windowBreak", "woodPlank"],
        loot: [tierLoot("tier_throwables", 1, 1)],
        img: { sprite: "map-crate-14.img" },
        sound: { explode: "window_break_02" }
    }),
    crate_14a: x({
        explodeParticle: ["windowBreak", "woodPlank"],
        loot: [tierLoot("tier_soviet", 1, 1)],
        img: { sprite: "map-crate-14a.img" },
        sound: { explode: "window_break_02" }
    }),
    crate_15: x({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(2.7, 1.25)
        ),
        health: 100,
        loot: [tierLoot("tier_knives", 4, 4)],
        map: { display: !1 },
        terrain: { grass: !0, beach: !0 },
        img: { sprite: "map-crate-14.img" },
        sound: { explode: "crate_break_01" }
    }),
    crate_16: x({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(2.7, 1.25)
        ),
        health: 100,
        loot: [tierLoot("tier_knives", 4, 4)],
        map: { display: !1 },
        terrain: { grass: !0, beach: !0 },
        img: { sprite: "map-crate-14.img" },
        sound: { explode: "crate_break_01" }
    }),
    crate_18: x({
        health: 140,
        loot: [
            tierLoot("tier_cattle_crate", 2, 3),
            tierLoot("tier_soviet", 1, 2)
        ],
        map: { display: !0, color: 12867840, scale: 0.875 },
        terrain: { grass: !0, beach: !1 },
        img: { sprite: "map-crate-18.img" },
        sound: { explode: "crate_break_01" }
    }),
    crate_19: x({
        health: 140,
        loot: [
            tierLoot("tier_guns", 1, 3),
            tierLoot("tier_surviv", 2, 3)
        ],
        map: { display: !0, color: 4500224, scale: 0.875 },
        terrain: { grass: !0, beach: !1 },
        img: { sprite: "map-crate-19.img" },
        sound: { explode: "crate_break_01" }
    }),
    crate_20: x({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(1.7, 1.7)
        ),
        health: 75,
        hitParticle: "greenChip",
        explodeParticle: "greenPlank",
        loot: [
            tierLoot("tier_armor", 1, 1),
            tierLoot("tier_world", 1, 1)
        ],
        map: { display: !0, color: 3884335, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        img: { sprite: "map-crate-20.img" },
        sound: { explode: "crate_break_01" }
    }),
    crate_21: x({
        health: 140,
        loot: [
            tierLoot("tier_guns", 1, 2),
            tierLoot("tier_snipers", 1, 1),
            tierLoot("tier_cloud_02", 1, 1),
            tierLoot("tier_perks", 1, 1)
        ],
        map: { display: !0, color: 18799, scale: 0.875 },
        terrain: { grass: !0, beach: !1 },
        img: { sprite: "map-crate-21.img" },
        sound: { explode: "crate_break_01" }
    }),
    crate_21b: x({
        health: 140,
        loot: [
            tierLoot("tier_guns", 1, 2),
            tierLoot("tier_snipers", 1, 1),
            tierLoot("tier_cloud_02", 1, 1),
            tierLoot("tier_perks", 1, 1)
        ],
        map: { display: !1, color: 18799, scale: 0.875 },
        terrain: { grass: !0, beach: !1 },
        img: { sprite: "map-crate-21.img" },
        sound: { explode: "crate_break_01" }
    }),
    crate_22: x({
        health: 140,
        loot: [
            tierLoot("tier_guns", 3, 3),
            tierLoot("tier_armor", 2, 2),
            tierLoot("tier_packs", 1, 1)
        ],
        map: { display: !0, color: 32511 },
        terrain: { grass: !0, beach: !1 },
        img: { sprite: "map-crate-22.img" },
        sound: { explode: "crate_break_01" }
    }),
    crate_22d: x({
        health: 140,
        loot: [
            autoLoot("an94", 1, 1),
            autoLoot("helmet03_lt_aged", 1, 1),
            autoLoot("outfitBlueLeaderAged", 1, 1),
            autoLoot("kukri_trad", 1, 1)
        ],
        map: { display: !0, color: 32511 },
        terrain: { grass: !0, beach: !1 },
        img: { sprite: "map-crate-22.img" },
        sound: { explode: "crate_break_01" }
    }),
    airdrop_crate_01: S({
        button: {
            useImg: "map-airdrop-02.img",
            useParticle: "airdropCrate01",
            sound: { on: "airdrop_open_01", off: "" }
        },
        img: {
            sprite: "map-airdrop-01.img",
            residue: "none"
        },
        destroyType: "crate_10",
        explodeParticle: "airdropCrate02"
    }),
    airdrop_crate_02: S({
        button: {
            useImg: "map-airdrop-02.img",
            useParticle: "airdropCrate01",
            sound: { on: "airdrop_open_01", off: "" }
        },
        img: {
            sprite: "map-airdrop-01.img",
            residue: "none"
        },
        destroyType: "crate_11",
        explodeParticle: "airdropCrate02"
    }),
    airdrop_crate_03: S({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(4, 4)
        ),
        button: {
            useImg: "map-airdrop-04.img",
            useParticle: "airdropCrate03",
            sound: { on: "airdrop_open_01", off: "" }
        },
        img: {
            sprite: "map-airdrop-03.img",
            residue: "none"
        },
        destroyType: "crate_12",
        explodeParticle: "airdropCrate04"
    }),
    airdrop_crate_04: S({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(4, 4)
        ),
        button: {
            useImg: "map-airdrop-04.img",
            useParticle: "airdropCrate03",
            sound: { on: "airdrop_open_01", off: "" }
        },
        img: {
            sprite: "map-airdrop-03.img",
            residue: "none"
        },
        destroyType: "crate_13",
        explodeParticle: "airdropCrate04"
    }),
    airdrop_crate_01sv: S({
        button: {
            useImg: "map-airdrop-02.img",
            useParticle: "airdropCrate01",
            sound: { on: "airdrop_open_01", off: "" }
        },
        img: {
            sprite: "map-airdrop-01.img",
            residue: "none"
        },
        destroyType: "crate_10sv",
        explodeParticle: "airdropCrate02"
    }),
    airdrop_crate_02sv: S({
        button: {
            useImg: "map-airdrop-02.img",
            useParticle: "airdropCrate01",
            sound: { on: "airdrop_open_01", off: "" }
        },
        img: {
            sprite: "map-airdrop-01.img",
            residue: "none"
        },
        destroyType: "crate_11sv",
        explodeParticle: "airdropCrate02"
    }),
    airdrop_crate_02de: S({
        button: {
            useImg: "map-airdrop-02.img",
            useParticle: "airdropCrate01",
            sound: { on: "airdrop_open_01", off: "" }
        },
        img: {
            sprite: "map-airdrop-01.img",
            residue: "none"
        },
        destroyType: "crate_11de",
        explodeParticle: "airdropCrate02"
    }),
    airdrop_crate_02h: S({
        collision: collider.createCircle(v2.create(0, 0), 2.5),
        button: {
            useImg: "map-airdrop-02h.img",
            useParticle: "airdropCrate01h",
            sound: { on: "airdrop_open_01", off: "" }
        },
        img: {
            sprite: "map-airdrop-01h.img",
            residue: "none"
        },
        destroyType: "cache_pumpkin_airdrop_02",
        explodeParticle: "airdropCrate02h"
    }),
    airdrop_crate_02tr: S({
        button: {
            useImg: "map-airdrop-02.img",
            useParticle: "airdropCrate01",
            sound: { on: "airdrop_open_01", off: "" }
        },
        img: {
            sprite: "map-airdrop-01.img",
            residue: "none"
        },
        destroyType: "crate_11tr",
        explodeParticle: "airdropCrate02"
    }),
    airdrop_crate_01x: S({
        button: {
            useImg: "map-crate-13x.img",
            useParticle: "airdropCrate01x",
            sound: { on: "airdrop_open_01", off: "" }
        },
        img: {
            sprite: "map-airdrop-01x.img",
            residue: "none"
        },
        destroyType: "crate_10",
        explodeParticle: "airdropCrate02x"
    }),
    airdrop_crate_02x: S({
        button: {
            useImg: "map-crate-13x.img",
            useParticle: "airdropCrate01x",
            sound: { on: "airdrop_open_01", off: "" }
        },
        img: {
            sprite: "map-airdrop-02x.img",
            residue: "none"
        },
        destroyType: "crate_11",
        explodeParticle: "airdropCrate02x"
    }),
    class_shell_01: S({
        collision: collider.createCircle(v2.create(0, 0), 2.25),
        button: {
            useImg: "map-class-shell-01b.img",
            useParticle: "classShell01a",
            sound: { on: "airdrop_open_01", off: "" }
        },
        img: {
            sprite: "map-class-shell-01a.img",
            residue: "none"
        },
        destroyType: "class_crate_common",
        smartLoot: !0,
        explodeParticle: "classShell01b"
    }),
    class_shell_02: S({
        collision: collider.createCircle(v2.create(0, 0), 2.25),
        button: {
            useImg: "map-class-shell-02b.img",
            useParticle: "classShell02a",
            sound: { on: "airdrop_open_01", off: "" }
        },
        img: {
            sprite: "map-class-shell-02a.img",
            residue: "none"
        },
        destroyType: "class_crate_rare",
        smartLoot: !0,
        explodeParticle: "classShell02b"
    }),
    class_shell_03: S({
        collision: collider.createCircle(v2.create(0, 0), 2.25),
        button: {
            useImg: "map-class-shell-03b.img",
            useParticle: "classShell03a",
            sound: { on: "airdrop_open_01", off: "" }
        },
        img: {
            sprite: "map-class-shell-03a.img",
            residue: "none",
            zIdx: 20
        },
        destroyType: "class_crate_mythic",
        explodeParticle: "classShell03b"
    }),
    class_crate_common_scout: v({
        loot: [
            tierLoot("tier_guns_common_scout", 1, 1),
            autoLoot("crowbar_scout", 1),
            autoLoot("helmet01", 1),
            autoLoot("backpack01", 1),
            autoLoot("soda", 1),
            autoLoot("soda", 1),
            autoLoot("soda", 1)
        ],
        img: { sprite: "map-class-crate-scout.img" }
    }),
    class_crate_common_sniper: v({
        loot: [
            tierLoot("tier_guns_common_sniper", 1, 1),
            autoLoot("kukri_sniper", 1),
            autoLoot("helmet01", 1),
            autoLoot("backpack01", 1),
            autoLoot("4xscope", 1)
        ],
        img: { sprite: "map-class-crate-sniper.img" }
    }),
    class_crate_common_healer: v({
        loot: [
            tierLoot("tier_guns_common_healer", 1, 1),
            autoLoot("bonesaw_healer", 1),
            autoLoot("helmet01", 1),
            autoLoot("backpack01", 1),
            autoLoot("healthkit", 1),
            autoLoot("painkiller", 1),
            autoLoot("smoke", 3)
        ],
        img: { sprite: "map-class-crate-healer.img" }
    }),
    class_crate_common_demo: v({
        loot: [
            tierLoot("tier_guns_common_demo", 1, 1),
            autoLoot("katana_demo", 1),
            autoLoot("helmet01", 1),
            autoLoot("backpack02", 1),
            autoLoot("mirv", 1),
            autoLoot("mirv", 1),
            autoLoot("mirv", 1),
            autoLoot("mirv", 1),
            autoLoot("mirv", 1),
            autoLoot("mirv", 1)
        ],
        img: { sprite: "map-class-crate-demo.img" }
    }),
    class_crate_common_assault: v({
        loot: [
            tierLoot("tier_guns_common_assault", 2, 2),
            autoLoot("spade_assault", 1),
            autoLoot("helmet01", 1),
            autoLoot("backpack01", 1)
        ],
        img: { sprite: "map-class-crate-assault.img" }
    }),
    class_crate_common_tank: v({
        loot: [
            tierLoot("tier_guns_common_tank", 1, 1),
            autoLoot("warhammer_tank", 1),
            autoLoot("helmet02", 1),
            autoLoot("chest02", 1),
            autoLoot("backpack01", 1)
        ],
        img: { sprite: "map-class-crate-tank.img" }
    }),
    class_crate_rare_scout: v({
        loot: [
            tierLoot("tier_guns_rare_scout", 1, 1),
            autoLoot("crowbar_scout", 1),
            tierLoot("tier_airdrop_armor", 1, 1),
            tierLoot("tier_medical", 1, 1),
            tierLoot("tier_airdrop_scopes", 1, 1),
            tierLoot("tier_airdrop_ammo", 2, 2),
            tierLoot("tier_airdrop_throwables", 1, 1)
        ],
        img: { sprite: "map-class-crate-scout.img" }
    }),
    class_crate_rare_sniper: v({
        loot: [
            tierLoot("tier_guns_rare_sniper", 1, 1),
            autoLoot("kukri_sniper", 1),
            tierLoot("tier_airdrop_armor", 1, 1),
            tierLoot("tier_medical", 1, 1),
            tierLoot("tier_airdrop_scopes", 1, 1),
            tierLoot("tier_airdrop_ammo", 2, 2),
            tierLoot("tier_airdrop_throwables", 1, 1)
        ],
        img: { sprite: "map-class-crate-sniper.img" }
    }),
    class_crate_rare_healer: v({
        loot: [
            tierLoot("tier_guns_rare_healer", 1, 1),
            autoLoot("bonesaw_healer", 1),
            tierLoot("tier_airdrop_armor", 1, 1),
            tierLoot("tier_medical", 1, 1),
            tierLoot("tier_airdrop_scopes", 1, 1),
            tierLoot("tier_airdrop_ammo", 2, 2),
            tierLoot("tier_airdrop_throwables", 1, 1)
        ],
        img: { sprite: "map-class-crate-healer.img" }
    }),
    class_crate_rare_demo: v({
        loot: [
            tierLoot("tier_guns_rare_demo", 1, 1),
            autoLoot("katana_demo", 1),
            tierLoot("tier_airdrop_armor", 1, 1),
            tierLoot("tier_medical", 1, 1),
            tierLoot("tier_airdrop_scopes", 1, 1),
            tierLoot("tier_airdrop_ammo", 2, 2),
            tierLoot("tier_airdrop_throwables", 1, 1)
        ],
        img: { sprite: "map-class-crate-demo.img" }
    }),
    class_crate_rare_assault: v({
        loot: [
            tierLoot("tier_guns_rare_assault", 2, 2),
            autoLoot("spade_assault", 1),
            tierLoot("tier_airdrop_armor", 1, 1),
            tierLoot("tier_medical", 1, 1),
            tierLoot("tier_airdrop_scopes", 1, 1),
            tierLoot("tier_airdrop_ammo", 2, 2),
            tierLoot("tier_airdrop_throwables", 1, 1)
        ],
        img: { sprite: "map-class-crate-assault.img" }
    }),
    class_crate_rare_tank: v({
        loot: [
            tierLoot("tier_guns_rare_tank", 1, 1),
            autoLoot("warhammer_tank", 1),
            tierLoot("tier_airdrop_armor", 1, 1),
            tierLoot("tier_medical", 1, 1),
            tierLoot("tier_airdrop_scopes", 1, 1),
            tierLoot("tier_airdrop_ammo", 2, 2),
            tierLoot("tier_airdrop_throwables", 1, 1)
        ],
        img: { sprite: "map-class-crate-tank.img" }
    }),
    class_crate_mythic: v({
        loot: [tierLoot("tier_class_crate_mythic", 1, 1)],
        img: { sprite: "map-class-crate-03.img" }
    }),
    mil_crate_01: x({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(2.7, 1.25)
        ),
        health: 100,
        loot: [tierLoot("tier_knives", 1, 1)],
        map: { display: !1 },
        terrain: { grass: !0, beach: !0 },
        img: { sprite: "map-crate-mil-01.img" },
        sound: { explode: "crate_break_01" }
    }),
    mil_crate_02: x({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(2.7, 1.25)
        ),
        health: 100,
        loot: [
            autoLoot("ot38", 1),
            autoLoot("ot38", 1),
            autoLoot("ot38", 1),
            autoLoot("ot38", 1)
        ],
        map: { display: !1 },
        terrain: { grass: !0, beach: !0 },
        img: { sprite: "map-crate-mil-02.img" },
        sound: { explode: "crate_break_01" }
    }),
    mil_crate_03: x({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(2.7, 1.25)
        ),
        health: 100,
        loot: [autoLoot("ots38_dual", 1)],
        map: { display: !1 },
        terrain: { grass: !0, beach: !0 },
        img: { sprite: "map-crate-mil-03.img" },
        sound: { explode: "crate_break_01" }
    }),
    mil_crate_04: x({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(2.7, 1.25)
        ),
        health: 100,
        loot: [
            tierLoot("tier_guns", 1, 1),
            tierLoot("tier_throwables", 2, 3)
        ],
        map: { display: !1 },
        terrain: { grass: !0, beach: !0 },
        img: { sprite: "map-crate-mil-04.img" },
        sound: { explode: "crate_break_01" }
    }),
    mil_crate_05: x({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(2.7, 1.25)
        ),
        health: 100,
        loot: [
            tierLoot("tier_guns", 1, 2),
            tierLoot("tier_snipers", 1, 2)
        ],
        map: { display: !0, color: 3622438 },
        terrain: { grass: !0, beach: !0 },
        img: { sprite: "map-crate-mil-05.img" },
        sound: { explode: "crate_break_01" }
    }),
    bottle_01: D({
        collision: collider.createCircle(v2.create(0, 0), 0.5),
        health: 12,
        hitParticle: "bottleBrownChip",
        explodeParticle: "bottleBrownBreak",
        img: {
            sprite: "map-bottle-01.img",
            residue: "none"
        },
        loot: [],
        sound: {
            bullet: "glass_bullet",
            punch: "glass_bullet",
            explode: "window_break_01",
            enter: "none"
        }
    }),
    bottle_02: D({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(0.5, 0.5)
        ),
        health: 20,
        hitParticle: "bottleBlueChip",
        explodeParticle: "bottleBlueBreak",
        img: {
            sprite: "map-bottle-02.img",
            residue: "none"
        },
        loot: [],
        sound: {
            bullet: "glass_bullet",
            punch: "glass_bullet",
            explode: "window_break_01",
            enter: "none"
        }
    }),
    bottle_02r: E({ img: { tint: 13172736 } }),
    bottle_02o: E({
        collidable: !1,
        img: { tint: 16734720 }
    }),
    bottle_02y: E({
        collidable: !1,
        img: { tint: 16776960 }
    }),
    bottle_02g: E({ collidable: !1, img: { tint: 32768 } }),
    bottle_02b: E({ img: { tint: 27903 } }),
    bottle_02i: E({
        collidable: !1,
        img: { tint: 4915330 }
    }),
    bottle_02v: E({ img: { tint: 15631086 } }),
    bottle_04: D({
        collision: collider.createCircle(v2.create(0, 0), 0.5),
        health: 20,
        hitParticle: "bottleWhiteChip",
        explodeParticle: "bottleWhiteBreak",
        img: {
            sprite: "map-bottle-04.img",
            residue: "none"
        },
        loot: [],
        sound: {
            bullet: "glass_bullet",
            punch: "glass_bullet",
            explode: "window_break_01",
            enter: "none"
        }
    }),
    bottle_05: D({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(0.5, 0.5)
        ),
        health: 20,
        hitParticle: "bottleWhiteChip",
        explodeParticle: "bottleWhiteBreak",
        img: {
            sprite: "map-bottle-05.img",
            residue: "none"
        },
        loot: [],
        sound: {
            bullet: "glass_bullet",
            punch: "glass_bullet",
            explode: "window_break_01",
            enter: "none"
        }
    }),
    candle_01: {
        type: "obstacle",
        map: { display: !1, color: 16777215, scale: 1 },
        scale: { createMin: 1, createMax: 1, destroy: 0.5 },
        collision: collider.createCircle(v2.create(0, 0), 0.5),
        height: 0.5,
        collidable: !1,
        destructible: !1,
        health: 150,
        hitParticle: "goldChip",
        explodeParticle: "barrelBreak",
        reflectBullets: !1,
        loot: [],
        img: {
            sprite: "map-candle-01.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "none",
            punch: "none",
            explode: "none",
            enter: "none"
        }
    },
    deposit_box_01: k({
        img: { sprite: "map-deposit-box-01.img" },
        loot: [tierLoot("tier_world", 1, 1)]
    }),
    deposit_box_02: k({
        explodeParticle: "depositBoxGoldBreak",
        img: { sprite: "map-deposit-box-02.img" },
        loot: [
            tierLoot("tier_soviet", 1, 2),
            tierLoot("tier_guns", 1, 1)
        ]
    }),
    drawers_01: T({
        img: { sprite: "map-drawers-01.img" },
        loot: [tierLoot("tier_container", 1, 1)]
    }),
    drawers_02: T({
        img: { sprite: "map-drawers-02.img" },
        loot: [tierLoot("tier_soviet", 2, 3)]
    }),
    fire_ext_01: {
        type: "obstacle",
        scale: { createMin: 1, createMax: 1, destroy: 0.8 },
        collision: collider.createCircle(v2.create(0.35, 0), 1),
        height: 0.5,
        collidable: !0,
        destructible: !0,
        createSmoke: !0,
        health: 75,
        hitParticle: "redChip",
        explodeParticle: "redBreak",
        reflectBullets: !0,
        loot: [],
        map: { display: !1, color: 6697728, scale: 0.875 },
        terrain: { grass: !1, beach: !0 },
        img: {
            sprite: "map-fire-ext-01.img",
            residue: "map-fire-ext-res.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "barrel_bullet",
            punch: "barrel_bullet",
            explode: "explosion_smoke_01",
            enter: "none"
        }
    },
    grill_01: A({
        collision: collider.createCircle(v2.create(0, 0), 1.55),
        img: { sprite: "map-grill-01.img" }
    }),
    gun_mount_01: M({
        loot: [autoLoot("m870", 1)],
        img: { sprite: "map-gun-mount-01.img" }
    }),
    gun_mount_02: M({
        loot: [autoLoot("mp220", 1)],
        img: { sprite: "map-gun-mount-02.img" }
    }),
    gun_mount_03: M({
        loot: [autoLoot("qbb97", 1)],
        img: { sprite: "map-gun-mount-03.img" }
    }),
    gun_mount_04: M({
        loot: [autoLoot("woodaxe_bloody", 1)],
        img: { sprite: "map-gun-mount-04.img" }
    }),
    gun_mount_05: M({
        loot: [autoLoot("m1100", 1)],
        img: { sprite: "map-gun-mount-05.img" }
    }),
    locker_01: P({
        img: { sprite: "map-locker-01.img" },
        loot: [tierLoot("tier_world", 1, 1)]
    }),
    locker_02: P({
        img: { sprite: "map-locker-02.img" },
        loot: [tierLoot("tier_police", 1, 1)]
    }),
    locker_03: P({
        img: { sprite: "map-locker-03.img" },
        loot: [autoLoot("ak47", 1, 1), autoLoot("backpack02", 1, 1)]
    }),
    oven_01: A(),
    piano_01: {
        type: "obstacle",
        scale: {
            createMin: 1,
            createMax: 1,
            destroy: 0.75
        },
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(3.75, 1)
        ),
        height: 0.5,
        collidable: !0,
        destructible: !1,
        health: 75,
        hitParticle: "woodChip",
        explodeParticle: ["woodPlank", "book"],
        reflectBullets: !1,
        loot: [tierLoot("tier_world", 1, 1)],
        map: { display: !1, color: 6697728, scale: 0.875 },
        terrain: { grass: !1, beach: !0 },
        img: {
            sprite: "map-piano-01.img",
            residue: "map-drawers-res.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "piano_hit",
            punch: "piano_hit",
            explode: "drawers_break_01",
            enter: "none"
        }
    },
    planter_01: O({}),
    planter_02: O({
        img: { sprite: "map-planter-02.img" }
    }),
    planter_03: O({
        img: { sprite: "map-planter-03.img" }
    }),
    planter_04: O({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(1.5, 1.5)
        ),
        img: { sprite: "map-planter-04.img" },
        destructible: !1,
        button: {
            interactionRad: 0.1,
            interactionText: "game-use",
            useOnce: !0,
            useType: "",
            useDelay: 0.25,
            useDir: v2.create(1, 0),
            useImg: "map-planter-05.img",
            sound: {
                on: "watering_01",
                off: "watering_01"
            }
        }
    }),
    planter_06: O({
        img: {
            sprite: "map-planter-06.img",
            residue: "map-planter-res-02.img"
        }
    }),
    planter_07: O({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(1.5, 1.5)
        ),
        img: {
            sprite: "map-planter-07.img",
            residue: "map-planter-res-03.img"
        },
        destructible: !0
    }),
    pot_01: D({}),
    pot_02: D({
        img: { sprite: "map-pot-02.img" },
        loot: [autoLoot("spas12", 1)]
    }),
    pot_03: D({ img: { sprite: "map-pot-03.img" } }),
    pot_03b: D({
        img: { sprite: "map-pot-03.img" },
        loot: [
            autoLoot("outfitWoodsCloak", 1),
            autoLoot("backpack03", 1)
        ]
    }),
    pot_03c: D({
        img: { sprite: "map-pot-03.img" },
        loot: [tierLoot("tier_pavilion", 1, 1)]
    }),
    pot_04: D({ img: { sprite: "map-pot-04.img" } }),
    pot_05: D({
        img: { sprite: "map-pot-05.img" },
        loot: [
            autoLoot("scout_elite", 1),
            tierLoot("tier_islander_outfit", 1, 1)
        ]
    }),
    potato_01: B({}),
    potato_02: B({ img: { sprite: "map-potato-02.img" } }),
    potato_03: B({ img: { sprite: "map-potato-03.img" } }),
    power_box_01: C(),
    pumpkin_01: R({
        loot: [
            tierLoot("tier_outfits", 1, 1),
            tierLoot("tier_pumpkin_candy", 1, 1)
        ]
    }),
    pumpkin_02: R({
        health: 140,
        img: { sprite: "map-pumpkin-02.img" },
        loot: [
            tierLoot("tier_guns", 1, 2),
            tierLoot("tier_pumpkin_candy", 1, 2),
            tierLoot("tier_outfits", 1, 1)
        ]
    }),
    pumpkin_03: R({
        collision: collider.createCircle(v2.create(0, 0), 1.25),
        map: { display: !1 },
        img: {
            sprite: "map-pumpkin-03.img",
            residue: "map-pumpkin-res-03.img"
        },
        loot: [
            tierLoot("tier_pumpkin_perks", 1, 1),
            tierLoot("tier_fruit_xp", 1, 1)
        ]
    }),
    squash_01: R({
        collision: collider.createCircle(v2.create(0, 0), 1.25),
        map: { display: !1 },
        img: {
            sprite: "map-squash-01.img",
            residue: "map-squash-res-01.img"
        },
        hitParticle: "squashChip",
        explodeParticle: "squashBreak",
        loot: [
            autoLoot("turkey_shoot", 1, 1),
            tierLoot("tier_fruit_xp", 1, 1)
        ]
    }),
    refrigerator_01: q(),
    refrigerator_01b: q({
        scale: { createMin: 1, createMax: 1, destroy: 1 },
        health: 250
    }),
    recorder_01: L({ button: { sound: { on: "log_01" } } }),
    recorder_02: L({ button: { sound: { on: "log_02" } } }),
    recorder_03: L({ button: { sound: { on: "log_03" } } }),
    recorder_04: L({ button: { sound: { on: "log_04" } } }),
    recorder_05: L({ button: { sound: { on: "log_05" } } }),
    recorder_06: L({ button: { sound: { on: "log_06" } } }),
    recorder_07: L({
        button: { sound: { on: "footstep_07" } }
    }),
    recorder_08: L({
        button: { sound: { on: "footstep_08" } }
    }),
    recorder_09: L({
        button: { sound: { on: "footstep_09" } }
    }),
    recorder_10: L({
        button: { sound: { on: "cell_control_03" } }
    }),
    recorder_11: L({
        button: {
            sound: { on: "log_11" },
            useImg: "map-recorder-04.img"
        },
        img: { sprite: "map-recorder-03.img" },
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(0.75, 1.25)
        )
    }),
    recorder_12: L({
        button: {
            sound: { on: "log_12" },
            useImg: "map-recorder-04.img"
        },
        img: { sprite: "map-recorder-03.img" },
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(0.75, 1.25)
        )
    }),
    recorder_13: L({
        button: {
            sound: { on: "log_13" },
            useImg: "map-recorder-04.img"
        },
        img: { sprite: "map-recorder-03.img" },
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(0.75, 1.25)
        )
    }),
    recorder_14: L({
        button: {
            sound: { on: "log_14" },
            useImg: "map-recorder-04.img"
        },
        img: { sprite: "map-recorder-03.img" },
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(0.75, 1.25)
        )
    }),
    screen_01: {
        type: "obstacle",
        obstacleType: "furniture",
        scale: {
            createMin: 1,
            createMax: 1,
            destroy: 0.85
        },
        collision: collider.createAabbExtents(
            v2.create(0, 0.05),
            v2.create(4, 0.2)
        ),
        height: 0.5,
        collidable: !0,
        destructible: !0,
        health: 25,
        hitParticle: "clothHit",
        explodeParticle: "barrelBreak",
        reflectBullets: !1,
        loot: [],
        map: { display: !1, color: 6697728, scale: 0.875 },
        terrain: { grass: !1, beach: !0 },
        img: {
            sprite: "map-screen-01.img",
            residue: "map-screen-res-01.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "cloth_bullet",
            punch: "cloth_punch",
            explode: "screen_break_01",
            enter: "none"
        }
    },
    sandbags_01: F({}),
    sandbags_02: F({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(1.1, 1.4)
        ),
        img: { sprite: "map-sandbags-02.img" }
    }),
    silo_01: j({}),
    silo_01po: j({
        scale: { createMin: 1, createMax: 1, destroy: 0.9 },
        destructible: !0,
        health: 2500,
        loot: [autoLoot("potato_smg", 1, 1)],
        img: {
            residue: "map-smoke-res.img",
            tint: 16749645
        }
    }),
    stairs_01: {
        type: "obstacle",
        scale: { createMin: 1, createMax: 1, destroy: 1 },
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(2.5, 2)
        ),
        height: 0.5,
        collidable: !1,
        destructible: !0,
        health: 100,
        hitParticle: "woodChip",
        explodeParticle: "woodPlank",
        reflectBullets: !1,
        loot: [],
        map: { display: !1, color: 6697728, scale: 0.875 },
        terrain: { grass: !1, beach: !0 },
        img: {
            sprite: "map-stairs-broken-01.img",
            residue: "map-table-res.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 60
        },
        sound: {
            bullet: "wood_prop_bullet",
            punch: "wood_prop_bullet",
            explode: "crate_break_01",
            enter: "none"
        }
    },
    stand_01: {
        type: "obstacle",
        obstacleType: "furniture",
        scale: {
            createMin: 1,
            createMax: 1,
            destroy: 0.75
        },
        collision: collider.createAabbExtents(
            v2.create(0, 0.15),
            v2.create(1.25, 1.25)
        ),
        height: 0.5,
        collidable: !0,
        destructible: !0,
        health: 75,
        hitParticle: "woodChip",
        explodeParticle: "woodPlank",
        reflectBullets: !1,
        loot: [tierLoot("tier_world", 1, 1)],
        map: { display: !1, color: 6697728, scale: 0.875 },
        terrain: { grass: !1, beach: !0 },
        img: {
            sprite: "map-stand-01.img",
            residue: "map-drawers-res.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "wood_prop_bullet",
            punch: "wood_prop_bullet",
            explode: "drawers_break_01",
            enter: "none"
        }
    },
    stone_01: N({}),
    stone_01b: N({
        img: { residue: "map-stone-res-01b.img" }
    }),
    stone_01cb: N({
        map: { display: !0, color: 10265256, scale: 1 },
        img: {
            sprite: "map-stone-01cb.img",
            residue: "map-stone-res-01cb.img"
        }
    }),
    stone_01f: N({
        map: { display: !0, color: 8224125, scale: 1 }
    }),
    stone_01sv: N({
        scale: {
            createMin: 1.2,
            createMax: 1.5,
            destroy: 0.5
        }
    }),
    stone_01x: N({
        map: { display: !0, color: 6052956, scale: 1 },
        img: {
            sprite: "map-stone-01x.img",
            residue: "map-stone-res-01x.img"
        }
    }),
    stone_02: N({
        img: { tint: 15066597 },
        loot: [tierLoot("tier_surviv", 2, 3), autoLoot("ak47", 1)]
    }),
    stone_02sv: N({
        img: { tint: 15066597 },
        loot: [
            tierLoot("tier_surviv", 2, 3),
            autoLoot("m39", 1),
            tierLoot("tier_perks", 1, 1)
        ]
    }),
    stone_03: H({}),
    stone_03b: H({
        img: {
            sprite: "map-stone-03b.img",
            residue: "map-stone-res-01.img"
        }
    }),
    stone_03cb: H({
        img: {
            sprite: "map-stone-03cb.img",
            residue: "map-stone-res-02cb.img"
        }
    }),
    stone_03f: H({
        img: {
            sprite: "map-stone-03f.img",
            residue: "map-stone-res-02f.img"
        }
    }),
    stone_03x: H({
        img: {
            sprite: "map-stone-03x.img",
            residue: "map-stone-res-02x.img"
        }
    }),
    stone_04: N({
        stonePlated: !0,
        scale: {
            createMin: 0.8,
            createMax: 0.8,
            destroy: 0.75
        },
        hitParticle: "rockEyeChip",
        explodeParticle: "rockEyeBreak",
        loot: [tierLoot("tier_eye_block", 1, 1)],
        terrain: { grass: !0, beach: !0, riverShore: !0 },
        map: { display: !0, color: 1512466, scale: 1 },
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(1.8, 1.8)
        ),
        img: {
            sprite: "map-stone-04.img",
            residue: "map-stone-res-04.img"
        }
    }),
    stone_05: N({
        stonePlated: !0,
        hitParticle: "rockEyeChip",
        explodeParticle: "rockEyeBreak",
        loot: [tierLoot("tier_eye_stone", 1, 1)],
        terrain: { grass: !0, beach: !0, riverShore: !0 },
        map: { display: !0, color: 1512466, scale: 1 },
        collision: collider.createCircle(v2.create(0, 0), 1.7),
        img: {
            sprite: "map-stone-05.img",
            residue: "map-stone-res-01b.img"
        }
    }),
    stone_06: N({
        stonePlated: !0,
        scale: { createMin: 1, createMax: 1, destroy: 0.8 },
        height: 10,
        terrain: { grass: !0, beach: !0, riverShore: !0 },
        map: { display: !0, color: 3618615, scale: 1 },
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(4.5, 2)
        ),
        img: {
            sprite: "map-stone-06.img",
            scale: 0.5,
            residue: "map-stone-res-06.img"
        }
    }),
    stone_07: N({
        scale: { createMin: 1, createMax: 1, destroy: 0.8 },
        collision: collider.createCircle(v2.create(0, 0), 7.75),
        health: 500,
        map: { display: !0, color: 9931908, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        img: {
            sprite: "map-stone-07.img",
            residue: "map-stone-res-07.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        }
    }),
    stove_01: C({
        obstacleType: "furniture",
        scale: {
            createMin: 1,
            createMax: 1,
            destroy: 0.85
        },
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(3, 2.25)
        ),
        disableBuildingOccupied: !0,
        damageCeiling: !0,
        explosion: "explosion_stove",
        height: 10,
        health: 500,
        img: { sprite: "map-stove-01.img" },
        sound: {
            bullet: "wall_bullet",
            punch: "metal_punch",
            explode: "oven_break_01",
            enter: "none"
        }
    }),
    stove_02: C({
        obstacleType: "furniture",
        collision: collider.createCircle(v2.create(0, 0), 1.5),
        disableBuildingOccupied: !0,
        damageCeiling: !0,
        explosion: "explosion_stove",
        height: 10,
        health: 400,
        img: { sprite: "map-stove-02.img" },
        sound: {
            bullet: "wall_bullet",
            punch: "metal_punch",
            explode: "oven_break_01",
            enter: "none"
        }
    }),
    table_01: V(),
    table_01x: V({ img: { sprite: "map-table-01x.img" } }),
    table_02: V({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(4.5, 2.5)
        ),
        health: 125,
        img: {
            sprite: "map-table-02.img",
            residue: "map-table-res.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 60
        }
    }),
    table_02x: V({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(4.5, 2.5)
        ),
        health: 125,
        img: {
            sprite: "map-table-02x.img",
            residue: "map-table-res.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 60
        }
    }),
    table_03: V({
        collision: collider.createCircle(v2.create(0, 0), 2.5),
        health: 125,
        img: {
            sprite: "map-table-03.img",
            residue: "map-table-res.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 60
        }
    }),
    table_03x: V({
        collision: collider.createCircle(v2.create(0, 0), 2.5),
        health: 125,
        img: {
            sprite: "map-table-03x.img",
            residue: "map-table-res.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 60
        }
    }),
    tire_01: (function(e) {
        const t = {
            type: "obstacle",
            scale: {
                createMin: 1,
                createMax: 1,
                destroy: 0.8
            },
            collision: collider.createCircle(
                v2.create(0, 0),
                1.75
            ),
            height: 0.5,
            collidable: !0,
            destructible: !0,
            health: 1500,
            hitParticle: "blackChip",
            explodeParticle: "barrelBreak",
            reflectBullets: !1,
            loot: [],
            map: { display: !0, color: 6708838, scale: 1 },
            terrain: { grass: !0, beach: !0 },
            img: {
                sprite: "map-tire-01.img",
                scale: 0.4,
                alpha: 1,
                tint: 16777215,
                zIdx: 10
            },
            sound: {
                bullet: "cloth_bullet",
                punch: "cloth_punch",
                explode: "cloth_break_01",
                enter: "none"
            }
        };
        return util.mergeDeep(t, e || {});
    })({}),
    toilet_01: U({
        img: { sprite: "map-toilet-01.img" },
        loot: [tierLoot("tier_toilet", 2, 3)]
    }),
    toilet_02: U({
        img: { sprite: "map-toilet-02.img" },
        loot: [tierLoot("tier_soviet", 3, 4)]
    }),
    toilet_02b: U({
        img: {
            sprite: "map-toilet-02.img",
            tint: 11842740
        },
        loot: [autoLoot("fireaxe", 1, 1)]
    }),
    toilet_03: U({
        reflectBullets: !0,
        hitParticle: "barrelChip",
        explodeParticle: "toiletMetalBreak",
        img: {
            sprite: "map-toilet-03.img",
            residue: "map-toilet-res-02.img"
        },
        loot: [tierLoot("tier_world", 1, 2)],
        sound: {
            bullet: "toilet_metal_bullet",
            punch: "toilet_metal_bullet",
            explode: "toilet_break_02"
        }
    }),
    toilet_04: U({
        reflectBullets: !0,
        hitParticle: "barrelChip",
        explodeParticle: "toiletMetalBreak",
        img: {
            sprite: "map-toilet-04.img",
            residue: "map-toilet-res-02.img"
        },
        loot: [tierLoot("tier_soviet", 2, 3)],
        sound: {
            bullet: "toilet_metal_bullet",
            punch: "toilet_metal_bullet",
            explode: "toilet_break_02"
        }
    }),
    towelrack_01: m({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(3, 1)
        ),
        img: { sprite: "map-towelrack-01.img" },
        explodeParticle: ["woodPlank", "clothBreak"]
    }),
    tree_01: W(),
    tree_01cb: W({
        scale: {
            createMin: 1.1,
            createMax: 1.3,
            destroy: 0.5
        },
        collision: collider.createCircle(v2.create(0, 0), 1.2),
        aabb: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(7.75, 7.75)
        ),
        map: { color: 2900834 },
        img: { sprite: "map-tree-03cb.img" }
    }),
    tree_01sv: W({
        map: { color: 4411673 },
        img: { sprite: "map-tree-03sv.img" }
    }),
    tree_interior_01: W({ img: { zIdx: 200 } }),
    tree_01x: W({ img: { sprite: "map-tree-01x.img" } }),
    tree_02: W({
        health: 120,
        collision: collider.createCircle(v2.create(0, 0), 1.6),
        aabb: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(1.6, 1.6)
        ),
        height: 0.5,
        loot: [autoLoot("woodaxe", 1)],
        map: { display: !1 },
        scale: { createMin: 1, createMax: 1, destroy: 0.9 },
        terrain: { grass: !0, beach: !1 },
        img: {
            sprite: "map-tree-04.img",
            scale: 0.5,
            zIdx: 10
        }
    }),
    tree_02h: W({
        health: 120,
        collision: collider.createCircle(v2.create(0, 0), 1.6),
        aabb: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(1.6, 1.6)
        ),
        height: 0.5,
        loot: [autoLoot("woodaxe_bloody", 1)],
        map: { display: !1 },
        scale: { createMin: 1, createMax: 1, destroy: 0.9 },
        terrain: { grass: !0, beach: !1 },
        img: {
            sprite: "map-tree-04h.img",
            scale: 0.5,
            zIdx: 10
        }
    }),
    tree_03: W({
        img: { tint: 11645361 },
        loot: [tierLoot("tier_surviv", 2, 3), autoLoot("mosin", 1)]
    }),
    tree_03sv: W({
        map: { color: 4411673 },
        img: {
            sprite: "map-tree-03sv.img",
            tint: 11645361
        },
        loot: [tierLoot("tier_surviv", 2, 3), autoLoot("mosin", 1)]
    }),
    tree_05: W({
        collision: collider.createCircle(v2.create(0, 0), 2.3),
        aabb: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(12, 12)
        ),
        scale: { createMin: 1.2, createMax: 1.3 },
        health: 400,
        map: { color: 5911831, scale: 3 },
        img: {
            sprite: "map-tree-05.img",
            residue: "map-tree-res-02.img",
            tint: 16777215,
            scale: 0.7,
            zIdx: 801
        }
    }),
    tree_05b: W({
        collision: collider.createCircle(v2.create(0, 0), 2.3),
        aabb: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(12, 12)
        ),
        scale: { createMin: 1, createMax: 1 },
        health: 500,
        loot: [
            tierLoot("tier_shotguns", 1, 1),
            tierLoot("tier_lmgs", 1, 1),
            autoLoot("outfitTreeSpooky", 1)
        ],
        map: { color: 5911831, scale: 3 },
        img: {
            sprite: "map-tree-05.img",
            residue: "map-tree-res-02.img",
            tint: 16777215,
            scale: 0.7,
            zIdx: 801
        }
    }),
    tree_05c: W({
        collision: collider.createCircle(v2.create(0, 0), 1.05),
        aabb: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(4, 4)
        ),
        scale: { createMin: 1.6, createMax: 1.6 },
        health: 200,
        map: { color: 9064739, scale: 3 },
        img: {
            sprite: "map-tree-05c.img",
            residue: "map-tree-res-02.img",
            tint: 16777215,
            scale: 0.35,
            zIdx: 801
        }
    }),
    tree_06: W({
        img: { sprite: "map-tree-06.img" },
        map: { color: 7700520 }
    }),
    tree_07: W({
        scale: { createMin: 1, createMax: 1.2 },
        map: { color: 5199637, scale: 2.5 },
        img: { sprite: "map-tree-07.img" }
    }),
    tree_07sp: W({
        scale: { createMin: 1, createMax: 1.2 },
        map: { color: 16697057, scale: 2.5 },
        img: { sprite: "map-tree-07sp.img" },
        terrain: { grass: !0, beach: !1, riverShore: !0 }
    }),
    tree_07spr: W({
        scale: { createMin: 1, createMax: 1.2 },
        map: { color: 16697057, scale: 2.5 },
        img: { sprite: "map-tree-07sp.img" },
        terrain: { grass: !1, beach: !1, riverShore: !0 }
    }),
    tree_07su: W({
        scale: { createMin: 1, createMax: 1.2 },
        map: { color: 2185478, scale: 2.5 },
        img: { sprite: "map-tree-07su.img" }
    }),
    tree_08: W({
        scale: { createMin: 1.2, createMax: 1.4 },
        health: 225,
        map: { color: 11033868, scale: 2.5 },
        img: {
            sprite: "map-tree-08.img",
            residue: "map-tree-res-02.img",
            scale: 0.35
        }
    }),
    tree_08b: W({
        scale: { createMin: 1.75, createMax: 2 },
        health: 300,
        map: { color: 9647632, scale: 3 },
        img: {
            sprite: "map-tree-08.img",
            residue: "map-tree-res-02.img",
            tint: 14383224,
            scale: 0.35,
            zIdx: 801
        }
    }),
    tree_08c: W({
        scale: { createMin: 1.75, createMax: 2 },
        health: 500,
        loot: [
            tierLoot("tier_shotguns", 2, 3),
            tierLoot("tier_lmgs", 2, 3),
            autoLoot("outfitWoodland", 1)
        ],
        map: { color: 7817749, scale: 3 },
        img: {
            sprite: "map-tree-08.img",
            residue: "map-tree-res-02.img",
            tint: 11645361,
            scale: 0.35,
            zIdx: 801
        }
    }),
    tree_08f: W({
        scale: { createMin: 1.2, createMax: 1.6 },
        health: 200,
        map: { color: 995844, scale: 3 },
        img: {
            sprite: "map-tree-08f.img",
            residue: "map-tree-res-01.img",
            scale: 0.35,
            zIdx: 801
        }
    }),
    tree_08sp: W({
        scale: { createMin: 1.2, createMax: 1.4 },
        health: 225,
        map: { color: 16746936, scale: 2.5 },
        img: {
            sprite: "map-tree-08sp.img",
            residue: "map-tree-res-02.img",
            scale: 0.35
        },
        terrain: { grass: !0, beach: !1, riverShore: !0 }
    }),
    tree_08spb: W({
        scale: { createMin: 1.75, createMax: 2 },
        health: 300,
        map: { color: 16734619, scale: 3 },
        img: {
            sprite: "map-tree-08sp.img",
            residue: "map-tree-res-02.img",
            tint: 14383224,
            scale: 0.35,
            zIdx: 801
        },
        terrain: { grass: !0, beach: !1, riverShore: !0 }
    }),
    tree_08spc: W({
        scale: { createMin: 1.75, createMax: 2 },
        health: 500,
        loot: [
            tierLoot("tier_shotguns", 2, 3),
            tierLoot("tier_lmgs", 2, 3),
            autoLoot("outfitWoodland", 1)
        ],
        map: { color: 8268107, scale: 3 },
        img: {
            sprite: "map-tree-08sp.img",
            residue: "map-tree-res-02.img",
            tint: 11645361,
            scale: 0.35,
            zIdx: 801
        }
    }),
    tree_08spr: W({
        scale: { createMin: 1.2, createMax: 1.4 },
        health: 225,
        map: { color: 16746936, scale: 2.5 },
        img: {
            sprite: "map-tree-08sp.img",
            residue: "map-tree-res-02.img",
            scale: 0.35
        },
        terrain: { grass: !1, beach: !1, riverShore: !0 }
    }),
    tree_08su: W({
        scale: { createMin: 1.2, createMax: 1.4 },
        health: 225,
        map: { color: 2183181, scale: 2.5 },
        img: {
            sprite: "map-tree-08su.img",
            residue: "map-tree-res-01.img",
            scale: 0.35,
            zIdx: 801
        }
    }),
    tree_08sub: W({
        scale: { createMin: 1.75, createMax: 2 },
        health: 300,
        map: { color: 1785864, scale: 3 },
        img: {
            sprite: "map-tree-08su.img",
            residue: "map-tree-res-02.img",
            tint: 9211210,
            scale: 0.35,
            zIdx: 801
        },
        terrain: { grass: !0, beach: !1, riverShore: !0 }
    }),
    tree_09: W({
        health: 120,
        collision: collider.createCircle(v2.create(0, 0), 1.6),
        aabb: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(5.75, 5.75)
        ),
        height: 0.5,
        map: { display: !0, color: 8602624, scale: 1 },
        scale: {
            createMin: 1,
            createMax: 1,
            destroy: 0.75
        },
        terrain: { grass: !0, beach: !1 },
        img: {
            sprite: "map-tree-09.img",
            scale: 0.5,
            zIdx: 10
        }
    }),
    tree_10: W({
        collision: collider.createCircle(v2.create(0, 0), 1.25),
        scale: { createMin: 0.9, createMax: 1.1 },
        map: { color: 7571807, scale: 2.5 },
        img: { sprite: "map-tree-10.img" }
    }),
    tree_11: W({
        collision: collider.createCircle(v2.create(0, 0), 1.25),
        scale: { createMin: 1, createMax: 1 },
        img: {
            sprite: "map-tree-11.img",
            scale: 0.5,
            alpha: 0.92,
            zIdx: 201
        }
    }),
    tree_12: W({
        map: { color: 8032292, scale: 7 },
        img: {
            sprite: "map-tree-12.img",
            residue: "map-tree-res-12.img",
            tint: 16777215,
            zIdx: 801
        }
    }),
    tree_13: W({
        img: {
            sprite: "map-tree-13.img",
            tint: 16777215,
            zIdx: 801
        }
    }),
    tree_switch_01: G({
        img: { sprite: "map-tree-switch-01.img" }
    }),
    tree_switch_02: G({
        img: { sprite: "map-tree-switch-02.img" }
    }),
    tree_switch_03: G({
        img: { sprite: "map-tree-switch-03.img" }
    }),
    vat_01: {
        type: "obstacle",
        scale: { createMin: 1, createMax: 1, destroy: 0.9 },
        collision: collider.createCircle(v2.create(0, 0), 2),
        height: 0.5,
        collidable: !0,
        destructible: !0,
        health: 250,
        reflectBullets: !1,
        hitParticle: "glassChip",
        explodeParticle: "windowBreak",
        loot: [],
        map: { display: !0, color: 11776947, scale: 1 },
        terrain: { grass: !1, beach: !1 },
        img: {
            sprite: "map-vat-01.img",
            residue: "map-vat-res.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "glass_bullet",
            punch: "glass_bullet",
            explode: "window_break_01",
            enter: "none"
        }
    },
    vat_02: {
        type: "obstacle",
        scale: {
            createMin: 1,
            createMax: 1,
            destroy: 0.95
        },
        collision: collider.createCircle(v2.create(0, 0), 3.1),
        height: 0.5,
        collidable: !0,
        destructible: !1,
        health: 1e3,
        reflectBullets: !1,
        hitParticle: "glassChip",
        explodeParticle: "windowBreak",
        loot: [],
        map: { display: !0, color: 11776947, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        img: {
            sprite: "map-vat-02.img",
            residue: "map-vat-res.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "glass_bullet",
            punch: "glass_bullet",
            explode: "window_break_01",
            enter: "none"
        }
    },
    vending_01: (function() {
        const t = {
            type: "obstacle",
            obstacleType: "vending",
            scale: {
                createMin: 1,
                createMax: 1,
                destroy: 0.75
            },
            collision: collider.createAabbExtents(
                v2.create(0, 0.15),
                v2.create(1.7, 1.25)
            ),
            height: 0.5,
            collidable: !0,
            destructible: !0,
            health: 150,
            hitParticle: "blueChip",
            explodeParticle: ["windowBreak", "lockerBreak"],
            reflectBullets: !0,
            loot: [
                tierLoot("tier_vending_soda", 1, 3),
                autoLoot("soda", 1)
            ],
            map: {
                display: !1,
                color: 10925,
                scale: 0.875
            },
            terrain: { grass: !0, beach: !0 },
            img: {
                sprite: "map-vending-soda-01.img",
                residue: "map-vending-res.img",
                scale: 0.5,
                alpha: 1,
                tint: 16777215,
                zIdx: 10
            },
            sound: {
                bullet: "wall_bullet",
                punch: "metal_punch",
                explode: "vending_break_01",
                enter: "none"
            }
        };
        return util.mergeDeep(t, {});
    })(),
    wheel_01: K({
        button: {
            interactionRad: 1,
            interactionText: "game-use",
            useOnce: !0,
            useType: "",
            useDelay: 2.5,
            useDir: v2.create(-1, 0),
            useImg: "map-wheel-02.img",
            sound: { on: "wheel_control_01", off: "" }
        }
    }),
    wheel_02: K({ img: { sprite: "map-wheel-02.img" } }),
    wheel_03: K({ img: { sprite: "map-wheel-03.img" } }),
    woodpile_01: Z({}),
    woodpile_02: Z({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(6, 3)
        ),
        health: 400,
        destructible: !0,
        img: {
            sprite: "map-woodpile-02.img",
            residue: "map-woodpile-res-02.img"
        }
    }),
    bank_window_01: {
        type: "obstacle",
        scale: { createMin: 1, createMax: 1, destroy: 1 },
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(0.4, 2)
        ),
        height: 10,
        collidable: !0,
        destructible: !0,
        isWindow: !0,
        health: 75,
        hitParticle: "glassChip",
        explodeParticle: ["windowBreak", "redPlank"],
        reflectBullets: !1,
        loot: [],
        img: {
            sprite: "map-building-bank-window-01.img",
            residue: "map-building-bank-window-res-01.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        sound: {
            bullet: "glass_bullet",
            punch: "glass_bullet",
            explode: "window_break_02",
            enter: "none"
        }
    },
    house_door_01: z({
        material: "wood",
        hinge: v2.create(0, 2),
        extents: v2.create(0.3, 2)
    }),
    house_door_02: z({
        material: "metal",
        hinge: v2.create(0, 2),
        extents: v2.create(0.3, 2),
        door: {
            sound: {
                open: "door_open_02",
                close: "door_close_02"
            }
        },
        img: { tint: 4934475 }
    }),
    house_door_03: z({
        material: "wood",
        hinge: v2.create(0, 2),
        extents: v2.create(0.5, 1.75),
        img: { sprite: "map-door-03.img" }
    }),
    house_door_05: z({
        material: "glass",
        hinge: v2.create(0, 2),
        extents: v2.create(0.3, 2),
        img: { sprite: "map-door-05.img" }
    }),
    house_door_06: z({
        material: "wood",
        hinge: v2.create(0, 1.25),
        extents: v2.create(0.3, 1.25),
        img: { sprite: "map-door-06.img" }
    }),
    crossing_door_01: z({
        material: "metal",
        hinge: v2.create(0, 2),
        extents: v2.create(0.3, 2),
        door: {
            canUse: !1,
            openOnce: !0,
            sound: {
                open: "door_open_02",
                close: "door_close_02"
            }
        },
        img: { tint: 3159362 }
    }),
    cell_door_01: z({
        material: "metal",
        hinge: v2.create(0, 2),
        extents: v2.create(0.3, 2),
        door: {
            canUse: !1,
            openOnce: !0,
            sound: {
                open: "door_open_02",
                close: "door_close_02"
            }
        },
        img: { tint: 1776411 }
    }),
    eye_door_01: z({
        material: "metal",
        hinge: v2.create(0, 2),
        extents: v2.create(0.3, 2),
        door: {
            canUse: !1,
            openOnce: !0,
            openOneWay: -1,
            sound: {
                open: "door_open_02",
                close: "door_close_02"
            }
        },
        img: { tint: 921102 }
    }),
    lab_door_01: I({ img: { tint: 5373952 } }),
    lab_door_02: I({
        door: {
            openOneWay: !0,
            slideOffset: -3.75,
            casingImg: { pos: v2.create(6, 0) }
        },
        img: { tint: 5373952 }
    }),
    lab_door_03: I({
        door: { openOneWay: !0 },
        img: { tint: 5373952 }
    }),
    lab_door_locked_01: I({
        door: {
            locked: !0,
            openOnce: !0,
            autoClose: !1,
            sound: { error: "" }
        },
        img: { tint: 5373952 }
    }),
    house_window_01: xe(),
    house_window_broken_01: Se(),
    lab_window_01: xe({
        destroyType: "lab_window_broken_01"
    }),
    lab_window_broken_01: Se({ img: { tint: 1316379 } }),
    container_05_collider: X({
        material: "metal",
        extents: v2.create(2.75, 6)
    }),
    container_05: {
        type: "building",
        scale: { createMin: 1, createMax: 1, destroy: 0.5 },
        zIdx: 1,
        map: { display: !0, color: 11485762, scale: 1 },
        terrain: { grass: !1, beach: !1 },
        floor: {
            surfaces: [
                {
                    type: "container",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(0, 0)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "",
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 2.4),
                        v2.create(2.5, 5.75)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-building-container-ceiling-05.img",
                    scale: 0.5,
                    alpha: 1,
                    tint: 11485762
                }
            ]
        },
        mapObjects: [
            {
                type: "container_05_collider",
                pos: v2.create(0, 2.4),
                scale: 1,
                ori: 0
            }
        ]
    },
    greenhouse_01: ie({}),
    greenhouse_02: ie({
        floor_images: [
            {
                sprite: "map-building-greenhouse-floor-02.img",
                pos: v2.create(0, 10),
                scale: 0.5,
                alpha: 1,
                tint: 16777215,
                rot: 2
            },
            {
                sprite: "map-building-greenhouse-floor-02.img",
                pos: v2.create(0, -10),
                scale: 0.5,
                alpha: 1,
                tint: 16777215
            },
            {
                sprite: "map-building-porch-01.img",
                pos: v2.create(0, 21),
                scale: 0.5,
                alpha: 1,
                tint: 16777215,
                rot: 0
            },
            {
                sprite: "map-building-porch-01.img",
                pos: v2.create(0, -21),
                scale: 0.5,
                alpha: 1,
                tint: 16777215,
                rot: 2
            }
        ],
        ceiling_images: [
            {
                sprite: "map-building-greenhouse-ceiling-02.img",
                scale: 1,
                alpha: 1,
                tint: 16777215
            }
        ],
        mapObjects: [
            {
                type: "glass_wall_10",
                pos: v2.create(-7, 19.5),
                scale: 1,
                ori: 1
            },
            {
                type: "glass_wall_10",
                pos: v2.create(-7, -19.5),
                scale: 1,
                ori: 1
            },
            {
                type: "glass_wall_10",
                pos: v2.create(-12.5, 15),
                scale: 1,
                ori: 0
            },
            {
                type: "glass_wall_10",
                pos: v2.create(-12.5, 5),
                scale: 1,
                ori: 0
            },
            {
                type: "glass_wall_10",
                pos: v2.create(-12.5, -15),
                scale: 1,
                ori: 0
            },
            {
                type: "glass_wall_10",
                pos: v2.create(-12.5, -5),
                scale: 1,
                ori: 0
            },
            {
                type: "glass_wall_10",
                pos: v2.create(7, 19.5),
                scale: 1,
                ori: 1
            },
            {
                type: "glass_wall_10",
                pos: v2.create(7, -19.5),
                scale: 1,
                ori: 1
            },
            {
                type: "glass_wall_10",
                pos: v2.create(12.5, 15),
                scale: 1,
                ori: 0
            },
            {
                type: "glass_wall_10",
                pos: v2.create(12.5, 5),
                scale: 1,
                ori: 0
            },
            {
                type: "glass_wall_10",
                pos: v2.create(12.5, -15),
                scale: 1,
                ori: 0
            },
            {
                type: "glass_wall_10",
                pos: v2.create(12.5, -5),
                scale: 1,
                ori: 0
            },
            {
                type: "house_door_05",
                pos: v2.create(2, 19.75),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_05",
                pos: v2.create(-2, -19.75),
                scale: 1,
                ori: 3
            },
            {
                type: randomObstacleType({ planter_06: 2, "": 1 }),
                pos: v2.create(-4.5, 14.5),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ planter_06: 2, "": 1 }),
                pos: v2.create(-7, 2.5),
                scale: 1,
                ori: 1
            },
            {
                type: randomObstacleType({ planter_06: 2, "": 1 }),
                pos: v2.create(-7, -2.5),
                scale: 1,
                ori: 1
            },
            {
                type: randomObstacleType({ planter_06: 2, "": 1 }),
                pos: v2.create(-4.5, -14.5),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ planter_06: 2, "": 1 }),
                pos: v2.create(4.5, 14.5),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ planter_06: 2, "": 1 }),
                pos: v2.create(7, 2.5),
                scale: 1,
                ori: 1
            },
            {
                type: randomObstacleType({ planter_06: 2, "": 1 }),
                pos: v2.create(7, -2.5),
                scale: 1,
                ori: 1
            },
            {
                type: randomObstacleType({ planter_06: 2, "": 1 }),
                pos: v2.create(4.5, -14.5),
                scale: 1,
                ori: 0
            },
            {
                type: "barrel_01",
                pos: v2.create(-15, 11),
                scale: 0.9,
                ori: 0
            },
            {
                type: "sandbags_02",
                pos: v2.create(-15, 7),
                scale: 1,
                ori: 0
            },
            {
                type: "sandbags_02",
                pos: v2.create(15.5, -7),
                scale: 1,
                ori: 1
            },
            {
                type: "barrel_01",
                pos: v2.create(19.5, -7),
                scale: 0.9,
                ori: 0
            },
            {
                type: "bunker_structure_08b",
                pos: v2.create(-9.5, -15.5),
                scale: 1,
                ori: 0
            }
        ]
    }),
    bunker_chrys_01: {
        type: "building",
        map: {
            display: !1,
            shapes: [
                {
                    collider: collider.createAabbExtents(
                        v2.create(0, 10),
                        v2.create(3.6, 5.8)
                    ),
                    color: 6707790
                }
            ]
        },
        terrain: { grass: !0, beach: !1 },
        zIdx: 2,
        floor: {
            surfaces: [
                {
                    type: "container",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(1.5, 3.25)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-generic-floor-03.img",
                    pos: v2.create(0, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, -0.25),
                        v2.create(1.5, 3.25)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-generic-ceiling-02.img",
                    pos: v2.create(0, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 0
                }
            ]
        },
        mapObjects: [
            {
                type: "metal_wall_ext_5",
                pos: v2.create(0, -3),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_7",
                pos: v2.create(-2, 0.1),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_7",
                pos: v2.create(2, 0.1),
                scale: 1,
                ori: 0
            }
        ]
    },
    lab_door_chrys: z({
        destructible: !1,
        material: "concrete",
        hinge: v2.create(0, 2),
        extents: v2.create(0.3, 2),
        door: {
            canUse: !1,
            openOnce: !0,
            openOneWay: !1,
            openSpeed: 7,
            autoOpen: !1,
            autoClose: !1,
            slideToOpen: !0,
            slideOffset: 3.75,
            sound: {
                open: "door_open_03",
                close: "door_close_03",
                error: "door_error_01"
            },
            casingImg: {
                sprite: "map-door-slot-01.img",
                pos: v2.create(-2, 0),
                scale: 0.5,
                alpha: 1,
                tint: 1316379
            }
        },
        img: { tint: 5373952 }
    }),
    bunker_chrys_sublevel_01: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 1,
        floor: {
            surfaces: [
                {
                    type: "bunker",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(11, -12),
                            v2.create(14.5, 9)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-chrys-chamber-floor-01a.img",
                    pos: v2.create(0, 1.85),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-bunker-chrys-chamber-floor-01b.img",
                    pos: v2.create(11, -10.75),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(11, -12),
                        v2.create(14.5, 9)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-chrys-chamber-ceiling-01.img",
                    pos: v2.create(11.5, -11),
                    scale: 1,
                    alpha: 1,
                    tint: 6182731
                }
            ]
        },
        puzzle: {
            name: "bunker_chrys_01",
            completeUseType: "lab_door_chrys",
            completeOffDelay: 1,
            completeUseDelay: 2,
            errorResetDelay: 1,
            pieceResetDelay: 10,
            sound: {
                fail: "door_error_01",
                complete: "none"
            }
        },
        mapObjects: [
            {
                type: "concrete_wall_ext_5",
                pos: v2.create(0, 4),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_26",
                pos: v2.create(-3, -8.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_9",
                pos: v2.create(3, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_19",
                pos: v2.create(14, -3),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_25",
                pos: v2.create(11, -20),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(25, -5.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(25, -17.5),
                scale: 1,
                ori: 0
            },
            {
                type: "locker_01",
                pos: v2.create(4.5, -4.15),
                scale: 1,
                ori: 0
            },
            {
                type: "locker_03",
                pos: v2.create(8, -4.15),
                scale: 1,
                ori: 0
            },
            {
                type: "barrel_01",
                pos: v2.create(0.5, -16.5),
                scale: 0.9,
                ori: 0
            },
            {
                type: "crate_01",
                pos: v2.create(12, -9.5),
                scale: 0.8,
                ori: 0
            },
            {
                type: "crate_01",
                pos: v2.create(12, -13.5),
                scale: 0.8,
                ori: 0
            },
            {
                type: "couch_01",
                pos: v2.create(15.5, -11.5),
                scale: 1,
                ori: 1
            },
            {
                type: "screen_01",
                pos: v2.create(23, -11.5),
                scale: 1,
                ori: 1
            },
            {
                type: "switch_01",
                pos: v2.create(18.5, -4.25),
                scale: 1,
                ori: 0,
                puzzlePiece: "ichi"
            },
            {
                type: "switch_01",
                pos: v2.create(21.5, -4.25),
                scale: 1,
                ori: 0,
                puzzlePiece: "shi"
            },
            {
                type: "switch_01",
                pos: v2.create(18.5, -18.75),
                scale: 1,
                ori: 2,
                puzzlePiece: "ni"
            },
            {
                type: "switch_01",
                pos: v2.create(21.5, -18.75),
                scale: 1,
                ori: 2,
                puzzlePiece: "san"
            },
            {
                type: "lab_door_chrys",
                pos: v2.create(25.5, -9.5),
                scale: 1,
                ori: 2
            },
            {
                type: "bunker_chrys_compartment_01",
                pos: v2.create(39.5, -6),
                scale: 1,
                ori: 0
            },
            {
                type: "bunker_chrys_compartment_02",
                pos: v2.create(43.5, 19),
                scale: 1,
                ori: 0
            },
            {
                type: "bunker_chrys_compartment_03",
                pos: v2.create(43.5, 43),
                scale: 1,
                ori: 0
            }
        ]
    },
    bunker_chrys_sublevel_01b: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 1,
        floor: {
            surfaces: [
                {
                    type: "bunker",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(11, -12),
                            v2.create(14.5, 9)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-chrys-chamber-floor-01a.img",
                    pos: v2.create(0, 1.85),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-bunker-chrys-chamber-floor-01b.img",
                    pos: v2.create(11, -10.75),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(11, -12),
                        v2.create(14.5, 9)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-chrys-chamber-ceiling-01.img",
                    pos: v2.create(11.5, -11),
                    scale: 1,
                    alpha: 1,
                    tint: 6182731
                }
            ]
        },
        mapObjects: [
            {
                type: "concrete_wall_ext_5",
                pos: v2.create(0, 4),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_26",
                pos: v2.create(-3, -8.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_9",
                pos: v2.create(3, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_19",
                pos: v2.create(14, -3),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_25",
                pos: v2.create(11, -20),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(25, -5.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(25, -17.5),
                scale: 1,
                ori: 0
            },
            {
                type: "locker_01",
                pos: v2.create(4.5, -4.15),
                scale: 1,
                ori: 0
            },
            {
                type: "barrel_01",
                pos: v2.create(0.5, -16.5),
                scale: 0.9,
                ori: 0
            },
            {
                type: "crate_01",
                pos: v2.create(12, -9.5),
                scale: 0.8,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "crate_01",
                pos: v2.create(12, -13.5),
                scale: 0.8,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "couch_01",
                pos: v2.create(15.5, -11.5),
                scale: 1,
                ori: 1
            },
            {
                type: "switch_02",
                pos: v2.create(18.5, -4.25),
                scale: 1,
                ori: 0
            },
            {
                type: "switch_02",
                pos: v2.create(21.5, -4.25),
                scale: 1,
                ori: 0
            },
            {
                type: "switch_02",
                pos: v2.create(18.5, -18.75),
                scale: 1,
                ori: 2
            },
            {
                type: "switch_02",
                pos: v2.create(21.5, -18.75),
                scale: 1,
                ori: 2
            },
            {
                type: "lab_door_01",
                pos: v2.create(25.5, -9.5),
                scale: 1,
                ori: 2
            },
            {
                type: "bunker_chrys_compartment_01b",
                pos: v2.create(39.5, -6),
                scale: 1,
                ori: 0
            },
            {
                type: "bunker_chrys_compartment_02b",
                pos: v2.create(43.5, 19),
                scale: 1,
                ori: 0
            },
            {
                type: "bunker_chrys_compartment_03b",
                pos: v2.create(43.5, 43),
                scale: 1,
                ori: 0
            }
        ]
    },
    vault_door_chrys_01: z({
        material: "metal",
        hinge: v2.create(1, 3.5),
        extents: v2.create(1, 3.5),
        img: { sprite: "map-door-02.img" },
        door: {
            interactionRad: 1.5,
            openSpeed: 0.23,
            openOneWay: -1,
            openDelay: 4.1,
            openOnce: !0,
            spriteAnchor: v2.create(0.2, 1),
            sound: {
                open: "none",
                close: "none",
                change: "vault_change_01"
            }
        }
    }),
    vault_door_chrys_02: z({
        material: "metal",
        hinge: v2.create(1, 3.5),
        extents: v2.create(1, 3.5),
        img: { sprite: "map-door-02.img" },
        door: {
            canUse: !1,
            spriteAnchor: v2.create(0.2, 1)
        }
    }),
    bunker_chrys_compartment_01: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 2,
        floor: {
            surfaces: [
                {
                    type: "tile",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 2),
                            v2.create(14, 13)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-chrys-compartment-floor-01a.img",
                    pos: v2.create(-12.5, -4.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-bunker-chrys-compartment-floor-01b.img",
                    pos: v2.create(3.5, 2),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 2),
                        v2.create(14, 13)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-chrys-compartment-ceiling-01a.img",
                    pos: v2.create(-10.5, -2.5),
                    scale: 1,
                    alpha: 1,
                    tint: 6182731
                },
                {
                    sprite: "map-bunker-chrys-compartment-ceiling-01b.img",
                    pos: v2.create(4, 3),
                    scale: 1,
                    alpha: 1,
                    tint: 6182731
                }
            ]
        },
        puzzle: {
            name: "bunker_chrys_02",
            completeUseType: "vault_door_chrys_01",
            completeOffDelay: 1,
            completeUseDelay: 5.5,
            errorResetDelay: 1,
            pieceResetDelay: 10,
            sound: {
                fail: "door_error_01",
                complete: "vault_change_03"
            }
        },
        mapObjects: [
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(-11, -2),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(-11, 1),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_27",
                pos: v2.create(0.5, -9),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_42",
                pos: v2.create(15.5, 10.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_34",
                pos: v2.create(-7.5, 17),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_column_4x8",
                pos: v2.create(-3.5, 14.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_column_4x8",
                pos: v2.create(11.5, 14.5),
                scale: 1,
                ori: 1
            },
            {
                type: randomObstacleType({ crate_01: 2, crate_04: 1 }),
                pos: v2.create(1.5, 5),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ crate_01: 2, crate_04: 1 }),
                pos: v2.create(1.5, 0),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ crate_01: 2, crate_04: 1 }),
                pos: v2.create(6.5, 5),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ crate_01: 2, crate_04: 1 }),
                pos: v2.create(6.5, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "vault_door_chrys_01",
                pos: v2.create(0.5, 15.5),
                scale: 1,
                ori: 3
            },
            {
                type: "loot_tier_chrys_01",
                pos: v2.create(12, -5.5),
                scale: 1,
                ori: 0
            }
        ]
    },
    bunker_chrys_compartment_01b: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 2,
        floor: {
            surfaces: [
                {
                    type: "tile",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 2),
                            v2.create(14, 13)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-chrys-compartment-floor-01a.img",
                    pos: v2.create(-12.5, -4.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-bunker-chrys-compartment-floor-01c.img",
                    pos: v2.create(3.5, 2),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 2),
                        v2.create(14, 13)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-chrys-compartment-ceiling-01a.img",
                    pos: v2.create(-10.5, -2.5),
                    scale: 1,
                    alpha: 1,
                    tint: 6182731
                },
                {
                    sprite: "map-bunker-chrys-compartment-ceiling-01b.img",
                    pos: v2.create(4, 3),
                    scale: 1,
                    alpha: 1,
                    tint: 6182731
                }
            ]
        },
        puzzle: {
            name: "bunker_chrys_02",
            completeUseType: "vault_door_chrys_02",
            completeOffDelay: 1,
            completeUseDelay: 5.5,
            errorResetDelay: 1,
            pieceResetDelay: 10,
            sound: {
                fail: "door_error_01",
                complete: "vault_change_03"
            }
        },
        mapObjects: [
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(-11, -2),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(-11, 1),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_27",
                pos: v2.create(0.5, -9),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_42",
                pos: v2.create(15.5, 10.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_34",
                pos: v2.create(-7.5, 17),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_column_4x8",
                pos: v2.create(-3.5, 14.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_column_4x8",
                pos: v2.create(11.5, 14.5),
                scale: 1,
                ori: 1
            },
            {
                type: randomObstacleType({ planter_07: 2, "": 1 }),
                pos: v2.create(-0.5, 7),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ planter_07: 2, "": 1 }),
                pos: v2.create(2.5, 7),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ planter_07: 2, "": 1 }),
                pos: v2.create(5.5, 7),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ planter_07: 2, "": 1 }),
                pos: v2.create(8.5, 7),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ planter_07: 2, "": 1 }),
                pos: v2.create(-0.5, 4),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ planter_07: 2, "": 1 }),
                pos: v2.create(8.5, 4),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ planter_07: 2, "": 1 }),
                pos: v2.create(-0.5, 1),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ planter_07: 2, "": 1 }),
                pos: v2.create(8.5, 1),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ planter_07: 2, "": 1 }),
                pos: v2.create(-0.5, -2),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ planter_07: 2, "": 1 }),
                pos: v2.create(2.5, -2),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ planter_07: 2, "": 1 }),
                pos: v2.create(5.5, -2),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ planter_07: 2, "": 1 }),
                pos: v2.create(8.5, -2),
                scale: 1,
                ori: 0
            },
            {
                type: "vault_door_chrys_02",
                pos: v2.create(0.5, 15.5),
                scale: 1,
                ori: 0
            }
        ]
    },
    bunker_chrys_compartment_02: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 2,
        floor: {
            surfaces: [
                {
                    type: "bunker",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(10, 10)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-chrys-compartment-floor-02a.img",
                    pos: v2.create(0, -2.75),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-bunker-chrys-compartment-floor-02b.img",
                    pos: v2.create(0, 9.75),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(10, 11)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-chrys-compartment-ceiling-02a.img",
                    pos: v2.create(0, 8.5),
                    scale: 1,
                    alpha: 1,
                    tint: 6182731
                },
                {
                    sprite: "map-bunker-chrys-compartment-ceiling-02b.img",
                    pos: v2.create(0, -2.5),
                    scale: 1,
                    alpha: 1,
                    tint: 6182731
                }
            ]
        },
        mapObjects: [
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(-8, 6),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(8, 6),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_6",
                pos: v2.create(-7.5, 10.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_6",
                pos: v2.create(7.5, 10.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(-4, 12),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(4, 12),
                scale: 1,
                ori: 1
            },
            {
                type: "loot_tier_chrys_02",
                pos: v2.create(8, -6.5),
                scale: 1,
                ori: 0
            },
            {
                type: "glass_wall_12",
                pos: v2.create(0, 5),
                scale: 1,
                ori: 1
            },
            {
                type: "control_panel_06",
                pos: v2.create(-8.5, 1.5),
                scale: 1,
                ori: 1
            }
        ]
    },
    bunker_chrys_compartment_02b: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 2,
        floor: {
            surfaces: [
                {
                    type: "bunker",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(10, 10)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-chrys-compartment-floor-02a.img",
                    pos: v2.create(0, -2.75),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-bunker-chrys-compartment-floor-02c.img",
                    pos: v2.create(0, 9.75),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(10, 11)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-chrys-compartment-ceiling-02a.img",
                    pos: v2.create(0, 8.5),
                    scale: 1,
                    alpha: 1,
                    tint: 6182731
                },
                {
                    sprite: "map-bunker-chrys-compartment-ceiling-02b.img",
                    pos: v2.create(0, -2.5),
                    scale: 1,
                    alpha: 1,
                    tint: 6182731
                }
            ]
        },
        mapObjects: [
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(-8, 6),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(8, 6),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_6",
                pos: v2.create(-7.5, 10.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_6",
                pos: v2.create(7.5, 10.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(-4, 12),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(4, 12),
                scale: 1,
                ori: 1
            },
            {
                type: "loot_tier_chrys_01",
                pos: v2.create(8, -6.5),
                scale: 1,
                ori: 0
            },
            {
                type: "control_panel_06",
                pos: v2.create(-8.5, 1.5),
                scale: 1,
                ori: 1
            },
            {
                type: "control_panel_06",
                pos: v2.create(8.5, 1.5),
                scale: 1,
                ori: 3
            },
            {
                type: "stone_wall_int_4",
                pos: v2.create(0, 10.9),
                scale: 1,
                ori: 1
            }
        ]
    },
    bunker_chrys_compartment_03: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 2,
        floor: {
            surfaces: [
                {
                    type: "bunker",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, -1),
                            v2.create(10, 14)
                        )
                    ]
                },
                {
                    type: "grass",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 11),
                            v2.create(10, 4)
                        ),
                        collider.createAabbExtents(
                            v2.create(-7, -3),
                            v2.create(3, 3)
                        ),
                        collider.createAabbExtents(
                            v2.create(8, -3),
                            v2.create(2, 3)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-chrys-compartment-floor-03a.img",
                    pos: v2.create(0, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(10, 13)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-chrys-compartment-ceiling-03a.img",
                    pos: v2.create(0, -9.5),
                    scale: 1,
                    alpha: 1,
                    tint: 6182731,
                    rot: 0
                },
                {
                    sprite: "map-bunker-chrys-compartment-ceiling-03b.img",
                    pos: v2.create(0, 3),
                    scale: 1,
                    alpha: 1,
                    tint: 6182731,
                    rot: 0
                }
            ]
        },
        mapObjects: [
            {
                type: "metal_wall_ext_thicker_5",
                pos: v2.create(-7.5, -8),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_5",
                pos: v2.create(7.5, -8),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(-11, -7),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(11, -7),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_20",
                pos: v2.create(-11.5, 4.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_20",
                pos: v2.create(11.5, 4.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_20",
                pos: v2.create(0, 13),
                scale: 1,
                ori: 1
            },
            {
                type: "crate_01",
                pos: v2.create(0, 4.75),
                scale: 0.9,
                ori: 0
            },
            {
                type: "crate_01",
                pos: v2.create(3, 0.5),
                scale: 0.9,
                ori: 0
            },
            {
                type: "crate_01",
                pos: v2.create(-3, 0.5),
                scale: 0.9,
                ori: 0
            },
            {
                type: "wheel_03",
                pos: v2.create(0, 9.1),
                scale: 1,
                ori: 0
            },
            {
                type: "wheel_03",
                pos: v2.create(-7.6, 1),
                scale: 1,
                ori: 1
            },
            {
                type: "wheel_03",
                pos: v2.create(7.6, 1),
                scale: 1,
                ori: 3
            },
            {
                type: "loot_tier_chrys_03",
                pos: v2.create(0, -5.5),
                scale: 1,
                ori: 0
            }
        ]
    },
    bunker_chrys_compartment_03b: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 2,
        floor: {
            surfaces: [
                {
                    type: "bunker",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, -1),
                            v2.create(10, 14)
                        )
                    ]
                },
                {
                    type: "grass",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 11),
                            v2.create(10, 4)
                        ),
                        collider.createAabbExtents(
                            v2.create(-7, -3),
                            v2.create(3, 3)
                        ),
                        collider.createAabbExtents(
                            v2.create(8, -3),
                            v2.create(2, 3)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-chrys-compartment-floor-03a.img",
                    pos: v2.create(0, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(10, 13)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-chrys-compartment-ceiling-03a.img",
                    pos: v2.create(0, -9.5),
                    scale: 1,
                    alpha: 1,
                    tint: 6182731,
                    rot: 0
                },
                {
                    sprite: "map-bunker-chrys-compartment-ceiling-03b.img",
                    pos: v2.create(0, 3),
                    scale: 1,
                    alpha: 1,
                    tint: 6182731,
                    rot: 0
                }
            ]
        },
        mapObjects: [
            {
                type: "metal_wall_ext_thicker_5",
                pos: v2.create(-7.5, -8),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_5",
                pos: v2.create(7.5, -8),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(-11, -7),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(11, -7),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_20",
                pos: v2.create(-11.5, 4.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_20",
                pos: v2.create(11.5, 4.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_20",
                pos: v2.create(0, 13),
                scale: 1,
                ori: 1
            },
            {
                type: "crate_01",
                pos: v2.create(0, 4.75),
                scale: 0.9,
                ori: 0
            },
            {
                type: "crate_01",
                pos: v2.create(3, 0.5),
                scale: 0.9,
                ori: 0
            },
            {
                type: "crate_01",
                pos: v2.create(-3, 0.5),
                scale: 0.9,
                ori: 0
            },
            {
                type: "wheel_03",
                pos: v2.create(0, 9.1),
                scale: 1,
                ori: 0
            },
            {
                type: "wheel_03",
                pos: v2.create(-7.6, 1),
                scale: 1,
                ori: 1
            },
            {
                type: "wheel_02",
                pos: v2.create(7.6, 1),
                scale: 1,
                ori: 3
            },
            {
                type: "case_05",
                pos: v2.create(0, -5.5),
                scale: 1,
                ori: 0
            }
        ]
    },
    bunker_structure_08: oe({
        bunkerType: "bunker_chrys_sublevel_01"
    }),
    bunker_structure_08b: oe({
        bunkerType: "bunker_chrys_sublevel_01b"
    }),
    hedgehog_wall: X({
        material: "metal",
        extents: v2.create(3, 0.5),
        height: 0.5,
        map: { display: !0, color: 5854285, scale: 1 }
    }),
    hedgehog_01: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !1, beach: !0 },
        floor: {
            surfaces: [],
            imgs: [
                {
                    sprite: "map-hedgehog-01.img",
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: { zoomRegions: [], imgs: [] },
        mapObjects: [
            {
                type: "hedgehog_wall",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 1
            },
            {
                type: "hedgehog_wall",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            }
        ]
    },
    cache_01: g({}),
    cache_01sv: g({
        mapObjects: [
            {
                type: "stone_02sv",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_initiative_01",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0,
                inheritOri: !1
            }
        ],
        map: { displayType: "stone_02sv" }
    }),
    cache_02: g({
        mapObjects: [
            {
                type: "tree_03",
                pos: v2.create(0, 0),
                scale: 0.9,
                ori: 0
            },
            {
                type: "decal_initiative_01",
                pos: v2.create(0, 0),
                scale: 1.2,
                ori: 0,
                inheritOri: !1
            }
        ],
        map: { displayType: "tree_03" }
    }),
    cache_02sv: g({
        mapObjects: [
            {
                type: "tree_03sv",
                pos: v2.create(0, 0),
                scale: 0.9,
                ori: 0
            },
            {
                type: "decal_initiative_01",
                pos: v2.create(0, 0),
                scale: 1.2,
                ori: 0,
                inheritOri: !1
            }
        ],
        map: { displayType: "tree_03sv" }
    }),
    cache_03: g({
        mapObjects: [
            {
                type: "bush_06",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "loot_tier_leaf_pile",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0,
                inheritOri: !1
            }
        ],
        map: { displayType: "bush_06" }
    }),
    cache_06: g({
        mapObjects: [
            {
                type: "bush_07",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "loot_tier_leaf_pile",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0,
                inheritOri: !1
            }
        ],
        map: { displayType: "bush_07" }
    }),
    cache_07: g({
        mapObjects: [
            {
                type: "barrel_01b",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_initiative_01",
                pos: v2.create(0, 0),
                scale: 1.1,
                ori: 0,
                inheritOri: !1
            }
        ],
        map: { displayType: "barrel_01b" }
    }),
    cache_log_13: g({
        terrain: { grass: !1, beach: !0 },
        mapObjects: [
            {
                type: "crate_01",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "recorder_13",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0,
                inheritOri: !1
            }
        ],
        map: { displayType: "crate_01" }
    }),
    cache_pumpkin_01: g({
        mapObjects: [
            {
                type: "pumpkin_01",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_light_01",
                pos: v2.create(0, 0),
                scale: 1.5,
                ori: 0,
                inheritOri: !1
            }
        ]
    }),
    cache_pumpkin_02: g({
        mapObjects: [
            {
                type: "pumpkin_02",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_light_01",
                pos: v2.create(0, 0),
                scale: 1.5,
                ori: 0,
                inheritOri: !1
            }
        ]
    }),
    cache_pumpkin_03: g({
        mapObjects: [
            {
                type: "pumpkin_03",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_light_04",
                pos: v2.create(0, 0),
                scale: 1.5,
                ori: 0,
                inheritOri: !1
            }
        ]
    }),
    cache_pumpkin_airdrop_02: g({
        mapObjects: [
            {
                type: "crate_11h",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_light_01",
                pos: v2.create(0, 0),
                scale: 1.5,
                ori: 0,
                inheritOri: !1
            }
        ]
    }),
    candle_lit_01: g({
        mapObjects: [
            {
                type: "candle_01",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_light_02",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0,
                inheritOri: !1
            }
        ]
    }),
    candle_lit_02: g({
        mapObjects: [
            {
                type: "candle_01",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_light_03",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0,
                inheritOri: !1
            }
        ]
    }),
    hut_wall_int_4: X({
        material: "wood",
        extents: v2.create(0.5, 2),
        hitParticle: "tanChip",
        img: wallImg("map-wall-04.img", 4608e3)
    }),
    hut_wall_int_5: X({
        material: "wood",
        extents: v2.create(0.5, 2.5),
        hitParticle: "tanChip",
        img: wallImg("map-wall-05.img", 4608e3)
    }),
    hut_wall_int_6: X({
        material: "wood",
        extents: v2.create(0.5, 3),
        hitParticle: "tanChip",
        img: wallImg("map-wall-06.img", 4608e3)
    }),
    hut_wall_int_12: X({
        material: "wood",
        extents: v2.create(0.5, 6),
        hitParticle: "tanChip",
        img: wallImg("map-wall-12.img", 4608e3)
    }),
    hut_wall_int_14: X({
        material: "wood",
        extents: v2.create(0.5, 7),
        hitParticle: "tanChip",
        img: wallImg("map-wall-14.img", 4608e3)
    }),
    hut_window_open_01: Se({ img: { tint: 7681026 } }),
    hut_01: re({}),
    hut_01x: re({
        ceiling: {
            imgs: [
                {
                    sprite: "map-building-hut-ceiling-01.img",
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-snow-04.img",
                    pos: v2.create(4.5, 0.5),
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215,
                    rot: 0
                },
                {
                    sprite: "map-snow-05.img",
                    pos: v2.create(-0.5, 5),
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215,
                    rot: 1
                }
            ]
        }
    }),
    hut_02: re({
        ceilingImg: "map-building-hut-ceiling-02.img",
        specialLoot: "pot_02"
    }),
    hut_02x: re({
        specialLoot: "pot_02",
        ceiling: {
            imgs: [
                {
                    sprite: "map-building-hut-ceiling-02.img",
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-snow-04.img",
                    pos: v2.create(4.5, 0.5),
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215,
                    rot: 0
                },
                {
                    sprite: "map-snow-05.img",
                    pos: v2.create(0.5, -4.5),
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215,
                    rot: 3
                }
            ]
        }
    }),
    hut_03: re({
        map: {
            display: !0,
            shapes: [
                {
                    collider: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(7, 7)
                    ),
                    color: 7771201
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(0, -18.9),
                        v2.create(2, 12)
                    ),
                    color: 6171907
                }
            ]
        },
        ceilingImg: "map-building-hut-ceiling-03.img",
        specialLoot: "pot_05"
    }),
    warehouse_wall_side: X({
        material: "metal",
        extents: v2.create(25, 0.6)
    }),
    warehouse_wall_edge: X({
        material: "metal",
        extents: v2.create(0.6, 3.2)
    }),
    warehouse_01: _e({
        topLeftObs: "crate_01",
        topRightObs: "crate_01",
        botRightObs: "crate_01",
        ignoreMapSpawnReplacement: !0
    }),
    warehouse_01h: _e({
        topLeftObs: "crate_01",
        topRightObs: "crate_01",
        botRightObs: "crate_01",
        decoration_01: "candle_lit_01",
        ignoreMapSpawnReplacement: !0
    }),
    warehouse_01f: _e({
        topLeftObs: "crate_01",
        topRightObs: "crate_01",
        botRightObs: "crate_01",
        ignoreMapSpawnReplacement: !1
    }),
    warehouse_01x: _e({
        topLeftObs: "crate_01",
        topRightObs: "crate_01",
        botRightObs: "crate_01",
        ignoreMapSpawnReplacement: !0,
        ceiling: {
            imgs: [
                {
                    sprite: "map-building-warehouse-ceiling-01.img",
                    scale: 1,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-snow-04.img",
                    pos: v2.create(7.5, 5),
                    scale: 0.9,
                    alpha: 1,
                    tint: 16777215,
                    rot: 1
                },
                {
                    sprite: "map-snow-05.img",
                    pos: v2.create(-8.5, 4),
                    scale: 0.9,
                    alpha: 1,
                    tint: 16777215,
                    rot: 2
                },
                {
                    sprite: "map-snow-06.img",
                    pos: v2.create(22.25, 11.25),
                    scale: 0.75,
                    alpha: 1,
                    tint: 16777215,
                    rot: 0
                },
                {
                    sprite: "map-snow-06.img",
                    pos: v2.create(-22.25, -11.25),
                    scale: 0.75,
                    alpha: 1,
                    tint: 16777215,
                    rot: 2
                }
            ]
        }
    }),
    warehouse_02: be({}),
    warehouse_02x: be({
        ceiling: {
            imgs: [
                {
                    sprite: "map-building-warehouse-ceiling-02.img",
                    scale: 1,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-snow-04.img",
                    pos: v2.create(0, 4),
                    scale: 1,
                    alpha: 1,
                    tint: 16777215,
                    rot: 0
                },
                {
                    sprite: "map-snow-06.img",
                    pos: v2.create(20.25, -9.75),
                    scale: 0.75,
                    alpha: 1,
                    tint: 16777215,
                    rot: 1
                },
                {
                    sprite: "map-snow-06.img",
                    pos: v2.create(-20.25, 9.75),
                    scale: 0.75,
                    alpha: 1,
                    tint: 16777215,
                    rot: 3
                }
            ]
        }
    }),
    warehouse_complex_01: {
        type: "building",
        map: {
            display: !0,
            shapes: [
                {
                    collider: collider.createAabbExtents(
                        v2.create(26, 70.5),
                        v2.create(47, 7.5)
                    ),
                    color: 5855577
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(15.5, 52.5),
                        v2.create(57.5, 10.5)
                    ),
                    color: 5855577
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(33, 11),
                        v2.create(75, 31)
                    ),
                    color: 5855577
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(5, -30),
                        v2.create(47, 10)
                    ),
                    color: 5855577
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(-39.75, 11.25),
                        v2.create(2, 51)
                    ),
                    color: 16109568
                },
                {
                    collider: collider.createCircle(
                        v2.create(-39, 55),
                        1.25
                    ),
                    color: 6310464
                },
                {
                    collider: collider.createCircle(
                        v2.create(-39, 20.5),
                        1.25
                    ),
                    color: 6310464
                },
                {
                    collider: collider.createCircle(
                        v2.create(-39, 2),
                        1.25
                    ),
                    color: 6310464
                },
                {
                    collider: collider.createCircle(
                        v2.create(-39, -31.5),
                        1.25
                    ),
                    color: 6310464
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(-28, -30),
                        v2.create(2, 2)
                    ),
                    color: 6697728
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(-23, -33),
                        v2.create(2, 2)
                    ),
                    color: 6697728
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(7, 70),
                        v2.create(2, 2)
                    ),
                    color: 6697728
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(12, 72),
                        v2.create(2, 2)
                    ),
                    color: 6697728
                },
                {
                    collider: collider.createCircle(
                        v2.create(-26.5, 54.75),
                        1.75
                    ),
                    color: 8026746
                },
                {
                    collider: collider.createCircle(
                        v2.create(-23.5, 57),
                        1.75
                    ),
                    color: 8026746
                },
                {
                    collider: collider.createCircle(
                        v2.create(84, -15.5),
                        1.75
                    ),
                    color: 8026746
                },
                {
                    collider: collider.createCircle(
                        v2.create(40, -35),
                        1.5
                    ),
                    color: 8026746
                },
                {
                    collider: collider.createCircle(
                        v2.create(65, 61),
                        1.5
                    ),
                    color: 8026746
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(44.5, -25),
                        v2.create(1.4, 3.1)
                    ),
                    color: 13278307
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(58, 47.5),
                        v2.create(1.4, 3.1)
                    ),
                    color: 13278307
                }
            ]
        },
        terrain: {
            waterEdge: {
                dir: v2.create(-1, 0),
                distMin: 72,
                distMax: 72
            }
        },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(26, 70.5),
                v2.create(47, 7.5)
            ),
            collider.createAabbExtents(
                v2.create(15.5, 52.5),
                v2.create(57.5, 10.5)
            ),
            collider.createAabbExtents(
                v2.create(33, 11),
                v2.create(75, 31)
            ),
            collider.createAabbExtents(
                v2.create(5, -30),
                v2.create(47, 10)
            )
        ],
        mapGroundPatches: [
            {
                bound: collider.createAabbExtents(
                    v2.create(26, 60),
                    v2.create(47, 18)
                ),
                color: 9340275,
                order: 1
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(5, 11.5),
                    v2.create(47, 51.5)
                ),
                color: 9340275,
                order: 1
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(80, 11),
                    v2.create(28, 31)
                ),
                color: 9340275,
                order: 1
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(26, 58),
                    v2.create(46, 19)
                ),
                color: 5855577,
                order: 1
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(5, 11.5),
                    v2.create(46, 50.5)
                ),
                color: 5855577,
                order: 1
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(78, 11),
                    v2.create(29, 30)
                ),
                color: 5855577,
                order: 1
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(-37.5, 38),
                    v2.create(4.5, 10)
                ),
                color: 9340275,
                order: 1
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(-37.5, -15),
                    v2.create(4.5, 10)
                ),
                color: 9340275,
                order: 1
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(-37.5, 38),
                    v2.create(3.5, 9)
                ),
                color: 5855577,
                order: 1
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(-37.5, -15),
                    v2.create(3.5, 9)
                ),
                color: 5855577,
                order: 1
            }
        ],
        floor: {
            surfaces: [
                {
                    type: "asphalt",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(26, 60),
                            v2.create(47, 18)
                        ),
                        collider.createAabbExtents(
                            v2.create(5, 11.5),
                            v2.create(47, 51.5)
                        ),
                        collider.createAabbExtents(
                            v2.create(80, 11),
                            v2.create(28, 31)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-complex-warehouse-floor-01.img",
                    pos: v2.create(-39.2, 55),
                    scale: 1,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-complex-warehouse-floor-02.img",
                    pos: v2.create(-39.2, 11.5),
                    scale: 1,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-complex-warehouse-floor-03.img",
                    pos: v2.create(-39.2, -32),
                    scale: 1,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: { zoomRegions: [], imgs: [] },
        mapObjects: [
            {
                type: "warehouse_02",
                pos: v2.create(5, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "warehouse_02",
                pos: v2.create(70, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "warehouse_02",
                pos: v2.create(18, 55),
                scale: 1,
                ori: 0
            },
            {
                type: "bollard_01",
                pos: v2.create(-39, 55),
                scale: 1,
                ori: 2
            },
            {
                type: randomObstacleType({
                    container_01: 1,
                    container_02: 1,
                    container_03: 1,
                    container_06: 0.08
                }),
                pos: v2.create(-37.5, 38),
                scale: 1,
                ori: 0
            },
            {
                type: "bollard_01",
                pos: v2.create(-39, 20.5),
                scale: 1,
                ori: 2
            },
            {
                type: "bollard_01",
                pos: v2.create(-39, 2),
                scale: 1,
                ori: 2
            },
            {
                type: randomObstacleType({
                    container_01: 1,
                    container_02: 1,
                    container_03: 1,
                    container_06: 0.08
                }),
                pos: v2.create(-37.5, -15),
                scale: 1,
                ori: 2
            },
            {
                type: "bollard_01",
                pos: v2.create(-39, -31.5),
                scale: 1,
                ori: 2
            },
            {
                type: "crate_01",
                pos: v2.create(-28, -30),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "crate_01",
                pos: v2.create(-23, -33),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "container_04",
                pos: v2.create(-11.5, -26.575),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({
                    container_01: 1,
                    container_02: 1,
                    container_03: 1,
                    container_05: 2,
                    container_06: 0.08,
                    "": 0.75
                }),
                pos: v2.create(-6, -29),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({
                    container_01: 1,
                    container_02: 1,
                    container_03: 1,
                    container_05: 2,
                    container_06: 0.08,
                    "": 0.75
                }),
                pos: v2.create(9.5, -29),
                scale: 1,
                ori: 0
            },
            {
                type: "container_04",
                pos: v2.create(15, -26.575),
                scale: 1,
                ori: 0
            },
            {
                type: "shack_02",
                pos: v2.create(37, -30),
                scale: 1,
                ori: 0
            },
            {
                type: "sandbags_01",
                pos: v2.create(44.5, -25),
                scale: 1,
                ori: 1
            },
            {
                type: "barrel_01",
                pos: v2.create(84, -15.5),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({
                    container_01: 1,
                    container_02: 1,
                    container_03: 1,
                    container_05: 2,
                    container_06: 0.08,
                    "": 0.75
                }),
                pos: v2.create(-3, 22),
                scale: 1,
                ori: 1
            },
            {
                type: "container_04",
                pos: v2.create(-5.425, 27.5),
                scale: 1,
                ori: 1
            },
            {
                type: randomObstacleType({
                    container_01: 1,
                    container_02: 1,
                    container_03: 1,
                    container_05: 2,
                    container_06: 0.08,
                    "": 0.75
                }),
                pos: v2.create(-3, 33),
                scale: 1,
                ori: 1
            },
            {
                type: "container_04",
                pos: v2.create(28, 22),
                scale: 1,
                ori: 1
            },
            {
                type: "container_04",
                pos: v2.create(28, 27.5),
                scale: 1,
                ori: 1
            },
            {
                type: "container_04",
                pos: v2.create(28, 33),
                scale: 1,
                ori: 1
            },
            {
                type: randomObstacleType({
                    container_01: 1,
                    container_02: 1,
                    container_03: 1,
                    container_05: 2,
                    container_06: 0.08,
                    "": 0.75
                }),
                pos: v2.create(53, 22),
                scale: 1,
                ori: 3
            },
            {
                type: "container_04",
                pos: v2.create(55.425, 27.5),
                scale: 1,
                ori: 1
            },
            {
                type: randomObstacleType({
                    container_01: 1,
                    container_02: 1,
                    container_03: 1,
                    container_05: 2,
                    container_06: 0.08,
                    "": 0.75
                }),
                pos: v2.create(53, 33),
                scale: 1,
                ori: 3
            },
            {
                type: "container_04",
                pos: v2.create(84, 22),
                scale: 1,
                ori: 3
            },
            {
                type: randomObstacleType({
                    container_01: 1,
                    container_02: 1,
                    container_03: 1,
                    container_05: 2,
                    container_06: 0.08,
                    "": 0.75
                }),
                pos: v2.create(86.425, 27.5),
                scale: 1,
                ori: 1
            },
            {
                type: "barrel_01",
                pos: v2.create(-26.5, 54.75),
                scale: 1,
                ori: 0
            },
            {
                type: "barrel_01",
                pos: v2.create(-23.5, 57),
                scale: 1,
                ori: 0
            },
            {
                type: "crate_01",
                pos: v2.create(7, 70),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "crate_01",
                pos: v2.create(12, 72),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "shack_02",
                pos: v2.create(60, 58),
                scale: 1,
                ori: 1
            },
            {
                type: "sandbags_01",
                pos: v2.create(58, 47.5),
                scale: 1,
                ori: 1
            },
            {
                type: "decal_oil_01",
                pos: v2.create(-37.5, 59.5),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_oil_02",
                pos: v2.create(-29.5, 52.5),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_oil_03",
                pos: v2.create(-16.5, 61.5),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_oil_04",
                pos: v2.create(-15.5, 73.5),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_oil_05",
                pos: v2.create(2.5, 72.5),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_oil_04",
                pos: v2.create(33.5, 74),
                scale: 1,
                ori: 1
            },
            {
                type: "decal_oil_06",
                pos: v2.create(62.5, 69),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_oil_04",
                pos: v2.create(105, 34),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_oil_05",
                pos: v2.create(101.5, 23),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_oil_01",
                pos: v2.create(84.5, 36),
                scale: 1,
                ori: 3
            },
            {
                type: "decal_oil_03",
                pos: v2.create(73.5, 30),
                scale: 1,
                ori: 3
            },
            {
                type: "decal_oil_03",
                pos: v2.create(56.5, 39),
                scale: 1,
                ori: 3
            },
            {
                type: "decal_oil_06",
                pos: v2.create(60.5, 14),
                scale: 1,
                ori: 1
            },
            {
                type: "decal_oil_02",
                pos: v2.create(40, 42),
                scale: 1,
                ori: 1
            },
            {
                type: "decal_oil_05",
                pos: v2.create(41.5, 20),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_oil_01",
                pos: v2.create(35.5, 9),
                scale: 1,
                ori: 1
            },
            {
                type: "decal_oil_02",
                pos: v2.create(38.5, -5),
                scale: 1,
                ori: 2
            },
            {
                type: "decal_oil_05",
                pos: v2.create(36.5, -22),
                scale: 1,
                ori: 3
            },
            {
                type: "decal_oil_03",
                pos: v2.create(83, -16),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_oil_04",
                pos: v2.create(28.5, -37),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_oil_01",
                pos: v2.create(22.5, -24),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_oil_03",
                pos: v2.create(7.5, -13.5),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_oil_04",
                pos: v2.create(6.5, -21),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_oil_06",
                pos: v2.create(-2.5, -32),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_oil_05",
                pos: v2.create(-22.5, -24),
                scale: 1,
                ori: 1
            },
            {
                type: "decal_oil_03",
                pos: v2.create(-37.5, -29.75),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_oil_04",
                pos: v2.create(-37.25, 9.5),
                scale: 0.75,
                ori: 1
            },
            {
                type: "decal_oil_02",
                pos: v2.create(-25.5, 15.5),
                scale: 1,
                ori: 1
            },
            {
                type: "decal_oil_04",
                pos: v2.create(-12.5, 22.5),
                scale: 1,
                ori: 1
            },
            {
                type: "decal_oil_05",
                pos: v2.create(-14.5, 33.5),
                scale: 1,
                ori: 1
            },
            {
                type: "decal_oil_03",
                pos: v2.create(-26.5, 40.5),
                scale: 1,
                ori: 1
            },
            {
                type: "decal_oil_06",
                pos: v2.create(3.5, 28.5),
                scale: 1,
                ori: 2
            },
            {
                type: "decal_oil_02",
                pos: v2.create(15.5, 38.5),
                scale: 1,
                ori: 2
            }
        ]
    },
    logging_complex_01: se({}),
    logging_complex_01sp: se({
        groundTintLt: 3361294,
        groundTintDk: 2437648
    }),
    logging_complex_01su: se({
        groundTintLt: 7843122,
        groundTintDk: 5143827
    }),
    logging_complex_02: ne({}),
    logging_complex_02sp: ne({
        groundTintDk: 2437648,
        tree_08c: "tree_08spc"
    }),
    logging_complex_02su: ne({ groundTintDk: 5143827 }),
    logging_complex_03: (function(e) {
        const t = {
            type: "building",
            map: { display: !0, shapes: [] },
            terrain: {
                grass: !0,
                beach: !1,
                spawnPriority: 10
            },
            mapObstacleBounds: [
                collider.createCircle(v2.create(0, 0), 32)
            ],
            mapGroundPatches: [
                {
                    bound: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(6.5, 5.5)
                    ),
                    color: e.groundTintDk || 7563810,
                    roughness: 0.05,
                    offsetDist: 0.5
                }
            ],
            floor: {
                surfaces: [
                    { type: "grass", collision: [] }
                ],
                imgs: []
            },
            ceiling: { zoomRegions: [], imgs: [] },
            mapObjects: [
                {
                    type: randomObstacleType({ crate_01: 4, crate_19: 1 }),
                    pos: v2.create(1.75, 2.5),
                    scale: 1,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: randomObstacleType({ crate_01: 4, crate_19: 1 }),
                    pos: v2.create(-1.75, -2.5),
                    scale: 1,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: "tree_09",
                    pos: v2.create(2.75, -2.25),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "barrel_01",
                    pos: v2.create(-2.75, 2.25),
                    scale: 1,
                    ori: 0
                }
            ]
        };
        return util.mergeDeep(t, e || {});
    })({}),
    junkyard_01: {
        type: "building",
        map: { display: !0, shapes: [] },
        terrain: { grass: !0, beach: !1 },
        ori: 0,
        mapObstacleBounds: [
            collider.createCircle(v2.create(0, 0), 37)
        ],
        mapGroundPatches: [
            {
                bound: collider.createAabbExtents(
                    v2.create(-8.5, 24),
                    v2.create(13, 9)
                ),
                color: 1184769
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(26.75, 8.5),
                    v2.create(8, 5.5)
                ),
                color: 1184769
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(23.75, -15.5),
                    v2.create(7, 5.5)
                ),
                color: 1184769
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(-23.5, -3),
                    v2.create(4.75, 3.5)
                ),
                color: 1184769
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(-3.5, -19.5),
                    v2.create(4, 6.5)
                ),
                color: 1184769
            }
        ],
        floor: {
            surfaces: [{ type: "grass", collision: [] }],
            imgs: []
        },
        ceiling: { zoomRegions: [], imgs: [] },
        mapObjects: [
            {
                type: "tree_05b",
                pos: v2.create(0, 0),
                scale: 1.5,
                ori: 0
            },
            {
                type: "candle_lit_01",
                pos: v2.create(-9, 3),
                scale: 1,
                ori: 0
            },
            {
                type: "candle_lit_01",
                pos: v2.create(9, 3),
                scale: 1,
                ori: 0
            },
            {
                type: "candle_lit_01",
                pos: v2.create(-6.5, -7),
                scale: 1,
                ori: 0
            },
            {
                type: "candle_lit_01",
                pos: v2.create(6.5, -7),
                scale: 1,
                ori: 0
            },
            {
                type: "candle_lit_01",
                pos: v2.create(0, 9),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ refrigerator_01: 3, "": 1 }),
                pos: v2.create(-2.5, 29.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ refrigerator_01: 3, "": 1 }),
                pos: v2.create(-6.5, 29),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ refrigerator_01: 3, "": 1 }),
                pos: v2.create(-10.5, 29.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ refrigerator_01: 3, "": 1 }),
                pos: v2.create(-14.5, 30),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ refrigerator_01: 3, "": 1 }),
                pos: v2.create(1.5, 23.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ refrigerator_01: 3, "": 1 }),
                pos: v2.create(-2.5, 24.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ refrigerator_01: 3, "": 1 }),
                pos: v2.create(-6.5, 24),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ refrigerator_01: 3, "": 1 }),
                pos: v2.create(-10.5, 24),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ refrigerator_01: 3, "": 1 }),
                pos: v2.create(-14.5, 23.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ refrigerator_01: 3, "": 1 }),
                pos: v2.create(-18.5, 24.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ refrigerator_01: 3, "": 1 }),
                pos: v2.create(-2.5, 18.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ refrigerator_01: 3, "": 1 }),
                pos: v2.create(-6.5, 18),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ refrigerator_01: 3, "": 1 }),
                pos: v2.create(-10.5, 18.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ refrigerator_01: 3, "": 1 }),
                pos: v2.create(-14.5, 19),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ "": 1, table_01: 3 }),
                pos: v2.create(22.5, 6),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ "": 1, table_01: 3 }),
                pos: v2.create(29, 6),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ "": 1, table_01: 3 }),
                pos: v2.create(24.5, 11),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ "": 1, table_01: 3 }),
                pos: v2.create(31, 11),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ oven_01: 3, "": 1 }),
                pos: v2.create(20, -13),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ oven_01: 3, "": 1 }),
                pos: v2.create(24, -12.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ oven_01: 3, "": 1 }),
                pos: v2.create(28, -13.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ oven_01: 3, "": 1 }),
                pos: v2.create(22, -18.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ oven_01: 3, "": 1 }),
                pos: v2.create(26, -18.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ "": 1, toilet_01: 3 }),
                pos: v2.create(-1.5, -16),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ "": 1, toilet_01: 3 }),
                pos: v2.create(-5, -22),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ "": 1, toilet_01: 3 }),
                pos: v2.create(-5.5, -17.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ "": 1, toilet_01: 3 }),
                pos: v2.create(-1.5, -23.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ "": 1, vending_01: 3 }),
                pos: v2.create(-25.5, -4.25),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ "": 1, vending_01: 3 }),
                pos: v2.create(-21.5, -2.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ "": 1, cache_03: 3 }),
                pos: v2.create(-24, 7),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ "": 1, cache_03: 3 }),
                pos: v2.create(14, 18),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ "": 1, cache_03: 3 }),
                pos: v2.create(-18, -16),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ "": 1, cache_03: 3 }),
                pos: v2.create(9.5, -16),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ "": 1, cache_03: 3 }),
                pos: v2.create(25.5, -2.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            }
        ]
    },
    archway_column_1: X({
        material: "wood",
        extents: v2.create(1, 1),
        img: Object.assign(
            wallImg("map-column-01.img", 7290644),
            { residue: "map-drawers-res.img" }
        )
    }),
    archway_01: {
        type: "building",
        map: { display: !0, color: 7813914, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        floor: {
            surfaces: [
                {
                    type: "grass",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(10, 1)
                        )
                    ]
                }
            ],
            imgs: []
        },
        ceiling: {
            zoomRegions: [],
            collision: [
                collider.createAabbExtents(
                    v2.create(0, 0),
                    v2.create(10.5, 2)
                )
            ],
            imgs: [
                {
                    sprite: "map-building-archway-ceiling-01.img",
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ],
            destroy: {
                wallCount: 1,
                particle: "archwayBreak",
                particleCount: 15,
                residue: "map-archway-res-01.img"
            }
        },
        mapObjects: [
            {
                type: "archway_column_1",
                pos: v2.create(-10, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "archway_column_1",
                pos: v2.create(10, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "loot_tier_1",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            }
        ]
    },
    desert_town_01: {
        type: "building",
        map: { display: !0, shapes: [] },
        terrain: { grass: !0, beach: !1 },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(0, 0),
                v2.create(65, 102)
            ),
            collider.createAabbExtents(
                v2.create(0, 0),
                v2.create(20, 120)
            ),
            collider.createAabbExtents(
                v2.create(-60, 40),
                v2.create(10, 5)
            )
        ],
        mapGroundPatches: [
            {
                bound: collider.createAabbExtents(
                    v2.create(0, 0),
                    v2.create(60, 95)
                ),
                color: 12813354,
                roughness: 0.1,
                offsetDist: 1
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(0, 0),
                    v2.create(10, 96)
                ),
                color: 9396511,
                roughness: 0.1,
                offsetDist: 1
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(-33, 40),
                    v2.create(27, 5)
                ),
                color: 9396511,
                roughness: 0.1,
                offsetDist: 1
            }
        ],
        floor: {
            surfaces: [
                {
                    type: "grass",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(55, 25)
                        )
                    ]
                }
            ],
            imgs: []
        },
        ceiling: { zoomRegions: [], imgs: [] },
        mapObjects: [
            {
                type: "archway_01",
                pos: v2.create(0, 95),
                scale: 1,
                ori: 0
            },
            {
                type: "archway_01",
                pos: v2.create(0, -95),
                scale: 1,
                ori: 0
            },
            {
                type: "police_01",
                pos: v2.create(40, -50),
                scale: 1,
                ori: 3
            },
            {
                type: "cabin_01",
                pos: v2.create(37, 20),
                scale: 1,
                ori: 3
            },
            {
                type: "cabin_01",
                pos: v2.create(35, 70),
                scale: 1,
                ori: 3
            },
            {
                type: "barn_01",
                pos: v2.create(-34, -60),
                scale: 1,
                ori: 3
            },
            {
                type: "bank_01b",
                pos: v2.create(-35, 0),
                scale: 1,
                ori: 1
            },
            {
                type: "saloon_structure_01",
                pos: v2.create(-35, 70),
                scale: 1,
                ori: 0
            },
            {
                type: "sandbags_01",
                pos: v2.create(5, 76),
                scale: 1,
                ori: 0
            },
            {
                type: "barrel_01",
                pos: v2.create(-6.75, 71),
                scale: 0.9,
                ori: 0
            },
            {
                type: "sandbags_02",
                pos: v2.create(-6.75, 67),
                scale: 1,
                ori: 0
            },
            {
                type: "sandbags_02",
                pos: v2.create(-50, 42),
                scale: 1,
                ori: 0
            },
            {
                type: "barrel_01",
                pos: v2.create(-4, 44),
                scale: 0.9,
                ori: 0
            },
            {
                type: "barrel_01",
                pos: v2.create(-1.5, 46.5),
                scale: 0.9,
                ori: 0
            },
            {
                type: "crate_18",
                pos: v2.create(0.25, 42),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "barrel_01",
                pos: v2.create(-21, 31.5),
                scale: 0.9,
                ori: 0
            },
            {
                type: "sandbags_01",
                pos: v2.create(-15, 31.5),
                scale: 1,
                ori: 0
            },
            {
                type: "sandbags_01",
                pos: v2.create(13, 34),
                scale: 1,
                ori: 1
            },
            {
                type: "sandbags_02",
                pos: v2.create(7, 8),
                scale: 1,
                ori: 1
            },
            {
                type: "barrel_01",
                pos: v2.create(-7.25, -12.5),
                scale: 0.9,
                ori: 0
            },
            {
                type: "sandbags_01",
                pos: v2.create(-7.25, -22),
                scale: 1,
                ori: 1
            },
            {
                type: "crate_18",
                pos: v2.create(2.5, -56.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "barrel_01",
                pos: v2.create(-1.5, -59),
                scale: 0.9,
                ori: 0
            },
            {
                type: "barrel_01",
                pos: v2.create(1.5, -61),
                scale: 0.9,
                ori: 0
            },
            {
                type: "sandbags_01",
                pos: v2.create(-5.5, -74),
                scale: 1,
                ori: 0
            },
            {
                type: "sandbags_02",
                pos: v2.create(7.5, -82),
                scale: 1,
                ori: 0
            }
        ]
    },
    desert_town_02: {
        type: "building",
        map: { display: !0, shapes: [] },
        terrain: { grass: !0, beach: !1 },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(0, -3),
                v2.create(50, 60)
            ),
            collider.createAabbExtents(
                v2.create(0, 0),
                v2.create(60, 15)
            )
        ],
        mapGroundPatches: [
            {
                bound: collider.createAabbExtents(
                    v2.create(0, -3),
                    v2.create(45, 55)
                ),
                color: 12813354,
                roughness: 0.1,
                offsetDist: 1
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(0, 0),
                    v2.create(46, 10)
                ),
                color: 9396511,
                roughness: 0.1,
                offsetDist: 1
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(0, 2),
                    v2.create(5, 50.5)
                ),
                color: 9396511,
                roughness: 0.1,
                offsetDist: 1
            }
        ],
        floor: {
            surfaces: [
                {
                    type: "grass",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(0, 0)
                        )
                    ]
                }
            ],
            imgs: []
        },
        ceiling: { zoomRegions: [], imgs: [] },
        mapObjects: [
            {
                type: "archway_01",
                pos: v2.create(45, 0),
                scale: 1,
                ori: 1
            },
            {
                type: "archway_01",
                pos: v2.create(-45, 0),
                scale: 1,
                ori: 1
            },
            {
                type: "house_red_01",
                pos: v2.create(24, 30),
                scale: 1,
                ori: 3
            },
            {
                type: "house_red_02",
                pos: v2.create(-24, 30),
                scale: 1,
                ori: 3
            },
            {
                type: "bank_01b",
                pos: v2.create(-10, -34),
                scale: 1,
                ori: 2
            },
            {
                type: "shack_01",
                pos: v2.create(31, -26),
                scale: 1,
                ori: 2
            },
            {
                type: "outhouse_01",
                pos: v2.create(28, -46),
                scale: 1,
                ori: 0
            },
            {
                type: "tree_06",
                pos: v2.create(29, -36),
                scale: 0.9,
                ori: 0
            },
            {
                type: "barrel_01",
                pos: v2.create(-4.75, 34),
                scale: 0.9,
                ori: 0
            },
            {
                type: "sandbags_02",
                pos: v2.create(-4.75, 30),
                scale: 1,
                ori: 1
            },
            {
                type: "sandbags_01",
                pos: v2.create(-9, 10),
                scale: 1,
                ori: 0
            },
            {
                type: "crate_18",
                pos: v2.create(2.5, 1.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "barrel_01",
                pos: v2.create(-2, -1),
                scale: 0.9,
                ori: 0
            },
            {
                type: "barrel_01",
                pos: v2.create(1.5, -3),
                scale: 0.9,
                ori: 0
            },
            {
                type: "sandbags_01",
                pos: v2.create(16, -10),
                scale: 1,
                ori: 1
            }
        ]
    },
    statue_01: N({
        scale: { createMin: 1, createMax: 1, destroy: 0.5 },
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(4.4, 4.4)
        ),
        destructible: !1,
        map: { display: !0, color: 5723991, scale: 1 },
        img: { sprite: "map-statue-01.img", scale: 0.5 }
    }),
    statue_03: N({
        stonePlated: !0,
        health: 500,
        height: 10,
        scale: {
            createMin: 1,
            createMax: 1,
            destroy: 0.85
        },
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(4.4, 4.4)
        ),
        destructible: !0,
        map: { display: !0, color: 5723991, scale: 1 },
        img: {
            sprite: "map-statue-03.img",
            scale: 0.5,
            residue: ""
        }
    }),
    statue_04: N({
        stonePlated: !0,
        health: 500,
        height: 10,
        scale: {
            createMin: 1,
            createMax: 1,
            destroy: 0.85
        },
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(4.4, 4.4)
        ),
        destructible: !0,
        map: { display: !0, color: 5723991, scale: 1 },
        img: {
            sprite: "map-statue-04.img",
            scale: 0.5,
            residue: ""
        }
    }),
    statue_top_01: N({
        health: 500,
        height: 10,
        collision: collider.createCircle(v2.create(0, 0), 2.45),
        scale: { createMin: 1, createMax: 1, destroy: 0.8 },
        destructible: !0,
        map: { display: !1, color: 5723991, scale: 1 },
        img: {
            sprite: "map-statue-top-01.img",
            residue: "",
            scale: 0.5,
            zIdx: 60
        }
    }),
    statue_top_02: N({
        health: 500,
        height: 10,
        collision: collider.createCircle(v2.create(0, 0), 2.45),
        scale: { createMin: 1, createMax: 1, destroy: 0.8 },
        destructible: !0,
        map: { display: !1, color: 5723991, scale: 1 },
        img: {
            sprite: "map-statue-top-02.img",
            residue: "",
            scale: 0.5,
            zIdx: 60
        }
    }),
    statue_structure_01: {
        type: "building",
        ori: 0,
        terrain: {},
        floor: {
            surfaces: [],
            imgs: [
                {
                    sprite: "",
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: { zoomRegions: [], imgs: [] },
        mapObjects: [
            {
                type: "statue_01",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "statue_top_01",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            }
        ]
    },
    statue_structure_02: {
        type: "building",
        ori: 0,
        terrain: {},
        floor: {
            surfaces: [],
            imgs: [
                {
                    sprite: "",
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: { zoomRegions: [], imgs: [] },
        mapObjects: [
            {
                type: "statue_01",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "statue_top_02",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            }
        ]
    },
    statue_building_03: h({ statue: "statue_03" }),
    statue_underground_03: d({ crate: "crate_02d" }),
    statue_structure_03: {
        type: "structure",
        terrain: { grass: !0, beach: !1 },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(0, 5),
                v2.create(7.5, 12.5)
            )
        ],
        layers: [
            {
                type: "statue_building_03",
                pos: v2.create(0, 0),
                ori: 0
            },
            {
                type: "statue_underground_03",
                pos: v2.create(0, 0),
                ori: 0
            }
        ],
        stairs: [
            {
                collision: collider.createAabbExtents(
                    v2.create(-1, 0),
                    v2.create(2.6, 2)
                ),
                downDir: v2.create(1, 0)
            }
        ],
        mask: [
            collider.createAabbExtents(
                v2.create(5.7, 0),
                v2.create(4, 4)
            )
        ]
    },
    statue_building_04: h({ statue: "statue_04" }),
    statue_underground_04: d({ crate: "crate_22d" }),
    statue_structure_04: {
        type: "structure",
        terrain: { grass: !0, beach: !1 },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(0, 5),
                v2.create(7.5, 12.5)
            )
        ],
        layers: [
            {
                type: "statue_building_04",
                pos: v2.create(0, 0),
                ori: 0
            },
            {
                type: "statue_underground_04",
                pos: v2.create(0, 0),
                ori: 0
            }
        ],
        stairs: [
            {
                collision: collider.createAabbExtents(
                    v2.create(-1, 0),
                    v2.create(2.6, 2)
                ),
                downDir: v2.create(1, 0)
            }
        ],
        mask: [
            collider.createAabbExtents(
                v2.create(5.7, 0),
                v2.create(4, 4)
            )
        ]
    },
    river_town_01: {
        type: "building",
        map: {
            display: !0,
            shapes: [
                {
                    collider: collider.createAabbExtents(
                        v2.create(70.75, 0.5),
                        v2.create(30, 54.5)
                    ),
                    color: 3815994
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(77.5, 64),
                        v2.create(23, 10)
                    ),
                    color: 3815994
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(111, -29.5),
                        v2.create(10.5, 24.5)
                    ),
                    color: 3815994
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(50, 0),
                        v2.create(4.4, 4.4)
                    ),
                    color: 5723991
                }
            ]
        },
        terrain: {
            bridge: { nearbyWidthMult: 1 },
            spawnPriority: 100
        },
        bridgeLandBounds: [
            collider.createAabbExtents(
                v2.create(-41, 0),
                v2.create(6, 10)
            ),
            collider.createAabbExtents(
                v2.create(41, 0),
                v2.create(6, 10)
            ),
            collider.createAabbExtents(
                v2.create(81, 0),
                v2.create(40, 54)
            ),
            collider.createAabbExtents(
                v2.create(78, 64),
                v2.create(23, 10)
            ),
            collider.createAabbExtents(
                v2.create(-76, -22),
                v2.create(36, 24)
            ),
            collider.createAabbExtents(
                v2.create(-72, 22),
                v2.create(27, 25)
            )
        ],
        bridgeWaterBounds: [
            collider.createAabbExtents(
                v2.create(0, 0),
                v2.create(5, 5)
            )
        ],
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(71, 0),
                v2.create(31, 56)
            ),
            collider.createAabbExtents(
                v2.create(77, 65),
                v2.create(24, 10)
            ),
            collider.createAabbExtents(
                v2.create(112, -30),
                v2.create(10, 26)
            ),
            collider.createAabbExtents(
                v2.create(106, 19.5),
                v2.create(8, 7.25)
            ),
            collider.createAabbExtents(
                v2.create(-71, 32),
                v2.create(27, 15)
            ),
            collider.createAabbExtents(
                v2.create(-71, 16),
                v2.create(8, 6)
            ),
            collider.createAabbExtents(
                v2.create(-75, -34),
                v2.create(40, 19)
            ),
            collider.createAabbExtents(
                v2.create(-57, -10),
                v2.create(5, 11)
            ),
            collider.createAabbExtents(
                v2.create(-86, -10),
                v2.create(5, 11)
            ),
            collider.createAabbExtents(
                v2.create(-21, 0),
                v2.create(100, 8)
            ),
            collider.createAabbExtents(
                v2.create(-109, 30),
                v2.create(7, 7.25)
            ),
            collider.createAabbExtents(
                v2.create(0, 0),
                v2.create(40, 15)
            )
        ],
        mapGroundPatches: [
            {
                bound: collider.createAabbExtents(
                    v2.create(-20, 0),
                    v2.create(100, 6)
                ),
                color: 6632211,
                roughness: 0.05,
                offsetDist: 1
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(-71, 10),
                    v2.create(2, 9)
                ),
                color: 6632211,
                roughness: 0,
                offsetDist: 1
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(-57, -10),
                    v2.create(2, 9)
                ),
                color: 6632211,
                roughness: 0,
                offsetDist: 1
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(-109, 30),
                    v2.create(6, 6.25)
                ),
                color: 3293977,
                roughness: 0.05,
                offsetDist: 0.5
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(-86, -10),
                    v2.create(2, 9)
                ),
                color: 6632211,
                roughness: 0,
                offsetDist: 1
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(106, 19.5),
                    v2.create(7, 6.25)
                ),
                color: 3293977,
                roughness: 0.05,
                offsetDist: 0.5
            }
        ],
        floor: {
            surfaces: [
                {
                    type: "grass",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(0, 0)
                        )
                    ]
                },
                {
                    type: "asphalt",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(70.75, 0.5),
                            v2.create(30, 54.5)
                        ),
                        collider.createAabbExtents(
                            v2.create(77.5, 64),
                            v2.create(23, 10)
                        ),
                        collider.createAabbExtents(
                            v2.create(111, -29.5),
                            v2.create(10.5, 24.5)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-complex-warehouse-floor-04.img",
                    pos: v2.create(81, 10),
                    scale: 1,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: { zoomRegions: [], imgs: [] },
        mapObjects: [
            {
                type: "bridge_xlg_structure_01",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "barn_01",
                pos: v2.create(-71, 30),
                scale: 1,
                ori: 2
            },
            {
                type: "house_red_01",
                pos: v2.create(-56, -30),
                scale: 1,
                ori: 0
            },
            {
                type: "house_red_02",
                pos: v2.create(-96, -30),
                scale: 1,
                ori: 0
            },
            {
                type: "sandbags_02",
                pos: v2.create(-68, 2),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ crate_02: 1, crate_01: 3 }),
                pos: v2.create(-85, 1),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ crate_02: 1, crate_01: 3 }),
                pos: v2.create(-90, -1),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "crate_02f",
                pos: v2.create(-106.5, 32.25),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "crate_01",
                pos: v2.create(-111.25, 32.25),
                scale: 1,
                ori: 0
            },
            {
                type: "crate_01",
                pos: v2.create(-108, 27.25),
                scale: 1,
                ori: 0
            },
            {
                type: "statue_structure_01",
                pos: v2.create(-50, 0),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({
                    container_01: 1,
                    container_02: 1,
                    container_03: 1
                }),
                pos: v2.create(45, 36),
                scale: 1,
                ori: 2
            },
            {
                type: randomObstacleType({
                    container_01: 1,
                    container_02: 1,
                    container_03: 1
                }),
                pos: v2.create(51, 36),
                scale: 1,
                ori: 2
            },
            {
                type: "shack_02",
                pos: v2.create(47, 20),
                scale: 1,
                ori: 0
            },
            {
                type: "warehouse_02",
                pos: v2.create(78, 40),
                scale: 1,
                ori: 1
            },
            {
                type: randomObstacleType({
                    container_01: 1,
                    container_02: 1,
                    container_03: 1
                }),
                pos: v2.create(95, 44),
                scale: 1,
                ori: 0
            },
            {
                type: "statue_structure_02",
                pos: v2.create(50, 0),
                scale: 1,
                ori: 2
            },
            {
                type: "crate_01",
                pos: v2.create(74.5, -0.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "crate_01",
                pos: v2.create(79.5, 0.25),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "crate_01",
                pos: v2.create(106, 22),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "crate_01",
                pos: v2.create(104.5, 17.25),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "crate_22",
                pos: v2.create(109.25, 17.25),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({
                    container_01: 1,
                    container_02: 1,
                    container_03: 1
                }),
                pos: v2.create(85, -13),
                scale: 1,
                ori: 1
            },
            {
                type: randomObstacleType({
                    container_01: 1,
                    container_02: 1,
                    container_03: 1
                }),
                pos: v2.create(45, -36),
                scale: 1,
                ori: 0
            },
            {
                type: "shack_02",
                pos: v2.create(47, -20),
                scale: 1,
                ori: 2
            },
            {
                type: "warehouse_02",
                pos: v2.create(86, -30),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({
                    container_01: 1,
                    container_02: 1,
                    container_03: 1
                }),
                pos: v2.create(72, -47),
                scale: 1,
                ori: 1
            }
        ]
    },
    river_town_02: {
        type: "building",
        map: { display: !0, shapes: [] },
        terrain: { grass: !0, beach: !1 },
        oris: [0, 1],
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(61, -3),
                v2.create(24, 21)
            ),
            collider.createAabbExtents(
                v2.create(46, -36),
                v2.create(6, 14)
            ),
            collider.createAabbExtents(
                v2.create(-68, 0),
                v2.create(27, 8)
            ),
            collider.createAabbExtents(
                v2.create(0, 0),
                v2.create(14, 14)
            ),
            collider.createAabbExtents(
                v2.create(-80, 32),
                v2.create(4, 4)
            ),
            collider.createAabbExtents(
                v2.create(-16, 13),
                v2.create(5, 2.5)
            ),
            collider.createAabbExtents(
                v2.create(16, -13),
                v2.create(5, 2.5)
            ),
            collider.createAabbExtents(
                v2.create(-76.5, 19.5),
                v2.create(2.5, 2.5)
            ),
            collider.createAabbExtents(
                v2.create(-62, -18),
                v2.create(2.5, 2.5)
            )
        ],
        mapGroundPatches: [
            {
                bound: collider.createAabbExtents(
                    v2.create(-5, 0),
                    v2.create(70, 6)
                ),
                color: 9585940,
                roughness: 0.05,
                offsetDist: 1
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(-71, 10),
                    v2.create(2, 9)
                ),
                color: 9585940,
                roughness: 0.05,
                offsetDist: 1
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(-76, 19),
                    v2.create(10.5, 8)
                ),
                color: 9585940,
                roughness: 0.1,
                offsetDist: 1
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(-57, -10),
                    v2.create(2, 9)
                ),
                color: 9585940,
                roughness: 0.05,
                offsetDist: 1
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(-63, -19),
                    v2.create(11.5, 8.5)
                ),
                color: 9585940,
                roughness: 0.1,
                offsetDist: 1
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(0, 0),
                    v2.create(14, 10)
                ),
                color: 8405016,
                roughness: 0.3,
                offsetDist: 1
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(0, 0),
                    v2.create(9, 22)
                ),
                color: 8405016,
                roughness: 0.3,
                offsetDist: 1
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(0, 0),
                    v2.create(4, 33)
                ),
                color: 8405016,
                roughness: 0.3,
                offsetDist: 1
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(61, -3),
                    v2.create(22, 19)
                ),
                color: 3815994,
                roughness: 0.15,
                offsetDist: 1
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(45, -34),
                    v2.create(5.75, 14)
                ),
                color: 3815994,
                roughness: 0.15,
                offsetDist: 1
            },
            {
                bound: collider.createAabbExtents(
                    v2.create(69, -10),
                    v2.create(4, 3.75)
                ),
                color: 14657367,
                roughness: 0.2,
                offsetDist: 1
            }
        ],
        floor: {
            surfaces: [
                {
                    type: "grass",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(0, 0)
                        )
                    ]
                },
                {
                    type: "asphalt",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(61, -3),
                            v2.create(22, 19)
                        ),
                        collider.createAabbExtents(
                            v2.create(45, -34),
                            v2.create(5.75, 14)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-complex-warehouse-floor-05.img",
                    pos: v2.create(81, 10),
                    scale: 1,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: { zoomRegions: [], imgs: [] },
        mapObjects: [
            {
                type: "stone_06",
                pos: v2.create(-16, 13),
                scale: 1,
                ori: 0,
                inheritOri: !0
            },
            {
                type: "stone_06",
                pos: v2.create(16, -13),
                scale: 1,
                ori: 0,
                inheritOri: !0
            },
            {
                type: "sandbags_02",
                pos: v2.create(-68, 2),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ crate_02: 1, crate_01: 4 }),
                pos: v2.create(-85, 1),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ crate_02: 1, crate_01: 4 }),
                pos: v2.create(-90, -1),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "statue_structure_03",
                pos: v2.create(-50, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "barrel_01",
                pos: v2.create(-80, 32),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ crate_02: 1, crate_01: 4 }),
                pos: v2.create(-76.5, 19.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({ crate_02: 1, crate_01: 4 }),
                pos: v2.create(-62, -18),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "statue_structure_04",
                pos: v2.create(50, 0),
                scale: 1,
                ori: 2
            },
            {
                type: "tree_06",
                pos: v2.create(69, -10),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "crate_01",
                pos: v2.create(74.5, -0.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "crate_01",
                pos: v2.create(79.5, 0.25),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: randomObstacleType({
                    container_01: 1,
                    container_02: 1,
                    container_03: 1
                }),
                pos: v2.create(45, -36),
                scale: 1,
                ori: 0
            },
            {
                type: "tree_05c",
                pos: v2.create(0, 2),
                scale: 2,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "case_05",
                pos: v2.create(0, -2),
                scale: 1,
                ori: 0,
                inheritOri: !0
            }
        ]
    },
    shack_wall_top: X({
        material: "wood",
        extents: v2.create(5.6, 0.35),
        height: 10,
        img: wallImg("map-wall-shack-top.img")
    }),
    shack_wall_side_left: X({
        material: "wood",
        extents: v2.create(0.35, 3.43),
        height: 10,
        img: wallImg("map-wall-shack-left.img")
    }),
    shack_wall_side_right: X({
        material: "wood",
        extents: v2.create(0.35, 3.8),
        height: 10,
        img: wallImg("map-wall-shack-right.img")
    }),
    shack_wall_bot: X({
        material: "wood",
        extents: v2.create(3.75, 0.35),
        height: 10,
        img: wallImg("map-wall-shack-bot.img")
    }),
    shack_01: we(),
    shack_01x: we({
        ceiling: {
            imgs: [
                {
                    sprite: "map-building-shack-ceiling-01.img",
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-snow-05.img",
                    pos: v2.create(-4, 2.5),
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215,
                    rot: 0
                },
                {
                    sprite: "map-snow-04.img",
                    pos: v2.create(3.5, -0.5),
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215,
                    rot: 0
                }
            ]
        }
    }),
    shack_02: fe({}),
    shack_02x: fe({
        ceiling: {
            imgs: [
                {
                    sprite: "map-building-shack-ceiling-02.img",
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-snow-05.img",
                    pos: v2.create(-2, 1),
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215,
                    rot: 0
                }
            ]
        }
    }),
    shilo_01: (function(e) {
        const t = {
            type: "building",
            map: { display: !0, color: 3240224, scale: 1 },
            terrain: { grass: !0, beach: !1 },
            mapObstacleBounds: [
                collider.createAabbExtents(
                    v2.create(0, -1),
                    v2.create(17, 15)
                )
            ],
            floor: {
                surfaces: [
                    {
                        type: "shack",
                        collision: [
                            collider.createAabbExtents(
                                v2.create(0, 0),
                                v2.create(15, 12)
                            )
                        ]
                    }
                ],
                imgs: [
                    {
                        sprite: "map-building-shilo-floor-01.img",
                        scale: 0.5,
                        alpha: 1,
                        tint: 16777215
                    },
                    {
                        sprite: "map-building-porch-01.img",
                        pos: v2.create(0, -13),
                        scale: 0.5,
                        alpha: 1,
                        tint: 16777215,
                        rot: 2
                    }
                ]
            },
            ceiling: {
                zoomRegions: [
                    {
                        zoomIn: collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(14.5, 11.5)
                        ),
                        zoomOut: collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(14.5, 11.5)
                        )
                    }
                ],
                vision: { width: 4 },
                imgs: [
                    {
                        sprite: "map-building-shilo-ceiling-01.img",
                        scale: 0.5,
                        alpha: 1,
                        tint: 16777215
                    }
                ]
            },
            mapObjects: [
                {
                    type: "metal_wall_ext_12_5",
                    pos: v2.create(7.75, 11.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "metal_wall_ext_12_5",
                    pos: v2.create(-7.75, 11.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "metal_wall_ext_13",
                    pos: v2.create(8.5, -11.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "metal_wall_ext_13",
                    pos: v2.create(-8.5, -11.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "metal_wall_ext_23",
                    pos: v2.create(-14.5, 0.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "metal_wall_ext_23",
                    pos: v2.create(14.5, 0.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "silo_01po",
                    pos: v2.create(0, 0),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "house_door_01",
                    pos: v2.create(-2, -12),
                    scale: 1,
                    ori: 3
                },
                {
                    type: "house_window_01",
                    pos: v2.create(0, 11.75),
                    scale: 1,
                    ori: 1
                }
            ]
        };
        return util.mergeDeep(t, e || {});
    })({}),
    shack_wall_ext_2: X({
        material: "wood",
        extents: v2.create(0.5, 1),
        hitParticle: "tanChip",
        img: wallImg("map-wall-02.img", 12556639)
    }),
    shack_wall_ext_5: X({
        material: "wood",
        extents: v2.create(0.5, 2.5),
        hitParticle: "tanChip",
        img: wallImg("map-wall-05.img", 12556639)
    }),
    shack_wall_ext_9: X({
        material: "wood",
        extents: v2.create(0.5, 4.5),
        hitParticle: "tanChip",
        img: wallImg("map-wall-09.img", 12556639)
    }),
    shack_wall_ext_10: X({
        material: "wood",
        extents: v2.create(0.5, 5),
        hitParticle: "tanChip",
        img: wallImg("map-wall-10.img", 12556639)
    }),
    shack_wall_ext_14: X({
        material: "wood",
        extents: v2.create(0.5, 7),
        hitParticle: "tanChip",
        img: wallImg("map-wall-14.img", 12556639)
    }),
    shack_03a: ae({
        terrain: {
            bridge: { nearbyWidthMult: 1 },
            nearbyRiver: {
                radMin: 0.75,
                radMax: 1.5,
                facingOri: 1
            }
        }
    }),
    shack_03b: ae({
        terrain: {
            waterEdge: {
                dir: v2.create(0, 1),
                distMin: 4,
                distMax: 5
            }
        },
        map: {
            display: !0,
            shapes: [
                {
                    collider: collider.createAabbExtents(
                        v2.create(-7.75, 3),
                        v2.create(1, 2)
                    ),
                    color: 6171907
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(5, -4.75),
                        v2.create(2, 1)
                    ),
                    color: 6171907
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(1, 1.5),
                        v2.create(8, 5.5)
                    ),
                    color: 5730406
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(-10.65, 9),
                        v2.create(2, 12)
                    ),
                    color: 6171907
                }
            ]
        },
        floor: {
            surfaces: [
                {
                    type: "shack",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(1, 1.5),
                            v2.create(8, 5.5)
                        ),
                        collider.createAabbExtents(
                            v2.create(-10.65, 9),
                            v2.create(2, 12)
                        ),
                        collider.createAabbExtents(
                            v2.create(-7.75, 3),
                            v2.create(1, 2)
                        ),
                        collider.createAabbExtents(
                            v2.create(5, -4.75),
                            v2.create(2, 1)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-building-shack-floor-03.img",
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-hut-floor-02.img",
                    pos: v2.create(-10.65, 9),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            imgs: [
                {
                    sprite: "map-building-shack-ceiling-03.img",
                    pos: v2.create(0.5, 0.5),
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        }
    }),
    shack_03x: ae({
        terrain: {
            bridge: { nearbyWidthMult: 1 },
            nearbyRiver: {
                radMin: 0.75,
                radMax: 1.5,
                facingOri: 1
            }
        },
        ceiling: {
            imgs: [
                {
                    sprite: "map-building-shack-ceiling-03.img",
                    pos: v2.create(0.5, 0.5),
                    scale: 0.667,
                    alpha: 1,
                    tint: 10461087
                },
                {
                    sprite: "map-snow-01.img",
                    pos: v2.create(3.75, 1.75),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 1
                }
            ]
        }
    }),
    outhouse_wall_top: X({
        material: "wood",
        extents: v2.create(3.2, 0.35),
        height: 10,
        hitParticle: "outhouseChip",
        explodeParticle: "outhousePlank",
        health: 100,
        img: wallImg("map-wall-outhouse-top.img")
    }),
    outhouse_wall_side: X({
        material: "wood",
        extents: v2.create(0.35, 3.1),
        height: 10,
        hitParticle: "outhouseChip",
        explodeParticle: "outhousePlank",
        health: 100,
        img: wallImg("map-wall-outhouse-side.img")
    }),
    outhouse_wall_bot: X({
        material: "wood",
        extents: v2.create(1.15, 0.35),
        height: 10,
        hitParticle: "outhouseChip",
        explodeParticle: "outhousePlank",
        health: 100,
        img: wallImg("map-wall-outhouse-bot.img")
    }),
    outhouse_01: me({}),
    outhouse_01x: me({
        ceiling: {
            imgs: [
                {
                    sprite: "map-building-outhouse-ceiling.img",
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-snow-04.img",
                    pos: v2.create(2.25, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 0
                }
            ]
        }
    }),
    outhouse_02: me({
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 1.45),
                        v2.create(3.6, 3.2)
                    ),
                    zoomOut: collider.createAabbExtents(
                        v2.create(0, 1.4),
                        v2.create(3.8, 3.4)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-building-outhouse-ceiling.img",
                    scale: 0.5,
                    alpha: 1,
                    tint: 13735576
                }
            ],
            destroy: {
                wallCount: 2,
                particleCount: 15,
                particle: "outhouseBreak",
                residue: "map-outhouse-res.img"
            }
        },
        obs: "toilet_02b"
    }),
    perch_01: (function(e) {
        const t = {
            type: "building",
            map: { display: !0, color: 1915136, scale: 1 },
            terrain: { grass: !0, beach: !1 },
            mapObstacleBounds: [
                collider.createAabbExtents(
                    v2.create(0, 0),
                    v2.create(7, 8)
                )
            ],
            zIdx: 1,
            floor: {
                surfaces: [
                    {
                        type: "shack",
                        collision: [
                            collider.createAabbExtents(
                                v2.create(0, 0),
                                v2.create(4.25, 5)
                            ),
                            collider.createAabbExtents(
                                v2.create(5, 0),
                                v2.create(1.25, 2)
                            ),
                            collider.createAabbExtents(
                                v2.create(-5, 0),
                                v2.create(1.25, 2)
                            )
                        ]
                    }
                ],
                imgs: [
                    {
                        sprite: "map-building-perch-floor.img",
                        pos: v2.create(0, 0),
                        scale: 0.5,
                        alpha: 1,
                        tint: 16777215
                    }
                ]
            },
            ceiling: {
                zoomRegions: [],
                imgs: [
                    {
                        sprite: "map-building-perch-ceiling.img",
                        scale: 0.5,
                        alpha: 1,
                        tint: 16777215
                    }
                ],
                destroy: {
                    wallCount: 5,
                    particleCount: 15,
                    particle: "shackGreenBreak",
                    residue: "map-perch-res.img"
                }
            },
            mapObjects: [
                {
                    type: "loot_tier_1",
                    pos: v2.create(0, 0),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "barn_wall_int_2",
                    pos: v2.create(3.5, -3),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "barn_wall_int_2",
                    pos: v2.create(-3.5, -3),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "barn_wall_int_2",
                    pos: v2.create(3.5, 3),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "barn_wall_int_2",
                    pos: v2.create(-3.5, 3),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "barn_wall_int_2_5",
                    pos: v2.create(2.75, -4.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "barn_wall_int_2_5",
                    pos: v2.create(-2.75, -4.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "barn_wall_int_2_5",
                    pos: v2.create(2.75, 4.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "barn_wall_int_2_5",
                    pos: v2.create(-2.75, 4.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "house_window_broken_01",
                    pos: v2.create(0, 4.75),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "house_window_broken_01",
                    pos: v2.create(0, -4.75),
                    scale: 1,
                    ori: 1
                }
            ]
        };
        return util.mergeDeep(t, e || {});
    })({}),
    brick_wall_ext_1: X({
        material: "brick",
        extents: v2.create(0.5, 0.5)
    }),
    brick_wall_ext_2: X({
        material: "brick",
        extents: v2.create(0.5, 1)
    }),
    brick_wall_ext_3: X({
        material: "brick",
        extents: v2.create(0.5, 1.5)
    }),
    brick_wall_ext_4: X({
        material: "brick",
        extents: v2.create(0.5, 2)
    }),
    brick_wall_ext_5: X({
        material: "brick",
        extents: v2.create(0.5, 2.5)
    }),
    brick_wall_ext_6: X({
        material: "brick",
        extents: v2.create(0.5, 3)
    }),
    brick_wall_ext_7: X({
        material: "brick",
        extents: v2.create(0.5, 3.5)
    }),
    brick_wall_ext_8: X({
        material: "brick",
        extents: v2.create(0.5, 4)
    }),
    brick_wall_ext_9: X({
        material: "brick",
        extents: v2.create(0.5, 4.5)
    }),
    brick_wall_ext_10: X({
        material: "brick",
        extents: v2.create(0.5, 5)
    }),
    brick_wall_ext_11: X({
        material: "brick",
        extents: v2.create(0.5, 5.5)
    }),
    brick_wall_ext_12: X({
        material: "brick",
        extents: v2.create(0.5, 6)
    }),
    brick_wall_ext_12_5: X({
        material: "brick",
        extents: v2.create(0.5, 6.25)
    }),
    brick_wall_ext_13: X({
        material: "brick",
        extents: v2.create(0.5, 6.5)
    }),
    brick_wall_ext_14: X({
        material: "brick",
        extents: v2.create(0.5, 7)
    }),
    brick_wall_ext_15: X({
        material: "brick",
        extents: v2.create(0.5, 7.5)
    }),
    brick_wall_ext_16: X({
        material: "brick",
        extents: v2.create(0.5, 8)
    }),
    brick_wall_ext_17: X({
        material: "brick",
        extents: v2.create(0.5, 8.5)
    }),
    brick_wall_ext_18: X({
        material: "brick",
        extents: v2.create(0.5, 9)
    }),
    brick_wall_ext_19: X({
        material: "brick",
        extents: v2.create(0.5, 9.5)
    }),
    brick_wall_ext_20: X({
        material: "brick",
        extents: v2.create(0.5, 10)
    }),
    brick_wall_ext_21: X({
        material: "brick",
        extents: v2.create(0.5, 10.5)
    }),
    brick_wall_ext_23: X({
        material: "brick",
        extents: v2.create(0.5, 11.5)
    }),
    brick_wall_ext_33: X({
        material: "brick",
        extents: v2.create(0.5, 16.5)
    }),
    brick_wall_ext_41: X({
        material: "brick",
        extents: v2.create(0.5, 20.5)
    }),
    brick_wall_ext_short_7: X({
        material: "brick",
        extents: v2.create(0.5, 3.5),
        height: 0.5
    }),
    brick_wall_ext_thicker_4: X({
        material: "brick",
        extents: v2.create(1.5, 2)
    }),
    brick_wall_ext_thicker_5: X({
        material: "brick",
        extents: v2.create(1.5, 2.5)
    }),
    brick_wall_ext_thicker_6: X({
        material: "brick",
        extents: v2.create(1.5, 3)
    }),
    brick_wall_ext_thicker_7: X({
        material: "brick",
        extents: v2.create(1.5, 3.5)
    }),
    brick_wall_ext_thicker_8: X({
        material: "brick",
        extents: v2.create(1.5, 4)
    }),
    brick_wall_ext_thicker_9: X({
        material: "brick",
        extents: v2.create(1.5, 4.5)
    }),
    brick_wall_ext_thicker_15: X({
        material: "brick",
        extents: v2.create(1.5, 7.5)
    }),
    brick_wall_ext_thicker_16: X({
        material: "brick",
        extents: v2.create(1.5, 8)
    }),
    brick_wall_ext_thicker_24: X({
        material: "brick",
        extents: v2.create(1.5, 12)
    }),
    concrete_wall_ext_thin_6: X({
        material: "concrete",
        extents: v2.create(0.375, 3)
    }),
    concrete_wall_ext_1_5: X({
        material: "concrete",
        extents: v2.create(0.5, 0.75)
    }),
    concrete_wall_ext_2: X({
        material: "concrete",
        extents: v2.create(0.5, 1)
    }),
    concrete_wall_ext_3: X({
        material: "concrete",
        extents: v2.create(0.5, 1.5)
    }),
    concrete_wall_ext_4: X({
        material: "concrete",
        extents: v2.create(0.5, 2)
    }),
    concrete_wall_ext_5: X({
        material: "concrete",
        extents: v2.create(0.5, 2.5)
    }),
    concrete_wall_ext_6: X({
        material: "concrete",
        extents: v2.create(0.5, 3)
    }),
    concrete_wall_ext_7: X({
        material: "concrete",
        extents: v2.create(0.5, 3.5)
    }),
    concrete_wall_ext_8: X({
        material: "concrete",
        extents: v2.create(0.5, 4)
    }),
    concrete_wall_ext_9: X({
        material: "concrete",
        extents: v2.create(0.5, 4.5)
    }),
    concrete_wall_ext_9_5: X({
        material: "concrete",
        extents: v2.create(0.5, 4.75)
    }),
    concrete_wall_ext_10_5: X({
        material: "concrete",
        extents: v2.create(0.5, 5.25)
    }),
    concrete_wall_ext_11: X({
        material: "concrete",
        extents: v2.create(0.5, 5.5)
    }),
    concrete_wall_ext_11_5: X({
        material: "concrete",
        extents: v2.create(0.5, 5.75)
    }),
    concrete_wall_ext_13: X({
        material: "concrete",
        extents: v2.create(0.5, 6.5)
    }),
    concrete_wall_ext_14: X({
        material: "concrete",
        extents: v2.create(0.5, 7)
    }),
    concrete_wall_ext_15: X({
        material: "concrete",
        extents: v2.create(0.5, 7.5)
    }),
    concrete_wall_ext_16: X({
        material: "concrete",
        extents: v2.create(0.5, 8)
    }),
    concrete_wall_ext_17: X({
        material: "concrete",
        extents: v2.create(0.5, 8.5)
    }),
    concrete_wall_ext_23: X({
        material: "concrete",
        extents: v2.create(0.5, 11.5)
    }),
    concrete_wall_ext_24: X({
        material: "concrete",
        extents: v2.create(0.5, 12)
    }),
    concrete_wall_ext_25: X({
        material: "concrete",
        extents: v2.create(0.5, 12.5)
    }),
    concrete_wall_column_4x8: X({
        material: "concrete",
        extents: v2.create(2, 4)
    }),
    concrete_wall_column_4x9: X({
        material: "concrete",
        extents: v2.create(2, 4.5)
    }),
    concrete_wall_column_4x24: X({
        material: "concrete",
        extents: v2.create(2, 12)
    }),
    concrete_wall_column_5x10: X({
        material: "concrete",
        extents: v2.create(2.5, 5)
    }),
    concrete_wall_column_7x10: X({
        material: "concrete",
        extents: v2.create(3.5, 5)
    }),
    concrete_wall_ext_thick_11: X({
        material: "concrete",
        extents: v2.create(1, 5.5)
    }),
    concrete_wall_ext_thicker_4: X({
        material: "concrete",
        extents: v2.create(1.5, 2)
    }),
    concrete_wall_ext_thicker_5: X({
        material: "concrete",
        extents: v2.create(1.5, 2.5)
    }),
    concrete_wall_ext_thicker_6: X({
        material: "concrete",
        extents: v2.create(1.5, 3)
    }),
    concrete_wall_ext_thicker_8: X({
        material: "concrete",
        extents: v2.create(1.5, 4)
    }),
    concrete_wall_ext_thicker_9: X({
        material: "concrete",
        extents: v2.create(1.5, 4.5)
    }),
    concrete_wall_ext_thicker_10: X({
        material: "concrete",
        extents: v2.create(1.5, 5)
    }),
    concrete_wall_ext_thicker_11: X({
        material: "concrete",
        extents: v2.create(1.5, 5.5)
    }),
    concrete_wall_ext_thicker_12: X({
        material: "concrete",
        extents: v2.create(1.5, 6)
    }),
    concrete_wall_ext_thicker_13: X({
        material: "concrete",
        extents: v2.create(1.5, 6.5)
    }),
    concrete_wall_ext_thicker_14: X({
        material: "concrete",
        extents: v2.create(1.5, 7)
    }),
    concrete_wall_ext_thicker_15: X({
        material: "concrete",
        extents: v2.create(1.5, 7.5)
    }),
    concrete_wall_ext_thicker_17: X({
        material: "concrete",
        extents: v2.create(1.5, 8.5)
    }),
    concrete_wall_ext_thicker_19: X({
        material: "concrete",
        extents: v2.create(1.5, 9.5)
    }),
    concrete_wall_ext_thicker_21: X({
        material: "concrete",
        extents: v2.create(1.5, 10.5)
    }),
    concrete_wall_ext_thicker_22: X({
        material: "concrete",
        extents: v2.create(1.5, 11)
    }),
    concrete_wall_ext_thicker_27: X({
        material: "concrete",
        extents: v2.create(1.5, 13.5)
    }),
    concrete_wall_ext_thicker_30: X({
        material: "concrete",
        extents: v2.create(1.5, 15)
    }),
    concrete_wall_ext_thicker_31: X({
        material: "concrete",
        extents: v2.create(1.5, 15.5)
    }),
    concrete_wall_ext_thicker_42: X({
        material: "concrete",
        extents: v2.create(1.5, 21)
    }),
    concrete_wall_ext_thicker_54: X({
        material: "concrete",
        extents: v2.create(1.5, 27)
    }),
    metal_wall_ext_3: X({
        material: "metal",
        extents: v2.create(0.5, 1.5)
    }),
    metal_wall_ext_4: X({
        material: "metal",
        extents: v2.create(0.5, 2)
    }),
    metal_wall_ext_5: X({
        material: "metal",
        extents: v2.create(0.5, 2.5)
    }),
    metal_wall_ext_6: X({
        material: "metal",
        extents: v2.create(0.5, 3)
    }),
    metal_wall_ext_7: X({
        material: "metal",
        extents: v2.create(0.5, 3.5)
    }),
    metal_wall_ext_8: X({
        material: "metal",
        extents: v2.create(0.5, 4)
    }),
    metal_wall_ext_9: X({
        material: "metal",
        extents: v2.create(0.5, 4.5)
    }),
    metal_wall_ext_10: X({
        material: "metal",
        extents: v2.create(0.5, 5)
    }),
    metal_wall_ext_12: X({
        material: "metal",
        extents: v2.create(0.5, 6)
    }),
    metal_wall_ext_12_5: X({
        material: "metal",
        extents: v2.create(0.5, 6.25)
    }),
    metal_wall_ext_13: X({
        material: "metal",
        extents: v2.create(0.5, 6.5)
    }),
    metal_wall_ext_18: X({
        material: "metal",
        extents: v2.create(0.5, 9)
    }),
    metal_wall_ext_23: X({
        material: "metal",
        extents: v2.create(0.5, 11.5)
    }),
    metal_wall_ext_43: X({
        material: "metal",
        extents: v2.create(0.5, 21.5)
    }),
    metal_wall_ext_short_6: X({
        material: "metal",
        extents: v2.create(0.5, 3),
        height: 0.5
    }),
    metal_wall_ext_short_7: X({
        material: "metal",
        extents: v2.create(0.5, 3.5),
        height: 0.5
    }),
    metal_wall_ext_thick_6: X({
        material: "metal",
        extents: v2.create(1, 3)
    }),
    metal_wall_ext_thick_12: X({
        material: "metal",
        extents: v2.create(1, 6)
    }),
    metal_wall_ext_thick_20: X({
        material: "metal",
        extents: v2.create(1, 10)
    }),
    metal_wall_ext_thicker_4: X({
        material: "metal",
        extents: v2.create(1.5, 2)
    }),
    metal_wall_ext_thicker_5: X({
        material: "metal",
        extents: v2.create(1.5, 2.5)
    }),
    metal_wall_ext_thicker_6: X({
        material: "metal",
        extents: v2.create(1.5, 3)
    }),
    metal_wall_ext_thicker_7: X({
        material: "metal",
        extents: v2.create(1.5, 3.5)
    }),
    metal_wall_ext_thicker_8: X({
        material: "metal",
        extents: v2.create(1.5, 4)
    }),
    metal_wall_ext_thicker_9: X({
        material: "metal",
        extents: v2.create(1.5, 4.5)
    }),
    metal_wall_ext_thicker_10: X({
        material: "metal",
        extents: v2.create(1.5, 5)
    }),
    metal_wall_ext_thicker_11: X({
        material: "metal",
        extents: v2.create(1.5, 5.5)
    }),
    metal_wall_ext_thicker_12: X({
        material: "metal",
        extents: v2.create(1.5, 6)
    }),
    metal_wall_ext_thicker_13: X({
        material: "metal",
        extents: v2.create(1.5, 6.5)
    }),
    metal_wall_ext_thicker_14: X({
        material: "metal",
        extents: v2.create(1.5, 7)
    }),
    metal_wall_ext_thicker_15: X({
        material: "metal",
        extents: v2.create(1.5, 7.5)
    }),
    metal_wall_ext_thicker_16: X({
        material: "metal",
        extents: v2.create(1.5, 8)
    }),
    metal_wall_ext_thicker_17: X({
        material: "metal",
        extents: v2.create(1.5, 8.5)
    }),
    metal_wall_ext_thicker_18: X({
        material: "metal",
        extents: v2.create(1.5, 9)
    }),
    metal_wall_ext_thicker_19: X({
        material: "metal",
        extents: v2.create(1.5, 9.5)
    }),
    metal_wall_ext_thicker_20: X({
        material: "metal",
        extents: v2.create(1.5, 10)
    }),
    metal_wall_ext_thicker_21: X({
        material: "metal",
        extents: v2.create(1.5, 10.5)
    }),
    metal_wall_ext_thicker_22: X({
        material: "metal",
        extents: v2.create(1.5, 11)
    }),
    metal_wall_ext_thicker_23: X({
        material: "metal",
        extents: v2.create(1.5, 11.5)
    }),
    metal_wall_ext_thicker_24: X({
        material: "metal",
        extents: v2.create(1.5, 12)
    }),
    metal_wall_ext_thicker_25: X({
        material: "metal",
        extents: v2.create(1.5, 12.5)
    }),
    metal_wall_ext_thicker_26: X({
        material: "metal",
        extents: v2.create(1.5, 13)
    }),
    metal_wall_ext_thicker_27: X({
        material: "metal",
        extents: v2.create(1.5, 13.5)
    }),
    metal_wall_ext_thicker_28: X({
        material: "metal",
        extents: v2.create(1.5, 14.5)
    }),
    metal_wall_ext_thicker_29: X({
        material: "metal",
        extents: v2.create(1.5, 14.5)
    }),
    metal_wall_ext_thicker_32: X({
        material: "metal",
        extents: v2.create(1.5, 16)
    }),
    metal_wall_ext_thicker_34: X({
        material: "metal",
        extents: v2.create(1.5, 17)
    }),
    metal_wall_ext_thicker_35: X({
        material: "metal",
        extents: v2.create(1.5, 17.5)
    }),
    metal_wall_ext_thicker_42: X({
        material: "metal",
        extents: v2.create(1.5, 21)
    }),
    metal_wall_ext_thicker_48: X({
        material: "metal",
        extents: v2.create(1.5, 24)
    }),
    glass_wall_9: X({
        material: "glass",
        extents: v2.create(0.5, 4.5),
        health: 100,
        img: wallImg("map-wall-glass-9.img")
    }),
    glass_wall_10: X({
        material: "glass",
        extents: v2.create(0.5, 5),
        health: 50,
        img: wallImg("map-wall-glass-10.img")
    }),
    glass_wall_12: X({
        material: "glass",
        extents: v2.create(0.5, 6),
        health: 50,
        img: wallImg("map-wall-glass-12.img")
    }),
    glass_wall_12_2: X({
        material: "glass",
        extents: v2.create(1, 6),
        health: 5e3,
        img: wallImg("map-wall-glass-12-2.img")
    }),
    glass_wall_18: X({
        material: "glass",
        extents: v2.create(0.5, 9),
        health: 150,
        img: wallImg("map-wall-glass-18.img")
    }),
    panicroom_01: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 2,
        floor: {
            surfaces: [
                {
                    type: "container",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(4.5, 6)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-building-panicroom-floor.img",
                    scale: 0.5,
                    alpha: 1,
                    tint: 6250335
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(4.5, 6)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-building-panicroom-ceiling.img",
                    scale: 0.5,
                    alpha: 1,
                    tint: 6250335
                }
            ]
        },
        mapObjects: [
            {
                type: "metal_wall_ext_12",
                pos: v2.create(-4, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_3",
                pos: v2.create(-2, 5.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_7",
                pos: v2.create(0, -5.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_12",
                pos: v2.create(4, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "loot_tier_2",
                pos: v2.create(0, -0.05),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ loot_tier_1: 1, "": 1 }),
                pos: v2.create(0, 0.05),
                scale: 1,
                ori: 0
            }
        ]
    },
    barn_basement_stairs_01: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 2,
        floor: {
            surfaces: [],
            imgs: [
                {
                    sprite: "map-building-barn-basement-stairs.img",
                    pos: v2.create(0, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: { zoomRegions: [], imgs: [] },
        mapObjects: [
            {
                type: "concrete_wall_ext_8",
                pos: v2.create(4, 2),
                scale: 1,
                ori: 0
            },
            {
                type: "concrete_wall_column_4x8",
                pos: v2.create(-2.5, 2),
                scale: 1,
                ori: 0
            },
            {
                type: "concrete_wall_column_4x9",
                pos: v2.create(0, -4),
                scale: 1,
                ori: 1
            }
        ]
    },
    barn_basement_floor_01: $({}),
    barn_basement_floor_01d: $({
        basement: "barn_basement_floor_02d"
    }),
    barn_basement_floor_02: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 0,
        floor: {
            surfaces: [
                {
                    type: "asphalt",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(0, 0)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-building-barn-basement-floor-02.img",
                    pos: v2.create(-2, -0.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(-1, -1),
                        v2.create(5, 6)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-building-barn-basement-ceiling-02.img",
                    pos: v2.create(-1.4, 0),
                    scale: 1,
                    alpha: 1,
                    tint: 6182731
                }
            ]
        },
        mapObjects: [
            {
                type: "chest_04",
                pos: v2.create(-1, -0.5),
                scale: 1,
                ori: 1
            }
        ]
    },
    barn_basement_floor_02d: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 0,
        floor: {
            surfaces: [
                {
                    type: "asphalt",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(0, 0)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-building-barn-basement-floor-02.img",
                    pos: v2.create(-2, -0.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(-1, -1),
                        v2.create(5, 6)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-building-barn-basement-ceiling-02.img",
                    pos: v2.create(-1.4, 0),
                    scale: 1,
                    alpha: 1,
                    tint: 6182731
                }
            ]
        },
        mapObjects: [
            {
                type: "chest_04d",
                pos: v2.create(-1, -0.5),
                scale: 1,
                ori: 1
            }
        ]
    },
    barn_basement_structure_01: {
        type: "structure",
        terrain: { grass: !0, beach: !1 },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(0, 0),
                v2.create(30, 30)
            )
        ],
        layers: [
            {
                type: "barn_basement_stairs_01",
                pos: v2.create(0, 0),
                ori: 0
            },
            {
                type: "barn_basement_floor_01",
                pos: v2.create(-10, -0.5),
                ori: 0
            }
        ],
        stairs: [
            {
                collision: collider.createAabbExtents(
                    v2.create(1.5, 1.5),
                    v2.create(2, 3.5)
                ),
                downDir: v2.create(0, -1)
            }
        ],
        mask: [
            collider.createAabbExtents(
                v2.create(-12.5, -1),
                v2.create(12, 8.5)
            ),
            collider.createAabbExtents(
                v2.create(3.51, -6),
                v2.create(4, 4)
            )
        ]
    },
    barn_basement_structure_01d: {
        type: "structure",
        terrain: { grass: !0, beach: !1 },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(0, 0),
                v2.create(30, 30)
            )
        ],
        layers: [
            {
                type: "barn_basement_stairs_01",
                pos: v2.create(0, 0),
                ori: 0
            },
            {
                type: "barn_basement_floor_01d",
                pos: v2.create(-10, -0.5),
                ori: 0
            }
        ],
        stairs: [
            {
                collision: collider.createAabbExtents(
                    v2.create(1.5, 1.5),
                    v2.create(2, 3.5)
                ),
                downDir: v2.create(0, -1)
            }
        ],
        mask: [
            collider.createAabbExtents(
                v2.create(-12.5, -1),
                v2.create(12, 8.5)
            ),
            collider.createAabbExtents(
                v2.create(3.51, -6),
                v2.create(4, 4)
            )
        ]
    },
    barn_wall_int_2: X({
        material: "wood",
        extents: v2.create(0.5, 1),
        hitParticle: "ltgreenChip",
        img: wallImg("map-wall-02-rounded.img", 7173701)
    }),
    barn_wall_int_2_5: X({
        material: "wood",
        extents: v2.create(0.5, 1.25),
        hitParticle: "ltgreenChip",
        img: wallImg("map-wall-02-5-rounded.img", 7173701)
    }),
    barn_wall_int_4: X({
        material: "wood",
        extents: v2.create(0.5, 2),
        hitParticle: "ltgreenChip",
        img: wallImg("map-wall-04-rounded.img", 7173701)
    }),
    barn_wall_int_5: X({
        material: "wood",
        extents: v2.create(0.5, 2.5),
        hitParticle: "ltgreenChip",
        img: wallImg("map-wall-05-rounded.img", 7173701)
    }),
    barn_wall_int_6: X({
        material: "wood",
        extents: v2.create(0.5, 3),
        hitParticle: "ltgreenChip",
        img: wallImg("map-wall-06-rounded.img", 7173701)
    }),
    barn_wall_int_7: X({
        material: "wood",
        extents: v2.create(0.5, 3.5),
        hitParticle: "ltgreenChip",
        img: wallImg("map-wall-07-rounded.img", 7173701)
    }),
    barn_wall_int_8: X({
        material: "wood",
        extents: v2.create(0.5, 4),
        hitParticle: "ltgreenChip",
        img: wallImg("map-wall-08-rounded.img", 7173701)
    }),
    barn_wall_int_11: X({
        material: "wood",
        extents: v2.create(0.5, 5.5),
        hitParticle: "ltgreenChip",
        img: wallImg("map-wall-11-rounded.img", 7173701)
    }),
    barn_wall_int_13: X({
        material: "wood",
        extents: v2.create(0.5, 6.5),
        hitParticle: "ltgreenChip",
        img: wallImg("map-wall-13-rounded.img", 7173701)
    }),
    barn_column_1: X({
        material: "concrete",
        extents: v2.create(1, 1),
        hitParticle: "ltgreenChip",
        img: wallImg("map-column-01.img", 2764060)
    }),
    barn_01: Q({ bonus_door: "house_door_02" }),
    barn_01h: Q({
        porch_01: "cache_pumpkin_02",
        bonus_door: "house_door_02"
    }),
    barn_01x: Q({
        ceiling: {
            imgs: [
                {
                    sprite: "map-building-barn-ceiling-01.img",
                    pos: v2.create(0, -2),
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-barn-ceiling-02.img",
                    pos: v2.create(0, 13.2),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-snow-01.img",
                    pos: v2.create(-14.5, 5.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 0
                },
                {
                    sprite: "map-snow-02.img",
                    pos: v2.create(-0.5, -9),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 0
                },
                {
                    sprite: "map-snow-03.img",
                    pos: v2.create(14.5, 5.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 0
                }
            ]
        },
        bonus_door: "house_door_02"
    }),
    barn_02: Q({
        bonus_room: "barn_basement_structure_01",
        bonus_door: "",
        map: { displayType: "barn_01" }
    }),
    barn_02d: Q({
        bonus_room: "barn_basement_structure_01d",
        bonus_door: "",
        map: { displayType: "barn_01" }
    }),
    bank_wall_int_3: X({
        material: "wood",
        extents: v2.create(0.5, 1.5),
        img: wallImg("map-wall-03-rounded.img", 7951934)
    }),
    bank_wall_int_4: X({
        material: "wood",
        extents: v2.create(0.5, 2),
        img: wallImg("map-wall-04-rounded.img", 7951934)
    }),
    bank_wall_int_5: X({
        material: "wood",
        extents: v2.create(0.5, 2.5),
        img: wallImg("map-wall-05-rounded.img", 7951934)
    }),
    bank_wall_int_8: X({
        material: "wood",
        extents: v2.create(0.5, 4),
        img: wallImg("map-wall-08-rounded.img", 7951934)
    }),
    bank_01: Y({}),
    bank_01b: Y({ vault: "vault_01b" }),
    bank_01x: Y({
        ceiling: {
            imgs: [
                {
                    sprite: "map-building-bank-ceiling-01.img",
                    pos: v2.create(-16, 7),
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-bank-ceiling-02.img",
                    pos: v2.create(6, 0),
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-bank-ceiling-03.img",
                    pos: v2.create(22, 8),
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-snow-02.img",
                    pos: v2.create(-13, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 1
                },
                {
                    sprite: "map-snow-04.img",
                    pos: v2.create(1.25, 9.25),
                    scale: 1,
                    alpha: 1,
                    tint: 16777215,
                    rot: 2
                },
                {
                    sprite: "map-snow-06.img",
                    pos: v2.create(13.75, 15.25),
                    scale: 0.75,
                    alpha: 1,
                    tint: 16777215,
                    rot: 0
                },
                {
                    sprite: "map-snow-06.img",
                    pos: v2.create(15.25, -15.75),
                    scale: 0.75,
                    alpha: 1,
                    tint: 16777215,
                    rot: 1
                }
            ]
        }
    }),
    vault_door_main: z({
        material: "metal",
        hinge: v2.create(1, 3.5),
        extents: v2.create(1, 3.5),
        img: { sprite: "map-door-02.img" },
        door: {
            interactionRad: 1.5,
            openSpeed: 0.23,
            openOneWay: -1,
            openDelay: 4.1,
            openOnce: !0,
            spriteAnchor: v2.create(0.2, 1),
            sound: {
                open: "none",
                close: "none",
                change: "vault_change_01"
            }
        }
    }),
    vault_01: J({}),
    vault_01b: J({
        gold_box: 9,
        floor_loot: "loot_tier_stonehammer"
    }),
    police_wall_int_2: X({
        material: "wood",
        extents: v2.create(0.5, 1),
        img: wallImg("map-wall-02-rounded.img", 1777447)
    }),
    police_wall_int_3: X({
        material: "wood",
        extents: v2.create(0.5, 1.5),
        img: wallImg("map-wall-03-rounded.img", 1777447)
    }),
    police_wall_int_4: X({
        material: "wood",
        extents: v2.create(0.5, 2),
        img: wallImg("map-wall-04-rounded.img", 1777447)
    }),
    police_wall_int_6: X({
        material: "wood",
        extents: v2.create(0.5, 3),
        img: wallImg("map-wall-06-rounded.img", 1777447)
    }),
    police_wall_int_7: X({
        material: "wood",
        extents: v2.create(0.5, 3.5),
        img: wallImg("map-wall-07-rounded.img", 1777447)
    }),
    police_wall_int_8: X({
        material: "wood",
        extents: v2.create(0.5, 4),
        img: wallImg("map-wall-08-rounded.img", 1777447)
    }),
    police_wall_int_10: X({
        material: "wood",
        extents: v2.create(0.5, 5),
        img: wallImg("map-wall-10-rounded.img", 1777447)
    }),
    police_01: ue({}),
    police_01x: ue({
        ceiling: {
            imgs: [
                {
                    sprite: "map-building-police-ceiling-01.img",
                    pos: v2.create(-21.5, 8.5),
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-police-ceiling-02.img",
                    pos: v2.create(10.5, 0),
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-police-ceiling-03.img",
                    pos: v2.create(31.96, 12.5),
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-snow-01.img",
                    pos: v2.create(13, 17.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 3
                },
                {
                    sprite: "map-snow-02.img",
                    pos: v2.create(-21, 14),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 0
                },
                {
                    sprite: "map-snow-03.img",
                    pos: v2.create(30.25, 6.25),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 2
                },
                {
                    sprite: "map-snow-07.img",
                    pos: v2.create(4.5, -3.25),
                    scale: 0.6,
                    alpha: 1,
                    tint: 16777215,
                    rot: 1
                },
                {
                    sprite: "map-snow-06.img",
                    pos: v2.create(-40.25, 14.75),
                    scale: 0.75,
                    alpha: 1,
                    tint: 16777215,
                    rot: 3
                },
                {
                    sprite: "map-snow-06.img",
                    pos: v2.create(-38.75, 0.75),
                    scale: 0.75,
                    alpha: 1,
                    tint: 16777215,
                    rot: 2
                }
            ]
        }
    }),
    house_wall_int_4: X({
        material: "wood",
        extents: v2.create(0.5, 2),
        hitParticle: "tanChip",
        img: wallImg("map-wall-04-rounded.img", 10584424)
    }),
    house_wall_int_5: X({
        material: "wood",
        extents: v2.create(0.5, 2.5),
        hitParticle: "tanChip",
        img: wallImg("map-wall-05-rounded.img", 10584424)
    }),
    house_wall_int_8: X({
        material: "wood",
        extents: v2.create(0.5, 4),
        hitParticle: "tanChip",
        img: wallImg("map-wall-08-rounded.img", 10584424)
    }),
    house_wall_int_9: X({
        material: "wood",
        extents: v2.create(0.5, 4.5),
        hitParticle: "tanChip",
        img: wallImg("map-wall-09-rounded.img", 10584424)
    }),
    house_wall_int_11: X({
        material: "wood",
        extents: v2.create(0.5, 5.5),
        hitParticle: "tanChip",
        img: wallImg("map-wall-11-rounded.img", 10584424)
    }),
    house_wall_int_14: X({
        material: "wood",
        extents: v2.create(0.5, 7),
        hitParticle: "tanChip",
        img: wallImg("map-wall-14-rounded.img", 10584424)
    }),
    house_column_1: X({
        material: "concrete",
        extents: v2.create(1, 1),
        hitParticle: "tanChip",
        img: wallImg("map-column-01.img", 5587506)
    }),
    house_red_01: ge({ stand: "stand_01" }),
    house_red_01h: ge({
        porch_01: "cache_pumpkin_02",
        stand: "stand_01"
    }),
    house_red_01x: ge({
        ceiling: {
            imgs: [
                {
                    sprite: "map-building-house-ceiling.img",
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-snow-01.img",
                    pos: v2.create(-5.5, 8.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-snow-02.img",
                    pos: v2.create(4.5, -7),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        }
    }),
    house_red_02: ye({ stand: "stand_01" }),
    house_red_02h: ye({
        porch_01: "cache_pumpkin_02",
        stand: "stand_01"
    }),
    house_red_02x: ye({
        ceiling: {
            imgs: [
                {
                    sprite: "map-building-house-ceiling.img",
                    scale: 0.667,
                    alpha: 1,
                    tint: 13619151,
                    rot: 2
                },
                {
                    sprite: "map-snow-02.img",
                    pos: v2.create(3.5, 6),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 2
                },
                {
                    sprite: "map-snow-01.img",
                    pos: v2.create(-4.5, -8),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 3
                }
            ]
        }
    }),
    cabin_wall_int_5: X({
        material: "wood",
        extents: v2.create(0.5, 2.5),
        hitParticle: "tanChip",
        img: wallImg("map-wall-05-rounded.img", 10584424)
    }),
    cabin_wall_int_10: X({
        material: "wood",
        extents: v2.create(0.5, 5),
        hitParticle: "tanChip",
        img: wallImg("map-wall-10-rounded.img", 10584424)
    }),
    cabin_wall_int_13: X({
        material: "wood",
        extents: v2.create(0.5, 6.5),
        hitParticle: "tanChip",
        img: wallImg("map-wall-13-rounded.img", 10584424)
    }),
    cabin_01: te({}),
    cabin_01x: te({
        ceiling: {
            imgs: [
                {
                    sprite: "map-building-cabin-ceiling-01a.img",
                    pos: v2.create(0, 0.5),
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-cabin-ceiling-01b.img",
                    pos: v2.create(4, -13),
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-snow-01.img",
                    pos: v2.create(-13, 6),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 1
                },
                {
                    sprite: "map-snow-02.img",
                    pos: v2.create(-3.5, -6.25),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 1
                },
                {
                    sprite: "map-snow-03.img",
                    pos: v2.create(10.75, 8.25),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 0
                },
                {
                    sprite: "map-chimney-01.img",
                    pos: v2.create(13, 2),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    removeOnDamaged: !0
                }
            ]
        }
    }),
    cabin_02: te({
        cabin_mount: "gun_mount_02",
        porch_01: "cache_pumpkin_02"
    }),
    dock_01: {
        type: "building",
        map: {
            display: !0,
            shapes: [
                {
                    collider: collider.createAabbExtents(
                        v2.create(2.5, 0),
                        v2.create(2.4, 10.25)
                    ),
                    color: 8862486
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(-2.45, 7.75),
                        v2.create(2.6, 2.5)
                    ),
                    color: 8862486
                }
            ]
        },
        terrain: {
            grass: !0,
            beach: !1,
            bridge: { nearbyWidthMult: 0.75 }
        },
        bridgeLandBounds: [
            collider.createAabbExtents(
                v2.create(2.5, -10.5),
                v2.create(2.5, 1.5)
            )
        ],
        bridgeWaterBounds: [
            collider.createAabbExtents(
                v2.create(0, 7.75),
                v2.create(5.5, 3.5)
            )
        ],
        zIdx: 1,
        floor: {
            surfaces: [
                {
                    type: "shack",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(2.5, 0),
                            v2.create(2.4, 10.25)
                        ),
                        collider.createAabbExtents(
                            v2.create(-2.45, 7.75),
                            v2.create(2.6, 2.5)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-building-dock-floor-01a.img",
                    pos: v2.create(-2.5, 7.85),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-dock-floor-01b.img",
                    pos: v2.create(2.5, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: { zoomRegions: [], imgs: [] },
        mapObjects: [
            {
                type: "bollard_01",
                pos: v2.create(-4.25, 7.75),
                scale: 0.8,
                ori: 2
            },
            {
                type: randomObstacleType({ barrel_01: 1, crate_01: 1 }),
                pos: v2.create(3, 8.25),
                scale: 0.75,
                ori: 0
            }
        ]
    },
    mansion_wall_int_1: X({
        material: "wood",
        extents: v2.create(0.5, 0.5),
        hitParticle: "ltgreenChip",
        img: wallImg("map-wall-01-rounded.img", 16768917)
    }),
    mansion_wall_int_5: X({
        material: "wood",
        extents: v2.create(0.5, 2.5),
        hitParticle: "ltgreenChip",
        img: wallImg("map-wall-05-rounded.img", 16768917)
    }),
    mansion_wall_int_6: X({
        material: "wood",
        extents: v2.create(0.5, 3),
        hitParticle: "ltgreenChip",
        img: wallImg("map-wall-06-rounded.img", 16768917)
    }),
    mansion_wall_int_7: X({
        material: "wood",
        extents: v2.create(0.5, 3.5),
        hitParticle: "ltgreenChip",
        img: wallImg("map-wall-07-rounded.img", 16768917)
    }),
    mansion_wall_int_8: X({
        material: "wood",
        extents: v2.create(0.5, 4),
        hitParticle: "ltgreenChip",
        img: wallImg("map-wall-08-rounded.img", 16768917)
    }),
    mansion_wall_int_9: X({
        material: "wood",
        extents: v2.create(0.5, 4.5),
        hitParticle: "ltgreenChip",
        img: wallImg("map-wall-09-rounded.img", 16768917)
    }),
    mansion_wall_int_10: X({
        material: "wood",
        extents: v2.create(0.5, 5),
        hitParticle: "ltgreenChip",
        img: wallImg("map-wall-10-rounded.img", 16768917)
    }),
    mansion_wall_int_11: X({
        material: "wood",
        extents: v2.create(0.5, 5.5),
        hitParticle: "ltgreenChip",
        img: wallImg("map-wall-11-rounded.img", 16768917)
    }),
    mansion_wall_int_12: X({
        material: "wood",
        extents: v2.create(0.5, 6),
        hitParticle: "ltgreenChip",
        img: wallImg("map-wall-12-rounded.img", 16768917)
    }),
    mansion_wall_int_13: X({
        material: "wood",
        extents: v2.create(0.5, 6.5),
        hitParticle: "ltgreenChip",
        img: wallImg("map-wall-13-rounded.img", 16768917)
    }),
    mansion_column_1: X({
        material: "concrete",
        extents: v2.create(1, 1),
        hitParticle: "tanChip",
        img: wallImg("map-column-01.img", 7432016)
    }),
    saferoom_01: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 2,
        floor: {
            surfaces: [
                {
                    type: "container",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(6, 4)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-building-saferoom-floor.img",
                    scale: 0.5,
                    alpha: 1,
                    tint: 6250335
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(5, 3)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-building-saferoom-ceiling.img",
                    scale: 0.5,
                    alpha: 1,
                    tint: 6250335
                }
            ]
        },
        mapObjects: [
            {
                type: "metal_wall_ext_7",
                pos: v2.create(-5, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_6",
                pos: v2.create(1.5, 3),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_9",
                pos: v2.create(0, -3),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_7",
                pos: v2.create(5, 0),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({
                    case_01: 1,
                    case_02: 0.025,
                    chest_02: 1
                }),
                pos: v2.create(2.5, 0),
                scale: 1,
                ori: 3
            }
        ]
    },
    mansion_01: le({}),
    mansion_01x: le({
        ceiling: {
            imgs: [
                {
                    sprite: "map-building-mansion-ceiling.img",
                    scale: 1,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-snow-01.img",
                    pos: v2.create(6, 19.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 1
                },
                {
                    sprite: "map-snow-02.img",
                    pos: v2.create(-16, 8),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 2
                },
                {
                    sprite: "map-snow-03.img",
                    pos: v2.create(20.25, -1.75),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 1
                },
                {
                    sprite: "map-snow-04.img",
                    pos: v2.create(10.25, -13.25),
                    scale: 1,
                    alpha: 1,
                    tint: 16777215,
                    rot: 0
                },
                {
                    sprite: "map-snow-05.img",
                    pos: v2.create(10.25, 6.25),
                    scale: 1,
                    alpha: 1,
                    tint: 16777215,
                    rot: 0
                },
                {
                    sprite: "map-snow-07.img",
                    pos: v2.create(-21.25, -20.25),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 2
                },
                {
                    sprite: "map-snow-06.img",
                    pos: v2.create(-29.75, 13.25),
                    scale: 0.75,
                    alpha: 1,
                    tint: 16777215,
                    rot: 3
                }
            ]
        },
        tree: "tree_11",
        tree_scale: 1,
        tree_loot: "loot_tier_1",
        bush_chance: 999
    }),
    mansion_02: le({
        decoration_01: "decal_web_01",
        decoration_02: "candle_lit_01",
        porch_01: "cache_pumpkin_02",
        entry_loot: ""
    }),
    mansion_cellar_01: ce({}),
    mansion_cellar_02: ce({
        decoration_01: "decal_web_01",
        decoration_02: "candle_lit_01",
        mid_obs_01: "pumpkin_01"
    }),
    mansion_structure_01: {
        type: "structure",
        terrain: { grass: !0, beach: !1 },
        layers: [
            {
                type: "mansion_01",
                pos: v2.create(0, 0),
                ori: 0
            },
            {
                type: "mansion_cellar_01",
                pos: v2.create(0, 0),
                ori: 0
            }
        ],
        stairs: [
            {
                collision: collider.createAabbExtents(
                    v2.create(28, 1.5),
                    v2.create(3, 2.55)
                ),
                downDir: v2.create(-1, 0),
                noCeilingReveal: !0
            },
            {
                collision: collider.createAabbExtents(
                    v2.create(1, 13.5),
                    v2.create(2, 3.5)
                ),
                downDir: v2.create(0, -1)
            }
        ],
        mask: [
            collider.createAabbExtents(
                v2.create(10, -0.1),
                v2.create(15, 10.1)
            ),
            collider.createAabbExtents(
                v2.create(17.5, 13.5),
                v2.create(7.49, 3.49)
            )
        ]
    },
    mansion_structure_02: {
        type: "structure",
        terrain: { grass: !0, beach: !1 },
        layers: [
            {
                type: "mansion_02",
                pos: v2.create(0, 0),
                ori: 0
            },
            {
                type: "mansion_cellar_02",
                pos: v2.create(0, 0),
                ori: 0
            }
        ],
        stairs: [
            {
                collision: collider.createAabbExtents(
                    v2.create(28, 1.5),
                    v2.create(3, 2.55)
                ),
                downDir: v2.create(-1, 0),
                noCeilingReveal: !0
            },
            {
                collision: collider.createAabbExtents(
                    v2.create(1, 13.5),
                    v2.create(2, 3.5)
                ),
                downDir: v2.create(0, -1)
            }
        ],
        mask: [
            collider.createAabbExtents(
                v2.create(10, -0.1),
                v2.create(15, 10.1)
            ),
            collider.createAabbExtents(
                v2.create(17.5, 13.5),
                v2.create(7.49, 3.49)
            )
        ]
    },
    saloon_column_1: X({
        material: "woodPerm",
        extents: v2.create(1, 1),
        hitParticle: "blackChip",
        img: wallImg("map-column-01.img", 1710618)
    }),
    saloon_bar_small: Se({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(1.5, 5)
        ),
        img: {
            sprite: "",
            scale: 0.5,
            alpha: 1,
            tint: 4456448,
            zIdx: 10
        }
    }),
    saloon_bar_large: Se({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(1.5, 7.5)
        ),
        img: {
            sprite: "",
            scale: 0.5,
            alpha: 1,
            tint: 4456448,
            zIdx: 10
        }
    }),
    saloon_bar_back_large: Se({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(0.75, 5)
        ),
        img: {
            sprite: "map-saloon-bar-01.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        }
    }),
    saloon_bar_back_small: Se({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(0.75, 1.5)
        ),
        img: {
            sprite: "map-saloon-bar-02.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        }
    }),
    saloon_door_secret: z({
        destructible: !1,
        material: "wood",
        hitParticle: "woodChip",
        hinge: v2.create(0, 2),
        extents: v2.create(0.75, 2),
        door: {
            canUse: !1,
            openOnce: !0,
            openOneWay: !1,
            openSpeed: 36,
            autoOpen: !1,
            autoClose: !1,
            slideToOpen: !0,
            slideOffset: 4.5,
            sound: { open: "" }
        },
        img: {
            sprite: "map-door-04.img",
            residue: "map-drawers-res.img",
            scale: 0.5,
            tint: 16777215,
            zIdx: 9
        }
    }),
    wood_perm_wall_ext_5: X({
        material: "woodPerm",
        extents: v2.create(0.5, 2.5),
        hitParticle: "blackChip"
    }),
    wood_perm_wall_ext_6: X({
        material: "woodPerm",
        extents: v2.create(0.5, 3),
        hitParticle: "blackChip"
    }),
    wood_perm_wall_ext_7: X({
        material: "woodPerm",
        extents: v2.create(0.5, 3.5),
        hitParticle: "blackChip"
    }),
    wood_perm_wall_ext_14: X({
        material: "woodPerm",
        extents: v2.create(0.5, 7),
        hitParticle: "blackChip"
    }),
    wood_perm_wall_ext_17: X({
        material: "woodPerm",
        extents: v2.create(0.5, 8.5),
        hitParticle: "blackChip"
    }),
    wood_perm_wall_ext_35: X({
        material: "woodPerm",
        extents: v2.create(0.5, 17.5),
        hitParticle: "blackChip"
    }),
    wood_perm_wall_ext_thicker_6: X({
        material: "woodPerm",
        extents: v2.create(1.5, 3),
        hitParticle: "blackChip"
    }),
    wood_perm_wall_ext_thicker_7: X({
        material: "woodPerm",
        extents: v2.create(1.5, 3.5),
        hitParticle: "blackChip"
    }),
    wood_perm_wall_ext_thicker_8: X({
        material: "woodPerm",
        extents: v2.create(1.5, 4),
        hitParticle: "blackChip"
    }),
    wood_perm_wall_ext_thicker_10: X({
        material: "woodPerm",
        extents: v2.create(1.5, 5),
        hitParticle: "blackChip"
    }),
    wood_perm_wall_ext_thicker_12: X({
        material: "woodPerm",
        extents: v2.create(1.5, 6),
        hitParticle: "blackChip"
    }),
    wood_perm_wall_ext_thicker_13: X({
        material: "woodPerm",
        extents: v2.create(1.5, 6.5),
        hitParticle: "blackChip"
    }),
    wood_perm_wall_ext_thicker_18: X({
        material: "woodPerm",
        extents: v2.create(1.5, 9),
        hitParticle: "blackChip"
    }),
    wood_perm_wall_ext_thicker_21: X({
        material: "woodPerm",
        extents: v2.create(1.5, 10.5),
        hitParticle: "blackChip"
    }),
    saloon_01: {
        type: "building",
        map: {
            display: !0,
            shapes: [
                {
                    collider: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(20.5, 20.5)
                    ),
                    color: 5252110
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(-1, 1),
                        v2.create(19, 19)
                    ),
                    color: 4337194
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(-3, 3),
                        v2.create(17, 17)
                    ),
                    color: 2499104
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(-23.5, 1),
                        v2.create(3, 2)
                    ),
                    color: 3485483
                }
            ]
        },
        terrain: { grass: !0, beach: !1 },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(0, 0),
                v2.create(22.5, 22.5)
            )
        ],
        zIdx: 1,
        floor: {
            surfaces: [
                {
                    type: "house",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(20.5, 20.5)
                        ),
                        collider.createAabbExtents(
                            v2.create(-23.5, 1),
                            v2.create(3, 2)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-building-saloon-floor-01.img",
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-saloon-ceiling-02.img",
                    pos: v2.create(-23.5, 1),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(-1, 1),
                        v2.create(19, 19)
                    ),
                    zoomOut: collider.createAabbExtents(
                        v2.create(1, -1),
                        v2.create(21.5, 21.5)
                    )
                }
            ],
            vision: {
                dist: 5.5,
                width: 2.75,
                linger: 0.5,
                fadeRate: 6
            },
            damage: { obstacleCount: 1 },
            imgs: [
                {
                    sprite: "map-building-saloon-ceiling-01.img",
                    pos: v2.create(0, 0),
                    scale: 1,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-building-saloon-ceiling-02.img",
                    pos: v2.create(-23.5, 1),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-chimney-01.img",
                    pos: v2.create(-3, 3),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    removeOnDamaged: !0
                }
            ]
        },
        occupiedEmitters: [
            {
                type: "cabin_smoke_parent",
                pos: v2.create(0, 0),
                rot: 0,
                scale: 1,
                layer: 0,
                parentToCeiling: !0
            }
        ],
        puzzle: {
            name: "saloon",
            completeUseType: "saloon_door_secret",
            completeOffDelay: 1,
            completeUseDelay: 2,
            errorResetDelay: 1,
            pieceResetDelay: 10,
            sound: {
                fail: "door_error_01",
                complete: "piano_02"
            }
        },
        mapObjects: [
            {
                type: "wood_perm_wall_ext_17",
                pos: v2.create(-20, 11),
                scale: 1,
                ori: 0
            },
            {
                type: "wood_perm_wall_ext_5",
                pos: v2.create(-23, 3),
                scale: 1,
                ori: 1
            },
            {
                type: "wood_perm_wall_ext_5",
                pos: v2.create(-26, 1),
                scale: 1,
                ori: 0
            },
            {
                type: "wood_perm_wall_ext_5",
                pos: v2.create(-22, 1),
                scale: 1,
                ori: 0
            },
            {
                type: "wood_perm_wall_ext_5",
                pos: v2.create(-23, -1),
                scale: 1,
                ori: 1
            },
            {
                type: "wood_perm_wall_ext_14",
                pos: v2.create(-20, -7.5),
                scale: 1,
                ori: 0
            },
            {
                type: "wood_perm_wall_ext_35",
                pos: v2.create(-3, 20),
                scale: 1,
                ori: 1
            },
            {
                type: "wood_perm_wall_ext_6",
                pos: v2.create(-16.5, -14),
                scale: 1,
                ori: 1
            },
            {
                type: "house_window_01",
                pos: v2.create(-12, -14.25),
                scale: 1,
                ori: 1
            },
            {
                type: "wood_perm_wall_ext_7",
                pos: v2.create(-7, -14),
                scale: 1,
                ori: 1
            },
            {
                type: "house_window_01",
                pos: v2.create(-2, -14.25),
                scale: 1,
                ori: 1
            },
            {
                type: "wood_perm_wall_ext_7",
                pos: v2.create(3, -14),
                scale: 1,
                ori: 1
            },
            {
                type: "wood_perm_wall_ext_6",
                pos: v2.create(14, 16.5),
                scale: 1,
                ori: 0
            },
            {
                type: "house_window_01",
                pos: v2.create(14.25, 12),
                scale: 1,
                ori: 0
            },
            {
                type: "wood_perm_wall_ext_7",
                pos: v2.create(14, 7),
                scale: 1,
                ori: 0
            },
            {
                type: "house_window_01",
                pos: v2.create(14.25, 2),
                scale: 1,
                ori: 0
            },
            {
                type: "wood_perm_wall_ext_7",
                pos: v2.create(14, -3),
                scale: 1,
                ori: 0
            },
            {
                type: "saloon_bar_back_large",
                pos: v2.create(-18.75, 7.5),
                scale: 1,
                ori: 0
            },
            {
                type: "saloon_door_secret",
                pos: v2.create(-18.75, 2.5),
                scale: 1,
                ori: 2
            },
            {
                type: "saloon_bar_back_small",
                pos: v2.create(-18.75, -2),
                scale: 1,
                ori: 0
            },
            {
                type: "bottle_01",
                pos: v2.create(-18.75, 11.25),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "bottle_01",
                pos: v2.create(-18.75, 10),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "bottle_01",
                pos: v2.create(-18.75, 9),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "bottle_01",
                pos: v2.create(-18.75, 6),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "bottle_01",
                pos: v2.create(-18.75, 5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "bottle_01",
                pos: v2.create(-18.75, 3.75),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "bottle_02v",
                pos: v2.create(-18.75, -1.75),
                scale: 1,
                ori: 0,
                inheritOri: !1,
                puzzlePiece: "violet"
            },
            {
                type: "saloon_bar_large",
                pos: v2.create(-11, 5),
                scale: 1,
                ori: 0
            },
            {
                type: "saloon_bar_small",
                pos: v2.create(-14.5, -4),
                scale: 1,
                ori: 1
            },
            {
                type: "bottle_01",
                pos: v2.create(-10.75, 11),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "bottle_02r",
                pos: v2.create(-11, 8),
                scale: 1,
                ori: 0,
                inheritOri: !1,
                puzzlePiece: "red"
            },
            {
                type: "bottle_01",
                pos: v2.create(-11, 6.25),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "bottle_01",
                pos: v2.create(-10.75, 5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "bottle_01",
                pos: v2.create(-11, 1.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "bottle_01",
                pos: v2.create(-10.75, -1),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "bottle_02b",
                pos: v2.create(-11, -2.5),
                scale: 1,
                ori: 0,
                inheritOri: !1,
                puzzlePiece: "blue"
            },
            {
                type: "bottle_01",
                pos: v2.create(-13, -4),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "bottle_01",
                pos: v2.create(-15, -4.25),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "bottle_01",
                pos: v2.create(-16.5, -4),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "barrel_02",
                pos: v2.create(-17.5, 17.5),
                scale: 1,
                ori: 0,
                puzzlePiece: "barrel"
            },
            {
                type: "piano_01",
                pos: v2.create(-18, -9.5),
                scale: 1,
                ori: 1
            },
            {
                type: "loot_tier_1",
                pos: v2.create(-16, -9.5),
                scale: 1,
                ori: 1
            },
            {
                type: randomObstacleType({
                    gun_mount_01: 100,
                    gun_mount_02: 10
                }),
                pos: v2.create(-0.5, 18.75),
                scale: 1,
                ori: 0,
                puzzlePiece: "gun"
            },
            {
                type: "barrel_02",
                pos: v2.create(-3, -7),
                scale: 0.9,
                ori: 0
            },
            {
                type: "barrel_02",
                pos: v2.create(-0.5, -4.5),
                scale: 0.9,
                ori: 0
            },
            {
                type: "stove_02",
                pos: v2.create(-3, 3),
                scale: 1,
                ori: 0
            },
            {
                type: "bottle_02g",
                pos: v2.create(7.25, 10.5),
                scale: 1,
                ori: 0,
                inheritOri: !1,
                puzzlePiece: "green"
            },
            {
                type: "table_03",
                pos: v2.create(7.25, 10.5),
                scale: 1,
                ori: 0
            },
            {
                type: "table_03",
                pos: v2.create(7.25, 0.5),
                scale: 1,
                ori: 0
            },
            {
                type: "bottle_02i",
                pos: v2.create(12.5, 4.5),
                scale: 1,
                ori: 0,
                inheritOri: !1,
                puzzlePiece: "indigo"
            },
            {
                type: "crate_01",
                pos: v2.create(11, 17),
                scale: 0.9,
                ori: 0
            },
            {
                type: "bottle_02y",
                pos: v2.create(8, 18.5),
                scale: 1,
                ori: 0,
                inheritOri: !1,
                puzzlePiece: "yellow"
            },
            {
                type: "crate_01",
                pos: v2.create(-23, 11.5),
                scale: 0.9,
                ori: 0
            },
            {
                type: "bush_01",
                pos: v2.create(-23.5, 7),
                scale: 1,
                ori: 0
            },
            {
                type: "crate_01",
                pos: v2.create(-23, -5),
                scale: 0.9,
                ori: 0
            },
            {
                type: "saloon_column_1",
                pos: v2.create(-19.5, -17.5),
                scale: 1,
                ori: 0
            },
            {
                type: "barrel_02",
                pos: v2.create(-10, -16.5),
                scale: 0.9,
                ori: 0
            },
            {
                type: "bottle_02o",
                pos: v2.create(3.75, -17.5),
                scale: 1,
                ori: 0,
                inheritOri: !1,
                puzzlePiece: "orange"
            },
            {
                type: "saloon_column_1",
                pos: v2.create(5.5, -17.5),
                scale: 1,
                ori: 0,
                puzzlePiece: "column"
            },
            {
                type: "saloon_column_1",
                pos: v2.create(17.5, 19.5),
                scale: 1,
                ori: 0
            },
            {
                type: "barrel_02",
                pos: v2.create(16.5, 9),
                scale: 0.9,
                ori: 0
            },
            {
                type: "saloon_column_1",
                pos: v2.create(17.5, -5.5),
                scale: 1,
                ori: 0
            }
        ]
    },
    saloon_cellar_01: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 1,
        floor: {
            surfaces: [
                {
                    type: "brick",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(15, 9)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-building-saloon-cellar-01.img",
                    pos: v2.create(0, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(15, 9)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "",
                    pos: v2.create(-2, 3.5),
                    scale: 1,
                    alpha: 1,
                    tint: 6250335
                }
            ],
            vision: { dist: 7, width: 3 }
        },
        mapObjects: [
            {
                type: "wood_perm_wall_ext_thicker_18",
                pos: v2.create(-8, 10),
                scale: 1,
                ori: 1
            },
            {
                type: "wood_perm_wall_ext_5",
                pos: v2.create(1.5, 7),
                scale: 1,
                ori: 0
            },
            {
                type: "wood_perm_wall_ext_thicker_12",
                pos: v2.create(-4.5, 4),
                scale: 1,
                ori: 1
            },
            {
                type: "wood_perm_wall_ext_thicker_13",
                pos: v2.create(-16, 2),
                scale: 1,
                ori: 0
            },
            {
                type: "wood_perm_wall_ext_thicker_8",
                pos: v2.create(-13.5, -6),
                scale: 1,
                ori: 1
            },
            {
                type: "wood_perm_wall_ext_thicker_7",
                pos: v2.create(-8, -8),
                scale: 1,
                ori: 0
            },
            {
                type: "wood_perm_wall_ext_thicker_13",
                pos: v2.create(0, -10),
                scale: 1,
                ori: 1
            },
            {
                type: "wood_perm_wall_ext_thicker_7",
                pos: v2.create(8, -8),
                scale: 1,
                ori: 0
            },
            {
                type: "wood_perm_wall_ext_thicker_8",
                pos: v2.create(13.5, -6),
                scale: 1,
                ori: 1
            },
            {
                type: "wood_perm_wall_ext_thicker_13",
                pos: v2.create(16, 2),
                scale: 1,
                ori: 0
            },
            {
                type: "wood_perm_wall_ext_thicker_10",
                pos: v2.create(12.5, 10),
                scale: 1,
                ori: 1
            },
            {
                type: "wood_perm_wall_ext_thicker_6",
                pos: v2.create(9, 5.5),
                scale: 1,
                ori: 0
            },
            {
                type: "wood_perm_wall_ext_thicker_21",
                pos: v2.create(0, 1),
                scale: 1,
                ori: 1
            },
            {
                type: "loot_tier_saloon",
                pos: v2.create(0, -4),
                scale: 1,
                ori: 0
            },
            {
                type: "barrel_04",
                pos: v2.create(-3, -8.03),
                scale: 1,
                ori: 2
            },
            {
                type: "barrel_04",
                pos: v2.create(0, -8.03),
                scale: 1,
                ori: 2
            },
            {
                type: "barrel_04",
                pos: v2.create(3, -8.03),
                scale: 1,
                ori: 2
            },
            {
                type: "recorder_04",
                pos: v2.create(12.5, 6.5),
                scale: 1,
                ori: 0
            }
        ]
    },
    saloon_structure_01: {
        type: "structure",
        terrain: { grass: !0, beach: !1 },
        layers: [
            {
                type: "saloon_01",
                pos: v2.create(0, 0),
                ori: 0
            },
            {
                type: "saloon_cellar_01",
                pos: v2.create(-19, -6),
                ori: 0
            }
        ],
        stairs: [
            {
                collision: collider.createAabbExtents(
                    v2.create(-19.5, 0.75),
                    v2.create(1.5, 2)
                ),
                downDir: v2.create(-1, 0)
            }
        ],
        mask: [
            collider.createAabbExtents(
                v2.create(-30, 0.75),
                v2.create(10, 5)
            )
        ],
        interiorSound: {
            sound: "piano_music_01",
            soundAlt: "",
            transitionTime: 5,
            outsideMaxDist: 10,
            outsideVolume: 0.25,
            puzzle: "saloon"
        }
    },
    teahouse_wall_int_3: X({
        material: "wood",
        extents: v2.create(0.5, 1.5),
        hitParticle: "tanChip",
        img: wallImg("map-wall-03.img", 5505024, 0.95)
    }),
    teahouse_wall_int_4: X({
        material: "wood",
        extents: v2.create(0.5, 2),
        hitParticle: "tanChip",
        img: wallImg("map-wall-04.img", 5505024, 0.95)
    }),
    teahouse_wall_int_5: X({
        material: "wood",
        extents: v2.create(0.5, 2.5),
        hitParticle: "tanChip",
        img: wallImg("map-wall-05.img", 5505024, 0.95)
    }),
    teahouse_wall_int_7: X({
        material: "wood",
        extents: v2.create(0.5, 3.5),
        hitParticle: "tanChip",
        img: wallImg("map-wall-07.img", 5505024, 0.95)
    }),
    teahouse_wall_int_12: X({
        material: "wood",
        extents: v2.create(0.5, 6),
        hitParticle: "tanChip",
        img: wallImg("map-wall-12.img", 5505024, 0.95)
    }),
    teahouse_wall_int_13: X({
        material: "wood",
        extents: v2.create(0.5, 6.5),
        hitParticle: "tanChip",
        img: wallImg("map-wall-13.img", 5505024, 0.95)
    }),
    teahouse_wall_int_14: X({
        material: "wood",
        extents: v2.create(0.5, 7),
        hitParticle: "tanChip",
        img: wallImg("map-wall-14.img", 5505024, 0.95)
    }),
    teahouse_wall_int_18: X({
        material: "wood",
        extents: v2.create(0.5, 9),
        hitParticle: "tanChip",
        img: wallImg("map-wall-18.img", 5505024, 0.95)
    }),
    teahouse_door_01: I({
        img: { tint: 14537141, alpha: 0.95 },
        door: {
            interactionRad: 2,
            openOneWay: !1,
            openSpeed: 7,
            autoOpen: !1,
            autoClose: !1,
            autoCloseDelay: 1,
            slideToOpen: !0,
            slideOffset: 3.75,
            sound: {
                open: "door_open_04",
                close: "door_open_04",
                error: "door_error_01"
            },
            casingImg: {
                sprite: "map-door-slot-02.img",
                pos: v2.create(-2, 0),
                scale: 0.5,
                alpha: 1,
                tint: 3211264
            }
        }
    }),
    teahouse_window_open_01: Se({
        img: { tint: 12216619 }
    }),
    teahouse_01: (function(e) {
        const t = {
            type: "building",
            map: {
                display: !0,
                shapes: [
                    {
                        collider: collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(14, 9)
                        ),
                        color: 4608356
                    },
                    {
                        collider: collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(7.5, 3.75)
                        ),
                        color: 5793921
                    },
                    {
                        collider: collider.createAabbExtents(
                            v2.create(9, -10.15),
                            v2.create(2, 1.5)
                        ),
                        color: 7354635
                    },
                    {
                        collider: collider.createAabbExtents(
                            v2.create(-9, 10.15),
                            v2.create(2, 1.5)
                        ),
                        color: 7354635
                    }
                ]
            },
            terrain: { grass: !0, beach: !1 },
            floor: {
                surfaces: [
                    {
                        type: "shack",
                        collision: [
                            collider.createAabbExtents(
                                v2.create(0, 0),
                                v2.create(14, 9)
                            ),
                            collider.createAabbExtents(
                                v2.create(9, -10.15),
                                v2.create(2, 1.5)
                            ),
                            collider.createAabbExtents(
                                v2.create(-9, 10.15),
                                v2.create(2, 1.5)
                            )
                        ]
                    }
                ],
                imgs: [
                    {
                        sprite: "map-building-teahouse-floor-01.img",
                        pos: v2.create(0, 0),
                        scale: 0.5,
                        alpha: 1,
                        tint: 16777215
                    },
                    {
                        sprite: "map-building-teahouse-floor-02.img",
                        pos: v2.create(9, -10.25),
                        scale: 0.5,
                        alpha: 1,
                        tint: 16777215
                    },
                    {
                        sprite: "map-building-teahouse-floor-02.img",
                        pos: v2.create(-9, 10.25),
                        scale: 0.5,
                        alpha: 1,
                        tint: 16777215,
                        rot: 2
                    }
                ]
            },
            ceiling: {
                zoomRegions: [
                    {
                        zoomIn: collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(12, 7)
                        ),
                        zoomOut: collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(14, 9)
                        )
                    }
                ],
                vision: { width: 4 },
                imgs: [
                    {
                        sprite: "map-building-teahouse-ceiling-01.img",
                        scale: 0.5,
                        alpha: 1,
                        tint: 16777215
                    }
                ],
                destroy: {
                    wallCount: 3,
                    particle: "teahouseBreak",
                    particleCount: 25,
                    residue:
                        "map-building-teahouse-res-01.img"
                }
            },
            mapObjects: [
                {
                    type: "teahouse_window_open_01",
                    pos: v2.create(-6.5, -6.75),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "teahouse_window_open_01",
                    pos: v2.create(11.75, 1.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "teahouse_wall_int_7",
                    pos: v2.create(11.5, -3.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "teahouse_wall_int_4",
                    pos: v2.create(11.5, 5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "teahouse_door_01",
                    pos: v2.create(-7, 6.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "teahouse_wall_int_18",
                    pos: v2.create(2, 6.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "teahouse_wall_int_3",
                    pos: v2.create(-9.5, -6.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "teahouse_wall_int_12",
                    pos: v2.create(1, -6.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "teahouse_wall_int_14",
                    pos: v2.create(-11.5, 0),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "teahouse_door_01",
                    pos: v2.create(7, -6.5),
                    scale: 1,
                    ori: 3
                },
                {
                    type: "pot_03",
                    pos: v2.create(9.5, 4.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "pot_03",
                    pos: v2.create(-9.5, -1.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "pot_03",
                    pos: v2.create(-9.5, -4.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "case_06",
                    pos: v2.create(0, 0),
                    scale: 1,
                    ori: 0
                }
            ]
        };
        return util.mergeDeep(t, e || {});
    })({}),
    teapavilion_01: pe({ terrain: { lakeCenter: !0 } }),
    teapavilion_01w: pe({
        center_loot: "loot_tier_helmet_forest",
        left_loot: "pot_03b",
        right_loot: "pot_03c",
        terrain: { lakeCenter: !0 }
    }),
    teahouse_complex_01s: he({}),
    teahouse_complex_01su: he({
        grass_color: 6460706,
        tree_small: "tree_08su",
        tree_large: "tree_08su"
    }),
    savannah_patch_01: (function(e) {
        const t = {
            type: "building",
            map: { display: !0, shapes: [] },
            terrain: { grass: !0, beach: !1 },
            mapObstacleBounds: [
                collider.createAabbExtents(
                    v2.create(0, 0),
                    v2.create(20, 16)
                )
            ],
            mapGroundPatches: [
                {
                    bound: collider.createAabbExtents(
                        v2.create(8, 15),
                        v2.create(5, 4)
                    ),
                    color: 13084454,
                    roughness: 0.1,
                    offsetDist: 0.5
                },
                {
                    bound: collider.createAabbExtents(
                        v2.create(-6, -12),
                        v2.create(7, 3)
                    ),
                    color: 13084454,
                    roughness: 0.1,
                    offsetDist: 0.5
                },
                {
                    bound: collider.createAabbExtents(
                        v2.create(-18, 8),
                        v2.create(3, 4)
                    ),
                    color: 13084454,
                    roughness: 0.1,
                    offsetDist: 0.5
                },
                {
                    bound: collider.createAabbExtents(
                        v2.create(16, -8),
                        v2.create(3, 6)
                    ),
                    color: 13084454,
                    roughness: 0.1,
                    offsetDist: 0.5
                },
                {
                    bound: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(16, 12)
                    ),
                    color: e.grass_color || 16762368,
                    roughness: 0.1,
                    offsetDist: 0.5
                }
            ],
            floor: {
                surfaces: [
                    {
                        type: "grass",
                        data: { isBright: !0 },
                        collision: [
                            collider.createAabbExtents(
                                v2.create(0, 0),
                                v2.create(16, 12)
                            )
                        ]
                    }
                ],
                imgs: []
            },
            ceiling: { zoomRegions: [], imgs: [] },
            mapObjects: [
                {
                    type: "crate_21",
                    pos: v2.create(0, 0),
                    scale: 1,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: e.tree_large || "tree_12",
                    pos: v2.create(-13, 5.5),
                    scale: 1.1,
                    ori: 0
                },
                {
                    type: e.tree_large || "tree_12",
                    pos: v2.create(10.5, -5),
                    scale: 0.9,
                    ori: 0
                },
                {
                    type: e.tree_small || "tree_01sv",
                    pos: v2.create(7, 10),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "bush_01sv",
                    pos: v2.create(-8, -10),
                    scale: 1,
                    ori: 0
                }
            ]
        };
        return util.mergeDeep(t, e || {});
    })({
        grass_color: 15451700,
        terrain: { grass: !0, beach: !1, spawnPriority: 1 }
    }),
    kopje_patch_01: (function(e) {
        const t = {
            type: "building",
            map: { display: !0, shapes: [] },
            terrain: { grass: !0, beach: !1 },
            mapObstacleBounds: [
                collider.createAabbExtents(
                    v2.create(0, 0),
                    v2.create(45, 35)
                )
            ],
            mapGroundPatches: [
                {
                    bound: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(40, 30)
                    ),
                    color: e.grass_color || 16762368,
                    roughness: 0.2,
                    offsetDist: 3
                },
                {
                    bound: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(16, 12)
                    ),
                    color: 5862162,
                    roughness: 0.2,
                    offsetDist: 1
                }
            ],
            floor: {
                surfaces: [
                    { type: "grass", collision: [] }
                ],
                imgs: []
            },
            ceiling: { zoomRegions: [], imgs: [] },
            mapObjects: [
                {
                    type: "crate_21",
                    pos: v2.create(-2.5, 0),
                    scale: 1,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: "crate_21",
                    pos: v2.create(2.5, 0),
                    scale: 1,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: "crate_01",
                    pos: v2.create(0, 5),
                    scale: 1,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: "crate_01",
                    pos: v2.create(0, -5),
                    scale: 1,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: randomObstacleType({ crate_01: 3, "": 1 }),
                    pos: v2.create(-39.5, 30.5),
                    scale: 0.95,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: randomObstacleType({ crate_01: 3, "": 1 }),
                    pos: v2.create(-41.5, 26),
                    scale: 0.95,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: randomObstacleType({ crate_01: 3, "": 1 }),
                    pos: v2.create(39.5, -30.5),
                    scale: 0.95,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: randomObstacleType({ crate_01: 3, "": 1 }),
                    pos: v2.create(41.5, -26),
                    scale: 0.95,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: e.tree_large || "tree_12",
                    pos: v2.create(34, 22.5),
                    scale: 1.05,
                    ori: 0
                },
                {
                    type: e.tree_small || "tree_12",
                    pos: v2.create(-34.5, -23),
                    scale: 0.95,
                    ori: 0
                },
                {
                    type: e.tree_small || "tree_12",
                    pos: v2.create(22.5, -14),
                    scale: 0.95,
                    ori: 0
                },
                {
                    type: e.tree_small || "tree_01sv",
                    pos: v2.create(21.5, -3),
                    scale: 1,
                    ori: 0
                },
                {
                    type: e.tree_small || "tree_01sv",
                    pos: v2.create(11, -15),
                    scale: 1,
                    ori: 0
                },
                {
                    type: e.tree_small || "tree_01sv",
                    pos: v2.create(-19, 2),
                    scale: 1,
                    ori: 0
                },
                {
                    type: e.tree_small || "tree_01sv",
                    pos: v2.create(-10, 13),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "stone_07",
                    pos: v2.create(-20, 12),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "stone_07",
                    pos: v2.create(15.5, 10),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "stone_07",
                    pos: v2.create(-13.5, -12.5),
                    scale: 1,
                    ori: 2
                },
                {
                    type: "kopje_brush_01",
                    pos: v2.create(-40, -9),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "kopje_brush_01",
                    pos: v2.create(-40, 6),
                    scale: 1,
                    ori: 2
                },
                {
                    type: "kopje_brush_01",
                    pos: v2.create(40, -9),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "kopje_brush_01",
                    pos: v2.create(40, 6),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "kopje_brush_01",
                    pos: v2.create(0, 28),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "kopje_brush_01",
                    pos: v2.create(0, -28),
                    scale: 1,
                    ori: 3
                }
            ]
        };
        return util.mergeDeep(t, e || {});
    })({
        grass_color: 8035865,
        terrain: { grass: !0, beach: !1, spawnPriority: 2 }
    }),
    kopje_brush_01: {
        type: "building",
        map: { display: !0, shapes: [] },
        terrain: { grass: !0, beach: !1 },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(0, 0),
                v2.create(18, 18)
            )
        ],
        mapGroundPatches: [],
        floor: {
            surfaces: [{ type: "grass", collision: [] }],
            imgs: []
        },
        ceiling: { zoomRegions: [], imgs: [] },
        mapObjects: [
            {
                type: randomObstacleType({
                    loot_tier_1: 1,
                    loot_tier_2: 1,
                    loot_tier_surviv: 1
                }),
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(0, 0),
                scale: 1.5,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(1, 6),
                scale: 1.5,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(-4, 3),
                scale: 1.5,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(-5, -2),
                scale: 1.5,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(2.5, -5),
                scale: 1.5,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(-1, -8),
                scale: 1.5,
                ori: 0
            }
        ]
    },
    grassy_wall_3: X({
        scale: { createMin: 1, createMax: 1, destroy: 0.8 },
        material: "wood",
        extents: v2.create(0.375, 1.5),
        hitParticle: "tanChip",
        img: {
            sprite: "map-wall-03-grassy.img",
            residue: "map-wall-03-grassy-res.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        map: { display: !0, color: 7282176, scale: 1 },
        health: 300
    }),
    grassy_wall_8: X({
        scale: { createMin: 1, createMax: 1, destroy: 0.8 },
        material: "wood",
        extents: v2.create(0.375, 4),
        hitParticle: "tanChip",
        img: {
            sprite: "map-wall-08-grassy.img",
            residue: "map-wall-08-grassy-res.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        },
        map: { display: !0, color: 7282176, scale: 1 },
        health: 300
    }),
    grassy_cover_01: de({
        mapObjects: [
            {
                type: "loot_tier_1",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "grassy_wall_8",
                pos: v2.create(0, 4.75),
                scale: 1,
                ori: 1
            },
            {
                type: "grassy_wall_8",
                pos: v2.create(0, -4.75),
                scale: 1,
                ori: 3
            },
            {
                type: "grassy_wall_3",
                pos: v2.create(0, 3),
                scale: 1,
                ori: 0
            },
            {
                type: "grassy_wall_3",
                pos: v2.create(0, -3),
                scale: 1,
                ori: 2
            }
        ]
    }),
    grassy_cover_02: de({
        mapObjects: [
            {
                type: "loot_tier_1",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "grassy_wall_8",
                pos: v2.create(0, 4.75),
                scale: 1,
                ori: 1
            },
            {
                type: "grassy_wall_8",
                pos: v2.create(0, -4.75),
                scale: 1,
                ori: 3
            },
            {
                type: "grassy_wall_3",
                pos: v2.create(-3.5, 3),
                scale: 1,
                ori: 0
            },
            {
                type: "grassy_wall_3",
                pos: v2.create(3.5, -3),
                scale: 1,
                ori: 2
            }
        ]
    }),
    grassy_cover_03: de({
        mapObjects: [
            {
                type: "loot_tier_1",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "grassy_wall_8",
                pos: v2.create(-5, 1.5),
                scale: 1,
                ori: 0
            },
            {
                type: "grassy_wall_8",
                pos: v2.create(1, -4.75),
                scale: 1,
                ori: 3
            },
            {
                type: "grassy_wall_3",
                pos: v2.create(-3.25, 5),
                scale: 1,
                ori: 1
            },
            {
                type: "grassy_wall_3",
                pos: v2.create(4.5, -3),
                scale: 1,
                ori: 2
            }
        ]
    }),
    grassy_cover_complex_01: {
        type: "building",
        map: { display: !0, shapes: [] },
        terrain: { grass: !0, beach: !1 },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(0, 0),
                v2.create(30, 10)
            )
        ],
        mapGroundPatches: [],
        floor: {
            surfaces: [{ type: "grass", collision: [] }],
            imgs: []
        },
        ceiling: { zoomRegions: [], imgs: [] },
        mapObjects: [
            {
                type: randomObstacleType({
                    grassy_cover_01: 1,
                    grassy_cover_02: 1,
                    grassy_cover_03: 1
                }),
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({
                    grassy_cover_01: 1,
                    grassy_cover_02: 1,
                    grassy_cover_03: 1
                }),
                pos: v2.create(-15, 0),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({
                    grassy_cover_01: 1,
                    grassy_cover_02: 1,
                    grassy_cover_03: 1
                }),
                pos: v2.create(15, 0),
                scale: 1,
                ori: 0
            }
        ]
    },
    brush_clump_01: {
        type: "building",
        map: { display: !0, shapes: [] },
        terrain: { grass: !0, beach: !1 },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(0, 0),
                v2.create(17, 17)
            )
        ],
        mapGroundPatches: [],
        floor: {
            surfaces: [{ type: "grass", collision: [] }],
            imgs: []
        },
        ceiling: { zoomRegions: [], imgs: [] },
        mapObjects: [
            {
                type: randomObstacleType({
                    loot_tier_1: 1,
                    loot_tier_2: 1,
                    loot_tier_surviv: 1
                }),
                pos: v2.create(-2, -2),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({
                    stone_01: 3,
                    barrel_01: 3,
                    "": 1
                }),
                pos: v2.create(2, 2),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(-13, 0),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(-6, 0),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(0, 0),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(7, 2),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(12, 0),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(0, -10),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(3, -5),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(-3, 5),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(-6, 10),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(-4, -6),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(5, -13),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(5, 5),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(10, 9),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(10, -9),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(-10, -9),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(-8, 13),
                scale: 1.75,
                ori: 0
            }
        ]
    },
    brush_clump_02: {
        type: "building",
        map: { display: !0, shapes: [] },
        terrain: { grass: !0, beach: !1 },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(0, 0),
                v2.create(17, 17)
            )
        ],
        mapGroundPatches: [],
        floor: {
            surfaces: [{ type: "grass", collision: [] }],
            imgs: []
        },
        ceiling: { zoomRegions: [], imgs: [] },
        mapObjects: [
            {
                type: randomObstacleType({
                    loot_tier_1: 1,
                    loot_tier_2: 1,
                    loot_tier_surviv: 1
                }),
                pos: v2.create(2, 2),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({
                    stone_01: 3,
                    barrel_01: 3,
                    "": 1
                }),
                pos: v2.create(-2, -2),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(-12, 4),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(-6, 0),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(0, 0),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(7, -12),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(12, 2),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(1, -11),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(3, -4),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(-3, 4),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(3, 11),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(11, 12),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(5, 5),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(9, 8),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(10, -9),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(-8, 13),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(-7, 9),
                scale: 1.75,
                ori: 0
            }
        ]
    },
    brush_clump_03: {
        type: "building",
        map: { display: !0, shapes: [] },
        terrain: { grass: !0, beach: !1 },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(0, 0),
                v2.create(17, 17)
            )
        ],
        mapGroundPatches: [],
        floor: {
            surfaces: [{ type: "grass", collision: [] }],
            imgs: []
        },
        ceiling: { zoomRegions: [], imgs: [] },
        mapObjects: [
            {
                type: randomObstacleType({
                    loot_tier_1: 1,
                    loot_tier_2: 1,
                    loot_tier_surviv: 1
                }),
                pos: v2.create(2, 2),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({
                    stone_01: 3,
                    barrel_01: 3,
                    "": 1
                }),
                pos: v2.create(-2, -2),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(-12, 4),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(-6, 0),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(0, 0),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(7, -11.5),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(1, -13.5),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(3, -4),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(-3, 4),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(10, -9),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(-3, 13),
                scale: 1.75,
                ori: 0
            },
            {
                type: randomObstacleType({
                    brush_01sv: 5,
                    brush_02sv: 5,
                    "": 1
                }),
                pos: v2.create(-7, 9),
                scale: 1.75,
                ori: 0
            }
        ]
    },
    teapavilion_complex_01: {
        type: "building",
        map: { display: !0, shapes: [] },
        terrain: { lakeCenter: !0 },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(0, 0),
                v2.create(14, 14)
            ),
            collider.createAabbExtents(
                v2.create(0, -20),
                v2.create(4, 12)
            )
        ],
        mapGroundPatches: [
            {
                bound: collider.createAabbExtents(
                    v2.create(0, 0),
                    v2.create(12.5, 12.5)
                ),
                color: 6066442,
                roughness: 0.1,
                offsetDist: 0.25
            }
        ],
        ori: 0,
        floor: {
            surfaces: [{ type: "grass", collision: [] }],
            imgs: []
        },
        ceiling: { zoomRegions: [], imgs: [] },
        mapObjects: [
            {
                type: "teapavilion_01",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "barrel_02",
                pos: v2.create(11, -4),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ tree_07sp: 2, "": 1 }),
                pos: v2.create(-3, 12),
                scale: 0.9,
                ori: 0
            },
            {
                type: randomObstacleType({ tree_07sp: 2, "": 1 }),
                pos: v2.create(-12, -6),
                scale: 0.9,
                ori: 0
            },
            {
                type: randomObstacleType({ tree_08sp: 2, "": 1 }),
                pos: v2.create(-12.5, 9),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ tree_07sp: 2, "": 1 }),
                pos: v2.create(12, 4),
                scale: 0.9,
                ori: 0
            }
        ]
    },
    club_wall_int_6: X({
        material: "wood",
        extents: v2.create(0.5, 3),
        hitParticle: "tanChip",
        img: wallImg("map-wall-06-rounded.img", 10584424)
    }),
    club_wall_int_10: X({
        material: "wood",
        extents: v2.create(0.5, 5),
        hitParticle: "redChip",
        img: wallImg("map-wall-10-rounded.img", 7218988)
    }),
    club_bar_small: Se({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(1.5, 4.5)
        ),
        img: {
            sprite: "",
            scale: 0.5,
            alpha: 1,
            tint: 4456448,
            zIdx: 10
        }
    }),
    club_bar_large: Se({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(1.5, 7)
        ),
        img: {
            sprite: "",
            scale: 0.5,
            alpha: 1,
            tint: 4456448,
            zIdx: 10
        }
    }),
    club_bar_back_large: Se({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(0.75, 7.5)
        ),
        img: {
            sprite: "map-club-bar-01.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 10
        }
    }),
    secret_door_club: z({
        destructible: !1,
        material: "concrete",
        hinge: v2.create(0, 2),
        extents: v2.create(0.3, 2),
        door: {
            canUse: !1,
            openOnce: !0,
            openOneWay: !1,
            openSpeed: 7,
            autoOpen: !1,
            autoClose: !1,
            slideToOpen: !0,
            slideOffset: 3.75,
            sound: {
                open: "door_open_03",
                close: "door_close_03",
                error: "door_error_01"
            },
            casingImg: {
                sprite: "map-door-slot-01.img",
                pos: v2.create(-2, 0),
                scale: 0.5,
                alpha: 1,
                tint: 1316379
            }
        },
        img: { tint: 5373952 }
    }),
    bathhouse_column_1: X({
        material: "concrete",
        extents: v2.create(2, 2),
        hitParticle: "whiteChip",
        img: wallImg("map-bathhouse-column-01.img", 13481337)
    }),
    bathhouse_column_2: X({
        material: "concrete",
        extents: v2.create(1, 1),
        hitParticle: "whiteChip",
        img: wallImg("map-bathhouse-column-02.img", 13481337)
    }),
    bathhouse_rocks_01: C({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(1.55, 1.55)
        ),
        destructible: !1,
        img: { sprite: "map-bathrocks-01.img" }
    }),
    vault_door_bathhouse: z({
        destructible: !1,
        material: "metal",
        hinge: v2.create(0, 2),
        extents: v2.create(0.3, 2),
        door: {
            canUse: !1,
            openOnce: !0,
            openOneWay: !1,
            openSpeed: 7,
            autoOpen: !1,
            autoClose: !1,
            slideToOpen: !0,
            slideOffset: 3.75,
            sound: {
                open: "door_open_03",
                close: "door_close_03",
                error: "door_error_01"
            },
            casingImg: {
                sprite: "map-door-slot-01.img",
                pos: v2.create(-2, 0),
                scale: 0.5,
                alpha: 1,
                tint: 1316379
            }
        },
        img: { tint: 4934475 }
    }),
    club_01: (function(e) {
        const t = {
            type: "building",
            map: {
                display: !0,
                shapes: [
                    {
                        collider: collider.createAabbExtents(
                            v2.create(-29.25, -8.5),
                            v2.create(3.25, 2.5)
                        ),
                        color: 13022098
                    },
                    {
                        collider: collider.createAabbExtents(
                            v2.create(-4, -8.5),
                            v2.create(22, 13.25)
                        ),
                        color: 5900046
                    },
                    {
                        collider: collider.createAabbExtents(
                            v2.create(6, 18),
                            v2.create(12, 8.25)
                        ),
                        color: 5900046
                    },
                    {
                        collider: collider.createAabbExtents(
                            v2.create(16, 16.5),
                            v2.create(2, 6.5)
                        ),
                        color: 5900046
                    },
                    {
                        collider: collider.createAabbExtents(
                            v2.create(6.5, 7),
                            v2.create(2.5, 3)
                        ),
                        color: 5900046
                    },
                    {
                        collider: collider.createAabbExtents(
                            v2.create(23.5, -7.5),
                            v2.create(5.75, 7)
                        ),
                        color: 5900046
                    },
                    {
                        collider: collider.createAabbExtents(
                            v2.create(1.5, -24.5),
                            v2.create(8, 3.5)
                        ),
                        color: 5900046
                    },
                    {
                        collider: collider.createAabbExtents(
                            v2.create(-1.5, 30.75),
                            v2.create(4.5, 4.5)
                        ),
                        color: 5900046
                    },
                    {
                        collider: collider.createAabbExtents(
                            v2.create(-21.5, 7),
                            v2.create(2.5, 3)
                        ),
                        color: 5900046
                    }
                ]
            },
            terrain: { grass: !0, beach: !1 },
            zIdx: 1,
            mapGroundPatches: [
                {
                    bound: collider.createAabbExtents(
                        v2.create(-13.5, 11.5),
                        v2.create(16, 24.5)
                    ),
                    color: 9340275,
                    order: 1
                },
                {
                    bound: collider.createAabbExtents(
                        v2.create(-13.5, 11.5),
                        v2.create(15, 23.5)
                    ),
                    color: 5855577,
                    order: 1
                },
                {
                    bound: collider.createAabbExtents(
                        v2.create(1.5, 7),
                        v2.create(3, 3)
                    ),
                    color: 5855577,
                    order: 1
                },
                {
                    bound: collider.createAabbExtents(
                        v2.create(-12, 14.5),
                        v2.create(7.5, 0.25)
                    ),
                    color: 14145495,
                    order: 1,
                    useAsMapShape: !1
                },
                {
                    bound: collider.createAabbExtents(
                        v2.create(-12, 21.5),
                        v2.create(7.5, 0.25)
                    ),
                    color: 14145495,
                    order: 1,
                    useAsMapShape: !1
                },
                {
                    bound: collider.createAabbExtents(
                        v2.create(-12, 28.5),
                        v2.create(7.5, 0.25)
                    ),
                    color: 14145495,
                    order: 1,
                    useAsMapShape: !1
                },
                {
                    bound: collider.createAabbExtents(
                        v2.create(15, 5),
                        v2.create(20, 30)
                    ),
                    color: 7551e3,
                    roughness: 0.05,
                    offsetDist: 0.5
                }
            ],
            mapObstacleBounds: [],
            floor: {
                surfaces: [
                    {
                        type: "asphalt",
                        collision: [
                            collider.createAabbExtents(
                                v2.create(1.5, -24.5),
                                v2.create(5, 3.5)
                            ),
                            collider.createAabbExtents(
                                v2.create(-13, 20.25),
                                v2.create(16.5, 15.5)
                            ),
                            collider.createAabbExtents(
                                v2.create(-28, 0),
                                v2.create(1.5, 5.25)
                            )
                        ]
                    },
                    {
                        type: "stone",
                        collision: [
                            collider.createAabbExtents(
                                v2.create(-29.5, -8.5),
                                v2.create(3, 2.5)
                            )
                        ]
                    },
                    {
                        type: "carpet",
                        collision: [
                            collider.createAabbExtents(
                                v2.create(-4, -8.5),
                                v2.create(22, 13.25)
                            ),
                            collider.createAabbExtents(
                                v2.create(4.5, 18),
                                v2.create(10.5, 8.25)
                            ),
                            collider.createAabbExtents(
                                v2.create(16, 16.5),
                                v2.create(2, 6.5)
                            ),
                            collider.createAabbExtents(
                                v2.create(6.5, 7),
                                v2.create(2.5, 3)
                            ),
                            collider.createAabbExtents(
                                v2.create(23.5, -3),
                                v2.create(5.75, 2.5)
                            ),
                            collider.createAabbExtents(
                                v2.create(26.5, -7.5),
                                v2.create(2.5, 7)
                            )
                        ]
                    }
                ],
                imgs: [
                    {
                        sprite: "map-building-club-floor-01a.img",
                        pos: v2.create(-30, -8.5),
                        scale: 0.5,
                        alpha: 1,
                        tint: 16777215
                    },
                    {
                        sprite: "map-building-club-floor-01b.img",
                        pos: v2.create(-21.5, 8),
                        scale: 0.5,
                        alpha: 1,
                        tint: 16777215
                    },
                    {
                        sprite: "map-building-club-floor-01c.img",
                        pos: v2.create(-4, -8.5),
                        scale: 0.5,
                        alpha: 1,
                        tint: 16777215
                    },
                    {
                        sprite: "map-building-club-floor-01d.img",
                        pos: v2.create(1.5, -25),
                        scale: 0.5,
                        alpha: 1,
                        tint: 16777215
                    },
                    {
                        sprite: "map-building-club-floor-01e.img",
                        pos: v2.create(24, -7.5),
                        scale: 0.5,
                        alpha: 1,
                        tint: 16777215
                    },
                    {
                        sprite: "map-building-club-floor-01f.img",
                        pos: v2.create(6.5, 7),
                        scale: 0.5,
                        alpha: 1,
                        tint: 16777215
                    },
                    {
                        sprite: "map-building-club-floor-01g.img",
                        pos: v2.create(6, 18),
                        scale: 0.5,
                        alpha: 1,
                        tint: 16777215
                    },
                    {
                        sprite: "map-building-club-floor-01h.img",
                        pos: v2.create(-1.5, 31.5),
                        scale: 0.5,
                        alpha: 1,
                        tint: 16777215
                    }
                ]
            },
            ceiling: {
                zoomRegions: [
                    {
                        zoomIn: collider.createAabbExtents(
                            v2.create(-4, -8.5),
                            v2.create(22, 13.25)
                        )
                    },
                    {
                        zoomIn: collider.createAabbExtents(
                            v2.create(4.5, 18),
                            v2.create(10.5, 8.25)
                        )
                    },
                    {
                        zoomIn: collider.createAabbExtents(
                            v2.create(16, 16.5),
                            v2.create(2, 6.75)
                        )
                    },
                    {
                        zoomIn: collider.createAabbExtents(
                            v2.create(6.5, 7),
                            v2.create(2.5, 3)
                        )
                    },
                    {
                        zoomIn: collider.createAabbExtents(
                            v2.create(-1.5, 30),
                            v2.create(3, 4)
                        )
                    },
                    {
                        zoomIn: collider.createAabbExtents(
                            v2.create(23.5, -3),
                            v2.create(5.75, 2.5)
                        )
                    },
                    {
                        zoomIn: collider.createAabbExtents(
                            v2.create(26.5, -7.5),
                            v2.create(2.5, 7)
                        )
                    },
                    {
                        zoomIn: collider.createAabbExtents(
                            v2.create(1.5, -24),
                            v2.create(5, 3)
                        )
                    },
                    {
                        zoomIn: collider.createAabbExtents(
                            v2.create(-21.5, 7),
                            v2.create(2.5, 3)
                        )
                    },
                    {
                        zoomOut: collider.createAabbExtents(
                            v2.create(1.5, -28),
                            v2.create(5.5, 2)
                        )
                    },
                    {
                        zoomOut: collider.createAabbExtents(
                            v2.create(-21.5, 11),
                            v2.create(3.5, 2)
                        )
                    },
                    {
                        zoomOut: collider.createAabbExtents(
                            v2.create(17, 25),
                            v2.create(3, 3)
                        )
                    },
                    {
                        zoomOut: collider.createAabbExtents(
                            v2.create(17, 25),
                            v2.create(3, 3)
                        )
                    }
                ],
                vision: {
                    dist: 7.5,
                    width: 2.5,
                    linger: 0.5,
                    fadeRate: 6
                },
                imgs: [
                    {
                        sprite: "map-building-club-ceiling-01a.img",
                        pos: v2.create(-4.5, -8.5),
                        scale: 1,
                        alpha: 1,
                        tint: 16777215
                    },
                    {
                        sprite: "map-building-club-ceiling-01b.img",
                        pos: v2.create(24, -7.5),
                        scale: 1,
                        alpha: 1,
                        tint: 16777215
                    },
                    {
                        sprite: "map-building-club-ceiling-01c.img",
                        pos: v2.create(6, 22.5),
                        scale: 1,
                        alpha: 1,
                        tint: 16777215
                    }
                ]
            },
            puzzle: {
                name: "club_01",
                completeUseType: "secret_door_club",
                completeOffDelay: 1,
                completeUseDelay: 2,
                errorResetDelay: 1,
                pieceResetDelay: 10,
                sound: {
                    fail: "door_error_01",
                    complete: "none"
                }
            },
            mapObjects: [
                {
                    type: "concrete_wall_ext_7",
                    pos: v2.create(-30, -11.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_7",
                    pos: v2.create(-30, -5.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_5",
                    pos: v2.create(-24, 7.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_ext_5",
                    pos: v2.create(-19, 7.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_ext_3",
                    pos: v2.create(-25, 4.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_25",
                    pos: v2.create(-26, -8.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_ext_9_5",
                    pos: v2.create(-21.75, -21.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "club_window_01",
                    pos: v2.create(-15.5, -21.75),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_11_5",
                    pos: v2.create(-8.25, -21.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_5",
                    pos: v2.create(-3, -24.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_ext_5",
                    pos: v2.create(6, -24.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_ext_13",
                    pos: v2.create(12, -21.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_13",
                    pos: v2.create(12, -21.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_6",
                    pos: v2.create(18, -18),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_column_7x10",
                    pos: v2.create(21, -10),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_ext_4",
                    pos: v2.create(26.5, -14.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_10_5",
                    pos: v2.create(29, -9.75),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "club_window_01",
                    pos: v2.create(29.25, -3),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_ext_1_5",
                    pos: v2.create(29, -0.75),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_ext_11",
                    pos: v2.create(23, -0.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_5",
                    pos: v2.create(18, 2.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_ext_8",
                    pos: v2.create(13.5, 4.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_6",
                    pos: v2.create(9, 7),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_ext_8",
                    pos: v2.create(13.5, 9.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_13",
                    pos: v2.create(18, 15.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_ext_thick_11",
                    pos: v2.create(9, 26),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_thicker_11",
                    pos: v2.create(2, 30.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_ext_thicker_11",
                    pos: v2.create(-5, 30.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_ext_thicker_4",
                    pos: v2.create(-1.5, 34.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "secret_door_club",
                    pos: v2.create(0.5, 26),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_16",
                    pos: v2.create(-6, 17),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_ext_9",
                    pos: v2.create(-1, 9.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_6",
                    pos: v2.create(4, 7),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_ext_23",
                    pos: v2.create(-8, 4.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "house_door_01",
                    pos: v2.create(-23.5, 4.5),
                    scale: 1,
                    ori: 3
                },
                {
                    type: "house_door_01",
                    pos: v2.create(-2.5, -21.5),
                    scale: 1,
                    ori: 3
                },
                {
                    type: "house_door_01",
                    pos: v2.create(5.5, -21.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "club_bar_small",
                    pos: v2.create(-16, -0.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "club_bar_large",
                    pos: v2.create(-7.5, -3.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "club_bar_back_large",
                    pos: v2.create(-8, 3.3),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "bottle_05",
                    pos: v2.create(-16.25, 1.25),
                    scale: 1,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: "bottle_04",
                    pos: v2.create(-16, -0.5),
                    scale: 1,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: "bottle_04",
                    pos: v2.create(-16, -2.25),
                    scale: 1,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: "bottle_05",
                    pos: v2.create(-14.5, -4),
                    scale: 1,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: "bottle_04",
                    pos: v2.create(-12.25, -3.5),
                    scale: 1,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: "bottle_04",
                    pos: v2.create(-9.5, -3.75),
                    scale: 1,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: "bottle_05",
                    pos: v2.create(-5.25, -2.75),
                    scale: 1,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: "bottle_04",
                    pos: v2.create(-5.5, -4.25),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "bottle_04",
                    pos: v2.create(-2.25, -3.5),
                    scale: 1,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: "bottle_05",
                    pos: v2.create(-3.25, 3.3),
                    scale: 1,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: "bottle_05",
                    pos: v2.create(-4.25, 3.3),
                    scale: 1,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: "bottle_04",
                    pos: v2.create(-6.5, 3.3),
                    scale: 1,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: "bottle_04",
                    pos: v2.create(-7.5, 3.3),
                    scale: 1,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: "bottle_04",
                    pos: v2.create(-8.5, 3.3),
                    scale: 1,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: "bottle_05",
                    pos: v2.create(-12.25, 3.3),
                    scale: 1,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: "bottle_05",
                    pos: v2.create(-13.25, 3.3),
                    scale: 1,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: randomObstacleType({ crate_14: 1, crate_14a: 1 }),
                    pos: v2.create(-12, 0.25),
                    scale: 0.85,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: randomObstacleType({ crate_14: 1, crate_14a: 1 }),
                    pos: v2.create(-7.75, 0.25),
                    scale: 0.85,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: randomObstacleType({ crate_14: 1, crate_14a: 1 }),
                    pos: v2.create(-3.5, 0.25),
                    scale: 0.85,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: "couch_02",
                    pos: v2.create(-24, -15),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "couch_03",
                    pos: v2.create(-24, -19.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "couch_02b",
                    pos: v2.create(-19.5, -19.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "table_03",
                    pos: v2.create(-19, -14.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "decal_flyer_01",
                    pos: v2.create(-17.5, -13.25),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "couch_02b",
                    pos: v2.create(-7, -15),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "couch_03",
                    pos: v2.create(-7, -19.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "couch_02",
                    pos: v2.create(-11.5, -19.5),
                    scale: 1,
                    ori: 2
                },
                {
                    type: "table_03",
                    pos: v2.create(-12, -14.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "club_wall_int_10",
                    pos: v2.create(12.5, -7.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "club_wall_int_10",
                    pos: v2.create(8, -13),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "couch_01",
                    pos: v2.create(13, -9.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: randomObstacleType({
                        crate_01: 1,
                        crate_14: 1,
                        crate_14a: 1
                    }),
                    pos: v2.create(11, -13.5),
                    scale: 0.85,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: randomObstacleType({
                        crate_01: 1,
                        crate_14: 1,
                        crate_14a: 1
                    }),
                    pos: v2.create(15.25, -15.5),
                    scale: 0.85,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: randomObstacleType({
                        crate_01: 1,
                        crate_14: 1,
                        crate_14a: 1
                    }),
                    pos: v2.create(15.25, 1.75),
                    scale: 0.85,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: "club_vault",
                    pos: v2.create(-1.5, 30.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "switch_01",
                    pos: v2.create(-5.5, 11.5),
                    scale: 1,
                    ori: 1,
                    puzzlePiece: "1"
                },
                {
                    type: "switch_01",
                    pos: v2.create(-5.5, 14.5),
                    scale: 1,
                    ori: 1,
                    puzzlePiece: "4"
                },
                {
                    type: "switch_01",
                    pos: v2.create(-5.5, 17.5),
                    scale: 1,
                    ori: 1,
                    puzzlePiece: "2"
                },
                {
                    type: "switch_01",
                    pos: v2.create(-5.5, 20.5),
                    scale: 1,
                    ori: 1,
                    puzzlePiece: "3"
                },
                {
                    type: "bookshelf_01",
                    pos: v2.create(-1.5, 24),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "crate_02",
                    pos: v2.create(10.75, 23),
                    scale: 0.75,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: "decal_barrel_explosion",
                    pos: v2.create(17.5, 26.25),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "decal_plank_01",
                    pos: v2.create(17.25, 27.25),
                    scale: 0.5,
                    ori: 0
                },
                {
                    type: "decal_plank_01",
                    pos: v2.create(17.5, 27.5),
                    scale: 0.5,
                    ori: 1
                },
                {
                    type: "decal_plank_01",
                    pos: v2.create(19.5, 25.75),
                    scale: 0.5,
                    ori: 1
                },
                {
                    type: "decal_plank_01",
                    pos: v2.create(18.75, 25.5),
                    scale: 0.5,
                    ori: 3
                },
                {
                    type: "couch_01",
                    pos: v2.create(6.5, 11.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: randomObstacleType({
                        deposit_box_01: 3,
                        deposit_box_02: 1
                    }),
                    pos: v2.create(-4.25, 29.55),
                    scale: 1,
                    ori: 1
                },
                {
                    type: randomObstacleType({
                        deposit_box_01: 3,
                        deposit_box_02: 1
                    }),
                    pos: v2.create(1.25, 29.55),
                    scale: 1,
                    ori: 3
                },
                {
                    type: "bathhouse_column_1",
                    pos: v2.create(-5.5, -24),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "bathhouse_column_1",
                    pos: v2.create(8.5, -24),
                    scale: 1,
                    ori: 0
                },
                {
                    type: randomObstacleType({
                        crate_03: 1,
                        barrel_01: 1,
                        barrel_02: 1
                    }),
                    pos: v2.create(1.5, 7),
                    scale: 1,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: "bush_01",
                    pos: v2.create(11.5, 7),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "barrel_01",
                    pos: v2.create(-13.75, 17),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "barrel_01",
                    pos: v2.create(-10.25, 18.25),
                    scale: 1,
                    ori: 0
                },
                {
                    type: randomObstacleType({
                        crate_01: 1,
                        crate_14: 1,
                        crate_14a: 1
                    }),
                    pos: v2.create(-25, 30),
                    scale: 1,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: "bush_01",
                    pos: v2.create(-28.5, -14),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "tree_01",
                    pos: v2.create(26.5, -18),
                    scale: 0.75,
                    ori: 0
                },
                {
                    type: randomObstacleType({
                        crate_01: 1,
                        crate_14: 1,
                        crate_14a: 1
                    }),
                    pos: v2.create(21, -17.5),
                    scale: 0.9,
                    ori: 0,
                    inheritOri: !1
                },
                {
                    type: "decal_oil_04",
                    pos: v2.create(-12, 26.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "decal_oil_03",
                    pos: v2.create(-18, 32),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "decal_oil_02",
                    pos: v2.create(-24, 23),
                    scale: 0.75,
                    ori: 0
                },
                {
                    type: "decal_oil_06",
                    pos: v2.create(-11, 16.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "decal_oil_05",
                    pos: v2.create(-9.5, 8),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "decal_oil_03",
                    pos: v2.create(-26, 11.5),
                    scale: 0.5,
                    ori: 1
                }
            ]
        };
        return util.mergeDeep(t, e || {});
    })({}),
    bathhouse_01: (function(e) {
        const t = {
            type: "building",
            map: { display: !1 },
            terrain: { grass: !0, beach: !1 },
            mapObstacleBounds: [],
            zIdx: 0,
            floor: {
                surfaces: [
                    {
                        type: "tile",
                        collision: [
                            collider.createAabbExtents(
                                v2.create(2, 9.5),
                                v2.create(20, 22)
                            ),
                            collider.createAabbExtents(
                                v2.create(0, 7.5),
                                v2.create(26, 48)
                            ),
                            collider.createAabbExtents(
                                v2.create(-26, -26),
                                v2.create(4, 3)
                            )
                        ]
                    }
                ],
                imgs: [
                    {
                        sprite: "map-building-club-gradient-01.img",
                        pos: v2.create(-3.5, -13.5),
                        scale: 4,
                        alpha: 1,
                        tint: 16777215
                    },
                    {
                        sprite: "map-building-bathhouse-basement-01a.img",
                        pos: v2.create(-33.5, -26),
                        scale: 0.5,
                        alpha: 1,
                        tint: 16777215
                    },
                    {
                        sprite: "map-building-bathhouse-basement-01b.img",
                        pos: v2.create(-10, -26.5),
                        scale: 0.5,
                        alpha: 1,
                        tint: 16777215
                    },
                    {
                        sprite: "map-building-bathhouse-basement-01c.img",
                        pos: v2.create(18.5, -35.5),
                        scale: 0.5,
                        alpha: 1,
                        tint: 16777215
                    },
                    {
                        sprite: "map-building-bathhouse-basement-01d.img",
                        pos: v2.create(23.02, -27.5),
                        scale: 0.5,
                        alpha: 1,
                        tint: 16777215
                    },
                    {
                        sprite: "map-building-bathhouse-basement-01e.img",
                        pos: v2.create(2, 9),
                        scale: 0.5,
                        alpha: 1,
                        tint: 16777215
                    }
                ]
            },
            ceiling: {
                zoomRegions: [
                    {
                        zoomIn: collider.createAabbExtents(
                            v2.create(2, 9.5),
                            v2.create(20, 22)
                        ),
                        zoomOut: collider.createAabbExtents(
                            v2.create(2, 9.5),
                            v2.create(22, 24)
                        ),
                        zoom: 48
                    },
                    {
                        zoomIn: collider.createAabbExtents(
                            v2.create(0, 7.5),
                            v2.create(26, 48)
                        )
                    },
                    {
                        zoomIn: collider.createAabbExtents(
                            v2.create(-26, -26),
                            v2.create(4, 3)
                        )
                    },
                    {
                        zoomIn: collider.createAabbExtents(
                            v2.create(30, 0.5),
                            v2.create(7.5, 6.5)
                        )
                    },
                    {
                        zoomIn: collider.createAabbExtents(
                            v2.create(-26, 16.5),
                            v2.create(7.5, 6.5)
                        )
                    }
                ],
                vision: {
                    dist: 5.5,
                    width: 2.75,
                    linger: 0.5,
                    fadeRate: 6
                },
                imgs: []
            },
            occupiedEmitters: [
                {
                    type: "bathhouse_steam",
                    pos: v2.create(30, 0.5),
                    dir: v2.create(-1, 0),
                    rot: 0,
                    scale: 1,
                    layer: 1,
                    parentToCeiling: !1
                },
                {
                    type: "bathhouse_steam",
                    pos: v2.create(-26, 16.5),
                    dir: v2.create(1, 0),
                    rot: 0,
                    scale: 1,
                    layer: 1,
                    parentToCeiling: !1
                }
            ],
            goreRegion: collider.createAabbExtents(
                v2.create(2, 8.5),
                v2.create(20, 23)
            ),
            puzzle: {
                name: "club_02",
                completeUseType: "vault_door_bathhouse",
                completeOffDelay: 1,
                completeUseDelay: 2,
                errorResetDelay: 1,
                pieceResetDelay: 10,
                sound: {
                    fail: "door_error_01",
                    complete: "none"
                }
            },
            mapObjects: [
                {
                    type: "concrete_wall_ext_5",
                    pos: v2.create(-36.5, -26),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_ext_7",
                    pos: v2.create(-33.5, -23),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_7",
                    pos: v2.create(-33.5, -29),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_thicker_4",
                    pos: v2.create(-28, -22),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_thicker_6",
                    pos: v2.create(-27.5, -17.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_ext_thicker_11",
                    pos: v2.create(-23.5, -13),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_thicker_11",
                    pos: v2.create(-24.5, -30),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_thicker_6",
                    pos: v2.create(-20.5, -34.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "club_wall_int_6",
                    pos: v2.create(-14.5, -34.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "club_wall_int_6",
                    pos: v2.create(-9.5, -34.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_column_4x24",
                    pos: v2.create(-8, -22.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_column_4x9",
                    pos: v2.create(2, -29),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_ext_thicker_54",
                    pos: v2.create(5, -39),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_thicker_14",
                    pos: v2.create(26.5, -30.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_ext_4",
                    pos: v2.create(23, -25),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_thicker_6",
                    pos: v2.create(19.5, -26.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_ext_thicker_10",
                    pos: v2.create(16, -31),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_thicker_19",
                    pos: v2.create(9.5, -23),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_ext_thicker_14",
                    pos: v2.create(18, -15),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_thicker_21",
                    pos: v2.create(23.5, 20),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_ext_thicker_5",
                    pos: v2.create(23.5, -11),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_ext_thicker_19",
                    pos: v2.create(15.5, 32),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_thicker_19",
                    pos: v2.create(-11.5, 32),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_thicker_5",
                    pos: v2.create(-19.5, 28),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_ext_thicker_19",
                    pos: v2.create(-19.5, -2),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "house_door_05",
                    pos: v2.create(-18, -14),
                    scale: 1,
                    ori: 3
                },
                {
                    type: "glass_wall_9",
                    pos: v2.create(-0.5, -14),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "glass_wall_9",
                    pos: v2.create(-9.5, -14),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "house_door_05",
                    pos: v2.create(8, -14),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "vault_door_bathhouse",
                    pos: v2.create(6, 34.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "vault_door_bathhouse",
                    pos: v2.create(-2, 34.5),
                    scale: 1,
                    ori: 3
                },
                {
                    type: "switch_03",
                    pos: v2.create(8, 30.75),
                    scale: 1,
                    ori: 0,
                    puzzlePiece: "1"
                },
                {
                    type: "house_door_01",
                    pos: v2.create(2, -37.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "house_door_01",
                    pos: v2.create(-19.5, -24.5),
                    scale: 1,
                    ori: 2
                },
                {
                    type: randomObstacleType({ toilet_01: 9, toilet_02: 1 }),
                    pos: v2.create(-17, -35.25),
                    scale: 1,
                    ori: 2
                },
                {
                    type: randomObstacleType({ toilet_01: 9, toilet_02: 1 }),
                    pos: v2.create(-12, -35.25),
                    scale: 1,
                    ori: 2
                },
                {
                    type: "towelrack_01",
                    pos: v2.create(-12, -25.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "bathhouse_column_1",
                    pos: v2.create(-13, -7.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "pot_04",
                    pos: v2.create(-13, -3),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "towelrack_01",
                    pos: v2.create(-13, 2.25),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "bathhouse_column_1",
                    pos: v2.create(-13, 8.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "towelrack_01",
                    pos: v2.create(-13, 14.75),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "pot_04",
                    pos: v2.create(-13, 20),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "bathhouse_column_1",
                    pos: v2.create(-13, 24.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "bathhouse_column_1",
                    pos: v2.create(17, -7.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "pot_04",
                    pos: v2.create(17, -3),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "towelrack_01",
                    pos: v2.create(17, 2.25),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "bathhouse_column_1",
                    pos: v2.create(17, 8.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "towelrack_01",
                    pos: v2.create(17, 14.75),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "pot_04",
                    pos: v2.create(17, 20),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "bathhouse_column_1",
                    pos: v2.create(17, 24.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "locker_01",
                    pos: v2.create(-27.5, -28.85),
                    scale: 1,
                    ori: 2
                },
                {
                    type: "locker_01",
                    pos: v2.create(-23.5, -28.85),
                    scale: 1,
                    ori: 2
                },
                {
                    type: "locker_01",
                    pos: v2.create(10.5, -37.85),
                    scale: 1,
                    ori: 2
                },
                {
                    type: "locker_01",
                    pos: v2.create(14.5, -37.85),
                    scale: 1,
                    ori: 2
                },
                {
                    type: "locker_01",
                    pos: v2.create(18.5, -37.85),
                    scale: 1,
                    ori: 2
                },
                {
                    type: "decal_bathhouse_pool_01",
                    pos: v2.create(2, 8.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "decal_club_01",
                    pos: v2.create(2, 8.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "decal_club_02",
                    pos: v2.create(2, 8.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "bathhouse_sideroom_01",
                    pos: v2.create(-26, 16.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "bathhouse_sideroom_01",
                    pos: v2.create(30, 0.5),
                    scale: 1,
                    ori: 2
                },
                {
                    type: "bathhouse_sideroom_02",
                    pos: v2.create(2, 44),
                    scale: 1,
                    ori: 0
                }
            ]
        };
        return util.mergeDeep(t, e || {});
    })({}),
    bathhouse_sideroom_01: (function(e) {
        const t = {
            type: "building",
            map: { display: !0, shapes: [] },
            terrain: { grass: !0, beach: !1 },
            mapObstacleBounds: [],
            zIdx: 1,
            floor: {
                surfaces: [
                    {
                        type: "shack",
                        collision: [
                            collider.createAabbExtents(
                                v2.create(0, 0),
                                v2.create(7.5, 6.5)
                            )
                        ]
                    }
                ],
                imgs: [
                    {
                        sprite: "map-building-bathhouse-sideroom-01.img",
                        pos: v2.create(-1, 0),
                        scale: 0.5,
                        alpha: 1,
                        tint: 16777215
                    }
                ]
            },
            ceiling: {
                zoomRegions: [
                    {
                        zoomIn: collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(7.5, 6.5)
                        )
                    }
                ],
                vision: {
                    dist: 5.5,
                    width: 3.25,
                    linger: 0.5,
                    fadeRate: 6
                },
                imgs: [
                    {
                        sprite: "map-building-bathhouse-sideroom-ceiling-01.img",
                        scale: 1,
                        alpha: 1,
                        tint: 16777215
                    }
                ]
            },
            soundEmitters: [
                {
                    sound: "ambient_steam_01",
                    channel: "ambient",
                    pos: v2.create(0, 0),
                    range: { min: 9, max: 16 },
                    falloff: 1,
                    volume: 0.2
                }
            ],
            healRegions: [
                {
                    collision: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(7.5, 6.5)
                    ),
                    healRate: 3
                }
            ],
            mapObjects: [
                {
                    type: "concrete_wall_ext_thicker_15",
                    pos: v2.create(0.5, 7.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_thicker_15",
                    pos: v2.create(0.5, -7.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_thicker_19",
                    pos: v2.create(-8.5, 0),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_ext_4",
                    pos: v2.create(7.5, 4),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_ext_4",
                    pos: v2.create(7.5, -4),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "house_door_05",
                    pos: v2.create(7.5, -2),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "bathhouse_rocks_01",
                    pos: v2.create(0, 0),
                    scale: 1,
                    ori: 0
                }
            ]
        };
        return util.mergeDeep(t, e || {});
    })({}),
    bathhouse_sideroom_02: (function(e) {
        const t = {
            type: "building",
            map: { display: !0, shapes: [] },
            terrain: { grass: !0, beach: !1 },
            mapObstacleBounds: [],
            zIdx: 1,
            floor: {
                surfaces: [
                    {
                        type: "container",
                        collision: [
                            collider.createAabbExtents(
                                v2.create(0, 0),
                                v2.create(14, 10)
                            )
                        ]
                    }
                ],
                imgs: [
                    {
                        sprite: "map-building-bathhouse-sideroom-02.img",
                        pos: v2.create(0, 0.5),
                        scale: 0.5,
                        alpha: 1,
                        tint: 16777215
                    }
                ]
            },
            ceiling: {
                zoomRegions: [
                    {
                        zoomIn: collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(14, 9.5)
                        )
                    }
                ],
                vision: {
                    dist: 5.5,
                    width: 2.75,
                    linger: 0.5,
                    fadeRate: 6
                },
                imgs: [
                    {
                        sprite: "map-building-bathhouse-sideroom-ceiling-02.img",
                        scale: 1,
                        alpha: 1,
                        tint: 4931116
                    }
                ]
            },
            mapObjects: [
                {
                    type: "metal_wall_ext_thick_12",
                    pos: v2.create(10, -9.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "metal_wall_ext_thick_12",
                    pos: v2.create(-10, -9.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "metal_wall_ext_thicker_19",
                    pos: v2.create(14.5, 1),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "metal_wall_ext_thicker_19",
                    pos: v2.create(-14.5, 1),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "metal_wall_ext_thicker_26",
                    pos: v2.create(0, 9),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "crate_05",
                    pos: v2.create(-2.5, -2.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "crate_05",
                    pos: v2.create(2.5, -1.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "crate_04",
                    pos: v2.create(-10.75, 5.25),
                    scale: 0.8,
                    ori: 0
                },
                {
                    type: "crate_04",
                    pos: v2.create(10.75, 5.25),
                    scale: 0.8,
                    ori: 0
                },
                {
                    type: "mil_crate_04",
                    pos: v2.create(-5.75, 5.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "mil_crate_04",
                    pos: v2.create(5.75, 5.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "case_07",
                    pos: v2.create(0, 5.25),
                    scale: 1,
                    ori: 0
                },
                {
                    type: randomObstacleType({
                        deposit_box_01: 3,
                        deposit_box_02: 1
                    }),
                    pos: v2.create(-13.75, -4.8),
                    scale: 1,
                    ori: 1
                },
                {
                    type: randomObstacleType({
                        deposit_box_01: 3,
                        deposit_box_02: 1
                    }),
                    pos: v2.create(-13.75, 0.45),
                    scale: 1,
                    ori: 1
                },
                {
                    type: randomObstacleType({
                        deposit_box_01: 3,
                        deposit_box_02: 1
                    }),
                    pos: v2.create(13.75, -4.8),
                    scale: 1,
                    ori: 3
                },
                {
                    type: randomObstacleType({
                        deposit_box_01: 3,
                        deposit_box_02: 1
                    }),
                    pos: v2.create(13.75, 0.45),
                    scale: 1,
                    ori: 3
                }
            ]
        };
        return util.mergeDeep(t, e || {});
    })({}),
    club_window_01: xe({
        isWindow: !1,
        hitParticle: "woodChip",
        explodeParticle: "woodPlank",
        destroyType: "club_window_broken_01",
        img: {
            sprite: "map-building-boarded-window-01.img"
        },
        sound: {
            bullet: "wood_prop_bullet",
            punch: "wood_prop_bullet",
            explode: "barrel_break_02",
            enter: "none"
        }
    }),
    club_window_broken_01: Se({ img: { tint: 7886127 } }),
    club_vault: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 2,
        floor: {
            surfaces: [
                {
                    type: "container",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(3, 4)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "",
                    scale: 0.5,
                    alpha: 1,
                    tint: 6250335
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(3, 4)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-building-club-vault-ceiling.img",
                    scale: 1,
                    alpha: 1,
                    tint: 6250335
                }
            ]
        },
        mapObjects: [
            {
                type: "loot_tier_club_melee",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            }
        ]
    },
    club_structure_01: {
        type: "structure",
        structureType: "club",
        terrain: {
            grass: !0,
            beach: !1,
            spawnPriority: 10
        },
        mapObstacleBounds: [],
        layers: [
            {
                type: "club_01",
                pos: v2.create(-3.5, -17.5),
                ori: 0
            },
            {
                type: "bathhouse_01",
                pos: v2.create(0, 0),
                ori: 0
            }
        ],
        stairs: [
            {
                collision: collider.createAabbExtents(
                    v2.create(-33, -26),
                    v2.create(3, 2.55)
                ),
                downDir: v2.create(1, 0),
                noCeilingReveal: !0
            },
            {
                collision: collider.createAabbExtents(
                    v2.create(23, -28.5),
                    v2.create(2, 3)
                ),
                downDir: v2.create(0, -1)
            }
        ],
        mask: [
            collider.createAabbExtents(
                v2.create(-5, 8),
                v2.create(25, 50)
            ),
            collider.createAabbExtents(
                v2.create(23.01, -35.5),
                v2.create(3, 4)
            )
        ],
        interiorSound: {
            sound: "club_music_01",
            soundAlt: "club_music_02",
            filter: "club",
            transitionTime: 1,
            soundAltPlayTime: 90,
            outsideMaxDist: 10,
            outsideVolume: 0.25,
            undergroundVolume: 0.707,
            puzzle: "club_02"
        }
    },
    club_complex_01: {
        type: "building",
        map: { display: !0, shapes: [] },
        terrain: {
            grass: !0,
            beach: !1,
            spawnPriority: 10
        },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(-16, 15),
                v2.create(19, 6)
            ),
            collider.createAabbExtents(
                v2.create(-8, -15.5),
                v2.create(26.5, 27.5)
            ),
            collider.createAabbExtents(
                v2.create(-2, -47),
                v2.create(10, 5)
            ),
            collider.createAabbExtents(
                v2.create(-37, -26),
                v2.create(4, 5)
            ),
            collider.createAabbExtents(
                v2.create(23, -7),
                v2.create(8, 10)
            ),
            collider.createAabbExtents(
                v2.create(22, -29),
                v2.create(6, 12)
            ),
            collider.createAabbExtents(
                v2.create(-8, -23),
                v2.create(28, 21)
            ),
            collider.createAabbExtents(
                v2.create(2, 0),
                v2.create(16, 12)
            ),
            collider.createAabbExtents(
                v2.create(-16, 0),
                v2.create(4, 4)
            ),
            collider.createAabbExtents(
                v2.create(-28.5, 12.5),
                v2.create(3.5, 3.5)
            )
        ],
        mapGroundPatches: [],
        floor: { surfaces: [], imgs: [] },
        ceiling: { zoomRegions: [], imgs: [] },
        mapObjects: [
            {
                type: "club_structure_01",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "shack_01",
                pos: v2.create(22, -10),
                scale: 1,
                ori: 1
            }
        ]
    },
    bunker_egg_01: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 2,
        floor: {
            surfaces: [
                {
                    type: "container",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 7.75),
                            v2.create(2, 3.25)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-generic-floor-01.img",
                    pos: v2.create(0, 7.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [],
            vision: {
                dist: 5,
                width: 2.75,
                linger: 0.5,
                fadeRate: 6
            },
            imgs: []
        },
        mapObjects: [
            {
                type: "metal_wall_ext_short_6",
                pos: v2.create(0, 5.3),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_short_7",
                pos: v2.create(-2.5, 8.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_short_7",
                pos: v2.create(2.5, 8.5),
                scale: 1,
                ori: 0
            },
            {
                type: "tree_01",
                pos: v2.create(5, 8),
                scale: 1.05,
                ori: 0
            },
            {
                type: "tree_01",
                pos: v2.create(-5, 7.5),
                scale: 1.1,
                ori: 0
            },
            {
                type: "tree_01",
                pos: v2.create(-1.25, 15.75),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_vent_01",
                pos: v2.create(-5, -0),
                scale: 1,
                ori: 0
            },
            {
                type: "stone_01",
                pos: v2.create(-5.75, -1.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "decal_vent_02",
                pos: v2.create(4.5, -8.5),
                scale: 1,
                ori: 0
            },
            {
                type: "bush_01",
                pos: v2.create(5.75, -6.75),
                scale: 1,
                ori: 0
            }
        ]
    },
    bunker_egg_sublevel_01: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 0,
        floor: {
            surfaces: [
                {
                    type: "bunker",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, -4.5),
                            v2.create(10, 9)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-egg-chamber-floor-01a.img",
                    pos: v2.create(-0.15, -4.6),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-bunker-egg-chamber-floor-01b.img",
                    pos: v2.create(0, 9.24),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, -4.5),
                        v2.create(10, 9)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-egg-chamber-ceiling-01.img",
                    scale: 1,
                    alpha: 1,
                    tint: 16777215
                }
            ],
            vision: { dist: 5, width: 3 }
        },
        mapObjects: [
            {
                type: "concrete_wall_ext_6",
                pos: v2.create(0, 11.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(-3.5, 8),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(3.5, 8),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(-7, 5.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(7, 5.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_20",
                pos: v2.create(-10.5, -3),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_20",
                pos: v2.create(10.5, -3),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_24",
                pos: v2.create(0, -14.5),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_02",
                pos: v2.create(-2, 5),
                scale: 1,
                ori: 3
            },
            {
                type: "crate_07",
                pos: v2.create(0, -4.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "barrel_01",
                pos: v2.create(-7, -11),
                scale: 0.9,
                ori: 0
            }
        ]
    },
    bunker_egg_sublevel_02: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 0,
        floor: {
            surfaces: [
                {
                    type: "bunker",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, -4.5),
                            v2.create(10, 9)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-egg-chamber-floor-01a.img",
                    pos: v2.create(-0.15, -4.6),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-bunker-egg-chamber-floor-01b.img",
                    pos: v2.create(0, 9.25),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, -4.5),
                        v2.create(10, 9)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-egg-chamber-ceiling-01.img",
                    scale: 1,
                    alpha: 1,
                    tint: 16777215
                }
            ],
            vision: { dist: 5, width: 3 }
        },
        mapObjects: [
            {
                type: "concrete_wall_ext_6",
                pos: v2.create(0, 11.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(-3.5, 8),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(3.5, 8),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(-7, 5.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(7, 5.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_20",
                pos: v2.create(-10.5, -3),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_20",
                pos: v2.create(10.5, -3),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_24",
                pos: v2.create(0, -14.5),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_02",
                pos: v2.create(-2, 5),
                scale: 1,
                ori: 3
            },
            {
                type: "crate_07b",
                pos: v2.create(0, -4.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "barrel_01",
                pos: v2.create(-7, -11),
                scale: 0.9,
                ori: 0
            }
        ]
    },
    bunker_egg_sublevel_01sv: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 0,
        floor: {
            surfaces: [
                {
                    type: "bunker",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, -4.5),
                            v2.create(10, 9)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-egg-chamber-floor-01a.img",
                    pos: v2.create(-0.15, -4.6),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-bunker-egg-chamber-floor-01b.img",
                    pos: v2.create(0, 9.25),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, -4.5),
                        v2.create(10, 9)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-egg-chamber-ceiling-01.img",
                    scale: 1,
                    alpha: 1,
                    tint: 16777215
                }
            ],
            vision: { dist: 5, width: 3 }
        },
        mapObjects: [
            {
                type: "concrete_wall_ext_6",
                pos: v2.create(0, 11.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(-3.5, 8),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(3.5, 8),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(-7, 5.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(7, 5.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_20",
                pos: v2.create(-10.5, -3),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_20",
                pos: v2.create(10.5, -3),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_24",
                pos: v2.create(0, -14.5),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_02",
                pos: v2.create(-2, 5),
                scale: 1,
                ori: 3
            },
            {
                type: "crate_07sv",
                pos: v2.create(0, -4.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "barrel_01",
                pos: v2.create(-7, -11),
                scale: 0.9,
                ori: 0
            }
        ]
    },
    bunker_structure_01: {
        type: "structure",
        terrain: { grass: !0, beach: !1 },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(0, 5),
                v2.create(7.5, 12.5)
            )
        ],
        layers: [
            {
                type: "bunker_egg_01",
                pos: v2.create(0, 0),
                ori: 0
            },
            {
                type: "bunker_egg_sublevel_01",
                pos: v2.create(0, 0),
                ori: 0
            }
        ],
        stairs: [
            {
                collision: collider.createAabbExtents(
                    v2.create(0, 8.4),
                    v2.create(2, 2.6)
                ),
                downDir: v2.create(0, -1)
            }
        ],
        mask: [
            collider.createAabbExtents(
                v2.create(0, -3.7),
                v2.create(10, 9.5)
            )
        ]
    },
    bunker_structure_01b: {
        type: "structure",
        terrain: { grass: !0, beach: !1 },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(0, 5),
                v2.create(7.5, 12.5)
            )
        ],
        layers: [
            {
                type: "bunker_egg_01",
                pos: v2.create(0, 0),
                ori: 0
            },
            {
                type: "bunker_egg_sublevel_02",
                pos: v2.create(0, 0),
                ori: 0
            }
        ],
        stairs: [
            {
                collision: collider.createAabbExtents(
                    v2.create(0, 8.4),
                    v2.create(2, 2.6)
                ),
                downDir: v2.create(0, -1)
            }
        ],
        mask: [
            collider.createAabbExtents(
                v2.create(0, -3.7),
                v2.create(10, 9.5)
            )
        ]
    },
    bunker_structure_01sv: {
        type: "structure",
        terrain: { grass: !0, beach: !1 },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(0, 5),
                v2.create(7.5, 12.5)
            )
        ],
        layers: [
            {
                type: "bunker_egg_01",
                pos: v2.create(0, 0),
                ori: 0
            },
            {
                type: "bunker_egg_sublevel_01sv",
                pos: v2.create(0, 0),
                ori: 0
            }
        ],
        stairs: [
            {
                collision: collider.createAabbExtents(
                    v2.create(0, 8.4),
                    v2.create(2, 2.6)
                ),
                downDir: v2.create(0, -1)
            }
        ],
        mask: [
            collider.createAabbExtents(
                v2.create(0, -3.7),
                v2.create(10, 9.5)
            )
        ]
    },
    bunker_hydra_01: {
        type: "building",
        map: {
            display: !0,
            shapes: [
                {
                    collider: collider.createAabbExtents(
                        v2.create(20.25, 3.5),
                        v2.create(6.25, 5.5)
                    ),
                    color: 2894892
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(32.25, 3.5),
                        v2.create(6.75, 9.25)
                    ),
                    color: 3815994
                }
            ]
        },
        terrain: { grass: !0, beach: !1 },
        zIdx: 0,
        floor: {
            surfaces: [
                {
                    type: "tile",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(20.25, 3.5),
                            v2.create(6.25, 5.5)
                        ),
                        collider.createAabbExtents(
                            v2.create(32.25, 3.5),
                            v2.create(6.75, 9.25)
                        )
                    ]
                },
                {
                    type: "container",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(16.25, 3.5),
                            v2.create(3.25, 2)
                        ),
                        collider.createAabbExtents(
                            v2.create(-16.5, -90.75),
                            v2.create(2, 3.25)
                        ),
                        collider.createAabbExtents(
                            v2.create(40, -50.5),
                            v2.create(2, 3.25)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-hydra-floor-01.img",
                    pos: v2.create(25.75, 3.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-bunker-generic-floor-01.img",
                    pos: v2.create(-16.5, -90),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 2
                },
                {
                    sprite: "map-bunker-generic-floor-01.img",
                    pos: v2.create(40, -51),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(19.25, 3.5),
                        v2.create(6.25, 5.5)
                    )
                },
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(32.25, 3.5),
                        v2.create(6.75, 9.25)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-hydra-ceiling-01.img",
                    pos: v2.create(25.75, 3.5),
                    scale: 1,
                    alpha: 1,
                    tint: 16777215
                }
            ],
            vision: {
                dist: 5,
                width: 2.75,
                linger: 0.5,
                fadeRate: 6
            }
        },
        mapObjects: [
            {
                type: "concrete_wall_ext_13",
                pos: v2.create(18.75, 9.5),
                scale: 1,
                ori: 1
            },
            {
                type: "concrete_wall_ext_13",
                pos: v2.create(18.75, -2.5),
                scale: 1,
                ori: 1
            },
            {
                type: "concrete_wall_ext_11",
                pos: v2.create(12.75, 3.5),
                scale: 1,
                ori: 0
            },
            {
                type: "concrete_wall_ext_7",
                pos: v2.create(25.75, 9),
                scale: 1,
                ori: 0
            },
            {
                type: "concrete_wall_ext_7",
                pos: v2.create(25.75, -2),
                scale: 1,
                ori: 0
            },
            {
                type: "concrete_wall_ext_2",
                pos: v2.create(26.25, 12.5),
                scale: 1,
                ori: 1
            },
            {
                type: "concrete_wall_ext_2",
                pos: v2.create(26.25, -5.5),
                scale: 1,
                ori: 1
            },
            {
                type: "concrete_wall_ext_8",
                pos: v2.create(35.25, 12.5),
                scale: 1,
                ori: 1
            },
            {
                type: "concrete_wall_ext_8",
                pos: v2.create(35.25, -5.5),
                scale: 1,
                ori: 1
            },
            {
                type: "concrete_wall_ext_17",
                pos: v2.create(38.75, 3.5),
                scale: 1,
                ori: 0
            },
            {
                type: "police_wall_int_7",
                pos: v2.create(32.75, 8.5),
                scale: 1,
                ori: 0
            },
            {
                type: "police_wall_int_2",
                pos: v2.create(33.25, 4.5),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_01",
                pos: v2.create(38.25, 4.5),
                scale: 1,
                ori: 1
            },
            {
                type: randomObstacleType({ toilet_03: 5, toilet_04: 1 }),
                pos: v2.create(35.75, 10.5),
                scale: 1,
                ori: 0
            },
            {
                type: "crate_08",
                pos: v2.create(35.75, -2.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_short_6",
                pos: v2.create(13, 3.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_short_7",
                pos: v2.create(17, 6),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_short_7",
                pos: v2.create(17, 1),
                scale: 1,
                ori: 1
            },
            {
                type: "decal_vent_01",
                pos: v2.create(-1.5, 8),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_vent_02",
                pos: v2.create(8, -0.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_short_6",
                pos: v2.create(-16.5, -87.75),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_short_7",
                pos: v2.create(-19, -91),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_short_7",
                pos: v2.create(-14, -91),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_vent_01",
                pos: v2.create(-15.15, -79.55),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_short_6",
                pos: v2.create(40, -53.25),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_short_7",
                pos: v2.create(37.5, -50),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_short_7",
                pos: v2.create(42.5, -50),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_vent_02",
                pos: v2.create(40, -60.5),
                scale: 1,
                ori: 0
            },
            {
                type: "tree_01",
                pos: v2.create(-11.5, -92),
                scale: 1.05,
                ori: 0
            },
            {
                type: "tree_01",
                pos: v2.create(-21.5, -92.5),
                scale: 1.1,
                ori: 0
            },
            {
                type: "tree_01",
                pos: v2.create(-17.5, -83.25),
                scale: 1,
                ori: 0
            },
            {
                type: "tree_01",
                pos: v2.create(45, -50),
                scale: 1.05,
                ori: 0
            },
            {
                type: "tree_01",
                pos: v2.create(35, -50.5),
                scale: 1.1,
                ori: 0
            },
            {
                type: "tree_01",
                pos: v2.create(38.75, -42.25),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_hydra_01",
                pos: v2.create(3.5, -48.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            }
        ]
    },
    bunker_hydra_sublevel_01: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 1,
        floor: {
            surfaces: [
                {
                    type: "bunker",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(3.5, 3),
                            v2.create(9.5, 9)
                        )
                    ]
                },
                {
                    type: "tile",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(-15.5, -79.5),
                            v2.create(3, 8)
                        ),
                        collider.createAabbExtents(
                            v2.create(40.5, -62),
                            v2.create(9.5, 8)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-hydra-chamber-floor-01a.img",
                    pos: v2.create(17.5, 3.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-bunker-hydra-chamber-floor-01b.img",
                    pos: v2.create(3.5, 2.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-bunker-hydra-chamber-floor-02.img",
                    pos: v2.create(-15.5, -83),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-bunker-hydra-chamber-floor-03.img",
                    pos: v2.create(40.5, -58.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(3.5, 2.25),
                        v2.create(10, 10)
                    )
                },
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(-15, -77),
                        v2.create(5.5, 10.5)
                    )
                },
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(38, -62),
                        v2.create(11.5, 8)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-hydra-chamber-ceiling-01.img",
                    pos: v2.create(7, 2),
                    scale: 1,
                    alpha: 1,
                    tint: 6250335
                },
                {
                    sprite: "map-bunker-hydra-chamber-ceiling-02.img",
                    pos: v2.create(-13.5, -76.5),
                    scale: 1,
                    alpha: 1,
                    tint: 6250335
                },
                {
                    sprite: "map-bunker-hydra-chamber-ceiling-03.img",
                    pos: v2.create(38, -62),
                    scale: 1,
                    alpha: 1,
                    tint: 6250335
                }
            ],
            vision: { dist: 10, width: 3 }
        },
        mapObjects: [
            {
                type: "concrete_wall_ext_6",
                pos: v2.create(20, 3.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(16.5, 7),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(16.5, 0),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_7",
                pos: v2.create(14, 12),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_7",
                pos: v2.create(14, -5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_21",
                pos: v2.create(2, 13.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_21",
                pos: v2.create(-7, 2.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_5",
                pos: v2.create(-3, -6.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_5",
                pos: v2.create(10, -6.5),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_02",
                pos: v2.create(13.5, 5.5),
                scale: 1,
                ori: 2
            },
            {
                type: "lab_door_01",
                pos: v2.create(-0.5, -7.5),
                scale: 1,
                ori: 3
            },
            {
                type: "lab_door_01",
                pos: v2.create(7.5, -7.5),
                scale: 1,
                ori: 1
            },
            {
                type: "sandbags_01",
                pos: v2.create(0, 7.25),
                scale: 1,
                ori: 1
            },
            {
                type: "crate_01",
                pos: v2.create(10.25, -2.75),
                scale: 0.9,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "crate_01",
                pos: v2.create(10.25, 9.75),
                scale: 0.9,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "barrel_01",
                pos: v2.create(-3.5, -3),
                scale: 0.9,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_23",
                pos: v2.create(-20, -83),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_19",
                pos: v2.create(-11, -79),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(-13, -90.5),
                scale: 1,
                ori: 0
            },
            {
                type: "concrete_wall_ext_6",
                pos: v2.create(-16.5, -94),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_02",
                pos: v2.create(-18.5, -87.5),
                scale: 1,
                ori: 3
            },
            {
                type: "locker_01",
                pos: v2.create(-12.15, -79),
                scale: 1,
                ori: 3
            },
            {
                type: "locker_01",
                pos: v2.create(-12.15, -74.5),
                scale: 1,
                ori: 3
            },
            {
                type: "locker_01",
                pos: v2.create(-12.15, -83.5),
                scale: 1,
                ori: 3
            },
            {
                type: "concrete_wall_ext_6",
                pos: v2.create(40, -47),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(36.5, -50.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(43.5, -50.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(33, -53),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_7",
                pos: v2.create(30, -55),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_7",
                pos: v2.create(30, -66),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_16",
                pos: v2.create(36.5, -71),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(48.25, -70),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_13",
                pos: v2.create(50, -62),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(48.25, -54),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_02",
                pos: v2.create(38, -53.5),
                scale: 1,
                ori: 3
            },
            {
                type: "crate_08",
                pos: v2.create(34, -67),
                scale: 1,
                ori: 2
            },
            {
                type: "locker_01",
                pos: v2.create(46.5, -55.15),
                scale: 1,
                ori: 0
            },
            {
                type: "locker_01",
                pos: v2.create(48.9, -57.5),
                scale: 1,
                ori: 3
            },
            {
                type: "locker_01",
                pos: v2.create(48.9, -62),
                scale: 1,
                ori: 3
            },
            {
                type: "locker_01",
                pos: v2.create(48.9, -66.5),
                scale: 1,
                ori: 3
            },
            {
                type: "locker_01",
                pos: v2.create(46.5, -68.85),
                scale: 1,
                ori: 2
            },
            {
                type: "bunker_hydra_compartment_01",
                pos: v2.create(3.5, -18.95),
                scale: 1,
                ori: 0
            },
            {
                type: "bunker_hydra_compartment_02",
                pos: v2.create(6, -50),
                scale: 1,
                ori: 0
            },
            {
                type: "bunker_hydra_compartment_03",
                pos: v2.create(10.5, -74.95),
                scale: 1,
                ori: 0
            }
        ]
    },
    bunker_hydra_compartment_01: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 2,
        floor: {
            surfaces: [
                {
                    type: "tile",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 1.5),
                            v2.create(9.5, 12.5)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-hydra-compartment-floor-01.img",
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 1.25),
                        v2.create(10, 10)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-hydra-compartment-ceiling-01.img",
                    pos: v2.create(0, 1.25),
                    scale: 1,
                    alpha: 1,
                    tint: 6250335
                }
            ]
        },
        mapObjects: [
            {
                type: "metal_wall_ext_thicker_17",
                pos: v2.create(-9.75, 3),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_5",
                pos: v2.create(-6.5, 9.75),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_5",
                pos: v2.create(6.5, 10.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_18",
                pos: v2.create(10.5, 1.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_7",
                pos: v2.create(-7.5, -6.75),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(8, -7.5),
                scale: 1,
                ori: 1
            },
            {
                type: "crate_08",
                pos: v2.create(6.5, 6.5),
                scale: 1,
                ori: 2
            },
            {
                type: "sandbags_01",
                pos: v2.create(4.75, 1.5),
                scale: 1,
                ori: 0
            },
            {
                type: "lab_door_01",
                pos: v2.create(-4, -8.5),
                scale: 1,
                ori: 3
            },
            {
                type: "lab_door_01",
                pos: v2.create(4, -8.5),
                scale: 1,
                ori: 1
            },
            {
                type: "locker_01",
                pos: v2.create(-6, 8.4),
                scale: 1,
                ori: 0
            },
            {
                type: "locker_01",
                pos: v2.create(-8.35, 6),
                scale: 1,
                ori: 1
            },
            {
                type: "locker_01",
                pos: v2.create(-8.35, 1.5),
                scale: 1,
                ori: 1
            },
            {
                type: "locker_01",
                pos: v2.create(-8.35, -3),
                scale: 1,
                ori: 1
            },
            {
                type: "locker_01",
                pos: v2.create(-6, -5.4),
                scale: 1,
                ori: 2
            }
        ]
    },
    metal_wall_column_5x12: X({
        material: "metal",
        extents: v2.create(2.5, 6)
    }),
    bunker_hydra_compartment_02: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 0,
        floor: {
            surfaces: [
                {
                    type: "tile",
                    data: { isBright: !0 },
                    collision: [
                        collider.createAabbExtents(
                            v2.create(-2.5, 16),
                            v2.create(22, 4)
                        ),
                        collider.createAabbExtents(
                            v2.create(-2.5, 9.5),
                            v2.create(6, 2.5)
                        ),
                        collider.createAabbExtents(
                            v2.create(0, -4.5),
                            v2.create(25, 17)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-hydra-compartment-floor-02.img",
                    pos: v2.create(0, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(-2, 3),
                        v2.create(22.5, 19.5)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-hydra-compartment-ceiling-02.img",
                    pos: v2.create(0, 1),
                    scale: 1,
                    alpha: 1,
                    tint: 6250335
                }
            ]
        },
        mapObjects: [
            {
                type: "metal_wall_ext_thicker_21",
                pos: v2.create(-17, 21.75),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_21",
                pos: v2.create(12, 21.75),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_42",
                pos: v2.create(-26, -0.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_29",
                pos: v2.create(21, 6),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_6",
                pos: v2.create(-19, -18.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(-18.5, -14),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_5",
                pos: v2.create(-15, -15),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_9",
                pos: v2.create(-9, -16),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_9",
                pos: v2.create(4, -16),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_5",
                pos: v2.create(10, -15),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_11",
                pos: v2.create(17, -14),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_column_5x12",
                pos: v2.create(-14.5, 13),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_column_5x12",
                pos: v2.create(9.5, 13),
                scale: 1,
                ori: 1
            },
            {
                type: "control_panel_03",
                pos: v2.create(-7, 12),
                scale: 1,
                ori: 1
            },
            {
                type: "control_panel_03",
                pos: v2.create(2, 12),
                scale: 1,
                ori: 3
            },
            {
                type: "lab_window_01",
                pos: v2.create(-7, 7),
                scale: 1,
                ori: 1
            },
            {
                type: "lab_window_01",
                pos: v2.create(-4, 7),
                scale: 1,
                ori: 1
            },
            {
                type: "lab_window_01",
                pos: v2.create(-1, 7),
                scale: 1,
                ori: 1
            },
            {
                type: "lab_window_01",
                pos: v2.create(2, 7),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_4",
                pos: v2.create(-9, 8.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_4",
                pos: v2.create(4, 8.5),
                scale: 1,
                ori: 0
            },
            {
                type: "lab_door_01",
                pos: v2.create(-20.5, 13),
                scale: 1,
                ori: 1
            },
            {
                type: "lab_door_01",
                pos: v2.create(15.5, 13),
                scale: 1,
                ori: 3
            },
            {
                type: "crate_01",
                pos: v2.create(-17.5, 7.75),
                scale: 1,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "vat_01",
                pos: v2.create(-12.25, 7.5),
                scale: 1,
                ori: 3
            },
            {
                type: "vat_01",
                pos: v2.create(-12, -2.5),
                scale: 1,
                ori: 0
            },
            {
                type: "vat_01",
                pos: v2.create(-18, -2.5),
                scale: 1,
                ori: 2
            },
            {
                type: "vat_02",
                pos: v2.create(-2.5, 1.5),
                scale: 1,
                ori: 2
            },
            {
                type: "power_box_01",
                pos: v2.create(-2.5, -3),
                scale: 1,
                ori: 2
            },
            {
                type: "crate_01",
                pos: v2.create(12.5, 7.75),
                scale: 1,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "vat_01",
                pos: v2.create(7.25, 7.5),
                scale: 1,
                ori: 3
            },
            {
                type: "vat_01",
                pos: v2.create(7, -2.5),
                scale: 1,
                ori: 2
            },
            {
                type: "vat_01",
                pos: v2.create(13, -2.5),
                scale: 1,
                ori: 0
            },
            {
                type: "vat_01",
                pos: v2.create(-10.75, -11.5),
                scale: 1,
                ori: 1
            },
            {
                type: "lab_door_01",
                pos: v2.create(-4.5, -16.5),
                scale: 1,
                ori: 3
            },
            {
                type: "vat_01",
                pos: v2.create(5.75, -11.5),
                scale: 1,
                ori: 1
            },
            {
                type: "fire_ext_01",
                pos: v2.create(1.5, -14.15),
                scale: 1,
                ori: 1
            },
            {
                type: "lab_door_03",
                pos: v2.create(-20.5, -16.5),
                scale: 1,
                ori: 1
            },
            {
                type: "lab_door_02",
                pos: v2.create(20.5, -8.5),
                scale: 1,
                ori: 2
            }
        ]
    },
    bunker_hydra_compartment_03: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 2,
        floor: {
            surfaces: [
                {
                    type: "bunker",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 2),
                            v2.create(9, 8.75)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-hydra-compartment-floor-03.img",
                    pos: v2.create(0, -0.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 0.75),
                        v2.create(10, 7.75)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-hydra-compartment-ceiling-03.img",
                    pos: v2.create(0, 1),
                    scale: 1,
                    alpha: 1,
                    tint: 6250335
                }
            ]
        },
        mapObjects: [
            {
                type: "metal_wall_ext_thicker_17",
                pos: v2.create(-10.5, -1),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_18",
                pos: v2.create(0, -8),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_18",
                pos: v2.create(10.5, -1),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_14",
                pos: v2.create(2, 6),
                scale: 1,
                ori: 1
            },
            {
                type: "crate_01",
                pos: v2.create(-6.5, -1.5),
                scale: 1,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "crate_01",
                pos: v2.create(-1.75, 2),
                scale: 1,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "barrel_01",
                pos: v2.create(-2, -2),
                scale: 0.9,
                ori: 0
            },
            {
                type: "case_03",
                pos: v2.create(7, -4),
                scale: 1,
                ori: 3
            }
        ]
    },
    bunker_structure_02: {
        type: "structure",
        terrain: { grass: !0, beach: !1 },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(25.5, 3.5),
                v2.create(16, 11.5)
            ),
            collider.createAabbExtents(
                v2.create(-16.5, -89.5),
                v2.create(7, 7.5)
            ),
            collider.createAabbExtents(
                v2.create(40, -47.25),
                v2.create(6.5, 7.25)
            ),
            collider.createAabbExtents(
                v2.create(3.5, -48.5),
                v2.create(3, 3)
            )
        ],
        layers: [
            {
                type: "bunker_hydra_01",
                pos: v2.create(0, 0),
                ori: 0
            },
            {
                type: "bunker_hydra_sublevel_01",
                pos: v2.create(0, 0),
                ori: 0
            }
        ],
        stairs: [
            {
                collision: collider.createAabbExtents(
                    v2.create(16.4, 3.5),
                    v2.create(2.6, 2)
                ),
                downDir: v2.create(-1, 0)
            },
            {
                collision: collider.createAabbExtents(
                    v2.create(-16.5, -90.75),
                    v2.create(2, 2.5)
                ),
                downDir: v2.create(0, 1)
            },
            {
                collision: collider.createAabbExtents(
                    v2.create(40, -50.35),
                    v2.create(2, 2.5)
                ),
                downDir: v2.create(0, -1)
            }
        ],
        mask: [
            collider.createAabbExtents(
                v2.create(3.5, -7.2),
                v2.create(10.75, 20)
            ),
            collider.createAabbExtents(
                v2.create(-15, -79.75),
                v2.create(5, 8.5)
            ),
            collider.createAabbExtents(
                v2.create(39, -61.85),
                v2.create(12, 9)
            ),
            collider.createAabbExtents(
                v2.create(3.5, -49.2),
                v2.create(23.49, 21.99)
            ),
            collider.createAabbExtents(
                v2.create(10.5, -76.7),
                v2.create(10, 5.5)
            )
        ]
    },
    bunker_storm_01: {
        type: "building",
        map: {
            display: !0,
            shapes: [
                {
                    collider: collider.createAabbExtents(
                        v2.create(0, 10),
                        v2.create(3.6, 5.8)
                    ),
                    color: 6707790
                }
            ]
        },
        terrain: { grass: !0, beach: !1 },
        zIdx: 0,
        floor: {
            surfaces: [
                {
                    type: "container",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 7.75),
                            v2.create(2, 3.25)
                        )
                    ]
                },
                {
                    type: "shack",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 13.5),
                            v2.create(3.75, 2.5)
                        )
                    ]
                },
                {
                    type: "asphalt",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(5, 13.75),
                            v2.create(1.25, 2.25)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-storm-floor-02.img",
                    pos: v2.create(1.25, 10),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 10),
                        v2.create(3.5, 5.6)
                    ),
                    zoomOut: collider.createAabbExtents(
                        v2.create(0, 10),
                        v2.create(3.8, 5.9)
                    )
                }
            ],
            vision: {
                dist: 5,
                width: 2.75,
                linger: 0.5,
                fadeRate: 6
            },
            imgs: [
                {
                    sprite: "map-building-shack-ceiling-01.img",
                    pos: v2.create(-1, 10),
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215,
                    rot: 1
                }
            ],
            destroy: {
                wallCount: 2,
                particle: "shackBreak",
                particleCount: 25,
                residue: "none"
            }
        },
        mapObjects: [
            {
                type: "metal_wall_ext_short_6",
                pos: v2.create(0, 5.3),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_short_7",
                pos: v2.create(-2.5, 8.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_short_7",
                pos: v2.create(2.5, 8.5),
                scale: 1,
                ori: 0
            },
            {
                type: "shack_wall_bot",
                pos: v2.create(3.39, 8.6),
                scale: 1,
                ori: 1
            },
            {
                type: "shack_wall_side_left",
                pos: v2.create(0.3, 4.52),
                scale: 1,
                ori: 1
            },
            {
                type: "shack_wall_top",
                pos: v2.create(-3.39, 9.73),
                scale: 1,
                ori: 1
            },
            {
                type: "shack_wall_side_right",
                pos: v2.create(0, 15.58),
                scale: 1,
                ori: 1
            },
            {
                type: "crate_01",
                pos: v2.create(-2, 17.9),
                scale: 0.8,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "barrel_01",
                pos: v2.create(1.45, 17.7),
                scale: 0.85,
                ori: 0
            },
            {
                type: "decal_vent_01",
                pos: v2.create(-5, -0),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_vent_02",
                pos: v2.create(4.5, -8.5),
                scale: 1,
                ori: 0
            },
            {
                type: "stone_01",
                pos: v2.create(-4.25, -1.5),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "bush_01",
                pos: v2.create(3.75, -6.75),
                scale: 1,
                ori: 0
            }
        ]
    },
    bunker_storm_sublevel_01: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 1,
        floor: {
            surfaces: [
                {
                    type: "bunker",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(1, -4.4),
                            v2.create(10.5, 9)
                        )
                    ]
                },
                {
                    type: "tile",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(19, -5.5),
                            v2.create(7.5, 8)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-storm-chamber-floor-01a.img",
                    pos: v2.create(8.5, -4.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-bunker-storm-chamber-floor-01b.img",
                    pos: v2.create(0, 9.25),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(8.5, -4.5),
                        v2.create(18, 9.5)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-storm-chamber-ceiling-01.img",
                    pos: v2.create(8.5, -1),
                    scale: 1,
                    alpha: 1,
                    tint: 16777215
                }
            ],
            vision: { dist: 5, width: 3 }
        },
        mapObjects: [
            {
                type: "concrete_wall_ext_6",
                pos: v2.create(0, 11.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(-3.5, 8),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(3.5, 8),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(-7, 5.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(7, 5.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_20",
                pos: v2.create(-10.5, -3),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_21",
                pos: v2.create(-1.5, -14.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_10",
                pos: v2.create(10.5, -11),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_10",
                pos: v2.create(12.5, -11),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_15",
                pos: v2.create(21.5, -14.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_15",
                pos: v2.create(27.5, -5.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_17",
                pos: v2.create(20.5, 3.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_9",
                pos: v2.create(10.5, 2.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(12.5, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "house_door_02",
                pos: v2.create(-2, 5),
                scale: 1,
                ori: 3
            },
            {
                type: "crate_01",
                pos: v2.create(-6.5, 1.5),
                scale: 1,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "crate_04",
                pos: v2.create(6, -1),
                scale: 1,
                ori: 0
            },
            {
                type: "crate_04",
                pos: v2.create(3.9, -6.4),
                scale: 1,
                ori: 0
            },
            {
                type: "control_panel_03",
                pos: v2.create(16, -11.5),
                scale: 1,
                ori: 2
            },
            {
                type: "control_panel_02",
                pos: v2.create(20, -11.25),
                scale: 1,
                ori: 2
            },
            {
                type: "control_panel_03",
                pos: v2.create(24, -11.5),
                scale: 1,
                ori: 2
            },
            {
                type: "crate_08",
                pos: v2.create(23.5, -0.5),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ case_03: 1, chest_02: 9 }),
                pos: v2.create(16.5, 0.25),
                scale: 1,
                ori: 0
            },
            {
                type: "lab_door_01",
                pos: v2.create(11.5, -2),
                scale: 1,
                ori: 2
            },
            {
                type: "barrel_01",
                pos: v2.create(-7, -11),
                scale: 0.9,
                ori: 0
            }
        ]
    },
    bunker_structure_03: {
        type: "structure",
        terrain: { grass: !0, beach: !1 },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(0, 6),
                v2.create(7, 16.5)
            )
        ],
        layers: [
            {
                type: "bunker_storm_01",
                pos: v2.create(0, 0),
                ori: 0
            },
            {
                type: "bunker_storm_sublevel_01",
                pos: v2.create(0, 0),
                ori: 0
            }
        ],
        stairs: [
            {
                collision: collider.createAabbExtents(
                    v2.create(0, 8.4),
                    v2.create(2, 2.6)
                ),
                downDir: v2.create(0, -1)
            }
        ],
        mask: [
            collider.createAabbExtents(
                v2.create(8.5, -3.7),
                v2.create(18, 9.5)
            )
        ]
    },
    bunker_conch_01: {
        type: "building",
        map: {
            display: !0,
            shapes: [
                {
                    collider: collider.createAabbExtents(
                        v2.create(20, 3.35),
                        v2.create(5.5, 2.5)
                    ),
                    color: 2703694
                },
                {
                    collider: collider.createAabbExtents(
                        v2.create(46.5, -32.55),
                        v2.create(5.5, 2.5)
                    ),
                    color: 2703694
                }
            ]
        },
        terrain: { grass: !0, beach: !1 },
        zIdx: 0,
        floor: {
            surfaces: [
                {
                    type: "container",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(16.25, 3.5),
                            v2.create(3.25, 2)
                        ),
                        collider.createAabbExtents(
                            v2.create(44.25, -32.5),
                            v2.create(3.25, 2)
                        ),
                        collider.createAabbExtents(
                            v2.create(22, 3.35),
                            v2.create(8, 2.5)
                        ),
                        collider.createAabbExtents(
                            v2.create(50.5, -32.55),
                            v2.create(8, 2.5)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-conch-floor-01.img",
                    pos: v2.create(20.75, 3.45),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-bunker-conch-floor-01.img",
                    pos: v2.create(48.75, -32.45),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(19, 3.35),
                        v2.create(5.5, 2.5)
                    ),
                    zoomOut: collider.createAabbExtents(
                        v2.create(22, 3.35),
                        v2.create(8, 2.5)
                    )
                },
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(47.5, -32.55),
                        v2.create(5.5, 2.5)
                    ),
                    zoomOut: collider.createAabbExtents(
                        v2.create(50.5, -32.55),
                        v2.create(8, 2.5)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-conch-ceiling-01.img",
                    pos: v2.create(19.25, 3.35),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-bunker-conch-ceiling-01.img",
                    pos: v2.create(47.25, -32.55),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ],
            vision: {}
        },
        mapObjects: [
            {
                type: "container_wall_top",
                pos: v2.create(13.7, 3.35),
                scale: 1,
                ori: 1
            },
            {
                type: "container_wall_side",
                pos: v2.create(19.6, 5.7),
                scale: 1,
                ori: 1
            },
            {
                type: "container_wall_side",
                pos: v2.create(19.6, 1),
                scale: 1,
                ori: 1
            },
            {
                type: "barrel_01",
                pos: v2.create(24, 9),
                scale: 1,
                ori: 0
            },
            {
                type: "crate_01",
                pos: v2.create(18, -2),
                scale: 1,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "container_wall_top",
                pos: v2.create(41.7, -32.55),
                scale: 1,
                ori: 1
            },
            {
                type: "container_wall_side",
                pos: v2.create(47.6, -34.9),
                scale: 1,
                ori: 1
            },
            {
                type: "container_wall_side",
                pos: v2.create(47.6, -30.2),
                scale: 1,
                ori: 1
            },
            {
                type: "crate_01",
                pos: v2.create(47, -27),
                scale: 1,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "barrel_01",
                pos: v2.create(40, -37),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_vent_03",
                pos: v2.create(-2, -13.5),
                scale: 1,
                ori: 0
            }
        ]
    },
    bunker_conch_sublevel_01: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 1,
        floor: {
            surfaces: [
                {
                    type: "tile",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(1, 4),
                            v2.create(12.5, 3.5)
                        ),
                        collider.createAabbExtents(
                            v2.create(28, -30),
                            v2.create(13.5, 4.5)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-conch-chamber-floor-01.img",
                    pos: v2.create(4, 5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-bunker-conch-chamber-floor-02.img",
                    pos: v2.create(34.86, -29.9),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(1, 3.5),
                        v2.create(12.5, 5)
                    )
                },
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(26.75, -30),
                        v2.create(15.25, 4.5)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-conch-chamber-ceiling-01.img",
                    pos: v2.create(-2, 3.5),
                    scale: 1,
                    alpha: 1,
                    tint: 6250335
                },
                {
                    sprite: "map-bunker-conch-chamber-ceiling-02.img",
                    pos: v2.create(26.25, -29.9),
                    scale: 1,
                    alpha: 1,
                    tint: 6250335
                }
            ],
            vision: { dist: 7, width: 3 }
        },
        occupiedEmitters: [
            {
                type: "bunker_bubbles_01",
                pos: v2.create(-2, -13.5),
                rot: 0,
                scale: 0.5,
                layer: 0
            }
        ],
        mapObjects: [
            {
                type: "house_door_02",
                pos: v2.create(13.5, 1.35),
                scale: 1,
                ori: 0
            },
            {
                type: "concrete_wall_ext_6",
                pos: v2.create(20, 3.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(16.5, 6.7),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_29",
                pos: v2.create(7, 0),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_16",
                pos: v2.create(5.5, 9),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_9",
                pos: v2.create(-7, 7),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_10",
                pos: v2.create(-13, 3.5),
                scale: 1,
                ori: 0
            },
            {
                type: "locker_01",
                pos: v2.create(9.5, 7.85),
                scale: 1,
                ori: 0
            },
            {
                type: "locker_01",
                pos: v2.create(5, 7.85),
                scale: 1,
                ori: 0
            },
            {
                type: "locker_01",
                pos: v2.create(0.5, 7.85),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_pipes_01",
                pos: v2.create(-4.5, 5),
                scale: 1,
                ori: 2
            },
            {
                type: "house_door_02",
                pos: v2.create(41.5, -34.55),
                scale: 1,
                ori: 0
            },
            {
                type: "concrete_wall_ext_6",
                pos: v2.create(48, -32.4),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_20",
                pos: v2.create(38.5, -35.9),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_13",
                pos: v2.create(42, -29.2),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(34, -26.7),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(27, -33.4),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_11",
                pos: v2.create(20, -30.9),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_18",
                pos: v2.create(23.5, -23.9),
                scale: 1,
                ori: 1
            },
            {
                type: "decal_pipes_04",
                pos: v2.create(22, -29.9),
                scale: 1,
                ori: 2
            },
            {
                type: "loot_tier_2",
                pos: v2.create(31, -30),
                scale: 1,
                ori: 0
            },
            {
                type: "bunker_conch_compartment_01",
                pos: v2.create(-1.5, -12.4),
                scale: 1,
                ori: 0
            }
        ]
    },
    bunker_conch_compartment_01: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 2,
        floor: {
            surfaces: [
                {
                    type: "water",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(1, -2.5),
                            v2.create(15, 15.5)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-conch-compartment-floor-01a.img",
                    pos: v2.create(-3, -0.75),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-bunker-conch-compartment-floor-01b.img",
                    pos: v2.create(9.75, -17.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(-1.5, -1),
                        v2.create(12.5, 12)
                    )
                },
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(9.5, -14.5),
                        v2.create(4, 2.5)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-conch-compartment-ceiling-01.img",
                    pos: v2.create(-0.75, -5.5),
                    scale: 1,
                    alpha: 1,
                    tint: 6250335
                }
            ],
            vision: { dist: 7, width: 3 }
        },
        occupiedEmitters: [
            {
                type: "bunker_bubbles_01",
                pos: v2.create(-0.5, -1),
                rot: 0,
                scale: 0.5,
                layer: 0
            }
        ],
        mapObjects: [
            {
                type: "metal_wall_ext_thicker_5",
                pos: v2.create(-11.5, 8.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(-15, 7.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_11",
                pos: v2.create(-15.5, 0.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_7",
                pos: v2.create(-13.5, -6.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_7",
                pos: v2.create(-11.5, -11.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_13",
                pos: v2.create(-3.5, -13.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_5",
                pos: v2.create(4.5, -14.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_13",
                pos: v2.create(9.5, -18.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_7",
                pos: v2.create(13.5, -11.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_19",
                pos: v2.create(11.5, -0.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_19",
                pos: v2.create(3.5, 10.5),
                scale: 1,
                ori: 1
            },
            {
                type: "lab_door_01",
                pos: v2.create(-10, 11),
                scale: 1,
                ori: 3
            },
            {
                type: "control_panel_03",
                pos: v2.create(-12.25, 4.25),
                scale: 1,
                ori: 1
            },
            {
                type: "control_panel_02",
                pos: v2.create(-12, 0.25),
                scale: 1,
                ori: 1
            },
            {
                type: "fire_ext_01",
                pos: v2.create(-3, 8.75),
                scale: 1,
                ori: 3
            },
            {
                type: "crate_09",
                pos: v2.create(2.75, 6.25),
                scale: 1,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "crate_01",
                pos: v2.create(7.5, 6.25),
                scale: 1,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "decal_pipes_02",
                pos: v2.create(7.25, 7.25),
                scale: 1,
                ori: 0
            },
            {
                type: "barrel_01",
                pos: v2.create(-3.75, -2),
                scale: 0.8,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "barrel_01",
                pos: v2.create(-1.25, -4.25),
                scale: 0.8,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "crate_01",
                pos: v2.create(-7.5, -9.5),
                scale: 1,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "crate_01",
                pos: v2.create(3.5, -9.5),
                scale: 1,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "decal_pipes_03",
                pos: v2.create(-5.25, -9.25),
                scale: 1,
                ori: 0
            },
            {
                type: "lab_door_01",
                pos: v2.create(13.5, -17),
                scale: 1,
                ori: 0
            }
        ]
    },
    bunker_structure_04: {
        type: "structure",
        terrain: {
            waterEdge: {
                dir: v2.create(-1, 0),
                distMin: 15,
                distMax: 16
            }
        },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(21, 3.5),
                v2.create(9.5, 8)
            ),
            collider.createAabbExtents(
                v2.create(48, -32.5),
                v2.create(10, 8)
            )
        ],
        layers: [
            {
                type: "bunker_conch_01",
                pos: v2.create(0, 0),
                ori: 0
            },
            {
                type: "bunker_conch_sublevel_01",
                pos: v2.create(0, 0),
                ori: 0
            }
        ],
        stairs: [
            {
                collision: collider.createAabbExtents(
                    v2.create(16.9, 3.5),
                    v2.create(2.6, 2)
                ),
                downDir: v2.create(-1, 0)
            },
            {
                collision: collider.createAabbExtents(
                    v2.create(44.9, -32.5),
                    v2.create(2.6, 2)
                ),
                downDir: v2.create(-1, 0)
            }
        ],
        mask: [
            collider.createAabbExtents(
                v2.create(-1.5, -9.2),
                v2.create(15.7, 22)
            ),
            collider.createAabbExtents(
                v2.create(28.25, -32),
                v2.create(14, 8)
            )
        ]
    },
    bunker_crossing_stairs_01: p({}),
    bunker_crossing_stairs_01b: p({
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 0.75),
                        v2.create(2, 3.25)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-crossing-ceiling-01.img",
                    pos: v2.create(0, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 0
                }
            ]
        }
    }),
    bunker_crossing_01: {
        type: "building",
        map: {
            display: !0,
            shapes: [
                {
                    collider: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(5, 5)
                    ),
                    color: 1984867
                }
            ]
        },
        terrain: { grass: !0, beach: !1 },
        zIdx: 0,
        floor: {
            surfaces: [],
            imgs: [
                {
                    sprite: "map-bunker-crossing-floor-01.img",
                    pos: v2.create(0, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: { zoomRegions: [], imgs: [] },
        mapObjects: [
            {
                type: "bunker_crossing_stairs_01b",
                pos: v2.create(34.5, 28.5),
                scale: 1,
                ori: 3
            },
            {
                type: "bunker_crossing_stairs_01b",
                pos: v2.create(-36, 20),
                scale: 1,
                ori: 2
            },
            {
                type: "bunker_crossing_stairs_01b",
                pos: v2.create(36, -14),
                scale: 1,
                ori: 0
            },
            {
                type: "bunker_crossing_stairs_01",
                pos: v2.create(-34.5, -22.5),
                scale: 1,
                ori: 1
            }
        ]
    },
    bunker_crossing_sublevel_01: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 1,
        floor: {
            surfaces: [
                {
                    type: "tile",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 3.25),
                            v2.create(38, 28)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-crossing-chamber-floor-01a.img",
                    pos: v2.create(-11.44, 27),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 2
                },
                {
                    sprite: "map-bunker-crossing-chamber-floor-01b.img",
                    pos: v2.create(-9.38, 18.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 2
                },
                {
                    sprite: "map-bunker-crossing-chamber-floor-01c.img",
                    pos: v2.create(-36.44, 18.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 2
                },
                {
                    sprite: "map-bunker-crossing-chamber-floor-03.img",
                    pos: v2.create(28.5, 23.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 2
                },
                {
                    sprite: "map-bunker-crossing-chamber-floor-02.img",
                    pos: v2.create(-28.5, -17.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 0
                },
                {
                    sprite: "map-bunker-crossing-chamber-floor-01a.img",
                    pos: v2.create(11.45, -21),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 0
                },
                {
                    sprite: "map-bunker-crossing-chamber-floor-01b.img",
                    pos: v2.create(9.39, -12.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 0
                },
                {
                    sprite: "map-bunker-crossing-chamber-floor-01c.img",
                    pos: v2.create(36.45, -12.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 0
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(-3, 27.5),
                        v2.create(35.1, 5)
                    )
                },
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(3, -21.5),
                        v2.create(35.1, 5)
                    )
                },
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(-4, 20.5),
                        v2.create(3, 3)
                    )
                },
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(4, -14.5),
                        v2.create(3, 3)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-crossing-chamber-ceiling-01.img",
                    pos: v2.create(-3.5, 24),
                    scale: 1,
                    alpha: 1,
                    tint: 6250335
                },
                {
                    sprite: "map-bunker-crossing-chamber-ceiling-01.img",
                    pos: v2.create(3.5, -18),
                    scale: 1,
                    alpha: 1,
                    tint: 6250335,
                    rot: 2
                }
            ],
            vision: { dist: 7, width: 3 }
        },
        mapObjects: [
            {
                type: "concrete_wall_ext_6",
                pos: v2.create(38.5, 28.5),
                scale: 1,
                ori: 0
            },
            {
                type: "house_door_02",
                pos: v2.create(32, 30.5),
                scale: 1,
                ori: 2
            },
            {
                type: "decal_pipes_05",
                pos: v2.create(13, 28.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_48",
                pos: v2.create(15, 32),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_35",
                pos: v2.create(21.5, 25),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_6",
                pos: v2.create(2.5, 23.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_6",
                pos: v2.create(-0.5, 20.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_6",
                pos: v2.create(-7.5, 20.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_32",
                pos: v2.create(-22, 29),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_15",
                pos: v2.create(-39.5, 23),
                scale: 1,
                ori: 0
            },
            {
                type: "concrete_wall_ext_6",
                pos: v2.create(-36, 16),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_02",
                pos: v2.create(-38, 22.5),
                scale: 1,
                ori: 3
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(-32.5, 19.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_22",
                pos: v2.create(-20, 22),
                scale: 1,
                ori: 1
            },
            {
                type: "barrel_01",
                pos: v2.create(-4.5, 29),
                scale: 0.8,
                ori: 0
            },
            {
                type: "concrete_wall_ext_6",
                pos: v2.create(-38.5, -22.5),
                scale: 1,
                ori: 0
            },
            {
                type: "house_door_02",
                pos: v2.create(-32, -20.5),
                scale: 1,
                ori: 2
            },
            {
                type: "decal_pipes_05",
                pos: v2.create(-12, -22.5),
                scale: 1,
                ori: 2
            },
            {
                type: "metal_wall_ext_thicker_48",
                pos: v2.create(-15, -26),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_15",
                pos: v2.create(-31.5, -19),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_16",
                pos: v2.create(-12, -19),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_6",
                pos: v2.create(-2.5, -17.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_6",
                pos: v2.create(0.5, -14.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_6",
                pos: v2.create(7.5, -14.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_32",
                pos: v2.create(22, -23),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_15",
                pos: v2.create(39.5, -17),
                scale: 1,
                ori: 0
            },
            {
                type: "concrete_wall_ext_6",
                pos: v2.create(36, -10),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_02",
                pos: v2.create(38, -16.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(32.5, -13.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_22",
                pos: v2.create(20, -16),
                scale: 1,
                ori: 1
            },
            {
                type: "barrel_01",
                pos: v2.create(4.5, -23),
                scale: 0.8,
                ori: 0
            },
            {
                type: "crate_06",
                pos: v2.create(-12.5, -22.25),
                scale: 1,
                ori: 0
            },
            {
                type: "crate_06",
                pos: v2.create(-7, -22.75),
                scale: 1,
                ori: 0
            },
            {
                type: "bunker_crossing_compartment_01",
                pos: v2.create(1.5, 0),
                scale: 1,
                ori: 0
            }
        ]
    },
    bunker_crossing_bathroom: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 2,
        floor: {
            surfaces: [
                {
                    type: "water",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(0, 0)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "",
                    scale: 0.5,
                    alpha: 1,
                    tint: 6250335
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(3.75, 2)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-building-crossing-bathroom-ceiling.img",
                    scale: 0.5,
                    alpha: 1,
                    tint: 6250335
                }
            ]
        },
        mapObjects: [
            {
                type: randomObstacleType({ toilet_03: 5, toilet_04: 1 }),
                pos: v2.create(2, 0),
                scale: 1,
                ori: 3
            }
        ]
    },
    bunker_crossing_compartment_01: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 2,
        floor: {
            surfaces: [
                {
                    type: "water",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(-1, 3),
                            v2.create(17, 17.5)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-crossing-compartment-floor-02.img",
                    pos: v2.create(-22.5, -10),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-bunker-crossing-compartment-floor-01.img",
                    pos: v2.create(4, 3),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(4, 3),
                        v2.create(22, 14.5)
                    )
                },
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(-22, -11),
                        v2.create(4.5, 9)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-crossing-compartment-ceiling-01a.img",
                    pos: v2.create(-22.475, -11),
                    scale: 1,
                    alpha: 1,
                    tint: 6250335
                },
                {
                    sprite: "map-bunker-crossing-compartment-ceiling-01b.img",
                    pos: v2.create(3.975, 3),
                    scale: 1,
                    alpha: 1,
                    tint: 6250335
                }
            ],
            vision: { dist: 7, width: 3 }
        },
        occupiedEmitters: [
            {
                type: "bunker_bubbles_02",
                pos: v2.create(-1.5, 0),
                rot: 0,
                scale: 0.5,
                layer: 0
            }
        ],
        mapObjects: [
            {
                type: "metal_wall_ext_thicker_13",
                pos: v2.create(-14, 16),
                scale: 1,
                ori: 1
            },
            {
                type: "lab_door_01",
                pos: v2.create(-7.5, 17.5),
                scale: 1,
                ori: 3
            },
            {
                type: "metal_wall_ext_thicker_18",
                pos: v2.create(5.5, 16),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(16, 13.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_15",
                pos: v2.create(22, 8),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(28, 4.5),
                scale: 1,
                ori: 0
            },
            {
                type: "lab_door_01",
                pos: v2.create(17.5, 6.5),
                scale: 1,
                ori: 2
            },
            {
                type: "bunker_crossing_bathroom",
                pos: v2.create(22, 4.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_15",
                pos: v2.create(22, 1),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_11",
                pos: v2.create(16, -6),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_10",
                pos: v2.create(9.5, -10),
                scale: 1,
                ori: 1
            },
            {
                type: "lab_door_01",
                pos: v2.create(4.5, -11.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_19",
                pos: v2.create(-9, -10),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(-19.5, -8),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_10",
                pos: v2.create(-20, -14.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_17",
                pos: v2.create(-27, -11),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_11",
                pos: v2.create(-23, -1),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_14",
                pos: v2.create(-19, 7.5),
                scale: 1,
                ori: 0
            },
            {
                type: "control_panel_04",
                pos: v2.create(-15.25, 8.5),
                scale: 1,
                ori: 1
            },
            {
                type: "control_panel_03",
                pos: v2.create(-15.5, 12.75),
                scale: 1,
                ori: 1
            },
            {
                type: "control_panel_03",
                pos: v2.create(-15.5, 4.25),
                scale: 1,
                ori: 1
            },
            {
                type: "barrel_01",
                pos: v2.create(-5, 10.25),
                scale: 0.8,
                ori: 0
            },
            {
                type: "barrel_01",
                pos: v2.create(-3.25, 12.5),
                scale: 0.8,
                ori: 0
            },
            {
                type: "locker_01",
                pos: v2.create(1.15, 14.85),
                scale: 1,
                ori: 0
            },
            {
                type: "locker_03",
                pos: v2.create(4.5, 14.85),
                scale: 1,
                ori: 0
            },
            {
                type: "bookshelf_01",
                pos: v2.create(10.5, 13),
                scale: 1,
                ori: 0
            },
            {
                type: "bed_sm_01",
                pos: v2.create(10.5, 10),
                scale: 1,
                ori: 3
            },
            {
                type: "crate_01",
                pos: v2.create(-5, -6.25),
                scale: 0.8,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "barrel_01",
                pos: v2.create(-3, -2.5),
                scale: 0.9,
                ori: 0
            },
            {
                type: "vending_01",
                pos: v2.create(-1.25, -6.5),
                scale: 1,
                ori: 2
            },
            {
                type: "fire_ext_01",
                pos: v2.create(14, -0.5),
                scale: 1,
                ori: 2
            },
            {
                type: "refrigerator_01",
                pos: v2.create(8.25, -6.5),
                scale: 1,
                ori: 2
            },
            {
                type: "oven_01",
                pos: v2.create(12.25, -6.5),
                scale: 1,
                ori: 2
            },
            {
                type: "crossing_door_01",
                pos: v2.create(-17.85, -2.5),
                scale: 1,
                ori: 2
            },
            {
                type: "couch_01",
                pos: v2.create(-12, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "screen_01",
                pos: v2.create(-12, -7.5),
                scale: 1,
                ori: 0
            },
            {
                type: "crate_01",
                pos: v2.create(-23.5, -4.5),
                scale: 0.8,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "loot_tier_woodaxe",
                pos: v2.create(-23.5, -8.5),
                scale: 0.8,
                ori: 0
            },
            {
                type: "crate_01",
                pos: v2.create(-23.5, -14),
                scale: 0.8,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "crossing_door_01",
                pos: v2.create(-21.5, -20.15),
                scale: 1,
                ori: 1
            }
        ]
    },
    bunker_structure_05: {
        type: "structure",
        terrain: {
            grass: !0,
            beach: !1,
            bridge: { nearbyWidthMult: 1.2 },
            spawnPriority: 100
        },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(35.5, 28.5),
                v2.create(6, 6)
            ),
            collider.createAabbExtents(
                v2.create(-36, 19),
                v2.create(6, 6)
            ),
            collider.createAabbExtents(
                v2.create(36, -13),
                v2.create(6, 6)
            ),
            collider.createAabbExtents(
                v2.create(-35.5, -22.5),
                v2.create(6, 6)
            ),
            collider.createAabbExtents(
                v2.create(0, 0),
                v2.create(6, 6)
            )
        ],
        bridgeLandBounds: [
            collider.createAabbExtents(
                v2.create(35.5, 28.5),
                v2.create(5, 5)
            ),
            collider.createAabbExtents(
                v2.create(-36, 19),
                v2.create(5, 5)
            ),
            collider.createAabbExtents(
                v2.create(36, -13),
                v2.create(5, 5)
            ),
            collider.createAabbExtents(
                v2.create(-35.5, -22.5),
                v2.create(5, 5)
            )
        ],
        bridgeWaterBounds: [
            collider.createAabbExtents(
                v2.create(0, 0),
                v2.create(5, 5)
            )
        ],
        layers: [
            {
                type: "bunker_crossing_01",
                pos: v2.create(0, 0),
                ori: 0
            },
            {
                type: "bunker_crossing_sublevel_01",
                pos: v2.create(0, 0),
                ori: 0
            }
        ],
        stairs: [
            {
                collision: collider.createAabbExtents(
                    v2.create(35.6, 28.5),
                    v2.create(2.6, 2)
                ),
                downDir: v2.create(-1, 0)
            },
            {
                collision: collider.createAabbExtents(
                    v2.create(-36, 19),
                    v2.create(2, 2.6)
                ),
                downDir: v2.create(0, 1)
            },
            {
                collision: collider.createAabbExtents(
                    v2.create(36, -13),
                    v2.create(2, 2.6)
                ),
                downDir: v2.create(0, -1)
            },
            {
                collision: collider.createAabbExtents(
                    v2.create(-35.5, -22.5),
                    v2.create(2.6, 2)
                ),
                downDir: v2.create(1, 0)
            }
        ],
        mask: [
            collider.createAabbExtents(
                v2.create(-3.7, 27),
                v2.create(36.5, 5)
            ),
            collider.createAabbExtents(
                v2.create(3.7, -21),
                v2.create(36.5, 5)
            ),
            collider.createAabbExtents(
                v2.create(0, 3),
                v2.create(30, 18.95)
            )
        ]
    },
    bunker_hatchet_01: {
        type: "building",
        map: {
            display: !0,
            shapes: [
                {
                    collider: collider.createAabbExtents(
                        v2.create(0, 10),
                        v2.create(3.6, 5.8)
                    ),
                    color: 6707790
                }
            ]
        },
        terrain: { grass: !0, beach: !1 },
        zIdx: 0,
        floor: {
            surfaces: [
                {
                    type: "container",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 7.75),
                            v2.create(2, 3.25)
                        )
                    ]
                },
                {
                    type: "shack",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 13.5),
                            v2.create(3.75, 2.5)
                        ),
                        collider.createAabbExtents(
                            v2.create(5, 13.75),
                            v2.create(1.25, 2.25)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-storm-floor-02.img",
                    pos: v2.create(1.25, 10),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 10),
                        v2.create(3.5, 5.6)
                    ),
                    zoomOut: collider.createAabbExtents(
                        v2.create(0, 10),
                        v2.create(3.8, 5.9)
                    )
                }
            ],
            vision: {
                dist: 5,
                width: 2.75,
                linger: 0.5,
                fadeRate: 6
            },
            imgs: [
                {
                    sprite: "map-building-shack-ceiling-01.img",
                    pos: v2.create(-1, 10),
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215,
                    rot: 1
                }
            ],
            destroy: {
                wallCount: 2,
                particle: "shackBreak",
                particleCount: 25,
                residue: "none"
            }
        },
        mapObjects: [
            {
                type: "metal_wall_ext_short_6",
                pos: v2.create(0, 5.3),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_short_7",
                pos: v2.create(-2.5, 8.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_short_7",
                pos: v2.create(2.5, 8.5),
                scale: 1,
                ori: 0
            },
            {
                type: "shack_wall_bot",
                pos: v2.create(3.39, 8.6),
                scale: 1,
                ori: 1
            },
            {
                type: "shack_wall_side_left",
                pos: v2.create(0.3, 4.52),
                scale: 1,
                ori: 1
            },
            {
                type: "shack_wall_top",
                pos: v2.create(-3.39, 9.73),
                scale: 1,
                ori: 1
            },
            {
                type: "shack_wall_side_right",
                pos: v2.create(0, 15.58),
                scale: 1,
                ori: 1
            },
            {
                type: "crate_01",
                pos: v2.create(-2, 17.9),
                scale: 0.8,
                ori: 0,
                inheritOri: !1
            },
            {
                type: "barrel_01",
                pos: v2.create(1.45, 17.7),
                scale: 0.85,
                ori: 0
            },
            {
                type: "decal_vent_01",
                pos: v2.create(5, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "decal_vent_02",
                pos: v2.create(5, -8.5),
                scale: 1,
                ori: 0
            },
            {
                type: "tree_07",
                pos: v2.create(6.75, -4.5),
                scale: 1,
                ori: 0
            }
        ]
    },
    bunker_hatchet_sublevel_01: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 1,
        floor: {
            surfaces: [
                {
                    type: "bunker",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(-3, -4.4),
                            v2.create(13, 9)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-hatchet-chamber-floor-01a.img",
                    pos: v2.create(0, -4.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-bunker-hatchet-chamber-floor-01b.img",
                    pos: v2.create(0, 9.25),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-bunker-hatchet-chamber-floor-01c.img",
                    pos: v2.create(-15, -9.475),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(-3, -4.4),
                        v2.create(13, 9.25)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-hatchet-chamber-ceiling-01.img",
                    pos: v2.create(-3, -4.5),
                    scale: 1,
                    alpha: 1,
                    tint: 6250335
                }
            ],
            vision: { dist: 5, width: 3 }
        },
        mapObjects: [
            {
                type: "concrete_wall_ext_6",
                pos: v2.create(0, 11.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(-3.5, 8),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(3.5, 8),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_7",
                pos: v2.create(-8.5, 5.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_7",
                pos: v2.create(8.5, 5.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_20",
                pos: v2.create(10.5, -6),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_10",
                pos: v2.create(-10.5, -1),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_14",
                pos: v2.create(-16, -7.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_25",
                pos: v2.create(-3.5, -14.5),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_02",
                pos: v2.create(-2, 5),
                scale: 1,
                ori: 3
            },
            {
                type: "barrel_01",
                pos: v2.create(-5, 0.5),
                scale: 0.9,
                ori: 0
            },
            {
                type: "crate_01",
                pos: v2.create(6.75, -10.75),
                scale: 0.85,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "crate_06",
                pos: v2.create(0, -11),
                scale: 1,
                ori: 0
            },
            {
                type: "crate_06",
                pos: v2.create(7, -4),
                scale: 1,
                ori: 1
            },
            {
                type: "bunker_hatchet_compartment_01",
                pos: v2.create(-32, -1.5),
                scale: 1,
                ori: 0
            },
            {
                type: "bunker_hatchet_compartment_02",
                pos: v2.create(-63.5, -4),
                scale: 1,
                ori: 0
            },
            {
                type: "bunker_hatchet_compartment_03",
                pos: v2.create(-55, 20.5),
                scale: 1,
                ori: 0
            }
        ]
    },
    bunker_hatchet_compartment_01: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 2,
        floor: {
            surfaces: [
                {
                    type: "tile",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(16, 13)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-hatchet-compartment-floor-01.img",
                    pos: v2.create(0, 0.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(16, 12.5)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-hatchet-compartment-ceiling-01.img",
                    pos: v2.create(0, 0),
                    scale: 1,
                    alpha: 1,
                    tint: 6250335
                }
            ]
        },
        mapObjects: [
            {
                type: "metal_wall_ext_thicker_13",
                pos: v2.create(10.5, 2),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_11",
                pos: v2.create(3.5, 7),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_18",
                pos: v2.create(-3.5, 14.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_21",
                pos: v2.create(-10.5, 6),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_32",
                pos: v2.create(0, -13),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_14",
                pos: v2.create(-16, -6),
                scale: 1,
                ori: 1
            },
            {
                type: "lab_door_01",
                pos: v2.create(16, -7.5),
                scale: 1,
                ori: 2
            },
            {
                type: "lab_door_01",
                pos: v2.create(-16, -7.5),
                scale: 1,
                ori: 2
            },
            {
                type: "lab_door_01",
                pos: v2.create(-9, 12.5),
                scale: 1,
                ori: 3
            },
            {
                type: "metal_wall_ext_10",
                pos: v2.create(8.65, -0.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_10",
                pos: v2.create(3, 5.15),
                scale: 1,
                ori: 1
            },
            {
                type: "locker_01",
                pos: v2.create(0.5, 5),
                scale: 1,
                ori: 0
            },
            {
                type: "locker_01",
                pos: v2.create(5.5, 5),
                scale: 1,
                ori: 0
            },
            {
                type: "locker_01",
                pos: v2.create(8.5, 2),
                scale: 1,
                ori: 3
            },
            {
                type: "locker_01",
                pos: v2.create(8.5, -3),
                scale: 1,
                ori: 3
            },
            {
                type: "barrel_01",
                pos: v2.create(1.5, -0.5),
                scale: 0.9,
                ori: 0
            },
            {
                type: "fire_ext_01",
                pos: v2.create(0.5, -11.25),
                scale: 0.9,
                ori: 1
            },
            {
                type: "couch_01",
                pos: v2.create(-7.5, -2.5),
                scale: 1,
                ori: 1
            },
            {
                type: "crate_01",
                pos: v2.create(-7, 8.5),
                scale: 0.85,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            }
        ]
    },
    bunker_hatchet_compartment_02: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 2,
        floor: {
            surfaces: [
                {
                    type: "tile",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(16, 15)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-hatchet-compartment-floor-02a.img",
                    pos: v2.create(4, -8.25),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-bunker-hatchet-compartment-floor-02b.img",
                    pos: v2.create(0.75, 6),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-bunker-hatchet-compartment-floor-02c.img",
                    pos: v2.create(-14, 0.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-bunker-hatchet-compartment-floor-02d.img",
                    pos: v2.create(-6.27, 14.25),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(-0.5, 0),
                        v2.create(16, 15)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-hatchet-compartment-ceiling-02.img",
                    pos: v2.create(-0.5, -0.5),
                    scale: 1,
                    alpha: 1,
                    tint: 6250335
                }
            ]
        },
        mapObjects: [
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(11.5, -10.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_13",
                pos: v2.create(10, 4.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_11",
                pos: v2.create(3, 9.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(6, -13),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_12",
                pos: v2.create(-1.5, -16.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_7",
                pos: v2.create(-9, -13.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_11",
                pos: v2.create(-13, -8.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_15",
                pos: v2.create(-17, 0.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_6",
                pos: v2.create(-12.5, 6.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_25",
                pos: v2.create(-11, 20.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_14",
                pos: v2.create(-4, 15),
                scale: 1,
                ori: 0
            },
            {
                type: "lab_door_01",
                pos: v2.create(-5.5, 15),
                scale: 1,
                ori: 1
            },
            {
                type: "crate_01",
                pos: v2.create(-1.25, 0.5),
                scale: 0.85,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "crate_01",
                pos: v2.create(2.75, -1.75),
                scale: 0.85,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "crate_04",
                pos: v2.create(3, 2.5),
                scale: 0.85,
                ori: 0
            },
            {
                type: "crate_01",
                pos: v2.create(-7.5, 11),
                scale: 0.85,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "control_panel_06",
                pos: v2.create(2, 6.25),
                scale: 1,
                ori: 0
            },
            {
                type: "control_panel_06",
                pos: v2.create(6.75, 1.5),
                scale: 1,
                ori: 3
            },
            {
                type: "loot_tier_hatchet_melee",
                pos: v2.create(6.75, 6.25),
                scale: 1,
                ori: 0
            },
            {
                type: "glass_wall_12_2",
                pos: v2.create(-10.5, -1),
                scale: 1,
                ori: 0
            },
            {
                type: "glass_wall_12_2",
                pos: v2.create(-1.5, -10),
                scale: 1,
                ori: 1
            },
            {
                type: "loot_tier_imperial_outfit",
                pos: v2.create(-13.5, -4.5),
                scale: 1,
                ori: 0
            },
            {
                type: "loot_tier_pineapple_outfit",
                pos: v2.create(-13.5, -1),
                scale: 1,
                ori: 0
            },
            {
                type: "loot_tier_tarkhany_outfit",
                pos: v2.create(-13.5, 2.5),
                scale: 1,
                ori: 0
            },
            {
                type: "loot_tier_spetsnaz_outfit",
                pos: v2.create(-5, -13),
                scale: 1,
                ori: 0
            },
            {
                type: "loot_tier_lumber_outfit",
                pos: v2.create(-1.5, -13),
                scale: 1,
                ori: 0
            },
            {
                type: "loot_tier_verde_outfit",
                pos: v2.create(2, -13),
                scale: 1,
                ori: 0
            }
        ]
    },
    bunker_hatchet_compartment_03: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 2,
        floor: {
            surfaces: [
                {
                    type: "tile",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(19, 10)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-hatchet-compartment-floor-03a.img",
                    pos: v2.create(-14.5, -8.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-bunker-hatchet-compartment-floor-03b.img",
                    pos: v2.create(-9, 3),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-bunker-hatchet-compartment-floor-03c.img",
                    pos: v2.create(5.5, -0.25),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-bunker-hatchet-compartment-floor-03d.img",
                    pos: v2.create(14.5, -3.75),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(19, 9.5)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-hatchet-compartment-ceiling-03.img",
                    pos: v2.create(0, 0),
                    scale: 1,
                    alpha: 1,
                    tint: 6250335
                }
            ]
        },
        mapObjects: [
            {
                type: "metal_wall_ext_thicker_25",
                pos: v2.create(1.5, -4),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_18",
                pos: v2.create(12, 3),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_10",
                pos: v2.create(1.5, 6.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_21",
                pos: v2.create(-10.5, 10),
                scale: 1,
                ori: 1
            },
            {
                type: "crate_01",
                pos: v2.create(-16, -5),
                scale: 0.85,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "crate_01",
                pos: v2.create(3, -0.5),
                scale: 0.85,
                ori: 0,
                ignoreMapSpawnReplacement: !0
            },
            {
                type: "crate_06",
                pos: v2.create(-11.75, -1.05),
                scale: 0.85,
                ori: 0
            },
            {
                type: "crate_06",
                pos: v2.create(-7, -1.05),
                scale: 0.85,
                ori: 0
            },
            {
                type: "case_03",
                pos: v2.create(-2.5, 6.5),
                scale: 1,
                ori: 0
            },
            {
                type: "barrel_01",
                pos: v2.create(-7, 6.75),
                scale: 0.9,
                ori: 0
            },
            {
                type: "barrel_01",
                pos: v2.create(-11, 5.5),
                scale: 0.9,
                ori: 0
            }
        ]
    },
    bunker_structure_06: {
        type: "structure",
        terrain: { grass: !0, beach: !1 },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(1, 6),
                v2.create(7, 13.5)
            )
        ],
        layers: [
            {
                type: "bunker_hatchet_01",
                pos: v2.create(0, 0),
                ori: 0
            },
            {
                type: "bunker_hatchet_sublevel_01",
                pos: v2.create(0, 0),
                ori: 0
            }
        ],
        stairs: [
            {
                collision: collider.createAabbExtents(
                    v2.create(0, 8.4),
                    v2.create(2, 2.6)
                ),
                downDir: v2.create(0, -1)
            }
        ],
        mask: [
            collider.createAabbExtents(
                v2.create(-3, -3.7),
                v2.create(13, 9.5)
            ),
            collider.createAabbExtents(
                v2.create(-48.025, 6),
                v2.create(32, 24.95)
            )
        ]
    },
    bunker_eye_01: {
        type: "building",
        map: {
            display: !0,
            shapes: [
                {
                    collider: collider.createAabbExtents(
                        v2.create(0, 7.5),
                        v2.create(2, 3.25)
                    ),
                    color: 6946816
                }
            ]
        },
        terrain: { grass: !0, beach: !1 },
        zIdx: 1,
        floor: {
            surfaces: [
                {
                    type: "container",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 7.75),
                            v2.create(2, 3.25)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-generic-floor-01.img",
                    pos: v2.create(0, 7.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 8.25),
                        v2.create(2, 3.25)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-generic-ceiling-01.img",
                    pos: v2.create(0, 7.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 0
                }
            ]
        },
        puzzle: {
            name: "bunker_eye_01",
            completeUseType: "eye_door_01",
            completeOffDelay: 1,
            completeUseDelay: 2,
            errorResetDelay: 1,
            pieceResetDelay: 2,
            sound: { fail: "door_error_01", complete: "" }
        },
        mapObjects: [
            {
                type: "metal_wall_ext_6",
                pos: v2.create(0, 5.3),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_7",
                pos: v2.create(-2.5, 8.5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_7",
                pos: v2.create(2.5, 8.5),
                scale: 1,
                ori: 0
            },
            {
                type: "bush_01",
                pos: v2.create(5, 23),
                scale: 1.2,
                ori: 0
            }
        ]
    },
    vault_door_eye: z({
        material: "metal",
        hinge: v2.create(1, 3.5),
        extents: v2.create(1, 3.5),
        img: { sprite: "map-door-02.img" },
        door: {
            interactionRad: 1.5,
            openSpeed: 10,
            openOneWay: -1,
            openDelay: 0.1,
            openOnce: !0,
            canUse: !1,
            spriteAnchor: v2.create(0.2, 1),
            sound: {
                open: "none",
                close: "none",
                change: "none"
            }
        }
    }),
    metal_wall_column_4x8: X({
        material: "metal",
        extents: v2.create(2, 4)
    }),
    stone_wall_int_4: X({
        material: "stone",
        extents: v2.create(0.6, 2),
        img: wallImg("map-wall-04-stone.img", 16777215)
    }),
    bunker_eye_sublevel_01: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 0,
        floor: {
            surfaces: [
                {
                    type: "bunker",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, -12),
                            v2.create(14, 17)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-eye-chamber-floor-01a.img",
                    pos: v2.create(0, -8.5),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-bunker-eye-chamber-floor-01b.img",
                    pos: v2.create(13, -23),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, -12),
                        v2.create(14, 17)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-eye-chamber-ceiling-01.img",
                    pos: v2.create(0, -12),
                    scale: 1,
                    alpha: 1,
                    tint: 6250335
                }
            ],
            vision: { dist: 5, width: 3 }
        },
        puzzle: {
            name: "bunker_eye_02",
            completeUseType: "vault_door_eye",
            completeOffDelay: 1,
            completeUseDelay: 5.25,
            errorResetDelay: 1,
            pieceResetDelay: 10,
            sound: {
                fail: "door_error_01",
                complete: "vault_change_02"
            }
        },
        mapObjects: [
            {
                type: "concrete_wall_ext_6",
                pos: v2.create(0, 11.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(-3.5, 8),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(3.5, 8),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(-7, 5.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(7, 5.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_34",
                pos: v2.create(-10.5, -10),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(13, -26.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_4",
                pos: v2.create(15.5, -23),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(13, -19.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_24",
                pos: v2.create(10.5, -5),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_column_4x8",
                pos: v2.create(-7.5, -29),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_column_4x8",
                pos: v2.create(7.5, -29),
                scale: 1,
                ori: 1
            },
            {
                type: "house_door_02",
                pos: v2.create(-2, 5),
                scale: 1,
                ori: 3
            },
            {
                type: "stone_04",
                pos: v2.create(12, -23),
                scale: 1,
                ori: 2
            },
            {
                type: "stone_wall_int_4",
                pos: v2.create(9.4, -23),
                scale: 1,
                ori: 0
            },
            {
                type: "recorder_01",
                pos: v2.create(7.5, 2),
                scale: 1,
                ori: 2
            },
            {
                type: "control_panel_02b",
                pos: v2.create(-7, 1),
                scale: 1,
                ori: 1,
                puzzlePiece: "swine"
            },
            {
                type: "control_panel_02b",
                pos: v2.create(-7, -4),
                scale: 1,
                ori: 1,
                puzzlePiece: "egg"
            },
            {
                type: "control_panel_02b",
                pos: v2.create(-7, -9),
                scale: 1,
                ori: 1,
                puzzlePiece: "storm"
            },
            {
                type: "control_panel_02b",
                pos: v2.create(-7, -14),
                scale: 1,
                ori: 1,
                puzzlePiece: "caduceus"
            },
            {
                type: "control_panel_02b",
                pos: v2.create(-7, -19),
                scale: 1,
                ori: 1,
                puzzlePiece: "crossing"
            },
            {
                type: "control_panel_02b",
                pos: v2.create(-7, -24),
                scale: 1,
                ori: 1,
                puzzlePiece: "conch"
            },
            {
                type: "control_panel_02b",
                pos: v2.create(7, -4),
                scale: 1,
                ori: 3,
                puzzlePiece: "cloud"
            },
            {
                type: "control_panel_02b",
                pos: v2.create(7, -9),
                scale: 1,
                ori: 3,
                puzzlePiece: "hydra"
            },
            {
                type: "control_panel_02b",
                pos: v2.create(7, -14),
                scale: 1,
                ori: 3,
                puzzlePiece: "hatchet"
            },
            {
                type: "control_panel_02b",
                pos: v2.create(7, -19),
                scale: 1,
                ori: 3,
                puzzlePiece: "harpsichord"
            },
            {
                type: "candle_lit_02",
                pos: v2.create(0, -1.5),
                scale: 0.75,
                ori: 0
            },
            {
                type: "candle_lit_02",
                pos: v2.create(0, -11.5),
                scale: 0.75,
                ori: 0
            },
            {
                type: "candle_lit_02",
                pos: v2.create(0, -21.5),
                scale: 0.75,
                ori: 0
            },
            {
                type: "vault_door_eye",
                pos: v2.create(3.5, -30),
                scale: 1,
                ori: 1
            },
            {
                type: "bunker_eye_compartment_01",
                pos: v2.create(0, -39),
                scale: 1,
                ori: 0
            }
        ]
    },
    bunker_eye_compartment_01: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 2,
        floor: {
            surfaces: [
                {
                    type: "tile",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(10, 10)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-eye-compartment-floor-01.img",
                    pos: v2.create(0, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(10, 10)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-eye-compartment-ceiling-01.img",
                    pos: v2.create(0, 0),
                    scale: 1,
                    alpha: 1,
                    tint: 6250335
                }
            ]
        },
        mapObjects: [
            {
                type: "metal_wall_ext_thicker_20",
                pos: v2.create(10.5, -2),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_20",
                pos: v2.create(-10.5, -2),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_18",
                pos: v2.create(0, -10.5),
                scale: 1,
                ori: 1
            },
            {
                type: "loot_tier_eye_02",
                pos: v2.create(0, -3.5),
                scale: 1,
                ori: 0
            },
            {
                type: "recorder_02",
                pos: v2.create(-7, -7),
                scale: 1,
                ori: 2
            }
        ]
    },
    bunker_structure_07: {
        type: "structure",
        terrain: { grass: !0, beach: !1 },
        ori: 2,
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(-1, 8),
                v2.create(7, 6)
            ),
            collider.createAabbExtents(
                v2.create(-40, -70),
                v2.create(2, 2)
            ),
            collider.createAabbExtents(
                v2.create(40, -70),
                v2.create(2, 2)
            ),
            collider.createAabbExtents(
                v2.create(0, -30),
                v2.create(2, 2)
            ),
            collider.createAabbExtents(
                v2.create(5, 23),
                v2.create(2, 2)
            )
        ],
        layers: [
            {
                type: "bunker_eye_01",
                pos: v2.create(0, 0),
                ori: 0
            },
            {
                type: "bunker_eye_sublevel_01",
                pos: v2.create(0, 0),
                ori: 0
            }
        ],
        stairs: [
            {
                collision: collider.createAabbExtents(
                    v2.create(0, 8.4),
                    v2.create(2, 2.6)
                ),
                downDir: v2.create(0, -1)
            }
        ],
        mask: [
            collider.createAabbExtents(
                v2.create(0, -22.2),
                v2.create(13.5, 28)
            )
        ]
    },
    bunker_twins_stairs_01: p({
        map: {
            display: !0,
            shapes: [
                {
                    collider: collider.createAabbExtents(
                        v2.create(0, 1),
                        v2.create(2, 3.25)
                    ),
                    color: 10244368
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 0.75),
                        v2.create(2, 3.25)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-twins-ceiling-01.img",
                    pos: v2.create(0, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215,
                    rot: 0
                }
            ]
        }
    }),
    bunker_twins_01: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 2,
        floor: {
            surfaces: [],
            imgs: [
                {
                    sprite: "map-bunker-vent-02.img",
                    pos: v2.create(0, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [],
            vision: {
                dist: 5,
                width: 2.75,
                linger: 0.5,
                fadeRate: 6
            },
            imgs: []
        },
        mapObjects: [
            {
                type: "bunker_twins_stairs_01",
                pos: v2.create(5, 13.5),
                scale: 1,
                ori: 0
            },
            {
                type: "bunker_twins_stairs_01",
                pos: v2.create(-5, -13.5),
                scale: 1,
                ori: 2
            },
            {
                type: "bunker_twins_stairs_01",
                pos: v2.create(-18.5, 0),
                scale: 1,
                ori: 1
            },
            {
                type: "bunker_twins_stairs_01",
                pos: v2.create(18.5, 0),
                scale: 1,
                ori: 3
            }
        ]
    },
    cobalt_wall_int_4: X({
        material: "cobalt",
        extents: v2.create(0.6, 2),
        img: wallImg("map-wall-04-cobalt.img", 16777215)
    }),
    bunker_twins_sublevel_01: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 0,
        floor: {
            surfaces: [
                {
                    type: "tile",
                    data: { isBright: !0 },
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(16, 11)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-twins-chamber-floor-01.img",
                    pos: v2.create(0, 0),
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: {
            zoomRegions: [
                {
                    zoomIn: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(15.5, 10.5)
                    )
                }
            ],
            imgs: [
                {
                    sprite: "map-bunker-twins-chamber-ceiling-01.img",
                    scale: 1,
                    alpha: 1,
                    tint: 6250335
                }
            ]
        },
        mapObjects: [
            {
                type: "concrete_wall_ext_6",
                pos: v2.create(5, 17.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(1.5, 14),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(8.5, 14),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_15",
                pos: v2.create(-7.5, 11.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_5",
                pos: v2.create(12.5, 11.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(16.5, 9),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(-16.5, 9),
                scale: 1,
                ori: 0
            },
            {
                type: "concrete_wall_ext_6",
                pos: v2.create(-5, -17.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(-1.5, -14),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(-8.5, -14),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_15",
                pos: v2.create(7.5, -11.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_5",
                pos: v2.create(-12.5, -11.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(-16.5, -9),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(16.5, -9),
                scale: 1,
                ori: 0
            },
            {
                type: "concrete_wall_ext_6",
                pos: v2.create(22.5, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(19, 3.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(19, -3.5),
                scale: 1,
                ori: 1
            },
            {
                type: "concrete_wall_ext_6",
                pos: v2.create(-22.5, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(-19, 3.5),
                scale: 1,
                ori: 1
            },
            {
                type: "metal_wall_ext_thicker_8",
                pos: v2.create(-19, -3.5),
                scale: 1,
                ori: 1
            },
            {
                type: "lab_door_locked_01",
                pos: v2.create(3, 10.5),
                scale: 1,
                ori: 3
            },
            {
                type: "lab_door_locked_01",
                pos: v2.create(-3, -10.5),
                scale: 1,
                ori: 1
            },
            {
                type: "lab_door_locked_01",
                pos: v2.create(15.5, 2),
                scale: 1,
                ori: 2
            },
            {
                type: "lab_door_locked_01",
                pos: v2.create(-15.5, -2),
                scale: 1,
                ori: 0
            },
            {
                type: "class_shell_03",
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "vat_01",
                pos: v2.create(-6.75, 6.75),
                scale: 1,
                ori: 3
            },
            {
                type: "vat_01",
                pos: v2.create(-12.175, 6.75),
                scale: 1,
                ori: 3
            },
            {
                type: "vat_01",
                pos: v2.create(6.75, -6.75),
                scale: 1,
                ori: 1
            },
            {
                type: "vat_01",
                pos: v2.create(12.175, -6.75),
                scale: 1,
                ori: 1
            },
            {
                type: "control_panel_03",
                pos: v2.create(2.5, -8.25),
                scale: 1,
                ori: 2
            },
            {
                type: "cobalt_wall_int_4",
                pos: v2.create(-12.5, -10.385),
                scale: 1,
                ori: 3
            },
            {
                type: "barrel_01",
                pos: v2.create(-10, -8),
                scale: 0.9,
                ori: 0
            },
            {
                type: "barrel_01",
                pos: v2.create(-13, -6),
                scale: 0.9,
                ori: 0
            },
            {
                type: "recorder_14",
                pos: v2.create(-13.5, -8.75),
                scale: 1,
                ori: 1
            },
            {
                type: "cobalt_wall_int_4",
                pos: v2.create(12.5, 10.385),
                scale: 1,
                ori: 1
            },
            {
                type: "barrel_01",
                pos: v2.create(10, 8),
                scale: 0.9,
                ori: 0
            },
            {
                type: "barrel_01",
                pos: v2.create(13, 6),
                scale: 0.9,
                ori: 0
            },
            {
                type: "bunker_twins_compartment_01",
                pos: v2.create(-19.5, -18.5),
                scale: 1,
                ori: 0
            },
            {
                type: "bunker_twins_compartment_01",
                pos: v2.create(19.5, 18.5),
                scale: 1,
                ori: 2
            }
        ]
    },
    bunker_twins_compartment_01: {
        type: "building",
        map: { display: !1, color: 6707790, scale: 1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 2,
        floor: {
            surfaces: [
                {
                    type: "bunker",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(0, 0)
                        )
                    ]
                }
            ],
            imgs: []
        },
        ceiling: {
            zoomRegions: [],
            imgs: [
                {
                    sprite: "map-bunker-hydra-compartment-ceiling-03.img",
                    pos: v2.create(0, 0),
                    scale: 1,
                    alpha: 1,
                    tint: 6250335,
                    rot: 0,
                    mirrorX: !0
                }
            ]
        },
        mapObjects: []
    },
    bunker_structure_09: {
        type: "structure",
        terrain: { grass: !0, beach: !1 },
        ori: 0,
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(5, 15.4),
                v2.create(3.5, 6)
            ),
            collider.createAabbExtents(
                v2.create(-5, -15.4),
                v2.create(3.5, 6)
            ),
            collider.createAabbExtents(
                v2.create(20.5, 0),
                v2.create(6, 3.5)
            ),
            collider.createAabbExtents(
                v2.create(-20.5, 0),
                v2.create(6, 3.5)
            ),
            collider.createAabbExtents(
                v2.create(0, 0),
                v2.create(2.5, 2.5)
            )
        ],
        layers: [
            {
                type: "bunker_twins_01",
                pos: v2.create(0, 0),
                ori: 0
            },
            {
                type: "bunker_twins_sublevel_01",
                pos: v2.create(0, 0),
                ori: 0
            }
        ],
        stairs: [
            {
                collision: collider.createAabbExtents(
                    v2.create(5, 14.4),
                    v2.create(2, 2.6)
                ),
                downDir: v2.create(0, -1)
            },
            {
                collision: collider.createAabbExtents(
                    v2.create(-5, -14.4),
                    v2.create(2, 2.6)
                ),
                downDir: v2.create(0, 1)
            },
            {
                collision: collider.createAabbExtents(
                    v2.create(19.5, 0),
                    v2.create(2.6, 2)
                ),
                downDir: v2.create(-1, 0)
            },
            {
                collision: collider.createAabbExtents(
                    v2.create(-19.5, 0),
                    v2.create(2.6, 2)
                ),
                downDir: v2.create(1, 0)
            }
        ],
        mask: [
            collider.createAabbExtents(
                v2.create(0, 0),
                v2.create(16.75, 11.75)
            )
        ]
    },
    bridge_lg_under_column: X({
        material: "concrete",
        extents: v2.create(2.5, 10)
    }),
    concrete_wall_column_5x4: X({
        material: "concrete",
        extents: v2.create(2.5, 2)
    }),
    bridge_rail_3: Se({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(0.4, 2)
        ),
        img: {
            sprite: "",
            scale: 0.5,
            alpha: 1,
            tint: 4456448,
            zIdx: 10
        }
    }),
    bridge_rail_12: Se({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(0.4, 6.5)
        ),
        img: {
            sprite: "",
            scale: 0.5,
            alpha: 1,
            tint: 4456448,
            zIdx: 10
        }
    }),
    bridge_lg_01: ee({}),
    bridge_lg_01x: ee({
        ceiling: {
            imgs: [
                {
                    sprite: "map-building-bridge-lg-ceiling.img",
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                },
                {
                    sprite: "map-snow-03.img",
                    pos: v2.create(-10, -4),
                    scale: 0.4,
                    alpha: 1,
                    tint: 16777215,
                    rot: 0
                },
                {
                    sprite: "map-snow-07.img",
                    pos: v2.create(8, 4),
                    scale: 0.4,
                    alpha: 1,
                    tint: 16777215,
                    rot: 0
                },
                {
                    sprite: "map-snow-06.img",
                    pos: v2.create(15, -5.25),
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215,
                    rot: 1
                },
                {
                    sprite: "map-snow-06.img",
                    pos: v2.create(-15, 5.25),
                    scale: 0.667,
                    alpha: 1,
                    tint: 16777215,
                    rot: 3
                }
            ]
        }
    }),
    bridge_lg_under_01: {
        type: "building",
        map: { display: !1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 0,
        floor: { surfaces: [], imgs: [] },
        ceiling: {
            zoomRegions: [],
            vision: {
                dist: 5.5,
                width: 2.75,
                linger: 0.5,
                fadeRate: 6
            },
            imgs: []
        },
        mapObjects: [
            {
                type: "bridge_lg_under_column",
                pos: v2.create(-14, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "bridge_lg_under_column",
                pos: v2.create(14, 0),
                scale: 1,
                ori: 0
            }
        ]
    },
    bridge_lg_structure_01: {
        type: "structure",
        terrain: { bridge: { nearbyWidthMult: 5 } },
        layers: [
            {
                type: "bridge_lg_01",
                pos: v2.create(0, 0),
                ori: 0
            },
            {
                type: "bridge_lg_under_01",
                pos: v2.create(0, 0),
                ori: 0,
                underground: !1
            }
        ],
        bridgeLandBounds: [
            collider.createAabbExtents(
                v2.create(-34, 0),
                v2.create(6, 9)
            ),
            collider.createAabbExtents(
                v2.create(34, 0),
                v2.create(6, 9)
            )
        ],
        stairs: [
            {
                collision: collider.createAabbExtents(
                    v2.create(0, -9.5),
                    v2.create(11.5, 1.5)
                ),
                downDir: v2.create(0, 1),
                lootOnly: !0
            },
            {
                collision: collider.createAabbExtents(
                    v2.create(0, 9.5),
                    v2.create(11.5, 1.5)
                ),
                downDir: v2.create(0, -1),
                lootOnly: !0
            }
        ],
        mask: [
            collider.createAabbExtents(
                v2.create(0, 0),
                v2.create(12, 8)
            )
        ]
    },
    bridge_xlg_under_column: X({
        material: "concrete",
        extents: v2.create(2.5, 14)
    }),
    concrete_wall_column_9x4: X({
        material: "concrete",
        extents: v2.create(4.5, 2)
    }),
    bridge_rail_20: Se({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(0.4, 10)
        ),
        img: {
            sprite: "",
            scale: 0.5,
            alpha: 1,
            tint: 4456448,
            zIdx: 10
        }
    }),
    bridge_xlg_01: (function(e) {
        const t = {
            type: "building",
            map: {
                display: !0,
                shapes: [
                    {
                        collider: collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(38.5, 12)
                        ),
                        color: 2894124
                    },
                    {
                        collider: collider.createAabbExtents(
                            v2.create(-16, -13),
                            v2.create(3, 1.5)
                        ),
                        color: 3618615
                    },
                    {
                        collider: collider.createAabbExtents(
                            v2.create(16, -13),
                            v2.create(3, 1.5)
                        ),
                        color: 3618615
                    },
                    {
                        collider: collider.createAabbExtents(
                            v2.create(-16, 13),
                            v2.create(3, 1.5)
                        ),
                        color: 3618615
                    },
                    {
                        collider: collider.createAabbExtents(
                            v2.create(16, 13),
                            v2.create(3, 1.5)
                        ),
                        color: 3618615
                    }
                ]
            },
            terrain: { grass: !0, beach: !1 },
            zIdx: 1,
            floor: {
                surfaces: [
                    {
                        type: "asphalt",
                        collision: [
                            collider.createAabbExtents(
                                v2.create(0, 0),
                                v2.create(38.5, 12)
                            )
                        ]
                    }
                ],
                imgs: [
                    {
                        sprite: "map-building-bridge-xlg-floor.img",
                        scale: 0.5,
                        alpha: 1,
                        tint: 16777215
                    }
                ]
            },
            ceiling: { zoomRegions: [], imgs: [] },
            mapObjects: [
                {
                    type: "bridge_rail_20",
                    pos: v2.create(-26, 11.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "bridge_rail_20",
                    pos: v2.create(-26, -11.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "bridge_rail_20",
                    pos: v2.create(26, 11.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "bridge_rail_20",
                    pos: v2.create(26, -11.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_column_9x4",
                    pos: v2.create(-16, -13),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_column_9x4",
                    pos: v2.create(-16, 13),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_column_9x4",
                    pos: v2.create(16, -13),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_column_9x4",
                    pos: v2.create(16, 13),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "concrete_wall_ext_5",
                    pos: v2.create(-9, 11.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_5",
                    pos: v2.create(-9, -11.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_5",
                    pos: v2.create(9, 11.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_5",
                    pos: v2.create(9, -11.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "bridge_rail_3",
                    pos: v2.create(-5, 11.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "bridge_rail_3",
                    pos: v2.create(-5, -11.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "bridge_rail_3",
                    pos: v2.create(5, 11.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "bridge_rail_3",
                    pos: v2.create(5, -11.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_7",
                    pos: v2.create(0, 11.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "concrete_wall_ext_7",
                    pos: v2.create(0, -11.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "loot_tier_1",
                    pos: v2.create(-25, 3),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "loot_tier_1",
                    pos: v2.create(25, 3),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "sandbags_01",
                    pos: v2.create(-14, 6.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "sandbags_01",
                    pos: v2.create(-20, -8),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "barrel_01",
                    pos: v2.create(-14, -8),
                    scale: 0.9,
                    ori: 0
                },
                {
                    type: "crate_01",
                    pos: v2.create(0, 2.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "crate_01",
                    pos: v2.create(0, -2.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "crate_04",
                    pos: v2.create(0, 7.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "crate_04",
                    pos: v2.create(0, -7.5),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "crate_01",
                    pos: v2.create(-5, 0),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "crate_01",
                    pos: v2.create(5, 0),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "crate_01",
                    pos: v2.create(-27, -8),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "crate_01",
                    pos: v2.create(27, -8),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "sandbags_01",
                    pos: v2.create(14, 6.5),
                    scale: 1,
                    ori: 1
                },
                {
                    type: "sandbags_01",
                    pos: v2.create(20, -8),
                    scale: 1,
                    ori: 0
                },
                {
                    type: "barrel_01",
                    pos: v2.create(14, -8),
                    scale: 0.9,
                    ori: 0
                }
            ]
        };
        return util.mergeDeep(t, e || {});
    })({}),
    bridge_xlg_under_01: {
        type: "building",
        map: { display: !1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 0,
        floor: { surfaces: [], imgs: [] },
        ceiling: {
            zoomRegions: [],
            vision: {
                dist: 5.5,
                width: 2.75,
                linger: 0.5,
                fadeRate: 6
            },
            imgs: []
        },
        mapObjects: [
            {
                type: "bridge_xlg_under_column",
                pos: v2.create(-14, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "bridge_xlg_under_column",
                pos: v2.create(14, 0),
                scale: 1,
                ori: 0
            }
        ]
    },
    bridge_xlg_structure_01: {
        type: "structure",
        terrain: { bridge: { nearbyWidthMult: 5 } },
        layers: [
            {
                type: "bridge_xlg_01",
                pos: v2.create(0, 0),
                ori: 0
            },
            {
                type: "bridge_xlg_under_01",
                pos: v2.create(0, 0),
                ori: 0,
                underground: !1
            }
        ],
        bridgeLandBounds: [
            collider.createAabbExtents(
                v2.create(-41, 0),
                v2.create(5, 10)
            ),
            collider.createAabbExtents(
                v2.create(41, 0),
                v2.create(5, 10)
            )
        ],
        bridgeWaterBounds: [
            collider.createAabbExtents(
                v2.create(0, 0),
                v2.create(5, 5)
            )
        ],
        stairs: [
            {
                collision: collider.createAabbExtents(
                    v2.create(0, -13.5),
                    v2.create(11.5, 1.5)
                ),
                downDir: v2.create(0, 1),
                lootOnly: !0
            },
            {
                collision: collider.createAabbExtents(
                    v2.create(0, 13.5),
                    v2.create(11.5, 1.5)
                ),
                downDir: v2.create(0, -1),
                lootOnly: !0
            }
        ],
        mask: [
            collider.createAabbExtents(
                v2.create(0, 0),
                v2.create(12, 12)
            )
        ]
    },
    bridge_rail_28: Se({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(0.4, 14)
        ),
        img: {
            sprite: "",
            scale: 0.5,
            alpha: 1,
            tint: 4456448,
            zIdx: 10
        }
    }),
    brick_wall_ext_3_0_low: Se({
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(0.5, 1.5)
        ),
        img: {
            sprite: "",
            scale: 0.5,
            alpha: 1,
            tint: 4456448,
            zIdx: 10
        }
    }),
    brick_wall_ext_11_5: X({
        material: "brick",
        extents: v2.create(0.5, 5.75)
    }),
    bridge_md_01: {
        type: "building",
        map: {
            display: !0,
            shapes: [
                {
                    collider: collider.createAabbExtents(
                        v2.create(0, 0),
                        v2.create(14, 3.5)
                    ),
                    color: 9322264
                }
            ]
        },
        terrain: { grass: !0, beach: !1 },
        zIdx: 1,
        floor: {
            surfaces: [
                {
                    type: "shack",
                    collision: [
                        collider.createAabbExtents(
                            v2.create(0, 0),
                            v2.create(13.5, 3.5)
                        )
                    ]
                }
            ],
            imgs: [
                {
                    sprite: "map-building-bridge-md-floor.img",
                    scale: 0.5,
                    alpha: 1,
                    tint: 16777215
                }
            ]
        },
        ceiling: { zoomRegions: [], imgs: [] },
        mapObjects: [
            {
                type: "bridge_rail_28",
                pos: v2.create(0, 3),
                scale: 1,
                ori: 1
            },
            {
                type: "bridge_rail_28",
                pos: v2.create(0, -3),
                scale: 1,
                ori: 1
            },
            {
                type: "brick_wall_ext_3_0_low",
                pos: v2.create(-6, 4.25),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_3_0_low",
                pos: v2.create(6, 4.25),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_3_0_low",
                pos: v2.create(-6, -4.25),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_3_0_low",
                pos: v2.create(6, -4.25),
                scale: 1,
                ori: 0
            },
            {
                type: randomObstacleType({ loot_tier_1: 1, loot_tier_2: 1 }),
                pos: v2.create(0, 0),
                scale: 1,
                ori: 0
            }
        ]
    },
    bridge_md_under_01: {
        type: "building",
        map: { display: !1 },
        terrain: { grass: !0, beach: !1 },
        zIdx: 0,
        floor: { surfaces: [], imgs: [] },
        ceiling: {
            zoomRegions: [],
            vision: {
                dist: 5.5,
                width: 2.75,
                linger: 0.5,
                fadeRate: 6
            },
            imgs: []
        },
        mapObjects: [
            {
                type: "brick_wall_ext_11_5",
                pos: v2.create(-6, 0),
                scale: 1,
                ori: 0
            },
            {
                type: "brick_wall_ext_11_5",
                pos: v2.create(6, 0),
                scale: 1,
                ori: 0
            }
        ]
    },
    bridge_md_structure_01: {
        type: "structure",
        terrain: { bridge: { nearbyWidthMult: 8 } },
        mapObstacleBounds: [
            collider.createAabbExtents(
                v2.create(0, 0),
                v2.create(23, 7)
            )
        ],
        layers: [
            {
                type: "bridge_md_01",
                pos: v2.create(0, 0),
                ori: 0
            },
            {
                type: "bridge_md_under_01",
                pos: v2.create(0, 0),
                ori: 0,
                underground: !1
            }
        ],
        bridgeLandBounds: [
            collider.createAabbExtents(
                v2.create(-15.5, 0),
                v2.create(3, 5)
            ),
            collider.createAabbExtents(
                v2.create(15.5, 0),
                v2.create(3, 5)
            )
        ],
        stairs: [
            {
                collision: collider.createAabbExtents(
                    v2.create(0, -4.75),
                    v2.create(5.5, 1.25)
                ),
                downDir: v2.create(0, 1),
                lootOnly: !0
            },
            {
                collision: collider.createAabbExtents(
                    v2.create(0, 4.75),
                    v2.create(5.5, 1.25)
                ),
                downDir: v2.create(0, -1),
                lootOnly: !0
            }
        ],
        mask: [
            collider.createAabbExtents(
                v2.create(0, 0),
                v2.create(6.5, 3.6)
            )
        ]
    },
    container_wall_top: X({
        material: "metal",
        extents: v2.create(2.75, 0.4)
    }),
    container_wall_side: X({
        material: "metal",
        extents: v2.create(0.4, 5.5)
    }),
    container_wall_side_open: X({
        material: "metal",
        extents: v2.create(0.4, 6)
    }),
    container_01: _({
        open: !1,
        tint: 2703694,
        ceilingSprite:
            "map-building-container-ceiling-01.img"
    }),
    container_02: _({
        open: !1,
        tint: 2703694,
        ceilingSprite:
            "map-building-container-ceiling-02.img"
    }),
    container_03: _({
        open: !1,
        tint: 2703694,
        ceilingSprite:
            "map-building-container-ceiling-03.img"
    }),
    container_04: _({
        open: !0,
        tint: 3560807,
        ceilingSprite:
            "map-building-container-open-ceiling-01.img"
    }),
    container_01x: _({
        open: !1,
        tint: 2703694,
        ceilingImgs: [
            {
                sprite: "map-building-container-ceiling-01.img",
                scale: 0.5,
                alpha: 1,
                tint: 2703694
            },
            {
                sprite: "map-snow-05.img",
                pos: v2.create(0, 3),
                scale: 0.6,
                alpha: 1,
                tint: 16777215,
                rot: 0
            }
        ]
    }),
    container_06: _({
        open: !1,
        tint: 12227840,
        ceilingSprite:
            "map-building-container-ceiling-01.img",
        loot_spawner_01: "loot_tier_sv98",
        loot_spawner_02: "loot_tier_scopes_sniper"
    }),
    loot_tier_1: {
        type: "loot_spawner",
        loot: [tierLoot("tier_world", 1, 1)],
        terrain: { grass: !0, beach: !0, riverShore: !0 }
    },
    loot_tier_2: {
        type: "loot_spawner",
        loot: [tierLoot("tier_container", 1, 1)],
        terrain: { grass: !0, beach: !0, riverShore: !0 }
    },
    loot_tier_beach: {
        type: "loot_spawner",
        loot: [tierLoot("tier_world", 1, 1)],
        terrain: { grass: !1, beach: !0 }
    },
    loot_tier_surviv: {
        type: "loot_spawner",
        loot: [tierLoot("tier_surviv", 1, 1)],
        terrain: { grass: !0, beach: !0, riverShore: !0 }
    },
    loot_tier_vault_floor: {
        type: "loot_spawner",
        loot: [tierLoot("tier_vault_floor", 1, 1)]
    },
    loot_tier_police_floor: {
        type: "loot_spawner",
        loot: [tierLoot("tier_police_floor", 1, 1)]
    },
    loot_tier_mansion_floor: {
        type: "loot_spawner",
        loot: [tierLoot("tier_mansion_floor", 1, 1)]
    },
    loot_tier_sv98: {
        type: "loot_spawner",
        loot: [tierLoot("tier_sv98", 1, 1)]
    },
    loot_tier_scopes_sniper: {
        type: "loot_spawner",
        loot: [tierLoot("tier_scopes_sniper", 1, 1)]
    },
    loot_tier_woodaxe: {
        type: "loot_spawner",
        loot: [tierLoot("tier_woodaxe", 1, 1)]
    },
    loot_tier_fireaxe: {
        type: "loot_spawner",
        loot: [tierLoot("tier_fireaxe", 1, 1)]
    },
    loot_tier_stonehammer: {
        type: "loot_spawner",
        loot: [tierLoot("tier_stonehammer", 1, 1)]
    },
    loot_tier_sledgehammer: {
        type: "loot_spawner",
        loot: [tierLoot("tier_sledgehammer", 1, 1)]
    },
    loot_tier_hatchet_melee: {
        type: "loot_spawner",
        loot: [tierLoot("tier_hatchet_melee", 1, 1)]
    },
    loot_tier_club_melee: {
        type: "loot_spawner",
        loot: [tierLoot("tier_club_melee", 1, 1)]
    },
    loot_tier_leaf_pile: {
        type: "loot_spawner",
        loot: [tierLoot("tier_leaf_pile", 1, 1)]
    },
    loot_tier_islander_outfit: {
        type: "loot_spawner",
        loot: [tierLoot("tier_islander_outfit", 1, 1)]
    },
    loot_tier_verde_outfit: {
        type: "loot_spawner",
        loot: [tierLoot("tier_verde_outfit", 1, 1)]
    },
    loot_tier_lumber_outfit: {
        type: "loot_spawner",
        loot: [tierLoot("tier_lumber_outfit", 1, 1)]
    },
    loot_tier_imperial_outfit: {
        type: "loot_spawner",
        loot: [tierLoot("tier_imperial_outfit", 1, 1)]
    },
    loot_tier_pineapple_outfit: {
        type: "loot_spawner",
        loot: [tierLoot("tier_pineapple_outfit", 1, 1)]
    },
    loot_tier_tarkhany_outfit: {
        type: "loot_spawner",
        loot: [tierLoot("tier_tarkhany_outfit", 1, 1)]
    },
    loot_tier_spetsnaz_outfit: {
        type: "loot_spawner",
        loot: [tierLoot("tier_spetsnaz_outfit", 1, 1)]
    },
    loot_tier_eye_01: {
        type: "loot_spawner",
        loot: [tierLoot("tier_eye_01", 1, 1)]
    },
    loot_tier_eye_02: {
        type: "loot_spawner",
        loot: [tierLoot("tier_eye_02", 1, 1)]
    },
    loot_tier_saloon: {
        type: "loot_spawner",
        loot: [tierLoot("tier_saloon", 1, 1)]
    },
    loot_tier_chrys_01: {
        type: "loot_spawner",
        loot: [tierLoot("tier_chrys_01", 1, 1)]
    },
    loot_tier_chrys_02: {
        type: "loot_spawner",
        loot: [tierLoot("tier_chrys_02", 1, 1)]
    },
    loot_tier_chrys_02b: {
        type: "loot_spawner",
        loot: [tierLoot("tier_chrys_02b", 1, 1)]
    },
    loot_tier_chrys_03: {
        type: "loot_spawner",
        loot: [tierLoot("tier_chrys_03", 1, 1)]
    },
    loot_tier_airdrop_armor: {
        type: "loot_spawner",
        loot: [tierLoot("tier_airdrop_armor", 1, 1)]
    },
    loot_tier_helmet_forest: {
        type: "loot_spawner",
        loot: [tierLoot("tier_forest_helmet", 1, 1)],
        terrain: { grass: !0, beach: !1 }
    },
    loot_tier_helmet_potato: {
        type: "loot_spawner",
        loot: [tierLoot("tier_potato_helmet", 1, 1)],
        terrain: { grass: !0, beach: !1 }
    },
    loot_tier_perk_test: {
        type: "loot_spawner",
        loot: [
            autoLoot("explosive", 1),
            autoLoot("splinter", 1),
            autoLoot("scavenger_adv", 1)
        ],
        terrain: { grass: !0, beach: !1 }
    },
    loot_tier_sniper_test: {
        type: "loot_spawner",
        loot: [
            autoLoot("l86", 1),
            autoLoot("svd", 1),
            autoLoot("vss", 1),
            autoLoot("blr", 1),
            autoLoot("scarssr", 1)
        ],
        terrain: { grass: !0, beach: !1 }
    },
    loot_tier_loot_test: {
        type: "loot_spawner",
        loot: [
            autoLoot("explosive", 1),
            autoLoot("backpack03", 1),
            autoLoot("chest03", 1),
            autoLoot("helmet03", 1),
            autoLoot("scavenger_adv", 1),
            autoLoot("explosive", 1),
            autoLoot("splinter", 1),
            autoLoot("p30l", 1),
            autoLoot("p30l", 1),
            autoLoot("p30l", 1),
            autoLoot("p30l", 1),
            autoLoot("deagle", 1),
            autoLoot("deagle", 1),
            autoLoot("deagle", 1),
            autoLoot("ots38_dual", 1)
        ],
        terrain: { grass: !0, beach: !1 }
    },
    decal_barrel_explosion: {
        type: "decal",
        collision: collider.createCircle(v2.create(0, 0), 1),
        height: 0,
        img: {
            sprite: "map-barrel-res-01.img",
            scale: 0.24,
            alpha: 1,
            tint: 0,
            zIdx: 9
        }
    },
    decal_frag_explosion: {
        type: "decal",
        collision: collider.createCircle(v2.create(0, 0), 1),
        height: 0,
        img: {
            sprite: "map-barrel-res-01.img",
            scale: 0.2,
            alpha: 0.8,
            tint: 0,
            zIdx: 11
        }
    },
    decal_frag_small_explosion: {
        type: "decal",
        collision: collider.createCircle(v2.create(0, 0), 1),
        height: 0,
        img: {
            sprite: "map-barrel-res-01.img",
            scale: 0.12,
            alpha: 0.8,
            tint: 2105376,
            zIdx: 11
        }
    },
    decal_rounds_explosion: {
        type: "decal",
        collision: collider.createCircle(v2.create(0, 0), 1),
        height: 0,
        lifetime: { min: 2, max: 2.5 },
        img: {
            sprite: "map-barrel-res-01.img",
            scale: 0.1,
            alpha: 0.8,
            tint: 3150346,
            zIdx: 11
        }
    },
    decal_bomb_iron_explosion: {
        type: "decal",
        collision: collider.createCircle(v2.create(0, 0), 1),
        height: 0,
        lifetime: { min: 6, max: 10 },
        fadeChance: 0.6,
        img: {
            sprite: "map-barrel-res-01.img",
            scale: 0.2,
            alpha: 0.8,
            tint: 0,
            zIdx: 11
        }
    },
    decal_smoke_explosion: {
        type: "decal",
        collision: collider.createCircle(v2.create(0, 0), 1),
        height: 0,
        img: {
            sprite: "map-smoke-res.img",
            scale: 0.2,
            alpha: 0.5,
            tint: 16777215,
            zIdx: 11
        }
    },
    decal_snowball_explosion: {
        type: "decal",
        collision: collider.createCircle(v2.create(0, 0), 1),
        height: 0,
        lifetime: 5,
        fadeChance: 1,
        img: {
            sprite: "map-snowball-res.img",
            scale: 0.2,
            alpha: 0.25,
            tint: 16777215,
            zIdx: 11
        }
    },
    decal_potato_explosion: {
        type: "decal",
        collision: collider.createCircle(v2.create(0, 0), 1),
        height: 0,
        lifetime: 5,
        fadeChance: 1,
        img: {
            sprite: "map-potato-res.img",
            scale: 0.2,
            alpha: 0.25,
            tint: 16777215,
            zIdx: 11
        }
    },
    decal_vent_01: {
        type: "decal",
        collision: collider.createCircle(v2.create(0, 0), 2),
        height: 0,
        img: {
            sprite: "map-bunker-vent-01.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 0
        }
    },
    decal_vent_02: {
        type: "decal",
        collision: collider.createCircle(v2.create(0, 0), 2),
        height: 0,
        img: {
            sprite: "map-bunker-vent-02.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 0
        }
    },
    decal_vent_03: {
        type: "decal",
        collision: collider.createCircle(v2.create(0, 0), 2),
        height: 0,
        img: {
            sprite: "map-bunker-vent-03.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 0
        }
    },
    decal_hydra_01: {
        type: "decal",
        collision: collider.createCircle(v2.create(0, 0), 3),
        height: 0,
        img: {
            sprite: "map-bunker-hydra-floor-04.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 0
        }
    },
    decal_pipes_01: {
        type: "decal",
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(1, 4.5)
        ),
        height: 1,
        img: {
            sprite: "map-pipes-01.img",
            scale: 0.5,
            alpha: 0.96,
            tint: 16777215,
            zIdx: 60
        }
    },
    decal_pipes_02: {
        type: "decal",
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(4, 3)
        ),
        height: 1,
        img: {
            sprite: "map-pipes-02.img",
            scale: 0.5,
            alpha: 0.96,
            tint: 16777215,
            zIdx: 60
        }
    },
    decal_pipes_03: {
        type: "decal",
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(10.5, 4)
        ),
        height: 1,
        img: {
            sprite: "map-pipes-03.img",
            scale: 0.5,
            alpha: 0.96,
            tint: 16777215,
            zIdx: 60
        }
    },
    decal_pipes_04: {
        type: "decal",
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(1, 5.5)
        ),
        height: 1,
        img: {
            sprite: "map-pipes-04.img",
            scale: 0.5,
            alpha: 0.96,
            tint: 16777215,
            zIdx: 60
        }
    },
    decal_pipes_05: {
        type: "decal",
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(1, 3.5)
        ),
        height: 1,
        img: {
            sprite: "map-pipes-05.img",
            scale: 0.5,
            alpha: 0.96,
            tint: 16777215,
            zIdx: 60
        }
    },
    decal_initiative_01: {
        type: "decal",
        collision: collider.createCircle(v2.create(0, 0), 3),
        height: 0,
        img: {
            sprite: "map-decal-initiative.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 0
        }
    },
    decal_web_01: {
        type: "decal",
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(1.5, 1.5)
        ),
        height: 1,
        img: {
            sprite: "map-web-01.img",
            scale: 0.5,
            alpha: 0.75,
            tint: 16777215,
            zIdx: 60
        }
    },
    decal_light_01: {
        type: "decal",
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(3.25, 3.25)
        ),
        height: 1,
        lifetime: 1e10,
        img: {
            sprite: "map-light-01.img",
            scale: 1,
            alpha: 0.5,
            tint: 16751616,
            zIdx: 60,
            flicker: !0,
            flickerMin: 0.9,
            flickerMax: 1.1,
            flickerRate: 0.5,
            ignoreAdjust: !0
        }
    },
    decal_light_02: {
        type: "decal",
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(2.5, 2.5)
        ),
        height: 1,
        lifetime: 1e10,
        img: {
            sprite: "map-light-01.img",
            scale: 0.75,
            alpha: 0.5,
            tint: 16760397,
            zIdx: 60,
            flicker: !0,
            flickerMin: 0.8,
            flickerMax: 1.2,
            flickerRate: 0.2,
            ignoreAdjust: !0
        }
    },
    decal_light_03: {
        type: "decal",
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(2.5, 2.5)
        ),
        height: 1,
        lifetime: 1e10,
        img: {
            sprite: "map-light-01.img",
            scale: 0.75,
            alpha: 0.5,
            tint: 8585216,
            zIdx: 60,
            flicker: !0,
            flickerMin: 0.8,
            flickerMax: 1.2,
            flickerRate: 0.2,
            ignoreAdjust: !0
        }
    },
    decal_light_04: {
        type: "decal",
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(2.5, 2.5)
        ),
        height: 1,
        lifetime: 1e10,
        img: {
            sprite: "map-light-01.img",
            scale: 0.75,
            alpha: 0.5,
            tint: 16734244,
            zIdx: 60,
            flicker: !0,
            flickerMin: 0.5,
            flickerMax: 0.75,
            flickerRate: 0.4,
            ignoreAdjust: !0
        }
    },
    decal_blood_01: {
        type: "decal",
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(1.5, 1.5)
        ),
        height: 0,
        img: {
            sprite: "part-splat-01.img",
            scale: 0.25,
            alpha: 0.95,
            tint: 4001294,
            zIdx: 0
        }
    },
    decal_blood_02: {
        type: "decal",
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(1.5, 1.5)
        ),
        height: 0,
        img: {
            sprite: "part-splat-02.img",
            scale: 0.25,
            alpha: 0.95,
            tint: 4001294,
            zIdx: 0
        }
    },
    decal_blood_03: {
        type: "decal",
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(1.5, 1.5)
        ),
        height: 0,
        img: {
            sprite: "part-splat-03.img",
            scale: 0.25,
            alpha: 0.95,
            tint: 4001294,
            zIdx: 0
        }
    },
    decal_chrys_01: {
        type: "decal",
        collision: collider.createCircle(v2.create(0, 0), 2),
        height: 1,
        img: {
            sprite: "map-bunker-vent-01.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 3
        }
    },
    decal_oil_01: {
        type: "decal",
        collision: collider.createCircle(v2.create(0, 0), 2),
        height: 0,
        img: {
            sprite: "map-decal-oil-01.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 0
        }
    },
    decal_oil_02: {
        type: "decal",
        collision: collider.createCircle(v2.create(0, 0), 2),
        height: 0,
        img: {
            sprite: "map-decal-oil-02.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 0
        }
    },
    decal_oil_03: {
        type: "decal",
        collision: collider.createCircle(v2.create(0, 0), 2),
        height: 0,
        img: {
            sprite: "map-decal-oil-03.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 0
        }
    },
    decal_oil_04: {
        type: "decal",
        collision: collider.createCircle(v2.create(0, 0), 1),
        height: 0,
        img: {
            sprite: "map-decal-oil-04.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 0
        }
    },
    decal_oil_05: {
        type: "decal",
        collision: collider.createCircle(v2.create(0, 0), 1),
        height: 0,
        img: {
            sprite: "map-decal-oil-05.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 0
        }
    },
    decal_oil_06: {
        type: "decal",
        collision: collider.createCircle(v2.create(0, 0), 2),
        height: 0,
        img: {
            sprite: "map-decal-oil-06.img",
            scale: 0.5,
            alpha: 1,
            tint: 16777215,
            zIdx: 0
        }
    },
    decal_bathhouse_pool_01: {
        type: "decal",
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(9, 15)
        ),
        height: 1,
        surface: {
            type: "water",
            data: {
                waterColor: 5157572,
                rippleColor: 10478319
            }
        },
        img: {
            sprite: "map-bathhouse-pool-01.img",
            scale: 8,
            alpha: 0.5,
            tint: 52721,
            zIdx: 5
        },
        gore: {
            fade: { start: 0, end: 4, pow: 0.5, speed: 2 },
            tint: 7667727,
            alpha: 0.85,
            waterColor: 8529201,
            rippleColor: 11490399
        }
    },
    decal_club_01: {
        type: "decal",
        collision: collider.createCircle(v2.create(0, 0), 4),
        height: 0,
        img: {
            sprite: "map-decal-club-01.img",
            scale: 1,
            alpha: 1,
            tint: 16777215,
            zIdx: 4
        }
    },
    decal_club_02: {
        type: "decal",
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(4, 10.5)
        ),
        height: 1,
        img: {
            sprite: "map-decal-club-02.img",
            scale: 1,
            alpha: 0,
            tint: 16777215,
            zIdx: 4
        },
        gore: {
            fade: {
                start: 4,
                end: 6,
                pow: 3.25,
                speed: 0.5
            },
            alpha: 1
        }
    },
    decal_plank_01: {
        type: "decal",
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(2.25, 2.25)
        ),
        height: 0,
        img: {
            sprite: "part-plank-01.img",
            scale: 0.5,
            alpha: 1,
            tint: 4327436,
            zIdx: 9
        }
    },
    decal_flyer_01: {
        type: "decal",
        collision: collider.createAabbExtents(
            v2.create(0, 0),
            v2.create(0.5, 1)
        ),
        height: 0,
        img: {
            sprite: "map-decal-flyer-01.img",
            scale: 0.6,
            alpha: 0.667,
            tint: 16777215,
            zIdx: 4
        }
    }
};

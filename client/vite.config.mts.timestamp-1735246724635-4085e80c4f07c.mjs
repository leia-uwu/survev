import stripBlockPlugin from "file:///C:/Users/rust/Desktop/projects/survev-prod/node_modules/.pnpm/vite-plugin-strip-block@1.0.1/node_modules/vite-plugin-strip-block/dist/index.mjs";
// vite.config.mts
import { defineConfig } from "file:///C:/Users/rust/Desktop/projects/survev-prod/node_modules/.pnpm/vite@5.4.11_@types+node@22.10.2_terser@5.37.0/node_modules/vite/dist/node/index.js";

// ../package.json
var version = "0.0.16";

// ../server/src/config.ts
import fs from "fs";
import path from "path";

// ../shared/gameConfig.ts
var EmoteSlot = /* @__PURE__ */ ((EmoteSlot2) => {
    EmoteSlot2[(EmoteSlot2["Top"] = 0)] = "Top";
    EmoteSlot2[(EmoteSlot2["Right"] = 1)] = "Right";
    EmoteSlot2[(EmoteSlot2["Bottom"] = 2)] = "Bottom";
    EmoteSlot2[(EmoteSlot2["Left"] = 3)] = "Left";
    EmoteSlot2[(EmoteSlot2["Win"] = 4)] = "Win";
    EmoteSlot2[(EmoteSlot2["Death"] = 5)] = "Death";
    EmoteSlot2[(EmoteSlot2["Count"] = 6)] = "Count";
    return EmoteSlot2;
})(EmoteSlot || {});
var DamageType = /* @__PURE__ */ ((DamageType2) => {
    DamageType2[(DamageType2["Player"] = 0)] = "Player";
    DamageType2[(DamageType2["Bleeding"] = 1)] = "Bleeding";
    DamageType2[(DamageType2["Gas"] = 2)] = "Gas";
    DamageType2[(DamageType2["Airdrop"] = 3)] = "Airdrop";
    DamageType2[(DamageType2["Airstrike"] = 4)] = "Airstrike";
    return DamageType2;
})(DamageType || {});
var Action = /* @__PURE__ */ ((Action2) => {
    Action2[(Action2["None"] = 0)] = "None";
    Action2[(Action2["Reload"] = 1)] = "Reload";
    Action2[(Action2["ReloadAlt"] = 2)] = "ReloadAlt";
    Action2[(Action2["UseItem"] = 3)] = "UseItem";
    Action2[(Action2["Revive"] = 4)] = "Revive";
    return Action2;
})(Action || {});
var WeaponSlot = /* @__PURE__ */ ((WeaponSlot2) => {
    WeaponSlot2[(WeaponSlot2["Primary"] = 0)] = "Primary";
    WeaponSlot2[(WeaponSlot2["Secondary"] = 1)] = "Secondary";
    WeaponSlot2[(WeaponSlot2["Melee"] = 2)] = "Melee";
    WeaponSlot2[(WeaponSlot2["Throwable"] = 3)] = "Throwable";
    WeaponSlot2[(WeaponSlot2["Count"] = 4)] = "Count";
    return WeaponSlot2;
})(WeaponSlot || {});
var GasMode = /* @__PURE__ */ ((GasMode2) => {
    GasMode2[(GasMode2["Inactive"] = 0)] = "Inactive";
    GasMode2[(GasMode2["Waiting"] = 1)] = "Waiting";
    GasMode2[(GasMode2["Moving"] = 2)] = "Moving";
    return GasMode2;
})(GasMode || {});
var Anim = /* @__PURE__ */ ((Anim2) => {
    Anim2[(Anim2["None"] = 0)] = "None";
    Anim2[(Anim2["Melee"] = 1)] = "Melee";
    Anim2[(Anim2["Cook"] = 2)] = "Cook";
    Anim2[(Anim2["Throw"] = 3)] = "Throw";
    Anim2[(Anim2["CrawlForward"] = 4)] = "CrawlForward";
    Anim2[(Anim2["CrawlBackward"] = 5)] = "CrawlBackward";
    Anim2[(Anim2["Revive"] = 6)] = "Revive";
    return Anim2;
})(Anim || {});
var Plane = /* @__PURE__ */ ((Plane2) => {
    Plane2[(Plane2["Airdrop"] = 0)] = "Airdrop";
    Plane2[(Plane2["Airstrike"] = 1)] = "Airstrike";
    return Plane2;
})(Plane || {});
var HasteType = /* @__PURE__ */ ((HasteType2) => {
    HasteType2[(HasteType2["None"] = 0)] = "None";
    HasteType2[(HasteType2["Windwalk"] = 1)] = "Windwalk";
    HasteType2[(HasteType2["Takedown"] = 2)] = "Takedown";
    HasteType2[(HasteType2["Inspire"] = 3)] = "Inspire";
    return HasteType2;
})(HasteType || {});
var Input = /* @__PURE__ */ ((Input2) => {
    Input2[(Input2["MoveLeft"] = 0)] = "MoveLeft";
    Input2[(Input2["MoveRight"] = 1)] = "MoveRight";
    Input2[(Input2["MoveUp"] = 2)] = "MoveUp";
    Input2[(Input2["MoveDown"] = 3)] = "MoveDown";
    Input2[(Input2["Fire"] = 4)] = "Fire";
    Input2[(Input2["Reload"] = 5)] = "Reload";
    Input2[(Input2["Cancel"] = 6)] = "Cancel";
    Input2[(Input2["Interact"] = 7)] = "Interact";
    Input2[(Input2["Revive"] = 8)] = "Revive";
    Input2[(Input2["Use"] = 9)] = "Use";
    Input2[(Input2["Loot"] = 10)] = "Loot";
    Input2[(Input2["EquipPrimary"] = 11)] = "EquipPrimary";
    Input2[(Input2["EquipSecondary"] = 12)] = "EquipSecondary";
    Input2[(Input2["EquipMelee"] = 13)] = "EquipMelee";
    Input2[(Input2["EquipThrowable"] = 14)] = "EquipThrowable";
    Input2[(Input2["EquipFragGrenade"] = 15)] = "EquipFragGrenade";
    Input2[(Input2["EquipSmokeGrenade"] = 16)] = "EquipSmokeGrenade";
    Input2[(Input2["EquipNextWeap"] = 17)] = "EquipNextWeap";
    Input2[(Input2["EquipPrevWeap"] = 18)] = "EquipPrevWeap";
    Input2[(Input2["EquipLastWeap"] = 19)] = "EquipLastWeap";
    Input2[(Input2["EquipOtherGun"] = 20)] = "EquipOtherGun";
    Input2[(Input2["EquipPrevScope"] = 21)] = "EquipPrevScope";
    Input2[(Input2["EquipNextScope"] = 22)] = "EquipNextScope";
    Input2[(Input2["UseBandage"] = 23)] = "UseBandage";
    Input2[(Input2["UseHealthKit"] = 24)] = "UseHealthKit";
    Input2[(Input2["UseSoda"] = 25)] = "UseSoda";
    Input2[(Input2["UsePainkiller"] = 26)] = "UsePainkiller";
    Input2[(Input2["StowWeapons"] = 27)] = "StowWeapons";
    Input2[(Input2["SwapWeapSlots"] = 28)] = "SwapWeapSlots";
    Input2[(Input2["ToggleMap"] = 29)] = "ToggleMap";
    Input2[(Input2["CycleUIMode"] = 30)] = "CycleUIMode";
    Input2[(Input2["EmoteMenu"] = 31)] = "EmoteMenu";
    Input2[(Input2["TeamPingMenu"] = 32)] = "TeamPingMenu";
    Input2[(Input2["Fullscreen"] = 33)] = "Fullscreen";
    Input2[(Input2["HideUI"] = 34)] = "HideUI";
    Input2[(Input2["TeamPingSingle"] = 35)] = "TeamPingSingle";
    Input2[(Input2["Count"] = 36)] = "Count";
    return Input2;
})(Input || {});
var GameConfig = {
    protocolVersion: 78,
    Input,
    EmoteSlot,
    WeaponSlot,
    WeaponType: ["gun", "gun", "melee", "throwable"],
    DamageType,
    Action,
    Anim,
    GasMode,
    Plane,
    HasteType,
    gas: {
        damageTickRate: 2,
    },
    map: {
        gridSize: 16,
        shoreVariation: 3,
        grassVariation: 2,
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
        frozenSpeedPenalty: 3,
        hasteSpeedBonus: 4.8,
        bleedTickRate: 1,
        downedMoveSpeed: 4,
        downedRezMoveSpeed: 2,
        keepZoomWhileDowned: false,
        reviveDuration: 8,
        reviveRange: 5,
        crawlTime: 0.75,
        teammateSpawnRadius: 5,
        // radius of circle that teammates spawn inside of, relative to the first player on the team to join
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
        spectateDeadTimeout: 2,
        killLeaderMinKills: 3,
        minSpawnRad: 25,
        /* STRIP_FROM_PROD_CLIENT:START */
        defaultItems: {
            weapons: [
                { type: "", ammo: 0 },
                { type: "", ammo: 0 },
                { type: "fists", ammo: 0 },
                { type: "", ammo: 0 },
            ],
            outfit: "outfitBase",
            backpack: "backpack00",
            helmet: "",
            chest: "",
            scope: "1xscope",
            perks: [],
            inventory: {
                "9mm": 0,
                "762mm": 0,
                "556mm": 0,
                "12gauge": 0,
                "50AE": 0,
                "308sub": 0,
                flare: 0,
                "45acp": 0,
                frag: 0,
                smoke: 0,
                strobe: 0,
                mirv: 0,
                snowball: 0,
                potato: 0,
                bandage: 0,
                healthkit: 0,
                soda: 0,
                painkiller: 0,
                "1xscope": 1,
                "2xscope": 0,
                "4xscope": 0,
                "8xscope": 0,
                "15xscope": 0,
            },
        },
        /* STRIP_FROM_PROD_CLIENT:END */
    },
    defaultEmoteLoadout: [
        "emote_happyface",
        "emote_thumbsup",
        "emote_surviv",
        "emote_sadface",
        "",
        "",
    ],
    airdrop: {
        actionOffset: 0,
        fallTime: 8,
        crushDamage: 100,
        planeVel: 48,
        planeRad: 150,
        soundRangeMult: 2.5,
        soundRangeDelta: 0.25,
        soundRangeMax: 92,
        fallOff: 0,
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
        fallOff: 1.25,
    },
    groupColors: [16776960, 16711935, 65535, 16733184],
    teamColors: [13369344, 32511],
    bullet: {
        maxReflect: 3,
        reflectDistDecay: 1.5,
        height: 0.25,
        falloff: true,
    },
    projectile: {
        maxHeight: 5,
    },
    structureLayerCount: 2,
    tracerColors: {
        "9mm": {
            regular: 16704198,
            saturated: 16767411,
            chambered: 16744192,
            alphaRate: 0.92,
            alphaMin: 0.14,
        },
        "9mm_suppressed_bonus": {
            regular: 16704198,
            saturated: 16767411,
            chambered: 16744192,
            alphaRate: 0.96,
            alphaMin: 0.28,
        },
        "9mm_cursed": {
            regular: 1247488,
            saturated: 1247488,
            chambered: 1247488,
            alphaRate: 0.92,
            alphaMin: 0.14,
        },
        "762mm": {
            regular: 12965630,
            saturated: 11257087,
            chambered: 19711,
            alphaRate: 0.94,
            alphaMin: 0.2,
        },
        "12gauge": {
            regular: 16702684,
            saturated: 16702684,
            chambered: 16711680,
        },
        "556mm": {
            regular: 11141010,
            saturated: 11141010,
            chambered: 3604224,
            alphaRate: 0.92,
            alphaMin: 0.14,
        },
        "50AE": {
            regular: 16773256,
            saturated: 16773256,
            chambered: 16768768,
        },
        "308sub": {
            regular: 2435840,
            saturated: 4608e3,
            chambered: 1250816,
            alphaRate: 0.92,
            alphaMin: 0.07,
        },
        flare: {
            regular: 14869218,
            saturated: 14869218,
            chambered: 12895428,
        },
        "45acp": {
            regular: 15515391,
            saturated: 15183103,
            chambered: 11862271,
        },
        shrapnel: { regular: 3355443, saturated: 3355443 },
        frag: { regular: 13303808, saturated: 13303808 },
        invis: { regular: 0, saturated: 0, chambered: 0 },
    },
    scopeZoomRadius: {
        desktop: {
            "1xscope": 28,
            "2xscope": 36,
            "4xscope": 48,
            "8xscope": 68,
            "15xscope": 104,
        },
        mobile: {
            "1xscope": 32,
            "2xscope": 40,
            "4xscope": 48,
            "8xscope": 64,
            "15xscope": 88,
        },
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
        "15xscope": [1, 1, 1, 1],
    },
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
        xp: 1,
    },
};

// ../shared/utils/earcut.js
function earcut(data, holeIndices, dim) {
    dim = dim || 2;
    const hasHoles = holeIndices?.length;
    const outerLen = hasHoles ? holeIndices[0] * dim : data.length;
    let outerNode = linkedList(data, 0, outerLen, dim, true);
    const triangles = [];
    if (!outerNode) return triangles;
    let minX;
    let minY;
    let maxX;
    let maxY;
    let x;
    let y;
    let invSize;
    if (hasHoles) outerNode = eliminateHoles(data, holeIndices, outerNode, dim);
    if (data.length > 80 * dim) {
        minX = maxX = data[0];
        minY = maxY = data[1];
        for (let i = dim; i < outerLen; i += dim) {
            x = data[i];
            y = data[i + 1];
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
        }
        invSize = Math.max(maxX - minX, maxY - minY);
        invSize = invSize !== 0 ? 1 / invSize : 0;
    }
    earcutLinked(outerNode, triangles, dim, minX, minY, invSize);
    return triangles;
}
function linkedList(data, start, end, dim, clockwise) {
    let i;
    let last;
    if (clockwise === signedArea(data, start, end, dim) > 0) {
        for (i = start; i < end; i += dim) {
            last = insertNode(i, data[i], data[i + 1], last);
        }
    } else {
        for (i = end - dim; i >= start; i -= dim) {
            last = insertNode(i, data[i], data[i + 1], last);
        }
    }
    if (last && equals(last, last.next)) {
        removeNode(last);
        last = last.next;
    }
    return last;
}
function filterPoints(start, end) {
    if (!start) return start;
    if (!end) end = start;
    let p = start;
    let again;
    do {
        again = false;
        if (!p.steiner && (equals(p, p.next) || area(p.prev, p, p.next) === 0)) {
            removeNode(p);
            p = end = p.prev;
            if (p === p.next) break;
            again = true;
        } else {
            p = p.next;
        }
    } while (again || p !== end);
    return end;
}
function earcutLinked(ear, triangles, dim, minX, minY, invSize, pass) {
    if (!ear) return;
    if (!pass && invSize) indexCurve(ear, minX, minY, invSize);
    let stop = ear;
    let prev;
    let next;
    while (ear.prev !== ear.next) {
        prev = ear.prev;
        next = ear.next;
        if (invSize ? isEarHashed(ear, minX, minY, invSize) : isEar(ear)) {
            triangles.push(prev.i / dim);
            triangles.push(ear.i / dim);
            triangles.push(next.i / dim);
            removeNode(ear);
            ear = next.next;
            stop = next.next;
            continue;
        }
        ear = next;
        if (ear === stop) {
            if (!pass) {
                earcutLinked(filterPoints(ear), triangles, dim, minX, minY, invSize, 1);
            } else if (pass === 1) {
                ear = cureLocalIntersections(ear, triangles, dim);
                earcutLinked(ear, triangles, dim, minX, minY, invSize, 2);
            } else if (pass === 2) {
                splitEarcut(ear, triangles, dim, minX, minY, invSize);
            }
            break;
        }
    }
}
function isEar(ear) {
    const a = ear.prev;
    const b = ear;
    const c = ear.next;
    if (area(a, b, c) >= 0) return false;
    let p = ear.next.next;
    while (p !== ear.prev) {
        if (
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0
        )
            return false;
        p = p.next;
    }
    return true;
}
function isEarHashed(ear, minX, minY, invSize) {
    const a = ear.prev;
    const b = ear;
    const c = ear.next;
    if (area(a, b, c) >= 0) return false;
    const minTX = a.x < b.x ? (a.x < c.x ? a.x : c.x) : b.x < c.x ? b.x : c.x;
    const minTY = a.y < b.y ? (a.y < c.y ? a.y : c.y) : b.y < c.y ? b.y : c.y;
    const maxTX = a.x > b.x ? (a.x > c.x ? a.x : c.x) : b.x > c.x ? b.x : c.x;
    const maxTY = a.y > b.y ? (a.y > c.y ? a.y : c.y) : b.y > c.y ? b.y : c.y;
    const minZ = zOrder(minTX, minTY, minX, minY, invSize);
    const maxZ = zOrder(maxTX, maxTY, minX, minY, invSize);
    let p = ear.prevZ;
    let n = ear.nextZ;
    while (p && p.z >= minZ && n && n.z <= maxZ) {
        if (
            p !== ear.prev &&
            p !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0
        )
            return false;
        p = p.prevZ;
        if (
            n !== ear.prev &&
            n !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, n.x, n.y) &&
            area(n.prev, n, n.next) >= 0
        )
            return false;
        n = n.nextZ;
    }
    while (p && p.z >= minZ) {
        if (
            p !== ear.prev &&
            p !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0
        )
            return false;
        p = p.prevZ;
    }
    while (n && n.z <= maxZ) {
        if (
            n !== ear.prev &&
            n !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, n.x, n.y) &&
            area(n.prev, n, n.next) >= 0
        )
            return false;
        n = n.nextZ;
    }
    return true;
}
function cureLocalIntersections(start, triangles, dim) {
    let p = start;
    do {
        const a = p.prev;
        const b = p.next.next;
        if (
            !equals(a, b) &&
            intersects(a, p, p.next, b) &&
            locallyInside(a, b) &&
            locallyInside(b, a)
        ) {
            triangles.push(a.i / dim);
            triangles.push(p.i / dim);
            triangles.push(b.i / dim);
            removeNode(p);
            removeNode(p.next);
            p = start = b;
        }
        p = p.next;
    } while (p !== start);
    return p;
}
function splitEarcut(start, triangles, dim, minX, minY, invSize) {
    let a = start;
    do {
        let b = a.next.next;
        while (b !== a.prev) {
            if (a.i !== b.i && isValidDiagonal(a, b)) {
                let c = splitPolygon(a, b);
                a = filterPoints(a, a.next);
                c = filterPoints(c, c.next);
                earcutLinked(a, triangles, dim, minX, minY, invSize);
                earcutLinked(c, triangles, dim, minX, minY, invSize);
                return;
            }
            b = b.next;
        }
        a = a.next;
    } while (a !== start);
}
function eliminateHoles(data, holeIndices, outerNode, dim) {
    const queue = [];
    let i;
    let len;
    let start;
    let end;
    let list;
    for (i = 0, len = holeIndices.length; i < len; i++) {
        start = holeIndices[i] * dim;
        end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
        list = linkedList(data, start, end, dim, false);
        if (list === list.next) list.steiner = true;
        queue.push(getLeftmost(list));
    }
    queue.sort(compareX);
    for (i = 0; i < queue.length; i++) {
        eliminateHole(queue[i], outerNode);
        outerNode = filterPoints(outerNode, outerNode.next);
    }
    return outerNode;
}
function compareX(a, b) {
    return a.x - b.x;
}
function eliminateHole(hole, outerNode) {
    outerNode = findHoleBridge(hole, outerNode);
    if (outerNode) {
        const b = splitPolygon(outerNode, hole);
        filterPoints(b, b.next);
    }
}
function findHoleBridge(hole, outerNode) {
    let p = outerNode;
    const hx = hole.x;
    const hy = hole.y;
    let qx = -Infinity;
    let m;
    do {
        if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {
            const x = p.x + ((hy - p.y) * (p.next.x - p.x)) / (p.next.y - p.y);
            if (x <= hx && x > qx) {
                qx = x;
                if (x === hx) {
                    if (hy === p.y) return p;
                    if (hy === p.next.y) return p.next;
                }
                m = p.x < p.next.x ? p : p.next;
            }
        }
        p = p.next;
    } while (p !== outerNode);
    if (!m) return null;
    if (hx === qx) return m.prev;
    const stop = m;
    const mx = m.x;
    const my = m.y;
    let tanMin = Infinity;
    let tan;
    p = m.next;
    while (p !== stop) {
        if (
            hx >= p.x &&
            p.x >= mx &&
            hx !== p.x &&
            pointInTriangle(
                hy < my ? hx : qx,
                hy,
                mx,
                my,
                hy < my ? qx : hx,
                hy,
                p.x,
                p.y,
            )
        ) {
            tan = Math.abs(hy - p.y) / (hx - p.x);
            if (
                (tan < tanMin || (tan === tanMin && p.x > m.x)) &&
                locallyInside(p, hole)
            ) {
                m = p;
                tanMin = tan;
            }
        }
        p = p.next;
    }
    return m;
}
function indexCurve(start, minX, minY, invSize) {
    let p = start;
    do {
        if (p.z === null) p.z = zOrder(p.x, p.y, minX, minY, invSize);
        p.prevZ = p.prev;
        p.nextZ = p.next;
        p = p.next;
    } while (p !== start);
    p.prevZ.nextZ = null;
    p.prevZ = null;
    sortLinked(p);
}
function sortLinked(list) {
    let i;
    let p;
    let q;
    let e;
    let tail;
    let numMerges;
    let pSize;
    let qSize;
    let inSize = 1;
    do {
        p = list;
        list = null;
        tail = null;
        numMerges = 0;
        while (p) {
            numMerges++;
            q = p;
            pSize = 0;
            for (i = 0; i < inSize; i++) {
                pSize++;
                q = q.nextZ;
                if (!q) break;
            }
            qSize = inSize;
            while (pSize > 0 || (qSize > 0 && q)) {
                if (pSize !== 0 && (qSize === 0 || !q || p.z <= q.z)) {
                    e = p;
                    p = p.nextZ;
                    pSize--;
                } else {
                    e = q;
                    q = q.nextZ;
                    qSize--;
                }
                if (tail) tail.nextZ = e;
                else list = e;
                e.prevZ = tail;
                tail = e;
            }
            p = q;
        }
        tail.nextZ = null;
        inSize *= 2;
    } while (numMerges > 1);
    return list;
}
function zOrder(x, y, minX, minY, invSize) {
    x = 32767 * (x - minX) * invSize;
    y = 32767 * (y - minY) * invSize;
    x = (x | (x << 8)) & 16711935;
    x = (x | (x << 4)) & 252645135;
    x = (x | (x << 2)) & 858993459;
    x = (x | (x << 1)) & 1431655765;
    y = (y | (y << 8)) & 16711935;
    y = (y | (y << 4)) & 252645135;
    y = (y | (y << 2)) & 858993459;
    y = (y | (y << 1)) & 1431655765;
    return x | (y << 1);
}
function getLeftmost(start) {
    let p = start;
    let leftmost = start;
    do {
        if (p.x < leftmost.x) leftmost = p;
        p = p.next;
    } while (p !== start);
    return leftmost;
}
function pointInTriangle(ax, ay, bx, by, cx, cy, px, py) {
    return (
        (cx - px) * (ay - py) - (ax - px) * (cy - py) >= 0 &&
        (ax - px) * (by - py) - (bx - px) * (ay - py) >= 0 &&
        (bx - px) * (cy - py) - (cx - px) * (by - py) >= 0
    );
}
function isValidDiagonal(a, b) {
    return (
        a.next.i !== b.i &&
        a.prev.i !== b.i &&
        !intersectsPolygon(a, b) &&
        locallyInside(a, b) &&
        locallyInside(b, a) &&
        middleInside(a, b)
    );
}
function area(p, q, r) {
    return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
}
function equals(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
}
function intersects(p1, q1, p2, q2) {
    if ((equals(p1, q1) && equals(p2, q2)) || (equals(p1, q2) && equals(p2, q1)))
        return true;
    return (
        area(p1, q1, p2) > 0 !== area(p1, q1, q2) > 0 &&
        area(p2, q2, p1) > 0 !== area(p2, q2, q1) > 0
    );
}
function intersectsPolygon(a, b) {
    let p = a;
    do {
        if (
            p.i !== a.i &&
            p.next.i !== a.i &&
            p.i !== b.i &&
            p.next.i !== b.i &&
            intersects(p, p.next, a, b)
        )
            return true;
        p = p.next;
    } while (p !== a);
    return false;
}
function locallyInside(a, b) {
    return area(a.prev, a, a.next) < 0
        ? area(a, b, a.next) >= 0 && area(a, a.prev, b) >= 0
        : area(a, b, a.prev) < 0 || area(a, a.next, b) < 0;
}
function middleInside(a, b) {
    let p = a;
    let inside = false;
    const px = (a.x + b.x) / 2;
    const py = (a.y + b.y) / 2;
    do {
        if (
            p.y > py !== p.next.y > py &&
            p.next.y !== p.y &&
            px < ((p.next.x - p.x) * (py - p.y)) / (p.next.y - p.y) + p.x
        )
            inside = !inside;
        p = p.next;
    } while (p !== a);
    return inside;
}
function splitPolygon(a, b) {
    const a2 = new Node(a.i, a.x, a.y);
    const b2 = new Node(b.i, b.x, b.y);
    const an = a.next;
    const bp = b.prev;
    a.next = b;
    b.prev = a;
    a2.next = an;
    an.prev = a2;
    b2.next = a2;
    a2.prev = b2;
    bp.next = b2;
    b2.prev = bp;
    return b2;
}
function insertNode(i, x, y, last) {
    const p = new Node(i, x, y);
    if (!last) {
        p.prev = p;
        p.next = p;
    } else {
        p.next = last.next;
        p.prev = last;
        last.next.prev = p;
        last.next = p;
    }
    return p;
}
function removeNode(p) {
    p.next.prev = p.prev;
    p.prev.next = p.next;
    if (p.prevZ) p.prevZ.nextZ = p.nextZ;
    if (p.nextZ) p.nextZ.prevZ = p.prevZ;
}
function Node(i, x, y) {
    this.i = i;
    this.x = x;
    this.y = y;
    this.prev = null;
    this.next = null;
    this.z = null;
    this.prevZ = null;
    this.nextZ = null;
    this.steiner = false;
}
earcut.deviation = function (data, holeIndices, dim, triangles) {
    const hasHoles = holeIndices?.length;
    const outerLen = hasHoles ? holeIndices[0] * dim : data.length;
    let polygonArea = Math.abs(signedArea(data, 0, outerLen, dim));
    if (hasHoles) {
        for (let i = 0, len = holeIndices.length; i < len; i++) {
            const start = holeIndices[i] * dim;
            const end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
            polygonArea -= Math.abs(signedArea(data, start, end, dim));
        }
    }
    let trianglesArea = 0;
    for (let i = 0; i < triangles.length; i += 3) {
        const a = triangles[i] * dim;
        const b = triangles[i + 1] * dim;
        const c = triangles[i + 2] * dim;
        trianglesArea += Math.abs(
            (data[a] - data[c]) * (data[b + 1] - data[a + 1]) -
                (data[a] - data[b]) * (data[c + 1] - data[a + 1]),
        );
    }
    return polygonArea === 0 && trianglesArea === 0
        ? 0
        : Math.abs((trianglesArea - polygonArea) / polygonArea);
};
function signedArea(data, start, end, dim) {
    let sum = 0;
    for (let i = start, j = end - dim; i < end; i += dim) {
        sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
        j = i;
    }
    return sum;
}
earcut.flatten = function (data) {
    const dim = data[0][0].length;
    const result = { vertices: [], holes: [], dimensions: dim };
    let holeIndex = 0;
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            for (let d = 0; d < dim; d++) {
                result.vertices.push(data[i][j][d]);
            }
        }
        if (i > 0) {
            holeIndex += data[i - 1].length;
            result.holes.push(holeIndex);
        }
    }
    return result;
};

// ../shared/utils/v2.ts
function min(a, b) {
    return a < b ? a : b;
}
function max(a, b) {
    return a > b ? a : b;
}
var v2 = {
    create(x, y) {
        return { x, y: y ?? x };
    },
    copy(vec) {
        return { x: vec.x, y: vec.y };
    },
    set(a, b) {
        a.x = b.x;
        a.y = b.y;
    },
    add(a, b) {
        return { x: a.x + b.x, y: a.y + b.y };
    },
    sub(a, b) {
        return { x: a.x - b.x, y: a.y - b.y };
    },
    mul(a, s) {
        return { x: a.x * s, y: a.y * s };
    },
    div(a, s) {
        return { x: a.x / s, y: a.y / s };
    },
    neg(a) {
        return { x: -a.x, y: -a.y };
    },
    lengthSqr(a) {
        return a.x * a.x + a.y * a.y;
    },
    length(a) {
        return Math.sqrt(v2.lengthSqr(a));
    },
    normalize(a) {
        const eps = 1e-6;
        const len = v2.length(a);
        return {
            x: len > eps ? a.x / len : a.x,
            y: len > eps ? a.y / len : a.y,
        };
    },
    distance(startPos, finishPos) {
        const diffPos = v2.sub(startPos, finishPos);
        return v2.length(diffPos);
    },
    directionNormalized(a, b) {
        const diffPos = v2.sub(b, a);
        return v2.normalize(diffPos);
    },
    normalizeSafe(a, v = { x: 1, y: 0 }) {
        const eps = 1e-6;
        const len = v2.length(a);
        return {
            x: len > eps ? a.x / len : v.x,
            y: len > eps ? a.y / len : v.y,
        };
    },
    dot(a, b) {
        return a.x * b.x + a.y * b.y;
    },
    perp(a) {
        return { x: -a.y, y: a.x };
    },
    proj(a, b) {
        return v2.mul(b, v2.dot(a, b) / v2.dot(b, b));
    },
    rotate(a, rad) {
        const cosr = Math.cos(rad);
        const sinr = Math.sin(rad);
        return {
            x: a.x * cosr - a.y * sinr,
            y: a.x * sinr + a.y * cosr,
        };
    },
    mulElems(a, b) {
        return { x: a.x * b.x, y: a.y * b.y };
    },
    divElems(a, b) {
        return { x: a.x / b.x, y: a.y / b.y };
    },
    minElems(a, b) {
        return { x: min(a.x, b.x), y: min(a.y, b.y) };
    },
    maxElems(a, b) {
        return { x: max(a.x, b.x), y: max(a.y, b.y) };
    },
    randomUnit() {
        return v2.normalizeSafe(
            v2.create(Math.random() - 0.5, Math.random() - 0.5),
            v2.create(1, 0),
        );
    },
    lerp(t, a, b) {
        return v2.add(v2.mul(a, 1 - t), v2.mul(b, t));
    },
    eq(a, b, epsilon = 1e-4) {
        return Math.abs(a.x - b.x) <= epsilon && Math.abs(a.y - b.y) <= epsilon;
    },
};

// ../shared/utils/math.ts
var kEpsilon = 1e-6;
var math = {
    clamp(a, min2, max2) {
        return a < max2 ? (a > min2 ? a : min2) : max2;
    },
    v2Clamp(vector, minV2, maxV2) {
        let minX;
        let minY;
        let maxX;
        let maxY;
        if (minV2.x > maxV2.x) {
            minX = maxV2.x;
            maxX = minV2.x;
        } else {
            minX = minV2.x;
            maxX = maxV2.x;
        }
        if (minV2.y > maxV2.y) {
            minY = maxV2.y;
            maxY = minV2.y;
        } else {
            minY = minV2.y;
            maxY = maxV2.y;
        }
        const resX = vector.x < maxX ? (vector.x > minX ? vector.x : minX) : maxX;
        const resY = vector.y < maxY ? (vector.y > minY ? vector.y : minY) : maxY;
        return v2.create(resX, resY);
    },
    min(a, b) {
        return a < b ? a : b;
    },
    max(a, b) {
        return a > b ? a : b;
    },
    lerp(t, a, b) {
        return a * (1 - t) + b * t;
    },
    delerp(t, a, b) {
        return math.clamp((t - a) / (b - a), 0, 1);
    },
    v2lerp(t, a, b) {
        return v2.create(math.lerp(t, a.x, b.x), math.lerp(t, a.y, b.y));
    },
    smoothstep(v, a, b) {
        const t = math.clamp((v - a) / (b - a), 0, 1);
        return t * t * (3 - 2 * t);
    },
    easeOutElastic(e, t = 0.3) {
        return Math.pow(2, e * -10) * Math.sin(((e - t / 4) * (Math.PI * 2)) / t) + 1;
    },
    easeOutExpo(e) {
        if (e === 1) {
            return 1;
        }
        return 1 - Math.pow(2, e * -10);
    },
    easeInExpo(e) {
        if (e === 0) {
            return 0;
        }
        return Math.pow(2, (e - 1) * 10);
    },
    easeOutQuart(e) {
        return 1 - Math.pow(1 - e, 4);
    },
    remap(v, a, b, x, y) {
        const t = math.clamp((v - a) / (b - a), 0, 1);
        return math.lerp(t, x, y);
    },
    eqAbs(a, b, eps = kEpsilon) {
        return Math.abs(a - b) < eps;
    },
    eqRel(a, b, eps = kEpsilon) {
        return Math.abs(a - b) <= eps * Math.max(Math.max(1, Math.abs(a)), Math.abs(b));
    },
    deg2rad(deg) {
        return (deg * Math.PI) / 180;
    },
    deg2vec2(deg) {
        deg *= Math.PI / 180;
        return v2.create(Math.cos(deg), Math.sin(deg));
    },
    rad2deg(rad) {
        return (rad * 180) / Math.PI;
    },
    rad2degFromDirection(y, x) {
        const rad = Math.atan2(y, x);
        let angle = (rad * 180) / Math.PI;
        if (angle < 0) {
            angle += 360;
        }
        return angle;
    },
    fract(n) {
        return n - Math.floor(n);
    },
    sign(n) {
        return n < 0 ? -1 : 1;
    },
    mod(num, n) {
        return ((num % n) + n) % n;
    },
    fmod(num, n) {
        return num - Math.floor(num / n) * n;
    },
    angleDiff(a, b) {
        const d = math.fmod(b - a + Math.PI, Math.PI * 2) - Math.PI;
        return d < -Math.PI ? d + Math.PI * 2 : d;
    },
    oriToRad(ori) {
        return (ori % 4) * 0.5 * Math.PI;
    },
    oriToAngle(ori) {
        return ori * (180 / Math.PI);
    },
    radToOri(rad) {
        return Math.floor(math.fmod(rad + Math.PI * 0.25, Math.PI * 2) / (Math.PI * 0.5));
    },
    quantize(f, min2, max2, bits) {
        assert(f >= min2 && f <= max2);
        const range = (1 << bits) - 1;
        const x = math.clamp(f, min2, max2);
        const t = (x - min2) / (max2 - min2);
        const a = t * range + 0.5;
        const b = a < 0 ? Math.ceil(a) : Math.floor(a);
        return min2 + (b / range) * (max2 - min2);
    },
    v2Quantize(v, minX, minY, maxX, maxY, bits) {
        return v2.create(
            math.quantize(v.x, minX, maxX, bits),
            math.quantize(v.y, minY, maxY, bits),
        );
    },
    // Ray-Line and Ray-Polygon implementations from
    // http://ahamnett.blogspot.com/2012/06/raypolygon-intersections.html
    rayLineIntersect(origin, direction, lineA, lineB) {
        const segment = v2.sub(lineB, lineA);
        const segmentPerp = v2.create(segment.y, -segment.x);
        const perpDotDir = v2.dot(direction, segmentPerp);
        if (Math.abs(perpDotDir) <= kEpsilon) return void 0;
        const d = v2.sub(lineA, origin);
        const t = v2.dot(segmentPerp, d) / perpDotDir;
        const s = v2.dot(v2.create(direction.y, -direction.x), d) / perpDotDir;
        return t >= 0 && s >= 0 && s <= 1 ? t : void 0;
    },
    rayPolygonIntersect(origin, direction, vertices) {
        let t = Number.MAX_VALUE;
        let intersected = false;
        for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
            const distance = this.rayLineIntersect(
                origin,
                direction,
                vertices[j],
                vertices[i],
            );
            if (distance !== void 0) {
                if (distance < t) {
                    intersected = true;
                    t = distance;
                }
            }
        }
        return intersected ? t : void 0;
    },
    // https://stackoverflow.com/questions/22521982/js-check-if-point-inside-a-polygon
    pointInsidePolygon(point, poly) {
        const { x } = point;
        const { y } = point;
        let inside = false;
        const count = poly.length;
        for (let i = 0, j = count - 1; i < count; j = i++) {
            const xi = poly[i].x;
            const yi = poly[i].y;
            const xj = poly[j].x;
            const yj = poly[j].y;
            const intersect =
                yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
            if (intersect) {
                inside = !inside;
            }
        }
        return inside;
    },
    distToSegmentSq(p, a, b) {
        const ab = v2.sub(b, a);
        const c = v2.dot(v2.sub(p, a), ab) / v2.dot(ab, ab);
        const d = v2.add(a, v2.mul(ab, math.clamp(c, 0, 1)));
        const e = v2.sub(d, p);
        return v2.dot(e, e);
    },
    distToPolygon(p, poly) {
        let closestDistSq = Number.MAX_VALUE;
        for (let i = 0; i < poly.length; i++) {
            const a = poly[i];
            const b = i === poly.length - 1 ? poly[0] : poly[i + 1];
            const distSq = math.distToSegmentSq(p, a, b);
            if (distSq < closestDistSq) {
                closestDistSq = distSq;
            }
        }
        return Math.sqrt(closestDistSq);
    },
    polygonArea(poly) {
        const verts = [];
        for (let i = 0; i < poly.length; i++) {
            verts.push(poly[i].x);
            verts.push(poly[i].y);
        }
        const idxs = earcut(verts);
        let area2 = 0;
        for (let _i = 0; _i < idxs.length; _i += 3) {
            const idx0 = idxs[_i + 0];
            const idx1 = idxs[_i + 1];
            const idx2 = idxs[_i + 2];
            const ax = verts[idx0 * 2 + 0];
            const ay = verts[idx0 * 2 + 1];
            const bx = verts[idx1 * 2 + 0];
            const by = verts[idx1 * 2 + 1];
            const cx = verts[idx2 * 2 + 0];
            const cy = verts[idx2 * 2 + 1];
            area2 += Math.abs(
                (ax * by + bx * cy + cx * ay - bx * ay - cx * by - ax * cy) * 0.5,
            );
        }
        return area2;
    },
    // http://paulbourke.net/geometry/pointlineplane/javascript.txt
    lineIntersects(x1, y1, x2, y2, x3, y3, x4, y4) {
        if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
            return false;
        }
        const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
        if (denominator === 0) {
            return false;
        }
        const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
        const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;
        if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
            return false;
        }
        const x = x1 + ua * (x2 - x1);
        const y = y1 + ua * (y2 - y1);
        return { x, y };
    },
    // functions not copied from surviv
    addAdjust(pos1, pos, ori) {
        if (ori === 0) return v2.add(pos1, pos);
        let xOffset, yOffset;
        switch (ori) {
            case 1:
                xOffset = -pos.y;
                yOffset = pos.x;
                break;
            case 2:
                xOffset = -pos.x;
                yOffset = -pos.y;
                break;
            case 3:
                xOffset = pos.y;
                yOffset = -pos.x;
                break;
        }
        return v2.add(pos1, v2.create(xOffset, yOffset));
    },
};

// ../shared/utils/util.ts
function assert(value, message) {
    if (!value) {
        const error =
            message instanceof Error
                ? message
                : new Error(message ?? "Assertation failed");
        throw error;
    }
}
var util = {
    //
    // Game objects can belong to the following layers:
    //   0: ground layer
    //   1: bunker layer
    //   2: ground and stairs (both)
    //   3: bunker and stairs (both)
    //
    // Objects on the same layer should interact with one another.
    sameLayer(a, b) {
        return (a & 1) === (b & 1) || (a & 2 && b & 2);
    },
    sameAudioLayer(a, b) {
        return a === b || a & 2 || b & 2;
    },
    toGroundLayer(a) {
        return a & 1;
    },
    toStairsLayer(a) {
        return a & 1;
    },
    random(min2, max2) {
        return math.lerp(Math.random(), min2, max2);
    },
    randomInt(min2, max2) {
        min2 = Math.ceil(min2);
        max2 = Math.floor(max2);
        return Math.floor(Math.random() * (max2 - min2 + 1)) + min2;
    },
    // Uniformly distributed random point within circle
    // Taken from https://stackoverflow.com/questions/5837572/generate-a-random-point-within-a-circle-uniformly
    randomPointInCircle(rad) {
        let a = Math.random();
        let b = Math.random();
        if (b < a) {
            const c = a;
            a = b;
            b = c;
        }
        const pos = v2.create(
            b * rad * Math.cos((2 * Math.PI * a) / b),
            b * rad * Math.sin((2 * Math.PI * a) / b),
        );
        return pos;
    },
    randomPointInAabb(aabb) {
        return v2.create(
            util.random(aabb.min.x, aabb.max.x),
            util.random(aabb.min.y, aabb.max.y),
        );
    },
    seededRand(seed) {
        let rng = seed;
        return function (min2 = 0, max2 = 1) {
            rng = (rng * 16807) % 2147483647;
            const t = rng / 2147483647;
            return math.lerp(t, min2, max2);
        };
    },
    // Taken from: https://gist.github.com/mjackson/5311256
    rgbToHsv(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const max2 = Math.max(r, g, b);
        const min2 = Math.min(r, g, b);
        let h = 0;
        let s = 0;
        const v = max2;
        const d = max2 - min2;
        s = max2 == 0 ? 0 : d / max2;
        if (max2 == min2) {
            h = 0;
        } else {
            switch (max2) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        return { h, s, v };
    },
    // Taken from: https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
    hsvToRgb(h, s, v) {
        let r = 0;
        let g = 0;
        let b = 0;
        let i = 0;
        let f = 0;
        let p = 0;
        let q = 0;
        let t = 0;
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0:
                r = v;
                g = t;
                b = p;
                break;
            case 1:
                r = q;
                g = v;
                b = p;
                break;
            case 2:
                r = p;
                g = v;
                b = t;
                break;
            case 3:
                r = p;
                g = q;
                b = v;
                break;
            case 4:
                r = t;
                g = p;
                b = v;
                break;
            case 5:
                r = v;
                g = p;
                b = q;
                break;
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255),
        };
    },
    adjustValue(tint, value) {
        let r = (tint >> 16) & 255;
        let g = (tint >> 8) & 255;
        let b = tint & 255;
        r = Math.round(r * value);
        g = Math.round(g * value);
        b = Math.round(b * value);
        return (r << 16) + (g << 8) + b;
    },
    lerpColor(t, start, end) {
        const toLinear = function toLinear2(c) {
            return {
                r: c.r ** 2.2,
                g: c.g ** 2.2,
                b: c.b ** 2.2,
            };
        };
        const toSRGB = function toSRGB2(c) {
            return {
                r: c.r ** (1 / 2.2),
                g: c.g ** (1 / 2.2),
                b: c.b ** (1 / 2.2),
            };
        };
        const s = toLinear(util.intToRgb(start));
        const e = toLinear(util.intToRgb(end));
        return util.rgbToInt(
            toSRGB({
                r: math.lerp(t, s.r, e.r),
                g: math.lerp(t, s.g, e.g),
                b: math.lerp(t, s.b, e.b),
            }),
        );
    },
    rgbToInt(c) {
        return (c.r << 16) + (c.g << 8) + c.b;
    },
    intToRgb(c) {
        return {
            r: (c >> 16) & 255,
            g: (c >> 8) & 255,
            b: c & 255,
        };
    },
    // https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    rgbToHex(c) {
        const rgb = util.rgbToInt(c);
        return `#${(16777216 + rgb).toString(16).slice(-6)}`;
    },
    // https://stackoverflow.com/questions/13348129/using-native-javascript-to-desaturate-a-colour
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                  r: parseInt(result[1], 16),
                  g: parseInt(result[2], 16),
                  b: parseInt(result[3], 16),
              }
            : null;
    },
    intToHex(int) {
        return `#${(16777216 + int).toString(16).slice(-6)}`;
    },
    hexToInt(hex) {
        return parseInt(hex.slice(-6), 16);
    },
    updateColor(sat, hex) {
        sat /= 100;
        const col = util.hexToRgb(hex);
        const black = 0;
        col.r = Math.round(col.r * sat + black * (1 - sat));
        col.g = Math.round(col.g * sat + black * (1 - sat));
        col.b = Math.round(col.b * sat + black * (1 - sat));
        const out = util.rgbToInt(col);
        return out;
    },
    // Taken from https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
    isObject(item) {
        return (
            item &&
            (typeof item === "undefined" ? "undefined" : typeof item) === "object" &&
            !Array.isArray(item)
        );
    },
    mergeDeep(target, ...sources) {
        if (!sources.length) return target;
        const source = sources.shift();
        if (this.isObject(target) && this.isObject(source)) {
            for (const key in source) {
                if (this.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    this.mergeDeep(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }
        return this.mergeDeep(target, ...sources);
    },
    cloneDeep(source) {
        return util.mergeDeep({}, source);
    },
    shuffleArray(arr) {
        for (let i = arr.length - 1; i >= 0; i--) {
            const idx = Math.floor(Math.random() * (i + 1));
            const tmp = arr[i];
            arr[i] = arr[idx];
            arr[idx] = tmp;
        }
    },
    wrappedArrayIndex(arr, index) {
        return arr.at(index % arr.length);
    },
    weightedRandom(items) {
        let total = 0;
        for (let i = 0; i < items.length; i++) {
            total += items[i].weight;
        }
        let rng = util.random(0, total);
        let idx = 0;
        while (rng > items[idx].weight) {
            rng -= items[idx].weight;
            idx++;
        }
        return items[idx];
    },
};

// ../server/src/config.ts
var __vite_injected_original_dirname =
    "C:\\Users\\rust\\Desktop\\projects\\survev-prod\\server\\src";
var isProduction = process.env["NODE_ENV"] === "production";
var Config = {
    devServer: {
        host: "127.0.0.1",
        port: 8001,
    },
    apiServer: {
        host: "0.0.0.0",
        port: 8e3,
    },
    gameServer: {
        host: "0.0.0.0",
        port: 8001,
        apiServerUrl: "http://127.0.0.1:8000",
    },
    apiKey: "Kongregate Sucks",
    /*
    a random string, should be private.
  */
    encryptLoadoutSecret: "IiRH2yg42jyp24qAAdLB6",
    // OAUTH PROVIDERS
    DISCORD_CLIENT_ID: "",
    DISCORD_SECRET_ID: "",
    GOOGLE_CLIENT_ID: "",
    GOOGLE_SECRET_ID: "",
    modes: [
        { mapName: "snow", teamMode: 1 /* Solo */, enabled: true },
        { mapName: "snow", teamMode: 2 /* Duo */, enabled: true },
        { mapName: "snow", teamMode: 4 /* Squad */, enabled: true },
    ],
    regions: {},
    debug: {
        spawnMode: "default",
    },
    accountsEnabled: true,
    rateLimitsEnabled: isProduction,
    client: {
        AIP_ID: void 0,
        AIP_PLACEMENT_ID: void 0,
        GAMEMONETIZE_ID: void 0,
        theme: "snow",
    },
    protection: {
        TURNSTILE_SITE_KEY: void 0,
        TURNSTILE_SECRET_KEY: void 0,
    },
    thisRegion: "local",
    gameTps: 100,
    netSyncTps: 33,
    processMode: isProduction ? "multi" : "single",
    perfLogging: {
        enabled: true,
        time: 10,
    },
    gameConfig: {},
};
if (!isProduction) {
    util.mergeDeep(Config, {
        regions: {
            local: {
                https: false,
                address: `${Config.devServer.host}:${Config.devServer.port}`,
                l10n: "index-local",
            },
        },
    });
}
var runningOnVite = process.argv.toString().includes("vite");
var configPath = path.join(
    __vite_injected_original_dirname,
    isProduction && !runningOnVite ? "../../" : "",
    "../../",
);
function loadConfig(fileName, create) {
    const path2 = `${configPath}${fileName}`;
    let loaded = false;
    if (fs.existsSync(path2)) {
        const localConfig = JSON.parse(fs.readFileSync(path2).toString());
        util.mergeDeep(Config, localConfig);
        loaded = true;
    } else if (create) {
        console.log("Config file doesn't exist... creating");
        fs.writeFileSync(path2, JSON.stringify({}, null, 2));
    }
    util.mergeDeep(GameConfig, Config.gameConfig);
    return loaded;
}
if (!loadConfig("resurviv-config.json")) {
    loadConfig("survev-config.json", true);
}

// ../server/src/utils/gitRevision.ts
import { execSync } from "child_process";
var GIT_VERSION = "Unknown";
try {
    GIT_VERSION = execSync("git rev-parse HEAD").toString().trim();
} catch (error) {
    console.error(`Failed to parse git revision: `, error);
}

// vite.config.mts
import { createHtmlPlugin } from "file:///C:/Users/rust/Desktop/projects/survev-prod/node_modules/.pnpm/vite-plugin-html@3.2.2_vite@5.4.11_@types+node@22.10.2_terser@5.37.0_/node_modules/vite-plugin-html/dist/index.mjs";
var SplashThemes = {
    main: {
        MENU_MUSIC: "audio/ambient/menu_music_01.mp3",
        SPLASH_BG: "/img/main_splash.png",
    },
    easter: {
        MENU_MUSIC: "audio/ambient/menu_music_01.mp3",
        SPLASH_BG: "/img/main_splash_easter.png",
    },
    halloween: {
        MENU_MUSIC: "audio/ambient/menu_music_02.mp3",
        SPLASH_BG: "/img/main_splash_halloween.png",
    },
    faction: {
        MENU_MUSIC: "audio/ambient/menu_music_01.mp3",
        SPLASH_BG: "/img/main_splash_0_7_0.png",
    },
    snow: {
        MENU_MUSIC: "audio/ambient/menu_music_01.mp3",
        SPLASH_BG: "/img/main_splash_0_6_10.png",
    },
    spring: {
        MENU_MUSIC: "audio/ambient/menu_music_01.mp3",
        SPLASH_BG: "/img/main_splash_7_3.png",
    },
};
var selectedTheme = SplashThemes[Config.client.theme];
var AdsVars = {
    VITE_ADIN_PLAY_SCRIPT: `
    <script>
		const urlParams = new URLSearchParams(self.location.search);

		const isCrazyGames = urlParams.has("crazygames");

		const isPOKI = window != window.parent && new URL(document.referrer).origin.includes("poki");

		const isWithinGameMonetize = window != window.parent && new URL(document.referrer).origin.includes("gamemonetize") || window.location.href.includes("gamemonetize");
		
		if (!isCrazyGames && !isPOKI && !isWithinGameMonetize) {
			const script = document.createElement("script");

			script.src = "//api.adinplay.com/libs/aiptag/pub/SNP/${Config.client.AIP_ID}/tag.min.js";

			document.head.appendChild(script);


			window.aiptag = window.aiptag || { cmd: [] };
       		aiptag.cmd.display = aiptag.cmd.display || [];

            // CMP tool settings
        	aiptag.cmp = {
            	show: true,
            	position: "centered", // centered, bottom
            	button: false,
            	buttonText: "Privacy settings",
            	buttonPosition: "bottom-left", // bottom-left, bottom-right, top-left, top-right
        	};

			script.addEventListener("load", () => {
				window.aiptag.cmd.display.push(() => {
                	window.aipDisplayTag.display("${Config.client.AIP_PLACEMENT_ID}_728x90");
            	});
			});
		}
    </script>
    `,
    VITE_AIP_PLACEMENT_ID: Config.client.AIP_PLACEMENT_ID,
};
if (!Config.client.AIP_ID) {
    for (const key in AdsVars) {
        AdsVars[key] = "";
    }
}
var TurnstileVars = {
    VITE_TURNSTILE_SCRIPT: `
    <script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        defer
    ></script>`,
};
if (!Config.protection.TURNSTILE_SITE_KEY) {
    for (const key in TurnstileVars) {
        TurnstileVars[key] = "";
    }
}
var vite_config_default = defineConfig(({ mode }) => {
    process.env = {
        ...process.env,
        VITE_GAME_VERSION: version,
        VITE_BACKGROUND_IMG: selectedTheme.SPLASH_BG,
        VITE_GAMEMONETIZE_ID: Config.client.GAMEMONETIZE_ID || "",
        ...AdsVars,
        ...TurnstileVars,
    };
    const regions = {
        ...Config.regions,
        ...(mode === "development"
            ? {
                  local: {
                      https: false,
                      address: `${Config.devServer.host}:${Config.devServer.port}`,
                      l10n: "index-local",
                  },
              }
            : {}),
    };
    return {
        base: "",
        build: {
            chunkSizeWarningLimit: 2e3,
            rollupOptions: {
                output: {
                    assetFileNames(assetInfo) {
                        if (assetInfo.name?.endsWith(".css")) {
                            return "css/[name]-[hash][extname]";
                        }
                        return "assets/[name]-[hash][extname]";
                    },
                    entryFileNames: "js/app-[hash].js",
                    chunkFileNames: "js/[name]-[hash].js",
                    manualChunks(id, _chunkInfo) {
                        if (id.includes("node_modules")) {
                            return "vendor";
                        }
                        if (id.includes("shared")) {
                            return "shared";
                        }
                    },
                },
            },
        },
        resolve: {
            extensions: [".js", ".ts"],
        },
        define: {
            GAME_REGIONS: regions,
            GIT_VERSION: JSON.stringify(GIT_VERSION),
            PING_TEST_URLS: Object.entries(regions).map(([key, data]) => {
                return {
                    region: key,
                    zone: key,
                    url: data.address,
                    https: data.https,
                };
            }),
            MENU_MUSIC: JSON.stringify(selectedTheme.MENU_MUSIC),
            AIP_PLACEMENT_ID: JSON.stringify(Config.client.AIP_PLACEMENT_ID),
            TURNSTILE_SITE_KEY: JSON.stringify(Config.protection.TURNSTILE_SITE_KEY),
        },
        plugins: [
            createHtmlPlugin(),
            mode !== "development"
                ? stripBlockPlugin({
                      start: "STRIP_FROM_PROD_CLIENT:START",
                      end: "STRIP_FROM_PROD_CLIENT:END",
                  })
                : void 0,
        ],
        json: {
            stringify: true,
        },
        assetsInclude: ["**/*.ejs"],
        server: {
            port: 3e3,
            strictPort: true,
            host: "0.0.0.0",
            proxy: {
                "/api": {
                    target: `http://${Config.apiServer.host}:${Config.apiServer.port}`,
                    changeOrigin: true,
                    secure: false,
                },
                "/team_v2": {
                    target: `http://${Config.apiServer.host}:${Config.apiServer.port}`,
                    changeOrigin: true,
                    secure: false,
                    ws: true,
                },
            },
        },
        preview: {
            port: 3e3,
            strictPort: true,
            host: "0.0.0.0",
            proxy: {
                "/api": {
                    target: `http://${Config.apiServer.host}:${Config.apiServer.port}`,
                    changeOrigin: true,
                    secure: false,
                },
                "/team_v2": {
                    target: `http://${Config.apiServer.host}:${Config.apiServer.port}`,
                    changeOrigin: true,
                    secure: false,
                    ws: true,
                },
            },
        },
    };
});
export { SplashThemes, vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIiwgIi4uL3BhY2thZ2UuanNvbiIsICIuLi9zZXJ2ZXIvc3JjL2NvbmZpZy50cyIsICIuLi9zaGFyZWQvZ2FtZUNvbmZpZy50cyIsICIuLi9zaGFyZWQvdXRpbHMvZWFyY3V0LmpzIiwgIi4uL3NoYXJlZC91dGlscy92Mi50cyIsICIuLi9zaGFyZWQvdXRpbHMvbWF0aC50cyIsICIuLi9zaGFyZWQvdXRpbHMvdXRpbC50cyIsICIuLi9zZXJ2ZXIvc3JjL3V0aWxzL2dpdFJldmlzaW9uLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxccnVzdFxcXFxEZXNrdG9wXFxcXHByb2plY3RzXFxcXHN1cnZldi1wcm9kXFxcXGNsaWVudFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxccnVzdFxcXFxEZXNrdG9wXFxcXHByb2plY3RzXFxcXHN1cnZldi1wcm9kXFxcXGNsaWVudFxcXFx2aXRlLmNvbmZpZy5tdHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3J1c3QvRGVza3RvcC9wcm9qZWN0cy9zdXJ2ZXYtcHJvZC9jbGllbnQvdml0ZS5jb25maWcubXRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCBzdHJpcEJsb2NrUGx1Z2luIGZyb20gXCJ2aXRlLXBsdWdpbi1zdHJpcC1ibG9ja1wiO1xuaW1wb3J0IHsgdmVyc2lvbiB9IGZyb20gXCIuLi9wYWNrYWdlLmpzb25cIjtcbmltcG9ydCB7IENvbmZpZyB9IGZyb20gXCIuLi9zZXJ2ZXIvc3JjL2NvbmZpZ1wiO1xuaW1wb3J0IHsgR0lUX1ZFUlNJT04gfSBmcm9tIFwiLi4vc2VydmVyL3NyYy91dGlscy9naXRSZXZpc2lvblwiO1xuaW1wb3J0IHsgY3JlYXRlSHRtbFBsdWdpbiB9IGZyb20gJ3ZpdGUtcGx1Z2luLWh0bWwnXG5cbmV4cG9ydCBjb25zdCBTcGxhc2hUaGVtZXMgPSB7XG4gICAgbWFpbjoge1xuICAgICAgICBNRU5VX01VU0lDOiBcImF1ZGlvL2FtYmllbnQvbWVudV9tdXNpY18wMS5tcDNcIixcbiAgICAgICAgU1BMQVNIX0JHOiBcIi9pbWcvbWFpbl9zcGxhc2gucG5nXCIsXG4gICAgfSxcbiAgICBlYXN0ZXI6IHtcbiAgICAgICAgTUVOVV9NVVNJQzogXCJhdWRpby9hbWJpZW50L21lbnVfbXVzaWNfMDEubXAzXCIsXG4gICAgICAgIFNQTEFTSF9CRzogXCIvaW1nL21haW5fc3BsYXNoX2Vhc3Rlci5wbmdcIixcbiAgICB9LFxuICAgIGhhbGxvd2Vlbjoge1xuICAgICAgICBNRU5VX01VU0lDOiBcImF1ZGlvL2FtYmllbnQvbWVudV9tdXNpY18wMi5tcDNcIixcbiAgICAgICAgU1BMQVNIX0JHOiBcIi9pbWcvbWFpbl9zcGxhc2hfaGFsbG93ZWVuLnBuZ1wiLFxuICAgIH0sXG4gICAgZmFjdGlvbjoge1xuICAgICAgICBNRU5VX01VU0lDOiBcImF1ZGlvL2FtYmllbnQvbWVudV9tdXNpY18wMS5tcDNcIixcbiAgICAgICAgU1BMQVNIX0JHOiBcIi9pbWcvbWFpbl9zcGxhc2hfMF83XzAucG5nXCIsXG4gICAgfSxcbiAgICBzbm93OiB7XG4gICAgICAgIE1FTlVfTVVTSUM6IFwiYXVkaW8vYW1iaWVudC9tZW51X211c2ljXzAxLm1wM1wiLFxuICAgICAgICBTUExBU0hfQkc6IFwiL2ltZy9tYWluX3NwbGFzaF8wXzZfMTAucG5nXCIsXG4gICAgfSxcbiAgICBzcHJpbmc6IHtcbiAgICAgICAgTUVOVV9NVVNJQzogXCJhdWRpby9hbWJpZW50L21lbnVfbXVzaWNfMDEubXAzXCIsXG4gICAgICAgIFNQTEFTSF9CRzogXCIvaW1nL21haW5fc3BsYXNoXzdfMy5wbmdcIixcbiAgICB9LFxufTtcblxuY29uc3Qgc2VsZWN0ZWRUaGVtZSA9IFNwbGFzaFRoZW1lc1tDb25maWcuY2xpZW50LnRoZW1lXTtcblxuY29uc3QgQWRzVmFyczogUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgdW5kZWZpbmVkPiA9IHtcbiAgICBWSVRFX0FESU5fUExBWV9TQ1JJUFQ6IGBcbiAgICA8c2NyaXB0PlxuXHRcdGNvbnN0IHVybFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoc2VsZi5sb2NhdGlvbi5zZWFyY2gpO1xuXG5cdFx0Y29uc3QgaXNDcmF6eUdhbWVzID0gdXJsUGFyYW1zLmhhcyhcImNyYXp5Z2FtZXNcIik7XG5cblx0XHRjb25zdCBpc1BPS0kgPSB3aW5kb3cgIT0gd2luZG93LnBhcmVudCAmJiBuZXcgVVJMKGRvY3VtZW50LnJlZmVycmVyKS5vcmlnaW4uaW5jbHVkZXMoXCJwb2tpXCIpO1xuXG5cdFx0Y29uc3QgaXNXaXRoaW5HYW1lTW9uZXRpemUgPSB3aW5kb3cgIT0gd2luZG93LnBhcmVudCAmJiBuZXcgVVJMKGRvY3VtZW50LnJlZmVycmVyKS5vcmlnaW4uaW5jbHVkZXMoXCJnYW1lbW9uZXRpemVcIikgfHwgd2luZG93LmxvY2F0aW9uLmhyZWYuaW5jbHVkZXMoXCJnYW1lbW9uZXRpemVcIik7XG5cdFx0XG5cdFx0aWYgKCFpc0NyYXp5R2FtZXMgJiYgIWlzUE9LSSAmJiAhaXNXaXRoaW5HYW1lTW9uZXRpemUpIHtcblx0XHRcdGNvbnN0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7XG5cblx0XHRcdHNjcmlwdC5zcmMgPSBcIi8vYXBpLmFkaW5wbGF5LmNvbS9saWJzL2FpcHRhZy9wdWIvU05QLyR7Q29uZmlnLmNsaWVudC5BSVBfSUR9L3RhZy5taW4uanNcIjtcblxuXHRcdFx0ZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpO1xuXG5cblx0XHRcdHdpbmRvdy5haXB0YWcgPSB3aW5kb3cuYWlwdGFnIHx8IHsgY21kOiBbXSB9O1xuICAgICAgIFx0XHRhaXB0YWcuY21kLmRpc3BsYXkgPSBhaXB0YWcuY21kLmRpc3BsYXkgfHwgW107XG5cbiAgICAgICAgICAgIC8vIENNUCB0b29sIHNldHRpbmdzXG4gICAgICAgIFx0YWlwdGFnLmNtcCA9IHtcbiAgICAgICAgICAgIFx0c2hvdzogdHJ1ZSxcbiAgICAgICAgICAgIFx0cG9zaXRpb246IFwiY2VudGVyZWRcIiwgLy8gY2VudGVyZWQsIGJvdHRvbVxuICAgICAgICAgICAgXHRidXR0b246IGZhbHNlLFxuICAgICAgICAgICAgXHRidXR0b25UZXh0OiBcIlByaXZhY3kgc2V0dGluZ3NcIixcbiAgICAgICAgICAgIFx0YnV0dG9uUG9zaXRpb246IFwiYm90dG9tLWxlZnRcIiwgLy8gYm90dG9tLWxlZnQsIGJvdHRvbS1yaWdodCwgdG9wLWxlZnQsIHRvcC1yaWdodFxuICAgICAgICBcdH07XG5cblx0XHRcdHNjcmlwdC5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCAoKSA9PiB7XG5cdFx0XHRcdHdpbmRvdy5haXB0YWcuY21kLmRpc3BsYXkucHVzaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgXHR3aW5kb3cuYWlwRGlzcGxheVRhZy5kaXNwbGF5KFwiJHtDb25maWcuY2xpZW50LkFJUF9QTEFDRU1FTlRfSUR9XzcyOHg5MFwiKTtcbiAgICAgICAgICAgIFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9XG4gICAgPC9zY3JpcHQ+XG4gICAgYCxcbiAgICBWSVRFX0FJUF9QTEFDRU1FTlRfSUQ6IENvbmZpZy5jbGllbnQuQUlQX1BMQUNFTUVOVF9JRCxcbn07XG5cbmlmICghQ29uZmlnLmNsaWVudC5BSVBfSUQpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBBZHNWYXJzKSB7XG4gICAgICAgIEFkc1ZhcnNba2V5XSA9IFwiXCI7XG4gICAgfVxufVxuXG5jb25zdCBUdXJuc3RpbGVWYXJzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCB1bmRlZmluZWQ+ID0ge1xuICAgIFZJVEVfVFVSTlNUSUxFX1NDUklQVDogYFxuICAgIDxzY3JpcHRcbiAgICAgICAgc3JjPVwiaHR0cHM6Ly9jaGFsbGVuZ2VzLmNsb3VkZmxhcmUuY29tL3R1cm5zdGlsZS92MC9hcGkuanM/cmVuZGVyPWV4cGxpY2l0XCJcbiAgICAgICAgZGVmZXJcbiAgICA+PC9zY3JpcHQ+YCxcbn07XG5cbmlmICghQ29uZmlnLnByb3RlY3Rpb24uVFVSTlNUSUxFX1NJVEVfS0VZKSB7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gVHVybnN0aWxlVmFycykge1xuICAgICAgICBUdXJuc3RpbGVWYXJzW2tleV0gPSBcIlwiO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICAgIHByb2Nlc3MuZW52ID0ge1xuICAgICAgICAuLi5wcm9jZXNzLmVudixcbiAgICAgICAgVklURV9HQU1FX1ZFUlNJT046IHZlcnNpb24sXG4gICAgICAgIFZJVEVfQkFDS0dST1VORF9JTUc6IHNlbGVjdGVkVGhlbWUuU1BMQVNIX0JHLFxuICAgICAgICBWSVRFX0dBTUVNT05FVElaRV9JRDogQ29uZmlnLmNsaWVudC5HQU1FTU9ORVRJWkVfSUQgfHwgXCJcIixcbiAgICAgICAgLi4uQWRzVmFycyxcbiAgICAgICAgLi4uVHVybnN0aWxlVmFycyxcbiAgICB9O1xuICAgIFxuICAgIGNvbnN0IHJlZ2lvbnMgPSB7XG4gICAgICAgIC4uLkNvbmZpZy5yZWdpb25zLFxuICAgICAgICAuLi4obW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiXG4gICAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgICAgIGxvY2FsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgaHR0cHM6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgIGFkZHJlc3M6IGAke0NvbmZpZy5kZXZTZXJ2ZXIuaG9zdH06JHtDb25maWcuZGV2U2VydmVyLnBvcnR9YCxcbiAgICAgICAgICAgICAgICAgICAgICBsMTBuOiBcImluZGV4LWxvY2FsXCIsXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICA6IHt9KSxcbiAgICB9O1xuICAgIHJldHVybiB7XG4gICAgICAgIGJhc2U6IFwiXCIsXG4gICAgICAgIGJ1aWxkOiB7XG4gICAgICAgICAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDIwMDAsXG4gICAgICAgICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgICAgICAgICAgIGFzc2V0RmlsZU5hbWVzKGFzc2V0SW5mbykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFzc2V0SW5mby5uYW1lPy5lbmRzV2l0aChcIi5jc3NcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJjc3MvW25hbWVdLVtoYXNoXVtleHRuYW1lXVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiYXNzZXRzL1tuYW1lXS1baGFzaF1bZXh0bmFtZV1cIjtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZW50cnlGaWxlTmFtZXM6IFwianMvYXBwLVtoYXNoXS5qc1wiLFxuICAgICAgICAgICAgICAgICAgICBjaHVua0ZpbGVOYW1lczogXCJqcy9bbmFtZV0tW2hhc2hdLmpzXCIsXG4gICAgICAgICAgICAgICAgICAgIG1hbnVhbENodW5rcyhpZCwgX2NodW5rSW5mbykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwibm9kZV9tb2R1bGVzXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwidmVuZG9yXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJzaGFyZWRcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJzaGFyZWRcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgZXh0ZW5zaW9uczogW1wiLmpzXCIsIFwiLnRzXCJdLFxuICAgICAgICB9LFxuICAgICAgICBkZWZpbmU6IHtcbiAgICAgICAgICAgIEdBTUVfUkVHSU9OUzogcmVnaW9ucyxcbiAgICAgICAgICAgIEdJVF9WRVJTSU9OOiBKU09OLnN0cmluZ2lmeShHSVRfVkVSU0lPTiksXG4gICAgICAgICAgICBQSU5HX1RFU1RfVVJMUzogT2JqZWN0LmVudHJpZXMocmVnaW9ucykubWFwKChba2V5LCBkYXRhXSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHJlZ2lvbjoga2V5LFxuICAgICAgICAgICAgICAgICAgICB6b25lOiBrZXksXG4gICAgICAgICAgICAgICAgICAgIHVybDogZGF0YS5hZGRyZXNzLFxuICAgICAgICAgICAgICAgICAgICBodHRwczogZGF0YS5odHRwcyxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBNRU5VX01VU0lDOiBKU09OLnN0cmluZ2lmeShzZWxlY3RlZFRoZW1lLk1FTlVfTVVTSUMpLFxuICAgICAgICAgICAgQUlQX1BMQUNFTUVOVF9JRDogSlNPTi5zdHJpbmdpZnkoQ29uZmlnLmNsaWVudC5BSVBfUExBQ0VNRU5UX0lEKSxcbiAgICAgICAgICAgIFRVUk5TVElMRV9TSVRFX0tFWTogSlNPTi5zdHJpbmdpZnkoQ29uZmlnLnByb3RlY3Rpb24uVFVSTlNUSUxFX1NJVEVfS0VZKSxcbiAgICAgICAgfSxcbiAgICAgICAgcGx1Z2luczogW1xuICAgICAgICAgICAgY3JlYXRlSHRtbFBsdWdpbigpLFxuICAgICAgICAgICAgbW9kZSAhPT0gXCJkZXZlbG9wbWVudFwiXG4gICAgICAgICAgICAgICAgPyBzdHJpcEJsb2NrUGx1Z2luKHtcbiAgICAgICAgICAgICAgICAgICAgICBzdGFydDogXCJTVFJJUF9GUk9NX1BST0RfQ0xJRU5UOlNUQVJUXCIsXG4gICAgICAgICAgICAgICAgICAgICAgZW5kOiBcIlNUUklQX0ZST01fUFJPRF9DTElFTlQ6RU5EXCIsXG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICBdLFxuICAgICAgICBqc29uOiB7XG4gICAgICAgICAgICBzdHJpbmdpZnk6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIGFzc2V0c0luY2x1ZGU6IFtcIioqLyouZWpzXCJdLFxuICAgICAgICBzZXJ2ZXI6IHtcbiAgICAgICAgICAgIHBvcnQ6IDMwMDAsXG4gICAgICAgICAgICBzdHJpY3RQb3J0OiB0cnVlLFxuICAgICAgICAgICAgaG9zdDogXCIwLjAuMC4wXCIsXG4gICAgICAgICAgICBwcm94eToge1xuICAgICAgICAgICAgICAgIFwiL2FwaVwiOiB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldDogYGh0dHA6Ly8ke0NvbmZpZy5hcGlTZXJ2ZXIuaG9zdH06JHtDb25maWcuYXBpU2VydmVyLnBvcnR9YCxcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBzZWN1cmU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCIvdGVhbV92MlwiOiB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldDogYGh0dHA6Ly8ke0NvbmZpZy5hcGlTZXJ2ZXIuaG9zdH06JHtDb25maWcuYXBpU2VydmVyLnBvcnR9YCxcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBzZWN1cmU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICB3czogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgcHJldmlldzoge1xuICAgICAgICAgICAgcG9ydDogMzAwMCxcbiAgICAgICAgICAgIHN0cmljdFBvcnQ6IHRydWUsXG4gICAgICAgICAgICBob3N0OiBcIjAuMC4wLjBcIixcbiAgICAgICAgICAgIHByb3h5OiB7XG4gICAgICAgICAgICAgICAgXCIvYXBpXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiBgaHR0cDovLyR7Q29uZmlnLmFwaVNlcnZlci5ob3N0fToke0NvbmZpZy5hcGlTZXJ2ZXIucG9ydH1gLFxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHNlY3VyZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcIi90ZWFtX3YyXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiBgaHR0cDovLyR7Q29uZmlnLmFwaVNlcnZlci5ob3N0fToke0NvbmZpZy5hcGlTZXJ2ZXIucG9ydH1gLFxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHNlY3VyZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHdzOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgIH07XG59KTtcbiIsICJ7XHJcbiAgXCJuYW1lXCI6IFwic3VydmV2XCIsXHJcbiAgXCJ2ZXJzaW9uXCI6IFwiMC4wLjE2XCIsXHJcbiAgXCJkZXNjcmlwdGlvblwiOiBcIk9wZW4gU291cmNlIFN1cnZpdi5pbyBTZXJ2ZXJcIixcclxuICBcInNjcmlwdHNcIjoge1xyXG4gICAgXCJkZXY6c2VydmVyXCI6IFwiY2Qgc2VydmVyICYmIHBucG0gZGV2XCIsXHJcbiAgICBcImRldjpjbGllbnRcIjogXCJjZCBjbGllbnQgJiYgcG5wbSBkZXZcIixcclxuICAgIFwibGludFwiOiBcImJpb21lIGNoZWNrIC0td3JpdGVcIixcclxuICAgIFwibGludDpjaVwiOiBcImJpb21lIGNoZWNrXCJcclxuICB9LFxyXG4gIFwiZW5naW5lc1wiOiB7XHJcbiAgICBcIm5vZGVcIjogXCI+PTIwLjAuMFwiXHJcbiAgfSxcclxuICBcImF1dGhvclwiOiBcIkxlaWFcIixcclxuICBcImxpY2Vuc2VcIjogXCJHUEwtMy4wLW9yLWxhdGVyXCIsXHJcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xyXG4gICAgXCJAYmlvbWVqcy9iaW9tZVwiOiBcIl4xLjkuNFwiLFxyXG4gICAgXCJAdHlwZXMvbm9kZVwiOiBcIl4yMi4xMC4yXCIsXHJcbiAgICBcInR5cGVzY3JpcHRcIjogXCJeNS43LjJcIlxyXG4gIH0sXHJcbiAgXCJ3b3Jrc3BhY2VzXCI6IFtcclxuICAgIFwiY2xpZW50XCIsXHJcbiAgICBcInNlcnZlclwiLFxyXG4gICAgXCJzaGFyZWRcIlxyXG4gIF0sXHJcbiAgXCJwYWNrYWdlTWFuYWdlclwiOiBcInBucG1AOS4xNS4wK3NoYTUxMi43NmUyMzc5NzYwYTQzMjhlYzQ0MTU4MTViY2Q2NjI4ZGVlNzI3YWYzNzc5YWFhNGM5MTRlMzk0NDE1NmM0Mjk5OTIxYTg5Zjk3NjM4MWVlMTA3ZDQxZjEyY2ZhNGI2NjY4MWNhOWM3MThmMDY2OGZhMDgzMWVkNGM2ZDhiYTU2Y1wiXHJcbn1cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxydXN0XFxcXERlc2t0b3BcXFxccHJvamVjdHNcXFxcc3VydmV2LXByb2RcXFxcc2VydmVyXFxcXHNyY1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxccnVzdFxcXFxEZXNrdG9wXFxcXHByb2plY3RzXFxcXHN1cnZldi1wcm9kXFxcXHNlcnZlclxcXFxzcmNcXFxcY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9ydXN0L0Rlc2t0b3AvcHJvamVjdHMvc3VydmV2LXByb2Qvc2VydmVyL3NyYy9jb25maWcudHNcIjtpbXBvcnQgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHR5cGUgeyBNYXBEZWZzIH0gZnJvbSBcIi4uLy4uL3NoYXJlZC9kZWZzL21hcERlZnNcIjtcbmltcG9ydCB7IEdhbWVDb25maWcsIFRlYW1Nb2RlIH0gZnJvbSBcIi4uLy4uL3NoYXJlZC9nYW1lQ29uZmlnXCI7XG5pbXBvcnQgeyB1dGlsIH0gZnJvbSBcIi4uLy4uL3NoYXJlZC91dGlscy91dGlsXCI7XG5pbXBvcnQgdHlwZSB7IFZlYzIgfSBmcm9tIFwiLi4vLi4vc2hhcmVkL3V0aWxzL3YyXCI7XG5cbmNvbnN0IGlzUHJvZHVjdGlvbiA9IHByb2Nlc3MuZW52W1wiTk9ERV9FTlZcIl0gPT09IFwicHJvZHVjdGlvblwiO1xuXG4vLyBXQVJOSU5HOiBUSElTIElTIFRIRSBERUZBVUxUIENPTkZJR1xuLy8gWU9VIFNIT1VMRCBNT0RJRlkgc3VydmV2LWNvbmZpZy5qc29uIEZJTEUgSU5TVEVBRCBGT1IgTE9DQUwgQ0hBTkdFU1xuLy8gVE8gQVZPSUQgTUVSR0UgQ09ORkxJQ1RTIEFORCBQVVNISU5HIElUIFRPIEdJVFxuXG4vKipcbiAqIERlZmF1bHQgY29uZmlnXG4gKi9cbmV4cG9ydCBjb25zdCBDb25maWcgPSB7XG4gICAgZGV2U2VydmVyOiB7XG4gICAgICAgIGhvc3Q6IFwiMTI3LjAuMC4xXCIsXG4gICAgICAgIHBvcnQ6IDgwMDEsXG4gICAgfSxcblxuICAgIGFwaVNlcnZlcjoge1xuICAgICAgICBob3N0OiBcIjAuMC4wLjBcIixcbiAgICAgICAgcG9ydDogODAwMCxcbiAgICB9LFxuXG4gICAgZ2FtZVNlcnZlcjoge1xuICAgICAgICBob3N0OiBcIjAuMC4wLjBcIixcbiAgICAgICAgcG9ydDogODAwMSxcbiAgICAgICAgYXBpU2VydmVyVXJsOiBcImh0dHA6Ly8xMjcuMC4wLjE6ODAwMFwiLFxuICAgIH0sXG5cbiAgICBhcGlLZXk6IFwiS29uZ3JlZ2F0ZSBTdWNrc1wiLFxuXG4gICAgLypcbiAgICAgIGEgcmFuZG9tIHN0cmluZywgc2hvdWxkIGJlIHByaXZhdGUuXG4gICAgKi9cbiAgICBlbmNyeXB0TG9hZG91dFNlY3JldDogXCJJaVJIMnlnNDJqeXAyNHFBQWRMQjZcIixcblxuICAgIC8vIE9BVVRIIFBST1ZJREVSU1xuICAgIERJU0NPUkRfQ0xJRU5UX0lEOiBcIlwiLFxuICAgIERJU0NPUkRfU0VDUkVUX0lEOiBcIlwiLFxuXG4gICAgR09PR0xFX0NMSUVOVF9JRDogXCJcIixcbiAgICBHT09HTEVfU0VDUkVUX0lEOiBcIlwiLFxuXG4gICAgbW9kZXM6IFtcbiAgICAgICAgeyBtYXBOYW1lOiBcInNub3dcIiwgdGVhbU1vZGU6IFRlYW1Nb2RlLlNvbG8sIGVuYWJsZWQ6IHRydWUgfSxcbiAgICAgICAgeyBtYXBOYW1lOiBcInNub3dcIiwgdGVhbU1vZGU6IFRlYW1Nb2RlLkR1bywgZW5hYmxlZDogdHJ1ZSB9LFxuICAgICAgICB7IG1hcE5hbWU6IFwic25vd1wiLCB0ZWFtTW9kZTogVGVhbU1vZGUuU3F1YWQsIGVuYWJsZWQ6IHRydWUgfSxcbiAgICBdLFxuXG4gICAgcmVnaW9uczoge30sXG5cbiAgICBkZWJ1Zzoge1xuICAgICAgICBzcGF3bk1vZGU6IFwiZGVmYXVsdFwiLFxuICAgIH0sXG5cbiAgICBhY2NvdW50c0VuYWJsZWQ6IHRydWUsXG5cbiAgICByYXRlTGltaXRzRW5hYmxlZDogaXNQcm9kdWN0aW9uLFxuXG4gICAgY2xpZW50OiB7XG4gICAgICAgIEFJUF9JRDogdW5kZWZpbmVkLFxuICAgICAgICBBSVBfUExBQ0VNRU5UX0lEOiB1bmRlZmluZWQsXG4gICAgICAgIEdBTUVNT05FVElaRV9JRDogdW5kZWZpbmVkLFxuICAgICAgICB0aGVtZTogXCJzbm93XCIsXG4gICAgfSxcblxuICAgIHByb3RlY3Rpb246IHtcbiAgICAgICAgVFVSTlNUSUxFX1NJVEVfS0VZOiB1bmRlZmluZWQsXG4gICAgICAgIFRVUk5TVElMRV9TRUNSRVRfS0VZOiB1bmRlZmluZWQsXG4gICAgfSxcblxuICAgIHRoaXNSZWdpb246IFwibG9jYWxcIixcblxuICAgIGdhbWVUcHM6IDEwMCxcbiAgICBuZXRTeW5jVHBzOiAzMyxcblxuICAgIHByb2Nlc3NNb2RlOiBpc1Byb2R1Y3Rpb24gPyBcIm11bHRpXCIgOiBcInNpbmdsZVwiLFxuXG4gICAgcGVyZkxvZ2dpbmc6IHtcbiAgICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgdGltZTogMTAsXG4gICAgfSxcblxuICAgIGdhbWVDb25maWc6IHt9LFxufSBzYXRpc2ZpZXMgQ29uZmlnVHlwZSBhcyBDb25maWdUeXBlO1xuXG5pZiAoIWlzUHJvZHVjdGlvbikge1xuICAgIHV0aWwubWVyZ2VEZWVwKENvbmZpZywge1xuICAgICAgICByZWdpb25zOiB7XG4gICAgICAgICAgICBsb2NhbDoge1xuICAgICAgICAgICAgICAgIGh0dHBzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBhZGRyZXNzOiBgJHtDb25maWcuZGV2U2VydmVyLmhvc3R9OiR7Q29uZmlnLmRldlNlcnZlci5wb3J0fWAsXG4gICAgICAgICAgICAgICAgbDEwbjogXCJpbmRleC1sb2NhbFwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICB9KTtcbn1cblxuY29uc3QgcnVubmluZ09uVml0ZSA9IHByb2Nlc3MuYXJndi50b1N0cmluZygpLmluY2x1ZGVzKFwidml0ZVwiKTtcblxuY29uc3QgY29uZmlnUGF0aCA9IHBhdGguam9pbihcbiAgICBfX2Rpcm5hbWUsXG4gICAgaXNQcm9kdWN0aW9uICYmICFydW5uaW5nT25WaXRlID8gXCIuLi8uLi9cIiA6IFwiXCIsXG4gICAgXCIuLi8uLi9cIixcbik7XG5cbmZ1bmN0aW9uIGxvYWRDb25maWcoZmlsZU5hbWU6IHN0cmluZywgY3JlYXRlPzogYm9vbGVhbikge1xuICAgIGNvbnN0IHBhdGggPSBgJHtjb25maWdQYXRofSR7ZmlsZU5hbWV9YDtcblxuICAgIGxldCBsb2FkZWQgPSBmYWxzZTtcbiAgICBpZiAoZnMuZXhpc3RzU3luYyhwYXRoKSkge1xuICAgICAgICBjb25zdCBsb2NhbENvbmZpZyA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHBhdGgpLnRvU3RyaW5nKCkpO1xuICAgICAgICB1dGlsLm1lcmdlRGVlcChDb25maWcsIGxvY2FsQ29uZmlnKTtcbiAgICAgICAgbG9hZGVkID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKGNyZWF0ZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkNvbmZpZyBmaWxlIGRvZXNuJ3QgZXhpc3QuLi4gY3JlYXRpbmdcIik7XG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMocGF0aCwgSlNPTi5zdHJpbmdpZnkoe30sIG51bGwsIDIpKTtcbiAgICB9XG5cbiAgICB1dGlsLm1lcmdlRGVlcChHYW1lQ29uZmlnLCBDb25maWcuZ2FtZUNvbmZpZyk7XG4gICAgcmV0dXJuIGxvYWRlZDtcbn1cblxuLy8gdHJ5IGxvYWRpbmcgb2xkIGNvbmZpZyBmaWxlIGZpcnN0IGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxuaWYgKCFsb2FkQ29uZmlnKFwicmVzdXJ2aXYtY29uZmlnLmpzb25cIikpIHtcbiAgICBsb2FkQ29uZmlnKFwic3VydmV2LWNvbmZpZy5qc29uXCIsIHRydWUpO1xufVxuXG50eXBlIERlZXBQYXJ0aWFsPFQ+ID0gVCBleHRlbmRzIG9iamVjdFxuICAgID8ge1xuICAgICAgICAgIFtQIGluIGtleW9mIFRdPzogRGVlcFBhcnRpYWw8VFtQXT47XG4gICAgICB9XG4gICAgOiBUO1xuXG5pbnRlcmZhY2UgU2VydmVyQ29uZmlnIHtcbiAgICBob3N0OiBzdHJpbmc7XG4gICAgcG9ydDogbnVtYmVyO1xuXG4gICAgLyoqXG4gICAgICogSFRUUFMvU1NMIG9wdGlvbnMuIE5vdCB1c2VkIGlmIHJ1bm5pbmcgbG9jYWxseSBvciB3aXRoIG5naW54LlxuICAgICAqL1xuICAgIHNzbD86IHtcbiAgICAgICAga2V5RmlsZTogc3RyaW5nO1xuICAgICAgICBjZXJ0RmlsZTogc3RyaW5nO1xuICAgIH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29uZmlnVHlwZSB7XG4gICAgZGV2U2VydmVyOiBTZXJ2ZXJDb25maWc7XG4gICAgYXBpU2VydmVyOiBTZXJ2ZXJDb25maWc7XG4gICAgZ2FtZVNlcnZlcjogU2VydmVyQ29uZmlnICYge1xuICAgICAgICBhcGlTZXJ2ZXJVcmw6IHN0cmluZztcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEFQSSBrZXkgdXNlZCBmb3IgZ2FtZSBzZXJ2ZXIgYW5kIEFQSSBzZXJ2ZXIgdG8gY29tbXVuaWNhdGVcbiAgICAgKi9cbiAgICBhcGlLZXk6IHN0cmluZztcblxuICAgIGVuY3J5cHRMb2Fkb3V0U2VjcmV0Pzogc3RyaW5nO1xuXG4gICAgLypcbiAgICAgIHVzZWQgZm9yIGF1dGggcmVkaXJlY3RzIGluIHByb2R1Y3Rpb25cbiAgICAgIHNob3VsZCBiZSB0aGUgaG9zdGVkIHdlYnNpdGUgdXJsIGV4OiBodHRwczovL3N1cnZldi5pb1xuICAgICovXG4gICAgQkFTRV9VUkw/OiBzdHJpbmc7XG5cbiAgICAvLyAjIyMjIyBESVNDT1JEIE9BVVRIXG4gICAgRElTQ09SRF9DTElFTlRfSUQ/OiBzdHJpbmc7XG4gICAgRElTQ09SRF9TRUNSRVRfSUQ/OiBzdHJpbmc7XG5cbiAgICAvLyAjIyMjIyBHT09HTEUgT0FVVEggIyMjIyNcbiAgICBHT09HTEVfQ0xJRU5UX0lEPzogc3RyaW5nO1xuICAgIEdPT0dMRV9TRUNSRVRfSUQ/OiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiB1c2VkIHRvIGhpZGUvZGlzYWJsZSBhY2NvdW50LXJlbGF0ZWQgZmVhdHVyZXMgaW4gYm90aCBjbGllbnQgYW5kIHNlcnZlci5cbiAgICAgKi9cbiAgICByZWFkb25seSBhY2NvdW50c0VuYWJsZWQ6IGJvb2xlYW47XG5cbiAgICByZWdpb25zOiBSZWNvcmQ8XG4gICAgICAgIHN0cmluZyxcbiAgICAgICAge1xuICAgICAgICAgICAgaHR0cHM6IGJvb2xlYW47XG4gICAgICAgICAgICBhZGRyZXNzOiBzdHJpbmc7XG4gICAgICAgICAgICBsMTBuOiBzdHJpbmc7XG4gICAgICAgIH1cbiAgICA+O1xuXG4gICAgdGhpc1JlZ2lvbjogc3RyaW5nO1xuXG4gICAgbW9kZXM6IEFycmF5PHtcbiAgICAgICAgbWFwTmFtZToga2V5b2YgdHlwZW9mIE1hcERlZnM7XG4gICAgICAgIHRlYW1Nb2RlOiBUZWFtTW9kZTtcbiAgICAgICAgZW5hYmxlZDogYm9vbGVhbjtcbiAgICB9PjtcblxuICAgIC8qKlxuICAgICAqIFNlcnZlciB0aWNrIHJhdGVcbiAgICAgKi9cbiAgICBnYW1lVHBzOiBudW1iZXI7XG4gICAgbmV0U3luY1RwczogbnVtYmVyO1xuXG4gICAgLyoqXG4gICAgICogSWYgZ2FtZXMgc2hvdWxkIGFsbCBydW4gaW4gdGhlIHNhbWUgcHJvY2Vzc1xuICAgICAqIE9yIHNwYXduIGEgbmV3IHByb2Nlc3MgZm9yIGVhY2ggZ2FtZVxuICAgICAqIERlZmF1bHRzIHRvIHNpbmdsZSBpbiBkZXZlbG9wbWVudCBhbmQgbXVsdGkgaW4gcHJvZHVjdGlvblxuICAgICAqL1xuICAgIHByb2Nlc3NNb2RlOiBcInNpbmdsZVwiIHwgXCJtdWx0aVwiO1xuXG4gICAgLyoqXG4gICAgICogU2VydmVyIGxvZ2dpbmdcbiAgICAgKi9cbiAgICBwZXJmTG9nZ2luZzoge1xuICAgICAgICBlbmFibGVkOiBib29sZWFuO1xuICAgICAgICAvKipcbiAgICAgICAgICogU2Vjb25kcyBiZXR3ZWVuIGVhY2ggZ2FtZSBwZXJmb3JtYW5jZSBsb2dcbiAgICAgICAgICovXG4gICAgICAgIHRpbWU6IG51bWJlcjtcbiAgICB9O1xuXG4gICAgcmF0ZUxpbWl0c0VuYWJsZWQ6IGJvb2xlYW47XG5cbiAgICBjbGllbnQ6IHtcbiAgICAgICAgLy8gYWRpbiBwbGF5IElEc1xuICAgICAgICBBSVBfSUQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAgICAgQUlQX1BMQUNFTUVOVF9JRDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgICAgICBHQU1FTU9ORVRJWkVfSUQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuICAgICAgICB0aGVtZTogXCJtYWluXCIgfCBcImVhc3RlclwiIHwgXCJoYWxsb3dlZW5cIiB8IFwiZmFjdGlvblwiIHwgXCJzbm93XCIgfCBcInNwcmluZ1wiO1xuICAgIH07XG5cbiAgICBwcm90ZWN0aW9uOiB7XG4gICAgICAgIC8vIHR1cm5zdGlsZSBjYXB0Y2hhXG4gICAgICAgIFRVUk5TVElMRV9TSVRFX0tFWTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgICAgICBUVVJOU1RJTEVfU0VDUkVUX0tFWTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIH07XG5cbiAgICBkZWJ1Zzoge1xuICAgICAgICBzcGF3bk1vZGU6IFwiZGVmYXVsdFwiIHwgXCJmaXhlZFwiO1xuICAgICAgICAvLyBzcGF3biBwb3MgZm9yIGZpeGVkLCBkZWZhdWx0cyB0byBtYXAgY2VudGVyIGlmIG5vdCBzZXRcbiAgICAgICAgc3Bhd25Qb3M/OiBWZWMyO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBHYW1lIGNvbmZpZyBvdmVycmlkZXNcbiAgICAgKiBATk9URSBkb24ndCBtb2RpZnkgdmFsdWVzIHVzZWQgYnkgY2xpZW50IHNpbmNlIHRoaXMgb25seSBhcHBsaWVzIHRvIHNlcnZlclxuICAgICAqL1xuICAgIGdhbWVDb25maWc6IERlZXBQYXJ0aWFsPHR5cGVvZiBHYW1lQ29uZmlnPjtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxccnVzdFxcXFxEZXNrdG9wXFxcXHByb2plY3RzXFxcXHN1cnZldi1wcm9kXFxcXHNoYXJlZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxccnVzdFxcXFxEZXNrdG9wXFxcXHByb2plY3RzXFxcXHN1cnZldi1wcm9kXFxcXHNoYXJlZFxcXFxnYW1lQ29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9ydXN0L0Rlc2t0b3AvcHJvamVjdHMvc3VydmV2LXByb2Qvc2hhcmVkL2dhbWVDb25maWcudHNcIjtleHBvcnQgZW51bSBUZWFtTW9kZSB7XG4gICAgU29sbyA9IDEsXG4gICAgRHVvID0gMixcbiAgICBTcXVhZCA9IDQsXG59XG5cbmV4cG9ydCBlbnVtIEVtb3RlU2xvdCB7XG4gICAgVG9wLFxuICAgIFJpZ2h0LFxuICAgIEJvdHRvbSxcbiAgICBMZWZ0LFxuICAgIFdpbixcbiAgICBEZWF0aCxcbiAgICBDb3VudCxcbn1cblxuZXhwb3J0IGVudW0gRGFtYWdlVHlwZSB7XG4gICAgUGxheWVyLFxuICAgIEJsZWVkaW5nLFxuICAgIEdhcyxcbiAgICBBaXJkcm9wLFxuICAgIEFpcnN0cmlrZSxcbn1cblxuZXhwb3J0IGVudW0gQWN0aW9uIHtcbiAgICBOb25lLFxuICAgIFJlbG9hZCxcbiAgICBSZWxvYWRBbHQsXG4gICAgVXNlSXRlbSxcbiAgICBSZXZpdmUsXG59XG5cbmV4cG9ydCBlbnVtIFdlYXBvblNsb3Qge1xuICAgIFByaW1hcnksXG4gICAgU2Vjb25kYXJ5LFxuICAgIE1lbGVlLFxuICAgIFRocm93YWJsZSxcbiAgICBDb3VudCxcbn1cblxuZXhwb3J0IGVudW0gR2FzTW9kZSB7XG4gICAgSW5hY3RpdmUsXG4gICAgV2FpdGluZyxcbiAgICBNb3ZpbmcsXG59XG5cbmV4cG9ydCBlbnVtIEFuaW0ge1xuICAgIE5vbmUsXG4gICAgTWVsZWUsXG4gICAgQ29vayxcbiAgICBUaHJvdyxcbiAgICBDcmF3bEZvcndhcmQsXG4gICAgQ3Jhd2xCYWNrd2FyZCxcbiAgICBSZXZpdmUsXG59XG5cbmV4cG9ydCBlbnVtIFBsYW5lIHtcbiAgICBBaXJkcm9wLFxuICAgIEFpcnN0cmlrZSxcbn1cblxuZXhwb3J0IGVudW0gSGFzdGVUeXBlIHtcbiAgICBOb25lLFxuICAgIFdpbmR3YWxrLFxuICAgIFRha2Vkb3duLFxuICAgIEluc3BpcmUsXG59XG5cbmV4cG9ydCBlbnVtIElucHV0IHtcbiAgICBNb3ZlTGVmdCxcbiAgICBNb3ZlUmlnaHQsXG4gICAgTW92ZVVwLFxuICAgIE1vdmVEb3duLFxuICAgIEZpcmUsXG4gICAgUmVsb2FkLFxuICAgIENhbmNlbCxcbiAgICBJbnRlcmFjdCxcbiAgICBSZXZpdmUsXG4gICAgVXNlLFxuICAgIExvb3QsXG4gICAgRXF1aXBQcmltYXJ5LFxuICAgIEVxdWlwU2Vjb25kYXJ5LFxuICAgIEVxdWlwTWVsZWUsXG4gICAgRXF1aXBUaHJvd2FibGUsXG4gICAgRXF1aXBGcmFnR3JlbmFkZSxcbiAgICBFcXVpcFNtb2tlR3JlbmFkZSxcbiAgICBFcXVpcE5leHRXZWFwLFxuICAgIEVxdWlwUHJldldlYXAsXG4gICAgRXF1aXBMYXN0V2VhcCxcbiAgICBFcXVpcE90aGVyR3VuLFxuICAgIEVxdWlwUHJldlNjb3BlLFxuICAgIEVxdWlwTmV4dFNjb3BlLFxuICAgIFVzZUJhbmRhZ2UsXG4gICAgVXNlSGVhbHRoS2l0LFxuICAgIFVzZVNvZGEsXG4gICAgVXNlUGFpbmtpbGxlcixcbiAgICBTdG93V2VhcG9ucyxcbiAgICBTd2FwV2VhcFNsb3RzLFxuICAgIFRvZ2dsZU1hcCxcbiAgICBDeWNsZVVJTW9kZSxcbiAgICBFbW90ZU1lbnUsXG4gICAgVGVhbVBpbmdNZW51LFxuICAgIEZ1bGxzY3JlZW4sXG4gICAgSGlkZVVJLFxuICAgIFRlYW1QaW5nU2luZ2xlLFxuICAgIENvdW50LFxufVxuXG5leHBvcnQgY29uc3QgR2FtZUNvbmZpZyA9IHtcbiAgICBwcm90b2NvbFZlcnNpb246IDc4LFxuICAgIElucHV0LFxuICAgIEVtb3RlU2xvdCxcbiAgICBXZWFwb25TbG90LFxuICAgIFdlYXBvblR5cGU6IFtcImd1blwiLCBcImd1blwiLCBcIm1lbGVlXCIsIFwidGhyb3dhYmxlXCJdIGFzIGNvbnN0LFxuICAgIERhbWFnZVR5cGUsXG4gICAgQWN0aW9uLFxuICAgIEFuaW0sXG4gICAgR2FzTW9kZSxcbiAgICBQbGFuZSxcbiAgICBIYXN0ZVR5cGUsXG4gICAgZ2FzOiB7XG4gICAgICAgIGRhbWFnZVRpY2tSYXRlOiAyLFxuICAgIH0sXG4gICAgbWFwOiB7XG4gICAgICAgIGdyaWRTaXplOiAxNixcbiAgICAgICAgc2hvcmVWYXJpYXRpb246IDMsXG4gICAgICAgIGdyYXNzVmFyaWF0aW9uOiAyLFxuICAgIH0sXG4gICAgcGxheWVyOiB7XG4gICAgICAgIHJhZGl1czogMSxcbiAgICAgICAgbWF4VmlzdWFsUmFkaXVzOiAzLjc1LFxuICAgICAgICBtYXhJbnRlcmFjdGlvblJhZDogMy41LFxuICAgICAgICBoZWFsdGg6IDEwMCxcbiAgICAgICAgcmV2aXZlSGVhbHRoOiAyNCxcbiAgICAgICAgbWluQWN0aXZlVGltZTogMTAsXG4gICAgICAgIGJvb3N0RGVjYXk6IDAuMzMsXG4gICAgICAgIGJvb3N0TW92ZVNwZWVkOiAxLjg1LFxuICAgICAgICBib29zdEhlYWxBbW91bnQ6IDAuMzMsXG4gICAgICAgIGJvb3N0QnJlYWtwb2ludHM6IFsxLCAxLCAxLjUsIDAuNV0sXG4gICAgICAgIHNjb3BlRGVsYXk6IDAuMjUsXG4gICAgICAgIGJhc2VTd2l0Y2hEZWxheTogMC4yNSxcbiAgICAgICAgZnJlZVN3aXRjaENvb2xkb3duOiAxLFxuICAgICAgICBoZWFkc2hvdENoYW5jZTogMC4xNSxcbiAgICAgICAgbW92ZVNwZWVkOiAxMixcbiAgICAgICAgd2F0ZXJTcGVlZFBlbmFsdHk6IDMsXG4gICAgICAgIGNvb2tTcGVlZFBlbmFsdHk6IDMsXG4gICAgICAgIGZyb3plblNwZWVkUGVuYWx0eTogMyxcbiAgICAgICAgaGFzdGVTcGVlZEJvbnVzOiA0LjgsXG4gICAgICAgIGJsZWVkVGlja1JhdGU6IDEsXG4gICAgICAgIGRvd25lZE1vdmVTcGVlZDogNCxcbiAgICAgICAgZG93bmVkUmV6TW92ZVNwZWVkOiAyLFxuICAgICAgICBrZWVwWm9vbVdoaWxlRG93bmVkOiBmYWxzZSxcbiAgICAgICAgcmV2aXZlRHVyYXRpb246IDgsXG4gICAgICAgIHJldml2ZVJhbmdlOiA1LFxuICAgICAgICBjcmF3bFRpbWU6IDAuNzUsXG4gICAgICAgIHRlYW1tYXRlU3Bhd25SYWRpdXM6IDUsIC8vIHJhZGl1cyBvZiBjaXJjbGUgdGhhdCB0ZWFtbWF0ZXMgc3Bhd24gaW5zaWRlIG9mLCByZWxhdGl2ZSB0byB0aGUgZmlyc3QgcGxheWVyIG9uIHRoZSB0ZWFtIHRvIGpvaW5cbiAgICAgICAgZW1vdGVTb2Z0Q29vbGRvd246IDIsXG4gICAgICAgIGVtb3RlSGFyZENvb2xkb3duOiA2LFxuICAgICAgICBlbW90ZVRocmVzaG9sZDogNixcbiAgICAgICAgdGhyb3dhYmxlTWF4TW91c2VEaXN0OiAxOCxcbiAgICAgICAgY29va1RpbWU6IDAuMSxcbiAgICAgICAgdGhyb3dUaW1lOiAwLjMsXG4gICAgICAgIG1lbGVlSGVpZ2h0OiAwLjI1LFxuICAgICAgICB0b3VjaExvb3RSYWRNdWx0OiAxLjQsXG4gICAgICAgIG1lZGljSGVhbFJhbmdlOiA4LFxuICAgICAgICBtZWRpY1Jldml2ZVJhbmdlOiA2LFxuICAgICAgICBzcGVjdGF0ZURlYWRUaW1lb3V0OiAyLFxuICAgICAgICBraWxsTGVhZGVyTWluS2lsbHM6IDMsXG4gICAgICAgIG1pblNwYXduUmFkOiAyNSxcblxuICAgICAgICAvKiBTVFJJUF9GUk9NX1BST0RfQ0xJRU5UOlNUQVJUICovXG4gICAgICAgIGRlZmF1bHRJdGVtczoge1xuICAgICAgICAgICAgd2VhcG9uczogW1xuICAgICAgICAgICAgICAgIHsgdHlwZTogXCJcIiwgYW1tbzogMCB9LFxuICAgICAgICAgICAgICAgIHsgdHlwZTogXCJcIiwgYW1tbzogMCB9LFxuICAgICAgICAgICAgICAgIHsgdHlwZTogXCJmaXN0c1wiLCBhbW1vOiAwIH0sXG4gICAgICAgICAgICAgICAgeyB0eXBlOiBcIlwiLCBhbW1vOiAwIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgb3V0Zml0OiBcIm91dGZpdEJhc2VcIixcbiAgICAgICAgICAgIGJhY2twYWNrOiBcImJhY2twYWNrMDBcIixcbiAgICAgICAgICAgIGhlbG1ldDogXCJcIixcbiAgICAgICAgICAgIGNoZXN0OiBcIlwiLFxuICAgICAgICAgICAgc2NvcGU6IFwiMXhzY29wZVwiLFxuICAgICAgICAgICAgcGVya3M6IFtdIGFzIEFycmF5PHsgdHlwZTogc3RyaW5nOyBkcm9wcGFibGU/OiBib29sZWFuIH0+LFxuICAgICAgICAgICAgaW52ZW50b3J5OiB7XG4gICAgICAgICAgICAgICAgXCI5bW1cIjogMCxcbiAgICAgICAgICAgICAgICBcIjc2Mm1tXCI6IDAsXG4gICAgICAgICAgICAgICAgXCI1NTZtbVwiOiAwLFxuICAgICAgICAgICAgICAgIFwiMTJnYXVnZVwiOiAwLFxuICAgICAgICAgICAgICAgIFwiNTBBRVwiOiAwLFxuICAgICAgICAgICAgICAgIFwiMzA4c3ViXCI6IDAsXG4gICAgICAgICAgICAgICAgZmxhcmU6IDAsXG4gICAgICAgICAgICAgICAgXCI0NWFjcFwiOiAwLFxuICAgICAgICAgICAgICAgIGZyYWc6IDAsXG4gICAgICAgICAgICAgICAgc21va2U6IDAsXG4gICAgICAgICAgICAgICAgc3Ryb2JlOiAwLFxuICAgICAgICAgICAgICAgIG1pcnY6IDAsXG4gICAgICAgICAgICAgICAgc25vd2JhbGw6IDAsXG4gICAgICAgICAgICAgICAgcG90YXRvOiAwLFxuICAgICAgICAgICAgICAgIGJhbmRhZ2U6IDAsXG4gICAgICAgICAgICAgICAgaGVhbHRoa2l0OiAwLFxuICAgICAgICAgICAgICAgIHNvZGE6IDAsXG4gICAgICAgICAgICAgICAgcGFpbmtpbGxlcjogMCxcbiAgICAgICAgICAgICAgICBcIjF4c2NvcGVcIjogMSxcbiAgICAgICAgICAgICAgICBcIjJ4c2NvcGVcIjogMCxcbiAgICAgICAgICAgICAgICBcIjR4c2NvcGVcIjogMCxcbiAgICAgICAgICAgICAgICBcIjh4c2NvcGVcIjogMCxcbiAgICAgICAgICAgICAgICBcIjE1eHNjb3BlXCI6IDAsXG4gICAgICAgICAgICB9IGFzIFJlY29yZDxzdHJpbmcsIG51bWJlcj4sXG4gICAgICAgIH0sXG4gICAgICAgIC8qIFNUUklQX0ZST01fUFJPRF9DTElFTlQ6RU5EICovXG4gICAgfSxcbiAgICBkZWZhdWx0RW1vdGVMb2Fkb3V0OiBbXG4gICAgICAgIFwiZW1vdGVfaGFwcHlmYWNlXCIsXG4gICAgICAgIFwiZW1vdGVfdGh1bWJzdXBcIixcbiAgICAgICAgXCJlbW90ZV9zdXJ2aXZcIixcbiAgICAgICAgXCJlbW90ZV9zYWRmYWNlXCIsXG4gICAgICAgIFwiXCIsXG4gICAgICAgIFwiXCIsXG4gICAgXSxcbiAgICBhaXJkcm9wOiB7XG4gICAgICAgIGFjdGlvbk9mZnNldDogMCxcbiAgICAgICAgZmFsbFRpbWU6IDgsXG4gICAgICAgIGNydXNoRGFtYWdlOiAxMDAsXG4gICAgICAgIHBsYW5lVmVsOiA0OCxcbiAgICAgICAgcGxhbmVSYWQ6IDE1MCxcbiAgICAgICAgc291bmRSYW5nZU11bHQ6IDIuNSxcbiAgICAgICAgc291bmRSYW5nZURlbHRhOiAwLjI1LFxuICAgICAgICBzb3VuZFJhbmdlTWF4OiA5MixcbiAgICAgICAgZmFsbE9mZjogMCxcbiAgICB9LFxuICAgIGFpcnN0cmlrZToge1xuICAgICAgICBhY3Rpb25PZmZzZXQ6IDAsXG4gICAgICAgIGJvbWJKaXR0ZXI6IDQsXG4gICAgICAgIGJvbWJPZmZzZXQ6IDIsXG4gICAgICAgIGJvbWJWZWw6IDMsXG4gICAgICAgIGJvbWJDb3VudDogMjAsXG4gICAgICAgIHBsYW5lVmVsOiAzNTAsXG4gICAgICAgIHBsYW5lUmFkOiAxMjAsXG4gICAgICAgIHNvdW5kUmFuZ2VNdWx0OiAxOCxcbiAgICAgICAgc291bmRSYW5nZURlbHRhOiAxOCxcbiAgICAgICAgc291bmRSYW5nZU1heDogNDgsXG4gICAgICAgIGZhbGxPZmY6IDEuMjUsXG4gICAgfSxcbiAgICBncm91cENvbG9yczogWzE2Nzc2OTYwLCAxNjcxMTkzNSwgNjU1MzUsIDE2NzMzMTg0XSxcbiAgICB0ZWFtQ29sb3JzOiBbMTMzNjkzNDQsIDMyNTExXSxcbiAgICBidWxsZXQ6IHtcbiAgICAgICAgbWF4UmVmbGVjdDogMyxcbiAgICAgICAgcmVmbGVjdERpc3REZWNheTogMS41LFxuICAgICAgICBoZWlnaHQ6IDAuMjUsXG4gICAgICAgIGZhbGxvZmY6IHRydWUsXG4gICAgfSxcbiAgICBwcm9qZWN0aWxlOiB7XG4gICAgICAgIG1heEhlaWdodDogNSxcbiAgICB9LFxuICAgIHN0cnVjdHVyZUxheWVyQ291bnQ6IDIsXG4gICAgdHJhY2VyQ29sb3JzOiB7XG4gICAgICAgIFwiOW1tXCI6IHtcbiAgICAgICAgICAgIHJlZ3VsYXI6IDE2NzA0MTk4LFxuICAgICAgICAgICAgc2F0dXJhdGVkOiAxNjc2NzQxMSxcbiAgICAgICAgICAgIGNoYW1iZXJlZDogMTY3NDQxOTIsXG4gICAgICAgICAgICBhbHBoYVJhdGU6IDAuOTIsXG4gICAgICAgICAgICBhbHBoYU1pbjogMC4xNCxcbiAgICAgICAgfSxcbiAgICAgICAgXCI5bW1fc3VwcHJlc3NlZF9ib251c1wiOiB7XG4gICAgICAgICAgICByZWd1bGFyOiAxNjcwNDE5OCxcbiAgICAgICAgICAgIHNhdHVyYXRlZDogMTY3Njc0MTEsXG4gICAgICAgICAgICBjaGFtYmVyZWQ6IDE2NzQ0MTkyLFxuICAgICAgICAgICAgYWxwaGFSYXRlOiAwLjk2LFxuICAgICAgICAgICAgYWxwaGFNaW46IDAuMjgsXG4gICAgICAgIH0sXG4gICAgICAgIFwiOW1tX2N1cnNlZFwiOiB7XG4gICAgICAgICAgICByZWd1bGFyOiAxMjQ3NDg4LFxuICAgICAgICAgICAgc2F0dXJhdGVkOiAxMjQ3NDg4LFxuICAgICAgICAgICAgY2hhbWJlcmVkOiAxMjQ3NDg4LFxuICAgICAgICAgICAgYWxwaGFSYXRlOiAwLjkyLFxuICAgICAgICAgICAgYWxwaGFNaW46IDAuMTQsXG4gICAgICAgIH0sXG4gICAgICAgIFwiNzYybW1cIjoge1xuICAgICAgICAgICAgcmVndWxhcjogMTI5NjU2MzAsXG4gICAgICAgICAgICBzYXR1cmF0ZWQ6IDExMjU3MDg3LFxuICAgICAgICAgICAgY2hhbWJlcmVkOiAxOTcxMSxcbiAgICAgICAgICAgIGFscGhhUmF0ZTogMC45NCxcbiAgICAgICAgICAgIGFscGhhTWluOiAwLjIsXG4gICAgICAgIH0sXG4gICAgICAgIFwiMTJnYXVnZVwiOiB7XG4gICAgICAgICAgICByZWd1bGFyOiAxNjcwMjY4NCxcbiAgICAgICAgICAgIHNhdHVyYXRlZDogMTY3MDI2ODQsXG4gICAgICAgICAgICBjaGFtYmVyZWQ6IDE2NzExNjgwLFxuICAgICAgICB9LFxuICAgICAgICBcIjU1Nm1tXCI6IHtcbiAgICAgICAgICAgIHJlZ3VsYXI6IDExMTQxMDEwLFxuICAgICAgICAgICAgc2F0dXJhdGVkOiAxMTE0MTAxMCxcbiAgICAgICAgICAgIGNoYW1iZXJlZDogMzYwNDIyNCxcbiAgICAgICAgICAgIGFscGhhUmF0ZTogMC45MixcbiAgICAgICAgICAgIGFscGhhTWluOiAwLjE0LFxuICAgICAgICB9LFxuICAgICAgICBcIjUwQUVcIjoge1xuICAgICAgICAgICAgcmVndWxhcjogMTY3NzMyNTYsXG4gICAgICAgICAgICBzYXR1cmF0ZWQ6IDE2NzczMjU2LFxuICAgICAgICAgICAgY2hhbWJlcmVkOiAxNjc2ODc2OCxcbiAgICAgICAgfSxcbiAgICAgICAgXCIzMDhzdWJcIjoge1xuICAgICAgICAgICAgcmVndWxhcjogMjQzNTg0MCxcbiAgICAgICAgICAgIHNhdHVyYXRlZDogNDYwOGUzLFxuICAgICAgICAgICAgY2hhbWJlcmVkOiAxMjUwODE2LFxuICAgICAgICAgICAgYWxwaGFSYXRlOiAwLjkyLFxuICAgICAgICAgICAgYWxwaGFNaW46IDAuMDcsXG4gICAgICAgIH0sXG4gICAgICAgIGZsYXJlOiB7XG4gICAgICAgICAgICByZWd1bGFyOiAxNDg2OTIxOCxcbiAgICAgICAgICAgIHNhdHVyYXRlZDogMTQ4NjkyMTgsXG4gICAgICAgICAgICBjaGFtYmVyZWQ6IDEyODk1NDI4LFxuICAgICAgICB9LFxuICAgICAgICBcIjQ1YWNwXCI6IHtcbiAgICAgICAgICAgIHJlZ3VsYXI6IDE1NTE1MzkxLFxuICAgICAgICAgICAgc2F0dXJhdGVkOiAxNTE4MzEwMyxcbiAgICAgICAgICAgIGNoYW1iZXJlZDogMTE4NjIyNzEsXG4gICAgICAgIH0sXG4gICAgICAgIHNocmFwbmVsOiB7IHJlZ3VsYXI6IDMzNTU0NDMsIHNhdHVyYXRlZDogMzM1NTQ0MyB9LFxuICAgICAgICBmcmFnOiB7IHJlZ3VsYXI6IDEzMzAzODA4LCBzYXR1cmF0ZWQ6IDEzMzAzODA4IH0sXG4gICAgICAgIGludmlzOiB7IHJlZ3VsYXI6IDAsIHNhdHVyYXRlZDogMCwgY2hhbWJlcmVkOiAwIH0sXG4gICAgfSxcbiAgICBzY29wZVpvb21SYWRpdXM6IHtcbiAgICAgICAgZGVza3RvcDoge1xuICAgICAgICAgICAgXCIxeHNjb3BlXCI6IDI4LFxuICAgICAgICAgICAgXCIyeHNjb3BlXCI6IDM2LFxuICAgICAgICAgICAgXCI0eHNjb3BlXCI6IDQ4LFxuICAgICAgICAgICAgXCI4eHNjb3BlXCI6IDY4LFxuICAgICAgICAgICAgXCIxNXhzY29wZVwiOiAxMDQsXG4gICAgICAgIH0gYXMgUmVjb3JkPHN0cmluZywgbnVtYmVyPixcbiAgICAgICAgbW9iaWxlOiB7XG4gICAgICAgICAgICBcIjF4c2NvcGVcIjogMzIsXG4gICAgICAgICAgICBcIjJ4c2NvcGVcIjogNDAsXG4gICAgICAgICAgICBcIjR4c2NvcGVcIjogNDgsXG4gICAgICAgICAgICBcIjh4c2NvcGVcIjogNjQsXG4gICAgICAgICAgICBcIjE1eHNjb3BlXCI6IDg4LFxuICAgICAgICB9IGFzIFJlY29yZDxzdHJpbmcsIG51bWJlcj4sXG4gICAgfSxcbiAgICBiYWdTaXplczoge1xuICAgICAgICBcIjltbVwiOiBbMTIwLCAyNDAsIDMzMCwgNDIwXSxcbiAgICAgICAgXCI3NjJtbVwiOiBbOTAsIDE4MCwgMjQwLCAzMDBdLFxuICAgICAgICBcIjU1Nm1tXCI6IFs5MCwgMTgwLCAyNDAsIDMwMF0sXG4gICAgICAgIFwiMTJnYXVnZVwiOiBbMTUsIDMwLCA2MCwgOTBdLFxuICAgICAgICBcIjUwQUVcIjogWzQ5LCA5OCwgMTQ3LCAxOTZdLFxuICAgICAgICBcIjMwOHN1YlwiOiBbMTAsIDIwLCA0MCwgODBdLFxuICAgICAgICBmbGFyZTogWzIsIDQsIDYsIDhdLFxuICAgICAgICBcIjQ1YWNwXCI6IFs5MCwgMTgwLCAyNDAsIDMwMF0sXG4gICAgICAgIGZyYWc6IFszLCA2LCA5LCAxMl0sXG4gICAgICAgIHNtb2tlOiBbMywgNiwgOSwgMTJdLFxuICAgICAgICBzdHJvYmU6IFsyLCAzLCA0LCA1XSxcbiAgICAgICAgbWlydjogWzIsIDQsIDYsIDhdLFxuICAgICAgICBzbm93YmFsbDogWzEwLCAyMCwgMzAsIDQwXSxcbiAgICAgICAgcG90YXRvOiBbMTAsIDIwLCAzMCwgNDBdLFxuICAgICAgICBiYW5kYWdlOiBbNSwgMTAsIDE1LCAzMF0sXG4gICAgICAgIGhlYWx0aGtpdDogWzEsIDIsIDMsIDRdLFxuICAgICAgICBzb2RhOiBbMiwgNSwgMTAsIDE1XSxcbiAgICAgICAgcGFpbmtpbGxlcjogWzEsIDIsIDMsIDRdLFxuICAgICAgICBcIjF4c2NvcGVcIjogWzEsIDEsIDEsIDFdLFxuICAgICAgICBcIjJ4c2NvcGVcIjogWzEsIDEsIDEsIDFdLFxuICAgICAgICBcIjR4c2NvcGVcIjogWzEsIDEsIDEsIDFdLFxuICAgICAgICBcIjh4c2NvcGVcIjogWzEsIDEsIDEsIDFdLFxuICAgICAgICBcIjE1eHNjb3BlXCI6IFsxLCAxLCAxLCAxXSxcbiAgICB9IGFzIFJlY29yZDxzdHJpbmcsIG51bWJlcltdPixcbiAgICBsb290UmFkaXVzOiB7XG4gICAgICAgIG91dGZpdDogMSxcbiAgICAgICAgbWVsZWU6IDEuMjUsXG4gICAgICAgIGd1bjogMS4yNSxcbiAgICAgICAgdGhyb3dhYmxlOiAxLFxuICAgICAgICBhbW1vOiAxLjIsXG4gICAgICAgIGhlYWw6IDEsXG4gICAgICAgIGJvb3N0OiAxLFxuICAgICAgICBiYWNrcGFjazogMSxcbiAgICAgICAgaGVsbWV0OiAxLFxuICAgICAgICBjaGVzdDogMSxcbiAgICAgICAgc2NvcGU6IDEsXG4gICAgICAgIHBlcms6IDEuMjUsXG4gICAgICAgIHhwOiAxLFxuICAgIH0gYXMgUmVjb3JkPHN0cmluZywgbnVtYmVyPixcbn07XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHJ1c3RcXFxcRGVza3RvcFxcXFxwcm9qZWN0c1xcXFxzdXJ2ZXYtcHJvZFxcXFxzaGFyZWRcXFxcdXRpbHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHJ1c3RcXFxcRGVza3RvcFxcXFxwcm9qZWN0c1xcXFxzdXJ2ZXYtcHJvZFxcXFxzaGFyZWRcXFxcdXRpbHNcXFxcZWFyY3V0LmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9ydXN0L0Rlc2t0b3AvcHJvamVjdHMvc3VydmV2LXByb2Qvc2hhcmVkL3V0aWxzL2VhcmN1dC5qc1wiOy8vXG4vLyBUYWtlbiBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXBib3gvZWFyY3V0XG4vL1xuZXhwb3J0IGZ1bmN0aW9uIGVhcmN1dChkYXRhLCBob2xlSW5kaWNlcywgZGltKSB7XG4gICAgZGltID0gZGltIHx8IDI7XG5cbiAgICBjb25zdCBoYXNIb2xlcyA9IGhvbGVJbmRpY2VzPy5sZW5ndGg7XG4gICAgY29uc3Qgb3V0ZXJMZW4gPSBoYXNIb2xlcyA/IGhvbGVJbmRpY2VzWzBdICogZGltIDogZGF0YS5sZW5ndGg7XG4gICAgbGV0IG91dGVyTm9kZSA9IGxpbmtlZExpc3QoZGF0YSwgMCwgb3V0ZXJMZW4sIGRpbSwgdHJ1ZSk7XG4gICAgY29uc3QgdHJpYW5nbGVzID0gW107XG5cbiAgICBpZiAoIW91dGVyTm9kZSkgcmV0dXJuIHRyaWFuZ2xlcztcblxuICAgIGxldCBtaW5YO1xuICAgIGxldCBtaW5ZO1xuICAgIGxldCBtYXhYO1xuICAgIGxldCBtYXhZO1xuICAgIGxldCB4O1xuICAgIGxldCB5O1xuICAgIGxldCBpbnZTaXplO1xuXG4gICAgaWYgKGhhc0hvbGVzKSBvdXRlck5vZGUgPSBlbGltaW5hdGVIb2xlcyhkYXRhLCBob2xlSW5kaWNlcywgb3V0ZXJOb2RlLCBkaW0pO1xuXG4gICAgLy8gaWYgdGhlIHNoYXBlIGlzIG5vdCB0b28gc2ltcGxlLCB3ZSdsbCB1c2Ugei1vcmRlciBjdXJ2ZSBoYXNoIGxhdGVyOyBjYWxjdWxhdGUgcG9seWdvbiBiYm94XG4gICAgaWYgKGRhdGEubGVuZ3RoID4gODAgKiBkaW0pIHtcbiAgICAgICAgbWluWCA9IG1heFggPSBkYXRhWzBdO1xuICAgICAgICBtaW5ZID0gbWF4WSA9IGRhdGFbMV07XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IGRpbTsgaSA8IG91dGVyTGVuOyBpICs9IGRpbSkge1xuICAgICAgICAgICAgeCA9IGRhdGFbaV07XG4gICAgICAgICAgICB5ID0gZGF0YVtpICsgMV07XG4gICAgICAgICAgICBpZiAoeCA8IG1pblgpIG1pblggPSB4O1xuICAgICAgICAgICAgaWYgKHkgPCBtaW5ZKSBtaW5ZID0geTtcbiAgICAgICAgICAgIGlmICh4ID4gbWF4WCkgbWF4WCA9IHg7XG4gICAgICAgICAgICBpZiAoeSA+IG1heFkpIG1heFkgPSB5O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbWluWCwgbWluWSBhbmQgaW52U2l6ZSBhcmUgbGF0ZXIgdXNlZCB0byB0cmFuc2Zvcm0gY29vcmRzIGludG8gaW50ZWdlcnMgZm9yIHotb3JkZXIgY2FsY3VsYXRpb25cbiAgICAgICAgaW52U2l6ZSA9IE1hdGgubWF4KG1heFggLSBtaW5YLCBtYXhZIC0gbWluWSk7XG4gICAgICAgIGludlNpemUgPSBpbnZTaXplICE9PSAwID8gMSAvIGludlNpemUgOiAwO1xuICAgIH1cblxuICAgIGVhcmN1dExpbmtlZChvdXRlck5vZGUsIHRyaWFuZ2xlcywgZGltLCBtaW5YLCBtaW5ZLCBpbnZTaXplKTtcblxuICAgIHJldHVybiB0cmlhbmdsZXM7XG59XG5cbi8vIGNyZWF0ZSBhIGNpcmN1bGFyIGRvdWJseSBsaW5rZWQgbGlzdCBmcm9tIHBvbHlnb24gcG9pbnRzIGluIHRoZSBzcGVjaWZpZWQgd2luZGluZyBvcmRlclxuZnVuY3Rpb24gbGlua2VkTGlzdChkYXRhLCBzdGFydCwgZW5kLCBkaW0sIGNsb2Nrd2lzZSkge1xuICAgIGxldCBpO1xuICAgIGxldCBsYXN0O1xuXG4gICAgaWYgKGNsb2Nrd2lzZSA9PT0gc2lnbmVkQXJlYShkYXRhLCBzdGFydCwgZW5kLCBkaW0pID4gMCkge1xuICAgICAgICBmb3IgKGkgPSBzdGFydDsgaSA8IGVuZDsgaSArPSBkaW0pIHtcbiAgICAgICAgICAgIGxhc3QgPSBpbnNlcnROb2RlKGksIGRhdGFbaV0sIGRhdGFbaSArIDFdLCBsYXN0KTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAoaSA9IGVuZCAtIGRpbTsgaSA+PSBzdGFydDsgaSAtPSBkaW0pIHtcbiAgICAgICAgICAgIGxhc3QgPSBpbnNlcnROb2RlKGksIGRhdGFbaV0sIGRhdGFbaSArIDFdLCBsYXN0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChsYXN0ICYmIGVxdWFscyhsYXN0LCBsYXN0Lm5leHQpKSB7XG4gICAgICAgIHJlbW92ZU5vZGUobGFzdCk7XG4gICAgICAgIGxhc3QgPSBsYXN0Lm5leHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxhc3Q7XG59XG5cbi8vIGVsaW1pbmF0ZSBjb2xpbmVhciBvciBkdXBsaWNhdGUgcG9pbnRzXG5mdW5jdGlvbiBmaWx0ZXJQb2ludHMoc3RhcnQsIGVuZCkge1xuICAgIGlmICghc3RhcnQpIHJldHVybiBzdGFydDtcbiAgICBpZiAoIWVuZCkgZW5kID0gc3RhcnQ7XG5cbiAgICBsZXQgcCA9IHN0YXJ0O1xuICAgIGxldCBhZ2FpbjtcbiAgICBkbyB7XG4gICAgICAgIGFnYWluID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKCFwLnN0ZWluZXIgJiYgKGVxdWFscyhwLCBwLm5leHQpIHx8IGFyZWEocC5wcmV2LCBwLCBwLm5leHQpID09PSAwKSkge1xuICAgICAgICAgICAgcmVtb3ZlTm9kZShwKTtcbiAgICAgICAgICAgIHAgPSBlbmQgPSBwLnByZXY7XG4gICAgICAgICAgICBpZiAocCA9PT0gcC5uZXh0KSBicmVhaztcbiAgICAgICAgICAgIGFnYWluID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHAgPSBwLm5leHQ7XG4gICAgICAgIH1cbiAgICB9IHdoaWxlIChhZ2FpbiB8fCBwICE9PSBlbmQpO1xuXG4gICAgcmV0dXJuIGVuZDtcbn1cblxuLy8gbWFpbiBlYXIgc2xpY2luZyBsb29wIHdoaWNoIHRyaWFuZ3VsYXRlcyBhIHBvbHlnb24gKGdpdmVuIGFzIGEgbGlua2VkIGxpc3QpXG5mdW5jdGlvbiBlYXJjdXRMaW5rZWQoZWFyLCB0cmlhbmdsZXMsIGRpbSwgbWluWCwgbWluWSwgaW52U2l6ZSwgcGFzcykge1xuICAgIGlmICghZWFyKSByZXR1cm47XG5cbiAgICAvLyBpbnRlcmxpbmsgcG9seWdvbiBub2RlcyBpbiB6LW9yZGVyXG4gICAgaWYgKCFwYXNzICYmIGludlNpemUpIGluZGV4Q3VydmUoZWFyLCBtaW5YLCBtaW5ZLCBpbnZTaXplKTtcblxuICAgIGxldCBzdG9wID0gZWFyO1xuICAgIGxldCBwcmV2O1xuICAgIGxldCBuZXh0O1xuXG4gICAgLy8gaXRlcmF0ZSB0aHJvdWdoIGVhcnMsIHNsaWNpbmcgdGhlbSBvbmUgYnkgb25lXG4gICAgd2hpbGUgKGVhci5wcmV2ICE9PSBlYXIubmV4dCkge1xuICAgICAgICBwcmV2ID0gZWFyLnByZXY7XG4gICAgICAgIG5leHQgPSBlYXIubmV4dDtcblxuICAgICAgICBpZiAoaW52U2l6ZSA/IGlzRWFySGFzaGVkKGVhciwgbWluWCwgbWluWSwgaW52U2l6ZSkgOiBpc0VhcihlYXIpKSB7XG4gICAgICAgICAgICAvLyBjdXQgb2ZmIHRoZSB0cmlhbmdsZVxuICAgICAgICAgICAgdHJpYW5nbGVzLnB1c2gocHJldi5pIC8gZGltKTtcbiAgICAgICAgICAgIHRyaWFuZ2xlcy5wdXNoKGVhci5pIC8gZGltKTtcbiAgICAgICAgICAgIHRyaWFuZ2xlcy5wdXNoKG5leHQuaSAvIGRpbSk7XG5cbiAgICAgICAgICAgIHJlbW92ZU5vZGUoZWFyKTtcblxuICAgICAgICAgICAgLy8gc2tpcHBpbmcgdGhlIG5leHQgdmVydGV4IGxlYWRzIHRvIGxlc3Mgc2xpdmVyIHRyaWFuZ2xlc1xuICAgICAgICAgICAgZWFyID0gbmV4dC5uZXh0O1xuICAgICAgICAgICAgc3RvcCA9IG5leHQubmV4dDtcblxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBlYXIgPSBuZXh0O1xuXG4gICAgICAgIC8vIGlmIHdlIGxvb3BlZCB0aHJvdWdoIHRoZSB3aG9sZSByZW1haW5pbmcgcG9seWdvbiBhbmQgY2FuJ3QgZmluZCBhbnkgbW9yZSBlYXJzXG4gICAgICAgIGlmIChlYXIgPT09IHN0b3ApIHtcbiAgICAgICAgICAgIC8vIHRyeSBmaWx0ZXJpbmcgcG9pbnRzIGFuZCBzbGljaW5nIGFnYWluXG4gICAgICAgICAgICBpZiAoIXBhc3MpIHtcbiAgICAgICAgICAgICAgICBlYXJjdXRMaW5rZWQoZmlsdGVyUG9pbnRzKGVhciksIHRyaWFuZ2xlcywgZGltLCBtaW5YLCBtaW5ZLCBpbnZTaXplLCAxKTtcblxuICAgICAgICAgICAgICAgIC8vIGlmIHRoaXMgZGlkbid0IHdvcmssIHRyeSBjdXJpbmcgYWxsIHNtYWxsIHNlbGYtaW50ZXJzZWN0aW9ucyBsb2NhbGx5XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHBhc3MgPT09IDEpIHtcbiAgICAgICAgICAgICAgICBlYXIgPSBjdXJlTG9jYWxJbnRlcnNlY3Rpb25zKGVhciwgdHJpYW5nbGVzLCBkaW0pO1xuICAgICAgICAgICAgICAgIGVhcmN1dExpbmtlZChlYXIsIHRyaWFuZ2xlcywgZGltLCBtaW5YLCBtaW5ZLCBpbnZTaXplLCAyKTtcblxuICAgICAgICAgICAgICAgIC8vIGFzIGEgbGFzdCByZXNvcnQsIHRyeSBzcGxpdHRpbmcgdGhlIHJlbWFpbmluZyBwb2x5Z29uIGludG8gdHdvXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHBhc3MgPT09IDIpIHtcbiAgICAgICAgICAgICAgICBzcGxpdEVhcmN1dChlYXIsIHRyaWFuZ2xlcywgZGltLCBtaW5YLCBtaW5ZLCBpbnZTaXplKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8vIGNoZWNrIHdoZXRoZXIgYSBwb2x5Z29uIG5vZGUgZm9ybXMgYSB2YWxpZCBlYXIgd2l0aCBhZGphY2VudCBub2Rlc1xuZnVuY3Rpb24gaXNFYXIoZWFyKSB7XG4gICAgY29uc3QgYSA9IGVhci5wcmV2O1xuICAgIGNvbnN0IGIgPSBlYXI7XG4gICAgY29uc3QgYyA9IGVhci5uZXh0O1xuXG4gICAgaWYgKGFyZWEoYSwgYiwgYykgPj0gMCkgcmV0dXJuIGZhbHNlOyAvLyByZWZsZXgsIGNhbid0IGJlIGFuIGVhclxuXG4gICAgLy8gbm93IG1ha2Ugc3VyZSB3ZSBkb24ndCBoYXZlIG90aGVyIHBvaW50cyBpbnNpZGUgdGhlIHBvdGVudGlhbCBlYXJcbiAgICBsZXQgcCA9IGVhci5uZXh0Lm5leHQ7XG5cbiAgICB3aGlsZSAocCAhPT0gZWFyLnByZXYpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgcG9pbnRJblRyaWFuZ2xlKGEueCwgYS55LCBiLngsIGIueSwgYy54LCBjLnksIHAueCwgcC55KSAmJlxuICAgICAgICAgICAgYXJlYShwLnByZXYsIHAsIHAubmV4dCkgPj0gMFxuICAgICAgICApXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIHAgPSBwLm5leHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGlzRWFySGFzaGVkKGVhciwgbWluWCwgbWluWSwgaW52U2l6ZSkge1xuICAgIGNvbnN0IGEgPSBlYXIucHJldjtcbiAgICBjb25zdCBiID0gZWFyO1xuICAgIGNvbnN0IGMgPSBlYXIubmV4dDtcblxuICAgIGlmIChhcmVhKGEsIGIsIGMpID49IDApIHJldHVybiBmYWxzZTsgLy8gcmVmbGV4LCBjYW4ndCBiZSBhbiBlYXJcblxuICAgIC8vIHRyaWFuZ2xlIGJib3g7IG1pbiAmIG1heCBhcmUgY2FsY3VsYXRlZCBsaWtlIHRoaXMgZm9yIHNwZWVkXG4gICAgY29uc3QgbWluVFggPSBhLnggPCBiLnggPyAoYS54IDwgYy54ID8gYS54IDogYy54KSA6IGIueCA8IGMueCA/IGIueCA6IGMueDtcbiAgICBjb25zdCBtaW5UWSA9IGEueSA8IGIueSA/IChhLnkgPCBjLnkgPyBhLnkgOiBjLnkpIDogYi55IDwgYy55ID8gYi55IDogYy55O1xuICAgIGNvbnN0IG1heFRYID0gYS54ID4gYi54ID8gKGEueCA+IGMueCA/IGEueCA6IGMueCkgOiBiLnggPiBjLnggPyBiLnggOiBjLng7XG4gICAgY29uc3QgbWF4VFkgPSBhLnkgPiBiLnkgPyAoYS55ID4gYy55ID8gYS55IDogYy55KSA6IGIueSA+IGMueSA/IGIueSA6IGMueTtcblxuICAgIC8vIHotb3JkZXIgcmFuZ2UgZm9yIHRoZSBjdXJyZW50IHRyaWFuZ2xlIGJib3g7XG4gICAgY29uc3QgbWluWiA9IHpPcmRlcihtaW5UWCwgbWluVFksIG1pblgsIG1pblksIGludlNpemUpO1xuICAgIGNvbnN0IG1heFogPSB6T3JkZXIobWF4VFgsIG1heFRZLCBtaW5YLCBtaW5ZLCBpbnZTaXplKTtcblxuICAgIGxldCBwID0gZWFyLnByZXZaO1xuICAgIGxldCBuID0gZWFyLm5leHRaO1xuXG4gICAgLy8gbG9vayBmb3IgcG9pbnRzIGluc2lkZSB0aGUgdHJpYW5nbGUgaW4gYm90aCBkaXJlY3Rpb25zXG4gICAgd2hpbGUgKHAgJiYgcC56ID49IG1pblogJiYgbiAmJiBuLnogPD0gbWF4Wikge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICBwICE9PSBlYXIucHJldiAmJlxuICAgICAgICAgICAgcCAhPT0gZWFyLm5leHQgJiZcbiAgICAgICAgICAgIHBvaW50SW5UcmlhbmdsZShhLngsIGEueSwgYi54LCBiLnksIGMueCwgYy55LCBwLngsIHAueSkgJiZcbiAgICAgICAgICAgIGFyZWEocC5wcmV2LCBwLCBwLm5leHQpID49IDBcbiAgICAgICAgKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBwID0gcC5wcmV2WjtcblxuICAgICAgICBpZiAoXG4gICAgICAgICAgICBuICE9PSBlYXIucHJldiAmJlxuICAgICAgICAgICAgbiAhPT0gZWFyLm5leHQgJiZcbiAgICAgICAgICAgIHBvaW50SW5UcmlhbmdsZShhLngsIGEueSwgYi54LCBiLnksIGMueCwgYy55LCBuLngsIG4ueSkgJiZcbiAgICAgICAgICAgIGFyZWEobi5wcmV2LCBuLCBuLm5leHQpID49IDBcbiAgICAgICAgKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBuID0gbi5uZXh0WjtcbiAgICB9XG5cbiAgICAvLyBsb29rIGZvciByZW1haW5pbmcgcG9pbnRzIGluIGRlY3JlYXNpbmcgei1vcmRlclxuICAgIHdoaWxlIChwICYmIHAueiA+PSBtaW5aKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIHAgIT09IGVhci5wcmV2ICYmXG4gICAgICAgICAgICBwICE9PSBlYXIubmV4dCAmJlxuICAgICAgICAgICAgcG9pbnRJblRyaWFuZ2xlKGEueCwgYS55LCBiLngsIGIueSwgYy54LCBjLnksIHAueCwgcC55KSAmJlxuICAgICAgICAgICAgYXJlYShwLnByZXYsIHAsIHAubmV4dCkgPj0gMFxuICAgICAgICApXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIHAgPSBwLnByZXZaO1xuICAgIH1cblxuICAgIC8vIGxvb2sgZm9yIHJlbWFpbmluZyBwb2ludHMgaW4gaW5jcmVhc2luZyB6LW9yZGVyXG4gICAgd2hpbGUgKG4gJiYgbi56IDw9IG1heFopIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgbiAhPT0gZWFyLnByZXYgJiZcbiAgICAgICAgICAgIG4gIT09IGVhci5uZXh0ICYmXG4gICAgICAgICAgICBwb2ludEluVHJpYW5nbGUoYS54LCBhLnksIGIueCwgYi55LCBjLngsIGMueSwgbi54LCBuLnkpICYmXG4gICAgICAgICAgICBhcmVhKG4ucHJldiwgbiwgbi5uZXh0KSA+PSAwXG4gICAgICAgIClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgbiA9IG4ubmV4dFo7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG59XG5cbi8vIGdvIHRocm91Z2ggYWxsIHBvbHlnb24gbm9kZXMgYW5kIGN1cmUgc21hbGwgbG9jYWwgc2VsZi1pbnRlcnNlY3Rpb25zXG5mdW5jdGlvbiBjdXJlTG9jYWxJbnRlcnNlY3Rpb25zKHN0YXJ0LCB0cmlhbmdsZXMsIGRpbSkge1xuICAgIGxldCBwID0gc3RhcnQ7XG4gICAgZG8ge1xuICAgICAgICBjb25zdCBhID0gcC5wcmV2O1xuICAgICAgICBjb25zdCBiID0gcC5uZXh0Lm5leHQ7XG5cbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgIWVxdWFscyhhLCBiKSAmJlxuICAgICAgICAgICAgaW50ZXJzZWN0cyhhLCBwLCBwLm5leHQsIGIpICYmXG4gICAgICAgICAgICBsb2NhbGx5SW5zaWRlKGEsIGIpICYmXG4gICAgICAgICAgICBsb2NhbGx5SW5zaWRlKGIsIGEpXG4gICAgICAgICkge1xuICAgICAgICAgICAgdHJpYW5nbGVzLnB1c2goYS5pIC8gZGltKTtcbiAgICAgICAgICAgIHRyaWFuZ2xlcy5wdXNoKHAuaSAvIGRpbSk7XG4gICAgICAgICAgICB0cmlhbmdsZXMucHVzaChiLmkgLyBkaW0pO1xuXG4gICAgICAgICAgICAvLyByZW1vdmUgdHdvIG5vZGVzIGludm9sdmVkXG4gICAgICAgICAgICByZW1vdmVOb2RlKHApO1xuICAgICAgICAgICAgcmVtb3ZlTm9kZShwLm5leHQpO1xuXG4gICAgICAgICAgICBwID0gc3RhcnQgPSBiO1xuICAgICAgICB9XG4gICAgICAgIHAgPSBwLm5leHQ7XG4gICAgfSB3aGlsZSAocCAhPT0gc3RhcnQpO1xuXG4gICAgcmV0dXJuIHA7XG59XG5cbi8vIHRyeSBzcGxpdHRpbmcgcG9seWdvbiBpbnRvIHR3byBhbmQgdHJpYW5ndWxhdGUgdGhlbSBpbmRlcGVuZGVudGx5XG5mdW5jdGlvbiBzcGxpdEVhcmN1dChzdGFydCwgdHJpYW5nbGVzLCBkaW0sIG1pblgsIG1pblksIGludlNpemUpIHtcbiAgICAvLyBsb29rIGZvciBhIHZhbGlkIGRpYWdvbmFsIHRoYXQgZGl2aWRlcyB0aGUgcG9seWdvbiBpbnRvIHR3b1xuICAgIGxldCBhID0gc3RhcnQ7XG4gICAgZG8ge1xuICAgICAgICBsZXQgYiA9IGEubmV4dC5uZXh0O1xuICAgICAgICB3aGlsZSAoYiAhPT0gYS5wcmV2KSB7XG4gICAgICAgICAgICBpZiAoYS5pICE9PSBiLmkgJiYgaXNWYWxpZERpYWdvbmFsKGEsIGIpKSB7XG4gICAgICAgICAgICAgICAgLy8gc3BsaXQgdGhlIHBvbHlnb24gaW4gdHdvIGJ5IHRoZSBkaWFnb25hbFxuICAgICAgICAgICAgICAgIGxldCBjID0gc3BsaXRQb2x5Z29uKGEsIGIpO1xuXG4gICAgICAgICAgICAgICAgLy8gZmlsdGVyIGNvbGluZWFyIHBvaW50cyBhcm91bmQgdGhlIGN1dHNcbiAgICAgICAgICAgICAgICBhID0gZmlsdGVyUG9pbnRzKGEsIGEubmV4dCk7XG4gICAgICAgICAgICAgICAgYyA9IGZpbHRlclBvaW50cyhjLCBjLm5leHQpO1xuXG4gICAgICAgICAgICAgICAgLy8gcnVuIGVhcmN1dCBvbiBlYWNoIGhhbGZcbiAgICAgICAgICAgICAgICBlYXJjdXRMaW5rZWQoYSwgdHJpYW5nbGVzLCBkaW0sIG1pblgsIG1pblksIGludlNpemUpO1xuICAgICAgICAgICAgICAgIGVhcmN1dExpbmtlZChjLCB0cmlhbmdsZXMsIGRpbSwgbWluWCwgbWluWSwgaW52U2l6ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYiA9IGIubmV4dDtcbiAgICAgICAgfVxuICAgICAgICBhID0gYS5uZXh0O1xuICAgIH0gd2hpbGUgKGEgIT09IHN0YXJ0KTtcbn1cblxuLy8gbGluayBldmVyeSBob2xlIGludG8gdGhlIG91dGVyIGxvb3AsIHByb2R1Y2luZyBhIHNpbmdsZS1yaW5nIHBvbHlnb24gd2l0aG91dCBob2xlc1xuZnVuY3Rpb24gZWxpbWluYXRlSG9sZXMoZGF0YSwgaG9sZUluZGljZXMsIG91dGVyTm9kZSwgZGltKSB7XG4gICAgY29uc3QgcXVldWUgPSBbXTtcbiAgICBsZXQgaTtcbiAgICBsZXQgbGVuO1xuICAgIGxldCBzdGFydDtcbiAgICBsZXQgZW5kO1xuICAgIGxldCBsaXN0O1xuXG4gICAgZm9yIChpID0gMCwgbGVuID0gaG9sZUluZGljZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgc3RhcnQgPSBob2xlSW5kaWNlc1tpXSAqIGRpbTtcbiAgICAgICAgZW5kID0gaSA8IGxlbiAtIDEgPyBob2xlSW5kaWNlc1tpICsgMV0gKiBkaW0gOiBkYXRhLmxlbmd0aDtcbiAgICAgICAgbGlzdCA9IGxpbmtlZExpc3QoZGF0YSwgc3RhcnQsIGVuZCwgZGltLCBmYWxzZSk7XG4gICAgICAgIGlmIChsaXN0ID09PSBsaXN0Lm5leHQpIGxpc3Quc3RlaW5lciA9IHRydWU7XG4gICAgICAgIHF1ZXVlLnB1c2goZ2V0TGVmdG1vc3QobGlzdCkpO1xuICAgIH1cblxuICAgIHF1ZXVlLnNvcnQoY29tcGFyZVgpO1xuXG4gICAgLy8gcHJvY2VzcyBob2xlcyBmcm9tIGxlZnQgdG8gcmlnaHRcbiAgICBmb3IgKGkgPSAwOyBpIDwgcXVldWUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxpbWluYXRlSG9sZShxdWV1ZVtpXSwgb3V0ZXJOb2RlKTtcbiAgICAgICAgb3V0ZXJOb2RlID0gZmlsdGVyUG9pbnRzKG91dGVyTm9kZSwgb3V0ZXJOb2RlLm5leHQpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXRlck5vZGU7XG59XG5cbmZ1bmN0aW9uIGNvbXBhcmVYKGEsIGIpIHtcbiAgICByZXR1cm4gYS54IC0gYi54O1xufVxuXG4vLyBmaW5kIGEgYnJpZGdlIGJldHdlZW4gdmVydGljZXMgdGhhdCBjb25uZWN0cyBob2xlIHdpdGggYW4gb3V0ZXIgcmluZyBhbmQgYW5kIGxpbmsgaXRcbmZ1bmN0aW9uIGVsaW1pbmF0ZUhvbGUoaG9sZSwgb3V0ZXJOb2RlKSB7XG4gICAgb3V0ZXJOb2RlID0gZmluZEhvbGVCcmlkZ2UoaG9sZSwgb3V0ZXJOb2RlKTtcbiAgICBpZiAob3V0ZXJOb2RlKSB7XG4gICAgICAgIGNvbnN0IGIgPSBzcGxpdFBvbHlnb24ob3V0ZXJOb2RlLCBob2xlKTtcbiAgICAgICAgZmlsdGVyUG9pbnRzKGIsIGIubmV4dCk7XG4gICAgfVxufVxuXG4vLyBEYXZpZCBFYmVybHkncyBhbGdvcml0aG0gZm9yIGZpbmRpbmcgYSBicmlkZ2UgYmV0d2VlbiBob2xlIGFuZCBvdXRlciBwb2x5Z29uXG5mdW5jdGlvbiBmaW5kSG9sZUJyaWRnZShob2xlLCBvdXRlck5vZGUpIHtcbiAgICBsZXQgcCA9IG91dGVyTm9kZTtcbiAgICBjb25zdCBoeCA9IGhvbGUueDtcbiAgICBjb25zdCBoeSA9IGhvbGUueTtcbiAgICBsZXQgcXggPSAtSW5maW5pdHk7XG4gICAgbGV0IG07XG5cbiAgICAvLyBmaW5kIGEgc2VnbWVudCBpbnRlcnNlY3RlZCBieSBhIHJheSBmcm9tIHRoZSBob2xlJ3MgbGVmdG1vc3QgcG9pbnQgdG8gdGhlIGxlZnQ7XG4gICAgLy8gc2VnbWVudCdzIGVuZHBvaW50IHdpdGggbGVzc2VyIHggd2lsbCBiZSBwb3RlbnRpYWwgY29ubmVjdGlvbiBwb2ludFxuICAgIGRvIHtcbiAgICAgICAgaWYgKGh5IDw9IHAueSAmJiBoeSA+PSBwLm5leHQueSAmJiBwLm5leHQueSAhPT0gcC55KSB7XG4gICAgICAgICAgICBjb25zdCB4ID0gcC54ICsgKChoeSAtIHAueSkgKiAocC5uZXh0LnggLSBwLngpKSAvIChwLm5leHQueSAtIHAueSk7XG4gICAgICAgICAgICBpZiAoeCA8PSBoeCAmJiB4ID4gcXgpIHtcbiAgICAgICAgICAgICAgICBxeCA9IHg7XG4gICAgICAgICAgICAgICAgaWYgKHggPT09IGh4KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChoeSA9PT0gcC55KSByZXR1cm4gcDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGh5ID09PSBwLm5leHQueSkgcmV0dXJuIHAubmV4dDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbSA9IHAueCA8IHAubmV4dC54ID8gcCA6IHAubmV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwID0gcC5uZXh0O1xuICAgIH0gd2hpbGUgKHAgIT09IG91dGVyTm9kZSk7XG5cbiAgICBpZiAoIW0pIHJldHVybiBudWxsO1xuXG4gICAgaWYgKGh4ID09PSBxeCkgcmV0dXJuIG0ucHJldjsgLy8gaG9sZSB0b3VjaGVzIG91dGVyIHNlZ21lbnQ7IHBpY2sgbG93ZXIgZW5kcG9pbnRcblxuICAgIC8vIGxvb2sgZm9yIHBvaW50cyBpbnNpZGUgdGhlIHRyaWFuZ2xlIG9mIGhvbGUgcG9pbnQsIHNlZ21lbnQgaW50ZXJzZWN0aW9uIGFuZCBlbmRwb2ludDtcbiAgICAvLyBpZiB0aGVyZSBhcmUgbm8gcG9pbnRzIGZvdW5kLCB3ZSBoYXZlIGEgdmFsaWQgY29ubmVjdGlvbjtcbiAgICAvLyBvdGhlcndpc2UgY2hvb3NlIHRoZSBwb2ludCBvZiB0aGUgbWluaW11bSBhbmdsZSB3aXRoIHRoZSByYXkgYXMgY29ubmVjdGlvbiBwb2ludFxuXG4gICAgY29uc3Qgc3RvcCA9IG07XG4gICAgY29uc3QgbXggPSBtLng7XG4gICAgY29uc3QgbXkgPSBtLnk7XG4gICAgbGV0IHRhbk1pbiA9IEluZmluaXR5O1xuICAgIGxldCB0YW47XG5cbiAgICBwID0gbS5uZXh0O1xuXG4gICAgd2hpbGUgKHAgIT09IHN0b3ApIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgaHggPj0gcC54ICYmXG4gICAgICAgICAgICBwLnggPj0gbXggJiZcbiAgICAgICAgICAgIGh4ICE9PSBwLnggJiZcbiAgICAgICAgICAgIHBvaW50SW5UcmlhbmdsZShcbiAgICAgICAgICAgICAgICBoeSA8IG15ID8gaHggOiBxeCxcbiAgICAgICAgICAgICAgICBoeSxcbiAgICAgICAgICAgICAgICBteCxcbiAgICAgICAgICAgICAgICBteSxcbiAgICAgICAgICAgICAgICBoeSA8IG15ID8gcXggOiBoeCxcbiAgICAgICAgICAgICAgICBoeSxcbiAgICAgICAgICAgICAgICBwLngsXG4gICAgICAgICAgICAgICAgcC55LFxuICAgICAgICAgICAgKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHRhbiA9IE1hdGguYWJzKGh5IC0gcC55KSAvIChoeCAtIHAueCk7IC8vIHRhbmdlbnRpYWxcblxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICh0YW4gPCB0YW5NaW4gfHwgKHRhbiA9PT0gdGFuTWluICYmIHAueCA+IG0ueCkpICYmXG4gICAgICAgICAgICAgICAgbG9jYWxseUluc2lkZShwLCBob2xlKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgbSA9IHA7XG4gICAgICAgICAgICAgICAgdGFuTWluID0gdGFuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcCA9IHAubmV4dDtcbiAgICB9XG5cbiAgICByZXR1cm4gbTtcbn1cblxuLy8gaW50ZXJsaW5rIHBvbHlnb24gbm9kZXMgaW4gei1vcmRlclxuZnVuY3Rpb24gaW5kZXhDdXJ2ZShzdGFydCwgbWluWCwgbWluWSwgaW52U2l6ZSkge1xuICAgIGxldCBwID0gc3RhcnQ7XG4gICAgZG8ge1xuICAgICAgICBpZiAocC56ID09PSBudWxsKSBwLnogPSB6T3JkZXIocC54LCBwLnksIG1pblgsIG1pblksIGludlNpemUpO1xuICAgICAgICBwLnByZXZaID0gcC5wcmV2O1xuICAgICAgICBwLm5leHRaID0gcC5uZXh0O1xuICAgICAgICBwID0gcC5uZXh0O1xuICAgIH0gd2hpbGUgKHAgIT09IHN0YXJ0KTtcblxuICAgIHAucHJldloubmV4dFogPSBudWxsO1xuICAgIHAucHJldlogPSBudWxsO1xuXG4gICAgc29ydExpbmtlZChwKTtcbn1cblxuLy8gU2ltb24gVGF0aGFtJ3MgbGlua2VkIGxpc3QgbWVyZ2Ugc29ydCBhbGdvcml0aG1cbi8vIGh0dHA6Ly93d3cuY2hpYXJrLmdyZWVuZW5kLm9yZy51ay9+c2d0YXRoYW0vYWxnb3JpdGhtcy9saXN0c29ydC5odG1sXG5mdW5jdGlvbiBzb3J0TGlua2VkKGxpc3QpIHtcbiAgICBsZXQgaTtcbiAgICBsZXQgcDtcbiAgICBsZXQgcTtcbiAgICBsZXQgZTtcbiAgICBsZXQgdGFpbDtcbiAgICBsZXQgbnVtTWVyZ2VzO1xuICAgIGxldCBwU2l6ZTtcbiAgICBsZXQgcVNpemU7XG4gICAgbGV0IGluU2l6ZSA9IDE7XG5cbiAgICBkbyB7XG4gICAgICAgIHAgPSBsaXN0O1xuICAgICAgICBsaXN0ID0gbnVsbDtcbiAgICAgICAgdGFpbCA9IG51bGw7XG4gICAgICAgIG51bU1lcmdlcyA9IDA7XG5cbiAgICAgICAgd2hpbGUgKHApIHtcbiAgICAgICAgICAgIG51bU1lcmdlcysrO1xuICAgICAgICAgICAgcSA9IHA7XG4gICAgICAgICAgICBwU2l6ZSA9IDA7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgaW5TaXplOyBpKyspIHtcbiAgICAgICAgICAgICAgICBwU2l6ZSsrO1xuICAgICAgICAgICAgICAgIHEgPSBxLm5leHRaO1xuICAgICAgICAgICAgICAgIGlmICghcSkgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBxU2l6ZSA9IGluU2l6ZTtcblxuICAgICAgICAgICAgd2hpbGUgKHBTaXplID4gMCB8fCAocVNpemUgPiAwICYmIHEpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBTaXplICE9PSAwICYmIChxU2l6ZSA9PT0gMCB8fCAhcSB8fCBwLnogPD0gcS56KSkge1xuICAgICAgICAgICAgICAgICAgICBlID0gcDtcbiAgICAgICAgICAgICAgICAgICAgcCA9IHAubmV4dFo7XG4gICAgICAgICAgICAgICAgICAgIHBTaXplLS07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZSA9IHE7XG4gICAgICAgICAgICAgICAgICAgIHEgPSBxLm5leHRaO1xuICAgICAgICAgICAgICAgICAgICBxU2l6ZS0tO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh0YWlsKSB0YWlsLm5leHRaID0gZTtcbiAgICAgICAgICAgICAgICBlbHNlIGxpc3QgPSBlO1xuXG4gICAgICAgICAgICAgICAgZS5wcmV2WiA9IHRhaWw7XG4gICAgICAgICAgICAgICAgdGFpbCA9IGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHAgPSBxO1xuICAgICAgICB9XG5cbiAgICAgICAgdGFpbC5uZXh0WiA9IG51bGw7XG4gICAgICAgIGluU2l6ZSAqPSAyO1xuICAgIH0gd2hpbGUgKG51bU1lcmdlcyA+IDEpO1xuXG4gICAgcmV0dXJuIGxpc3Q7XG59XG5cbi8vIHotb3JkZXIgb2YgYSBwb2ludCBnaXZlbiBjb29yZHMgYW5kIGludmVyc2Ugb2YgdGhlIGxvbmdlciBzaWRlIG9mIGRhdGEgYmJveFxuZnVuY3Rpb24gek9yZGVyKHgsIHksIG1pblgsIG1pblksIGludlNpemUpIHtcbiAgICAvLyBjb29yZHMgYXJlIHRyYW5zZm9ybWVkIGludG8gbm9uLW5lZ2F0aXZlIDE1LWJpdCBpbnRlZ2VyIHJhbmdlXG4gICAgeCA9IDMyNzY3ICogKHggLSBtaW5YKSAqIGludlNpemU7XG4gICAgeSA9IDMyNzY3ICogKHkgLSBtaW5ZKSAqIGludlNpemU7XG5cbiAgICB4ID0gKHggfCAoeCA8PCA4KSkgJiAweDAwZmYwMGZmO1xuICAgIHggPSAoeCB8ICh4IDw8IDQpKSAmIDB4MGYwZjBmMGY7XG4gICAgeCA9ICh4IHwgKHggPDwgMikpICYgMHgzMzMzMzMzMztcbiAgICB4ID0gKHggfCAoeCA8PCAxKSkgJiAweDU1NTU1NTU1O1xuXG4gICAgeSA9ICh5IHwgKHkgPDwgOCkpICYgMHgwMGZmMDBmZjtcbiAgICB5ID0gKHkgfCAoeSA8PCA0KSkgJiAweDBmMGYwZjBmO1xuICAgIHkgPSAoeSB8ICh5IDw8IDIpKSAmIDB4MzMzMzMzMzM7XG4gICAgeSA9ICh5IHwgKHkgPDwgMSkpICYgMHg1NTU1NTU1NTtcblxuICAgIHJldHVybiB4IHwgKHkgPDwgMSk7XG59XG5cbi8vIGZpbmQgdGhlIGxlZnRtb3N0IG5vZGUgb2YgYSBwb2x5Z29uIHJpbmdcbmZ1bmN0aW9uIGdldExlZnRtb3N0KHN0YXJ0KSB7XG4gICAgbGV0IHAgPSBzdGFydDtcbiAgICBsZXQgbGVmdG1vc3QgPSBzdGFydDtcbiAgICBkbyB7XG4gICAgICAgIGlmIChwLnggPCBsZWZ0bW9zdC54KSBsZWZ0bW9zdCA9IHA7XG4gICAgICAgIHAgPSBwLm5leHQ7XG4gICAgfSB3aGlsZSAocCAhPT0gc3RhcnQpO1xuXG4gICAgcmV0dXJuIGxlZnRtb3N0O1xufVxuXG4vLyBjaGVjayBpZiBhIHBvaW50IGxpZXMgd2l0aGluIGEgY29udmV4IHRyaWFuZ2xlXG5mdW5jdGlvbiBwb2ludEluVHJpYW5nbGUoYXgsIGF5LCBieCwgYnksIGN4LCBjeSwgcHgsIHB5KSB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgKGN4IC0gcHgpICogKGF5IC0gcHkpIC0gKGF4IC0gcHgpICogKGN5IC0gcHkpID49IDAgJiZcbiAgICAgICAgKGF4IC0gcHgpICogKGJ5IC0gcHkpIC0gKGJ4IC0gcHgpICogKGF5IC0gcHkpID49IDAgJiZcbiAgICAgICAgKGJ4IC0gcHgpICogKGN5IC0gcHkpIC0gKGN4IC0gcHgpICogKGJ5IC0gcHkpID49IDBcbiAgICApO1xufVxuXG4vLyBjaGVjayBpZiBhIGRpYWdvbmFsIGJldHdlZW4gdHdvIHBvbHlnb24gbm9kZXMgaXMgdmFsaWQgKGxpZXMgaW4gcG9seWdvbiBpbnRlcmlvcilcbmZ1bmN0aW9uIGlzVmFsaWREaWFnb25hbChhLCBiKSB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgYS5uZXh0LmkgIT09IGIuaSAmJlxuICAgICAgICBhLnByZXYuaSAhPT0gYi5pICYmXG4gICAgICAgICFpbnRlcnNlY3RzUG9seWdvbihhLCBiKSAmJlxuICAgICAgICBsb2NhbGx5SW5zaWRlKGEsIGIpICYmXG4gICAgICAgIGxvY2FsbHlJbnNpZGUoYiwgYSkgJiZcbiAgICAgICAgbWlkZGxlSW5zaWRlKGEsIGIpXG4gICAgKTtcbn1cblxuLy8gc2lnbmVkIGFyZWEgb2YgYSB0cmlhbmdsZVxuZnVuY3Rpb24gYXJlYShwLCBxLCByKSB7XG4gICAgcmV0dXJuIChxLnkgLSBwLnkpICogKHIueCAtIHEueCkgLSAocS54IC0gcC54KSAqIChyLnkgLSBxLnkpO1xufVxuXG4vLyBjaGVjayBpZiB0d28gcG9pbnRzIGFyZSBlcXVhbFxuZnVuY3Rpb24gZXF1YWxzKHAxLCBwMikge1xuICAgIHJldHVybiBwMS54ID09PSBwMi54ICYmIHAxLnkgPT09IHAyLnk7XG59XG5cbi8vIGNoZWNrIGlmIHR3byBzZWdtZW50cyBpbnRlcnNlY3RcbmZ1bmN0aW9uIGludGVyc2VjdHMocDEsIHExLCBwMiwgcTIpIHtcbiAgICBpZiAoKGVxdWFscyhwMSwgcTEpICYmIGVxdWFscyhwMiwgcTIpKSB8fCAoZXF1YWxzKHAxLCBxMikgJiYgZXF1YWxzKHAyLCBxMSkpKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gKFxuICAgICAgICBhcmVhKHAxLCBxMSwgcDIpID4gMCAhPT0gYXJlYShwMSwgcTEsIHEyKSA+IDAgJiZcbiAgICAgICAgYXJlYShwMiwgcTIsIHAxKSA+IDAgIT09IGFyZWEocDIsIHEyLCBxMSkgPiAwXG4gICAgKTtcbn1cblxuLy8gY2hlY2sgaWYgYSBwb2x5Z29uIGRpYWdvbmFsIGludGVyc2VjdHMgYW55IHBvbHlnb24gc2VnbWVudHNcbmZ1bmN0aW9uIGludGVyc2VjdHNQb2x5Z29uKGEsIGIpIHtcbiAgICBsZXQgcCA9IGE7XG4gICAgZG8ge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICBwLmkgIT09IGEuaSAmJlxuICAgICAgICAgICAgcC5uZXh0LmkgIT09IGEuaSAmJlxuICAgICAgICAgICAgcC5pICE9PSBiLmkgJiZcbiAgICAgICAgICAgIHAubmV4dC5pICE9PSBiLmkgJiZcbiAgICAgICAgICAgIGludGVyc2VjdHMocCwgcC5uZXh0LCBhLCBiKVxuICAgICAgICApXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgcCA9IHAubmV4dDtcbiAgICB9IHdoaWxlIChwICE9PSBhKTtcblxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuLy8gY2hlY2sgaWYgYSBwb2x5Z29uIGRpYWdvbmFsIGlzIGxvY2FsbHkgaW5zaWRlIHRoZSBwb2x5Z29uXG5mdW5jdGlvbiBsb2NhbGx5SW5zaWRlKGEsIGIpIHtcbiAgICByZXR1cm4gYXJlYShhLnByZXYsIGEsIGEubmV4dCkgPCAwXG4gICAgICAgID8gYXJlYShhLCBiLCBhLm5leHQpID49IDAgJiYgYXJlYShhLCBhLnByZXYsIGIpID49IDBcbiAgICAgICAgOiBhcmVhKGEsIGIsIGEucHJldikgPCAwIHx8IGFyZWEoYSwgYS5uZXh0LCBiKSA8IDA7XG59XG5cbi8vIGNoZWNrIGlmIHRoZSBtaWRkbGUgcG9pbnQgb2YgYSBwb2x5Z29uIGRpYWdvbmFsIGlzIGluc2lkZSB0aGUgcG9seWdvblxuZnVuY3Rpb24gbWlkZGxlSW5zaWRlKGEsIGIpIHtcbiAgICBsZXQgcCA9IGE7XG4gICAgbGV0IGluc2lkZSA9IGZhbHNlO1xuICAgIGNvbnN0IHB4ID0gKGEueCArIGIueCkgLyAyO1xuICAgIGNvbnN0IHB5ID0gKGEueSArIGIueSkgLyAyO1xuICAgIGRvIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgcC55ID4gcHkgIT09IHAubmV4dC55ID4gcHkgJiZcbiAgICAgICAgICAgIHAubmV4dC55ICE9PSBwLnkgJiZcbiAgICAgICAgICAgIHB4IDwgKChwLm5leHQueCAtIHAueCkgKiAocHkgLSBwLnkpKSAvIChwLm5leHQueSAtIHAueSkgKyBwLnhcbiAgICAgICAgKVxuICAgICAgICAgICAgaW5zaWRlID0gIWluc2lkZTtcbiAgICAgICAgcCA9IHAubmV4dDtcbiAgICB9IHdoaWxlIChwICE9PSBhKTtcblxuICAgIHJldHVybiBpbnNpZGU7XG59XG5cbi8vIGxpbmsgdHdvIHBvbHlnb24gdmVydGljZXMgd2l0aCBhIGJyaWRnZTsgaWYgdGhlIHZlcnRpY2VzIGJlbG9uZyB0byB0aGUgc2FtZSByaW5nLCBpdCBzcGxpdHMgcG9seWdvbiBpbnRvIHR3bztcbi8vIGlmIG9uZSBiZWxvbmdzIHRvIHRoZSBvdXRlciByaW5nIGFuZCBhbm90aGVyIHRvIGEgaG9sZSwgaXQgbWVyZ2VzIGl0IGludG8gYSBzaW5nbGUgcmluZ1xuZnVuY3Rpb24gc3BsaXRQb2x5Z29uKGEsIGIpIHtcbiAgICBjb25zdCBhMiA9IG5ldyBOb2RlKGEuaSwgYS54LCBhLnkpO1xuICAgIGNvbnN0IGIyID0gbmV3IE5vZGUoYi5pLCBiLngsIGIueSk7XG4gICAgY29uc3QgYW4gPSBhLm5leHQ7XG4gICAgY29uc3QgYnAgPSBiLnByZXY7XG5cbiAgICBhLm5leHQgPSBiO1xuICAgIGIucHJldiA9IGE7XG5cbiAgICBhMi5uZXh0ID0gYW47XG4gICAgYW4ucHJldiA9IGEyO1xuXG4gICAgYjIubmV4dCA9IGEyO1xuICAgIGEyLnByZXYgPSBiMjtcblxuICAgIGJwLm5leHQgPSBiMjtcbiAgICBiMi5wcmV2ID0gYnA7XG5cbiAgICByZXR1cm4gYjI7XG59XG5cbi8vIGNyZWF0ZSBhIG5vZGUgYW5kIG9wdGlvbmFsbHkgbGluayBpdCB3aXRoIHByZXZpb3VzIG9uZSAoaW4gYSBjaXJjdWxhciBkb3VibHkgbGlua2VkIGxpc3QpXG5mdW5jdGlvbiBpbnNlcnROb2RlKGksIHgsIHksIGxhc3QpIHtcbiAgICBjb25zdCBwID0gbmV3IE5vZGUoaSwgeCwgeSk7XG5cbiAgICBpZiAoIWxhc3QpIHtcbiAgICAgICAgcC5wcmV2ID0gcDtcbiAgICAgICAgcC5uZXh0ID0gcDtcbiAgICB9IGVsc2Uge1xuICAgICAgICBwLm5leHQgPSBsYXN0Lm5leHQ7XG4gICAgICAgIHAucHJldiA9IGxhc3Q7XG4gICAgICAgIGxhc3QubmV4dC5wcmV2ID0gcDtcbiAgICAgICAgbGFzdC5uZXh0ID0gcDtcbiAgICB9XG4gICAgcmV0dXJuIHA7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZU5vZGUocCkge1xuICAgIHAubmV4dC5wcmV2ID0gcC5wcmV2O1xuICAgIHAucHJldi5uZXh0ID0gcC5uZXh0O1xuXG4gICAgaWYgKHAucHJldlopIHAucHJldloubmV4dFogPSBwLm5leHRaO1xuICAgIGlmIChwLm5leHRaKSBwLm5leHRaLnByZXZaID0gcC5wcmV2Wjtcbn1cblxuZnVuY3Rpb24gTm9kZShpLCB4LCB5KSB7XG4gICAgLy8gdmVydGV4IGluZGV4IGluIGNvb3JkaW5hdGVzIGFycmF5XG4gICAgdGhpcy5pID0gaTtcblxuICAgIC8vIHZlcnRleCBjb29yZGluYXRlc1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcblxuICAgIC8vIHByZXZpb3VzIGFuZCBuZXh0IHZlcnRleCBub2RlcyBpbiBhIHBvbHlnb24gcmluZ1xuICAgIHRoaXMucHJldiA9IG51bGw7XG4gICAgdGhpcy5uZXh0ID0gbnVsbDtcblxuICAgIC8vIHotb3JkZXIgY3VydmUgdmFsdWVcbiAgICB0aGlzLnogPSBudWxsO1xuXG4gICAgLy8gcHJldmlvdXMgYW5kIG5leHQgbm9kZXMgaW4gei1vcmRlclxuICAgIHRoaXMucHJldlogPSBudWxsO1xuICAgIHRoaXMubmV4dFogPSBudWxsO1xuXG4gICAgLy8gaW5kaWNhdGVzIHdoZXRoZXIgdGhpcyBpcyBhIHN0ZWluZXIgcG9pbnRcbiAgICB0aGlzLnN0ZWluZXIgPSBmYWxzZTtcbn1cblxuLy8gcmV0dXJuIGEgcGVyY2VudGFnZSBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIHBvbHlnb24gYXJlYSBhbmQgaXRzIHRyaWFuZ3VsYXRpb24gYXJlYTtcbi8vIHVzZWQgdG8gdmVyaWZ5IGNvcnJlY3RuZXNzIG9mIHRyaWFuZ3VsYXRpb25cbmVhcmN1dC5kZXZpYXRpb24gPSBmdW5jdGlvbiAoZGF0YSwgaG9sZUluZGljZXMsIGRpbSwgdHJpYW5nbGVzKSB7XG4gICAgY29uc3QgaGFzSG9sZXMgPSBob2xlSW5kaWNlcz8ubGVuZ3RoO1xuICAgIGNvbnN0IG91dGVyTGVuID0gaGFzSG9sZXMgPyBob2xlSW5kaWNlc1swXSAqIGRpbSA6IGRhdGEubGVuZ3RoO1xuXG4gICAgbGV0IHBvbHlnb25BcmVhID0gTWF0aC5hYnMoc2lnbmVkQXJlYShkYXRhLCAwLCBvdXRlckxlbiwgZGltKSk7XG4gICAgaWYgKGhhc0hvbGVzKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBob2xlSW5kaWNlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBob2xlSW5kaWNlc1tpXSAqIGRpbTtcbiAgICAgICAgICAgIGNvbnN0IGVuZCA9IGkgPCBsZW4gLSAxID8gaG9sZUluZGljZXNbaSArIDFdICogZGltIDogZGF0YS5sZW5ndGg7XG4gICAgICAgICAgICBwb2x5Z29uQXJlYSAtPSBNYXRoLmFicyhzaWduZWRBcmVhKGRhdGEsIHN0YXJ0LCBlbmQsIGRpbSkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbGV0IHRyaWFuZ2xlc0FyZWEgPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdHJpYW5nbGVzLmxlbmd0aDsgaSArPSAzKSB7XG4gICAgICAgIGNvbnN0IGEgPSB0cmlhbmdsZXNbaV0gKiBkaW07XG4gICAgICAgIGNvbnN0IGIgPSB0cmlhbmdsZXNbaSArIDFdICogZGltO1xuICAgICAgICBjb25zdCBjID0gdHJpYW5nbGVzW2kgKyAyXSAqIGRpbTtcbiAgICAgICAgdHJpYW5nbGVzQXJlYSArPSBNYXRoLmFicyhcbiAgICAgICAgICAgIChkYXRhW2FdIC0gZGF0YVtjXSkgKiAoZGF0YVtiICsgMV0gLSBkYXRhW2EgKyAxXSkgLVxuICAgICAgICAgICAgICAgIChkYXRhW2FdIC0gZGF0YVtiXSkgKiAoZGF0YVtjICsgMV0gLSBkYXRhW2EgKyAxXSksXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBvbHlnb25BcmVhID09PSAwICYmIHRyaWFuZ2xlc0FyZWEgPT09IDBcbiAgICAgICAgPyAwXG4gICAgICAgIDogTWF0aC5hYnMoKHRyaWFuZ2xlc0FyZWEgLSBwb2x5Z29uQXJlYSkgLyBwb2x5Z29uQXJlYSk7XG59O1xuXG5mdW5jdGlvbiBzaWduZWRBcmVhKGRhdGEsIHN0YXJ0LCBlbmQsIGRpbSkge1xuICAgIGxldCBzdW0gPSAwO1xuICAgIGZvciAobGV0IGkgPSBzdGFydCwgaiA9IGVuZCAtIGRpbTsgaSA8IGVuZDsgaSArPSBkaW0pIHtcbiAgICAgICAgc3VtICs9IChkYXRhW2pdIC0gZGF0YVtpXSkgKiAoZGF0YVtpICsgMV0gKyBkYXRhW2ogKyAxXSk7XG4gICAgICAgIGogPSBpO1xuICAgIH1cbiAgICByZXR1cm4gc3VtO1xufVxuXG4vLyB0dXJuIGEgcG9seWdvbiBpbiBhIG11bHRpLWRpbWVuc2lvbmFsIGFycmF5IGZvcm0gKGUuZy4gYXMgaW4gR2VvSlNPTikgaW50byBhIGZvcm0gRWFyY3V0IGFjY2VwdHNcbmVhcmN1dC5mbGF0dGVuID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBjb25zdCBkaW0gPSBkYXRhWzBdWzBdLmxlbmd0aDtcbiAgICBjb25zdCByZXN1bHQgPSB7IHZlcnRpY2VzOiBbXSwgaG9sZXM6IFtdLCBkaW1lbnNpb25zOiBkaW0gfTtcbiAgICBsZXQgaG9sZUluZGV4ID0gMDtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGRhdGFbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGZvciAobGV0IGQgPSAwOyBkIDwgZGltOyBkKyspIHtcbiAgICAgICAgICAgICAgICByZXN1bHQudmVydGljZXMucHVzaChkYXRhW2ldW2pdW2RdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICAgIGhvbGVJbmRleCArPSBkYXRhW2kgLSAxXS5sZW5ndGg7XG4gICAgICAgICAgICByZXN1bHQuaG9sZXMucHVzaChob2xlSW5kZXgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxydXN0XFxcXERlc2t0b3BcXFxccHJvamVjdHNcXFxcc3VydmV2LXByb2RcXFxcc2hhcmVkXFxcXHV0aWxzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxydXN0XFxcXERlc2t0b3BcXFxccHJvamVjdHNcXFxcc3VydmV2LXByb2RcXFxcc2hhcmVkXFxcXHV0aWxzXFxcXHYyLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9ydXN0L0Rlc2t0b3AvcHJvamVjdHMvc3VydmV2LXByb2Qvc2hhcmVkL3V0aWxzL3YyLnRzXCI7ZnVuY3Rpb24gbWluKGE6IG51bWJlciwgYjogbnVtYmVyKSB7XG4gICAgcmV0dXJuIGEgPCBiID8gYSA6IGI7XG59XG5cbmZ1bmN0aW9uIG1heChhOiBudW1iZXIsIGI6IG51bWJlcikge1xuICAgIHJldHVybiBhID4gYiA/IGEgOiBiO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFZlYzIge1xuICAgIHg6IG51bWJlcjtcbiAgICB5OiBudW1iZXI7XG59XG5cbmV4cG9ydCBjb25zdCB2MiA9IHtcbiAgICBjcmVhdGUoeDogbnVtYmVyLCB5PzogbnVtYmVyKTogVmVjMiB7XG4gICAgICAgIHJldHVybiB7IHgsIHk6IHkgPz8geCB9O1xuICAgIH0sXG5cbiAgICBjb3B5KHZlYzogVmVjMik6IFZlYzIge1xuICAgICAgICByZXR1cm4geyB4OiB2ZWMueCwgeTogdmVjLnkgfTtcbiAgICB9LFxuXG4gICAgc2V0KGE6IFZlYzIsIGI6IFZlYzIpOiB2b2lkIHtcbiAgICAgICAgYS54ID0gYi54O1xuICAgICAgICBhLnkgPSBiLnk7XG4gICAgfSxcblxuICAgIGFkZChhOiBWZWMyLCBiOiBWZWMyKTogVmVjMiB7XG4gICAgICAgIHJldHVybiB7IHg6IGEueCArIGIueCwgeTogYS55ICsgYi55IH07XG4gICAgfSxcblxuICAgIHN1YihhOiBWZWMyLCBiOiBWZWMyKTogVmVjMiB7XG4gICAgICAgIHJldHVybiB7IHg6IGEueCAtIGIueCwgeTogYS55IC0gYi55IH07XG4gICAgfSxcblxuICAgIG11bChhOiBWZWMyLCBzOiBudW1iZXIpOiBWZWMyIHtcbiAgICAgICAgcmV0dXJuIHsgeDogYS54ICogcywgeTogYS55ICogcyB9O1xuICAgIH0sXG5cbiAgICBkaXYoYTogVmVjMiwgczogbnVtYmVyKTogVmVjMiB7XG4gICAgICAgIHJldHVybiB7IHg6IGEueCAvIHMsIHk6IGEueSAvIHMgfTtcbiAgICB9LFxuXG4gICAgbmVnKGE6IFZlYzIpOiBWZWMyIHtcbiAgICAgICAgcmV0dXJuIHsgeDogLWEueCwgeTogLWEueSB9O1xuICAgIH0sXG5cbiAgICBsZW5ndGhTcXIoYTogVmVjMik6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBhLnggKiBhLnggKyBhLnkgKiBhLnk7XG4gICAgfSxcblxuICAgIGxlbmd0aChhOiBWZWMyKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydCh2Mi5sZW5ndGhTcXIoYSkpO1xuICAgIH0sXG5cbiAgICBub3JtYWxpemUoYTogVmVjMik6IFZlYzIge1xuICAgICAgICBjb25zdCBlcHMgPSAwLjAwMDAwMTtcbiAgICAgICAgY29uc3QgbGVuID0gdjIubGVuZ3RoKGEpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogbGVuID4gZXBzID8gYS54IC8gbGVuIDogYS54LFxuICAgICAgICAgICAgeTogbGVuID4gZXBzID8gYS55IC8gbGVuIDogYS55LFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBkaXN0YW5jZShzdGFydFBvczogVmVjMiwgZmluaXNoUG9zOiBWZWMyKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3QgZGlmZlBvcyA9IHYyLnN1YihzdGFydFBvcywgZmluaXNoUG9zKTtcbiAgICAgICAgcmV0dXJuIHYyLmxlbmd0aChkaWZmUG9zKTtcbiAgICB9LFxuXG4gICAgZGlyZWN0aW9uTm9ybWFsaXplZChhOiBWZWMyLCBiOiBWZWMyKTogVmVjMiB7XG4gICAgICAgIGNvbnN0IGRpZmZQb3MgPSB2Mi5zdWIoYiwgYSk7XG4gICAgICAgIHJldHVybiB2Mi5ub3JtYWxpemUoZGlmZlBvcyk7XG4gICAgfSxcblxuICAgIG5vcm1hbGl6ZVNhZmUoYTogVmVjMiwgdiA9IHsgeDogMS4wLCB5OiAwLjAgfSk6IFZlYzIge1xuICAgICAgICBjb25zdCBlcHMgPSAwLjAwMDAwMTtcbiAgICAgICAgY29uc3QgbGVuID0gdjIubGVuZ3RoKGEpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogbGVuID4gZXBzID8gYS54IC8gbGVuIDogdi54LFxuICAgICAgICAgICAgeTogbGVuID4gZXBzID8gYS55IC8gbGVuIDogdi55LFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBkb3QoYTogVmVjMiwgYjogVmVjMik6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBhLnggKiBiLnggKyBhLnkgKiBiLnk7XG4gICAgfSxcblxuICAgIHBlcnAoYTogVmVjMik6IFZlYzIge1xuICAgICAgICByZXR1cm4geyB4OiAtYS55LCB5OiBhLnggfTtcbiAgICB9LFxuXG4gICAgcHJvaihhOiBWZWMyLCBiOiBWZWMyKTogVmVjMiB7XG4gICAgICAgIHJldHVybiB2Mi5tdWwoYiwgdjIuZG90KGEsIGIpIC8gdjIuZG90KGIsIGIpKTtcbiAgICB9LFxuXG4gICAgcm90YXRlKGE6IFZlYzIsIHJhZDogbnVtYmVyKTogVmVjMiB7XG4gICAgICAgIGNvbnN0IGNvc3IgPSBNYXRoLmNvcyhyYWQpO1xuICAgICAgICBjb25zdCBzaW5yID0gTWF0aC5zaW4ocmFkKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IGEueCAqIGNvc3IgLSBhLnkgKiBzaW5yLFxuICAgICAgICAgICAgeTogYS54ICogc2luciArIGEueSAqIGNvc3IsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIG11bEVsZW1zKGE6IFZlYzIsIGI6IFZlYzIpOiBWZWMyIHtcbiAgICAgICAgcmV0dXJuIHsgeDogYS54ICogYi54LCB5OiBhLnkgKiBiLnkgfTtcbiAgICB9LFxuXG4gICAgZGl2RWxlbXMoYTogVmVjMiwgYjogVmVjMik6IFZlYzIge1xuICAgICAgICByZXR1cm4geyB4OiBhLnggLyBiLngsIHk6IGEueSAvIGIueSB9O1xuICAgIH0sXG5cbiAgICBtaW5FbGVtcyhhOiBWZWMyLCBiOiBWZWMyKTogVmVjMiB7XG4gICAgICAgIHJldHVybiB7IHg6IG1pbihhLngsIGIueCksIHk6IG1pbihhLnksIGIueSkgfTtcbiAgICB9LFxuXG4gICAgbWF4RWxlbXMoYTogVmVjMiwgYjogVmVjMik6IFZlYzIge1xuICAgICAgICByZXR1cm4geyB4OiBtYXgoYS54LCBiLngpLCB5OiBtYXgoYS55LCBiLnkpIH07XG4gICAgfSxcblxuICAgIHJhbmRvbVVuaXQoKTogVmVjMiB7XG4gICAgICAgIHJldHVybiB2Mi5ub3JtYWxpemVTYWZlKFxuICAgICAgICAgICAgdjIuY3JlYXRlKE1hdGgucmFuZG9tKCkgLSAwLjUsIE1hdGgucmFuZG9tKCkgLSAwLjUpLFxuICAgICAgICAgICAgdjIuY3JlYXRlKDEuMCwgMC4wKSxcbiAgICAgICAgKTtcbiAgICB9LFxuXG4gICAgbGVycCh0OiBudW1iZXIsIGE6IFZlYzIsIGI6IFZlYzIpOiBWZWMyIHtcbiAgICAgICAgcmV0dXJuIHYyLmFkZCh2Mi5tdWwoYSwgMS4wIC0gdCksIHYyLm11bChiLCB0KSk7XG4gICAgfSxcblxuICAgIGVxKGE6IFZlYzIsIGI6IFZlYzIsIGVwc2lsb24gPSAwLjAwMDEpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIE1hdGguYWJzKGEueCAtIGIueCkgPD0gZXBzaWxvbiAmJiBNYXRoLmFicyhhLnkgLSBiLnkpIDw9IGVwc2lsb247XG4gICAgfSxcbn07XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHJ1c3RcXFxcRGVza3RvcFxcXFxwcm9qZWN0c1xcXFxzdXJ2ZXYtcHJvZFxcXFxzaGFyZWRcXFxcdXRpbHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHJ1c3RcXFxcRGVza3RvcFxcXFxwcm9qZWN0c1xcXFxzdXJ2ZXYtcHJvZFxcXFxzaGFyZWRcXFxcdXRpbHNcXFxcbWF0aC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvcnVzdC9EZXNrdG9wL3Byb2plY3RzL3N1cnZldi1wcm9kL3NoYXJlZC91dGlscy9tYXRoLnRzXCI7aW1wb3J0IHsgZWFyY3V0IH0gZnJvbSBcIi4vZWFyY3V0XCI7XG5pbXBvcnQgeyBhc3NlcnQgfSBmcm9tIFwiLi91dGlsXCI7XG5pbXBvcnQgeyB0eXBlIFZlYzIsIHYyIH0gZnJvbSBcIi4vdjJcIjtcblxuY29uc3Qga0Vwc2lsb24gPSAwLjAwMDAwMTtcblxuZXhwb3J0IGNvbnN0IG1hdGggPSB7XG4gICAgY2xhbXAoYTogbnVtYmVyLCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIGEgPCBtYXggPyAoYSA+IG1pbiA/IGEgOiBtaW4pIDogbWF4O1xuICAgIH0sXG5cbiAgICB2MkNsYW1wKHZlY3RvcjogVmVjMiwgbWluVjI6IFZlYzIsIG1heFYyOiBWZWMyKSB7XG4gICAgICAgIGxldCBtaW5YOiBudW1iZXI7XG4gICAgICAgIGxldCBtaW5ZOiBudW1iZXI7XG4gICAgICAgIGxldCBtYXhYOiBudW1iZXI7XG4gICAgICAgIGxldCBtYXhZOiBudW1iZXI7XG5cbiAgICAgICAgaWYgKG1pblYyLnggPiBtYXhWMi54KSB7XG4gICAgICAgICAgICBtaW5YID0gbWF4VjIueDtcbiAgICAgICAgICAgIG1heFggPSBtaW5WMi54O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWluWCA9IG1pblYyLng7XG4gICAgICAgICAgICBtYXhYID0gbWF4VjIueDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtaW5WMi55ID4gbWF4VjIueSkge1xuICAgICAgICAgICAgbWluWSA9IG1heFYyLnk7XG4gICAgICAgICAgICBtYXhZID0gbWluVjIueTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1pblkgPSBtaW5WMi55O1xuICAgICAgICAgICAgbWF4WSA9IG1heFYyLnk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXNYID0gdmVjdG9yLnggPCBtYXhYID8gKHZlY3Rvci54ID4gbWluWCA/IHZlY3Rvci54IDogbWluWCkgOiBtYXhYO1xuICAgICAgICBjb25zdCByZXNZID0gdmVjdG9yLnkgPCBtYXhZID8gKHZlY3Rvci55ID4gbWluWSA/IHZlY3Rvci55IDogbWluWSkgOiBtYXhZO1xuXG4gICAgICAgIHJldHVybiB2Mi5jcmVhdGUocmVzWCwgcmVzWSk7XG4gICAgfSxcblxuICAgIG1pbihhOiBudW1iZXIsIGI6IG51bWJlcikge1xuICAgICAgICByZXR1cm4gYSA8IGIgPyBhIDogYjtcbiAgICB9LFxuXG4gICAgbWF4KGE6IG51bWJlciwgYjogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiBhID4gYiA/IGEgOiBiO1xuICAgIH0sXG5cbiAgICBsZXJwKHQ6IG51bWJlciwgYTogbnVtYmVyLCBiOiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIGEgKiAoMS4wIC0gdCkgKyBiICogdDtcbiAgICB9LFxuXG4gICAgZGVsZXJwKHQ6IG51bWJlciwgYTogbnVtYmVyLCBiOiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIG1hdGguY2xhbXAoKHQgLSBhKSAvIChiIC0gYSksIDAuMCwgMS4wKTtcbiAgICB9LFxuXG4gICAgdjJsZXJwKHQ6IG51bWJlciwgYTogVmVjMiwgYjogVmVjMikge1xuICAgICAgICByZXR1cm4gdjIuY3JlYXRlKG1hdGgubGVycCh0LCBhLngsIGIueCksIG1hdGgubGVycCh0LCBhLnksIGIueSkpO1xuICAgIH0sXG5cbiAgICBzbW9vdGhzdGVwKHY6IG51bWJlciwgYTogbnVtYmVyLCBiOiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgdCA9IG1hdGguY2xhbXAoKHYgLSBhKSAvIChiIC0gYSksIDAuMCwgMS4wKTtcbiAgICAgICAgcmV0dXJuIHQgKiB0ICogKDMuMCAtIDIuMCAqIHQpO1xuICAgIH0sXG5cbiAgICBlYXNlT3V0RWxhc3RpYyhlOiBudW1iZXIsIHQgPSAwLjMpIHtcbiAgICAgICAgcmV0dXJuIE1hdGgucG93KDIsIGUgKiAtMTApICogTWF0aC5zaW4oKChlIC0gdCAvIDQpICogKE1hdGguUEkgKiAyKSkgLyB0KSArIDE7XG4gICAgfSxcblxuICAgIGVhc2VPdXRFeHBvKGU6IG51bWJlcikge1xuICAgICAgICBpZiAoZSA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDEgLSBNYXRoLnBvdygyLCBlICogLTEwKTtcbiAgICB9LFxuICAgIGVhc2VJbkV4cG8oZTogbnVtYmVyKSB7XG4gICAgICAgIGlmIChlID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTWF0aC5wb3coMiwgKGUgLSAxKSAqIDEwKTtcbiAgICB9LFxuXG4gICAgZWFzZU91dFF1YXJ0KGU6IG51bWJlcikge1xuICAgICAgICByZXR1cm4gMSAtIE1hdGgucG93KDEgLSBlLCA0KTtcbiAgICB9LFxuXG4gICAgcmVtYXAodjogbnVtYmVyLCBhOiBudW1iZXIsIGI6IG51bWJlciwgeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgdCA9IG1hdGguY2xhbXAoKHYgLSBhKSAvIChiIC0gYSksIDAuMCwgMS4wKTtcbiAgICAgICAgcmV0dXJuIG1hdGgubGVycCh0LCB4LCB5KTtcbiAgICB9LFxuXG4gICAgZXFBYnMoYTogbnVtYmVyLCBiOiBudW1iZXIsIGVwcyA9IGtFcHNpbG9uKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmFicyhhIC0gYikgPCBlcHM7XG4gICAgfSxcblxuICAgIGVxUmVsKGE6IG51bWJlciwgYjogbnVtYmVyLCBlcHMgPSBrRXBzaWxvbikge1xuICAgICAgICByZXR1cm4gTWF0aC5hYnMoYSAtIGIpIDw9IGVwcyAqIE1hdGgubWF4KE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYSkpLCBNYXRoLmFicyhiKSk7XG4gICAgfSxcblxuICAgIGRlZzJyYWQoZGVnOiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIChkZWcgKiBNYXRoLlBJKSAvIDE4MC4wO1xuICAgIH0sXG5cbiAgICBkZWcydmVjMihkZWc6IG51bWJlcikge1xuICAgICAgICBkZWcgKj0gTWF0aC5QSSAvIDE4MDsgLy8gQ29udmVydCB0byByYWRpYW5zXG4gICAgICAgIHJldHVybiB2Mi5jcmVhdGUoTWF0aC5jb3MoZGVnKSwgTWF0aC5zaW4oZGVnKSk7XG4gICAgfSxcblxuICAgIHJhZDJkZWcocmFkOiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIChyYWQgKiAxODAuMCkgLyBNYXRoLlBJO1xuICAgIH0sXG5cbiAgICByYWQyZGVnRnJvbURpcmVjdGlvbih5OiBudW1iZXIsIHg6IG51bWJlcikge1xuICAgICAgICBjb25zdCByYWQgPSBNYXRoLmF0YW4yKHksIHgpO1xuICAgICAgICBsZXQgYW5nbGUgPSAocmFkICogMTgwKSAvIE1hdGguUEk7XG5cbiAgICAgICAgaWYgKGFuZ2xlIDwgMCkge1xuICAgICAgICAgICAgYW5nbGUgKz0gMzYwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhbmdsZTtcbiAgICB9LFxuXG4gICAgZnJhY3QobjogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiBuIC0gTWF0aC5mbG9vcihuKTtcbiAgICB9LFxuXG4gICAgc2lnbihuOiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIG4gPCAwLjAgPyAtMS4wIDogMS4wO1xuICAgIH0sXG5cbiAgICBtb2QobnVtOiBudW1iZXIsIG46IG51bWJlcikge1xuICAgICAgICByZXR1cm4gKChudW0gJSBuKSArIG4pICUgbjtcbiAgICB9LFxuXG4gICAgZm1vZChudW06IG51bWJlciwgbjogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiBudW0gLSBNYXRoLmZsb29yKG51bSAvIG4pICogbjtcbiAgICB9LFxuXG4gICAgYW5nbGVEaWZmKGE6IG51bWJlciwgYjogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IGQgPSBtYXRoLmZtb2QoYiAtIGEgKyBNYXRoLlBJLCBNYXRoLlBJICogMi4wKSAtIE1hdGguUEk7XG4gICAgICAgIHJldHVybiBkIDwgLU1hdGguUEkgPyBkICsgTWF0aC5QSSAqIDIuMCA6IGQ7XG4gICAgfSxcblxuICAgIG9yaVRvUmFkKG9yaTogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiAob3JpICUgNCkgKiAwLjUgKiBNYXRoLlBJO1xuICAgIH0sXG5cbiAgICBvcmlUb0FuZ2xlKG9yaTogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiBvcmkgKiAoMTgwIC8gTWF0aC5QSSk7XG4gICAgfSxcblxuICAgIHJhZFRvT3JpKHJhZDogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKFxuICAgICAgICAgICAgbWF0aC5mbW9kKHJhZCArIE1hdGguUEkgKiAwLjI1LCBNYXRoLlBJICogMi4wKSAvIChNYXRoLlBJICogMC41KSxcbiAgICAgICAgKTtcbiAgICB9LFxuXG4gICAgcXVhbnRpemUoZjogbnVtYmVyLCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIsIGJpdHM6IG51bWJlcikge1xuICAgICAgICBhc3NlcnQoZiA+PSBtaW4gJiYgZiA8PSBtYXgpO1xuICAgICAgICBjb25zdCByYW5nZSA9ICgxIDw8IGJpdHMpIC0gMTtcbiAgICAgICAgY29uc3QgeCA9IG1hdGguY2xhbXAoZiwgbWluLCBtYXgpO1xuICAgICAgICBjb25zdCB0ID0gKHggLSBtaW4pIC8gKG1heCAtIG1pbik7XG4gICAgICAgIGNvbnN0IGEgPSB0ICogcmFuZ2UgKyAwLjU7XG4gICAgICAgIGNvbnN0IGIgPSBhIDwgMC4wID8gTWF0aC5jZWlsKGEpIDogTWF0aC5mbG9vcihhKTtcbiAgICAgICAgcmV0dXJuIG1pbiArIChiIC8gcmFuZ2UpICogKG1heCAtIG1pbik7XG4gICAgfSxcblxuICAgIHYyUXVhbnRpemUoXG4gICAgICAgIHY6IFZlYzIsXG4gICAgICAgIG1pblg6IG51bWJlcixcbiAgICAgICAgbWluWTogbnVtYmVyLFxuICAgICAgICBtYXhYOiBudW1iZXIsXG4gICAgICAgIG1heFk6IG51bWJlcixcbiAgICAgICAgYml0czogbnVtYmVyLFxuICAgICkge1xuICAgICAgICByZXR1cm4gdjIuY3JlYXRlKFxuICAgICAgICAgICAgbWF0aC5xdWFudGl6ZSh2LngsIG1pblgsIG1heFgsIGJpdHMpLFxuICAgICAgICAgICAgbWF0aC5xdWFudGl6ZSh2LnksIG1pblksIG1heFksIGJpdHMpLFxuICAgICAgICApO1xuICAgIH0sXG5cbiAgICAvLyBSYXktTGluZSBhbmQgUmF5LVBvbHlnb24gaW1wbGVtZW50YXRpb25zIGZyb21cbiAgICAvLyBodHRwOi8vYWhhbW5ldHQuYmxvZ3Nwb3QuY29tLzIwMTIvMDYvcmF5cG9seWdvbi1pbnRlcnNlY3Rpb25zLmh0bWxcbiAgICByYXlMaW5lSW50ZXJzZWN0KG9yaWdpbjogVmVjMiwgZGlyZWN0aW9uOiBWZWMyLCBsaW5lQTogVmVjMiwgbGluZUI6IFZlYzIpIHtcbiAgICAgICAgY29uc3Qgc2VnbWVudCA9IHYyLnN1YihsaW5lQiwgbGluZUEpO1xuICAgICAgICBjb25zdCBzZWdtZW50UGVycCA9IHYyLmNyZWF0ZShzZWdtZW50LnksIC1zZWdtZW50LngpO1xuICAgICAgICBjb25zdCBwZXJwRG90RGlyID0gdjIuZG90KGRpcmVjdGlvbiwgc2VnbWVudFBlcnApO1xuXG4gICAgICAgIC8vIFBhcmFsbGVsIGxpbmVzLCBubyBpbnRlcnNlY3Rpb25cbiAgICAgICAgaWYgKE1hdGguYWJzKHBlcnBEb3REaXIpIDw9IGtFcHNpbG9uKSByZXR1cm4gdW5kZWZpbmVkO1xuXG4gICAgICAgIGNvbnN0IGQgPSB2Mi5zdWIobGluZUEsIG9yaWdpbik7XG5cbiAgICAgICAgLy8gRGlzdGFuY2Ugb2YgaW50ZXJzZWN0aW9uIGFsb25nIHJheVxuICAgICAgICBjb25zdCB0ID0gdjIuZG90KHNlZ21lbnRQZXJwLCBkKSAvIHBlcnBEb3REaXI7XG5cbiAgICAgICAgLy8gRGlzdGFuY2Ugb2YgaW50ZXJzZWN0aW9uIGFsb25nIGxpbmVcbiAgICAgICAgY29uc3QgcyA9IHYyLmRvdCh2Mi5jcmVhdGUoZGlyZWN0aW9uLnksIC1kaXJlY3Rpb24ueCksIGQpIC8gcGVycERvdERpcjtcblxuICAgICAgICAvLyBJZiB0IGlzIHBvc2l0aXZlIGFuZCBzIGxpZXMgd2l0aGluIHRoZSBsaW5lIGl0IGludGVyc2VjdHM7IHJldHVybnMgdFxuICAgICAgICByZXR1cm4gdCA+PSAwLjAgJiYgcyA+PSAwLjAgJiYgcyA8PSAxLjAgPyB0IDogdW5kZWZpbmVkO1xuICAgIH0sXG5cbiAgICByYXlQb2x5Z29uSW50ZXJzZWN0KG9yaWdpbjogVmVjMiwgZGlyZWN0aW9uOiBWZWMyLCB2ZXJ0aWNlczogVmVjMltdKSB7XG4gICAgICAgIGxldCB0ID0gTnVtYmVyLk1BWF9WQUxVRTtcblxuICAgICAgICBsZXQgaW50ZXJzZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGogPSB2ZXJ0aWNlcy5sZW5ndGggLSAxOyBpIDwgdmVydGljZXMubGVuZ3RoOyBqID0gaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBkaXN0YW5jZSA9IHRoaXMucmF5TGluZUludGVyc2VjdChcbiAgICAgICAgICAgICAgICBvcmlnaW4sXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uLFxuICAgICAgICAgICAgICAgIHZlcnRpY2VzW2pdLFxuICAgICAgICAgICAgICAgIHZlcnRpY2VzW2ldLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRpc3RhbmNlIDwgdCkge1xuICAgICAgICAgICAgICAgICAgICBpbnRlcnNlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHQgPSBkaXN0YW5jZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXR1cm5zIGNsb3Nlc3QgaW50ZXJzZWN0aW9uXG4gICAgICAgIHJldHVybiBpbnRlcnNlY3RlZCA/IHQgOiB1bmRlZmluZWQ7XG4gICAgfSxcblxuICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzIyNTIxOTgyL2pzLWNoZWNrLWlmLXBvaW50LWluc2lkZS1hLXBvbHlnb25cbiAgICBwb2ludEluc2lkZVBvbHlnb24ocG9pbnQ6IFZlYzIsIHBvbHk6IFZlYzJbXSkge1xuICAgICAgICAvLyByYXktY2FzdGluZyBhbGdvcml0aG0gYmFzZWQgb25cbiAgICAgICAgLy8gaHR0cDovL3d3dy5lY3NlLnJwaS5lZHUvSG9tZXBhZ2VzL3dyZi9SZXNlYXJjaC9TaG9ydF9Ob3Rlcy9wbnBvbHkuaHRtbFxuICAgICAgICBjb25zdCB7IHggfSA9IHBvaW50O1xuICAgICAgICBjb25zdCB7IHkgfSA9IHBvaW50O1xuICAgICAgICBsZXQgaW5zaWRlID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IGNvdW50ID0gcG9seS5sZW5ndGg7XG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBqID0gY291bnQgLSAxOyBpIDwgY291bnQ7IGogPSBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHhpID0gcG9seVtpXS54O1xuICAgICAgICAgICAgY29uc3QgeWkgPSBwb2x5W2ldLnk7XG4gICAgICAgICAgICBjb25zdCB4aiA9IHBvbHlbal0ueDtcbiAgICAgICAgICAgIGNvbnN0IHlqID0gcG9seVtqXS55O1xuXG4gICAgICAgICAgICBjb25zdCBpbnRlcnNlY3QgPVxuICAgICAgICAgICAgICAgIHlpID4geSAhPT0geWogPiB5ICYmIHggPCAoKHhqIC0geGkpICogKHkgLSB5aSkpIC8gKHlqIC0geWkpICsgeGk7XG4gICAgICAgICAgICBpZiAoaW50ZXJzZWN0KSB7XG4gICAgICAgICAgICAgICAgaW5zaWRlID0gIWluc2lkZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5zaWRlO1xuICAgIH0sXG5cbiAgICBkaXN0VG9TZWdtZW50U3EocDogVmVjMiwgYTogVmVjMiwgYjogVmVjMikge1xuICAgICAgICBjb25zdCBhYiA9IHYyLnN1YihiLCBhKTtcbiAgICAgICAgY29uc3QgYyA9IHYyLmRvdCh2Mi5zdWIocCwgYSksIGFiKSAvIHYyLmRvdChhYiwgYWIpO1xuICAgICAgICBjb25zdCBkID0gdjIuYWRkKGEsIHYyLm11bChhYiwgbWF0aC5jbGFtcChjLCAwLjAsIDEuMCkpKTtcbiAgICAgICAgY29uc3QgZSA9IHYyLnN1YihkLCBwKTtcbiAgICAgICAgcmV0dXJuIHYyLmRvdChlLCBlKTtcbiAgICB9LFxuXG4gICAgZGlzdFRvUG9seWdvbihwOiBWZWMyLCBwb2x5OiBWZWMyW10pIHtcbiAgICAgICAgbGV0IGNsb3Nlc3REaXN0U3EgPSBOdW1iZXIuTUFYX1ZBTFVFO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBvbHkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGEgPSBwb2x5W2ldO1xuICAgICAgICAgICAgY29uc3QgYiA9IGkgPT09IHBvbHkubGVuZ3RoIC0gMSA/IHBvbHlbMF0gOiBwb2x5W2kgKyAxXTtcbiAgICAgICAgICAgIGNvbnN0IGRpc3RTcSA9IG1hdGguZGlzdFRvU2VnbWVudFNxKHAsIGEsIGIpO1xuICAgICAgICAgICAgaWYgKGRpc3RTcSA8IGNsb3Nlc3REaXN0U3EpIHtcbiAgICAgICAgICAgICAgICBjbG9zZXN0RGlzdFNxID0gZGlzdFNxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQoY2xvc2VzdERpc3RTcSk7XG4gICAgfSxcblxuICAgIHBvbHlnb25BcmVhKHBvbHk6IFZlYzJbXSkge1xuICAgICAgICAvLyBDb252ZXJ0IHBvbHlnb24gdG8gdHJpYW5nbGVzXG4gICAgICAgIGNvbnN0IHZlcnRzOiBudW1iZXJbXSA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBvbHkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZlcnRzLnB1c2gocG9seVtpXS54KTtcbiAgICAgICAgICAgIHZlcnRzLnB1c2gocG9seVtpXS55KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpZHhzID0gZWFyY3V0KHZlcnRzKTtcblxuICAgICAgICAvLyBDb21wdXRlIGFyZWEgb2YgdHJpYW5nbGVzXG4gICAgICAgIGxldCBhcmVhID0gMC4wO1xuICAgICAgICBmb3IgKGxldCBfaSA9IDA7IF9pIDwgaWR4cy5sZW5ndGg7IF9pICs9IDMpIHtcbiAgICAgICAgICAgIGNvbnN0IGlkeDAgPSBpZHhzW19pICsgMF07XG4gICAgICAgICAgICBjb25zdCBpZHgxID0gaWR4c1tfaSArIDFdO1xuICAgICAgICAgICAgY29uc3QgaWR4MiA9IGlkeHNbX2kgKyAyXTtcbiAgICAgICAgICAgIGNvbnN0IGF4ID0gdmVydHNbaWR4MCAqIDIgKyAwXTtcbiAgICAgICAgICAgIGNvbnN0IGF5ID0gdmVydHNbaWR4MCAqIDIgKyAxXTtcbiAgICAgICAgICAgIGNvbnN0IGJ4ID0gdmVydHNbaWR4MSAqIDIgKyAwXTtcbiAgICAgICAgICAgIGNvbnN0IGJ5ID0gdmVydHNbaWR4MSAqIDIgKyAxXTtcbiAgICAgICAgICAgIGNvbnN0IGN4ID0gdmVydHNbaWR4MiAqIDIgKyAwXTtcbiAgICAgICAgICAgIGNvbnN0IGN5ID0gdmVydHNbaWR4MiAqIDIgKyAxXTtcbiAgICAgICAgICAgIGFyZWEgKz0gTWF0aC5hYnMoXG4gICAgICAgICAgICAgICAgKGF4ICogYnkgKyBieCAqIGN5ICsgY3ggKiBheSAtIGJ4ICogYXkgLSBjeCAqIGJ5IC0gYXggKiBjeSkgKiAwLjUsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhcmVhO1xuICAgIH0sXG5cbiAgICAvLyBodHRwOi8vcGF1bGJvdXJrZS5uZXQvZ2VvbWV0cnkvcG9pbnRsaW5lcGxhbmUvamF2YXNjcmlwdC50eHRcbiAgICBsaW5lSW50ZXJzZWN0cyhcbiAgICAgICAgeDE6IG51bWJlcixcbiAgICAgICAgeTE6IG51bWJlcixcbiAgICAgICAgeDI6IG51bWJlcixcbiAgICAgICAgeTI6IG51bWJlcixcbiAgICAgICAgeDM6IG51bWJlcixcbiAgICAgICAgeTM6IG51bWJlcixcbiAgICAgICAgeDQ6IG51bWJlcixcbiAgICAgICAgeTQ6IG51bWJlcixcbiAgICApIHtcbiAgICAgICAgLy8gQ2hlY2sgaWYgbm9uZSBvZiB0aGUgbGluZXMgYXJlIG9mIGxlbmd0aCAwXG4gICAgICAgIGlmICgoeDEgPT09IHgyICYmIHkxID09PSB5MikgfHwgKHgzID09PSB4NCAmJiB5MyA9PT0geTQpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkZW5vbWluYXRvciA9ICh5NCAtIHkzKSAqICh4MiAtIHgxKSAtICh4NCAtIHgzKSAqICh5MiAtIHkxKTtcblxuICAgICAgICAvLyBMaW5lcyBhcmUgcGFyYWxsZWxcbiAgICAgICAgaWYgKGRlbm9taW5hdG9yID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB1YSA9ICgoeDQgLSB4MykgKiAoeTEgLSB5MykgLSAoeTQgLSB5MykgKiAoeDEgLSB4MykpIC8gZGVub21pbmF0b3I7XG4gICAgICAgIGNvbnN0IHViID0gKCh4MiAtIHgxKSAqICh5MSAtIHkzKSAtICh5MiAtIHkxKSAqICh4MSAtIHgzKSkgLyBkZW5vbWluYXRvcjtcblxuICAgICAgICAvLyBpcyB0aGUgaW50ZXJzZWN0aW9uIGFsb25nIHRoZSBzZWdtZW50c1xuICAgICAgICBpZiAodWEgPCAwIHx8IHVhID4gMSB8fCB1YiA8IDAgfHwgdWIgPiAxKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXR1cm4gYSBvYmplY3Qgd2l0aCB0aGUgeCBhbmQgeSBjb29yZGluYXRlcyBvZiB0aGUgaW50ZXJzZWN0aW9uXG4gICAgICAgIGNvbnN0IHggPSB4MSArIHVhICogKHgyIC0geDEpO1xuICAgICAgICBjb25zdCB5ID0geTEgKyB1YSAqICh5MiAtIHkxKTtcblxuICAgICAgICByZXR1cm4geyB4LCB5IH07XG4gICAgfSxcblxuICAgIC8vIGZ1bmN0aW9ucyBub3QgY29waWVkIGZyb20gc3Vydml2XG4gICAgYWRkQWRqdXN0KHBvczE6IFZlYzIsIHBvczogVmVjMiwgb3JpOiBudW1iZXIpOiBWZWMyIHtcbiAgICAgICAgaWYgKG9yaSA9PT0gMCkgcmV0dXJuIHYyLmFkZChwb3MxLCBwb3MpO1xuICAgICAgICBsZXQgeE9mZnNldDogbnVtYmVyLCB5T2Zmc2V0OiBudW1iZXI7XG4gICAgICAgIHN3aXRjaCAob3JpKSB7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgeE9mZnNldCA9IC1wb3MueTtcbiAgICAgICAgICAgICAgICB5T2Zmc2V0ID0gcG9zLng7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgeE9mZnNldCA9IC1wb3MueDtcbiAgICAgICAgICAgICAgICB5T2Zmc2V0ID0gLXBvcy55O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIHhPZmZzZXQgPSBwb3MueTtcbiAgICAgICAgICAgICAgICB5T2Zmc2V0ID0gLXBvcy54O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2Mi5hZGQocG9zMSwgdjIuY3JlYXRlKHhPZmZzZXQhLCB5T2Zmc2V0ISkpO1xuICAgIH0sXG59O1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxydXN0XFxcXERlc2t0b3BcXFxccHJvamVjdHNcXFxcc3VydmV2LXByb2RcXFxcc2hhcmVkXFxcXHV0aWxzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxydXN0XFxcXERlc2t0b3BcXFxccHJvamVjdHNcXFxcc3VydmV2LXByb2RcXFxcc2hhcmVkXFxcXHV0aWxzXFxcXHV0aWwudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3J1c3QvRGVza3RvcC9wcm9qZWN0cy9zdXJ2ZXYtcHJvZC9zaGFyZWQvdXRpbHMvdXRpbC50c1wiO2ltcG9ydCB7IG1hdGggfSBmcm9tIFwiLi9tYXRoXCI7XG5pbXBvcnQgeyB0eXBlIFZlYzIsIHYyIH0gZnJvbSBcIi4vdjJcIjtcblxuLyoqXG4gKiBDdXN0b20gZnVuY3Rpb24gdG8gbm90IGJ1bmRsZSBub2RlanMgYXNzZXJ0IHBvbHlmaWxsIHdpdGggdGhlIGNsaWVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0KHZhbHVlOiB1bmtub3duLCBtZXNzYWdlPzogc3RyaW5nIHwgRXJyb3IpOiBhc3NlcnRzIHZhbHVlIHtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgIGNvbnN0IGVycm9yID1cbiAgICAgICAgICAgIG1lc3NhZ2UgaW5zdGFuY2VvZiBFcnJvclxuICAgICAgICAgICAgICAgID8gbWVzc2FnZVxuICAgICAgICAgICAgICAgIDogbmV3IEVycm9yKG1lc3NhZ2UgPz8gXCJBc3NlcnRhdGlvbiBmYWlsZWRcIik7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmluZVNraW48RGVmPihcbiAgICBiYXNlRGVmczogUmVjb3JkPHN0cmluZywgRGVmPixcbiAgICBiYXNlVHlwZTogc3RyaW5nLFxuICAgIHBhcmFtczogUGFydGlhbDxEZWY+LFxuKSB7XG4gICAgcmV0dXJuIHV0aWwubWVyZ2VEZWVwKHt9LCBiYXNlRGVmc1tiYXNlVHlwZV0sIHsgYmFzZVR5cGUgfSwgcGFyYW1zKSBhcyBEZWY7XG59XG5cbmV4cG9ydCBjb25zdCB1dGlsID0ge1xuICAgIC8vXG4gICAgLy8gR2FtZSBvYmplY3RzIGNhbiBiZWxvbmcgdG8gdGhlIGZvbGxvd2luZyBsYXllcnM6XG4gICAgLy8gICAwOiBncm91bmQgbGF5ZXJcbiAgICAvLyAgIDE6IGJ1bmtlciBsYXllclxuICAgIC8vICAgMjogZ3JvdW5kIGFuZCBzdGFpcnMgKGJvdGgpXG4gICAgLy8gICAzOiBidW5rZXIgYW5kIHN0YWlycyAoYm90aClcbiAgICAvL1xuICAgIC8vIE9iamVjdHMgb24gdGhlIHNhbWUgbGF5ZXIgc2hvdWxkIGludGVyYWN0IHdpdGggb25lIGFub3RoZXIuXG4gICAgc2FtZUxheWVyKGE6IG51bWJlciwgYjogbnVtYmVyKSB7XG4gICAgICAgIC8vIFdoaWNoIGlzIGZhc3Rlcj9cbiAgICAgICAgLy8gcmV0dXJuIChhID09IGIgJiYgYSA8IDIpIHx8IChhID49IDIgJiYgYiA+PSAyKTtcbiAgICAgICAgcmV0dXJuIChhICYgMHgxKSA9PT0gKGIgJiAweDEpIHx8IChhICYgMHgyICYmIGIgJiAweDIpO1xuICAgIH0sXG5cbiAgICBzYW1lQXVkaW9MYXllcihhOiBudW1iZXIsIGI6IG51bWJlcikge1xuICAgICAgICByZXR1cm4gYSA9PT0gYiB8fCBhICYgMHgyIHx8IGIgJiAweDI7XG4gICAgfSxcblxuICAgIHRvR3JvdW5kTGF5ZXIoYTogbnVtYmVyKSB7XG4gICAgICAgIC8vIHJldHVybiBhIDwgMiA/IGEgOiAoYSA9PSAyID8gMCA6IDEpO1xuICAgICAgICByZXR1cm4gYSAmIDB4MTtcbiAgICB9LFxuXG4gICAgdG9TdGFpcnNMYXllcihhOiBudW1iZXIpIHtcbiAgICAgICAgLy8gcmV0dXJuIGEgPj0gMiA/IGEgOiAoYSA9PSAwID8gMiA6IDMpO1xuICAgICAgICAvLyAgcmV0dXJuIGEgfCAweDI7XG4gICAgICAgIHJldHVybiBhICYgMHgxO1xuICAgIH0sXG5cbiAgICByYW5kb20obWluOiBudW1iZXIsIG1heDogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiBtYXRoLmxlcnAoTWF0aC5yYW5kb20oKSwgbWluLCBtYXgpO1xuICAgIH0sXG5cbiAgICByYW5kb21JbnQobWluOiBudW1iZXIsIG1heDogbnVtYmVyKSB7XG4gICAgICAgIG1pbiA9IE1hdGguY2VpbChtaW4pO1xuICAgICAgICBtYXggPSBNYXRoLmZsb29yKG1heCk7XG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xuICAgIH0sXG5cbiAgICAvLyBVbmlmb3JtbHkgZGlzdHJpYnV0ZWQgcmFuZG9tIHBvaW50IHdpdGhpbiBjaXJjbGVcbiAgICAvLyBUYWtlbiBmcm9tIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzU4Mzc1NzIvZ2VuZXJhdGUtYS1yYW5kb20tcG9pbnQtd2l0aGluLWEtY2lyY2xlLXVuaWZvcm1seVxuICAgIHJhbmRvbVBvaW50SW5DaXJjbGUocmFkOiBudW1iZXIpIHtcbiAgICAgICAgbGV0IGEgPSBNYXRoLnJhbmRvbSgpO1xuICAgICAgICBsZXQgYiA9IE1hdGgucmFuZG9tKCk7XG4gICAgICAgIGlmIChiIDwgYSkge1xuICAgICAgICAgICAgY29uc3QgYyA9IGE7XG4gICAgICAgICAgICBhID0gYjtcbiAgICAgICAgICAgIGIgPSBjO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBvcyA9IHYyLmNyZWF0ZShcbiAgICAgICAgICAgIGIgKiByYWQgKiBNYXRoLmNvcygoMi4wICogTWF0aC5QSSAqIGEpIC8gYiksXG4gICAgICAgICAgICBiICogcmFkICogTWF0aC5zaW4oKDIuMCAqIE1hdGguUEkgKiBhKSAvIGIpLFxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcG9zO1xuICAgIH0sXG5cbiAgICByYW5kb21Qb2ludEluQWFiYihhYWJiOiB7IG1pbjogVmVjMjsgbWF4OiBWZWMyIH0pIHtcbiAgICAgICAgcmV0dXJuIHYyLmNyZWF0ZShcbiAgICAgICAgICAgIHV0aWwucmFuZG9tKGFhYmIubWluLngsIGFhYmIubWF4LngpLFxuICAgICAgICAgICAgdXRpbC5yYW5kb20oYWFiYi5taW4ueSwgYWFiYi5tYXgueSksXG4gICAgICAgICk7XG4gICAgfSxcblxuICAgIHNlZWRlZFJhbmQoc2VlZDogbnVtYmVyKSB7XG4gICAgICAgIC8vIFBhcmstTWlsbGVyIFBSTkdcbiAgICAgICAgbGV0IHJuZyA9IHNlZWQ7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAobWluID0gMCwgbWF4ID0gMSkge1xuICAgICAgICAgICAgcm5nID0gKHJuZyAqIDE2ODA3KSAlIDIxNDc0ODM2NDc7XG4gICAgICAgICAgICBjb25zdCB0ID0gcm5nIC8gMjE0NzQ4MzY0NztcbiAgICAgICAgICAgIHJldHVybiBtYXRoLmxlcnAodCwgbWluLCBtYXgpO1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvLyBUYWtlbiBmcm9tOiBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9tamFja3Nvbi81MzExMjU2XG4gICAgcmdiVG9Ic3YocjogbnVtYmVyLCBnOiBudW1iZXIsIGI6IG51bWJlcikge1xuICAgICAgICByIC89IDI1NTtcbiAgICAgICAgZyAvPSAyNTU7XG4gICAgICAgIGIgLz0gMjU1O1xuXG4gICAgICAgIGNvbnN0IG1heCA9IE1hdGgubWF4KHIsIGcsIGIpO1xuICAgICAgICBjb25zdCBtaW4gPSBNYXRoLm1pbihyLCBnLCBiKTtcbiAgICAgICAgbGV0IGg6IG51bWJlciA9IDA7XG4gICAgICAgIGxldCBzOiBudW1iZXIgPSAwO1xuICAgICAgICBjb25zdCB2ID0gbWF4O1xuXG4gICAgICAgIGNvbnN0IGQgPSBtYXggLSBtaW47XG4gICAgICAgIHMgPSBtYXggPT0gMCA/IDAgOiBkIC8gbWF4O1xuXG4gICAgICAgIGlmIChtYXggPT0gbWluKSB7XG4gICAgICAgICAgICBoID0gMDsgLy8gYWNocm9tYXRpY1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3dpdGNoIChtYXgpIHtcbiAgICAgICAgICAgICAgICBjYXNlIHI6XG4gICAgICAgICAgICAgICAgICAgIGggPSAoZyAtIGIpIC8gZCArIChnIDwgYiA/IDYgOiAwKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBnOlxuICAgICAgICAgICAgICAgICAgICBoID0gKGIgLSByKSAvIGQgKyAyO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIGI6XG4gICAgICAgICAgICAgICAgICAgIGggPSAociAtIGcpIC8gZCArIDQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBoIC89IDY7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyBoLCBzLCB2IH07XG4gICAgfSxcblxuICAgIC8vIFRha2VuIGZyb206IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE3MjQyMTQ0L2phdmFzY3JpcHQtY29udmVydC1oc2ItaHN2LWNvbG9yLXRvLXJnYi1hY2N1cmF0ZWx5XG4gICAgaHN2VG9SZ2IoaDogbnVtYmVyLCBzOiBudW1iZXIsIHY6IG51bWJlcikge1xuICAgICAgICBsZXQgciA9IDA7XG4gICAgICAgIGxldCBnID0gMDtcbiAgICAgICAgbGV0IGIgPSAwO1xuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGxldCBmID0gMDtcbiAgICAgICAgbGV0IHAgPSAwO1xuICAgICAgICBsZXQgcSA9IDA7XG4gICAgICAgIGxldCB0ID0gMDtcblxuICAgICAgICBpID0gTWF0aC5mbG9vcihoICogNi4wKTtcbiAgICAgICAgZiA9IGggKiA2LjAgLSBpO1xuICAgICAgICBwID0gdiAqICgxLjAgLSBzKTtcbiAgICAgICAgcSA9IHYgKiAoMS4wIC0gZiAqIHMpO1xuICAgICAgICB0ID0gdiAqICgxLjAgLSAoMS4wIC0gZikgKiBzKTtcbiAgICAgICAgc3dpdGNoIChpICUgNikge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIHIgPSB2O1xuICAgICAgICAgICAgICAgIGcgPSB0O1xuICAgICAgICAgICAgICAgIGIgPSBwO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIHIgPSBxO1xuICAgICAgICAgICAgICAgIGcgPSB2O1xuICAgICAgICAgICAgICAgIGIgPSBwO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHIgPSBwO1xuICAgICAgICAgICAgICAgIGcgPSB2O1xuICAgICAgICAgICAgICAgIGIgPSB0O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIHIgPSBwO1xuICAgICAgICAgICAgICAgIGcgPSBxO1xuICAgICAgICAgICAgICAgIGIgPSB2O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgIHIgPSB0O1xuICAgICAgICAgICAgICAgIGcgPSBwO1xuICAgICAgICAgICAgICAgIGIgPSB2O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgICAgIHIgPSB2O1xuICAgICAgICAgICAgICAgIGcgPSBwO1xuICAgICAgICAgICAgICAgIGIgPSBxO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByOiBNYXRoLnJvdW5kKHIgKiAyNTUuMCksXG4gICAgICAgICAgICBnOiBNYXRoLnJvdW5kKGcgKiAyNTUuMCksXG4gICAgICAgICAgICBiOiBNYXRoLnJvdW5kKGIgKiAyNTUuMCksXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGFkanVzdFZhbHVlKHRpbnQ6IG51bWJlciwgdmFsdWU6IG51bWJlcikge1xuICAgICAgICBsZXQgciA9ICh0aW50ID4+IDE2KSAmIDB4ZmY7XG4gICAgICAgIGxldCBnID0gKHRpbnQgPj4gOCkgJiAweGZmO1xuICAgICAgICBsZXQgYiA9IHRpbnQgJiAweGZmO1xuICAgICAgICByID0gTWF0aC5yb3VuZChyICogdmFsdWUpO1xuICAgICAgICBnID0gTWF0aC5yb3VuZChnICogdmFsdWUpO1xuICAgICAgICBiID0gTWF0aC5yb3VuZChiICogdmFsdWUpO1xuICAgICAgICByZXR1cm4gKHIgPDwgMTYpICsgKGcgPDwgOCkgKyBiO1xuICAgIH0sXG5cbiAgICBsZXJwQ29sb3IodDogbnVtYmVyLCBzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcikge1xuICAgICAgICBjb25zdCB0b0xpbmVhciA9IGZ1bmN0aW9uIHRvTGluZWFyKGM6IHsgcjogbnVtYmVyOyBnOiBudW1iZXI7IGI6IG51bWJlciB9KSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHI6IGMuciAqKiAyLjIsXG4gICAgICAgICAgICAgICAgZzogYy5nICoqIDIuMixcbiAgICAgICAgICAgICAgICBiOiBjLmIgKiogMi4yLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgdG9TUkdCID0gZnVuY3Rpb24gdG9TUkdCKGM6IHsgcjogbnVtYmVyOyBnOiBudW1iZXI7IGI6IG51bWJlciB9KSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHI6IGMuciAqKiAoMS4wIC8gMi4yKSxcbiAgICAgICAgICAgICAgICBnOiBjLmcgKiogKDEuMCAvIDIuMiksXG4gICAgICAgICAgICAgICAgYjogYy5iICoqICgxLjAgLyAyLjIpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBzID0gdG9MaW5lYXIodXRpbC5pbnRUb1JnYihzdGFydCkpO1xuICAgICAgICBjb25zdCBlID0gdG9MaW5lYXIodXRpbC5pbnRUb1JnYihlbmQpKTtcblxuICAgICAgICByZXR1cm4gdXRpbC5yZ2JUb0ludChcbiAgICAgICAgICAgIHRvU1JHQih7XG4gICAgICAgICAgICAgICAgcjogbWF0aC5sZXJwKHQsIHMuciwgZS5yKSxcbiAgICAgICAgICAgICAgICBnOiBtYXRoLmxlcnAodCwgcy5nLCBlLmcpLFxuICAgICAgICAgICAgICAgIGI6IG1hdGgubGVycCh0LCBzLmIsIGUuYiksXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgKTtcbiAgICB9LFxuXG4gICAgcmdiVG9JbnQoYzogeyByOiBudW1iZXI7IGc6IG51bWJlcjsgYjogbnVtYmVyIH0pIHtcbiAgICAgICAgcmV0dXJuIChjLnIgPDwgMTYpICsgKGMuZyA8PCA4KSArIGMuYjtcbiAgICB9LFxuXG4gICAgaW50VG9SZ2IoYzogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByOiAoYyA+PiAxNikgJiAweGZmLFxuICAgICAgICAgICAgZzogKGMgPj4gOCkgJiAweGZmLFxuICAgICAgICAgICAgYjogYyAmIDB4ZmYsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzU2MjM4MzgvcmdiLXRvLWhleC1hbmQtaGV4LXRvLXJnYlxuICAgIHJnYlRvSGV4KGM6IHsgcjogbnVtYmVyOyBnOiBudW1iZXI7IGI6IG51bWJlciB9KSB7XG4gICAgICAgIGNvbnN0IHJnYiA9IHV0aWwucmdiVG9JbnQoYyk7XG4gICAgICAgIHJldHVybiBgIyR7KDB4MTAwMDAwMCArIHJnYikudG9TdHJpbmcoMTYpLnNsaWNlKC02KX1gO1xuICAgIH0sXG5cbiAgICAvLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMzM0ODEyOS91c2luZy1uYXRpdmUtamF2YXNjcmlwdC10by1kZXNhdHVyYXRlLWEtY29sb3VyXG4gICAgaGV4VG9SZ2IoaGV4OiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gL14jPyhbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KSQvaS5leGVjKGhleCk7XG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgICAgcjogcGFyc2VJbnQocmVzdWx0WzFdLCAxNiksXG4gICAgICAgICAgICAgICAgICBnOiBwYXJzZUludChyZXN1bHRbMl0sIDE2KSxcbiAgICAgICAgICAgICAgICAgIGI6IHBhcnNlSW50KHJlc3VsdFszXSwgMTYpLFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICA6IG51bGw7XG4gICAgfSxcblxuICAgIGludFRvSGV4KGludDogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiBgIyR7KDB4MTAwMDAwMCArIGludCkudG9TdHJpbmcoMTYpLnNsaWNlKC02KX1gO1xuICAgIH0sXG5cbiAgICBoZXhUb0ludChoZXg6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gcGFyc2VJbnQoaGV4LnNsaWNlKC02KSwgMTYpO1xuICAgIH0sXG5cbiAgICB1cGRhdGVDb2xvcihzYXQ6IG51bWJlciwgaGV4OiBzdHJpbmcpIHtcbiAgICAgICAgc2F0IC89IDEwMC4wO1xuICAgICAgICBjb25zdCBjb2wgPSB1dGlsLmhleFRvUmdiKGhleCkhO1xuICAgICAgICBjb25zdCBibGFjayA9IDAuMDtcblxuICAgICAgICBjb2wuciA9IE1hdGgucm91bmQoY29sLnIgKiBzYXQgKyBibGFjayAqICgxIC0gc2F0KSk7XG4gICAgICAgIGNvbC5nID0gTWF0aC5yb3VuZChjb2wuZyAqIHNhdCArIGJsYWNrICogKDEgLSBzYXQpKTtcbiAgICAgICAgY29sLmIgPSBNYXRoLnJvdW5kKGNvbC5iICogc2F0ICsgYmxhY2sgKiAoMSAtIHNhdCkpO1xuXG4gICAgICAgIGNvbnN0IG91dCA9IHV0aWwucmdiVG9JbnQoY29sKTtcblxuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH0sXG5cbiAgICAvLyBUYWtlbiBmcm9tIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzI3OTM2NzcyL2hvdy10by1kZWVwLW1lcmdlLWluc3RlYWQtb2Ytc2hhbGxvdy1tZXJnZVxuICAgIGlzT2JqZWN0KGl0ZW06IHVua25vd24pIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIGl0ZW0gJiZcbiAgICAgICAgICAgICh0eXBlb2YgaXRlbSA9PT0gXCJ1bmRlZmluZWRcIiA/IFwidW5kZWZpbmVkXCIgOiB0eXBlb2YgaXRlbSkgPT09IFwib2JqZWN0XCIgJiZcbiAgICAgICAgICAgICFBcnJheS5pc0FycmF5KGl0ZW0pXG4gICAgICAgICk7XG4gICAgfSxcblxuICAgIG1lcmdlRGVlcCh0YXJnZXQ6IGFueSwgLi4uc291cmNlczogYW55W10pOiBhbnkge1xuICAgICAgICBpZiAoIXNvdXJjZXMubGVuZ3RoKSByZXR1cm4gdGFyZ2V0O1xuICAgICAgICBjb25zdCBzb3VyY2UgPSBzb3VyY2VzLnNoaWZ0KCk7XG5cbiAgICAgICAgaWYgKHRoaXMuaXNPYmplY3QodGFyZ2V0KSAmJiB0aGlzLmlzT2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIHNvdXJjZSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzT2JqZWN0KHNvdXJjZVtrZXldKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXRhcmdldFtrZXldKSBPYmplY3QuYXNzaWduKHRhcmdldCwgeyBba2V5XToge30gfSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVyZ2VEZWVwKHRhcmdldFtrZXldLCBzb3VyY2Vba2V5XSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0YXJnZXQsIHsgW2tleV06IHNvdXJjZVtrZXldIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLm1lcmdlRGVlcCh0YXJnZXQsIC4uLnNvdXJjZXMpO1xuICAgIH0sXG5cbiAgICBjbG9uZURlZXAoc291cmNlOiB1bmtub3duKSB7XG4gICAgICAgIC8vIEBUT0RPOiBUaGlzIGRvZXMgbm90IHByb3Blcmx5IGhhbmRsZSBhcnJheXNcbiAgICAgICAgcmV0dXJuIHV0aWwubWVyZ2VEZWVwKHt9LCBzb3VyY2UpO1xuICAgIH0sXG5cbiAgICBzaHVmZmxlQXJyYXkoYXJyOiB1bmtub3duW10pIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IGFyci5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgY29uc3QgaWR4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGkgKyAxKSk7XG4gICAgICAgICAgICBjb25zdCB0bXAgPSBhcnJbaV07XG4gICAgICAgICAgICBhcnJbaV0gPSBhcnJbaWR4XTtcbiAgICAgICAgICAgIGFycltpZHhdID0gdG1wO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHdyYXBwZWRBcnJheUluZGV4PFQ+KGFycjogVFtdLCBpbmRleDogbnVtYmVyKTogVCB7XG4gICAgICAgIHJldHVybiBhcnIuYXQoaW5kZXggJSBhcnIubGVuZ3RoKSBhcyBUO1xuICAgIH0sXG5cbiAgICB3ZWlnaHRlZFJhbmRvbTxUIGV4dGVuZHMgT2JqZWN0PihpdGVtczogQXJyYXk8VCAmIHsgd2VpZ2h0OiBudW1iZXIgfT4pIHtcbiAgICAgICAgbGV0IHRvdGFsID0gMC4wO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0b3RhbCArPSBpdGVtc1tpXS53ZWlnaHQ7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHJuZyA9IHV0aWwucmFuZG9tKDAsIHRvdGFsKTtcbiAgICAgICAgbGV0IGlkeCA9IDA7XG4gICAgICAgIHdoaWxlIChybmcgPiBpdGVtc1tpZHhdLndlaWdodCkge1xuICAgICAgICAgICAgcm5nIC09IGl0ZW1zW2lkeF0ud2VpZ2h0O1xuICAgICAgICAgICAgaWR4Kys7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGl0ZW1zW2lkeF07XG4gICAgfSxcbn07XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHJ1c3RcXFxcRGVza3RvcFxcXFxwcm9qZWN0c1xcXFxzdXJ2ZXYtcHJvZFxcXFxzZXJ2ZXJcXFxcc3JjXFxcXHV0aWxzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxydXN0XFxcXERlc2t0b3BcXFxccHJvamVjdHNcXFxcc3VydmV2LXByb2RcXFxcc2VydmVyXFxcXHNyY1xcXFx1dGlsc1xcXFxnaXRSZXZpc2lvbi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvcnVzdC9EZXNrdG9wL3Byb2plY3RzL3N1cnZldi1wcm9kL3NlcnZlci9zcmMvdXRpbHMvZ2l0UmV2aXNpb24udHNcIjtpbXBvcnQgeyBleGVjU3luYyB9IGZyb20gXCJjaGlsZF9wcm9jZXNzXCI7XG5cbmV4cG9ydCBsZXQgR0lUX1ZFUlNJT04gPSBcIlVua25vd25cIjtcbnRyeSB7XG4gICAgR0lUX1ZFUlNJT04gPSBleGVjU3luYyhcImdpdCByZXYtcGFyc2UgSEVBRFwiKS50b1N0cmluZygpLnRyaW0oKTtcbn0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihgRmFpbGVkIHRvIHBhcnNlIGdpdCByZXZpc2lvbjogYCwgZXJyb3IpO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFxVixTQUFTLG9CQUFvQjtBQUNsWCxPQUFPLHNCQUFzQjs7O0FDQzNCLGNBQVc7OztBQ0YwVSxPQUFPLFFBQVE7QUFDdFcsT0FBTyxVQUFVOzs7QUNLVixJQUFLLFlBQUwsa0JBQUtBLGVBQUw7QUFDSCxFQUFBQSxzQkFBQTtBQUNBLEVBQUFBLHNCQUFBO0FBQ0EsRUFBQUEsc0JBQUE7QUFDQSxFQUFBQSxzQkFBQTtBQUNBLEVBQUFBLHNCQUFBO0FBQ0EsRUFBQUEsc0JBQUE7QUFDQSxFQUFBQSxzQkFBQTtBQVBRLFNBQUFBO0FBQUEsR0FBQTtBQVVMLElBQUssYUFBTCxrQkFBS0MsZ0JBQUw7QUFDSCxFQUFBQSx3QkFBQTtBQUNBLEVBQUFBLHdCQUFBO0FBQ0EsRUFBQUEsd0JBQUE7QUFDQSxFQUFBQSx3QkFBQTtBQUNBLEVBQUFBLHdCQUFBO0FBTFEsU0FBQUE7QUFBQSxHQUFBO0FBUUwsSUFBSyxTQUFMLGtCQUFLQyxZQUFMO0FBQ0gsRUFBQUEsZ0JBQUE7QUFDQSxFQUFBQSxnQkFBQTtBQUNBLEVBQUFBLGdCQUFBO0FBQ0EsRUFBQUEsZ0JBQUE7QUFDQSxFQUFBQSxnQkFBQTtBQUxRLFNBQUFBO0FBQUEsR0FBQTtBQVFMLElBQUssYUFBTCxrQkFBS0MsZ0JBQUw7QUFDSCxFQUFBQSx3QkFBQTtBQUNBLEVBQUFBLHdCQUFBO0FBQ0EsRUFBQUEsd0JBQUE7QUFDQSxFQUFBQSx3QkFBQTtBQUNBLEVBQUFBLHdCQUFBO0FBTFEsU0FBQUE7QUFBQSxHQUFBO0FBUUwsSUFBSyxVQUFMLGtCQUFLQyxhQUFMO0FBQ0gsRUFBQUEsa0JBQUE7QUFDQSxFQUFBQSxrQkFBQTtBQUNBLEVBQUFBLGtCQUFBO0FBSFEsU0FBQUE7QUFBQSxHQUFBO0FBTUwsSUFBSyxPQUFMLGtCQUFLQyxVQUFMO0FBQ0gsRUFBQUEsWUFBQTtBQUNBLEVBQUFBLFlBQUE7QUFDQSxF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QUFBLElBQ0EsTUFBTTtBQUFBLE1BQ0YsV0FBVztBQUFBLElBQ2Y7QUFBQSxJQUNBLGVBQWUsQ0FBQyxVQUFVO0FBQUEsSUFDMUIsUUFBUTtBQUFBLE1BQ0osTUFBTTtBQUFBLE1BQ04sWUFBWTtBQUFBLE1BQ1osTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBLFFBQ0gsUUFBUTtBQUFBLFVBQ0osUUFBUSxVQUFVLE9BQU8sVUFBVSxJQUFJLElBQUksT0FBTyxVQUFVLElBQUk7QUFBQSxVQUNoRSxjQUFjO0FBQUEsVUFDZCxRQUFRO0FBQUEsUUFDWjtBQUFBLFFBQ0EsWUFBWTtBQUFBLFVBQ1IsUUFBUSxVQUFVLE9BQU8sVUFBVSxJQUFJLElBQUksT0FBTyxVQUFVLElBQUk7QUFBQSxVQUNoRSxjQUFjO0FBQUEsVUFDZCxRQUFRO0FBQUEsVUFDUixJQUFJO0FBQUEsUUFDUjtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDTCxNQUFNO0FBQUEsTUFDTixZQUFZO0FBQUEsTUFDWixNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsUUFDSCxRQUFRO0FBQUEsVUFDSixRQUFRLFVBQVUsT0FBTyxVQUFVLElBQUksSUFBSSxPQUFPLFVBQVUsSUFBSTtBQUFBLFVBQ2hFLGNBQWM7QUFBQSxVQUNkLFFBQVE7QUFBQSxRQUNaO0FBQUEsUUFDQSxZQUFZO0FBQUEsVUFDUixRQUFRLFVBQVUsT0FBTyxVQUFVLElBQUksSUFBSSxPQUFPLFVBQVUsSUFBSTtBQUFBLFVBQ2hFLGNBQWM7QUFBQSxVQUNkLFFBQVE7QUFBQSxVQUNSLElBQUk7QUFBQSxRQUNSO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQ0osQ0FBQzsiLAogICJuYW1lcyI6IFsiRW1vdGVTbG90IiwgIkRhbWFnZVR5cGUiLCAiQWN0aW9uIiwgIldlYXBvblNsb3QiLCAiR2FzTW9kZSIsICJBbmltIiwgIlBsYW5lIiwgIkhhc3RlVHlwZSIsICJJbnB1dCIsICJtaW4iLCAibWF4IiwgImFyZWEiLCAibWluIiwgIm1heCIsICJ0b0xpbmVhciIsICJ0b1NSR0IiLCAicGF0aCJdCn0K

import { type Circle, type AABB, type Collider } from "../utils/coldet";
import { type Vec2 } from "../utils/v2";

interface TerrainSpawnDef {
    grass?: boolean
    beach?: boolean
    riverShore?: boolean
    bridge?: {
        nearbyWidthMult: number
    }
    waterEdge?: {
        dir: Vec2
        distMin: number
        distMax: number
    }
    river?: {
        centerWeight: number
    }
}

type GoreRegion = AABB & { height: number };

//
// ObstacleDef
//
export interface ObstacleDef {
    type: "obstacle"
    obstacleType?: string
    scale: {
        createMin: number
        createMax: number
        destroy: number
    }
    collision: Collider
    // collision:                {
    //   type:   number;
    //   pos?:   Vec2;
    //   rad?:   number;
    //   height: number;
    //   min?:   Vec2;
    //   max?:   Vec2;
    // };
    height: number
    collidable: boolean
    destructible: boolean
    explosion?: string
    health: number
    hitParticle: string
    explodeParticle: string[] | string
    reflectBullets: boolean
    loot: Array<{
        tier?: string
        min?: number
        max?: number
        props: Record<string, unknown>
        type?: string
        count?: number
    }>
    map?: {
        display: boolean
        color?: number
        scale?: number
    }
    terrain?: TerrainSpawnDef
    // terrain?:                 {
    //   grass?:      boolean;
    //   beach?:      boolean;
    //   river?:      {
    //     centerWeight: number;
    //   };
    //   riverShore?: boolean;
    //   lakeCenter?: boolean;
    // };
    img: {
        sprite?: string
        scale?: number
        alpha?: number
        tint?: number
        zIdx?: number
        residue?: string
        mirrorY?: boolean
    }
    sound: {
        bullet: string
        punch: string
        explode: string
        enter: string
    }
    isWall?: boolean
    material?: string
    extents?: Vec2
    mapObstacleBounds?: GoreRegion[]
    door?: {
        interactionRad: number
        canUse: boolean
        openSpeed: number
        openOneWay: boolean | number
        openDelay: number
        openOnce: boolean
        autoOpen: boolean
        autoClose: boolean
        autoCloseDelay: number
        slideToOpen: boolean
        slideOffset: number
        spriteAnchor: Vec2
        sound: {
            open: string
            close: string
            change: string
            error: string
        }
        casingImg?: {
            sprite: string
            pos: Vec2
            scale: number
            alpha: number
            tint: number
        }
        locked?: boolean
    }
    hinge?: Vec2
    isWindow?: boolean
    destroyType?: string
    stonePlated?: boolean
    aabb?: GoreRegion
    isTree?: boolean
    button?: {
        interactionRad: number
        interactionText: string
        useOnce: boolean
        useType?: string
        useDelay: number
        useDir: Vec2
        useImg: string
        sound: {
            on: string
            off: string
        }
        destroyOnUse?: boolean
        useParticle?: string
        offImg?: string
    }
    disableBuildingOccupied?: boolean
    damageCeiling?: boolean
    lootSpawn?: {
        offset: Vec2
        speedMult: number
    }
    dropCollision?: GoreRegion
    airdropCrate?: boolean
    isBush?: boolean
    isDecalAnchor?: boolean
    swapWeaponOnDestroy?: boolean
    regrow?: boolean
    regrowTimer?: number
    armorPlated?: boolean
    smartLoot?: boolean
    createSmoke?: boolean
}

//
// BuildingDef
//
export interface BuildingDef {
    type: "building"
    map?: {
        display?: boolean
        color?: number
        scale?: number
        shapes?: Array<{
            collider: MapObstacleBound
            color: number
        }>
        displayType?: string
    }
    terrain: {
        grass?: boolean
        beach?: boolean
        lakeCenter?: boolean
        waterEdge?: {
            dir: Vec2
            distMin: number
            distMax: number
        }
        spawnPriority?: number
        riverShore?: boolean
        nearbyRiver?: {
            radMin: number
            radMax: number
            facingOri: number
        }
        bridge?: {
            nearbyWidthMult: number
        }
    }
    mapObstacleBounds?: MapObstacleBound[]
    zIdx?: number
    floor: {
        surfaces: Array<{
            type: string
            collision: GoreRegion[]
            data?: {
                isBright: boolean
            }
        }>
        imgs: FloorImage[]
    }
    ceiling: {
        zoomRegions: Array<{
            zoomIn?: GoreRegion
            zoomOut?: GoreRegion
            zoom?: number
        }>
        vision?: {
            dist?: number
            width?: number
            linger?: number
            fadeRate?: number
        }
        imgs: FloorImage[]
        damage?: {
            obstacleCount: number
        }
        destroy?: {
            wallCount: number
            particle: string
            particleCount: number
            residue: string
            sound?: string
        }
        collision?: GoreRegion[]
    }
    mapObjects: Array<{
        type?: string
        pos: Vec2
        scale: number
        ori: number
        ignoreMapSpawnReplacement?: boolean
        inheritOri?: boolean
        puzzlePiece?: string
    }>
    porch_01?: string
    stand?: string
    tree?: string
    tree_scale?: number
    tree_loot?: string
    bush_chance?: number
    decoration_01?: string
    decoration_02?: string
    mid_obs_01?: string
    occupiedEmitters?: Array<{
        type: string
        pos: Vec2
        rot: number
        scale: number
        layer: number
        parentToCeiling?: boolean
        dir?: Vec2
    }>
    puzzle?: {
        name: string
        completeUseType: string
        completeOffDelay: number
        completeUseDelay: number
        errorResetDelay: number
        pieceResetDelay: number
        sound: {
            fail: string
            complete: string
        }
    }
    ori?: number
    topLeftObs?: string
    topRightObs?: string
    botRightObs?: string
    ignoreMapSpawnReplacement?: boolean
    mapGroundPatches?: Array<{
        bound: GoreRegion
        color: number
        order?: number
        roughness?: number
        offsetDist?: number
        useAsMapShape?: boolean
    }>
    bridgeLandBounds?: GoreRegion[]
    groundTintLt?: number
    groundTintDk?: number
    bridgeWaterBounds?: GoreRegion[]
    bonus_room?: string
    bonus_door?: string
    goreRegion?: GoreRegion
    tree_08c?: string
    crate?: string
    oris?: number[]
    vault?: string
    scale?: {
        createMin: number
        createMax: number
        destroy: number
    }
    statue?: string
    gold_box?: number
    floor_loot?: string
    cabin_mount?: string
    soundEmitters?: Array<{
        sound: string
        channel: string
        pos: Vec2
        range: {
            min: number
            max: number
        }
        falloff: number
        volume: number
    }>
    healRegions?: Array<{
        collision: GoreRegion
        healRate: number
    }>
    center_loot?: string
    left_loot?: string
    right_loot?: string
    entry_loot?: string
    obs?: string
    ceilingImg?: string
    specialLoot?: string
    basement?: string
    grass_color?: number
    tree_small?: string
    tree_large?: string
    floor_images?: FloorImage[]
    ceiling_images?: Array<{
        sprite: string
        scale: number
        alpha: number
        tint: number
    }>
}

interface FloorImage {
    sprite: string
    scale: number
    alpha: number
    tint: number
    rot?: number
    pos?: Vec2
    removeOnDamaged?: boolean
    mirrorY?: boolean
    mirrorX?: boolean
}
interface MapObstacleBound {
    type: number
    min?: Vec2
    max?: Vec2
    height: number
    pos?: Vec2
    rad?: number
}

//
// StructureDef
//
export interface StructureDef {
    type: "structure"
    terrain: TerrainSpawnDef
    // terrain:            {
    //   grass?:         boolean;
    //   beach?:         boolean;
    //   waterEdge?:     {
    //     dir:     Vec2;
    //     distMin: number;
    //     distMax: number;
    //   };
    //   spawnPriority?: number;
    //   bridge?:        {
    //     nearbyWidthMult: number;
    //   };
    // };
    ori?: number
    mapObstacleBounds?: GoreRegion[]
    layers: Array<{
        type: string
        pos: Vec2
        ori: number
        underground?: boolean
    }>
    stairs: Array<{
        collision: GoreRegion
        downDir: Vec2
        noCeilingReveal?: boolean
        lootOnly?: boolean
    }>
    mask: GoreRegion[]
    bunkerType?: string
    structureType?: string
    interiorSound?: {
        sound: string
        soundAlt: string
        filter?: string
        transitionTime: number
        soundAltPlayTime?: number
        outsideMaxDist: number
        outsideVolume: number
        undergroundVolume?: number
        puzzle: string
    }
    bridgeLandBounds?: GoreRegion[]
    bridgeWaterBounds?: GoreRegion[]
}

interface LootSpawnerDef {
    type: "loot_spawner"
    loot: Array<{
        tier?: string
        min?: number
        max?: number
        props: Record<string, any>
        type?: string
        count?: number
    }>
    terrain?: TerrainSpawnDef
}

export interface DecalDef {
    type: "decal"
    collision: Circle
    terrain: TerrainSpawnDef
    // collision:   {
    //   type:   number;
    //   pos?:   Vec2;
    //   rad?:   number;
    //   height: number;
    //   min?:   Vec2;
    //   max?:   Vec2;
    // };
    height: number
    img: {
        sprite: string
        scale: number
        alpha: number
        tint: number
        zIdx: number
        flicker?: boolean
        flickerMin?: number
        flickerMax?: number
        flickerRate?: number
        ignoreAdjust?: boolean
    }
    lifetime?: {
        min: number
        max: number
    } | number
    fadeChance?: number
    surface?: {
        type: string
        data: {
            waterColor: number
            rippleColor: number
        }

    }
    gore?: {
        fade: {
            start: number
            end: number
            pow: number
            speed: number
        }
        tint?: number
        alpha: number
        waterColor?: number
        rippleColor?: number
    }
}

export type MapObjectDef = ObstacleDef | BuildingDef | StructureDef | DecalDef | LootSpawnerDef;

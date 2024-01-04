import { type AABB, type Collider } from "../utils/coldet";
import { type Vec2 } from "../utils/v2";

interface TerrainSpawnDef {
    grass?: boolean
    beach?: boolean
    bridge?: {
        nearbyWidthMult: number
    }
    waterEdge?: {
        dir: Vec2
        distMin: number
        distMax: number
    }
}

interface ObstacleDef {
    type: "obstacle"
    obstacleType: string
    scale: {
        createMin: number
        createMax: number
        destroy: number
    }
    collision: Collider
    height: number
    collidable: boolean
    destructible: boolean
    health: number
    reflectBullets?: boolean
    explosion?: string
    loot: Array<({
        tier: string
        min: number
        max: number
    } | {
        type: string
        count: number
    }) & {
        // eslint-disable-next-line @typescript-eslint/ban-types
        props: {} | number
    }>
    lootSpawn: {
        offset: Vec2
        speedMult: number
    }
    isBush?: boolean
    isWindow?: boolean
    isWall?: boolean
    destroyType?: string
    stonePlated?: boolean
    armorPlated?: boolean
    map: {
        display: boolean
        color: number
        scale: number
    }
    terrain: TerrainSpawnDef
    door?: {
        interactionRad: number
        openSpeed?: number
        openOneWay?: number
        openDelay?: number
        openOnce?: number
        canUse: boolean
        autoOpen?: boolean
        autoClose?: boolean
        autoCloseDelay?: boolean
        slideToOpen?: boolean
        slideOffset?: boolean
    }
    button?: {
        interactionRad: number
        interactionText: string
        useOnce: boolean
        useType: string
        useDelay: number
        useDir: Vec2
    }
}

interface BuildingDef {
    type: "building"
    map: {
        display: boolean
        color: number
        scale: number
    }
    terrain: TerrainSpawnDef
    zIdx: number
    floor: {
        surfaces: Array<{
            type: "string"
            collision: AABB[]
        }>
    }
    ceiling: {
        zoomRegions: Array<{
            zoomIn: AABB
            zoomOut?: AABB
            zoom?: number
        }>
        vision?: {
            dist: number
            width: number
            linger?: number
            fadeRate?: number
        }
    }
    mapObstacleBounds?: Collider[]
    mapObjects: Array<{
        type: string | (() => string)
        pos: Vec2
        scale: number
        ori: number
        inheritOri?: boolean
    }>
    puzzle?: {
        solution: string
        completeUseType: string
        completeOffDelay: number
        completeUseDelay: number
        errorResetDelay: number
        pieceResetDelay: number
    }
    mapGroundPatches?: Array<{
        bound: AABB
        color: number
        roughness: number
        offsetDist: number
        order?: number
        useAsMapShape?: boolean
    }>
}

interface StructureDef {
    type: "structure"
    terrain: TerrainSpawnDef
    ori: number
    mapObstacleBounds: Collider[]
    layers: Array<{
        type: string
        pos: Vec2
        ori: number
        underground?: boolean
    }>
    bridgeLandBounds?: Collider[]
    stairs: Array<{
        collision: AABB
        downDir: Vec2
        lootOnly?: boolean
        noCeilingReveal?: boolean
    }>
    mask: AABB[]
}

interface LootSpawnerDef {
    type: "loot_spawner"
    loot: Array<{
        tier: any
        min: any
        max: any
        props: any
    }>
    terrain?: TerrainSpawnDef
}

interface DecalDef {
    type: "decal"
    collision: Collider
    height: number
}

type MapObjectDef = ObstacleDef | BuildingDef | StructureDef | DecalDef | LootSpawnerDef;

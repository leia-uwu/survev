import { type AABB, type Collider } from "../utils/coldet";
import { type Vec2 } from "../utils/v2";

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
    loot: Array<{
        tier: any
        min: any
        max: any
        props: any
    }>
    isBush?: boolean
    isWindow?: boolean
    isWall?: boolean
    destroyType?: string
    map: {
        display: boolean
        color: number
        scale: number
    }
    terrain: {
        grass: boolean
        beach: boolean
    }
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
}

interface BuildingDef {
    type: "building"
    map: {
        display: boolean
        color: number
        scale: number
    }
    terrain: {
        grass: boolean
        beach: boolean
        bridge?: {
            nearbyWidthMult: number
        }
    }
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
        inheritOri: boolean
    }>
    puzzle?: {
        solution: string
        completeUseType: string
        completeOffDelay: number
        completeUseDelay: number
        errorResetDelay: number
        pieceResetDelay: number
    }
}

interface StructureDef {
    type: "structure"
    terrain: {
        grass: boolean
        beach: boolean
        bridge?: {
            nearbyWidthMult: number
        }
    }
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
    terrain?: {
        grass?: boolean
        beach?: boolean
        riverShore?: boolean
    }
}

interface DecalDef {
    type: "decal"
    collision: Collider
    height: number
}

type MapObjectDefs = ObstacleDef | BuildingDef | StructureDef | DecalDef | LootSpawnerDef;

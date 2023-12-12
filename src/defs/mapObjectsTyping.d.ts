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
    map: {
        display: boolean
        color: number
        scale: number
    }
    terrain: {
        grass: boolean
        beach: boolean
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
    }
    zIdx: number
    floor: {
        surfaces: never[]
    }
    ceiling: {
        zoomRegions: never[]
        vision: {
            dist: number
            width: number
            linger: number
            fadeRate: number
        }
    }
    mapObjects: Array<{
        type: string
        pos: Vec2
        scale: number
        ori: number
    }>
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
        collision: Collider
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

export type MapObjectDefs = ObstacleDef | BuildingDef | StructureDef | DecalDef | LootSpawnerDef;

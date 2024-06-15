import { type Circle, type AABB, type Collider } from "../utils/coldet";
import { type Vec2 } from "../utils/v2";

interface TerrainSpawnDef {
    grass?: boolean
    beach?: boolean
    riverShore?: boolean
    lakeCenter?: boolean
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
    nearbyRiver: {
        radMin: number
        radMax: number
        facingOri: number
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
    disableBuildingOccupied?: boolean
    damageCeiling?: boolean
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
    hinge?: Vec2
    door?: {
        interactionRad: number
        openSpeed?: number
        openOneWay?: boolean
        openDelay?: number
        openOnce?: boolean
        canUse: boolean
        autoOpen?: boolean
        locked?: boolean
        autoClose?: boolean
        autoCloseDelay?: number
        slideToOpen?: boolean
        slideOffset?: number
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
    zIdx?: number
    ori?: number
    oris?: number[]
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
        destroy?: {
            wallCount: number
            particle: string
            particleCount: number
            residue: string
        }
    }
    surfaces: Array<{
        type: string
        collision: Collider
    }>
    mapObstacleBounds?: Collider[]
    mapObjects: Array<{
        type: string | (() => string)
        pos: Vec2
        scale: number
        ori: number
        inheritOri?: boolean
        puzzlePiece?: string
        ignoreMapSpawnReplacement?: boolean
    }>
    puzzle?: {
        name: string
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
    bridgeLandBounds?: AABB[]
    bridgeWaterBounds?: AABB[]
    stairs: Array<{
        collision: AABB
        downDir: Vec2
        lootOnly?: boolean
        noCeilingReveal?: boolean
    }>
    mask: AABB[]
    interiorSound?: {
        puzzle: string
    }
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
    collision: Circle
    height: number
    terrain?: TerrainSpawnDef
    surface?: {
        type: string
    }
}

type MapObjectDef = ObstacleDef | BuildingDef | StructureDef | DecalDef | LootSpawnerDef;

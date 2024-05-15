import { type HasteType } from "../shared/gameConfig";
import { type ObjectType } from "../shared/utils/objectSerializeFns";
import { type Vec2 } from "../shared/utils/v2";
import { type Loot } from "./src/objects/loot";
import { type Obstacle } from "./src/objects/obstacle";
import { type Player } from "./src/objects/player";

// TEMPORARY FILE, WILL DELETE LATER

export abstract class AbstractObject {
    abstract init(): void;
    abstract free(): void;
}
interface Loadout {
    heal: string
    boost: string
    boolean: string
}

export interface PlayerInfo {
    playerId: number
    groupId: number
    teamId: number
    name: string
    nameTruncated: string
    anonName: string
    loadout: Loadout
}

export interface PlayerStatus {
    playerId: number
    pos: Vec2
    posTarget: Vec2
    posDelta: number
    health: number
    posInterp: number
    visible: boolean
    dead: boolean
    downed: boolean
    disconnected: boolean
    role: string
    timeSinceUpdate: number
    timeSinceVisible: number
    minimapAlpha: number
    minimapVisible: boolean
    hasData: boolean
}

export interface GroupStatus {
    health: number
    disconnected: boolean
}

export interface NetData {
    pos: Vec2
    dir: Vec2
    outfit: string
    backpack: string
    helmet: string
    chest: string
    activeWeapon: string
    layer: number
    dead: boolean
    downed: boolean
    animType: Anim
    animSeq: number
    actionType: Action
    actionSeq: number
    wearingPan: boolean
    healEffect: boolean
    frozen: boolean
    frozenOri: number
    hasteType: HasteType
    hasteSeq: number
    actionItem: string
    scale: number
    role: string
    Me: unknown[]
    perks?: Array<{
        type: string
        droppable: boolean
    }>
}

export interface LocalData {
    health: number
    zoom: number
    boost: number
    scope: string
    curWeapIdx: number
    inventory: Record<string, number>
    weapons: Array<{
        type: string
        ammo: number
    }>
    spectatorCount: number
}

export interface LocalDataWithDirty extends LocalData {
    healthDirty: boolean
    boostDirty: boolean
    zoomDirty: boolean
    actionDirty: boolean
    action: {
        time: number
        duration: number
        targetId: number
    }
    inventoryDirty: boolean
    weapsDirty: boolean
    spectatorCountDirty: boolean
}

export interface Anim {
    type: Anim
    data: {
        type: string
        mirror: false
    }
    seq: number
    ticker: number
    bones: unknown[]
}
export interface Action {
    type: Action
    seq: number
    seqOld: number
    item: string
    skin: string
    targetId: number
    time: number
    duration: number
    throttleCount: number
    throttleTicker: number
}

type Extended<T> = T & {
    __type: ObjectType
    __id: number
};

export type ClientObject = Extended<Loot> | Extended<Player> | Extended<Obstacle>;

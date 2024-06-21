import { type Game } from "../game";
import { type Collider } from "../../../shared/utils/coldet";
import { type Vec2 } from "../../../shared/utils/v2";
import { type DeadBody } from "./deadBody";
import { type Airdrop } from "./airdrop";
import { type Building } from "./building";
import { type Decal } from "./decal";
import { type Loot } from "./loot";
import { type Obstacle } from "./obstacle";
import { type Player } from "./player";
import { type Projectile } from "./projectile";
import { type Smoke } from "./smoke";
import { type Structure } from "./structure";
import { ObjectSerializeFns, ObjectType } from "../../../shared/utils/objectSerializeFns";
import { BitStream } from "../../../shared/net";
import { type Grid } from "../utils/grid";
import { assert } from "../../../shared/utils/util";

export type GameObject = Player | Obstacle | Loot | DeadBody | Building | Structure | Decal | Projectile | Smoke | Airdrop;

export interface DamageParams {
    amount: number
    damageType: number
    dir: Vec2
    gameSourceType?: string
    mapSourceType?: string
    source?: GameObject
}

const MAX_ID = 65535;

export class ObjectRegister {
    objects: Array<GameObject | undefined> = [];
    idToObj: Array<GameObject | null> = [];

    idToType = new Uint8Array(MAX_ID);
    dirtyPart = new Uint8Array(MAX_ID);
    dirtyFull = new Uint8Array(MAX_ID);

    deletedObjs: GameObject[] = [];

    idNext = 1;
    freeLists = {} as Record<ObjectType, number[]>;

    constructor(readonly grid: Grid) {
        for (let i = 0; i < MAX_ID; i++) {
            this.idToObj[i] = null;
        }
    }

    getById(id: number) {
        return this.idToObj[id] ?? undefined;
    }

    allocId(type: ObjectType) {
        let id = 1;
        if (this.idNext < MAX_ID) {
            id = this.idNext++;
        } else {
            const freeList = this.freeLists[type] || [];
            if (freeList.length > 0) {
                id = freeList.shift()!;
            } else {
                assert(false, `Ran out of ids for type ${type}`);
            }
        }
        return id;
    }

    freeId(type: ObjectType, id: number) {
        this.freeLists[type] = this.freeLists[type] || [];
        this.freeLists[type].push(id);
    }

    register(obj: GameObject) {
        const type = obj.__type;
        const id = this.allocId(type);
        obj.__id = id;
        obj.__arrayIdx = this.objects.length;
        obj.init();
        this.objects[obj.__arrayIdx] = obj;
        this.idToObj[id] = obj;
        this.idToType[id] = type;
        this.dirtyPart[id] = 1;
        this.dirtyFull[id] = 1;
        this.grid.addObject(obj);
    }

    unregister(obj: GameObject) {
        assert(obj.__id > 0);

        const lastObj = this.objects.pop()!;
        if (obj !== lastObj) {
            this.objects[obj.__arrayIdx] = lastObj;
            lastObj.__arrayIdx = obj.__arrayIdx;
        }
        this.idToObj[obj.__id] = null;

        this.freeId(obj.__type, obj.__id);

        this.idToType[obj.__id] = 0;
        this.dirtyPart[obj.__id] = 0;
        this.dirtyFull[obj.__id] = 0;

        obj.__id = 0;
        // @ts-expect-error type is readonly for proper type to object class casting
        obj.__type = ObjectType.Invalid;
    }

    serializeObjs() {
        for (let i = 0; i < this.objects.length; i++) {
            const obj = this.objects[i]!;
            const id = obj.__id;
            if (this.dirtyFull[id]) {
                obj.serializeFull();
            } else if (this.dirtyPart[id]) {
                obj.serializePartial();
            }
        }
    }

    flush() {
        for (let i = 0; i < this.deletedObjs.length; i++) {
            this.unregister(this.deletedObjs[i]);
        }
        this.deletedObjs.length = 0;
        this.dirtyFull.fill(0);
        this.dirtyPart.fill(0);
    }
}

export abstract class BaseGameObject {
    abstract readonly __type: ObjectType;
    declare __id: number;
    declare __arrayIdx: number;
    abstract bounds: Collider;

    readonly game: Game;

    _pos: Vec2;
    get pos() {
        return this._pos;
    }

    set pos(pos: Vec2) {
        this._pos = pos;
    }

    abstract layer: number;

    initialized = false;
    partialStream!: BitStream;
    fullStream!: BitStream;

    constructor(game: Game, pos: Vec2) {
        this.game = game;
        this._pos = pos;
    }

    damage(_params: DamageParams): void { }

    init(): void {
        this.initialized = true;
        this.partialStream = new BitStream(new ArrayBuffer(64));
        this.fullStream = new BitStream(new ArrayBuffer(64));
        this.serializeFull();
    }

    serializePartial(): void {
        if (!this.initialized) {
            console.warn("Tried to partially serialized object that has not been initialized");
            return;
        }
        assert(this.__id !== 0 && this.__type !== 0, "Object not registered");
        this.partialStream.index = 0;
        this.partialStream.writeUint16(this.__id);
        (ObjectSerializeFns[this.__type].serializePart as (s: BitStream, data: this) => void)(this.partialStream, this);
    }

    serializeFull(): void {
        if (!this.initialized) {
            console.warn("Tried to fully serialized object that has not been initialized");
            return;
        }
        assert(this.__id !== 0 && this.__type !== 0, "Object not registered");
        this.serializePartial();
        this.fullStream.index = 0;
        (ObjectSerializeFns[this.__type].serializeFull as (s: BitStream, data: this) => void)(this.fullStream, this);
    }

    setDirty() {
        this.game.objectRegister.dirtyFull[this.__id] = 1;
    }

    setPartDirty() {
        this.game.objectRegister.dirtyPart[this.__id] = 1;
    }

    destroyed = false;
    destroy() {
        if (this.destroyed) {
            console.warn("Tried to destroy object twice");
            return;
        }
        this.game.grid.remove(this as unknown as GameObject);
        this.game.objectRegister.deletedObjs.push(this as unknown as GameObject);
        this.destroyed = true;
    }
}

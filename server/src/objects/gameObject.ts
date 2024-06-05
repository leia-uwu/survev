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
import { ObjectSerializeFns, type ObjectType } from "../../../shared/utils/objectSerializeFns";
import { BitStream } from "../../../shared/net";

export type GameObject = Player | Obstacle | Loot | DeadBody | Building | Structure | Decal | Projectile | Smoke | Airdrop;

export interface DamageParams {
    amount: number
    damageType: number
    dir: Vec2
    gameSourceType?: string
    mapSourceType?: string
    source?: GameObject
}

export abstract class BaseGameObject {
    abstract readonly __type: ObjectType;
    readonly __id: number;
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
        this.__id = game.objectIdAllocator.getNextId();
    }

    damage(_params: DamageParams): void {}

    init(): void {
        this.initialized = true;
        this.partialStream = new BitStream(new ArrayBuffer(64));
        this.fullStream = new BitStream(new ArrayBuffer(64));
        this.serializeFull();
    }

    serializePartial(): void {
        if (!this.initialized) return;
        this.partialStream.index = 0;
        this.partialStream.writeUint16(this.__id);
        (ObjectSerializeFns[this.__type].serializePart as (s: BitStream, data: this) => void)(this.partialStream, this);
    }

    serializeFull(): void {
        if (!this.initialized) return;
        this.serializePartial();
        this.fullStream.index = 0;
        (ObjectSerializeFns[this.__type].serializeFull as (s: BitStream, data: this) => void)(this.fullStream, this);
    }

    setDirty() {
        this.game.fullObjs.add(this);
    }

    setPartDirty() {
        this.game.partialObjs.add(this);
    }
}

import { type Game } from "../game";
import { type Collider } from "../utils/coldet";
import { type Vec2 } from "../utils/v2";
import { type DeadBody } from "./DeadBody";
import { type Airdrop } from "./airdrop";
import { type Building } from "./building";
import { type Decal } from "./decal";
import { type Loot } from "./loot";
import { type Obstacle } from "./obstacle";
import { type Player } from "./player";
import { type Projectile } from "./projectile";
import { type Smoke } from "./smoke";
import { type Structure } from "./structure";

export enum ObjectType {
    Invalid,
    Player,
    Obstacle,
    Loot,
    LootSpawner, // NOTE: unused
    DeadBody,
    Building,
    Structure,
    Decal,
    Projectile,
    Smoke,
    Airdrop
}

export type GameObject = Player | Obstacle | Loot | DeadBody | Building | Structure | Decal | Projectile | Smoke | Airdrop;

export abstract class BaseGameObject {
    abstract readonly __type: ObjectType;
    abstract bounds: Collider;

    readonly id: number;
    readonly game: Game;

    _pos: Vec2;
    get pos() {
        return this._pos;
    }

    set pos(pos: Vec2) {
        this._pos = pos;
    }

    abstract layer: number;

    constructor(game: Game, pos: Vec2) {
        this.game = game;
        this._pos = pos;
        this.id = game.nextObjId++;
    }

    setDirty() {
        this.game.fullObjs.add(this);
    }

    setPartDirty() {
        this.game.partialObjs.add(this);
    }
}

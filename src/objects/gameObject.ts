import { type Game } from "../game";
import { type Collider } from "../utils/coldet";
import { type Vec2 } from "../utils/v2";

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

export abstract class GameObject {
    abstract readonly kind: ObjectType;
    abstract get bounds(): Collider;

    readonly id: number;
    readonly game: Game;

    pos: Vec2;

    abstract layer: number;

    constructor(game: Game, pos: Vec2) {
        this.game = game;
        this.pos = pos;
        this.id = game.nextObjId++;
    }

    setDirty() {
        this.game.fullObjs.add(this);
    }

    setPartDirty() {
        this.game.partialObjs.add(this);
    }
}

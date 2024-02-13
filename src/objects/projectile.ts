import { GameObjectDefs } from "../defs/gameObjectDefs";
import { type ThrowableDef } from "../defs/objectsTypings";
import { type Game } from "../game";
import { type ObjectsFullData, type ObjectsPartialData } from "../net/objectSerialization";
import { type Collider } from "../utils/coldet";
import { collider } from "../utils/collider";
import { v2, type Vec2 } from "../utils/v2";
import { BaseGameObject, ObjectType } from "./gameObject";

type FullProjectile = ObjectsFullData[ObjectType.Projectile];
type PartialProjectile = ObjectsPartialData[ObjectType.Projectile];

export class Projectile extends BaseGameObject implements FullProjectile, PartialProjectile {
    bounds: Collider;

    override __type = ObjectType.Projectile;

    layer: number;

    posZ: number = 5;
    dir = v2.create(0, 0);
    type: string;

    constructor(game: Game, type: string, pos: Vec2, layer: number) {
        super(game, pos);
        this.layer = layer;
        this.type = type;

        const def = GameObjectDefs[type] as ThrowableDef;

        this.bounds = collider.createCircle(v2.create(0, 0), def.rad);
    }
}

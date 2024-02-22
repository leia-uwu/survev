import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";
import { type ThrowableDef } from "../../../shared/defs/objectsTypings";
import { type Game } from "../game";
import { type Collider } from "../../../shared/utils/coldet";
import { collider } from "../../../shared/utils/collider";
import { v2, type Vec2 } from "../../../shared/utils/v2";
import { BaseGameObject, ObjectType } from "./gameObject";

export class Projectile extends BaseGameObject {
    bounds: Collider;

    override readonly __type = ObjectType.Projectile;

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

import { type Game } from "../game";
import { type ObjectsFullData, type ObjectsPartialData } from "../net/objectSerialization";
import { collider } from "../../../shared/utils/collider";
import { v2, type Vec2 } from "../../../shared/utils/v2";
import { BaseGameObject, ObjectType } from "./gameObject";

type FullSmoke = ObjectsFullData[ObjectType.Smoke];
type PartialSmoke = ObjectsPartialData[ObjectType.Smoke];

export class Smoke extends BaseGameObject implements FullSmoke, PartialSmoke {
    bounds = collider.createCircle(v2.create(0, 0), 0);

    override readonly __type = ObjectType.Smoke;

    layer: number;

    rad = 0;
    interior = 0;

    constructor(game: Game, pos: Vec2, layer: number) {
        super(game, pos);
        this.layer = layer;
    }
}

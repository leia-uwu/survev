import { type Game } from "../game";
import { type ObjectsFullData, type ObjectsPartialData } from "../net/objectSerialization";
import { collider } from "../utils/collider";
import { v2, type Vec2 } from "../utils/v2";
import { GameObject, ObjectType } from "./gameObject";

type FullSmoke = ObjectsFullData[ObjectType.Smoke];
type PartialSmoke = ObjectsPartialData[ObjectType.Smoke];

export class Smoke extends GameObject implements FullSmoke, PartialSmoke {
    bounds = collider.createCircle(v2.create(0, 0), 0);

    override __type = ObjectType.Smoke;

    layer: number;

    rad = 0;
    interior = 0;

    constructor(game: Game, pos: Vec2, layer: number) {
        super(game, pos);
        this.layer = layer;
    }
}

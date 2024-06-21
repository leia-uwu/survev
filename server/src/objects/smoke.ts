import { type Game } from "../game";
import { collider } from "../../../shared/utils/collider";
import { v2, type Vec2 } from "../../../shared/utils/v2";
import { BaseGameObject } from "./gameObject";
import { ObjectType } from "../../../shared/utils/objectSerializeFns";

export class SmokeBarn {
    smokes: Smoke[] = [];

    constructor(readonly game: Game) {}
}

export class Smoke extends BaseGameObject {
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

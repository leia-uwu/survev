import { collider } from "../../../../shared/utils/collider";
import { ObjectType } from "../../../../shared/utils/objectSerializeFns";
import { type Vec2, v2 } from "../../../../shared/utils/v2";
import type { Game } from "../game";
import { BaseGameObject } from "./gameObject";

export class SmokeBarn {
    smokes: Smoke[] = [];

    constructor(readonly game: Game) {}
}

export class Smoke extends BaseGameObject {
    override readonly __type = ObjectType.Smoke;

    layer: number;

    rad = 0;
    interior = 0;

    constructor(game: Game, pos: Vec2, layer: number) {
        super(game, pos);
        this.layer = layer;
        this.bounds = collider.createAabbExtents(this.pos, v2.create(this.rad, this.rad));
    }
}

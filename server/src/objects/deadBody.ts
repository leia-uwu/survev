import { type Game } from "../game";
import { collider } from "../../../shared/utils/collider";
import { v2, type Vec2 } from "../../../shared/utils/v2";
import { BaseGameObject, ObjectType } from "./gameObject";

export class DeadBody extends BaseGameObject {
    bounds = collider.createCircle(v2.create(0, 0), 2);

    override readonly __type = ObjectType.DeadBody;

    layer: number;
    playerId: number;

    constructor(game: Game, pos: Vec2, playerId: number, layer: number) {
        super(game, pos);
        this.layer = layer;
        this.playerId = playerId;
    }
}

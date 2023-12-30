import { type Game } from "../game";
import { type ObjectsFullData, type ObjectsPartialData } from "../net/objectSerialization";
import { collider } from "../utils/collider";
import { v2, type Vec2 } from "../utils/v2";
import { GameObject, ObjectType } from "./gameObject";

type FullDeadBody = ObjectsFullData[ObjectType.DeadBody];
type PartialDeadBody = ObjectsPartialData[ObjectType.DeadBody];

export class DeadBody extends GameObject implements FullDeadBody, PartialDeadBody {
    bounds = collider.createCircle(v2.create(0, 0), 2);

    override __type = ObjectType.DeadBody;

    layer: number;
    playerId: number;

    constructor(game: Game, pos: Vec2, playerId: number, layer: number) {
        super(game, pos);
        this.layer = layer;
        this.playerId = playerId;
    }
}

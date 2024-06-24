import { type Game } from "../game";
import { collider } from "../../../shared/utils/collider";
import { v2, type Vec2 } from "../../../shared/utils/v2";
import { BaseGameObject } from "./gameObject";
import { ObjectType } from "../../../shared/utils/objectSerializeFns";

export class AirdropBarn {
    airdrops: Airdrop[] = [];
    constructor(readonly game: Game) {}
}

export class Airdrop extends BaseGameObject {
    bounds = collider.createAabbExtents(v2.create(0, 0), v2.create(5, 5));

    override readonly __type = ObjectType.Airdrop;

    layer = 0;

    fallT = 0;
    landed = false;

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(game: Game, pos: Vec2) {
        super(game, pos);
    }
}

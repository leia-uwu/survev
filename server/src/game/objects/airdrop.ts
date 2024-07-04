import { ObjectType } from "../../../../shared/net/objectSerializeFns";
import { collider } from "../../../../shared/utils/collider";
import { type Vec2, v2 } from "../../../../shared/utils/v2";
import type { Game } from "../game";
import { BaseGameObject } from "./gameObject";

export class AirdropBarn {
    airdrops: Airdrop[] = [];
    constructor(readonly game: Game) {}
}

export class Airdrop extends BaseGameObject {
    override readonly __type = ObjectType.Airdrop;
    bounds = collider.createAabbExtents(v2.create(0, 0), v2.create(5, 5));

    layer = 0;

    fallT = 0;
    landed = false;

    constructor(game: Game, pos: Vec2) {
        super(game, pos);
    }
}

import { ObjectType } from "../../../../shared/net/objectSerializeFns";
import type { AABB } from "../../../../shared/utils/coldet";
import { collider } from "../../../../shared/utils/collider";
import type { Vec2 } from "../../../../shared/utils/v2";
import type { Game } from "../game";
import { BaseGameObject } from "./gameObject";

export class AirdropBarn {
    airdrops: Airdrop[] = [];
    constructor(readonly game: Game) {}
}

export class Airdrop extends BaseGameObject {
    override readonly __type = ObjectType.Airdrop;

    layer = 0;

    fallT = 0;
    landed = false;

    constructor(game: Game, pos: Vec2) {
        super(game, pos);
        this.bounds = collider.transform(this.bounds, this.pos, 0, 1) as AABB;
    }
}

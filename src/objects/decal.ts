import { type Game } from "../game";
import { type ObjectsFullData, type ObjectsPartialData } from "../net/objectSerialization";
import { type Collider } from "../utils/coldet";
import { mapHelpers } from "../utils/mapHelpers";
import { type Vec2 } from "../utils/v2";
import { GameObject, ObjectType } from "./gameObject";

type FullDecal = ObjectsFullData[ObjectType.Decal];
type PartialDecal = ObjectsPartialData[ObjectType.Decal];

export class Decal extends GameObject implements FullDecal, PartialDecal {
    bounds: Collider;

    override __type = ObjectType.Decal;

    layer: number;
    type: string;
    scale: number;
    goreKills = 1;
    ori: number;

    constructor(game: Game, type: string, pos: Vec2, layer: number, ori: number, scale: number) {
        super(game, pos);
        this.layer = layer;
        this.type = type;
        this.scale = scale;
        this.ori = ori;

        this.bounds = mapHelpers.getBoundingCollider(type);
    }
}

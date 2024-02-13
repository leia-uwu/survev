import { MapObjectDefs } from "../defs/mapObjectDefs";
import { type DecalDef } from "../defs/mapObjectsTyping";
import { type Game } from "../game";
import { type ObjectsFullData, type ObjectsPartialData } from "../net/objectSerialization";
import { type Circle, type Collider } from "../utils/coldet";
import { collider } from "../utils/collider";
import { mapHelpers } from "../utils/mapHelpers";
import { math } from "../utils/math";
import { v2, type Vec2 } from "../utils/v2";
import { BaseGameObject, ObjectType } from "./gameObject";

type FullDecal = ObjectsFullData[ObjectType.Decal];
type PartialDecal = ObjectsPartialData[ObjectType.Decal];

export class Decal extends BaseGameObject implements FullDecal, PartialDecal {
    bounds: Collider;

    override __type = ObjectType.Decal;

    layer: number;
    type: string;
    scale: number;
    goreKills = 1;
    ori: number;
    rot: number;
    collider?: Circle;
    surface?: string;

    constructor(game: Game, type: string, pos: Vec2, layer: number, ori: number, scale: number) {
        super(game, pos);
        this.layer = layer;
        this.type = type;
        this.scale = scale;
        this.ori = ori;
        this.rot = math.oriToRad(ori);

        const def = MapObjectDefs[type] as DecalDef;

        this.collider = collider.transform(def.collision, this.pos, this.rot, this.scale) as Circle;
        this.surface = def.surface?.type;

        this.bounds = collider.transform(mapHelpers.getBoundingCollider(type), v2.create(0, 0), this.rot, 1);
    }
}

import { MapObjectDefs } from "../defs/mapObjectDefs";
import { type BuildingDef } from "../defs/mapObjectsTyping";
import { type Game } from "../game";
import { type ObjectsFullData, type ObjectsPartialData } from "../net/objectSerialization";
import { type Collider } from "../utils/coldet";
import { collider } from "../utils/collider";
import { mapHelpers } from "../utils/mapHelpers";
import { type Vec2 } from "../utils/v2";
import { GameObject, ObjectType } from "./gameObject";

type FullBuilding = ObjectsFullData[ObjectType.Building];
type PartialBuilding = ObjectsPartialData[ObjectType.Building];

export class Building extends GameObject implements FullBuilding, PartialBuilding {
    bounds: Collider;

    mapObstacleBounds: Collider[] = [];

    override __type = ObjectType.Building;

    type: string;

    layer: number;

    ceilingDead = false;
    ceilingDamaged = false;
    ori: number;
    occupied = false;
    hasPuzzle = false;
    puzzleSolved = false;
    puzzleErrSeq = 0;

    scale = 1;

    constructor(game: Game, type: string, pos: Vec2, ori: number, layer: number) {
        super(game, pos);
        this.layer = layer;
        this.ori = ori;
        this.type = type;
        const def = MapObjectDefs[this.type] as BuildingDef;

        this.bounds = mapHelpers.getBoundingCollider(type);

        if (def.mapObstacleBounds) {
            this.mapObstacleBounds = def.mapObstacleBounds.map(bound => {
                return collider.transform(bound, pos, ori, 1);
            });
        }
    }
}

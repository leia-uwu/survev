import { MapObjectDefs } from "../defs/mapObjectDefs";
import { type StructureDef } from "../defs/mapObjectsTyping";
import { type Game } from "../game";
import { type ObjectsFullData, type ObjectsPartialData } from "../net/objectSerialization";
import { type AABB, type Circle, coldet, type Collider } from "../utils/coldet";
import { collider } from "../utils/collider";
import { mapHelpers } from "../utils/mapHelpers";
import { math } from "../utils/math";
import { v2, type Vec2 } from "../utils/v2";
import { GameObject, ObjectType } from "./gameObject";

type FullStructure = ObjectsFullData[ObjectType.Structure];
type PartialStructure = ObjectsPartialData[ObjectType.Structure];

interface Stair {

    collision: AABB
    center: Vec2
    downDir: Vec2
    downAabb: AABB
    upAabb: AABB
    noCeilingReveal: boolean
    lootOnly: boolean

}

export class Structure extends GameObject implements FullStructure, PartialStructure {
    bounds: Collider;

    override __type = ObjectType.Structure;

    layer: number;

    ori: number;
    type: string;
    layerObjIds: number[];
    interiorSoundAlt = false;
    interiorSoundEnabled = true;

    stairs: Stair[];

    scale = 1;
    rot: number;

    mapObstacleBounds: Collider[];

    constructor(game: Game, type: string, pos: Vec2, layer: number, ori: number, layerObjIds: number[]) {
        super(game, pos);
        this.layer = layer;
        this.type = type;
        this.ori = ori;
        this.layerObjIds = layerObjIds;

        this.rot = math.oriToRad(ori);

        this.bounds = this.bounds = collider.transform(
            mapHelpers.getBoundingCollider(type),
            v2.create(0, 0),
            this.rot,
            1
        );

        const def = MapObjectDefs[type] as StructureDef;

        this.stairs = [];
        for (let i = 0; i < def.stairs.length; i++) {
            const stairsDef = def.stairs[i];
            const stairsCol = collider.transform(stairsDef.collision, this.pos, this.rot, this.scale) as AABB;
            const downDir = v2.rotate(stairsDef.downDir, this.rot);
            const childAabbs = coldet.splitAabb(stairsCol, downDir);
            this.stairs.push({
                collision: stairsCol,
                center: v2.add(stairsCol.min, v2.mul(v2.sub(stairsCol.max, stairsCol.min), 0.5)),
                downDir,
                downAabb: collider.createAabb(childAabbs[0].min, childAabbs[0].max),
                upAabb: collider.createAabb(childAabbs[1].min, childAabbs[1].max),
                noCeilingReveal: !!stairsDef.noCeilingReveal,
                lootOnly: !!stairsDef.lootOnly
            });
        }

        this.mapObstacleBounds = mapHelpers.getColliders(type).map(coll => {
            return collider.transform(coll, pos, this.rot, 1);
        });
    }

    static checkStairs(circle: Circle, stair: Stair, object: GameObject): boolean {
        const collides = coldet.testCircleAabb(circle.pos, circle.rad, stair.collision.min, stair.collision.max);

        if (collides) {
            const collidesUp = coldet.testCircleAabb(circle.pos, circle.rad, stair.upAabb.min, stair.upAabb.max);

            const collidesDown = coldet.testCircleAabb(circle.pos, circle.rad, stair.downAabb.min, stair.downAabb.max);

            if (collidesUp && !collidesDown) {
                object.layer = 2;
            }
            if (!collidesUp && collidesDown) {
                object.layer = 3;
            }
        }
        return collides;
    }
}

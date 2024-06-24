import { MapObjectDefs } from "../../../shared/defs/mapObjectDefs";
import { type DecalDef } from "../../../shared/defs/mapObjectsTyping";
import { type Game } from "../game";
import { type Circle, type Collider } from "../../../shared/utils/coldet";
import { collider } from "../../../shared/utils/collider";
import { mapHelpers } from "../../../shared/utils/mapHelpers";
import { math } from "../../../shared/utils/math";
import { v2, type Vec2 } from "../../../shared/utils/v2";
import { BaseGameObject } from "./gameObject";
import { ObjectType } from "../../../shared/utils/objectSerializeFns";

export class DecalBarn {
    decals: Decal[] = [];

    constructor(readonly game: Game) {}

    addDecal(type: string, pos: Vec2, layer: number, ori?: number, scale?: number) {
        const decal = new Decal(this.game, type, pos, layer, ori, scale);
        this.decals.push(decal);
        this.game.objectRegister.register(decal);
        return decal;
    }
}

export class Decal extends BaseGameObject {
    bounds: Collider;

    override readonly __type = ObjectType.Decal;

    layer: number;
    type: string;
    scale: number;
    goreKills = 0;
    ori: number;
    rot: number;
    collider?: Circle;
    surface?: string;

    constructor(game: Game, type: string, pos: Vec2, layer: number, ori?: number, scale?: number) {
        super(game, pos);
        this.layer = layer;
        this.type = type;
        this.scale = scale ?? 1;
        this.ori = ori ?? 0;
        this.rot = math.oriToRad(this.ori);

        const def = MapObjectDefs[type] as DecalDef;

        this.collider = collider.transform(def.collision, this.pos, this.rot, this.scale) as Circle;
        this.surface = def.surface?.type;

        this.bounds = collider.transform(mapHelpers.getBoundingCollider(type), v2.create(0, 0), this.rot, 1);
    }
}

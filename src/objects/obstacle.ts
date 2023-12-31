import { MapObjectDefs } from "../defs/mapObjectDefs";
import { type ObstacleDef } from "../defs/mapObjectsTyping";
import { type Game } from "../game";
import { NetConstants } from "../net/net";
import { type ObjectsFullData, type ObjectsPartialData } from "../net/objectSerialization";
import { type Collider } from "../utils/coldet";
import { collider } from "../utils/collider";
import { mapHelpers } from "../utils/mapHelpers";
import { math } from "../utils/math";
import { v2, type Vec2 } from "../utils/v2";
import { GameObject, ObjectType } from "./gameObject";

type FullObstacle = ObjectsFullData[ObjectType.Obstacle];
type PartialObstacle = ObjectsPartialData[ObjectType.Obstacle];

export class Obstacle extends GameObject implements FullObstacle, PartialObstacle {
    override __type = ObjectType.Obstacle;

    bounds: Collider;

    collider: Collider;

    type: string;
    ori: number;
    scale: number;

    healthT = 1;

    health: number;
    maxHealth: number;

    minScale: number;
    maxScale: number;

    dead = false;
    isDoor = false;

    door?: {
        open: boolean
        canUse: boolean
        seq: number
    };

    isButton = false;
    button?: {
        onOff: boolean
        canUse: boolean
        seq: number
    };

    isPuzzlePiece = false;
    parentBuildingId?: number;
    isSkin = false;
    skinPlayerId?: number;

    height: number;

    collidable: boolean;
    isWindow: boolean;
    isWall: boolean;

    layer: number;

    constructor(game: Game, pos: Vec2, type: string, layer: number, ori = 0, scale = 1) {
        super(game, pos);
        this.type = type;
        this.ori = ori;
        this.scale = scale;
        this.layer = layer;
        const def = MapObjectDefs[type];

        const rotation = math.oriToRad(ori);

        this.bounds = collider.transform(
            mapHelpers.getBoundingCollider(type),
            v2.create(0, 0),
            rotation,
            NetConstants.MapObjectMaxScale
        );

        if (def === undefined || def.type !== "obstacle") {
            throw new Error(`Invalid obstacle with type ${type}`);
        }
        this.height = def.height;

        this.collidable = def.collidable ?? true;
        this.isWindow = def.isWindow ?? false;
        this.isWall = def.isWall ?? false;

        this.maxHealth = def.health;
        this.health = def.health;

        this.maxScale = scale;
        this.minScale = def.scale.destroy;

        this.collider = collider.transform(def.collision, pos, rotation, scale);

        if (def.door) {
            this.isDoor = true;
            this.door = {
                canUse: def.door.canUse,
                open: false,
                seq: 0
            };
        }

        if (def.button) {
            this.isButton = true;
            this.button = {
                onOff: false,
                canUse: true,
                seq: 0
            };
        }
    }

    damage(amount: number): void {
        const def = MapObjectDefs[this.type] as ObstacleDef;
        if (this.health === 0 || !def.destructible) return;

        this.health -= amount;

        if (this.health <= 0) {
            this.health = this.healthT = 0;
            this.dead = true;
            this.setDirty();

            if (def.destroyType) {
                this.game.map.genObstacle(def.destroyType, this.pos, this.layer, this.ori);
            }
        } else {
            this.healthT = this.health / this.maxHealth;
            if (this.minScale < 1) {
                this.scale = this.healthT * (this.maxScale - this.minScale) + this.minScale;
                this.collider = collider.transform(def.collision, this.pos, math.oriToRad(this.ori), this.scale);
            }

            // need to send full object for obstacles with explosions
            // so smoke particles work on the client
            // since they depend on healthT
            if (def.explosion) this.setDirty();
            else this.setPartDirty();
        }
    }
}

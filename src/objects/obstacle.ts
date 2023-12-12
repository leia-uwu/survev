import { MapObjectDefs } from "../defs/mapObjectDefs";
import { type ObstacleDef } from "../defs/mapObjectsTyping";
import { type Game } from "../game";
import { type ObjectsFullData, type ObjectsPartialData } from "../net/objectSerialization";
import { type Collider } from "../utils/coldet";
import { collider } from "../utils/collider";
import { type Vec2 } from "../utils/v2";
import { GameObject, ObjectType } from "./gameObject";

type FullObstacle = ObjectsFullData[ObjectType.Obstacle];
type PartialObstacle = ObjectsPartialData[ObjectType.Obstacle];

export class Obstacle extends GameObject implements FullObstacle, PartialObstacle {
    override kind = ObjectType.Obstacle;

    get bounds(): Collider {
        return this.collider;
    }

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

    layer: number;

    constructor(game: Game, pos: Vec2, type: string, layer: number, ori = 0, scale = 1) {
        super(game, pos);
        this.type = type;
        this.ori = ori;
        this.scale = scale;
        this.layer = layer;
        const def = MapObjectDefs[type];

        if (def === undefined || def.type !== "obstacle") {
            throw new Error(`Invalid obstacle with type ${type}`);
        }
        this.collider = collider.transform(def.collision, pos, ori, scale);
        this.height = def.height;

        this.collidable = def.collidable ?? true;
        this.isWindow = def.isWindow ?? false;

        this.maxHealth = def.health;
        this.health = def.health;
        this.maxScale = scale;
        this.minScale = def.scale.destroy;
    }

    damage(amount: number): void {
        const def = MapObjectDefs[this.type] as ObstacleDef;
        if (this.health === 0 || !def.destructible) return;

        this.health -= amount;

        if (this.health <= 0) {
            this.health = this.healthT = 0;
            this.dead = true;
            this.setDirty();
        } else {
            this.healthT = this.health / this.maxHealth;
            if (this.minScale < 1) {
                this.scale = this.healthT * (this.maxScale - this.minScale) + this.minScale;
                this.collider = collider.transform(def.collision, this.pos, this.ori, this.scale);
            }

            this.setPartDirty();
        }
    }
}

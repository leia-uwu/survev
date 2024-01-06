import { GameObjectDefs } from "../defs/gameObjectDefs";
import { MapObjectDefs } from "../defs/mapObjectDefs";
import { type ObstacleDef } from "../defs/mapObjectsTyping";
import { type Game } from "../game";
import { NetConstants } from "../net/net";
import { type ObjectsFullData, type ObjectsPartialData } from "../net/objectSerialization";
import { type Collider } from "../utils/coldet";
import { collider } from "../utils/collider";
import { mapHelpers } from "../utils/mapHelpers";
import { math } from "../utils/math";
import { util } from "../utils/util";
import { v2, type Vec2 } from "../utils/v2";
import { type Building } from "./building";
import { GameObject, ObjectType } from "./gameObject";
import { getLootTable } from "./loot";
import { type Player } from "./player";

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

    door!: {
        open: boolean
        canUse: boolean
        locked: boolean
        hinge: Vec2
        closedOri: number
        openOri: number
        openAltOri: number
        openOneWay: number | boolean
        openDelay: number
        seq: number
        openOnce: boolean
        autoOpen: boolean
        autoClose: boolean
        autoCloseDelay: number
        slideToOpen: boolean
        slideOffset: number
        closedPosition: Vec2
        openPosition: Vec2
    };

    isButton = false;
    button!: {
        onOff: boolean
        canUse: boolean
        seq: number
        useOnce: boolean
        useType: string
        useDelay: number
        useDir: Vec2
    };

    isPuzzlePiece = false;
    puzzlePiece?: string;
    parentBuildingId?: number;
    isSkin = false;
    skinPlayerId?: number;

    height: number;

    collidable: boolean;
    isWindow: boolean;
    isWall: boolean;

    layer: number;

    destructible: boolean;

    rot: number;

    get interactable() {
        return this.button?.canUse ?? this.door?.canUse;
    }

    constructor(game: Game, pos: Vec2, type: string, layer: number, ori = 0, scale = 1, parentBuildingId?: number, puzzlePiece?: string) {
        super(game, pos);
        this.type = type;
        this.ori = ori;
        this.scale = scale;
        this.layer = layer;
        this.parentBuildingId = parentBuildingId;
        this.isPuzzlePiece = !!puzzlePiece;
        this.puzzlePiece = puzzlePiece;
        const def = MapObjectDefs[type];

        this.rot = math.oriToRad(ori);

        this.bounds = collider.transform(
            mapHelpers.getBoundingCollider(type),
            v2.create(0, 0),
            this.rot,
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

        this.collider = collider.transform(def.collision, pos, this.rot, scale);

        this.destructible = !!def.destructible;

        if (def.door) {
            this.isDoor = true;
            this.door = {
                open: false,
                canUse: def.door.canUse,
                hinge: def.hinge!,
                closedOri: this.ori,
                openOri: 0,
                openAltOri: 0,
                openDelay: def.door.openDelay ?? 0,
                seq: 1,
                locked: def.door.locked ?? false,
                openOneWay: def.door.openOneWay ?? false,
                openOnce: def.door.openOnce ?? false,
                autoOpen: def.door.autoOpen ?? false,
                autoClose: def.door.autoClose ?? false,
                autoCloseDelay: def.door.autoCloseDelay ?? 0,
                slideToOpen: def.door.slideToOpen ?? false,
                slideOffset: def.door.slideOffset ?? 0,
                closedPosition: v2.copy(this.pos),
                openPosition: v2.create(0, 0)
            };

            if (!this.door.slideToOpen) {
                switch (ori) {
                case 0:
                    this.door.openOri = 1;
                    this.door.openAltOri = 3;
                    break;
                case 1:
                    this.door.openOri = 2;
                    this.door.openAltOri = 0;
                    break;
                case 2:
                    this.door.openOri = 3;
                    this.door.openAltOri = 1;
                    break;
                case 3:
                    this.door.openOri = 0;
                    this.door.openAltOri = 2;
                    break;
                }
            }
        }

        if (def.button) {
            this.isButton = true;
            this.button = {
                onOff: false,
                canUse: true,
                seq: 1,
                useOnce: def.button.useOnce,
                useType: def.button.useType,
                useDelay: def.button.useDelay,
                useDir: def.button.useDir
            };
        }
    }

    damage(amount: number, sourceType: string, _damageType: number): void {
        const def = MapObjectDefs[this.type] as ObstacleDef;
        if (this.health === 0 || !this.destructible) return;

        const sourceDef = GameObjectDefs[sourceType] as {
            armorPiercing?: boolean
            stonePiercing?: boolean
        };

        if (def.armorPlated && !sourceDef.armorPiercing) return;
        if (def.stonePlated && !sourceDef.stonePiercing) return;

        this.health -= amount;

        if (this.health <= 0) {
            this.health = this.healthT = 0;
            this.dead = true;
            this.setDirty();

            if (def.destroyType) {
                this.game.map.genObstacle(def.destroyType, this.pos, this.layer, this.ori);
            }

            const lootPos = v2.copy(this.pos);
            if (def.lootSpawn) {
                v2.set(lootPos, v2.add(this.pos, v2.rotate(def.lootSpawn.offset, this.rot)));
            }

            for (const lootTierOrItem of def.loot) {
                if ("tier" in lootTierOrItem) {
                    const count = util.randomInt(lootTierOrItem.min, lootTierOrItem.max);

                    for (let i = 0; i < count; i++) {
                        const items = getLootTable(this.game.config.mode, lootTierOrItem.tier);

                        for (const item of items) {
                            this.game.addLoot(item.name, lootPos, this.layer, item.count);
                        }
                    }
                } else {
                    this.game.addLoot(lootTierOrItem.type, lootPos, this.layer, lootTierOrItem.count);
                }
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

    interact(player?: Player): void {
        if (this.dead) return;
        if (this.isDoor &&
            this.door.canUse &&
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            (player?.isOnOtherSide(this) || !(this.door.openOneWay === true))) {
            this.door.seq++;
            if (this.door.openOnce) {
                this.door.canUse = false;
            }
            this.setDirty();
            setTimeout(() => {
                this.toggleDoor(player);
            }, this.door.openDelay * 1000, this);
        }
        if (this.isButton && this.button.canUse) {
            this.useButton();
        }
    }

    useButton(): void {
        this.button.onOff = !this.button.onOff;
        this.button.seq++;

        if (this.button.useOnce) {
            this.button.canUse = false;
        }

        const parentBuilding = this.game.grid.getById(this.parentBuildingId ?? -1) as Building | undefined;
        if (this.button.useType && parentBuilding) {
            for (const obj of (parentBuilding).childObjects) {
                if (obj instanceof Obstacle && obj.type === this.button.useType) {
                    setTimeout(() => {
                        obj.toggleDoor(undefined, this.button.useDir);
                    }, this.button.useDelay * 1000);
                }
            }
        }
        if (this.button.onOff && this.isPuzzlePiece) {
            parentBuilding?.puzzlePieceToggled(this);
        }
        this.setDirty();
    }

    toggleDoor(player?: Player, useDir?: Vec2): void {
        this.door.open = !this.door.open;
        const def = MapObjectDefs[this.type] as ObstacleDef;

        if (!this.door.slideToOpen) {
            if (this.door.open) {
                if ((player?.isOnOtherSide(this) && !this.door.openOneWay) ??
                    useDir?.x === 1) {
                    this.ori = this.door.openAltOri;
                } else {
                    this.ori = this.door.openOri;
                }
            } else {
                this.ori = this.door.closedOri;
                this.collider = collider.transform(
                    def.collision,
                    this.pos,
                    math.oriToRad(this.ori),
                    this.scale
                );
            }
        } else {
            if (this.door.open) {
                this.pos = v2.add(
                    this.pos,
                    v2.rotate(
                        v2.create(0, -this.door.slideOffset), this.rot)
                );
            } else {
                this.pos = this.door.closedPosition;
            }
        }
        this.rot = math.oriToRad(this.ori);
        this.collider = collider.transform(
            def.collision,
            this.pos,
            this.rot,
            this.scale
        );

        this.bounds = collider.transform(def.collision, v2.create(0, 0), this.rot, 1);
        this.game.grid.updateObject(this);
        this.setDirty();
    }
}

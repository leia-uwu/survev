import { MapObjectDefs } from "../defs/mapObjectDefs";
import { type StructureDef, type BuildingDef } from "../defs/mapObjectsTyping";
import { Puzzles } from "../defs/puzzles";
import { type Game } from "../game";
import { type ObjectsFullData, type ObjectsPartialData } from "../net/objectSerialization";
import { type Collider } from "../utils/coldet";
import { collider } from "../utils/collider";
import { mapHelpers } from "../utils/mapHelpers";
import { math } from "../utils/math";
import { v2, type Vec2 } from "../utils/v2";
import { type Decal } from "./decal";
import { GameObject, ObjectType } from "./gameObject";
import { Obstacle } from "./obstacle";
import { type Structure } from "./structure";

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
    puzzleOrder: string = "";
    puzzleResetTimeout?: NodeJS.Timeout;

    scale = 1;

    childObjects: Array<Obstacle | Building | Structure | Decal> = [];
    parentStructure?: Structure;

    constructor(
        game: Game,
        type: string,
        pos: Vec2,
        ori: number,
        layer: number,
        parentStructure?: Structure
    ) {
        super(game, pos);
        this.layer = layer;
        this.ori = ori;
        this.type = type;
        this.parentStructure = parentStructure;
        const def = MapObjectDefs[this.type] as BuildingDef;

        const rotation = math.oriToRad(ori);

        this.bounds = collider.transform(
            mapHelpers.getBoundingCollider(type),
            v2.create(0, 0),
            rotation,
            1
        );

        this.mapObstacleBounds = mapHelpers.getColliders(type).map(coll => {
            return collider.transform(coll, pos, rotation, 1);
        });

        if (def.puzzle) {
            this.hasPuzzle = true;
        }
    }

    puzzlePieceToggled(piece: Obstacle): void {
        if (this.puzzleResetTimeout) clearTimeout(this.puzzleResetTimeout);

        if (this.puzzleOrder.length) this.puzzleOrder += ",";
        this.puzzleOrder += piece.puzzlePiece;

        const puzzleDef = (MapObjectDefs[this.type] as BuildingDef).puzzle!;
        const puzzleOrder = Puzzles[puzzleDef.name];

        if (this.puzzleOrder === puzzleOrder) {
            for (const obj of this.childObjects) {
                if (obj instanceof Obstacle && obj.type === puzzleDef.completeUseType) {
                    setTimeout(() => {
                        obj.toggleDoor();
                    }, puzzleDef.completeUseDelay * 1000);
                }
            }
            this.puzzleSolved = true;
            if (this.parentStructure) {
                const def = MapObjectDefs[this.parentStructure.type] as StructureDef;
                if (def.interiorSound?.puzzle === puzzleDef.name) {
                    this.parentStructure.interiorSoundAlt = true;
                    this.parentStructure.setDirty();
                }
            }
            setTimeout(this.resetPuzzle.bind(this), puzzleDef.completeOffDelay * 1000);
            this.setPartDirty();
        } else if (this.puzzleOrder.length >= puzzleOrder.length) {
            this.puzzleErrSeq++;
            this.setPartDirty();
            this.puzzleResetTimeout = setTimeout(this.resetPuzzle.bind(this), puzzleDef.errorResetDelay * 1000);
        } else {
            this.puzzleResetTimeout = setTimeout(() => {
                this.puzzleErrSeq++;
                this.setPartDirty();
                setTimeout(this.resetPuzzle.bind(this), puzzleDef.errorResetDelay * 1000, this);
            }, puzzleDef.pieceResetDelay * 1000);
        }
    }

    resetPuzzle(): void {
        this.puzzleOrder = "";
        for (const piece of this.childObjects) {
            if (piece instanceof Obstacle && piece.isButton) {
                piece.button.canUse = !this.puzzleSolved;
                piece.button.onOff = false;
                piece.button.seq++;
                piece.setDirty();
            }
        }
        this.setPartDirty();
    }
}

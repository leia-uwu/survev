import { type GameObject } from "../objects/gameObject";
import { coldet, type Collider } from "../../../shared/utils/coldet";
import { collider } from "../../../shared/utils/collider";
import { math } from "../../../shared/utils/math";
import { type Vec2, v2 } from "../../../shared/utils/v2";

/**
 * A Grid to filter collision detection of game objects
 */
export class Grid {
    readonly width: number;
    readonly height: number;
    readonly cellSize = 16;

    //                        X     Y     Object ID
    //                      __^__ __^__     ___^__
    private readonly _grid: Array<Array<Map<number, GameObject>>>;

    // store the cells each game object is occupying
    // so removing the object from the grid is faster
    private readonly _objectsCells = new Map<number, Vec2[]>();

    constructor(width: number, height: number) {
        this.width = Math.floor(width / this.cellSize);
        this.height = Math.floor(height / this.cellSize);

        this._grid = Array.from(
            { length: this.width + 1 },
            () => Array.from({ length: this.height + 1 }, () => new Map())
        );
    }

    addObject(obj: GameObject): void {
        this.updateObject(obj);
    }

    /**
     * Add an object to the grid system
     */
    updateObject(obj: GameObject): void {
        this.remove(obj);

        const cells: Vec2[] = [];

        const aabb = collider.toAabb(obj.bounds);
        // Get the bounds of the hitbox
        // Round it to the grid cells
        const min = this._roundToCells(v2.add(aabb.min, obj.pos));
        const max = this._roundToCells(v2.add(aabb.max, obj.pos));

        // Add it to all grid cells that it intersects
        for (let x = min.x; x <= max.x; x++) {
            const xRow = this._grid[x];
            for (let y = min.y; y <= max.y; y++) {
                xRow[y].set(obj.__id, obj);
                cells.push(v2.create(x, y));
            }
        }
        // Store the cells this object is occupying
        this._objectsCells.set(obj.__id, cells);
    }

    /**
     * Remove an object from the grid system
     */
    remove(obj: GameObject): void {
        const cells = this._objectsCells.get(obj.__id);
        if (!cells) return;

        for (const cell of cells) {
            this._grid[cell.x][cell.y].delete(obj.__id);
        }
        this._objectsCells.delete(obj.__id);
    }

    /**
     * Get all objects near this collider
     * This transforms the collider into a rectangle
     * and gets all objects intersecting it after rounding it to grid cells
     * @param coll The collider
     * @return A set with the objects near this collider
     */
    intersectCollider(coll: Collider): GameObject[] {
        const aabb = collider.toAabb(coll);

        const min = this._roundToCells(aabb.min);
        const max = this._roundToCells(aabb.max);

        const objects = new Set<GameObject>();

        for (let x = min.x; x <= max.x; x++) {
            const xRow = this._grid[x];
            for (let y = min.y; y <= max.y; y++) {
                const objectsMap = xRow[y];
                for (const object of objectsMap.values()) {
                    objects.add(object);
                }
            }
        }

        return [...objects];
    }

    intersectPos(pos: Vec2) {
        pos = this._roundToCells(pos);
        return [...this._grid[pos.x][pos.y].values()];
    }

    // TODO: optimize this
    intersectLineSegment(a: Vec2, b: Vec2): GameObject[] {
        return this.intersectCollider(coldet.lineSegmentToAabb(a, b));
    }

    /**
     * Rounds a position to this grid cells
     */
    private _roundToCells(vector: Vec2): Vec2 {
        return {
            x: math.clamp(Math.floor(vector.x / this.cellSize), 0, this.width),
            y: math.clamp(Math.floor(vector.y / this.cellSize), 0, this.height)
        };
    }
}

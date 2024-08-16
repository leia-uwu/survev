import { type AABB, type Collider, coldet } from "../../../shared/utils/coldet";
import { collider } from "../../../shared/utils/collider";
import { math } from "../../../shared/utils/math";
import { type Vec2, v2 } from "../../../shared/utils/v2";

interface GameObject {
    __gridCells: Vec2[];
    bounds: AABB;
    pos: Vec2;
}

/**
 * A Grid to filter collision detection of game objects
 */
export class Grid<T extends GameObject = GameObject> {
    readonly width: number;
    readonly height: number;
    readonly cellSize = 16;

    //                        X     Y     Object
    //                      __^__ __^__   __^__
    private readonly _grid: Array<Array<Set<T>>>;

    constructor(width: number, height: number) {
        this.width = Math.floor(width / this.cellSize);
        this.height = Math.floor(height / this.cellSize);

        this._grid = Array.from({ length: this.width + 1 }, () =>
            Array.from({ length: this.height + 1 }, () => new Set()),
        );
    }

    addObject(obj: T): void {
        this.updateObject(obj);
    }

    /**
     * Add an object to the grid system
     */
    updateObject(obj: T): void {
        this.remove(obj);

        const cells = obj.__gridCells;

        const aabb = obj.bounds;
        // Get the bounds of the hitbox
        // Round it to the grid cells
        const min = this._roundToCells(v2.add(aabb.min, obj.pos));
        const max = this._roundToCells(v2.add(aabb.max, obj.pos));

        // Add it to all grid cells that it intersects
        for (let x = min.x; x <= max.x; x++) {
            const xRow = this._grid[x];
            for (let y = min.y; y <= max.y; y++) {
                xRow[y].add(obj);
                cells.push(v2.create(x, y));
            }
        }
    }

    /**
     * Remove an object from the grid system
     */
    remove(obj: T): void {
        const cells = obj.__gridCells;

        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            this._grid[cell.x][cell.y].delete(obj);
        }
        cells.length = 0;
    }

    /**
     * Get all objects near this collider
     * This transforms the collider into a rectangle
     * and gets all objects intersecting it after rounding it to grid cells
     * @param coll The collider
     * @return An array with the objects near this collider
     */
    intersectCollider(coll: Collider): T[] {
        return [...this.intersectColliderSet(coll)];
    }

    /**
     * Get all objects near this collider
     * This transforms the collider into a rectangle
     * and gets all objects intersecting it after rounding it to grid cells
     * @param coll The collider
     * @return A set with the objects near this collider
     */
    intersectColliderSet(coll: Collider): Set<T> {
        const aabb = collider.toAabb(coll);

        const min = this._roundToCells(aabb.min);
        const max = this._roundToCells(aabb.max);

        const objects = new Set<T>();

        for (let x = min.x; x <= max.x; x++) {
            const xRow = this._grid[x];
            for (let y = min.y; y <= max.y; y++) {
                const cell = xRow[y];
                for (const object of cell) {
                    objects.add(object);
                }
            }
        }

        return objects;
    }

    intersectPos(pos: Vec2) {
        pos = this._roundToCells(pos);
        return [...this._grid[pos.x][pos.y]];
    }

    // TODO: optimize this
    intersectLineSegment(a: Vec2, b: Vec2): T[] {
        return this.intersectCollider(coldet.lineSegmentToAabb(a, b));
    }

    /**
     * Rounds a position to this grid cells
     */
    private _roundToCells(vector: Vec2): Vec2 {
        return {
            x: math.clamp(Math.floor(vector.x / this.cellSize), 0, this.width),
            y: math.clamp(Math.floor(vector.y / this.cellSize), 0, this.height),
        };
    }
}

import type { AABB, Collider } from "../../../shared/utils/coldet";
import { collider } from "../../../shared/utils/collider";
import { math } from "../../../shared/utils/math";
import { type Vec2, v2 } from "../../../shared/utils/v2";

interface GameObject {
    __gridCells: Vec2[];
    __gridQueryId: number;
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

    private nextQueryId = 0;

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
        const aabb = collider.toAabb(coll);

        const min = this._roundToCells(aabb.min);
        const max = this._roundToCells(aabb.max);

        const objects: T[] = [];

        const queryId = this.nextQueryId++;

        for (let x = min.x; x <= max.x; x++) {
            const xRow = this._grid[x];
            for (let y = min.y; y <= max.y; y++) {
                const cell = xRow[y];
                for (const object of cell) {
                    if (object.__gridQueryId === queryId) continue;
                    object.__gridQueryId = queryId;
                    objects.push(object);
                }
            }
        }

        return objects;
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

    intersectLineSegment(a: Vec2, b: Vec2): T[] {
        // Bresenham's line algorithm for finding only cells that intersect the line

        const start = this._roundToCells(a);
        const end = this._roundToCells(b);

        const diff = v2.sub(b, a);

        const gridDeltaX = end.x > start.x ? 1 : -1;
        const gridDeltaY = end.y > start.y ? 1 : -1;

        const deltaX =
            Math.abs(diff.x) > 0.00001
                ? (gridDeltaX * this.cellSize) / diff.x
                : Number.MAX_VALUE;
        const deltaY =
            Math.abs(diff.y) > 0.00001
                ? (gridDeltaY * this.cellSize) / diff.y
                : Number.MAX_VALUE;

        const relativeX = math.mod(a.x / this.cellSize, 1);
        const relativeY = math.mod(a.y / this.cellSize, 1);

        let x = deltaX * (gridDeltaX > 0 ? 1 - relativeX : relativeX);
        let y = deltaY * (gridDeltaY > 0 ? 1 - relativeY : relativeY);

        const objects: T[] = [];
        const queryId = this.nextQueryId++;

        while (true) {
            const cell = this._grid[start.x][start.y];

            for (const object of cell) {
                if (object.__gridQueryId === queryId) continue;

                object.__gridQueryId = queryId;
                objects.push(object);
            }
            if (start.x == end.x && start.y == end.y) {
                break;
            }
            if (x < y) {
                x += deltaX;
                start.x += gridDeltaX;
                if (start.x < 0 || start.x > this.width) {
                    break;
                }
            } else {
                y += deltaY;
                start.y += gridDeltaY;
                if (start.y < 0 || start.y > this.height) {
                    break;
                }
            }
        }

        return objects;
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

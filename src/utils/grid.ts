import { type GameObject } from "../objects/gameObject";
import { type Collider } from "./coldet";
import { collider } from "./collider";
import { math } from "./math";
import { type Vec2, v2 } from "./v2";

/**
 * A Grid to filter collision detection of game objects
 */
export class Grid {
    readonly width: number;
    readonly height: number;
    readonly cellSize = 32;

    //                        X     Y     Object ID
    //                      __^__ __^__     ___^__
    private readonly _grid: Array<Array<Map<number, GameObject>>>;

    // store the cells each game object is occupying
    // so removing the object from the grid is faster
    private readonly _objectsCells = new Map<number, Vec2[]>();

    constructor(width: number, height: number) {
        this.width = Math.floor(width / this.cellSize);
        this.height = Math.floor(height / this.cellSize);

        // fill the grid X row with arrays for the Y column
        // maps are created on demand to save memory usage
        this._grid = Array.from({ length: this.width + 1 }, () => []);
    }

    /**
     * Add an object to the grid system
     */
    addObject(obj: GameObject): void {
        this.removeObject(obj);

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
                (xRow[y] ??= new Map()).set(obj.id, obj);
                cells.push(v2.create(x, y));
            }
        }
        // Store the cells this object is occupying
        this._objectsCells.set(obj.id, cells);
    }

    /**
     * Remove an object from the grid system
     */
    removeObject(object: GameObject): void {
        const cells = this._objectsCells.get(object.id);
        if (!cells) return;

        for (const cell of cells) {
            this._grid[cell.x][cell.y].delete(object.id);
        }
        this._objectsCells.delete(object.id);
    }

    /**
     * Get all objects near this hitbox
     * This transforms the hitbox into a rectangle
     * and gets all objects intersecting it after rounding it to grid cells
     * @param hitbox The hitbox
     * @return A set with the objects near this hitbox
     */
    intersectCollider(hitbox: Collider): Set<GameObject> {
        const rect = collider.toAabb(hitbox);

        const min = this._roundToCells(rect.min);
        const max = this._roundToCells(rect.max);

        const objects = new Set<GameObject>();

        for (let x = min.x; x <= max.x; x++) {
            const xRow = this._grid[x];
            for (let y = min.y; y <= max.y; y++) {
                const objectsMap = xRow[y];
                if (!objectsMap) continue;

                for (const object of objectsMap.values()) {
                    objects.add(object);
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
            y: math.clamp(Math.floor(vector.y / this.cellSize), 0, this.height)
        };
    }
}

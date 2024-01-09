import { ObjectType, type GameObject } from "../objects/gameObject";
import { coldet, type Collider } from "./coldet";
import { collider } from "./collider";
import { math } from "./math";
import { type Vec2, v2 } from "./v2";

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

    private readonly objects = new Map<number, GameObject>();

    readonly categories: Record<ObjectType, Set<GameObject>> = {
        [ObjectType.Invalid]: new Set(),
        [ObjectType.Player]: new Set(),
        [ObjectType.Obstacle]: new Set(),
        [ObjectType.Loot]: new Set(),
        [ObjectType.LootSpawner]: new Set(),
        [ObjectType.DeadBody]: new Set(),
        [ObjectType.Building]: new Set(),
        [ObjectType.Structure]: new Set(),
        [ObjectType.Decal]: new Set(),
        [ObjectType.Projectile]: new Set(),
        [ObjectType.Smoke]: new Set(),
        [ObjectType.Airdrop]: new Set()
    };

    constructor(width: number, height: number) {
        this.width = Math.floor(width / this.cellSize);
        this.height = Math.floor(height / this.cellSize);

        this._grid = Array.from(
            { length: this.width + 1 },
            () => Array.from({ length: this.height + 1 }, () => new Map())
        );
    }

    getById(id: number) {
        return this.objects.get(id);
    }

    addObject(obj: GameObject): void {
        this.objects.set(obj.id, obj);
        this.categories[obj.__type].add(obj);
        this.updateObject(obj);
    }

    /**
     * Add an object to the grid system
     */
    updateObject(obj: GameObject): void {
        this.removeFromGrid(obj);

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
                xRow[y].set(obj.id, obj);
                cells.push(v2.create(x, y));
            }
        }
        // Store the cells this object is occupying
        this._objectsCells.set(obj.id, cells);
    }

    remove(obj: GameObject): void {
        this.objects.delete(obj.id);
        this.removeFromGrid(obj);
        this.categories[obj.__type].delete(obj);
    }

    /**
     * Remove an object from the grid system
     */
    removeFromGrid(obj: GameObject): void {
        const cells = this._objectsCells.get(obj.id);
        if (!cells) return;

        for (const cell of cells) {
            this._grid[cell.x][cell.y].delete(obj.id);
        }
        this._objectsCells.delete(obj.id);
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

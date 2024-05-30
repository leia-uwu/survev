import { Collider } from "../../shared/utils/coldet";
import { collider } from "../../shared/utils/collider";
import { Vec2, v2 } from "../../shared/utils/v2";

enum Shapes {
    Line,
    Ray,
    Circle,
    Aabb
};

class DebugLines {
    shapes: ({
        color: number;
        fill: number;
    } & ({
        type: Shapes.Line;
        start: Vec2;
        end: Vec2;
    } | {
        type: Shapes.Ray;
        pos: Vec2;
        dir: Vec2;
        len: number;
    } | {
        type: Shapes.Circle,
        pos: Vec2,
        rad: number,
    } | {
        type: Shapes.Aabb,
        min: Vec2,
        max: Vec2,
    }))[] = [];

    constructor() {
    }

    addLine(start: Vec2, end: Vec2, color: number, fillOpacity: number) {
        this.shapes.push({
            type: Shapes.Line,
            start: v2.copy(start),
            end: v2.copy(end),
            color: color,
            fill: fillOpacity
        });
    }

    addRay(pos: Vec2, dir: Vec2, len: number, color: number, fillOpacity: number) {
        this.shapes.push({
            type: Shapes.Ray,
            pos: v2.copy(pos),
            dir: v2.copy(dir),
            len: len,
            color: color,
            fill: fillOpacity
        });
    }

    addCircle(pos: Vec2, rad: number, color: number, fillOpacity: number) {
        this.shapes.push({
            type: Shapes.Circle,
            pos: v2.copy(pos),
            rad: rad,
            color: color,
            fill: fillOpacity
        });
    }

    addAabb(min: Vec2, max: Vec2, color: number, fillOpacity: number) {
        this.shapes.push({
            type: Shapes.Aabb,
            min: v2.copy(min),
            max: v2.copy(max),
            color: color,
            fill: fillOpacity
        });
    }

    addCollider(col: Collider, color: number, fill: number) {
        if (col.type == collider.Type.Aabb) {
            this.addAabb(col.min, col.max, color, fill);
        } else {
            this.addCircle(col.pos, col.rad, color, fill);
        }
    }

    render(e: unknown, t: unknown) {
    }

    flush() {
        this.shapes = [];
    }
}

export const debugLines = new DebugLines();

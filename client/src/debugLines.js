import { collider } from "../../shared/utils/collider";
import { v2 } from "../../shared/utils/v2";

const n = {
    Line: 0,
    Ray: 1,
    Circle: 2,
    Aabb: 3
};
class DebugLines {
    constructor() {
        this.shapes = [];
    }

    addLine(e, t, r, a) {
        this.shapes.push({
            type: n.Line,
            start: v2.copy(e),
            end: v2.copy(t),
            color: r,
            fill: a
        });
    }

    addRay(e, t, r, a, i) {
        this.shapes.push({
            type: n.Ray,
            pos: v2.copy(e),
            dir: v2.copy(t),
            len: r,
            color: a,
            fill: i
        });
    }

    addCircle(e, t, r, a) {
        this.shapes.push({
            type: n.Circle,
            pos: v2.copy(e),
            rad: t,
            color: r,
            fill: a
        });
    }

    addAabb(e, t, r, a) {
        this.shapes.push({
            type: n.Aabb,
            min: v2.copy(e),
            max: v2.copy(t),
            color: r,
            fill: a
        });
    }

    addCollider(e, t, r) {
        if (e.type == collider.Type.Aabb) {
            this.addAabb(e.min, e.max, t, r);
        } else {
            this.addCircle(e.pos, e.rad, t, r);
        }
    }

    render(e, t) {
    }

    flush() {
        this.shapes = [];
    }
}

const debugLines = new DebugLines();
export default debugLines;

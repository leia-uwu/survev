import { coldet } from "../../../shared/utils/coldet";
import { collider } from "../../../shared/utils/collider";
import { math } from "../../../shared/utils/math";
import { util } from "../../../shared/utils/util";
import { type Vec2, v2 } from "../../../shared/utils/v2";
import type { Gas } from "./objects/gas";

export const SpawnRules = {
    fixed(pos: Vec2) {
        return v2.copy(pos);
    },
    random(width: number, height: number, inset: number, gas: Gas) {
        if (gas.circleIdx >= 1) {
            return coldet.clampPosToAabb(
                v2.add(gas.posNew, util.randomPointInCircle(gas.radNew)),
                collider.createAabbExtents(v2.create(0, 0), v2.create(width, height)),
            );
        }
        return {
            x: util.random(inset, width - inset),
            y: util.random(inset, height - inset),
        };
    },
    radius(center: Vec2, radius: number) {
        return v2.add(center, util.randomPointInCircle(radius));
    },
    ring(center: Vec2, radius: number) {
        return v2.add(center, util.randomPointOnCircle(radius));
    },
    donut(center: Vec2, _innerRadius: number, outerRadius: number, points: Vec2[]) {
        if (points.length == 0) {
            return SpawnRules.ring(center, outerRadius);
        }

        const pointsSum: Vec2 = points.reduce(
            (a, b) => {
                a.x += b.x;
                a.y += b.y;
                return a;
            },
            v2.create(0, 0),
        );

        const mean = v2.div(pointsSum, points.length);
        let normalizedMean = v2.normalize(mean);

        if (math.eqAbs(mean.x, 0, 0.01) || math.eqAbs(mean.y, 0, 0.01)) {
            console.log("EDGE");
        }
        let pos;
        pos = v2.create(normalizedMean.x * -outerRadius, normalizedMean.y * -outerRadius);
        const variance = 20;
        const varianceValue = util.random(-variance, variance);
        pos = v2.rotate(pos, math.deg2rad(varianceValue));

        pos = v2.add(pos, center);
        return pos;
    },
};

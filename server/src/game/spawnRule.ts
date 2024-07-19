import { math } from "../../../shared/utils/math";
import { util } from "../../../shared/utils/util";
import { type Vec2, v2 } from "../../../shared/utils/v2";

export enum SpawnRule {
    Random,
    Ring,
    Radius,
    Fixed,
    Donut
}

interface SpawnRuleMap {
    [SpawnRule.Fixed]: (pos: Vec2) => Vec2;
    [SpawnRule.Random]: (width: number, height: number, inset: number) => Vec2;
    [SpawnRule.Radius]: (center: Vec2, radius: number) => Vec2;
    [SpawnRule.Ring]: (center: Vec2, radius: number) => Vec2;
    [SpawnRule.Donut]: (
        center: Vec2,
        innerRadius: number,
        outerRadius: number,
        points: Vec2[]
    ) => Vec2;
}

const spawnRuleToPosMap: Map<SpawnRule, SpawnRuleMap[SpawnRule]> = new Map();

spawnRuleToPosMap.set(SpawnRule.Fixed, (pos: Vec2) => {
    return v2.copy(pos);
});

spawnRuleToPosMap.set(
    SpawnRule.Random,
    (width: number, height: number, inset: number) => {
        return {
            x: util.random(inset, width - inset),
            y: util.random(inset, height - inset)
        };
    }
);

spawnRuleToPosMap.set(SpawnRule.Radius, (center: Vec2, radius: number) => {
    return v2.add(center, util.randomPointInCircle(radius));
});

spawnRuleToPosMap.set(SpawnRule.Ring, (center: Vec2, radius: number) => {
    return v2.add(center, util.randomPointOnCircle(radius));
});

spawnRuleToPosMap.set(
    SpawnRule.Donut,
    (center: Vec2, _innerRadius: number, outerRadius: number, points: Vec2[]) => {
        if (points.length == 0) {
            return getSpawnRuleFunc(SpawnRule.Ring)(center, outerRadius);
        }

        const pointsSum: Vec2 = points.reduce(
            (a, b) => {
                a.x += b.x;
                a.y += b.y;
                return a;
            },
            v2.create(0, 0)
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
    }
);

export function getSpawnRuleFunc<R extends SpawnRule>(rule: R) {
    return spawnRuleToPosMap.get(rule) as SpawnRuleMap[R];
}

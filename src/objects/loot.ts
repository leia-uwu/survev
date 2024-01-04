import { GameObjectDefs } from "../defs/gameObjectDefs";
import { ModeDefinitions } from "../defs/modes/modes";
import { type Game } from "../game";
import { type ObjectsFullData, type ObjectsPartialData } from "../net/objectSerialization";
import { collider } from "../utils/collider";
import { util } from "../utils/util";
import { v2, type Vec2 } from "../utils/v2";
import { GameObject, ObjectType } from "./gameObject";

type FullLoot = ObjectsFullData[ObjectType.Loot];
type PartialLoot = ObjectsPartialData[ObjectType.Loot];

export class Loot extends GameObject implements FullLoot, PartialLoot {
    bounds = collider.createCircle(v2.create(0.0, 0.0), 3.0);

    override __type = ObjectType.Loot;

    isPreloadedGun = false;
    ownerId = 0;
    isOld = false;

    layer: number;
    type: string;
    count: number;

    constructor(game: Game, type: string, pos: Vec2, layer: number, count: number) {
        super(game, pos);

        const def = GameObjectDefs[type];
        if (!def) {
            throw new Error(`Invalid loot with type ${type}`);
        }

        this.layer = layer;
        this.type = type;
        this.count = count;
    }
}

export function getLootTable(modeName: string, tier: string): Array<{ name: string, count: number }> {
    const lootTable = ModeDefinitions[modeName].lootTable[tier];
    const items: Array<{ name: string, count: number }> = [];

    if (!lootTable) {
        console.warn(`Unknown loot tier with type ${tier}`);
        return [];
    }

    const weights: number[] = [];

    const weightedItems: Array<{ name: string, count: number }> = [];
    for (const item of lootTable) {
        weightedItems.push({
            name: item.name,
            count: item.count
        });
        weights.push(item.weight);
    }

    const item = util.weightedRandom(weightedItems, weights);

    if (item.name.startsWith("tier_")) {
        items.push(...getLootTable(modeName, item.name));
    } else if (item.name) {
        items.push(item);
    }

    return items;
}

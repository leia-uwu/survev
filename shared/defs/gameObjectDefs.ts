import { BulletDefs } from "./gameObjects/bulletDefs";
import { CrosshairDefs } from "./gameObjects/crosshairDefs";
import { EmotesDefs } from "./gameObjects/emoteDefs";
import { ExplosionDefs } from "./gameObjects/explosionsDefs";
import { GearDefs } from "./gameObjects/gearDefs";
import { GunDefs } from "./gameObjects/gunDefs";
import { HealEffectDefs } from "./gameObjects/healEffectDefs";
import { MeleeDefs } from "./gameObjects/meleeDefs";
import { OutfitDefs } from "./gameObjects/outfitDefs";
import { PassDefs } from "./gameObjects/passDefs";
import { PerkDefs } from "./gameObjects/perkDefs";
import { PingDefs } from "./gameObjects/pingDefs";
import { QuestDefs } from "./gameObjects/questDefs";
import { RoleDefs } from "./gameObjects/roleDefs";
import { ThrowableDefs } from "./gameObjects/throwableDefs";
import { UnlockDefs } from "./gameObjects/unlockDefs";
import { XPDefs } from "./gameObjects/xpDefs";
import { type GameObjectDef } from "./objectsTypings";

const ObjectDefsList: Array<Record<string, unknown>> = [
    BulletDefs,
    CrosshairDefs,
    HealEffectDefs,
    EmotesDefs,
    ExplosionDefs,
    GearDefs,
    GunDefs,
    MeleeDefs,
    OutfitDefs,
    QuestDefs,
    PerkDefs,
    PassDefs,
    PingDefs,
    RoleDefs,
    ThrowableDefs,
    UnlockDefs,
    XPDefs
];

export const GameObjectDefs: Record<string, GameObjectDef> = {};

// Merge all item defs in together into one object
for (let i = 0; i < ObjectDefsList.length; i++) {
    const gameObjectDefs = ObjectDefsList[i];
    const objectTypes = Object.keys(gameObjectDefs);
    for (let j = 0; j < objectTypes.length; j++) {
        const objectType = objectTypes[j];
        if (GameObjectDefs[objectType] !== undefined) {
            throw new Error(`GameObject ${objectType} is already defined`);
        }
        GameObjectDefs[objectType] = gameObjectDefs[objectType] as GameObjectDef;
    }
}

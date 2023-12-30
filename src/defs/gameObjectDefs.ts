import { BulletDefs } from "./bulletDefs";
import { CrosshairDefs } from "./crosshairDefs";
import { EmotesDefs } from "./emoteDefs";
import { ExplosionDefs } from "./explosionsDefs";
import { GearDefs } from "./gearDefs";
import { GunDefs } from "./gunDefs";
import { HealEffectDefs } from "./healEffectDefs";
import { MeleeDefs } from "./meleeDefs";
import { OutfitDefs } from "./outfitDefs";
import { PassDefs } from "./passDefs";
import { PerkDefs } from "./perkDefs";
import { PingDefs } from "./pingDefs";
import { QuestDefs } from "./questDefs";
import { RoleDefs } from "./roleDefs";
import { ThrowableDefs } from "./throwableDefs";
import { UnlockDefs } from "./unlockDefs";
import { XPDefs } from "./xpDefs";

// !!! DON'T REORDER THIS OR ANY OTHER DEFINITION OR IT WILL DESYNC WITH THE CLIENT
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

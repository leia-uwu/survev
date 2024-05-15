import { type BulletDef } from "./gameObjects/bulletDefs";
import { type EmoteDef } from "./gameObjects/emoteDefs";
import { type ExplosionDef } from "./gameObjects/explosionsDefs";
import { type AmmoDef, type BackpackDef, type BoostDef, type ChestDef, type HealDef, type HelmetDef, type ScopeDef } from "./gameObjects/gearDefs";
import { type GunDef } from "./gameObjects/gunDefs";
import { type MeleeDef } from "./gameObjects/meleeDefs";
import { type OutfitDef } from "./gameObjects/outfitDefs";
import { type PerkDef } from "./gameObjects/perkDefs";
import { type PingDef } from "./gameObjects/pingDefs";
import { type RoleDef } from "./gameObjects/roleDefs";
import { type ThrowableDef } from "./gameObjects/throwableDefs";
import { type XPDef } from "./gameObjects/xpDefs";

export {
    type BulletDef,
    type EmoteDef,
    type ExplosionDef,
    type AmmoDef,
    type HealDef,
    type BoostDef,
    type BackpackDef,
    type HelmetDef,
    type ChestDef,
    type ScopeDef,
    type GunDef,
    type MeleeDef,
    type OutfitDef,
    type PerkDef,
    type PingDef,
    type RoleDef,
    type ThrowableDef,
    type XPDef
};

export type GameObjectDef = BulletDef |
EmoteDef |
ExplosionDef |
AmmoDef |
HealDef |
BoostDef |
BackpackDef |
HelmetDef |
ChestDef |
ScopeDef |
GunDef |
MeleeDef |
OutfitDef |
PerkDef |
PingDef |
RoleDef |
ThrowableDef |
XPDef;

export type LootDef = AmmoDef |
HealDef |
BoostDef |
BackpackDef |
HelmetDef |
ChestDef |
ScopeDef |
GunDef |
MeleeDef |
OutfitDef |
PerkDef |
ThrowableDef |
XPDef;

import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";
import type { GunDef } from "../../../shared/defs/gameObjects/gunDefs";
import { WeaponSlot } from "../../../shared/gameConfig";
import { ObjectType } from "../../../shared/net/objectSerializeFns";
import { math } from "../../../shared/utils/math";
import { Emote } from "../game/objects/player";
import { GamePlugin } from "../game/pluginManager";

export default class DeathMatchPlugin extends GamePlugin {
    protected override initListeners(): void {
        this.on("gameCreated", (_data) => {});

        this.on("playerJoin", (data) => {
            data.scope = "4xscope";
            data.boost = 100;
            data.weaponManager.setCurWeapIndex(WeaponSlot.Primary);
        });

        this.on("playerKill", (data) => {
            this.game.playerBarn.emotes.push(
                new Emote(0, data.player.pos, "ping_death", true)
            );

            // clear inventory to prevent loot from dropping;
            data.player.inventory = {};
            data.player.backpack = "backpack00";
            data.player.scope = "1xscope";
            data.player.helmet = "";
            data.player.chest = "";

            data.player.weaponManager.setCurWeapIndex(WeaponSlot.Melee);

            {
                const primary = data.player.weapons[WeaponSlot.Primary];
                primary.type = "";
                primary.ammo = 0;
                primary.cooldown = 0;

                const secondary = data.player.weapons[WeaponSlot.Secondary];
                secondary.type = "";
                secondary.ammo = 0;
                secondary.cooldown = 0;
            }

            // give the killer health and gun ammo and inventory ammo
            if (data.source?.__type === ObjectType.Player) {
                const killer = data.source;
                killer.health += 20;
                killer.boost += 25;

                function calculateAmmoToGive(
                    currAmmo: number,
                    maxClip: number,
                    amount = 50
                ) {
                    const percentage = (maxClip * amount) / 100;
                    return math.clamp(currAmmo + percentage, 0, maxClip);
                }

                const primary = {
                    ...killer.weapons[WeaponSlot.Primary]
                };

                if (primary.type != "") {
                    const primaryGunDef = GameObjectDefs[primary.type] as GunDef;
                    killer.weapons[WeaponSlot.Primary] = {
                        ...primary,
                        ammo: calculateAmmoToGive(primary.ammo, primaryGunDef.maxClip)
                    };
                }

                const secondary = {
                    ...killer.weapons[WeaponSlot.Secondary]
                };

                if (secondary.type != "") {
                    const secondaryGunDef = GameObjectDefs[secondary.type] as GunDef;

                    killer.weapons[WeaponSlot.Secondary] = {
                        ...secondary,
                        ammo: calculateAmmoToGive(secondary.ammo, secondaryGunDef.maxClip)
                    };
                }
            }
        });
    }
}

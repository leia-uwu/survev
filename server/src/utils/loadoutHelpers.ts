import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";
import { UnlockDefs } from "../../../shared/defs/gameObjects/unlockDefs";
import { GameConfig } from "../../../shared/gameConfig";
import type { JoinMsg } from "../../../shared/net/joinMsg";
import type { Loadout } from "../../../shared/utils/loadout";
import { Config } from "../config";
import type { Player } from "../game/objects/player";

const loadoutSecret = Config.encryptLoadoutSecret!;

// very crude, not sure what the original used..
export function encryptLoadout(loadout: Loadout) {
    return btoa(JSON.stringify(loadout) + loadoutSecret);
}
function decryptLoadout(encodedLoadout: string): Loadout | undefined {
    [];
    try {
        const decoded = atob(encodedLoadout);
        const loadoutStr = decoded.slice(0, -loadoutSecret.length);
        const extractedSecret = decoded.slice(-loadoutSecret.length);

        if (extractedSecret === loadoutSecret) return JSON.parse(loadoutStr) as Loadout;
    } catch (err) {
        console.log(err);
    }
}

export function setLoadout(joinMsg: JoinMsg, player: Player) {
    const decryptedLoadout = decryptLoadout(joinMsg.loadoutPriv);
    const processedLoadout = decryptedLoadout ? decryptedLoadout : joinMsg.loadout;

    const defaultItems = player.game.playerBarn.defaultItems;

    /**
     * Checks if an item is present in the player's loadout
     */
    const isItemInLoadout = (item: string, category: string) => {
        if (!decryptedLoadout && !UnlockDefs.unlock_default.unlocks.includes(item))
            return false;

        const def = GameObjectDefs[item];
        if (!def || def.type !== category) return false;

        return true;
    };

    if (
        isItemInLoadout(processedLoadout.outfit, "outfit") &&
        processedLoadout.outfit !== "outfitBase"
    ) {
        player.setOutfit(processedLoadout.outfit);
    } else {
        player.setOutfit(defaultItems.outfit);
    }

    if (
        isItemInLoadout(processedLoadout.melee, "melee") &&
        processedLoadout.melee != "fists"
    ) {
        player.weapons[GameConfig.WeaponSlot.Melee].type = processedLoadout.melee;
    }

    if (isItemInLoadout(processedLoadout.heal, "heal")) {
        player.loadout.heal = processedLoadout.heal;
    }
    if (isItemInLoadout(processedLoadout.boost, "boost")) {
        player.loadout.boost = processedLoadout.boost;
    }

    const emotes = processedLoadout.emotes;
    for (let i = 0; i < emotes.length; i++) {
        const emote = emotes[i];
        if (i > GameConfig.EmoteSlot.Count) break;

        if (emote === "" || !isItemInLoadout(emote, "emote")) {
            continue;
        }

        player.loadout.emotes[i] = emote;
    }
}

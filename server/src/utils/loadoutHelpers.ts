import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";
import { UnlockDefs } from "../../../shared/defs/gameObjects/unlockDefs";
import { GameConfig } from "../../../shared/gameConfig";
import type { JoinMsg } from "../../../shared/net/joinMsg";
import { type Loadout, validateLoadout } from "../../../shared/utils/helpers";
import { Config } from "../config";
import type { Player } from "../game/objects/player";

export function encryptLoadout(loadout: Loadout) {
    const secret = Config.encryptLoadoutSecret!;
    return btoa(JSON.stringify(loadout) + secret);
}

function decryptLoadout(encodedLoadout: string): Loadout {
    const secret = Config.encryptLoadoutSecret!;
    try {
        const decoded = atob(encodedLoadout);
        const loadoutStr = decoded.slice(0, -secret.length);
        const extractedSecret = decoded.slice(-secret.length);

        if (extractedSecret !== secret) {
            return validateLoadout({} as Loadout);
        }

        return validateLoadout(JSON.parse(loadoutStr));
    } catch (_err) {
        return validateLoadout({} as Loadout);
    }
}

export function setLoadout(joinMsg: JoinMsg, player: Player) {
    let processedLoadout = joinMsg.loadout;

    if (Config.encryptLoadoutSecret && joinMsg.loadoutPriv) {
        const loadout = decryptLoadout(joinMsg.loadoutPriv);
        processedLoadout = loadout;
    }

    const defaultItems = GameConfig.player.defaultItems;

    /**
     * Checks if an item is present in the player's loadout
     */
    const isItemInLoadout = (item: string, category: string) => {
        if (Config.encryptLoadoutSecret) return true;
        if (!UnlockDefs.unlock_default.unlocks.includes(item)) return false;

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

    const loadout = player.loadout;

    if (isItemInLoadout(processedLoadout.heal, "heal")) {
        loadout.heal = processedLoadout.heal;
    }
    if (isItemInLoadout(processedLoadout.boost, "boost")) {
        loadout.boost = processedLoadout.boost;
    }

    const emotes = processedLoadout.emotes;
    for (let i = 0; i < emotes.length; i++) {
        const emote = emotes[i];
        if (i > GameConfig.EmoteSlot.Count) break;

        if (emote === "" || !isItemInLoadout(emote, "emote")) {
            continue;
        }

        loadout.emotes[i] = emote;
    }
}

import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";
import type { UnlockDefs } from "../../../shared/defs/gameObjects/unlockDefs";
import { GameConfig } from "../../../shared/gameConfig";
import type { Crosshair } from "../crosshair";
import { deepEqual } from "../lib/deepEqual";

export interface Loadout {
    player_icon: string;
    outfit: string;
    heal: string;
    boost: string;
    melee: string;
    emotes: string[];
    crosshair: Crosshair;
}

export enum ItemStatus {
    New,
    Confirmed,
    Ackd,
}

const loadout = {
    ItemStatus,
    validate: function (userLoadout: Loadout) {
        const getGameType = function (
            type: string,
            gameType: string,
            defaultValue: string,
        ) {
            const def = GameObjectDefs[gameType];
            if (def && def.type == type) {
                return gameType;
            }
            return defaultValue;
        };
        const getFloat = function (flt: string, defaultValue: number) {
            const val = parseFloat(flt);
            if (Number.isNaN(val)) {
                return defaultValue;
            }
            return val;
        };
        const mergedLoadout = {
            ...{
                crosshair: {
                    type: "",
                    color: 0xffffff,
                    size: 1,
                    stroke: 0,
                },
                emotes: [],
            },
            ...userLoadout,
        } as Loadout;
        const validatedLoadout: Loadout = {
            outfit: getGameType("outfit", mergedLoadout.outfit, "outfitBase"),
            melee: getGameType("melee", mergedLoadout.melee, "fists"),
            heal: getGameType("heal_effect", mergedLoadout.heal, "heal_basic"),
            boost: getGameType("boost_effect", mergedLoadout.boost, "boost_basic"),
            player_icon: getGameType("emote", mergedLoadout.player_icon, ""),
            crosshair: {
                type: getGameType(
                    "crosshair",
                    mergedLoadout.crosshair.type,
                    "crosshair_default",
                ),
                color:
                    parseInt(mergedLoadout.crosshair.color as unknown as string) ||
                    0xffffff,
                size: getFloat(
                    mergedLoadout.crosshair.size as unknown as string,
                    1,
                ).toFixed(2) as unknown as number,
                stroke: getFloat(
                    mergedLoadout.crosshair.stroke as unknown as string,
                    0,
                ).toFixed(2) as unknown as number,
            },
            emotes: [] as string[],
        };

        const defaultEmotes = GameConfig.defaultEmoteLoadout.slice();
        for (let i = 0; i < GameConfig.EmoteSlot.Count; i++) {
            const inputEmote =
                i < mergedLoadout.emotes.length ? mergedLoadout.emotes[i] : "";
            validatedLoadout.emotes.push(
                getGameType("emote", inputEmote, defaultEmotes[i]),
            );
        }
        return validatedLoadout;
    },
    /* not used
    validateWithAvailableItems: function(userLoadout, userItems) {
        const checkTypeExists = function(type, items) {
            if (
                type &&
                items.findIndex((x) => {
                    return x.type == type;
                }) !== -1
            ) {
                return type;
            }
            return "";
        };
        const loadout = {
            crosshair: {},
            emotes: [],
            ...userLoadout
        };
        const itemsToCheck = ["outfit", "melee", "heal", "boost", "player_icon"];

        itemsToCheck.forEach(item => {
            loadout[item] = checkTypeExists(loadout[item], userItems);
        });

        loadout.crosshair.type = checkTypeExists(loadout.crosshair.type, userItems);

        loadout.emotes = loadout.emotes.map(emote => checkTypeExists(loadout.emotes[emote], userItems));

        return loadout.validate(loadout);
    },
    */
    defaultLoadout: function () {
        return loadout.validate({} as Loadout);
    },
    modified: function (a: Loadout, b: Loadout) {
        return !deepEqual(a, b);
    },
    getUserAvailableItems: function (heroItems: unknown[]) {
        const items = [];
        // Add default items
        const unlockDefaultDef =
            GameObjectDefs.unlock_default as unknown as (typeof UnlockDefs)["unlock_default"];
        for (let i = 0; i < unlockDefaultDef.unlocks.length; i++) {
            const unlock = unlockDefaultDef.unlocks[i];
            items.push({
                type: unlock,
                source: "unlock_default",
                timeAcquired: 0,
                ackd: loadout.ItemStatus.Ackd,
            });
        }
        for (let i = 0; i < heroItems.length; i++) {
            items.push(heroItems[i]);
        }
        return items;
    },
};
export default loadout;

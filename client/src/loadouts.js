import { GameObjectDefs } from "../../shared/defs/gameObjectDefs";
import { GameConfig } from "../../shared/gameConfig";
import deepEqual from "../../shared/utils/deepEqual";

const loadout = {
    ItemStatus: {
        New: 0,
        Confirmed: 1,
        Ackd: 2
    },
    validate: function(userLoadout) {
        const getGameType = function(type, gameType, defaultValue) {
            const def = GameObjectDefs[gameType];
            if (def && def.type == type) {
                return gameType;
            }
            return defaultValue;
        };
        const getFloat = function(flt, defaultValue) {
            const val = parseFloat(flt);
            if (Number.isNaN(val)) {
                return defaultValue;
            }
            return val;
        };
        const mergedLoadout = {
            crosshair: {
                type: "",
                color: 16777215,
                size: 1,
                stroke: 0
            },
            emotes: [],
            ...userLoadout
        };
        const validatedLoadout = {
            outfit: getGameType("outfit", mergedLoadout.outfit, "outfitBase"),
            melee: getGameType("melee", mergedLoadout.melee, "fists"),
            heal: getGameType("heal_effect", mergedLoadout.heal, "heal_basic"),
            boost: getGameType("boost_effect", mergedLoadout.boost, "boost_basic"),
            player_icon: getGameType("emote", mergedLoadout.player_icon, ""),
            crosshair: {
                type: getGameType("crosshair", mergedLoadout.crosshair.type, "crosshair_default"),
                color: (parseInt(mergedLoadout.crosshair.color) || 16777215),
                size: getFloat(mergedLoadout.crosshair.size, 1).toFixed(2),
                stroke: getFloat(mergedLoadout.crosshair.stroke, 0).toFixed(2)
            }
        };

        const defaultEmotes = GameConfig.defaultEmoteLoadout.slice();
        validatedLoadout.emotes = Array.from({ length: GameConfig.EmoteSlot.Count }, (_, index) => {
            const inputEmote = index < mergedLoadout.emotes.length ? mergedLoadout.emotes[index] : "";
            return getGameType("emote", inputEmote, defaultEmotes[index]);
        });
        return validatedLoadout;
    },
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
    defaultLoadout: function() {
        return loadout.validate({});
    },
    modified: function(a, b) {
        return !deepEqual(a, b);
    },
    getUserAvailableItems: function(heroItems) {
        const items = [];
        // Add default items
        const unlockDefaultDef = GameObjectDefs.unlock_default;
        for (
            let a = 0;
            a < unlockDefaultDef.unlocks.length;
            a++
        ) {
            const unlock = unlockDefaultDef.unlocks[a];
            items.push({
                type: unlock,
                source: "unlock_default",
                timeAcquired: 0,
                ackd: loadout.ItemStatus.Ackd
            });
        }
        for (let i = 0; i < heroItems.length; i++) {
            items.push(heroItems[i]);
        }
        return items;
    }
};
export default loadout;

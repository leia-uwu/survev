import { GameObjectDefs } from "../../shared/defs/gameObjectDefs";
import { GameConfig } from "../../shared/gameConfig";
import deepEqual from "../../shared/utils/deepEqual";

const loadout = {
    ItemStatus: {
        New: 0,
        Confirmed: 1,
        Ackd: 2
    },
    validate: function(e) {
        const t = function(e, t, r) {
            const a = GameObjectDefs[t];
            if (a && a.type == e) {
                return t;
            } else {
                return r;
            }
        };
        const r = function(e, t) {
            const r = parseFloat(e);
            if (Number.isNaN(r)) {
                return t;
            } else {
                return r;
            }
        };
        const i = Object.assign(
            {},
            {
                crosshair: {
                    type: "",
                    color: 16777215,
                    size: 1,
                    stroke: 0
                },
                emotes: []
            },
            e
        );
        const s = {};
        s.outfit = t("outfit", i.outfit, "outfitBase");
        s.melee = t("melee", i.melee, "fists");
        s.heal = t("heal_effect", i.heal, "heal_basic");
        s.boost = t("boost_effect", i.boost, "boost_basic");
        s.player_icon = t("emote", i.player_icon, "");
        s.crosshair = {
            type: t(
                "crosshair",
                i.crosshair.type,
                "crosshair_default"
            ),
            color: (function(e, t) {
                const r = parseInt(e);
                if (Number.isNaN(r)) {
                    return 16777215;
                } else {
                    return r;
                }
            })(i.crosshair.color),
            size: r(i.crosshair.size, 1).toFixed(2),
            stroke: r(i.crosshair.stroke, 0).toFixed(2)
        };
        s.emotes = [];
        for (
            let n = GameConfig.defaultEmoteLoadout.slice(), l = 0;
            l < GameConfig.EmoteSlot.Count;
            l++
        ) {
            const c = l < i.emotes.length ? i.emotes[l] : "";
            const m = t("emote", c, n[l]);
            s.emotes.push(m);
        }
        return s;
    },
    validateWithAvailableItems: function(e, t) {
        const r = function(e, t) {
            if (
                e &&
                t.findIndex((t) => {
                    return t.type == e;
                }) !== -1
            ) {
                return e;
            } else {
                return "";
            }
        };
        const a = Object.assign(
            {},
            {
                crosshair: {},
                emotes: []
            },
            e
        );
        a.outfit = r(a.outfit, t);
        a.melee = r(a.melee, t);
        a.heal = r(a.heal, t);
        a.boost = r(a.boost, t);
        a.player_icon = r(a.player_icon, t);
        a.crosshair.type = r(a.crosshair.type, t);
        for (let i = 0; i < a.emotes.length; i++) {
            a.emotes[i] = r(a.emotes[i], t);
        }
        return loadout.validate(a);
    },
    defaultLoadout: function() {
        return loadout.validate({});
    },
    modified: function(e, t) {
        return !deepEqual(e, t);
    },
    getUserAvailableItems: function(e) {
        const t = [];
        for (
            let r = GameObjectDefs.unlock_default, a = 0;
            a < r.unlocks.length;
            a++
        ) {
            const i = r.unlocks[a];
            t.push({
                type: i,
                source: "unlock_default",
                timeAcquired: 0,
                ackd: loadout.ItemStatus.Ackd
            });
        }
        for (let n = 0; n < e.length; n++) {
            t.push(e[n]);
        }
        return t;
    }
};
export default loadout;

import { PassDefs } from "../../../shared/defs/gameObjects/passDefs";

export const passUtil = {
    getPassMaxLevel: function() {
        return 99;
    },
    getPassLevelXp: function(e, t) {
        const r = PassDefs[e];
        const i = t - 1;
        if (i < r.xp.length) {
            return r.xp[i];
        } else {
            return r.xp[r.xp.length - 1];
        }
    },
    getPassLevelAndXp: function(e, t) {
        let r = t;
        let a = 1;
        for (;a < 99;) {
            const o = passUtil.getPassLevelXp(e, a);
            if (r < o) {
                break;
            }
            r -= o;
            a++;
        }
        return {
            level: a,
            xp: r,
            nextLevelXp: passUtil.getPassLevelXp(e, a)
        };
    },
    timeUntilQuestRefresh: function(e) {
        return (
            Math.floor((e - 25200000 + 86400000 - 1) / 86400000) *
            86400000 +
            25200000 -
            Date.now()
        );
    }
};

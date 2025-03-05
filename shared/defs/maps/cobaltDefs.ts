import { util } from "../../utils/util";
import { v2 } from "../../utils/v2";
import { Main, type PartialMapDef } from "./baseDefs";

const mapDef: PartialMapDef = {
    mapId: 7,
    desc: {
        name: "Cobalt",
        icon: "img/gui/cobalt.svg",
        buttonCss: "btn-mode-cobalt",
    },
    assets: {
        audio: [
            { name: "spawn_01", channel: "ui" },
            { name: "ping_unlock_01", channel: "ui" },
            { name: "ambient_lab_01", channel: "ambient" },
            { name: "log_13", channel: "sfx" },
            { name: "log_14", channel: "sfx" },
        ],
        atlases: ["gradient", "loadout", "shared", "cobalt"],
    },
    biome: {
        colors: {
            background: 134680,
            water: 13681,
            beach: 6834230,
            riverbank: 4472122,
            grass: 5069416,
            underground: 1772803,
            playerSubmerge: 1192009,
            playerGhillie: 4937830,
        },
        particles: {},
    },
    /* STRIP_FROM_PROD_CLIENT:START */
    mapGen: {
        customSpawnRules: {
            locationSpawns: [
                {
                    type: "bunker_structure_09",
                    pos: v2.create(0.5, 0.5),
                    rad: 100,
                    retryOnFailure: true,
                },
            ],
        },
    },
    /* STRIP_FROM_PROD_CLIENT:END */
    gameMode: {
        maxPlayers: 80,
        perkMode: true,
        perkModeRoles: ["scout", "sniper", "healer", "demo", "assault", "tank"],
    },
};

export const Cobalt = util.mergeDeep({}, Main, mapDef);

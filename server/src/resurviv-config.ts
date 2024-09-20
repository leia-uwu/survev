import { GameConfig } from "../../shared/gameConfig";
import type { ConfigType, DeepPartial } from "./config";

const BACKPACK_LEVEL = 3;

// change this to the region of the server
export const THIS_REGION: "na" | "as" | "eu" | "local" = "local";

const serverDataConfig = {
    local: {},
    na: {
        gameServer: {
            apiServerUrl: "http://resurviv.biz",
        },
        regions: {
            na: {
                https: false,
                address: "resurviv.biz:8001",
                l10n: "index-north-america",
            },
            eu: {
                https: false,
                address: "217.160.224.171:8001",
                l10n: "index-europe",
            },
            as: {
                https: false,
                address: "172.105.112.218:8001",
                l10n: "index-asia",
            },
        },
        thisRegion: "na",
    },
    eu: {
        gameServer: {
            apiServerUrl: "http://217.160.224.171",
        },
        regions: {
            eu: {
                https: false,
                address: "217.160.224.171:8001",
                l10n: "index-europe",
            },
        },
        thisRegion: "eu",
    },
    as: {
        gameServer: {
            apiServerUrl: "http://172.105.112.218",
        },
        regions: {
            as: {
                https: false,
                address: "172.105.112.218:8001",
                l10n: "index-asia",
            },
        },
        thisRegion: "as",
    },
};

export const CustomConfig: DeepPartial<ConfigType> = {
    ...serverDataConfig[THIS_REGION],
    modes: [
        {
            mapName: "main",
            teamMode: 1,
            enabled: false,
        },
        {
            mapName: "main",
            teamMode: 2,
            enabled: true,
        },
        {
            mapName: "main",
            teamMode: 4,
            enabled: false,
        },
    ],
    gameConfig: {
        disableKnocking: true,
        disableGroupSpectate: true,
        gas: {
            customZoneTime: 40,
            initWaitTime: 7 * 60,
            damageTickRate: 1,
            damage: [35],
            widthDecay: 0.3,
            gasTimeDecay: 5,
        },
        gun: {
            customSwitchDelay: 0.2 as any,
        },
        player: {
            baseSwitchDelay: 0.05,
            defaultItems: {
                backpack: "backpack03",
                helmet: "helmet03",
                chest: "chest03",
                scope: "4xscope",
                perks: [
                    {
                        type: "endless_ammo",
                        droppable: false,
                    },
                    {
                        type: "takedown",
                        droppable: false,
                    },
                ],

                inventory: {
                    frag: 3,
                    smoke: 1,
                    mirv: 1,
                    bandage: GameConfig.bagSizes["bandage"][BACKPACK_LEVEL],
                    healthkit: GameConfig.bagSizes["healthkit"][BACKPACK_LEVEL],
                    soda: GameConfig.bagSizes["soda"][BACKPACK_LEVEL],
                    painkiller: GameConfig.bagSizes["painkiller"][BACKPACK_LEVEL],
                    "1xscope": 1,
                    "2xscope": 1,
                    "4xscope": 1,
                },
            },
        },
    },
};

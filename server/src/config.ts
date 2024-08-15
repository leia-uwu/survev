import path from "path";
import type { MapDefs } from "../../shared/defs/mapDefs";
import { GameConfig } from "../../shared/gameConfig";
import { util } from "../../shared/utils/util";

export enum TeamMode {
    Solo = 1,
    Duo = 2,
    Squad = 4
}

/**
 * Default server config
 */
export const Config = {
    devServer: {
        host: "127.0.0.1",
        port: 8001
    },

    apiServer: {
        host: "0.0.0.0",
        port: 8000
    },

    gameServer: {
        host: "0.0.0.0",
        port: 8001,
        apiServerUrl: "http://127.0.0.1:8000"
    },

    apiKey: "Kongregate Sucks",

    modes: [
        { mapName: "main", teamMode: TeamMode.Solo, enabled: true },
        { mapName: "main", teamMode: TeamMode.Duo, enabled: true },
        { mapName: "main", teamMode: TeamMode.Squad, enabled: true }
    ],

    regions: {},

    thisRegion: "local",

    gameTps: 100,
    netSyncTps: 33,

    perfLogging: {
        enabled: true,
        time: 10
    },

    gameConfig: {}
} satisfies ConfigType as ConfigType;

const runningOnVite = !process.argv.some((a) => a.includes("vite"));
const isProduction = process.env["NODE_ENV"] === "production" && !runningOnVite;

const configPath = path.join(
    __dirname,
    isProduction ? "../../" : "",
    "../../resurviv-config.json"
);

util.mergeDeep(Config, {
    // gameServer: {
    //     apiServerUrl: "http://resurviv.biz",
    // },
    // regions: {
    //     na: {
    //         https: false,
    //         address: "resurviv.biz:8001",
    //         l10n: "index-north-america"
    //     }
    // },
    // thisRegion: "na",
    modes: [
        {
            mapName: "main",
            teamMode: 1,
            enabled: false
        },
        {
            mapName: "main",
            teamMode: 2,
            enabled: true
        },
        {
            mapName: "main",
            teamMode: 4,
            enabled: false
        }
    ],
    gameConfig: {
        gas: {
            initWaitTime: 300,
            damageTickRate: 1,
            damage: [35],
            widthDecay: 0.3,
            gasTimeDecay: 5
        },
        gun: {
            customSwitchDelay: 0.2 as any
        },
        player: {
            baseSwitchDelay: 0.1,
            defaultItems: {
                backpack: "backpack03",
                helmet: "helmet03",
                chest: "chest03",
                scope: "4xscope",
                perks: [
                    {
                        type: "endless_ammo",
                        droppable: false
                    },
                    {
                        type: "inspiration",
                        droppable: false
                    },
                    {
                        type: "takedown",
                        droppable: false
                    }
                ],
                inventory: {
                    frag: 3,
                    smoke: 1,
                    mirv: 1,
                    bandage: 15,
                    healthkit: 2,
                    soda: 4,
                    painkiller: 1,
                    "1xscope": 1,
                    "2xscope": 1,
                    "4xscope": 1
                }
            }
        }
    }
} satisfies DeepPartial<ConfigType>);

// if (fs.existsSync(configPath)) {
//     const localConfig = JSON.parse(fs.readFileSync(configPath).toString());
//     util.mergeDeep(Config, localConfig);
// } else {
//     console.log("Config file doesn't exist... creating");
//     fs.writeFileSync(configPath, JSON.stringify({}, null, 2));
// }

util.mergeDeep(GameConfig, Config.gameConfig);

type DeepPartial<T> = T extends object
    ? {
        [P in keyof T]?: DeepPartial<T[P]>;
    }
    : T;

interface ServerConfig {
    readonly host: string;
    readonly port: number;

    /**
     * HTTPS/SSL options. Not used if running locally or with nginx.
     */
    readonly ssl?: {
        readonly keyFile: string;
        readonly certFile: string;
    };
}
export interface ConfigType {
    readonly devServer: ServerConfig;

    readonly apiServer: ServerConfig;
    readonly gameServer: ServerConfig & {
        readonly apiServerUrl: string;
    };
    /**
     * API key used for game server and API server to communicate
     */
    readonly apiKey: string;

    readonly regions: Record<
        string,
        {
            readonly https: boolean;
            readonly address: string;
            readonly l10n: string;
        }
    >;

    readonly thisRegion: string;

    readonly modes: Array<{
        readonly mapName: keyof typeof MapDefs;
        readonly teamMode: TeamMode;
        readonly enabled: boolean;
    }>;

    /**
     * Server tick rate
     */
    readonly gameTps: number;
    readonly netSyncTps: number;

    /**
     * Server logging
     */
    readonly perfLogging: {
        readonly enabled: boolean;
        /**
         * Seconds between each game performance log
         */
        readonly time: number;
    };

    /**
     * Game config overrides
     * @NOTE don't modify values used by client since this only applies to server
     */
    readonly gameConfig: DeepPartial<typeof GameConfig>;
}

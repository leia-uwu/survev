import type { MapDefs } from "../../shared/defs/mapDefs";
import { GameConfig } from "../../shared/gameConfig";
import { util } from "../../shared/utils/util";
import { CustomConfig } from "./resurviv-config";

export enum TeamMode {
    Solo = 1,
    Duo = 2,
    Squad = 4,
}

/**
 * Default server config
 */
export const Config = {
    devServer: {
        host: "127.0.0.1",
        port: 8001,
    },

    apiServer: {
        host: "0.0.0.0",
        port: 8000,
    },

    gameServer: {
        host: "0.0.0.0",
        port: 8001,
        apiServerUrl: "http://127.0.0.1:8000",
    },

    apiKey: "Kongregate Sucks",

    modes: [
        { mapName: "main", teamMode: TeamMode.Solo, enabled: true },
        { mapName: "main", teamMode: TeamMode.Duo, enabled: true },
        { mapName: "main", teamMode: TeamMode.Squad, enabled: true },
    ],

    regions: {},

    thisRegion: "local",

    gameTps: 100,
    netSyncTps: 33,

    perfLogging: {
        enabled: true,
        time: 10,
    },

    gameConfig: {},
} satisfies ConfigType as ConfigType;

util.mergeDeep(Config, CustomConfig);
util.mergeDeep(GameConfig, Config.gameConfig);

export type DeepPartial<T> = T extends object
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

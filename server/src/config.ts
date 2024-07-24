import fs from "fs";
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
    host: "0.0.0.0",
    port: 8000,

    modes: [
        { mapName: "main", teamMode: TeamMode.Solo, enabled: true },
        { mapName: "main", teamMode: TeamMode.Duo, enabled: true },
        { mapName: "main", teamMode: TeamMode.Squad, enabled: true }
    ],

    regions: {
        local: {
            https: false,
            address: "127.0.0.1:3000"
        }
    },

    defaultRegion: "local",

    gameTps: 100,
    netSyncTps: 33,

    perfLogging: {
        enabled: true,
        time: 10
    },

    gameConfig: {}
} satisfies ConfigType as ConfigType;

const configPath = path.join(
    __dirname,
    process.env["NODE_ENV"] === "production" ? "../../" : "",
    "../../resurviv-config.json"
);

if (fs.existsSync(configPath)) {
    const localConfig = JSON.parse(fs.readFileSync(configPath).toString());
    util.mergeDeep(Config, localConfig);
} else {
    console.log("Config file doesn't exist... creating");
    fs.writeFileSync(configPath, JSON.stringify(Config, null, 2));
}

util.mergeDeep(GameConfig, Config.gameConfig);

type DeepPartial<T> = T extends object
    ? {
          [P in keyof T]?: DeepPartial<T[P]>;
      }
    : T;
export interface ConfigType {
    readonly host: string;
    readonly port: number;

    /**
     * HTTPS/SSL options. Not used if running locally or with nginx.
     */
    readonly ssl?: {
        readonly keyFile: string;
        readonly certFile: string;
    };

    readonly regions: Record<
        string,
        {
            readonly https: boolean;
            readonly address: string;
        }
    >;

    readonly defaultRegion: string;

    readonly modes: Array<{
        mapName: keyof typeof MapDefs;
        teamMode: TeamMode;
        enabled: boolean;
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
        enabled: boolean;
        /**
         * Seconds between each game performance log
         */
        time: number;
    };

    /**
     * Game config overrides
     * @NOTE don't modify values used by client since this only applies to server
     */
    gameConfig: DeepPartial<typeof GameConfig>;
}

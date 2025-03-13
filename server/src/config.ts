import fs from "fs";
import path from "path";
import type { MapDefs } from "../../shared/defs/mapDefs";
import { GameConfig, TeamMode } from "../../shared/gameConfig";
import { util } from "../../shared/utils/util";
import type { Vec2 } from "../../shared/utils/v2";

const isProduction = process.env["NODE_ENV"] === "production";

// !! TODO: update this
export type Region = "eu" | "na" | "as" | "kr" | "sa";

// WARNING: THIS IS THE DEFAULT CONFIG
// YOU SHOULD MODIFY survev-config.json FILE INSTEAD FOR LOCAL CHANGES
// TO AVOID MERGE CONFLICTS AND PUSHING IT TO GIT

/**
 * Default config
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

    BASE_URL: "https://survev.io",

    /*
      a random string, should be private.
    */
    encryptLoadoutSecret: "IiRH2yg42jyp24qAAdLB6",

    // OAUTH PROVIDERS
    DISCORD_CLIENT_ID: "",
    DISCORD_SECRET_ID: "",

    GOOGLE_CLIENT_ID: "",
    GOOGLE_SECRET_ID: "",

    modes: [
        { mapName: "main", teamMode: TeamMode.Solo, enabled: true },
        { mapName: "main", teamMode: TeamMode.Duo, enabled: true },
        { mapName: "main", teamMode: TeamMode.Squad, enabled: true },
    ],

    regions: {},

    debug: {
        spawnMode: "default",
        allowBots: !isProduction,
        allowEditMsg: !isProduction,
    },

    accountsEnabled: true,

    cachingEnabled: false,

    rateLimitsEnabled: isProduction,

    client: {
        AIP_ID: undefined,
        AIP_PLACEMENT_ID: undefined,
        theme: "main",
    },

    thisRegion: "local",

    gameTps: 100,
    netSyncTps: 33,

    processMode: isProduction ? "multi" : "single",

    perfLogging: {
        enabled: true,
        time: 10,
    },

    defaultItems: {},
    gameConfig: {},
} satisfies ConfigType as ConfigType;

if (!isProduction) {
    util.mergeDeep(Config, {
        regions: {
            local: {
                https: false,
                address: `${Config.devServer.host}:${Config.devServer.port}`,
                l10n: "index-local",
            },
        },
    });
}

const runningOnVite = process.argv.toString().includes("vite");

const configPath = path.join(
    __dirname,
    isProduction && !runningOnVite ? "../../" : "",
    "../../",
);

function loadConfig(fileName: string, create?: boolean) {
    const path = `${configPath}${fileName}`;

    let loaded = false;
    if (fs.existsSync(path)) {
        const localConfig = JSON.parse(fs.readFileSync(path).toString());
        util.mergeDeep(Config, localConfig);
        loaded = true;
    } else if (create) {
        console.log("Config file doesn't exist... creating");
        fs.writeFileSync(path, JSON.stringify({}, null, 2));
    }

    util.mergeDeep(GameConfig, Config.gameConfig);
    return loaded;
}

// try loading old config file first for backwards compatibility
if (!loadConfig("resurviv-config.json")) {
    loadConfig("survev-config.json", true);
}

type DeepPartial<T> = T extends object
    ? {
          [P in keyof T]?: DeepPartial<T[P]>;
      }
    : T;

interface ServerConfig {
    host: string;
    port: number;
    proxyIPHeader?: string;

    /**
     * HTTPS/SSL options. Not used if running locally or with nginx.
     */
    ssl?: {
        keyFile: string;
        certFile: string;
    };
}

export interface ConfigType {
    devServer: ServerConfig;
    apiServer: ServerConfig;
    gameServer: ServerConfig & {
        apiServerUrl: string;
    };
    /**
     * API key used for game server and API server to communicate
     */
    apiKey: string;

    encryptLoadoutSecret?: string;

    /*
      used for auth redirects in production
      should be the hosted website url ex: https://survev.io
    */
    BASE_URL: string;

    // ##### DISCORD OAUTH
    DISCORD_CLIENT_ID?: string;
    DISCORD_SECRET_ID?: string;

    // ##### GOOGLE OAUTH #####
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_SECRET_ID?: string;

    /**
     * used to hide/disable account-related features in both client and server.
     */
    readonly accountsEnabled: boolean;

    regions: Record<
        string,
        {
            https: boolean;
            address: string;
            l10n: string;
        }
    >;

    thisRegion: Region | "local";

    modes: Array<{
        mapName: keyof typeof MapDefs;
        teamMode: TeamMode;
        enabled: boolean;
    }>;

    /**
     * Server tick rate
     */
    gameTps: number;
    netSyncTps: number;

    /**
     * If games should all run in the same process
     * Or spawn a new process for each game
     * Defaults to single in development and multi in production
     */
    processMode: "single" | "multi";

    /**
     * Server logging
     */
    perfLogging: {
        enabled: boolean;
        /**
         * Seconds between each game performance log
         */
        time: number;
    };

    cachingEnabled: boolean;

    rateLimitsEnabled: boolean;

    client: {
        // adin play IDs
        AIP_ID: string | undefined;
        AIP_PLACEMENT_ID: string | undefined;
        theme: "main" | "easter" | "halloween" | "faction" | "snow" | "spring";
    };

    debug: {
        spawnMode: "default" | "fixed";
        // spawn pos for fixed, defaults to map center if not set
        spawnPos?: Vec2;
        allowBots: boolean;
        allowEditMsg: boolean;
    };

    // overrides for default items; doesn't apply to bots
    defaultItems: DeepPartial<(typeof GameConfig)["player"]["defaultItems"]>;

    /**
     * Game config overrides
     * @NOTE don't modify values used by client since this only applies to server
     */
    gameConfig: DeepPartial<typeof GameConfig>;
}

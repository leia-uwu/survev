import type { MapDefs } from "../../shared/defs/mapDefs";
import type { Game } from "./game/game";
import type { GamePlugin } from "./game/pluginManager";

export enum TeamMode {
    Solo = 1,
    Duo = 2,
    Squad = 4
}

export const Config = {
    host: "0.0.0.0",
    port: 8000,

    modes: [
        { mapName: "main", teamMode: TeamMode.Solo, enabled: true },
        { mapName: "main", teamMode: TeamMode.Duo, enabled: true },
        { mapName: "main", teamMode: TeamMode.Squad, enabled: true }
    ],

    plugins: [],

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
    }
} satisfies ConfigType as ConfigType;

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

    readonly plugins: Array<new (game: Game) => GamePlugin>;

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
}

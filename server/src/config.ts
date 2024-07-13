import type { MapDefs } from "../../shared/defs/mapDefs";
import type { Vec2 } from "../../shared/utils/v2";
import type { Game } from "./game/game";
import type { GamePlugin } from "./game/pluginManager";

export enum SpawnMode {
    Random,
    Radius,
    Fixed,
    Center
}

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
        { mapName: "turkey", teamMode: TeamMode.Duo, enabled: true },
        { mapName: "woods_snow", teamMode: TeamMode.Squad, enabled: true }
    ],

    plugins: [],

    regions: {
        local: {
            https: false,
            address: "127.0.0.1:3000"
        }
    },

    defaultRegion: "local",

    spawn: { mode: SpawnMode.Random },

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
     * There are 5 spawn modes: Random, Radius, Fixed, and Center.
     * SpawnMode.Random spawns the player at a random location.
     * SpawnMode.Fixed always spawns the player at the exact position given.
     * SpawnMode.Center always spawns the player in the center of the map.
     */
    readonly spawn:
        | {
              readonly mode: SpawnMode.Random;
          }
        | {
              readonly mode: SpawnMode.Fixed;
              readonly pos: Vec2;
          }
        | {
              readonly mode: SpawnMode.Center;
          };

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

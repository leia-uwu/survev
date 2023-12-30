import { type Vec2 } from "./utils/v2";

export enum SpawnMode {
    Random,
    Radius,
    Fixed,
    Center
}
export enum GasMode {
    Normal,
    Debug,
    Disabled
}

export const Config = {
    host: "0.0.0.0",
    port: 8000,
    https: false,

    mode: "main",

    regions: {
        local: {
            https: false,
            address: "127.0.0.1:3000"
        }
    },

    defaultRegion: "local",

    spawn: { mode: SpawnMode.Random },

    maxPlayersPerGame: 80,
    maxGames: 1,
    preventJoinAfter: 60000,

    gas: { mode: GasMode.Normal },

    movementSpeed: 12,
    tps: 30

} satisfies ConfigType as ConfigType;

export interface ConfigType {
    readonly host: string
    readonly port: number
    readonly https: boolean
    /**
     * HTTPS/SSL options. Not used if running locally or with nginx.
     */
    readonly ssl?: {
        readonly keyFile: string
        readonly certFile: string
    }

    readonly regions: Record<string, {
        readonly https: boolean
        readonly address: string
    }>

    readonly defaultRegion: string

    readonly mode: string

    /**
     * There are 5 spawn modes: Random, Radius, Fixed, and Center.
     * SpawnMode.Random spawns the player at a random location.
     * SpawnMode.Radius spawns the player at a random location within the circle with the given position and radius.
     * SpawnMode.Fixed always spawns the player at the exact position given.
     * SpawnMode.Center always spawns the player in the center of the map.
     */
    readonly spawn: {
        readonly mode: SpawnMode.Random
    } | {
        readonly mode: SpawnMode.Radius
        readonly position: Vec2
        readonly radius: number
    } | {
        readonly mode: SpawnMode.Fixed
        readonly position: Vec2
    } | {
        readonly mode: SpawnMode.Center
    }

    /**
     * The maximum number of players allowed to join a game.
     */
    readonly maxPlayersPerGame: number

    /**
     * The maximum number of concurrent games.
     */
    readonly maxGames: number

    /**
     * The number of milliseconds after which players are prevented from joining a game.
     */
    readonly preventJoinAfter: number

    /**
     * There are 3 gas modes: GasMode.Normal, GasMode.Debug, and GasMode.Disabled.
     * GasMode.Normal: Default gas behavior. overrideDuration is ignored.
     * GasMode.Debug: The duration of each stage is always the duration specified by overrideDuration.
     * GasMode.Disabled: Gas is disabled.
     */
    readonly gas: {
        readonly mode: GasMode.Disabled
    } | {
        readonly mode: GasMode.Normal
    } | {
        readonly mode: GasMode.Debug
        readonly overrideDuration: number
    }

    readonly movementSpeed: number
    /**
     * Server tick rate
     */
    readonly tps: number

    /**
     * If this option is specified, the given HTTP header will be used to determine IP addresses.
     * If using nginx with the sample config, set it to `"X-Real-IP"`.
     * If using Cloudflare, set it to `"CF-Connecting-IP"`.
     */
    readonly ipHeader?: string
}

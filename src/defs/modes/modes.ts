import { type Vec2 } from "../../utils/v2";
import { Desert } from "./desert";
import { Main } from "./main";

export const ModeDefinitions: Record<string, ModeDefinition> = {
    main: Main,
    desert: Desert
};

export interface ModeDefinition {
    mapId: number
    gameMode: {
        maxPlayers: number
        killLeaderEnabled: boolean
    }
    gameConfig: {
        planes: {
            timings: Array<
            {
                circleIdx: number
                wait: number
                options: { type: number }
            }>
            crates: Array<{
                name: string
                weight: number
            }>
        }
        bagSizes: Record<string, number>
        bleedDamage: number
        bleedDamageMult: number
    }
    lootTable: Record<string, Array<{
        name: string
        count: number
        weight: number
    }>>
    mapGen: {
        map: {
            baseWidth: number
            baseHeight: number
            scale: { small: number, large: number }
            extension: number
            shoreInset: number
            grassInset: number
            rivers: {
                lakes: Array<{
                    odds: number
                    innerRad: number
                    outerRad: number
                    spawnBound: {
                        pos: Vec2
                        rad: number
                    }
                }>
                weights: Array<{ weight: number, widths: number[] }>
                smoothness: number
                masks: Array<{
                    pos: Vec2
                    rad: number
                }>
            }
        }
        places: Array<{ name: string, pos: Vec2 }>
        bridgeTypes: {
            medium: string
            large: string
            xlarge: string
        }
        customSpawnRules: {
            locationSpawns: Array<{
                type: string
                pos: Vec2
                rad: number
                retryOnFailure: boolean
            }>
            placeSpawns: string[]
        }
        densitySpawns: Array<Record<string, number>>
        fixedSpawns: Array<
        Record<string,
        number | { odds: number } | { small: number, large: number }
        >
        >
        randomSpawns: Array<{
            spawns: string[]
            choose: number
        }>
        spawnReplacements: Array<Record<string, string>>
        importantSpawns: string[]
    }
}

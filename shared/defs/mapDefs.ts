import { DeatchmatchMain } from "../../server/src/deathmatch/maps/main";
import type { Vec2 } from "../utils/v2";
import { Cobalt } from "./maps/cobaltDefs";
import { Desert } from "./maps/desertDefs";
import { Faction } from "./maps/factionDefs";
import { Halloween } from "./maps/halloweenDefs";
import { MainSpring } from "./maps/mainSpringDefs";
import { MainSummer } from "./maps/mainSummerDefs";
import { Potato } from "./maps/potatoDefs";
import { PotatoSpring } from "./maps/potatoSpringDefs";
import { Savannah } from "./maps/savannahDefs";
import { Snow } from "./maps/snowDefs";
import { Turkey } from "./maps/turkeyDefs";
import { Woods } from "../../server/src/deathmatch/maps/woods";
import { WoodsSnow } from "./maps/woodsSnowDefs";
import { WoodsSpring } from "./maps/woodsSpringDefs";
import { WoodsSummer } from "./maps/woodsSummerDefs";

export const MapDefs = {
    main: DeatchmatchMain,
    main_spring: MainSpring,
    main_summer: MainSummer,
    desert: Desert,
    faction: Faction,
    halloween: Halloween,
    potato: Potato,
    potato_spring: PotatoSpring,
    snow: Snow,
    woods: Woods,
    woods_snow: WoodsSnow,
    woods_spring: WoodsSpring,
    woods_summer: WoodsSummer,
    savannah: Savannah,
    cobalt: Cobalt,
    turkey: Turkey,
} satisfies Record<string, MapDef>;

export type Atlas = "gradient" | "loadout" | "shared" | "main";

export interface MapDef {
    mapId: number;
    desc: {
        name: string;
        icon: string;
        buttonCss: string;
        buttonText?: string;
    };
    assets: {
        audio: Array<{
            name: string;
            channel: string;
        }>;
        atlases: Atlas[];
    };
    biome: {
        colors: {
            background: number;
            water: number;
            waterRipple: number;
            beach: number;
            riverbank: number;
            grass: number;
            underground: number;
            playerSubmerge: number;
            playerGhillie: number;
        };
        valueAdjust: number;
        sound: {
            riverShore: string;
        };
        particles: {
            camera: string;
        };
        tracerColors: Record<string, Record<string, number>>;
        airdrop: {
            planeImg: string;
            planeSound: string;
            airdropImg: string;
        };
        frozenSprites?: string[];
    };
    gameMode: {
        maxPlayers: number;
        killLeaderEnabled: boolean;
        spawn:
            | {
                  mode: "random";
              }
            | {
                  mode: "center";
              }
            | {
                  mode: "radius";
                  radius: number;
              }
            | {
                  mode: "fixed";
                  pos: Vec2;
              }
            | {
                  mode: "donut";
                  innerRadius: number;
                  outerRadius: number;
              };
        desertMode?: boolean;
        factionMode?: boolean;
        factions?: number;
        potatoMode?: boolean;
        woodsMode?: boolean;
        sniperMode?: boolean;
        perkMode?: boolean;
        perkModeRoles?: string[];
        turkeyMode?: number;
        spookyKillSounds?: boolean;
    };
    gameConfig: {
        planes: {
            timings: Array<{
                circleIdx: number;
                wait: number;
                options: {
                    type: number;
                    numPlanes?: Array<{
                        count: number;
                        weight: number;
                    }>;
                    airstrikeZoneRad?: number;
                    wait?: number;
                    delay?: number;
                };
            }>;
            crates: Array<{
                name: string;
                weight: number;
            }>;
        };
        roles?: {
            timings: Array<{
                role: string | (() => string);
                circleIdx: number;
                wait: number;
            }>;
        };
        bagSizes: Record<string, number[]>;
        bleedDamage: number;
        bleedDamageMult: number;
    };
    lootTable: Record<
        string,
        Array<{
            name: string;
            count: number;
            weight: number;
        }>
    >;
    mapGen: {
        map: {
            baseWidth: number;
            baseHeight: number;
            scale: {
                small: number;
                large: number;
            };
            extension: number;
            shoreInset: number;
            grassInset: number;
            rivers: {
                lakes: Array<{
                    odds: number;
                    innerRad: number;
                    outerRad: number;
                    spawnBound: {
                        pos: Vec2;
                        rad: number;
                    };
                }>;
                weights: Array<{
                    weight: number;
                    widths: number[];
                }>;
                smoothness: number;
                masks: Array<{
                    pos: Vec2;
                    rad: number;
                }>;
            };
        };
        places: Array<{
            name: string;
            pos: Vec2;
        }>;
        bridgeTypes: {
            medium: string;
            large: string;
            xlarge: string;
        };
        riverCabins: Record<string, number>;
        customSpawnRules: {
            locationSpawns: Array<{
                type: string;
                pos: Vec2;
                rad: number;
                retryOnFailure: boolean;
            }>;
            placeSpawns: string[];
        };
        densitySpawns: Array<Record<string, number>>;
        fixedSpawns: Array<
            Record<string, number | { odds: number } | { small: number; large: number }>
        >;
        randomSpawns: Array<{
            spawns: string[];
            choose: number;
        }>;
        spawnReplacements: Array<Record<string, string>>;
        importantSpawns: string[];
    };
}

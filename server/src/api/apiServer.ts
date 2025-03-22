import type { Hono } from "hono";
import type { UpgradeWebSocket } from "hono/ws";
import { GameConfig } from "../../../shared/gameConfig";
import type { FindGameBody, FindGameResponse } from "../../../shared/types/api";
import { Config, type ConfigType } from "../config";
import { TeamMenu } from "../teamMenu";
import { GIT_VERSION } from "../utils/gitRevision";
import { Logger } from "../utils/logger";

class Region {
    data: ConfigType["regions"][string];
    playerCount = 0;

    lastUpdateTime = Date.now();

    constructor(readonly id: string) {
        this.data = Config.regions[this.id];
    }

    async fetch<Data extends object>(endPoint: string, body: object) {
        const url = `http${this.data.https ? "s" : ""}://${this.data.address}/${endPoint}`;

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "survev-api-key": Config.apiKey,
                },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                return (await res.json()) as Data;
            }
        } catch (err) {
            console.warn(`Error fetching region ${this.id}`, err);
            return undefined;
        }
    }

    async findGame(body: FindGameBody): Promise<FindGameResponse> {
        if (body.version !== GameConfig.protocolVersion) {
            return { err: "invalid_protocol" };
        }

        const mode = Config.modes[body.gameModeIdx];
        if (!mode || !mode.enabled) {
            return { err: "full" };
        }

        const data = await this.fetch<FindGameResponse>("api/find_game", body);
        if (!data) {
            return { err: "full" };
        }
        return data;
    }
}

interface RegionData {
    playerCount: number;
}

export class ApiServer {
    readonly logger = new Logger("Server");

    teamMenu = new TeamMenu(this);

    regions: Record<string, Region> = {};

    constructor() {
        for (const region in Config.regions) {
            this.regions[region] = new Region(region);
        }
    }

    init(app: Hono, upgradeWebSocket: UpgradeWebSocket) {
        this.teamMenu.init(app, upgradeWebSocket);
    }

    getSiteInfo() {
        const data = {
            modes: Config.modes,
            pops: {} as Record<
                string,
                {
                    playerCount: number;
                    l10n: string;
                }
            >,
            youtube: { name: "", link: "" },
            twitch: [],
            country: "US",
            gitRevision: GIT_VERSION,
        };

        for (const region in this.regions) {
            data.pops[region] = {
                playerCount: this.regions[region].playerCount,
                l10n: Config.regions[region].l10n,
            };
        }
        return data;
    }

    updateRegion(regionId: string, regionData: RegionData) {
        const region = this.regions[regionId];
        region.playerCount = regionData.playerCount;
        region.lastUpdateTime = Date.now();
    }

    async findGame(body: FindGameBody): Promise<FindGameResponse> {
        if (body.version !== GameConfig.protocolVersion) {
            return { err: "invalid_protocol" };
        }

        const mode = Config.modes[body.gameModeIdx];
        if (!mode || !mode.enabled) {
            return { err: "full" };
        }

        if (body.region in this.regions) {
            return await this.regions[body.region].findGame(body);
        }
        return { err: "full" };
    }
}

export const server = new ApiServer();

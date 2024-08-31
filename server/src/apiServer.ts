import { App, SSLApp, type TemplatedApp } from "uWebSockets.js";
import { version } from "../../package.json";
import { Config, type ConfigType } from "./config";
import type { FindGameBody, FindGameResponse } from "./gameServer";
import { TeamMenu } from "./teamMenu";
import { Logger } from "./utils/logger";
import { cors, forbidden, readPostedJSON, returnJson } from "./utils/serverHelpers";

class Region {
    data: ConfigType["regions"][string];
    playerCount = 0;

    constructor(readonly id: string) {
        this.data = Config.regions[this.id];
    }

    async fetch<Data extends object>(endPoint: string, body: object) {
        const url = `http${this.data.https ? "s" : ""}://${this.data.address}/${endPoint}`;

        return new Promise<Data>((resolve) => {
            fetch(url, {
                body: JSON.stringify({
                    ...body,
                    apiKey: Config.apiKey,
                }),
                method: "post",
                headers: {
                    "Content-type": "application/json",
                },
            })
                .catch(console.error)
                .then((response) => {
                    if (response?.ok) {
                        return response.json();
                    }
                    return [{ err: "Error connecting to region, is it down?" }];
                })
                .then((json) => {
                    resolve(json);
                })
                .catch((error) => {
                    console.error(error);
                    return [{ err: "Error parsing region response JSON" }];
                });
        });
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

    init(app: TemplatedApp) {
        this.teamMenu.init(app);

        app.get("/api/site_info", (res) => {
            cors(res);
            returnJson(res, this.getSiteInfo());
        });
        app.options("/api/user/profile", (res) => {
            cors(res);
            res.end();
        });
        app.post("/api/user/profile", (res, _req) => {
            cors(res);
            returnJson(res, this.getUserProfile());
        });

        app.post("/api/match_history", async (res) => {
            res.writeHeader("Content-Type", "application/json");
            res.end(
                JSON.stringify(
                    Array.from({ length: 10 }, (_, i) => ({
                        guid: "85d16fd3-be8f-913b-09ce-4ba5c86482aa",
                        region: "na",
                        map_id: 2,
                        team_mode: 2,
                        team_count: 1,
                        team_total: 13,
                        end_time: "2021-11-06T05:01:34.000Z",
                        time_alive: 303,
                        rank: 1,
                        kills: 11,
                        team_kills: 11,
                        damage_dealt: 1264,
                        damage_taken: 227,
                    })),
                ),
            );
        });

        app.post("/api/user_stats", async (res) => {
            res.writeHeader("Content-Type", "application/json");
            res.end(
                JSON.stringify({
                    slug: "olimpiq",
                    username: "olimpiq",
                    player_icon: "",
                    banned: false,
                    wins: 4994,
                    kills: 92650,
                    games: 9998,
                    kpg: "9.3",
                    modes: [
                        {
                            teamMode: 1,
                            games: 1190,
                            wins: 731,
                            kills: 10858,
                            winPct: "61.4",
                            mostKills: 25,
                            mostDamage: 2120,
                            kpg: "9.1",
                            avgDamage: 851,
                            avgTimeAlive: 258,
                        },
                        {
                            teamMode: 2,
                            games: 2645,
                            wins: 1309,
                            kills: 21739,
                            winPct: "49.5",
                            mostKills: 24,
                            mostDamage: 2893,
                            kpg: "8.2",
                            avgDamage: 976,
                            avgTimeAlive: 233,
                        },
                        {
                            teamMode: 4,
                            games: 6163,
                            wins: 2954,
                            kills: 60053,
                            winPct: "47.9",
                            mostKills: 30,
                            mostDamage: 4575,
                            kpg: "9.7",
                            avgDamage: 1373,
                            avgTimeAlive: 246,
                        },
                    ],
                }),
            );
        });

        app.post("/api/leaderboard", async (res) => {
            res.writeHeader("Content-Type", "application/json");
            res.end(
                JSON.stringify(
                    Array.from({ length: 100 }, (_, i) => ({
                        slug: "olimpiq",
                        username: "Olimpiq",
                        region: "eu",
                        games: 123,
                        val: 25,
                    })),
                ),
            );
        });
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
        };

        for (const region in this.regions) {
            data.pops[region] = {
                playerCount: this.regions[region].playerCount,
                l10n: Config.regions[region].l10n,
            };
        }
        return data;
    }

    getUserProfile() {
        return { err: "" };
    }

    updateRegion(regionId: string, regionData: RegionData) {
        const region = this.regions[regionId];
        region.playerCount = regionData.playerCount;
    }

    async findGame(body: FindGameBody): Promise<FindGameResponse> {
        if (body.region in this.regions) {
            return this.regions[body.region].fetch<FindGameResponse>(
                "api/find_game",
                body,
            );
        }
        this.logger.warn("/api/find_game: Invalid region");
        return {
            res: [{ err: "Invalid Region" }],
        };
    }
}

if (process.argv.includes("--api-server")) {
    const server = new ApiServer();

    const app = Config.apiServer.ssl
        ? SSLApp({
              key_file_name: Config.apiServer.ssl.keyFile,
              cert_file_name: Config.apiServer.ssl.certFile,
          })
        : App();

    server.init(app);

    app.options("/api/find_game", (res) => {
        cors(res);
        res.end();
    });
    app.post("/api/find_game", async (res) => {
        cors(res);
        let aborted = false;
        res.onAborted(() => {
            aborted = true;
        });
        readPostedJSON(
            res,
            async (body: FindGameBody) => {
                const data = await server.findGame(body);
                if (aborted) return;
                res.cork(() => {
                    if (aborted) return;
                    returnJson(res, data);
                });
            },
            () => {
                server.logger.warn("/api/find_game: Error retrieving body");
                if (aborted) return;
                returnJson(res, {
                    res: [
                        {
                            err: "Error retriving body",
                        },
                    ],
                });
            },
        );
    });

    app.options("/api/update_region", (res) => {
        cors(res);
        res.end();
    });
    app.post("/api/update_region", (res) => {
        cors(res);
        let aborted = false;
        res.onAborted(() => {
            aborted = true;
        });
        readPostedJSON(
            res,
            (body: {
                apiKey: string;
                regionId: string;
                data: RegionData;
            }) => {
                if (aborted) return;
                if (body.apiKey !== Config.apiKey || !(body.regionId in server.regions)) {
                    forbidden(res);
                    return;
                }
                server.updateRegion(body.regionId, body.data);
            },
            () => {},
        );
    });

    app.listen(Config.apiServer.host, Config.apiServer.port, (): void => {
        server.logger.log(`Resurviv API Server v${version}`);
        server.logger.log(
            `Listening on ${Config.apiServer.host}:${Config.apiServer.port}`,
        );
        server.logger.log("Press Ctrl+C to exit.");
        0;
    });
}

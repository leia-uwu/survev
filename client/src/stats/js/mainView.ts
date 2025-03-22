import $ from "jquery";
import { device } from "../../device";
import { helpers } from "../../helpers";
import type { App } from "./app";
import { getCensoredBattletag, renderEjs } from "./helper";
import leaderboard from "./templates/leaderboard.ejs?raw";
import leaderboardError from "./templates/leaderboardError.ejs?raw";
import loading from "./templates/loading.ejs?raw";
import main from "./templates/main.ejs?raw";

const templates = {
    loading: (params: Record<string, any>) => renderEjs(loading, params),
    main: (params: Record<string, any>) => renderEjs(main, params),
    leaderboard: (params: Record<string, any>) => renderEjs(leaderboard, params),
    leaderboardError: (params: Record<string, any>) =>
        renderEjs(leaderboardError, params),
};

//
// MainView
//
export class MainView {
    loading = false;
    error = false;
    data = {} as Partial<{
        username: string;
        statName: string;
        minGames: number;
        teamMode: string;
        mapId: string;
        type: string;
        interval: string;
        maxCount: number;
        data: {
            username: string;
            usernames: string[];
            slug: string;
            slugs: string[];
            slugUncensored: string;
            slugsUncensored: string[];
        }[];
    }>;
    el = $(
        templates.main({
            phoneDetected: device.mobile && !device.tablet,
            gameModes: helpers.getGameModes(),
        }),
    );

    constructor(readonly app: App) {

        this.app = app;

        this.el.find(".leaderboard-opt").change(() => {
            this.onChangedParams();
        });
    }
    load() {
        this.loading = true;
        this.error = false;

        // Supported args so far:
        //   type:     most_kills, most_damage_dealt, kills, wins, kpg
        //   interval: daily, weekly, alltime
        //   teamMode: solo, duo, squad
        //   maxCount: 10, 100
        let type = helpers.getParameterByName("type") || "most_kills";
        const interval = helpers.getParameterByName("t") || "daily";
        const teamMode = helpers.getParameterByName("team") || "solo";
        const mapId = helpers.getParameterByName("mapId") || "0";
        // Change to most_damage_dealt if faction mode and most_kills selected
        if (type == "most_kills" && Number(mapId) == 3) {
            type = "most_damage_dealt";
        }
        const maxCount = 100;

        const args = {
            type: type,
            interval: interval,
            teamMode: teamMode,
            mapId: mapId,
            maxCount: maxCount,
        };

        $.ajax({
            url: "/api/leaderboard",
            type: "POST",
            data: JSON.stringify(args),
            contentType: "application/json; charset=utf-8",
            success: (data, _status, _xhr) => {
                this.data = {
                    type: type,
                    interval: interval,
                    teamMode: teamMode,
                    mapId: mapId,
                    maxCount: maxCount,
                    data: data,
                };
            },
            error: (_xhr, _err) => {
                this.error = true;
            },
            complete: () => {
                this.loading = false;
                this.render();
            },
        });

        this.render();
    }
    onChangedParams() {
        const type = $("#leaderboard-type").val();
        const time = $("#leaderboard-time").val();
        const teamMode = $("#leaderboard-team-mode").val();
        const mapId = $("#leaderboard-map-id").val();
        window.history.pushState(
            "",
            "",
            `?type=${type}&team=${teamMode}&t=${time}&mapId=${mapId}`,
        );
        this.load();
    }
    render() {
        // Compute derived values
        const TypeToString = {
            most_kills: "stats-most-kills",
            most_damage_dealt: "stats-most-damage",
            kills: "stats-total-kills",
            wins: "stats-total-wins",
            kpg: "stats-kpg",
        };
        // @TODO: Refactor shared leaderboard constants with app/src/db.js
        const MinGames = {
            kpg: {
                daily: 15,
                weekly: 50,
                alltime: 100,
            },
        };

        let content = "";
        if (this.loading) {
            content = templates.loading({
                type: "leaderboard",
            });
        } else if (this.error || !this.data.data) {
            content = templates.leaderboardError({});
        } else {
            for (let i = 0; i < this.data.data.length; i++) {
                if (this.data.data[i].username) {
                    this.data.data[i].username = getCensoredBattletag(
                        this.data.data[i].username,
                    );
                } else if (this.data.data[i].usernames) {
                    this.data.data[i].usernames =
                        this.data.data[i].usernames.map(getCensoredBattletag);
                }

                if (this.data.data[i].slug) {
                    this.data.data[i].slug = getCensoredBattletag(this.data.data[i].slug);
                } else if (this.data.data[i].slugs) {
                    this.data.data[i].slugs =
                        this.data.data[i].slugs.map(getCensoredBattletag);
                }
            }

            const statName =
                TypeToString[this.data.type as keyof typeof TypeToString] || "";
            let minGames = MinGames[this.data.type as keyof typeof MinGames]
                ? // @ts-expect-error go away
                  MinGames[this.data.type][this.data.interval]
                : 1;
            minGames = minGames || 1;

            content = templates.leaderboard({
                ...this.data,
                statName: statName,
                minGames: minGames,
            });

            // Set the select options
            $("#leaderboard-team-mode").val(this.data.teamMode!);
            $("#leaderboard-map-id").val(this.data.mapId!);
            $("#leaderboard-type").val(this.data.type!);
            $("#leaderboard-time").val(this.data.interval!);

            // Disable most kills option if 50v50 selected
            const factionMode = Number(this.data.mapId) == 3;
            if (factionMode) {
                $('#leaderboard-type option[value="most_kills"]').attr(
                    "disabled",
                    "disabled",
                );
            } else {
                $('#leaderboard-type option[value="most_kills"]').removeAttr("disabled");
            }
        }

        this.el.find(".content").html(content);
        this.app.localization.localizeIndex();
    }
}

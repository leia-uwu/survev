import $ from "jquery";
import { device } from "../../device";
import { helpers } from "../../helpers";
import type { App } from "./app";
import { getCensoredBattletag, renderEjs } from "./helper";
import leaderboard from "./templates/leaderboard.ejs?raw";
import leaderboardError from "./templates/leaderboardError.ejs?raw";
import loading from "./templates/loading.ejs?raw";
import main from "./templates/main.ejs?raw";

var templates = {
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
        var _this = this;

        this.app = app;

        this.el.find(".leaderboard-opt").change(function () {
            _this.onChangedParams();
        });
    }
    load() {
        var _this2 = this;

        this.loading = true;
        this.error = false;

        // Supported args so far:
        //   type:     most_kills, most_damage_dealt, kills, wins, kpg
        //   interval: daily, weekly, alltime
        //   teamMode: solo, duo, squad
        //   maxCount: 10, 100
        var type = helpers.getParameterByName("type") || "most_kills";
        var interval = helpers.getParameterByName("t") || "daily";
        var teamMode = helpers.getParameterByName("team") || "solo";
        var mapId = helpers.getParameterByName("mapId") || "0";
        // Change to most_damage_dealt if faction mode and most_kills selected
        if (type == "most_kills" && Number(mapId) == 3) {
            type = "most_damage_dealt";
        }
        var maxCount = 100;

        var args = {
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
            success: function success(data, _status, _xhr) {
                _this2.data = {
                    type: type,
                    interval: interval,
                    teamMode: teamMode,
                    mapId: mapId,
                    maxCount: maxCount,
                    data: data,
                };
            },
            error: function error(_xhr, _err) {
                _this2.error = true;
            },
            complete: function complete() {
                _this2.loading = false;
                _this2.render();
            },
        });

        this.render();
    }
    onChangedParams() {
        var type = $("#leaderboard-type").val();
        var time = $("#leaderboard-time").val();
        var teamMode = $("#leaderboard-team-mode").val();
        var mapId = $("#leaderboard-map-id").val();
        window.history.pushState(
            "",
            "",
            `?type=${type}&team=${teamMode}&t=${time}&mapId=${mapId}`,
        );
        this.load();
    }
    render() {
        // Compute derived values
        var TypeToString = {
            most_kills: "stats-most-kills",
            most_damage_dealt: "stats-most-damage",
            kills: "stats-total-kills",
            wins: "stats-total-wins",
            kpg: "stats-kpg",
        };
        // @TODO: Refactor shared leaderboard constants with app/src/db.js
        var MinGames = {
            kpg: {
                daily: 15,
                weekly: 50,
                alltime: 100,
            },
        };

        var content = "";
        if (this.loading) {
            content = templates.loading({
                type: "leaderboard",
            });
        } else if (this.error || !this.data.data) {
            content = templates.leaderboardError({});
        } else {
            for (var i = 0; i < this.data.data.length; i++) {
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

            var statName =
                TypeToString[this.data.type as keyof typeof TypeToString] || "";
            var minGames = MinGames[this.data.type as keyof typeof MinGames]
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
            var factionMode = Number(this.data.mapId) == 3;
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

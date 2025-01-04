import $ from "jquery";
import { EmotesDefs } from "../../../../shared/defs/gameObjects/emoteDefs";
import type { TeamMode } from "../../../../shared/gameConfig";
import { device } from "../../device";
import { helpers } from "../../helpers";
import loading from "./templates/loading.ejs?raw";
import matchData from "./templates/matchData.ejs?raw";
import matchHistory from "./templates/matchHistory.ejs?raw";
import player from "./templates/player.ejs?raw";
import playerCards from "./templates/playerCards.ejs?raw";
import type { App } from "./app";
import { emoteImgToSvg, formatTime, getCensoredBattletag, renderEjs } from "./helper";

var templates = {
    loading: (params: Record<string, any>) => renderEjs(loading, params),
    matchData: (params: Record<string, any>) => renderEjs(matchData, params),
    matchHistory: (params: Record<string, any>) => renderEjs(matchHistory, params),
    player: (params: Record<string, any>) => renderEjs(player, params),
    playerCards: (params: Record<string, any>) => renderEjs(playerCards, params),
};

var TeamModeToString = {
    1: "solo",
    2: "duo",
    4: "squad",
};

export interface MatchData {
    team_id: number;
    player_id: number;
    killer_id: number;
    rank: number;
    killed_ids: number[];
    slug: string;
    username: string;
    kills: number;
    damage_dealt: number;
    time_alive: number;
}

interface ModeStats {
    teamMode: TeamMode;
    games: number;
    wins: number;
    kills: number;
    winPct: string;
    mostKills: number;
    mostDamage: number;
    kpg: string;
    avgDamage: number;
    avgTimeAlive: number;
}

export interface PlayerStats {
    slug: string;
    username: string;
    player_icon: string;
    banned: boolean;
    wins: number;
    kills: number;
    games: number;
    kpg: string;
    modes: ModeStats[];
}

export interface MatchStats {
    guid: string;
    region: string;
    map_id: number;
    team_mode: string;
    team_count: number;
    team_total: number;
    end_time: string;
    time_alive: number;
    rank: number;
    kills: number;
    team_kills: number;
    damage_dealt: number;
    damage_taken: number;
    icon?: string;
}
export interface TeamModes {
    teamMode: TeamMode;
    games: number;
    name: string;
    botStats: { name: string; val: string }[];
    midStats: { name: string; val: string }[];
}

function getPlayerCardData(
    userData: PlayerStats,
    error: boolean,
    teamModeFilter: number,
) {
    // get_user_stats currently returns data rows for all teamModes;
    // transform the data a bit for the player card.
    if (error || !userData) {
        return {
            profile: {},
            teamModes: [],
            error: error,
        };
    }

    var emoteDef = EmotesDefs[userData.player_icon];
    var texture = emoteDef ? emoteImgToSvg(emoteDef.texture) : "/img/gui/player-gui.svg";
    console.log({
        emoteDef,
        texture: emoteDef ? emoteImgToSvg(emoteDef.texture) : null,
    });
    var tmpSlug = userData.slug.toLowerCase();
    tmpSlug = tmpSlug.replace(userData.username.toLowerCase(), "");

    var tmpslugToShow =
        tmpSlug != ""
            ? getCensoredBattletag(`${userData.username}#${tmpSlug}`)
            : getCensoredBattletag(userData.username);

    var profile = {
        username: getCensoredBattletag(userData.username),
        slugToShow: tmpslugToShow,
        banned: userData.banned,
        avatarTexture: texture,
        wins: userData.wins,
        kills: userData.kills,
        games: userData.games,
        kpg: userData.kpg,
    };

    // Gather card data
    var addStat = function addStat(
        arr: { name: string; val: number | string }[],
        name: string,
        val: number | string,
    ) {
        arr.push({
            name: name,
            val: val,
        });
    };
    var teamModes: Partial<TeamModes>[] = [];
    for (var i = 0; i < userData.modes.length; i++) {
        var mode = userData.modes[i];

        // Overall rank / rating not available yet
        var mid: { name: string; val: string }[] = [];
        addStat(mid, "Rating", "-");
        addStat(mid, "Rank", "-");

        var bot: { name: string; val: string }[] = [];
        addStat(bot, "Wins", mode.wins);
        addStat(bot, "Win %", mode.winPct);
        addStat(bot, "Kills", mode.kills);
        addStat(bot, "Avg Survived", formatTime(mode.avgTimeAlive));
        addStat(bot, "Most kills", mode.mostKills);
        addStat(bot, "K/G", mode.kpg);
        addStat(bot, "Most damage", mode.mostDamage);
        addStat(bot, "Avg Damage", mode.avgDamage);

        teamModes.push({
            teamMode: mode.teamMode,
            games: mode.games,
            midStats: mid,
            botStats: bot,
        });
    }

    // Insert blank cards for all teammodes
    var keys = Object.keys(TeamModeToString) as unknown as TeamMode[];

    for (var _i = 0; _i < keys.length; _i++) {
        var teamMode = keys[_i];
        if (
            !teamModes.find(function (x) {
                return x.teamMode == teamMode;
            })
        ) {
            teamModes.push({
                teamMode,
                games: 0,
            });
        }
    }
    teamModes.sort(function (a, b) {
        return a.teamMode! - b.teamMode!;
    });
    for (var _i2 = 0; _i2 < teamModes.length; _i2++) {
        var _teamMode = teamModes[_i2].teamMode!;
        teamModes[_i2].name = TeamModeToString[_teamMode];
    }

    var gameModes = helpers.getGameModes();

    return {
        profile: profile,
        error: error,
        teamModes: teamModes,
        teamModeFilter: teamModeFilter,
        gameModes: gameModes,
    };
}

//
// Query
//

class Query {
    inProgress = false;
    dataValid = false;
    error = false;
    args = {};
    data: PlayerStats | null = null;

    query(
        url: string,
        args: Record<string, unknown>,
        debugTimeout: number,
        onComplete: (err: any, res: any) => void,
    ) {
        var _this = this;

        if (this.inProgress) {
            return;
        }

        this.inProgress = true;
        this.error = false;

        $.ajax({
            url: url,
            type: "POST",
            data: JSON.stringify(args),
            contentType: "application/json; charset=utf-8",
            timeout: 10 * 1000,
            success: function success(data, _status, _xhr) {
                _this.data = data;
                _this.dataValid = !!data;
            },
            error: function error(_xhr, _err) {
                _this.error = true;
                _this.dataValid = false;
            },
            complete: function complete() {
                setTimeout(function () {
                    _this.inProgress = false;
                    onComplete(_this.error, _this.data);
                }, debugTimeout);
            },
        });
    }
}

//
// PlayerView
//
export class PlayerView {
    games: {
        expanded: boolean;
        dataError: boolean;
        data: MatchData[] | null;
        summary: MatchStats;
    }[] = [];
    moreGamesAvailable = true;
    teamModeFilter = 7;
    userStats = new Query();
    matchHistory = new Query();
    matchData = new Query();
    el = $(
        templates.player({
            phoneDetected: device.mobile && !device.tablet,
        }),
    );
    constructor(readonly app: App) {}
    getUrlParams() {
        var location = window.location.href;
        var params = new RegExp("stats/([^/?#]+).*$").exec(location) || [];
        var slug = params[1] || "";
        var interval = helpers.getParameterByName("t") || "all";
        var mapId = helpers.getParameterByName("mapId") || "-1";
        return {
            slug: slug,
            interval: interval,
            mapId: mapId,
        };
    }
    getGameByGameId(gameId: string) {
        return this.games.find(function (x) {
            return x.summary.guid == gameId;
        });
    }
    load() {
        var _getUrlParams = this.getUrlParams(),
            slug = _getUrlParams.slug,
            interval = _getUrlParams.interval,
            mapId = _getUrlParams.mapId;

        this.loadUserStats(slug, interval, mapId);
        this.loadMatchHistory(slug, 0, 7);

        this.render();
    }
    loadUserStats(slug: string, interval: string, mapIdFilter: string) {
        var _this2 = this;

        var args = {
            slug: slug,
            interval: interval,
            mapIdFilter: mapIdFilter,
        };
        this.userStats.query("/api/user_stats", args, 0, function (_err, _data) {
            _this2.render();
        });
    }
    loadMatchHistory(slug: string, offset: number, teamModeFilter: number) {
        var This = this;

        var count = 10;
        var args = {
            slug: slug,
            offset: offset,
            count: count,
            teamModeFilter: teamModeFilter,
        };
        this.matchHistory.query("/api/match_history", args, 0, function (_err, data) {
            var gameModes = helpers.getGameModes();

            var games = data || [];

            for (var i = 0; i < games.length; i++) {
                games[i].team_mode =
                    TeamModeToString[games[i].team_mode as unknown as TeamMode];

                var gameMode = gameModes.find(function (x) {
                    return x.mapId == games[i].map_id;
                });
                games[i].icon = gameMode ? gameMode.desc.icon : "";

                This.games.push({
                    expanded: false,
                    summary: games[i],
                    data: null,
                    dataError: false,
                });
            }
            This.moreGamesAvailable = games.length >= count;
            This.render();
        });
    }
    loadMatchData(gameId: string) {
        var This = this;

        var args = {
            gameId: gameId,
        };
        this.matchData.query("/api/match_data", args, 0, function (err, data) {
            var game = This.getGameByGameId(gameId);
            if (game) {
                game.data = data;
                game.dataError = err || !data;
            }
            This.render();
        });
    }
    toggleMatchData(gameId: string) {
        var game = this.getGameByGameId(gameId);
        if (!game) {
            return;
        }

        var wasExpanded = game.expanded;
        for (var i = 0; i < this.games.length; i++) {
            this.games[i].expanded = false;
        }
        game.expanded = !wasExpanded;

        if (!game.data && !game.dataError) {
            this.loadMatchData(gameId);
        }

        this.render();
    }
    onChangedParams() {
        var time = $("#player-time").val();
        var mapId = $("#player-map-id").val();
        window.history.pushState("", "", `?t=${time}&mapId=${mapId}`);

        var params = this.getUrlParams();
        this.loadUserStats(params.slug, params.interval, params.mapId);
    }
    render() {
        var _this5 = this;

        var params = this.getUrlParams();

        // User stats
        var content = "";
        if (this.userStats.inProgress) {
            content = templates.loading({
                type: "player",
            });
        } else {
            var cardData = getPlayerCardData(
                this.userStats.data!,
                this.userStats.error,
                this.teamModeFilter,
            );
            content = templates.playerCards(cardData);
        }
        this.el.find(".content").html(content);

        var timeSelector = this.el.find("#player-time");
        if (timeSelector) {
            timeSelector.val(params.interval);
            timeSelector.change(function () {
                _this5.onChangedParams();
            });
        }

        var mapIdSelector = this.el.find("#player-map-id");
        if (mapIdSelector) {
            mapIdSelector.val(params.mapId);
            mapIdSelector.change(function () {
                _this5.onChangedParams();
            });
        }

        // Match history
        var historyContent = "";
        if (this.games.length == 0 && this.matchHistory.inProgress) {
            historyContent = templates.loading({
                type: "match_history",
            });
        } else {
            historyContent = templates.matchHistory({
                games: this.games,
                moreGamesAvailable: this.moreGamesAvailable,
                loading: this.matchHistory.inProgress,
                error: this.matchHistory.error,
            });
        }

        var historySelector = this.el.find("#match-history");
        if (historySelector) {
            historySelector.html(historyContent);

            $(".js-match-data").click(function (e) {
                if (!$(e.target).is("a")) {
                    _this5.toggleMatchData($(e.currentTarget).data("game-id"));
                }
            });

            $(".js-match-load-more").click(function (_e) {
                var params = _this5.getUrlParams();
                _this5.loadMatchHistory(
                    params.slug,
                    _this5.games.length,
                    _this5.teamModeFilter,
                );
                _this5.render();
            });

            $(".extra-team-mode-filter").click(function (e) {
                if (!_this5.matchHistory.inProgress) {
                    var _params = _this5.getUrlParams();
                    _this5.games = [];
                    _this5.teamModeFilter = $(e.currentTarget).data("filter");
                    _this5.loadMatchHistory(_params.slug, 0, _this5.teamModeFilter);
                    _this5.render();
                }
            });

            // Match data
            var matchDataContent = "";
            var expandedGame = this.games.find(function (x) {
                return x.expanded;
            });
            if (expandedGame) {
                var _params2 = this.getUrlParams();
                var localId = 0;
                // Get this player's player_id in this match
                if (expandedGame.data) {
                    for (var i = 0; i < expandedGame.data.length; i++) {
                        var d = expandedGame.data[i];
                        if (_params2.slug == d.slug) {
                            localId = d.player_id || 0;
                            break;
                        }
                    }
                }

                matchDataContent = templates.matchData({
                    data: expandedGame.data,
                    error: expandedGame.dataError,
                    loading: this.matchData.inProgress,
                    localId: localId,
                });
            }

            $("#match-data").html(matchDataContent);
        }

        this.app.localization.localizeIndex();
    }
}

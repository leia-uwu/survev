import $ from "jquery";
import type { ReactElement } from "jsx-dom";
import { EmotesDefs as EmoteDefs } from "../../../shared/defs/gameObjects/emoteDefs.js";
import { TeamMode } from "../../../shared/gameConfig.js";
import { helpers } from "../helpers.js";
import type { App } from "./app.js";
import { battletagCensoring } from "./mainview.js";
import loading from "./templates/loading.jsx";
import matchData from "./templates/matchData.jsx";
import matchHistory from "./templates/matchHistory.jsx";
import player from "./templates/player.jsx";
import playerCards from "./templates/playerCards.jsx";

const templates = {
    loading,
    matchData,
    matchHistory,
    player,
    playerCards,
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
//
// Helpers
//
function formatTime(time: number) {
    const minutes = Math.floor(time / 60) % 60;
    let seconds: string | number = Math.floor(time) % 60;
    if (seconds < 10) {
        seconds = `0${seconds}`;
    }
    let timeSurv = "";
    timeSurv += `${minutes}:`;
    timeSurv += seconds;
    return timeSurv;
}
function emoteImgToSvg(img: string) {
    if (img && img.length > 4) {
        return `../img/emotes/${img.slice(0, -4)}.svg`;
    }
    return "";
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
            error,
        };
    }
    const emoteDef = EmoteDefs[userData.player_icon];
    const texture = emoteDef
        ? emoteImgToSvg(emoteDef.texture)
        : "../img/gui/player-gui.svg";
    let tmpSlug = userData.slug.toLowerCase();
    tmpSlug = tmpSlug.replace(userData.username.toLowerCase(), "");
    const tmpslugToShow =
        tmpSlug != ""
            ? battletagCensoring.getCensoredBattletag(`${userData.username}#${tmpSlug}`)
            : battletagCensoring.getCensoredBattletag(userData.username);
    const m = userData.slug;
    const profile = {
        username: battletagCensoring.getCensoredBattletag(userData.username),
        slugToShow: tmpslugToShow,
        slugUncensored: m,
        banned: userData.banned,
        avatarTexture: texture,
        wins: userData.wins,
        kills: userData.kills,
        games: userData.games,
        kpg: userData.kpg,
    };
    // Gather card data
    const addStat = (
        arr: { name: string; val: number | string }[],
        name: string,
        val: number | string,
    ) => {
        arr.push({
            name,
            val,
        });
    };
    const teamModes: Partial<TeamModes>[] = [];
    for (let i = 0; i < userData.modes.length; i++) {
        const mode = userData.modes[i];
        console.log({ mode });
        // Overall rank / rating not available yet
        const mid: { name: string; val: string }[] = [];
        addStat(mid, "Rating", "-");
        addStat(mid, "Rank", "-");
        const bot: { name: string; val: string }[] = [];
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
    const keys = Object.keys(TeamModeToString) as unknown as TeamMode[];
    for (let x = 0; x < keys.length; x++) {
        ((e) => {
            const teamMode = keys[e];
            if (
                !teamModes.find((x) => {
                    return x.teamMode == teamMode;
                })
            ) {
                teamModes.push({
                    teamMode,
                    games: 0,
                });
            }
        })(x);
    }
    teamModes.sort((a, b) => {
        return a.teamMode! - b.teamMode!;
    });
    for (let i = 0; i < teamModes.length; i++) {
        const teamMode = teamModes[i].teamMode!;
        teamModes[i].name = TeamModeToString[teamMode];
    }
    const gameModes = helpers.getGameModes();
    return {
        profile,
        error,
        teamModes,
        teamModeFilter,
        gameModes,
    };
}

//
// Query
//

const TeamModeToString: Record<TeamMode, string> = {
    [TeamMode.Solo]: "solo",
    [TeamMode.Duo]: "duo",
    [TeamMode.Squad]: "squad",
};
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
        if (this.inProgress) {
            return;
        }
        this.inProgress = true;
        this.error = false;
        $.ajax({
            url,
            type: "POST",
            data: JSON.stringify(args),
            contentType: "application/json; charset=utf-8",
            timeout: 10000,
            success: (data) => {
                this.data = data;
                this.dataValid = !!data;
            },
            error: () => {
                this.error = true;
                this.dataValid = false;
            },
            complete: () => {
                setTimeout(() => {
                    this.inProgress = false;
                    onComplete(this.error, this.data);
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
    el = $(templates.player());

    constructor(readonly app: App) {}

    getUrlParams() {
        const location = window.location.href;
        // const slug = (new RegExp("stats/([^/?#]+).*$").exec(location) || [])[1] || "";
        const slug = (location.match("stats/([^/?#]+).*$") || [])[1] || "";
        const interval = helpers.getParameterByName("t") || "all";
        const mapId = helpers.getParameterByName("mapId") || "-1";
        return {
            // move to variables with the same name.
            // params[1] || ""
            slug,
            interval,
            mapId,
        };
    }

    getGameByGameId(gameId: string) {
        return this.games.find((x) => {
            return x.summary.guid == gameId;
        });
    }

    load() {
        const getUrlParams = this.getUrlParams();
        const slug = getUrlParams.slug;
        const interval = getUrlParams.interval;
        const mapId = getUrlParams.mapId;
        this.loadUserStats(slug, interval, mapId);
        this.loadMatchHistory(slug, 0, 7);
        this.render();
    }

    loadUserStats(slug: string, interval: string, mapIdFilter: string) {
        const args = {
            slug,
            interval,
            mapIdFilter,
        };
        this.userStats.query("/api/user_stats", args, 0, () => {
            this.render();
            console.log("loaded");
        });
    }

    loadMatchHistory(slug: string, offset: number, teamModeFilter: number) {
        const args = {
            slug,
            offset,
            count: 10,
            teamModeFilter,
        };
        this.matchHistory.query(
            "/api/match_history",
            args,
            0,
            (_, data: MatchStats[]) => {
                const gameModes = helpers.getGameModes();
                const games = data || [];
                for (let s = 0; s < games.length; s++) {
                    ((e) => {
                        games[e].team_mode =
                            TeamModeToString[games[e].team_mode as unknown as TeamMode];
                        const gameMode = gameModes.find((x) => {
                            return x.mapId == games[e].map_id;
                        });
                        games[e].icon = gameMode ? gameMode.desc.icon : "";
                        this.games.push({
                            expanded: false,
                            summary: games[e],
                            data: null,
                            dataError: false,
                        });
                    })(s);
                }
                this.moreGamesAvailable = games.length >= 10;
                console.log({ games: this.games });
                this.render();
            },
        );
    }

    loadMatchData(gameId: string) {
        this.matchData.query(
            "/api/match_data",
            {
                gameId,
            },
            0,
            (err, data) => {
                const game = this.getGameByGameId(gameId);
                if (game) {
                    game.data = data;
                    game.dataError = err || !data;
                    console.log(this.games);
                }
                this.render();
            },
        );
    }

    toggleMatchData(gameId: string) {
        const game = this.getGameByGameId(gameId);
        if (!game) {
            return;
        }
        const wasExpanded = game.expanded;
        for (let i = 0; i < this.games.length; i++) {
            this.games[i].expanded = false;
        }
        game.expanded = !wasExpanded;
        if (!game.data && !game.dataError) {
            this.loadMatchData(gameId);
        }
        this.render();
    }

    onChangedParams() {
        const time = $("#player-time").val();
        const mapId = $("#player-map-id").val();
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        window.history.pushState("", "", `?t=${time}&mapId=${mapId}`);
        const params = this.getUrlParams();
        this.loadUserStats(params.slug, params.interval, params.mapId);
    }

    render() {
        const params = this.getUrlParams();
        // User stats
        let content: ReactElement | string = "";
        if (this.userStats.inProgress) {
            content = templates.loading({
                type: "player",
            })!;
        } else {
            const cardData = getPlayerCardData(
                this.userStats.data!,
                this.userStats.error,
                this.teamModeFilter,
            );
            // @ts-expect-error :dance:
            content = templates.playerCards(cardData);
        }
        this.el.find(".content").html(content);
        const timeSelector = this.el.find("#player-time");
        if (timeSelector) {
            timeSelector.val(params.interval);
            timeSelector.change(() => {
                this.onChangedParams();
            });
        }
        const mapIdSelector = this.el.find("#player-map-id");
        if (mapIdSelector) {
            mapIdSelector.val(params.mapId);
            mapIdSelector.change(() => {
                this.onChangedParams();
            });
        } // Match history
        let historyContent: ReactElement | string = "";
        if (this.games.length == 0 && this.matchHistory.inProgress) {
            historyContent = templates.loading({
                type: "match_history",
            })!;
        } else {
            historyContent = templates.matchHistory({
                games: this.games,
                moreGamesAvailable: this.moreGamesAvailable,
                loading: this.matchHistory.inProgress,
                error: this.matchHistory.error,
            });
        }
        const historySelector = this.el.find("#match-history");
        if (historySelector) {
            historySelector.html(historyContent);
            $(".js-match-data").click((e) => {
                if (!$(e.target).is("a")) {
                    this.toggleMatchData($(e.currentTarget).data("game-id"));
                }
            });
            $(".js-match-load-more").click((_a) => {
                const params = this.getUrlParams();
                this.loadMatchHistory(
                    params.slug,
                    this.games.length,
                    this.teamModeFilter,
                );
                this.render();
            });
            $(".extra-team-mode-filter").click((e) => {
                if (!this.matchHistory.inProgress) {
                    const params = this.getUrlParams();
                    this.games = [];
                    this.teamModeFilter = $(e.currentTarget).data("filter");
                    this.loadMatchHistory(params.slug, 0, this.teamModeFilter);
                    this.render();
                }
            });

            // Match data
            let matchDataContent: ReactElement | string = "";
            const expandedGame = this.games.find((x) => {
                return x.expanded;
            });
            if (expandedGame) {
                const params = this.getUrlParams();
                let localId = 0;
                // Get this player's player_id in this match
                if (expandedGame.data) {
                    for (let i = 0; i < expandedGame.data.length; i++) {
                        const d = expandedGame.data[i];
                        if (params.slug == d.slug) {
                            localId = d.player_id || 0;
                            break;
                        }
                    }
                }
                matchDataContent = templates.matchData({
                    data: expandedGame.data!,
                    error: expandedGame.dataError,
                    loading: this.matchData.inProgress,
                    localId,
                });
            }
            $("#match-data").html(matchDataContent);
        }
        // this.app.localization.localizeIndex()
    }
}

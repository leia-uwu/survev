import $ from "jquery";
// TODO(performance): only load needed bootstrap components
import 'bootstrap'
import slugify from "slugify";
import { device } from "../../device";
import language from "./templates/langauge.ejs?raw";
import { Localization } from "./localization";
import { MainView } from "./mainView";
import { PlayerView } from "./playerView";

import { ConfigManager } from "../../config";
import { renderEjs } from "./helper";

var templates = {
    language: (params: Record<string, any>) => renderEjs(language, params),
};

//
// Router
//
class Router {
    routes: { name: string; url: string }[] = [];

    constructor(readonly app: App) {
        var routeChange = this.onRouteChange.bind(this);
        window.addEventListener("load", routeChange);
    }
    addRoute(name: string, url: string) {
        this.routes.push({
            name: name,
            url: url,
        });
    }
    onRouteChange() {
        var location = window.location.href;
        var route = this.routes.find(function (r) {
            return location.match(new RegExp(r.url));
        });
        if (route) {
            this.app.setView(route.name);
        } else {
            this.app.setView();
        }
    }
}
//
// Ads
//
class Ads {
    slotIdToPlacement = {
        survivio_728x90_leaderboard_top: "survivio_728x90_leaderboard",
        survivio_300x250_leaderboard_top: "survivio_300x250_leaderboard",
        survivio_300x250_leaderboard_bottom: "survivio_300x250_leaderboard",
        survivio_728x90_playerprofile_top: "survivio_728x90_playerprofile",
        survivio_300x250_playerprofile_top: "survivio_300x250_playerprofile",
        survivio_300x250_playerprofile_bottom: "survivio_300x250_playerprofile",
    };
    showFreestarAds(_slotIds: unknown) {}
    getFreestarSlotPlacement(_slotId: unknown) {}
}

export class App {
    el = $("#content");
    mainView: MainView;
    playerView: PlayerView;
    config: ConfigManager;
    localization: Localization;
    view!: MainView | PlayerView;
    adManager: Ads;

    constructor() {
        this.mainView = new MainView(this);
        this.playerView = new PlayerView(this);
        var router = new Router(this);
        router.addRoute("player", "stats/([^/?#]+).*$");
        router.addRoute("main", "stats");

        $("#search-players").on("submit", function (e) {
            e.preventDefault();
            var name = $("#search-players :input").val() as string;
            var slug = slugify(name);
            window.location.href = `/stats/${slug}`;
        });

        // Load slug for "My Profile" link
        try {
            var config = JSON.parse(localStorage.getItem("surviv_config")!);
            if (config.profile && config.profile.slug) {
                $("#my-profile")
                    .css("display", "block")
                    .attr("href", `/stats/${config.profile.slug}`);
            }
        } catch (_err) {}
        // Ignore
        // Load config
        this.config = new ConfigManager();
        this.config.load(() => {});

        this.localization = new Localization();
        this.localization.setLocale(this.config.get("language"));
        this.localization.localizeIndex();

        this.adManager = new Ads();
    }
    setView(name?: string) {
        var phoneDetected = device.mobile && !device.tablet;
        var elAdsLeaderboardTop = $("#adsLeaderBoardTop");
        var elAdsLeaderboardBottom = $("#adsLeaderBoardBottom");
        var elAdsPlayerTop = $("#adsPlayerTop");
        var elAdsPlayerBottom = $("#adsPlayerBottom");
        var premiumPass = localStorage.getItem("premium");

        if (name == "player") {
            elAdsLeaderboardTop.css("display", "none");
            elAdsLeaderboardBottom.css("display", "none");
            if (phoneDetected) {
                elAdsPlayerTop.css("display", "none");
                elAdsPlayerBottom.css("display", "block");
            } else {
                elAdsPlayerTop.css("display", "block");
                elAdsPlayerBottom.css("display", "none");
            }
            this.view = this.playerView;
        } else {
            elAdsPlayerTop.css("display", "none");
            elAdsPlayerBottom.css("display", "none");

            if (phoneDetected) {
                elAdsLeaderboardTop.css("display", "none");
                elAdsLeaderboardBottom.css("display", "block");
            } else {
                elAdsLeaderboardTop.css("display", "block");
                elAdsLeaderboardBottom.css("display", "none");
            }
            this.view = this.mainView;
        }

        // show ads
        var slotIds = [];
        if (
            elAdsLeaderboardTop &&
            elAdsLeaderboardTop.css("display") != "none" &&
            premiumPass == "false"
        ) {
            slotIds.push("survivio_728x90_leaderboard_top");
            slotIds.push("survivio_300x250_leaderboard_top");
        }
        if (
            elAdsLeaderboardBottom &&
            elAdsLeaderboardBottom.css("display") != "none" &&
            premiumPass == "false"
        ) {
            slotIds.push("survivio_300x250_leaderboard_bottom");
        }
        if (
            elAdsPlayerTop &&
            elAdsPlayerTop.css("display") != "none" &&
            premiumPass == "false"
        ) {
            slotIds.push("survivio_728x90_playerprofile_top");
            slotIds.push("survivio_300x250_playerprofile_top");
        }
        if (
            elAdsPlayerBottom &&
            elAdsPlayerBottom.css("display") != "none" &&
            premiumPass == "false"
        ) {
            slotIds.push("survivio_300x250_playerprofile_bottom");
        }
        this.adManager.showFreestarAds(slotIds);

        this.view.load();
        this.el.html(this.view.el);
        this.render();
    }

    render() {
        var _this = this;
      
        $("#language-select").html(
            templates.language({
                code: this.localization.getLocale(),
            }),
        );
        // Listen for changes in language select
        $(".dropdown-language").off("click");
        $(".dropdown-language").on("click", (e) => {
            console.log({
              called: true,
              ele: $("#selected-language")
            })
            var el = e.target;
            var code = $(el).attr("value") as string;
            var _language = $(el).html();
            if (code) {
                // Set the config language
                $("#selected-language").html(code.toUpperCase());
                _this.localization.setLocale(code);
                _this.localization.localizeIndex();
                _this.config.set("language", code);
            }
        });

    }
}

export const app = new App();

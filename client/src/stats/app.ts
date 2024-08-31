import $ from "jquery";
import slugify from "slugify";
import { ConfigManager as Config } from "../config";
import { type Locale, Localization } from "../ui/localization";
import { MainView } from "./mainview";
import { PlayerView } from "./playerview";
import language from "./templates/language.jsx";

const templates = {
    language,
};
class Router {
    routes: { name: string; url: string }[] = [];

    constructor(readonly app: App) {
        this.app = app;
        const routeChange = this.onRouteChange.bind(this);
        window.addEventListener("load", routeChange);
    }

    addRoute(name: string, url: string) {
        this.routes.push({
            name,
            url,
        });
    }

    onRouteChange() {
        const location = window.location.href;
        const route = this.routes.find((r) => {
            return location.match(new RegExp(r.url));
        });
        if (route) {
            this.app.setView(route.name);
        } else {
            this.app.setView();
        }
    }
}
export class App {
    el = $("#content");
    mainView: MainView;
    playerView: PlayerView;
    config: Config;
    localization: Localization;
    view!: MainView | PlayerView;

    constructor() {
        this.mainView = new MainView(this);
        this.playerView = new PlayerView(this);
        const router = new Router(this);
        router.addRoute("player", "stats/([^/?#]+).*$");
        router.addRoute("main", "stats");
        $("#search-players").on("submit", (e) => {
            e.preventDefault();
            const name = $<HTMLElement>("#search-players :input").val() as string;
            const slug = slugify(name);
            window.location.href = `/stats/${slug}`;
        }); // Load slug for "My Profile" link
        try {
            const config = JSON.parse(localStorage.getItem("surviv_config")!);
            if (config.profile?.slug) {
                $("#my-profile")
                    .css("display", "block")
                    .attr("href", `/stats/${config.profile.slug}`);
            }
        } catch (_e) {}

        // Load config
        this.config = new Config();
        this.config.load(() => {});
        this.localization = new Localization();
        this.localization.setLocale(this.config.get("language")!);
        this.localization.localizeIndex();
    }

    setView(name?: string) {
        const _elAdsLeaderboardTop = $("#adsLeaderBoardTop");
        const _elAdsLeaderboardBottom = $("#adsLeaderBoardBottom");
        const _elAdsPlayerTop = $("#adsPlayerTop");
        const _elAdsPlayerBottom = $("#adsPlayerBottom");
        const _premiumPass = localStorage.getItem("premium");

        if (name == "player") {
            this.view = this.playerView;
        } else {
            this.view = this.mainView;
        }

        this.view.load();
        this.el.html(this.view.el as unknown as HTMLElement);
        this.render();
    }

    render() {
        $("#language-select").html(
            templates.language({
                code: this.localization.getLocale(),
            }),
        );

        // Listen for changes in language select
        $(".dropdown-language").off("click");
        $(".dropdown-language").on("click", (a) => {
            const el = a.target;
            const code = $(el).attr("value") as Locale;
            $(el).html();
            if (code) {
                // Set the config language
                $("#selected-language").html(code.toUpperCase());
                this.localization.setLocale(code);
                this.localization.localizeIndex();
                this.config.set("language", code);
            }
        });
    }
}

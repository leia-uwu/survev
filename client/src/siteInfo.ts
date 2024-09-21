import $ from "jquery";
import { MapDefs } from "../../shared/defs/mapDefs";
import { TeamMode } from "../../shared/gameConfig";
import { api } from "./api";
import type { ConfigManager } from "./config";
import { device } from "./device";
import type { Localization } from "./ui/localization";

interface Info {
    country: string;
    gitRevision: string;
    modes: Array<{
        mapName: string;
        teamMode: TeamMode;
        enabled: boolean;
    }>;
    pops: Record<
        string,
        {
            playerCount: string;
            l10n: string;
        }
    >;
    youtube: {
        name: string;
        link: string;
    };
    twitch: Array<{
        name: string;
        viewers: number;
        url: string;
        img: string;
    }>;
}

export class SiteInfo {
    info: Info = {} as Info;
    loaded = false;

    constructor(
        public config: ConfigManager,
        public localization: Localization,
    ) {
        this.config = config;
        this.localization = localization;
    }

    load() {
        const locale = this.localization.getLocale();
        const siteInfoUrl = api.resolveUrl(`/api/site_info?language=${locale}`);

        const mainSelector = $("#server-opts");
        const teamSelector = $("#team-server-opts");

        for (const region in GAME_REGIONS) {
            const data = GAME_REGIONS[region];
            const name = this.localization.translate(data.l10n);
            const elm = `<option value='${region}' data-l10n='${data.l10n}' data-label='${name}'>${name}</option>`;
            mainSelector.append(elm);
            teamSelector.append(elm);
        }

        $.ajax(siteInfoUrl).done((data, _status) => {
            this.info = data || {};
            this.loaded = true;
            this.updatePageFromInfo();
        });
    }

    getGameModeStyles() {
        const modeTypes = {
            [TeamMode.Solo]: "solo",
            [TeamMode.Duo]: "duo",
            [TeamMode.Squad]: "squad",
        };

        const availableModes = [];
        const modes = this.info.modes || [];
        for (let i = 0; i < modes.length; i++) {
            const mode = modes[i];
            const mapDef = (MapDefs[mode.mapName as keyof typeof MapDefs] || MapDefs.main)
                .desc;
            const buttonText = mapDef.buttonText
                ? mapDef.buttonText
                : modeTypes[mode.teamMode];
            availableModes.push({
                icon: mapDef.icon,
                buttonCss: mapDef.buttonCss,
                buttonText,
                enabled: mode.enabled,
            });
        }
        return availableModes;
    }

    updatePageFromInfo() {
        if (this.loaded) {
            const getGameModeStyles = this.getGameModeStyles();
            for (let i = 0; i < getGameModeStyles.length; i++) {
                const style = getGameModeStyles[i];
                const selector = `index-play-${style.buttonText}`;
                const btn = $(`#btn-start-mode-${i}`);
                btn.data("l10n", selector);
                btn.html(this.localization.translate(selector));
                if (style.icon || style.buttonCss) {
                    if (i == 0) {
                        btn.addClass("btn-custom-mode-no-indent");
                    } else {
                        btn.addClass("btn-custom-mode-main");
                    }
                    btn.addClass(style.buttonCss);
                    btn.css({
                        "background-image": `url(${style.icon})`,
                    });
                }
                const l = $(`#btn-team-queue-mode-${i}`);
                if (l.length) {
                    const c = `index-${style.buttonText}`;
                    l.data("l10n", c);
                    l.html(this.localization.translate(c));
                    if (style.icon) {
                        l.addClass("btn-custom-mode-select");
                        l.css({
                            "background-image": `url(${style.icon})`,
                        });
                    }
                }

                if (!style.enabled) {
                    btn.addClass("btn-disabled-main");
                }
            }

            // Region pops
            const pops = this.info.pops;
            if (pops) {
                const regions = Object.keys(pops);

                for (let i = 0; i < regions.length; i++) {
                    const region = regions[i];
                    const data = pops[region];
                    const sel = $("#server-opts").children(`option[value="${region}"]`);
                    const players = this.localization.translate("index-players");
                    sel.text(`${sel.data("label")} [${data.playerCount} ${players}]`);
                }
            }
            let hasTwitchStreamers = false;
            const featuredStreamersElem = $("#featured-streamers");
            const streamerList = $(".streamer-list");
            if (!device.mobile && this.info.twitch) {
                streamerList.empty();
                for (let i = 0; i < this.info.twitch.length; i++) {
                    const streamer = this.info.twitch[i];
                    const template = $("#featured-streamer-template").clone();
                    template
                        .attr("class", "featured-streamer streamer-tooltip")
                        .attr("id", "");
                    const link = template.find("a");
                    const text = this.localization.translate(
                        streamer.viewers == 1 ? "index-viewer" : "index-viewers",
                    );
                    link.html(
                        `${streamer.name} <span>${streamer.viewers} ${text}</span>`,
                    );
                    link.css("background-image", `url(${streamer.img})`);
                    link.attr("href", streamer.url);
                    streamerList.append(template);
                    hasTwitchStreamers = true;
                }
            }
            featuredStreamersElem.css(
                "visibility",
                hasTwitchStreamers ? "visible" : "hidden",
            );

            const featuredYoutuberElem = $("#featured-youtuber");
            const displayYoutuber = this.info.youtube;
            if (displayYoutuber) {
                $(".btn-youtuber")
                    .attr("href", this.info.youtube.link)
                    .html(this.info.youtube.name);
            }
            featuredYoutuberElem.css("display", displayYoutuber ? "block" : "none");
        }
    }
}

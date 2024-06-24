import $ from "jquery";
import { api } from "./api";
import { device } from "./device";
import { MapDefs } from "../../shared/defs/mapDefs";

export class SiteInfo {
    /**
     *
     * @param {import('./config').ConfigManager} config
     * @param {import('./ui/localization').Localization} localization
     */
    constructor(config, localization) {
        this.config = config;
        this.localization = localization;
        this.info = {};
        this.loaded = false;
    }

    load() {
        const locale = this.localization.getLocale();
        const siteInfoUrl = api.resolveUrl(`/api/site_info?language=${locale}`);

        $.ajax(siteInfoUrl).done((data, status) => {
            this.info = data || {};
            this.loaded = true;
            this.updatePageFromInfo();
        });
    }

    getGameModeStyles() {
        const modeTypes = {
            1: "solo",
            2: "duo",
            4: "squad"
        };
        const availableModes = [];
        const modes = this.info.modes || [];
        for (
            let i = 0;
            i < modes.length;
            i++
        ) {
            const mode = modes[i];
            const mapDef = (MapDefs[mode.mapName] || MapDefs.main).desc;
            const buttonText = mapDef.buttonText ? mapDef.buttonText : modeTypes[mode.teamMode];
            availableModes.push({
                icon: mapDef.icon,
                buttonCss: mapDef.buttonCss,
                buttonText
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
                btn.removeClass("btn-disabled");
                if (style.icon || style.buttonCss) {
                    if (i == 0) {
                        btn.addClass("btn-custom-mode-no-indent");
                    } else {
                        btn.addClass("btn-custom-mode-main");
                    }
                    btn.addClass(style.buttonCss);
                    btn.css({
                        "background-image": `url(${style.icon})`
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
                            "background-image": `url(${style.icon})`
                        });
                    }
                }
            }

            // Region pops
            const pops = this.info.pops;
            if (pops) {
                const regions = Object.keys(pops);
                for (
                    let i = 0;
                    i < regions.length;
                    i++
                ) {
                    const region = regions[i];
                    const count = pops[region];
                    const sel = $("#server-opts").children(
                        `option[value="${region}"]`
                    );
                    sel.text(`${sel.data("label")} [${count}]`);
                }
            }
            let hasTwitchStreamers = false;
            const featuredStreamersElem = $("#featured-streamers");
            const streamerList = $(".streamer-list");
            if (!device.mobile && this.info.twitch) {
                streamerList.empty();
                for (let i = 0; i < this.info.twitch.length; i++) {
                    const streamer = this.info.twitch[i];
                    const template = $(
                        "#featured-streamer-template"
                    ).clone();
                    template.attr(
                        "class",
                        "featured-streamer streamer-tooltip"
                    ).attr("id", "");
                    const link = template.find("a");
                    const text = this.localization.translate(
                        streamer.viewers == 1
                            ? "index-viewer"
                            : "index-viewers"
                    );
                    link.html(
                        `${streamer.name} <span>${streamer.viewers} ${text}</span>`
                    );
                    link.css("background-image", `url(${streamer.img})`);
                    link.attr("href", streamer.url);
                    streamerList.append(template);
                    hasTwitchStreamers = true;
                }
            }
            featuredStreamersElem.css("visibility", hasTwitchStreamers ? "visible" : "hidden");

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

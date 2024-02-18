import $ from "jquery";
import api from "./api";
import device from "./device";
import { MapDefs } from "../../shared/defs/mapDefs";

// const privacy = r("privacy.js");


function SiteInfo(e, t) {
    this.config = e;
    this.localization = t;
    this.info = {};
    this.loaded = false;
}

SiteInfo.prototype = {
    load: function() {
        const e = this;
        const t = this.localization.getLocale();
        const r = api.resolveUrl(`/api/site_info?language=${t}`);
        $.ajax(r).done((t, r) => {
            e.info = t || {};
            e.loaded = true;
            e.updatePageFromInfo();
        });
    },
    getGameModeStyles: function() {
        var e = {
            1: "solo",
            2: "duo",
            4: "squad"
        };
        var t = [];
        for (
            var r = this.info.modes || [], a = 0;
            a < r.length;
            a++
        ) {
            const i = r[a];
            const o = (MapDefs[i.mapName] || MapDefs.main).desc;
            const s = o.buttonText ? o.buttonText : e[i.teamMode];
            t.push({
                icon: o.icon,
                buttonCss: o.buttonCss,
                buttonText: s
            });
        }
        return t;
    },
    updatePageFromInfo: function() {
        if (this.loaded) {
            for (
                let e = this.getGameModeStyles(), t = 0;
                t < e.length;
                t++
            ) {
                const r = e[t];
                const a = `index-play-${r.buttonText}`;
                const o = $(`#btn-start-mode-${t}`);
                o.data("l10n", a);
                o.html(this.localization.translate(a));
                if (r.icon || r.buttonCss) {
                    if (t == 0) {
                        o.addClass("btn-custom-mode-no-indent");
                    } else {
                        o.addClass("btn-custom-mode-main");
                    }
                    o.addClass(r.buttonCss);
                    o.css({
                        "background-image": `url(${r.icon})`
                    });
                }
                const l = $(`#btn-team-queue-mode-${t}`);
                if (l.length) {
                    const c = `index-${r.buttonText}`;
                    l.data("l10n", c);
                    l.html(this.localization.translate(c));
                    if (r.icon) {
                        l.addClass("btn-custom-mode-select");
                        l.css({
                            "background-image": `url(${r.icon})`
                        });
                    }
                }
            }
            const m = this.info.pops;
            if (m) {
                for (
                    let p = Object.keys(m), h = 0;
                    h < p.length;
                    h++
                ) {
                    const d = p[h];
                    const u = m[d];
                    const g = $("#server-opts").children(
                        `option[value="${d}"]`
                    );
                    g.text(`${g.data("label")} [${u}]`);
                }
            }
            let y = false;
            const w = $("#featured-streamers");
            const f = $(".streamer-list");
            if (!device.mobile && this.info.twitch) {
                f.empty();
                for (let _ = 0; _ < this.info.twitch.length; _++) {
                    const b = this.info.twitch[_];
                    const x = $(
                        "#featured-streamer-template"
                    ).clone();
                    x.attr(
                        "class",
                        "featured-streamer streamer-tooltip"
                    ).attr("id", "");
                    const S = x.find("a");
                    const v = this.localization.translate(
                        b.viewers == 1
                            ? "index-viewer"
                            : "index-viewers"
                    );
                    S.html(
                        `${b.name} <span>${b.viewers} ${v}</span>`
                    );
                    S.css("background-image", `url(${b.img})`);
                    S.attr("href", b.url);
                    f.append(x);
                    y = true;
                }
            }
            w.css("visibility", y ? "visible" : "hidden");
            const k = $("#featured-youtuber");
            const z = this.info.youtube;
            if (z) {
                $(".btn-youtuber")
                    .attr("href", this.info.youtube.link)
                    .html(this.info.youtube.name);
            }
            k.css("display", z ? "block" : "none");
            if (this.info.promptConsent) {
                // privacy.showCookieConsent(this.config);
            }
            if (window.adsBlocked) {
                const I = ["US", "GB", "DE"];
                const T = ["en", "en", "de"];
                const M = [
                    "https://www.amazon.com/s?rh=n%3A7141123011%2Cp_4%3Asurviv.io&ref=w_bl_sl_s_ap_web_7141123011",
                    "https://www.amazon.co.uk/s?rh=n%3A83450031%2Cp_4%3Asurviv.io&ref=w_bl_sl_s_ap_web_83450031",
                    "https://www.amazon.de/s?rh=n%3A77028031%2Cp_4%3Asurviv.io&ref=w_bl_sl_s_ap_web_77028031"
                ];
                const P = I.indexOf(this.info.country);
                if (P != -1) {
                    const C = $(".surviv-shirts");
                    if (C) {
                        const A = `surviv-shirts-${T[P]}`;
                        C.addClass(`surviv-shirts ${A}`);
                        C.find("a").attr("href", M[P]);
                        $("#ad-block-left")
                            .find(".surviv-shirts")
                            .css("display", "block");
                    }
                    $(".adblock-plea").remove();
                } else {
                    const O =
                        $("#ad-block-left").find(".adblock-plea");
                    if (O) {
                        O.addClass("adblock-plea");
                        O.css("display", "block");
                    }
                    $(".surviv-shirts").remove();
                }
                const D = document.getElementById(
                    "survivio_300x250_main"
                );
                if (D) {
                    D.style.display = "none";
                }
                const E =
                    document.getElementById("surviv-io_300x250");
                if (E) {
                    E.style.display = "none";
                }
            }
        }
    }
};
export default SiteInfo;

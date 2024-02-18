import $ from "jquery";
import api from "./api";
import device from "./device";
import english from "./english";

function a(e, t) {
    const r = {
        url: api.resolveUrl(e),
        type: "GET"
    };
    $.ajax(r)
        .done((e) => {
            t(null, e);
        })
        .fail((e) => {
            t(e);
        });
}
function Localization() {
    this.acceptedLocales = Object.keys(c);
    this.translations = {};
    this.translations.en = english;
    this.locale = "en";
}

var c = {
    da: "Dansk",
    de: "Deutsch",
    en: "English",
    es: "Español",
    fr: "Français",
    it: "Italiano",
    nl: "Nederlands",
    pl: "Polski",
    pt: "Português",
    ru: "Русский",
    sv: "Svenska",
    vn: "Tiếng Việt",
    tr: "Türkçe",
    jp: "日本語",
    ko: "한국어",
    th: "ภาษาไทย",
    "zh-cn": "中文简体",
    "zh-tw": "中文繁體"
};
Localization.prototype = {
    detectLocale: function() {
        var e = (
            navigator.language || navigator.userLanguage
        ).toLowerCase();
        for (
            var t = ["pt", "de", "es", "fr", "ko", "ru", "en"],
            r = 0;
            r < t.length;
            r++
        ) {
            if (e.indexOf(t[r]) != -1) {
                e = t[r];
                break;
            }
        }
        for (let a = 0; a < this.acceptedLocales.length; a++) {
            if (e.indexOf(this.acceptedLocales[a]) != -1) {
                return this.acceptedLocales[a];
            }
        }
        return "en";
    },
    setLocale: function(e) {
        const t = this;
        const r = this.acceptedLocales.includes(e) ? e : "en";
        if (r != this.locale) {
            if (this.translations[e] === undefined) {
                a(`/l10n/${e}.json`, (r, a) => {
                    if (r) {
                        console.error(
                            `Failed loading translation data for locale ${e}`
                        );
                        return;
                    }
                    t.translations[e] = a;
                    t.setLocale(e);
                });
            } else {
                this.locale = r;
                this.localizeIndex();
            }
        }
    },
    getLocale: function() {
        return this.locale;
    },
    translate: function(e) {
        return (
            this.translations[this.locale][e] ||
            this.translations.en[e] ||
            ""
        );
    },
    localizeIndex: function() {
        const e = this;
        $("*[data-l10n]").each((t, r) => {
            const a = $(r);
            let i = a.attr("data-l10n");
            if (a.hasClass("help-control") && device.touch) {
                i += "-touch";
            }
            const s = e.translate(i);
            if (s) {
                if (a.attr("label")) {
                    a.attr("label", s);
                } else {
                    a.html(s);
                    if (a.attr("data-label")) {
                        a.attr("data-label", s);
                    }
                }
            }
        });
    },
    populateLanguageSelect: function() {
        const e = $(".language-select");
        e.empty();
        for (let t = Object.keys(c), r = 0; r < t.length; r++) {
            const a = t[r];
            const i = c[a];
            e.append(
                $("<option>", {
                    value: a,
                    text: i
                })
            );
        }
    }
};
export default Localization;

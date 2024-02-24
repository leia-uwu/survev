import $ from "jquery";
import api from "./api";
import device from "./device";
import english from "./english";

function downloadFile(file, onComplete) {
    const opts = {
        url: api.resolveUrl(file),
        type: "GET"
    };
    $.ajax(opts)
        .done((data) => {
            onComplete(null, data);
        })
        .fail((err) => {
            onComplete(err);
        });
}
function Localization() {
    this.acceptedLocales = Object.keys(Locales);
    this.translations = {};
    this.translations.en = english;
    this.locale = "en";
}

const Locales = {
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
        let detectedLocale = (
            navigator.language || navigator.userLanguage
        ).toLowerCase();
        let languageWildcards = ["pt", "de", "es", "fr", "ko", "ru", "en"];
        for (
            let i = 0;
            i < languageWildcards.length;
            i++
        ) {
            if (detectedLocale.indexOf(languageWildcards[i]) != -1) {
                detectedLocale = languageWildcards[i];
                break;
            }
        }
        for (let i = 0; i < this.acceptedLocales.length; i++) {
            if (detectedLocale.indexOf(this.acceptedLocales[i]) != -1) {
                return this.acceptedLocales[i];
            }
        }
        return "en";
    },
    setLocale: function(locale) {
        const _this = this;
        const newLocale = this.acceptedLocales.includes(locale) ? locale : "en";
        if (newLocale != this.locale) {
            if (this.translations[locale] === undefined) {
                downloadFile(`/l10n/${locale}.json`, (err, data) => {
                    if (err) {
                        console.error(
                            `Failed loading translation data for locale ${locale}`
                        );
                        return;
                    }
                    _this.translations[locale] = data;
                    _this.setLocale(locale);
                });
            } else {
                this.locale = newLocale;
                this.localizeIndex();
            }
        }
    },
    getLocale: function() {
        return this.locale;
    },

    translate: function(key) {
        return (
            this.translations[this.locale][key] ||
            this.translations.en[key] ||
            ""
        );
    },
    localizeIndex: function() {
        const _this = this;
        const localizedElements = $("*[data-l10n]");
        localizedElements.each((idx, el) => {
            const el$ = $(el);
            let datal10n = el$.attr("data-l10n");
            if (el$.hasClass("help-control") && device.touch) {
                datal10n += "-touch";
            }
            const localizedText = _this.translate(datal10n);
            if (localizedText) {
                if (el$.attr("label")) {
                    el$.attr("label", localizedText);
                } else {
                    el$.html(localizedText);
                    if (el$.attr("data-label")) {
                        el$.attr("data-label", localizedText);
                    }
                }
            }
        });
    },
    populateLanguageSelect: function() {
        const el = $(".language-select");
        el.empty();
        let locales = Object.keys(Locales);
        for ( let i = 0; i < locales.length; i++) {
            const locale = locales[i];
            const name = Locales[locale];
            el.append(
                $("<option>", {
                    value: locale,
                    text: name
                })
            );
        }
    }
};
export default Localization;

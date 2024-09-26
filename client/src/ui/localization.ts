import $ from "jquery";
import { device } from "../device";
import english from "../en.json";

function downloadFile(
    file: string,
    onComplete: (err: null | JQuery.jqXHR<any>, data?: Record<string, string>) => void,
) {
    const opts = {
        url: file,
        type: "GET",
    };
    $.ajax(opts)
        .done((data) => {
            onComplete(null, data);
        })
        .fail((err) => {
            onComplete(err);
        });
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
    "zh-tw": "中文繁體",
};

export type Locale = keyof typeof Locales;

export class Localization {
    readonly acceptedLocales: Locale[] = Object.keys(Locales) as Locale[];
    translations: Record<string, Record<string, string>> = {
        en: english,
    };

    locale: Locale = "en";

    constructor() {
        this.locale = "en";
    }

    detectLocale() {
        let detectedLocale = (navigator.language || navigator.userLanguage).toLowerCase();
        const languageWildcards = ["pt", "de", "es", "fr", "ko", "ru", "en"];
        for (let i = 0; i < languageWildcards.length; i++) {
            if (detectedLocale.includes(languageWildcards[i])) {
                detectedLocale = languageWildcards[i];
                break;
            }
        }
        for (let i = 0; i < this.acceptedLocales.length; i++) {
            if (detectedLocale.includes(this.acceptedLocales[i])) {
                return this.acceptedLocales[i];
            }
        }
        return "en";
    }

    setLocale(locale: Locale) {
        const newLocale = this.acceptedLocales.includes(locale) ? locale : "en";
        if (newLocale != this.locale) {
            if (this.translations[locale] === undefined) {
                downloadFile(`/l10n/${locale}.json`, (err, data) => {
                    if (err) {
                        console.error(
                            `Failed loading translation data for locale ${locale}`,
                        );
                        return;
                    }
                    this.translations[locale] = data!;
                    this.setLocale(locale);
                });
            } else {
                this.locale = newLocale;
                this.localizeIndex();
            }
        }
    }

    getLocale() {
        return this.locale;
    }

    translate(key: string) {
        return this.translations[this.locale][key] || this.translations.en[key] || "";
    }

    localizeIndex() {
        const localizedElements = $("*[data-l10n]");
        localizedElements.each((_idx, el) => {
            const el$ = $(el);
            let datal10n = el$.attr("data-l10n")!;
            if (el$.hasClass("help-control") && device.touch) {
                datal10n += "-touch";
            }
            const localizedText = this.translate(datal10n);
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
    }

    populateLanguageSelect() {
        const el = $(".language-select");
        el.empty();
        for (let i = 0; i < this.acceptedLocales.length; i++) {
            const locale = this.acceptedLocales[i];
            const name = Locales[locale];
            el.append(
                $("<option>", {
                    value: locale,
                    text: name,
                }),
            );
        }
    }
}

import $ from "jquery";
import EnJs from "../l10n/en";
import EsJs from "../l10n/es";

export type AcceptedLocales = "en" | "es";

const map = {
    en: EnJs,
    es: EsJs,
};

//
// Localization functions
//
export class Localization {
    acceptedLocales: AcceptedLocales[] = ["en", "es"];
    locale: AcceptedLocales = "en";
    translations = {} as Record<AcceptedLocales, Record<string, string>>;

    constructor() {
        for (let i = 0; i < this.acceptedLocales.length; i++) {
            const locale = this.acceptedLocales[i];
            let translation = {};
            try {
                translation = map[locale];
            } catch (_err) {
                console.log("localization not found", locale);
            }
            this.translations[locale] = translation;
        }
    }
    setLocale(locale: Localization["acceptedLocales"][number]) {
        this.locale = this.acceptedLocales.indexOf(locale) != -1 ? locale : "en";
    }
    getLocale() {
        return this.locale;
    }
    translate(key: string) {
        // Also try spaces as dashes
        const spacedKey = key.replace(" ", "-");
        return (
            this.translations[this.locale][key] ||
            this.translations[this.locale][spacedKey] ||
            this.translations["en"][key] ||
            ""
        );
    }
    localizeIndex() {
        // Go through index and replace data-l10n tagged elements
        const localizedElements = $("*[data-l10n]");
        localizedElements.each((_idx, el): any => {
            const el$ = $(el);
            const datal10n = el$.attr("data-l10n")!;
            let localizedText = this.translate(datal10n);
            if (localizedText) {
                if (el$.attr("data-caps") == "true") {
                    localizedText = localizedText.toUpperCase();
                }
                if (el$.attr("label")) {
                    el$.attr("label", localizedText);
                    return true;
                }
                if (el$.attr("placeholder")) {
                    el$.attr("placeholder", localizedText);
                    return true;
                }
                el$.html(localizedText);
                if (el$.attr("data-label")) {
                    el$.attr("data-label", localizedText);
                }
            }
        });
    }
}

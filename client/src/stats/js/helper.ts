import ejs from "ejs";
import EnJs from "../l10n/en";

export function getCensoredBattletag(content: string) {
    if (content) {
        // @ts-expect-error can't bother
        var words = EnJs?.words || [];

        var asterisk = "*";

        var re = new RegExp(words.join("|"), "ig");
        var newString = content.replace(re, function (matched) {
            return asterisk.repeat(matched.length);
        });

        return newString;
    }
    return content;
}

//
// Helpers
//

export function formatTime(time: number) {
    var minutes = Math.floor(time / 60) % 60;
    var seconds: string | number = Math.floor(time) % 60;
    if (seconds < 10) {
        seconds = `0${seconds}`;
    }
    var timeSurv = "";
    timeSurv += `${minutes}:`;
    timeSurv += seconds;
    return timeSurv;
}

export function emoteImgToSvg(img: string) {
    return img && img.length > 4 ? `../img/emotes/${img.slice(0, -4)}.svg` : "";
}

export function renderEjs(template: string, params: Record<string, any>) {
    return ejs.render(template, params, { client: true });
}

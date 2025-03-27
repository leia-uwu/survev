import EnJs from "../l10n/en";

export function getCensoredBattletag(content: string) {
    if (content) {
        // @ts-expect-error can't bother
        const words = EnJs?.words || [];

        const asterisk = "*";

        const re = new RegExp(words.join("|"), "ig");
        const newString = content.replace(re, (matched) =>
            asterisk.repeat(matched.length),
        );

        return newString;
    }
    return content;
}

//
// Helpers
//

export function formatTime(time: number) {
    const minutes = Math.floor(time / 60) % 60;
    let seconds: string | number = Math.floor(time) % 60;
    if (seconds < 10) {
        seconds = `0${seconds}`;
    }
    let timeSurv = "";
    timeSurv += `${minutes}:`;
    timeSurv += seconds;
    return timeSurv;
}

export function emoteImgToSvg(img: string) {
    return img && img.length > 4 ? `../img/emotes/${img.slice(0, -4)}.svg` : "";
}

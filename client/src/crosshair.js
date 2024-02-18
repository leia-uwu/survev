import $ from "jquery"
import { util } from "../../shared/utils/util";
import { CrosshairDefs } from "../../shared/defs/gameObjects/crosshairDefs";

function a(e) {
    const t = {
        width: 64,
        height: 64
    };
    return {
        width: Math.round((t.width * e.size) / 4) * 4,
        height: Math.round((t.height * e.size) / 4) * 4
    };
}
function i(e) {
    const t = CrosshairDefs[e.type];
    const r = a(e);
    const i = util.rgbToHex(util.intToRgb(e.color));
    const o = e.stroke;
    let s = t.code.replace(/white/g, i);
    s = s.replace(/stroke-width=".5"/g, `stroke-width="${o}"`);
    s = s.replace(/width="64"/g, `width="${r.width}"`);
    s = s.replace(/height="64"/g, `height="${r.height}"`);
    return `url('data:image/svg+xml;utf8,${(s = s.replace(
        /#/g,
        "%23"
    ))}')`;
}
function o(e) {
    const t = a(e);
    return `${i(e)} ${t.width / 2} ${t.height / 2}, crosshair`;
}

const crosshair = {
    getCursorURL: function(e) {
        return i(e);
    },
    setElemCrosshair: function(e, t) {
        let r = "crosshair";
        const a = CrosshairDefs[t.type];
        if (a) {
            r = a.cursor ? a.cursor : o(t);
        }
        e.css({
            cursor: r
        });
    },
    setGameCrosshair: function(e) {
        crosshair.setElemCrosshair($("#game-area-wrapper"), e);
        const t = CrosshairDefs[e.type];
        const r = !t || t.cursor ? "pointer" : "inherit";
        $(
            ".ui-zoom, .ui-medical, .ui-settings-button, .ui-weapon-switch"
        ).css({
            cursor: r
        });
    }
};
export default crosshair;

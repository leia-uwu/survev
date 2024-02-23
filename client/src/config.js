import { util } from "../../shared/utils/util";
import device from "./device";
import loadout from "./loadouts";
import webview from "./webview";

const defaultConfig = {
    muteAudio: false,
    masterVolume: 1,
    soundVolume: 1,
    musicVolume: 1,
    highResTex: true,
    screenShake: true,
    anonPlayerNames: false,
    touchMoveStyle: "anywhere",
    touchAimStyle: "anywhere",
    touchAimLine: true,
    profile: null,
    playerName: "",
    region: "na",
    gameModeIdx: 2,
    teamAutoFill: true,
    language: "",
    prerollGamesPlayed: 0,
    totalGamesPlayed: 0,
    promptAppRate: true,
    cookiesConsented: true,
    regionSelected: false,
    lastNewsTimestamp: 0,
    perkModeRole: "",
    loadout: loadout.defaultLoadout()
};
export default class ConfigManager {
    constructor() {
        this.loaded = false;
        this.localStorageAvailable = true;
        this.config = {};
        this.onModifiedListeners = [];
    }

    load(e) {
        const t = this;
        const r = function(r) {
            let a = {};
            try {
                a = JSON.parse(r);
            } catch (e) { }
            t.config = util.mergeDeep({}, defaultConfig, a);
            t.checkUpgradeConfig();
            t.onModified();
            t.loaded = true;
            e();
        };
        if (device.webview && webview.hasNativeStorage()) {
            webview.storageGetItem("surviv_config", (e, t) => {
                if (e) {
                    console.log("Failed loading config");
                    r({});
                } else {
                    r(t);
                }
            });
        } else {
            let a = {};
            try {
                a = localStorage.getItem("surviv_config");
            } catch (e) {
                this.localStorageAvailable = false;
            }
            r(a);
        }
    }

    store() {
        const e = JSON.stringify(this.config);
        if (device.webview && webview.hasNativeStorage()) {
            webview.storageSetItem("surviv_config", e, (e, t) => {
                if (e) {
                    console.log("Failed storing config");
                }
            });
        } else if (this.localStorageAvailable) {
            try {
                localStorage.setItem("surviv_config", e);
            } catch (e) { }
        }
    }

    set(key, value) {
        if (!key) {
            return;
        }
        const path = key.split(".");
        let elem = this.config;
        while (path.length > 1) {
            elem = elem[path.shift()];
        }
        elem[path.shift()] = value;

        this.store();
        this.onModified(key);
    }

    get(key) {
        if (!key) {
            return undefined;
        }

        const path = key.split(".");
        let elem = this.config;
        for (let i = 0; i < path.length; i++) {
            elem = elem[path[i]];
        }
        return elem;
    }

    addModifiedListener(e) {
        this.onModifiedListeners.push(e);
    }

    onModified(e) {
        for (
            let t = 0;
            t < this.onModifiedListeners.length;
            t++
        ) {
            this.onModifiedListeners[t](e);
        }
    }

    checkUpgradeConfig() {
        this.get("version");
        this.set("version", 1);
    }
}

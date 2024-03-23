import { util } from "../../shared/utils/util";
import loadout from "./ui/loadouts";

const defaultConfig = {
    muteAudio: false,
    masterVolume: 1,
    soundVolume: 1,
    musicVolume: 1,
    highResTex: true,
    showFps: false,
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
export class ConfigManager {
    constructor() {
        this.loaded = false;
        this.localStorageAvailable = true;
        this.config = {};
        this.onModifiedListeners = [];
    }

    load(onLoadCompleteCb) {
        const onLoaded = (strConfig) => {
            let data = {};
            try {
                data = JSON.parse(strConfig);
            } catch (e) { }
            this.config = util.mergeDeep({}, defaultConfig, data);
            this.checkUpgradeConfig();
            this.onModified();
            this.loaded = true;
            onLoadCompleteCb();
        };
        let storedConfig = {};
        try {
            storedConfig = localStorage.getItem("surviv_config");
        } catch (err) {
            this.localStorageAvailable = false;
        }
        onLoaded(storedConfig);
    }

    store() {
        const strData = JSON.stringify(this.config);
        if (this.localStorageAvailable) {
            // In browsers, like Safari, localStorage setItem is
            // disabled in private browsing mode.
            // This try/catch is here to handle that situation.
            try {
                localStorage.setItem("surviv_config", strData);
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

    onModified(key) {
        for (
            let i = 0;
            i < this.onModifiedListeners.length;
            i++
        ) {
            this.onModifiedListeners[i](key);
        }
    }

    checkUpgradeConfig() {
        this.get("version");
        this.set("version", 1);
    }
}

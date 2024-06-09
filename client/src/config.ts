import { util } from "../../shared/utils/util";
import loadout from "./ui/loadouts";
import { type Locale } from "./ui/localization";

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
    language: "en" as Locale,
    prerollGamesPlayed: 0,
    totalGamesPlayed: 0,
    promptAppRate: true,
    cookiesConsented: true,
    regionSelected: false,
    lastNewsTimestamp: 0,
    perkModeRole: "",
    loadout: loadout.defaultLoadout(),
    version: 1
};

export class ConfigManager {
    loaded = false;
    localStorageAvailable = true;
    config = {} as typeof defaultConfig;
    onModifiedListeners: Array<(key?: string) => void> = [];

    load(onLoadCompleteCb: () => void) {
        const onLoaded = (strConfig: string) => {
            let data = {};
            try {
                data = JSON.parse(strConfig);
            } catch (e) {}
            this.config = util.mergeDeep({}, defaultConfig, data);
            this.checkUpgradeConfig();
            this.onModified();
            this.loaded = true;
            onLoadCompleteCb();
        };
        let storedConfig: string | null = "{}";
        try {
            storedConfig = localStorage.getItem("surviv_config")!;
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
            } catch (e) {}
        }
    }

    //! ~~ need some work
    // set<T extends keyof typeof defaultConfig>(key: T, value: unknown) {
    set(key: string, value: unknown) {
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

    // get<T extends keyof typeof this.config>(key: T): typeof this.config[T] | undefined {
    get(key: string) {
        if (!key) {
            return undefined;
        }

        const path = key.split(".");
        let elem = this.config as any;
        for (let i = 0; i < path.length; i++) {
            elem = elem[path[i]];
        }
        return elem;
    }

    addModifiedListener(e: (key?: string) => void) {
        this.onModifiedListeners.push(e);
    }

    onModified(key?: string) {
        for (let i = 0; i < this.onModifiedListeners.length; i++) {
            this.onModifiedListeners[i](key);
        }
    }

    checkUpgradeConfig() {

    // seem not to be implemeted yet
    // this.get("version");
    // // @TODO: Put upgrade code here
    // this.set("version", 1);
    }
}

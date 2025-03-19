import $ from "jquery";
import { GameObjectDefs } from "../../shared/defs/gameObjectDefs";
import { GameConfig } from "../../shared/gameConfig";
import { EditMsg } from "../../shared/net/editMsg";
import { math } from "../../shared/utils/math";
import { util } from "../../shared/utils/util";
import type { ConfigKey, ConfigManager } from "./config";
import { type InputHandler, Key } from "./input";
import type { Map } from "./map";
import type { Player } from "./objects/player";

export class Editor {
    config: ConfigManager;
    enabled = false;
    zoom = GameConfig.scopeZoomRadius.desktop["1xscope"];
    loadNewMap = false;
    mapSeed = 0;
    printLootStats = false;
    spawnLootType = "";

    sendMsg = false;

    uiPos!: JQuery;
    uiZoom!: JQuery;
    uiMapSeed!: JQuery;

    constructor(config: ConfigManager) {
        this.config = config;
        this.config.addModifiedListener(this.onConfigModified.bind(this));

        this.setEnabled(false);
    }

    onConfigModified(_key?: string) {
        this.refreshUi();
    }

    setEnabled(e: boolean) {
        this.enabled = e;
        this.refreshUi();
    }

    newMap(seed: number) {
        this.loadNewMap = true;
        this.mapSeed = Math.max(seed, 1);
        this.sendMsg = true;
    }

    refreshUi() {
        const e = this.enabled;

        $("#ui-editor").css("display", e ? "block" : "none");
        $("#ui-leaderboard-wrapper,#ui-right-center,#ui-kill-leader-container").css(
            "display",
            !e ? "block" : "none",
        );

        this.uiPos = $("<div/>");
        this.uiZoom = $("<div/>");

        const createButton = (text: string, fn: () => void) => {
            const btn = $("<div/>", {
                class: "btn-game-menu btn-darken",
                css: {
                    height: "30px",
                    "line-height": "28px",
                },
                html: text,
            });
            btn.on("click", (e) => {
                e.stopPropagation();
                fn();
            });
            return btn;
        };

        this.uiMapSeed = $("<div/>");
        const mapBtns = $("<div/>", {
            css: { display: "flex" },
        });
        mapBtns.append(
            createButton("<", () => {
                this.newMap(this.mapSeed - 1);
            }),
        );
        mapBtns.append($("<span/>", { css: { width: "12px" } }));
        mapBtns.append(
            createButton(">", () => {
                this.newMap(this.mapSeed + 1);
            }),
        );
        mapBtns.append($("<span/>", { css: { width: "12px" } }));
        mapBtns.append(
            createButton("?", () => {
                this.newMap(util.randomInt(1, 1 << 30));
            }),
        );

        const lootSummaryBtn = $("<div/>", {
            css: { display: "flex" },
        });
        lootSummaryBtn.append(
            createButton("Loot summary", () => {
                this.printLootStats = true;
                this.sendMsg = true;
            }),
        );

        const createLootUi = $("<div/>", {
            css: { display: "flex" },
        });
        const lootTypeInput = $<HTMLSelectElement>("<select/>", {
            css: {
                height: "30px",
                width: "180px",
                "line-height": "28px",
                "margin-top": "5px",
                "margin-bottom": "5px",
            },
        });

        const optGroups: Record<string, JQuery<HTMLOptGroupElement>> = {};
        for (const [type, def] of Object.entries(GameObjectDefs)) {
            if (!("lootImg" in def)) continue;

            let name = type;
            if ("name" in def && def.name !== name) {
                name = `${def.name} (${type})`;
            }

            const opt = $<HTMLOptionElement>("<option/>", {
                value: type,
                html: name,
            });

            let optGroup = optGroups[def.type];
            if (!optGroup) {
                optGroup = $("<optgroup/>", {
                    label: def.type,
                });
                lootTypeInput.append(optGroup);
                optGroups[def.type] = optGroup;
            }
            optGroup.append(opt);
        }
        createLootUi.append(lootTypeInput);
        createLootUi.append($("<span/>", { css: { width: "12px" } }));
        createLootUi.append(
            createButton("Spawn Loot", () => {
                this.spawnLootType = lootTypeInput.val() as string;
                this.sendMsg = true;
            }),
        );

        const createCheckbox = (_name: string, key: string) => {
            const check = $("<input/>", {
                type: "checkbox",
                value: "value",
                checked: this.config.get(key as ConfigKey),
            });
            check.on("click", (e) => {
                e.stopPropagation();

                const val = check.prop("checked");
                this.config.set(key as ConfigKey, val);
                this.sendMsg = true;
            });
            return check;
        };

        const createObjectUi = <T extends object = object>(obj: T, objKey: string) => {
            const parent = $("<ul/>", { class: "ui-editor-list" });
            if (objKey.split(".").length == 1) {
                parent.css("padding", "0px");
            }

            const keys = Object.keys(obj);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const val = obj[key as keyof T];
                const newKey = `${objKey}.${key}`;

                const elem = $("<li/>", { class: "ui-editor-list" });
                if (typeof val == "object") {
                    elem.html(`${key}`);
                    elem.append(createObjectUi(val as object, newKey));
                } else if (typeof val === "boolean") {
                    const check = createCheckbox(key, newKey);
                    const label = $("<div/>", {
                        css: { display: "inline-block" },
                        html: key,
                    });
                    elem.append(check);
                    elem.append(label);
                }
                parent.append(elem);
            }

            return parent;
        };

        const editorConfig = (this.config.get("debug" as ConfigKey) || {}) as object;
        const uiConfig = $("<div/>");
        uiConfig.append(createObjectUi(editorConfig, "debug"));

        // Ui
        const list = $("<div/>");
        list.append($("<li/>").append(this.uiPos));
        list.append($("<li/>").append(this.uiZoom));
        list.append($("<li/>").append($("<hr/>")));
        list.append($("<li/>").append(this.uiMapSeed));
        list.append($("<li/>").append(mapBtns));
        // list.append($("<li/>").append(lootSummaryBtn)); // not implemented yet
        list.append($("<li/>").append(createLootUi));
        list.append($("<li/>").append($("<hr/>")));
        list.append($("<li/>").append(uiConfig));

        list.on("mousedown", (e) => {
            e.stopImmediatePropagation();
        });
        list.on("wheel", (e) => {
            e.stopImmediatePropagation();
        });

        $("#ui-editor-info-list").html(list as unknown as JQuery.Node);
    }

    m_update(_dt: number, input: InputHandler, player: Player, map: Map) {
        // Camera zoom
        if (input.keyPressed(Key.Plus)) {
            this.zoom -= 8.0;
            this.sendMsg = true;
        }
        if (input.keyPressed(Key.Minus)) {
            this.zoom += 8.0;
            this.sendMsg = true;
        }
        if (input.keyPressed(Key.Zero)) {
            this.zoom = player.m_getZoom();
            this.sendMsg = true;
        }
        this.zoom = math.clamp(this.zoom, 1.0, 255.0);

        // Ui
        const posX = player.m_pos.x.toFixed(2);
        const posY = player.m_pos.y.toFixed(2);
        this.uiPos.html(`Pos:  ${posX}, ${posY}`);
        this.uiZoom.html(`Zoom: ${this.zoom}`);
        this.uiMapSeed.html(`Map seed: ${map.seed}`);

        if (!this.loadNewMap) {
            this.mapSeed = map.seed;
        }
    }

    getMsg() {
        const msg = new EditMsg();
        const debug = this.config.get("debug")!;
        msg.overrideZoom = debug.overrideZoom;
        msg.zoom = this.zoom;
        msg.cull = debug.cull;
        msg.printLootStats = this.printLootStats;
        msg.loadNewMap = this.loadNewMap;
        msg.newMapSeed = this.mapSeed;
        msg.spawnLootType = this.spawnLootType;

        return msg;
    }

    postSerialization() {
        this.loadNewMap = false;
        this.printLootStats = false;
        this.spawnLootType = "";
        this.sendMsg = false;
    }
}

import $ from "jquery";
import { device } from "../device";
import { GameConfig } from "../../../shared/gameConfig";
import loadout from "./loadouts";
import { helpers } from "../helpers";
import { util } from "../../../shared/utils/util";
import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";
import { crosshair } from "../crosshair";
import { MenuModal } from "./menuModal";
import "./colorPicker";

const EmoteSlot = GameConfig.EmoteSlot;

function i(e, t, r) {
    if (t in e) {
        Object.defineProperty(e, t, {
            value: r,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        e[t] = r;
    }
    return e;
}
function o(e) {
    const t = {};
    i(t, EmoteSlot.Top, "customize-emote-top");
    i(t, EmoteSlot.Right, "customize-emote-right");
    i(t, EmoteSlot.Bottom, "customize-emote-bottom");
    i(t, EmoteSlot.Left, "customize-emote-left");
    i(t, EmoteSlot.Win, "customize-emote-win");
    i(t, EmoteSlot.Death, "customize-emote-death");
    const r = t;
    const a = r[e] || r[EmoteSlot.Top];
    return $(`#${a}`);
}
function s(e) {
    return function(t, r) {
        const a = GameObjectDefs[t.type].rarity || 0;
        const i = GameObjectDefs[r.type].rarity || 0;
        if (a == 0 && i == 0) {
            return l(t, r);
        } else if (a == 0) {
            return -1;
        } else if (i == 0) {
            return 1;
        } else {
            return e(t, r);
        }
    };
}
function n(e, t) {
    if (t.timeAcquired == e.timeAcquired) {
        return m(e, t);
    } else {
        return t.timeAcquired - e.timeAcquired;
    }
}
function l(e, t) {
    const r = GameObjectDefs[e.type];
    const a = GameObjectDefs[t.type];
    if (r.name < a.name) {
        return -1;
    } else if (r.name > a.name) {
        return 1;
    } else {
        return 0;
    }
}
function c(e, t) {
    const r = GameObjectDefs[e.type].rarity || 0;
    const a = GameObjectDefs[t.type].rarity || 0;
    if (r == a) {
        return l(e, t);
    } else {
        return a - r;
    }
}
function m(e, t) {
    const r = GameObjectDefs[e.type];
    const a = GameObjectDefs[t.type];
    if (r.category && a.category && r.category != a.category) {
        return r.category - a.category;
    } else {
        return l(e, t);
    }
}

const S = {
    newest: s(n),
    alpha: s(l),
    rarity: s(c),
    subcat: s(m)
};

class LoadoutMenu {
    constructor(account, localization) {
        this.account = account;
        this.localization = localization;
        this.loadoutDisplay = null;
        this.active = false;
        this.initialized = false;
        this.loadout = loadout.defaultLoadout();
        this.items = [];
        this.localPendingConfirm = [];
        this.localConfirmed = [];
        this.confirmingItems = false;
        this.localAckItems = [];
        this.categories = [];
        const o = this;
        const s = function(e, t, r) {
            o.categories.push({
                loadoutType: e,
                gameType: t,
                categoryImage: r
            });
        };
        s("outfit", "outfit", "img/gui/loadout-outfit.svg");
        s("melee", "melee", "img/gui/loadout-melee.svg");
        s("emote", "emote", "img/gui/loadout-emote.svg");
        s("heal", "heal_effect", "img/gui/loadout-heal.svg");
        s("boost", "boost_effect", "img/gui/loadout-boost.svg");
        if (!device.touch) {
            s(
                "crosshair",
                "crosshair",
                "img/gui/loadout-crosshair.svg"
            );
        }
        s(
            "player_icon",
            "emote",
            "img/gui/loadout-player-icon.svg"
        );
        this.selectedItem = {
            prevSlot: null,
            img: "",
            type: ""
        };
        this.emotesLoaded = false;
        this.selectedCatIdx = 0;
        this.selectedCatItems = [];
        this.equippedItems = [];
        this.modalCustomize = $("#modal-customize");
        this.modalCustomizeList = $("#modal-customize-list");
        this.modalCustomizeItemRarity = $(
            "#modal-customize-item-rarity"
        );
        this.modalCustomizeItemName = $(
            "#modal-customize-item-name"
        );
        this.modalCustomizeItemLore = $(
            "#modal-customize-item-lore"
        );
        this.modalCustomizeItemSource = $(
            "#modal-customize-item-source"
        );
        this.modal = new MenuModal(this.modalCustomize);
        this.modal.onShow(() => {
            o.onShow();
        });
        this.modal.onHide(() => {
            o.onHide();
        });
        const n = function() {
            $("#modal-screen-block").fadeIn(200);
        };
        const l = function() {
            o.confirmNextItem();
        };
        this.confirmItemModal = new MenuModal($("#modal-item-confirm"));
        this.confirmItemModal.onShow(n);
        this.confirmItemModal.onHide(l);
        account.addEventListener("request", this.onRequest.bind(this));
        account.addEventListener("loadout", this.onLoadout.bind(this));
        account.addEventListener("items", this.onItems.bind(this));
    }

    init() {
        const e = this;
        if (!this.initialized) {
            for (
                let t = 0;
                t < this.categories.length;
                t++
            ) {
                const r = $("<div/>", {
                    class: "modal-customize-cat",
                    "data-idx": t
                });
                if (t == this.categories.length - 1) {
                    r.attr(
                        "id",
                        "modal-customize-cat-standalone"
                    );
                }
                r.append(
                    $("<div/>", {
                        class: "modal-customize-cat-image",
                        css: {
                            "background-image": `url(${this.categories[t].categoryImage})`
                        }
                    })
                );
                r.append(
                    $("<div/>", {
                        class: "modal-customize-cat-connect"
                    })
                );
                r.append(
                    $("<div/>", {
                        class: "account-alert account-alert-cat"
                    })
                );
                $("#modal-customize-header").append(r);
            }
            this.selectableCats = $(".modal-customize-cat");
            this.selectableCatConnects = $(
                ".modal-customize-cat-connect"
            );
            this.selectableCatImages = $(
                ".modal-customize-cat-image"
            );
            this.selectableCats.on("mouseup", (t) => {
                const r = $(t.currentTarget);
                const a = r.data("idx");
                if (e.selectedCatIdx != a) {
                    e.selectCat(a);
                }
            });
            this.itemSort = $("#modal-customize-sort");
            this.itemSort.on("change", (t) => {
                e.sortItems(t.target.value);
            });
            this.modalCustomizeItemName.on("click", () => {
                const e = document.getElementsByClassName(
                    "customize-list-item-selected"
                );
                if (e.length > 0) {
                    e[0].scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                        inline: "nearest"
                    });
                }
            });
            $("#crosshair-size").on("input", () => {
                e.updateLoadoutFromDOM();
            });
            $("#crosshair-stroke").on("input", () => {
                e.updateLoadoutFromDOM();
            });
            this.container =
                document.getElementById("color-picker");
            this.picker = new window.CP(
                this.container,
                false,
                this.container
            );
            this.picker.self.classList.add("static");
            this.picker.on("change", (t) => {
                $("#color-picker-hex").val(t);
                if (e.loadout?.crosshair) {
                    e.updateLoadoutFromDOM();
                }
            });
            this.colorCode =
                document.getElementById("color-picker-hex");
            const a = function() {
                const r = e.colorCode.value;
                if (r.length) {
                    if (r.length == 6) {
                        e.picker.set(`#${r}`);
                        e.picker.fire("change", [r]);
                    } else if (
                        r.length == 7 &&
                        r[0] == "#"
                    ) {
                        e.picker.set(r);
                        e.picker.fire("change", [
                            r.slice(1)
                        ]);
                    } else {
                        return undefined;
                    }
                }
            };
            this.colorCode.oncut = a;
            this.colorCode.onpaste = a;
            this.colorCode.onkeyup = a;
            this.colorCode.oninput = a;
            this.initialized = true;
        }
    }

    show() {
        this.init();
        this.modal.show();
    }

    hide() {
        this.modal.hide();
    }

    onShow() {
        this.active = true;
        this.localAckItems = [];
        for (let e = 0; e < this.items.length; e++) {
            const t = this.items[e];
            if (t.status < loadout.ItemStatus.Ackd) {
                this.localAckItems.push(t);
            }
        }
        this.selectCat(0);
        this.tryBeginConfirmingItems();
        $("#start-bottom-right, #start-main").fadeOut(200);
        $("#background").hide();
    }

    onHide() {
        this.active = false;
        if (
            loadout.modified(this.loadout, this.account.loadout)
        ) {
            this.account.setLoadout(this.loadout);
        }
        this.clearConfirmItemModal();
        this.modalCustomize.css({
            cursor: "initial"
        });
        $("#start-bottom-right, #start-main").fadeIn(200);
        $("#background").show();
    }

    onResize() {
        if (device.mobile) {
            if (
                this.categories[this.selectedCatIdx]
                    .loadoutType == "emote"
            ) {
                $("#modal-customize-list").attr(
                    "style",
                    ""
                );
            } else {
                $("#modal-customize-list").attr(
                    "style",
                    device.isLandscape ? "" : "height: 380px"
                );
            }
        }
    }

    onRequest() {
        $("#modal-customize-loading").css(
            "opacity",
            this.account.requestsInFlight > 0 ? 1 : 0
        );
    }

    onLoadout(e) {
        this.loadout = loadout.validate(e);
        crosshair.setGameCrosshair(e.crosshair);
        if (this.active) {
            this.selectCat(this.selectedCatIdx);
        }
    }

    onItems(e) {
        const t = this;
        this.items = loadout.getUserAvailableItems(e);
        for (let r = 0; r < this.items.length; r++) {
            (function(e) {
                const r = t.items[e];
                if (
                    r.status < loadout.ItemStatus.Confirmed &&
                    !t.localPendingConfirm.find((e) => {
                        return e.type == r.type;
                    }) &&
                    !t.localConfirmed.find((e) => {
                        return e.type == r.type;
                    })
                ) {
                    t.localPendingConfirm.push(r);
                }
                if (
                    r.status < loadout.ItemStatus.Ackd &&
                    !t.localAckItems.find((e) => {
                        return e.type == r.type;
                    })
                ) {
                    t.localAckItems.push(r);
                }
            })(r);
        }
        if (this.active) {
            this.tryBeginConfirmingItems();
            this.selectCat(this.selectedCatIdx);
        }
        if (this.account.loggedIn) {
            if (
                !this.items.find((e) => {
                    return e.type == "unlock_new_account";
                })
            ) {
                this.account.unlock("unlock_new_account");
            }
        }
    }

    getCategory(e) {
        for (let t = 0; t < this.categories.length; t++) {
            const r = this.categories[t];
            if (r.gameType == e) {
                return r;
            }
        }
        return null;
    }

    clearConfirmItemModal() {
        this.localPendingConfirm = [];
        this.localConfirmed = [];
        this.confirmingItems = false;
        this.confirmItemModal.hide();
    }

    setItemsConfirmed() {
        const e = [];
        for (let t = 0; t < this.items.length; t++) {
            const r = this.items[t];
            if (r.status < loadout.ItemStatus.Confirmed) {
                e.push(r.type);
            }
        }
        if (e.length > 0) {
            this.account.setItemStatus(
                loadout.ItemStatus.Confirmed,
                e
            );
        }
    }

    setItemsAckd(e) {
        const t = this.categories[e];
        const r = [];
        for (let a = 0; a < this.items.length; a++) {
            const i = this.items[a];
            const o = GameObjectDefs[i.type];
            if (
                o &&
                o.type == t.gameType &&
                i.status < loadout.ItemStatus.Ackd
            ) {
                r.push(i.type);
            }
        }
        if (r.length > 0) {
            this.account.setItemStatus(
                loadout.ItemStatus.Ackd,
                r
            );
        }
    }

    tryBeginConfirmingItems() {
        if (this.active && !this.confirmingItems) {
            this.confirmingItems = true;
            this.confirmNextItem();
        }
    }

    confirmNextItem() {
        const e = this;
        this.setItemsConfirmed();
        const t = this.localPendingConfirm.shift();
        if (t) {
            this.localConfirmed.push(t);
            const r = GameObjectDefs[t.type];
            const a = {
                type: t.type,
                rarity: r.rarity || 0,
                displayName: r.name,
                category: r.type
            };
            const i = helpers.getSvgFromGameType(t.type);
            const o = `url(${i})`;
            const s = helpers.getCssTransformFromGameType(t.type);
            setTimeout(() => {
                $("#modal-item-confirm-name").html(
                    a.displayName
                );
                $("#modal-item-confirm-image-inner").css({
                    "background-image": o,
                    transform: s
                });
                e.confirmItemModal.show();
            }, 200);
        } else {
            this.confirmingItems = false;
            $("#modal-screen-block").fadeOut(300);
        }
    }

    sortItems(e) {
        this.selectedCatItems.sort(S[e]);
        const t = $("<div/>");
        const r = this.categories[this.selectedCatIdx];
        for (
            let a = 0;
            a < this.selectedCatItems.length;
            a++
        ) {
            const i = this.selectedCatItems[a];
            i.outerDiv.data("idx", a);
            t.append(i.outerDiv);
        }
        this.modalCustomizeList.html("");
        this.modalCustomizeList.append(t);
        this.selectableSlots.off("mouseup");
        this.setItemListeners(r.loadoutType);
    }

    setItemListeners(e) {
        const t = this;
        this.selectableSlots.on("mouseup", function() {
            if (
                !$(this).hasClass(
                    "customize-list-item-locked"
                )
            ) {
                if (
                    t.itemSelected &&
                    !$(this).hasClass("customize-list-item")
                ) {
                    t.itemSelected = false;
                    return;
                }
                t.selectItem($(this));
                t.updateLoadoutFromDOM();
            }
        });
        if (e == "emote") {
            this.setEmoteDraggable(this.selectableSlots, t);
            if (!this.emotesLoaded) {
                this.setEmoteDraggable(
                    this.droppableSlots,
                    t
                );
                this.droppableSlots.on(
                    "mouseup",
                    function() {
                        if (
                            !$(this).hasClass(
                                "customize-list-item-locked"
                            )
                        ) {
                            if (
                                t.itemSelected &&
                                !$(this).hasClass(
                                    "customize-list-item"
                                )
                            ) {
                                t.deselectItem();
                                return;
                            }
                            t.selectItem($(this));
                            t.updateLoadoutFromDOM();
                        }
                    }
                );
                this.droppableSlots.on(
                    "drop",
                    function(e) {
                        e.originalEvent.preventDefault();
                        const r = $(this).parent();
                        t.updateSlot(
                            r,
                            t.selectedItem.img,
                            t.selectedItem.type
                        );
                        t.updateLoadoutFromDOM();
                        t.deselectItem();
                    }
                );
                this.droppableSlots.on(
                    "mousedown",
                    function(e) {
                        if (t.itemSelected) {
                            e.stopPropagation();
                            const r = $(this).parent();
                            t.updateSlot(
                                r,
                                t.selectedItem.img,
                                t.selectedItem.type
                            );
                            t.updateLoadoutFromDOM();
                        }
                    }
                );
                this.droppableSlots.on(
                    "dragover",
                    function(e) {
                        e.originalEvent.preventDefault();
                        $(this)
                            .parent()
                            .find(".ui-emote-hl")
                            .css("opacity", 1);
                    }
                );
                this.droppableSlots.on(
                    "dragleave",
                    function(e) {
                        e.originalEvent.preventDefault();
                        $(this)
                            .parent()
                            .find(".ui-emote-hl")
                            .css(
                                "opacity",
                                t.highlightOpacityMin
                            );
                    }
                );
                this.droppableSlots.on("dragend", (e) => {
                    e.originalEvent.preventDefault();
                    t.deselectItem();
                });
                $(".ui-emote-auto-trash").click(
                    function() {
                        const e = $(this).parent();
                        t.updateSlot(e, "", "");
                        t.updateLoadoutFromDOM();
                    }
                );
                this.emotesLoaded = true;
            }
        } else if (e == "crosshair") {
            const r = util.intToHex(
                this.loadout.crosshair.color
            );
            const a = [r.slice(1)];
            this.picker.set(r);
            $("#color-picker-hex").val(a);
            $("#crosshair-size").val(
                this.loadout.crosshair.size
            );
            $("#crosshair-stroke").val(
                this.loadout.crosshair.stroke
            );
        }
    }

    updateLoadoutFromDOM() {
        const e =
            this.categories[this.selectedCatIdx]
                .loadoutType;
        if (e == "emote") {
            for (let t = 0; t < EmoteSlot.Count; t++) {
                const r = o(t);
                const a = r.data("idx");
                const i = this.equippedItems[a];
                if (i?.type) {
                    this.loadout.emotes[t] = i.type;
                } else {
                    this.loadout.emotes[t] = "";
                }
            }
        } else if (e == "crosshair") {
            const s = parseFloat(
                $("#crosshair-size").val()
            );
            const n = $("#color-picker-hex").val();
            const l = parseFloat(
                $("#crosshair-stroke").val()
            );
            this.loadout.crosshair = {
                type: this.selectedItem.type,
                color: util.hexToInt(n),
                size: Number(s.toFixed(2)),
                stroke: Number(l.toFixed(2))
            };
        } else {
            this.loadout[e] = this.selectedItem.type;
        }
        this.loadout = loadout.validate(this.loadout);
        if (this.loadoutDisplay?.initialized) {
            this.loadoutDisplay.setLoadout(this.loadout);
        }
        if (this.selectedItem.loadoutType == "crosshair") {
            this.setSelectedCrosshair();
        }
    }

    selectItem(e) {
        const t = this;
        const r =
            arguments.length <= 1 ||
            arguments[1] === undefined ||
            arguments[1];
        const a = e.hasClass("customize-list-item");
        const i = a ? e : e.parent();
        const o = i.find(".customize-item-image");
        const s = i.data("idx");
        let n;
        if (
            !(n = i.data("slot")
                ? this.equippedItems[s]
                : this.selectedCatItems[s])
        ) {
            this.itemSelected = false;
            this.selectedItem = {
                prevSlot: null,
                img: "",
                type: ""
            };
            return;
        }
        if (
            n.type == this.selectedItem.type &&
            n.loadoutType == "emote" &&
            this.selectedItem.loadoutType == "emote" &&
            r
        ) {
            this.deselectItem();
            return;
        }
        this.itemSelected = true;
        this.selectedItem = {
            prevSlot: a ? null : i,
            img: o.data("img"),
            type: n.type,
            rarity: n.rarity,
            displayName: n.displayName || "",
            displaySource: n.displaySource || "Unknown",
            displayLore: n.displayLore || "",
            loadoutType: n.loadoutType,
            subcat: n.subcat
        };
        this.modalCustomizeItemName.html(
            this.selectedItem.displayName
        );
        const l =
            this.localization.translate(
                `loadout-${n.displaySource}`
            ) ||
            this.localization.translate(
                `${n.displaySource}`
            ) ||
            this.selectedItem.displaySource;
        const c = `${this.localization.translate(
            "loadout-acquired"
        )}: ${l}`;
        this.modalCustomizeItemSource.html(c);
        const m = {
            0: "Locked",
            1: "Faces",
            2: "Food",
            3: "Animals",
            4: "Logos",
            5: "Other",
            6: "Flags",
            99: "Default"
        };
        const p =
            n.loadoutType == "emote"
                ? `${this.localization.translate(
                    "loadout-category"
                )}: ${m[n.subcat]}`
                : this.selectedItem.displayLore;
        this.modalCustomizeItemLore.html(p);
        const d = [
            "stock",
            "common",
            "uncommon",
            "rare",
            "epic",
            "mythic"
        ];
        const u = [
            "#c5c5c5",
            "#c5c5c5",
            "#12ff00",
            "#00deff",
            "#f600ff",
            "#d96100"
        ];
        const g = this.localization.translate(
            `loadout-${d[this.selectedItem.rarity]}`
        );
        this.modalCustomizeItemRarity.html(g);
        this.modalCustomizeItemRarity.css({
            color: u[this.selectedItem.rarity]
        });
        if (this.selectedItem.loadoutType == "emote") {
            this.highlightedSlots.css({
                display: "block",
                opacity: this.highlightOpacityMin
            });
        }
        this.selectableSlots.removeClass(
            "customize-list-item-selected"
        );
        if (a) {
            e.addClass("customize-list-item-selected");
        } else {
            i.find(".ui-emote-hl").css("opacity", 1);
        }
        if (this.selectedItem.loadoutType == "crosshair") {
            const y = GameObjectDefs[this.selectedItem.type];
            if (y && y.type == "crosshair" && y.cursor) {
                $("#modal-content-right-crosshair").css(
                    "display",
                    "none"
                );
            } else {
                $("#modal-content-right-crosshair").css(
                    "display",
                    "block"
                );
                this.picker.exit();
                this.picker.enter();
            }
        }
        const w = this.localAckItems.findIndex((e) => {
            return e.type == t.selectedItem.type;
        });
        if (w !== -1) {
            e.find(".account-alert").removeClass(
                "account-alert account-alert-cat"
            );
            this.localAckItems.splice(w, 1);
            this.setCategoryAlerts();
        }
    }

    updateSlot(e, t, r) {
        const a = this.selectedItem.prevSlot;
        this.selectedItem = {};
        if (a) {
            const i = e.find(".customize-item-image");
            const o = e.data("idx");
            const s = this.equippedItems[o];
            let n = "";
            if (s.type) {
                n = s.type;
            }
            this.updateSlot(a, i.data("img"), n);
        }
        this.updateSlotData(e, t, r);
    }

    deselectItem() {
        this.itemSelected = false;
        this.selectedItem = {};
        this.selectableSlots.removeClass(
            "customize-list-item-selected"
        );
        this.highlightedSlots.css({
            display: "none",
            opacity: 0
        });
        this.modalCustomizeItemName.html("");
        this.modalCustomizeItemSource.html("");
        this.modalCustomizeItemLore.html("");
        this.modalCustomizeItemRarity.html("");
    }

    updateSlotData(e, t, r) {
        const a = e.find(".customize-emote-slot");
        a.css("background-image", t || "none");
        a.data("img", t || "none");
        const i = GameObjectDefs[r];
        const o = e.data("idx");
        if (i) {
            const s = {
                loadoutType: "emote",
                type: r,
                rarity: i.rarity || 0,
                displayName: i.name,
                displayLore: i.lore,
                subcat: i.category
            };
            this.equippedItems[o] = s;
        } else {
            this.equippedItems[o] = {};
        }
    }

    selectCat(e) {
        const t = this;
        const r = this.selectedCatIdx;
        this.selectedCatIdx = e;
        this.setItemsAckd(this.selectedCatIdx);
        if (r != this.selectedCatIdx) {
            for (
                let a = this.categories[r],
                    i = this.localAckItems.length - 1;
                i >= 0;
                i--
            ) {
                const s = this.localAckItems[i];
                const n = GameObjectDefs[s.type];
                if (n.type == a.gameType) {
                    this.localAckItems.splice(i, 1);
                }
            }
        }
        const l = this.categories[this.selectedCatIdx];
        const c = this.items.filter((e) => {
            const t = GameObjectDefs[e.type];
            return t && t.type == l.gameType;
        });
        const m =
            l.loadoutType == "emote" ||
            l.loadoutType == "player_icon";
        $("#customize-sort-subcat").css(
            "display",
            m ? "block" : "none"
        );
        let p = this.itemSort.val();
        if (!m && p == "subcat") {
            p = "newest";
            this.itemSort.val(p);
        }
        c.sort(S[p]);
        const u = l.loadoutType == "emote";
        const g = l.loadoutType == "crosshair";
        const y = l.loadoutType == "emote";
        this.loadoutDisplay?.setView(l.loadoutType);
        const _ = $(
            `.modal-customize-cat[data-idx='${this.selectedCatIdx}']`
        );
        this.selectableCats.removeClass(
            "modal-customize-cat-selected"
        );
        this.selectableCatConnects.removeClass(
            "modal-customize-cat-connect-selected"
        );
        this.selectableCatImages.removeClass(
            "modal-customize-cat-image-selected"
        );
        _.addClass("modal-customize-cat-selected");
        _.find(".modal-customize-cat-connect").addClass(
            "modal-customize-cat-connect-selected"
        );
        _.find(".modal-customize-cat-image").addClass(
            "modal-customize-cat-image-selected"
        );
        const b = this.localization
            .translate(`loadout-title-${l.loadoutType}`)
            .toUpperCase();
        $("#modal-customize-cat-title").html(b);
        $("#modal-content-right-crosshair").css(
            "display",
            l.loadoutType == "crosshair" ? "block" : "none"
        );
        $("#modal-content-right-emote").css(
            "display",
            l.loadoutType == "emote" ? "block" : "none"
        );
        $("#customize-emote-parent").css(
            "display",
            u ? "block" : "none"
        );
        $("#customize-crosshair-parent").css(
            "display",
            g ? "block" : "none"
        );
        this.modalCustomizeItemName.html("");
        this.modalCustomizeItemSource.html("");
        this.modalCustomizeItemLore.html("");
        this.modalCustomizeItemRarity.html("");
        const v = function(e) {
            const t = GameObjectDefs[e];
            if (t?.name) {
                return t.name;
            } else {
                return e;
            }
        };
        this.selectedCatItems = [];
        let k = "";
        const z = $("<div/>");
        for (let I = 0; I < c.length; I++) {
            (function(e) {
                const r = c[e];
                const a = GameObjectDefs[r.type];
                const i = {
                    loadoutType: l.loadoutType,
                    type: r.type,
                    rarity: a.rarity || 0,
                    displayName: a.name,
                    displaySource: v(r.source),
                    displayLore: a.lore,
                    timeAcquired: r.timeAcquired,
                    idx: e,
                    subcat: a.category,
                    outerDiv: null
                };
                const o = $("<div/>", {
                    class: "customize-list-item customize-list-item-unlocked",
                    "data-idx": e
                });
                const s = helpers.getSvgFromGameType(r.type);
                const n = helpers.getCssTransformFromGameType(
                    r.type
                );
                const m = $("<div/>", {
                    class: "customize-item-image",
                    css: {
                        "background-image": `url(${s})`,
                        transform: n
                    },
                    "data-img": `url(${s})`,
                    draggable: y
                });
                o.append(m);
                if (
                    t.localAckItems.findIndex((e) => {
                        return e.type == r.type;
                    }) !== -1
                ) {
                    const p = $("<div/>", {
                        class: "account-alert account-alert-cat",
                        css: {
                            display: "block"
                        }
                    });
                    o.append(p);
                }
                if (l.gameType == "crosshair") {
                    const d = {
                        type: i.type,
                        color: 16777215,
                        size: 1,
                        stroke: 0
                    };
                    crosshair.setElemCrosshair(o, d);
                }
                z.append(o);
                i.outerDiv = o;
                t.selectedCatItems.push(i);
                if (!k) {
                    if (
                        l.loadoutType == "crosshair" &&
                        i.type == t.loadout.crosshair.type
                    ) {
                        k = i.outerDiv;
                    } else if (
                        l.loadoutType != "emote" &&
                        i.type == t.loadout[l.loadoutType]
                    ) {
                        k = i.outerDiv;
                    }
                }
            })(I);
        }
        this.modalCustomizeList.html("");
        this.modalCustomizeList.append(z);
        this.modalCustomizeList.scrollTop(0);
        if (l.loadoutType == "emote") {
            this.equippedItems = [];
            for (
                let T = 0;
                T < this.loadout.emotes.length;
                T++
            ) {
                this.equippedItems.push({});
                const M = this.loadout.emotes[T];
                if (GameObjectDefs[M]) {
                    const P = helpers.getSvgFromGameType(M);
                    const C = `url(${P})`;
                    const A = o(T);
                    this.updateSlotData(A, C, M);
                }
            }
        }
        this.selectableSlots = $(".customize-list-item");
        this.droppableSlots = $(".customize-col");
        this.highlightedSlots =
            this.droppableSlots.siblings(".ui-emote-hl");
        this.highlightOpacityMin = 0.4;
        this.itemSelected = false;
        this.setItemListeners(l.loadoutType);
        this.setCategoryAlerts();
        this.deselectItem();
        if (k != "") {
            this.selectItem(k);
            if (l.loadoutType == "crosshair") {
                this.setSelectedCrosshair();
            }
            this.modalCustomizeItemName.click();
        }
        if (device.browser == "edge") {
            if (l.loadoutType == "crosshair") {
                const O = function(e, t) {
                    const r =
                        e.height() +
                        parseInt(e.css("padding-top")) +
                        parseInt(e.css("padding-bottom"));
                    t.css("height", r);
                };
                O(
                    $("#modal-customize-body"),
                    $("#modal-content-left").find(
                        ".modal-disabled"
                    )
                );
                O(
                    $("#modal-content-right-crosshair"),
                    $(
                        "#modal-content-right-crosshair"
                    ).find(".modal-disabled")
                );
                $(".modal-disabled").css(
                    "display",
                    "block"
                );
            } else {
                $(".modal-disabled").css("display", "none");
            }
        }
        this.onResize();
    }

    setCategoryAlerts() {
        const e = this;
        for (let t = 0; t < this.categories.length; t++) {
            (function(t) {
                const r = e.categories[t];
                const a = e.localAckItems.filter((e) => {
                    const t = GameObjectDefs[e.type];
                    return t && t.type == r.gameType;
                });
                $(`.modal-customize-cat[data-idx='${t}']`)
                    .find(".account-alert-cat")
                    .css(
                        "display",
                        a.length > 0 ? "block" : "none"
                    );
            })(t);
        }
    }

    setEmoteDraggable(e, t) {
        e.on("dragstart", function(e) {
            if (
                !$(this).hasClass(
                    "customize-list-item-locked"
                ) &&
                (t.selectItem($(this), false),
                device.browser != "edge")
            ) {
                const r = document.createElement("img");
                r.src = t.selectedItem.img
                    ? t.selectedItem.img
                        .replace("url(", "")
                        .replace(")", "")
                        .replace(/\'/gi, "")
                    : "";
                e.originalEvent.dataTransfer.setDragImage(
                    r,
                    64,
                    64
                );
            }
        });
    }

    setSelectedCrosshair() {
        const e = this.loadout.crosshair;
        $("#customize-crosshair-selected")
            .find(".customize-item-image")
            .css({
                "background-image": crosshair.getCursorURL(e)
            });
        crosshair.setElemCrosshair(
            $("#customize-crosshair-selected"),
            e
        );
    }
}

export default LoadoutMenu;

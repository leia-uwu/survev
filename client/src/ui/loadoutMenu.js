import $ from "jquery";
import { device } from "../device";
import { GameConfig } from "../../../shared/gameConfig";
import loadout from "./loadouts";
import { helpers } from "../helpers";
import { util } from "../../../shared/utils/util";
import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";
import { crosshair } from "../crosshair";
import { MenuModal } from "./menuModal";
import "@taufik-nurrohman/color-picker";

const EmoteSlot = GameConfig.EmoteSlot;

function emoteSlotToDomElem(e) {
    const emoteSlotToDomId = {
        [EmoteSlot.Top]: "customize-emote-top",
        [EmoteSlot.Right]: "customize-emote-right",
        [EmoteSlot.Bottom]: "customize-emote-bottom",
        [EmoteSlot.Left]: "customize-emote-left",
        [EmoteSlot.Win]: "customize-emote-win",
        [EmoteSlot.Death]: "customize-emote-death"
    };
    const domId = emoteSlotToDomId[e] || emoteSlotToDomId[EmoteSlot.Top];
    return $(`#${domId}`);
}

function itemSort(sortFn) {
    return function(a, b) {
        // Always put stock items at the front of the list;
        // if not stock, sort by the given sort routine
        const rarityA = GameObjectDefs[a.type].rarity || 0;
        const rarityB = GameObjectDefs[b.type].rarity || 0;
        if (rarityA == 0 && rarityB == 0) {
            return sortAlphabetical(a, b);
        } if (rarityA == 0) {
            return -1;
        } if (rarityB == 0) {
            return 1;
        }
        return sortFn(a, b);
    };
}

function sortAcquired(a, b) {
    if (b.timeAcquired == a.timeAcquired) {
        return sortSubcat(a, b);
    }
    return b.timeAcquired - a.timeAcquired;
}

function sortAlphabetical(a, b) {
    const defA = GameObjectDefs[a.type];
    const defB = GameObjectDefs[b.type];
    if (defA.name < defB.name) {
        return -1;
    } if (defA.name > defB.name) {
        return 1;
    }
    return 0;
}

function sortRarity(a, b) {
    const rarityA = GameObjectDefs[a.type].rarity || 0;
    const rarityB = GameObjectDefs[b.type].rarity || 0;
    if (rarityA == rarityB) {
        return sortAlphabetical(a, b);
    }
    return rarityB - rarityA;
}

function sortSubcat(a, b) {
    const defA = GameObjectDefs[a.type];
    const defB = GameObjectDefs[b.type];
    if (!defA.category || !defB.category || defA.category == defB.category) {
        return sortAlphabetical(a, b);
    }
    return defA.category - defB.category;
}

const sortTypes = {
    newest: itemSort(sortAcquired),
    alpha: itemSort(sortAlphabetical),
    rarity: itemSort(sortRarity),
    subcat: itemSort(sortSubcat)
};

export class LoadoutMenu {
    /**
     *
     * @param {import('../account').Account} account
     * @param {import('./localization').Localization} localization
     */
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
        const o = this;
        this.categories = [
            { loadoutType: "outfit", gameType: "outfit", categoryImage: "img/gui/loadout-outfit.svg" },
            { loadoutType: "melee", gameType: "melee", categoryImage: "img/gui/loadout-melee.svg" },
            { loadoutType: "emote", gameType: "emote", categoryImage: "img/gui/loadout-emote.svg" },
            { loadoutType: "heal", gameType: "heal_effect", categoryImage: "img/gui/loadout-heal.svg" },
            { loadoutType: "boost", gameType: "boost_effect", categoryImage: "img/gui/loadout-boost.svg" }
        ];
        if (!device.touch) {
            this.categories.push({
                loadoutType: "crosshair", gameType: "crosshair", categoryImage: "img/gui/loadout-crosshair.svg"
            });
        }
        this.categories.push({
            loadoutType: "player_icon", gameType: "emote", categoryImage: "img/gui/loadout-emote.svg"
        });
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
        const displayBlockingElem = function() {
            $("#modal-screen-block").fadeIn(200);
        };
        const confirmNextNewItem = function() {
            o.confirmNextItem();
        };
        this.confirmItemModal = new MenuModal($("#modal-item-confirm"));
        this.confirmItemModal.onShow(displayBlockingElem);
        this.confirmItemModal.onHide(confirmNextNewItem);
        account.addEventListener("request", this.onRequest.bind(this));
        account.addEventListener("loadout", this.onLoadout.bind(this));
        account.addEventListener("items", this.onItems.bind(this));
        account.addEventListener("pass", this.onPass.bind(this));
    }

    init() {
        const _this = this;
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

            // Listen for cat selection
            this.selectableCats.on("mouseup", (e) => {
                const selector = $(e.currentTarget);
                const newCategoryIdx = selector.data("idx");
                if (_this.selectedCatIdx != newCategoryIdx) {
                    _this.selectCat(newCategoryIdx);
                }
            });
            this.itemSort = $("#modal-customize-sort");
            this.itemSort.on("change", (e) => {
                _this.sortItems(e.target.value);
            });
            this.modalCustomizeItemName.on("click", () => {
                const elements = document.getElementsByClassName(
                    "customize-list-item-selected"
                );
                if (elements.length > 0) {
                    elements[0].scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                        inline: "nearest"
                    });
                }
            });
            $("#crosshair-size").on("input", () => {
                _this.updateLoadoutFromDOM();
            });
            $("#crosshair-stroke").on("input", () => {
                _this.updateLoadoutFromDOM();
            });
            this.container =
                document.getElementById("color-picker");
            this.picker = new window.CP(
                this.container,
                false,
                this.container
            );
            this.picker.self.classList.add("static");

            this.picker.on("change", (color) => {
                $("#color-picker-hex").val(color);
                if (_this.loadout?.crosshair) {
                    _this.updateLoadoutFromDOM();
                }
            });

            this.colorCode =
                document.getElementById("color-picker-hex");
            const updateColor = function() {
                const value = _this.colorCode.value;
                if (value.length) {
                    // Only accept 6 digit hex or 7 digit with a hash
                    if (value.length == 6) {
                        _this.picker.set(`#${value}`);
                        _this.picker.fire("change", [value]);
                    } else if (
                        value.length == 7 &&
                        value[0] == "#"
                    ) {
                        _this.picker.set(value);
                        _this.picker.fire("change", [
                            value.slice(1)
                        ]);
                    } else {
                        return undefined;
                    }
                }
            };
            this.colorCode.oncut = updateColor;
            this.colorCode.onpaste = updateColor;
            this.colorCode.onkeyup = updateColor;
            this.colorCode.oninput = updateColor;
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

        // Reset items to ack locally
        this.localAckItems = [];
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            if (item.status < loadout.ItemStatus.Ackd) {
                this.localAckItems.push(item);
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
        // Adjust the emote modal content on mobile
        if (device.mobile) {
            if (
                this.categories[this.selectedCatIdx]
                    .loadoutType == "emote"
            ) {
                // Apply styling based on orientation
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

    onItems(items) {
        this.items = loadout.getUserAvailableItems(items);
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            if (
                item.status < loadout.ItemStatus.Confirmed &&
                !this.localPendingConfirm.find((x) => {
                    return x.type == item.type;
                }) &&
                !this.localConfirmed.find((x) => {
                    return x.type == item.type;
                })
            ) {
                this.localPendingConfirm.push(item);
            }
            if (
                item.status < loadout.ItemStatus.Ackd &&
                !this.localAckItems.find((x) => {
                    return x.type == item.type;
                })
            ) {
                this.localAckItems.push(item);
            }
        }
        if (this.active) {
            this.tryBeginConfirmingItems();
            this.selectCat(this.selectedCatIdx);
        }

        // Request the default unlock if we don't have it yet
        if (this.account.loggedIn) {
            if (
                !this.items.find((x) => {
                    return x.type == "unlock_new_account";
                })
            ) {
                this.account.unlock("unlock_new_account");
            }
        }
    }

    onPass(e) {
        // should be unlocked by default
        const a = this;
        const i = [
            "facebook",
            "instagram",
            "youtube",
            "twitter"
        ];
        for (let o = 0; o < i.length; o++) {
            (function(t) {
                const r = i[t];
                const o = !!e.unlocks[r];
                const s = $(
                    `.customize-social-unlock[data-lock-reason='${r}']`
                );
                s.css({
                    display: o ? "none" : "inline-block"
                });
                s.off("click").on("click", () => {
                    a.account.setPassUnlock(r);
                });
            })(o);
        }
    }

    getCategory(gameType) {
        for (let i = 0; i < this.categories.length; i++) {
            const category = this.categories[i];
            if (category.gameType == gameType) {
                return category;
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
        const confirmItemTypes = [];
        for (let t = 0; t < this.items.length; t++) {
            const item = this.items[t];
            if (item.status < loadout.ItemStatus.Confirmed) {
                confirmItemTypes.push(item.type);
            }
        }
        if (confirmItemTypes.length > 0) {
            this.account.setItemStatus(
                loadout.ItemStatus.Confirmed,
                confirmItemTypes
            );
        }
    }

    setItemsAckd(catIdx) {
        const category = this.categories[catIdx];

        // Ack items on the server
        const ackItemTypes = [];
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            const objDef = GameObjectDefs[item.type];
            if (
                objDef &&
                objDef.type == category.gameType &&
                item.status < loadout.ItemStatus.Ackd
            ) {
                ackItemTypes.push(item.type);
            }
        }
        if (ackItemTypes.length > 0) {
            this.account.setItemStatus(
                loadout.ItemStatus.Ackd,
                ackItemTypes
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
        // Confirm all pending new items in one shot upon displaying
        // the first item
        this.setItemsConfirmed();
        const currentNewItem = this.localPendingConfirm.shift();
        if (currentNewItem) {
            this.localConfirmed.push(currentNewItem);
            const objDef = GameObjectDefs[currentNewItem.type];
            const itemInfo = {
                type: currentNewItem.type,
                rarity: objDef.rarity || 0,
                displayName: objDef.name,
                category: objDef.type
            };
            const svg = helpers.getSvgFromGameType(currentNewItem.type);
            const imageUrl = `url(${svg})`;
            const transform = helpers.getCssTransformFromGameType(currentNewItem.type);
            setTimeout(() => {
                $("#modal-item-confirm-name").html(
                    itemInfo.displayName
                );
                $("#modal-item-confirm-image-inner").css({
                    "background-image": imageUrl,
                    transform
                });
                this.confirmItemModal.show();
            }, 200);
        } else {
            this.confirmingItems = false;
            $("#modal-screen-block").fadeOut(300);
        }
    }

    sortItems(sort) {
        this.selectedCatItems.sort(sortTypes[sort]);
        const category = this.categories[this.selectedCatIdx];

        const listChildren = $("<div/>");
        for (
            let i = 0;
            i < this.selectedCatItems.length;
            i++
        ) {
            const itemInfo = this.selectedCatItems[i];
            itemInfo.outerDiv.data("idx", i);
            listChildren.append(itemInfo.outerDiv);
        }
        this.modalCustomizeList.html("");
        this.modalCustomizeList.append(listChildren);
        this.selectableSlots.off("mouseup");
        this.setItemListeners(category.loadoutType);
    }

    setItemListeners(loadoutType) {
        const _this = this;

        // listen for ui modifications
        this.selectableSlots.on("mouseup", function() {
            if (
                !$(this).hasClass(
                    "customize-list-item-locked"
                )
            ) {
                if (
                    _this.itemSelected &&
                    !$(this).hasClass("customize-list-item")
                ) {
                    _this.itemSelected = false;
                    return;
                }
                _this.selectItem($(this));
                _this.updateLoadoutFromDOM();
            }
        });

        if (loadoutType == "emote") {
            this.setEmoteDraggable(this.selectableSlots, _this);

            // Only do this once, assuming the wheel is only used for emotes
            if (!this.emotesLoaded) {
                this.setEmoteDraggable(
                    this.droppableSlots,
                    _this
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
                                _this.itemSelected &&
                                !$(this).hasClass(
                                    "customize-list-item"
                                )
                            ) {
                                _this.deselectItem();
                                return;
                            }
                            _this.selectItem($(this));
                            _this.updateLoadoutFromDOM();
                        }
                    }
                );
                this.droppableSlots.on(
                    "drop",
                    function(e) {
                        e.originalEvent.preventDefault();
                        const parent = $(this).parent();
                        _this.updateSlot(
                            parent,
                            _this.selectedItem.img,
                            _this.selectedItem.type
                        );
                        _this.updateLoadoutFromDOM();
                        _this.deselectItem();
                    }
                );
                this.droppableSlots.on(
                    "mousedown",
                    function(e) {
                        if (_this.itemSelected) {
                            e.stopPropagation();
                            const parent = $(this).parent();
                            _this.updateSlot(
                                parent,
                                _this.selectedItem.img,
                                _this.selectedItem.type
                            );
                            _this.updateLoadoutFromDOM();
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
                                _this.highlightOpacityMin
                            );
                    }
                );
                this.droppableSlots.on("dragend", (e) => {
                    e.originalEvent.preventDefault();
                    _this.deselectItem();
                });

                // Trash auto emotes
                $(".ui-emote-auto-trash").click(
                    function() {
                        const e = $(this).parent();
                        _this.updateSlot(e, "", "");
                        _this.updateLoadoutFromDOM();
                    }
                );
                this.emotesLoaded = true;
            }
        } else if (loadoutType == "crosshair") {
            const crosshairHex = util.intToHex(
                this.loadout.crosshair.color
            );
            const color = [crosshairHex.slice(1)];
            this.picker.set(crosshairHex);
            $("#color-picker-hex").val(color);
            $("#crosshair-size").val(
                this.loadout.crosshair.size
            );
            $("#crosshair-stroke").val(
                this.loadout.crosshair.stroke
            );
        }
    }

    updateLoadoutFromDOM() {
        const loadoutType =
            this.categories[this.selectedCatIdx]
                .loadoutType;
        if (loadoutType == "emote") {
            for (let t = 0; t < EmoteSlot.Count; t++) {
                const domElem = emoteSlotToDomElem(t);
                const slotIdx = domElem.data("idx");
                const slotItem = this.equippedItems[slotIdx];
                if (slotItem?.type) {
                    this.loadout.emotes[t] = slotItem.type;
                } else {
                    this.loadout.emotes[t] = "";
                }
            }
        } else if (loadoutType == "crosshair") {
            const size = parseFloat(
                $("#crosshair-size").val()
            );
            const color = $("#color-picker-hex").val();
            const stroke = parseFloat(
                $("#crosshair-stroke").val()
            );
            this.loadout.crosshair = {
                type: this.selectedItem.type,
                color: util.hexToInt(color),
                size: Number(size.toFixed(2)),
                stroke: Number(stroke.toFixed(2))
            };
        } else {
            this.loadout[loadoutType] = this.selectedItem.type;
        }

        this.loadout = loadout.validate(this.loadout);

        if (this.loadoutDisplay?.initialized) {
            this.loadoutDisplay.setLoadout(this.loadout);
        }
        if (this.selectedItem.loadoutType == "crosshair") {
            this.setSelectedCrosshair();
        }
    }

    selectItem(selector) {
        const _this = this;
        const deselect =
            arguments.length <= 1 ||
            arguments[1] === undefined ||
            arguments[1];
        const isListItem = selector.hasClass("customize-list-item");
        const parent = isListItem ? selector : selector.parent();
        const image = parent.find(".customize-item-image");
        const selectorIdx = parent.data("idx");
        const selectedItem = parent.data("slot")
            ? this.equippedItems[selectorIdx]
            : this.selectedCatItems[selectorIdx];

        if (
            !(selectedItem)
        ) {
            this.itemSelected = false;
            this.selectedItem = {
                prevSlot: null,
                img: "",
                type: ""
            };
            return;
        }

        // Deselect this emote if it's already selected
        if (
            selectedItem.type == this.selectedItem.type &&
            selectedItem.loadoutType == "emote" &&
            this.selectedItem.loadoutType == "emote" &&
            deselect
        ) {
            this.deselectItem();
            return;
        }

        this.itemSelected = true;

        this.selectedItem = {
            prevSlot: isListItem ? null : parent,
            img: image.data("img"),
            type: selectedItem.type,
            rarity: selectedItem.rarity,
            displayName: selectedItem.displayName || "",
            displaySource: selectedItem.displaySource || "Unknown",
            displayLore: selectedItem.displayLore || "",
            loadoutType: selectedItem.loadoutType,
            subcat: selectedItem.subcat
        };

        this.modalCustomizeItemName.html(
            this.selectedItem.displayName
        );
        const source =
            this.localization.translate(
                `loadout-${selectedItem.displaySource}`
            ) ||
            this.localization.translate(
                `${selectedItem.displaySource}`
            ) ||
            this.selectedItem.displaySource;
        const sourceTxt = `${this.localization.translate(
            "loadout-acquired"
        )}: ${source}`;
        this.modalCustomizeItemSource.html(sourceTxt);

        // Use the 2nd line on emotes to display the subcategory
        const emoteSubcatNames = {
            0: "Locked",
            1: "Faces",
            2: "Food",
            3: "Animals",
            4: "Logos",
            5: "Other",
            6: "Flags",
            99: "Default"
        };
        const localizedLore =
            selectedItem.loadoutType == "emote"
                ? `${this.localization.translate(
                    "loadout-category"
                )}: ${emoteSubcatNames[selectedItem.subcat]}`
                : this.selectedItem.displayLore;
        this.modalCustomizeItemLore.html(localizedLore);
        const rarityNames = [
            "stock",
            "common",
            "uncommon",
            "rare",
            "epic",
            "mythic"
        ];
        const Rarities = [
            "#c5c5c5",
            "#c5c5c5",
            "#12ff00",
            "#00deff",
            "#f600ff",
            "#d96100"
        ];
        const localizedRarity = this.localization.translate(
            `loadout-${rarityNames[this.selectedItem.rarity]}`
        );
        this.modalCustomizeItemRarity.html(localizedRarity);
        this.modalCustomizeItemRarity.css({
            color: Rarities[this.selectedItem.rarity]
        });
        if (this.selectedItem.loadoutType == "emote") {
            this.highlightedSlots.css({
                display: "block",
                opacity: this.highlightOpacityMin
            });
        }

        // Highlight clicked item
        this.selectableSlots.removeClass(
            "customize-list-item-selected"
        );
        if (isListItem) {
            selector.addClass("customize-list-item-selected");
        } else {
            parent.find(".ui-emote-hl").css("opacity", 1);
        }

        if (this.selectedItem.loadoutType == "crosshair") {
            const objDef = GameObjectDefs[this.selectedItem.type];
            if (objDef && objDef.type == "crosshair" && objDef.cursor) {
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

        // Mark item as ackd
        const itemIdx = this.localAckItems.findIndex((x) => {
            return x.type == _this.selectedItem.type;
        });
        if (itemIdx !== -1) {
            selector.find(".account-alert").removeClass(
                "account-alert account-alert-cat"
            );
            this.localAckItems.splice(itemIdx, 1);
            this.setCategoryAlerts();
        }
    }

    updateSlot(parent, img, type) {
        const prevParent = this.selectedItem.prevSlot;
        this.selectedItem = {};
        if (prevParent) {
            const image = parent.find(".customize-item-image");
            const slotIdx = parent.data("idx");
            const slotItem = this.equippedItems[slotIdx];
            let slotItemType = "";
            if (slotItem.type) {
                slotItemType = slotItem.type;
            }
            this.updateSlot(prevParent, image.data("img"), slotItemType);
        }
        this.updateSlotData(parent, img, type);
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

    updateSlotData(parent, img, type) {
        const image = parent.find(".customize-emote-slot");
        image.css("background-image", img || "none");
        image.data("img", img || "none");
        const emoteDef = GameObjectDefs[type];
        const slotIdx = parent.data("idx");
        if (emoteDef) {
            const itemInfo = {
                loadoutType: "emote",
                type,
                rarity: emoteDef.rarity || 0,
                displayName: emoteDef.name,
                displayLore: emoteDef.lore,
                subcat: emoteDef.category
            };
            this.equippedItems[slotIdx] = itemInfo;
        } else {
            this.equippedItems[slotIdx] = {};
        }
    }

    selectCat(e) {
        const _this = this;
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
        const category = this.categories[this.selectedCatIdx];

        const loadoutItems = this.items.filter((x) => {
            const gameTypeDef = GameObjectDefs[x.type];
            return gameTypeDef && gameTypeDef.type == category.gameType;
        });

        // Sort items based on currently selected sort
        const displaySubcatSort =
            category.loadoutType == "emote" ||
            category.loadoutType == "player_icon";

        $("#customize-sort-subcat").css(
            "display",
            displaySubcatSort ? "block" : "none"
        );

        let sortType = this.itemSort.val();
        if (!displaySubcatSort && sortType == "subcat") {
            sortType = "newest";
            this.itemSort.val(sortType);
        }

        loadoutItems.sort(sortTypes[sortType]);

        const displayEmoteWheel = category.loadoutType == "emote";
        const displayCrosshairAdjust = category.loadoutType == "crosshair";
        const draggable = category.loadoutType == "emote";

        this.loadoutDisplay?.setView(category.loadoutType);

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
        const localizedTitle = this.localization
            .translate(`loadout-title-${category.loadoutType}`)
            .toUpperCase();
        $("#modal-customize-cat-title").html(localizedTitle);
        $("#modal-content-right-crosshair").css(
            "display",
            category.loadoutType == "crosshair" ? "block" : "none"
        );
        $("#modal-content-right-emote").css(
            "display",
            category.loadoutType == "emote" ? "block" : "none"
        );
        $("#customize-emote-parent").css(
            "display",
            displayEmoteWheel ? "block" : "none"
        );
        $("#customize-crosshair-parent").css(
            "display",
            displayCrosshairAdjust ? "block" : "none"
        );
        this.modalCustomizeItemName.html("");
        this.modalCustomizeItemSource.html("");
        this.modalCustomizeItemLore.html("");
        this.modalCustomizeItemRarity.html("");

        const getItemSourceName = function(source) {
            const sourceDef = GameObjectDefs[source];
            if (sourceDef?.name) {
                return sourceDef.name;
            } else {
                return source;
            }
        };

        this.selectedCatItems = [];
        let loadoutItemDiv = "";
        const listItems = $("<div/>");
        for (let i = 0; i < loadoutItems.length; i++) {
            const item = loadoutItems[i];
            const objDef = GameObjectDefs[item.type];

            const itemInfo = {
                loadoutType: category.loadoutType,
                type: item.type,
                rarity: objDef.rarity || 0,
                displayName: objDef.name,
                displaySource: getItemSourceName(item.source),
                displayLore: objDef.lore,
                timeAcquired: item.timeAcquired,
                idx: i,
                subcat: objDef.category,
                outerDiv: null
            };

            // Create div for emote customization list
            const outerDiv = $("<div/>", {
                class: "customize-list-item customize-list-item-unlocked",
                "data-idx": i
            });

            const svg = helpers.getSvgFromGameType(item.type);
            const transform = helpers.getCssTransformFromGameType(
                item.type
            );
            const innerDiv = $("<div/>", {
                class: "customize-item-image",
                css: {
                    "background-image": `url(${svg})`,
                    transform
                },
                "data-img": `url(${svg})`,
                draggable
            });
            outerDiv.append(innerDiv);

            // Notification pulse
            if (
                _this.localAckItems.findIndex((x) => {
                    return x.type == item.type;
                }) !== -1
            ) {
                const alertDiv = $("<div/>", {
                    class: "account-alert account-alert-cat",
                    css: {
                        display: "block"
                    }
                });
                outerDiv.append(alertDiv);
            }

            // Crosshair specific styling
            if (category.gameType == "crosshair") {
                // Change the pointer in this slot
                const crosshairDef = {
                    type: itemInfo.type,
                    color: 16777215,
                    size: 1,
                    stroke: 0
                };
                crosshair.setElemCrosshair(outerDiv, crosshairDef);
            }

            listItems.append(outerDiv);

            // Add the itemInfo to the currently selected items array
            itemInfo.outerDiv = outerDiv;
            _this.selectedCatItems.push(itemInfo);

            if (!loadoutItemDiv) {
                if (
                    category.loadoutType == "crosshair" &&
                        itemInfo.type == _this.loadout.crosshair.type
                ) {
                    loadoutItemDiv = itemInfo.outerDiv;
                } else if (
                    category.loadoutType != "emote" &&
                        itemInfo.type == _this.loadout[category.loadoutType]
                ) {
                    loadoutItemDiv = itemInfo.outerDiv;
                }
            }
        }
        this.modalCustomizeList.html("");
        this.modalCustomizeList.append(listItems);
        this.modalCustomizeList.scrollTop(0);

        // Set itemInfo for equipped emotes
        if (category.loadoutType == "emote") {
            this.equippedItems = [];

            for (
                let T = 0;
                T < this.loadout.emotes.length;
                T++
            ) {
                this.equippedItems.push({});
                const emote = this.loadout.emotes[T];
                if (GameObjectDefs[emote]) {
                    const svg = helpers.getSvgFromGameType(emote);
                    const imgCss = `url(${svg})`;
                    const domElem = emoteSlotToDomElem(T);
                    this.updateSlotData(domElem, imgCss, emote);
                }
            }
        }

        this.selectableSlots = $(".customize-list-item");
        this.droppableSlots = $(".customize-col");
        this.highlightedSlots =
            this.droppableSlots.siblings(".ui-emote-hl");
        this.highlightOpacityMin = 0.4;
        this.itemSelected = false;

        this.setItemListeners(category.loadoutType);
        this.setCategoryAlerts();

        // Select loadout item
        this.deselectItem();
        if (loadoutItemDiv != "") {
            this.selectItem(loadoutItemDiv);
            if (category.loadoutType == "crosshair") {
                this.setSelectedCrosshair();
            }
            this.modalCustomizeItemName.click();
        }

        // Disable crosshair elements on Edge
        if (device.browser == "edge") {
            if (category.loadoutType == "crosshair") {
                const disableElem = function(parentElem, disableElem) {
                    const height =
                        parentElem.height() +
                        parseInt(parentElem.css("padding-top")) +
                        parseInt(parentElem.css("padding-bottom"));
                    disableElem.css("height", height);
                };
                disableElem(
                    $("#modal-customize-body"),
                    $("#modal-content-left").find(
                        ".modal-disabled"
                    )
                );
                disableElem(
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
        const _this = this;
        // Display alerts on each category that has new items
        for (let i = 0; i < this.categories.length; i++) {
            const category = _this.categories[i];
            const unackdItems = _this.localAckItems.filter((x) => {
                const gameTypeDef = GameObjectDefs[x.type];
                return gameTypeDef && gameTypeDef.type == category.gameType;
            });
            $(`.modal-customize-cat[data-idx='${i}']`)
                .find(".account-alert-cat")
                .css(
                    "display",
                    unackdItems.length > 0 ? "block" : "none"
                );
        }
    }

    setEmoteDraggable(selector, that) {
        selector.on("dragstart", function(e) {
            if (
                !$(this).hasClass(
                    "customize-list-item-locked"
                ) &&
                (that.selectItem($(this), false),
                device.browser != "edge")
            ) {
                const imgDiv = document.createElement("img");
                imgDiv.src = that.selectedItem.img
                    ? that.selectedItem.img
                        .replace("url(", "")
                        .replace(")", "")
                        .replace(/\'/gi, "")
                    : "";
                e.originalEvent.dataTransfer.setDragImage(
                    imgDiv,
                    64,
                    64
                );
            }
        });
    }

    setSelectedCrosshair() {
        const crosshairDef = this.loadout.crosshair;
        $("#customize-crosshair-selected")
            .find(".customize-item-image")
            .css({
                "background-image": crosshair.getCursorURL(crosshairDef)
            });
        crosshair.setElemCrosshair(
            $("#customize-crosshair-selected"),
            crosshairDef
        );
    }
}

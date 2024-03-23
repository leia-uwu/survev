import $ from "jquery";

export class MenuModal {
    constructor(selector) {
        this.selector = selector;
        this.checkSelector = true;
        this.skipFade = false;
        this.visible = false;
        this.onShowFn = function() { };
        this.onHideFn = function() { };

        selector.find(".close").click((e) => {
            this.hide();
        });

        this.modalCloseListener = (e) => {
            if (
                $(e.target).closest(".modal-close").length == 0 &&
                (!!$(e.target).is(selector) || !this.checkSelector)
            ) {
                e.stopPropagation();
                this.hide();
            }
        };
    }

    onShow(fn) {
        this.onShowFn = fn;
    }

    onHide(fn) {
        this.onHideFn = fn;
    }

    isVisible() {
        return this.visible;
    }

    show(isModal) {
        if (!this.visible) {
            this.visible = true;
            this.selector.finish();
            this.selector.css("display", "block");
            this.onShowFn();
            if (!isModal) {
                $(document).on(
                    "click touchend",
                    this.modalCloseListener
                );
            }
        }
    }

    hide() {
        if (this.visible) {
            this.visible = false;
            if (this.skipFade) {
                this.selector.css("display", "none");
            } else {
                this.selector.fadeOut(200);
            }
            this.onHideFn();
            $(document).off(
                "click touchend",
                this.modalCloseListener
            );
        }
    }
}

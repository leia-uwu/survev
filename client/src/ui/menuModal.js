import $ from "jquery";

export class MenuModal {
    constructor(t) {
        const r = this;
        this.selector = t;
        this.checkSelector = true;
        this.skipFade = false;
        this.visible = false;
        this.onShowFn = function() { };
        this.onHideFn = function() { };
        t.find(".close").click((e) => {
            r.hide();
        });
        this.modalCloseListener = function(e) {
            if (
                $(e.target).closest(".modal-close").length == 0 &&
                (!!$(e.target).is(t) || !r.checkSelector)
            ) {
                e.stopPropagation();
                r.hide();
            }
        };
    }

    onShow(e) {
        this.onShowFn = e;
    }

    onHide(e) {
        this.onHideFn = e;
    }

    isVisible() {
        return this.visible;
    }

    show(e) {
        if (!this.visible) {
            this.visible = true;
            this.selector.finish();
            this.selector.css("display", "block");
            this.onShowFn();
            if (!e) {
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

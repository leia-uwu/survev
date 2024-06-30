import $ from "jquery";

export class MenuModal {
    checkSelector = true;
    skipFade = false;
    visible = false;
    onShowFn = function () {};
    onHideFn = function () {};
    modalCloseListener: (e: JQuery.TriggeredEvent) => void;

    constructor(public selector: JQuery<HTMLElement>) {
        selector.find(".close").click((_e) => {
            this.hide();
        });

        this.modalCloseListener = (e) => {
            if (
                $(e.target).closest(".modal-close").length == 0 &&
                (!!$(e.target).is(this.selector) || !this.checkSelector)
            ) {
                e.stopPropagation();
                this.hide();
            }
        };
    }

    onShow(fn: () => void) {
        this.onShowFn = fn;
    }

    onHide(fn: () => void) {
        this.onHideFn = fn;
    }

    isVisible() {
        return this.visible;
    }

    show(isModal?: boolean) {
        if (!this.visible) {
            this.visible = true;
            this.selector.finish();
            this.selector.css("display", "block");
            this.onShowFn();
            if (!isModal) {
                $(document).on("click touchend", this.modalCloseListener);
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
            $(document).off("click touchend", this.modalCloseListener);
        }
    }
}

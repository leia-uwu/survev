import $ from "jquery";
import api from "./api";
import device from "./device";
import helpers from "./helpers";
import MenuModal from "./menuModal";
import proxy from "./proxy";
import webview from "./webview";
import loadout from "./loadouts";

function i(e, t, r, a) {
    const i = e.find(".login-options-content");
    i.empty();
    if (t) {
        i.append(
            $("<div/>", {
                class: "account-login-desc"
            }).append(
                $("<p/>", {
                    html: a.translate("index-link-account-to")
                })
            )
        );
    }
    const o = $("<div/>", {
        class: "account-buttons"
    });
    i.append(o);
    const n = function(e, r, i) {
        if (proxy.loginSupported(e)) {
            const n = $("<div/>", {
                class: `menu-option btn-darken btn-standard btn-login-${e}`
            });
            n.append(
                $("<span/>", {
                    class: "login-button-name"
                })
                    .append(
                        $("<span/>", {
                            html: a.translate(`index-${e}`)
                        })
                    )
                    .append(
                        $("<div/>", {
                            class: "icon"
                        })
                    )
            );
            if (t && r) {
                n.addClass("btn-login-linked");
                n.find("span.login-button-name").html(
                    '<div class="icon"></div>'
                );
            } else {
                n.click((e) => {
                    i();
                });
            }
            o.append(n);
        }
    };
    n("facebook", r.profile.linkedFacebook, () => {
        if (device.webview && device.version > "1.0.0") {
            r.loginWithAccessToken(
                "/api/user/auth/facebook/token",
                webview.facebookLogin,
                (e) => {
                    return e.authResponse.accessToken;
                }
            );
        } else {
            window.location.href = "/api/user/auth/facebook";
        }
    });
    n("google", r.profile.linkedGoogle, () => {
        if (device.webview && device.version > "1.0.0") {
            r.loginWithAccessToken(
                "/api/user/auth/google/token",
                webview.googleLogin,
                (e) => {
                    return e.accessToken;
                }
            );
        } else {
            window.location.href = "/api/user/auth/google";
        }
    });
    n("twitch", r.profile.linkedTwitch, () => {
        window.location.href = "/api/user/auth/twitch";
    });
    n("discord", r.profile.linkedDiscord, () => {
        window.location.href = "/api/user/auth/discord";
    });
}

class ProfileUi {
    constructor(t, r, i, o) {
        this.account = t;
        this.localization = r;
        this.loadoutMenu = i;
        this.errorModal = o;
        this.setNameModal = null;
        this.resetStatsModal = null;
        this.deleteAccountModal = null;
        this.userSettingsModal = null;
        this.loginOptionsModal = null;
        this.createAccountModal = null;
        t.addEventListener("error", this.onError.bind(this));
        t.addEventListener("login", this.onLogin.bind(this));
        t.addEventListener(
            "loadout",
            this.onLoadoutUpdated.bind(this)
        );
        t.addEventListener("items", this.onItemsUpdated.bind(this));
        t.addEventListener("request", this.render.bind(this));
        this.initUi();
        this.render();
    }
    initUi() {
        const e = this;
        const t = function() {
            $("#modal-body-warning").css("display", "none");
            $("#modal-account-name-input").val("");
        };
        this.setNameModal = new MenuModal(
            $("#modal-account-name-change")
        );
        this.setNameModal.onShow(t);
        this.setNameModal.onHide(t);
        $("#modal-account-name-finish").click((t) => {
            t.stopPropagation();
            const r = $("#modal-account-name-input").val();
            e.account.setUsername(r, (t) => {
                if (t) {
                    const r = {
                        failed: "Failed setting username.",
                        invalid: "Invalid username.",
                        taken: "Name already taken!",
                        change_time_not_expired:
                            "Username has already been set recently."
                    };
                    const a = r[t] || r.failed;
                    $("#modal-body-warning").hide();
                    $("#modal-body-warning").html(a);
                    $("#modal-body-warning").fadeIn();
                } else {
                    e.setNameModal.hide();
                }
            });
        });
        $("#modal-account-name-input").on(
            "keypress",
            (e) => {
                if ((e.which || e.keyCode) === 13) {
                    $("#modal-account-name-finish").trigger(
                        "click"
                    );
                }
            }
        );
        this.resetStatsModal = new MenuModal(
            $("#modal-account-reset-stats")
        );
        this.resetStatsModal.onShow(() => {
            $("#modal-account-reset-stats-input").val("");
            e.modalMobileAccount.hide();
        });
        $("#modal-account-reset-stats-finish").click(
            (t) => {
                t.stopPropagation();
                if (
                    $(
                        "#modal-account-reset-stats-input"
                    ).val() == "RESET STATS"
                ) {
                    e.account.resetStats();
                    e.resetStatsModal.hide();
                }
            }
        );
        $("#modal-account-reset-stats-input").on(
            "keypress",
            (e) => {
                if ((e.which || e.keyCode) === 13) {
                    $(
                        "#modal-account-reset-stats-finish"
                    ).trigger("click");
                }
            }
        );
        this.deleteAccountModal = new MenuModal(
            $("#modal-account-delete")
        );
        this.deleteAccountModal.onShow(() => {
            $("#modal-account-delete-input").val("");
            e.modalMobileAccount.hide();
        });
        $("#modal-account-delete-finish").click((t) => {
            t.stopPropagation();
            if (
                $("#modal-account-delete-input").val() ==
                "DELETE"
            ) {
                e.account.deleteAccount();
                e.deleteAccountModal.hide();
            }
        });
        $("#modal-account-delete-input").on(
            "keypress",
            (e) => {
                if ((e.which || e.keyCode) === 13) {
                    $(
                        "#modal-account-delete-finish"
                    ).trigger("click");
                }
            }
        );
        this.userSettingsModal = new MenuModal(
            $(".account-buttons-settings")
        );
        this.userSettingsModal.checkSelector = false;
        this.userSettingsModal.skipFade = true;
        this.userSettingsModal.onShow(() => {
            $(".account-details-top").css(
                "display",
                "none"
            );
        });
        this.userSettingsModal.onHide(() => {
            $(".account-details-top").css(
                "display",
                "block"
            );
        });
        this.loginOptionsModal = new MenuModal(
            $("#account-login-options")
        );
        this.loginOptionsModal.checkSelector = false;
        this.loginOptionsModal.skipFade = true;
        this.loginOptionsModal.onShow(() => {
            $(".account-details-top").css(
                "display",
                "none"
            );
        });
        this.loginOptionsModal.onHide(() => {
            $(".account-details-top").css(
                "display",
                "block"
            );
        });
        this.loginOptionsModalMobile = new MenuModal(
            $("#account-login-options-mobile")
        );
        this.loginOptionsModalMobile.checkSelector = false;
        this.loginOptionsModalMobile.skipFade = true;
        this.loginOptionsModalMobile.onShow(() => {
            $(".account-details-top").css(
                "display",
                "none"
            );
        });
        this.loginOptionsModalMobile.onHide(() => {
            $(".account-details-top").css(
                "display",
                "block"
            );
        });
        this.createAccountModal = new MenuModal(
            $("#modal-create-account-INVALID_ID")
        );
        this.createAccountModal.onHide(() => {
            e.loadoutMenu.hide();
        });
        this.modalMobileAccount = new MenuModal(
            $("#modal-mobile-account")
        );
        this.modalMobileAccount.onShow(() => {
            $("#start-top-right").css("display", "none");
            $(".account-details-top").css(
                "display",
                "none"
            );
        });
        this.modalMobileAccount.onHide(() => {
            $("#start-top-right").css("display", "block");
            $(".account-details-top").css(
                "display",
                "block"
            );
            e.userSettingsModal.hide();
        });
        $(".account-leaderboard-link").click((e) => {
            window.open(api.resolveUrl("/stats"), "_blank");
            return false;
        });
        $(".account-stats-link").click((t) => {
            e.waitOnLogin(() => {
                if (e.account.loggedIn) {
                    if (e.account.profile.usernameSet) {
                        const t =
                            e.account.profile.slug || "";
                        window.open(
                            `/stats/${t}`,
                            "_blank"
                        );
                    } else {
                        e.setNameModal.show(true);
                    }
                } else {
                    e.showLoginMenu({
                        modal: true
                    });
                }
            });
            return false;
        });
        $(".account-loadout-link, #btn-customize").click(
            () => {
                e.loadoutMenu.show();
                e.waitOnLogin(() => {
                    if (!e.account.loggedIn) {
                        e.showLoginMenu({
                            modal: true
                        });
                    }
                });
                return false;
            }
        );
        $(".account-details-user").click(() => {
            if (
                e.userSettingsModal.isVisible() ||
                e.loginOptionsModal.isVisible()
            ) {
                e.userSettingsModal.hide();
                e.loginOptionsModal.hide();
            } else {
                e.waitOnLogin(() => {
                    if (device.mobile) {
                        e.modalMobileAccount.show();
                    }
                    if (e.account.loggedIn) {
                        e.loginOptionsModal.hide();
                        e.userSettingsModal.show();
                    } else {
                        e.showLoginMenu({
                            modal: false
                        });
                    }
                });
            }
            return false;
        });
        $(".btn-account-link").click(() => {
            e.userSettingsModal.hide();
            e.showLoginMenu({
                modal: false,
                link: true
            });
            return false;
        });
        $(".btn-account-change-name").click(() => {
            if (e.account.profile.usernameChangeTime <= 0) {
                e.userSettingsModal.hide();
                e.modalMobileAccount.hide();
                $("#modal-account-name-title").html(
                    e.localization.translate(
                        "index-change-account-name"
                    )
                );
                e.setNameModal.show();
            }
            return false;
        });
        $(".btn-account-reset-stats").click(() => {
            e.userSettingsModal.hide();
            e.resetStatsModal.show();
            return false;
        });
        $(".btn-account-delete").click(() => {
            e.userSettingsModal.hide();
            e.deleteAccountModal.show();
            return false;
        });
        $(".btn-account-logout").click(() => {
            e.account.logout();
            return false;
        });
        $("#btn-pass-locked").click(() => {
            e.showLoginMenu({
                modal: true
            });
            return false;
        });
    }
    onError(e, t) {
        const r = {
            server_error:
                "Operation failed, please try again later.",
            facebook_account_in_use:
                "Failed linking Facebook account.<br/>Account already in use!",
            google_account_in_use:
                "Failed linking Google account.<br/>Account already in use!",
            twitch_account_in_use:
                "Failed linking Twitch account.<br/>Account already in use!",
            discord_account_in_use:
                "Failed linking Discord account.<br/>Account already in use!",
            account_banned: `Account banned: ${t}`,
            login_failed: "Login failed."
        };
        const a = r[e];
        if (a) {
            this.errorModal.selector
                .find(".modal-body-text")
                .html(a);
            this.errorModal.show();
        }
    }
    onLogin() {
        this.createAccountModal.hide();
        this.loginOptionsModalMobile.hide();
        this.loginOptionsModal.hide();
        if (!this.account.profile.usernameSet) {
            this.setNameModal.show(true);
        }
    }
    onLoadoutUpdated(e) {
        this.updateUserIcon();
    }
    onItemsUpdated(e) {
        var t = 0;
        var r = 0;
        for (var a = 0; a < e.length; a++) {
            const i = e[a];
            if (i.status < loadout.ItemStatus.Confirmed) {
                t++;
            }
            if (i.status < loadout.ItemStatus.Ackd) {
                r++;
            }
        }
        e.filter((e) => {
            return e.status < loadout.ItemStatus.Confirmed;
        });
        e.filter((e) => {
            return e.status < loadout.ItemStatus.Ackd;
        });
        const o = t > 0 || r > 0;
        $("#loadout-alert-main").css({
            display: o ? "block" : "none"
        });
    }
    waitOnLogin(e) {
        const t = this;
        if (
            this.account.loggingIn &&
            !this.account.loggedIn
        ) {
            const r = function r() {
                e();
                t.account.removeEventListener(
                    "requestsComplete",
                    r
                );
            };
            this.account.addEventListener(
                "requestsComplete",
                r
            );
        } else {
            e();
        }
    }
    showLoginMenu(e) {
        e = Object.assign(
            {
                modal: false,
                link: false
            },
            e
        );
        const t = e.modal
            ? this.createAccountModal
            : device.mobile
                ? this.loginOptionsModalMobile
                : this.loginOptionsModal;
        i(
            t.selector,
            e.link,
            this.account,
            this.localization
        );
        t.show();
    }
    updateUserIcon() {
        const e =
            helpers.getSvgFromGameType(
                this.account.loadout.player_icon
            ) || "img/gui/player-gui.svg";
        $(".account-details-user .account-avatar").css(
            "background-image",
            `url(${e})`
        );
    }
    render() {
        const e = this.account.requestsInFlight > 0;
        $(".account-loading").css("opacity", e ? 1 : 0);
        let t = helpers.htmlEscape(
            this.account.profile.username || ""
        );
        if (!this.account.loggedIn) {
            t = this.account.loggingIn
                ? `${this.localization.translate(
                    "index-logging-in"
                )}...`
                : this.localization.translate(
                    "index-log-in-desc"
                );
        }
        $("#account-player-name").html(t);
        $("#account-player-name").css(
            "display",
            this.account.loggedIn ? "block" : "none"
        );
        $("#account-login").css(
            "display",
            this.account.loggedIn ? "none" : "block"
        );
        this.updateUserIcon();
        if (this.account.profile.usernameChangeTime <= 0) {
            $(".btn-account-change-name").removeClass(
                "btn-account-disabled"
            );
        } else {
            $(".btn-account-change-name").addClass(
                "btn-account-disabled"
            );
        }
    }
}

export default ProfileUi;

import $ from "jquery";
import api from "./api";
import helpers from "./helpers";
import firebaseManager from "./firebaseManager";
import loadouts from "./loadouts";

function a(e, t) {
    if (!(e instanceof t)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function i(e, t, r) {
    if (typeof t === "function") {
        r = t;
        t = null;
    }
    const a = {
        url: api.resolveUrl(e),
        type: "POST",
        timeout: 10000,
        headers: {
            "X-Requested-With": "XMLHttpRequest"
        }
    };
    if (t) {
        a.contentType = "application/json; charset=utf-8";
        a.data = JSON.stringify(t);
    }
    $.ajax(a)
        .done((e, t) => {
            r(null, e);
        })
        .fail((e) => {
            r(e);
        });
}
const o = (function() {
    function e(e, t) {
        for (let r = 0; r < t.length; r++) {
            const a = t[r];
            a.enumerable = a.enumerable || false;
            a.configurable = true;
            if ("value" in a) {
                a.writable = true;
            }
            Object.defineProperty(e, a.key, a);
        }
    }
    return function(t, r, a) {
        if (r) {
            e(t.prototype, r);
        }
        if (a) {
            e(t, a);
        }
        return t;
    };
})();

const p = (function() {
    function e(t) {
        const r = this;
        a(this, e);
        this.config = t;
        this.events = {};
        this.requestsInFlight = 0;
        this.loggingIn = false;
        this.loggedIn = false;
        this.profile = {};
        this.loadout = loadouts.defaultLoadout();
        this.loadoutPriv = "";
        this.items = [];
        this.quests = [];
        this.questPriv = "";
        this.pass = {};
        window.login = function() {
            r.login();
        };
        window.deleteAccount = function() {
            r.deleteAccount();
        };
        window.deleteItems = function() {
            r.ajaxRequest("/api/user/delete_items", {}, (e, t) => {
                r.loadProfile();
            });
        };
        window.unlock = function(e) {
            console.log(`Unlocking ${e}`);
            r.unlock(e);
        };
        window.setQuest = function(e, t) {
            t = t || 0;
            r.ajaxRequest(
                "/api/user/set_quest",
                {
                    questType: e,
                    idx: t
                },
                (e, t) => {
                    r.getPass();
                }
            );
        };
        window.refreshQuest = function(e) {
            r.refreshQuest(e);
        };
        window.setPassUnlock = function(e) {
            r.setPassUnlock(e);
        };
    }
    o(e, [
        {
            key: "ajaxRequest",
            value: function(e, t, r) {
                const a = this;
                if (typeof t === "function") {
                    r = t;
                    t = null;
                }
                this.requestsInFlight++;
                this.emit("request", this);
                i(e, t, (e, t) => {
                    r(e, t);
                    a.requestsInFlight--;
                    a.emit("request", a);
                    if (a.requestsInFlight == 0) {
                        a.emit("requestsComplete");
                    }
                });
            }
        },
        {
            key: "addEventListener",
            value: function(e, t) {
                this.events[e] = this.events[e] || [];
                this.events[e].push(t);
            }
        },
        {
            key: "removeEventListener",
            value: function(e, t) {
                for (
                    let r = this.events[e] || [], a = r.length - 1;
                    a >= 0;
                    a--
                ) {
                    if (r[a] == t) {
                        r.splice(a, 1);
                    }
                }
            }
        },
        {
            key: "emit",
            value: function(e) {
                var t = (this.events[e] || []).slice(0);
                for (
                    var r = arguments.length,
                    a = Array(r > 1 ? r - 1 : 0),
                    i = 1;
                    i < r;
                    i++
                ) {
                    a[i - 1] = arguments[i];
                }
                for (let o = 0; o < t.length; o++) {
                    t[o].apply(t, a);
                }
            }
        },
        {
            key: "init",
            value: function() {
                if (this.config.get("sessionCookie")) {
                    this.setSessionCookies();
                }
                if (helpers.getCookie("app-data")) {
                    this.login();
                }
            }
        },
        {
            key: "setSessionCookies",
            value: function() {
                this.clearSessionCookies();
                document.cookie = this.config.get("sessionCookie");
                document.cookie = `app-data=${Date.now()}`;
            }
        },
        {
            key: "clearSessionCookies",
            value: function() {
                document.cookie =
                    "app-sid=;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                document.cookie =
                    "app-data=;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
            }
        },
        {
            key: "loginWithAccessToken",
            value: function(e, t, r) {
                const a = this;
                t((t, i) => {
                    if (t) {
                        a.emit("error", "login_failed");
                        return;
                    }
                    const o = r(i);
                    a.ajaxRequest(
                        `${e}?access_token=${o}`,
                        (e, t) => {
                            if (e) {
                                a.emit("error", "login_failed");
                            } else {
                                a.config.set(
                                    "sessionCookie",
                                    t.cookie
                                );
                                a.setSessionCookies();
                                a.login();
                            }
                        }
                    );
                });
            }
        },
        {
            key: "login",
            value: function() {
                if (helpers.getCookie("app-data")) {
                    this.loadProfile();
                    this.getPass(true);
                }
            }
        },
        {
            key: "logout",
            value: function() {
                this.config.set("profile", null);
                this.config.set("sessionCookie", null);
                this.ajaxRequest("/api/user/logout", (e, t) => {
                    window.location.reload();
                });
            }
        },
        {
            key: "loadProfile",
            value: function() {
                const e = this;
                this.loggingIn = !this.loggedIn;
                this.ajaxRequest("/api/user/profile", (t, r) => {
                    const a = e.loggingIn;
                    e.loggingIn = false;
                    e.loggedIn = false;
                    e.profile = {};
                    e.loadout = loadouts.defaultLoadout();
                    e.loadoutPriv = "";
                    e.items = [];
                    if (t) {
                        firebaseManager.storeGeneric(
                            "account",
                            "load_profile_error"
                        );
                    } else if (r.banned) {
                        e.emit("error", "account_banned", r.reason);
                    } else if (r.success) {
                        e.loggedIn = true;
                        e.profile = r.profile;
                        e.loadout = r.loadout;
                        e.loadoutPriv = r.loadoutPriv;
                        e.items = r.items;
                        const i = e.config.get("profile") || {};
                        i.slug = r.profile.slug;
                        e.config.set("profile", i);
                    }
                    if (!e.loggedIn) {
                        e.config.set("sessionCookie", null);
                    }
                    if (a && e.loggedIn) {
                        e.emit("login", e);
                    }
                    e.emit("loadout", e.loadout);
                    e.emit("items", e.items);
                });
            }
        },
        {
            key: "resetStats",
            value: function() {
                const e = this;
                this.ajaxRequest(
                    "/api/user/reset_stats",
                    (t, r) => {
                        if (t) {
                            firebaseManager.storeGeneric(
                                "account",
                                "reset_stats_error"
                            );
                            e.emit("error", "server_error");
                            return;
                        }
                    }
                );
            }
        },
        {
            key: "deleteAccount",
            value: function() {
                const e = this;
                this.ajaxRequest("/api/user/delete", (t, r) => {
                    if (t) {
                        firebaseManager.storeGeneric("account", "delete_error");
                        e.emit("error", "server_error");
                        return;
                    }
                    e.config.set("profile", null);
                    e.config.set("sessionCookie", null);
                    window.location.reload();
                });
            }
        },
        {
            key: "setUsername",
            value: function(e, t) {
                const r = this;
                this.ajaxRequest(
                    "/api/user/username",
                    {
                        username: e
                    },
                    (e, a) => {
                        if (e) {
                            firebaseManager.storeGeneric(
                                "account",
                                "set_username_error"
                            );
                            t(e);
                            return;
                        }
                        if (a.result == "success") {
                            r.loadProfile();
                            t();
                        } else {
                            t(a.result);
                        }
                    }
                );
            }
        },
        {
            key: "setLoadout",
            value: function(e) {
                const t = this;
                const r = this.loadout;
                this.loadout = e;
                this.emit("loadout", this.loadout);
                this.ajaxRequest(
                    "/api/user/loadout",
                    {
                        loadout: e
                    },
                    (e, a) => {
                        if (e) {
                            firebaseManager.storeGeneric(
                                "account",
                                "set_loadout_error"
                            );
                            t.emit("error", "server_error");
                        }
                        if (e || !a.loadout) {
                            t.loadout = r;
                        } else {
                            t.loadout = a.loadout;
                            t.loadoutPriv = a.loadoutPriv;
                        }
                        t.emit("loadout", t.loadout);
                    }
                );
            }
        },
        {
            key: "setItemStatus",
            value: function(e, t) {
                const r = this;
                if (t.length != 0) {
                    for (let a = 0; a < t.length; a++) {
                        (function(a) {
                            const i = r.items.find((e) => {
                                return e.type == t[a];
                            });
                            if (i) {
                                i.status = Math.max(i.status, e);
                            }
                        })(a);
                    }
                    this.emit("items", this.items);
                    this.ajaxRequest(
                        "/api/user/set_item_status",
                        {
                            status: e,
                            itemTypes: t
                        },
                        (e, t) => {
                            if (e) {
                                firebaseManager.storeGeneric(
                                    "account",
                                    "set_item_status_error"
                                );
                            }
                        }
                    );
                }
            }
        },
        {
            key: "unlock",
            value: function(e) {
                const t = this;
                this.ajaxRequest(
                    "/api/user/unlock",
                    {
                        unlockType: e
                    },
                    (e, r) => {
                        if (e || !r.success) {
                            firebaseManager.storeGeneric(
                                "account",
                                "unlock_error"
                            );
                            t.emit("error", "server_error");
                            return;
                        }
                        t.items = r.items;
                        t.emit("items", t.items);
                    }
                );
            }
        },
        {
            key: "getPass",
            value: function(e) {
                const t = this;
                this.ajaxRequest(
                    "/api/user/get_pass",
                    {
                        tryRefreshQuests: e
                    },
                    (e, r) => {
                        t.pass = {};
                        t.quests = [];
                        t.questPriv = "";
                        if (e || !r.success) {
                            firebaseManager.storeGeneric(
                                "account",
                                "get_pass_error"
                            );
                        } else {
                            t.pass = r.pass || {};
                            t.quests = r.quests || [];
                            t.questPriv = r.questPriv || "";
                            t.quests.sort((e, t) => {
                                return e.idx - t.idx;
                            });
                            t.emit("pass", t.pass, t.quests, true);
                            if (t.pass.newItems) {
                                t.loadProfile();
                            }
                        }
                    }
                );
            }
        },
        {
            key: "setPassUnlock",
            value: function(e) {
                const t = this;
                this.ajaxRequest(
                    "/api/user/set_pass_unlock",
                    {
                        unlockType: e
                    },
                    (e, r) => {
                        if (e || !r.success) {
                            firebaseManager.storeGeneric(
                                "account",
                                "set_pass_unlock_error"
                            );
                        } else {
                            t.getPass(false);
                        }
                    }
                );
            }
        },
        {
            key: "refreshQuest",
            value: function(e) {
                const t = this;
                this.ajaxRequest(
                    "/api/user/refresh_quest",
                    {
                        idx: e
                    },
                    (e, r) => {
                        if (e) {
                            firebaseManager.storeGeneric(
                                "account",
                                "refresh_quest_error"
                            );
                            return;
                        }
                        if (r.success) {
                            t.getPass(false);
                        } else {
                            t.emit("pass", t.pass, t.quests, false);
                        }
                    }
                );
            }
        }
    ]);
    return e;
})();
export default p;

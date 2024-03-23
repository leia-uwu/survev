import $ from "jquery";
import { api } from "./api";
import loadouts from "./ui/loadouts";
import { util } from "../../shared/utils/util";

function ajaxRequest(url, data, cb) {
    if (typeof data === "function") {
        cb = data;
        data = null;
    }
    const opts = {
        url: api.resolveUrl(url),
        type: "POST",
        timeout: 10 * 1000,
        headers: {
            // Set a header to guard against CSRF attacks.
            //
            // JQuery does this automatically, however we'll add it here explicitly
            // so the intent is clear incase of refactoring in the future.
            "X-Requested-With": "XMLHttpRequest"
        }
    };
    if (data) {
        opts.contentType = "application/json; charset=utf-8";
        opts.data = JSON.stringify(data);
    }
    $.ajax(opts)
        .done((res) => {
            cb(null, res);
        })
        .fail((e) => {
            cb(e);
        });
}

export class Account {
    constructor(t) {
        const r = this;
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

    ajaxRequest(url, data, cb) {
        if (typeof data === "function") {
            cb = data;
            data = null;
        }
        this.requestsInFlight++;
        this.emit("request", this);
        ajaxRequest(url, data, (err, res) => {
            cb(err, res);
            this.requestsInFlight--;
            this.emit("request", this);
            if (this.requestsInFlight == 0) {
                this.emit("requestsComplete");
            }
        });
    }

    addEventListener(event, callback) {
        this.events[event] = this.events[event] || [];
        this.events[event].push(callback);
    }

    removeEventListener(event, callback) {
        const listeners = this.events[event] || [];
        for (
            let i = listeners.length - 1;
            i >= 0;
            i--
        ) {
            if (listeners[i] == callback) {
                listeners.splice(i, 1);
            }
        }
    }

    emit(event) {
        const listenersCopy = (this.events[event] || []).slice(0);
        const len = arguments.length;
        const data = Array(len > 1 ? len - 1 : 0);
        for (let i = 1; i < len; i++) {
            data[i - 1] = arguments[i];
        }
        for (let i = 0; i < listenersCopy.length; i++) {
            listenersCopy[i].apply(listenersCopy, data);
        }
    }

    init() {
        if (this.config.get("sessionCookie")) {
            this.setSessionCookies();
        }
        // if (helpers.getCookie("app-data")) {
        this.login();
        // }
    }

    setSessionCookies() {
        this.clearSessionCookies();
        document.cookie = this.config.get("sessionCookie");
        document.cookie = `app-data=${Date.now()}`;
    }

    clearSessionCookies() {
        document.cookie =
            "app-sid=;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        document.cookie =
            "app-data=;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    }

    loginWithAccessToken(authUrl, requestTokenFn, extractTokenFn) {
        requestTokenFn((err, data) => {
            if (err) {
                this.emit("error", "login_failed");
                return;
            }
            const token = extractTokenFn(data);
            this.ajaxRequest(
                `${authUrl}?access_token=${token}`,
                (err, res) => {
                    if (err) {
                        this.emit("error", "login_failed");
                    } else {
                        this.config.set(
                            "sessionCookie",
                            res.cookie
                        );
                        this.setSessionCookies();
                        this.login();
                    }
                }
            );
        });
    }

    login() {
        // if (helpers.getCookie("app-data")) {
        this.loadProfile();
        this.getPass(true);
        // }
    }

    logout() {
        this.config.set("profile", null);
        this.config.set("sessionCookie", null);
        this.ajaxRequest("/api/user/logout", (e, t) => {
            window.location.reload();
        });
    }

    loadProfile() {
        this.loggingIn = !this.loggedIn;
        this.ajaxRequest("/api/user/profile", (t, r) => {
            const a = this.loggingIn;
            this.loggingIn = false;
            this.loggedIn = false;
            this.profile = {};
            this.loadoutPriv = "";
            this.items = [];
            if (t) {
                console.error(
                    "account",
                    "load_profile_error"
                );
            } else if (r.banned) {
                this.emit("error", "account_banned", r.reason);
            } else if (r.success) {
                this.loggedIn = true;
                this.profile = r.profile;
                this.loadoutPriv = r.loadoutPriv;
                this.items = r.items;
                const i = this.config.get("profile") || {};
                i.slug = r.profile.slug;
                this.config.set("profile", i);
            }
            if (!this.loggedIn) {
                this.config.set("sessionCookie", null);
            }
            if (a && this.loggedIn) {
                this.emit("login", this);
            }
            this.emit("items", this.items);
        });

        const storedLoadout = this.config.get("loadout");
        this.loadout = util.mergeDeep({}, loadouts.defaultLoadout(), storedLoadout);
        this.emit("loadout", this.loadout);
    }

    resetStats() {
        const e = this;
        this.ajaxRequest(
            "/api/user/reset_stats",
            (t, r) => {
                if (t) {
                    console.error(
                        "account",
                        "reset_stats_error"
                    );
                    e.emit("error", "server_error");
                }
            }
        );
    }

    deleteAccount() {
        this.ajaxRequest("/api/user/delete", (err, res) => {
            if (err) {
                console.error("account", "delete_error");
                this.emit("error", "server_error");
                return;
            }
            this.config.set("profile", null);
            this.config.set("sessionCookie", null);
            window.location.reload();
        });
    }

    setUsername(username, callback) {
        const r = this;
        this.ajaxRequest(
            "/api/user/username",
            {
                username
            },
            (err, res) => {
                if (err) {
                    console.error(
                        "account",
                        "set_username_error"
                    );
                    callback(err);
                    return;
                }
                if (res.result == "success") {
                    r.loadProfile();
                    callback();
                } else {
                    callback(res.result);
                }
            }
        );
    }

    setLoadout(loadout) {
        // const t = this;
        // const r = this.loadout;
        this.loadout = loadout;
        this.emit("loadout", this.loadout);
        this.config.set("loadout", loadout);
        /* this.ajaxRequest(
            "/api/user/loadout",
            {
                loadout: e
            },
            (e, a) => {
                if (e) {
                    console.error(
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
        ); */
    }

    setItemStatus(status, itemTypes) {
        if (itemTypes.length != 0) {
            // Preemptively mark the item status as modified on our local copy
            for (let i = 0; i < itemTypes.length; i++) {
                const item = this.items.find((e) => {
                    return e.type == itemTypes[i];
                });
                if (item) {
                    item.status = Math.max(item.status, status);
                }
            }
            this.emit("items", this.items);
            this.ajaxRequest(
                "/api/user/set_item_status",
                {
                    status,
                    itemTypes
                },
                (err, res) => {
                    if (err) {
                        console.error(
                            "account",
                            "set_item_status_error"
                        );
                    }
                }
            );
        }
    }

    unlock(e) {
        const t = this;
        this.ajaxRequest(
            "/api/user/unlock",
            {
                unlockType: e
            },
            (e, r) => {
                if (e || !r.success) {
                    console.error(
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

    getPass(tryRefreshQuests) {
        /* const This = this;
        this.ajaxRequest(
            "/api/user/get_pass",
            {
                tryRefreshQuests
            },
            (err, res) => {
                This.pass = {};
                This.quests = [];
                This.questPriv = "";
                if (err || !res.success) {
                    console.error(
                        "account",
                        "get_pass_error"
                    );
                } else {
                    This.pass = res.pass || {};
                    This.quests = res.quests || [];
                    This.questPriv = res.questPriv || "";
                    This.quests.sort((a, b) => {
                        return a.idx - b.idx;
                    });
                    This.emit("pass", This.pass, This.quests, true);
                    if (This.pass.newItems) {
                        This.loadProfile();
                    }
                }
            }
        ); */
    }

    setPassUnlock(unlockType) {
        this.ajaxRequest(
            "/api/user/set_pass_unlock",
            {
                unlockType
            },
            (err, res) => {
                if (err || !res.success) {
                    console.error(
                        "account",
                        "set_pass_unlock_error"
                    );
                } else {
                    this.getPass(false);
                }
            }
        );
    }

    refreshQuest(e) {
        const t = this;
        this.ajaxRequest(
            "/api/user/refresh_quest",
            {
                idx: e
            },
            (e, r) => {
                if (e) {
                    console.error(
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

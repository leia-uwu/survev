import $ from "jquery";
import helpers from "./helpers";
import { math } from "../../shared/utils/math";
import { GameObjectDefs } from "../../shared/defs/gameObjectDefs";
import { PassDefs } from "../../shared/defs/gameObjects/passDefs";
import { QuestDefs } from "../../shared/defs/gameObjects/questDefs";
import passUtil from "./passUtil";


function i(e, t) {
    for (let r = PassDefs[e], a = 0; a < r.items.length; a++) {
        if (r.items[a].level == t + 1) {
            return r.items[a].item;
        }
    }
    return "";
}
function o(e) {
    const t =
        arguments.length > 1 &&
        arguments[1] !== undefined &&
        arguments[1];
    const r = Math.floor(Math.ceil(e / 60) / 60);
    const a = t ? Math.floor(e / 60) % 60 : Math.ceil(e / 60) % 60;
    Math.floor(e);
    let i = "";
    if (r > 0) {
        i += `${r}h `;
    }
    return (i += `${a}m`);
}

class Pass {
    constructor(t, r, i) {
        this.account = t;
        this.loadoutMenu = r;
        this.localization = i;
        this.pass = {
            data: {
                type: "pass_survivr1"
            },
            currentXp: 0,
            currentLevel: 1,
            levelXp: 0,
            ticker: 0,
            animSteps: [],
            elems: {}
        };
        this.quests = [];
        this.loaded = false;
        this.lockDisplayed = false;
        this.updatePass = false;
        this.updatePassTicker = 0;
        this.account.addEventListener(
            "request",
            this.onRequest.bind(this)
        );
        this.account.addEventListener(
            "pass",
            this.onPass.bind(this)
        );
        this.loadPlaceholders();
        $("#pass-progress-unlock-wrapper").hover(
            () => {
                $("#pass-unlock-tooltip").fadeIn(50);
            },
            () => {
                $("#pass-unlock-tooltip").fadeOut(50);
            }
        );
    }
    onPass(e, t, r) {
        var a = this;
        var s = [];
        var l = 0;
        for (var p = 0; p < t.length; p++) {
            (function(e) {
                const i = t[e];
                const m = {
                    data: i,
                    start: 0,
                    current: 0,
                    ticker: 0,
                    delay: l * 0.5,
                    playCompleteAnim: false,
                    progressAnimFinished: false,
                    completeAnimFinished: false,
                    shouldRequestRefresh: r,
                    refreshTime:
                        Date.now() + i.timeToRefresh + 5000,
                    refreshSet: false,
                    refreshEnabled: false,
                    timer: {
                        enabled: false,
                        str: ""
                    }
                };
                const p = a.quests.find((e) => {
                    return (
                        e.data.idx == m.data.idx &&
                        e.data.type == m.data.type
                    );
                });
                if (p) {
                    m.start = p.current;
                    m.current = p.current;
                    if (
                        !p.data.complete &&
                        m.data.complete
                    ) {
                        m.playCompleteAnim = true;
                    }
                }
                m.data.progress = math.min(
                    m.data.progress,
                    m.data.target
                );
                if (m.data.progress > m.current) {
                    l++;
                }
                const h = $(`#pass-quest-${m.data.idx}`);
                m.elems = {
                    main: h,
                    xp: h.find(".pass-quest-xp"),
                    info: h.find(".pass-quest-info"),
                    desc: h.find(".pass-quest-desc"),
                    cur: h.find(
                        ".pass-quest-counter-current"
                    ),
                    target: h.find(
                        ".pass-quest-counter-target"
                    ),
                    refresh: h.find(".pass-quest-refresh"),
                    refreshPrompt: h.find(
                        ".pass-quest-refresh-prompt"
                    ),
                    refreshConfirm: h.find(
                        ".pass-quest-refresh-confirm"
                    ),
                    refreshCancel: h.find(
                        ".pass-quest-refresh-cancel"
                    ),
                    counter: h.find(".pass-quest-counter"),
                    barFill: h.find(".pass-quest-bar-fill"),
                    timer: h.find(".pass-quest-timer"),
                    loading: h.find(".pass-quest-spinner")
                };
                m.elems.barFill.clearQueue();
                m.elems.main.removeClass("pass-bg-pulse");
                m.elems.main.stop().css({
                    opacity: 1
                });
                m.elems.xp.removeClass("pass-text-pulse");
                m.elems.refresh.stop().css({
                    opacity: 1
                });
                m.elems.counter.stop().css({
                    opacity: 1
                });
                const u = QuestDefs[m.data.type];
                const g =
                    a.localization.translate(
                        `${m.data.type}`
                    ) || m.data.type;
                const y = (m.current / m.data.target) * 100;
                m.elems.main.css("display", "block");
                m.elems.desc.html(g);
                m.elems.cur.html(Math.round(m.current));
                m.elems.xp.html(`${u.xp} XP`);
                m.elems.barFill.css({
                    width: `${y}%`
                });
                m.elems.loading.css("display", "none");
                let w = m.data.target;
                if (u.timed) {
                    w = o(w);
                }
                m.elems.target.html(w);
                if (u.icon) {
                    m.elems.desc.addClass(
                        "pass-quest-desc-icon"
                    );
                    const f = `url(${u.icon})`;
                    m.elems.desc.css({
                        "background-image": f
                    });
                } else {
                    m.elems.desc.removeClass(
                        "pass-quest-desc-icon"
                    );
                    m.elems.desc.attr("style", "");
                }
                a.setQuestRefreshEnabled(m);
                s.push(m);
            })(p);
        }
        this.quests = s;
        PassDefs[e.type];
        this.pass.data = e;
        this.pass.animSteps = [];
        this.pass.currentXp = Math.round(
            this.pass.currentXp
        );
        this.pass.levelXp = passUtil.getPassLevelXp(
            e.type,
            this.pass.currentLevel
        );
        if (!this.loaded) {
            const u = passUtil.getPassLevelXp(e.type, e.level);
            this.pass.currentXp = 0;
            this.pass.currentLevel = e.level;
            this.pass.levelXp = u;
            this.pass.ticker = 0;
        }
        let g = this.pass.currentLevel;
        let y = this.pass.currentXp;
        if (this.loaded) {
            while (g < e.level) {
                const w = passUtil.getPassLevelXp(e.type, g);
                this.pass.animSteps.push({
                    startXp: y,
                    targetXp: w,
                    levelXp: w,
                    targetLevel: g + 1
                });
                g++;
                y = 0;
            }
            const f = l > 0 ? 2 : 0;
            this.pass.ticker = -f;
        }
        const _ = passUtil.getPassLevelXp(e.type, g);
        this.pass.animSteps.push({
            startXp: y,
            targetXp: e.xp,
            levelXp: _,
            targetLevel: g
        });
        $("#pass-block").css("z-index", "1");
        $("#pass-locked").css("display", "none");
        $("#pass-loading").css("display", "none");
        const b = i(
            this.pass.data.type,
            this.pass.currentLevel
        );
        this.setPassUnlockImage(b);
        const x = this.localization
            .translate(e.type)
            .toUpperCase();
        $("#pass-name-text").html(x);
        $("#pass-progress-level").html(
            this.pass.currentLevel
        );
        $("#pass-progress-xp-current").html(
            this.pass.currentXp
        );
        $("#pass-progress-xp-target").html(
            this.pass.levelXp
        );
        const S =
            (this.pass.currentXp / this.pass.levelXp) * 100;
        $("#pass-progress-bar-fill").css({
            width: `${S}%`
        });
        this.loaded = true;
    }
    onRequest(e) {
        $("#pass-loading").css(
            "display",
            e.loggingIn ? "block" : "none"
        );
    }
    scheduleUpdatePass(e) {
        this.updatePass = true;
        this.updatePassTicker = e;
    }
    setQuestRefreshEnabled(e) {
        const t = this;
        const r =
            (!e.data.rerolled && !e.data.complete) ||
            e.refreshTime - Date.now() < 0;
        if (r != e.refreshEnabled || !e.refreshSet) {
            e.refreshEnabled = r;
            e.refreshSet = true;
            e.elems.refresh.off("click");
            e.elems.refreshConfirm.off("click");
            e.elems.refreshCancel.off("click");
            if (e.refreshEnabled) {
                e.elems.refreshConfirm.on("click", () => {
                    e.elems.loading.css("display", "block");
                    e.elems.refreshPrompt.css(
                        "display",
                        "none"
                    );
                    t.account.refreshQuest(e.data.idx);
                });
                e.elems.refreshCancel.on("click", () => {
                    e.elems.refreshPrompt.css(
                        "display",
                        "none"
                    );
                    e.elems.info.css("display", "block");
                });
                e.elems.refresh.on("click", () => {
                    e.elems.refreshPrompt.css(
                        "display",
                        "block"
                    );
                    e.elems.info.css("display", "none");
                });
                e.elems.refresh.removeClass(
                    "pass-quest-refresh-disabled"
                );
            } else {
                e.elems.refresh.addClass(
                    "pass-quest-refresh-disabled"
                );
            }
        }
    }
    setPassUnlockImage(e) {
        const t = GameObjectDefs[e];
        const r = t
            ? helpers.getSvgFromGameType(e)
            : "img/emotes/surviv.svg";
        const a = `url(${r})`;
        const i = helpers.getCssTransformFromGameType(e);
        $("#pass-progress-unlock").css({
            opacity: t ? 1 : 0.15,
            transform: `translate(-50%, -50%) ${i}`
        });
        $("#pass-progress-unlock-image").css({
            "background-image": a
        });
        const o = t
            ? this.localization
                .translate(
                    `loadout-title-${this.loadoutMenu.getCategory(
                        t.type
                    ).loadoutType
                    }`
                )
                .toUpperCase()
            : "";
        const s = $("#pass-unlock-tooltip");
        s.css("opacity", t ? 1 : 0);
        s.find(".tooltip-pass-title").html(o);
        s.find(".tooltip-pass-desc").html(t ? t.name : "");
        const c = t
            ? `url(${this.loadoutMenu.getCategory(t.type)
                .categoryImage
            })`
            : "";
        $("#pass-progress-unlock-type-image").css({
            "background-image": c
        });
        $("#pass-progress-unlock-type-wrapper").css({
            display: t ? "block" : "none"
        });
    }
    animatePassLevelUp() {
        const e = this;
        const t = $("#pass-progress-bar-fill");
        const r = $("#pass-progress-level");
        const a = $("#pass-progress-unlock-wrapper");
        const o = $("#pass-progress-unlock-image");
        const s = $("#pass-progress-unlock-type-image");
        r.html(this.pass.currentLevel);
        t.queue((e) => {
            a.addClass("pass-unlock-pulse");
            $(e).dequeue();
        })
            .delay(750)
            .queue((e) => {
                o.animate(
                    {
                        opacity: 0
                    },
                    250
                );
                s.animate(
                    {
                        opacity: 0
                    },
                    250
                );
                $(e).dequeue();
            })
            .delay(250)
            .queue((t) => {
                const r = i(
                    e.pass.data.type,
                    e.pass.currentLevel
                );
                e.setPassUnlockImage(r);
                a.removeClass("pass-unlock-pulse");
                o.animate(
                    {
                        opacity: 1
                    },
                    250
                );
                s.animate(
                    {
                        opacity: 1
                    },
                    250
                );
                $(t).dequeue();
            });
    }
    animateQuestComplete(e) {
        e.elems.barFill
            .queue((t) => {
                e.elems.main.addClass("pass-bg-pulse");
                e.elems.xp.addClass("pass-text-pulse");
                e.elems.refresh.css(
                    {
                        opacity: 0.25
                    },
                    250
                );
                e.elems.refresh.removeClass(
                    "pass-quest-refresh-disabled"
                );
                e.elems.refresh.animate(
                    {
                        opacity: 0
                    },
                    250
                );
                e.elems.counter.animate(
                    {
                        opacity: 0
                    },
                    250
                );
                e.elems.desc.html("QUEST COMPLETE!");
                $(t).dequeue();
            })
            .delay(1000)
            .queue((t) => {
                e.elems.main.animate(
                    {
                        opacity: 0
                    },
                    750
                );
                $(t).dequeue();
            });
    }
    update(e) {
        this.updatePassTicker -= e;
        if (this.updatePass && this.updatePassTicker < 0) {
            this.updatePass = false;
            this.account.getPass(false);
        }
        for (let t = 0; t < this.quests.length; t++) {
            const r = this.quests[t];
            this.setQuestRefreshEnabled(r);
            r.ticker += e;
            if (!r.progressAnimFinished) {
                const a = math.clamp(
                    (r.ticker - r.delay) / 1,
                    0,
                    1
                );
                r.current = math.lerp(
                    math.easeOutExpo(a),
                    r.start,
                    r.data.progress
                );
                const i = (r.current / r.data.target) * 100;
                const s = QuestDefs[r.data.type];
                let l = Math.round(r.current);
                if (s.timed) {
                    l = o(l, true);
                }
                r.elems.cur.html(l);
                r.elems.barFill.css({
                    width: `${i}%`
                });
                if (a >= 1) {
                    r.progressAnimFinished = true;
                }
            }
            if (
                r.playCompleteAnim &&
                !r.completeAnimFinished &&
                r.ticker - r.delay > 1.25
            ) {
                this.animateQuestComplete(r);
                r.completeAnimFinished = true;
            }
            const m =
                !r.playCompleteAnim ||
                (r.completeAnimFinished &&
                    r.ticker - r.delay > 4.25);
            if (
                r.data.complete &&
                m &&
                r.refreshEnabled &&
                r.shouldRequestRefresh
            ) {
                r.shouldRequestRefresh = false;
                this.account.refreshQuest(r.data.idx);
            }
            const p = r.data.complete && m;
            if (p != r.timer.displayed) {
                r.timer.displayed = p;
                r.elems.main.removeClass("pass-bg-pulse");
                r.elems.main.stop().animate(
                    {
                        opacity: 1
                    },
                    250
                );
                const h =
                    r.elems.refreshPrompt.css("display") ==
                    "block";
                r.elems.info.css(
                    "display",
                    p || h ? "none" : "block"
                );
                r.elems.timer.css(
                    "display",
                    p ? "block" : "none"
                );
            }
            if (p) {
                const u = Math.max(
                    r.refreshTime - Date.now(),
                    0
                );
                const g = o(u / 1000);
                if (g != r.timer.str) {
                    r.timer.str = g;
                    r.elems.timer.html(g);
                }
            }
        }
        this.pass.ticker += e;
        if (
            this.pass.animSteps.length > 0 &&
            this.pass.ticker >= 0
        ) {
            const y = this.pass.animSteps[0];
            const w = math.clamp(this.pass.ticker / 1.5, 0, 1);
            this.pass.currentXp = math.lerp(
                math.easeOutExpo(w),
                y.startXp,
                y.targetXp
            );
            this.pass.levelXp = y.levelXp;
            const f =
                (this.pass.currentXp / y.levelXp) * 100;
            $("#pass-progress-xp-current").html(
                Math.round(this.pass.currentXp)
            );
            $("#pass-progress-xp-target").html(
                this.pass.levelXp
            );
            $("#pass-progress-bar-fill").css({
                width: `${f}%`
            });
            if (w >= 1) {
                if (
                    y.targetLevel > this.pass.currentLevel
                ) {
                    this.pass.currentLevel = y.targetLevel;
                    this.animatePassLevelUp();
                }
                this.pass.animSteps.shift();
                this.pass.ticker -= 3;
            }
        }
        if (
            !this.account.loggingIn &&
            !this.account.loggedIn &&
            !this.lockDisplayed
        ) {
            $("#pass-block").css("z-index", "1");
            $("#pass-loading").css("display", "none");
            $("#pass-locked").css("display", "block");
            this.lockDisplayed = true;
        }
    }
    onResize() { }
    loadPlaceholders() {
        const e = PassDefs.pass_survivr1;
        const t = this.localization
            .translate("pass_survivr1")
            .toUpperCase();
        $("#pass-name-text").html(t);
        $("#pass-progress-level").html(1);
        $("#pass-progress-xp-current").html(0);
        $("#pass-progress-xp-target").html(e.xp[0]);
        this.setPassUnlockImage(e.items[0].item);
    }
}

export default Pass;

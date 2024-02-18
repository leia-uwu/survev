
/*!
 * ==========================================================
 *  COLOR PICKER PLUGIN 1.4.1
 * ==========================================================
 * Author: Taufik Nurrohman <https://github.com/tovic>
 * License: MIT
 * ----------------------------------------------------------
 */
(function(e, t, r) {
    function a(e) {
        return e !== undefined;
    }
    function i(e) {
        return typeof e === "string";
    }
    function o(e) {
        return typeof e === "object";
    }
    function s(e) {
        return Object.keys(e).length;
    }
    function n(e, t, r) {
        if (e < t) {
            return t;
        } else if (e > r) {
            return r;
        } else {
            return e;
        }
    }
    function l(e, t) {
        return parseInt(e, t || 10);
    }
    function c(e) {
        return Math.round(e);
    }
    function m(e) {
        let t;
        let r;
        let a;
        let i;
        let o;
        let s;
        let n;
        let l;
        const m = +e[0];
        const p = +e[1];
        const h = +e[2];
        i = Math.floor(m * 6);
        o = m * 6 - i;
        s = h * (1 - p);
        n = h * (1 - o * p);
        l = h * (1 - (1 - o) * p);
        i = i || 0;
        n = n || 0;
        l = l || 0;
        switch (i % 6) {
            case 0:
                t = h;
                r = l;
                a = s;
                break;
            case 1:
                t = n;
                r = h;
                a = s;
                break;
            case 2:
                t = s;
                r = h;
                a = l;
                break;
            case 3:
                t = s;
                r = n;
                a = h;
                break;
            case 4:
                t = l;
                r = s;
                a = h;
                break;
            case 5:
                t = h;
                r = s;
                a = n;
        }
        return [c(t * 255), c(r * 255), c(a * 255)];
    }
    function p(e) {
        return d(m(e));
    }
    function h(e) {
        let t;
        const r = +e[0];
        const a = +e[1];
        const i = +e[2];
        const o = Math.max(r, a, i);
        const s = Math.min(r, a, i);
        const n = o - s;
        const l = o === 0 ? 0 : n / o;
        const c = o / 255;
        switch (o) {
            case s:
                t = 0;
                break;
            case r:
                t = a - i + n * (a < i ? 6 : 0);
                t /= n * 6;
                break;
            case a:
                t = i - r + n * 2;
                t /= n * 6;
                break;
            case i:
                t = r - a + n * 4;
                t /= n * 6;
        }
        return [t, l, c];
    }
    function d(e) {
        let t = +e[2] | (+e[1] << 8) | (+e[0] << 16);
        t = `000000${t.toString(16)}`;
        return t.slice(-6);
    }
    function u(e) {
        return h(g(e));
    }
    function g(e) {
        if (e.length === 3) {
            e = e.replace(/./g, "$&$&");
        }
        return [
            l(e[0] + e[1], 16),
            l(e[2] + e[3], 16),
            l(e[4] + e[5], 16)
        ];
    }
    function y(e) {
        return [+e[0] / 360, +e[1] / 100, +e[2] / 100];
    }
    function w(e) {
        return [c(+e[0] * 360), c(+e[1] * 100), c(+e[2] * 100)];
    }
    function f(e) {
        return [+e[0] / 255, +e[1] / 255, +e[2] / 255];
    }
    function _(e) {
        if (o(e)) {
            return e;
        }
        const t =
            /\s*rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)\s*$/i.exec(
                e
            );
        const r =
            /\s*hsv\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)\s*$/i.exec(
                e
            );
        if (
            e[0] === "#" &&
            e.match(/^#([\da-f]{3}|[\da-f]{6})$/i)
        ) {
            return u(e.slice(1));
        } else if (r) {
            return y([+r[1], +r[2], +r[3]]);
        } else if (t) {
            return h([+t[1], +t[2], +t[3]]);
        } else {
            return [0, 1, 1];
        }
    }
    const b = "firstChild";
    const x = setTimeout;
    (function(e) {
        e.version = "1.4.1";
        e.__instance__ = {};
        e.each = function(t, r) {
            x(
                () => {
                    let r;
                    const a = e.__instance__;
                    for (r in a) {
                        t.call(a[r], r, a);
                    }
                },
                r === 0 ? 0 : r || 1
            );
            return e;
        };
        e.parse = _;
        e._HSV2RGB = m;
        e._HSV2HEX = p;
        e._RGB2HSV = h;
        e._HEX2HSV = u;
        e._HEX2RGB = function(e) {
            return f(g(e));
        };
        e.HSV2RGB = function(e) {
            return m(y(e));
        };
        e.HSV2HEX = function(e) {
            return p(y(e));
        };
        e.RGB2HSV = function(e) {
            return w(h(e));
        };
        e.RGB2HEX = d;
        e.HEX2HSV = function(e) {
            return w(u(e));
        };
        e.HEX2RGB = g;
    })(
        (e.CP = function(r, l, c) {
            function h(e, t, r) {
                e = e.split(/\s+/);
                for (let a = 0, i = e.length; a < i; ++a) {
                    t.addEventListener(e[a], r, false);
                }
            }
            function d(e, t, r) {
                e = e.split(/\s+/);
                for (let a = 0, i = e.length; a < i; ++a) {
                    t.removeEventListener(e[a], r);
                }
            }
            function u(e, t) {
                const r = "touches";
                const a = "clientX";
                const i = "clientY";
                const o = t[r] ? t[r][0][a] : t[a];
                const s = t[r] ? t[r][0][i] : t[i];
                const n = g(e);
                return {
                    x: o - n.l,
                    y: s - n.t
                };
            }
            function g(t) {
                let r;
                let a;
                let i;
                if (t === e) {
                    r = e.pageXOffset || A.scrollLeft;
                    a = e.pageYOffset || A.scrollTop;
                } else {
                    i = t.getBoundingClientRect();
                    r = i.left;
                    a = i.top;
                }
                return {
                    l: r,
                    t: a
                };
            }
            function y(e, t) {
                while ((e = e.parentElement) && e !== t);
                return e;
            }
            function w(e) {
                e?.preventDefault();
            }
            function f(t) {
                if (t === e) {
                    return {
                        w: e.innerWidth,
                        h: e.innerHeight
                    };
                } else {
                    return {
                        w: t.offsetWidth,
                        h: t.offsetHeight
                    };
                }
            }
            function _(e) {
                return E || (!!a(e) && e);
            }
            function S(e) {
                E = e;
            }
            function v(e, t, r) {
                if (a(e)) {
                    if (a(t)) {
                        if (!a(B[e])) {
                            B[e] = {};
                        }
                        if (!a(r)) {
                            r = s(B[e]);
                        }
                        B[e][r] = t;
                        return O;
                    } else {
                        return B[e];
                    }
                } else {
                    return B;
                }
            }
            function k(e, t) {
                if (a(e)) {
                    if (a(t)) {
                        delete B[e][t];
                        return O;
                    } else {
                        B[e] = {};
                        return O;
                    }
                } else {
                    B = {};
                    return O;
                }
            }
            function z(e, t, r) {
                if (!a(B[e])) {
                    return O;
                }
                if (a(r)) {
                    if (a(B[e][r])) {
                        B[e][r].apply(O, t);
                    }
                } else {
                    for (const i in B[e]) {
                        B[e][i].apply(O, t);
                    }
                }
                return O;
            }
            function I(e, t) {
                if (!e || e === "h") {
                    z("change:h", t);
                }
                if (!e || e === "sv") {
                    z("change:sv", t);
                }
                z("change", t);
            }
            function T() {
                return R.parentNode;
            }
            function M(a, i) {
                function o(e) {
                    const t = e.target;
                    if (t === r || y(t, r) === r) {
                        M();
                        z("enter");
                    } else {
                        O.exit();
                    }
                }
                function s(e) {
                    m(V);
                    const t = m([V[0], 1, 1]);
                    W.style.backgroundColor = `rgb(${t.join(",")})`;
                    S(V);
                    w(e);
                }
                function g(e) {
                    const t = n(u(U, e).y, 0, B);
                    V[0] = (B - t) / B;
                    G.style.top = `${t - $ / 2}px`;
                    s(e);
                }
                function b(e) {
                    const t = u(W, e);
                    const r = n(t.x, 0, H);
                    const a = n(t.y, 0, Q);
                    V[1] = 1 - (H - r) / H;
                    V[2] = (Q - a) / Q;
                    X.style.right = `${H - r - ae / 2}px`;
                    X.style.top = `${a - ie / 2}px`;
                    s(e);
                }
                function x(e) {
                    if (Y) {
                        g(e);
                        re = [p(V)];
                        if (!K) {
                            z("drag:h", re);
                            z("drag", re);
                            I("h", re);
                        }
                    }
                    if (J) {
                        b(e);
                        re = [p(V)];
                        if (!Z) {
                            z("drag:sv", re);
                            z("drag", re);
                            I("sv", re);
                        }
                    }
                    K = 0;
                    Z = 0;
                }
                function v(e) {
                    const t = e.target;
                    const a = Y ? "h" : "sv";
                    const i = [p(V), O];
                    const o = t === r || y(t, r) === r;
                    const s = t === R || y(t, R) === R;
                    if (o || s) {
                        if (s) {
                            z(`stop:${a}`, i);
                            z("stop", i);
                            I(a, i);
                        }
                    } else if (T() && l !== false) {
                        O.exit();
                        I(0, i);
                    }
                    Y = 0;
                    J = 0;
                }
                function k(e) {
                    K = 1;
                    Y = 1;
                    x(e);
                    w(e);
                    z("start:h", re);
                    z("start", re);
                    I("h", re);
                }
                function A(e) {
                    Z = 1;
                    J = 1;
                    x(e);
                    w(e);
                    z("start:sv", re);
                    z("start", re);
                    I("sv", re);
                }
                if (!a) {
                    (c || i || C).appendChild(R);
                    O.visible = true;
                }
                ee = f(R).w;
                te = f(R).h;
                const D = f(W);
                const E = f(X);
                var B = f(U).h;
                var H = D.w;
                var Q = D.h;
                var $ = f(G).h;
                var ae = E.w;
                var ie = E.h;
                if (a) {
                    R.style.left = R.style.top = "-9999px";
                    if (l !== false) {
                        h(l, r, o);
                    }
                    O.create = function() {
                        M(1);
                        z("create");
                        return O;
                    };
                    O.destroy = function() {
                        if (l !== false) {
                            d(l, r, o);
                        }
                        O.exit();
                        S(false);
                        z("destroy");
                        return O;
                    };
                } else {
                    P();
                }
                N = function() {
                    V = _(V);
                    s();
                    G.style.top = `${B - $ / 2 - B * +V[0]}px`;
                    X.style.right = `${H - ae / 2 - H * +V[1]}px`;
                    X.style.top = `${Q - ie / 2 - Q * +V[2]}px`;
                };
                O.exit = function(r) {
                    if (T()) {
                        T().removeChild(R);
                        O.visible = false;
                    }
                    d(L, U, k);
                    d(L, W, A);
                    d(q, t, x);
                    d(F, t, v);
                    d(j, e, P);
                    z("exit");
                    return O;
                };
                N();
                if (!a) {
                    h(L, U, k);
                    h(L, W, A);
                    h(q, t, x);
                    h(F, t, v);
                    h(j, e, P);
                }
            }
            function P() {
                return O.fit();
            }
            var C = t.body;
            var A = t.documentElement;
            var O = this;
            const D = e.CP;
            var E = false;
            var B = {};
            var R = t.createElement("div");
            var L = "touchstart mousedown";
            var q = "touchmove mousemove";
            var F = "touchend mouseup";
            var j = "orientationchange resize";
            if (!(O instanceof D)) {
                return new D(r, l);
            }
            D.__instance__[r.id || r.name || s(D.__instance__)] = O;
            if (!a(l) || l === true) {
                l = L;
            }
            S(
                D.parse(
                    r.getAttribute("data-color") ||
                    r.value || [0, 1, 1]
                )
            );
            R.className = "color-picker";
            R.innerHTML =
                '<div class="color-picker-container"><span class="color-picker-h"><i></i></span><span class="color-picker-sv"><i></i></span></div>';
            let N;
            const H = R[b].children;
            var V = _([0, 1, 1]);
            var U = H[0];
            var W = H[1];
            var G = U[b];
            var X = W[b];
            var K = 0;
            var Z = 0;
            var Y = 0;
            var J = 0;
            let Q = 0;
            let $ = 0;
            var ee = 0;
            var te = 0;
            var re = [p(V)];
            M(1);
            x(() => {
                const e = [p(V)];
                z("create", e);
                I(0, e);
            }, 0);
            O.fit = function(t) {
                const i = f(e);
                const s = f(A);
                const l = i.w - s.w;
                const c = i.h - A.clientHeight;
                const m = g(e);
                const p = g(r);
                Q = p.l + m.l;
                $ = p.t + m.t + f(r).h;
                if (o(t)) {
                    if (a(t[0])) {
                        Q = t[0];
                    }
                    if (a(t[1])) {
                        $ = t[1];
                    }
                } else {
                    const h = m.l;
                    const d = m.t;
                    const u = m.l + i.w - ee - l;
                    const y = m.t + i.h - te - c;
                    Q = n(Q, h, u) >> 0;
                    $ = n($, d, y) >> 0;
                }
                R.style.left = `${Q}px`;
                R.style.top = `${$}px`;
                z("fit");
                return O;
            };
            O.set = function(e) {
                if (a(e)) {
                    if (i(e)) {
                        e = D.parse(e);
                    }
                    S(e);
                    N();
                    return O;
                } else {
                    return _();
                }
            };
            O.get = function(e) {
                return _(e);
            };
            O.source = r;
            O.self = R;
            O.visible = false;
            O.on = v;
            O.off = k;
            O.fire = z;
            O.hooks = B;
            O.enter = function(e) {
                M(0, e);
                z("enter");
                return O;
            };
            return O;
        })
    );
})(window, document);

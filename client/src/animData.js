import { GameObjectDefs } from "../../shared/defs/gameObjectDefs";
import { GameConfig } from "../../shared/gameConfig";
import { math } from "../../shared/utils/math";
import { v2 } from "../../shared/utils/v2";

function a(e, t, r) {
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
function i(e, t) {
    if (!(e instanceof t)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function o(e, t) {
    return {
        time: e,
        bones: t
    };
}
function s(e, t, r) {
    return {
        time: e,
        fn: t,
        args: r
    };
}
let n;
let l;
let c;
let m;
let p;
let h;
let d;
let u;
let g;
let y;
let w;
let f;
let _;
let b;
let x;
let S;
let v;
let k;
let z;
let I;
let T;
let M;
let P;
let C;
let A;
let O;
let D;
let E;
let B;
let R;
let L;
let q;
let F;
let j;
let N;
let H;
let V;
let U;
let W;
let G;
let X;
let K;
let Z;
let Y;
let J;
let Q;
let $;
let ee;
let te;
let re;
let ae;
let ie;
const oe = (function() {
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

const Pose = (function() {
    function e(t, r, a) {
        i(this, e);
        this.pivot = v2.copy(t || v2.create(0, 0));
        this.rot = 0;
        this.pos = v2.copy(a || v2.create(0, 0));
    }
    oe(e, [
        {
            key: "copy",
            value: function(e) {
                v2.set(this.pivot, e.pivot);
                this.rot = e.rot;
                v2.set(this.pos, e.pos);
            }
        },
        {
            key: "rotate",
            value: function(e) {
                this.rot = e;
                return this;
            }
        },
        {
            key: "offset",
            value: function(e) {
                this.pos = v2.copy(e);
                return this;
            }
        }
    ]);
    return e;
})();
Pose.identity = new Pose(v2.create(0, 0));
Pose.lerp = function(e, t, r) {
    const a = new Pose();
    a.pos = v2.lerp(e, t.pos, r.pos);
    a.rot = math.lerp(e, t.rot, r.rot);
    a.pivot = v2.lerp(e, t.pivot, r.pivot);
    return a;
};
const Bones = {
    HandL: 0,
    HandR: 1,
    FootL: 2,
    FootR: 3
};
// assert(Object.keys(Bones).length % 2 == 0);
const IdlePoses = {
    fists:
        ((n = {}),
        a(n, Bones.HandL, new Pose(v2.create(14, -12.25))),
        a(n, Bones.HandR, new Pose(v2.create(14, 12.25))),
        n),
    slash:
        ((l = {}),
        a(l, Bones.HandL, new Pose(v2.create(18, -8.25))),
        a(l, Bones.HandR, new Pose(v2.create(6, 20.25))),
        l),
    meleeTwoHanded:
        ((c = {}),
        a(c, Bones.HandL, new Pose(v2.create(10.5, -14.25))),
        a(c, Bones.HandR, new Pose(v2.create(18, 6.25))),
        c),
    meleeKatana:
        ((m = {}),
        a(m, Bones.HandL, new Pose(v2.create(8.5, 13.25))),
        a(m, Bones.HandR, new Pose(v2.create(-3, 17.75))),
        m),
    meleeNaginata:
        ((p = {}),
        a(p, Bones.HandL, new Pose(v2.create(19, -7.25))),
        a(p, Bones.HandR, new Pose(v2.create(8.5, 24.25))),
        p),
    machete:
        ((h = {}),
        a(h, Bones.HandL, new Pose(v2.create(14, -12.25))),
        a(h, Bones.HandR, new Pose(v2.create(1, 17.75))),
        h),
    rifle:
        ((d = {}),
        a(d, Bones.HandL, new Pose(v2.create(28, 5.25))),
        a(d, Bones.HandR, new Pose(v2.create(14, 1.75))),
        d),
    dualRifle:
        ((u = {}),
        a(u, Bones.HandL, new Pose(v2.create(5.75, -16))),
        a(u, Bones.HandR, new Pose(v2.create(5.75, 16))),
        u),
    bullpup:
        ((g = {}),
        a(g, Bones.HandL, new Pose(v2.create(28, 5.25))),
        a(g, Bones.HandR, new Pose(v2.create(24, 1.75))),
        g),
    launcher:
        ((y = {}),
        a(y, Bones.HandL, new Pose(v2.create(20, 10))),
        a(y, Bones.HandR, new Pose(v2.create(2, 22))),
        y),
    pistol:
        ((w = {}),
        a(w, Bones.HandL, new Pose(v2.create(14, 1.75))),
        a(w, Bones.HandR, new Pose(v2.create(14, 1.75))),
        w),
    dualPistol:
        ((f = {}),
        a(f, Bones.HandL, new Pose(v2.create(15.75, -8.75))),
        a(f, Bones.HandR, new Pose(v2.create(15.75, 8.75))),
        f),
    throwable:
        ((_ = {}),
        a(_, Bones.HandL, new Pose(v2.create(15.75, -9.625))),
        a(_, Bones.HandR, new Pose(v2.create(15.75, 9.625))),
        _),
    downed:
        ((b = {}),
        a(b, Bones.HandL, new Pose(v2.create(14, -12.25))),
        a(b, Bones.HandR, new Pose(v2.create(14, 12.25))),
        a(b, Bones.FootL, new Pose(v2.create(-15.75, -9))),
        a(b, Bones.FootR, new Pose(v2.create(-15.75, 9))),
        b)
};
const ue = GameObjectDefs.fists.attack;
const ge = GameObjectDefs.hook.attack;
const ye = GameObjectDefs.woodaxe.attack;
const we = GameObjectDefs.stonehammer.attack;
const fe = GameObjectDefs.katana.attack;
const _e = GameObjectDefs.naginata.attack;
const be = GameObjectDefs.pan.attack;
const xe = GameObjectDefs.saw.attack;
const Animations = {
    none: {
        keyframes: [],
        effects: []
    },
    fists: {
        keyframes: [
            o(0, a({}, Bones.HandR, new Pose(v2.create(14, 12.25)))),
            o(
                ue.damageTimes[0],
                a({}, Bones.HandR, new Pose(v2.create(29.75, 1.75)))
            ),
            o(
                ue.cooldownTime,
                a({}, Bones.HandR, new Pose(v2.create(14, 12.25)))
            )
        ],
        effects: [
            s(0, "animPlaySound", {
                sound: "swing"
            }),
            s(ue.damageTimes[0], "animMeleeCollision", {})
        ]
    },
    cut: {
        keyframes: [
            o(0, a({}, Bones.HandR, new Pose(v2.create(14, 12.25)))),
            o(
                ue.damageTimes[0] * 0.25,
                a(
                    {},
                    Bones.HandR,
                    new Pose(v2.create(14, 12.25)).rotate(
                        -Math.PI * 0.35
                    )
                )
            ),
            o(
                ue.damageTimes[0] * 1.25,
                a(
                    {},
                    Bones.HandR,
                    new Pose(v2.create(14, 12.25)).rotate(
                        Math.PI * 0.35
                    )
                )
            ),
            o(
                ue.cooldownTime,
                a({}, Bones.HandR, new Pose(v2.create(14, 12.25)))
            )
        ],
        effects: [
            s(0, "animPlaySound", {
                sound: "swing"
            }),
            s(ue.damageTimes[0], "animMeleeCollision", {})
        ]
    },
    cutReverse: {
        keyframes: [
            o(0, a({}, Bones.HandR, new Pose(v2.create(1, 17.75)))),
            o(
                ue.damageTimes[0] * 0.4,
                a(
                    {},
                    Bones.HandR,
                    new Pose(v2.create(25, 6.25)).rotate(
                        Math.PI * 0.3
                    )
                )
            ),
            o(
                ue.damageTimes[0] * 1.4,
                a(
                    {},
                    Bones.HandR,
                    new Pose(v2.create(25, 6.25)).rotate(
                        -Math.PI * 0.5
                    )
                )
            ),
            o(
                ue.cooldownTime,
                a({}, Bones.HandR, new Pose(v2.create(1, 17.75)))
            )
        ],
        effects: [
            s(0, "animPlaySound", {
                sound: "swing"
            }),
            s(ue.damageTimes[0], "animMeleeCollision", {})
        ]
    },
    thrust: {
        keyframes: [
            o(0, a({}, Bones.HandR, new Pose(v2.create(14, 12.25)))),
            o(
                ue.damageTimes[0] * 0.4,
                a(
                    {},
                    Bones.HandR,
                    new Pose(v2.create(5, 12.25)).rotate(
                        Math.PI * 0.1
                    )
                )
            ),
            o(
                ue.damageTimes[0] * 1.4,
                a(
                    {},
                    Bones.HandR,
                    new Pose(v2.create(25, 6.25)).rotate(-Math.PI * 0)
                )
            ),
            o(
                ue.cooldownTime,
                a({}, Bones.HandR, new Pose(v2.create(14, 12.25)))
            )
        ],
        effects: [
            s(0, "animPlaySound", {
                sound: "swing"
            }),
            s(ue.damageTimes[0], "animMeleeCollision", {})
        ]
    },
    slash: {
        keyframes: [
            o(
                0,
                ((x = {}),
                a(x, Bones.HandL, new Pose(v2.create(18, -8.25))),
                a(x, Bones.HandR, new Pose(v2.create(6, 20.25))),
                x)
            ),
            o(
                ue.damageTimes[0],
                ((S = {}),
                a(S, Bones.HandL, new Pose(v2.create(6, -22.25))),
                a(
                    S,
                    Bones.HandR,
                    new Pose(v2.create(6, 20.25)).rotate(
                        -Math.PI * 0.6
                    )
                ),
                S)
            ),
            o(
                ue.cooldownTime,
                ((v = {}),
                a(v, Bones.HandL, new Pose(v2.create(18, -8.25))),
                a(
                    v,
                    Bones.HandR,
                    new Pose(v2.create(6, 20.25)).rotate(0)
                ),
                v)
            )
        ],
        effects: [
            s(0, "animPlaySound", {
                sound: "swing"
            }),
            s(ue.damageTimes[0], "animMeleeCollision", {})
        ]
    },
    hook: {
        keyframes: [
            o(0, a({}, Bones.HandR, new Pose(v2.create(14, 12.25)))),
            o(
                ge.damageTimes[0] * 0.25,
                a(
                    {},
                    Bones.HandR,
                    new Pose(v2.create(14, 12.25)).rotate(
                        Math.PI * 0.1
                    )
                )
            ),
            o(
                ge.damageTimes[0],
                a({}, Bones.HandR, new Pose(v2.create(24, 1.75)))
            ),
            o(
                ge.damageTimes[0] + 0.05,
                a(
                    {},
                    Bones.HandR,
                    new Pose(v2.create(14, 12.25)).rotate(
                        Math.PI * -0.3
                    )
                )
            ),
            o(
                ge.damageTimes[0] + 0.1,
                a({}, Bones.HandR, new Pose(v2.create(14, 12.25)))
            )
        ],
        effects: [
            s(0, "animPlaySound", {
                sound: "swing"
            }),
            s(ge.damageTimes[0], "animMeleeCollision", {})
        ]
    },
    pan: {
        keyframes: [
            o(0, a({}, Bones.HandR, new Pose(v2.create(14, 12.25)))),
            o(
                0.15,
                a(
                    {},
                    Bones.HandR,
                    new Pose(v2.create(22, -8.25)).rotate(
                        -Math.PI * 0.2
                    )
                )
            ),
            o(
                0.25,
                a(
                    {},
                    Bones.HandR,
                    new Pose(v2.create(28, -8.25)).rotate(
                        Math.PI * 0.5
                    )
                )
            ),
            o(0.55, a({}, Bones.HandR, new Pose(v2.create(14, 12.25))))
        ],
        effects: [
            s(0, "animPlaySound", {
                sound: "swing"
            }),
            s(be.damageTimes[0], "animMeleeCollision", {})
        ]
    },
    axeSwing: {
        keyframes: [
            o(
                0,
                ((k = {}),
                a(k, Bones.HandL, new Pose(v2.create(10.5, -14.25))),
                a(k, Bones.HandR, new Pose(v2.create(18, 6.25))),
                k)
            ),
            o(
                ye.damageTimes[0] * 0.4,
                ((z = {}),
                a(
                    z,
                    Bones.HandL,
                    new Pose(v2.create(9, -14.25)).rotate(
                        Math.PI * 0.4
                    )
                ),
                a(
                    z,
                    Bones.HandR,
                    new Pose(v2.create(18, 6.25)).rotate(
                        Math.PI * 0.4
                    )
                ),
                z)
            ),
            o(
                ye.damageTimes[0],
                ((I = {}),
                a(
                    I,
                    Bones.HandL,
                    new Pose(v2.create(9, -14.25)).rotate(
                        -Math.PI * 0.4
                    )
                ),
                a(
                    I,
                    Bones.HandR,
                    new Pose(v2.create(18, 6.25)).rotate(
                        -Math.PI * 0.4
                    )
                ),
                I)
            ),
            o(
                ye.cooldownTime,
                ((T = {}),
                a(T, Bones.HandL, new Pose(v2.create(10.5, -14.25))),
                a(T, Bones.HandR, new Pose(v2.create(18, 6.25))),
                T)
            )
        ],
        effects: [
            s(ye.damageTimes[0], "animPlaySound", {
                sound: "swing"
            }),
            s(ye.damageTimes[0], "animMeleeCollision", {})
        ]
    },
    hammerSwing: {
        keyframes: [
            o(
                0,
                ((M = {}),
                a(M, Bones.HandL, new Pose(v2.create(10.5, -14.25))),
                a(M, Bones.HandR, new Pose(v2.create(18, 6.25))),
                M)
            ),
            o(
                we.damageTimes[0] * 0.4,
                ((P = {}),
                a(
                    P,
                    Bones.HandL,
                    new Pose(v2.create(9, -14.25)).rotate(
                        Math.PI * 0.4
                    )
                ),
                a(
                    P,
                    Bones.HandR,
                    new Pose(v2.create(18, 6.25)).rotate(
                        Math.PI * 0.4
                    )
                ),
                P)
            ),
            o(
                we.damageTimes[0],
                ((C = {}),
                a(
                    C,
                    Bones.HandL,
                    new Pose(v2.create(9, -14.25)).rotate(
                        -Math.PI * 0.4
                    )
                ),
                a(
                    C,
                    Bones.HandR,
                    new Pose(v2.create(18, 6.25)).rotate(
                        -Math.PI * 0.4
                    )
                ),
                C)
            ),
            o(
                we.cooldownTime,
                ((A = {}),
                a(A, Bones.HandL, new Pose(v2.create(10.5, -14.25))),
                a(A, Bones.HandR, new Pose(v2.create(18, 6.25))),
                A)
            )
        ],
        effects: [
            s(we.damageTimes[0], "animPlaySound", {
                sound: "swing"
            }),
            s(we.damageTimes[0], "animMeleeCollision", {})
        ]
    },
    katanaSwing: {
        keyframes: [
            o(
                0,
                ((O = {}),
                a(O, Bones.HandL, new Pose(v2.create(8.5, 13.25))),
                a(O, Bones.HandR, new Pose(v2.create(-3, 17.75))),
                O)
            ),
            o(
                fe.damageTimes[0] * 0.3,
                ((D = {}),
                a(
                    D,
                    Bones.HandL,
                    new Pose(v2.create(8.5, 13.25)).rotate(
                        Math.PI * 0.2
                    )
                ),
                a(
                    D,
                    Bones.HandR,
                    new Pose(v2.create(-3, 17.75)).rotate(
                        Math.PI * 0.2
                    )
                ),
                D)
            ),
            o(
                fe.damageTimes[0] * 0.9,
                ((E = {}),
                a(
                    E,
                    Bones.HandL,
                    new Pose(v2.create(8.5, 13.25)).rotate(
                        -Math.PI * 1.2
                    )
                ),
                a(
                    E,
                    Bones.HandR,
                    new Pose(v2.create(-3, 17.75)).rotate(
                        -Math.PI * 1.2
                    )
                ),
                E)
            ),
            o(
                fe.cooldownTime,
                ((B = {}),
                a(B, Bones.HandL, new Pose(v2.create(8.5, 13.25))),
                a(B, Bones.HandR, new Pose(v2.create(-3, 17.75))),
                B)
            )
        ],
        effects: [
            s(fe.damageTimes[0], "animPlaySound", {
                sound: "swing"
            }),
            s(fe.damageTimes[0], "animMeleeCollision", {})
        ]
    },
    naginataSwing: {
        keyframes: [
            o(
                0,
                ((R = {}),
                a(R, Bones.HandL, new Pose(v2.create(19, -7.25))),
                a(R, Bones.HandR, new Pose(v2.create(8.5, 24.25))),
                R)
            ),
            o(
                _e.damageTimes[0] * 0.3,
                ((L = {}),
                a(
                    L,
                    Bones.HandL,
                    new Pose(v2.create(19, -7.25)).rotate(
                        Math.PI * 0.3
                    )
                ),
                a(
                    L,
                    Bones.HandR,
                    new Pose(v2.create(8.5, 24.25)).rotate(
                        Math.PI * 0.3
                    )
                ),
                L)
            ),
            o(
                _e.damageTimes[0] * 0.9,
                ((q = {}),
                a(
                    q,
                    Bones.HandL,
                    new Pose(v2.create(19, -7.25)).rotate(
                        -Math.PI * 0.85
                    )
                ),
                a(
                    q,
                    Bones.HandR,
                    new Pose(v2.create(8.5, 24.25)).rotate(
                        -Math.PI * 0.85
                    )
                ),
                q)
            ),
            o(
                _e.cooldownTime,
                ((F = {}),
                a(F, Bones.HandL, new Pose(v2.create(19, -7.25))),
                a(F, Bones.HandR, new Pose(v2.create(8.5, 24.25))),
                F)
            )
        ],
        effects: [
            s(ye.damageTimes[0], "animPlaySound", {
                sound: "swing"
            }),
            s(ye.damageTimes[0], "animMeleeCollision", {})
        ]
    },
    sawSwing: {
        keyframes: [
            o(0, a({}, Bones.HandR, new Pose(v2.create(1, 17.75)))),
            o(
                xe.damageTimes[0] * 0.4,
                a(
                    {},
                    Bones.HandR,
                    new Pose(v2.create(25, 6.25)).rotate(
                        Math.PI * 0.3
                    )
                )
            ),
            o(
                xe.damageTimes[0],
                a(
                    {},
                    Bones.HandR,
                    new Pose(v2.create(25, 6.25)).rotate(
                        -Math.PI * 0.3
                    )
                )
            ),
            o(
                xe.damageTimes[1] - 0.1,
                a(
                    {},
                    Bones.HandR,
                    new Pose(v2.create(25, 17.75)).rotate(
                        -Math.PI * 0.25
                    )
                )
            ),
            o(
                xe.damageTimes[1] * 0.6,
                a(
                    {},
                    Bones.HandR,
                    new Pose(v2.create(-36, 7.75)).rotate(
                        -Math.PI * 0.25
                    )
                )
            ),
            o(
                xe.damageTimes[1] + 0.2,
                a({}, Bones.HandR, new Pose(v2.create(1, 17.75)))
            )
        ],
        effects: [
            s(0, "animPlaySound", {
                sound: "swing"
            }),
            s(0.4, "animPlaySound", {
                sound: "swing"
            }),
            s(xe.damageTimes[0], "animMeleeCollision", {}),
            s(xe.damageTimes[1], "animMeleeCollision", {
                playerHit: "playerHit2"
            })
        ]
    },
    cutReverseShort: {
        keyframes: [
            o(0, a({}, Bones.HandR, new Pose(v2.create(1, 17.75)))),
            o(
                xe.damageTimes[0] * 0.4,
                a(
                    {},
                    Bones.HandR,
                    new Pose(v2.create(25, 6.25)).rotate(
                        Math.PI * 0.3
                    )
                )
            ),
            o(
                xe.damageTimes[0],
                a(
                    {},
                    Bones.HandR,
                    new Pose(v2.create(25, 6.25)).rotate(
                        -Math.PI * 0.3
                    )
                )
            ),
            o(
                ue.cooldownTime,
                a({}, Bones.HandR, new Pose(v2.create(14, 17.75)))
            )
        ],
        effects: [
            s(0, "animPlaySound", {
                sound: "swing"
            }),
            s(ue.damageTimes[0], "animMeleeCollision", {})
        ]
    },
    cook: {
        keyframes: [
            o(
                0,
                ((j = {}),
                a(j, Bones.HandL, new Pose(v2.create(15.75, -9.625))),
                a(j, Bones.HandR, new Pose(v2.create(15.75, 9.625))),
                j)
            ),
            o(
                0.1,
                ((N = {}),
                a(N, Bones.HandL, new Pose(v2.create(14, -1.75))),
                a(N, Bones.HandR, new Pose(v2.create(14, 1.75))),
                N)
            ),
            o(
                0.3,
                ((H = {}),
                a(H, Bones.HandL, new Pose(v2.create(14, -1.75))),
                a(H, Bones.HandR, new Pose(v2.create(14, 1.75))),
                H)
            ),
            o(
                0.4,
                ((V = {}),
                a(V, Bones.HandL, new Pose(v2.create(22.75, -1.75))),
                a(V, Bones.HandR, new Pose(v2.create(1.75, 14))),
                V)
            ),
            o(
                99999,
                ((U = {}),
                a(U, Bones.HandL, new Pose(v2.create(22.75, -1.75))),
                a(U, Bones.HandR, new Pose(v2.create(1.75, 14))),
                U)
            )
        ],
        effects: [
            s(0, "animPlaySound", {
                sound: "pullPin"
            }),
            s(0.1, "animSetThrowableState", {
                state: "cook"
            })
        ]
    },
    throw: {
        keyframes: [
            o(
                0,
                ((W = {}),
                a(W, Bones.HandL, new Pose(v2.create(22.75, -1.75))),
                a(W, Bones.HandR, new Pose(v2.create(1.75, 14.175))),
                W)
            ),
            o(
                0.15,
                ((G = {}),
                a(G, Bones.HandL, new Pose(v2.create(5.25, -15.75))),
                a(G, Bones.HandR, new Pose(v2.create(29.75, 1.75))),
                G)
            ),
            o(
                0.15 + GameConfig.player.throwTime,
                ((X = {}),
                a(X, Bones.HandL, new Pose(v2.create(15.75, -9.625))),
                a(X, Bones.HandR, new Pose(v2.create(15.75, 9.625))),
                X)
            )
        ],
        effects: [
            s(0, "animPlaySound", {
                sound: "throwing"
            }),
            s(0, "animSetThrowableState", {
                state: "throwing"
            }),
            s(0, "animThrowableParticles", {})
        ]
    },
    crawl_forward: {
        keyframes: [
            o(
                0,
                ((K = {}),
                a(K, Bones.HandL, new Pose(v2.create(14, -12.25))),
                a(K, Bones.FootL, new Pose(v2.create(-15.75, -9))),
                K)
            ),
            o(
                GameConfig.player.crawlTime * 0.33,
                ((Z = {}),
                a(Z, Bones.HandL, new Pose(v2.create(19.25, -10.5))),
                a(Z, Bones.FootL, new Pose(v2.create(-20.25, -9))),
                Z)
            ),
            o(
                GameConfig.player.crawlTime * 0.66,
                ((Y = {}),
                a(Y, Bones.HandL, new Pose(v2.create(5.25, -15.75))),
                a(Y, Bones.FootL, new Pose(v2.create(-11.25, -9))),
                Y)
            ),
            o(
                GameConfig.player.crawlTime * 1,
                ((J = {}),
                a(J, Bones.HandL, new Pose(v2.create(14, -12.25))),
                a(J, Bones.FootL, new Pose(v2.create(-15.75, -9))),
                J)
            )
        ],
        effects: []
    },
    crawl_backward: {
        keyframes: [
            o(
                0,
                ((Q = {}),
                a(Q, Bones.HandL, new Pose(v2.create(14, -12.25))),
                a(Q, Bones.FootL, new Pose(v2.create(-15.75, -9))),
                Q)
            ),
            o(
                GameConfig.player.crawlTime * 0.33,
                (($ = {}),
                a($, Bones.HandL, new Pose(v2.create(5.25, -15.75))),
                a($, Bones.FootL, new Pose(v2.create(-11.25, -9))),
                $)
            ),
            o(
                GameConfig.player.crawlTime * 0.66,
                ((ee = {}),
                a(ee, Bones.HandL, new Pose(v2.create(19.25, -10.5))),
                a(ee, Bones.FootL, new Pose(v2.create(-20.25, -9))),
                ee)
            ),
            o(
                GameConfig.player.crawlTime * 1,
                ((te = {}),
                a(te, Bones.HandL, new Pose(v2.create(14, -12.25))),
                a(te, Bones.FootL, new Pose(v2.create(-15.75, -9))),
                te)
            )
        ],
        effects: []
    },
    revive: {
        keyframes: [
            o(
                0,
                ((re = {}),
                a(re, Bones.HandL, new Pose(v2.create(14, -12.25))),
                a(re, Bones.HandR, new Pose(v2.create(14, 12.25))),
                re)
            ),
            o(
                0.2,
                ((ae = {}),
                a(ae, Bones.HandL, new Pose(v2.create(24.5, -8.75))),
                a(ae, Bones.HandR, new Pose(v2.create(5.25, 21))),
                ae)
            ),
            o(
                0.2 + GameConfig.player.reviveDuration,
                ((ie = {}),
                a(ie, Bones.HandL, new Pose(v2.create(24.5, -8.75))),
                a(ie, Bones.HandR, new Pose(v2.create(5.25, 21))),
                ie)
            )
        ],
        effects: []
    }
};
export default {
    Pose,
    Bones,
    IdlePoses,
    Animations
};

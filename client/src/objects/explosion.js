import { ExplosionDefs } from "../../../shared/defs/gameObjects/explosionsDefs";
import { collider } from "../../../shared/utils/collider";
import { math } from "../../../shared/utils/math";
import { util } from "../../../shared/utils/util";
import { v2 } from "../../../shared/utils/v2";

"use strict";

function a() {
    this.active = false;
}
function i(e) {
    this.active = false;
}
function o() {
    this.explosions = [];
    this.physicsParticles = [];
}

const p = {
    frag: {
        burst: {
            particle: "explosionBurst",
            scale: 1,
            sound: {
                grass: "explosion_01",
                water: "explosion_02"
            }
        },
        rippleCount: 10,
        shakeStr: 0.2,
        shakeDur: 0.35,
        lifetime: 2
    },
    smoke: {
        burst: {
            particle: "explosionBurst",
            scale: 0,
            sound: {
                grass: "explosion_smoke_01",
                water: "explosion_smoke_01"
            }
        },
        rippleCount: 10,
        shakeStr: 0,
        shakeDur: 0,
        lifetime: 6
    },
    strobe: {
        burst: {
            particle: "explosionBurst",
            scale: 0.25,
            sound: {
                grass: "explosion_04",
                water: "explosion_02"
            }
        },
        rippleCount: 3,
        shakeStr: 0,
        shakeDur: 0,
        lifetime: 2
    },
    barrel: {
        burst: {
            particle: "explosionBurst",
            scale: 1,
            sound: {
                grass: "explosion_01",
                water: "explosion_02"
            }
        },
        rippleCount: 10,
        shakeStr: 0.2,
        shakeDur: 0.35,
        lifetime: 2
    },
    usas: {
        burst: {
            particle: "explosionUSAS",
            scale: 0.75,
            sound: {
                grass: "explosion_03",
                water: "explosion_02"
            }
        },
        rippleCount: 10,
        shakeStr: 0.12,
        shakeDur: 0.25,
        lifetime: 1.25
    },
    rounds: {
        burst: {
            particle: "explosionRounds",
            scale: 0.32,
            sound: {
                grass: "explosion_04",
                water: "explosion_04",
                detune: 500,
                volume: 0.5
            }
        },
        rippleCount: 1,
        shakeStr: 0,
        shakeDur: 0,
        lifetime: 1
    },
    rounds_sg: {
        burst: {
            particle: "explosionRounds",
            scale: 0.32,
            sound: {
                grass: "explosion_04",
                water: "explosion_04",
                detune: 500,
                volume: 0.2
            }
        },
        rippleCount: 1,
        shakeStr: 0,
        shakeDur: 0,
        lifetime: 1
    },
    mirv: {
        burst: {
            particle: "explosionMIRV",
            scale: 1,
            sound: {
                grass: "explosion_01",
                water: "explosion_02"
            }
        },
        rippleCount: 10,
        shakeStr: 0.2,
        shakeDur: 0.35,
        lifetime: 2
    },
    mirv_mini: {
        burst: {
            particle: "explosionMIRV",
            scale: 0.75,
            sound: {
                grass: "explosion_03",
                water: "explosion_02"
            }
        },
        rippleCount: 3,
        shakeStr: 0.1,
        shakeDur: 0.2,
        lifetime: 1.25
    },
    martyr_nade: {
        burst: {
            particle: "explosionBurst",
            scale: 0.75,
            sound: {
                grass: "explosion_03",
                water: "explosion_02"
            }
        },
        rippleCount: 3,
        shakeStr: 0.1,
        shakeDur: 0.2,
        lifetime: 1.25
    },
    snowball: {
        burst: {
            particle: "",
            scale: 0.75,
            sound: {
                grass: "snowball_01",
                water: "frag_water_01"
            }
        },
        scatter: {
            particle: "snowball_impact",
            count: 5,
            speed: {
                min: 5,
                max: 25
            }
        },
        rippleCount: 1,
        shakeStr: 0,
        shakeDur: 0,
        lifetime: 1
    },
    snowball_heavy: {
        burst: {
            particle: "",
            scale: 0.75,
            sound: {
                grass: "snowball_02",
                water: "frag_water_01"
            }
        },
        scatter: {
            particle: "snowball_impact",
            count: 8,
            speed: {
                min: 5,
                max: 25
            }
        },
        rippleCount: 1,
        shakeStr: 0,
        shakeDur: 0,
        lifetime: 1
    },
    potato: {
        burst: {
            particle: "",
            scale: 0.75,
            sound: {
                grass: "potato_01",
                water: "frag_water_01"
            }
        },
        scatter: {
            particle: "potato_impact",
            count: 5,
            speed: {
                min: 5,
                max: 25
            }
        },
        rippleCount: 1,
        shakeStr: 0,
        shakeDur: 0,
        lifetime: 1
    },
    potato_heavy: {
        burst: {
            particle: "",
            scale: 0.75,
            sound: {
                grass: "potato_02",
                water: "frag_water_01"
            }
        },
        scatter: {
            particle: "potato_impact",
            count: 8,
            speed: {
                min: 5,
                max: 25
            }
        },
        rippleCount: 1,
        shakeStr: 0,
        shakeDur: 0,
        lifetime: 1
    },
    potato_cannonball: {
        burst: {
            particle: "explosionPotato",
            scale: 0.75,
            sound: {
                grass: "explosion_05",
                water: "explosion_02"
            }
        },
        scatter: {
            particle: "potato_impact",
            count: 8,
            speed: {
                min: 5,
                max: 25
            }
        },
        rippleCount: 10,
        shakeStr: 0.12,
        shakeDur: 0.25,
        lifetime: 1.25
    },
    potato_smgshot: {
        burst: {
            particle: "",
            scale: 0.2,
            sound: {
                grass: "potato_01",
                water: "potato_02",
                detune: 250,
                volume: 0.5
            }
        },
        scatter: {
            particle: "potato_smg_impact",
            count: 2,
            speed: {
                min: 5,
                max: 25
            }
        },
        rippleCount: 1,
        shakeStr: 0,
        shakeDur: 0,
        lifetime: 0.5
    },
    bomb_iron: {
        burst: {
            particle: "explosionBomb",
            scale: 2,
            sound: {
                grass: "explosion_01",
                water: "explosion_02"
            }
        },
        rippleCount: 12,
        shakeStr: 0.25,
        shakeDur: 0.4,
        lifetime: 2
    }
};
a.prototype = {
    init: function(e, t, r, a) {
        this.pos = v2.copy(e);
        this.vel = v2.copy(t);
        this.layer = r;
        this.particle = a;
        this.ticker = 0;
        this.colCount = 0;
        this.active = true;
    },
    update: function(e, t, r) {
        const a = v2.copy(this.pos);
        this.pos = v2.add(this.pos, v2.mul(this.vel, e));
        this.vel = v2.mul(this.vel, 1 / (1 + e * 5));
        var i = [];
        for (var o = t.Ve.p(), n = 0; n < o.length; n++) {
            const m = o[n];
            if (
                m.active &&
                !m.dead &&
                util.sameLayer(this.layer, m.layer)
            ) {
                i.push(m.collider);
            }
        }
        for (let p = r.$e.p(), h = 0; h < p.length; h++) {
            const d = p[h];
            if (
                d.active &&
                !d.dead &&
                util.sameLayer(this.layer, d.layer)
            ) {
                i.push(collider.createCircle(d.pos, d.rad, 0));
            }
        }
        var u = [];
        for (var g = 0; g < i.length; g++) {
            const y = collider.intersectSegment(i[g], a, this.pos);
            if (y) {
                const w = v2.length(v2.sub(y.point, a));
                u.push({
                    point: y.point,
                    normal: y.normal,
                    dist: w
                });
            }
        }
        u.sort((e, t) => {
            return e.dist - t.dist;
        });
        if (u.length > 0) {
            const f = u[0];
            const _ = v2.normalizeSafe(this.vel, v2.create(1, 0));
            const b = v2.length(this.vel);
            const x = v2.sub(
                _,
                v2.mul(f.normal, v2.dot(f.normal, _) * 2)
            );
            const S = this.colCount++ > 0 ? 0.35 : 1;
            this.pos = v2.add(f.point, v2.mul(f.normal, 0.01));
            this.vel = v2.mul(x, b * S);
        }
        this.particle.pos = v2.copy(this.pos);
        this.ticker += e;
        if (this.ticker >= this.particle.life) {
            this.particle.n();
            this.active = false;
        }
    }
};
i.prototype = {
    o: function(e, t, r) {
        const a = ExplosionDefs[e].explosionEffectType;
        const i = p[a];
        this.active = true;
        this.done = false;
        this.type = e;
        this.pos = v2.copy(t);
        this.layer = r;
        this.ticker = 0;
        this.lifetime = i.lifetime;
        this.soundInstance = null;
        this.soundUpdateThrottle = 0;
    },
    n: function() {
        this.active = false;
    },
    m: function(e, t, r, a, i, o) {
        const h = ExplosionDefs[this.type].explosionEffectType;
        const d = p[h];
        if (this.ticker == 0) {
            let u = true;
            if (this.type == "explosion_bomb_iron") {
                const g = collider.createCircle(this.pos, 0.5);
                if (i.insideBuildingCeiling(g, true)) {
                    u = false;
                }
            }
            if (
                u &&
                (d.burst.particle &&
                    r.addParticle(
                        d.burst.particle,
                        this.layer,
                        this.pos,
                        v2.create(0, 0),
                        d.burst.scale,
                        0,
                        null
                    ),
                    d.scatter)
            ) {
                for (let y = 0; y < d.scatter.count; y++) {
                    const w = r.addParticle(
                        d.scatter.particle,
                        this.layer,
                        this.pos,
                        v2.create(0, 0),
                        1,
                        0,
                        null
                    );
                    const f = t.addPhysicsParticle();
                    const _ = v2.mul(
                        v2.randomUnit(),
                        util.random(
                            d.scatter.speed.min,
                            d.scatter.speed.max
                        )
                    );
                    f.init(this.pos, _, this.layer, w);
                }
            }
            const b = i.getGroundSurface(this.pos, this.layer);
            const x =
                b.type == "water"
                    ? d.burst.sound.water
                    : d.burst.sound.grass;
            let S = 0;
            if (d.burst.sound.detune != undefined) {
                S = d.burst.sound.detune;
            }
            let v = 1;
            if (d.burst.sound.volume != undefined) {
                v = d.burst.sound.volume;
            }
            this.soundInstance = a.playSound(x, {
                channel: "sfx",
                soundPos: this.pos,
                layer: this.layer,
                filter: "muffled",
                rangeMult: 2,
                ignoreMinAllowable: true,
                detune: S,
                volumeScale: v
            });
            if (b.type == "water") {
                for (let k = 0; k < d.rippleCount; k++) {
                    const z = d.rippleCount * 0.5;
                    const I = v2.add(
                        this.pos,
                        v2.mul(v2.randomUnit(), util.random(0, z))
                    );
                    const T = r.addRippleParticle(
                        I,
                        this.layer,
                        b.data.rippleColor
                    );
                    T.setDelay(k * 0.06);
                }
            }
        }
        if (this.soundInstance && this.soundUpdateThrottle < 0) {
            this.soundUpdateThrottle = 0.1;
            let M = 1;
            if (d.burst.sound.volume != undefined) {
                M = d.burst.sound.volume;
            }
            a.updateSound(this.soundInstance, "sfx", this.pos, {
                layer: this.layer,
                filter: "muffled",
                volumeScale: M
            });
        } else {
            this.soundUpdateThrottle -= e;
        }
        this.ticker += e;
        const P = math.min(this.ticker / d.shakeDur, 1);
        const C = math.lerp(P, d.shakeStr, 0);
        o.addShake(this.pos, C);
        if (this.ticker >= this.lifetime) {
            this.active = false;
        }
    }
};
o.prototype = {
    addExplosion: function(e, t, r) {
        var a = null;
        for (var o = 0; o < this.explosions.length; o++) {
            if (!this.explosions[o].active) {
                a = this.explosions[o];
                break;
            }
        }
        if (!a) {
            a = new i(this);
            this.explosions.push(a);
        }
        a.o(e, t, r);
    },
    addPhysicsParticle: function() {
        var e = null;
        for (var t = 0; t < this.physicsParticles.length; t++) {
            const r = this.physicsParticles[t];
            if (!r.active) {
                e = r;
                break;
            }
        }
        if (!e) {
            e = new a();
            this.physicsParticles.push(e);
        }
        return e;
    },
    m: function(e, t, r, a, i, o, s) {
        for (let n = 0; n < this.explosions.length; n++) {
            const l = this.explosions[n];
            if (l.active) {
                l.m(e, this, i, o, t, a);
                if (!l.active) {
                    l.n();
                }
            }
        }
        for (let c = 0; c < this.physicsParticles.length; c++) {
            const m = this.physicsParticles[c];
            if (m.active) {
                m.update(e, t, r);
            }
        }
    }
};
export default {
    et: o
};

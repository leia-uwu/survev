import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";
import { GameConfig } from "../../../shared/gameConfig";
import { v2 } from "../../../shared/utils/v2";

export function createCasingParticle(e, t, r, a, i, l, c, m) {
    const p = GameObjectDefs[e];
    if (p) {
        let h = v2.rotate(i, t);
        if (p.particle.shellForward) {
            h = v2.mul(i, p.particle.shellForward);
        }
        let d = v2.mul(h, r * 9.5);
        d = v2.rotate(d, ((Math.random() - 0.5) * Math.PI) / 3);
        let u = v2.add(
            a,
            v2.mul(i, GameConfig.player.radius + p.particle.shellOffset)
        );
        if (p.particle.shellOffsetY) {
            u = v2.add(u, v2.mul(h, p.particle.shellOffsetY));
        }
        if (p.particle.shellReverse) {
            d = v2.mul(d, -1);
        }
        m.addParticle(
            p.ammo,
            l,
            u,
            d,
            p.particle.shellScale,
            -Math.atan2(h.y, h.x),
            null,
            c
        );
    }
}
export class ShotBarn {
    constructor() {
        this.shots = [];
    }

    addShot(e) {
        let t = null;
        for (let r = 0; r < this.shots.length; r++) {
            if (!this.shots[r].active) {
                t = this.shots[r];
                break;
            }
        }
        if (!t) {
            t = {};
            this.shots.push(t);
        }
        const a = e.shotSourceType;
        const i = GameObjectDefs[a];
        t.active = true;
        t.pos = v2.copy(e.pos);
        t.layer = e.layer;
        t.playerId = e.playerId;
        t.weaponType = a;
        t.offhand = e.shotOffhand;
        t.lastShot = e.lastShot;
        t.shotAlt = e.shotAlt;
        t.ticker = 0;
        t.pullDelay =
            i.pullDelay !== undefined ? i.pullDelay * 0.45 : 0;
        t.splinter = e.splinter;
        t.trailSaturated = e.trailSaturated;
    }

    m(e, t, r, i, o) {
        for (let s = 0; s < this.shots.length; s++) {
            const l = this.shots[s];
            if (l.active) {
                const c = GameObjectDefs[l.weaponType];
                if (l.ticker == 0) {
                    const m = r.u(l.playerId);
                    let p = c.sound.shoot;
                    if (c.sound.shootTeam) {
                        const h = r.qe(l.playerId).teamId;
                        if (c.sound.shootTeam[h]) {
                            p = c.sound.shootTeam[h];
                        }
                    }
                    if (l.lastShot && c.sound.shootLast) {
                        p = c.sound.shootLast;
                    }
                    if (l.shotAlt && c.sound.shootAlt) {
                        p = c.sound.shootAlt;
                    }
                    let d = 0;
                    if (l.trailSaturated && !c.ignoreDetune) {
                        d = 300;
                    } else if (l.splinter) {
                        d = -300;
                    }
                    o.playSound(p, {
                        channel:
                            l.playerId == t
                                ? "activePlayer"
                                : "otherPlayers",
                        soundPos: l.pos,
                        layer: m ? m.layer : l.layer,
                        filter: "muffled",
                        fallOff: c.sound.fallOff
                            ? c.sound.fallOff
                            : 0,
                        detune: d,
                        volumeScale: l.splinter ? 0.75 : 1
                    });
                    if (l.splinter) {
                        o.playSound(p, {
                            channel:
                                l.playerId == t
                                    ? "activePlayer"
                                    : "otherPlayers",
                            soundPos: l.pos,
                            layer: m ? m.layer : l.layer,
                            filter: "muffled",
                            fallOff: c.sound.fallOff
                                ? c.sound.fallOff
                                : 0,
                            detune: 1200,
                            delay: 30,
                            volumeScale: 0.75
                        });
                    }
                    if (m) {
                        if (
                            m.__id == t &&
                            c.fireMode == "single" &&
                            c.pullDelay
                        ) {
                            const u = m.Re.tt[m.Re.rt].ammo;
                            const g =
                                u > 0
                                    ? c.sound.cycle
                                    : c.sound.pull;
                            o.stopSound(m.cycleSoundInstance);
                            m.cycleSoundInstance = o.playSound(g);
                        }
                        const y = l.offhand || !c.isDual;
                        const w = !l.offhand || !c.isDual;
                        m.addRecoil(c.worldImg.recoil, y, w);
                        m.fireDelay = c.fireDelay;
                    }
                }
                l.ticker += e;
                if (l.ticker >= l.pullDelay) {
                    const f = r.u(l.playerId);
                    if (
                        f &&
                        !f.netData.he &&
                        f.netData.me == l.weaponType &&
                        c.caseTiming == "shoot"
                    ) {
                        createCasingParticle(
                            l.weaponType,
                            (Math.PI / 2) * -1,
                            1,
                            f.netData.ie,
                            f.netData.oe,
                            f.renderLayer,
                            f.renderZOrd + 1,
                            i
                        );
                    }
                    l.active = false;
                }
            }
        }
    }
}

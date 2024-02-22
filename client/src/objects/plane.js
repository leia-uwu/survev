import * as PIXI from "pixi.js";
import { collider } from "../../../shared/utils/collider";
import { GameConfig } from "../../../shared/gameConfig";
import { math } from "../../../shared/utils/math";
import { util } from "../../../shared/utils/util";
import { v2 } from "../../../shared/utils/v2";

function Plane() {
    this.active = false;
    this.sprite = new PIXI.Sprite();
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.visible = false;
}
function AirstrikeZone(e) {
    this.active = false;
    this.pos = v2.create(0, 0);
    this.rad = 0;
    this.duration = 0;
    this.ticker = 0;
    this.gfx = new PIXI.Graphics();
    e.addChild(this.gfx);
}
function PlaneBarn(e) {
    this.ia = [];
    this.oa = [];
    this.airstrikeZoneContainer = new PIXI.Container();
    this.audioManager = e;
}

Plane.prototype = {
    o: function(e, t) {
        this.id = e.id;
        this.pos = v2.copy(e.pos);
        this.planeDir = v2.copy(e.planeDir);
        this.actionComplete = e.actionComplete;
        this.active = true;
        this.dirty = false;
        this.soundInstance = null;
        this.soundUpdateThrottle = 0;
        this.alpha = 0.75;
        this.renderAlpha = 1;
        this.spriteUpdateTime = 0;
        this.type = e.action;
        this.config =
            this.type == GameConfig.Plane.Airdrop ? GameConfig.airdrop : GameConfig.airstrike;
        this.rad = this.config.planeRad;
        switch (this.type) {
        case GameConfig.Plane.Airdrop:
            this.sprite.texture = PIXI.Texture.from(
                t.getMapDef().biome.airdrop.planeImg
            );
            this.planeSound =
                    t.getMapDef().biome.airdrop.planeSound;
            break;
        case GameConfig.Plane.Airstrike:
            this.sprite.texture =
                    PIXI.Texture.from("map-plane-02.img");
            this.planeSound = "fighter_01";
        }
        this.sprite.visible = true;
        this.sprite.rotation = Math.atan2(
            this.planeDir.x,
            this.planeDir.y
        );
    },
    n: function(e) {
        if (this.spriteUpdateTime >= 2) {
            if (this.soundInstance) {
                e.stopSound(this.soundInstance);
                this.soundInstance = null;
            }
            this.sprite.visible = false;
            this.active = false;
        }
    }
};
AirstrikeZone.prototype = {
    o: function(e, t, r) {
        this.active = true;
        this.pos = v2.copy(e);
        this.rad = t;
        this.duration = r;
        this.ticker = 0;
        this.renderPos = v2.create(0, 0);
        this.renderRad = 0;
        this.gfx.visible = true;
    },
    m: function(e, t, r) {
        this.ticker += e;
        this.gfx.visible = true;
        if (this.ticker >= this.duration) {
            this.gfx.visible = false;
            this.active = false;
        }
    },
    br: function(e, t, r) {
        const a = e.getMapPosFromWorldPos(this.pos, t);
        const i = e.getMapPosFromWorldPos(
            v2.add(this.pos, v2.create(this.rad, 0)),
            t
        );
        const o = v2.length(v2.sub(i, a));
        const s = !v2.eq(this.renderPos, a, 0.0001);
        const n = !math.eqAbs(this.renderRad, o, 0.0001);
        if (s) {
            this.renderPos = v2.copy(a);
        }
        if (n) {
            this.renderRad = o;
        }
        if (s) {
            this.gfx.position.set(
                this.renderPos.x,
                this.renderPos.y
            );
        }
        if (n) {
            this.gfx.clear();
            this.gfx.lineStyle(1.5, 15400704);
            this.gfx.beginFill(15400704, 0.2);
            this.gfx.drawCircle(0, 0, this.renderRad);
            this.gfx.endFill();
        }
        const l =
            math.smoothstep(this.ticker, 0, 0.5) *
            (1 -
                math.smoothstep(
                    this.ticker,
                    this.duration - 0.5,
                    this.duration
                ));
        this.gfx.alpha = l;
    }
};
PlaneBarn.prototype = {
    free: function() {
        for (let e = 0; e < this.ia.length; e++) {
            this.ia[e].n(this.audioManager);
        }
    },
    Pr: function(e, t) {
        for (let r = 0; r < this.ia.length; r++) {
            this.ia[r].dirty = true;
        }
        for (let a = 0; a < e.length; a++) {
            const i = e[a];
            let o = null;
            for (let s = 0; s < this.ia.length; s++) {
                const n = this.ia[s];
                if (n.active && n.id == i.id) {
                    o = n;
                    break;
                }
            }
            o ||= this.sa(i, t);
            o.dirty = false;
            o.actionComplete = i.actionComplete;
        }
        for (let l = 0; l < this.ia.length; l++) {
            const c = this.ia[l];
            if (c.active && c.dirty) {
                c.n(this.audioManager);
            }
        }
    },
    sa: function(e, t) {
        let r = null;
        for (let i = 0; i < this.ia.length; i++) {
            if (!this.ia[i].active) {
                r = this.ia[i];
                break;
            }
        }
        if (!r) {
            r = new Plane();
            this.ia.push(r);
        }
        r.o(e, t);
        return r;
    },
    Cr: function(e) {
        let t = null;
        for (let r = 0; r < this.oa.length; r++) {
            if (!this.oa[r]) {
                t = this.oa[r];
                break;
            }
        }
        if (!t) {
            t = new AirstrikeZone(this.airstrikeZoneContainer);
            this.oa.push(t);
        }
        t.o(e.pos, e.rad, e.duration);
        return t;
    },
    m: function(e, t, r, a, i) {
        for (let o = 0; o < this.ia.length; o++) {
            const s = this.ia[o];
            if (s.active) {
                let h = 0;
                if (
                    (!!util.sameLayer(h, r.layer) ||
                        !!(r.layer & 2)) &&
                    (!(r.layer & 2) ||
                        !a.insideStructureMask(
                            collider.createCircle(s.pos, 1)
                        ))
                ) {
                    h |= 2;
                }
                s.pos = v2.add(
                    s.pos,
                    v2.mul(s.planeDir, e * s.config.planeVel)
                );
                if (s.actionComplete) {
                    s.spriteUpdateTime = Math.min(
                        s.spriteUpdateTime + e,
                        2
                    );
                    s.rad = math.lerp(
                        s.spriteUpdateTime,
                        s.config.planeRad,
                        s.config.planeRad * 1.25
                    );
                    s.alpha = math.lerp(
                        s.spriteUpdateTime,
                        0.75,
                        0.5625
                    );
                    s.soundRangeMult = math.max(
                        0,
                        math.lerp(
                            s.spriteUpdateTime,
                            s.config.soundRangeMult,
                            s.config.soundRangeMult -
                            s.config.soundRangeDelta
                        )
                    );
                }
                if (s.soundInstance) {
                    if (s.soundUpdateThrottle < 0) {
                        this.audioManager.updateSound(
                            s.soundInstance,
                            "sfx",
                            s.pos,
                            {
                                layer: h,
                                rangeMult: s.config.soundRangeMult,
                                ignoreMinAllowable: true,
                                fallOff: s.config.fallOff
                            }
                        );
                        s.soundUpdateThrottle = 0.1;
                    } else {
                        s.soundUpdateThrottle -= e;
                    }
                } else {
                    const d = v2.length(v2.sub(r.pos, s.pos));
                    const u =
                        s.config.soundRangeMax *
                        s.config.soundRangeMult;
                    let g = 0;
                    if (s.type == GameConfig.Plane.Airstrike) {
                        const y = math.max(150, d);
                        g =
                            (1 - math.clamp(math.max(0, y) / 800, 0, 1)) *
                            2.25;
                    }
                    if (d < u) {
                        s.soundInstance =
                            this.audioManager.playSound(
                                s.planeSound,
                                {
                                    channel: "sfx",
                                    soundPos: s.pos,
                                    layer: h,
                                    loop: true,
                                    rangeMult: 2.5,
                                    ignoreMinAllowable: true,
                                    fallOff: s.config.fallOff,
                                    offset: g
                                }
                            );
                    }
                }
                i.addPIXIObj(s.sprite, h, 1501, s.id);
                const w = t.pointToScreen(s.pos);
                const f = t.pixels(s.rad / t.ppu);
                const _ = a.insideBuildingCeiling(
                    collider.createCircle(r.pos, 0.01),
                    true
                );
                let b = s.alpha;
                if (r.layer == 1) {
                    b = 0;
                } else if (_ || r.layer & 1) {
                    b = 0.15;
                }
                s.renderAlpha = math.lerp(e * 3, s.renderAlpha, b);
                s.sprite.position.set(w.x, w.y);
                s.sprite.scale.set(f, f);
                s.sprite.tint = 16776960;
                s.sprite.alpha = s.renderAlpha;
                s.sprite.visible = true;
            }
        }
        for (let x = 0; x < this.oa.length; x++) {
            const S = this.oa[x];
            if (S.active) {
                S.m(e);
            }
        }
    },
    renderAirstrikeZones: function(e, t, r) {
        for (let a = 0; a < this.oa.length; a++) {
            const i = this.oa[a];
            if (i.active) {
                i.br(e, t, r);
            }
        }
    }
};
export default {
    PlaneBarn
};

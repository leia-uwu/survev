import * as PIXI from "pixi.js"
;
import { collider } from "../../../shared/utils/collider";
import { math } from "../../../shared/utils/math";
import { util } from "../../../shared/utils/util";
import { v2 } from "../../../shared/utils/v2";
import { MapObjectDefs } from "../../../shared/defs/mapObjectDefs";

function Obstacle() {
    this.sprite = new PIXI.Sprite();
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.visible = false;
}

Obstacle.prototype = {
    o: function() {
        this.isNew = false;
        this.smokeEmitter = null;
        this.sprite.visible = false;
        this.img = "";
    },
    n: function() {
        this.sprite.visible = false;
        this.sprite.parent?.removeChild(this.sprite);
        if (this.door?.casingSprite) {
            this.door.casingSprite.destroy();
            this.door.casingSprite = null;
        }
        if (this.smokeEmitter) {
            this.smokeEmitter.stop();
            this.smokeEmitter = null;
        }
    },
    c: function(e, t, r, a) {
        if (t) {
            this.type = e.type;
            this.layer = e.layer;
            this.healthT = e.healthT;
            this.dead = e.dead;
            this.isSkin = e.isSkin;
            if (this.isSkin) {
                this.skinPlayerId = e.skinPlayerId;
            }
        }
        const m = MapObjectDefs[this.type];
        this.pos = v2.copy(e.pos);
        this.rot = math.oriToRad(e.ori);
        this.scale = e.scale;
        this.imgScale = m.img.scale;
        this.imgMirrorY = m.img.mirrorY;
        this.imgMirrorX = m.img.mirrorX;
        this.collider = collider.transform(
            m.collision,
            this.pos,
            this.rot,
            this.scale
        );
        if (r) {
            this.isNew = true;
            this.exploded =
                a.map.deadObstacleIds.indexOf(this.__id) != -1;
            this.explodeParticle = m.explodeParticle;
            this.collidable = m.collidable && !this.isSkin;
            this.destructible = m.destructible;
            this.height = m.height;
            this.isWall = !!m.isWall;
            this.isWindow = !!m.isWindow;
            this.isBush = !!m.isBush;
            this.isDoor = m.door !== undefined;
            if (this.isDoor) {
                this.door = {
                    openOneWay: m.door.openOneWay,
                    closedPos: v2.copy(e.pos),
                    autoOpen: m.door.autoOpen,
                    interactionRad: m.door.interactionRad,
                    interpSpeed: m.door.openSpeed,
                    interpPos: v2.copy(e.pos),
                    interpRot: math.oriToRad(e.ori),
                    seq: e.door.seq,
                    seqOld: e.door.seq,
                    open: e.door.open,
                    wasOpen: e.door.open,
                    locked: e.door.locked,
                    casingSprite: null
                };
                const p = m.door.casingImg;
                if (p !== undefined) {
                    let h = p.pos || v2.create(0, 0);
                    h = v2.rotate(h, this.rot + Math.PI * 0.5);
                    const d = new PIXI.Sprite();
                    d.texture = PIXI.Texture.from(p.sprite);
                    d.anchor.set(0.5, 0.5);
                    d.posOffset = h;
                    d.imgScale = p.scale;
                    d.tint = p.tint;
                    d.alpha = p.alpha;
                    d.visible = true;
                    this.door.casingSprite = d;
                }
            }
            this.isButton = m.button !== undefined;
            if (this.isButton) {
                this.button = {
                    interactionRad: m.button.interactionRad,
                    interactionText:
                        m.button.interactionText || "game-use",
                    seq: e.button.seq,
                    seqOld: e.button.seq
                };
            }
            this.isPuzzlePiece = e.isPuzzlePiece;
            this.parentBuildingId = this.isPuzzlePiece
                ? e.parentBuildingId
                : 0;
        }
        if (this.isDoor && t) {
            this.door.canUse = e.door.canUse;
            this.door.open = e.door.open;
            this.door.seq = e.door.seq;
            const u = v2.rotate(
                v2.create(m.door.slideOffset, 0),
                this.rot + Math.PI * 0.5
            );
            this.door.closedPos = e.door.open
                ? v2.add(e.pos, u)
                : v2.copy(e.pos);
        }
        if (this.isButton && t) {
            this.button.onOff = e.button.onOff;
            this.button.canUse = e.button.canUse;
            this.button.seq = e.button.seq;
        }
        if (
            m.explosion !== undefined &&
            !this.smokeEmitter &&
            e.healthT < 0.5 &&
            !e.dead
        ) {
            const g = v2.normalize(v2.create(1, 1));
            this.smokeEmitter = a.particleBarn.addEmitter(
                "smoke_barrel",
                {
                    pos: this.pos,
                    dir: g,
                    layer: this.layer
                }
            );
        }
        let y = false;
        let w = this.dead ? m.img.residue : m.img.sprite;
        if (
            this.isButton &&
            this.button.onOff &&
            !this.dead &&
            m.button.useImg
        ) {
            w = m.button.useImg;
        } else if (
            this.isButton &&
            !this.button.canUse &&
            m.button.offImg
        ) {
            w = m.button.offImg;
        }
        if (w != this.img) {
            let f = v2.create(0.5, 0.5);
            if (this.isDoor) {
                f = m.door.spriteAnchor;
            }
            const _ = w !== undefined;
            if (!_) {
                this.sprite.parent?.removeChild(this.sprite);
            }
            if (_) {
                this.sprite.texture =
                    (w == "none" || !w)
                        ? PIXI.Texture.EMPTY
                        : PIXI.Texture.from(w);
                this.sprite.anchor.set(f.x, f.y);
                this.sprite.tint = m.img.tint;
                this.sprite.imgAlpha = this.dead
                    ? 0.75
                    : m.img.alpha;
                this.sprite.zOrd = m.img.zIdx;
                this.sprite.zIdx =
                    Math.floor(this.scale * 1000) * 65535 +
                    this.__id;
                this.sprite.alpha = this.sprite.imgAlpha;
                y = true;
            }
            this.sprite.visible = _;
            this.img = w;
        }
        const b = a.map.getMapDef().biome.valueAdjust;
        if (y && b < 1) {
            this.sprite.tint = util.adjustValue(this.sprite.tint, b);
        }
    },
    getInteraction: function() {
        if (this.isButton && this.button.canUse) {
            return {
                rad: this.button.interactionRad,
                action: this.button.interactionText,
                object: `game-${this.type}`
            };
        } else if (
            this.isDoor &&
            this.door.canUse &&
            !this.door.autoOpen
        ) {
            return {
                rad: this.door.interactionRad,
                action: this.door.open
                    ? "game-close-door"
                    : "game-open-door",
                object: ""
            };
        } else {
            return null;
        }
    },
    m: function(e, t, r, a, i, m, p) {
        if (this.isButton) {
            const h = this.button;
            if (h.seq != h.seqOld) {
                const d = MapObjectDefs[this.type];
                if (d.button.useParticle) {
                    const u = collider.toAabb(this.collider);
                    const g = v2.mul(v2.sub(u.max, u.min), 0.5);
                    const y = v2.add(u.min, g);
                    const w = v2.mul(
                        v2.randomUnit(),
                        util.random(5, 15)
                    );
                    a.addParticle(
                        d.button.useParticle,
                        this.layer,
                        y,
                        w
                    );
                }
                const f = this.button.onOff
                    ? d.button.sound.on
                    : d.button.sound.off;
                if (f) {
                    i.playSound(f, {
                        channel: "sfx",
                        soundPos: this.pos,
                        layer: this.layer,
                        filter: "muffled"
                    });
                }
            }
            h.seqOld = h.seq;
        }
        if (this.isDoor) {
            const _ = this.door;
            const b = _.interpSpeed;
            const x = v2.sub(this.pos, _.interpPos);
            const S = v2.length(x);
            let v = b * e;
            if (S < v) {
                v = S;
            }
            const k = S > 0.0001 ? v2.div(x, S) : v2.create(1, 0);
            _.interpPos = v2.add(_.interpPos, v2.mul(k, v));
            const z = Math.PI * _.interpSpeed;
            const I = math.angleDiff(_.interpRot, this.rot);
            let T = math.sign(I) * z * e;
            if (Math.abs(I) < Math.abs(T)) {
                T = I;
            }
            _.interpRot += T;
            if (_.seq != _.seqOld) {
                const M = MapObjectDefs[this.type];
                const P = M.door.sound.change || "";
                if (P != "") {
                    i.playSound(P, {
                        channel: "sfx",
                        soundPos: this.pos,
                        layer: this.layer,
                        filter: "muffled"
                    });
                }
                _.seqOld = _.seq;
            }
            if (_.open != _.wasOpen) {
                const C = MapObjectDefs[this.type];
                const A = _.open
                    ? C.door.sound.open
                    : C.door.sound.close;
                i.playSound(A, {
                    channel: "sfx",
                    soundPos: this.pos,
                    layer: this.layer,
                    filter: "muffled"
                });
                _.wasOpen = _.open;
            }
        }
        if (
            this.dead &&
            !this.exploded &&
            (t.deadObstacleIds.push(this.__id),
                (this.exploded = true),
                this.smokeEmitter &&
                (this.smokeEmitter.stop(),
                    (this.smokeEmitter = null)),
                !this.isNew)
        ) {
            var O = MapObjectDefs[this.type];
            var D = collider.toAabb(this.collider);
            var E = v2.mul(v2.sub(D.max, D.min), 0.5);
            var B = v2.add(D.min, E);
            for (
                var R = Math.floor(util.random(5, 11)), L = 0;
                L < R;
                L++
            ) {
                const q = v2.mul(v2.randomUnit(), util.random(5, 15));
                const F = Array.isArray(this.explodeParticle)
                    ? this.explodeParticle[
                    Math.floor(
                        Math.random() *
                        this.explodeParticle.length
                    )
                    ]
                    : this.explodeParticle;
                a.addParticle(F, this.layer, B, q);
            }
            i.playSound(O.sound.explode, {
                channel: "sfx",
                soundPos: B,
                layer: this.layer,
                filter: "muffled"
            });
        }
        if (this.smokeEmitter) {
            const j = this.isSkin ? 0.3 : 0.5;
            this.smokeEmitter.pos = v2.copy(this.pos);
            this.smokeEmitter.enabled =
                !this.dead && this.healthT < j;
        }
        if (this.sprite.visible && this.img) {
            let N = this.dead ? 5 : this.sprite.zOrd;
            let H = this.sprite.zIdx;
            let V = this.layer;
            if (
                !this.dead &&
                N >= 50 &&
                this.layer == 0 &&
                m.layer == 0
            ) {
                N += 100;
                V |= 2;
            }
            if (!this.dead && this.isSkin) {
                const U = r.u(this.skinPlayerId);
                if (U) {
                    N = math.max(math.max(N, U.renderZOrd), 21);
                    if (U.renderLayer != 0) {
                        V = U.renderLayer;
                        N = U.renderZOrd;
                    }
                    H = U.renderZIdx + 262144;
                }
            }
            p.addPIXIObj(this.sprite, V, N, H);
            if (this.isDoor && this.door.casingSprite) {
                p.addPIXIObj(this.door.casingSprite, V, N + 1, H);
            }
        }
        this.isNew = false;
    },
    render: function(e, t, r) {
        const a = this.isDoor ? this.door.interpPos : this.pos;
        const i = this.isDoor ? this.door.interpRot : this.rot;
        const o = this.scale;
        const s = e.pointToScreen(a);
        const n = e.pixels(o * this.imgScale);
        this.sprite.position.set(s.x, s.y);
        this.sprite.scale.set(n, n);
        if (this.imgMirrorY) {
            this.sprite.scale.y *= -1;
        }
        if (this.imgMirrorX) {
            this.sprite.scale.x *= -1;
        }
        this.sprite.rotation = -i;
        if (this.isDoor && this.door.casingSprite) {
            const c = e.pointToScreen(
                v2.add(
                    this.door.closedPos,
                    this.door.casingSprite.posOffset
                )
            );
            const m = e.pixels(o * this.door.casingSprite.imgScale);
            this.door.casingSprite.position.set(c.x, c.y);
            this.door.casingSprite.scale.set(m, m);
            this.door.casingSprite.rotation = -i;
            this.door.casingSprite.visible = !this.dead;
        }
    }
};
export default Obstacle;

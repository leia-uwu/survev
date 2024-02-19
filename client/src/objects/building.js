import * as PIXI from "pixi.js"
    ;
import { collider } from "../../../shared/utils/collider";
import { math } from "../../../shared/utils/math";
import { mapHelpers } from "../../../shared/utils/mapHelpers";
import { util } from "../../../shared/utils/util";
import { v2 } from "../../../shared/utils/v2";
import { MapObjectDefs } from "../../../shared/defs/mapObjectDefs";
import { collisionHelpers } from "../../../shared/utils/collisionHelpers";

function a(e, t, r) {
    const a = t - e;
    const i = a * r;
    if (Math.abs(i) < 0.001) {
        return a;
    } else {
        return i;
    }
}
function Building() {
    this.sprites = [];
    this.particleEmitters = [];
    this.soundEmitters = [];
}

Building.prototype = {
    o: function() {
        this.isNew = false;
        this.residue = null;
        this.ceilingDead = false;
        this.ceilingDamaged = false;
        this.playedCeilingDeadFx = false;
        this.playedSolvedPuzzleFx = false;
        this.hasPuzzle = false;
        this.puzzleErrSeqModified = false;
        this.puzzleErrSeq = 0;
        this.puzzleSolved = false;
        this.soundEmitterTicker = 0;
    },
    n: function() {
        for (let e = 0; e < this.sprites.length; e++) {
            const t = this.sprites[e];
            t.active = false;
            t.sprite.visible = false;
            t.sprite.parent?.removeChild(t.sprite);
            t.sprite.removeChildren();
        }
        for (let r = 0; r < this.particleEmitters.length; r++) {
            this.particleEmitters[r].stop();
        }
        this.particleEmitters = [];
        for (let a = 0; a < this.soundEmitters.length; a++) {
            this.soundEmitters[a].instance?.stop();
        }
        this.soundEmitters = [];
    },
    allocSprite: function() {
        for (let e = 0; e < this.sprites.length; e++) {
            const t = this.sprites[e];
            if (!t.active) {
                t.active = true;
                return t.sprite;
            }
        }
        const r = new PIXI.Sprite();
        r.anchor.set(0.5, 0.5);
        this.sprites.push({
            active: true,
            sprite: r
        });
        return r;
    },
    c: function(e, t, r, a) {
        const i = this;
        if (t) {
            this.type = e.type;
            this.pos = v2.copy(e.pos);
            this.ori = e.ori;
            this.rot = math.oriToRad(e.ori);
            this.scale = 1;
            this.layer = e.layer;
        }
        this.ceilingDead = e.ceilingDead;
        this.ceilingDamaged = e.ceilingDamaged;
        this.occupied = e.occupied;
        this.hasPuzzle = e.hasPuzzle;
        if (this.hasPuzzle) {
            this.puzzleErrSeqModified =
                e.puzzleErrSeq != this.puzzleErrSeq;
            this.puzzleSolved = e.puzzleSolved;
            this.puzzleErrSeq = e.puzzleErrSeq;
        }
        const p = MapObjectDefs[this.type];
        if (r) {
            this.isNew = true;
            this.playedCeilingDeadFx =
                p.ceiling.destroy !== undefined &&
                a.map.deadCeilingIds.indexOf(this.__id) != -1;
            this.playedSolvedPuzzleFx =
                this.hasPuzzle &&
                a.map.solvedPuzzleIds.indexOf(this.__id) != -1;
            const d = function(e) {
                const t = e.pos || v2.create(0, 0);
                const r = math.oriToRad(e.rot || 0);
                const s = i.allocSprite();
                if (e.sprite && e.sprite != "none") {
                    s.texture = PIXI.Texture.from(e.sprite);
                } else {
                    s.texture = PIXI.Texture.EMPTY;
                }
                s.tint = e.tint;
                const l = a.map.getMapDef().biome.valueAdjust;
                if (l < 1) {
                    s.tint = util.adjustValue(s.tint, l);
                }
                s.posOffset = v2.rotate(t, i.rot);
                s.rotOffset = r;
                s.imgAlpha = e.alpha;
                s.alpha = s.imgAlpha;
                s.defScale = e.scale;
                s.mirrorY = !!e.mirrorY;
                s.mirrorX = !!e.mirrorX;
                s.visible = true;
                return s;
            };
            this.bounds = collider.transform(
                mapHelpers.getBoundingCollider(this.type),
                this.pos,
                this.rot,
                this.scale
            );
            this.zIdx = p.zIdx || 0;
            this.surfaces = [];
            for (let u = 0; u < p.floor.surfaces.length; u++) {
                for (
                    var g = p.floor.surfaces[u],
                    y = {
                        type: g.type,
                        data: g.data || {},
                        colliders: []
                    },
                    w = 0;
                    w < g.collision.length;
                    w++
                ) {
                    y.colliders.push(
                        collider.transform(
                            g.collision[w],
                            this.pos,
                            this.rot,
                            this.scale
                        )
                    );
                }
                this.surfaces.push(y);
            }
            const f = Object.assign(
                {},
                {
                    dist: 5.5,
                    width: 2.75,
                    linger: 0,
                    fadeRate: 12
                },
                p.ceiling.vision
            );
            this.ceiling = {
                zoomRegions: [],
                vision: f,
                visionTicker: 0,
                fadeAlpha: 1
            };
            for (let _ = 0; _ < p.ceiling.zoomRegions.length; _++) {
                const b = p.ceiling.zoomRegions[_];
                this.ceiling.zoomRegions.push({
                    zoomIn: b.zoomIn
                        ? collider.transform(
                            b.zoomIn,
                            this.pos,
                            this.rot,
                            this.scale
                        )
                        : null,
                    zoomOut: b.zoomOut
                        ? collider.transform(
                            b.zoomOut,
                            this.pos,
                            this.rot,
                            this.scale
                        )
                        : null
                });
            }
            this.imgs = [];
            for (let x = 0; x < p.floor.imgs.length; x++) {
                this.imgs.push({
                    sprite: d(p.floor.imgs[x]),
                    isCeiling: false,
                    zOrd: this.zIdx,
                    zIdx: this.__id * 100 + x
                });
            }
            for (let S = 0; S < p.ceiling.imgs.length; S++) {
                const v = p.ceiling.imgs[S];
                this.imgs.push({
                    sprite: d(v),
                    isCeiling: true,
                    removeOnDamaged: !!v.removeOnDamaged,
                    zOrd: 750 - this.zIdx,
                    zIdx: this.__id * 100 + S
                });
            }
            for (
                let k = p.occupiedEmitters || [], z = 0;
                z < k.length;
                z++
            ) {
                const I = k[z];
                const T = I.rot !== undefined ? I.rot : 0;
                const M = this.rot + T;
                let P = v2.add(this.pos, v2.rotate(I.pos, M));
                const C = I.dir || v2.create(1, 0);
                let A = v2.rotate(C, M);
                let O = I.scale;
                let D = null;
                if (I.parentToCeiling) {
                    var E = -1;
                    for (var B = 0; B < this.imgs.length; B++) {
                        if (this.imgs[B].isCeiling) {
                            E = B;
                        }
                    }
                    if (E >= 0) {
                        const R = this.imgs[E];
                        D = R.sprite;
                        P = v2.mul(I.pos, 32);
                        P.y *= -1;
                        A = v2.rotate(v2.create(1, 0), I.rot);
                        O = 1 / R.sprite.defScale;
                    }
                }
                const L = a.particleBarn.addEmitter(I.type, {
                    pos: P,
                    dir: A,
                    scale: O,
                    layer: I.layer,
                    parent: D
                });
                this.particleEmitters.push(L);
            }
            for (
                let q = p.soundEmitters || [], F = 0;
                F < q.length;
                F++
            ) {
                const j = q[F];
                const N = v2.add(
                    this.pos,
                    v2.rotate(j.pos, this.rot)
                );
                this.soundEmitters.push({
                    instance: null,
                    sound: j.sound,
                    channel: j.channel,
                    pos: N,
                    range: j.range,
                    falloff: j.falloff,
                    volume: j.volume
                });
            }
        }
    },
    m: function(e, t, r, i, s, l, d, u) {
        if (this.hasPuzzle) {
            const g = MapObjectDefs[this.type];
            if (
                this.puzzleErrSeqModified &&
                ((this.puzzleErrSeqModified = false), !this.isNew)
            ) {
                var y = this;
                var w = v2.length(v2.sub(l.pos, y.pos));
                for (var f = t.Ve.p(), _ = 0; _ < f.length; _++) {
                    const b = f[_];
                    if (
                        b.active &&
                        b.isPuzzlePiece &&
                        b.parentBuildingId == this.__id
                    ) {
                        const x = v2.length(v2.sub(l.pos, b.pos));
                        if (x < w) {
                            y = b;
                            w = x;
                        }
                    }
                }
                i.playSound(g.puzzle.sound.fail, {
                    channel: "sfx",
                    soundPos: y.pos,
                    layer: y.layer,
                    filter: "muffled"
                });
            }
            if (this.puzzleSolved && !this.playedSolvedPuzzleFx) {
                t.solvedPuzzleIds.push(this.__id);
                this.playedSolvedPuzzleFx = true;
                if (
                    !this.isNew &&
                    g.puzzle.sound.complete != "none"
                ) {
                    i.playSound(g.puzzle.sound.complete, {
                        channel: "sfx",
                        soundPos: this.pos,
                        layer: this.layer,
                        filter: "muffled"
                    });
                }
            }
        }
        if (this.ceilingDead && !this.playedCeilingDeadFx) {
            t.deadCeilingIds.push(this.__id);
            this.playedCeilingDeadFx = true;
            if (!this.isNew) {
                this.destroyCeilingFx(r, i);
            }
        }
        this.isNew = false;
        if (this.ceilingDead && !this.residue) {
            const S = MapObjectDefs[this.type];
            if (S.ceiling.destroy !== undefined) {
                const v = this.allocSprite();
                v.texture = PIXI.Texture.from(
                    S.ceiling.destroy.residue
                );
                v.position.set(0, 0);
                v.scale.set(1, 1);
                v.rotation = 0;
                v.tint = 16777215;
                v.visible = true;
                this.imgs[0].sprite.addChild(v);
                this.residue = v;
            }
        }
        this.ceiling.visionTicker -= e;
        var k = this.ceiling.vision;

        var canSeeInside = false;
        for (var I = 0; I < this.ceiling.zoomRegions.length; I++) {
            const T = this.ceiling.zoomRegions[I].zoomIn;
            if (
                T &&
                (this.layer == l.layer || l.layer & 2) &&
                collisionHelpers.scanCollider(
                    T,
                    t.Ve.p(),
                    l.pos,
                    l.layer,
                    0.5,
                    k.width * 2,
                    k.dist,
                    5
                )
            ) {
                canSeeInside = true;
                break;
            }
        }
        if (this.ceilingDead) {
            canSeeInside = true;
        }
        if (canSeeInside) {
            this.ceiling.visionTicker = k.linger + 0.0001;
        }
        if (l.noCeilingRevealTicker > 0 && !this.ceilingDead) {
            this.ceiling.visionTicker = 0;
        }
        const M = this.ceiling.visionTicker > 0;
        const P = a(
            this.ceiling.fadeAlpha,
            M ? 0 : 1,
            e * (M ? 12 : k.fadeRate)
        );
        this.ceiling.fadeAlpha += P;
        if (
            canSeeInside &&
            l.noCeilingRevealTicker <= 0 &&
            l.layer & 2 &&
            !util.sameLayer(l.layer, this.layer)
        ) {
            this.ceiling.fadeAlpha = 0;
        }
        for (let C = 0; C < this.particleEmitters.length; C++) {
            this.particleEmitters[C].enabled = this.occupied;
        }
        this.soundEmitterTicker += e;
        if (this.soundEmitterTicker > 0.1) {
            this.soundEmitterTicker = 0;
            for (let A = 0; A < this.soundEmitters.length; A++) {
                const O = this.soundEmitters[A];
                if (
                    !O.instance &&
                    i.isSoundLoaded(O.sound, O.channel)
                ) {
                    O.instance = i.playSound(O.sound, {
                        channel: O.channel,
                        loop: true,
                        forceStart: true,
                        startSilent: true
                    });
                }
                if (O.instance) {
                    const D = v2.sub(u.pos, O.pos);
                    const E = v2.length(D);
                    const B = math.remap(
                        E,
                        O.range.min,
                        O.range.max,
                        1,
                        0
                    );
                    const R = Math.pow(B, O.falloff);
                    const L = math.lerp(
                        this.ceiling.fadeAlpha,
                        1,
                        0.25
                    );
                    let q =
                        i.baseVolume *
                        i.getTypeVolume("sound") *
                        O.volume *
                        R *
                        L;
                    if (!util.sameAudioLayer(this.layer, l.layer)) {
                        q = 0;
                    }
                    if (q < 0.003) {
                        q = 0;
                    }
                    O.instance.volume = q;
                }
            }
        }
        for (let F = 0; F < this.imgs.length; F++) {
            const j = this.imgs[F];
            const N = j.isCeiling ? this.ceiling.fadeAlpha : 1;
            this.positionSprite(j.sprite, N, u);
            if (j.removeOnDamaged && this.ceilingDamaged) {
                j.sprite.visible = !this.ceilingDamaged;
            }
            let H = this.layer;
            if (
                j.isCeiling &&
                (this.layer == l.layer ||
                    (l.layer & 2 && this.layer == 1))
            ) {
                H |= 2;
            }
            d.addPIXIObj(j.sprite, H, j.zOrd, j.zIdx);
        }
    },
    isInsideCeiling: function(e) {
        for (let t = 0; t < this.ceiling.zoomRegions.length; t++) {
            const r = this.ceiling.zoomRegions[t].zoomIn;
            if (r && collider.intersect(r, e)) {
                return true;
            }
        }
        return false;
    },
    getDistanceToBuilding: function(e, t) {
        var r = t;
        for (var a = 0; a < this.ceiling.zoomRegions.length; a++) {
            const i = this.ceiling.zoomRegions[a].zoomIn;
            if (i) {
                const o = collider.intersectCircle(i, e, t);
                if (o) {
                    r = math.clamp(t - o.pen, 0, r);
                }
            }
        }
        return r;
    },
    destroyCeilingFx: function(e, t) {
        var r = MapObjectDefs[this.type].ceiling.destroy;
        for (
            var a = this.surfaces[0], i = 0;
            i < a.colliders.length;
            i++
        ) {
            for (
                let o = collider.toAabb(a.colliders[i]), n = 0;
                n < r.particleCount;
                n++
            ) {
                const l = v2.create(
                    util.random(o.min.x, o.max.x),
                    util.random(o.min.y, o.max.y)
                );
                const p = v2.mul(v2.randomUnit(), util.random(0, 15));
                e.addParticle(r.particle, this.layer, l, p);
            }
            break;
        }
        t.playSound(r.sound || "ceiling_break_01", {
            channel: "sfx",
            soundPos: this.pos
        });
    },
    positionSprite: function(e, t, r) {
        const a = r.pointToScreen(v2.add(this.pos, e.posOffset));
        const i = r.pixels(this.scale * e.defScale);
        e.position.set(a.x, a.y);
        e.scale.set(i, i);
        if (e.mirrorY) {
            e.scale.y *= -1;
        }
        if (e.mirrorX) {
            e.scale.x *= -1;
        }
        e.rotation = -this.rot + e.rotOffset;
        e.alpha = e.imgAlpha * t;
    },
    render: function(e, t, r) { }
};

export default Building;

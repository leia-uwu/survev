import { MapObjectDefs } from "../../../shared/defs/mapObjectDefs";
import { coldet } from "../../../shared/utils/coldet";
import { collider } from "../../../shared/utils/collider";
import { mapHelpers } from "../../../shared/utils/mapHelpers";
import { math } from "../../../shared/utils/math";
import { v2 } from "../../../shared/utils/v2";

function Structure() { }
Structure.prototype = {
    o: function() {
        this.soundTransitionT = 0;
    },
    n: function() { },
    c: function(e, t, r, a) {
        if (t) {
            this.type = e.type;
            this.layer = 0;
            this.pos = v2.copy(e.pos);
            this.rot = math.oriToRad(e.ori);
            this.scale = 1;
            this.interiorSoundAlt = e.interiorSoundAlt;
            this.interiorSoundEnabled = e.interiorSoundEnabled;
            if (r) {
                this.soundTransitionT = this.interiorSoundAlt
                    ? 1
                    : 0;
                this.soundEnabledT = this.interiorSoundEnabled
                    ? 1
                    : 0;
            }
            this.aabb = collider.transform(
                mapHelpers.getBoundingCollider(this.type),
                this.pos,
                this.rot,
                this.scale
            );
            const m = MapObjectDefs[this.type];
            this.layers = [];
            for (let p = 0; p < m.layers.length; p++) {
                const h = m.layers[p];
                const d = e.layerObjIds[p];
                const u =
                    h.inheritOri === undefined || h.inheritOri;
                const g =
                    h.underground !== undefined
                        ? h.underground
                        : p == 1;
                const y = v2.add(this.pos, h.pos);
                const w = math.oriToRad(u ? e.ori + h.ori : h.ori);
                const f = collider.transform(
                    mapHelpers.getBoundingCollider(h.type),
                    y,
                    w,
                    1
                );
                this.layers.push({
                    objId: d,
                    collision: f,
                    underground: g
                });
            }
            this.stairs = [];
            for (let _ = 0; _ < m.stairs.length; _++) {
                const b = m.stairs[_];
                const x = collider.transform(
                    b.collision,
                    this.pos,
                    this.rot,
                    this.scale
                );
                const S = v2.rotate(b.downDir, this.rot);
                const v = coldet.splitAabb(x, S);
                this.stairs.push({
                    collision: x,
                    center: v2.add(
                        x.min,
                        v2.mul(v2.sub(x.max, x.min), 0.5)
                    ),
                    downDir: S,
                    downAabb: collider.createAabb(v[0].min, v[0].max),
                    upAabb: collider.createAabb(v[1].min, v[1].max),
                    noCeilingReveal: !!b.noCeilingReveal,
                    lootOnly: !!b.lootOnly
                });
            }
            this.mask = [];
            for (let k = 0; k < m.mask.length; k++) {
                this.mask.push(
                    collider.transform(
                        m.mask[k],
                        this.pos,
                        this.rot,
                        this.scale
                    )
                );
            }
            a.renderer.layerMaskDirty = true;
        }
    },
    update: function(e, t, r, a) {
        if (MapObjectDefs[this.type].interiorSound) {
            this.updateInteriorSounds(e, t, r, a);
        }
    },
    updateInteriorSounds: function(e, t, r, a) {
        const i = MapObjectDefs[this.type];
        collider.createCircle(r.pos, 0.001);
        t.nr.p();
        const s =
            this.layers.length > 0
                ? t.getBuildingById(this.layers[0].objId)
                : null;
        const l =
            this.layers.length > 1
                ? t.getBuildingById(this.layers[1].objId)
                : null;
        const m =
            i.interiorSound.outsideMaxDist !== undefined
                ? i.interiorSound.outsideMaxDist
                : 10;
        const p =
            i.interiorSound.outsideVolume !== undefined
                ? i.interiorSound.outsideVolume
                : 0;
        const h =
            i.interiorSound.undergroundVolume !== undefined
                ? i.interiorSound.undergroundVolume
                : 1;
        let d = 0;
        let u = 0;
        if (r.layer != 1) {
            if (s) {
                const g = s.getDistanceToBuilding(r.pos, m);
                const y = math.remap(g, m, 0, 0, 1);
                const w = r.layer & 2;
                const f = s.ceiling.fadeAlpha;
                d = y * (1 - f);
                u = y * f * (w ? h : p);
            }
        } else if (l) {
            const _ = l.getDistanceToBuilding(r.pos, m);
            const b = math.remap(_, m, 0, 0, 1);
            d = 0;
            u = b * h;
        }
        const x =
            i.interiorSound.transitionTime !== undefined
                ? i.interiorSound.transitionTime
                : 1;
        if (this.interiorSoundAlt) {
            this.soundTransitionT = math.clamp(
                this.soundTransitionT + e / x,
                0,
                1
            );
        }
        const S = Math.abs(this.soundTransitionT - 0.5) * 2;
        if (!this.interiorSoundEnabled) {
            this.soundEnabledT = math.clamp(
                this.soundEnabledT - e * 0.5,
                0,
                1
            );
        }
        const v =
            this.soundTransitionT > 0.5
                ? i.interiorSound.soundAlt
                : i.interiorSound.sound;
        const k = a.getTrack("interior_0");
        k.sound = v;
        k.filter = "";
        k.weight = v ? d * S * this.soundEnabledT : 0;
        const z = a.getTrack("interior_1");
        z.sound = v;
        z.filter = i.interiorSound.filter;
        z.weight = v ? u * S * this.soundEnabledT : 0;
    },
    render: function(e, t, r) { },
    insideStairs: function(e) {
        for (let t = 0; t < this.stairs.length; t++) {
            if (collider.intersect(this.stairs[t].collision, e)) {
                return true;
            }
        }
        return false;
    },
    insideMask: function(e) {
        for (let t = 0; t < this.mask.length; t++) {
            if (collider.intersect(this.mask[t], e)) {
                return true;
            }
        }
        return false;
    }
};
export default Structure;

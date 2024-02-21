import * as PIXI from "pixi.js"
;
import { coldet } from "../../shared/utils/coldet";
import { collider } from "../../shared/utils/collider";
import { mapHelpers } from "../../shared/utils/mapHelpers";
import terrainGen from "../../shared/utils/terrainGen";
import { util } from "../../shared/utils/util";
import { v2 } from "../../shared/utils/v2";
import objectPool from "./objects/objectPool";
import device from "./device";
import { math } from "../../shared/utils/math";
import { GameConfig } from "../../shared/gameConfig";
import { MapDefs } from "../../shared/defs/mapDefs";
import { MapObjectDefs } from "../../shared/defs/mapObjectDefs";
import particles from "./objects/particles";
import Building from "./objects/building";
import Obstacle from "./objects/obstacle";
import Structure from "./objects/structure";

function a(e, t, r) {
    e.moveTo(t.x, t.y);
    e.lineTo(r.x, r.y);
}
function i(e, t) {
    let r = t[0];
    e.moveTo(r.x, r.y);
    for (let a = 1; a < t.length; ++a) {
        r = t[a];
        e.lineTo(r.x, r.y);
    }
    e.closePath();
}
function o(e, t, r) {
    const a = t.max.x - t.min.x;
    const o = t.max.y - t.min.y;
    const s = math.max(t.offsetDist, 0.001);
    const n = t.roughness;
    const l = Math.round((a * n) / s);
    const c = Math.round((o * n) / s);
    const m = util.seededRand(r);
    i(e, terrainGen.generateJaggedAabbPoints(t, l, c, s, m));
}
function s(e) {
    this.decalBarn = e;
    this.I = false;
    this.Br = false;
    this.display = {
        ground: new PIXI.Graphics()
    };
    this.mapName = "";
    this.mapDef = {};
    this.factionMode = false;
    this.perkMode = false;
    this.turkeyMode = false;
    this.seed = 0;
    this.width = 0;
    this.height = 0;
    this.terrain = {};
    this.mapData = {
        places: [],
        objects: [],
        groundPatches: []
    };
    this.mapLoaded = false;
    this.mapTexture = null;
    this.Ve = new objectPool.Pool(Obstacle);
    this.nr = new objectPool.Pool(Building);
    this.lr = new objectPool.Pool(Structure);
    this.deadObstacleIds = [];
    this.deadCeilingIds = [];
    this.solvedPuzzleIds = [];
    this.lootDropSfxIds = [];
    this.terrain = null;
    this.cameraEmitter = null;
    this.ea = 0;
    this._r = false;
    this.U = false;
}

s.prototype = {
    n: function() {
        for (let e = this.nr.p(), t = 0; t < e.length; t++) {
            e[t].n();
        }
        this.mapTexture?.destroy(true);
        this.display.ground.destroy({
            children: true
        });
        this.cameraEmitter?.stop();
        this.cameraEmitter = null;
    },
    resize: function(e, t) {
        this.renderMap(e, t);
    },
    loadMap: function(e, t, r, a) {
        this.mapName = e.mapName;
        const i = MapDefs[this.mapName];
        if (!i) {
            throw new Error(
                `Failed loading mapDef ${this.mapName}`
            );
        }
        this.mapDef = util.cloneDeep(i);
        this.factionMode = !!this.mapDef.gameMode.factionMode;
        this.perkMode = !!this.mapDef.gameMode.perkMode;
        this.turkeyMode = !!this.mapDef.gameMode.turkeyMode;
        this.seed = e.seed;
        this.width = e.width;
        this.height = e.height;
        this.terrain = terrainGen.generateTerrain(
            this.width,
            this.height,
            e.shoreInset,
            e.grassInset,
            e.rivers,
            this.seed
        );
        this.mapData = {
            places: e.places,
            objects: e.objects,
            groundPatches: e.groundPatches
        };
        this.mapLoaded = true;
        const o = this.mapDef.biome.particles.camera;
        if (o) {
            const s = v2.normalize(v2.create(1, -1));
            this.cameraEmitter = a.addEmitter(o, {
                pos: v2.create(0, 0),
                dir: s,
                layer: 99999
            });
        }
        this.display.ground.clear();
        this.renderTerrain(
            this.display.ground,
            2 / t.ppu,
            r,
            false
        );
    },
    getMapDef: function() {
        if (!this.mapLoaded) {
            throw new Error("Map not loaded!");
        }
        return this.mapDef;
    },
    getMapTexture: function() {
        return this.mapTexture;
    },
    m: function(e, t, r, a, i, o, s, n, l, c) {
        this.I = true;
        this.Br = true;
        for (var p = this.Ve.p(), h = 0; h < p.length; h++) {
            const u = p[h];
            if (u.active) {
                u.m(e, this, r, a, i, t, s);
                u.render(n, c, t.layer);
            }
        }
        for (let y = this.nr.p(), f = 0; f < y.length; f++) {
            const _ = y[f];
            if (_.active) {
                _.m(e, this, a, i, o, t, s, n);
                _.render(n, c, t.layer);
            }
        }
        for (let b = this.lr.p(), x = 0; x < b.length; x++) {
            const S = b[x];
            if (S.active) {
                S.update(e, this, t, o);
                S.render(n, c, t.layer);
            }
        }
        if (this.cameraEmitter) {
            this.cameraEmitter.pos = v2.copy(n.pos);
            this.cameraEmitter.enabled = true;
            const v = t.yr() * 2.5;
            this.cameraEmitter.radius = math.min(v, 120);
            particles.EmitterDefs.falling_leaf;
            const k = this.cameraEmitter.radius;
            const z = (k * k) / 14400;
            this.cameraEmitter.rateMult = 1 / z;
            const I = t.layer == 0 ? 1 : 0;
            this.cameraEmitter.alpha = math.lerp(
                e * 6,
                this.cameraEmitter.alpha,
                I
            );
        }
        if (++this.ea % 180 == 0) {
            this._r = true;
            let T = 0;
            const M = mapHelpers.ct;
            for (let P = 0; P < l.length; P++) {
                const C = l[P];
                if (C.active && !C.fade && M(C, mapHelpers.nt)) {
                    T++;
                }
            }
            for (let A = 0; A < p.length; A++) {
                const O = p[A];
                if (O.active && !O.dead && M(O, mapHelpers.lt)) {
                    T++;
                }
            }
            if (T) {
                this.U = true;
            }
        }
    },
    renderTerrain: function(e, t, r, s) {
        const n = this.width;
        const l = this.height;
        const c = this.terrain;
        const m = {
            x: 0,
            y: 0
        };
        const p = {
            x: n,
            y: 0
        };
        const h = {
            x: 0,
            y: l
        };
        const d = {
            x: n,
            y: l
        };
        const u = this.mapDef.biome.colors;
        const g = this.mapData.groundPatches;
        e.beginFill(u.background);
        e.drawRect(-120, -120, n + 240, 120);
        e.drawRect(-120, l, n + 240, 120);
        e.drawRect(-120, -120, 120, l + 240);
        e.drawRect(n, -120, 120, l + 240);
        e.endFill();
        e.beginFill(u.beach);
        i(e, c.shore);
        e.beginHole();
        i(e, c.grass);
        // e.addHole();
        e.endHole();
        e.endFill();
        if (r) {
            e.beginFill(u.grass);
            i(e, c.grass);
            e.endFill();
        }
        for (let y = 0; y < g.length; y++) {
            const w = g[y];
            if (w.order == 0 && (!s || !!w.useAsMapShape)) {
                e.beginFill(w.color);
                o(e, w, this.seed);
                e.endFill();
            }
        }
        e.beginFill(u.riverbank);
        for (let _ = 0; _ < c.rivers.length; _++) {
            i(e, c.rivers[_].shorePoly);
        }
        e.endFill();
        e.beginFill(u.water);
        for (let b = 0; b < c.rivers.length; b++) {
            i(e, c.rivers[b].waterPoly);
        }
        e.endFill();
        e.beginFill(u.water);
        e.moveTo(h.x, h.y);
        e.lineTo(d.x, d.y);
        e.lineTo(p.x, p.y);
        e.lineTo(m.x, m.y);
        e.beginHole();
        i(e, c.shore);
        // e.addHole();
        e.endHole();
        e.closePath();
        e.endFill();
        const x = e;
        x.lineStyle(t, 0, 0.15);
        for (let S = 0; S <= n; S += GameConfig.map.gridSize) {
            a(
                x,
                {
                    x: S,
                    y: 0
                },
                {
                    x: S,
                    y: l
                }
            );
        }
        for (let v = 0; v <= l; v += GameConfig.map.gridSize) {
            a(
                x,
                {
                    x: 0,
                    y: v
                },
                {
                    x: n,
                    y: v
                }
            );
        }
        x.lineStyle(t, 0, 0);
        for (let k = 0; k < g.length; k++) {
            const z = g[k];
            if (z.order == 1 && (!s || !!z.useAsMapShape)) {
                e.beginFill(z.color);
                o(e, z, this.seed);
                e.endFill();
            }
        }
    },
    render: function(e) {
        const t = e.pointToScreen(v2.create(0, 0));
        const r = e.pointToScreen(v2.create(1, 1));
        const a = v2.sub(r, t);
        this.display.ground.position.set(t.x, t.y);
        this.display.ground.scale.set(a.x, a.y);
    },
    getMinimapRender: function(e) {
        const t = MapObjectDefs[e.type];
        const r =
            t.type == "building"
                ? 750 + (t.zIdx || 0)
                : t.img.zIdx || 0;
        let a = [];
        if (t.map.shapes !== undefined) {
            a = t.map.shapes;
        } else {
            let i = null;
            if (
                (i =
                    t.type == "obstacle"
                        ? t.collision
                        : t.ceiling.zoomRegions.length > 0 &&
                            t.ceiling.zoomRegions[0].zoomIn
                            ? t.ceiling.zoomRegions[0].zoomIn
                            : mapHelpers.getBoundingCollider(e.type))
            ) {
                a.push({
                    collider: collider.copy(i),
                    scale: t.map.scale || 1,
                    color: t.map.color
                });
            }
        }
        return {
            obj: e,
            zIdx: r,
            shapes: a
        };
    },
    renderMap: function(e, t) {
        if (this.mapLoaded) {
            const r = new PIXI.Container();
            const i = new PIXI.Container();
            const o = this.mapDef.biome.colors;
            const s = this.mapData.places;
            const l = this.mapData.objects;
            let m = device.screenHeight;
            if (device.mobile) {
                if (!device.isLandscape) {
                    m = device.screenWidth;
                }
                m *= math.min(device.pixelRatio, 2);
            }
            const p = this.height / m;
            const h = new PIXI.Graphics();
            h.beginFill(o.grass);
            h.drawRect(0, 0, this.width, this.height);
            h.endFill();
            this.renderTerrain(h, p, t, true);
            const u = {
                x: 0,
                y: 0
            };
            const g = {
                x: this.width,
                y: 0
            };
            const f = {
                x: 0,
                y: this.height
            };
            const _ = {
                x: this.width,
                y: this.height
            };
            h.lineStyle(p * 2, 0, 1);
            a(h, u, f);
            a(h, f, _);
            a(h, _, g);
            a(h, g, u);
            h.position.y = this.height;
            h.scale.y = -1;
            r.addChild(h);
            const b = [];
            for (let x = 0; x < l.length; x++) {
                const S = l[x];
                b.push(this.getMinimapRender(S));
            }
            b.sort((e, t) => {
                return e.zIdx - t.zIdx;
            });
            const v = new PIXI.Graphics();
            for (let k = 0; k < b.length; k++) {
                for (
                    let z = b[k], I = z.obj, T = 0;
                    T < z.shapes.length;
                    T++
                ) {
                    const M = z.shapes[T];
                    const P = collider.transform(
                        M.collider,
                        I.pos,
                        math.oriToRad(I.ori),
                        I.scale
                    );
                    const C = M.scale !== undefined ? M.scale : 1;
                    v.beginFill(M.color, 1);
                    switch (P.type) {
                    case collider.Type.Circle:
                        v.drawCircle(
                            P.pos.x,
                            this.height - P.pos.y,
                            P.rad * C
                        );
                        break;
                    case collider.Type.Aabb:
                        var A = v2.mul(v2.sub(P.max, P.min), 0.5);
                        var O = v2.add(P.min, A);
                        A = v2.mul(A, C);
                        v.drawRect(
                            O.x - A.x,
                            this.height - O.y - A.y,
                            A.x * 2,
                            A.y * 2
                        );
                    }
                    v.endFill();
                }
            }
            r.addChild(v);
            const D = new PIXI.Container();
            for (let E = 0; E < s.length; E++) {
                const B = s[E];
                const R = new PIXI.TextStyle({
                    fontFamily: "Arial",
                    fontSize: device.mobile ? 20 : 22,
                    fontWeight: "bold",
                    fill: ["#ffffff"],
                    stroke: "#000000",
                    strokeThickness: 1,
                    dropShadow: true,
                    dropShadowColor: "#000000",
                    dropShadowBlur: 1,
                    dropShadowAngle: Math.PI / 3,
                    dropShadowDistance: 1,
                    wordWrap: false,
                    align: "center"
                });
                const L = new PIXI.Text(B.name, R);
                L.anchor.set(0.5, 0.5);
                L.x = (B.pos.x * this.height) / p;
                L.y = (B.pos.y * this.height) / p;
                L.alpha = 0.75;
                D.addChild(L);
            }
            i.addChild(D);
            if (this.mapTexture) {
                this.mapTexture.resize(m, m);
            } else {
                this.mapTexture = PIXI.RenderTexture.create(
                    m,
                    m,
                    PIXI.SCALE_MODES.LINEAR,
                    1
                );
            }
            r.scale = new PIXI.Point(m / this.height, m / this.height);
            e.render(r, this.mapTexture, true);
            e.render(i, this.mapTexture, false);
            r.destroy({
                children: true,
                texture: true,
                baseTexture: true
            });
            i.destroy({
                children: true,
                texture: true,
                baseTexture: true
            });
        }
    },
    getGroundSurface: function(e, t) {
        const r = this;
        const a = function(e, t) {
            t = t || {};
            if (e == "water") {
                const a = r.getMapDef().biome.colors;
                t.waterColor =
                    t.waterColor !== undefined
                        ? t.waterColor
                        : a.water;
                t.rippleColor =
                    t.rippleColor !== undefined
                        ? t.rippleColor
                        : a.waterRipple;
            }
            return {
                type: e,
                data: t
            };
        };
        for (
            let i = this.decalBarn._.p(), o = 0;
            o < i.length;
            o++
        ) {
            const s = i[o];
            if (
                s.active &&
                s.surface &&
                util.sameLayer(s.layer, t) &&
                collider.intersectCircle(s.collider, e, 0.0001)
            ) {
                return a(s.surface.type, s.surface.data);
            }
        }
        let n = null;
        let m = 0;
        const p = t & 2;
        for (let d = this.nr.p(), u = 0; u < d.length; u++) {
            const g = d[u];
            if (
                g.active &&
                g.zIdx >= m &&
                (g.layer == t || !!p) &&
                (g.layer != 1 || !p)
            ) {
                for (let y = 0; y < g.surfaces.length; y++) {
                    for (
                        let f = g.surfaces[y], _ = 0;
                        _ < f.colliders.length;
                        _++
                    ) {
                        const b = collider.intersectCircle(
                            f.colliders[_],
                            e,
                            0.0001
                        );
                        if (b) {
                            m = g.zIdx;
                            n = f;
                            break;
                        }
                    }
                }
            }
        }
        if (n) {
            return a(n.type, n.data);
        }
        let x = false;
        if (t != 1) {
            for (
                let S = this.terrain.rivers, v = 0;
                v < S.length;
                v++
            ) {
                const k = S[v];
                if (
                    coldet.testPointAabb(e, k.aabb.min, k.aabb.max) &&
                    math.pointInsidePolygon(e, k.shorePoly) &&
                    ((x = true),
                    math.pointInsidePolygon(e, k.waterPoly))
                ) {
                    return a("water", {
                        river: k
                    });
                }
            }
        }
        return a(
            math.pointInsidePolygon(e, this.terrain.grass)
                ? x
                    ? this.mapDef.biome.sound.riverShore
                    : "grass"
                : math.pointInsidePolygon(e, this.terrain.shore)
                    ? "sand"
                    : "water"
        );
    },
    isInOcean: function(e) {
        return !math.pointInsidePolygon(e, this.terrain.shore);
    },
    distanceToShore: function(e) {
        return math.distToPolygon(e, this.terrain.shore);
    },
    insideStructureStairs: function(e) {
        for (let t = this.lr.p(), r = 0; r < t.length; r++) {
            const a = t[r];
            if (a.active && a.insideStairs(e)) {
                return true;
            }
        }
        return false;
    },
    getBuildingById: function(e) {
        for (let t = this.nr.p(), r = 0; r < t.length; r++) {
            const a = t[r];
            if (a.active && a.__id == e) {
                return a;
            }
        }
        return null;
    },
    insideStructureMask: function(e) {
        for (let t = this.lr.p(), r = 0; r < t.length; r++) {
            const a = t[r];
            if (a.active && a.insideMask(e)) {
                return true;
            }
        }
        return false;
    },
    insideBuildingCeiling: function(e, t) {
        for (let r = this.nr.p(), a = 0; a < r.length; a++) {
            const i = r[a];
            if (
                i.active &&
                (!t ||
                    (i.ceiling.visionTicker > 0 &&
                        !i.ceilingDead)) &&
                i.isInsideCeiling(e)
            ) {
                return true;
            }
        }
        return false;
    }
};

export default {
    Bt: s
};

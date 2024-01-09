import { MapObjectDefs } from "./defs/mapObjectDefs";
import { type StructureDef, type BuildingDef, type ObstacleDef } from "./defs/mapObjectsTyping";
import { type MapDef, MapDefs } from "./defs/maps/maps";
import { type Game } from "./game";
import { GameConfig } from "./gameConfig";
import { MapMsg, type MapRiver } from "./net/mapMsg";
import { MsgStream } from "./net/net";
import { Building } from "./objects/building";
import { Decal } from "./objects/decal";
import { ObjectType } from "./objects/gameObject";
import { getLootTable } from "./objects/loot";
import { Obstacle } from "./objects/obstacle";
import { Structure } from "./objects/structure";
import { coldet, type AABB } from "./utils/coldet";
import { collider } from "./utils/collider";
import { mapHelpers } from "./utils/mapHelpers";
import { math } from "./utils/math";
import { type River } from "./utils/river";
import { generateTerrain } from "./utils/terrainGen";
import { util } from "./utils/util";
import { type Vec2, v2 } from "./utils/v2";

export class GameMap {
    game: Game;

    width: number;
    height: number;

    msg = new MapMsg();
    mapStream = new MsgStream(new ArrayBuffer(65536));
    seed = util.randomInt(0, 2 ** 31);

    bounds: AABB;

    objectCount: Record<string, number> = {};

    beachAABBs: AABB[];

    grassInset: number;
    shoreInset: number;

    terrain: ReturnType<typeof generateTerrain>;

    mapDef: MapDef;

    riverDescs: MapRiver[] = [
        {
            width: 8,
            looped: false,
            points: [
                { x: 85.00129701686122, y: 719.4953536278324 },
                { x: 104.62659647516594, y: 702.5575951781491 },
                { x: 120.59559014267185, y: 682.1354085603112 },
                { x: 115.50176241702907, y: 656.1037613488976 },
                { x: 122.68937209124896, y: 630.5721217669948 },
                { x: 126.7363088426032, y: 604.9311055161364 },
                { x: 137.53334859235522, y: 581.3213702601663 },
                { x: 130.92387273975737, y: 556.1803616388189 },
                { x: 123.14250400549325, y: 533.6643930724041 },
                { x: 127.51757076371405, y: 511.9765621423667 },
                { x: 126.62693217364767, y: 487.5074387731746 },
                { x: 118.59555962462807, y: 464.4289616235599 },
                { x: 121.59560540169375, y: 440.17859159227896 },
                { x: 123.0018768596933, y: 416.6313572899977 },
                { x: 121.23622491798275, y: 393.09974822613873 },
                { x: 120.95497062638285, y: 369.4587624933242 },
                { x: 125.03315785458152, y: 346.17715724422067 },
                { x: 140.72089723048754, y: 325.94247348744943 },
                { x: 163.61187151903562, y: 314.4891737239643 },
                { x: 174.4245365072099, y: 291.082566567483 },
                { x: 195.22172884718088, y: 275.8479591058213 },
                { x: 209.44069581139848, y: 253.26948958571757 },
                { x: 220.3783627069505, y: 228.92536812390327 },
                { x: 213.9095140001526, y: 203.11247425040054 },
                { x: 207.56566720073243, y: 177.25270466163118 },
                { x: 211.76885633630883, y: 152.3616998550393 },
                { x: 215.98767071030747, y: 129.53322652018005 },
                { x: 230.65976958876936, y: 111.43920042725262 },
                { x: 245.84750133516442, y: 91.14201571679256 },
                { x: 238.9880216678111, y: 66.51663996337835 },
                { x: 249.51943236438544, y: 43.20378423743038 },
                { x: 265.894682230869, y: 24.60975051499199 },
                { x: 271.59789425497826, y: 0.5000076295109483 }
            ]
        },
        {
            width: 4,
            looped: false,
            points: [
                { x: 694.6981002517739, y: 719.4953536278324 },
                { x: 675.4790569924468, y: 701.2294499122606 },
                { x: 662.1507286182956, y: 678.3228503852903 },
                { x: 639.5722590981918, y: 664.7288929579614 },
                { x: 619.8532082093537, y: 647.2598764019226 },
                { x: 612.5562218661784, y: 622.103242542153 },
                { x: 607.6030212863355, y: 596.3997253376059 },
                { x: 603.9779659723812, y: 570.2743266956588 },
                { x: 606.7905088883803, y: 544.0708018616007 },
                { x: 610.8686961165789, y: 518.0860303654536 },
                { x: 612.8531013962005, y: 491.86688029297324 },
                { x: 597.4778667887389, y: 469.7259174486915 },
                { x: 593.2278019378958, y: 443.10051117723356 },
                { x: 578.4307011520561, y: 419.7407797360189 },
                { x: 569.1024338139925, y: 398.14670023651485 },
                { x: 546.5864652475776, y: 387.0684061951629 },
                { x: 529.2737010757611, y: 363.8180514229038 },
                { x: 515.6797436484321, y: 342.83335622186615 },
                { x: 508.9608911268788, y: 318.7548638132296 },
                { x: 500.74201571679254, y: 295.3795071335927 },
                { x: 489.1637140459297, y: 273.4729228656443 },
                { x: 466.3196154726482, y: 259.73833829251544 },
                { x: 446.47556267643245, y: 241.95681696803234 },
                { x: 446.803692683299, y: 214.86265354390784 },
                { x: 436.444159609369, y: 189.8466468299382 },
                { x: 426.9283894102388, y: 165.15877012283514 },
                { x: 418.78764019226367, y: 139.9865110246433 },
                { x: 419.1626459143969, y: 112.84547188525215 },
                { x: 431.42845807583734, y: 88.62635233081559 },
                { x: 422.9283283741512, y: 62.8290836957351 },
                { x: 400.05297932402533, y: 48.17261005569543 },
                { x: 393.6153810940719, y: 23.203479056992446 },
                { x: 381.38081940947586, y: 0.5000076295109483 }
            ]
        }
    ];

    constructor(game: Game) {
        this.game = game;

        const mapDef = this.mapDef = MapDefs[game.config.map];
        if (mapDef === undefined) {
            throw new Error(`Invalid map name: ${game.config.map}`);
        }

        this.mapDef = mapDef;

        const mapConfig = mapDef.mapGen.map;
        this.width = (mapConfig.baseWidth * mapConfig.scale.small) + mapConfig.extension;
        this.height = (mapConfig.baseHeight * mapConfig.scale.small) + mapConfig.extension;

        this.bounds = collider.createAabb(v2.create(0, 0), v2.create(this.width, this.height));

        this.msg.mapName = game.config.map;
        this.msg.seed = this.seed;
        this.msg.width = this.width;
        this.msg.height = this.height;
        this.msg.rivers = this.riverDescs;
        this.grassInset = this.msg.grassInset = mapConfig.grassInset;
        this.shoreInset = this.msg.shoreInset = mapConfig.shoreInset;

        const riverWeights: number[] = [];
        const weightedWidths: number[][] = [];

        for (const weightedRiver of mapConfig.rivers.weights) {
            riverWeights.push(weightedRiver.weight);
            weightedWidths.push(weightedRiver.widths);
        }

        this.terrain = generateTerrain(
            this.width,
            this.height,
            this.shoreInset,
            this.grassInset,
            this.riverDescs,
            this.seed
        );

        const beachPadding = this.shoreInset + this.grassInset;

        this.beachAABBs = [
            collider.createAabb(
                v2.create(this.shoreInset, this.height - beachPadding),
                v2.create(this.width - beachPadding, this.height - this.shoreInset)
            ),
            collider.createAabb(
                v2.create(this.shoreInset, this.shoreInset),
                v2.create(beachPadding, this.height - beachPadding)
            ),
            collider.createAabb(
                v2.create(this.shoreInset, this.shoreInset),
                v2.create(this.width - beachPadding, beachPadding)
            ),
            collider.createAabb(
                v2.create(this.width - beachPadding, this.shoreInset),
                v2.create(this.width - this.shoreInset, this.height - this.shoreInset)
            )
        ];

        for (const customSpawnRule of mapDef.mapGen.customSpawnRules.locationSpawns) {
            const pos = v2.add(
                util.randomPointInCircle(customSpawnRule.rad),
                v2.mulElems(customSpawnRule.pos,
                    v2.create(this.width, this.height)));

            this.genAuto(customSpawnRule.type, 1, pos);
        }

        for (const fixedSpawns of mapDef.mapGen.fixedSpawns) {
            for (const type in fixedSpawns) {
                let count = fixedSpawns[type];
                if (typeof count !== "number") {
                    if ("small" in count) {
                        count = count.small;
                    } else {
                        count = Math.random() < count.odds ? 1 : 0;
                    }
                }
                if ((this.objectCount[type] ?? 0) < count) {
                    this.genAuto(type, count);
                }
            }
        }

        for (const randomSpawns of mapDef.mapGen.randomSpawns) {
            const spawns = [...randomSpawns.spawns];

            for (let i = 0; i < randomSpawns.choose; i++) {
                const idx = util.randomInt(0, spawns.length - 1);
                const spawn = spawns.splice(idx, 1)[0];
                this.genAuto(spawn);
            }
        }

        for (const densitySpawns of mapDef.mapGen.densitySpawns) {
            for (const type in densitySpawns) {
                const count = densitySpawns[type];
                this.genAuto(type, count);
            }
        }

        for (const place of mapDef.mapGen.places) {
            this.msg.places.push(place);
        }

        this.mapStream.serializeMsg(this.msg);
    }

    genAuto(type: string, count = 1, pos?: Vec2, ori?: number, scale?: number): void {
        const def = MapObjectDefs[type];

        for (let i = 0; i < count; i++) {
            const finalPos = pos ?? this.getRandomPositionFor(type);
            switch (def.type) {
            case "obstacle":
                this.genObstacle(
                    type,
                    finalPos,
                    0,
                    ori ?? 0,
                    scale ?? util.random(def.scale.createMax, def.scale.createMin)
                );

                break;
            case "building":
                this.genBuilding(type, finalPos);
                break;
            case "structure":
                this.genStructure(type, finalPos, 0, ori ?? 0);
                break;
            case "loot_spawner":
                for (const tier of def.loot) {
                    const items = getLootTable(this.game.config.map, tier.tier);

                    for (const item of items) {
                        this.game.addLoot(item.name, finalPos, 0, item.count);
                    }
                }
                break;
            }
        }
    }

    genObstacle(type: string, pos: Vec2, layer: number, ori: number, scale = 1, buildingId?: number, puzzlePiece?: string): Obstacle {
        const obstacle = new Obstacle(
            this.game,
            pos,
            type,
            layer,
            ori,
            scale,
            buildingId,
            puzzlePiece
        );
        this.game.grid.addObject(obstacle);

        const def = MapObjectDefs[type] as ObstacleDef;
        if (def.map?.display && layer === 0) this.msg.objects.push(obstacle);
        this.objectCount[type]++;
        return obstacle;
    }

    genBuilding(type: string, pos?: Vec2, layer = 0, ori?: number, parentStructure?: Structure): Building {
        ori = ori ?? util.randomInt(0, 3);

        pos = pos ?? this.getRandomPositionFor(type, ori);

        const building = new Building(this.game, type, pos, ori, layer, parentStructure);
        this.game.grid.addObject(building);

        const def = MapObjectDefs[type] as BuildingDef;

        if (def.map?.display && layer === 0) this.msg.objects.push(building);

        for (const mapObject of def.mapObjects ?? []) {
            let partType = mapObject.type;

            if (typeof partType !== "string") {
                partType = partType();
            }
            if (!partType) continue;

            const part = MapObjectDefs[partType];

            let partOrientation: number;
            if (mapObject.inheritOri === false) partOrientation = mapObject.ori;
            else partOrientation = (mapObject.ori + ori) % 4;

            const partPosition = math.addAdjust(pos, mapObject.pos, ori);

            switch (part.type) {
            case "structure":
                building.childObjects.push(
                    this.genStructure(partType, partPosition, layer, partOrientation)
                );
                break;
            case "building":
                building.childObjects.push(
                    this.genBuilding(partType, partPosition, layer, partOrientation)
                );
                break;
            case "obstacle":
                building.childObjects.push(this.genObstacle(
                    partType,
                    partPosition,
                    layer,
                    partOrientation,
                    mapObject.scale,
                    building.id,
                    mapObject.puzzlePiece
                ));
                break;
            case "decal": {
                const decal = new Decal(
                    this.game,
                    partType,
                    partPosition,
                    layer,
                    partOrientation,
                    mapObject.scale
                );
                building.childObjects.push(decal);
                this.game.grid.addObject(decal);
                break;
            }
            case "loot_spawner": {
                for (const tier of part.loot) {
                    const items = getLootTable(this.game.config.map, tier.tier);

                    for (const item of items) {
                        this.game.addLoot(item.name, partPosition, layer, item.count);
                    }
                }
            }
            }
        }

        for (const patch of def.mapGroundPatches ?? []) {
            this.msg.groundPatches.push({
                min: math.addAdjust(pos, patch.bound.min, ori),
                max: math.addAdjust(pos, patch.bound.max, ori),
                color: patch.color,
                roughness: patch.roughness ?? 0,
                offsetDist: patch.offsetDist ?? 0,
                order: patch.order ?? 0,
                useAsMapShape: patch.useAsMapShape ?? true
            });
        }

        this.objectCount[type]++;
        return building;
    }

    genStructure(type: string, pos: Vec2, layer: number, ori: number): Structure {
        const def = MapObjectDefs[type] as StructureDef;

        const structure = new Structure(this.game, type, pos, layer, ori);
        layer = 0;
        for (const layerDef of def.layers) {
            const building = this.genBuilding(
                layerDef.type,
                math.addAdjust(pos, layerDef.pos, ori),
                layer,
                (layerDef.ori + ori) % 4,
                structure
            );
            layer++;
            structure.layerObjIds.push(building.id);
        }

        this.game.grid.addObject(structure);
        this.objectCount[type]++;
        return structure;
    }

    getRandomPositionFor(type: string, ori = 0, scale = 1): Vec2 {
        const colliders = mapHelpers.getColliders(type);

        const rot = math.oriToRad(ori);

        const bounds = collider.toAabb(mapHelpers.getBoundingCollider(type));

        const width = bounds.max.x - bounds.min.x;
        const height = bounds.max.y - bounds.min.y;

        const getPos = () => {
            return {
                x: util.random(this.msg.shoreInset + width, this.width - this.msg.shoreInset - width),
                y: util.random(this.msg.shoreInset + height, this.height - this.msg.shoreInset - height)
            };
        };

        let pos = getPos();

        let attempts = 0;
        let collided = true;

        while (attempts++ < 200 && collided) {
            collided = false;
            pos = getPos();

            for (const coll of colliders) {
                const newCollider = collider.transform(coll, pos, rot, scale);
                const objs = this.game.grid.intersectCollider(newCollider);

                for (const obj of objs) {
                    if (obj.layer !== 0) continue;
                    if (obj instanceof Obstacle && coldet.test(obj.collider, newCollider)) {
                        collided = true;
                        break;
                    }

                    if (obj instanceof Building || obj instanceof Structure) {
                        for (const bound of obj.mapObstacleBounds) {
                            if (coldet.test(bound, newCollider)) {
                                collided = true;
                                break;
                            }
                        }
                        if (collided) break;
                    }
                }
            }
        }

        return pos;
    }

    getRandomSpawnPosition(): Vec2 {
        const getPos = () => {
            return {
                x: util.random(this.msg.shoreInset, this.width - this.msg.shoreInset),
                y: util.random(this.msg.shoreInset, this.height - this.msg.shoreInset)
            };
        };

        let attempts = 0;
        let collided = true;

        const circle = collider.createCircle(getPos(), GameConfig.player.radius);

        while (attempts++ < 200 && collided) {
            collided = false;
            v2.set(circle.pos, getPos());

            const objs = this.game.grid.intersectCollider(circle);

            for (const obj of objs) {
                if (obj.layer !== 0) continue;
                if (obj instanceof Obstacle && coldet.test(obj.collider, circle)) {
                    collided = true;
                    break;
                }

                if (obj instanceof Building || obj instanceof Structure) {
                    for (const bound of obj.mapObstacleBounds) {
                        if (coldet.test(bound, circle)) {
                            collided = true;
                            break;
                        }
                    }
                    if (collided) break;
                }
            }
        }

        return circle.pos;
    }

    clampToMapBounds(pos: Vec2): Vec2 {
        return coldet.clampPosToAabb(pos, this.bounds);
    }

    getGroundSurface(pos: Vec2, layer: number) {
        const groundSurface = (type: string, river?: River) => {
            return { type, river };
        };

        const objs = this.game.grid.intersectPos(pos);

        // Check decals
        const decals = objs.filter(obj => obj.__type === ObjectType.Decal) as Decal[];
        for (let i = 0; i < decals.length; i++) {
            const decal = decals[i];
            if (!decal.surface) {
                continue;
            }

            if (util.sameLayer(decal.layer, layer) && collider.intersectCircle(decal.collider!, pos, 0.0001)) {
                return groundSurface(decal.surface);
            }
        }

        // Check buildings
        let surface = null;
        let zIdx = 0;
        const onStairs = layer & 0x2;

        const buildings = objs.filter(obj => obj.__type === ObjectType.Building) as Building[];

        for (let i = 0; i < buildings.length; i++) {
            const building = buildings[i];
            if (building.zIdx < zIdx) {
                continue;
            }
            // Prioritize layer0 building surfaces when on stairs
            // eslint-disable-next-line no-mixed-operators
            if (building.layer !== layer && !onStairs || building.layer === 1 && onStairs) {
                continue;
            }
            for (let j = 0; j < building.surfaces.length; j++) {
                const s = building.surfaces[j];
                for (let k = 0; k < s.colliders.length; k++) {
                    const res = collider.intersectCircle(s.colliders[k], pos, 0.0001);
                    if (res) {
                        zIdx = building.zIdx;
                        surface = s;
                        break;
                    }
                }
            }
        }

        if (surface) {
            return groundSurface(surface.type);
        }

        // Check rivers
        let onRiverShore = false;
        if (layer !== 1) {
            const { rivers } = this.terrain;
            for (let i = 0; i < rivers.length; i++) {
                const river = rivers[i];
                if (coldet.testPointAabb(pos, river.aabb.min, river.aabb.max) && math.pointInsidePolygon(pos, river.shorePoly)) {
                    onRiverShore = true;
                    if (math.pointInsidePolygon(pos, river.waterPoly)) {
                        return groundSurface("water", river);
                    }
                }
            }
        }

        // Check terrain
        if (math.pointInsidePolygon(pos, this.terrain.grass)) {
            // Use a stone step sound if we're in the main-spring def
            return groundSurface(onRiverShore ? this.mapDef.biome.sound.riverShore : "grass");
        } if (math.pointInsidePolygon(pos, this.terrain.shore)) {
            return groundSurface("sand");
        }
        return groundSurface("water");
    }
}

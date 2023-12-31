import { MapObjectDefs } from "./defs/mapObjectDefs";
import { type StructureDef, type BuildingDef, type ObstacleDef } from "./defs/mapObjectsTyping";
import { ModeDefinitions } from "./defs/modes/modes";
import { type Game } from "./game";
import { MapMsg } from "./net/mapMsg";
import { MsgStream } from "./net/net";
import { Building } from "./objects/building";
import { Obstacle } from "./objects/obstacle";
import { Structure } from "./objects/structure";
import { type Collider, coldet, type AABB } from "./utils/coldet";
import { collider } from "./utils/collider";
import { math } from "./utils/math";
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

    constructor(game: Game) {
        this.game = game;

        const modeDef = ModeDefinitions[game.config.mode];
        if (modeDef === undefined) {
            throw new Error(`Invalid map name: ${game.config.mode}`);
        }
        const mapDef = modeDef.mapGen.map;
        this.width = (mapDef.baseWidth * mapDef.scale.small) + mapDef.extension;
        this.height = (mapDef.baseHeight * mapDef.scale.small) + mapDef.extension;

        this.bounds = collider.createAabb(v2.create(0, 0), v2.create(this.width, this.height));

        this.msg.mapName = game.config.mode;
        this.msg.seed = this.seed;
        this.msg.width = this.width;
        this.msg.height = this.height;
        this.msg.grassInset = mapDef.grassInset;
        this.msg.shoreInset = mapDef.shoreInset;

        for (const customSpawnRule of modeDef.mapGen.customSpawnRules.locationSpawns) {
            const pos = v2.add(
                util.randomPointInCircle(customSpawnRule.rad),
                v2.mulElems(customSpawnRule.pos,
                    v2.create(this.width, this.height)));

            this.genAuto(customSpawnRule.type, 1, pos);
        }

        for (const fixedSpawns of modeDef.mapGen.fixedSpawns) {
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

        for (const randomSpawns of modeDef.mapGen.randomSpawns) {
            const spawns = [...randomSpawns.spawns];

            for (let i = 0; i < randomSpawns.choose; i++) {
                const idx = util.randomInt(0, spawns.length - 1);
                const spawn = spawns.splice(idx, 1)[0];
                this.genAuto(spawn);
            }
        }

        for (const densitySpawns of modeDef.mapGen.densitySpawns) {
            for (const type in densitySpawns) {
                const count = densitySpawns[type];
                this.genAuto(type, count);
            }
        }

        for (const place of modeDef.mapGen.places) {
            this.msg.places.push(place);
        }

        this.mapStream.serializeMsg(this.msg);
    }

    genAuto(type: string, count = 1, pos?: Vec2, ori?: number, scale?: number): void {
        const def = MapObjectDefs[type];
        switch (def.type) {
        case "obstacle":
            for (let i = 0; i < count; i++) {
                this.genObstacle(
                    type,
                    pos ?? this.getRandomPositionFor(def.collision),
                    0,
                    ori ?? 0,
                    scale ?? util.random(def.scale.createMax, def.scale.createMin)
                );
            }
            break;
        case "building":
            for (let i = 0; i < count; i++) {
                this.genBuilding(type, pos ?? this.getRandomPositionFor(collider.createCircle(v2.create(0, 0), 10)), 0);
            }
            break;
        case "structure":
            for (let i = 0; i < count; i++) {
                this.genStructure(type, pos ?? this.getRandomPositionFor(collider.createCircle(v2.create(0, 0), 10)), 0, 0);
            }
        }
    }

    genObstacle(type: string, pos: Vec2, layer: number, ori: number, scale = 1): Obstacle {
        const obstacle = new Obstacle(
            this.game,
            pos,
            type,
            layer,
            ori,
            scale
        );
        this.game.grid.addObject(obstacle);

        const def = MapObjectDefs[type] as ObstacleDef;
        if (def.map?.display) this.msg.objects.push(obstacle);
        this.objectCount[type]++;
        return obstacle;
    }

    genBuilding(type: string, pos: Vec2, ori = 0, layer = 0): Building {
        const building = new Building(this.game, type, pos, ori, layer);
        const def = MapObjectDefs[type] as BuildingDef;

        this.game.grid.addObject(building);
        if (def.map?.display) this.msg.objects.push(building);

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
                this.genStructure(partType, partPosition, layer, partOrientation);
                break;
            case "building":
                this.genBuilding(partType, partPosition, partOrientation, layer);
                break;
            case "obstacle":
                this.genObstacle(
                    partType,
                    partPosition,
                    layer,
                    partOrientation,
                    mapObject.scale
                    // part,
                    // building,
                    // mapObject.puzzlePiece
                );
                break;
            }
        }

        for (const patch of def.mapGroundPatches ?? []) {
            this.msg.groundPatches.push({
                min: math.addAdjust(pos, patch.bound.min, ori),
                max: math.addAdjust(pos, patch.bound.max, ori),
                color: patch.color,
                roughness: patch.roughness,
                offsetDist: patch.offsetDist,
                order: patch.order ?? 0,
                useAsMapShape: patch.useAsMapShape ?? true
            });
        }

        this.objectCount[type]++;
        return building;
    }

    genStructure(type: string, pos: Vec2, layer: number, ori: number): Structure {
        const layerObjIds: number[] = [];

        const def = MapObjectDefs[type] as StructureDef;

        layer = 0;
        for (const layerDef of def.layers) {
            const building = this.genBuilding(
                layerDef.type,
                math.addAdjust(pos, layerDef.pos, ori),
                (layerDef.ori + ori) % 4,
                layer);
            layer++;
            layerObjIds.push(building.id);
        }

        const structure = new Structure(this.game, type, pos, layer, ori, layerObjIds);
        this.game.grid.addObject(structure);
        this.objectCount[type]++;
        return structure;
    }

    getRandomPositionFor(coll: Collider, ori = 0, scale = 1): Vec2 {
        const getPos = () => {
            return {
                x: util.random(this.msg.shoreInset, this.width - this.msg.shoreInset),
                y: util.random(this.msg.shoreInset, this.height - this.msg.shoreInset)
            };
        };

        let pos = getPos();

        let attempts = 0;
        let collided = true;

        while (attempts++ < 200 && collided) {
            collided = false;

            const newCollider = collider.transform(coll, pos, ori, scale);

            const objs = this.game.grid.intersectCollider(newCollider);
            for (const obj of objs) {
                if (collider.intersect(obj.bounds, coll)) {
                    collided = true;
                    break;
                }
            }
            pos = getPos();
        }

        return pos;
    }

    clampToMapBounds(pos: Vec2): Vec2 {
        return coldet.clampPosToAabb(pos, this.bounds);
    }

    isOnWater(pos: Vec2, layer: number): boolean {
        return false;
    }
}

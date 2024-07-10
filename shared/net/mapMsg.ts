import type { MapDef } from "../defs/mapDefs";
import type { MapRiverData } from "../utils/terrainGen";
import type { Vec2 } from "../utils/v2";
import { type AbstractMsg, type BitStream, Constants } from "./net";

function serializeMapRiver(s: BitStream, data: MapRiverData) {
    s.writeFloat32(data.width);
    s.writeUint8(data.looped as unknown as number);
    s.writeUint8(data.points.length);

    for (const point of data.points) {
        s.writeVec(point, 0, 0, 1024, 1024, 16);
    }
}

function deserializeMapRiver(s: BitStream, data: MapRiverData) {
    data.width = s.readFloat32();
    data.looped = s.readUint8() as unknown as boolean;
    data.points = [];

    const count = s.readUint8();

    for (let i = 0; i < count; i++) {
        const pos = s.readVec(0, 0, 1024, 1024, 16);
        data.points.push(pos);
    }
}

type Place = MapDef["mapGen"]["places"][number];

function serializeMapPlace(s: BitStream, place: Place) {
    s.writeString(place.name);
    s.writeVec(place.pos, 0, 0, 1024, 1024, 16);
}

function deserializeMapPlaces(s: BitStream, place: Place) {
    place.name = s.readString();
    place.pos = s.readVec(0, 0, 1024, 1024, 16);
}

export interface GroundPatch {
    color: number;
    roughness: number;
    offsetDist: number;
    order?: number;
    useAsMapShape?: boolean;
    min: Vec2;
    max: Vec2;
}

function serializeMapGroundPatch(s: BitStream, patch: GroundPatch) {
    s.writeVec(patch.min, 0, 0, 1024, 1024, 16);
    s.writeVec(patch.max, 0, 0, 1024, 1024, 16);
    s.writeUint32(patch.color);
    s.writeFloat32(patch.roughness);
    s.writeFloat32(patch.offsetDist);
    s.writeBits(patch.order!, 7);
    s.writeBoolean(patch.useAsMapShape!);
}

function deserializeMapGroundPatch(s: BitStream, patch: GroundPatch) {
    patch.min = s.readVec(0, 0, 1024, 1024, 16);
    patch.max = s.readVec(0, 0, 1024, 1024, 16);
    patch.color = s.readUint32();
    patch.roughness = s.readFloat32();
    patch.offsetDist = s.readFloat32();
    patch.order = s.readBits(7);
    patch.useAsMapShape = s.readBoolean();
}

interface MapObj {
    pos: Vec2;
    scale: number;
    type: string;
    ori: number;
}

function serializeMapObj(s: BitStream, obj: MapObj) {
    s.writeVec(obj.pos, 0, 0, 1024, 1024, 16);
    s.writeFloat(obj.scale, Constants.MapObjectMinScale, Constants.MapObjectMaxScale, 8);
    s.writeMapType(obj.type);
    s.writeBits(obj.ori, 2);
    s.writeBits(0, 2); // Padding
}

function deserializeMapObj(s: BitStream, data: MapObj) {
    data.pos = s.readVec(0, 0, 1024, 1024, 16);
    data.scale = s.readFloat(Constants.MapObjectMinScale, Constants.MapObjectMaxScale, 8);
    data.type = s.readMapType();
    data.ori = s.readBits(2);
    s.readBits(2);
}

export class MapMsg implements AbstractMsg {
    mapName = "";
    seed = 0;
    width = 0;
    height = 0;
    shoreInset = 0;
    grassInset = 0;
    rivers: MapRiverData[] = [];
    places: Place[] = [];
    objects: MapObj[] = [];
    groundPatches: GroundPatch[] = [];

    serialize(s: BitStream) {
        s.writeString(this.mapName, Constants.MapNameMaxLen);
        s.writeUint32(this.seed);
        s.writeUint16(this.width);
        s.writeUint16(this.height);
        s.writeUint16(this.shoreInset);
        s.writeUint16(this.grassInset);

        // Rivers
        s.writeUint8(this.rivers.length);
        for (let i = 0; i < this.rivers.length; i++) {
            serializeMapRiver(s, this.rivers[i]);
        }

        // Places
        s.writeUint8(this.places.length);
        for (let i = 0; i < this.places.length; i++) {
            serializeMapPlace(s, this.places[i]);
        }

        // Objects
        s.writeUint16(this.objects.length);
        for (let i = 0; i < this.objects.length; i++) {
            serializeMapObj(s, this.objects[i]);
        }

        // GroundPatches
        s.writeUint8(this.groundPatches.length);
        for (let i = 0; i < this.groundPatches.length; i++) {
            serializeMapGroundPatch(s, this.groundPatches[i]);
        }
    }

    deserialize(s: BitStream) {
        this.mapName = s.readString(Constants.MapNameMaxLen);
        this.seed = s.readUint32();
        this.width = s.readUint16();
        this.height = s.readUint16();
        this.shoreInset = s.readUint16();
        this.grassInset = s.readUint16();

        const riverCount = s.readUint8();
        for (let i = 0; i < riverCount; i++) {
            const river = {} as MapRiverData;
            deserializeMapRiver(s, river);
            this.rivers.push(river);
        }

        const placeCount = s.readUint8();
        for (let i = 0; i < placeCount; i++) {
            const place = {} as Place;
            deserializeMapPlaces(s, place);
            this.places.push(place);
        }

        const objCount = s.readUint16();
        for (let i = 0; i < objCount; i++) {
            const obj = {} as MapObj;
            deserializeMapObj(s, obj);
            this.objects.push(obj);
        }

        const patchCount = s.readUint8();
        for (let i = 0; i < patchCount; i++) {
            const patch = {} as GroundPatch;
            deserializeMapGroundPatch(s, patch);
            this.groundPatches.push(patch);
        }
    }
}

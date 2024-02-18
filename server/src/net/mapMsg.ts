import { type Vec2 } from "../../../shared/utils/v2";
import { Msg, MsgType, NetConstants, type SurvivBitStream } from "./net";

export interface MapRiver {
    width: number
    looped: boolean
    points: Vec2[]
}

function serializeMapRiver(s: SurvivBitStream, data: MapRiver) {
    s.writeFloat32(data.width);
    s.writeUint8(+data.looped);
    s.writeUint8(data.points.length);

    for (const point of data.points) {
        s.writeVec(point, 0, 0, 1024, 1024, 16);
    }
}

function deserializeMapRiver(s: SurvivBitStream) {
    const x: MapRiver = {
        width: s.readFloat32(),
        looped: !!s.readUint8(),
        points: []
    };
    const count = s.readUint8();
    for (let i = 0; i < count; i++) {
        const pos = s.readVec(0, 0, 1024, 1024, 16);
        x.points.push(pos);
    }
    return x;
}

export interface MapPlace {
    name: string
    pos: Vec2
}

function serializeMapPlace(s: SurvivBitStream, place: MapPlace) {
    s.writeString(place.name);
    s.writeVec(place.pos, 0, 0, 1024, 1024, 16);
}

function deserializeMapPlace(s: SurvivBitStream) {
    return {
        name: s.readString(),
        pos: s.readVec(0, 0, 1024, 1024, 16)
    };
}

export interface MapGroundPatch {
    min: Vec2
    max: Vec2
    color: number
    roughness: number
    offsetDist: number
    order: number
    useAsMapShape: boolean
}

function deserializeMapGroundPatch(s: SurvivBitStream): MapGroundPatch {
    return {
        min: s.readVec(0, 0, 1024, 1024, 16),
        max: s.readVec(0, 0, 1024, 1024, 16),
        color: s.readUint32(),
        roughness: s.readFloat32(),
        offsetDist: s.readFloat32(),
        order: s.readBits(7),
        useAsMapShape: s.readBoolean()
    };
}

function serializeMapGroundPatch(s: SurvivBitStream, patch: MapGroundPatch) {
    s.writeVec(patch.min, 0, 0, 1024, 1024, 16);
    s.writeVec(patch.max, 0, 0, 1024, 1024, 16);
    s.writeUint32(patch.color);
    s.writeFloat32(patch.roughness);
    s.writeFloat32(patch.offsetDist);
    s.writeBits(patch.order, 7);
    s.writeBoolean(patch.useAsMapShape);
}

export interface MapObj {
    pos: Vec2
    scale: number
    type: string
    ori: number
}

function serializeMapObj(s: SurvivBitStream, obj: MapObj) {
    s.writeVec(obj.pos, 0, 0, 1024, 1024, 16);
    s.writeFloat(obj.scale, NetConstants.MapObjectMinScale, NetConstants.MapObjectMaxScale, 8);
    s.writeMapType(obj.type);
    s.writeBits(obj.ori, 2);
    s.writeBits(0, 2); // Padding
}

function deserializeMapObj(s: SurvivBitStream): MapObj {
    const obj: MapObj = {
        pos: s.readVec(0.0, 0.0, 1024.0, 1024.0, 16),
        scale: s.readFloat(NetConstants.MapObjectMinScale, NetConstants.MapObjectMaxScale, 8),
        type: s.readMapType(),
        ori: s.readBits(2)
    };
    s.readBits(2); // Padding
    return obj;
}

export class MapMsg extends Msg {
    override readonly msgType = MsgType.Map;

    mapName = "";
    seed = 0;
    width = 0;
    height = 0;
    shoreInset = 0;
    grassInset = 0;
    rivers: MapRiver[] = [];
    places: MapPlace[] = [];
    objects: MapObj[] = [];
    groundPatches: MapGroundPatch[] = [];

    serialize(s: SurvivBitStream) {
        s.writeString(this.mapName, NetConstants.MapNameMaxLen);
        s.writeUint32(this.seed);
        s.writeUint16(this.width);
        s.writeUint16(this.height);
        s.writeUint16(this.shoreInset);
        s.writeUint16(this.grassInset);

        // Rivers
        s.writeUint8(this.rivers.length);
        for (const river of this.rivers) {
            serializeMapRiver(s, river);
        }

        // Places
        s.writeUint8(this.places.length);
        for (const place of this.places) {
            serializeMapPlace(s, place);
        }

        // Objects
        s.writeUint16(this.objects.length);
        for (const obj of this.objects) {
            serializeMapObj(s, obj);
        }

        // GroundPatches
        s.writeUint8(this.groundPatches.length);
        for (const patch of this.groundPatches) {
            serializeMapGroundPatch(s, patch);
        }
    }

    deserialize(s: SurvivBitStream) {
        this.mapName = s.readString(NetConstants.MapNameMaxLen);
        this.seed = s.readUint32();
        this.width = s.readUint16();
        this.height = s.readUint16();
        this.shoreInset = s.readUint16();
        this.grassInset = s.readUint16();

        // Rivers
        {
            const count = s.readUint8();
            for (let i = 0; i < count; i++) {
                this.rivers.push(deserializeMapRiver(s));
            }
        }

        // Places
        {
            const count = s.readUint8();
            for (let i = 0; i < count; i++) {
                this.places.push(deserializeMapPlace(s));
            }
        }

        // Objects
        {
            const count = s.readUint16();
            for (let i = 0; i < count; i++) {
                this.objects.push(deserializeMapObj(s));
            }
        }

        // GroundPatches
        {
            const count = s.readUint8();
            for (let i = 0; i < count; i++) {
                this.groundPatches.push(deserializeMapGroundPatch(s));
            }
        }
    }
}

import { type Vec2 } from "../../../shared/utils/v2";
import { Msg, MsgType, NetConstants, type SurvivBitStream } from "./net";
import { ObjectSerializeFns, type ObjectsFullData, type ObjectsPartialData } from "./objectSerialization";
import { type ObjectType } from "../objects/gameObject";
import { GameConfig } from "../../../shared/gameConfig";
import { type SerializationCache } from "./serializationCache";

export interface GasData {
    mode: number
    duration: number
    posOld: Vec2
    posNew: Vec2
    radOld: number
    radNew: number
}

function serializeGasData(s: SurvivBitStream, data: GasData) {
    s.writeUint8(data.mode);
    s.writeFloat32(data.duration);
    s.writeVec(data.posNew, 0, 0, 1024, 1024, 16);
    s.writeVec(data.posNew, 0, 0, 1024, 1024, 16);
    s.writeFloat(data.radOld, 0, 2048, 16);
    s.writeFloat(data.radNew, 0, 2048, 16);
}

export interface ActivePlayerData {
    dirty: {
        health: boolean
        boost: boolean
        zoom: boolean
        action: boolean
        inventory: boolean
        weapons: boolean
        spectatorCount: boolean
    }

    health: number
    boost: number
    zoom: number

    action: {
        time: number
        duration: number
        targetId: number
    }

    scope: string
    inventory: Record<string, number>

    curWeapIdx: number
    weapons: Array<{
        type: string
        ammo: number
    }>

    spectatorCount: number
}

function serializeActivePlayerData(s: SurvivBitStream, data: ActivePlayerData) {
    s.writeBoolean(data.dirty.health);
    if (data.dirty.health) s.writeFloat(data.health, 0, 100, 8);

    s.writeBoolean(data.dirty.boost);
    if (data.dirty.boost) s.writeFloat(data.boost, 0, 100, 8);

    s.writeBoolean(data.dirty.zoom);
    if (data.dirty.zoom) s.writeUint8(data.zoom);

    s.writeBoolean(data.dirty.action);
    if (data.dirty.action) {
        s.writeFloat(data.action.time, 0, NetConstants.ActionMaxDuration, 8);
        s.writeFloat(data.action.duration, 0, NetConstants.ActionMaxDuration, 8);
        s.writeUint16(data.action.targetId);
    }

    s.writeBoolean(data.dirty.inventory);
    if (data.dirty.inventory) {
        s.writeGameType(data.scope);
        for (const key of Object.keys(GameConfig.bagSizes)) {
            const hasItem = data.inventory[key] > 0;
            s.writeBoolean(hasItem);
            if (hasItem) s.writeBits(data.inventory[key], 9);
        }
    }

    s.writeBoolean(data.dirty.weapons);
    if (data.dirty.weapons) {
        s.writeBits(data.curWeapIdx, 2);
        for (let i = 0; i < GameConfig.WeaponSlot.Count; i++) {
            s.writeGameType(data.weapons[i].type);
            s.writeUint8(data.weapons[i].ammo);
        }
    }

    s.writeBoolean(data.dirty.spectatorCount);
    if (data.dirty.spectatorCount) {
        s.writeUint8(data.spectatorCount);
    }

    s.writeAlignToNextByte();
}

export interface PlayerInfo {
    id: number
    teamId: number
    groupId: number
    name: string

    loadout: {
        heal: string
        boost: string
    }
}

function serializePlayerInfo(s: SurvivBitStream, data: PlayerInfo) {
    s.writeUint16(data.id);
    s.writeUint8(data.teamId);
    s.writeUint8(data.groupId);
    s.writeString(data.name);

    s.writeGameType(data.loadout.heal);
    s.writeGameType(data.loadout.boost);

    s.writeAlignToNextByte();
}

export interface PlayerStatus {
    hasData: boolean
    pos: Vec2
    visible: boolean
    dead: boolean
    downed: boolean
    role: string
}

function serializePlayerStatus(s: SurvivBitStream, data: PlayerStatus[]) {
    s.writeUint8(data.length);
    for (const info of data) {
        s.writeBoolean(info.hasData);

        if (info.hasData) {
            s.writeVec(info.pos, 0, 0, 1024, 1024, 11);
            s.writeBoolean(info.visible);
            s.writeBoolean(info.dead);
            s.writeBoolean(info.downed);

            s.writeBoolean(info.role !== "");
            if (info.role !== "") {
                s.writeGameType(info.role);
            }
        }
    }
}

export interface GroupStatus {
    health: number
    disconnected: boolean
}

function serializeGroupStatus(s: SurvivBitStream, data: GroupStatus[]) {
    s.writeUint8(data.length);

    for (const status of data) {
        s.writeFloat(status.health, 0, 100, 7);
        s.writeBoolean(status.disconnected);
    }
}

export interface BulletData {
    playerId: number
    startPos: Vec2
    dir: Vec2
    bulletType: string
    layer: number
    varianceT: number
    distAdjIdx: number
    clipDistance: boolean
    distance: number
    shotFx: boolean
    sourceType: string
    shotOffhand: boolean
    lastShot: boolean
    reflectCount: number
    reflectObjId: number

    hasSpecialFx: boolean
    shotAlt: boolean
    splinter: boolean
    trailSaturated: boolean
    trailSmall: boolean
    trailThick: boolean
}

export interface ExplosionData {
    pos: Vec2
    type: string
    layer: number
}

export interface EmoteData {
    playerId: number
    type: string
    itemType: string
    isPing: boolean
    pos: Vec2
}

export interface PlaneData {
    id: number
    pos: Vec2
    dir: Vec2
    actionComplete: boolean
    action: number
}

export interface AirStrikeZoneData {
    pos: Vec2
    rad: number
    duration: number
}

export interface MapIndicatorData {
    id: number
    dead: boolean
    equipped: boolean
    type: string
    pos: Vec2
}

const UpdateExtFlags = {
    DeletedObjects: 1 << 0,
    FullObjects: 1 << 1,
    ActivePlayerId: 1 << 2,
    Gas: 1 << 3,
    GasCircle: 1 << 4,
    PlayerInfos: 1 << 5,
    DeletePlayerIds: 1 << 6,
    PlayerStatus: 1 << 7,
    GroupStatus: 1 << 8,
    Bullets: 1 << 9,
    Explosions: 1 << 10,
    Emotes: 1 << 11,
    Planes: 1 << 12,
    AirstrikeZones: 1 << 13,
    MapIndicators: 1 << 14,
    KillLeader: 1 << 15
};

export class UpdateMsg extends Msg {
    override readonly msgType = MsgType.Update;
    allocBytes = 1 << 16;

    serializationCache!: SerializationCache;

    delObjIds: number[] = [];
    fullObjects: Array<
    ObjectsFullData[ObjectType] & ObjectsPartialData[ObjectType] & {
        id: number
        __type: ObjectType
    }> = [];

    partObjects: Array<ObjectsPartialData[ObjectType] & {
        id: number
        __type: ObjectType
    }> = [];

    activePlayerId = 0;
    activePlayerIdDirty = false;
    activePlayerData!: ActivePlayerData;

    aliveCounts = [];
    aliveDirty = false;

    gas!: GasData;
    gasDirty = false;
    gasT = 0;
    gasTDirty = false;

    playerInfos: PlayerInfo[] = [];
    deletedPlayerIds: number[] = [];

    playerStatus: PlayerStatus[] = [];
    playerStatusDirty = false;

    groupStatus: GroupStatus[] = [];
    groupStatusDirty = false;

    bullets: BulletData[] = [];
    explosions: ExplosionData[] = [];
    emotes: EmoteData[] = [];
    planes: PlaneData[] = [];
    airstrikeZones: AirStrikeZoneData[] = [];
    mapIndicators: MapIndicatorData[] = [];

    killLeaderId = 0;
    killLeaderKills = 0;
    killLeaderDirty = false;
    ack = 0;

    serialize(s: SurvivBitStream): void {
        let flags = 0;
        if (this.delObjIds.length) flags += UpdateExtFlags.DeletedObjects;
        if (this.fullObjects.length) flags += UpdateExtFlags.FullObjects;
        if (this.activePlayerIdDirty) flags += UpdateExtFlags.ActivePlayerId;
        if (this.gasDirty) flags += UpdateExtFlags.Gas;
        if (this.gasTDirty) flags += UpdateExtFlags.GasCircle;
        if (this.playerInfos.length) flags += UpdateExtFlags.PlayerInfos;
        if (this.deletedPlayerIds.length) flags += UpdateExtFlags.DeletePlayerIds;
        if (this.playerStatusDirty) flags += UpdateExtFlags.PlayerStatus;
        if (this.groupStatusDirty) flags += UpdateExtFlags.GroupStatus;
        if (this.bullets.length) flags += UpdateExtFlags.Bullets;
        if (this.explosions.length) flags += UpdateExtFlags.Explosions;
        if (this.emotes.length) flags += UpdateExtFlags.Emotes;
        if (this.planes.length) flags += UpdateExtFlags.Planes;
        if (this.airstrikeZones.length) flags += UpdateExtFlags.AirstrikeZones;
        if (this.mapIndicators.length) flags += UpdateExtFlags.MapIndicators;
        if (this.killLeaderDirty) flags += UpdateExtFlags.KillLeader;

        s.writeUint16(flags);

        if ((flags & UpdateExtFlags.DeletedObjects) !== 0) {
            s.writeUint16(this.delObjIds.length);
            for (const id of this.delObjIds) {
                s.writeUint16(id);
            }
        }

        if ((flags & UpdateExtFlags.FullObjects) !== 0) {
            s.writeUint16(this.fullObjects.length);
            for (const obj of this.fullObjects) {
                s.writeUint8(obj.__type);
                s.writeUint16(obj.id);
                // @ts-expect-error ...
                ObjectSerializeFns[obj.__type].serializePart(s, obj);
                // @ts-expect-error ...
                ObjectSerializeFns[obj.__type].serializeFull(s, obj);
            }
        }

        s.writeUint16(this.partObjects.length);
        for (const obj of this.partObjects) {
            s.writeUint16(obj.id);
            // @ts-expect-error ...
            ObjectSerializeFns[obj.__type].serializePart(s, obj);
        }

        if ((flags & UpdateExtFlags.ActivePlayerId) !== 0) {
            s.writeUint16(this.activePlayerId);
        }

        serializeActivePlayerData(s, this.activePlayerData);

        if ((flags & UpdateExtFlags.Gas) !== 0) {
            serializeGasData(s, this.gas);
        }

        if ((flags & UpdateExtFlags.GasCircle) !== 0) {
            s.writeFloat(this.gasT, 0, 1, 16);
        }

        if ((flags & UpdateExtFlags.PlayerInfos) !== 0) {
            s.writeUint8(this.playerInfos.length);
            for (const info of this.playerInfos) {
                serializePlayerInfo(s, info);
            }
        }

        if ((flags & UpdateExtFlags.DeletePlayerIds) !== 0) {
            s.writeUint8(this.deletedPlayerIds.length);
            for (const id of this.deletedPlayerIds) {
                s.writeUint16(id);
            }
        }

        if ((flags & UpdateExtFlags.PlayerInfos) !== 0) {
            serializePlayerStatus(s, this.playerStatus);
        }

        if ((flags & UpdateExtFlags.GroupStatus) !== 0) {
            serializeGroupStatus(s, this.groupStatus);
        }

        if ((flags & UpdateExtFlags.Bullets) !== 0) {
            s.writeUint8(this.bullets.length);

            for (const bullet of this.bullets) {
                s.writeUint16(bullet.playerId);
                s.writeVec(bullet.startPos, 0, 0, 1024, 1024, 16);
                s.writeUnitVec(bullet.dir, 8);
                s.writeGameType(bullet.bulletType);
                s.writeBits(bullet.layer, 2);
                s.writeFloat(bullet.varianceT, 0, 1, 4);
                s.writeBits(bullet.distAdjIdx, 4);
                s.writeBoolean(bullet.clipDistance);
                if (bullet.clipDistance) {
                    s.writeFloat(bullet.distance, 0, 1024, 16);
                }
                s.writeBoolean(bullet.shotFx);
                if (bullet.shotFx) {
                    s.writeGameType(bullet.sourceType);
                    s.writeBoolean(bullet.shotOffhand);
                    s.writeBoolean(bullet.lastShot);
                }
                s.writeBoolean(bullet.reflectCount > 0);
                if (bullet.reflectCount > 0) {
                    s.writeBits(bullet.reflectCount, 2);
                    s.writeUint16(bullet.reflectObjId);
                }

                s.writeBoolean(bullet.hasSpecialFx);

                if (bullet.hasSpecialFx) {
                    s.writeBoolean(bullet.shotAlt);
                    s.writeBoolean(bullet.splinter);
                    s.writeBoolean(bullet.trailSaturated);
                    s.writeBoolean(bullet.trailSmall);
                    s.writeBoolean(bullet.trailThick);
                }
            }

            s.writeAlignToNextByte();
        }

        if ((flags & UpdateExtFlags.Explosions) !== 0) {
            s.writeUint8(this.explosions.length);
            for (const explosion of this.explosions) {
                s.writeVec(explosion.pos, 0, 0, 1024, 1024, 16);
                s.writeGameType(explosion.type);
                s.writeBits(explosion.layer, 2);
                s.writeAlignToNextByte();
            }
        }

        if ((flags & UpdateExtFlags.Emotes) !== 0) {
            s.writeUint8(this.emotes.length);
            for (const emote of this.emotes) {
                s.writeUint16(emote.playerId);
                s.writeGameType(emote.type);
                s.writeBoolean(emote.isPing);
                s.writeGameType(emote.itemType);
                if (emote.isPing) s.writeVec(emote.pos, 0, 0, 1024, 1024, 16);
                s.writeAlignToNextByte();
            }
        }

        if ((flags & UpdateExtFlags.Planes) !== 0) {
            s.writeUint8(this.planes.length);
            for (const plane of this.planes) {
                s.writeUint8(plane.id);
                s.writeVec(plane.pos, 0, 0, 2048, 2048, 10);
                s.writeUnitVec(plane.dir, 8);
                s.writeBoolean(plane.actionComplete);
                s.writeBits(plane.action, 3);
            }
        }

        if ((flags & UpdateExtFlags.AirstrikeZones) !== 0) {
            s.writeUint8(this.airstrikeZones.length);
            for (const zone of this.airstrikeZones) {
                s.writeVec(zone.pos, 0, 0, 1024, 1024, 12);
                s.writeFloat(zone.rad, 0, NetConstants.AirstrikeZoneMaxRad, 8);
                s.writeFloat(zone.duration, 0, NetConstants.AirstrikeZoneMaxDuration, 8);
            }
        }

        if ((flags & UpdateExtFlags.MapIndicators) !== 0) {
            s.writeUint8(this.mapIndicators.length);
            for (const indicator of this.mapIndicators) {
                s.writeBits(indicator.id, 4);
                s.writeBoolean(indicator.dead);
                s.writeBoolean(indicator.equipped);
                s.writeGameType(indicator.type);
                s.writeVec(indicator.pos, 0, 0, 1024, 1024, 16);
            }
            s.writeAlignToNextByte();
        }

        if ((flags & UpdateExtFlags.KillLeader) !== 0) {
            s.writeUint16(this.killLeaderId);
            s.writeUint8(this.killLeaderKills);
        }

        s.writeUint8(this.ack);
    }

    deserialize(): void { }
}

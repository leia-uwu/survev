import { ClientObject, type Action, type GroupStatus, type LocalDataWithDirty, type PlayerStatus } from "../../client/clientTypes";
import { type Creator } from "../../client/src/objects/objectPool";
import type { Bullet } from "../../server/src/objects/bullet";
import type { Explosion } from "../../server/src/objects/explosion";
import type { Gas } from "../../server/src/objects/gas";
import type { Emote, Player } from "../../server/src/objects/player";
import { GameConfig } from "../gameConfig";
import { AbstractMsg, Constants, type BitStream } from "../net";
import { ObjectSerializeFns } from "../utils/objectSerializeFns";
import { v2, type Vec2 } from "./../utils/v2";

export const UpdateExtFlags = {
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

function serializeActivePlayer(s: BitStream, data: Player) {
    s.writeBoolean(data.dirty.health);
    if (data.dirty.health) s.writeFloat(data.health, 0, 100, 8);

    s.writeBoolean(data.dirty.boost);
    if (data.dirty.boost) s.writeFloat(data.boost, 0, 100, 8);

    s.writeBoolean(data.dirty.zoom);
    if (data.dirty.zoom) s.writeUint8(data.zoom);

    s.writeBoolean(data.dirty.action);
    if (data.dirty.action) {
        s.writeFloat(data.action.time, 0, Constants.ActionMaxDuration, 8);
        s.writeFloat(data.action.duration, 0, Constants.ActionMaxDuration, 8);
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

function deserializeActivePlayer(s: BitStream, data: LocalDataWithDirty) {
    data.healthDirty = s.readBoolean();
    if (data.healthDirty) {
        data.health = s.readFloat(0, 100, 8);
    }
    data.boostDirty = s.readBoolean();
    if (data.boostDirty) {
        data.boost = s.readFloat(0, 100, 8);
    }
    data.zoomDirty = s.readBoolean();
    if (data.zoomDirty) {
        data.zoom = s.readUint8();
    }
    data.actionDirty = s.readBoolean();
    if (data.actionDirty) {
        data.action = {} as Action;
        data.action.time = s.readFloat(0, Constants.ActionMaxDuration, 8);
        data.action.duration = s.readFloat(0, Constants.ActionMaxDuration, 8);
        data.action.targetId = s.readUint16();
    }
    data.inventoryDirty = s.readBoolean();
    if (data.inventoryDirty) {
        data.scope = s.readGameType();
        data.inventory = {};
        const inventoryKeys = Object.keys(GameConfig.bagSizes);
        for (
            let i = 0;
            i < inventoryKeys.length;
            i++
        ) {
            const item = inventoryKeys[i];
            let count = 0;
            if (s.readBoolean()) {
                count = s.readBits(9);
            }
            data.inventory[item] = count;
        }
    }
    data.weapsDirty = s.readBoolean();
    if (data.weapsDirty) {
        data.curWeapIdx = s.readBits(2);
        data.weapons = [];
        for (let i = 0; i < GameConfig.WeaponSlot.Count; i++) {
            data.weapons.push({
                type: s.readGameType(),
                ammo: s.readUint8()
            });
        }
    }
    data.spectatorCountDirty = s.readBoolean();
    if (data.spectatorCountDirty) {
        data.spectatorCount = s.readUint8();
    }
    s.readAlignToNextByte();
}

function serializePlayerStatus(s: BitStream, data: PlayerStatus[]) {
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

function deserializePlayerStatus(s: BitStream, data: { players: PlayerStatus[] }) {
    data.players = [];
    const count = s.readUint8();
    for (let i = 0; i < count; i++) {
        const p = {} as PlayerStatus & { hasData: boolean };
        p.hasData = s.readBoolean();
        if (p.hasData) {
            p.pos = s.readVec(0, 0, 1024, 1024, 11);
            p.visible = s.readBoolean();
            p.dead = s.readBoolean();
            p.downed = s.readBoolean();
            p.role = "";
            if (s.readBoolean()) {
                p.role = s.readGameType();
            }
        }
        data.players.push(p);
    }
    s.readAlignToNextByte();
}

function serializeGroupStatus(s: BitStream, data: GroupStatus[]) {
    s.writeUint8(data.length);

    for (const status of data) {
        s.writeFloat(status.health, 0, 100, 7);
        s.writeBoolean(status.disconnected);
    }
}

function deserializeGroupStatus(s: BitStream, data: { players: GroupStatus[] }) {
    data.players = [];
    const count = s.readUint8();
    for (let i = 0; i < count; i++) {
        const p = {} as GroupStatus;
        p.health = s.readFloat(0, 100, 7);
        p.disconnected = s.readBoolean();
        data.players.push(p);
    }
}

function serializePlayerInfo(s: BitStream, data: Player) {
    s.writeUint16(data.id);
    s.writeUint8(data.teamId);
    s.writeUint8(data.groupId);
    s.writeString(data.name);

    s.writeGameType(data.loadout.heal);
    s.writeGameType(data.loadout.boost);

    s.writeAlignToNextByte();
}

function deserializePlayerInfo(s: BitStream, data: Player) {
    data.playerId = s.readUint16();
    data.teamId = s.readUint8();
    data.groupId = s.readUint8();
    data.name = s.readString();
    data.loadout = {} as Player["loadout"];
    data.loadout.heal = s.readGameType();
    data.loadout.boost = s.readGameType();
    s.readAlignToNextByte();
}

function serializeGasData(s: BitStream, data: Gas) {
    s.writeUint8(data.mode);
    s.writeFloat32(data.duration);
    s.writeVec(data.posOld, 0, 0, 1024, 1024, 16);
    s.writeVec(data.posNew, 0, 0, 1024, 1024, 16);
    s.writeFloat(data.radOld, 0, 2048, 16);
    s.writeFloat(data.radNew, 0, 2048, 16);
}

function deserializeGasData(s: BitStream, data: Gas) {
    data.mode = s.readUint8();
    data.duration = s.readFloat32();
    data.posOld = s.readVec(0, 0, 1024, 1024, 16);
    data.posNew = s.readVec(0, 0, 1024, 1024, 16);
    data.radOld = s.readFloat(0, 2048, 16);
    data.radNew = s.readFloat(0, 2048, 16);
}

export class UpdateMsg extends AbstractMsg {
    serializedObjectCache = null;
    objectReg = null;
    clientPlayer = null;
    activePlayer = null;
    grid = null;
    playerBarn = null;
    bulletBarn = null;
    gas = null;
    map = null;
    delObjIds: number[] = [];
    fullObjects: ClientObject[] = [];
    partObjects: ClientObject[] = [];
    activePlayerId = 0;
    activePlayerIdDirty = false;
    activePlayerData!: LocalDataWithDirty;
    aliveCounts = [];
    aliveDirty = false;
    gasData!: Gas;
    gasDirty = false;
    gasT = 0;
    gasTDirty = false;
    playerInfos: Player[] = [];
    deletedPlayerIds: number[] = [];
    playerStatus!: { players: PlayerStatus[] };
    playerStatusDirty = false;
    groupStatus = {};
    groupStatusDirty = false;
    bullets: Bullet[] = [];
    explosions: Explosion[] = [];
    emotes: Emote[] = [];
    planes: Plane[] = [];
    airstrikeZones: Airstrike[] = [];
    mapIndicators: MapIndicator[] = [];
    killLeaderId = 0;
    killLeaderKills = 0;
    killLeaderDirty = false;
    ack = 0;

    override serialize(s: BitStream) {
        let flags = 0;
        const flagsIdx = s.byteIndex;
        s.writeUint16(flags);

        if (this.delObjIds.length) {
            s.writeUint16(this.delObjIds.length);
            for (const id of this.delObjIds) {
                s.writeUint16(id);
            }
            flags |= UpdateExtFlags.DeletedObjects;
        }

        if (this.fullObjects.length) {
            s.writeUint16(this.fullObjects.length);
            for (const obj of this.fullObjects) {
                s.writeUint8(obj.__type);
                s.writeUint16(obj.id);
                ObjectSerializeFns[obj.__type].serializePart(s, obj);
                ObjectSerializeFns[obj.__type].serializeFull(s, obj);
            }
            flags |= UpdateExtFlags.FullObjects;
        }

        s.writeUint16(this.partObjects.length);
        for (const obj of this.partObjects) {
            s.writeUint16(obj.id);
            ObjectSerializeFns[obj.__type].serializePart(s, obj);
        }

        if (this.activePlayerIdDirty) {
            s.writeUint16(this.activePlayerId);
            flags |= UpdateExtFlags.ActivePlayerId;
        }

        serializeActivePlayer(s, this.activePlayerData);

        if (this.gasDirty) {
            serializeGasData(s, this.gasData);
            flags |= UpdateExtFlags.Gas;
        }

        if (this.gasTDirty) {
            s.writeFloat(this.gasT, 0, 1, 16);
            flags |= UpdateExtFlags.GasCircle;
        }

        if (this.playerInfos.length) {
            s.writeUint8(this.playerInfos.length);
            for (const info of this.playerInfos) {
                serializePlayerInfo(s, info);
            }
            flags |= UpdateExtFlags.PlayerInfos;
        }

        if (this.deletedPlayerIds.length) {
            s.writeUint8(this.deletedPlayerIds.length);
            for (const id of this.deletedPlayerIds) {
                s.writeUint16(id);
            }
            flags |= UpdateExtFlags.DeletePlayerIds;
        }

        if (this.playerStatusDirty) {
            serializePlayerStatus(s, this.playerStatus);
            flags |= UpdateExtFlags.PlayerStatus;
        }

        if (this.groupStatusDirty) {
            serializeGroupStatus(s, this.groupStatus);
            flags |= UpdateExtFlags.GroupStatus;
        }

        if (this.bullets.length) {
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
            flags |= UpdateExtFlags.Bullets;
        }

        if (this.explosions.length) {
            s.writeUint8(this.explosions.length);
            for (const explosion of this.explosions) {
                s.writeVec(explosion.pos, 0, 0, 1024, 1024, 16);
                s.writeGameType(explosion.type);
                s.writeBits(explosion.layer, 2);
                s.writeAlignToNextByte();
            }
            flags |= UpdateExtFlags.Explosions;
        }

        if (this.emotes.length) {
            s.writeUint8(this.emotes.length);
            for (const emote of this.emotes) {
                s.writeUint16(emote.playerId);
                s.writeGameType(emote.type);
                s.writeGameType(emote.itemType);
                s.writeBoolean(emote.isPing);

                if (emote.isPing) s.writeVec(emote.pos, 0, 0, 1024, 1024, 16);
                s.writeAlignToNextByte();
            }
            flags |= UpdateExtFlags.Emotes;
        }

        if (this.planes.length) {
            s.writeUint8(this.planes.length);
            for (const plane of this.planes) {
                s.writeUint8(plane.id);
                s.writeVec(plane.pos, 0, 0, 2048, 2048, 10);
                s.writeUnitVec(plane.planeDir, 8);
                s.writeBoolean(plane.actionComplete);
                s.writeBits(plane.action, 3);
            }
            flags |= UpdateExtFlags.Planes;
        }

        if (this.airstrikeZones.length) {
            s.writeUint8(this.airstrikeZones.length);
            for (const zone of this.airstrikeZones) {
                s.writeVec(zone.pos, 0, 0, 1024, 1024, 12);
                s.writeFloat(zone.rad, 0, Constants.AirstrikeZoneMaxRad, 8);
                s.writeFloat(zone.duration, 0, Constants.AirstrikeZoneMaxDuration, 8);
            }
            flags |= UpdateExtFlags.AirstrikeZones;
        }

        if (this.mapIndicators.length) {
            s.writeUint8(this.mapIndicators.length);
            for (const indicator of this.mapIndicators) {
                s.writeBits(indicator.id, 4);
                s.writeBoolean(indicator.dead);
                s.writeBoolean(indicator.equipped);
                s.writeGameType(indicator.type);
                s.writeVec(indicator.pos, 0, 0, 1024, 1024, 16);
            }
            s.writeAlignToNextByte();
            flags |= UpdateExtFlags.MapIndicators;
        }

        if (this.killLeaderDirty) {
            s.writeUint16(this.killLeaderId);
            s.writeUint8(this.killLeaderKills);
            flags |= UpdateExtFlags.KillLeader;
        }

        s.writeUint8(this.ack);
        const idx = s.byteIndex;
        s.byteIndex = flagsIdx;
        s.writeUint16(flags);
        s.byteIndex = idx;
    }

    // @ts-expect-error deserialize only accept one argument for now
    override deserialize(s: BitStream, objectCreator: Creator) {
        const flags = s.readUint16();

        if ((flags & UpdateExtFlags.DeletedObjects) != 0) {
            const count = s.readUint16();
            for (let i = 0; i < count; i++) {
                this.delObjIds.push(s.readUint16());
            }
        }

        if ((flags & UpdateExtFlags.FullObjects) != 0) {
            const count = s.readUint16();
            for (let i = 0; i < count; i++) {
                const data = {} as ClientObject;
                data.__type = s.readUint8();
                data.__id = s.readUint16();
                ObjectSerializeFns[data.__type].deserializePart(s, data);
                ObjectSerializeFns[data.__type].deserializeFull(s, data);
                this.fullObjects.push(data);
            }
        }

        for (let count = s.readUint16(), i = 0; i < count; i++) {
            const data = {} as ClientObject;
            data.__id = s.readUint16();
            const type = objectCreator.getTypeById(data.__id, s);
            ObjectSerializeFns[type].deserializePart(s, data);
            this.partObjects.push(data);
        }

        if ((flags & UpdateExtFlags.ActivePlayerId) != 0) {
            this.activePlayerId = s.readUint16();
            this.activePlayerIdDirty = true;
        }

        const activePlayerData = {} as LocalDataWithDirty;
        deserializeActivePlayer(s, activePlayerData);
        this.activePlayerData = activePlayerData;

        if ((flags & UpdateExtFlags.Gas) != 0) {
            const f = {} as Gas;
            deserializeGasData(s, f);
            this.gasData = f;
            this.gasDirty = true;
        }

        if ((flags & UpdateExtFlags.GasCircle) != 0) {
            this.gasT = s.readFloat(0, 1, 16);
            this.gasTDirty = true;
        }

        if ((flags & UpdateExtFlags.PlayerInfos) != 0) {
            const count = s.readUint8();
            for (let i = 0; i < count; i++) {
                const x = {} as Player;
                deserializePlayerInfo(s, x);
                this.playerInfos.push(x);
            }
        }

        if ((flags & UpdateExtFlags.DeletePlayerIds) != 0) {
            const count = s.readUint8();
            for (let i = 0; i < count; i++) {
                const id = s.readUint16();
                this.deletedPlayerIds.push(id);
            }
        }

        if ((flags & UpdateExtFlags.PlayerStatus) != 0) {
            const playerStatus = {} as { players: PlayerStatus[] };
            deserializePlayerStatus(s, playerStatus);
            this.playerStatus = playerStatus;
            this.playerStatusDirty = true;
        }

        if ((flags & UpdateExtFlags.GroupStatus) != 0) {
            const groupStatus = {} as { players: GroupStatus[] };
            deserializeGroupStatus(s, groupStatus);
            this.groupStatus = groupStatus;
            this.groupStatusDirty = true;
        }

        if ((flags & UpdateExtFlags.Bullets) != 0) {
            for (let count = s.readUint8(), i = 0; i < count; i++) {
                const bullet = {} as Bullet;
                bullet.playerId = s.readUint16();
                bullet.pos = s.readVec(0, 0, 1024, 1024, 16);
                bullet.dir = s.readUnitVec(8);
                bullet.bulletType = s.readGameType();
                bullet.layer = s.readBits(2);
                bullet.varianceT = s.readFloat(0, 1, 4);
                bullet.distAdjIdx = s.readBits(4);
                bullet.clipDistance = s.readBoolean();
                if (bullet.clipDistance) {
                    bullet.distance = s.readFloat(0, 1024, 16);
                }
                bullet.shotFx = s.readBoolean();
                if (bullet.shotFx) {
                    bullet.shotSourceType = s.readGameType();
                    bullet.shotOffhand = s.readBoolean();
                    bullet.lastShot = s.readBoolean();
                }
                bullet.reflectCount = 0;
                bullet.reflectObjId = 0;
                if (s.readBoolean()) {
                    bullet.reflectCount = s.readBits(2);
                    bullet.reflectObjId = s.readUint16();
                }
                bullet.hasSpecialFx = s.readBoolean();
                if (bullet.hasSpecialFx) {
                    bullet.shotAlt = s.readBoolean();
                    bullet.splinter = s.readBoolean();
                    bullet.trailSaturated = s.readBoolean();
                    bullet.trailSmall = s.readBoolean();
                    bullet.trailThick = s.readBoolean();
                }
                this.bullets.push(bullet);
            }
            s.readAlignToNextByte();
        }

        if ((flags & UpdateExtFlags.Explosions) != 0) {
            const count = s.readUint8();
            for (let i = 0; i < count; i++) {
                const explosion = {} as Explosion;
                explosion.pos = s.readVec(0, 0, 1024, 1024, 16);
                explosion.type = s.readGameType();
                explosion.layer = s.readBits(2);
                s.readAlignToNextByte();
                this.explosions.push(explosion);
            }
        }

        if ((flags & UpdateExtFlags.Emotes) != 0) {
            for (let count = s.readUint8(), i = 0; i < count; i++) {
                const emote = {} as Emote;
                emote.playerId = s.readUint16();
                emote.type = s.readGameType();
                emote.itemType = s.readGameType();
                emote.isPing = s.readBoolean();

                if (emote.isPing) {
                    emote.pos = s.readVec(0, 0, 1024, 1024, 16);
                }
                s.readBits(3);
                this.emotes.push(emote);
            }
        }

        if ((flags & UpdateExtFlags.Planes) != 0) {
            for (let count = s.readUint8(), i = 0; i < count; i++) {
                const plane = {} as Plane;
                plane.id = s.readUint8();
                const V = s.readVec(0, 0, 2048, 2048, 10);
                plane.pos = v2.create(V.x - 512, V.y - 512);
                plane.planeDir = s.readUnitVec(8);
                plane.actionComplete = s.readBoolean();
                plane.action = s.readBits(3);
                this.planes.push(plane);
            }
        }

        if ((flags & UpdateExtFlags.AirstrikeZones) != 0) {
            for (let count = s.readUint8(), i = 0; i < count; i++) {
                const airStrikeZone = {} as Airstrike;
                airStrikeZone.pos = s.readVec(0, 0, 1024, 1024, 12);
                airStrikeZone.rad = s.readFloat(
                    0,
                    Constants.AirstrikeZoneMaxRad,
                    8
                );
                airStrikeZone.duration = s.readFloat(
                    0,
                    Constants.AirstrikeZoneMaxDuration,
                    8
                );
                this.airstrikeZones.push(airStrikeZone);
            }
        }

        if ((flags & UpdateExtFlags.MapIndicators) != 0) {
            for (let count = s.readUint8(), i = 0; i < count; i++) {
                const mapIndicator = {} as MapIndicator;
                mapIndicator.id = s.readBits(4);
                mapIndicator.dead = s.readBoolean();
                mapIndicator.equipped = s.readBoolean();
                mapIndicator.type = s.readGameType();
                mapIndicator.pos = s.readVec(0, 0, 1024, 1024, 16);
                this.mapIndicators.push(mapIndicator);
            }
            s.readAlignToNextByte();
        }

        if ((flags & UpdateExtFlags.KillLeader) != 0) {
            this.killLeaderId = s.readUint16();
            this.killLeaderKills = s.readUint8();
            this.killLeaderDirty = true;
        }
        this.ack = s.readUint8();
    }
}

export function getPlayerStatusUpdateRate(factionMode: boolean) {
    if (factionMode) {
        return 0.5;
    } else {
        return 0.25;
    }
}

interface Airstrike {
    pos: Vec2
    duration: number
    rad: number
}

interface Plane {
    planeDir: Vec2
    pos: Vec2
    actionComplete: boolean
    action: number
    id: number
}

interface MapIndicator {
    id: number
    dead: boolean
    equipped: boolean
    type: string
    pos: Vec2
}

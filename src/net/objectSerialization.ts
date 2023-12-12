import { ObjectType } from "../objects/gameObject";
import { NetConstants, type SurvivBitStream } from "./net";
import { gameConfig } from "../gameConfig";
import { type Vec2 } from "../utils/v2";

export interface ObjectsPartialData {
    [ObjectType.Invalid]: null
    [ObjectType.Player]: {
        pos: Vec2
        dir: Vec2
    }
    [ObjectType.Obstacle]: {
        pos: Vec2
        ori: number
        scale: number
    }
    [ObjectType.Loot]: {
        pos: Vec2
    }
    [ObjectType.LootSpawner]: null
    [ObjectType.DeadBody]: {
        pos: Vec2
    }
    [ObjectType.Building]: {
        ceilingDead: boolean
        occupied: boolean
        ceilingDamaged: boolean
        hasPuzzle: boolean
        puzzleSolved: boolean
        puzzleErrSeq: number
    }
    [ObjectType.Structure]: null
    [ObjectType.Decal]: null
    [ObjectType.Projectile]: {
        pos: Vec2
        posZ: number
        dir: Vec2
    }
    [ObjectType.Smoke]: {
        pos: Vec2
        rad: number
    }
    [ObjectType.Airdrop]: {
        fallT: number
        landed: boolean
    }
}

export interface ObjectsFullData {
    [ObjectType.Invalid]: null
    [ObjectType.Player]: {
        outfit: string
        pack: string
        helmet: string
        chest: string
        activeWeapon: string
        layer: number
        dead: boolean
        downed: boolean

        animType: number
        animSeq: number

        actionType: number
        actionSeq: number

        wearingPan: boolean
        healEffect: boolean

        frozen: boolean
        frozenOri: number

        hasHaste: boolean
        hasteType: number
        hasteSeq: number

        actionItem: string

        hasScale: boolean
        scale: number

        hasRole: boolean
        role: string

        hasPerks: boolean
        perks: Array<{
            type: string
            droppable: boolean
        }>

    }
    [ObjectType.Obstacle]: {
        healthT: number
        type: string
        layer: number
        dead: boolean
        isDoor: boolean
        door?: {
            open: boolean
            canUse: boolean
            seq: number
        }
        isButton: boolean
        button?: {
            onOff: boolean
            canUse: boolean
            seq: number
        }
        isPuzzlePiece: boolean
        parentBuildingId?: number
        isSkin: boolean
        skinPlayerId?: number
    }
    [ObjectType.Loot]: {
        type: string
        layer: number
        isOld: number
        isPreloadedGun: boolean
        count: number
        hasOwner: boolean
        ownerId: number
    }
    [ObjectType.LootSpawner]: null
    [ObjectType.DeadBody]: {
        layer: number
        playerId: number
    }
    [ObjectType.Building]: {
        pos: Vec2
        type: string
        ori: number
        layer: number
    }
    [ObjectType.Structure]: {
        pos: Vec2
        type: string
        ori: number
        interiorSoundEnabled: boolean
        interiorSoundAlt: boolean
        layerObjIds: number[]
    }
    [ObjectType.Decal]: {
        pos: Vec2
        scale: number
        type: string
        ori: number
        layer: number
        goreKills: number
    }
    [ObjectType.Projectile]: {
        type: string
        layer: number
    }
    [ObjectType.Smoke]: {
        layer: number
        interior: number
    }
    [ObjectType.Airdrop]: {
        pos: Vec2
    }
}

interface ObjectSerialization<T extends ObjectType> {
    // serializedFullSize: number
    serializePart: (s: SurvivBitStream, data: ObjectsPartialData[T]) => void
    serializeFull: (s: SurvivBitStream, data: ObjectsFullData[T]) => void
    // deserializePart: (s: SurvivBitStream) => ObjectsPartialData[T]
    // deserializeFull: (s: SurvivBitStream, data: any) => ObjectsFullData[T]
}

export const ObjectSerializeFns: { [K in ObjectType]: ObjectSerialization<K> } = {
    [ObjectType.Player]: {
        serializePart(s, data) {
            s.writeVec(data.pos, 0, 0, 1024, 1024, 16);
            s.writeUnitVec(data.dir, 8);
        },
        serializeFull(s, data) {
            s.writeGameType(data.outfit);
            s.writeGameType(data.pack);
            s.writeGameType(data.helmet);
            s.writeGameType(data.chest);
            s.writeGameType(data.activeWeapon);

            s.writeBits(data.layer, 2);
            s.writeBoolean(data.dead);
            s.writeBoolean(data.downed);

            s.writeBits(data.animType, 3);
            s.writeBits(data.animSeq, 3);
            s.writeBits(data.actionType, 3);
            s.writeBits(data.actionSeq, 3);

            s.writeBoolean(data.wearingPan);
            s.writeBoolean(data.healEffect);

            s.writeBoolean(data.frozen);
            s.writeBits(data.frozenOri, 2);

            s.writeBoolean(data.hasHaste);
            if (data.hasHaste) {
                s.writeBits(data.hasteType, 3);
                s.writeBits(data.hasteSeq, 3);
            }

            s.writeBoolean(data.actionItem !== "");
            if (data.actionItem !== "") {
                s.writeGameType(data.actionItem);
            }

            s.writeBoolean(data.hasScale);
            if (data.hasScale) {
                s.writeFloat(data.scale, NetConstants.PlayerMinScale, NetConstants.PlayerMaxScale, 8);
            }

            s.writeBoolean(data.hasRole);
            if (data.hasRole) s.writeGameType(data.role);

            s.writeBoolean(data.hasPerks);
            if (data.hasPerks) {
                s.writeBits(data.perks.length, 3);
                for (const perk of data.perks) {
                    s.writeGameType(perk.type);
                    s.writeBoolean(perk.droppable);
                }
            }

            s.writeAlignToNextByte();
        }
    },
    [ObjectType.Obstacle]: {
        serializePart(s, data) {
            s.writeVec(data.pos, 0, 0, 1024, 1024, 16);
            s.writeBits(data.ori, 2);
            s.writeFloat(
                data.scale,
                NetConstants.MapObjectMinScale,
                NetConstants.MapObjectMaxScale,
                8
            );
            s.writeBits(0, 6);
        },
        serializeFull(s, data) {
            s.writeFloat(data.healthT, 0, 1, 8);
            s.writeMapType(data.type);
            s.writeBits(data.layer, 2);
            s.writeBoolean(data.dead);
            s.writeBoolean(data.isDoor);
            if (data.isDoor) {
                s.writeBoolean(data.door!.open);
                s.writeBoolean(data.door!.canUse);
                s.writeBits(data.door!.seq, 6);
            }

            s.writeBoolean(data.isButton);
            if (data.isButton) {
                s.writeBoolean(data.button!.onOff);
                s.writeBoolean(data.button!.canUse);
                s.writeBits(data.button!.seq, 6);
            }

            s.writeBoolean(data.isPuzzlePiece);
            if (data.isPuzzlePiece) s.writeUint16(data.parentBuildingId!);

            s.writeBoolean(data.isSkin);
            if (data.isSkin) s.writeUint16(data.skinPlayerId!);

            s.writeBits(0, 5); // padding
        }
    },
    [ObjectType.Building]: {
        serializePart(s, data) {
            s.writeBoolean(data.ceilingDead);
            s.writeBoolean(data.occupied);
            s.writeBoolean(data.ceilingDamaged);
            s.writeBoolean(data.hasPuzzle);
            if (data.hasPuzzle) {
                s.writeBoolean(data.puzzleSolved);
                s.writeBits(data.puzzleErrSeq, 7);
            }
            s.writeBits(0, 4); // padding
        },
        serializeFull(s, data) {
            s.writeVec(data.pos, 0, 0, 1024, 1024, 16);
            s.writeMapType(data.type);
            s.writeBits(data.ori, 2);
            s.writeBits(data.layer, 2);
        }
    },
    [ObjectType.Structure]: {
        serializePart() { },
        serializeFull(s, data) {
            s.writeVec(data.pos, 0, 0, 1024, 1024, 16);
            s.writeMapType(data.type);
            s.writeBits(data.ori, 2);
            s.writeBoolean(data.interiorSoundAlt);
            s.writeBoolean(data.interiorSoundEnabled);
            for (let i = 0; i < gameConfig.structureLayerCount; i++) {
                s.writeUint16(data.layerObjIds[i]);
            }
        }
    },
    [ObjectType.Loot]: {
        serializePart(s, data) {
            s.writeVec(data.pos, 0, 0, 1024, 1024, 16);
        },
        serializeFull(s, data) {
            s.writeGameType(data.type);
            s.writeUint8(data.count);
            s.writeBits(data.layer, 2);
            s.writeBits(data.isOld, 3);
            s.writeBoolean(data.isPreloadedGun);
            s.writeBoolean(data.hasOwner);
            if (data.hasOwner) {
                s.writeUint16(data.ownerId);
            }
            s.readBits(1);
        }
    },
    [ObjectType.DeadBody]: {
        serializePart(s, data) {
            s.writeVec(data.pos, 0, 0, 1024, 1024, 16);
        },
        serializeFull(s, data) {
            s.writeUint8(data.layer);
            s.writeUint16(data.playerId);
        }
    },
    [ObjectType.Decal]: {
        serializePart() { },
        serializeFull(s, data) {
            s.writeVec(data.pos, 0, 0, 1024, 1024, 16);
            s.writeFloat(data.scale, NetConstants.MapObjectMinScale, NetConstants.MapObjectMaxScale, 8);
            s.writeMapType(data.type);
            s.writeBits(data.ori, 2);
            s.writeBits(data.layer, 2);
            s.writeUint8(data.goreKills);
        }
    },
    [ObjectType.Projectile]: {
        serializePart(s, data) {
            s.writeVec(data.pos, 0, 0, 1024, 1024, 16);
            s.writeFloat(data.posZ, 0, gameConfig.projectile.maxHeight, 10);
            s.writeUnitVec(data.dir, 7);
        },
        serializeFull(s, data) {
            s.writeGameType(data.type);
            s.writeBits(data.layer, 2);
            s.writeBits(0, 4);
        }
    },
    [ObjectType.Smoke]: {
        serializePart(s, data) {
            s.writeVec(data.pos, 0, 0, 1024, 1024, 16);
            s.writeFloat(data.rad, 0, NetConstants.SmokeMaxRad, 8);
        },
        serializeFull(s, data) {
            s.writeBits(data.layer, 2);
            s.writeBits(data.interior, 6);
        }
    },
    [ObjectType.Airdrop]: {
        serializePart(s, data) {
            s.writeFloat(data.fallT, 0, 1, 7);
            s.writeBoolean(data.landed);
        },
        serializeFull(s, data) {
            s.writeVec(data.pos, 0, 0, 1024, 1024, 16);
        }
    },
    [ObjectType.Invalid]: {
        serializePart() { },
        serializeFull() { }
    },
    [ObjectType.LootSpawner]: {
        serializePart() { },
        serializeFull() { }
    }
};

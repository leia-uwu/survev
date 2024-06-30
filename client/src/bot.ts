import { EmotesDefs } from "../../shared/defs/gameObjects/emoteDefs";
import { MeleeDefs } from "../../shared/defs/gameObjects/meleeDefs";
import { OutfitDefs } from "../../shared/defs/gameObjects/outfitDefs";
import { UnlockDefs } from "../../shared/defs/gameObjects/unlockDefs";
import { GameConfig } from "../../shared/gameConfig";
import { AliveCountsMsg } from "../../shared/msgs/aliveCountsMsg";
import { DisconnectMsg } from "../../shared/msgs/disconnectMsg";
import { EmoteMsg } from "../../shared/msgs/emoteMsg";
import { GameOverMsg } from "../../shared/msgs/gameOverMsg";
import { InputMsg } from "../../shared/msgs/inputMsg";
import { JoinMsg } from "../../shared/msgs/joinMsg";
import { JoinedMsg } from "../../shared/msgs/joinedMsg";
import { KillMsg } from "../../shared/msgs/killMsg";
import { MapMsg } from "../../shared/msgs/mapMsg";
import { PickupMsg } from "../../shared/msgs/pickupMsg";
import { PlayerStatsMsg } from "../../shared/msgs/playerStatsMsg";
import { RoleAnnouncementMsg } from "../../shared/msgs/roleAnnouncementMsg";
import { UpdateMsg } from "../../shared/msgs/updateMsg";
import {
    type BitStream,
    type Msg,
    MsgStream,
    MsgType,
    StatsMsg,
    UpdatePassMsg
} from "../../shared/net";
import { util } from "../../shared/utils/util";
import { v2 } from "../../shared/utils/v2";
import {
    type ObjectData,
    ObjectType,
    type ObjectsFullData,
    type ObjectsPartialData
} from "../../shared/utils/objectSerializeFns";
import { type Game } from "../../server/src/game";
import { type GameSocketData } from "../../server/src/server";

//
// Cache random loadout types
//
const outfits: string[] = [];
for (const outfit in OutfitDefs) {
    if (!UnlockDefs.unlock_default.unlocks.includes(outfit)) continue;
    outfits.push(outfit);
}

const emotes: string[] = [];
for (const emote in EmotesDefs) {
    if (!UnlockDefs.unlock_default.unlocks.includes(emote)) continue;
    emotes.push(emote);
}

const melees: string[] = [];
for (const melee in MeleeDefs) {
    if (!UnlockDefs.unlock_default.unlocks.includes(melee)) continue;
    melees.push(melee);
}

interface GameObject {
    __id: number
    __type: ObjectType
    data: ObjectsPartialData[ObjectType] & ObjectsFullData[ObjectType]
}

class ObjectCreator {
    idToObj: Record<number, GameObject> = {};

    getObjById(id: number) {
        return this.idToObj[id];
    }

    getTypeById(id: number, s: BitStream) {
        const obj = this.getObjById(id);
        if (!obj) {
            const err = {
                id,
                ids: Object.keys(this.idToObj),
                stream: s._view._view
            };
            console.error("objectPoolErr", `getTypeById${JSON.stringify(err)}`);
            return ObjectType.Invalid;
        }
        return obj.__type;
    }

    updateObjFull<Type extends ObjectType>(
        type: Type,
        id: number,
        data: ObjectData<Type>
    ) {
        let obj = this.getObjById(id);
        if (obj === undefined) {
            obj = {} as GameObject;
            obj.__id = id;
            obj.__type = type;
            this.idToObj[id] = obj;
        }
        obj.data = data;
        return obj;
    }

    updateObjPart<Type extends ObjectType>(id: number, data: ObjectsPartialData[Type]) {
        const obj = this.getObjById(id);
        if (obj) {
            for (const dataKey in data) {
                // @ts-expect-error too lazy;
                obj.data[dataKey] = data;
            }
        } else {
            console.error("updateObjPart, missing object", id);
        }
    }

    deleteObj(id: number) {
        const obj = this.getObjById(id);
        if (obj === undefined) {
            console.error("deleteObj, missing object", id);
        } else {
            delete this.idToObj[id];
        }
    }
}

export class Bot {
    moving = {
        up: false,
        down: false,
        left: false,
        right: false
    };

    shootStart = false;

    interact = false;

    emotes!: string[];

    emote = false;

    angle = util.random(-Math.PI, Math.PI);
    angularSpeed = util.random(0, 0.1);

    toMouseLen = 50;

    connected = false;

    disconnect = false;

    id: number;

    ws: WebSocket;

    objectCreator = new ObjectCreator();

    constructor(game: Game, id = -1) {
        this.id = id;
        const This = this;
        const socketData: GameSocketData = {
            gameID: game.id,
            sendMsg(msg: ArrayBuffer) {
                const msgStream = new MsgStream(msg);
                while (true) {
                    const type = msgStream.deserializeMsgType();
                    if (type == MsgType.None) {
                        break;
                    }
                    This.onMsg(type, msgStream.getStream());
                }
            },
            closeSocket() {}
        };

        this.ws = {
            send(data: ArrayBuffer) {
                game.handleMsg(data, socketData);
            },
            close() {}
        } as unknown as WebSocket;

        this.join();
    }

    onMsg(type: number, stream: BitStream): void {
        switch (type) {
        case MsgType.Joined: {
            const msg = new JoinedMsg();
            msg.deserialize(stream);
            this.emotes = msg.emotes;
            break;
        }
        case MsgType.Map: {
            const msg = new MapMsg();
            msg.deserialize(stream);
            break;
        }
        case MsgType.Update: {
            const msg = new UpdateMsg();
            msg.deserialize(stream, this.objectCreator);

            // Delete objects
            for (let i = 0; i < msg.delObjIds.length; i++) {
                this.objectCreator.deleteObj(msg.delObjIds[i]);
            }

            // Update full objects
            for (let i = 0; i < msg.fullObjects.length; i++) {
                const obj = msg.fullObjects[i];
                this.objectCreator.updateObjFull(obj.__type, obj.__id, obj);
            }

            // Update partial objects
            for (let i = 0; i < msg.partObjects.length; i++) {
                const obj = msg.partObjects[i];
                this.objectCreator.updateObjPart(obj.__id, obj);
            }

            break;
        }
        case MsgType.Kill: {
            const msg = new KillMsg();
            msg.deserialize(stream);
            break;
        }
        case MsgType.RoleAnnouncement: {
            const msg = new RoleAnnouncementMsg();
            msg.deserialize(stream);
            break;
        }
        case MsgType.PlayerStats: {
            const msg = new PlayerStatsMsg();
            msg.deserialize(stream);
            break;
        }
        case MsgType.Stats: {
            const msg = new StatsMsg();
            msg.deserialize(stream);
            break;
        }
        case MsgType.GameOver: {
            const msg = new GameOverMsg();
            msg.deserialize(stream);
            console.log(
                `Bot ${this.id} ${msg.gameOver ? "won" : "died"} | kills: ${
                    msg.playerStats[0].kills
                } | rank: ${msg.teamRank}`
            );
            this.disconnect = true;
            this.connected = false;
            this.ws.close();
            break;
        }
        case MsgType.Pickup: {
            const msg = new PickupMsg();
            msg.deserialize(stream);
            break;
        }
        case MsgType.UpdatePass: {
            new UpdatePassMsg().deserialize(stream);
            break;
        }
        case MsgType.AliveCounts: {
            const msg = new AliveCountsMsg();
            msg.deserialize(stream);
            break;
        }
        case MsgType.Disconnect: {
            const msg = new DisconnectMsg();
            msg.deserialize(stream);
        }
        }
    }

    stream = new MsgStream(new ArrayBuffer(1024));

    join(): void {
        this.connected = true;
        const emote = (): string => emotes[util.randomInt(0, emotes.length - 1)];

        const joinMsg = new JoinMsg();

        joinMsg.name = `BOT_${this.id}`;
        joinMsg.isMobile = false;
        joinMsg.protocol = GameConfig.protocolVersion;

        joinMsg.loadout = {
            melee: melees[util.randomInt(0, melees.length - 1)],
            outfit: outfits[util.randomInt(0, outfits.length - 1)],
            heal: "heal_basic",
            boost: "boost_basic",
            emotes: [emote(), emote(), emote(), emote(), emote(), emote()]
        };
        this.connected = true;
        this.sendMsg(joinMsg, MsgType.Join);
    }

    sendMsg(msg: Msg, type: MsgType): void {
        this.stream.stream.index = 0;
        this.stream.serializeMsg(type, msg);

        this.ws.send(this.stream.getBuffer());
    }

    sendInputs(): void {
        if (!this.connected) return;

        const inputPacket = new InputMsg();

        inputPacket.moveDown = this.moving.down;
        inputPacket.moveUp = this.moving.up;
        inputPacket.moveLeft = this.moving.left;
        inputPacket.moveRight = this.moving.right;

        inputPacket.shootStart = this.shootStart;

        inputPacket.toMouseDir = v2.create(
            Math.cos(this.angle),
            Math.sin(this.angle)
        );
        inputPacket.toMouseLen = this.toMouseLen;

        this.angle += this.angularSpeed;
        if (this.angle > Math.PI) this.angle = -Math.PI;

        if (this.interact) {
            inputPacket.addInput(GameConfig.Input.Interact);
        }

        this.sendMsg(inputPacket, MsgType.Input);

        if (this.emote) {
            const emoteMsg = new EmoteMsg();
            emoteMsg.type = this.emotes[util.randomInt(0, this.emotes.length - 1)];
        }
    }

    updateInputs(): void {
        this.moving = {
            up: false,
            down: false,
            left: false,
            right: false
        };

        this.shootStart = Math.random() < 0.5;
        this.interact = Math.random() < 0.5;
        this.emote = Math.random() < 0.5;

        switch (util.randomInt(1, 8)) {
        case 1:
            this.moving.up = true;
            break;
        case 2:
            this.moving.down = true;
            break;
        case 3:
            this.moving.left = true;
            break;
        case 4:
            this.moving.right = true;
            break;
        case 5:
            this.moving.up = true;
            this.moving.left = true;
            break;
        case 6:
            this.moving.up = true;
            this.moving.right = true;
            break;
        case 7:
            this.moving.down = true;
            this.moving.left = true;
            break;
        case 8:
            this.moving.down = true;
            this.moving.right = true;
            break;
        }
    }
}

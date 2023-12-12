import { type WebSocket } from "uWebSockets.js";
import { type Game } from "../game";
import { gameConfig } from "../gameConfig";
import { type ObjectsFullData, type ObjectsPartialData } from "../net/objectSerialization";
import { type PlayerInfo, type ActivePlayerData, UpdateMsg } from "../net/updateMsg";
import { collider } from "../utils/collider";
import { type Vec2, v2 } from "../utils/v2";
import { GameObject, ObjectType } from "./gameObject";
import { type PlayerContainer } from "../server";
import { MsgStream, MsgType } from "../net/net";
import { coldet } from "../utils/coldet";
import { InputMsg } from "../net/inputMsg";
import { JoinedMsg } from "../net/joinedMsg";
import { util } from "../utils/util";
import { GameObjectDefs } from "../defs/gameObjectDefs";
import { Obstacle } from "./obstacle";
import { WeaponManager } from "../utils/weaponManager";
import { AliveCountMsg } from "../net/aliveCountMsg";
import { GameObjectDef } from "../defs/objectsTypings";
import math from "../utils/math";

type PlayerFullData = ObjectsFullData[ObjectType.Player];
type PlayerPartialData = ObjectsPartialData[ObjectType.Player];

export class Player extends GameObject implements PlayerFullData, PlayerPartialData, ActivePlayerData, PlayerInfo {
    override readonly kind = ObjectType.Player;

    get bounds() {
        return collider.createCircle(this.pos, gameConfig.player.maxVisualRadius);
    }

    scale = 1;

    get hasScale(): boolean {
        return this.scale !== 1;
    }

    get rad(): number {
        return gameConfig.player.radius * this.scale;
    }

    dir = v2.create(0, 0);

    dirty = {
        health: true,
        boost: true,
        zoom: true,
        action: false,
        inventory: true,
        weapons: true,
        spectatorCount: false,
        activeId: true
    };

    private _health: number = gameConfig.player.health;

    get health(): number {
        return this._health;
    }

    set health(health: number) {
        if (this._health === health) return;
        this._health = health;
        this._health = math.clamp(this._health, 0, gameConfig.player.health);
        this.dirty.health = true;
    }

    boost = 0;

    zoomDirty = true;
    zoom = gameConfig.scopeZoomRadius.desktop["1xscope"];

    action!: { time: number, duration: number, targetId: number };

    inventoryDirty = true;
    scope = "1xscope";

    inventory: Record<string, number> = {};

    curWeapIdx = 2;
    weapons: Array<{ type: string, ammo: number }> = [
        {
            type: "",
            ammo: 0
        },
        {
            type: "",
            ammo: 0
        },
        {
            type: "pan",
            ammo: 0
        },
        {
            type: "",
            ammo: 0
        }
    ];

    spectatorCountDirty = false;
    spectatorCount = 0;

    outfit = "outfitBase";
    pack = "backpack00";
    helmet = "";
    chest = "";

    get activeWeapon() {
        return this.weapons[this.curWeapIdx].type;
    }

    layer = 0;
    dead = false;
    downed = false;

    animType: number = gameConfig.Anim.None;
    animSeq = 0;

    actionType: number = gameConfig.Action.None;
    actionSeq = 0;

    wearingPan = false;
    healEffect = false;
    frozen = false;
    frozenOri = 0;

    get hasHaste(): boolean {
        return this.hasteType !== gameConfig.HasteType.None;
    }

    hasteType = gameConfig.HasteType.None;
    hasteSeq = 0;

    actionItem = "";

    get hasRole(): boolean {
        return this.role !== "";
    }

    role = "";

    get hasPerks(): boolean {
        return this.perks.length > 0;
    }

    perks: Array<{ type: string, droppable: boolean }> = [];

    name = "Player";

    teamId = 0;
    groupId = 0;

    loadout = {
        heal: "heal_basic",
        boost: "boost_basic",
        emotes: [
            "emote_happyface",
            "emote_happyface",
            "emote_happyface",
            "emote_happyface"
        ]
    };

    damageTaken = 0;
    damageDealt = 0;

    socket: WebSocket<PlayerContainer>;

    weaponManager = new WeaponManager(this);

    constructor(game: Game, pos: Vec2, socket: WebSocket<PlayerContainer>) {
        super(game, pos);
        this.socket = socket;

        for (const item in gameConfig.bagSizes) {
            this.inventory[item] = 0;
        }
        this.inventory[this.scope] = 1;
    }

    visibleObjects = new Set<GameObject>();

    lastInputMsg = new InputMsg();

    update(): void {
        const input = this.lastInputMsg;

        const lastPos = v2.copy(this.pos);

        const movement = v2.create(0, 0);
        if (input.moveUp) movement.y++;
        if (input.moveDown) movement.y--;
        if (input.moveLeft) movement.x--;
        if (input.moveRight) movement.x++;

        if (movement.x * movement.y !== 0) { // If the product is non-zero, then both of the components must be non-zero
            movement.x *= Math.SQRT1_2;
            movement.y *= Math.SQRT1_2;
        }

        this.pos = v2.add(this.pos, v2.mul(movement, this.game.config.movementSpeed * this.game.dt));

        for (let step = 0; step < 10; step++) {
            let collided = false;
            const coll = collider.createCircle(this.pos, this.rad);
            const objs = this.game.grid.intersectCollider(coll);

            for (const obj of objs) {
                if (obj instanceof Obstacle &&
                    obj.collidable &&
                    util.sameLayer(obj.layer, this.layer) &&
                    !obj.dead
                ) {
                    const collision = collider.intersect(coll, obj.collider);
                    if (collision) {
                        collided = true;
                        this.pos = v2.sub(this.pos, v2.mul(collision.dir, collision.pen));
                    }
                }
            }
            if (!collided) break;
        }

        if (!v2.eq(this.pos, lastPos)) {
            this.setPartDirty();
            this.game.grid.addObject(this);
        }

        this.weaponManager.update();
    }

    private _firstUpdate = true;

    sendMsgs(): void {
        const msgStream = new MsgStream(new ArrayBuffer(65536));

        if (this._firstUpdate) {
            const joinedMsg = new JoinedMsg();
            joinedMsg.playerId = this.id;
            joinedMsg.emotes = this.loadout.emotes;
            const joinedStream = new MsgStream(new ArrayBuffer(64));
            joinedStream.serializeMsg(MsgType.Joined, joinedMsg);
            this.sendData(joinedStream.getBuffer());

            const mapStream = this.game.map.mapStream.stream;

            msgStream.stream.writeBytes(mapStream, 0, mapStream.byteIndex);
        }

        if (this.game.aliveCountDirty) {
            const aliveMsg = new AliveCountMsg();
            aliveMsg.aliveCounts.push(this.game.livingPlayers.size);
            msgStream.serializeMsg(MsgType.AliveCounts, aliveMsg);
        }

        const updateMsg = new UpdateMsg();

        const radius = this.zoom + 4;
        const rect = coldet.circleToAabb(this.pos, radius);

        const newVisibleObjects = this.game.grid.intersectCollider(rect);

        for (const obj of this.visibleObjects) {
            if (!newVisibleObjects.has(obj)) {
                updateMsg.delObjIds.push(obj.id);
            }
        }

        for (const obj of newVisibleObjects) {
            if (!this.visibleObjects.has(obj)) {
                updateMsg.fullObjects.push(obj);
            }
        }

        for (const obj of this.game.fullObjs) {
            if (this.visibleObjects.has(obj)) {
                updateMsg.fullObjects.push(obj);
            }
        }

        for (const obj of this.game.partialObjs) {
            if (this.visibleObjects.has(obj) && !updateMsg.fullObjects.includes(obj)) {
                updateMsg.partObjects.push(obj);
            }
        }
        this.visibleObjects = newVisibleObjects;

        updateMsg.activePlayerId = this.id;
        updateMsg.activePlayerIdDirty = this.dirty.activeId;
        updateMsg.activePlayerData = this;
        updateMsg.playerInfos = this._firstUpdate ? [...this.game.players] : this.game.newPlayers;

        msgStream.serializeMsg(MsgType.Update, updateMsg);

        this.sendData(msgStream.getBuffer());
        this._firstUpdate = false;
    }

    damage(amount: number, source: GameObject, sourceDef: GameObjectDef, damageType: number) {
        if (this._health < 0) this._health = 0;
        if (this.dead) return;

        let finalDamage: number = amount;

                const chest = GameObjectDefs[this.chest];
        if (chest !== undefined && chest.type === "chest") {
            finalDamage -= finalDamage * chest.damageReduction;
        }

        const helmet = GameObjectDefs[this.helmet];
        if (helmet !== undefined && helmet.type === "helmet") {
            finalDamage -= finalDamage * helmet.damageReduction;
        }
        if (this._health - finalDamage < 0) finalDamage += this._health - finalDamage;

        this.damageTaken += finalDamage;
        if (source instanceof Player) source.damageDealt += finalDamage;

        this.health -= finalDamage;

        if (this._health === 0) {
            this.dead = true;
            this.boost = 0;
            this.actionType = this.actionSeq = 0;
            this.animType = this.animSeq = 0;
            this.setDirty();
        }
    }

    handleInput(msg: InputMsg): void {
        if (this.dead) return;
        this.lastInputMsg = msg;

        if (!v2.eq(this.dir, msg.toMouseDir)) this.setPartDirty();
        this.dir = msg.toMouseDir;

        if (msg.shootStart) {
            this.weaponManager.shootStart();
        }
        if (msg.shootHold) {
            this.weaponManager.shootHold();
        }
    }

    sendData(buffer: ArrayBuffer): void {
        try {
            this.socket.send(buffer, true, true);
        } catch (e) {
            console.warn("Error sending packet. Details:", e);
        }
    }
}

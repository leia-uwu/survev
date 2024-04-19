import { type Game } from "../game";
import { GameConfig } from "../../../shared/gameConfig";
import { collider } from "../../../shared/utils/collider";
import { type Vec2, v2 } from "../../../shared/utils/v2";
import { BaseGameObject, type GameObject } from "./gameObject";
import { type Circle, coldet } from "../../../shared/utils/coldet";
import { util } from "../../../shared/utils/util";
import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";
import { type Obstacle } from "./obstacle";
import { WeaponManager } from "../utils/weaponManager";
import { math } from "../../../shared/utils/math";
import { DeadBody } from "./deadBody";
import { type OutfitDef, type GunDef, type MeleeDef, type ThrowableDef, type HelmetDef, type ChestDef, type BackpackDef, type HealDef, type BoostDef, type ScopeDef, type LootDef } from "../../../shared/defs/objectsTypings";
import { MeleeDefs } from "../../../shared/defs/gameObjects/meleeDefs";
import { Structure } from "./structure";
import { type Loot } from "./loot";
import { MapObjectDefs } from "../../../shared/defs/mapObjectDefs";
import { type ServerSocket } from "../abstractServer";
import { GEAR_TYPES, SCOPE_LEVELS } from "../../../shared/defs/gameObjects/gearDefs";
import { MsgStream, MsgType, PickupMsgType, Constants, type Msg } from "../../../shared/net";
import { type DropItemMsg } from "../../../shared/msgs/dropItemMsg";
import { UpdateMsg } from "../../../shared/msgs/updateMsg";
import { KillMsg } from "../../../shared/msgs/killMsg";
import { AliveCountsMsg } from "../../../shared/msgs/aliveCountsMsg";
import { PickupMsg } from "../../../shared/msgs/pickupMsg";
import { JoinedMsg } from "../../../shared/msgs/joinedMsg";
import { InputMsg } from "../../../shared/msgs/inputMsg";
import { GameOverMsg } from "../../../shared/msgs/gameOverMsg";
import { ObjectType } from "../../../shared/utils/objectSerializeFns";

export class Emote {
    playerId: number;
    pos: Vec2;
    type: string;
    isPing: boolean;
    itemType!: string;

    constructor(playerId: number, pos: Vec2, type: string, isPing: boolean) {
        this.playerId = playerId;
        this.pos = pos;
        this.type = type;
        this.isPing = isPing;
    }
}

export class Player extends BaseGameObject {
    override readonly __type = ObjectType.Player;

    bounds = collider.toAabb(collider.createCircle(v2.create(0, 0), GameConfig.player.maxVisualRadius));

    scale = 1;

    get hasScale(): boolean {
        return this.scale !== 1;
    }

    get rad(): number {
        return GameConfig.player.radius * this.scale;
    }

    set rad(rad: number) {
        this.collider.rad = rad;
        this.rad = rad;
    }

    get playerId() {
        return this.__id;
    }

    dir = v2.create(0, 0);

    posOld = v2.create(0, 0);
    dirOld = v2.create(0, 0);

    collider: Circle;

    get pos() {
        return this.collider.pos;
    }

    set pos(pos: Vec2) {
        this.collider.pos = pos;
    }

    healthDirty = true;
    boostDirty = true;
    zoomDirty = true;
    actionDirty = false;
    inventoryDirty = true;
    weapsDirty = true;
    spectatorCountDirty = false;
    activeIdDirty = true;

    private _health: number = GameConfig.player.health;

    get health(): number {
        return this._health;
    }

    set health(health: number) {
        if (this._health === health) return;
        this._health = health;
        this._health = math.clamp(this._health, 0, GameConfig.player.health);
        this.healthDirty = true;
    }

    private _boost: number = 0;

    get boost(): number {
        return this._boost;
    }

    set boost(boost: number) {
        if (this._boost === boost) return;
        this._boost = boost;
        this._boost = math.clamp(this._boost, 0, 100);
        this.boostDirty = true;
    }

    speed: number = 0;

    shotSlowdownTimer: number = -1;

    indoors = false;

    private _zoom: number = 0;

    get zoom(): number {
        return this._zoom;
    }

    set zoom(zoom: number) {
        if (zoom === this._zoom) return;
        this._zoom = zoom;
        this.zoomDirty = true;
    }

    action: { time: number, duration: number, targetId: number };
    lastAction!: { time: number, duration: number, targetId: number };

    private _scope = "1xscope";

    get scope() {
        return this._scope;
    }

    set scope(scope: string) {
        if (this.scope === scope) return;
        this._scope = scope;

        if (this.isMobile) this.zoom = GameConfig.scopeZoomRadius.desktop[this._scope];
        else this.zoom = GameConfig.scopeZoomRadius.mobile[this._scope];

        this.inventoryDirty = true;
    }

    inventory: Record<string, number> = {};

    get curWeapIdx() {
        return this.weaponManager.curWeapIdx;
    }

    get weapons() {
        return this.weaponManager.weapons;
    }

    get activeWeapon() {
        return this.weaponManager.activeWeapon;
    }

    spectatorCount = 0;

    spectating?: Player;

    outfit = "outfitBase";
    /** "backpack00" is no backpack, "backpack03" is the max level backpack */
    backpack = "backpack00";
    /** "" is no helmet, "helmet03" is the max level helmet */
    helmet = "";
    /** "" is no chest, "chest03" is the max level chest */
    chest = "";

    getGearLevel(type: string): number {
        if (!type) { // not wearing any armor, level 0
            return 0;
        } else {
            return (GameObjectDefs[type] as BackpackDef | HelmetDef | ChestDef).level;
        }
    }

    layer = 0;
    aimLayer = 0;
    dead = false;
    downed = false;

    private _animType: number = GameConfig.Anim.None;
    get animType() {
        return this._animType;
    }

    set animType(anim: number) {
        if (this._animType === anim) return;
        this._animType = anim;
        this.animSeq++;
        this.setDirty();
    }

    animSeq = 0;

    actionType: number = GameConfig.Action.None;
    actionSeq = 0;

    lastActionType: number = GameConfig.Action.None;

    /**
     * specifically for reloading single shot guns to keep reloading until maxClip is reached
     */
    performActionAgain: boolean = false;
    /**
     * specifically for things like buffering 2 actions trying to run simultaneously.
     * also for automatically reloading if switching to gun with 0 loaded ammo
     */
    scheduledAction: {
        perform: boolean
        type: typeof GameConfig.Action[keyof typeof GameConfig.Action]
        item: string
    } = {
            perform: false,
            type: GameConfig.Action.None,
            item: ""
        };

    ticksSinceLastAction = 0;

    get wearingPan(): boolean {
        return this.weapons.find(weapon => weapon.type === "pan") !== undefined && this.activeWeapon !== "pan";
    }

    healEffect = false;
    frozen = false;
    frozenOri = 0;

    get hasHaste(): boolean {
        return this.hasteType !== GameConfig.HasteType.None;
    }

    hasteType: number = GameConfig.HasteType.None;
    hasteSeq = 0;

    actionItem = "";
    lastActionItem = "";

    get hasRole(): boolean {
        return this.role !== "";
    }

    role = "";

    perks: Array<{ type: string, droppable: boolean }> = [];

    perkTypes: string[] = [];

    addPerk(type: string, droppable = false) {
        this.perks.push({
            type,
            droppable
        });
        this.perkTypes.push(type);
    }

    removePerk(type: string): void {
        const idx = this.perks.findIndex(perk => perk.type === type);
        this.perks.splice(idx, 1);
        this.perkTypes.splice(this.perkTypes.indexOf(type));
    }

    get hasPerks(): boolean {
        return this.perks.length > 0;
    }

    hasPerk(type: string) {
        return this.perkTypes.includes(type);
    }

    hasActivePan() {
        return (
            this.wearingPan ||
            (this.activeWeapon === "pan" &&
                this.animType !== GameConfig.Anim.Melee)
        );
    }

    getPanSegment() {
        const type = this.wearingPan ? "unequipped" : "equipped";
        return MeleeDefs.pan.reflectSurface[type];
    }

    name = "Player";
    isMobile: boolean = false;

    teamId = 1;
    groupId = 0;

    loadout = {
        heal: "heal_basic",
        boost: "boost_basic",
        emotes: [] as string[]
    };

    damageTaken = 0;
    damageDealt = 0;
    joinedTime = 0;
    kills = 0;

    get timeAlive(): number {
        return (Date.now() - this.joinedTime) / 1000;
    }

    socket: ServerSocket;

    msgsToSend: Array<{ type: number, msg: Msg }> = [];

    weaponManager = new WeaponManager(this);
    recoilTicker = 0;

    constructor(game: Game, pos: Vec2, socket: ServerSocket) {
        super(game, pos);
        this.socket = socket;

        this.collider = collider.createCircle(pos, this.rad);

        if (game.config.map !== "faction") {
            this.groupId = this.teamId = ++this.game.nextGroupId;
        }

        for (const item in GameConfig.bagSizes) {
            this.inventory[item] = 0;
        }
        this.inventory["1xscope"] = 1;
        this.inventory[this.scope] = 1;

        this.action = { time: -1, duration: 0, targetId: -1 };
    }

    visibleObjects = new Set<GameObject>();

    lastInputMsg = new InputMsg();

    update(): void {
        if (this.dead) return;
        this.ticksSinceLastAction++;
        // console.log(this.weapons.slice(0, 1).map(w => w.cooldown - this.game.now));

        const input = this.lastInputMsg;

        this.posOld = v2.copy(this.pos);

        const movement = v2.create(0, 0);

        if (this.lastInputMsg.touchMoveActive) {
            movement.x = this.lastInputMsg.touchMoveDir.x;
            movement.y = this.lastInputMsg.touchMoveDir.y;
        } else {
            if (input.moveUp) movement.y++;
            if (input.moveDown) movement.y--;
            if (input.moveLeft) movement.x--;
            if (input.moveRight) movement.x++;

            if (movement.x * movement.y !== 0) { // If the product is non-zero, then both of the components must be non-zero
                movement.x *= Math.SQRT1_2;
                movement.y *= Math.SQRT1_2;
            }
        }

        if (this.boost > 0) {
            this.boost -= 0.375 * this.game.dt;
        }
        if (this.boost > 0 && this.boost <= 25) this.health += 1 * this.game.dt;
        else if (this.boost > 25 && this.boost <= 50) this.health += 3.75 * this.game.dt;
        else if (this.boost > 50 && this.boost <= 87.5) this.health += 4.75 * this.game.dt;
        else if (this.boost > 87.5 && this.boost <= 100) this.health += 5 * this.game.dt;

        if (this.game.gas.doDamge && this.game.gas.isInGas(this.pos)) {
            this.damage(this.game.gas.damage, "", GameConfig.DamageType.Gas, undefined);
        }

        if (this.performActionAgain) {
            this.performActionAgain = false;
            this.doAction(this.lastActionItem, this.lastActionType, this.lastAction.duration);
        }

        if (this.scheduledAction.perform && this.ticksSinceLastAction > 1) {
            switch (this.scheduledAction.type) {
            case GameConfig.Action.Reload: {
                if (GameConfig.WeaponType[this.curWeapIdx] === "gun" && this.weapons[this.curWeapIdx].ammo == 0) {
                    this.weaponManager.reload();
                }
                break;
            }
            case GameConfig.Action.UseItem: {
                switch (this.scheduledAction.item) {
                case "bandage":
                case "healthkit": {
                    this.useHealingItem(this.scheduledAction.item);
                    break;
                }
                case "soda":
                case "painkiller": {
                    this.useBoostItem(this.scheduledAction.item);
                    break;
                }
                }
                break;
            }
            }
            this.scheduledAction.type = GameConfig.Action.None;
            this.scheduledAction.item = "";
            this.scheduledAction.perform = false;
            this.ticksSinceLastAction = 0;
        }

        // handle heal and boost actions
        let actionTimeThreshold;// hacky but works, couldnt find a better way
        if (this.action.time == -1) {
            actionTimeThreshold = -Date.now();
        } else {
            actionTimeThreshold = Date.now() + this.action.time * 1000 - this.action.duration * 1000;
        }
        if (actionTimeThreshold >= 0) {
            if (this.actionType == GameConfig.Action.UseItem) {
                const itemDef = GameObjectDefs[this.actionItem] as HealDef | BoostDef;
                if ("heal" in itemDef) this.health += itemDef.heal;
                if ("boost" in itemDef) this.boost += itemDef.boost;
                this.inventory[this.actionItem]--;
                this.inventoryDirty = true;
            } else if (this.actionType == GameConfig.Action.Reload) {
                const weaponInfo = GameObjectDefs[this.activeWeapon] as GunDef;
                const activeWeaponAmmo = this.weapons[this.curWeapIdx].ammo;
                const spaceLeft = weaponInfo.maxClip - activeWeaponAmmo; // if gun is 27/30 ammo, spaceLeft = 3

                if (this.inventory[weaponInfo.ammo] < spaceLeft) { // 27/30, inv = 2
                    if (weaponInfo.maxClip != weaponInfo.maxReload) { // m870, mosin, spas: only refill by one bullet at a time
                        this.weapons[this.curWeapIdx].ammo++;
                        this.inventory[weaponInfo.ammo]--;
                    } else { // mp5, sv98, ak47: refill to as much as you have left in your inventory
                        this.weapons[this.curWeapIdx].ammo += this.inventory[weaponInfo.ammo];
                        this.inventory[weaponInfo.ammo] = 0;
                    }
                } else { // 27/30, inv = 100
                    this.weapons[this.curWeapIdx].ammo += math.clamp(weaponInfo.maxReload, 0, spaceLeft);
                    this.inventory[weaponInfo.ammo] -= math.clamp(weaponInfo.maxReload, 0, spaceLeft);
                }

                // if you have an m870 with 2 ammo loaded and 0 ammo left in your inventory, your actual max clip is just 2 since you cant load anymore ammo
                const realMaxClip = this.inventory[weaponInfo.ammo] == 0 ? this.weapons[this.curWeapIdx].ammo : weaponInfo.maxClip;
                if (weaponInfo.maxClip != weaponInfo.maxReload && this.weapons[this.curWeapIdx].ammo != realMaxClip) {
                    this.performActionAgain = true;
                }

                this.inventoryDirty = true;
                this.weapsDirty = true;
            }
            if (this.performActionAgain) {
                this.lastAction = { ...this.action };// shallow copy so no references are kept
                this.lastActionItem = this.actionItem;
                this.lastActionType = this.actionType;
            }
            this.cancelAction();
        }

        this.recalculateSpeed();

        this.pos = v2.add(this.pos, v2.mul(movement, this.speed * this.game.dt));

        let collided = true;
        let step = 0;

        let objs: GameObject[];
        while (step < 20 && collided) {
            step++;
            collided = false;
            objs = this.game.grid.intersectCollider(this.collider);

            for (const obj of objs) {
                if (obj.__type === ObjectType.Obstacle &&
                    obj.collidable &&
                    util.sameLayer(obj.layer, this.layer) &&
                    !obj.dead
                ) {
                    const collision = collider.intersectCircle(obj.collider, this.pos, this.rad);
                    if (collision) {
                        collided = true;
                        this.pos = v2.add(this.pos, v2.mul(collision.dir, collision.pen + 0.001));
                    }
                }
            }
        }

        let onStair = false;
        const originalLayer = this.layer;

        const rot = Math.atan2(this.dir.y, this.dir.x);
        const ori = math.radToOri(rot);

        const scopeZoom = GameConfig.scopeZoomRadius[this.isMobile ? "mobile" : "desktop"][this.scope];
        let zoom = GameConfig.scopeZoomRadius[this.isMobile ? "mobile" : "desktop"]["1xscope"];

        let collidesWithZoomOut = false;
        for (const obj of objs!) {
            if (obj.__type === ObjectType.Structure) {
                for (const stair of obj.stairs) {
                    if (stair.lootOnly) continue;
                    if (Structure.checkStairs(this.pos, stair, this)) {
                        onStair = true;

                        if (ori === stair.downOri) this.aimLayer = 3;
                        else if (ori === stair.upOri) this.aimLayer = 2;
                        else this.aimLayer = this.layer;
                        break;
                    }
                }
                if (!onStair) {
                    if (this.layer === 2) this.layer = 0;
                    if (this.layer === 3) this.layer = 1;

                    this.aimLayer = this.layer;
                }
                if (this.layer !== originalLayer) {
                    this.setDirty();
                }
            } else if (obj.__type === ObjectType.Building) {
                let layer = this.layer;
                if (this.layer > 2) layer = 0;
                if (!util.sameLayer(util.toGroundLayer(layer), obj.layer) || obj.ceilingDead) continue;

                for (let i = 0; i < obj.zoomRegions.length; i++) {
                    const zoomRegion = obj.zoomRegions[i];

                    if (zoomRegion.zoomIn) {
                        if (coldet.testCircleAabb(this.pos, this.rad, zoomRegion.zoomIn.min, zoomRegion.zoomIn.max)) {
                            this.indoors = true;
                        }
                    }

                    if (zoomRegion.zoomOut && this.indoors) {
                        if (coldet.testCircleAabb(this.pos, this.rad, zoomRegion.zoomOut.min, zoomRegion.zoomOut.max)) {
                            collidesWithZoomOut = true;
                        }
                    }

                    if (this.indoors) zoom = zoomRegion.zoom ?? zoom;
                }
            } else if (obj.__type === ObjectType.Obstacle) {
                if (!util.sameLayer(this.layer, obj.layer)) continue;
                if (!(obj.isDoor && obj.door.autoOpen)) continue;

                const res = collider.intersectCircle(obj.collider, this.pos, this.rad + obj.interactionRad);
                if (res) {
                    obj.interact(this, true);
                }
            }
        }

        this.zoom = this.indoors ? zoom : scopeZoom;
        if (!collidesWithZoomOut) this.indoors = false;

        this.pos = math.v2Clamp(
            this.pos,
            v2.create(this.rad, this.rad),
            v2.create(this.game.map.width - this.rad, this.game.map.height - this.rad)
        );

        if (!v2.eq(this.pos, this.posOld)) {
            this.setPartDirty();
            this.game.grid.updateObject(this);
        }

        if (this.shotSlowdownTimer - Date.now() <= 0) {
            this.shotSlowdownTimer = -1;
        }
    }

    private _firstUpdate = true;
    fullUpdate = false;
    secondsSinceLastUpdate = 0;

    sendMsgs(): void {
        const msgStream = new MsgStream(new ArrayBuffer(65536));

        if (this._firstUpdate) {
            const joinedMsg = new JoinedMsg();
            joinedMsg.teamMode = 1;
            joinedMsg.playerId = this.__id;
            joinedMsg.started = this.game.started;
            joinedMsg.emotes = this.loadout.emotes;
            this.sendMsg(MsgType.Joined, joinedMsg);

            const mapStream = this.game.map.mapStream.stream;

            msgStream.stream.writeBytes(mapStream, 0, mapStream.byteIndex);
        }

        if (this.game.aliveCountDirty) {
            const aliveMsg = new AliveCountsMsg();
            aliveMsg.teamAliveCounts.push(this.game.aliveCount);
            msgStream.serializeMsg(MsgType.AliveCounts, aliveMsg);
        }

        const updateMsg = new UpdateMsg();

        if (this.game.gas.dirty || this._firstUpdate) {
            updateMsg.gasDirty = true;
            updateMsg.gasData = this.game.gas;
        }

        if (this.game.gas.timeDirty || this._firstUpdate) {
            updateMsg.gasTDirty = true;
            updateMsg.gasT = this.game.gas.gasT;
        }

        const player = this.spectating ?? this;

        const radius = player.zoom + 4;
        const rect = coldet.circleToAabb(player.pos, radius);

        this.secondsSinceLastUpdate += this.game.dt;
        if (this.game.grid.updateObjects ||
            this._firstUpdate ||
            this.fullUpdate ||
            this.secondsSinceLastUpdate > 0.5
        ) {
            this.secondsSinceLastUpdate = 0;
            const newVisibleObjects = new Set(this.game.grid.intersectCollider(rect));

            for (const obj of this.visibleObjects) {
                if (!newVisibleObjects.has(obj)) {
                    updateMsg.delObjIds.push(obj.__id);
                }
            }

            for (const obj of newVisibleObjects) {
                if (!this.visibleObjects.has(obj)) {
                    updateMsg.fullObjects.push(obj);
                }
            }

            this.visibleObjects = newVisibleObjects;
        }

        for (const obj of this.game.fullObjs) {
            if (this.visibleObjects.has(obj as GameObject)) {
                updateMsg.fullObjects.push(obj);
            }
        }

        for (const obj of this.game.partialObjs) {
            if (this.visibleObjects.has(obj as GameObject) && !updateMsg.fullObjects.includes(obj)) {
                updateMsg.partObjects.push(obj);
            }
        }

        updateMsg.activePlayerId = player.__id;
        updateMsg.activePlayerIdDirty = player.activeIdDirty || this.fullUpdate;
        updateMsg.activePlayerData = player;
        updateMsg.playerInfos = player._firstUpdate ? [...this.game.players] : this.game.newPlayers;

        for (const emote of this.game.emotes) {
            const emotePlayer = this.game.grid.getById(emote.playerId);
            if (emotePlayer && player.visibleObjects.has(emotePlayer)) {
                updateMsg.emotes.push(emote);
            }
        }

        let newBullets = [];
        const extendedRadius = 1.1 * radius;
        const radiusSquared = extendedRadius * extendedRadius;

        const bullets = this.game.bulletManager.newBullets;
        for (let i = 0; i < bullets.length; i++) {
            const bullet = bullets[i];
            if (v2.lengthSqr(v2.sub(bullet.pos, player.pos)) < radiusSquared ||
                v2.lengthSqr(v2.sub(bullet.clientEndPos, player.pos)) < radiusSquared ||
                coldet.intersectSegmentCircle(bullet.pos, bullet.clientEndPos, this.pos, extendedRadius)
            ) {
                newBullets.push(bullet);
            }
        }
        if (newBullets.length > 255) {
            console.error("Too many new bullets created!", newBullets.length);
            newBullets = newBullets.slice(0, 255);
        }

        updateMsg.bullets = newBullets;

        for (let i = 0; i < this.game.explosions.length; i++) {
            const explosion = this.game.explosions[i];
            const rad = explosion.rad + extendedRadius;
            if (v2.lengthSqr(v2.sub(explosion.pos, player.pos)) < rad * rad && updateMsg.explosions.length < 255) {
                updateMsg.explosions.push(explosion);
            }
        }
        if (updateMsg.explosions.length > 255) {
            console.error("Too many new explosions created!", updateMsg.explosions.length);
            updateMsg.explosions = updateMsg.explosions.slice(0, 255);
        }

        msgStream.serializeMsg(MsgType.Update, updateMsg);

        for (const msg of this.msgsToSend) {
            msgStream.serializeMsg(msg.type, msg.msg);
        }

        this.msgsToSend.length = 0;

        for (const msg of this.game.msgsToSend) {
            msgStream.serializeMsg(msg.type, msg.msg);
        }

        this.sendData(msgStream.getBuffer());
        this._firstUpdate = false;
    }

    damage(amount: number, sourceType: string, damageType: number, source: GameObject | undefined, isHeadShot = false) {
        if (this._health < 0) this._health = 0;
        if (this.dead) return;

        let finalDamage = amount;

        const chest = GameObjectDefs[this.chest] as ChestDef;

        if (chest && !isHeadShot) {
            finalDamage -= finalDamage * chest.damageReduction;
        }

        const helmet = GameObjectDefs[this.helmet] as HelmetDef;
        if (helmet) {
            finalDamage -= finalDamage * (helmet.damageReduction * (isHeadShot ? 1 : 0.3));
        }

        if (this._health - finalDamage < 0) finalDamage = this.health;

        this.damageTaken += finalDamage;
        if (source instanceof Player) source.damageDealt += finalDamage;

        this.health -= finalDamage;

        if (this._health === 0) {
            this.kill(sourceType, damageType, source);
        }
    }

    kill(sourceType: string, damageType: number, source?: GameObject): void {
        this.dead = true;
        this.boost = 0;
        this.actionType = this.actionSeq = 0;
        this.animType = this.animSeq = 0;
        this.setDirty();

        this.shootHold = false;
        for (const timeout of this.weaponManager.timeouts) {
            clearTimeout(timeout);
        }

        this.game.aliveCountDirty = true;
        this.game.livingPlayers.delete(this);

        const killMsg = new KillMsg();
        killMsg.damageType = damageType;
        killMsg.itemSourceType = GameObjectDefs[sourceType] ? sourceType : "";
        killMsg.mapSourceType = MapObjectDefs[sourceType] ? sourceType : "";
        killMsg.targetId = this.__id;
        killMsg.killed = true;

        if (source instanceof Player) {
            if (source !== this) source.kills++;
            killMsg.killerId = source.__id;
            killMsg.killCreditId = source.__id;
            killMsg.killerKills = source.kills;
        }

        this.game.msgsToSend.push({ type: MsgType.Kill, msg: killMsg });

        const gameOverMsg = new GameOverMsg();

        gameOverMsg.teamRank = this.game.aliveCount;
        gameOverMsg.playerStats.push(this);
        gameOverMsg.teamId = this.teamId;
        gameOverMsg.winningTeamId = -1;
        this.msgsToSend.push({ type: MsgType.GameOver, msg: gameOverMsg });

        const deadBody = new DeadBody(this.game, this.pos, this.__id, this.layer);
        this.game.grid.addObject(deadBody);

        //
        // drop loot
        //

        for (let i = 0; i < GameConfig.WeaponSlot.Count; i++) {
            const weap = this.weapons[i];
            if (!weap.type) continue;
            const def = GameObjectDefs[weap.type];
            switch (def.type) {
            case "gun":
                this.weaponManager.dropGun(i);
                break;
            case "melee":
                if (def.noDrop || def.noDropOnDeath || weap.type === "fists") break;
                this.game.lootBarn.addLoot(weap.type, this.pos, this.layer, 1);
                break;
            }
        }

        for (const item in GameConfig.bagSizes) {
            // const def = GameObjectDefs[item] as AmmoDef | HealDef;
            if (item == "1xscope") {
                continue;
            }

            if (this.inventory[item] > 0) {
                this.game.lootBarn.addLoot(item, this.pos, this.layer, this.inventory[item]);
            }
        }

        for (const item of GEAR_TYPES) {
            const type = this[item];
            if (!type) continue;
            const def = GameObjectDefs[type] as HelmetDef | ChestDef | BackpackDef;
            if (!!def.noDrop || def.level < 1) continue;
            this.game.lootBarn.addLoot(type, this.pos, this.layer, 1);
        }

        if (this.outfit) {
            const def = GameObjectDefs[this.outfit] as OutfitDef;
            if (!def.noDropOnDeath) {
                this.game.lootBarn.addLoot(this.outfit, this.pos, this.layer, 1);
            }
        }

        // death emote
        if (this.loadout.emotes[5] != "") {
            this.game.emotes.push(new Emote(this.__id, this.pos, this.loadout.emotes[5], false));
        }
    }

    useHealingItem(item: string): void {
        const itemDef = GameObjectDefs[item];
        if (itemDef.type !== "heal") {
            throw new Error(`Invalid heal item ${item}`);
        }
        if (this.health == itemDef.maxHeal || this.actionType == GameConfig.Action.UseItem) {
            return;
        }

        // healing gets action priority over reloading
        if (this.actionType == GameConfig.Action.Reload) {
            this.scheduleAction(item, GameConfig.Action.UseItem);
            return;
        }

        this.cancelAction();
        this.doAction(item, GameConfig.Action.UseItem, itemDef.useTime);
    }

    useBoostItem(item: string): void {
        const itemDef = GameObjectDefs[item];
        if (itemDef.type !== "boost") {
            throw new Error(`Invalid boost item ${item}`);
        }

        if (this.actionType == GameConfig.Action.UseItem) {
            return;
        }

        // healing gets action priority over reloading
        if (this.actionType == GameConfig.Action.Reload) {
            this.scheduleAction(item, GameConfig.Action.UseItem);
            return;
        }

        this.cancelAction();
        this.doAction(item, GameConfig.Action.UseItem, itemDef.useTime);
    }

    /**
     * schedules an action function to be called 1 tick after the current tick.
     * @param actionItem name of gun for reload, name of healing item for useitem
     * @param actionType reload, useitem, etc
     * @param shouldCancel if true, calls cancelAction() before doing anything else
     */
    scheduleAction(actionItem: string, actionType: typeof this.scheduledAction.type, shouldCancel = true) {
        if (shouldCancel) {
            this.cancelAction();
        }
        this.scheduledAction.perform = true;
        this.scheduledAction.item = actionItem;
        this.scheduledAction.type = actionType;
        this.ticksSinceLastAction = 0;
    }

    toMouseLen = 0;
    shootHold = false;
    shootStart = false;

    handleInput(msg: InputMsg): void {
        if (this.dead) return;
        this.lastInputMsg = msg;

        if (!v2.eq(this.dir, msg.toMouseDir)) {
            this.setPartDirty();
            this.dirOld = v2.copy(this.dir);
            this.dir = msg.toMouseDir;
        }
        this.shootHold = msg.shootHold;
        this.shootStart = msg.shootStart;
        this.toMouseLen = msg.toMouseLen;

        if (this.shootStart) {
            this.weaponManager.shootStart();
        }

        for (const input of msg.inputs) {
            switch (input) {
            case GameConfig.Input.StowWeapons:
            case GameConfig.Input.EquipMelee:
                this.weaponManager.setCurWeapIndex(GameConfig.WeaponSlot.Melee);
                break;
            case GameConfig.Input.EquipPrimary:
                this.weaponManager.setCurWeapIndex(GameConfig.WeaponSlot.Primary);
                break;
            case GameConfig.Input.EquipSecondary:
                this.weaponManager.setCurWeapIndex(GameConfig.WeaponSlot.Secondary);
                break;
            case GameConfig.Input.EquipThrowable:
                if (this.curWeapIdx === GameConfig.WeaponSlot.Throwable) {
                    this.weaponManager.showNextThrowable();
                } else {
                    this.weaponManager.setCurWeapIndex(GameConfig.WeaponSlot.Throwable);
                }
                break;
            case GameConfig.Input.EquipPrevWeap: {
                const curIdx = this.curWeapIdx;

                for (let i = curIdx; i < curIdx + GameConfig.WeaponSlot.Count; i++) {
                    const idx = math.mod(i, GameConfig.WeaponSlot.Count);
                    if (this.weapons[idx].type) {
                        this.weaponManager.setCurWeapIndex(idx);
                    }
                }
            }
                break;
            case GameConfig.Input.EquipNextWeap: {
                const curIdx = this.curWeapIdx;

                for (let i = curIdx; i > curIdx - GameConfig.WeaponSlot.Count; i--) {
                    const idx = math.mod(i, GameConfig.WeaponSlot.Count);
                    if (this.weapons[idx].type) {
                        this.weaponManager.setCurWeapIndex(idx);
                    }
                }
            }
                break;
            case GameConfig.Input.EquipLastWeap:
                this.weaponManager.setCurWeapIndex(this.weaponManager.lastWeaponIdx);
                break;
            case GameConfig.Input.EquipOtherGun:
                if (this.curWeapIdx == GameConfig.WeaponSlot.Primary || this.curWeapIdx == GameConfig.WeaponSlot.Secondary) {
                    const otherGunSlotIdx = this.curWeapIdx ^ 1;
                    const isOtherGunSlotFull: number = +!!this.weapons[otherGunSlotIdx].type;//! ! converts string to boolean, + coerces boolean to number
                    this.weaponManager.setCurWeapIndex(isOtherGunSlotFull ? otherGunSlotIdx : GameConfig.WeaponSlot.Melee);
                } else if (this.curWeapIdx == GameConfig.WeaponSlot.Melee && (this.weapons[GameConfig.WeaponSlot.Primary].type || this.weapons[GameConfig.WeaponSlot.Secondary].type)) {
                    this.weaponManager.setCurWeapIndex(+!(this.weapons[GameConfig.WeaponSlot.Primary].type));
                } else if (this.curWeapIdx == GameConfig.WeaponSlot.Throwable) {
                    const bothSlotsEmpty = !this.weapons[GameConfig.WeaponSlot.Primary].type && !this.weapons[GameConfig.WeaponSlot.Secondary].type;
                    if (bothSlotsEmpty) {
                        this.weaponManager.setCurWeapIndex(GameConfig.WeaponSlot.Melee);
                    } else {
                        this.weaponManager.setCurWeapIndex(this.curWeapIdx + (+(this.weapons[GameConfig.WeaponSlot.Primary].type)));
                    }
                }

                break;
            case GameConfig.Input.Interact: {
                const loot = this.getClosestLoot();
                if (loot) {
                    this.interactWith(loot);
                } else {
                    const obstacle = this.getClosestObstacle();
                    if (obstacle) this.interactWith(obstacle);
                }
                break;
            }
            case GameConfig.Input.Loot: {
                const loot = this.getClosestLoot();
                if (loot) {
                    this.interactWith(loot);
                }
                break;
            }
            case GameConfig.Input.Use: {
                const obstacle = this.getClosestObstacle();
                if (obstacle) obstacle.interact(this);
                break;
            }
            case GameConfig.Input.Reload:
                this.weaponManager.reload();
                break;
            case GameConfig.Input.UseBandage:
                this.useHealingItem("bandage");
                break;
            case GameConfig.Input.UseHealthKit:
                this.useHealingItem("healthkit");
                break;
            case GameConfig.Input.UsePainkiller:
                this.useBoostItem("soda");
                break;
            case GameConfig.Input.UseSoda:
                this.useBoostItem("painkiller");
                break;
            case GameConfig.Input.Cancel:
                this.cancelAction();
                break;
            case GameConfig.Input.EquipNextScope: {
                const scopeIdx = SCOPE_LEVELS.indexOf(this.scope);

                for (let i = scopeIdx + 1; i < SCOPE_LEVELS.length; i++) {
                    const nextScope = SCOPE_LEVELS[i];

                    if (!this.inventory[nextScope]) continue;
                    this.scope = nextScope;
                    break;
                }
                break;
            }
            case GameConfig.Input.EquipPrevScope: {
                const scopeIdx = SCOPE_LEVELS.indexOf(this.scope);

                for (let i = scopeIdx - 1; i >= 0; i--) {
                    const prevScope = SCOPE_LEVELS[i];

                    if (!this.inventory[prevScope]) continue;
                    this.scope = prevScope;
                    break;
                }
                break;
            }
            case GameConfig.Input.SwapWeapSlots: {
                const firstSlotWeaponType = this.weapons[GameConfig.WeaponSlot.Primary].type;
                const firstSlotWeaponAmmo = this.weapons[GameConfig.WeaponSlot.Primary].ammo;

                this.weapons[GameConfig.WeaponSlot.Primary].type = this.weapons[GameConfig.WeaponSlot.Secondary].type;
                this.weapons[GameConfig.WeaponSlot.Primary].ammo = this.weapons[GameConfig.WeaponSlot.Secondary].ammo;

                this.weapons[GameConfig.WeaponSlot.Secondary].type = firstSlotWeaponType;
                this.weapons[GameConfig.WeaponSlot.Secondary].ammo = firstSlotWeaponAmmo;

                // curWeapIdx's setter method already sets dirty.weapons
                if (this.curWeapIdx == GameConfig.WeaponSlot.Primary || this.curWeapIdx == GameConfig.WeaponSlot.Secondary) {
                    this.weaponManager.setCurWeapIndex(this.curWeapIdx ^ 1, false);
                } else {
                    this.weapsDirty = true;
                }
                break;
            }
            }
        }

        switch (msg.useItem) {
        case "bandage":
        case "healthkit":
            this.useHealingItem(msg.useItem);
            break;
        case "soda":
        case "painkiller":
            this.useBoostItem(msg.useItem);
            break;
        case "1xscope": case "2xscope": case "4xscope": case "8xscope": case "15xscope":
            this.scope = msg.useItem;
            break;
        }
    }

    getClosestLoot(): Loot | undefined {
        const objs = this.game.grid.intersectCollider(collider.createCircle(this.pos, this.rad + 5));

        let closestLoot: Loot | undefined;
        let closestDist = Number.MAX_VALUE;

        for (let i = 0; i < objs.length; i++) {
            const loot = objs[i];
            if (loot.__type !== ObjectType.Loot) continue;
            if (
                util.sameLayer(loot.layer, this.layer) &&
                (loot.ownerId == 0 || loot.ownerId == this.__id)
            ) {
                const pos = loot.pos;
                const rad = this.isMobile
                    ? this.rad + loot.rad * GameConfig.player.touchLootRadMult
                    : this.rad + loot.rad;
                const toPlayer = v2.sub(this.pos, pos);
                const distSq = v2.lengthSqr(toPlayer);
                if (distSq < rad * rad && distSq < closestDist) {
                    closestDist = distSq;
                    closestLoot = loot;
                }
            }
        }

        return closestLoot;
    }

    getClosestObstacle(): Obstacle | undefined {
        const objs = this.game.grid.intersectCollider(collider.createCircle(this.pos, this.rad + 5));

        let closestObj: Obstacle | undefined;
        let closestPen = 0;

        for (let i = 0; i < objs.length; i++) {
            const obstacle = objs[i];
            if (obstacle.__type !== ObjectType.Obstacle) continue;
            if (
                !obstacle.dead &&
                util.sameLayer(obstacle.layer, this.layer)
            ) {
                if (obstacle.interactionRad > 0) {
                    const res = collider.intersectCircle(
                        obstacle.collider,
                        this.pos,
                        obstacle.interactionRad + this.rad
                    );
                    if (res && res.pen >= closestPen) {
                        closestObj = obstacle;
                        closestPen = res.pen;
                    }
                }
            }
        }
        return closestObj;
    }

    interactWith(obj: GameObject): void {
        switch (obj.__type) {
        case ObjectType.Loot:
            this.pickupLoot(obj);
            break;
        case ObjectType.Obstacle:
            obj.interact(this);
            break;
        }
    }

    pickupLoot(obj: Loot) {
        const def = GameObjectDefs[obj.type];

        let amountLeft = 0;
        let lootToAdd = obj.type;
        let removeLoot = true;
        const pickupMsg = new PickupMsg();
        pickupMsg.item = obj.type;
        pickupMsg.type = PickupMsgType.Success;

        switch (def.type) {
        case "ammo":
        case "scope":
        case "heal":
        case "boost":
        case "throwable": {
            const backpackLevel = this.getGearLevel(this.backpack);
            const bagSpace = GameConfig.bagSizes[obj.type] ? GameConfig.bagSizes[obj.type][backpackLevel] : 0;

            if (this.inventory[obj.type] + obj.count <= bagSpace) {
                switch (def.type) {
                case "scope": {
                    const currentScope = GameObjectDefs[this.scope] as ScopeDef;
                    if (def.level > currentScope.level) { // only switch scopes if new scope is highest level player has
                        this.scope = obj.type;
                    }
                    break;
                }
                case "throwable": {
                    // fill empty slot with throwable, otherwise just add to inv
                    if (this.inventory[obj.type] == 0) {
                        this.weapons[GameConfig.WeaponSlot.Throwable].type = obj.type;
                        this.weapons[GameConfig.WeaponSlot.Throwable].ammo = obj.count;
                        this.weapsDirty = true;
                        this.setDirty();
                    }
                    break;
                }
                }
                this.inventory[obj.type] += obj.count;
                this.inventoryDirty = true;
            } else {
                // spawn new loot object to animate the pickup rejection
                const spaceLeft = bagSpace - this.inventory[obj.type];
                const amountToAdd = spaceLeft;

                if (amountToAdd <= 0) {
                    pickupMsg.type = PickupMsgType.Full;
                    if (def.type === "scope") {
                        pickupMsg.type = PickupMsgType.AlreadyOwned;
                    }
                } else {
                    this.inventory[obj.type] += amountToAdd;
                    this.inventoryDirty = true;
                    if (def.type === "throwable" && amountToAdd != 0) {
                        this.weapons[GameConfig.WeaponSlot.Throwable].type = obj.type;
                        this.weapons[GameConfig.WeaponSlot.Throwable].ammo = amountToAdd;
                        this.weapsDirty = true;
                        this.setDirty();
                    }
                }
                amountLeft = obj.count - amountToAdd;
            }
            // this is here because it needs to execute regardless of what happens above
            // automatically reloads gun if inventory has 0 ammo and ammo is picked up
            const weaponInfo = GameObjectDefs[this.activeWeapon];
            if (def.type == "ammo" &&
                    weaponInfo.type === "gun" &&
                    this.weapons[this.curWeapIdx].ammo == 0 &&
                    weaponInfo.ammo == obj.type) {
                this.weaponManager.reload();
            }
        }
            break;
        case "melee":
            this.weaponManager.dropMelee();
            this.weapons[GameConfig.WeaponSlot.Melee].type = obj.type;
            this.weapsDirty = true;
            if (this.curWeapIdx === GameConfig.WeaponSlot.Melee) this.setDirty();
            break;
        case "gun":
            amountLeft = 0;
            removeLoot = false;
            for (let i = 0; i < GameConfig.WeaponSlot.Count; i++) {
                const slotType = GameConfig.WeaponType[i];
                if (slotType !== def.type) continue;
                const slotDef = GameObjectDefs[this.weapons[i].type] as GunDef | undefined;

                const dualWield = slotDef?.dualWieldType && obj.type === this.weapons[i].type;

                if (!this.weapons[i].type || i === this.curWeapIdx || dualWield) {
                    if ((obj.type === this.weapons[this.curWeapIdx].type && !dualWield) && i === this.curWeapIdx) {
                        pickupMsg.type = PickupMsgType.AlreadyOwned;
                        break;
                    }

                    if (this.weapons[i].type === "") {
                        amountLeft = 0;
                    } else if (!dualWield) {
                        this.weaponManager.dropGun(i, false);
                    }

                    if (dualWield) {
                        this.weapons[i].type = slotDef.dualWieldType!;
                    } else {
                        this.weapons[i].type = obj.type;
                    }
                    this.weapons[i].cooldown = 0;
                    if (this.weapons[i].ammo <= 0 && i === this.curWeapIdx) {
                        this.cancelAction();
                        this.scheduleAction(this.activeWeapon, GameConfig.Action.Reload);
                    }
                    this.weapsDirty = true;
                    removeLoot = true;
                    this.setDirty();
                    break;
                }
            }
            break;
        case "helmet":
        case "chest":
        case "backpack": {
            const objLevel = this.getGearLevel(obj.type);
            const thisType = this[def.type];
            const thisLevel = this.getGearLevel(thisType);
            amountLeft = 1;

            if (thisType === obj.type) {
                lootToAdd = obj.type;
                pickupMsg.type = PickupMsgType.AlreadyEquipped;
            } else if (thisLevel <= objLevel) {
                lootToAdd = thisType;
                this[def.type] = obj.type;
                pickupMsg.type = PickupMsgType.Success;
                this.setDirty();
            } else {
                lootToAdd = obj.type;
                pickupMsg.type = PickupMsgType.BetterItemEquipped;
            }
            if (this.getGearLevel(lootToAdd) === 0) lootToAdd = "";
        }
            break;
        case "outfit":
            amountLeft = 1;
            lootToAdd = this.outfit;
            pickupMsg.type = PickupMsgType.Success;
            this.outfit = obj.type;
            this.setDirty();
            break;
        case "perk":
            if (this.perks.length >= Constants.MaxPerks) {
                amountLeft = 1;
            } else {
                this.addPerk(obj.type);
            }
            this.setDirty();
            break;
        }

        const lootToAddDef = GameObjectDefs[lootToAdd] as LootDef;
        if (removeLoot && amountLeft > 0 && lootToAdd !== "" && !lootToAddDef.noDrop) {
            const angle = Math.atan2(this.dir.y, this.dir.x);
            const invertedAngle = (angle + Math.PI) % (2 * Math.PI);
            const newPos = v2.add(obj.pos, v2.create(0.4 * Math.cos(invertedAngle), 0.4 * Math.sin(invertedAngle)));
            this.game.lootBarn.addLootWithoutAmmo(lootToAdd, newPos, obj.layer, amountLeft);
        }

        if (removeLoot) {
            obj.remove();
            this.msgsToSend.push({
                type: MsgType.Pickup,
                msg: pickupMsg
            });
        }
    }

    dropItem(dropMsg: DropItemMsg): void {
        const itemDef = GameObjectDefs[dropMsg.item] as LootDef;
        switch (itemDef.type) {
        case "ammo": {
            const inventoryCount = this.inventory[dropMsg.item];

            if (inventoryCount === 0) return;

            let amountToDrop = Math.max(1, Math.floor(inventoryCount / 2));

            if (itemDef.minStackSize && inventoryCount <= itemDef.minStackSize) {
                amountToDrop = Math.min(itemDef.minStackSize, inventoryCount);
            } else if (inventoryCount <= 5) {
                amountToDrop = Math.min(5, inventoryCount);
            }

            this.game.lootBarn.splitUpLoot(this, dropMsg.item, amountToDrop);
            this.inventory[dropMsg.item] -= amountToDrop;
            this.inventoryDirty = true;
            break;
        }
        case "scope": {
            if (itemDef.level === 1) break;
            const scopeLevel = `${itemDef.level}xscope`;
            const scopeIdx = SCOPE_LEVELS.indexOf(scopeLevel);

            this.game.lootBarn.addLoot(dropMsg.item, this.pos, this.layer, 1);
            this.inventory[scopeLevel] = 0;

            if (this.scope === scopeLevel) {
                for (let i = scopeIdx; i >= 0; i--) {
                    if (!this.inventory[SCOPE_LEVELS[i]]) continue;
                    this.scope = SCOPE_LEVELS[i];
                    break;
                }
            }

            this.inventoryDirty = true;
            break;
        }
        case "chest":
        case "helmet": {
            if (itemDef.noDrop) break;
            this.game.lootBarn.addLoot(dropMsg.item, this.pos, this.layer, 1);
            this[itemDef.type] = "";
            this.setDirty();
            break;
        }
        case "heal":
        case "boost": {
            if (this.inventory[dropMsg.item] === 0) break;
            this.inventory[dropMsg.item]--;
            // @TODO: drop more than one?
            this.game.lootBarn.addLoot(dropMsg.item, this.pos, this.layer, 1);
            this.inventoryDirty = true;
            break;
        }
        case "gun":
            this.weaponManager.dropGun(dropMsg.weapIdx);
            break;
        case "melee":
            this.weaponManager.dropMelee();
            break;
        case "throwable": {
            const inventoryCount = this.inventory[dropMsg.item];

            if (inventoryCount === 0) return;

            const amountToDrop = Math.max(1, Math.floor(inventoryCount / 2));

            this.game.lootBarn.splitUpLoot(this, dropMsg.item, amountToDrop);
            this.inventory[dropMsg.item] -= amountToDrop;
            this.weapons[3].ammo -= amountToDrop;

            if (this.inventory[dropMsg.item] == 0) {
                this.weaponManager.showNextThrowable();
            }
            this.inventoryDirty = true;
            this.weapsDirty = true;
            break;
        }
        }

        this.cancelAction();
    }

    isOnOtherSide(door: Obstacle): boolean {
        switch (door.ori) {
        case 0: return this.pos.x < door.pos.x;
        case 1: return this.pos.y < door.pos.y;
        case 2: return this.pos.x > door.pos.x;
        case 3: return this.pos.y > door.pos.y;
        }
        return false;
    }

    doAction(actionItem: string, actionType: number, duration: number) {
        if (this.actionDirty) { // action already in progress
            return;
        }

        this.action.targetId = -1;
        this.action.duration = duration;
        const t = Date.now() + (duration * 1000);
        this.action.time = duration - (t / 1000);
        // console.log(this.action.time);
        // this.action.time = Date.now() + (duration * 1000);

        this.actionDirty = true;
        this.actionItem = actionItem;
        this.actionType = actionType;
        this.actionSeq = 1;
        this.setDirty();
    }

    cancelAction(_?: boolean): void {
        this.action.duration = 0;
        this.action.targetId = 0;
        this.action.time = -1;

        this.actionItem = "";
        this.actionType = 0;
        this.actionSeq = 0;
        this.actionDirty = false;
        this.setDirty();
    }

    recalculateSpeed(): void {
        this.speed = this.downed ? GameConfig.player.downedMoveSpeed : GameConfig.player.moveSpeed;

        // if melee is selected increase speed
        const weaponDef = GameObjectDefs[this.activeWeapon] as GunDef | MeleeDef | ThrowableDef;
        if (weaponDef.speed.equip && this.weapons[this.curWeapIdx].cooldown < this.game.now) {
            this.speed += weaponDef.speed.equip;
        }

        if (this.shotSlowdownTimer != -1 && "attack" in weaponDef.speed) {
            this.speed += weaponDef.speed.attack + weaponDef.speed.equip + -3;
        }

        // if player is on water decrease speed
        const isOnWater = this.game.map.getGroundSurface(this.pos, this.layer).type === "water";
        if (isOnWater) this.speed -= GameConfig.player.waterSpeedPenalty;

        // increase speed when adrenaline is above 50%
        if (this.boost >= 50) {
            this.speed += GameConfig.player.boostMoveSpeed;
        }

        // decrease speed if popping adren or heals
        if (this.actionType == GameConfig.Action.UseItem) {
            this.speed -= 6;
        }

        this.speed = math.max(this.speed, 1);
    }

    sendMsg(type: number, msg: any, bytes = 128): void {
        const stream = new MsgStream(new ArrayBuffer(bytes));
        stream.serializeMsg(type, msg);
        this.sendData(stream.getBuffer());
    }

    sendData(buffer: ArrayBuffer | Uint8Array): void {
        try {
            this.socket.send(buffer);
        } catch (e) {
            console.warn("Error sending packet. Details:", e);
        }
    }
}

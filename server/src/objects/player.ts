import { type WebSocket } from "uWebSockets.js";
import { Emote, type Game } from "../game";
import { GameConfig } from "../../../shared/gameConfig";
import { collider } from "../../../shared/utils/collider";
import { type Vec2, v2 } from "../../../shared/utils/v2";
import { BaseGameObject, type GameObject, ObjectType } from "./gameObject";
import { type PlayerContainer } from "../server";
import { coldet } from "../../../shared/utils/coldet";
import { util } from "../../../shared/utils/util";
import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";
import { Obstacle } from "./obstacle";
import { WeaponManager } from "../utils/weaponManager";
import { math } from "../../../shared/utils/math";
import { DeadBody } from "./deadBody";
import { type OutfitDef, type GunDef, type MeleeDef, type ThrowableDef, type HelmetDef, type ChestDef, type BackpackDef, type HealDef, type BoostDef } from "../../../shared/defs/objectsTypings";
import { MeleeDefs } from "../../../shared/defs/gameObjects/meleeDefs";
import { Structure } from "./structure";
import net, { type InputMsg } from "../../../shared/net";
import { type Msg } from "../../../shared/netTypings";

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

    dir = v2.create(0, 0);

    posOld = v2.create(0, 0);
    dirOld = v2.create(0, 0);

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

    private _health: number = 50;// GameConfig.player.health;

    get health(): number {
        return this._health;
    }

    set health(health: number) {
        if (this._health === health) return;
        this._health = health;
        this._health = math.clamp(this._health, 0, GameConfig.player.health);
        this.dirty.health = true;
    }

    private _boost: number = 0;

    get boost(): number {
        return this._boost;
    }

    set boost(boost: number) {
        if (this._boost === boost) return;
        this._boost = boost;
        this._boost = math.clamp(this._boost, 0, 100);
        this.dirty.boost = true;
    }

    speed: number = this.game.config.movementSpeed;

    zoomDirty = true;
    zoom: number = 0;

    action!: { time: number, duration: number, targetId: number };
    lastAction!: { time: number, duration: number, targetId: number };

    inventoryDirty = true;
    private _scope = "1xscope";

    get scope() {
        return this._scope;
    }

    set scope(scope: string) {
        this._scope = scope;

        if (this.isMobile) this.zoom = GameConfig.scopeZoomRadius.desktop[this._scope];
        else this.zoom = GameConfig.scopeZoomRadius.mobile[this._scope];

        this.dirty.zoom = true;
        this.dirty.inventory = true;
    }

    inventory: Record<string, number> = {};

    get curWeapIdx() {
        return this.weaponManager.curWeapIdx;
    }

    set curWeapIdx(idx: number) {
        if (this.weapons[idx].type === "" || idx === this.weaponManager.curWeapIdx) return;

        for (const timeout of this.weaponManager.timeouts) {
            clearTimeout(timeout);
        }
        this.animType = GameConfig.Anim.None;

        if ((idx == 0 || idx == 1) && this.weapons[idx].ammo == 0) {
            this.scheduleAction(this.activeWeapon, GameConfig.Action.Reload);
        }

        this.weaponManager.curWeapIdx = idx;
        this.setDirty();
        this.dirty.weapons = true;
    }

    get weapons() {
        return this.weaponManager.weapons;
    }

    get activeWeapon() {
        return this.weaponManager.activeWeapon;
    }

    spectatorCountDirty = false;
    spectatorCount = 0;

    outfit = "outfitBase";
    pack = "backpack03";
    helmet = "helmet03";
    chest = "chest03";

    layer = 0;
    aimLayer = 0;
    dead = false;
    downed = false;

    indoors = false;

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

    emotes = new Set<Emote>();

    damageTaken = 0;
    damageDealt = 0;
    joinedTime = 0;
    kills = 0;

    get timeAlive(): number {
        return (Date.now() - this.joinedTime) / 1000;
    }

    socket: WebSocket<PlayerContainer>;

    msgsToSend: Array<{ type: number, msg: Msg }> = [];

    weaponManager = new WeaponManager(this);
    recoilTicker = 0;

    constructor(game: Game, pos: Vec2, socket: WebSocket<PlayerContainer>) {
        super(game, pos);
        this.socket = socket;

        if (game.config.map !== "faction") {
            this.groupId = this.teamId = ++this.game.nextGroupId;
        }

        for (const item in GameConfig.bagSizes) {
            this.inventory[item] = 0;
        }
        this.inventory["1xscope"] = 1;
        this.inventory[this.scope] = 1;
        this.inventory["12gauge"] = 2;
        this.inventory["9mm"] = 120;
        this.inventory.bandage = 5;
        this.inventory.healthkit = 1;
        this.inventory.soda = 2;
        this.inventory.painkiller = 1;
        // this.inventory["frag"] = 3;
        this.game.addLoot("12gauge", this.pos, this.layer, 5);
        this.game.addLoot("bandage", this.pos, this.layer, 5);
        this.game.addLoot("soda", this.pos, this.layer, 1);
        this.game.addLoot("2xscope", this.pos, this.layer, 1);
        this.game.addLoot("4xscope", this.pos, this.layer, 1);
        this.game.addLoot("8xscope", this.pos, this.layer, 1);
        this.game.addLoot("frag", this.pos, this.layer, 1);
        this.game.addLoot("frag", this.pos, this.layer, 1);
        this.game.addLoot("smoke", this.pos, this.layer, 1);
        this.game.addLoot("mirv", this.pos, this.layer, 1);
        this.game.addLoot("m870", this.pos, this.layer, 1);
        this.game.addLoot("pkp", this.pos, this.layer, 1);

        this.zoom = GameConfig.scopeZoomRadius.desktop[this.scope];

        this.action = { time: -1, duration: 0, targetId: -1 };
        // this.addPerk("splinter");
        // this.addPerk("explosive")
    }

    visibleObjects = new Set<GameObject>();

    lastInputMsg = new net.InputMsg();

    update(): void {
        if (this.dead) return;
        this.ticksSinceLastAction++;

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

        if (this.performActionAgain) {
            this.performActionAgain = false;
            this.doAction(this.lastActionItem, this.lastActionType, this.lastAction.duration);
        }

        if (this.scheduledAction.perform && this.ticksSinceLastAction > 1) {
            switch (this.scheduledAction.type) {
            case GameConfig.Action.Reload: {
                if ((this.curWeapIdx == 0 || this.curWeapIdx == 1) && this.weapons[this.curWeapIdx].ammo == 0) {
                    this.weaponManager.reload();
                }
                break;
            }
            case GameConfig.Action.UseItem: {
                switch (this.scheduledAction.item) {
                case "bandage": {
                    this.useBandage();
                    break;
                }
                case "healthkit":{
                    this.useHealthkit();
                    break;
                }
                case "soda":{
                    this.useSoda();
                    break;
                }
                case "painkiller":{
                    this.usePainkiller();
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
                this.dirty.inventory = true;
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

                this.dirty.inventory = true;
                this.dirty.weapons = true;
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
            const coll = collider.createCircle(this.pos, this.rad);
            objs = this.game.grid.intersectCollider(coll);

            for (const obj of objs) {
                if (obj instanceof Obstacle &&
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
            }
        }

        this.pos = math.v2Clamp(
            this.pos,
            v2.create(this.rad, this.rad),
            v2.create(this.game.map.width - this.rad, this.game.map.height - this.rad)
        );

        if (!v2.eq(this.pos, this.posOld)) {
            this.setPartDirty();
            this.game.grid.updateObject(this);
        }

        if (this.shootStart) {
            this.weaponManager.shootStart();
        }
        if (this.shootHold) {
            this.weaponManager.shootHold();
        }
    }

    private _firstUpdate = true;

    sendMsgs(): void {
        const msgStream = new net.MsgStream(new ArrayBuffer(65536));

        if (this._firstUpdate) {
            const joinedMsg = new net.JoinedMsg();
            joinedMsg.teamMode = 1;
            joinedMsg.playerId = this.id;
            joinedMsg.emotes = this.loadout.emotes;
            this.sendMsg(net.MsgType.Joined, joinedMsg);

            const mapStream = this.game.map.mapStream.stream;

            msgStream.stream!.writeBytes(mapStream!, 0, mapStream!.byteIndex);
        }

        if (this.game.aliveCountDirty) {
            const aliveMsg = new net.AliveCountsMsg();
            aliveMsg.teamAliveCounts.push(this.game.aliveCount);
            msgStream.serializeMsg(net.MsgType.AliveCounts, aliveMsg);
        }

        const updateMsg = new net.UpdateMsg();
        // updateMsg.serializationCache = this.game.serializationCache;

        const radius = this.zoom + 4;
        const rect = coldet.circleToAabb(this.pos, radius);

        const newVisibleObjects = new Set(this.game.grid.intersectCollider(rect));

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

        this.visibleObjects = newVisibleObjects;

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

        updateMsg.activePlayerId = this.id;
        updateMsg.activePlayerIdDirty = this.dirty.activeId;
        updateMsg.activePlayerData = this;
        updateMsg.playerInfos = this._firstUpdate ? [...this.game.players] : this.game.newPlayers;

        for (const emote of this.emotes) {
            updateMsg.emotes.push(emote);
        }
        this.emotes.clear();

        let newBullets = [];
        const extendedRadius = 1.1 * radius;
        const radiusSquared = extendedRadius * extendedRadius;

        const bullets = this.game.bulletManager.newBullets;
        for (let i = 0; i < bullets.length; i++) {
            const bullet = bullets[i];
            if (v2.lengthSqr(v2.sub(bullet.pos, this.pos)) < radiusSquared ||
                v2.lengthSqr(v2.sub(bullet.clientEndPos, this.pos)) < radiusSquared ||
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
        updateMsg.explosions = this.game.explosions;

        msgStream.serializeMsg(net.MsgType.Update, updateMsg);

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

        this.game.aliveCountDirty = true;
        this.game.livingPlayers.delete(this);

        const killMsg = new net.KillMsg();
        killMsg.damageType = damageType;
        killMsg.itemSourceType = sourceType;
        killMsg.targetId = this.id;
        killMsg.killed = true;

        if (source instanceof Player) {
            if (source !== this) source.kills++;
            killMsg.killerId = source.id;
            killMsg.killCreditId = source.id;
            killMsg.killerKills = source.kills;
        }

        this.game.msgsToSend.push({ type: net.MsgType.Kill, msg: killMsg });

        const gameOverMsg = new net.GameOverMsg();

        gameOverMsg.teamRank = this.game.aliveCount;
        gameOverMsg.playerStats = [{
            ...this,
            playerId: this.id
        }];
        gameOverMsg.teamId = this.teamId;
        gameOverMsg.winningTeamId = -1;
        this.msgsToSend.push({ type: net.MsgType.GameOver, msg: gameOverMsg });

        const deadBody = new DeadBody(this.game, this.pos, this.id, this.layer);
        this.game.grid.addObject(deadBody);

        // drop loot
        for (const weapon of this.weapons) {
            if (!weapon.type) continue;
            const def = GameObjectDefs[weapon.type] as MeleeDef | GunDef | ThrowableDef;

            if (!def.noDropOnDeath && !def.noDrop && weapon.type !== "fists") {
                this.game.addLoot(weapon.type, this.pos, this.layer, weapon.ammo, true);
            }
        }

        for (const item in GameConfig.bagSizes) {
            // const def = GameObjectDefs[item] as AmmoDef | HealDef;
            if (item == "1xscope") {
                continue;
            }

            if (this.inventory[item] > 0) {
                this.game.addLoot(item, this.pos, this.layer, this.inventory[item]);
            }
        }

        for (const item of ["helmet", "chest", "pack"] as const) {
            const type = this[item];
            if (!type) continue;
            const def = GameObjectDefs[type] as HelmetDef | ChestDef | BackpackDef;
            if (!!def.noDrop || def.level < 1) continue;
            this.game.addLoot(type, this.pos, this.layer, 1);
        }

        if (this.outfit) {
            const def = GameObjectDefs[this.outfit] as OutfitDef;
            if (!def.noDropOnDeath) {
                this.game.addLoot(this.outfit, this.pos, this.layer, 1);
            }
        }

        // death emote

        if (this.loadout.emotes[5] != "") {
            this.game.emotes.add(new Emote(this.id, this.pos, this.loadout.emotes[5], false));
        }
    }

    useBandage(): void {
        if (this.health == (GameObjectDefs.bandage as HealDef).maxHeal || this.actionType == GameConfig.Action.UseItem) {
            return;
        }

        // healing gets action priority over reloading
        if (this.actionType == GameConfig.Action.Reload) {
            this.scheduleAction("bandage", GameConfig.Action.UseItem);
            return;
        }

        this.cancelAction();
        this.doAction("bandage", GameConfig.Action.UseItem, 3);
    }

    useHealthkit(): void {
        if (this.health == (GameObjectDefs.bandage as HealDef).maxHeal || this.actionType == GameConfig.Action.UseItem) {
            return;
        }

        // healing gets action priority over reloading
        if (this.actionType == GameConfig.Action.Reload) {
            this.scheduleAction("healthkit", GameConfig.Action.UseItem);
            return;
        }

        this.cancelAction();
        this.doAction("healthkit", GameConfig.Action.UseItem, 6);
    }

    useSoda(): void {
        if (this.actionType == GameConfig.Action.UseItem) {
            return;
        }

        // healing gets action priority over reloading
        if (this.actionType == GameConfig.Action.Reload) {
            this.scheduleAction("soda", GameConfig.Action.UseItem);
            return;
        }

        this.cancelAction();
        this.doAction("soda", GameConfig.Action.UseItem, 3);
    }

    usePainkiller(): void {
        if (this.actionType == GameConfig.Action.UseItem) {
            return;
        }

        // healing gets action priority over reloading
        if (this.actionType == GameConfig.Action.Reload) {
            this.cancelAction();
            this.scheduleAction("painkiller", GameConfig.Action.UseItem);
            return;
        }

        this.cancelAction();
        this.doAction("painkiller", GameConfig.Action.UseItem, 5);
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

        for (const input of msg.inputs) {
            switch (input) {
            case GameConfig.Input.StowWeapons:
            case GameConfig.Input.EquipMelee:
                this.curWeapIdx = 2;
                this.cancelAction();
                break;
            case GameConfig.Input.EquipPrimary:
                if (this.weapons[0].type) {
                    this.curWeapIdx = 0;
                    this.cancelAction();
                }
                break;
            case GameConfig.Input.EquipSecondary:
                if (this.weapons[1].type) {
                    this.curWeapIdx = 1;
                    this.cancelAction();
                }
                break;
            case GameConfig.Input.EquipThrowable:
                if (this.weapons[3].type) {
                    this.curWeapIdx = 3;
                    this.cancelAction();
                }
                break;
            case GameConfig.Input.EquipOtherGun:
                if (this.curWeapIdx == 2 && !this.weapons[0].type && !this.weapons[1].type) { // nothing, nothing, [melee] => melee
                    break;
                }

                if (this.curWeapIdx == 0 && !this.weapons[1].type) { // [mosin], nothing, fists => fists
                    this.curWeapIdx = 2;
                } else if (this.curWeapIdx == 1 && !this.weapons[0].type) { // nothing, [mosin], fists => fists
                    this.curWeapIdx = 2;
                } else if (this.curWeapIdx == 2 && this.weapons[0].type) { // mosin, wildcard, [melee] => mosin
                    this.curWeapIdx = 0;
                } else if (this.curWeapIdx == 2 && !this.weapons[0].type && this.weapons[1].type) { // nothing, mosin, [melee] => mosin
                    this.curWeapIdx = 1;
                } else { // normal case: [wildcard], [wildcard], melee => other wildcard
                    this.curWeapIdx ^= 1;// XOR operator, will flip the number from 0 to 1 or from 1 to 0
                }
                this.cancelAction();
                this.setDirty();
                break;
            case GameConfig.Input.Interact: {
                const coll = collider.createCircle(this.pos, this.rad);
                const objs = this.game.grid.intersectCollider(coll);
                for (const o of objs) {
                    // if object is not loot or if not on the same layer as the player, ignore it
                    if (o.__type != ObjectType.Loot || !util.sameLayer(this.layer, o.layer)) {
                        continue;
                    }

                    if (v2.distance(this.pos, o.pos) < 1.5) {
                        this.interactWith(o);
                    }
                }
                break;
            }
            case GameConfig.Input.Reload:
                this.weaponManager.reload();
                break;
            case GameConfig.Input.UseBandage:
                this.useBandage();
                break;
            case GameConfig.Input.UseHealthKit:
                this.useHealthkit();
                break;
            case GameConfig.Input.UsePainkiller:
                this.useSoda();
                break;
            case GameConfig.Input.UseSoda:
                this.usePainkiller();
                break;
            case GameConfig.Input.Cancel:
                this.cancelAction();
                break;
            }
        }

        switch (msg.useItem) {
        case "bandage": {
            this.useBandage();
            break;
        }
        case "healthkit":{
            this.useHealthkit();
            break;
        }
        case "soda":{
            this.useSoda();
            break;
        }
        case "painkiller":{
            this.usePainkiller();
            break;
        }
        }
    }

    interactWith(o: GameObject): void {
        if (o.__type == ObjectType.Loot) {
            const lootType: string = GameObjectDefs[o.type].type;
            if (["ammo", "scope", "heal", "boost", "throwable"].includes(lootType)) {
                const backpackLevel = Number(this.pack.at(-1));// backpack00, backpack01, etc ------- at(-1) => 0, 1, etc
                const bagSpace = GameConfig.bagSizes[o.type][backpackLevel];
                if (this.inventory[o.type] + o.count <= bagSpace) {
                    switch (lootType) {
                    case "ammo":
                        break;
                    case "scope": { // TODO set zoom based on building or outside
                        const zoom = GameConfig.scopeZoomRadius.desktop[o.type];
                        if (zoom > this.zoom) { // only switch scopes if new scope is highest level player has
                            this.scope = o.type;
                        }
                        break;
                    }
                    case "heal":
                        break;
                    case "boost":
                        break;
                    case "throwable": {
                        // fill empty slot with throwable, otherwise just add to inv
                        if (this.inventory[o.type] == 0) {
                            this.weaponManager.weapons[3].type = o.type;
                            this.weaponManager.weapons[3].ammo = o.count;
                            this.dirty.weapons = true;
                        }
                        break;
                    }
                    }
                    this.inventory[o.type] += o.count;
                    this.dirty.inventory = true;
                } else { // spawn new loot object to animate the pickup rejection
                    const spaceLeft = bagSpace - this.inventory[o.type];
                    const amountToAdd = spaceLeft;

                    this.inventory[o.type] += amountToAdd;
                    this.dirty.inventory = true;

                    const amountToDrop = o.count - amountToAdd;

                    const angle = Math.atan2(this.dir.y, this.dir.x);
                    const invertedAngle = (angle + Math.PI) % (2 * Math.PI);
                    const newPos = v2.add(o.pos, v2.create(0.4 * Math.cos(invertedAngle), 0.4 * Math.sin(invertedAngle)));
                    this.game.addLoot(o.type, newPos, o.layer, amountToDrop);
                }
                // this is here because it needs to execute regardless of what happens above
                // automatically reloads gun if inventory has 0 ammo and ammo is picked up
                if (lootType == "ammo") {
                    const weaponInfo = GameObjectDefs[this.activeWeapon] as GunDef;
                    if (
                        (this.curWeapIdx == 0 || this.curWeapIdx == 1) &&
                        this.weapons[this.curWeapIdx].ammo == 0 &&
                        weaponInfo.ammo == o.type // ammo picked up is same type as gun being held
                    ) {
                        this.weaponManager.reload();
                    }
                }
                o.remove();
            } else if (lootType == "gun") {
                if (this.activeWeapon != o.type) { // can only pick up a different gun: m870 != pkp
                    const weaponInfo = GameObjectDefs[this.activeWeapon] as GunDef;
                    const backpackLevel = Number(this.pack.at(-1));// backpack00, backpack01, etc ------- at(-1) => 0, 1, etc

                    const bagCapacityAmmo = GameConfig.bagSizes[weaponInfo.ammo][backpackLevel];
                    const weaponAmmo = this.weapons[this.curWeapIdx].ammo;
                    const inventoryAmmo = this.inventory[weaponInfo.ammo];

                    if (weaponAmmo + inventoryAmmo <= bagCapacityAmmo) { // can fit all weapon ammo in inventory
                        this.inventory[weaponInfo.ammo] += weaponAmmo;
                        this.dirty.inventory = true;
                    } else { // can only fit a certain amount of ammo in inventory, rest needs to be dropped
                        const spaceLeft = bagCapacityAmmo - inventoryAmmo;
                        const amountToAdd = spaceLeft;

                        this.inventory[weaponInfo.ammo] += amountToAdd;
                        this.dirty.inventory = true;

                        const amountToDrop = weaponAmmo - amountToAdd;
                        this.game.addLoot(weaponInfo.ammo, this.pos, this.layer, amountToDrop);
                    }

                    this.game.addGun(this.activeWeapon, this.pos, this.layer, 1);// order matters, drop first so references are correct
                    this.weapons[this.curWeapIdx].type = o.type;
                    this.weapons[this.curWeapIdx].ammo = 0;

                    const newWeaponInfo = GameObjectDefs[this.activeWeapon] as GunDef;// info for the picked up gun

                    if (this.inventory[newWeaponInfo.ammo] != 0) {
                        this.scheduleAction(this.activeWeapon, GameConfig.Action.Reload, false);
                    }

                    this.cancelAction();
                    this.dirty.weapons = true;
                    this.setDirty();
                    o.remove();
                }// else do nothing
            }
        }
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
        if (this.dirty.action) { // action already in progress
            return;
        }

        this.action.targetId = -1;
        this.action.duration = duration;
        const t = Date.now() + (duration * 1000);
        this.action.time = duration - (t / 1000);
        // console.log(this.action.time);
        // this.action.time = Date.now() + (duration * 1000);

        this.dirty.action = true;
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
        this.dirty.action = false;
        this.setDirty();
    }

    recalculateSpeed(): void {
        this.speed = this.game.config.movementSpeed;

        // if melee is selected increase speed
        const weaponDef = GameObjectDefs[this.activeWeapon] as GunDef | MeleeDef | ThrowableDef;
        if (weaponDef.speed.equip && this.weaponManager.meleeCooldown < this.game.now) {
            this.speed += weaponDef.speed.equip;
        }

        // if player is on water decrease speed
        const isOnWater = this.game.map.getGroundSurface(this.pos, this.layer).type === "water";
        if (isOnWater) this.speed -= 3;

        // increase speed when adrenaline is above 50%
        if (this.boost >= 50) {
            this.speed += 1.85;
        }

        // decrease speed if popping adren or heals
        if (this.actionType == GameConfig.Action.UseItem) {
            this.speed *= 0.5;
        }
    }

    sendMsg(type: number, msg: any, bytes = 128): void {
        const stream = new net.MsgStream(new ArrayBuffer(bytes));
        stream.serializeMsg(type, msg);
        this.sendData(stream.getBuffer());
    }

    sendData(buffer: ArrayBuffer): void {
        try {
            this.socket.send(buffer, true, true);
        } catch (e) {
            console.warn("Error sending packet. Details:", e);
        }
    }
}

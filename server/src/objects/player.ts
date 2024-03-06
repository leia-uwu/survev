import { type WebSocket } from "uWebSockets.js";
import { type Game } from "../game";
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
import { type OutfitDef, type GunDef, type MeleeDef, type ThrowableDef, type HelmetDef, type ChestDef, type BackpackDef } from "../../../shared/defs/objectsTypings";
import { MeleeDefs } from "../../../shared/defs/gameObjects/meleeDefs";
import { Structure } from "./structure";
import net, { type InputMsg } from "../../../shared/net";
import { type Msg } from "../../../shared/netTypings";
import { Loot } from "./loot";

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

    private _health: number = GameConfig.player.health;

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

    inventoryDirty = true;
    scope = "1xscope";

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
    pack = "backpack00";
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

    teamId = 1;
    groupId = 0;

    loadout = {
        heal: "heal_basic",
        boost: "boost_basic",
        emotes: [...GameConfig.defaultEmoteLoadout]
    };

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
        this.inventory["12gauge"] = 12;
        // this.inventory["frag"] = 3;
        this.game.addLoot("12gauge", this.pos, this.layer, 5);
        this.game.addLoot("soda", this.pos, this.layer, 1);
        this.game.addLoot("2xscope", this.pos, this.layer, 1);
        this.game.addLoot("4xscope", this.pos, this.layer, 1);
        this.game.addLoot("8xscope", this.pos, this.layer, 1);
        this.game.addLoot("frag", this.pos, this.layer, 1);
        this.game.addLoot("frag", this.pos, this.layer, 1);
        this.game.addLoot("smoke", this.pos, this.layer, 1);
        this.game.addLoot("mirv", this.pos, this.layer, 1);

        this.zoom = GameConfig.scopeZoomRadius.desktop[this.scope];

        // this.addPerk("splinter");
        // this.addPerk("explosive")
    }

    visibleObjects = new Set<GameObject>();

    lastInputMsg = new net.InputMsg();

    update(): void {
        if (this.dead) return;

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

        if (this.boost > 0){
            this.boost -= 0.375/this.game.realDt;
        }
        if (this.boost > 0 && this.boost <= 25) this.health += 1/this.game.realDt;
        else if (this.boost > 25 && this.boost <= 50) this.health += 3.75/this.game.realDt;
        else if (this.boost > 50 && this.boost <= 87.5) this.health += 4.75/this.game.realDt;
        else if (this.boost > 87.5 && this.boost <= 100) this.health += 5/this.game.realDt;

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
            if (item == "1xscope"){
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
                this.setDirty();
                break;
            case GameConfig.Input.EquipPrimary:
                if (this.weapons[0].type) {
                    this.curWeapIdx = 0;
                    this.setDirty();
                }
                break;
            case GameConfig.Input.EquipSecondary:
                if (this.weapons[1].type) {
                    this.curWeapIdx = 1;
                    this.setDirty();
                }
                break;
            case GameConfig.Input.EquipThrowable:
                if (this.weapons[3].type) {
                    this.curWeapIdx = 3;
                    this.setDirty();
                }
                break;
            case GameConfig.Input.EquipOtherGun:
                if (this.curWeapIdx == 2 && !this.weapons[0].type && !this.weapons[1].type){//nothing, nothing, [melee] => melee
                    break;
                }

                if (this.curWeapIdx == 0 && !this.weapons[1].type){//[mosin], nothing, fists => fists
                    this.curWeapIdx = 2;
                }else if (this.curWeapIdx == 1 && !this.weapons[0].type){//nothing, [mosin], fists => fists
                    this.curWeapIdx = 2;
                }else if (this.curWeapIdx == 2 && this.weapons[0].type){//mosin, wildcard, [melee] => mosin
                    this.curWeapIdx = 0;
                }else if (this.curWeapIdx == 2 && !this.weapons[0].type && this.weapons[1].type){//nothing, mosin, [melee] => mosin
                    this.curWeapIdx = 1;
                }else{//normal case: [wildcard], [wildcard], melee => other wildcard
                    this.curWeapIdx ^= 1;//XOR operator, will flip the number from 0 to 1 or from 1 to 0
                }
                this.setDirty();
                break;
            case GameConfig.Input.Interact:
                const coll = collider.createCircle(this.pos, this.rad);
                const objs = this.game.grid.intersectCollider(coll);
                for (const o of objs){
                    //if object is not loot or if not on the same layer as the player, ignore it
                    if (o.__type != ObjectType.Loot || !util.sameLayer(this.layer, o.layer)){
                        continue;
                    }

                    if (v2.distance(this.pos, o.pos) < 1.5){
                        this.interactWith(o);
                    }
                }
                break;
            }
        }
    }

    interactWith(o: GameObject): void{
        if (o.__type == ObjectType.Loot){
            const lootType: string = GameObjectDefs[o.type].type;
            if (["ammo", "scope", "heal", "boost", "throwable"].includes(lootType)){
                const backpackLevel = Number(this.pack.at(-1));//backpack00, backpack01, etc ------- at(-1) => 0, 1, etc
                const bagSpace = GameConfig.bagSizes[o.type][backpackLevel];
                if (this.inventory[o.type] + o.count <= bagSpace){
                    switch (lootType){
                        case "ammo":
                            break;
                        case "scope"://TODO set zoom based on building or outside
                            const zoom = GameConfig.scopeZoomRadius.desktop[o.type];
                            if (zoom > this.zoom){//only switch scopes if new scope is highest level player has
                                this.zoom = GameConfig.scopeZoomRadius.desktop[o.type];
                                this.dirty.zoom = true;
                                this.scope = o.type;
                            }
                            break;
                        case "heal":
                            break;
                        case "boost":
                            break;
                        case "throwable":
                            //fill empty slot with throwable, otherwise just add to inv
                            if (this.inventory[o.type] == 0){
                                this.weaponManager.weapons[3].type = o.type;
                                this.weaponManager.weapons[3].ammo = o.count;
                                this.dirty.weapons = true;
                            }
                            break;
                    }
                    this.inventory[o.type] += o.count;
                    this.dirty.inventory = true;
                }else{//spawn new loot object to animate the pickup rejection
                    const spaceLeft = bagSpace - this.inventory[o.type];
                    let amountToAdd: number;
                    if (spaceLeft == 0){//ex: can hold 15 ammo and inventory contains 15 ammo
                        amountToAdd = 0;
                    }else{
                        amountToAdd = spaceLeft;
                    }

                    this.inventory[o.type] += amountToAdd;
                    this.dirty.inventory = true;

                    const amountToDrop = o.count - amountToAdd;

                    const angle = Math.atan2(this.dir.y, this.dir.x);
                    const invertedAngle = (angle + Math.PI) % (2 * Math.PI);
                    const newPos = v2.add(o.pos, v2.create(0.4 * Math.cos(invertedAngle), 0.4 * Math.sin(invertedAngle)));
                    this.game.addLoot(o.type, newPos, o.layer, amountToDrop);
                }
                o.remove();
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

    cancelAction(_?: boolean): void {
        // this.action.duration = 0;
        // this.action.targetId = 0;
        // this.action.time = -1;

        // this.actionType = 0;
        // this.actionSeq = 0;
        // this.dirty.action = false;
        // this.setDirty();
    }

    recalculateSpeed(): void {
        this.speed = this.game.config.movementSpeed;

        //if melee is selected increase speed
        const weaponDef = GameObjectDefs[this.activeWeapon] as GunDef | MeleeDef | ThrowableDef;
        if (weaponDef.speed.equip && this.weaponManager.meleeCooldown < this.game.now) {
            this.speed += weaponDef.speed.equip;
        }
        
        //if player is on water decrease speed
        const isOnWater = this.game.map.getGroundSurface(this.pos, this.layer).type === "water";
        if (isOnWater) this.speed -= 3;

        //increase speed when adrenaline is above 50%
        if (this.boost >= 50){
            this.speed += 1.15;
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

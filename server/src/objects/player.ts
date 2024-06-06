import { type Game } from "../game";
import { GameConfig } from "../../../shared/gameConfig";
import { collider } from "../../../shared/utils/collider";
import { type Vec2, v2 } from "../../../shared/utils/v2";
import { BaseGameObject, type DamageParams, type GameObject } from "./gameObject";
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
import { type SpectateMsg } from "../../../shared/msgs/spectateMsg";

export class Emote {
    playerId: number;
    pos: Vec2;
    type: string;
    isPing: boolean;
    itemType = "";

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

    _spectatorCount = 0;
    set spectatorCount(spectatorCount: number) {
        if (this._spectatorCount === spectatorCount) return;
        this._spectatorCount = spectatorCount;
        this._spectatorCount = math.clamp(this._spectatorCount, 0, 255); // byte size limit
        this.spectatorCountDirty = true;
    }

    get spectatorCount(): number {
        return this._spectatorCount;
    }

    /** true when player starts spectating new player, only stays true for that given tick */
    startedSpectating: boolean = false;

    private _spectating?: Player;

    get spectating(): Player | undefined {
        return this._spectating;
    }

    set spectating(player: Player | undefined) {
        if (player === this) {
            throw new Error(`Player ${player.name} tried spectate themselves (how tf did this happen?)`);
        }
        if (this._spectating === player) return;

        if (this._spectating) {
            this._spectating.spectatorCount--;
            this._spectating.spectators.delete(this);
        }
        if (player) {
            player.spectatorCount++;
            player.spectators.add(this);
        }

        this._spectating = player;
        this.startedSpectating = true;
    }

    spectators = new Set<Player>();

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

    /**
     * specifically for reloading single shot guns to keep reloading until maxClip is reached
     */
    reloadAgain = false;

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

    msgsToSend: Array<{ type: number, msg: Msg }> = [];

    weaponManager = new WeaponManager(this);
    recoilTicker = 0;

    constructor(
        game: Game,
        pos: Vec2,
        public socketSend: (msg: ArrayBuffer | Uint8Array) => void,
        public closeSocket: () => void) {
        super(game, pos);

        this.collider = collider.createCircle(pos, this.rad);

        if (game.config.map !== "faction") {
            this.groupId = this.teamId = this.game.groupIdAllocator.getNextId();
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

    update(dt: number): void {
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

        if (this.boost > 0) {
            this.boost -= 0.375 * dt;
        }
        if (this.boost > 0 && this.boost <= 25) this.health += 1 * dt;
        else if (this.boost > 25 && this.boost <= 50) this.health += 3.75 * dt;
        else if (this.boost > 50 && this.boost <= 87.5) this.health += 4.75 * dt;
        else if (this.boost > 87.5 && this.boost <= 100) this.health += 5 * dt;

        if (this.game.gas.doDamage && this.game.gas.isInGas(this.pos)) {
            this.damage({
                amount: this.game.gas.damage,
                damageType: GameConfig.DamageType.Gas,
                dir: v2.randomUnit()
            });
        }

        if (this.reloadAgain) {
            this.reloadAgain = false;
            this.weaponManager.tryReload();
        }

        // handle heal and boost actions

        if (this.actionType !== GameConfig.Action.None) {
            this.action.time += dt;
            this.action.time = math.clamp(this.action.time, 0, Constants.ActionMaxDuration);
        }

        if (this.action.time >= this.action.duration) {
            if (this.actionType === GameConfig.Action.UseItem) {
                const itemDef = GameObjectDefs[this.actionItem] as HealDef | BoostDef;
                if ("heal" in itemDef) this.health += itemDef.heal;
                if ("boost" in itemDef) this.boost += itemDef.boost;
                this.inventory[this.actionItem]--;
                this.inventoryDirty = true;
            } else if (this.isReloading()) {
                this.weaponManager.reload();
            }

            this.cancelAction();

            if (
                (this.curWeapIdx == GameConfig.WeaponSlot.Primary || this.curWeapIdx == GameConfig.WeaponSlot.Secondary) &&
                this.weapons[this.curWeapIdx].ammo == 0
            ) {
                this.weaponManager.tryReload();
            }
        }

        this.recalculateSpeed();

        this.pos = v2.add(this.pos, v2.mul(movement, this.speed * dt));

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
    secondsSinceLastUpdate = 0;

    sendMsgs(dt: number): void {
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

        let player: Player;
        if (this.spectating == undefined) { // not spectating anyone
            player = this;
        } else if (this.spectating.dead) { // was spectating someone but they died so find new player to spectate
            player = this.spectating.killedBy ? this.spectating.killedBy : this.game.randomPlayer();
            if (player === this) {
                player = this.game.randomPlayer();
            }
            this.spectating = player;
        } else { // spectating someone currently who is still alive
            player = this.spectating;
        }

        const radius = player.zoom + 4;
        const rect = coldet.circleToAabb(player.pos, radius);

        this.secondsSinceLastUpdate += dt;
        if (this.game.grid.updateObjects ||
            this._firstUpdate ||
            this.startedSpectating ||
            this.secondsSinceLastUpdate > 0.5
        ) {
            this.secondsSinceLastUpdate = 0;
            const newVisibleObjects = new Set(this.game.grid.intersectCollider(rect));
            // client crashes if active player is not visible
            // so make sure its always added to visible objects
            newVisibleObjects.add(this);

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
        if (this.startedSpectating) {
            updateMsg.activePlayerIdDirty = true;

            // build the active player data object manually
            // To avoid setting the spectating player fields to dirty
            updateMsg.activePlayerData = {
                healthDirty: true,
                health: player.health,
                boostDirty: true,
                boost: player.boost,
                zoomDirty: true,
                zoom: player.zoom,
                actionDirty: true,
                action: player.action,
                inventoryDirty: true,
                inventory: player.inventory,
                scope: player.scope,
                weapsDirty: true,
                curWeapIdx: player.curWeapIdx,
                weapons: player.weapons,
                spectatorCountDirty: true,
                spectatorCount: player.spectatorCount
            };
            this.startedSpectating = false;
        } else {
            updateMsg.activePlayerIdDirty = player.activeIdDirty;
            updateMsg.activePlayerData = player;
        }

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

    /**
     * the main purpose of this function is to asynchronously set "spectating"
     * so there can be an if statement inside the update() func that handles the rest of the logic syncrhonously
     */
    spectate(spectateMsg: SpectateMsg): void {
        let playerToSpec: Player | undefined;
        if (spectateMsg.specBegin) {
            playerToSpec = this.killedBy ? this.killedBy : this.game.randomPlayer();
            if (playerToSpec === this) {
                playerToSpec = this.game.randomPlayer();
            }
        } else if (spectateMsg.specNext && this.spectating) {
            const playerBeingSpecIndex = this.game.spectatablePlayers.indexOf(this.spectating);
            const newIndex = (playerBeingSpecIndex + 1) % this.game.spectatablePlayers.length;
            playerToSpec = this.game.spectatablePlayers[newIndex];
        } else if (spectateMsg.specPrev && this.spectating) {
            const playerBeingSpecIndex = this.game.spectatablePlayers.indexOf(this.spectating);
            const newIndex = playerBeingSpecIndex == 0 ? this.game.spectatablePlayers.length - 1 : playerBeingSpecIndex - 1;
            playerToSpec = this.game.spectatablePlayers[newIndex];
        }
        this.spectating = playerToSpec;
    }

    damage(params: DamageParams) {
        if (this._health < 0) this._health = 0;
        if (this.dead) return;

        let finalDamage = params.amount;

        // ignore armor for gas and bleeding damage
        if (params.damageType !== GameConfig.DamageType.Gas && params.damageType !== GameConfig.DamageType.Bleeding) {
            let isHeadShot = false;

            const gameSourceDef = GameObjectDefs[params.gameSourceType ?? ""];

            if (gameSourceDef && "headshotMult" in gameSourceDef) {
                isHeadShot = gameSourceDef.headshotMult > 1 && Math.random() < 0.15;
                if (isHeadShot) {
                    finalDamage *= gameSourceDef.headshotMult;
                }
            }

            const chest = GameObjectDefs[this.chest] as ChestDef;
            if (chest && !isHeadShot) {
                finalDamage -= finalDamage * chest.damageReduction;
            }

            const helmet = GameObjectDefs[this.helmet] as HelmetDef;
            if (helmet) {
                finalDamage -= finalDamage * (helmet.damageReduction * (isHeadShot ? 1 : 0.3));
            }
        }

        if (this._health - finalDamage < 0) finalDamage = this.health;

        this.damageTaken += finalDamage;
        if (params.source instanceof Player) params.source.damageDealt += finalDamage;

        this.health -= finalDamage;

        if (this._health === 0) {
            this.kill(params);
        }
    }

    /**
     * adds gameover message to "this.msgsToSend" for the player and all their spectators
     */
    addGameOverMsg(winningTeamId: number = -1): void {
        const gameOverMsg = new GameOverMsg();
        gameOverMsg.playerStats.push(this);
        if (this.spectating) {
            gameOverMsg.teamRank = winningTeamId == this.spectating.teamId ? 1 : this.game.aliveCount + 1;
            gameOverMsg.teamId = this.spectating.teamId;
        } else {
            gameOverMsg.teamRank = winningTeamId == this.teamId ? 1 : this.game.aliveCount + 1;
            gameOverMsg.teamId = this.teamId;
        }
        gameOverMsg.winningTeamId = winningTeamId;
        gameOverMsg.gameOver = winningTeamId != -1;
        this.msgsToSend.push({ type: MsgType.GameOver, msg: gameOverMsg });
    }

    killedBy: Player | undefined;

    kill(params: DamageParams): void {
        this.dead = true;
        this.boost = 0;
        this.actionType = this.actionSeq = 0;
        this.animType = this.animSeq = 0;
        this.setDirty();

        this.shootHold = false;
        this.weaponManager.clearTimeouts();

        this.game.aliveCountDirty = true;
        this.game.livingPlayers.delete(this);
        this.game.spectatablePlayers.splice(this.game.spectatablePlayers.indexOf(this), 1);

        //
        // Send kill msg
        //
        const killMsg = new KillMsg();
        killMsg.damageType = params.damageType;
        killMsg.itemSourceType = params.gameSourceType ?? "";
        killMsg.mapSourceType = params.mapSourceType ?? "";
        killMsg.targetId = this.__id;
        killMsg.killed = true;

        if (params.source instanceof Player) {
            this.killedBy = params.source;
            if (params.source !== this) params.source.kills++;
            killMsg.killerId = params.source.__id;
            killMsg.killCreditId = params.source.__id;
            killMsg.killerKills = params.source.kills;
        }

        this.game.msgsToSend.push({ type: MsgType.Kill, msg: killMsg });

        //
        // Send game over message to player
        //

        if (this.game.isGameOver()) {
            this.game.initGameEnd(this.killedBy ?? this.game.spectatablePlayers[0], this);
        } else {
            this.addGameOverMsg();
        }

        const deadBody = new DeadBody(this.game, this.pos, this.__id, this.layer, params.dir);
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
        if (this.loadout.emotes[GameConfig.EmoteSlot.Death] != "") {
            this.game.emotes.push(new Emote(this.__id, this.pos, this.loadout.emotes[GameConfig.EmoteSlot.Death], false));
        }
    }

    isReloading() {
        return this.actionType == GameConfig.Action.Reload || this.actionType == GameConfig.Action.ReloadAlt;
    }

    useHealingItem(item: string): void {
        const itemDef = GameObjectDefs[item];
        if (itemDef.type !== "heal") {
            throw new Error(`Invalid heal item ${item}`);
        }
        if (this.health == itemDef.maxHeal || this.actionType == GameConfig.Action.UseItem) {
            return;
        }
        if (!this.inventory[item]) {
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
        if (!this.inventory[item]) {
            return;
        }

        this.cancelAction();
        this.doAction(item, GameConfig.Action.UseItem, itemDef.useTime);
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
                const obstacle = this.getClosestObstacle();
                if (loot && obstacle) {
                    this.interactWith(loot);
                    this.interactWith(obstacle);
                } else if (loot) {
                    this.interactWith(loot);
                } else if (obstacle) {
                    this.interactWith(obstacle);
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
                this.weaponManager.tryReload();
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

    getFreeGunSlot(obj: Loot) {
        let availSlot = -1;
        let cause = PickupMsgType.Success;
        let indexOf = -1;
        let isDualWield = false;
        const gunSlots = [GameConfig.WeaponSlot.Primary, GameConfig.WeaponSlot.Secondary];
        for (const slot of gunSlots) {
            const slotDef = GameObjectDefs[this.weapons[slot].type] as GunDef | undefined;
            const dualWield = (slotDef?.dualWieldType) && (obj.type === this.weapons[slot].type);
            if (this.weapons[slot].type === obj.type) {
                indexOf = slot;
            }
            if (this.weapons[slot].type === "" || dualWield) {
                availSlot = slot;
                isDualWield = dualWield || false;
                break;
            }
            if (this.weapons[slot].type === obj.type && !dualWield && slot as number == gunSlots.length - 1) {
                cause = PickupMsgType.AlreadyOwned;
                break;
            }
        }
        return {
            availSlot,
            isDualWield,
            cause,
            indexOf
        };
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
                this.weaponManager.tryReload();
            }
        }
            break;
        case "melee":
            this.weaponManager.dropMelee();
            this.weapons[GameConfig.WeaponSlot.Melee].type = obj.type;
            this.weapsDirty = true;
            if (this.curWeapIdx === GameConfig.WeaponSlot.Melee) this.setDirty();
            break;
        case "gun": {
            amountLeft = 0;
            removeLoot = true;

            const freeGunSlot = this.getFreeGunSlot(obj);
            pickupMsg.type = freeGunSlot.cause;
            let newGunIdx = freeGunSlot.availSlot;

            if (freeGunSlot.availSlot == -1) {
                newGunIdx = this.curWeapIdx;
                if (this.curWeapIdx in [GameConfig.WeaponSlot.Primary, GameConfig.WeaponSlot.Secondary] && obj.type != this.weapons[this.curWeapIdx].type) {
                    this.weaponManager.dropGun(this.curWeapIdx, false);
                    this.weapons[this.curWeapIdx].type = obj.type;
                } else {
                    removeLoot = false;
                    pickupMsg.type = PickupMsgType.Full;
                }
            } else if (freeGunSlot.isDualWield) {
                this.weapons[freeGunSlot.availSlot].type = def.dualWieldType!;
            } else {
                this.weapons[freeGunSlot.availSlot].type = obj.type;
            }

            this.weapons[newGunIdx].cooldown = 0;
            if (this.curWeapIdx === GameConfig.WeaponSlot.Melee) {
                this.weaponManager.setCurWeapIndex(newGunIdx);
            }
            if (this.weapons[newGunIdx].ammo <= 0 && newGunIdx === this.curWeapIdx) {
                this.cancelAction();
                this.weaponManager.tryReload();
            }
            this.weapsDirty = true;
            this.setDirty();
        } break;
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
        }
        this.msgsToSend.push({
            type: MsgType.Pickup,
            msg: pickupMsg
        });
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

            this.game.lootBarn.splitUpLoot(this, dropMsg.item, amountToDrop, this.dir);
            this.inventory[dropMsg.item] -= amountToDrop;
            this.inventoryDirty = true;
            break;
        }
        case "scope": {
            if (itemDef.level === 1) break;
            const scopeLevel = `${itemDef.level}xscope`;
            const scopeIdx = SCOPE_LEVELS.indexOf(scopeLevel);

            this.game.lootBarn.addLoot(
                dropMsg.item,
                this.pos,
                this.layer,
                1,
                undefined,
                -4,
                this.dir
            );
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
            this.game.lootBarn.addLoot(
                dropMsg.item,
                this.pos,
                this.layer,
                1,
                undefined,
                -4,
                this.dir
            );
            this[itemDef.type] = "";
            this.setDirty();
            break;
        }
        case "heal":
        case "boost": {
            if (this.inventory[dropMsg.item] === 0) break;
            this.inventory[dropMsg.item]--;
            // @TODO: drop more than one?
            this.game.lootBarn.addLoot(
                dropMsg.item,
                this.pos,
                this.layer,
                1,
                undefined,
                -4,
                this.dir
            );
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

            this.game.lootBarn.splitUpLoot(this, dropMsg.item, amountToDrop, this.dir);
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

        this.action.targetId = 0;
        this.action.duration = duration;
        this.action.time = 0;

        this.actionDirty = true;
        this.actionItem = actionItem;
        this.actionType = actionType;
        this.actionSeq++;
        this.setDirty();
    }

    cancelAction(): void {
        if (this.actionType === GameConfig.Action.None) {
            return;
        }
        this.action.duration = 0;
        this.action.targetId = 0;
        this.action.time = 0;

        this.actionItem = "";
        this.actionType = GameConfig.Action.None;
        this.actionSeq++;
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
            this.socketSend(buffer);
        } catch (e) {
            console.warn("Error sending packet. Details:", e);
        }
    }
}

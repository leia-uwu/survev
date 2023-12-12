import { GameObjectDefs } from "../defs/gameObjectDefs";
import { type MeleeDef } from "../defs/objectsTypings";
import { gameConfig } from "../gameConfig";
import { type GameObject, ObjectType } from "../objects/gameObject";
import { Obstacle } from "../objects/obstacle";
import { Player } from "../objects/player";
import { coldet } from "./coldet";
import { collider } from "./collider";
import { collisionHelpers } from "./collisionHelpers";
import math from "./math";
import { util } from "./util";
import { type Vec2, v2 } from "./v2";

export class WeaponManager {
    player: Player;

    constructor(player: Player) {
        this.player = player;
    }

    get activeWeapon(): string {
        return this.player.activeWeapon;
    }

    meleeCooldown = 0;

    shootStart(): void {
        const def = GameObjectDefs[this.activeWeapon];

        if (def) {
            switch (def.type) {
                case "melee": {
                    if (this.player.game.now > this.meleeCooldown)
                        this.meleeAttack()
                    break;
                }
            }
        }
    }

    shootHold(): void {

    }

    update(): void {

    }

    getMeleeCollider() {
        const meleeDef = GameObjectDefs[this.player.activeWeapon] as MeleeDef;
        const rot = Math.atan2(this.player.dir.y, this.player.dir.x);

        const pos = v2.add(
            meleeDef.attack.offset,
            v2.mul(v2.create(1, 0), this.player.scale - 1)
        );
        const rotated = v2.add(this.player.pos, v2.rotate(pos, rot));
        const rad = meleeDef.attack.rad;
        return collider.createCircle(rotated, rad, 0);
    }

    meleeAttack(): void {
        const meleeDef = GameObjectDefs[this.player.activeWeapon] as MeleeDef;

        this.player.animType = gameConfig.Anim.Melee;
        this.player.animSeq++;
        this.player.setDirty();
        this.meleeCooldown = this.player.game.now + (meleeDef.attack.cooldownTime * 1000);

        setTimeout(() => {
            this.player.animType = gameConfig.Anim.None;
            this.player.animSeq++;
            this.player.setDirty();
        }, meleeDef.attack.cooldownTime * 1000);

        const damageTimes = meleeDef.attack.damageTimes;
        for (let i = 0; i < damageTimes.length; i++) {
            const damageTime = damageTimes[i];
            setTimeout(() => {
                this.meleeDamage();
            }, damageTime * 1000)
        }
    }

    meleeDamage(): void {
        const meleeDef = GameObjectDefs[this.activeWeapon];

        if (meleeDef === undefined || meleeDef.type !== "melee" || this.player.dead) {
            return;
        }

        const coll = this.getMeleeCollider();
        const lineEnd = coll.rad + v2.length(v2.sub(this.player.pos, coll.pos));

        const hits: Array<{
            obj: GameObject
            prio: number
            pos: Vec2
            pen: number
        }> = [];

        const objs = [...this.player.game.grid.intersectCollider(coll)];

        const obstacles = objs.filter(obj => obj.kind === ObjectType.Obstacle) as Obstacle[];

        for (const obstacle of obstacles) {
            if (!(obstacle.dead ||
                obstacle.isSkin ||
                obstacle.height < gameConfig.player.meleeHeight) &&
                util.sameLayer(obstacle.layer, 1 & this.player.layer)) {
                let collision = collider.intersectCircle(
                    obstacle.collider,
                    coll.pos,
                    coll.rad
                );

                if (meleeDef.cleave) {
                    const normalized = v2.normalizeSafe(
                        v2.sub(obstacle.pos, this.player.pos),
                        v2.create(1, 0)
                    );
                    const intersectedObstacle = collisionHelpers.intersectSegment(
                        obstacles,
                        this.player.pos,
                        normalized,
                        lineEnd,
                        1,
                        this.player.layer,
                        false
                    );
                    intersectedObstacle && intersectedObstacle.id !== obstacle.id && (collision = null);
                }
                if (collision) {
                    const pos = v2.add(
                        coll.pos,
                        v2.mul(
                            v2.neg(collision.dir),
                            coll.rad - collision.pen
                        )
                    );
                    hits.push({
                        obj: obstacle,
                        pen: collision.pen,
                        prio: 1,
                        pos
                    });
                }
            }
        }
        const players = objs.filter(obj => obj.kind === ObjectType.Player) as Player[];

        for (const player of players) {
            if (player.id !== this.player.id &&
                !player.dead &&
                util.sameLayer(player.layer, this.player.layer)
            ) {
                const normalized = v2.normalizeSafe(
                    v2.sub(player.pos, this.player.pos),
                    v2.create(1, 0)
                );
                const collision = coldet.intersectCircleCircle(
                    coll.pos,
                    coll.rad,
                    player.pos,
                    player.rad
                );
                if (collision &&
                    math.eqAbs(
                        lineEnd,
                        collisionHelpers.intersectSegmentDist(
                            obstacles,
                            this.player.pos,
                            normalized,
                            lineEnd,
                            gameConfig.player.meleeHeight,
                            this.player.layer,
                            false
                        )
                    )
                ) {
                    hits.push({
                        obj: player,
                        pen: collision.pen,
                        prio: player.teamId === this.player.teamId ? 2 : 0,
                        pos: v2.copy(player.pos)
                    });
                }
            }
        }
        hits.sort((a, b) => {
            return a.prio === b.prio
                ? b.pen - a.pen
                : a.prio - b.prio;
        });
        let maxHits = hits.length;
        if (!meleeDef.cleave) maxHits = math.min(maxHits, 1);

        for (let i = 0; i < maxHits; i++) {
            const hit = hits[i];
            const obj = hit.obj;

            if (obj instanceof Obstacle) {
                obj.damage(meleeDef.damage * meleeDef.obstacleDamage);
            } else if (obj instanceof Player) {
                obj.damage(meleeDef.damage, this.player, meleeDef, gameConfig.DamageType.Player)
            }
        }
    }
}

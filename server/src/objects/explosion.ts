import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";
import { util } from "../../../shared/utils/util";
import { type Vec2, v2 } from "../../../shared/utils/v2";
import { type Game } from "../game";
import { Decal } from "./decal";
import { type GameObject } from "./gameObject";

export class Explosion {
    constructor(
        public type: string,
        public pos: Vec2,
        public layer: number,
        public sourceType: string,
        public damageType: number,
        public source?: GameObject
    ) {
    }

    explode(game: Game): void {
        // List of all near objects

        const def = GameObjectDefs[this.type];
        if (def.type !== "explosion") {
            throw new Error(`Invalid explosion with type ${this.type}`);
        }

        // TODO
        // const coll = collider.createCircle(this.pos, def.rad.max);

        // const objects = game.grid.intersectCollider(coll);
        // const damagedObjects = new Map<number, boolean>();

        // const obstacles: Obstacle[] = objects.filter(obj => obj.__type === ObjectType.Obstacle);

        const bulletDef = GameObjectDefs[def.shrapnelType];
        if (bulletDef && bulletDef.type === "bullet") {
            for (let i = 0, count = def.shrapnelCount ?? 0; i < count; i++) {
                game.bulletManager.fireBullet(
                    {
                        bulletType: def.shrapnelType,
                        pos: this.pos,
                        layer: this.layer,
                        damageType: this.damageType,
                        playerId: this.source?.id ?? 0,
                        shotFx: false,
                        damageMult: 1,
                        variance: util.random(0, bulletDef.variance),
                        sourceType: this.sourceType,
                        maxDistance: bulletDef.distance,
                        dir: v2.randomUnit()
                    }
                );
            }
        }

        if (def.decalType) {
            game.grid.addObject(
                new Decal(
                    game,
                    def.decalType,
                    this.pos,
                    this.layer,
                    0,
                    1
                )
            );
        }
    }
}

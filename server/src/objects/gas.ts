import { type Vec2, v2 } from "./../../../shared/utils/v2";
import { GameConfig } from "../../../shared/gameConfig";
import { math } from "../../../shared/utils/math";
import { type Game } from "../game";
import { util } from "../../../shared/utils/util";

const GasMode = GameConfig.GasMode;
export class Gas {
    stage = 0;
    mode: number = GasMode.Inactive;

    get duration() {
        if (this.mode === GasMode.Inactive) return 0;
        if (this.mode === GasMode.Moving) return this.gasTime;
        return this.waitTime;
    }

    waitTime: number = GameConfig.gas.initWaitTime;
    gasTime: number = GameConfig.gas.initGasTime;

    damage = 0;

    radOld: number;
    radNew: number;
    currentRad: number;

    posOld: Vec2;
    posNew: Vec2;
    currentPos: Vec2;

    countdownStart = 0;

    /** Gas Timer */
    gasT = 0;

    dirty = true;
    timeDirty = true;

    private _damageTicker = 0;

    private _doDamage = false;
    get doDamage() {
        return this._doDamage;
    }

    readonly game: Game;

    constructor(
        game: Game
    ) {
        this.game = game;

        const mapSize = (game.map.width + game.map.height) / 2;

        this.radNew = this.radOld = this.currentRad = GameConfig.gas.initWidth * mapSize;

        this.posOld = v2.create(
            game.map.width / 2,
            game.map.height / 2
        );

        this.posNew = v2.copy(this.posOld);
        this.currentPos = v2.copy(this.posOld);
    }

    update(dt: number) {
        if (this.gasT >= 1) {
            this.advanceGasStage();
        }

        if (this.mode != GasMode.Inactive) {
            this.gasT = (this.game.now - this.countdownStart) / 1000 / this.duration;
            this.timeDirty = true;
        }

        this._doDamage = false;
        this._damageTicker += dt;

        if (this._damageTicker >= GameConfig.gas.damageTickRate) {
            this._damageTicker = 0;
            this._doDamage = true;
        }

        if (this.mode === GasMode.Moving) {
            this.currentPos = v2.lerp(this.gasT, this.posOld, this.posNew);
            this.currentRad = math.lerp(this.gasT, this.radOld, this.radNew);
        }
    }

    advanceGasStage() {
        if (this.mode !== GasMode.Waiting) {
            this.radOld = this.currentRad;

            if (this.radNew > 0) {
                this.radNew = this.currentRad * GameConfig.gas.widthDecay;

                if (this.radNew < GameConfig.gas.widthMin) {
                    this.radNew = 0;
                }

                this.posOld = v2.copy(this.posNew);

                this.posNew = v2.add(this.posOld, util.randomPointInCircle(this.radNew));

                const rad = this.radNew;
                this.posNew = math.v2Clamp(this.posNew,
                    v2.create(rad, rad),
                    v2.create(this.game.map.width - rad, this.game.map.height - rad)
                );
            }

            this.currentRad = this.radOld;
            this.currentPos = this.posOld;
        }

        switch (this.mode) {
        case GasMode.Inactive: {
            this.mode = GasMode.Waiting;
            break;
        }
        case GasMode.Waiting: {
            this.mode = GasMode.Moving;
            this.gasTime = math.max(this.gasTime - GameConfig.gas.gasTimeDecay, GameConfig.gas.gasTimeMin);
            if (this.radNew > 0) this.stage++;
            break;
        }
        case GasMode.Moving: {
            this.waitTime = math.max(this.waitTime - GameConfig.gas.waitTimeDecay, GameConfig.gas.waitTimeMin);
            this.mode = GasMode.Waiting;
            break;
        }
        }

        this.countdownStart = this.game.now;
        this.damage = GameConfig.gas.damage[math.clamp(this.stage - 1, 0, GameConfig.gas.damage.length - 1)];
        this.dirty = true;
        this.timeDirty = true;
    }

    isInGas(pos: Vec2) {
        return v2.distance(pos, this.currentPos) >= this.currentRad;
    }
}

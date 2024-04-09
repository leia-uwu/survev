import { type Vec2, v2 } from "./../../../shared/utils/v2";
import { GameConfig } from "../../../shared/gameConfig";
import { math } from "../../../shared/utils/math";
import { type Game } from "../game";

export interface GasData {
    mode: number
    duration: number
    posOld: Vec2
    posNew: Vec2
    radOld: number
    radNew: number
}

const GasMode = GameConfig.GasMode;
export class Gas {
    stage = 0;
    mode: number;
    duration: number;
    damage: number;

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

    private _lastDamageTimestamp = 0;

    private _doDamage = false;
    get doDamge() {
        return this._doDamage;
    }

    readonly game: Game;
    readonly mapSize: number;

    constructor(
        game: Game
    ) {
        this.game = game;
        this.mapSize = (game.map.width + game.map.height) / 2;
        this._lastDamageTimestamp = this.game.now;

        const firstStage = GasStages[this.stage];
        this.mode = firstStage.mode;
        this.damage = firstStage.damage;
        this.duration = firstStage.duration;

        this.posOld = v2.create(game.map.width / 2, game.map.height / 2);
        this.posNew = v2.copy(this.posOld);
        this.currentPos = v2.copy(this.posOld);

        this.radNew = firstStage.radNew * this.mapSize;
        this.radOld = firstStage.radOld * this.mapSize;
        this.currentRad = firstStage.radOld * this.mapSize;
    }

    update() {
        if (this.mode != GasMode.Inactive) {
            this.gasT = (this.game.now - this.countdownStart) / 1000 / this.duration;
            this.timeDirty = true;
        }

        this._doDamage = false;

        if (this.game.now - this._lastDamageTimestamp >= 2000) {
            this._lastDamageTimestamp = this.game.now;
            this._doDamage = true;
            if (this.mode === GasMode.Moving) {
                this.currentPos = v2.lerp(this.gasT, this.posOld, this.posNew);
                this.currentRad = math.lerp(this.gasT, this.radOld, this.radNew);
            }
        }
    }

    advanceGasStage() {
        const currentStage = GasStages[this.stage + 1];
        if (!currentStage) return;

        this.stage++;
        this.mode = currentStage.mode;
        this.duration = currentStage.duration;
        this.gasT = 1;
        this.countdownStart = this.game.now;

        if (currentStage.mode === GasMode.Waiting) {
            this.posOld = v2.copy(this.posNew);
            if (currentStage.radNew !== 0) {
                this.posNew = math.randomPointInsideCircle(this.posOld, currentStage.radNew * this.mapSize);
            } else {
                this.posNew = v2.copy(this.posOld);
            }
            this.currentPos = v2.copy(this.posOld);
            this.currentRad = currentStage.radOld * this.mapSize;
        }

        this.radOld = currentStage.radOld * this.mapSize;
        this.radNew = currentStage.radNew * this.mapSize;
        this.damage = currentStage.damage;
        this.dirty = true;
        this.timeDirty = true;

        if (currentStage.duration !== 0) {
            this.game.timeouts.push(
                setTimeout(() => this.advanceGasStage(), currentStage.duration * 1000)
            );
        }
    }

    isInGas(pos: Vec2) {
        return v2.distance(pos, this.currentPos) >= this.currentRad;
    }
}

const GasStages = [
    {
        mode: GasMode.Inactive,
        duration: 0,
        radOld: 0.7,
        radNew: 0.7,
        damage: 0
    },
    {
        mode: GasMode.Waiting,
        duration: 80,
        radOld: 0.8,
        radNew: 0.31,
        damage: 0
    },
    {
        mode: GasMode.Moving,
        duration: 30,
        radOld: 0.8,
        radNew: 0.31,
        damage: 1.57
    },
    {
        mode: GasMode.Waiting,
        duration: 65,
        radOld: 0.31,
        radNew: 0.14,
        damage: 2.35
    },
    {
        mode: GasMode.Moving,
        duration: 25,
        radOld: 0.31,
        radNew: 0.14,
        damage: 2.35
    },
    {
        mode: GasMode.Waiting,
        duration: 50,
        radOld: 0.14,
        radNew: 0.06,
        damage: 3.53
    },
    {
        mode: GasMode.Moving,
        duration: 20,
        radOld: 0.14,
        radNew: 0.06,
        damage: 3.53
    },
    {
        mode: GasMode.Waiting,
        duration: 40,
        radOld: 0.06,
        radNew: 0.018,
        damage: 7.45
    },
    {
        mode: GasMode.Moving,
        duration: 15,
        radOld: 0.06,
        radNew: 0.018,
        damage: 7.45
    },
    {
        mode: GasMode.Waiting,
        duration: 30,
        radOld: 0.018,
        radNew: 0.006,
        damage: 9.8
    },
    {
        mode: GasMode.Moving,
        duration: 10,
        radOld: 0.018,
        radNew: 0.006,
        damage: 9.8
    },
    {
        mode: GasMode.Waiting,
        duration: 25,
        radOld: 0.006,
        radNew: 0.0015,
        damage: 14.12
    },
    {
        mode: GasMode.Moving,
        duration: 5,
        radOld: 0.006,
        radNew: 0.0015,
        damage: 14.12
    },
    {
        mode: GasMode.Waiting,
        duration: 20,
        radOld: 0.0015,
        radNew: 0.008,
        damage: 22
    },
    {
        mode: GasMode.Moving,
        duration: 6,
        radOld: 0.0015,
        radNew: 0.008,
        damage: 22
    },
    {
        mode: GasMode.Waiting,
        duration: 15,
        radOld: 0.008,
        radNew: 0,
        damage: 22
    },
    {
        mode: GasMode.Moving,
        duration: 15,
        radOld: 0.008,
        radNew: 0,
        damage: 22
    }
];

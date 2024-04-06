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
    currentRad = 534.6;

    posOld = v2.create(360, 360);
    posNew = v2.create(360, 360);
    currentPos = v2.create(360, 360);

    countdownStart = 0;

    /** Gas Timer */
    gasT = 0;

    dirty = true;
    timeDirty = true;

    get data(): GasData {
        return {
            duration: this.duration,
            mode: this.mode,
            posNew: this.posNew,
            posOld: this.posOld,
            radNew: this.radNew,
            radOld: this.radOld
        };
    }

    private _lastDamageTimestamp = 0;

    private _doDamage = false;
    get doDamge() {
        return this._doDamage;
    }

    readonly game: Game;

    constructor(
        game: Game
    ) {
        this.game = game;
        this._lastDamageTimestamp = this.game.now;

        const firstStage = GasStages[this.stage];
        this.mode = firstStage.mode;
        this.damage = firstStage.damage;
        this.radNew = firstStage.radNew;
        this.radOld = firstStage.radOld;
        this.duration = firstStage.duration;
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
                this.posNew = math.randomPointInsideCircle(this.posOld, currentStage.radOld - currentStage.radNew);
            } else {
                this.posNew = v2.copy(this.posOld);
            }
            this.currentPos = v2.copy(this.posOld);
            this.currentRad = currentStage.radOld;
        }

        this.radOld = currentStage.radOld;
        this.radNew = currentStage.radNew;
        this.damage = currentStage.damage;
        this.dirty = true;
        this.timeDirty = true;

        if (currentStage.duration !== 0) {
            setTimeout(() => this.advanceGasStage(), currentStage.duration * 1000);
        }
    }

    isInGas(pos: Vec2) {
        return math.distanceBetween(pos, this.currentPos) >= this.currentRad;
    }
}

const GasStages = [
    {
        mode: GasMode.Inactive,
        duration: 0,
        radOld: 534.6,
        radNew: 534.6,
        damage: 0
    },
    {
        mode: GasMode.Waiting,
        duration: 80,
        radOld: 534.6,
        radNew: 324,
        damage: 0
    },
    {
        mode: GasMode.Moving,
        duration: 30,
        radOld: 534.6,
        radNew: 324,
        damage: 1.57
    },
    {
        mode: GasMode.Waiting,
        duration: 65,
        radOld: 324,
        radNew: 225,
        damage: 2.35
    },
    {
        mode: GasMode.Moving,
        duration: 25,
        radOld: 324,
        radNew: 225,
        damage: 2.35
    },
    {
        mode: GasMode.Waiting,
        duration: 50,
        radOld: 225,
        radNew: 153,
        damage: 3.53
    },
    {
        mode: GasMode.Moving,
        duration: 20,
        radOld: 225,
        radNew: 153,
        damage: 3.53
    },
    {
        mode: GasMode.Waiting,
        duration: 40,
        radOld: 153,
        radNew: 99,
        damage: 7.45
    },
    {
        mode: GasMode.Moving,
        duration: 15,
        radOld: 153,
        radNew: 99,
        damage: 7.45
    },
    {
        mode: GasMode.Waiting,
        duration: 30,
        radOld: 99,
        radNew: 54,
        damage: 9.8
    },
    {
        mode: GasMode.Moving,
        duration: 10,
        radOld: 99,
        radNew: 54,
        damage: 9.8
    },
    {
        mode: GasMode.Waiting,
        duration: 25,
        radOld: 54,
        radNew: 32.4,
        damage: 14.12
    },
    {
        mode: GasMode.Moving,
        duration: 5,
        radOld: 54,
        radNew: 32.4,
        damage: 14.12
    },
    {
        mode: GasMode.Waiting,
        duration: 20,
        radOld: 32.4,
        radNew: 16.2,
        damage: 22
    },
    {
        mode: GasMode.Moving,
        duration: 6,
        radOld: 32.4,
        radNew: 16.2,
        damage: 22
    },
    {
        mode: GasMode.Waiting,
        duration: 15,
        radOld: 16.2,
        radNew: 0,
        damage: 22
    },
    {
        mode: GasMode.Moving,
        duration: 15,
        radOld: 16.2,
        radNew: 0,
        damage: 22
    }
];

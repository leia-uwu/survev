import { ExplosionDefs } from "../../../shared/defs/gameObjects/explosionsDefs";
import { collider } from "../../../shared/utils/collider";
import { math } from "../../../shared/utils/math";
import { util } from "../../../shared/utils/util";
import { v2 } from "../../../shared/utils/v2";

class PhysicsParticle {
    constructor() {
        this.active = false;
    }

    init(pos, vel, layer, particle) {
        this.pos = v2.copy(pos);
        this.vel = v2.copy(vel);
        this.layer = layer;
        this.particle = particle;
        this.ticker = 0;
        this.colCount = 0;
        this.active = true;
    }

    /**
     * @param {number} dt
     * @param {import("../map").Map} map
     * @param {import("../objects/player").PlayerBarn} playerBarn
     */
    update(dt, map, playerBarn) {
        // Move and collide with obstacles
        const posOld = v2.copy(this.pos);
        this.pos = v2.add(this.pos, v2.mul(this.vel, dt));
        this.vel = v2.mul(this.vel, 1 / (1 + dt * 5));

        // Gather colliders
        const colliders = [];
        const obstacles = map.obstaclePool.getPool();
        for (let n = 0; n < obstacles.length; n++) {
            const obstacle = obstacles[n];
            if (
                obstacle.active &&
                !obstacle.dead &&
                util.sameLayer(this.layer, obstacle.layer)
            ) {
                colliders.push(obstacle.collider);
            }
        }

        const players = playerBarn.playerPool.getPool();
        for (let i = 0; i < players.length; i++) {
            const player = players[i];
            if (
                player.active &&
                !player.dead &&
                util.sameLayer(this.layer, player.layer)
            ) {
                colliders.push(collider.createCircle(player.pos, player.rad, 0));
            }
        }

        // Intersect with nearest collider
        const cols = [];
        for (let i = 0; i < colliders.length; i++) {
            const res = collider.intersectSegment(colliders[i], posOld, this.pos);
            if (res) {
                const dist = v2.length(v2.sub(res.point, posOld));
                cols.push({
                    point: res.point,
                    normal: res.normal,
                    dist
                });
            }
        }
        cols.sort((a, b) => {
            return a.dist - b.dist;
        });
        if (cols.length > 0) {
            const col = cols[0];
            const dir = v2.normalizeSafe(this.vel, v2.create(1, 0));
            const spd = v2.length(this.vel);
            const reflectDir = v2.sub(
                dir,
                v2.mul(col.normal, v2.dot(col.normal, dir) * 2)
            );
            // Hacky physics:
            // Apply friction only after the first impact; the idea is to
            // have explosions that happen near walls throw their particles
            // off of the wall at full velocity.
            const friction = this.colCount++ > 0 ? 0.35 : 1;
            this.pos = v2.add(col.point, v2.mul(col.normal, 0.01));
            this.vel = v2.mul(reflectDir, spd * friction);
        }
        this.particle.pos = v2.copy(this.pos);
        this.ticker += dt;
        if (this.ticker >= this.particle.life) {
            this.particle.n();
            this.active = false;
        }
    }
}
class Explosion {
    constructor(e) {
        this.active = false;
    }

    init(type, pos, layer) {
        const expType = ExplosionDefs[type].explosionEffectType;
        const def = ExplosionEffectDefs[expType];
        this.active = true;
        this.done = false;
        this.type = type;
        this.pos = v2.copy(pos);
        this.layer = layer;
        this.ticker = 0;
        this.lifetime = def.lifetime;
        this.soundInstance = null;
        this.soundUpdateThrottle = 0;
    }

    n() {
        this.active = false;
    }

    update(dt, explosionBarn, particleBarn, audioManager, map, camera) {
        const expType = ExplosionDefs[this.type].explosionEffectType;
        const def = ExplosionEffectDefs[expType];

        if (this.ticker == 0) {
            // Airstrike explosions should not render if they happen indoors
            let renderVisuals = true;
            if (this.type == "explosion_bomb_iron") {
                const col = collider.createCircle(this.pos, 0.5);
                if (map.insideBuildingCeiling(col, true)) {
                    renderVisuals = false;
                }
            }
            if (
                renderVisuals &&
                (def.burst.particle &&
                    particleBarn.addParticle(
                        def.burst.particle,
                        this.layer,
                        this.pos,
                        v2.create(0, 0),
                        def.burst.scale,
                        0,
                        null
                    ),
                def.scatter)
            ) {
                for (let i = 0; i < def.scatter.count; i++) {
                    const particle = particleBarn.addParticle(
                        def.scatter.particle,
                        this.layer,
                        this.pos,
                        v2.create(0, 0),
                        1,
                        0,
                        null
                    );
                    const physPart = explosionBarn.addPhysicsParticle();
                    const vel = v2.mul(
                        v2.randomUnit(),
                        util.random(
                            def.scatter.speed.min,
                            def.scatter.speed.max
                        )
                    );
                    physPart.init(this.pos, vel, this.layer, particle);
                }
            }
            const surface = map.getGroundSurface(this.pos, this.layer);
            const sound =
                surface.type == "water"
                    ? def.burst.sound.water
                    : def.burst.sound.grass;

            let detune = 0;
            if (def.burst.sound.detune != undefined) {
                detune = def.burst.sound.detune;
            }

            let volume = 1;
            if (def.burst.sound.volume != undefined) {
                volume = def.burst.sound.volume;
            }

            this.soundInstance = audioManager.playSound(sound, {
                channel: "sfx",
                soundPos: this.pos,
                layer: this.layer,
                filter: "muffled",
                rangeMult: 2,
                ignoreMinAllowable: true,
                detune,
                volumeScale: volume
            });

            // Create ripples if in water
            if (surface.type == "water") {
                for (let i = 0; i < def.rippleCount; i++) {
                    const maxRad = def.rippleCount * 0.5;
                    const ripplePos = v2.add(
                        this.pos,
                        v2.mul(v2.randomUnit(), util.random(0, maxRad))
                    );
                    const part = particleBarn.addRippleParticle(
                        ripplePos,
                        this.layer,
                        surface.data.rippleColor
                    );
                    part.setDelay(i * 0.06);
                }
            }
        }
        if (this.soundInstance && this.soundUpdateThrottle < 0) {
            this.soundUpdateThrottle = 0.1;
            let volume = 1;
            if (def.burst.sound.volume != undefined) {
                volume = def.burst.sound.volume;
            }
            audioManager.updateSound(this.soundInstance, "sfx", this.pos, {
                layer: this.layer,
                filter: "muffled",
                volumeScale: volume
            });
        } else {
            this.soundUpdateThrottle -= dt;
        }
        this.ticker += dt;
        const shakeT = math.min(this.ticker / def.shakeDur, 1);
        const shakeInt = math.lerp(shakeT, def.shakeStr, 0);
        camera.addShake(this.pos, shakeInt);
        if (this.ticker >= this.lifetime) {
            this.active = false;
        }
    }
}
export class ExplosionBarn {
    constructor() {
        this.explosions = [];
        this.physicsParticles = [];
    }

    addExplosion(type, pos, layer) {
        let a = null;
        for (let i = 0; i < this.explosions.length; i++) {
            if (!this.explosions[i].active) {
                a = this.explosions[i];
                break;
            }
        }
        if (!a) {
            a = new Explosion(this);
            this.explosions.push(a);
        }
        a.init(type, pos, layer);
    }

    addPhysicsParticle() {
        let p = null;
        for (let i = 0; i < this.physicsParticles.length; i++) {
            const particle = this.physicsParticles[i];
            if (!particle.active) {
                p = particle;
                break;
            }
        }
        if (!p) {
            p = new PhysicsParticle();
            this.physicsParticles.push(p);
        }
        return p;
    }

    update(dt, map, playerBarn, camera, particleBarn, audioManager, debug) {
        for (let i = 0; i < this.explosions.length; i++) {
            const e = this.explosions[i];
            if (e.active) {
                e.update(dt, this, particleBarn, audioManager, map, camera);
                if (!e.active) {
                    e.n();
                }
            }
        }
        for (let i = 0; i < this.physicsParticles.length; i++) {
            const p = this.physicsParticles[i];
            if (p.active) {
                p.update(dt, map, playerBarn);
            }
        }
    }
}

const ExplosionEffectDefs = {
    frag: {
        burst: {
            particle: "explosionBurst",
            scale: 1,
            sound: {
                grass: "explosion_01",
                water: "explosion_02"
            }
        },
        rippleCount: 10,
        shakeStr: 0.2,
        shakeDur: 0.35,
        lifetime: 2
    },
    smoke: {
        burst: {
            particle: "explosionBurst",
            scale: 0,
            sound: {
                grass: "explosion_smoke_01",
                water: "explosion_smoke_01"
            }
        },
        rippleCount: 10,
        shakeStr: 0,
        shakeDur: 0,
        lifetime: 6
    },
    strobe: {
        burst: {
            particle: "explosionBurst",
            scale: 0.25,
            sound: {
                grass: "explosion_04",
                water: "explosion_02"
            }
        },
        rippleCount: 3,
        shakeStr: 0,
        shakeDur: 0,
        lifetime: 2
    },
    barrel: {
        burst: {
            particle: "explosionBurst",
            scale: 1,
            sound: {
                grass: "explosion_01",
                water: "explosion_02"
            }
        },
        rippleCount: 10,
        shakeStr: 0.2,
        shakeDur: 0.35,
        lifetime: 2
    },
    usas: {
        burst: {
            particle: "explosionUSAS",
            scale: 0.75,
            sound: {
                grass: "explosion_03",
                water: "explosion_02"
            }
        },
        rippleCount: 10,
        shakeStr: 0.12,
        shakeDur: 0.25,
        lifetime: 1.25
    },
    rounds: {
        burst: {
            particle: "explosionRounds",
            scale: 0.32,
            sound: {
                grass: "explosion_04",
                water: "explosion_04",
                detune: 500,
                volume: 0.5
            }
        },
        rippleCount: 1,
        shakeStr: 0,
        shakeDur: 0,
        lifetime: 1
    },
    rounds_sg: {
        burst: {
            particle: "explosionRounds",
            scale: 0.32,
            sound: {
                grass: "explosion_04",
                water: "explosion_04",
                detune: 500,
                volume: 0.2
            }
        },
        rippleCount: 1,
        shakeStr: 0,
        shakeDur: 0,
        lifetime: 1
    },
    mirv: {
        burst: {
            particle: "explosionMIRV",
            scale: 1,
            sound: {
                grass: "explosion_01",
                water: "explosion_02"
            }
        },
        rippleCount: 10,
        shakeStr: 0.2,
        shakeDur: 0.35,
        lifetime: 2
    },
    mirv_mini: {
        burst: {
            particle: "explosionMIRV",
            scale: 0.75,
            sound: {
                grass: "explosion_03",
                water: "explosion_02"
            }
        },
        rippleCount: 3,
        shakeStr: 0.1,
        shakeDur: 0.2,
        lifetime: 1.25
    },
    martyr_nade: {
        burst: {
            particle: "explosionBurst",
            scale: 0.75,
            sound: {
                grass: "explosion_03",
                water: "explosion_02"
            }
        },
        rippleCount: 3,
        shakeStr: 0.1,
        shakeDur: 0.2,
        lifetime: 1.25
    },
    snowball: {
        burst: {
            particle: "",
            scale: 0.75,
            sound: {
                grass: "snowball_01",
                water: "frag_water_01"
            }
        },
        scatter: {
            particle: "snowball_impact",
            count: 5,
            speed: {
                min: 5,
                max: 25
            }
        },
        rippleCount: 1,
        shakeStr: 0,
        shakeDur: 0,
        lifetime: 1
    },
    snowball_heavy: {
        burst: {
            particle: "",
            scale: 0.75,
            sound: {
                grass: "snowball_02",
                water: "frag_water_01"
            }
        },
        scatter: {
            particle: "snowball_impact",
            count: 8,
            speed: {
                min: 5,
                max: 25
            }
        },
        rippleCount: 1,
        shakeStr: 0,
        shakeDur: 0,
        lifetime: 1
    },
    potato: {
        burst: {
            particle: "",
            scale: 0.75,
            sound: {
                grass: "potato_01",
                water: "frag_water_01"
            }
        },
        scatter: {
            particle: "potato_impact",
            count: 5,
            speed: {
                min: 5,
                max: 25
            }
        },
        rippleCount: 1,
        shakeStr: 0,
        shakeDur: 0,
        lifetime: 1
    },
    potato_heavy: {
        burst: {
            particle: "",
            scale: 0.75,
            sound: {
                grass: "potato_02",
                water: "frag_water_01"
            }
        },
        scatter: {
            particle: "potato_impact",
            count: 8,
            speed: {
                min: 5,
                max: 25
            }
        },
        rippleCount: 1,
        shakeStr: 0,
        shakeDur: 0,
        lifetime: 1
    },
    potato_cannonball: {
        burst: {
            particle: "explosionPotato",
            scale: 0.75,
            sound: {
                grass: "explosion_05",
                water: "explosion_02"
            }
        },
        scatter: {
            particle: "potato_impact",
            count: 8,
            speed: {
                min: 5,
                max: 25
            }
        },
        rippleCount: 10,
        shakeStr: 0.12,
        shakeDur: 0.25,
        lifetime: 1.25
    },
    potato_smgshot: {
        burst: {
            particle: "",
            scale: 0.2,
            sound: {
                grass: "potato_01",
                water: "potato_02",
                detune: 250,
                volume: 0.5
            }
        },
        scatter: {
            particle: "potato_smg_impact",
            count: 2,
            speed: {
                min: 5,
                max: 25
            }
        },
        rippleCount: 1,
        shakeStr: 0,
        shakeDur: 0,
        lifetime: 0.5
    },
    bomb_iron: {
        burst: {
            particle: "explosionBomb",
            scale: 2,
            sound: {
                grass: "explosion_01",
                water: "explosion_02"
            }
        },
        rippleCount: 12,
        shakeStr: 0.25,
        shakeDur: 0.4,
        lifetime: 2
    }
};

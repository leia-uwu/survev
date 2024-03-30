import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";
import { GameConfig } from "../../../shared/gameConfig";
import { v2 } from "../../../shared/utils/v2";

export function createCasingParticle(weapType, casingAngle, casingSpeedMult, pos, dir, layer, zOrd, particleBarn) {
    const weapDef = GameObjectDefs[weapType];
    if (weapDef) {
        let shellDir = v2.rotate(dir, casingAngle);
        if (weapDef.particle.shellForward) {
            shellDir = v2.mul(dir, weapDef.particle.shellForward);
        }
        let vel = v2.mul(shellDir, casingSpeedMult * 9.5);
        vel = v2.rotate(vel, ((Math.random() - 0.5) * Math.PI) / 3);
        let shellPos = v2.add(
            pos,
            v2.mul(dir, GameConfig.player.radius + weapDef.particle.shellOffset)
        );
        if (weapDef.particle.shellOffsetY) {
            shellPos = v2.add(shellPos, v2.mul(shellDir, weapDef.particle.shellOffsetY));
        }
        if (weapDef.particle.shellReverse) {
            vel = v2.mul(vel, -1);
        }
        particleBarn.addParticle(
            weapDef.ammo,
            layer,
            shellPos,
            vel,
            weapDef.particle.shellScale,
            -Math.atan2(shellDir.y, shellDir.x),
            null,
            zOrd
        );
    }
}
export class ShotBarn {
    constructor() {
        this.shots = [];
    }

    addShot(bullet) {
        let shot = null;
        for (let i = 0; i < this.shots.length; i++) {
            if (!this.shots[i].active) {
                shot = this.shots[i];
                break;
            }
        }
        if (!shot) {
            shot = {};
            this.shots.push(shot);
        }

        const weaponType = bullet.shotSourceType;
        const weaponDef = GameObjectDefs[weaponType];

        shot.active = true;
        shot.pos = v2.copy(bullet.pos);
        shot.layer = bullet.layer;
        shot.playerId = bullet.playerId;
        shot.weaponType = weaponType;
        shot.offhand = bullet.shotOffhand;
        shot.lastShot = bullet.lastShot;
        shot.shotAlt = bullet.shotAlt;
        shot.ticker = 0;
        shot.pullDelay =
            weaponDef.pullDelay !== undefined ? weaponDef.pullDelay * 0.45 : 0;
        shot.splinter = bullet.splinter;
        shot.trailSaturated = bullet.trailSaturated;
    }

    /**
     * @param {number} dt
     * @param {string} activePlayerId
     * @param {import("./player").PlayerBarn} playerBarn
     * @param {import("./particles").ParticleBarn} playerBarn
     * @param {import("../audioManager").AudioManager} audioManager
    */
    update(dt, activePlayerId, playerBarn, particleBarn, audioManager) {
        for (let i = 0; i < this.shots.length; i++) {
            const shot = this.shots[i];
            if (shot.active) {
                const weaponDef = GameObjectDefs[shot.weaponType];

                // New shot
                if (shot.ticker == 0) {
                    const player = playerBarn.getPlayerById(shot.playerId);

                    // Play shot sound
                    let shotSound = weaponDef.sound.shoot;
                    if (weaponDef.sound.shootTeam) {
                        const teamId = playerBarn.getPlayerInfo(shot.playerId).teamId;
                        if (weaponDef.sound.shootTeam[teamId]) {
                            shotSound = weaponDef.sound.shootTeam[teamId];
                        }
                    }
                    if (shot.lastShot && weaponDef.sound.shootLast) {
                        shotSound = weaponDef.sound.shootLast;
                    }
                    if (shot.shotAlt && weaponDef.sound.shootAlt) {
                        shotSound = weaponDef.sound.shootAlt;
                    }

                    // Prioritize bonus detune over splinter for main shot
                    let detune = 0;
                    if (shot.trailSaturated && !weaponDef.ignoreDetune) {
                        detune = 300;
                    } else if (shot.splinter) {
                        detune = -300;
                    }

                    audioManager.playSound(shotSound, {
                        channel:
                            shot.playerId == activePlayerId
                                ? "activePlayer"
                                : "otherPlayers",
                        soundPos: shot.pos,
                        layer: player ? player.layer : shot.layer,
                        filter: "muffled",
                        fallOff: weaponDef.sound.fallOff
                            ? weaponDef.sound.fallOff
                            : 0,
                        detune,
                        volumeScale: shot.splinter ? 0.75 : 1
                    });

                    if (shot.splinter) {
                        audioManager.playSound(shotSound, {
                            channel:
                                shot.playerId == activePlayerId
                                    ? "activePlayer"
                                    : "otherPlayers",
                            soundPos: shot.pos,
                            layer: player ? player.layer : shot.layer,
                            filter: "muffled",
                            fallOff: weaponDef.sound.fallOff
                                ? weaponDef.sound.fallOff
                                : 0,
                            detune: 1200,
                            delay: 30,
                            volumeScale: 0.75
                        });
                    }

                    if (player) {
                        // If it's our shot, play a cycling or pull sound if needed
                        if (
                            player.__id == activePlayerId &&
                            weaponDef.fireMode == "single" &&
                            weaponDef.pullDelay
                        ) {
                            const ammoLeft = player.localData.weapons[player.localData.curWeapIdx].ammo;
                            const soundName =
                                ammoLeft > 0
                                    ? weaponDef.sound.cycle
                                    : weaponDef.sound.pull;
                            audioManager.stopSound(player.cycleSoundInstance);
                            player.cycleSoundInstance = audioManager.playSound(soundName);
                        }

                        // Hands and gun recoil
                        const leftHand = shot.offhand || !weaponDef.isDual;
                        const rightHand = !shot.offhand || !weaponDef.isDual;
                        player.addRecoil(weaponDef.worldImg.recoil, leftHand, rightHand);

                        // Add fireDelay
                        player.fireDelay = weaponDef.fireDelay;
                    }
                }

                shot.ticker += dt;
                if (shot.ticker >= shot.pullDelay) {
                    const player = playerBarn.getPlayerById(shot.playerId);
                    if (
                        player &&
                        !player.netData.dead &&
                        player.netData.activeWeapon == shot.weaponType &&
                        weaponDef.caseTiming == "shoot"
                    ) {
                        createCasingParticle(
                            shot.weaponType,
                            (Math.PI / 2) * -1,
                            1,
                            player.netData.pos,
                            player.netData.dir,
                            player.renderLayer,
                            player.renderZOrd + 1,
                            particleBarn
                        );
                    }
                    shot.active = false;
                }
            }
        }
    }
}

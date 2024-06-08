import { GameObjectDefs } from "../../../shared/defs/gameObjectDefs";
import { type GunDef } from "../../../shared/defs/objectsTypings";
import { type Player } from "./player";

// to give you time to load in before the sequence starts
const startWaitBuffer = 5000;

export function getDemos(player: Player) {
    // util stuff
    const wait = async(time: number) => await new Promise(resolve => setTimeout(resolve, time));
    const { weaponManager, weapons: [primary, secondary] } = player;

    const setPrimary = (type: string) => {
        primary.ammo = (
            GameObjectDefs[
                primary.type = type
            ] as GunDef
        ).maxClip;
    };

    const setSecondary = (type: string) => {
        secondary.ammo = (
            GameObjectDefs[
                secondary.type = type
            ] as GunDef
        ).maxClip;
    };

    const gunA = () => weaponManager.setCurWeapIndex(0);
    const gunB = () => weaponManager.setCurWeapIndex(1);
    const melee = () => weaponManager.setCurWeapIndex(2);

    const fire = () => {
        weaponManager.shootStart();
        player.shootStart = false;
        player.shootHold = false;
    };

    /*
        qs demos
        for all of these, it's recommended to set the server's tick rate to 1000 in
        order to improve timing accuracy

        nevertheless, inaccuracies still occur because no timing is perfect, even
        computer-based timing
    */

    return {
        "two-shot overclock": async() => {
            // can be set to any gun
            setPrimary("m870");

            // optional second gun
            // can be set to any gun
            setSecondary("spas12");

            /*
                can be between 0 and 99 (inclusive)

                0 is very consistent, results in two shots over ~350ms
                99 is not too consistent, but results in two shots over ~251ms

                must be a whole number, can technically be negative if you want
                to emulate human-like timings (lower limit is left as an exercise
                to the reader, cuz i'm lazy)

                when the time between shots exceeds around 450ms, the overclock
                stops being worth it

                the formula for buffer -> time between shots is just
                250 + (100 - buffer)

                note that this assumes freeSwitchCooldown at 1 and
                baseSwitchDelay at 0.25
            */
            const buffer = 95;

            await wait(startWaitBuffer);
            // this is a free switch
            gunA();

            /*
                the "900" here has nothing to do with the m870's
                firing delay/switch delay
            */
            await wait(900 + buffer);

            // first shot
            fire();

            // this is not a free switch because the last one was
            // (900 + buffer) ms ago
            melee();

            await wait(100 - buffer);

            // this is a free switch because (900 + buffer) + (100 - buffer) makes 1000
            gunA();
            /*
                you can change this to gunB; the choice doesn't matter
                if you do, that allows you to do, for example,
                m8 spas with qs-like timings
            */

            // wait out the free switch delay
            await wait(250);

            // second shot
            fire();

            // noslow as a bonus
            melee();
        },
        "triple shot, first immediately": async() => {
            // can be set to any gun
            setPrimary("m870");

            // optional second gun
            // can be set to any gun
            setSecondary("spas12");

            // exactly the same as the buffer for two-shot overclock
            const buffer = 90;

            // start with the gun out
            gunA();

            // most of this is a copy of the two-shot overclock—this is basically that,
            // but with an opening shot immediately
            await wait(startWaitBuffer);

            // first shot (start of sequence)
            fire();

            // noslow (human-like timings would make this happen in about 300ms)
            melee();

            // this can be either gunA or gunB
            gunB();

            /*
                the "900" here has nothing to do with the m870's
                firing delay/switch delay
            */
            await wait(900 + buffer);

            // second shot
            fire();

            // this is not a free switch because the last one was
            // (900 + buffer) ms ago
            melee();

            await wait(100 - buffer);

            // this is a free switch because (900 + buffer) + (100 - buffer) makes 1000
            gunA();
            /*
                this can be either gunA or gunB

                combined with the other two, this means you can do,
                for example, m8 m8 spas, or m8 spas m8, or m8 spas
                spas. choice is yours
            */

            // wait out the free switch delay
            await wait(250);

            // third shot
            fire();

            // noslow as a bonus
            melee();
        },
        "triple shot with MP220 + other": async() => {
            /*
                this is taking advantage of the mp220's
                short switch delay to mimic a free switch

                technically this desync can be done with any
                pair of guns, but it's only it if the first
                gun has a short switch delay—the only guns
                which fill that criteria while also not being
                dogwater are the mp220, ot-style weapons and
                the deagle

                by interleaving the mp shots with the other
                weapon's shots, we minimize the amount of
                slowdown we accept

                if you were to just do mp mp m8, you would
                indeed get three shots over 450ms, but you'd
                also accept 200ms of slowdown (so you gain
                100ms somewhere but lose 200ms elsewhere)

                this is about the easiest sequence here, and
                is very consistent (though with human timings,
                it might be more like 3 shots over 750ms instead
                of 550ms)
            */

            // can be anything with a short switch delay
            setPrimary("mp220");

            // can be set to any gun
            setSecondary("m870");

            // sequence must start with mp220 deployed
            gunA();

            await wait(startWaitBuffer);

            // first mp shot
            fire();

            // noslow + swap to other; this is a free switch
            gunB();

            // wait out free switch
            await wait(250);

            // fire other gun
            fire();

            // noslow + swap back; not a free switch,
            // mp switch delay is 300 though, so it's close
            gunA();

            await wait(300);

            // second mp shot
            fire();

            // noslow
            melee();
        },
        "fancy MP triple shot": async() => {
            /*
                same concept as before, this is also a desync
                combo, and the same weapon rules apply

                it's different in that we use an
                overclock-style setup to get the other gun's
                shot out, firing both mp shots sequentially

                this one doesn't really provide any benefit
                compared to the standard mp desync sequence,
                and has the disadvantage of not having a first
                shot immediately
            */

            // can be anything with a short switch delay
            setPrimary("mp220");

            // can be set to any gun
            setSecondary("m870");

            await wait(startWaitBuffer);

            // this is a free switch
            gunA();

            await wait(700);

            // first mp shot
            fire();

            // noslow
            melee();

            // not a free switch
            gunA();

            // wait out switch delay
            await wait(300);

            // second mp shot
            fire();

            // noslow + swap to other; this is a free switch,
            gunB();

            await wait(250);

            // fire other gun
            fire();

            // noslow
            melee();
        },
        "four shots over 850ms": async() => {
            /*
                this is also not super practical because of
                the initial 700ms waiting time before you can
                start, however 4 shots is 4 shots

                the only combo capable of doing that would be
                two mp220s

                you can do it as A, A, B, B—which is 4 shots over
                650ms, and you'd accept 400ms of slow whilst doing
                it, which is usually a net loss (along with the
                fact that you're running double mp)

                or you can do it as A, B, A, B—which is 4 shots
                over 850ms with no slow—exactly the same as this,
                except that you're running double mp

                this is essentially a mix of a classic mp-m8
                desync with an opening shot
            */

            // can be anything with a short switch delay
            setPrimary("mp220");

            // can be set to any gun
            setSecondary("m870");

            await wait(startWaitBuffer);

            // free switch
            gunB();

            await wait(700);

            // first other shot
            fire();

            // swap to mp, not free
            gunA();
            await wait(300);

            // first mp shot
            fire();

            // swap to other, free switch
            gunB();
            // wait out free switch
            await wait(250);

            // second other shot
            fire();

            // back to mp, not free
            gunA();

            await wait(300);

            // second mp shot
            fire();

            // noslow
            melee();
        },
        "four shots over 850ms (alt)": async() => {
            /*
                an m8 overclock into an mp dump
                leads to the same 4 shots over 850ms

                comparison to the other sequence is
                left as an exercise to the reader
                (i'm lazy)
            */

            // can be set to any gun
            setPrimary("m870");

            // can be anything with a short switch delay
            setSecondary("mp220");

            // usual overclock buffer
            const buffer = 95;

            await wait(startWaitBuffer);

            // switch to m8, free switch
            gunA();

            await wait(900 + buffer);

            // first m8 shot
            fire();

            // noslow (not free switch)
            melee();

            await wait(100 - buffer);

            // free switch
            gunA();

            await wait(250);

            // second m8 shot
            fire();

            // switch to mp, not free
            gunB();

            await wait(300);
            // first mp shot
            fire();

            // noslow, neither are free switches
            melee();
            gunB();

            await wait(300);

            // second mp shot
            fire();

            // noslow, not free
            melee();
        },
        "seven shots over 3300ms": async() => {
            /*
                this is really more for fun

                it's a mix of overclock and desync,
                chained together to empty both guns

                being another mp/m8 style sequence,
                same weapon restrictions apply

                this one is pretty inconsistent, even
                with generous buffers
            */

            // usual overclock buffer
            const buffer = 95;

            // can be set to any gun
            setPrimary("m870");

            // can be anything with a short switch delay
            setSecondary("mp220");

            // sequence needs to start with m8
            gunA();

            await wait(startWaitBuffer);

            // first m8 shot
            fire();

            // noslow (wastes the free switch if there was one)
            melee();

            // back to m8, not free
            gunA();

            await wait(900 + buffer);

            // second m8 shot
            fire();

            // noslow (not free switch)
            melee();

            await wait(100 - buffer);

            // free switch
            gunA();

            await wait(250);

            // third m8 shot
            fire();

            // switch to mp, not free
            gunB();

            await wait(300);
            // first mp shot
            fire();

            // noslow, neither are free switches
            melee();
            gunB();

            await wait(300);

            // second mp shot
            fire();

            // noslow, not free
            melee();

            await wait(150);

            // free switch
            gunA();

            await wait(250);

            // fourth m8 shot
            fire();

            // noslow, neither are free
            melee();
            gunA();

            await wait(900);
            // fifth m8 shot
            fire();

            // noslow
            melee();
        }
    };
}

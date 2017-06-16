import {effectiveness} from "../info";
import {Gens, Stats, Types, damageVariation} from "../utilities";
import moveInfo from "./moveInfo";

const {max, min, trunc} = Math;

export default function hgssCalculate(attacker, defender, move, field) {
    const {moveType, movePower, fail} = moveInfo(attacker, defender,
                                                 move, field);
    if (fail) return [0];

    let atk, def, sdef, satk;
    const unawareA = attacker.ability.name === "Unaware";
    const unawareD = defender.ability.name === "Unaware";
    if (move.critical) {
        if (unawareA) {
            def = defender.stat(Stats.DEF);
            sdef = defender.stat(Stats.SDEF);
        } else {
            def = min(defender.stat(Stats.DEF),
                      defender.boostedStat(Stats.DEF));
            sdef = min(defender.stat(Stats.SDEF),
                       defender.boostedStat(Stats.SDEF));
        }
        if (unawareD) {
            atk = attacker.stat(Stats.ATK);
            satk = attacker.stat(Stats.SATK);
        } else {
            atk = max(attacker.stat(Stats.ATK),
                      attacker.boostedStat(Stats.ATK));
            satk = max(attacker.stat(Stats.SATK),
                       attacker.boostedStat(Stats.SATK));
        }
    } else {
        if (unawareA) {
            def = defender.stat(Stats.DEF);
            sdef = defender.stat(Stats.SDEF);
        } else {
            def = defender.boostedStat(Stats.DEF);
            sdef = defender.boostedStat(Stats.SDEF);
        }
        if (unawareD) {
            atk = attacker.stat(Stats.ATK);
            satk = attacker.stat(Stats.SATK);
        } else {
            atk = attacker.boostedStat(Stats.ATK);
            satk = attacker.boostedStat(Stats.SATK);
        }
    }

    if (attacker.ability.name === "Huge Power"
        || attacker.ability.name === "Pure Power") {
        atk *= 2;
    }

    if (attacker.flowerGift && field.sun()) {
        atk *= 2;
    }

    switch (attacker.ability.name) {
        case "Guts":
            if (attacker.status) atk = trunc(atk * 3 / 2);
            break;
        case "Hustle":
            atk = trunc(atk * 3 / 2);
            break;
        case "Slow Start":
            if (field.slowStart) atk = trunc(atk / 2);
            break;
        case "Plus":
            if (attacker.minus) satk = trunc(satk * 3 / 2);
            break;
        case "Minus":
            if (attacker.plus) satk = trunc(satk * 3 / 2);
            break;
        case "Solar Power":
            if (field.sun()) satk *= 2;
            break;
        /* no default */
    }

    switch (attacker.item.name) {
        case "Choice Band":
            atk = trunc(atk * 3 / 2);
            break;
        case "Choice Specs":
            satk = trunc(satk * 3 / 2);
            break;
        case "Soul Dew":
            if (attacker.name === "Latias" || attacker.name === "Latios") {
                satk = trunc(satk * 3 / 2);
            }
            break;
        case "Deep Sea Tooth":
            if (attacker.name === "Clamperl") satk *= 2;
            break;
        default:
            if (attacker.thickClubBoosted()) {
                atk *= 2;
            } else if (attacker.lightBallBoosted()) {
                atk *= 2;
                satk *= 2;
            }
    }

    if (move.isExplosion()) {
        def = trunc(def / 2);
    }

    if (defender.ability.name === "Marvel Scale" && defender.status) {
        def = trunc(def * 3 / 2);
    }

    if (defender.flowerGift && field.sun()) {
        sdef = trunc(sdef * 3 / 2);
    }

    switch (defender.item.name) {
        case "Metal Powder":
            if (defender.name === "Ditto") def *= 2;
            break;
        case "Soul Dew":
            if (defender.name === "Latias" || defender.name === "Latios") {
                sdef = trunc(sdef * 3 / 2);
            }
            break;
        case "Deep Sea Scale":
            if (defender.name === "Clamperl") sdef *= 2;
            break;
        /* no default */
    }

    if (field.sand() && defender.stab(Types.ROCK)) {
        sdef = trunc(sdef * 3 / 2);
    }

    let a, d, level;
    if (move.name === "Beat Up") {
        a = attacker.beatUpStats[move.beatUpHit];
        d = defender.baseStat(Stats.DEF);
        level = attacker.beatUpLevels[move.beatUpHit];
    } else if (move.isPhysical()) {
        a = atk;
        d = def;
        level = attacker.level;
    } else if (move.isSpecial()) {
        a = satk;
        d = sdef;
        level = attacker.level;
    } else {
        return [0];
    }

    let baseDamage = trunc(trunc(trunc(2 * level / 5 + 2)
                                 * movePower * a / d) / 50);

    if (move.name !== "Beat Up") {
        if (attacker.isBurned() && move.isPhysical()
            && attacker.ability.name !== "Guts") {
            baseDamage = trunc(baseDamage / 2);
        }

        if (!move.critical
            && (defender.reflect && move.isPhysical()
                || defender.lightScreen && move.isSpecial())) {
            if (field.multiBattle) {
                baseDamage = trunc(baseDamage * 2 / 3);
            } else {
                baseDamage = trunc(baseDamage / 2);
            }
        }
    }

    if (field.multiBattle && move.hasMultipleTargets()) {
        baseDamage = trunc(baseDamage * 3 / 4);
    }

    if (move.name !== "Weather Ball") {
        if (field.sun()) {
            if (moveType === Types.FIRE) {
                baseDamage = trunc(baseDamage * 3 / 2);
            } else if (moveType === Types.WATER) {
                baseDamage = trunc(baseDamage / 2);
            }
        } else if (field.rain()) {
            if (moveType === Types.WATER) {
                baseDamage = trunc(baseDamage * 3 / 2);
            } else if (moveType === Types.FIRE) {
                baseDamage = trunc(baseDamage / 2);
            }
        }
        if (!field.sun() && !field.isClearWeather()
            && move.name === "Solar Beam") {
            baseDamage = trunc(baseDamage / 2);
        }
    }

    if (attacker.flashFire && moveType === Types.FIRE
        && attacker.ability.name === "Flash Fire") {
        baseDamage = trunc(baseDamage * 3 / 2);
    }

    baseDamage += 2;

    if (move.critical) {
        baseDamage *= attacker.ability.name === "Sniper" ? 3 : 2;
    }

    if (move.name !== "Beat Up") {
        if (attacker.item.name === "Life Orb") {
            baseDamage = trunc(baseDamage * 13 / 10);
        } else if (attacker.item.name === "Metronome") {
            const m = min(20, 10 + attacker.metronome);
            baseDamage = trunc(baseDamage * m / 10);
        }

        if (move.meFirst) {
            baseDamage = trunc(baseDamage * 3 / 2);
        }
    }

    let damages = damageVariation(baseDamage, 85, 100);

    if (attacker.stab(moveType)) {
        damages = damages.map(d => trunc(d * 3 / 2));
    }

    let eff = effectiveness(moveType, defender.types(), {
        gen: Gens.HGSS,
        foresight: defender.foresight,
        scrappy: attacker.ability.name === "Scrappy",
        gravity: field.gravity
    });
    if (moveType === defender.ability.immunityType()) {
        eff = {num: 0, den: 2};
    }
    if (eff.num === 0) return [0];
    damages = damages.map(d => trunc(d * eff.num / eff.den));

    if (eff.num > eff.den) {
        if (defender.ability.reducesSuperEffective()) {
            damages = damages.map(d => trunc(d * 3 / 4));
        }

        if (attacker.item.name === "Expert Belt") {
            damages = damages.map(d => trunc(d * 12 / 10));
        }

        if (moveType === defender.item.berryTypeResist()) {
            damages = damages.map(d => trunc(d / 2));
        }
    } else if (eff.num < eff.den && attacker.ability.name === "Tinted Lens") {
        damages = damages.map(d => 2 * d);
    }

    if (defender.item.berryTypeResist() === Types.NORMAL
        && moveType === Types.NORMAL) {
        damages = damages.map(d => trunc(d / 2));
    }

    return damages;
}

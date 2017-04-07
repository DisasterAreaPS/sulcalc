import {Stats} from "../utilities";

const {max, trunc} = Math;

export default function advEndOfTurn(attacker, defender, field) {
    const values = [];
    const messages = [];
    const hp = defender.stat(Stats.HP);

    if (field.sand() && defender.hurtBySandstorm()) {
        values.push(-max(1, trunc(hp / 16)));
        messages.push("Sandstorm");
    } else if (field.hail() && defender.hurtByHail()) {
        values.push(-max(1, trunc(hp / 16)));
        messages.push("Hail");
    }
    // ingrain
    // rain dish
    if (defender.item.name === "Leftovers") {
        values.push(max(1, trunc(hp / 16)));
        messages.push("Leftovers");
    }
    // leech seed
    if (defender.isBurned()) {
        values.push(-max(1, trunc(hp / 8)));
        messages.push("Burn");
    } else if (defender.isPoisoned()) {
        values.push(-max(1, trunc(hp / 8)));
        messages.push("Poison");
    } else if (defender.isBadlyPoisoned()) {
        values.push("toxic");
        messages.push("Toxic");
    }
    // nightmare
    // curse
    // multi turns -- whirlpool, flame wheel, etc

    return {
        values,
        messages
    };
}

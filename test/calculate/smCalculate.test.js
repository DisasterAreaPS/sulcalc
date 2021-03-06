import smCalculate from "../../src/calculate/smCalculate";
import Pokemon from "../../src/Pokemon";
import Move from "../../src/Move";
import Field from "../../src/Field";
import {Gens} from "../../src/utilities";

const {max} = Math;

describe("smCalculate()", () => {
    let field;
    let landorusT;
    let heatran;
    let lavaPlume;
    let earthquake;
    beforeEach(() => {
        field = new Field({gen: Gens.SM});
        heatran = new Pokemon({
            name: "Heatran",
            gen: Gens.SM,
            evs: [252, 0, 0, 0, 4, 252],
            natureName: "Timid"
        });
        landorusT = new Pokemon({
            name: "Landorus-Therian",
            gen: Gens.SM,
            evs: [252, 0, 216, 0, 24, 16],
            natureName: "Impish"
        });
        lavaPlume = new Move({
            name: "Lava Plume",
            gen: Gens.SM
        });
        earthquake = new Move({
            name: "Earthquake",
            gen: Gens.SM
        });
    });

    test("sanity check", () => {
        const damage = smCalculate(heatran, landorusT, lavaPlume, field);
        expect(max(...damage)).toEqual(150);
    });

    test("Aurora Veil", () => {
        heatran.auroraVeil = true;
        const damageSingle = smCalculate(landorusT, heatran, earthquake, field);
        expect(damageSingle).toEqual([
            284, 288, 290, 294, 296, 300, 302, 308,
            312, 314, 318, 320, 324, 326, 330, 336
        ]);
        field.multiBattle = true;
        const damageMulti = smCalculate(landorusT, heatran, earthquake, field);
        expect(damageMulti).toEqual([
            283, 288, 291, 291, 296, 299, 304, 307,
            312, 312, 315, 320, 323, 328, 331, 336
        ]);
    });

    test("Fairy Aura is a move power mod", () => {
        const xerneas = new Pokemon({
            name: "Xerneas",
            gen: Gens.SM,
            item: "Life Orb",
            natureName: "Modest",
            evs: [0, 0, 0, 252, 0, 0]
        });
        const genesect = new Pokemon({
            name: "Genesect",
            gen: Gens.SM,
            natureName: "Naive"
        });
        const moonblast = new Move({
            name: "Moonblast",
            gen: Gens.SM
        });
        const auraField = new Field({
            fairyAura: true,
            gen: Gens.SM
        });
        const damage = smCalculate(xerneas, genesect, moonblast, auraField);
        expect(damage).toEqual([
            172, 173, 175, 178, 179, 182, 183, 186,
            187, 190, 191, 194, 195, 198, 199, 203
        ]);
    });
});

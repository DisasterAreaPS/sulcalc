import Multiset from "../src/Multiset";

describe("Multiset", () => {
    let emptySet;
    let set1;
    let set2;

    const arr1 = [1, 1, 2, 3, 4, 3, 2];
    const arr2 = [1, 2, 3, -2];

    beforeEach(() => {
        emptySet = new Multiset();
        set1 = new Multiset(arr1);
        set2 = new Multiset(arr2);
    });

    test("#constructor()", () => {
        function checker(set) {
            expect(set.get(-2)).toEqual("1");
            expect(set.get(1)).toEqual("1");
            expect(set.get(2)).toEqual("1");
            expect(set.get(3)).toEqual("2");
        }

        checker(new Multiset([1, 2, 3, 3, -2]));

        const map = new Map();
        map.set(-2, "1");
        map.set(1, "1");
        map.set(2, "1");
        map.set(3, "2");
        checker(new Multiset(map));

        checker(new Multiset(new Multiset(map)));
    });

    test("#add()", () => {
        const set = new Multiset();
        set.add(1);
        set.add(2);
        set.add(2, "1");
        set.add(3, "1337");
        expect(set.add(4, 3).add(5, 0)).toEqual(set);
        expect(set.get(1)).toEqual("1");
        expect(set.get(2)).toEqual("2");
        expect(set.get(3)).toEqual("1337");
        expect(set.get(4)).toEqual("3");
        expect(set.get(5)).toEqual("0");
    });

    test("#delete()", () => {
        expect(set1.has(1)).toBeTruthy();
        expect(set1.delete(1)).toBeTruthy();
        expect(set1.has(1)).toBeFalsy();
        expect(set1.delete(1)).toBeFalsy();
        expect(set1.delete(1.5)).toBeFalsy();
    });

    test("#has()", () => {
        expect(emptySet.has(1)).toBeFalsy();
        expect(set1.has(1)).toBeTruthy();
        expect(set1.has(-2)).toBeFalsy();
        expect(set2.has(-2)).toBeTruthy();
    });

    test("#get()", () => {
        expect(set1.get(Math.PI)).toBeUndefined();
        expect(set1.get(1)).toEqual("2");
        expect(set1.get(2)).toEqual("2");
        expect(set1.get(3)).toEqual("2");
        expect(set1.get(4)).toEqual("1");
    });

    test("#size", () => {
        expect(emptySet.size).toEqual("0");
        expect(set1.size).toEqual(String(arr1.length));
    });

    test("#isEmpty()", () => {
        expect(emptySet.isEmpty()).toBeTruthy();
        expect(set1.isEmpty()).toBeFalsy();
    });

    test("#max()", () => {
        expect(emptySet.max()).toBeUndefined();
        expect(set1.max()).toEqual(4);
        expect(set1.max((a, b) => a < b)).toEqual(1);
    });

    test("#min()", () => {
        expect(emptySet.min()).toBeUndefined();
        expect(set1.min()).toEqual(1);
        expect(set1.min((a, b) => a < b)).toEqual(4);
    });

    test("#every()", () => {
        expect(emptySet.every()).toBeTruthy();
        expect(set1.every(a => a > 0)).toBeTruthy();
        expect(set2.every(a => a > 0)).toBeFalsy();
        set1.every(function(value, multiplicity, set) {
            expect(this.a).toEqual(1);
            expect(set).toEqual(set1);
            expect(typeof value).toEqual("number");
            expect(multiplicity).toMatch(/^[0-9]+$/);
            return true;
        }, {a: 1});
    });

    test("#some()", () => {
        expect(emptySet.some()).toBeFalsy();
        expect(set1.some(a => a < 0)).toBeFalsy();
        expect(set2.some(a => a < 0)).toBeTruthy();
        set1.some(function(value, multiplicity, set) {
            expect(this.a).toEqual(1);
            expect(set).toEqual(set1);
            expect(typeof value).toEqual("number");
            expect(multiplicity).toMatch(/^[0-9]+$/);
            return true;
        }, {a: 1});
    });

    test("#count()", () => {
        expect(emptySet.count()).toEqual("0");
        expect(set1.count()).toEqual(set1.size);
        expect(set1.count(a => a % 2)).toEqual("4");
        set1.count(function(value, multiplicity, set) {
            expect(this.a).toEqual(1);
            expect(set).toEqual(set1);
            expect(typeof value).toEqual("number");
            expect(multiplicity).toMatch(/^[0-9]+$/);
        }, {a: 1});
    });

    test("#clear()", () => {
        set1.clear();
        expect(set1.size).toEqual("0");
        expect(set1.has(1)).toBeFalsy();
    });

    test("#toString()", () => {
        expect(emptySet.toString()).toEqual("");
        expect(set1.toString()).toEqual("1:2, 2:2, 3:2, 4:1");
        expect(set1.toString(undefined, ([v1], [v2]) => v2 - v1))
            .toEqual("4:1, 3:2, 2:2, 1:2");
        expect(set1.toString(e => e.join("#"))).toEqual("1#2, 2#2, 3#2, 4#1");
    });

    test("#permute()", () => {
        expect(set1.permute(emptySet).toString()).toEqual("");
        expect(set1.permute(set2).toString())
            .toEqual("-1:2, 0:2, 1:2, 2:3, 3:4, 4:6, 5:5, 6:3, 7:1");
        expect(set1.permute(arr2).toString())
            .toEqual("-1:2, 0:2, 1:2, 2:3, 3:4, 4:6, 5:5, 6:3, 7:1");
        expect(set1.permute([0], (a, b) => a * b).toString()).toEqual("0:7");
    });

    test("#intersect()", () => {
        expect(set1.intersect(set2).toString()).toEqual("1:1, 2:1, 3:1");
        expect(set2.intersect(set1).toString()).toEqual("1:1, 2:1, 3:1");
        expect(set1.intersect(arr2).toString()).toEqual("1:1, 2:1, 3:1");
        expect(set1.intersect(emptySet).toString()).toEqual("");
        expect(emptySet.intersect([]).toString()).toEqual("");
    });

    test("#union()", () => {
        expect(set1.union(set2).toString()).toEqual("-2:1, 1:3, 2:3, 3:3, 4:1");
        expect(set1.union(arr2).toString()).toEqual("-2:1, 1:3, 2:3, 3:3, 4:1");
        expect(set1.union(emptySet).toString()).toEqual("1:2, 2:2, 3:2, 4:1");
        expect(emptySet.union([]).toString()).toEqual("");
    });

    test("#map()", () => {
        expect(emptySet.map().toString()).toEqual("");
        expect(set1.map(v => v + 1).toString()).toEqual("2:2, 3:2, 4:2, 5:1");
        set1.map(function(value, multiplicity, set, skip) {
            expect(this.a).toEqual(1);
            expect(set).toEqual(set1);
            expect(typeof value).toEqual("number");
            expect(multiplicity).toMatch(/^[0-9]+$/);
            expect(typeof skip).toEqual("function");

            return Math.E;
        }, {a: 1});

        expect(set1.map((v, w, set, skip) => {
            if (v % 2 === 0) skip();
            return v;
        }).toString()).toEqual("1:2, 3:2");
    });

    test("#scale()", () => {
        expect(emptySet.scale(314).toString()).toEqual("");
        expect(set1.scale(2).toString()).toEqual("1:4, 2:4, 3:4, 4:2");
        expect(set1.scale().toString()).toEqual(set1.toString());
    });

    test("#reduce()", () => {
        const reduced = set1.reduce(
            (sum, value, multiplicity) => sum + value * multiplicity, 0);
        expect(reduced).toEqual(16);
        expect(emptySet.reduce()).toBeUndefined();
        set1.reduce((total, value, multiplicity, set) => {
            expect(total).toBeInstanceOf(Array);
            expect(total).toHaveLength(2);
            expect(typeof total[0]).toEqual("number");
            expect(total[1]).toMatch(/^[0-9]+$/);
            expect(set).toEqual(set1);
            expect(typeof value).toEqual("number");
            expect(multiplicity).toMatch(/^[0-9]+$/);
            return total;
        });
    });

    test("#forEach()", () => {
        let runs = false;
        set1.forEach(() => {
            runs = true;
        });
        expect(runs).toBeTruthy();

        set1.forEach(function(value, multiplicity, set) {
            expect(this.a).toEqual(1);
            expect(set).toEqual(set1);
            expect(typeof value).toEqual("number");
            expect(multiplicity).toMatch(/^[0-9]+$/);
        }, {a: 1});
    });

    test("#[Symbol.iterator]()", () => {
        expect(emptySet[Symbol.iterator]().next().done).toBeTruthy();

        for (const entry of set1) {
            expect(entry).toBeInstanceOf(Array);
            expect(entry).toHaveLength(2);
            expect(typeof entry[0]).toEqual("number");
            expect(entry[1]).toMatch(/^[0-9]+$/);
        }
    });

    test("#entries()", () => {
        expect(emptySet.entries().next().done).toBeTruthy();

        for (const entry of set1.entries()) {
            expect(entry).toBeInstanceOf(Array);
            expect(entry).toHaveLength(2);
            expect(typeof entry[0]).toEqual("number");
            expect(entry[1]).toMatch(/^[0-9]+$/);
        }
    });

    test("#keys()", () => {
        expect(emptySet.keys().next().done).toBeTruthy();

        for (const value of set1.keys()) {
            expect(typeof value).toEqual("number");
        }

        expect([...set1.keys()]).toEqual([...set1.values()]);
    });

    test("#values()", () => {
        expect(emptySet.values().next().done).toBeTruthy();

        for (const value of set1.values()) {
            expect(typeof value).toEqual("number");
        }
    });

    test("#multiplicities()", () => {
        expect(emptySet.multiplicities().next().done).toBeTruthy();

        for (const multiplicity of set1.multiplicities()) {
            expect(multiplicity).toMatch(/^[0-9]+$/);
        }
    });
});

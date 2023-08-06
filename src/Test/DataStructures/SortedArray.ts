import { assert } from "chai";
import { SortedArray } from "../../DataStructures/SortedArray";
import { RandomCharacters } from "../../Functions/RandomCharacters";

function unsortedCheck<T>(size: number, valueFunction: () => T) {
    const sa = new SortedArray<T, T>();

    for (let _ = 0; _ < size; _++) {
        const value = valueFunction();
        sa.insert(value, value);
    }

    sa.values.forEach((value, index, array) => {
        if(index > 0) {
            assert.isTrue(value >= array[index - 1])
        }
    });

    sa.items.forEach((value, index, array) => {
        if(index > 0) {
            assert.isTrue(value.key >= array[index - 1].key)
        }
    });
}

function sortedCheck(size: number) {
    const sa = new SortedArray<number, number>();
    const normal = new Array<number>();

    for (let _ = 0; _ < size; _++) {
        const value = Math.random();
        sa.insert(value, value);
        normal.push(value);
    }

    const saValues = sa.values;
    normal.sort();

    for (let index = 0; index < normal.length; index++) {
        const normalElement = normal[index];
        const saElement = saValues[index];
        const assertion = normalElement == saElement;

        if(!assertion) {
            console.error("Assertion failed", normalElement, saElement);
            console.error(sa);
            console.error(normal);
        }
        
        assert.isTrue(assertion);
    }
}

describe("Sorted Array tests", () => {
    it("should work with simple predefined arrays", () => {
        const sa = new SortedArray<number, number>();

        sa.insert(1, 3);
        sa.insert(2, 4);
        sa.insert(3, 5);

        assert.isTrue(sa.get(1) == 3);
        assert.isTrue(sa.get(2) == 4);
        assert.isTrue(sa.get(3) == 5);
    });

    it("should work with complex predefined arrays", () => {
        const sa = new SortedArray<number, number>();

        sa.insert(5, 5);
        sa.insert(4, 4);
        sa.insert(1, 1);
        sa.insert(0, 0);
        sa.insert(2, 2);
        sa.insert(3, 3);

        sa.values.forEach((value, index, array) => {
            if(index > 0) {
                assert.isTrue(value >= array[index - 1])
            }
        });

    });

    it("should work with duplicates", () => {
        const sa = new SortedArray<number, number>();

        for(let _ = 0; _ < 10; _++)
            [5, 2, 4, 2, 1, 0].forEach((item) => {
                sa.insert(item, item);
            });

        sa.values.forEach((value, index, array) => {
            if(index > 0) {
                assert.isTrue(value >= array[index - 1])
            }
        });
    });

    it("should work with complex random arrays (1,000)", () => {
        sortedCheck(1_000);
    }).timeout(0);

    it("should work with complex random arrays (10,000)", () => {
        sortedCheck(10_000);
    }).timeout(0);

    it("should work with complex random arrays (50,000)", () => {
        sortedCheck(50_000);
    }).timeout(0);

    it("should work with complex random arrays (100,000) (unsorted) (numbers)", () => {
        unsortedCheck(100_000, Math.random);
    }).timeout(0);

    it("should work with complex random arrays (100,000) (unsorted) (text)", () => {
        unsortedCheck(100_000, () => RandomCharacters(10));
    }).timeout(0);

    it("should work with complex random arrays (100,000) (unsorted) (date)", () => {
        unsortedCheck(100_000, () => new Date(Math.floor(Math.random() * 1_687_117_970)));
    }).timeout(0);
});
import { assert } from "chai";
import { sleep } from "../../Functions/Sleep";

describe("Await tests", async () => {
    it("should wait 1 second", async () => {
        await sleep(1);
        assert.isTrue(true);
    }).timeout(2000).slow(1500);

    it("should wait 1.5 seconds", async () => {
        await sleep(1.5);
        assert.isTrue(true);
    }).timeout(3000).slow(2500);
});


import { assert } from "chai";
import { SeparateMessages, max } from "../../Functions/SeparateMessages";
import { RandomCharacters } from "../../Functions/RandomCharacters";


describe("Separate Messages (1000)", () => {
    it("should not do anything to any message under max character length", () => {
        for (let _ = 0; _ < 1000; _++) {
            const text = RandomCharacters(max);
            const messages = SeparateMessages(text);
            assert.isTrue(messages.length == 1);
            assert.isTrue(messages[0] == text);
        }
    }).timeout(1000);

    it("should separate items bigger than max length", () => {
        for (let _ = 0; _ < 1000; _++) {
            const text = RandomCharacters(max * (2 + Math.random() * 10));
            
            const messages = SeparateMessages(text);
            assert.isTrue(messages.length > 1);
            messages.forEach((item) => assert.isTrue(item.length <= max))
        }
    }).timeout(1000);

    it("should separate messages with random characters that don't have spaces", () => {
        const spaceNewline = "[ \n]";
        const regex = new RegExp(spaceNewline, "g");
        for (let _ = 0; _ < 1000; _++) {
            const text = RandomCharacters(max * (2 + Math.random() * 10));
            const messages = SeparateMessages(text.replaceAll(regex, ""));
            assert.isTrue(messages.length > 1);
            messages.forEach((item) => assert.isTrue(item.length <= max))
        }
    }).timeout(1000);
})
import { assert } from "chai";
import { SeparateMessages, max } from "../../Functions/SeparateMessages";

function randomCharacters(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 \n\t\r';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

describe("Separate Messages (1000)", () => {
    it("should not do anything to any message under max character length", () => {
        for (let _ = 0; _ < 1000; _++) {
            const text = randomCharacters(max);
            const messages = SeparateMessages(text);
            assert.isTrue(messages.length == 1);
            assert.isTrue(messages[0] == text);
        }
    });

    it("should separate items bigger than max length", () => {
        for (let _ = 0; _ < 1000; _++) {
            const text = randomCharacters(max * (2 + Math.random() * 10));
            // console.log(text.length);
            
            const messages = SeparateMessages(text);
            assert.isTrue(messages.length > 1);
            messages.forEach((item) => assert.isTrue(item.length <= max))
        }
    });
})
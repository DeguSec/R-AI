import { stripBad } from "../../Functions/UserFunctions";
import { RandomCharacters } from "../../Functions/RandomCharacters";
import { assert } from "chai";

const allowed = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

describe("User Functions tests", () => {
    it("strip bad should remove bad characters from usernames", () => {
        for (let _ = 0; _ < 1000; _++) {
            const name = RandomCharacters(1000);
            const converted = stripBad(name);

            for (let letter = 0; letter < converted.length; letter++) {
                const element = converted[letter];
                const passing = allowed.indexOf(element) != -1;
                
                assert.isTrue(passing);
            }
        }
    }).timeout(5000).slow(2500);

    it("should not strip the letters that are allowed", () => {
        for (let _ = 0; _ < 1000; _++) {
            const name = RandomCharacters(1000, allowed);
            const converted = stripBad(name);

            assert.isTrue(name == converted);
        }
    });

})
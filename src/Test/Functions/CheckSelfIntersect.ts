import { CheckSelfInteract } from "../../Functions/CheckSelfInteract"
import { assert } from "chai";

describe("Tests checking self interaction", () => {
    it("should return true if the program is self interacting", () => {
        assert.isTrue(CheckSelfInteract("12345", {
            id: "12345",
        }));
    });

    it("should return true if id is not present", () => {
        assert.isTrue(CheckSelfInteract("12345", {}));
    });

    it("should return false if not self interacting", () => {
        assert.isFalse(CheckSelfInteract("12345", {
            id: "67890",
        }));
    })
})
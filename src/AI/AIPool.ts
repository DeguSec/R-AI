import { AIController } from "./AIController";

export class AIPool extends Map<string, AIController> {
    constructor() {
        super();


        // Get all of the existing AIs

        // Strap the AIs

    }

    enable(channel: string) {
        // add into memory and strap

    }

    disable(channel: string) {
        // delete the

    }

    strap(ai: AIController) {

    }

    ///
    get(channel: string): AIController {
        
    }

    set(key: string, value: AIController): this {


        return this;
    }
}
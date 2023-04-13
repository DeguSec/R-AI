import { CreateChatCompletionRequest } from "openai";
import { LolBot } from "./LolBot";
import { Rchan } from "./Rchan";
import { Gazelle } from "./Gazelle";
import { Hope } from "./Hope";
import { Joe } from "./Joe";
import { RLol } from "./RLol";
import { Mommy } from "./Mommy";
import { AIDebugger } from "../AI/AIDebugger";


export interface Personality {
    addUserMessage: (message: string, user?: string) => void,
    addAssistantMessage: (message: string) => void,
    getChatCompletion: () => CreateChatCompletionRequest
    reset: () => void;
    setDebugger: (debug: AIDebugger) => void;
}

export enum Personalities {
    default = "Default",
    LOLBot = "LolBot",
    RLol = "RLol",
    RChan = "R-chan",
    Gazelle = "Gazelle",
    Hope = "Hope",
    Joe = "Joe",
    Mommy = "Mommy"
}

export class PersonalityFactory {
    private initBot(bot?: Personalities): Personality {
        switch(bot) {
            case Personalities.LOLBot:
                return new LolBot();

            case Personalities.RLol:
                return new RLol();
            
            case Personalities.RChan:
                return new Rchan();

            case Personalities.Gazelle:
                return new Gazelle();

            case Personalities.Hope:
                return new Hope();

            case Personalities.Joe:
                return new Joe();

            case Personalities.Mommy:
                return new Mommy();

            default:
                return this.initBot(Personalities.RChan);
        }
    }

    generateBot(debug: AIDebugger, bot?: Personalities): Personality {
        const ai = this.initBot(bot)
        ai.setDebugger(debug);
        return ai;
    }
}

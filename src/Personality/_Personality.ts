import { CreateChatCompletionRequest } from "openai";
import { LolBot } from "./LolBot";
import { Rchan } from "./Rchan";
import { Gazelle } from "./Gazelle";
import { Hope } from "./Hope";
import { Joe } from "./Joe";
import { RLol } from "./RLol";

export interface Personality {
    addUserMessage: (message: string, user?: string) => void,
    addAssistantMessage: (message: string) => void,
    getChatCompletion: () => CreateChatCompletionRequest
    reset: () => void;
}

export enum Personalities {
    default = "Default",
    LOLBot = "LolBot",
    RLol = "RLol",
    RChan = "R-chan",
    Gazelle = "Gazelle",
    Hope = "Hope",
    Joe = "Joe",
}

export class PersonalityFactory {
    generateBot(bot?: Personalities): Personality {
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

            default:
                return this.generateBot(Personalities.RChan);
        }
    }
}

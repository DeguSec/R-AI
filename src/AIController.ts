import { Configuration, OpenAIApi } from "openai";
import { Basic } from "./Personality/Basic";
import { LolBot } from "./Personality/LolBot";
import { Personalities, Personality, PersonalityFactory } from "./Personality/_Personality";
import { apiKey } from "./secrets";

const configuration = new Configuration({
  apiKey,
});

const personalityFactory = new PersonalityFactory();

export interface MessageOptions {

}

export class AIController {
    private openai: OpenAIApi;
    private personality: Personality;
    private user?: string;
    constructor(user?: string) {
        this.openai = new OpenAIApi(configuration);
        this.personality = new LolBot();
        this.user = user;
    }

    async sendAMessage(message: string, onRespond: (message: string) => any, retried: boolean = false, user?: string) {
        this.personality.addUserMessage(message, user);
        let resp;
        try {
            resp = (await this.openai.createChatCompletion(this.personality.getChatCompletion())).data.choices[0].message?.content
        } catch(e) {
            console.log(e);
        }

        if(resp) {
            if (retried) resp = ":computer::warning: Bot reset\n\n" + resp;
            this.personality.addAssistantMessage(resp);
            onRespond(resp)
        }
        else {
            // reset if failed
            this.personality.reset();
            if(!retried) this.sendAMessage(message, onRespond, true, user);
            else return;
        }
    }

    changePersonality(personality?: Personalities) {
        this.personality = personalityFactory.generateBot(personality);
    }

    replacePrompt(newPrompt: string) {
        this.personality = new Basic(newPrompt);
    }

    reset() {
        this.personality.reset()
    }
}
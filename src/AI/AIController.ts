import { Client } from "discord.js";
import { Configuration, OpenAIApi } from "openai";
import { EnvSecrets } from "../EnvSecrets";
import { Basic } from "../Personality/Basic";
import { Personalities, Personality, PersonalityFactory } from "../Personality/_Personality";

const configuration = new Configuration({
	apiKey: EnvSecrets.getSecretOrThrow<string>('API_KEY'),
});

const personalityFactory = new PersonalityFactory();

export interface AIMessage {
    message: string,
    user?: string,
    retried: boolean,
}

export class AIController {
    private openai: OpenAIApi;
    private personality: Personality;
    private client: Client;
    private channelId: string;
    private userMessageTimer: number = -1;
    private userTypingTimer: number = -1;
    private typingUsers: Array<string> = [];

    constructor(client: Client, channelId: string) {
        this.openai = new OpenAIApi(configuration);
        this.personality = personalityFactory.generateBot();
        this.client = client;
        this.channelId = channelId;
    }

    addMessage(message: AIMessage) {
        this.personality.addUserMessage(message.message, message.user);
    }

    typing(typing: boolean, user: string) {
        console.log("Typing: ", typing);
        console.log("User:", user);
    }

    private async react(retried?: boolean) {
        /*
        let resp;
        try {
            resp = (await this.openai.createChatCompletion(this.personality.getChatCompletion())).data.choices[0].message?.content
        } catch(e) {
            // TODO: Log this.
            console.log(e);
        }

        if(resp) {
            if (message.retried) resp = ":computer::warning: Bot reset\n\n" + resp;
            this.personality.addAssistantMessage(resp);
            onRespond(resp)
        }
        else {
            // reset if failed
            this.personality.reset();
            if(!message.retried) this.addMessage(message, onRespond);
            else return;
        }
        */
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
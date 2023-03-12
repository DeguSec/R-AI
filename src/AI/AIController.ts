import { Channel, Client, Message, TextChannel, Typing } from "discord.js";
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
    userMessage: Message,
}

export class AIController {
    private openai: OpenAIApi;
    private personality: Personality;
    private client: Client;
    private channel: TextChannel;
    private userMessageDate: Date | undefined;
    private typingUsers: Map<string, NodeJS.Timeout> = new Map();
    private queuedRequest: NodeJS.Timeout | undefined;
    private messageSinceReaction: boolean = false;

    private typingTimeout = 10000;
    private messageDelay = 4000;

    constructor(client: Client, channel: Channel) {
        this.openai = new OpenAIApi(configuration);
        this.personality = personalityFactory.generateBot();
        this.client = client;

        if (!channel.isTextBased())
            throw "This channel isn't text based. Cannot make an AI Controller"

        this.channel = channel as TextChannel;
    }

    addMessage(message: AIMessage) {
        this.personality.addUserMessage(message.message, message.user);

        this.clearQueueMessageTimeout();
        this.messageSinceReaction = true;
        this.userTypingFinished(message.userMessage.author.id);

        this.userMessageDate = new Date();
    }

    typing(typing: Typing) {
        console.log(new Date(), "Typing: ", typing.user.id);

        if (typing.user.id == "1083497030334292028")
            return;

        this.clearQueueMessageTimeout();

        if (this.typingUsers.has(typing.user.id))
            clearTimeout(this.typingUsers.get(typing.user.id));

        this.typingUsers.set(typing.user.id, setTimeout(() => this.userTypingFinished(typing.user.id), this.typingTimeout));
    }

    private userTypingFinished(typing: string) {
        if (this.typingUsers.has(typing))
            clearTimeout(this.typingUsers.get(typing))

        this.typingUsers.delete(typing);

        if (this.typingUsers.size == 0)
            this.typingFinished();
    }

    private typingFinished() {
        console.log(new Date(), "Assuming everyone finished typing");

        if (!this.messageSinceReaction)
            return;

        const delta = (this.userMessageDate ? this.userMessageDate : new Date(0)).getMilliseconds() - new Date().getMilliseconds() + this.messageDelay;
        console.log(new Date(), `${delta}s delta`);


        // fire messages
        this.queuedRequest = setTimeout(() => this.react(), delta);
    }

    private async react(retried?: boolean) {
        console.log(new Date(), "Reacting");

        // received message
        this.messageSinceReaction = false;

        this.channel.sendTyping();

        let resp;
        try {
            resp = (await this.openai.createChatCompletion(this.personality.getChatCompletion())).data.choices[0].message?.content
        } catch (e) {
            // TODO: Log this.
            console.log(e);
        }

        if (resp) {
            if (retried) resp = ":computer::warning: Bot reset\n\n" + resp;
            this.personality.addAssistantMessage(resp);
            this.channel.send(resp);
        }
        else {
            // reset if failed
            this.personality.reset();
            if (!retried) this.react(true);
            else return;
        }

    }

    private clearQueueMessageTimeout() {
        console.log("Cleared queue");

        if (this.queuedRequest)
            clearTimeout(this.queuedRequest);

        this.queuedRequest = undefined;
    }

    changePersonality(personality?: Personalities) {
        this.reset();
        this.personality = personalityFactory.generateBot(personality);
    }

    replacePrompt(newPrompt: string) {
        this.reset();
        this.personality = new Basic(newPrompt);
    }

    reset() {
        this.personality.reset();

        if (this.queuedRequest)
            clearTimeout(this.queuedRequest);
    }
}
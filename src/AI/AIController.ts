import { Channel, Client, Message, TextChannel, Typing } from "discord.js";
import { Configuration, OpenAIApi } from "openai";
import { EnvSecrets } from "../EnvSecrets";
import { CheckSelfInteract } from "../Functions/CheckSelfInteract";
import { CommonComponents } from "../Listeners/_Listeners";
import { Basic } from "../Personality/Basic";
import { Personalities, Personality, PersonalityFactory } from "../Personality/_Personality";
import { AIDebugger } from "./AIDebugger";

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
    private cc: CommonComponents;
    private channel: TextChannel;
    private userMessageDate: Date | undefined;
    private typingUsers: Map<string, NodeJS.Timeout> = new Map();
    private queuedRequest: NodeJS.Timeout | undefined;
    private messageSinceReaction: boolean = false;

    private typingTimeout = 10000;
    private messageDelay = 4000;

    private _debug = new AIDebugger();

    constructor(cc: CommonComponents, channel: Channel) {
        this.openai = new OpenAIApi(configuration);
        this.personality = personalityFactory.generateBot();
        this.cc = cc;

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
        this._debug.log(`Typing: ${typing.user.id}`);

        if (CheckSelfInteract(typing.user.id, this.cc))
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
        this._debug.log("Assuming everyone finished typing");

        if (!this.messageSinceReaction)
            return;

        const delta = (this.userMessageDate ? this.userMessageDate : new Date(0)).getMilliseconds() - new Date().getMilliseconds() + this.messageDelay;
        this._debug.log(`${delta}s delta`);


        // fire messages
        this.queuedRequest = setTimeout(() => this.react(), delta);
    }

    private async react(retried?: boolean) {
        this._debug.log("Reacting");

        // received message
        this.messageSinceReaction = false;

        this.channel.sendTyping();

        let resp;
        try {
            resp = (await this.openai.createChatCompletion(this.personality.getChatCompletion())).data.choices[0].message?.content
        } catch (e) {
            // TODO: Log this.
            this._debug.log(e);
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
        this._debug.log("Cleared queue");

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
        this.personality = new Basic(newPrompt, this.debug);
    }

    reset() {
        this.personality.reset();

        if (this.queuedRequest)
            clearTimeout(this.queuedRequest);
    }

    /**
     * toggles debug mode
     */
    toggleDebug() {
        this._debug.toggleDebug()
    }

    /**
     * Readonly debug param
     */
    get debug() {
        return this._debug.debugMode;
    }
}
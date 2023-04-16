import { Channel, Message, TextChannel, Typing } from "discord.js";
import { Configuration, OpenAIApi } from "openai";
import { EnvSecrets } from "../EnvSecrets";
import { CheckSelfInteract } from "../Functions/CheckSelfInteract";
import { SeparateMessages } from "../Functions/SeparateMessages";
import { DEFAULT, Personality, PersonalityFactory } from "../Personality/_Personality";
import { AIDebugger } from "./AIDebugger";
import { CommonComponents } from "../CommonComponents";
import { ChannelModel, IChannelEntity } from "../Database/Models/Channel.model";

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
    private personality?: Personality;
    private cc: CommonComponents;
    private channel: TextChannel;
    private userMessageDate: Date | undefined;
    private typingUsers: Map<string, NodeJS.Timeout> = new Map();
    private queuedRequest: NodeJS.Timeout | undefined;
    private messageSinceReaction: boolean = false;

    private typingTimeout = 10000;
    private messageDelay = 4000;

    private _debug = new AIDebugger();

    // this is a message stack that waits for the personality to initialize
    private messagesAwaiting: Array<AIMessage> = [];

    constructor(cc: CommonComponents, channel: Channel) {
        this.openai = new OpenAIApi(configuration);
        this.cc = cc;

        if (!channel.isTextBased())
            throw new Error("This channel isn't text based. Cannot make an AI Controller");

        this.channel = channel as TextChannel;

        (async () => {
            this.personality = await personalityFactory.initBot(this._debug, channel.id);

            while (true) {
                const ret = this.messagesAwaiting.pop();
                if (!ret)
                    break;

                this.addMessage(ret);
            }
        })();
    }

    addMessage(message: AIMessage) {
        if (!this.personality) {
            this.messagesAwaiting.push(message);
            return;
        }

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
        if (!this.personality)
            return;

        this._debug.log("Reacting");

        // received message
        this.messageSinceReaction = false;

        this.channel.sendTyping();

        let resp;
        try {
            const req = await this.openai.createChatCompletion(this.personality.getChatCompletion());
            this._debug.logResponse(req);
            resp = req.data.choices[0].message?.content;
        } catch (e) {
            // TODO: Log this.
            this._debug.log(e);
        }

        if (resp) {
            if (retried) resp = ":computer::warning: Bot reset\n\n" + resp;
            this.personality.addAssistantMessage(resp);

            SeparateMessages(resp).forEach(message => {
                this.channel.send(message.trim());
            });

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

    async changePersonality(personality: string) {
        await this.reset();
        this.personality = await personalityFactory.generateBot(this._debug, personality);
    }

    async replacePrompt(newPrompt: string) {
        await this.reset();
        this.personality = personalityFactory.generateCustomBot(this._debug, this.channel.id, newPrompt);
        this.personality.setDebugger(this._debug);
    }

    async reset() {
        if (!this.personality) {
            this.personality = await personalityFactory.generateBot(this._debug, DEFAULT);
        }

        await this.personality.reset();

        if (this.queuedRequest)
            clearTimeout(this.queuedRequest);
    }

    /**
     * toggles debug mode
     */
    toggleDebug() {
        this._debug.toggleDebug();
    }

    /**
     * Readonly debug param
     */
    get debug() {
        return this._debug.debugMode;
    }
}
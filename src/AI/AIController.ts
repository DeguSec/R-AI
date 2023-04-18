import { Channel, Message, TextChannel, Typing } from "discord.js";
import { Configuration, OpenAIApi } from "openai";
import { EnvSecrets } from "../EnvSecrets";
import { CheckSelfInteract } from "../Functions/CheckSelfInteract";
import { SeparateMessages } from "../Functions/SeparateMessages";
import { DEFAULT, Personality, PersonalityFactory } from "./AIPersonality";
import { AIDebugger } from "./AIDebugger";
import { CommonComponents } from "../CommonComponents";
import { IMessageEntity } from "../Database/Models/Messages.model";
import { ChannelModel, IChannelEntity } from "../Database/Models/Channel.model";
import { DEFAULT_PERSONALITY_STRING } from "../Defaults";

const personalityFactory = new PersonalityFactory();
const configuration = new Configuration({
    apiKey: EnvSecrets.getSecretOrThrow<string>('API_KEY'),
});

export interface AIMessage {
    message: string,
    user?: string,
    retried: boolean,
    userMessage: Message,
}

export class AIController {
    public readonly channel: TextChannel;

    private readonly cc: CommonComponents;
    private readonly openai: OpenAIApi;

    private personality?: Personality;

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
        console.log("Made new AI for ", channel.id);
        this.openai = new OpenAIApi(configuration);
        this.cc = cc;

        if (!channel.isTextBased())
            throw new Error("This channel isn't text based. Cannot make an AI Controller");

        this.channel = channel as TextChannel;
    }

    /**
     * Required before use! Use this function to get a personality for the bot.  
     */
    async strapPersonality() {
        this.personality = await personalityFactory.generateBot(this._debug, this.channel.id);
    }

    /**
     * Check if required! This adds the first message to the message list and adds the personality to the database so restore is possible.
     */
    async runAfterCreatingNewPersonality() {
        await this.personality?.restoreSystemMessage();
        await this.saveCurrentPersonality();
    }

    /**
     * Load the external messages
     * @param messages 
     */
    restoreMessages(messages: Array<IMessageEntity>) {
        if (!this.personality)
            throw Error("Cannot restore without personality");

        if (!messages) {
            this._debug.log("There were no messages for the personality: " + this.channel.id);
            this.personality.restoreSystemMessage();
        }


        console.log("Messages to restore: ");
        console.log(messages);

        this.personality.messages = messages.map((message) => {
            return {
                role: message.content.role,
                content: message.content.content,
                name: message.content.name
            }
        });
    }

    /**
     * Puts the current personality into the database
     */
    async saveCurrentPersonality() {
        if(!this.personality)
            return;
        
        await ChannelModel.deleteOne({channel: this.channel.id}).exec();
        await new ChannelModel({
            channel: this.channel.id,
            personalityString: this.personality.getInitialSystemMessage(),
            debug: this._debug.debugMode,
        }).save();
    }

    finishStrapping() {
        while (true) {
            const message = this.messagesAwaiting.shift();
            if (!message)
                break

            console.log("adding awaiting message", message);
            this.addMessage(message);
        }
    }

    addMessage(message: AIMessage) {
        if (!this.personality) {
            console.log("pushed awaiting message", this.messagesAwaiting);
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
        await this.personality?.deleteDB();
        this.personality = await personalityFactory.generateBot(this._debug, this.channel.id, personality);
        await this.runAfterCreatingNewPersonality();
    }

    async replacePrompt(newPrompt: string) {
        await this.personality?.deleteDB();
        this.personality = await personalityFactory.generateCustomBot(this._debug, this.channel.id, newPrompt);
        await this.runAfterCreatingNewPersonality();
    }

    /**
     * Runs personality reset routine and clears timers
     * @todo include other timers
     */
    async reset() {
        if (this.personality)
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
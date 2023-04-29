import { Channel, Message, TextChannel, Typing } from "discord.js";
import { CheckSelfInteract } from "../Functions/CheckSelfInteract";
import { SeparateMessages } from "../Functions/SeparateMessages";
import { Personality, PersonalityFactory } from "./AIPersonality";
import { AIDebugger } from "./AIDebugger";
import { CommonComponents } from "../CommonComponents";
import { IMessageEntity } from "../Database/Models/Messages.model";
import { ChannelModel } from "../Database/Models/Channel.model";
import { AIProxy } from "./AIProxy";
import { convertUserForBot } from "../Functions/UserFunctions";
import { DEFAULT_IGNORE_STRING } from "../Defaults";
import { IChatCompletionEntityDBO } from "../Database/Models/AIProxy/ChatCompletion.model";

const personalityFactory = new PersonalityFactory();
const proxy = new AIProxy();

export interface AIMessage {
    message: string,
    user?: string,
    retried: boolean,
    userMessage: Message,
}

export class AIController {
    /**
     * The TextChannel used by the bot
     */
    public readonly channel: TextChannel;

    private readonly cc: CommonComponents;

    private personality?: Personality;

    /**
     * Date object to calculate delta with
     */
    private userMessageDate: Date | undefined;

    /**
     * All of the users that have sent a typing request
     */
    private typingUsers: Map<string, NodeJS.Timeout> = new Map();

    /** 
     * The reaction timer.
     */
    private queuedRequest: NodeJS.Timeout | undefined;

    /**
     * Sees to see if messages have been sent by users
     */
    private messageSinceReaction: boolean = false;

    /**
     * Time to give users between typing requests
     */
    private typingTimeout = 10000;

    /**
     * Time to give users to start typing
     */
    private messageDelay = 4000;

    /**
     * Possible existing call
     */
    private currentDBO?: IChatCompletionEntityDBO;

    /**
     * The debugger for AI
     */
    public aiDebugger: AIDebugger;

    // this is a message stack that waits for the personality to initialize
    private messagesAwaiting: Array<AIMessage> = [];

    constructor(cc: CommonComponents, channel: Channel) {
        this.aiDebugger = new AIDebugger(cc);
        this.cc = cc;

        if (!channel.isTextBased())
            throw new Error("This channel isn't text based. Cannot make an AI Controller");

        this.channel = channel as TextChannel;
    }

    /**
     * Required before use! Use this function to get a personality for the bot.  
     */
    async strapPersonality(personalityString?: string) {
        if (!personalityString)
            this.personality = await personalityFactory.generateBot(this.aiDebugger, this.channel.id);
        else
            this.personality = await personalityFactory.generateCustomBot(this.aiDebugger, this.channel.id, personalityString);
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
            this.aiDebugger.log("There were no messages for the personality: " + this.channel.id);
            this.personality.restoreSystemMessage();
        }

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
        if (!this.personality)
            return;

        await ChannelModel.deleteOne({ channel: this.channel.id }).exec();
        await new ChannelModel({
            channel: this.channel.id,
            personalityString: this.personality.getInitialSystemMessage(),
            debug: this.aiDebugger.debugMode,
        }).save();
    }

    finishStrapping() {
        while (true) {
            const message = this.messagesAwaiting.shift();
            if (!message)
                break

            this.addMessage(message);
        }
    }

    addMessage(message: AIMessage) {
        if (!this.personality) {
            this.messagesAwaiting.push(message);
            return;
        }

        // ignore if the message starts with that string
        if (message.message.indexOf(DEFAULT_IGNORE_STRING) == 0)
            return;

        this.personality.addUserMessage(message.message, message.user);

        this.clearQueueMessageTimeout();
        this.messageSinceReaction = true;
        this.userTypingFinished(message.userMessage.author.id);

        this.userMessageDate = new Date();
    }

    typing(typing: Typing) {
        this.aiDebugger.log(`Typing: ${typing.user.id}`);

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
        this.aiDebugger.log("Assuming everyone finished typing");

        if (!this.messageSinceReaction)
            return;

        const delta = (this.userMessageDate ? this.userMessageDate : new Date(0)).getMilliseconds() - new Date().getMilliseconds() + this.messageDelay;
        this.aiDebugger.log(`${delta}s delta`);


        // fire messages
        this.queuedRequest = setTimeout(() => this.react(), delta);
    }

    private sendTyping() {
        this.aiDebugger.log("Sending typing...");
        this.channel.sendTyping();
    }

    public async externalReact() {
        this.aiDebugger.log("externally reacted");
        return await this.react();
    }

    private async react() {
        if (!this.personality)
            return;

        if (this.currentDBO) {
            this.aiDebugger.log("Had to cancel previous request.");
            this.currentDBO.status = "Cancelled";
            await this.currentDBO.save();
        }

        this.aiDebugger.log("Reacting");

        // received message
        this.messageSinceReaction = false;

        this.sendTyping();

        const requestTyping = setInterval(() => { this.sendTyping() }, 5000);
        const promise = await proxy.send(this.personality.getChatCompletion());
        this.currentDBO = promise.dbObject;

        const res = await promise.response;

        clearInterval(requestTyping);

        if (!res.success) {
            if (res.bubble && res.reason)
                this.channel.send(res.reason);

            return;
        }

        if (!res.response)
            return;

        this.aiDebugger.logResponse(res.response);
        // get the content from request
        const resContent = res.response.data.choices[0].message?.content;
        if (!resContent)
            return;

        this.personality?.addAssistantMessage(resContent, this.cc.client.user ? convertUserForBot(this.cc.client.user) : undefined);

        SeparateMessages(resContent).forEach(message => {
            const trimmedMessage = message.trim()
            this.channel.send(trimmedMessage);
        });
    }

    private clearQueueMessageTimeout() {
        this.aiDebugger.log("Cleared queue");

        if (this.queuedRequest)
            clearTimeout(this.queuedRequest);

        this.queuedRequest = undefined;
    }

    async changePersonality(personality: string) {
        await this.personality?.deleteDB();
        this.personality = await personalityFactory.generateBot(this.aiDebugger, this.channel.id, personality);
        await this.runAfterCreatingNewPersonality();
    }

    async replacePrompt(newPrompt: string) {
        await this.personality?.deleteDB();
        this.personality = await personalityFactory.generateCustomBot(this.aiDebugger, this.channel.id, newPrompt);
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
        this.aiDebugger.toggleDebug();
        this.saveCurrentPersonality();
    }

    /**
     * Readonly debug param
     */
    get debug() {
        return this.aiDebugger.debugMode;
    }
}
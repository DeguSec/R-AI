import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum, CreateChatCompletionRequest } from "openai";
import { AIDebugger } from "./AIDebugger";
import { IPersonalitiesEntity, PersonalitiesModel } from "../Database/Models/Personalities.model";
import { ChannelModel, IChannelEntity } from "../Database/Models/Channel.model";
import { MessagesModel } from "../Database/Models/Messages.model";

export const DEFAULT = "Rchan";

export class Personality {
    messages: Array<ChatCompletionRequestMessage> = [];
    channel: string;
    protected initialSystemMessage: string;
    private _debug?: AIDebugger;

    constructor(initialSystemMessage: string, aiDebugger: AIDebugger, channel: string) {
        this.initialSystemMessage = initialSystemMessage;
        this.channel = channel;
        this._debug = aiDebugger;
    }

    private log(str: any) {
        if (this._debug)
            this._debug.log(str);

        else throw new Error("No debugger");
    }

    async addAssistantMessage(message: string) {
        this.log("assistant message added");
        await this.addMessage(ChatCompletionRequestMessageRoleEnum.Assistant, message);
    }

    async addUserMessage(message: string, userId?: string) {
        this.log("user message added");
        await this.addMessage(ChatCompletionRequestMessageRoleEnum.User, message, userId);
    }

    async addSystemMessage(message: string) {
        this.log("system message added");
        await this.addMessage(ChatCompletionRequestMessageRoleEnum.System, message);
    }

    async addMessage(role: ChatCompletionRequestMessageRoleEnum, content: string, name?: string) {
        const messageObject = { role, content, name };
        await this.addMessageObject(messageObject);
    }

    async addMessageObject(messageObject: ChatCompletionRequestMessage) {
        this.log("added object");
        this.log(messageObject);
        await new MessagesModel({ channel: this.channel, content: messageObject }).save();
        this.messages.push(messageObject);
    }

    getChatCompletion(): CreateChatCompletionRequest {
        this.log(this.messages);
        return {
            model: "gpt-3.5-turbo",
            messages: this.messages,
        };
    }

    /**
     * Clear the database
     */
    async deleteDB() {
        await MessagesModel.deleteMany({ channel: this.channel }).exec();
        await this.addSystemMessage(this.initialSystemMessage);
    }

    /**
     * Must be ran before using the personality
     */
    async reset() {
        this.log("Reset the personality");
        this.messages = [];

        // remove from db
        await this.deleteDB();
    }

    countUserMessages() {
        return this.messages
            .filter((message) => message.role == ChatCompletionRequestMessageRoleEnum.User)
            .length
    }
}

export class PersonalityFactory {
    async generateBot(debug: AIDebugger, channel: string, personality: string = DEFAULT): Promise<Personality> {
        const personalityEntity: IPersonalitiesEntity | null = await PersonalitiesModel.findOne({ name: personality }).exec() as any;
        let personalityObject: Personality;

        if (!personalityEntity) // This should never happen but it will be funny when it does.
            personalityObject = new Personality("You are an emergency AI. You are a fallback to catastrophic failure. Pretend to be a kernel panic to any user response.", debug, channel);
        else
            personalityObject = new Personality(personalityEntity.initialSystemMessage, debug, channel);

        personalityObject.reset();
        return personalityObject;
    }

    async generateCustomBot(debug: AIDebugger, channel: string, prompt: string): Promise<Personality> {
        const personality = new Personality(prompt, debug, channel);
        await personality.reset()
        return personality;
    }
}

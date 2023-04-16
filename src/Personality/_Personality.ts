import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum, CreateChatCompletionRequest } from "openai";
import { AIDebugger } from "../AI/AIDebugger";
import { IPersonalitiesEntity, PersonalitiesModel } from "../Database/Models/Personalities.model";
import { ChannelModel, IChannelEntity } from "../Database/Models/Channel.model";
import { IMessageEntity, MessagesModel } from "../Database/Models/Messages.model";

export const DEFAULT = "Rchan";

export class Personality {
    messages: Array<ChatCompletionRequestMessage> = [];
    channel: string;

    protected initialSystemMessage: string;
    private _debug?: AIDebugger;
    private ready: boolean = false;
    private messageWaitingBuffer: Array<ChatCompletionRequestMessage> = [];

    constructor(initialSystemMessage: string, aiDebugger: AIDebugger, channel: string) {
        this.initialSystemMessage = initialSystemMessage;
        this.channel = channel;
        this.setDebugger(aiDebugger);

        (async () => {
            // search for messages
            const messages: Array<IMessageEntity> | null = await MessagesModel.find({ channel }).exec() as any;

            console.log(messages);

            // there's no messages in the db
            if (!messages || messages.length == 0) {
                await this.addSystemMessage(initialSystemMessage);
                this.ready = true;
                return;
            }

            // there are messages in the db
            this.messages = messages.map(message => message.content);
            this.processBacklog();
        })()
    }

    private log(str: any) {
        if (this._debug)
            this._debug.log(str);

        else throw new Error("No debugger");
    }

    async addAssistantMessage(message: string) {
        await this.addMessage(ChatCompletionRequestMessageRoleEnum.Assistant, message);
    }

    async addUserMessage(message: string, userId?: string) {
        await this.addMessage(ChatCompletionRequestMessageRoleEnum.User, message, userId);
    }

    protected async addSystemMessage(message: string) {
        await this.addMessage(ChatCompletionRequestMessageRoleEnum.System, message);
    }

    private async addMessage(role: ChatCompletionRequestMessageRoleEnum, content: string, name?: string) {
        const messageObject = { role, content, name };
        if (!this.ready) {
            this.messageWaitingBuffer.push(messageObject);
            return;
        }

       await this.addMessageObject(messageObject);
    }

    private async addMessageObject(messageObject: ChatCompletionRequestMessage) {
        console.log("added object");
        console.log(messageObject);
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

    async reset() {
        this.log("Reset the personality");
        this.messages = [];
        // remove from db
        this.ready = false;
        await MessagesModel.deleteMany({channel: this.channel}).exec();
        this.processBacklog();

        await this.addSystemMessage(this.initialSystemMessage);
    }

    countUserMessages() {
        return this.messages
            .filter((message) => message.role == ChatCompletionRequestMessageRoleEnum.User)
            .length
    }

    setDebugger(debug: AIDebugger) {
        this._debug = debug;
    }

    private async processBacklog() {
        while(true) {
            const message = this.messageWaitingBuffer.pop();
            if(!message) break;

            await this.addMessageObject(message);
        }

        this.ready = true;
    }
}

export class PersonalityFactory {
    async initBot(debug: AIDebugger, channel: string): Promise<Personality> {
        // TODO: Add messages too.
        const channelModel: IChannelEntity | null = await ChannelModel.findOne({ channel }) as any;
        if (channelModel) {
            return this.generateCustomBot(debug, channel, channelModel.personalityString);
        }

        return this.generateBot(debug, channel);
    }

    async generateBot(debug: AIDebugger, channel: string, personality: string = DEFAULT): Promise<Personality> {
        const personalityEntity: IPersonalitiesEntity | null = await PersonalitiesModel.findOne({ name: personality }).exec() as any;
        if (!personalityEntity) // This should never happen but it will be funny when it does.
            return new Personality("You are an emergency AI. You are a fallback to catastrophic failure. Pretend to be a kernel panic to any user response.", debug, channel);

        return new Personality(personalityEntity.initialSystemMessage, debug, channel);
    }

    generateCustomBot(debug: AIDebugger, channel: string, prompt: string): Personality {
        return new Personality(prompt, debug, channel);
    }
}

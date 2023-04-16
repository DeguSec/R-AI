import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum, CreateChatCompletionRequest } from "openai";
import { AIDebugger } from "../AI/AIDebugger";
import { IPersonalitiesEntity, PersonalitiesModel } from "../Database/Models/Personalities.model";
import { ChannelModel, IChannelEntity } from "../Database/Models/Channel.model";
import { MessagesModel } from "../Database/Models/Messages.model";

export const DEFAULT = "Rchan";

export class Personality {
    messages: Array<ChatCompletionRequestMessage> = [];
    channel: string;

    protected initialSystemMessage: string;
    private _debug?: AIDebugger;

    constructor(initialSystemMessage: string, aiDebugger: AIDebugger) {
        this.initialSystemMessage = initialSystemMessage;
        this.channel = "channel"; 

        // search for messages
        this.addSystemMessage(initialSystemMessage);
        this.setDebugger(aiDebugger);
    }

    private log(str: any) {
        if(this._debug)
            this._debug.log(str);

        else throw new Error("No debugger");
    }

    addAssistantMessage(message: string): void {
        this.addMessage(ChatCompletionRequestMessageRoleEnum.Assistant, message);
    }

    addUserMessage(message: string, userId?: string): void {
        this.addMessage(ChatCompletionRequestMessageRoleEnum.User, message, userId);
    }

    protected addSystemMessage(message: string) {
        this.addMessage(ChatCompletionRequestMessageRoleEnum.System, message);
    }

    private addMessage(role: ChatCompletionRequestMessageRoleEnum, content: string, name?: string) {
        const messageObject = {role, content, name}

        new MessagesModel({channel: this.channel, content: messageObject}).save();
        this.messages.push(messageObject);
    }

    getChatCompletion(): CreateChatCompletionRequest {
        this.log(this.messages);
        return {
            model: "gpt-3.5-turbo",
            messages: this.messages,
        };
    }

    reset() {
        this.log("Reset the personality");
        this.messages = [];
        this.addSystemMessage(this.initialSystemMessage);
    }

    countUserMessages() {
        return this.messages
            .filter( (message) => message.role == ChatCompletionRequestMessageRoleEnum.User )
            .length
    }

    setDebugger(debug: AIDebugger) {
        this._debug = debug;
    }
} 

export class PersonalityFactory {
    async initBot(debug: AIDebugger, channel: string): Promise<Personality> {
        // TODO: Add messages too.
        const channelModel: IChannelEntity | null = await ChannelModel.findOne({channel}) as any;
        if(channelModel) {
            return this.generateCustomBot(debug, channelModel.personalityString);
        }

        return this.generateBot(debug);
    }

    async generateBot(debug: AIDebugger, personality: string = DEFAULT): Promise<Personality> {
        const personalityEntity: IPersonalitiesEntity | null = await PersonalitiesModel.findOne({name: personality}).exec() as any;
        if(!personalityEntity) // This should never happen but it will be funny when it does.
            return new Personality("You are an emergency AI. You are a fallback to catastrophic failure. Pretend to be a kernel panic to any user response.", debug);
        
        return new Personality(personalityEntity.initialSystemMessage, debug);
    }

    generateCustomBot(debug: AIDebugger, prompt: string): Personality {
        return new Personality(prompt, debug);
    }
}

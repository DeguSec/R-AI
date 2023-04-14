import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum, CreateChatCompletionRequest } from "openai";
import { AIDebugger } from "../AI/AIDebugger";
import { IPersonalitiesEntity, PersonalitiesModel } from "../Database/Models/Personalities.model";

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
        this.messages.push({
            role,
            content,
            name
        })
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
    private async initBot(debug: AIDebugger, name: string): Promise<Personality> {
        const personalityEntity: IPersonalitiesEntity | null = await PersonalitiesModel.findOne({name}).exec() as any;
        if(!personalityEntity) 
            return new Personality("You are an emergency AI. You are a fallback to catastrophic failure. Pretend to be a kernel panic to any user response.", debug);
        
        const ai = new Personality(personalityEntity.initialSystemMessage, debug);
        return ai;
    }

    async generateBot(debug: AIDebugger, personality: string): Promise<Personality> {
        return await this.initBot(debug, personality);
    }

    generateCustomBot(debug: AIDebugger, prompt: string): Personality {
        const ai = new Personality(prompt, debug);
        ai.setDebugger(debug);
        return ai;
    }
}

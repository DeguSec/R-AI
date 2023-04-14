import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum, CreateChatCompletionRequest } from "openai";
import { AIDebugger } from "../AI/AIDebugger";


export interface Personality {
    addUserMessage: (message: string, user?: string) => void,
    addAssistantMessage: (message: string) => void,
    getChatCompletion: () => CreateChatCompletionRequest
    reset: () => void;
    setDebugger: (debug: AIDebugger) => void;
}

export enum Personalities {
    default = "Default",
    LOLBot = "LolBot",
    RLol = "RLol",
    RChan = "R-chan",
    Gazelle = "Gazelle",
    Hope = "Hope",
    Joe = "Joe",
    Mommy = "Mommy"
}

export class Basic implements Personality {
    messages: Array<ChatCompletionRequestMessage> = [];
    channel: string;

    protected initialSystemMessage: string;
    private _debug?: AIDebugger;

    constructor(initialSystemMessage: string) {
        this.initialSystemMessage = initialSystemMessage;
        this.channel = "channel"; 

        // search for messages
        this.addSystemMessage(initialSystemMessage);
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
    private initBot(bot?: Personalities): Personality {
        
    }

    generateBot(debug: AIDebugger, bot?: Personalities): Personality {
        const ai = this.initBot(bot)
        ai.setDebugger(debug);
        return ai;
    }
}

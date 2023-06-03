import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum, CreateChatCompletionRequest } from "openai";
import { AIDebugger } from "../Base/AIDebugger"
import { SortedArray } from "../../DataStructures/SortedArray";

export class VoicePersonality {
    messages: SortedArray<Date, ChatCompletionRequestMessage> = new SortedArray<Date, ChatCompletionRequestMessage> ();
    
    debug: AIDebugger;

    protected initialSystemMessage: string;

    
    constructor(initialSystemMessage: string, debug: AIDebugger) {
        this.initialSystemMessage = initialSystemMessage;
        this.debug = debug;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected log(str: any) {
        if (this.debug)
            this.debug.log(str);
    
        else throw new Error("No debugger");
    }

    addAssistantMessage(message: string, name: string, time: Date) {
        this.addMessage(ChatCompletionRequestMessageRoleEnum.Assistant, message, time, name);
    }

    addUserMessage(message: string, name: string, time: Date) {
        this.addMessage(ChatCompletionRequestMessageRoleEnum.User, message,time, name);
    }
    
    addSystemMessage(message: string, time?: Date): void {
        this.addMessage(ChatCompletionRequestMessageRoleEnum.System, message, time ? time : new Date(), undefined);
    }

    addMessage(role: ChatCompletionRequestMessageRoleEnum, content: string, time: Date, name?: string) {
        const messageObject = { role, content, name };
        this.addMessageObject(messageObject, time);
    }

    addMessageObject(messageObject: ChatCompletionRequestMessage, time: Date) {
        this.messages.insert(time, messageObject);
    }

    getChatCompletion(): CreateChatCompletionRequest {
        this.log(this.messages);
        return {
            model: "gpt-3.5-turbo",
            messages: this.messages.values,
        };
    }

    /**
     * Clear the messages
     */
    deleteMessages() {
        this.messages.clear();
    }
    
    reset() {
        this.log("Resetting the personality");
    
        // remove from db
        this.deleteMessages();
    }
    
    getInitialSystemMessage() {
        return this.initialSystemMessage;
    }
    
    countUserMessages() {
        return this.messages.values
            .filter((message) => message.role == ChatCompletionRequestMessageRoleEnum.User)
            .length
    }
}
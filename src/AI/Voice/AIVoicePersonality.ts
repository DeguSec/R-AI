import { AIDebugger } from "../Base/AIDebugger"
import { SortedArray } from "../../DataStructures/SortedArray";
import { ChatCompletionCreateParamsNonStreaming, ChatCompletionMessageParam, ChatCompletionRole } from "openai/resources";

export class VoicePersonality {
    messages: SortedArray<number, ChatCompletionMessageParam> = new SortedArray<number, ChatCompletionMessageParam> ();
    
    debug: AIDebugger;

    protected initialSystemMessage: string;

    
    constructor(initialSystemMessage: string, debug: AIDebugger) {
        this.initialSystemMessage = initialSystemMessage;
        this.debug = debug;

        this.reset();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected log(str: any) {
        if (this.debug)
            this.debug.log(str);
    
        else throw new Error("No debugger");
    }

    addAssistantMessage(message: string, time: number) {
        this.addMessage("assistant", message, time, "assistant");
    }

    addUserMessage(message: string, name: string, time: number) {
        this.addMessage("user", message, time, name);
    }
    
    addSystemMessage(message: string, time?: number): void {
        this.addMessage("system", message, time ? time : Date.now(), undefined);
    }

    addMessage(role: ChatCompletionRole, content: string, time: number, name?: string) {
        const messageObject = { role, content, name };
        console.log(messageObject);
        this.addMessageObject(messageObject, time);
    }

    addMessageObject(messageObject: ChatCompletionMessageParam, time: number) {
        this.messages.insert(time, messageObject);
    }

    getChatCompletion(): ChatCompletionCreateParamsNonStreaming {
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

        // re add system message
        this.addSystemMessage(this.initialSystemMessage);
    }
    
    getInitialSystemMessage() {
        return this.initialSystemMessage;
    }
    
    countUserMessages() {
        return this.messages.values
            .filter((message) => message.role == "user")
            .length
    }
}
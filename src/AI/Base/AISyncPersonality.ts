import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum, CreateChatCompletionRequest } from "openai";
import { AIDebugger } from "./AIDebugger";

/**
 * This personality doesn't save to the database or do anything weird with databases
 * @todo remove channel from requirements
 */
export class SyncPersonality {
    messages: Array<ChatCompletionRequestMessage> = [];
    channel: string;
    protected initialSystemMessage: string;
    private _debug?: AIDebugger;

    constructor(initialSystemMessage: string, aiDebugger: AIDebugger, channel: string) {
        this.initialSystemMessage = initialSystemMessage;
        this.channel = channel;
        this._debug = aiDebugger;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected log(str: any) {
        if (this._debug)
            this._debug.log(str);

        else throw new Error("No debugger");
    }

    addAssistantMessage(message: string, name?: string) {
        this.log("assistant message added");
        this.addMessage(ChatCompletionRequestMessageRoleEnum.Assistant, message, name);
    }

    addUserMessage(message: string, userId?: string) {
        this.log("user message added");
        this.addMessage(ChatCompletionRequestMessageRoleEnum.User, message, userId);
    }

    addSystemMessage(message: string) {
        this.log("system message added");
        this.addMessage(ChatCompletionRequestMessageRoleEnum.System, message);
    }

    addMessage(role: ChatCompletionRequestMessageRoleEnum, content: string, name?: string) {
        const messageObject = { role, content, name };
        this.addMessageObject(messageObject);
    }

    /**
     * @param messageObject ChatCompletionRequestMessage 
     */
    addMessageObject(messageObject: ChatCompletionRequestMessage) {
        this.log("added object");
        this.log(messageObject);

        if(!messageObject.content) {
            this.log("Cannot add message because it is null");
            return;
        }

        messageObject.content = messageObject.content.trim();

        if(messageObject.content == "")
            throw new Error("the content of the message was empty?");
        
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
     * Clear the messages
     */
    deleteMessages() {
        this.messages = [];
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
        return this.messages
            .filter((message) => message.role == ChatCompletionRequestMessageRoleEnum.User)
            .length
    }
}
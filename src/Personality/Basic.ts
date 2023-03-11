import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum, CreateChatCompletionRequest, CreateChatCompletionRequestStop } from "openai";
import { Personality } from "./_Personality";



export class Basic implements Personality {

    messages: Array<ChatCompletionRequestMessage> = [];
    protected initialSystemMessage: string;

    constructor(initialSystemMessage: string) {
        this.initialSystemMessage = initialSystemMessage;
        this.addSystemMessage(initialSystemMessage)
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
        console.log(this.messages);
        return {
            model: "gpt-3.5-turbo",
            messages: this.messages,
        };
    }

    reset() {
        this.messages = [];
        this.addSystemMessage(this.initialSystemMessage);
    }

    countUserMessages() {
        return this.messages
            .filter( (message) => message.role == ChatCompletionRequestMessageRoleEnum.User )
            .length
    }
} 
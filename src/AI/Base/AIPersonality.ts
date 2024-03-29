import { AIDebugger } from "./AIDebugger";
import { IPersonalitiesEntity, PersonalitiesModel } from "../../Database/Models/Personalities.model";
import { MessagesModel } from "../../Database/Models/Messages.model";
import { SyncPersonality } from "./AISyncPersonality";
import { ChatCompletionMessageParam } from "openai/resources";

export const DEFAULT = "Rchan";

export class Personality extends SyncPersonality {
    constructor(initialSystemMessage: string, aiDebugger: AIDebugger, channel: string) {
        super(initialSystemMessage, aiDebugger, channel);
    }

    /**
     * this will throw an error if an empty content is passed
     */
    override async addMessageObject(messageObject: ChatCompletionMessageParam) {
        super.addMessageObject(messageObject); 
        await new MessagesModel({ channel: this.channel, content: messageObject }).save();
    }

    /**
     * Clear the database
     */
    override async deleteMessages() {
        await MessagesModel.deleteMany({ channel: this.channel }).exec();
        super.messages = [];
    }

    /**
     * Run this once ready and empty.
     */
    async restoreSystemMessage() {
        this.addSystemMessage(this.initialSystemMessage);
    }
}

/**
 * WARNING: YOU MUST SET THE PROPER RESTORE MESSAGE YOURSELF
 * @param debug 
 * @param channel 
 * @param personality 
 * @returns 
 */
export async function generateBot(debug: AIDebugger, channel: string, personality: string = DEFAULT): Promise<Personality> {
    // find any existing personalities
    const personalityEntity = await PersonalitiesModel.findOne({ name: personality }).exec() as IPersonalitiesEntity | null;
    let personalityObject: Personality;

    if (!personalityEntity) // This should never happen but it will be funny when it does.
        personalityObject = new Personality(
            "You are an emergency AI. You are a fallback to catastrophic failure. Pretend to be a kernel panic to any user response.",
            debug,
            channel
        );
    else // assign the personality based on the existing personalities
        personalityObject = new Personality(personalityEntity.initialSystemMessage, debug, channel);

    // kick into life
    return personalityObject;
}

export async function generateCustomBot(debug: AIDebugger, channel: string, prompt: string): Promise<Personality> {
    const personality = new Personality(prompt, debug, channel);
    // await personality.reset()
    return personality;
}
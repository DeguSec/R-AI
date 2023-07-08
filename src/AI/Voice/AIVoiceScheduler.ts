import { GuildMember, VoiceChannel } from "discord.js";
import { AIDebugger } from "../Base/AIDebugger";
import { CommonComponents } from "../../CommonComponents";
import { AIVoiceUser } from "./AIVoiceUser";
import { DEFAULT_PERSONALITY_STRING } from "../../Defaults";
import { stripBad } from "../../Functions/UserFunctions";
import { VoicePersonality } from "./AIVoicePersonality";
import { proxy } from "../Base/AIProxy";
import { extractResponse } from "../../Functions/ExtractResponse";

const scheduling = 3000;

/**
 * Per channel operations
 */
export class VoiceScheduler {
    // all the users in the voice
    users: Map<string, AIVoiceUser> = new Map();

    // all the calls and stuff
    userDataScheduling: Map<string, NodeJS.Timeout> = new Map();

    // AI Stuff
    personality: VoicePersonality;
    debugger: AIDebugger;
    cc: CommonComponents;

    constructor(channel: VoiceChannel, cc: CommonComponents) {
        this.cc = cc;

        this.debugger = new AIDebugger(cc);

        this.personality = new VoicePersonality(DEFAULT_PERSONALITY_STRING, this.debugger);
    }

    getUser(user: GuildMember) {
        let userObject = this.users.get(user.id);

        if(!userObject) {
            userObject = new AIVoiceUser(user, (time, id, text) => this.addUserMessage(time, id, text));
            this.users.set(user.id, userObject);
        }

        return userObject;
    }

    addData(user: GuildMember, data: Buffer) {
        this.getUser(user).addData(data);

        // schedule an API call to the thing and remove previous one if it exists
        if(this.userDataScheduling.has(user.user.id))
            clearTimeout(this.userDataScheduling.get(user.user.id));

        this.userDataScheduling.set(user.user.id, setTimeout(async () => {
            this.userDataScheduling.delete(user.user.id);
            if(this.userDataScheduling.size == 0)
                await this.react();

        }, scheduling));
    }

    addUserMessage(time: number, user: string, message: string) {
        this.personality.addUserMessage(message, stripBad(user), time);
    }

    async react() {
        console.log("Reacting...");

        const start = Date.now();

        const chat = this.personality.getChatCompletion();
        console.log(chat);

        const promise = await proxy.send(chat);
        const response = await promise.response;

        if(!response.success || !response.response) {
            console.error("response not successful!");
            console.error(response.reason);
            return;
        }

        const aiContent = extractResponse(response.response);

        if(!aiContent) {
            console.error("there is no AI contnet");
            return
        }

        console.log(`AI: ${aiContent}`);
        this.personality.addAssistantMessage(aiContent, start);
    }
}
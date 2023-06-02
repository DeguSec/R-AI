import { GuildMember, VoiceChannel } from "discord.js";
import { AIDebugger } from "../Base/AIDebugger";
import { CommonComponents } from "../../CommonComponents";
import { AIVoiceUser } from "./AIVoiceUser";
import { SyncPersonality } from "../Base/AISyncPersonality";
import { DEFAULT_PERSONALITY_STRING } from "../../Defaults";
import { stripBad } from "../../Functions/UserFunctions";

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
    personality: SyncPersonality;
    debugger: AIDebugger;
    cc: CommonComponents;

    constructor(channel: VoiceChannel, cc: CommonComponents) {
        this.cc = cc;

        this.debugger = new AIDebugger(cc);

        this.personality = new SyncPersonality(DEFAULT_PERSONALITY_STRING, this.debugger, channel.id);
    }

    getUser(user: GuildMember) {
        let userObject = this.users.get(user.id);

        if(!userObject) {
            userObject = new AIVoiceUser(user);
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

    addUserMessage(time: Date, user: string, message: string) {
        this.personality.addUserMessage(message, stripBad(user));
    }

    async react() {
        console.log("Reacting...");
    }
}
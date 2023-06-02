import { GuildMember, VoiceChannel } from "discord.js";
import { AIDebugger } from "../Base/AIDebugger";
import { CommonComponents } from "../../CommonComponents";
import { AIVoiceUser } from "./AIVoiceUser";
import { SyncPersonality } from "../Base/AISyncPersonality";
import { DEFAULT_PERSONALITY_STRING } from "../../Defaults";

/**
 * Per channel operations
 */
export class VoiceScheduler {
    users: Map<string, AIVoiceUser> = new Map();

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
    }

    
}
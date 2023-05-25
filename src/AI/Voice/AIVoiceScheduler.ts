import { GuildMember, VoiceChannel } from "discord.js";
import { Personality, PersonalityFactory } from "../Base/AIPersonality";
import { AIDebugger } from "../Base/AIDebugger";
import { CommonComponents } from "../../CommonComponents";
import { AIVoiceUser } from "./AIVoiceUser";

/**
 * Per channel operations
 */
export class VoiceScheduler {
    users: Map<string, AIVoiceUser> = new Map();

    // AI Stuff
    personality?: Personality;
    debugger: AIDebugger;
    cc: CommonComponents;

    constructor(channel: VoiceChannel, cc: CommonComponents) {
        this.cc = cc;


        const debug = this.debugger = new AIDebugger(cc);
        (async () => this.personality = await new PersonalityFactory().generateBot(debug, channel.id))();
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
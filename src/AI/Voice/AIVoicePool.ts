import { Guild, VoiceChannel } from "discord.js";
import { AIVoice } from "./AIVoice";
import { CommonComponents } from "../../CommonComponents";

export class AIVoicePool {
    pool: Map<string, AIVoice> = new Map();


    join(channel: VoiceChannel, guild: Guild, cc: CommonComponents) {
        this.pool.set(channel.id, new AIVoice(channel, guild, cc));
    }
}
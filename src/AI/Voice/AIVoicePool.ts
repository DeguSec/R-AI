import { Channel, Guild } from "discord.js";
import { AIVoice } from "./AIVoice";

export class AIVoicePool {
    pool: Map<string, AIVoice> = new Map();


    join(channel: Channel, guild: Guild) {
        this.pool.set(channel.id, new AIVoice(channel, guild));
    }
}
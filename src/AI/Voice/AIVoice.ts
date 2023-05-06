import { VoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import { Channel, Guild } from "discord.js";

export class AIVoice {
    voiceConnection: VoiceConnection;

    constructor(channel: Channel, guild: Guild) {
        this.voiceConnection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false,
        });
    }
}
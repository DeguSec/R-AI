import { AudioReceiveStream, VoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import { Guild, VoiceChannel } from "discord.js";
import { CommonComponents } from "../../CommonComponents";
import { OpusEncoder } from "@discordjs/opus";

export class AIVoice {
    voiceConnection: VoiceConnection;
    cc: CommonComponents
    sub: AudioReceiveStream;

    constructor(channel: VoiceChannel, guild: Guild, cc: CommonComponents) {
        if(!cc.client.user)
            throw new Error("AIVoice fail");

        this.voiceConnection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false,
        });

        this.cc = cc;
        const encoder = new OpusEncoder(48000, 2);

        this.sub = this.voiceConnection.receiver.subscribe("1091847536374976684");
        this.sub.on("data", (data) => {
            console.log("got data");
            console.log(encoder.decode(data));
        });

    }
}
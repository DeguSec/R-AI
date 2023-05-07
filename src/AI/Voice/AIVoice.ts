import { AudioReceiveStream, VoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import { Guild, GuildMember, VoiceChannel } from "discord.js";
import { CommonComponents } from "../../CommonComponents";
import { OpusEncoder } from "@discordjs/opus";
import { CheckSelfInteract } from "../../Functions/CheckSelfInteract";

const opusEncoder = new OpusEncoder(48000, 2);
const seekTime = 1000;

export class AIVoice {
    channel: VoiceChannel;
    voiceConnection: VoiceConnection;
    cc: CommonComponents
    vcUsers: Map<string, AudioReceiveStream> = new Map();
    checkForUsersInterval: NodeJS.Timer;

    constructor(channel: VoiceChannel, guild: Guild, cc: CommonComponents) {
        if(!cc.client.user)
            throw new Error("AIVoice fail");

        this.cc = cc;
        this.channel = channel;

        this.voiceConnection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false,
        });

        this.checkForUsersInterval = setInterval(() => this.checkForUsers(), seekTime);
        this.subscribeAll();
    }

    /**
     * Subscribe everyone in vc
     */
    subscribeAll() {
        this.channel.members.forEach(member => {
            this.subscribeNew(member);
        })
    }

    subscribeNew(member: GuildMember) {
        if(CheckSelfInteract(member.id, this.cc))
            return;

        const sub = this.voiceConnection.receiver.subscribe(member.id);
        sub.on("data", async (data) => this.onUserData(data, member));

        this.vcUsers.set(member.id, sub);
    }

    async onUserData(data: Buffer, user: GuildMember)  {
        const decodedOpus = opusEncoder.decode(data);
        //await writeFile(`./rec/0`, decodedOpus);
        ///console.log(user.id);
    }

    private checkForUsers() {
        if(this.channel.members.size == 1) {
            this.voiceConnection.disconnect();
            this.voiceConnection.destroy();
            clearInterval(this.checkForUsersInterval);
            this.cc.vAis.disconnected(this.channel.id);
        }
    }
}
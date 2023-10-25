import { AudioReceiveStream, VoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import { Guild, GuildMember, VoiceChannel } from "discord.js";
import { CommonComponents } from "../../CommonComponents";
import { CheckSelfInteract } from "../../Functions/CheckSelfInteract";
import { VoiceScheduler } from "./AIVoiceScheduler";

const seekTime = 1000;

/**
 * This class is responsible for connecting, disconnecting, forwarding and 
 * subscribing users to listeners.
 */
export class AIVoice {
    channel: VoiceChannel;
    voiceConnection: VoiceConnection;
    cc: CommonComponents
    vcUsers: Map<string, AudioReceiveStream> = new Map();
    checkForUsersInterval: NodeJS.Timeout;
    aiVoiceScheduler: VoiceScheduler;

    aiVoicePackets: Array<Buffer> = [];
    currentlyProcessingVoicePackets = false;

    constructor(channel: VoiceChannel, guild: Guild, cc: CommonComponents) {
        if(!cc.client.user)
            throw new Error("AIVoice fail: !cc.client.user");

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

        this.aiVoiceScheduler = new VoiceScheduler(cc, this.voiceConnection);
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
        this.aiVoiceScheduler.addData(user, data);
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
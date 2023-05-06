import { CacheType, Collection, CommandInteraction, SlashCommandBuilder, VoiceBasedChannel } from "discord.js";
import { CommonComponents } from "../CommonComponents";
import { Command } from "./_Commands";

export class Join implements Command {
    name = "join";
    private description = "Make the bot join your vc";
    public data: SlashCommandBuilder;

    constructor() {
        this.data = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
    }

    async commandRun(interaction: CommandInteraction<CacheType>, cc: CommonComponents) {
        if (!interaction.guild) {
            interaction.reply("No guild");
            return;
        }

        await interaction.deferReply({ ephemeral: true });

        const guild = await interaction.guild.fetch();

        if (!guild) {
            interaction.editReply("Cannot fetch guild");
            return;
        }

        const channels = await guild.channels.fetch();

        if (!channels) {
            interaction.editReply("Cannot fetch channels");
            return;
        }

        // Narrow down the channels to voice channels only
        const filteredChannels = channels.filter((channel) => {
            return channel ? channel.isVoiceBased() : false;
        }) as Collection<string, VoiceBasedChannel>;

        let channel: VoiceBasedChannel | undefined;
        const allVoiceChannelsSet = filteredChannels.values();
        
        // eslint-disable-next-line no-constant-condition
        while(true) {
            const nextChannel = allVoiceChannelsSet.next();
            if(nextChannel.done)
                break;

            if(nextChannel.value.members.has(interaction.user.id)) {
                channel = nextChannel.value;
                break;
            }
            
        } 

        // no channel was found here
        if(!channel) {
            interaction.editReply(":computer: Can't find user in a voice channel");
            return;
        }

        // prep and join vc
        interaction.editReply(":computer: Joining voice channel");

        cc.vAis.join(channel, guild);
    }
}
import { SlashCommandBuilder, CommandInteraction, CacheType, Collection, NonThreadGuildBasedChannel } from "discord.js";
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

        let response: string = "";
        const filteredChannels = channels.filter((channel) => {
            return channel ? channel.isVoiceBased() : false;
        }) as Collection<string, NonThreadGuildBasedChannel>;

        filteredChannels.forEach((channel, key) => {
            response += `${key}: ${channel.name}\n`;
        });

        interaction.editReply(response);
    }
}
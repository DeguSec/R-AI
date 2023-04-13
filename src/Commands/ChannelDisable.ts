import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { AIController } from "../AI/AIController";
import { Command } from "./_Commands";
import { ChannelModel } from "../Database/Models/Channel.model";

export class ChannelDisable implements Command {
    name: string = "disable";
    private description = "Disallow the AI to interact to process and interact with this channel.";
    public data: SlashCommandBuilder;

    constructor() {
        this.data = new SlashCommandBuilder();
        this.data.setName(this.name);
        this.data.setDescription(this.description);
    }

    async commandRun(interaction: CommandInteraction, ai?: AIController) {
        if(!ai) return;

        if(!interaction.guildId) {
            interaction.reply("No need to do this in DMs");
            return;
        }

        const res = await ChannelModel.find({'channel': interaction.channelId}).exec();
        if(!res.length) {
            interaction.reply("AI is already disabled in this channel");
            return;
        }

        res[0].deleteOne();
        interaction.reply("AI has been disabled");
    }
}
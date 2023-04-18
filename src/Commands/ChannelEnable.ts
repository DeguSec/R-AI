import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { AIController } from "../AI/AIController";
import { Command } from "./_Commands";
import { ChannelModel } from "../Database/Models/Channel.model";
import { CommonComponents } from "../CommonComponents";
import { GetAI } from "../Functions/GetAI";

export class ChannelEnable implements Command {
    name: string = "enable";
    private description = "Allow the AI to interact to process and interact with this channel.";
    public data: SlashCommandBuilder;

    constructor() {
        this.data = new SlashCommandBuilder();
        this.data.setName(this.name);
        this.data.setDescription(this.description);
    }

    async commandRun(interaction: CommandInteraction, cc: CommonComponents) {
        const ai = GetAI(cc, interaction.channel);
        
        console.log(ai);
        console.log(interaction);

        const res = await ChannelModel.find({'channel': interaction.channelId}).exec();
        if(res.length) {
            interaction.reply("AI is already enabled in this channel");
            return;
        }

        await new ChannelModel({channel: interaction.channelId}).save();
        interaction.reply("AI has been enabled");
    }
}
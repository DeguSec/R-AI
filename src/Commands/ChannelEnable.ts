import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { AIController } from "../AI/AIController";
import { Command } from "./_Commands";

export class ChannelEnable implements Command {
    name: string = "enable";
    private description = "Allow the AI to interact to process and interact with this channel.";
    public data: SlashCommandBuilder;

    constructor() {
        this.data = new SlashCommandBuilder();
        this.data.setName(this.name);
        this.data.setDescription(this.description);
    }

    commandRun(interaction: CommandInteraction, ai?: AIController) {
        if(!ai) return;

        
        
        interaction.reply("AI has been enabled");
    }
}
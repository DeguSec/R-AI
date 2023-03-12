import { CommandInteraction, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, CacheType, ModalSubmitInteraction } from "discord.js";
import { AIController } from "../AI/AIController";
import { ModalListener } from "./_Commands";

export class CustomPersonality implements ModalListener {
    name = "custom-personality"
    private description = "Write your own system prompt for the bot to follow";
    public data: SlashCommandBuilder;

    constructor() {
        this.data = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)

    }
    
    commandRun(interaction: CommandInteraction, ai?: AIController) {
        const modal = new ModalBuilder()
            .setCustomId(this.name)
            .setTitle("Modal Test")

        const prompt = new TextInputBuilder()
            .setCustomId("prompt")
            .setLabel("Personality")
            .setMaxLength(1024)
            .setStyle(TextInputStyle.Paragraph)


        const row = new ActionRowBuilder();
        row.addComponents(prompt);

        modal.addComponents(row as any);

        interaction.showModal(modal);
    }

    modalRun(interaction: ModalSubmitInteraction, ai?: AIController) {
        if(!ai) {
            interaction.reply("Error");
            return;
        }

        const newPrompt = interaction.fields.getTextInputValue("prompt");
        ai.replacePrompt(newPrompt);

        interaction.reply("Set new prompt: \n" + newPrompt);
    }
}
import { CommandInteraction, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, CacheType, ModalSubmitInteraction } from "discord.js";
import { AIController } from "../AI/AIController";
import { ModalListener } from "./_Commands";
import { CommonComponents } from "../CommonComponents";
import { GetAI } from "../Functions/GetAI";

export class CustomPersonality implements ModalListener {
    name = "custom-personality"
    private description = "Write your own system prompt for the bot to follow";
    public data: SlashCommandBuilder;

    constructor() {
        this.data = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)

    }
    
    commandRun(interaction: CommandInteraction, cc: CommonComponents) {
        const ai = GetAI(cc, interaction.channel);
        if(!ai) {
            interaction.reply("No AI has been assigned. Enable the AI first");
            return;
        }

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

    modalRun(interaction: ModalSubmitInteraction, cc: CommonComponents) {
        const ai = GetAI(cc, interaction.channel);

        if(!ai) {
            interaction.reply("Error. No AI has been assigned. Enable the AI first.");
            return;
        }

        const newPrompt = interaction.fields.getTextInputValue("prompt");
        ai.replacePrompt(newPrompt);

        interaction.reply("Set new prompt: \n" + newPrompt);
    }
}
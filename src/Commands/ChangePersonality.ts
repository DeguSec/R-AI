import { APIApplicationCommandOptionChoice, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { AIController } from "../AI/AIController";
import { Command } from "./_Commands";

export class ChangePersonality implements Command {

    name = "change-personality";
    private description = "You can change the personality of the bot that you are speaking to.";
    public data: SlashCommandBuilder;

    constructor() {
        // TODO: FILL
        const a: APIApplicationCommandOptionChoice<string>[] = [];

        this.data = new SlashCommandBuilder()
            .addStringOption( 
                option => option.setName("personality")
                    .setDescription("Available Personalities")
                    .setRequired(true)
                    .addChoices(...a)
            )
            .setName(this.name)
            .setDescription(this.description)
    }

    public async commandRun(interaction: CommandInteraction, ai?: AIController) {
        let res = "";

        if(ai) {
            ai.changePersonality(interaction.options.get("personality", true).value as string);
            res = ":computer: Personality Changed";
        } else {
            res = ":computer::warning: You're not assigned an AI slot. Talk and an AI Slot will be made for you."
        }

        interaction.reply(res);

    }
}
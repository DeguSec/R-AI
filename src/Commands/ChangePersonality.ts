import { APIApplicationCommandOptionChoice, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { AIController } from "../AI/AIController";
import { AsyncCommand } from "./_Commands";
import { IPersonalitiesEntity, PersonalitiesModel } from "../Database/Models/Personalities.model";
import { CommonComponents } from "../CommonComponents";
import { GetAI } from "../Functions/GetAI";
import { CheckAllowedSource } from "../Functions/CheckAllowedSource";

export class ChangePersonality implements AsyncCommand {
    name = "change-personality";
    private description = "You can change the personality of the bot that you are speaking to.";

    async strap(): Promise<SlashCommandBuilder> {
        const data = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)

        const personalities: APIApplicationCommandOptionChoice<string>[] = [];
        (await PersonalitiesModel.find({}).exec() as Array<any>).forEach((personality: IPersonalitiesEntity) => {
            personalities.push(
                {
                    name: personality.name,
                    value: personality.name,
                }
            )
        });

        data.addStringOption(
            option => option.setName("personality")
                .setDescription("Available Personalities")
                .setRequired(true)
                .setChoices(...personalities)
        );

        return data;
    }

    public async commandRun(interaction: CommandInteraction, cc: CommonComponents) {
        const ai = GetAI(cc, interaction.channel);
        const allowed = CheckAllowedSource(cc, interaction.channel?.id, interaction.guild?.id);

        if (!ai || !allowed) {
            interaction.reply(":computer::warning: You're not assigned an AI slot. Enable the AI.");
            return;
        }

        try {
            ai.changePersonality(interaction.options.get("personality", true).value as string);
            interaction.reply(":computer: Personality Changed");
        } catch (e) {
            interaction.reply(":computer::warning: Faulty Request");
        }
    }
}
import { APIApplicationCommandOptionChoice, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { AIController } from "../AI/AIController";
import { AsyncCommand } from "./_Commands";
import { IPersonalitiesEntity, PersonalitiesModel } from "../Database/Models/Personalities.model";

export class ChangePersonality implements AsyncCommand {
    name = "change-personality";
    private description = "You can change the personality of the bot that you are speaking to.";

    strap(): Promise<SlashCommandBuilder> {
        return (async () => {
            const data = new SlashCommandBuilder()
                .setName(this.name)
                .setDescription(this.description)
            
            const a: APIApplicationCommandOptionChoice<string>[] = [];
            (await PersonalitiesModel.find({}).exec() as Array<any>).forEach((personality: IPersonalitiesEntity) => {
                console.log(personality);
            });

            //console.trace(a);

            
            return data;
        })();
    }

    public async commandRun(interaction: CommandInteraction, ai?: AIController) {
        if (!ai) {
            interaction.reply(":computer::warning: You're not assigned an AI slot. Talk and an AI Slot will be made for you.");
            return;
        }

        ai.changePersonality(interaction.options.get("personality", true).value as string);
        interaction.reply(":computer: Personality Changed");
    }
}
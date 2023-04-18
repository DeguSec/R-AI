import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { AIController } from "../AI/AIController";
import { Command } from "./_Commands";
import { CommonComponents } from "../CommonComponents";
import { GetAI } from "../Functions/GetAI";

export class Debug implements Command {
    name: string = "debug";
    private description = "Toggle debug mode on the current AI";
    public data: SlashCommandBuilder;

    constructor() {
        this.data = new SlashCommandBuilder();
        this.data.setName(this.name);
        this.data.setDescription(this.description);
    }

    commandRun(interaction: CommandInteraction, cc: CommonComponents) {
        const ai = GetAI(cc, interaction.channel);
        if(!ai) {
            interaction.reply("There is no AI to debug.")
            return;
        }

        ai.toggleDebug();

        const res = `Debug ${ai.debug ? "enabled" : "disabled"}`;
        interaction.reply(res);
    }
}
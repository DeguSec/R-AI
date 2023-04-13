import { CommandInteraction, CacheType, SlashCommandBuilder, ModalSubmitInteraction } from "discord.js";
import { AIController } from "../AI/AIController";
import { Command } from "./_Commands";

export class Debug implements Command {
    name: string = "debug";
    private description = "Toggle debug mode on the current AI";
    public data: SlashCommandBuilder;

    constructor() {
        this.data = new SlashCommandBuilder();
        this.data.setName(this.name);
        this.data.setDescription(this.description);
    }

    commandRun(interaction: CommandInteraction, ai?: AIController) {
        if(!ai) return;

        ai.toggleDebug();

        const res = `Debug ${ai.debug ? "enabled" : "disabled"}`;
        interaction.reply(res);
    }
}
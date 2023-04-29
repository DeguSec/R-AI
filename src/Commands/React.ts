import { CacheType, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "./_Commands";
import { CommonComponents } from "../CommonComponents";
import { GetAI } from "../Functions/GetAI";

export class React implements Command {
    name = "react";
    private description = "Prompt the AI to react without additional data";
    public data: SlashCommandBuilder;

    constructor() {
        this.data = new SlashCommandBuilder();
        this.data.setName(this.name);
        this.data.setDescription(this.description);
    }

    async commandRun(interaction: CommandInteraction<CacheType>, cc: CommonComponents) {
        const ai = GetAI(cc, interaction.channel);

        if(ai) {
            await ai.externalReact();
            interaction.reply({ content: ':computer: Prompting now', ephemeral: true });
            return;
        }

        interaction.reply({ content: ':computer::octagonal_sign: Something went wrong. Not prompting.', ephemeral: true });
    }
}
import { SlashCommandBuilder } from "discord.js";
import { asyncCommands, syncCommands } from "../Commands/_Commands";
import { CommonComponents } from "../CommonComponents";

export const ClientReady = async (cc: CommonComponents) => {
    console.log("Ready");

    (async () => {
        await cc.client.application?.fetch();
        cc.id = cc.client.application?.id;
        console.log("App ID: " + cc.id);
    })()

    // Load all of the commands 
    const slashCommands: Array<SlashCommandBuilder> = [
        // normal
        ...syncCommands.map((command) => command.data),

        // async (waiting for db/bot)
        ...await Promise.all(asyncCommands.map((command) => {
            return command.strap();
        }))
    ];

    console.log("Strapped");

    await cc.client.application?.commands.set(slashCommands);
}
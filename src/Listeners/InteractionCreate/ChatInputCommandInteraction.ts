import { ChatInputCommandInteraction } from "discord.js";
import { CheckAI } from "../../Functions/CheckAI";
import { commands } from "../../Commands/_Commands";
import { CommonComponents } from "../_Listeners";

export const ChatInputCommandInteractionFunction = (args: ChatInputCommandInteraction, cc: CommonComponents) => {
    //TODO: Must be fixed!!
    if (args.isModalSubmit() || !args.channel)
        return;

    const ai = CheckAI(cc, args.channel);
    const command = commands.filter((command) => command.name == args.commandName)[0];

    command.commandRun(args, ai);
}
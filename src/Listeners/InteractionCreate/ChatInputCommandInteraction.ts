import { ChatInputCommandInteraction } from "discord.js";
import { CheckAI } from "../../Functions/CheckAI";
import { commands } from "../../Commands/_Commands";
import { CommonComponents } from "../_Listeners";

export const ChatInputCommandInteractionFunction = (args: ChatInputCommandInteraction, cc: CommonComponents) => {
    if (args.isModalSubmit())
        return;

    const ai = CheckAI(cc.ais, args.channelId);
    const command = commands.filter((command) => command.name == args.commandName)[0];

    command.commandRun(args, ai);
}
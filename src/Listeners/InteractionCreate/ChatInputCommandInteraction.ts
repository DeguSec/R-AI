import { ChatInputCommandInteraction } from "discord.js";
import { CheckAI } from "../../Functions/CheckAI";
import { commands } from "../../Commands/_Commands";
import { CommonComponents } from "../../CommonComponents";

export const ChatInputCommandInteractionFunction = (args: ChatInputCommandInteraction, cc: CommonComponents) => {
    //TODO: Command type in text based only (and thus ok). I'm not sure so i'm leaving this comment here just in case. I can feel my future self curse me

    if (!args.commandType || !args.channel)
        return;

    const ai = CheckAI(cc, args.channel);
    const command = commands.filter((command) => command.name == args.commandName)[0];

    command.commandRun(args, ai);
}
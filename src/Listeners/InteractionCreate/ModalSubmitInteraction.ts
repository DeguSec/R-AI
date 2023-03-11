import { ModalSubmitInteraction } from "discord.js";
import { commands } from "../../Commands/_Commands";
import { CheckAI } from "../../Functions/CheckAI";
import { CommonComponents } from "../_Listeners";

export const ModalSubmitInteractionFunction = (args: ModalSubmitInteraction, cc: CommonComponents) => {
    if (!args.isModalSubmit()) return;

    console.log(args);

    if (!args.channelId) {
        args.reply(":computer::warning: Malformed modal!");
        return;
    }


    const ai = CheckAI(cc.ais, args.channelId);
    const command = commands.filter((command) => command.name == args.customId)[0];

    if (!command || !command.modalRun) {
        args.reply(":computer::warning: Wrong command for processing modal.")
        return;
    }

    command.modalRun(args, ai)
}
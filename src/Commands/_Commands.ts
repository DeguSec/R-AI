import { CommandInteraction, SlashCommandBuilder, ModalSubmitInteraction} from "discord.js";
import { AIController } from "../AI/AIController";
import { ChangePersonality } from "./ChangePersonality";
import { CustomPersonality } from "./CustomPersonality";
import { Debug } from "./Debug";
import { RemoveMemory } from "./RemoveMemory";
import { ChannelEnable } from "./ChannelEnable";
import { ChannelDisable } from "./ChannelDisable";

export interface RunnableCommand {
    name: string;
    commandRun: (interaction: CommandInteraction, ai?: AIController) => void;
    modalRun?: (interaction: ModalSubmitInteraction, ai?: AIController) => void;
}

export interface Command extends RunnableCommand {
    data: SlashCommandBuilder;
}

export interface AsyncCommand extends RunnableCommand {
    strap(): Promise<SlashCommandBuilder>,
}

export interface ModalListener extends Command{
    modalRun: (interaction: ModalSubmitInteraction, ai?: AIController) => void;
}

export const syncCommands: Array<Command> = [
    new RemoveMemory(),
    new CustomPersonality(),
    new Debug(),
    new ChannelEnable(),
    new ChannelDisable(),
];

export const asyncCommands: Array<AsyncCommand> = [
    new ChangePersonality(),
];

export const commands: Array<RunnableCommand> = [
    ...syncCommands,
    ...asyncCommands,
];

export const modalListener: Array<ModalListener> = [
    new CustomPersonality(),
];

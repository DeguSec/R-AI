import { CommandInteraction, SlashCommandBuilder, ModalSubmitInteraction} from "discord.js";
import { AIController } from "../AI/AIController";
import { ChangePersonality } from "./ChangePersonality";
import { CustomPersonality } from "./CustomPersonality";
import { Debug } from "./Debug";
import { RemoveMemory } from "./RemoveMemory";
import { ChannelEnable } from "./ChannelEnable";
import { ChannelDisable } from "./ChannelDisable";

export interface Command {
    name: string;
    commandRun: (interaction: CommandInteraction, ai?: AIController) => void;
    data: SlashCommandBuilder;
    modalRun?: (interaction: ModalSubmitInteraction, ai?: AIController) => void;
}

export interface AsyncCommand extends Omit<Command, "data"> {
    data?: SlashCommandBuilder;
}

export interface ModalListener extends Command{
    modalRun: (interaction: ModalSubmitInteraction, ai?: AIController) => void;
}

export const commands: Array<Command> = [
    new RemoveMemory(),
    new CustomPersonality(),
    new Debug(),
    new ChannelEnable(),
    new ChannelDisable(),
];

export const asyncCommands: Array<AsyncCommand> = [
    new ChangePersonality(),
]

export const modalListener: Array<ModalListener> = [
    new CustomPersonality(),
]
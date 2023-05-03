import { CommandInteraction, SlashCommandBuilder, ModalSubmitInteraction} from "discord.js";
import { ChangePersonality } from "./ChangePersonality";
import { CustomPersonality } from "./CustomPersonality";
import { Debug } from "./Debug";
import { RemoveMemory } from "./RemoveMemory";
import { ChannelEnable } from "./ChannelEnable";
import { ChannelDisable } from "./ChannelDisable";
import { CommonComponents } from "../CommonComponents";
import { React } from "./React";
import { Join } from "./Join";

export interface RunnableCommand {
    name: string;
    commandRun: (interaction: CommandInteraction, cc: CommonComponents) => void;
    modalRun?: (interaction: ModalSubmitInteraction, cc: CommonComponents) => void;
}

export interface Command extends RunnableCommand {
    data: SlashCommandBuilder;
}

export interface AsyncCommand extends RunnableCommand {
    strap(): Promise<SlashCommandBuilder>,
}

export interface ModalListener extends Command{
    modalRun: (interaction: ModalSubmitInteraction, cc: CommonComponents) => void;
}

export const syncCommands: Array<Command> = [
    new RemoveMemory(),
    new CustomPersonality(),
    new Debug(),
    new ChannelEnable(),
    new ChannelDisable(),
    new React(),
    new Join(),
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

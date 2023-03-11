import { CommandInteraction, Client, ChatInputApplicationCommandData, SlashCommandBuilder, ModalSubmitInteraction} from "discord.js";
import { AIController } from "src/AIController";
import { ChangePersonality } from "./ChangePersonality";
import { CustomPersonality } from "./CustomPersonality";
import { RemoveMemory } from "./RemoveMemory";

export interface Command {
    name: string;
    commandRun: (interaction: CommandInteraction, ai?: AIController) => void;
    data: SlashCommandBuilder;
    modalRun?: (interaction: ModalSubmitInteraction, ai?: AIController) => void;
} 

export interface ModalListener extends Command{
    modalRun: (interaction: ModalSubmitInteraction, ai?: AIController) => void;
}

export const commands: Array<Command> = [
    new RemoveMemory(),
    new ChangePersonality(),
    new CustomPersonality(),
];

export const modalListener: Array<ModalListener> = [
    new CustomPersonality(),
]
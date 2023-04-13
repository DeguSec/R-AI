import { CommandInteraction, SlashCommandBuilder, ModalSubmitInteraction} from "discord.js";
import { AIController } from "../AI/AIController";
import { ChangePersonality } from "./ChangePersonality";
import { CustomPersonality } from "./CustomPersonality";
import { Debug } from "./Debug";
import { RemoveMemory } from "./RemoveMemory";
import { ChannelEnable } from "./ChannelEnable";

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
    new Debug(),
    new ChannelEnable(),
];

export const modalListener: Array<ModalListener> = [
    new CustomPersonality(),
]
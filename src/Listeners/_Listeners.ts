import { Client, Events } from "discord.js";
import { AIController } from "src/AIController";
import { ChatInputCommandInteractionFunction } from "./InteractionCreate/ChatInputCommandInteraction";

export interface CommonComponents {
    ais: Map<string, AIController>
} 


export function Strap(client: Client, cc: CommonComponents) {
    client.addListener(Events.InteractionCreate, (args) => ChatInputCommandInteractionFunction(args, cc));
}
import { Client, Events } from "discord.js";
import { AIController } from "src/AIController";
import { ClientReady } from "./ClientReady";
import { ChatInputCommandInteractionFunction } from "./InteractionCreate/ChatInputCommandInteraction";
import { ModalSubmitInteractionFunction } from "./InteractionCreate/ModalSubmitInteraction";
import { MessageCreateFunction } from "./MessageCreate";

export interface CommonComponents {
    ais: Map<string, AIController>,
    client: Client,
} 


export function Strap(cc: CommonComponents) {
    // on ready
    cc.client.addListener(Events.ClientReady, async () => await ClientReady(cc));

    // interaction creates
    cc.client.addListener(Events.InteractionCreate, (args) => ChatInputCommandInteractionFunction(args, cc));
    cc.client.addListener(Events.InteractionCreate, (args) => ModalSubmitInteractionFunction(args, cc));
    
    // message related listeners
    cc.client.addListener(Events.MessageCreate, (args) => MessageCreateFunction(args, cc));
}
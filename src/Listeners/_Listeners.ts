import {Events} from "discord.js";
import {ClientReady} from "./ClientReady";
import {ChatInputCommandInteractionFunction} from "./InteractionCreate/ChatInputCommandInteraction";
import {ModalSubmitInteractionFunction} from "./InteractionCreate/ModalSubmitInteraction";
import {MessageCreateFunction} from "./MessageCreate";
import {TypingStartFunction} from "./TypingStart";
import { CommonComponents } from "../CommonComponents";


export function StrapListeners(cc: CommonComponents) {
    // on ready
    cc.client.addListener(Events.ClientReady, async () => await ClientReady(cc));

    // interaction creates
    cc.client.addListener(Events.InteractionCreate, (args) => ChatInputCommandInteractionFunction(args, cc));
    cc.client.addListener(Events.InteractionCreate, (args) => ModalSubmitInteractionFunction(args, cc));

    // message related listeners
    cc.client.addListener(Events.MessageCreate, (args) => MessageCreateFunction(args, cc));

    // typing listener
    cc.client.addListener(Events.TypingStart, (args) => TypingStartFunction(args, cc));
}
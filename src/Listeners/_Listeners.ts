import {Events} from "discord.js";
import {ClientReady} from "./ClientReady";
import {ChatInputCommandInteractionFunction} from "./InteractionCreate/ChatInputCommandInteraction";
import {ModalSubmitInteractionFunction} from "./InteractionCreate/ModalSubmitInteraction";
import {MessageCreateFunction} from "./MessageCreate";
import {TypingStartFunction} from "./TypingStart";
import {ShutdownFunction} from "./Shutdown";
import { CommonComponents } from "../CommonComponents";


export function StrapListeners(cc: CommonComponents) {
	let hasRanShutdownEvent = false;

    // on ready
    cc.client.addListener(Events.ClientReady, async () => await ClientReady(cc));

    // interaction creates
    cc.client.addListener(Events.InteractionCreate, (args) => ChatInputCommandInteractionFunction(args, cc));
    cc.client.addListener(Events.InteractionCreate, (args) => ModalSubmitInteractionFunction(args, cc));

    // message related listeners
    cc.client.addListener(Events.MessageCreate, (args) => MessageCreateFunction(args, cc));

    // typing listener
    cc.client.addListener(Events.TypingStart, (args) => TypingStartFunction(args, cc));

    // Shutdown event listeners
    // process.on('SIGINT', async () => { hasRanShutdownEvent = await ShutdownFunction(cc); });  // CTRL+C
    // process.on('SIGQUIT', async () => { hasRanShutdownEvent = await ShutdownFunction(cc); }); // Keyboard quit
    // process.on('SIGTERM', async () => { hasRanShutdownEvent = await ShutdownFunction(cc); }); // `kill` command
	// process.on('beforeExit', async () => { hasRanShutdownEvent = await ShutdownFunction(cc); });
	// process.on('exit', async () => { hasRanShutdownEvent = await ShutdownFunction(cc); });

	['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'beforeExit',
    'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM', 'exit'].forEach(function (sig) {
		process.on(sig, async () => {
			hasRanShutdownEvent = await ShutdownFunction(cc);
			console.log(`signal: ${sig}`);
			process.exit(0);
		});
	});
}
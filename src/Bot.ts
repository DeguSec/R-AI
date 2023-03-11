import { Client, Partials } from "discord.js";
import { EnvSecrets } from "./EnvSecrets";
import { StrapListeners } from "./Listeners/_Listeners";
import { AIPool } from "./Types/AIPool";

console.log("Bot is starting...");

const client = new Client({
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    intents: ['DirectMessages', 'MessageContent', 'DirectMessageReactions', 'GuildMessages', 'GuildMessageReactions', 'Guilds']
});

client.login(EnvSecrets.getSecretOrThrow<string>('TOKEN'));

const ais: AIPool = new Map();

// Trap client with listeners 
StrapListeners({ais, client});


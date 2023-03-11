import { Client, Events, Message, ModalSubmitInteraction, Partials, User } from "discord.js";
import { AIController } from "./AIController";
import { commands } from "./Commands/_Commands";
import { EnvSecrets } from "./EnvSecrets";
import { CheckAI } from "./Functions/CheckAI";
import { Strap } from "./Listeners/_Listeners";
import { AIPool } from "./Types/AIPool";

console.log("Bot is starting...");

const stripBad = (text: string) => text.replace(/[^A-Z|a-z|0-9]/g, "");
const convertUserForBot = (user: User) => `${stripBad(user.username)}${user.discriminator}`;

const client = new Client({
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    intents: ['DirectMessages', 'MessageContent', 'DirectMessageReactions', 'GuildMessages', 'GuildMessageReactions', 'Guilds']
});
client.login(EnvSecrets.getSecretOrThrow<string>('TOKEN'));


const ais: AIPool = new Map();


// Trap client with listeners 
Strap({ais, client});

client.addListener(Events.MessageCreate, (message: Message) => {
    // prevent bot from sending itself stuff
    if (message.author.id == "1083497030334292028") return;

    //console.log(message);

    if (message.guild == null || (true && message.channelId == "1083495067966242986" && message.guildId == "851504886854975489")) {
        console.log(message.channelId + " u: " + message.content);

        let ai = CheckAI(ais, message.channelId);

        ai.sendAMessage(
            {
                "message": message.content,
                "retried": false,
                "user": convertUserForBot(message.author)
            }, (response: string) => {
                console.log(message.channelId + " b: " + response)
                message.reply(response)
            });

        return;
    }
});



/*
client.addListener(Events.MessageUpdate, (message: Message) => {
    console.log(`messageChange: ${message}`);
})
*/

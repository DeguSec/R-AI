import { ChatInputCommandInteraction, Client, Events, InteractionType, Message, ModalSubmitInteraction, Partials, User } from "discord.js";
import { AIController } from "./AIController";
import { commands } from "./Commands/_Commands";
import { token } from "./secrets";


console.log("Bot is starting...");

const stripBad = (text: string) => text.replace(/[^A-Z|a-z|0-9]/g, "");
const convertUserForBot = (user: User) => `${stripBad(user.username)}${user.discriminator}`;

const client = new Client({
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    intents: ['DirectMessages', 'MessageContent', 'DirectMessageReactions', 'GuildMessages', 'GuildMessageReactions', 'Guilds']
});
client.login(token);

client.addListener(Events.ClientReady, async () => {
    console.log("Ready");
    await client.application?.commands.set(commands.map( (command) => command.data));
});

client.addListener(Events.InteractionCreate, (args: ChatInputCommandInteraction) => {
    if(args.isModalSubmit())
        return;

    if(!ais[args.channelId])
        ais[args.channelId] = new AIController()
    
    const ai = ais[args.channelId];
    const command = commands.filter( (command) => command.name == args.commandName)[0];

    command.commandRun(args, ai);
});


client.addListener(Events.InteractionCreate, (args: ModalSubmitInteraction) => {
    if(!args.isModalSubmit()) return;

    console.log(args);

    if(!args.channelId) {
        args.reply(":computer::warning: Malformed modal!");
        return;
    }

    
    if(!ais[args.channelId])
        ais[args.channelId] = new AIController()

    const ai = ais[args.channelId];
    const command = commands.filter( (command) => command.name == args.customId)[0];

    if(!command || !command.modalRun) {
        args.reply(":computer::warning: Wrong command for processing modal.")
        return;
    }
    
    command.modalRun(args, ai)

});

let ais: Record<string, AIController> = {}

client.addListener(Events.MessageCreate, (message: Message) => {
    // prevent bot from sending itself stuff
    if(message.author.id == "1083497030334292028") return;

    //console.log(message);

    if (message.guild == null || (true && message.channelId == "1083495067966242986" && message.guildId == "851504886854975489")) {
        console.log(message.channelId + " u: " + message.content);

        let ai = ais[message.channelId]
        if(ai === undefined) {
            ai = ais[message.channelId] = new AIController()
        }

        ai.sendAMessage(message.content, (response: string) => {
            console.log(message.channelId + " b: " + response)
            message.reply(response)
        }, undefined, convertUserForBot(message.author));

        return;
    } 
});



/*
client.addListener(Events.MessageUpdate, (message: Message) => {
    console.log(`messageChange: ${message}`);
})
*/

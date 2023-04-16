import { Client, Partials } from "discord.js";
import mongoose from "mongoose";
import { EnvSecrets } from "./EnvSecrets";
import { StrapListeners } from "./Listeners/_Listeners";
import { AIPool } from "./AI/AIPool";
import { DbSeeder } from "./Database/Seeding/Seeder";
import { CommonComponents, CommonComponentsPending } from "./CommonComponents";


async function main() {
    console.log("Bot is starting...");

    const client = new Client({
        partials: [Partials.Message, Partials.Channel, Partials.Reaction],
        intents: ['DirectMessages', 'MessageContent', 'DirectMessageReactions', 'GuildMessages', 'GuildMessageReactions', 'Guilds', 'GuildMessageTyping', 'DirectMessageTyping']
    });

    const db = await mongoose.connect(EnvSecrets.getSecretOrThrow<string>('DB_CONNECTION_STRING'), {
        dbName: EnvSecrets.getSecretOrThrow<string>('DB_NAME'),
    });
    
    if(!db.connection) 
        throw new Error("Database connection failed.");

    console.log("Seeding");
    await DbSeeder.SeedDb();

    console.log("Populating components");
    const cc: CommonComponentsPending = { client };
    const ais: AIPool = new AIPool(cc);
    //await ais.populate();


    // Strap client with listeners 
    console.log("Strapping listeners");
    StrapListeners(cc as CommonComponents);

    await client.login(EnvSecrets.getSecretOrThrow<string>('TOKEN'));
    console.log("Connected to Discord");
}

main() //.catch((reason) => {
//     console.log(reason);
// });
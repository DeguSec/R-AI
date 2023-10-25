import { Client, Partials } from "discord.js";
import { EnvSecrets } from "./EnvSecrets";
import { StrapListeners } from "./Listeners/_Listeners";
import { AIPool } from "./AI/Base/AIPool";
import { DbSeeder } from "./Database/Seeding/Seeder";
import { CommonComponents, CommonComponentsPending } from "./CommonComponents";
import { AITokenCounter } from "./AI/Base/AITokenCounter";
import { AIVoicePool } from "./AI/Voice/AIVoicePool";
import PrepDB from "./Functions/PrepDB";


async function main() {
    console.log("Bot is starting...");

    const db = await PrepDB();

    if (!db.connection)
        throw new Error("Database connection failed.");

    if (process.argv.length == 3) {
        if (process.argv[2] == "seed") {
            console.log("Seeding");
            await DbSeeder.SeedDb();
            await db.disconnect();
            return 0;
        }

        if (process.argv[2] == "unseed") {
            console.log("Unseeding");
            await DbSeeder.UnSeedDb();
            await db.disconnect();
            return 0;
        }
    }

    const client = new Client({
        partials: [Partials.Message, Partials.Channel, Partials.Reaction],
        intents: [
            'DirectMessages',
            'MessageContent',
            'DirectMessageReactions',
            'GuildMessages',
            'GuildMessageReactions',
            'Guilds',
            'GuildMessageTyping',
            'DirectMessageTyping',
            'GuildVoiceStates',
        ]
    });

    console.log("Populating components");

    const cc: CommonComponentsPending = { 
        client, 
        tokenCounter: new AITokenCounter(), 
        vAis: new AIVoicePool() 
    };

    new AIPool(cc);

    // Strap client with listeners 
    console.log("Strapping listeners");
    StrapListeners(cc as CommonComponents);

    await client.login(EnvSecrets.getSecretKeyOrThrow('TOKEN'));
    console.log("Connected to Discord");
}

main();
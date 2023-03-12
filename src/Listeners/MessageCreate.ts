import { Channel, DMChannel, Message, TextChannel, User } from "discord.js";
import { CheckAI } from "../Functions/CheckAI";
import { CommonComponents } from "./_Listeners";

const stripBad = (text: string) => text.replace(/[^A-Z|a-z|0-9]/g, "");
const convertUserForBot = (user: User) => `${stripBad(user.username)}${user.discriminator}`;

export const MessageCreateFunction = (message: Message, cc: CommonComponents) => {
    // prevent bot from sending itself stuff
    if (message.author.id == "1083497030334292028") return;

    //console.log(message);

    if (message.guild == null || (true && message.channelId == "1083495067966242986" && message.guildId == "851504886854975489")) {
        console.log(message.channelId + " u: " + message.content);

        let ai = CheckAI(cc.ais, message.channelId);

        ai.sendAMessage(
            {
                "message": message.content,
                "retried": false,
                "user": convertUserForBot(message.author)
            }, async (response: string) => {
                console.log(message.channelId + " b: " + response);

                const channel: Channel | null = (await cc.client.channels.fetch(message.channelId));

                console.log(channel);

                if(!channel || !(channel.isDMBased() || channel.isTextBased()))
                    return;

                const cast = channel as DMChannel | TextChannel;
                cast.send(response);
            });

        return;
    }
}
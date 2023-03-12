import { Message, User } from "discord.js";
import { CheckAI } from "../Functions/CheckAI";
import { CheckAllowedSource } from "../Functions/CheckAllowedSource";
import { CommonComponents } from "./_Listeners";

const stripBad = (text: string) => text.replace(/[^A-Z|a-z|0-9]/g, "");
const convertUserForBot = (user: User) => `${stripBad(user.username)}${user.discriminator}`;

export const MessageCreateFunction = (message: Message, cc: CommonComponents) => {
    // prevent bot from sending itself stuff
    if (cc.id && message.author.id == cc.id) return;

    //console.log(message);

    if (CheckAllowedSource(message.channel.id, message.guild?.id)) {
        console.log(message.channelId + " u: " + message.content);

        let ai = CheckAI(cc, message.channel);

        ai.addMessage(
            {
                "message": message.content,
                "retried": false,
                "user": convertUserForBot(message.author),
                "userMessage": message,
            });

        return;
    }
}
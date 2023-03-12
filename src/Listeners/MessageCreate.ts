import { Message, User } from "discord.js";
import { CheckAI } from "../Functions/CheckAI";
import { CheckAllowedSource } from "../Functions/CheckAllowedSource";
import { CheckSelfInteract } from "../Functions/CheckSelfInteract";
import { CommonComponents } from "./_Listeners";

const stripBad = (text: string) => text.replace(/[^A-Z|a-z|0-9]/g, "");
const convertUserForBot = (user: User) => `${stripBad(user.username)}${user.discriminator}`;

export const MessageCreateFunction = (message: Message, cc: CommonComponents) => {
    // prevent bot from sending itself stuff
    if (CheckSelfInteract(message.author.id, cc) || !CheckAllowedSource(message.channel.id, message.guild?.id)) return;


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
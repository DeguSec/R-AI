import { Message, User } from "discord.js";
import { GetAI } from "../Functions/GetAI";
import { CheckAllowedSource } from "../Functions/CheckAllowedSource";
import { CheckSelfInteract } from "../Functions/CheckSelfInteract";
import { CommonComponents } from "../CommonComponents";

const stripBad = (text: string) => text.replace(/[^A-Z|a-z|0-9]/g, "");
const convertUserForBot = (user: User) => `${stripBad(user.username)}${user.discriminator}`;

export const MessageCreateFunction = async (message: Message, cc: CommonComponents) => {
    // prevent bot from sending itself stuff
    if (CheckSelfInteract(message.author.id, cc) || ! await CheckAllowedSource(cc, message.channel.id, message.guild?.id)) return;
    
    let ai = GetAI(cc, message.channel);
    if(!ai)
        return;

    ai.addMessage(
        {
            "message": message.content,
            "retried": false,
            "user": convertUserForBot(message.author),
            "userMessage": message,
        });

    return;

}
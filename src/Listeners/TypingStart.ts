import { Typing } from "discord.js";
import { GetAI } from "../Functions/GetAI";
import { CheckAllowedSource } from "../Functions/CheckAllowedSource";
import { CommonComponents } from "../CommonComponents";

export const TypingStartFunction = async (typing: Typing, cc: CommonComponents) => {
    if (await CheckAllowedSource(cc, typing.channel.id, typing.guild?.id)) {
        const ai = GetAI(cc, typing.channel); // check allowed source only returns true if inside AI pool
        if(!ai)
            return;

        ai.typing(typing);
    }
}

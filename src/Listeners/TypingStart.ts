import { Typing } from "discord.js";
import { CheckAI } from "../Functions/CheckAI";
import { CheckAllowedSource } from "../Functions/CheckAllowedSource";
import { CommonComponents } from "../CommonComponents";

export const TypingStartFunction = async (typing: Typing, cc: CommonComponents) => {
    if (await CheckAllowedSource(typing.channel.id, typing.guild?.id)) {
        const ai = CheckAI(cc, typing.channel);
        ai.typing(typing);
    }
}

import { Typing } from "discord.js";
import { CheckAI } from "../Functions/CheckAI";
import { CheckAllowedSource } from "../Functions/CheckAllowedSource";
import { CommonComponents } from "../CommonComponents";

export const TypingStartFunction = (typing: Typing, cc: CommonComponents) => {
    if (CheckAllowedSource(typing.channel.id, typing.guild?.id)) {
        const ai = CheckAI(cc, typing.channel);
        ai.typing(typing);
    }
}

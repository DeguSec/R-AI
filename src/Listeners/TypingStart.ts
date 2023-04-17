import { Typing } from "discord.js";
import { GetAI } from "../Functions/GetAI";
import { CheckAllowedSource } from "../Functions/CheckAllowedSource";
import { CommonComponents } from "../CommonComponents";
import { AIController } from "../AI/AIController";

export const TypingStartFunction = async (typing: Typing, cc: CommonComponents) => {
    if (await CheckAllowedSource(cc, typing.channel.id, typing.guild?.id)) {
        const ai = GetAI(cc, typing.channel) as AIController; // check allowed source only returns true if inside AI pool
        ai.typing(typing);
    }
}

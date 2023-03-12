import { channel } from "diagnostics_channel";
import { Typing } from "discord.js";
import { CheckAI } from "../Functions/CheckAI";
import { CheckAllowedSource } from "../Functions/CheckAllowedSource";
import { CommonComponents } from "./_Listeners";

export const TypingStartFunction = (typing: Typing, cc: CommonComponents) => {
    if (CheckAllowedSource(typing.channel.id, typing.guild?.id)) {
        const ai = CheckAI(cc, typing.channel.id);
        ai.typing(typing);
    }
}

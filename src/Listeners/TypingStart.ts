import { Typing } from "discord.js";
import { CommonComponents } from "./_Listeners";

export const TypingStartFunction = (typing: Typing, cc: CommonComponents) => {
    console.log(typing);
}

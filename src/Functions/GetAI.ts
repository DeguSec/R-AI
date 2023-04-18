import { TextBasedChannel } from "discord.js";
import { AIController } from "../AI/AIController";
import { CommonComponents } from "../CommonComponents";

export const GetAI = (cc: CommonComponents, channel?: TextBasedChannel | null): AIController | undefined => {
    if(!channel || channel === null) {
        console.log("no channel on run");
        return undefined;
    }
    console.log("checking", channel.id);

    return cc.ais.get(channel.id);
} 
import { TextBasedChannel } from "discord.js";
import { AIController } from "../AI/AIController";
import { CommonComponents } from "../CommonComponents";

export const GetAI = (cc: CommonComponents, channel?: TextBasedChannel | null): AIController | undefined => {
    if(!channel || channel === null) {
        return undefined;
    }

    return cc.ais.get(channel.id);
} 
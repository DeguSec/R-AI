import { Channel } from "discord.js";
import { AIController } from "../AI/AIController";
import { CommonComponents } from "../CommonComponents";

export const CheckAI = (cc: CommonComponents, channel: Channel): AIController => {
    if (!cc.ais.has(channel.id))
        cc.ais.make(channel.id)

    return cc.ais.get(channel.id) as AIController; // will ALWAYS return an AIController
} 
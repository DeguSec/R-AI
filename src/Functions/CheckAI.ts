import { Channel } from "discord.js";
import { AIController } from "../AI/AIController";
import { CommonComponents } from "../Listeners/_Listeners";

export const CheckAI = (cc: CommonComponents, channel: Channel): AIController => {
    if (!cc.ais.has(channel.id))
        cc.ais.set(channel.id, new AIController(cc.client, channel))

    return cc.ais.get(channel.id) as AIController; // will ALWAYS return an AIController
} 
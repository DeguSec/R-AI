import { AIController } from "../AI/AIController";
import { CommonComponents } from "../Listeners/_Listeners";

export const CheckAI = (cc: CommonComponents, channelId: string): AIController => {
    if (!cc.ais.has(channelId))
        cc.ais.set(channelId, new AIController(cc.client, channelId))

    return cc.ais.get(channelId) as AIController; // will ALWAYS return an AIController
} 
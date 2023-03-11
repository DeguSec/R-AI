import { AIController } from "../AIController";
import { AIPool } from "../Types/AIPool";

export const CheckAI = (ais: AIPool, channelId: string): AIController => {
    if (!ais.has(channelId))
        ais.set(channelId, new AIController())

    return ais.get(channelId) as AIController; // will ALWAYS return an AIController
} 
import { Client } from "discord.js";
import { Connection } from "mongoose";
import { AIPool } from "./AI/Base/AIPool";
import { AITokenCounter } from "./AI/Base/_Base";
import { AIVoicePool } from "./AI/Voice/AIVoicePool";

export interface CommonComponents {
    ais: AIPool,
    vAis: AIVoicePool,
    client: Client,
    tokenCounter: AITokenCounter,
    db?: Connection,
    id?: string,
}

export type CommonComponentsPending = Omit<CommonComponents, "ais">;
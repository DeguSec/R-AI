import { Client } from "discord.js";
import { Connection } from "mongoose";
import { AIPool } from "./AI/AIPool";
import { AITokenCounter } from "./AI/AITokenCounter";

export interface CommonComponents {
    ais: AIPool,
    client: Client,
    tokenCounter: AITokenCounter,
    db?: Connection,
    id?: string,
}

export type CommonComponentsPending = Omit<CommonComponents, "ais">;
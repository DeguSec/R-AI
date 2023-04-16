import { Client } from "discord.js";
import { Connection } from "mongoose";
import { AIPool } from "./AI/AIPool";

export interface CommonComponents {
    ais: AIPool,
    client: Client,
    db?: Connection,
    id?: string,
}

export type CommonComponentsPending = Omit<CommonComponents, "ais">;
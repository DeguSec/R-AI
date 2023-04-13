import { Client } from "discord.js";
import { AIController } from "./AI/AIController";
import { Connection } from "mongoose";

export interface CommonComponents {
    ais: Map<string, AIController>,
    client: Client,
    db?: Connection,
    id?: string,
}
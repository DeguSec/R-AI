import { Document } from "mongoose";
import { IChatCompletionEntity } from "../Database/Models/AIProxy/ChatCompletion.model";

/**
 * Database (IChatCompletionEntity) Object
 */
export type DBO = (Document<unknown, {}, { [x: string]: any; }> & Omit<{ [x: string]: any; } & Required<{ _id: unknown; }>, never>) & IChatCompletionEntity;

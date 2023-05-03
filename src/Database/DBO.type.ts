import { Document } from "mongoose";
import { IChatCompletionEntity } from "./Models/AIProxy/ChatCompletion.model";

/**
 * Database (IChatCompletionEntity) Object
 */
// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
export type DBO = (Document<unknown, {}, { [x: string]: any; }> & Omit<{ [x: string]: any; } & Required<{ _id: unknown; }>, never>) & IChatCompletionEntity;

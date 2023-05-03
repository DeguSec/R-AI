import mongoose, { Schema } from "mongoose";
import { IChatCompletionTokenEntity, chatCompletionTokenSchema } from "./ChatCompletionToken.model";
import { DBO } from "../../DBO.type";

export const chatCompletionSchema: Schema = new Schema({
    status: { type: String, required: true },
    content: { type: String, required: true },
    count: { type: Number, required: true },
    chatCompletionTokenSchema: { type: chatCompletionTokenSchema },

}, { timestamps: { createdAt: 'Created', updatedAt: 'LastUpdated' } });

export const ChatCompletionModel = mongoose.model('ChatCompletion', chatCompletionSchema);

export interface IChatCompletionModel {
    _id?: string | null;
    status: "Completed" | "Pending" | "Cancelled" | "Failed";
    content: string;
    count: number;
    chatCompletionTokenSchema?: IChatCompletionTokenEntity;
}

export type IChatCompletionEntity = Omit<IChatCompletionModel, '_id'>

export type IChatCompletionEntityDBO = DBO & IChatCompletionEntity;
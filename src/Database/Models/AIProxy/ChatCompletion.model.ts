import mongoose, { Schema } from "mongoose";
import { IChatCompletionTokenEntity, chatCompletionTokenSchema } from "./ChatCompletionToken.model";

export const chatCompletionSchema: Schema = new Schema({
    status: {type: String, required: true},
    content: {type: String, required: true},
    chatCompletionTokenSchema: {type: chatCompletionTokenSchema}

}, { timestamps: { createdAt: 'Created', updatedAt: 'LastUpdated' } });

export const ChatCompletionModel = mongoose.model('ChatCompletion', chatCompletionSchema);

export interface IChatCompletionModel {
    _id?: string | null;
    status: "Completed" | "Pending" | "Failed" | "Cancelled" | "ErrorOther";
    content: String;
    chatCompletionTokenSchema?: IChatCompletionTokenEntity;
}

export interface IChatCompletionEntity extends Omit<IChatCompletionModel, '_id'> {
}

import mongoose, { Schema } from "mongoose";
import { messageContentSchema } from "./MessageContent.model";
import { ChatCompletionRequestMessage } from "openai";

export const chatCompletionSchema: Schema = new Schema({
    status: {type: String, required: true},
    content: {type: messageContentSchema, required: true}

}, { timestamps: { createdAt: 'Created', updatedAt: 'LastUpdated' } });

export const ChatCompletionModel = mongoose.model('ChatCompletion', chatCompletionSchema);

export interface IChatCompletionModel {
    _id?: string | null;
    status: "Completed" | "Pending" | "Failed";
    content: ChatCompletionRequestMessage;
}

export interface IChannelEntity extends Omit<IChatCompletionModel, '_id'> {
}

import mongoose, { Schema } from "mongoose";
import { messageContentSchema } from "./MessageContent.model";
import { DBO } from "../DBO.type";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const messageSchema: Schema = new Schema({
    _id: { type: Schema.Types.ObjectId, required: true, auto: true },

    channel: { type: String, required: true, index: true }, // channel ID
    content: {type: messageContentSchema, required: true}
}, { timestamps: { createdAt: 'Created', updatedAt: 'LastUpdated' } });

export const MessagesModel = mongoose.model('Message', messageSchema);

export interface IMessage {
    _id?: string | null;
    Created?: Date | null;
    LastUpdated?: Date | null;

    channel: string, // channel ID
    content: ChatCompletionMessageParam, // message content
}

export type IMessageEntity = Omit<IMessage, '_id'>

export type IMessageEntityDBO = DBO & IMessageEntity;


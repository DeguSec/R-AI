import mongoose, { Schema } from "mongoose";
import { ChatCompletionRequestMessage } from "openai";

const messageContentSchema: Schema = new Schema({
    role: {type: String, required: true},
    content: {type: String, required: true},
    name: {type: String},
});

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
    content: ChatCompletionRequestMessage, // message content
}

export type IMessageEntity = Omit<IMessage, '_id'>

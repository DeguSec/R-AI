import { Schema } from "mongoose";
import { messageContentSchema } from "./MessageContent.model";

export const chatCompletionSchema: Schema = new Schema({
    status: {type: String, required: true},
    content: {type: messageContentSchema, required: true}

}, { timestamps: { createdAt: 'Created', updatedAt: 'LastUpdated' } });
import { Schema } from "mongoose";

export const chatCompletionTokenSchema: Schema = new Schema({
    prompt_tokens: {type: Number, required: true},
    completion_tokens: {type: Number, required: true},
});

export interface IChatCompletionToken {
    _id?: string | null;
    prompt_tokens: number;
    completion_tokens: number;
}

export interface IChatCompletionTokenEntity extends Omit<IChatCompletionToken, "_id"> {
}

import { Schema } from "mongoose";

export const messageContentSchema: Schema = new Schema({
    role: {type: String, required: true},
    content: {type: String, required: true},
    name: {type: String},
});
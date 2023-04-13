import mongoose, {Schema} from "mongoose";

const messageSchema: Schema = new Schema({
    _id: {type: Schema.Types.ObjectId, required: true, auto: true},

    message_id: {type: String, required: true, index: true}, // message ID
    from: {type: String, required: true, index: true}, // user ID
    in: {type: String, required: true, index: true}, // channel ID
    content: {type: String, required: true}, // message content
}, {timestamps: {createdAt: 'Created', updatedAt: 'LastUpdated'}});

export const MessagesModel = mongoose.model('Message', messageSchema);

export interface IMessage {
    _id?: string | null;
    Created?: Date | null;
    LastUpdated?: Date | null;

    from: String, // user ID
    in: String, // channel ID
    content: String, // message content
    message_id: String, // message ID
}

export interface IMessageEntity extends Omit<IMessage, '_id'> {
}

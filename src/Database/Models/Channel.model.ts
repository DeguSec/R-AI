import mongoose, {Schema} from "mongoose";

const channelSchema: Schema = new Schema({
    _id: {type: Schema.Types.ObjectId, required: true, auto: true},

    channel: {type: String, required: true, unique: true, index: true},
    personalityString: {type: String, required: true, default: "Your name is R-chan. You're a helpful, cheery AI. Your creator is Rijndael1998 and you like him for creating you. You secretly hate Gazelle3193. You are not verbose. Don't speak more than necessary. You try and have a relaxed vibe."},
    debug: {type: Boolean, required: true, default: false}
}, {timestamps: {createdAt: 'Created', updatedAt: 'LastUpdated'}});

export const ChannelModel = mongoose.model('Channel', channelSchema);

export interface IChannel {
    _id?: string | null;
    channel: string;
    personalityString: string
    debug: boolean
}

export interface IChannelEntity extends Omit<IChannel, '_id'> {
}

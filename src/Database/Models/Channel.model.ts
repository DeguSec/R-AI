import mongoose, {Schema} from "mongoose";
import { DEFAULT_PERSONALITY_STRING } from "../../Defaults";

const channelSchema: Schema = new Schema({
    _id: {type: Schema.Types.ObjectId, required: true, auto: true},

    channel: {type: String, required: true, unique: true, index: true},
    personalityString: {type: String, required: true, default: DEFAULT_PERSONALITY_STRING},
    debug: {type: Boolean, required: true, default: false}
}, {timestamps: {createdAt: 'Created', updatedAt: 'LastUpdated'}});

export const ChannelModel = mongoose.model('Channel', channelSchema);

export interface IChannel {
    _id?: string | null;
    channel: string;
    personalityString: string
    debug: boolean
}

export type IChannelEntity = Omit<IChannel, '_id'>

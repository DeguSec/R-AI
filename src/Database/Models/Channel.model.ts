import mongoose, {Schema} from "mongoose";

const channelSchema: Schema = new Schema({
    _id: {type: Schema.Types.ObjectId, required: true, auto: true},

    channel: {type: String, required: true, unique: true, index: true},
}, {timestamps: {createdAt: 'Created', updatedAt: 'LastUpdated'}});

export const ChannelModel = mongoose.model('Channel', channelSchema);

export interface IChannel {
    _id?: string | null;
    channel: String;
}

export interface IChannelEntity extends Omit<IChannel, '_id'> {
}

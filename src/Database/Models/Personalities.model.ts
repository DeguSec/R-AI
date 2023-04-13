import mongoose, {Schema} from "mongoose";

const personalitySchema: Schema = new Schema({
    _id: {type: Schema.Types.ObjectId, required: true, auto: true},
    
    name: {type: String, required: true, unique: true, index: true},
    initialSystemMessage: {type: String, required: true},
}, {timestamps: {createdAt: 'Created', updatedAt: 'LastUpdated'}});

export const PersonalitiesModel = mongoose.model('Personality', personalitySchema);

export interface IPersonality {
    _id?: string | null;
    Created?: Date | null;
    LastUpdated?: Date | null;
    name: string;
    initialSystemMessage: string;
}

export interface IPersonalitiesEntity extends Omit<IPersonality, '_id'> {
}

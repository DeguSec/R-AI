import { ChannelModel } from "../Database/Models/Channel.model";

/**
 * Will return true if the source is allowed
 * 
 * This is based on the data stored in the database
 * 
 * @param channel 
 * @param guild 
 * @returns 
 */
export const CheckAllowedSource = async (channel?: string, guild?: string) => {
    // the source is... weird
    if (channel == null)
        return false;

    // the source is a DM
    if (guild == null)
        return true;

    // find the channel in the database
    const res = await ChannelModel.find({ 'channel': channel }).exec();

    return res.length > 0;
}
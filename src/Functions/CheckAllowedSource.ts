import { ChannelModel } from "../Database/Models/Channel.model";

/**
 * Will return true if the source is allowed
 * @param channel 
 * @param guild 
 * @returns 
 */
export const CheckAllowedSource = async (channel?: string, guild?: string) => {
    if(channel == null)
        return false;

    if(guild == null)
        return true;

    const res = await ChannelModel.find({'channel': channel}).exec();
        
    return res.length > 0;
}
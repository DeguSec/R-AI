import { CommonComponents } from "../CommonComponents";
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
export const CheckAllowedSource = (cc: CommonComponents, channel?: string, guild?: string): boolean => {
    // the source is... weird
    if (channel == null)
        return false;

    // the source is a DM
    if (guild == null)
        return true;

    // find the channel in the database
    return cc.ais.has(channel);
}
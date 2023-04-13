const channels = new Set<string>([
    //"1083495067966242986",
    "1084614270806929469",
]);

/**
 * Will return true if the source is allowed
 * @param channel 
 * @param guild 
 * @returns 
 */
export const CheckAllowedSource = (channel?: string, guild?: string) => {
    if(channel == null)
        return false;

    if(guild == null)
        return true;
        
    return channels.has(channel);
}
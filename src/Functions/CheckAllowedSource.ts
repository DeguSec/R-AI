const channels = new Set<string>([
    "1083495067966242986",
])

const guilds = new Set<string>([
    "851504886854975489",
])

export const CheckAllowedSource = (channel?: string, guild?: string) => {
    if(guild == null)
        return true;

    if(channel == null)
        return false;
    
        
    return channels.has(channel) && guilds.has(guild);
}
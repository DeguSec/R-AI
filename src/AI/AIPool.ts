import { CommonComponents, CommonComponentsPending } from "../CommonComponents";
import { ChannelModel, IChannelEntity } from "../Database/Models/Channel.model";
import { IMessageEntity, MessagesModel } from "../Database/Models/Messages.model";
import { AIController } from "./AIController";

export class AIPool {
    private cc: CommonComponents;
    private pool: Map<string, AIController> = new Map();

    constructor(cc: CommonComponentsPending) {
        this.cc = cc as CommonComponents;
        this.cc.ais = this;
    }

    /**
     * Create AI from channel
     * @param enabledChannel the string of the channel that has been enabled as found in a database
     * @returns 
     */
    private async makeFromChannel(enabledChannel: string) {
        try {
            const channel = await this.cc.client.channels.fetch(enabledChannel);
            if (!channel) {
                console.log(`The channel returned null: ${enabledChannel}`);
                this.disable(enabledChannel);
                return;
            }

            const ai = new AIController(this.cc, channel);
            await this.strap(ai);

        } catch(error) {
            console.log(`There was an error with: ${enabledChannel}`);
            //console.trace(error);
            this.disable(enabledChannel);
        }
    }

    /**
     * Get all of the existing AIs in the database
     */
    async populate() {
        // Get all of the existing AIs
        const enabledChannels: Array<IChannelEntity> = await ChannelModel.find({}).exec() as any;

        // Strap the AIs
        await Promise.all(enabledChannels.map(async enabledChannel => 
            this.makeFromChannel(enabledChannel.channel)
        ));
    }

    /**
     * User runs the enable command
     * @param channelID 
     * @returns 
     */
    async enable(channelID: string) {
        // add into memory and strap
        try {
            const channel = await this.cc.client.channels.fetch(channelID);
            if(!channel)
                return;
            
            const ai = new AIController(this.cc, channel);
            await this.strap(ai);

        } catch {
            return;
        }
    }


    /**
     * User runs the disable command
     * @param channel 
     */
    async disable(channel: string) {
        // delete the channel from db
        await ChannelModel.deleteOne({channel}).exec();
        this.pool.delete(channel);
    }

    /**
     * Load messages into the AI
     * @param ai 
     */
    async strap(ai: AIController) {
        console.log(`Strapping: ${ai.channel.id}`);

        // get all the messages if any
        const messages: Array<IMessageEntity> | null = await MessagesModel.find({channel: ai.channel.id}).exec() as any;

        // add the messages to the ai
        if(messages) {
            ai.restoreMessages(messages);
        }

        
    }

    /**
     * Get an existing channel if it exists
     * @param channel 
     * @returns 
     */
    get(channel: string): AIController | undefined {
        return this.pool.get(channel);
    }

    // return a channel based on channel string
    make(channel: string): AIController {


        return ;
    }

    /**
     * check if a channel exits
     * @param channel 
     * @returns 
     */
    has(channel: string): boolean {
        return this.pool.has(channel);
    }

    /**
     * Create a channel if it doesn't exist
     * @param channel 
     * @returns 
     */
    makeOrGet(channel: string): AIController {
        return this.get(channel) ?? this.make(channel);
    }
}
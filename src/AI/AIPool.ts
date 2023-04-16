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

    async populate() {
        // Get all of the existing AIs
        const enabledChannels: Array<IChannelEntity> = await ChannelModel.find({}).exec() as any;

        // Strap the AIs
        await Promise.all(enabledChannels.map(async enabledChannel => 
            this.makeFromChannel(enabledChannel.channel)
        ));
    }

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

    async disable(channel: string) {
        // delete the channel from db
        await ChannelModel.deleteOne({channel}).exec();
    }

    async strap(ai: AIController) {
        console.log(`Strapping: ${ai.channel.id}`);

        // get all the messages if any
        const messages: Array<IMessageEntity> | null = await MessagesModel.find({channel: ai.channel.id}).exec() as any;

        // add the messages to the ai
        if(messages) {
            ai.restoreMessages(messages);
        }

        
    }

    /// Overriding methods

    get(channel: string): AIController | undefined {
        return this.pool.get(channel);
    }

    make(channel: string): this {


        return this;
    }

    has(channel: string): boolean {
        return this.pool.has(channel);
    }
}
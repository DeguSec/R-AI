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
     * Bootstrap Step 1. 
     * Get all of the existing AIs in the database and run "makeFromChannel" command
     */
    async populate() {
        // Get all of the existing AIs
        const enabledChannels: Array<IChannelEntity> = await ChannelModel.find({}).exec() as any;

        // Strap the AIs
        await Promise.all(enabledChannels.map(async enabledChannel =>
            this.makeFromChannel(enabledChannel)
        ));
    }

    /**
     * Bootstrap Step 2.
     * Create AI doing the very bare minimum to enable the AI. Expecting the AIController to populate the personality
     * @param enabledChannel the string of the channel that has been enabled as found in a database
     * @returns 
     */
    private async makeFromChannel(enabledChannel: IChannelEntity) {
        try {
            const channel = await this.cc.client.channels.fetch(enabledChannel.channel);
            if (!channel) {
                console.log(`The channel returned null: ${enabledChannel}`);
                
                // no such channel therefore no need to keep going
                this.disable(enabledChannel.channel);
                return;
            }

            const ai = new AIController(this.cc, channel);
            await this.strap(ai, enabledChannel.personalityString);
            this.pool.set(enabledChannel.channel, ai);

        } catch (error) {
            // basically give up

            console.log(`There was an error with: ${enabledChannel}`);
            //console.trace(error);

            await this.disable(enabledChannel.channel);
        }
    }

    /**
     * Bootstrap Step 3.
     * Load messages into the AI
     * @todo Load personality into the AI
     * @param ai 
     */
    async strap(ai: AIController, personalityString?: string) {
        console.log(`Strapping: ${ai.channel.id}`);

        // get all the messages if any
        const messages: Array<IMessageEntity> | null = await MessagesModel.find({ channel: ai.channel.id }).exec() as any;

        await ai.strapPersonality(personalityString);

        // add the messages to the ai
        if (messages) {
            ai.restoreMessages(messages);
        } else {
            // If there are no messages, there's no reason not to reset
            ai.reset();
        }
    }

    /**
     * Enable Step 1.
     * @todo Checks if the AI is in the pool
     * @param channelID 
     * @returns 
     */
    async enable(channelID: string) {
        // add into memory and strap
        try {
            // find the channel
            const channel = await this.cc.client.channels.fetch(channelID);
            if (!channel)
                return;

            // set the new ai
            const ai = new AIController(this.cc, channel);
            await ai.strapPersonality();
            await ai.runAfterCreatingNewPersonality();

            //await this.strap(ai);
            this.pool.set(channelID, ai);


        } catch {
            return;
        }
    }


    /**
     * User runs the disable command
     * @param channel 
     */
    async disable(channel: string) {
        // remove ai from memory first to stop messages
        this.pool.delete(channel);

        // delete the channel and messages from db 
        await Promise.all([
            ChannelModel.deleteOne({ channel }).exec(),
            MessagesModel.deleteMany({ channel }).exec(),
        ]);
    }

    /**
     * Get an existing channel if it exists
     * @param channel 
     * @returns 
     */
    get(channel: string): AIController | undefined {
        return this.pool.get(channel);
    }

    /**
     * check if a channel exits
     * @param channel 
     * @returns 
     */
    has(channel: string): boolean {
        return this.pool.has(channel);
    }
}
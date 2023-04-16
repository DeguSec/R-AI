import { CommonComponents, CommonComponentsPending } from "../CommonComponents";
import { ChannelModel, IChannelEntity } from "../Database/Models/Channel.model";
import { AIController } from "./AIController";

export class AIPool extends Map<string, AIController> {
    private cc: CommonComponents;

    constructor(cc: CommonComponentsPending) {
        super();
        this.cc = cc as CommonComponents;
        this.cc.ais = this;
    }

    async populate() {
        // Get all of the existing AIs
        const enabledChannels: Array<IChannelEntity> = await ChannelModel.find({}).exec() as any;

        console.log(enabledChannels);

        // Strap the AIs
        await Promise.all(enabledChannels.map(async enabledChannel => {
            try {
                const channel = await this.cc.client.channels.fetch(enabledChannel.channel);
                if (!channel) {
                    console.log(`The channel returned null: ${enabledChannel.channel}`);
                    this.disable(enabledChannel.channel);
                    return;
                }

                const ai = new AIController(this.cc, channel);
                await this.strap(ai);
            } catch(error) {
                console.log(`There was an error with: ${enabledChannel.channel}`);
                //console.trace(error);
                this.disable(enabledChannel.channel);
            }
        }));
    }

    enable(channel: string) {
        // add into memory and strap

    }

    disable(channel: string) {
        // delete the channel from db
        
    }

    async strap(ai: AIController) {

    }

    /// Overriding methods

    get(channel: string): AIController {
        throw "Error";
    }

    set(key: string, value: AIController): this {


        return this;
    }
}
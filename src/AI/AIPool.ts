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
        enabledChannels.forEach(channel => {
            //const ai = 
            //this.strap()
        })
    }

    enable(channel: string) {
        // add into memory and strap

    }

    disable(channel: string) {
        // delete the

    }

    strap(ai: AIController) {

    }

    /// Overriding methods

    get(channel: string): AIController {
        throw "Error";
    }

    set(key: string, value: AIController): this {


        return this;
    }
}
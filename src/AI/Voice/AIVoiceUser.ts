import { GuildMember } from "discord.js";
import { GapTime, curlFffmpegPipe, opusEncoder } from "./VoiceProcessing";
import { Readable } from "node:stream";

/**
 * Per user operations
 */
export class AIVoiceUser {
    // converted opus data (PMC)
    awaitingData: Array<Buffer> = [];

    // user
    guildMember: GuildMember;

    // timer which 
    dispatchTimer?: NodeJS.Timer;

    // the time when the user started to talk
    firstMessageTime?: number;

    constructor(guildMember: GuildMember) {
        this.guildMember = guildMember;
        console.log(guildMember);
    }  

    addData(data: Buffer) {
        const decodedOpus = opusEncoder.decode(data);
        //const decodedOpus = data;
        this.awaitingData.push(decodedOpus);

        //console.log("added data for:", this.user.id);
        if(this.dispatchTimer)
            clearTimeout(this.dispatchTimer);

        if(!this.firstMessageTime)
            this.firstMessageTime = Date.now();

        this.dispatchTimer = setTimeout(() => this.convert(), GapTime);
    }

    async convert() {
        console.log("Dispatching convert.");

        // retrieve and clear data
        const data = this.awaitingData;
        this.awaitingData = [];

        // set the proper timers
        this.dispatchTimer = undefined;

        // reset the first message time
        this.firstMessageTime = undefined;

        // get the text
        const text = await curlFffmpegPipe(Readable.from(data));

        console.log(`${this.guildMember.user.username} : ${text}`);
    }
}
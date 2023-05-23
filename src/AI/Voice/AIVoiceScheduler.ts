import { GuildMember } from "discord.js";
import { GapTime, MaxMumbleTime, curlFffmpegPipe, opusEncoder } from "./VoiceProcessing";
import { Readable } from "node:stream";

class VoiceUser {
    // converted opus data
    awaitingData: Array<Buffer> = [];
    user: GuildMember;
    dispatchTimer?: NodeJS.Timer;
    firstMessageTime?: number;

    constructor(user: GuildMember) {
        this.user = user;
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

        const data = this.awaitingData;
        this.awaitingData = [];

        const messageLength = this.firstMessageTime ? (Date.now() - this.firstMessageTime) : 0;
        
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const ranted = messageLength > MaxMumbleTime; // TODO: Implement ranting limit

        this.dispatchTimer = undefined;
        this.firstMessageTime = undefined;

        const text = await curlFffmpegPipe(Readable.from(data));

        console.log(this.user.nickname, ":", text);
    }
}

export class VoiceScheduler {
    users: Map<string, VoiceUser> = new Map();

    getUser(user: GuildMember) {
        let userObject = this.users.get(user.id);

        if(!userObject) {
            userObject = new VoiceUser(user);
            this.users.set(user.id, userObject);
        }

        return userObject;
    }

    addData(user: GuildMember, data: Buffer) {
        this.getUser(user).addData(data);
    }
}
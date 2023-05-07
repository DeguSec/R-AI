import { OpusEncoder } from "@discordjs/opus";
import { GuildMember } from "discord.js";

const opusEncoder = new OpusEncoder(48000, 2);
const GapTime = 1_000;
const MaxMumbleTime = 30_000

class VoiceUser {
    awaitingData: Array<Buffer> = [];
    user: GuildMember;
    dispatchTimer?: NodeJS.Timer;
    firstMessageTime?: number;

    constructor(user: GuildMember) {
        this.user = user;
    }  

    addData(data: Buffer) {
        const decodedOpus = opusEncoder.decode(data);
        this.awaitingData.push(decodedOpus);

        //console.log("added data for:", this.user.id);
        if(this.dispatchTimer)
            clearTimeout(this.dispatchTimer);

        if(!this.firstMessageTime)
            this.firstMessageTime = Date.now();

        this.dispatchTimer = setTimeout(() => this.convert(), GapTime);
    }

    convert() {
        console.log("Dispatching convert.");

        const data = this.awaitingData;
        this.awaitingData = [];

        const messageLength = this.firstMessageTime ? (Date.now() - this.firstMessageTime) : 0;
        const ranted = messageLength > MaxMumbleTime;

        console.log(messageLength, ranted);

        this.dispatchTimer = undefined;
        this.firstMessageTime = undefined;

        // convert
        console.log(data);
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
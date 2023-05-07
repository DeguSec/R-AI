import { OpusEncoder } from "@discordjs/opus";
import { GuildMember } from "discord.js";

const opusEncoder = new OpusEncoder(48000, 2);

class VoiceUser {
    awaitingData: Array<Buffer> = [];
    user: GuildMember;

    constructor(user: GuildMember) {
        this.user = user;
    }  

    addData(data: Buffer) {
        const decodedOpus = opusEncoder.decode(data);
        this.awaitingData.push(decodedOpus);
        console.log("added data for: ", this.user.id)
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
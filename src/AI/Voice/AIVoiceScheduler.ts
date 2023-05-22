import { OpusEncoder } from "@discordjs/opus";
import { GuildMember } from "discord.js";
import Ffmpeg from "fluent-ffmpeg";
import { Writable } from "node:stream";
import { Readable } from "stream";
import { getExecCurl } from "./VoiceProcessing";

const bitRate = 48000;
const opusEncoder = new OpusEncoder(bitRate, 2);
const GapTime = 1_000;
const MaxMumbleTime = 28_000; // for the sake of not going over Open AI

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

        const buffers: Array<Buffer> = [];

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const sender = this;

        const stream = new Writable({
            write(chunk: Buffer, _: string | "buffer", callback) {
                buffers.push(chunk);
                callback();
            },
            final(callback) {
                console.log("final called");
                sender.processMP3Buffer(Buffer.concat(buffers));
                callback();
            }
        });

        Ffmpeg({source: Readable.from(data)})
            .inputFormat("s16le")
            .inputOption("-ar", `${bitRate}`)
            .inputOption("-ac", `${2}`)
            .outputFormat("mp3")
            .writeToStream(stream);
    }

    private async processMP3Buffer(buffer: Buffer) {
        const curl = getExecCurl();

        if(!curl.stdin) {
            throw new Error("curl.stdin no avaliable");
        }

        if(!curl.stdout) {
            throw new Error("curl.stdout no avaliable");
        }
        
        curl.stdout.on("data", (data: Buffer) => {
            console.log(data.toString());
        });

        curl.stdin.write(buffer, () => {
            curl.stdin?.end();
        });
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
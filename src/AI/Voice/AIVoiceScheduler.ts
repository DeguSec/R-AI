import { GuildMember } from "discord.js";
import { AIDebugger } from "../Base/AIDebugger";
import { CommonComponents } from "../../CommonComponents";
import { AIVoiceUser } from "./AIVoiceUser";
import { DEFAULT_PERSONALITY_STRING } from "../../Defaults";
import { stripBad } from "../../Functions/UserFunctions";
import { VoicePersonality } from "./AIVoicePersonality";
import { proxy } from "../Base/AIProxy";
import { extractResponse } from "../../Functions/ExtractResponse";
import { getTTS } from "./VoiceProcessing";
import { AudioPlayer, StreamType, VoiceConnection, createAudioResource } from "@discordjs/voice";
import { Readable } from "stream";

const scheduling = 3000;

/**
 * Per channel operations
 */
export class VoiceScheduler {
    // all the users in the voice
    users: Map<string, AIVoiceUser> = new Map();

    // all the calls and stuff
    userDataScheduling: Map<string, NodeJS.Timeout> = new Map();

    // AI Stuff
    personality: VoicePersonality;
    debugger: AIDebugger;
    cc: CommonComponents;

    // to play audio
    voiceConnection: VoiceConnection;
    audioPlayer: AudioPlayer;

    constructor(cc: CommonComponents, voiceConnection: VoiceConnection) {
        this.cc = cc;

        // audio
        this.voiceConnection = voiceConnection;
        this.audioPlayer = new AudioPlayer();
        voiceConnection.subscribe(this.audioPlayer);

        // ai
        this.debugger = new AIDebugger(cc);
        this.personality = new VoicePersonality(DEFAULT_PERSONALITY_STRING, this.debugger);
    }

    getUser(user: GuildMember) {
        let userObject = this.users.get(user.id);

        if(!userObject) {
            userObject = new AIVoiceUser(user, (time, id, text) => this.addUserMessage(time, id, text));
            this.users.set(user.id, userObject);
        }

        return userObject;
    }

    addData(user: GuildMember, data: Buffer) {
        const meetsConditions = this.getUser(user).addData(data);

        // schedule an API call to the thing and remove previous one if it exists
        if(this.userDataScheduling.has(user.user.id))
            clearTimeout(this.userDataScheduling.get(user.user.id));

        if (meetsConditions)
            this.userDataScheduling.set(user.user.id, setTimeout(async () => {
                this.userDataScheduling.delete(user.user.id);
                if(this.userDataScheduling.size == 0)
                    await this.react();

            }, scheduling));
    }

    addUserMessage(time: number, user: string, message: string) {
        this.personality.addUserMessage(message, stripBad(user), time);
    }

    async react() {
        const start = Date.now();

        const chat = this.personality.getChatCompletion();

        const promise = await proxy.send(chat);
        const response = await promise.response;

        if(!response.success || !response.response) {
            console.error("response not successful!");
            console.error(response.reason);
            return;
        }

        const aiContent = extractResponse(response.response);

        if(!aiContent) {
            console.error("there is no AI contnet");
            return
        }

        this.personality.addAssistantMessage(aiContent, start);

        this.speak(aiContent);
    }

    async speak(text: string) {
        // make call to get data
        const buff = await getTTS(text);

        // complete the audio request
        this.audioPlayer.play(createAudioResource(Readable.from(buff), {
            inputType: StreamType.OggOpus
        }));
    }
}
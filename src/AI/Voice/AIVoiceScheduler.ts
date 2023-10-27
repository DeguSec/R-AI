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
import { AudioPlayer, AudioPlayerStatus, StreamType, VoiceConnection, createAudioResource } from "@discordjs/voice";
import { Readable } from "stream";
import { sleep } from "../../Functions/Sleep";

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

    // check if reacting
    reacting = false;

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
        console.log("starting to react");

        // check if this function is already running
        if(this.reacting)
            return;

        console.log("continuing to react");

        this.reacting = true;

        // here we want failure conditions:
        // - check if anyone is talking
        // - check if anyone hasn't been processed yet
        // - check if the AI is still speaking
        while(this.userDataScheduling.size != 0 || !this.areUsersReady() || this.isAISpeaking()) {
            console.log("array size: ", this.userDataScheduling.size);
            console.log("ready? ", this.areUsersReady())
            console.log("speaking?: ", this.isAISpeaking())

            // sleep for 1 second until it clears up
            await sleep(1);
        }

        // setting time here because otherwise messages time travel
        const start = Date.now();

        // get the chat completion for the current conversation.
        const chat = this.personality.getChatCompletion();

        console.log("chat", chat);

        const promise = await proxy.send(chat);

        console.log("got promise response");

        const response = await promise.response;

        console.log("got response");

        if(!response.success || !response.response) {
            console.error("response not successful!");
            console.error(response.reason);
            this.reacting = false;
            return;
        }

        const aiContent = extractResponse(response.response);

        if(!aiContent) {
            console.error("there is no AI contnet");
            this.reacting = false;
            return;
        }

        console.log("gotten ai content");

        this.personality.addAssistantMessage(aiContent, start);

        // finish speaking before adding messages (blocked by this.reacting higher up a little)
        console.log("speaking: ", aiContent);
        await this.speak(aiContent);

        // done reacting
        this.reacting = false;
    }

    async speak(text: string) {
        // make call to get data
        const buff = await getTTS(text);

        // complete the audio request and start playing
        this.audioPlayer.play(createAudioResource(Readable.from(buff), {
            inputType: StreamType.OggOpus
        }));
    }

    /**
     * 
     * @returns all of the users currently in the room
     */
    private getUsers() {
        const users: Array<AIVoiceUser> = [];
        this.users.forEach(user => users.push(user))

        return users;
    }

    private areUsersReady() {
        const users = this.getUsers();
        for (let index = 0; index < users.length; index++) {
            const user = users[index];

            // user is not ready
            if(!user.ready)
                return false;
        }

        // all users are ready
        return true
    }

    /**
     * 
     * @returns True if the AI is currently speaking
     */
    private isAISpeaking() {
        return this.audioPlayer.state.status != AudioPlayerStatus.Idle;
    }
}
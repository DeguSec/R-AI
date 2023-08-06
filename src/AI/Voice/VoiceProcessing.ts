import { OpusEncoder } from "@discordjs/opus";
import Ffmpeg from "fluent-ffmpeg";
import { ProfanityOption, ResultReason, SpeechConfig, SpeechSynthesisOutputFormat, SpeechSynthesizer } from "microsoft-cognitiveservices-speech-sdk";
import { exec } from "node:child_process";
import { Readable } from "node:stream";
import { EnvSecrets } from "../../EnvSecrets";

// keys
const apiKey = EnvSecrets.getSecretOrThrow<string>('API_KEY');
const SPEECH_KEY = EnvSecrets.getSecretOrThrow<string>("SPEECH_KEY");
const SPEECH_REGION = EnvSecrets.getSecretOrThrow<string>("SPEECH_REGION");

// Audio constants
export const bitRate = 48000;
export const opusEncoder = new OpusEncoder(bitRate, 2);
export const GapTime = 1_000;
export const PacketTime = 60;
export const MaxMumbleTime = 28_000; // for the sake of not going over Open AI

export const getExecCurl = () => {
    return exec(`curl https://api.openai.com/v1/audio/transcriptions -H "Authorization: Bearer ${apiKey}" -H "Content-Type: multipart/form-data" -F file="@-;filename=0.mp3" -F model="whisper-1"`)
}

export const curlFffmpegPipe = async (source: Readable): Promise<string> => {
    return new Promise<string>((resolve) => {
        const curl = getExecCurl();

        if(!curl.stdin)
            throw new Error("curl.stdin not avaliable");
    
        if(!curl.stdout)
            throw new Error("curl.stdout not avaliable");
    
        Ffmpeg({source})
            .inputFormat("s16le")
            .inputOption("-ar", `${bitRate}`)
            .inputOption("-ac", `${2}`)
            .outputFormat("mp3")
            .writeToStream(curl.stdin);
    
        // TODO: maybe find a better way, but this should be ok.
        // I mean, most of the time, there's only 1 data chunk.
        // I haven't seen it do two chunks... I guess this is fine then.
        let text = "";
    
        curl.stdout.on("data", (data: Buffer) => {
            text += data.toString();
        });

        curl.stdout.on("end", () => {
            resolve(text);
        });
    });
}

// tts
const speechConfig = SpeechConfig.fromSubscription(SPEECH_KEY, SPEECH_REGION);
speechConfig.speechSynthesisOutputFormat = SpeechSynthesisOutputFormat.Ogg48Khz16BitMonoOpus;
speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural"; 
speechConfig.setProfanity(ProfanityOption.Raw);

// Create the speech synthesizer.
const synthesizer = new SpeechSynthesizer(speechConfig);


export const getTTS = (text: string) => {
    return new Promise<Buffer>((res, rej) => {
        synthesizer.speakTextAsync(text, 
            (speech) => {
                if (speech.reason !== ResultReason.SynthesizingAudioCompleted)
                    rej(speech.reason)
    
                res(Buffer.from(speech.audioData));
            
            }, rej);
    });
};
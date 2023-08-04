import { exec } from "node:child_process";
import { EnvSecrets } from "../../EnvSecrets";
import { Readable } from "node:stream";
import Ffmpeg from "fluent-ffmpeg";
import { OpusEncoder } from "@discordjs/opus";

const apiKey = EnvSecrets.getSecretOrThrow<string>('API_KEY');

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
    })

}
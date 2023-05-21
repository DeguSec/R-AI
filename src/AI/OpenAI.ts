import { Configuration, OpenAIApi } from "openai";
import { EnvSecrets } from "../EnvSecrets";
import { exec, spawn, spawnSync } from "node:child_process";

const apiKey = EnvSecrets.getSecretOrThrow<string>('API_KEY');

const configuration = new Configuration({
    apiKey
});

export const openai = new OpenAIApi(configuration);

// const curlCommand = `curl https://api.openai.com/v1/audio/transcriptions -H "Authorization: Bearer ${EnvSecrets.getSecretOrThrow<string>('API_KEY')}" -H "Content-Type: multipart/form-data" -F file"@-;filename=0.opus" -F model="whisper-1"`;
// curl https://api.openai.com/v1/audio/transcriptions -H "Authorization: Bearer $OPENAI_API_KEY" -H "Content-Type: multipart/form-data" -F file="@-;filename=0.mp3" -F model="whisper-1"

export const getNewCurl = () => {
    const curl = spawn("curl", [
        "https://api.openai.com/v1/audio/transcriptions",
        "-H", `Authorization: Bearer ${apiKey}`,
        "-H", 'Content-Type: multipart/form-data',
        "-F", 'file="@-;filename=0.mp3"',
        "-F", 'model="whisper-1"',
    ]);

    return curl;
}

export const getExecCurl = () => {
    const curl = exec(`curl https://api.openai.com/v1/audio/transcriptions -H "Authorization: Bearer ${apiKey}" -H "Content-Type: multipart/form-data" -F file="@-;filename=0.mp3" -F model="whisper-1"`)
    // curl.stdin?.write(buffer)
    // curl.stdin?.end();
    return curl;
}

export const tee = () => {
    return spawn("tee", ["file.buffer"]);
}

export const syncCurl = (data: Buffer) => {
    const curl = spawnSync(
        "curl", [
            "https://api.openai.com/v1/audio/transcriptions",
            "-H", `Authorization: Bearer ${apiKey}`,
            "-H", 'Content-Type: multipart/form-data',
            "-F", 'file="@-;filename=0.mp3"',
            "-F", 'model="whisper-1"',
        ],
        {
            input: data,
        });

    console.log(curl);
    console.log(curl.output.toString())

    return curl.output
}
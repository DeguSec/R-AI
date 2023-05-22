import { Configuration, OpenAIApi } from "openai";
import { EnvSecrets } from "../EnvSecrets";
import { exec } from "node:child_process";

const apiKey = EnvSecrets.getSecretOrThrow<string>('API_KEY');

const configuration = new Configuration({
    apiKey
});

export const openai = new OpenAIApi(configuration);

export const getExecCurl = () => {
    return exec(`curl https://api.openai.com/v1/audio/transcriptions -H "Authorization: Bearer ${apiKey}" -H "Content-Type: multipart/form-data" -F file="@-;filename=0.mp3" -F model="whisper-1"`)
}

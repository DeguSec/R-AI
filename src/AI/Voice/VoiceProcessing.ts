import { exec } from "node:child_process";
import { EnvSecrets } from "../../EnvSecrets";

const apiKey = EnvSecrets.getSecretOrThrow<string>('API_KEY');

export const getExecCurl = () => {
    return exec(`curl https://api.openai.com/v1/audio/transcriptions -H "Authorization: Bearer ${apiKey}" -H "Content-Type: multipart/form-data" -F file="@-;filename=0.mp3" -F model="whisper-1"`)
}

import { Configuration, OpenAIApi } from "openai";
import { EnvSecrets } from "../EnvSecrets";

const apiKey = EnvSecrets.getSecretOrThrow<string>('API_KEY');

const configuration = new Configuration({
    apiKey
});

export const openai = new OpenAIApi(configuration);
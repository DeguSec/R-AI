import { Configuration, OpenAIApi } from "openai";
import { EnvSecrets } from "../EnvSecrets";

const configuration = new Configuration({
    apiKey: EnvSecrets.getSecretOrThrow<string>('API_KEY'),
});

export const openai = new OpenAIApi(configuration);

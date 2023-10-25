import { Configuration, OpenAIApi } from "openai";
import { EnvSecrets } from "../EnvSecrets";

export const openai = new OpenAIApi(new Configuration({
    apiKey: EnvSecrets.getSecretKeyOrThrow('API_KEY')
}));
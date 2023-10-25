import OpenAI from "openai";
import { EnvSecrets } from "../EnvSecrets";

export const openai = new OpenAI({
    apiKey: EnvSecrets.getSecretKeyOrThrow('API_KEY')
});
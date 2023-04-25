import { Configuration, OpenAIApi, CreateChatCompletionRequest, CreateChatCompletionResponse } from "openai";
import { EnvSecrets } from "../EnvSecrets";
import { AxiosResponse } from "axios";
import { ChatCompletionModel, IChatCompletionEntity, IChatCompletionModel } from "../Database/Models/AIProxy/ChatCompletion.model";

const configuration = new Configuration({
    apiKey: EnvSecrets.getSecretOrThrow<string>('API_KEY'),
});

const openai = new OpenAIApi(configuration);

const sleep = async (sec: number) => new Promise<void>((resolve) => {
    setTimeout(() => resolve(), sec * 1000);
});

const fakeCall = async (_: any) => {
    console.log(new Date(), "Called");
    await sleep(1);
    console.log();
    return false;
}

/**
 * This class is responsible for scheduling and running messages
 */
export class AIProxy {

    constructor() {

    }

    async send(completion: CreateChatCompletionRequest) {
        //console.log(completion);

        const res = await new ChatCompletionModel({
            status: "Pending",
            content: JSON.stringify(completion),
        } as IChatCompletionEntity).save();

        while (res.status != "Completed") {
            console.log(res);
            const call = await fakeCall(res);
            res.status = call ? "Completed" : "Failed";
            await res.save();
        }

    }
}
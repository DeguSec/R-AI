import { Configuration, OpenAIApi, CreateChatCompletionRequest } from "openai";
import { EnvSecrets } from "../EnvSecrets";
import { ChatCompletionModel, IChatCompletionEntity } from "../Database/Models/AIProxy/ChatCompletion.model";
import { sleep } from "../Functions/Sleep";

const configuration = new Configuration({
    apiKey: EnvSecrets.getSecretOrThrow<string>('API_KEY'),
});

const openai = new OpenAIApi(configuration);

const MAX_RETRIES = 8;
const waitingFunction = (x: number) => x ** 2;

const fakeCall = async (_: any) => {
    console.log(new Date(), "Called");
    await sleep(1);
    console.log();
    return {
        success: false,
        content: ""
    };
};

export interface AIProxyResponse {
    success: boolean;
    reason?: string;
    response?: any;
};

/**
 * This class is responsible for scheduling and running messages
 */
export class AIProxy {
    async send(completion: CreateChatCompletionRequest): Promise<AIProxyResponse> {
        //console.log(completion);

        const res = await new ChatCompletionModel({
            status: "Pending",
            content: JSON.stringify(completion),
            count: 0,
        } as IChatCompletionEntity).save();

        while (true) {
            await sleep(waitingFunction(res.count));

            const call = await fakeCall(res);
            res.count = res.count + 1;

            if (call.success) {
                res.status = "Completed";
                res.save();
                return {
                    success: true,
                    response: call.content,
                };
            }

            else if (res.count >= MAX_RETRIES) {
                res.status = "Failed";
                res.save();
                return {
                    success: false,
                    reason: "Exponential retry limit reached. Your request might be corrupted or the server might be at capacity. Try removing the memory or try again later.",
                };
            }

            else await res.save();
        }

    }
}
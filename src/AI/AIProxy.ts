import { Configuration, OpenAIApi, CreateChatCompletionRequest } from "openai";
import { EnvSecrets } from "../EnvSecrets";
import { ChatCompletionModel, IChatCompletionEntity } from "../Database/Models/AIProxy/ChatCompletion.model";
import { sleep } from "../Functions/Sleep";
import { Document } from "mongoose";

const configuration = new Configuration({
    apiKey: EnvSecrets.getSecretOrThrow<string>('API_KEY'),
});

const openai = new OpenAIApi(configuration);

export type DBO = (Document<unknown, {}, { [x: string]: any; }> & Omit<{ [x: string]: any; } & Required<{ _id: unknown; }>, never>) & IChatCompletionEntity;

const MAX_RETRIES = 7;
const waitingFunction = (x: number) => x ** 2;

const fakeCall = async (_: any) => {
    console.log(new Date(), "Called", _.count);
    await sleep(1);
    console.log(new Date(), "Returned");
    return {
        success: false,
        content: ""
    };
};

export interface AIProxyPromiseResponse {
    success: boolean;
    reason?: string;
    bubble?: boolean;
    response?: any;
};

export interface AIProxyResponse {
    dbObject: DBO,
    response: Promise<AIProxyPromiseResponse>,
}

/**
 * This class is responsible for scheduling and running messages
 */
export class AIProxy {
    private async proxyPromise(res: DBO): Promise<AIProxyPromiseResponse> {
        while (true) {
            // wait the required time
            await sleep(waitingFunction(res.count));

            // request was cancelled for external factors
            if(res.status == "Cancelled") {
                await res.save();
                return {
                    success: false,
                    reason: "Request was cancelled",
                };
            }

            // make the call
            const call = await fakeCall(res);
            res.count = res.count + 1;

            // call is a success
            if (call.success) {
                res.status = "Completed";
                await res.save();
                return {
                    success: true,
                    response: call.content,
                };
            }

            // call had too many tries
            else if (res.count >= MAX_RETRIES) {
                res.status = "Failed";
                await res.save();
                return {
                    success: false,
                    bubble: true,
                    reason: "Exponential retry limit reached. Your request might be corrupted or the server might be at capacity. Try removing the memory or try again later.",
                };
            }

            // otherwise try again and update the model
            else await res.save();
        }
    }


    async send(completion: CreateChatCompletionRequest): Promise<AIProxyResponse> {
        //console.log(completion);

        const res = await new ChatCompletionModel({
            status: "Pending",
            content: JSON.stringify(completion),
            count: 0,
        } as IChatCompletionEntity).save() as DBO;

        return {
            dbObject: res,
            response: this.proxyPromise(res),
        }
    }
}
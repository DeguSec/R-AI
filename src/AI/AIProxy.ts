import { AxiosResponse } from "axios";
import { Document } from "mongoose";
import { Configuration, CreateChatCompletionRequest, CreateChatCompletionResponse, OpenAIApi } from "openai";
import { ChatCompletionModel, IChatCompletionEntity } from "../Database/Models/AIProxy/ChatCompletion.model";
import { EnvSecrets } from "../EnvSecrets";
import { sleep } from "../Functions/Sleep";

const configuration = new Configuration({
    apiKey: EnvSecrets.getSecretOrThrow<string>('API_KEY'),
});

const openai = new OpenAIApi(configuration);

/**
 * Database (IChatCompletionEntity) Object
 */
export type DBO = (Document<unknown, {}, { [x: string]: any; }> & Omit<{ [x: string]: any; } & Required<{ _id: unknown; }>, never>) & IChatCompletionEntity;

const MAX_RETRIES = 7;
const waitingFunction = (x: number) => x ** 2;

type chatCompletionType = AxiosResponse<CreateChatCompletionResponse, any>;

const openAICall = async (dbo: DBO): Promise<{ success: boolean, content?: chatCompletionType, error?: any }> => {
    const unstring: CreateChatCompletionRequest = JSON.parse(dbo.content);

    try {
        const req = await openai.createChatCompletion(unstring);
        return {
            success: true,
            content: req,
        };
    } catch (e) {
        return {
            success: false,
            error: e,
        };
    }
};

export interface AIProxyPromiseResponse {
    success: boolean;
    reason?: string;
    bubble?: boolean;
    response?: chatCompletionType;
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
            if (res.status == "Cancelled") {
                await res.save();
                return {
                    success: false,
                    reason: "Request was cancelled",
                };
            }

            // make the call
            const call = await openAICall(res);

            // if either cancelled before return or completed successfully, populate the token schema
            if (call.content?.data.usage)
                res.chatCompletionTokenSchema = {
                    prompt_tokens: call.content.data.usage.prompt_tokens,
                    completion_tokens: call.content.data.usage.completion_tokens,
                };

            // check if it was cancelled after calls if the call took a long time
            if ((res as DBO).status == "Cancelled") {
                await res.save();
                return {
                    success: false,
                    reason: "Request was cancelled after api call (tokens lost)",
                };
            }

            res.count = res.count + 1;

            // call is a success
            if (call.success) {
                res.status = "Completed";
                res.content = "{}"; // clear content for privacy
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
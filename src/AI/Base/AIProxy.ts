import { ChatCompletion, ChatCompletionCreateParamsNonStreaming } from "openai/resources";
import { ChatCompletionModel, IChatCompletionEntity, IChatCompletionEntityDBO } from "../../Database/Models/AIProxy/ChatCompletion.model";
import { sleep } from "../../Functions/Sleep";
import { openai } from "../OpenAI";

const MAX_RETRIES = 7;
const waitingFunction = (x: number) => x ** 2;

export type chatCompletionType = ChatCompletion;


type openAICallReturnSuccess = {
    success: true,
    content: chatCompletionType
}

type openAICallReturnFail = {
    success: false,
    error: unknown,
}

export type openAICallReturn = Promise<openAICallReturnSuccess | openAICallReturnFail>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const openAICall = async (dbo: IChatCompletionEntityDBO): openAICallReturn => {
    const unstring: ChatCompletionCreateParamsNonStreaming = JSON.parse(dbo.content);

    try {
        const req = await openai.chat.completions.create(unstring);
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
}

export interface AIProxyResponse {
    dbObject: IChatCompletionEntityDBO,
    response: Promise<AIProxyPromiseResponse>,
}

/**
 * This class is responsible for scheduling and running messages
 */
export class AIProxy {
    private async proxyPromise(res: IChatCompletionEntityDBO): Promise<AIProxyPromiseResponse> {
        // eslint-disable-next-line no-constant-condition
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
            if (call.success) {
                if(call.content.usage)
                    res.chatCompletionTokenSchema = {
                        prompt_tokens: call.content.usage.prompt_tokens,
                        completion_tokens: call.content.usage.completion_tokens,
                    };

                else {
                    console.log("chat had no completion!!");
                }
            }

            // check if it was cancelled after calls if the call took a long time
            if ((res as IChatCompletionEntityDBO).status == "Cancelled") {
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


    async send(completion: ChatCompletionCreateParamsNonStreaming): Promise<AIProxyResponse> {
        const res = await new ChatCompletionModel({
            status: "Pending",
            content: JSON.stringify(completion),
            count: 0,
        } as IChatCompletionEntity).save() as IChatCompletionEntityDBO;

        return {
            dbObject: res,
            response: this.proxyPromise(res),
        }
    }
}

export const proxy = new AIProxy();
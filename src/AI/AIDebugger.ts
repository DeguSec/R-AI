import { CreateChatCompletionResponse } from "openai";
import { AxiosResponse } from "axios";

// token ration: 0.002 / 1000
const ratio = {cost: 2, per: 1000000}

const calculateChatCost = (tokens: number) => {
    return (tokens * ratio.cost / ratio.per);
}


export class AIDebugger {
    debugMode = true;

    tokens = {
        prompt: 0,
        completion: 0,
        total: 0,
    }

    log(log: any) {
        if (this.debugMode)
            console.log(new Date(), log);
    }

    logResponse(res: AxiosResponse<CreateChatCompletionResponse, any>) {
        // log tokens
        const data = res.data.usage;
        
        if(!data) 
            return

        this.log(`Tokens for request:`);
        this.log(`\tPrompt   ${data.prompt_tokens}`);
        this.log(`\tComplete ${data.completion_tokens}`);
        this.log(`\tTotal    ${data.total_tokens}`);
        this.log(`\tCost:    $${calculateChatCost(data.total_tokens)}`);

        this.tokens.completion += data.completion_tokens;
        this.tokens.prompt += data.prompt_tokens;
        this.tokens.total += data.total_tokens;

        this.log(`Tokens for conversation:`);
        this.log(`\tPrompt   ${this.tokens.prompt}`);
        this.log(`\tComplete ${this.tokens.completion}`);
        this.log(`\tTotal    ${this.tokens.total}`);
        this.log(`\tCost:    $${calculateChatCost(this.tokens.total)}`);
    }

    toggleDebug() {
        this.debugMode = !this.debugMode;
    }

    setDebug(val: boolean) {
        this.debugMode = val;
    }
}
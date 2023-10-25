import { CommonComponents } from "../../CommonComponents";
import { ChatCompletion } from "openai/resources";

// token ration: 0.002 / 1000
const ratio = {cost: 2, per: 1000000}

const calculateChatCost = (tokens: number) => {
    return (tokens * ratio.cost / ratio.per);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Log = (log: any) => {
    console.log(new Date(), log);
}

export class AIDebugger {
    cc: CommonComponents;

    constructor(cc: CommonComponents) {
        this.cc = cc;
    }

    debugMode = false;

    tokens = {
        prompt: 0,
        completion: 0,
        total: 0,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    log(log: any) {
        if (this.debugMode)
            Log(log);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logResponse(res: ChatCompletion) {
        // log tokens
        const data = res.usage;
        
        if(!data) 
            return

        this.cc.tokenCounter.processRequest({
            prompt_tokens: data.prompt_tokens,
            completion_tokens: data.completion_tokens,
            total_tokens: data.total_tokens,
        });

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
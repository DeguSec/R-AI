import { CreateChatCompletionResponse } from "openai";
import { AxiosResponse } from "axios";

const calculateChatCost = (tokens: number) => {

}


export class AIDebugger {
    debugMode = false;

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
    }

    toggleDebug() {
        this.debugMode = !this.debugMode;
    }
}
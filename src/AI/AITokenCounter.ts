import { Log } from "./AIDebugger";
import { GPTModel } from "./AIModel";

interface Request {
    date: Date,
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    model: GPTModel;
}

export type RequestIngress = Omit<Request, "date">; 


export class AITokenCounter {
    requests: Array<Request> = [];
    debugInterval?: NodeJS.Timer;

    constructor(debug?: boolean) {
        if(debug)
            this.debugInterval = setInterval(() => {
                Log(`Tokens per minute:    ${this.TPM}`);
                Log(`Requests per minute:  ${this.RPM}`);
            }, 30_000);
    }

    private removeOldEntries() {
        const currentDate = new Date().valueOf();
        this.requests = this.requests.filter(request => currentDate - request.date.valueOf() < 60_000);
    }

    /**
     * Gets the current number of tokens per minute. 
     */
    get TPM(): number {
        this.removeOldEntries();

        // sum all of the requests
        let sum = 0;
        this.requests.forEach(request => {
            sum += request.total_tokens;
        });

        return Math.ceil(sum / 1);
    }

    /**
     * Get the current number of requests per minute
     */
    get RPM(): number {
        this.removeOldEntries();
        return Math.ceil(this.requests.length) / 1;
    }

    processRequest(request: RequestIngress) {
        this.requests.push({...request, date: new Date()});
    }
    
}
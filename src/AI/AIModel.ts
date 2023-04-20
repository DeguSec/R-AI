export type GPTModel = 
    "code-davinci-002" | // Optimized for code-completion tasks
    "text-davinci-002" | // Similar capabilities to text-davinci-003 but trained with supervised fine-tuning instead of reinforcement learning
    "text-davinci-003" | // Can do any language task with better quality, longer output, and consistent instruction-following than the curie, babbage, or ada models. Also supports inserting completions within text.
    "gpt-3.5-turbo-0301" | // Snapshot of gpt-3.5-turbo from March 1st 2023. Unlike gpt-3.5-turbo, this model will not receive updates, and will only be supported for a three month period ending on June 1st 2023.
    "gpt-3.5-turbo" |  // Most capable GPT-3.5 model and optimized for chat at 1/10th the cost of text-davinci-003. Will be updated with our latest model iteration.
    "gpt-4" | // More capable than any GPT-3.5 model, able to do more complex tasks, and optimized for chat. Will be updated with our latest model iteration.
    "gpt-4-0314" | // Snapshot of gpt-4 from March 14th 2023. Unlike gpt-4, this model will not receive updates, and will only be supported for a three month period ending on June 14th 2023.
    "gpt-4-32k" | // Same capabilities as the base gpt-4 mode but with 4x the context length. Will be updated with our latest model iteration.
    "gpt-4-32k-0314"; // Snapshot of gpt-4-32 from March 14th 2023. Unlike gpt-4-32k, this model will not receive updates, and will only be supported for a three month period ending on June 14th 2023.


const costRatios = {
    
}



export class Model {
    model: GPTModel;

    constructor(model: GPTModel) {
        this.model = model;
    }
   
    getCost(tokens: number) {

    }
}
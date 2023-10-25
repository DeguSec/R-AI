import { chatCompletionType } from "../AI/Base/AIProxy";

export const extractResponse = (response: chatCompletionType) => {
    return response.choices[0].message?.content;
}
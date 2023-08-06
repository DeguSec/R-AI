import { chatCompletionType } from "../AI/Base/AIProxy";

export const extractResponse = (response: chatCompletionType) => {
    return response.data.choices[0].message?.content;
}
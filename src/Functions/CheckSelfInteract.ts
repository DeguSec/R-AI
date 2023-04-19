import { CommonComponents } from "../CommonComponents";

/**
 * Will return true if self interacts or id is not ready.
 * @param authorId 
 * @param cc 
 * @returns 
 */
export const CheckSelfInteract = (authorId: string, cc: CommonComponents) => {
    if(!cc.id)
        return true;

    
    return authorId == cc.id;
}
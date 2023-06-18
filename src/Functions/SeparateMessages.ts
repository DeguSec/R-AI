// Throw into config db
export const max = 1998;
const charOrder = ["\n", " "];

export const SeparateMessages = (message: string): Array<string> => {
    const messages = [];
    let currentSlice = message;
    main:while (currentSlice.length > max) {
        const buff = currentSlice.substring(0, max)

        for(let i = 0; i < charOrder.length; i++) {
            const nIndex = buff.lastIndexOf(charOrder[i]);

            if(nIndex > 0) {
                messages.push(currentSlice.substring(0, nIndex));
                currentSlice = currentSlice.substring(nIndex);
                continue main;
            }
        }

        messages.push(buff);
        currentSlice = currentSlice.substring(max);

    }

    messages.push(currentSlice)

    return messages;
}
export const sleep = async (sec: number) => new Promise<void>((resolve, reject) => {
    if (isNaN(sec) || sec < 0) 
        reject('Invalid time provided');
    
    setTimeout(() => resolve(), sec * 1000);
});
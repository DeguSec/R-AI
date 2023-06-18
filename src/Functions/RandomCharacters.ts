const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~ \t\n\r\x0b\x0c';

export function RandomCharacters(length: number, characterList=characters) {
    let result = '';
    const charactersLength = characterList.length;
    for ( let i = 0; i < length; i++ ) {
        result += characterList.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
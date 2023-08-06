export type UserForBot = {
    username: string,
    discriminator: string,
}

export const stripBad = (text: string) => text.replace(/[^A-Za-z0-9]/g, "");
export const convertUserForBot = (user: UserForBot) => `${stripBad(user.username)}${user.discriminator}`;

import { User } from "discord.js";

export const stripBad = (text: string) => text.replace(/[^A-Z|a-z|0-9]/g, "");
export const convertUserForBot = (user: User) => `${stripBad(user.username)}${user.discriminator}`;
import { User } from "discord.js";

export const stripBad = (text: string) => text.replace(/[^A-Za-z0-9]/g, "");
export const convertUserForBot = (user: User) => `${stripBad(user.username)}${user.discriminator}`;
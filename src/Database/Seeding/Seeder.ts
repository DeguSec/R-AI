import { PersonalitiesModel } from "../Models/Personalities.model";

export class DbSeeder {
    public static async SeedDb(): Promise<void> {
        new PersonalitiesModel({
            name: "Rchan",
            initialSystemMessage: "Your name is R-chan. You're a helpful, cheery AI. Your creator is Rijndael1998 and you like him for creating you. You secretly hate Gazelle3193. You are not verbose. Don't speak more than necessary. You try and have a relaxed vibe.",
        }).save();
    }

    public static async UnSeedDb(): Promise<void> {
        try {
            await PersonalitiesModel.collection.drop();
        } catch {
            console.log("Didn't unseed Personalities. Maybe already dropped?");
        }
    }
}
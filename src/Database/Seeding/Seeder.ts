import { readdirSync, readFileSync } from "fs";
import { IPersonalitiesEntity, PersonalitiesModel } from "../Models/Personalities.model";


export class DbSeeder {
    public static async SeedDb(): Promise<void> {
        await this.UnSeedDb();
        await this.seedPersonalities();
    }

    public static async UnSeedDb(): Promise<void> {
        try {
            await PersonalitiesModel.collection.drop();
        } catch {
            console.log("Didn't unseed Personalities. Maybe already dropped?");
        }
    }

    public static async seedPersonalities() {
        const FOLDER_PATH = "./personalities/";
        const folders = readdirSync(FOLDER_PATH);
        await Promise.all(folders.map(async folder => {
            const path = FOLDER_PATH + folder;
            console.log(`Loading: ${path}`);

            const data = readFileSync(path);
            const jPersonality: IPersonalitiesEntity = JSON.parse(data.toString());
            await new PersonalitiesModel(jPersonality).save();

            console.log(`Loaded ${path}`);
        }));
    }
}
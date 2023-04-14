import { IPersonalitiesEntity, PersonalitiesModel } from "../Models/Personalities.model";
import { readdir, readFile } from "fs";



export class DbSeeder {
    public static async SeedDb(): Promise<void> {
        readdir("./src/Database/Seeding/Personalities/", (err, files) => {
            if(err)
                throw err; // we don't want to load if there's issues...

            files.forEach(file => {
                console.log(`Loading personality file: ${file}`);
                readFile(`./src/Database/Seeding/Personalities/${file}`, (err: NodeJS.ErrnoException | null, data: Buffer) => {
                    if(err)
                        throw err; // we don't want to load if there's issues...
                    
                    const jPersonality: IPersonalitiesEntity = JSON.parse(data.toString());
                    new PersonalitiesModel(jPersonality).save().finally(() => console.log(`Loaded ${file}`));
                });

            });

        });
        
    }

    public static async UnSeedDb(): Promise<void> {
        try {
            await PersonalitiesModel.collection.drop();
        } catch {
            console.log("Didn't unseed Personalities. Maybe already dropped?");
        }
    }
}
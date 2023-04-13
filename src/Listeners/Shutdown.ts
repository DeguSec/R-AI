import { CommonComponents } from "../CommonComponents";
import {DbSeeder} from "../Database/Seeding/Seeder";

export const ShutdownFunction = async (cc: CommonComponents) => {
    try {
        await DbSeeder.UnSeedDb();
        cc.client.destroy();
        await cc.db?.close(true);
    } catch (err) {
        console.error(err);
    }
}
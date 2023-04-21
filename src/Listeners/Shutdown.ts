import { CommonComponents } from "../CommonComponents";
import {DbSeeder} from "../Database/Seeding/Seeder";

export const ShutdownFunction = async (cc: CommonComponents): Promise<boolean> => {
    try {
        //await DbSeeder.UnSeedDb();
		console.log('ran');
        cc.client.destroy();
        await cc.db?.close(true);
		return true;
    } catch (err) {
        console.error(err);
		return false;
    }
}
import { CommonComponents } from "../CommonComponents";
import {DbSeeder} from "../Database/Seeding/Seeder";

export const ShutdownFunction = async (cc: CommonComponents): Promise<boolean> => {
    try {
        //await DbSeeder.UnSeedDb();
		console.log('ran');
        cc.client.destroy();
        cc.db?.destroy(true);
		process.exit(0);
    } catch (err) {
        console.error(err);
		process.exit(0);
    }
}
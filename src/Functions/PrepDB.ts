import mongoose from "mongoose";
import { EnvSecrets } from "../EnvSecrets";

export default async function PrepDB() {
    const db = await mongoose.connect(EnvSecrets.getSecretOrThrow<string>('DB_CONNECTION_STRING'), {
        dbName: EnvSecrets.getSecretOrThrow<string>('DB_NAME'),
    });

    mongoose.Schema.Types.String.checkRequired(v => v != null);

    return db;
}

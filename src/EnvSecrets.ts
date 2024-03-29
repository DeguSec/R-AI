import { config } from 'dotenv';
config();

export class EnvSecrets {
    public static getSecret<T>(key: string): T {
        return process.env[key] as T;
    }

    public static getSecretOrThrow<T>(key: string): T {
        if(!process.env[key]) throw new Error(`Unable to fetch env var ${key}`);
        return process.env[key] as T;
    }

    public static getSecretKeyOrThrow(key: string): string {
        const secret = this.getSecretOrThrow<string>(key);
        const regex = /[^A-Za-z.\-0-9]/g;
        return secret.replaceAll(regex, "");
    }
}
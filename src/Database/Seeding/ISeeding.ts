export interface ISeeding {
    Seed(): Promise<void>;
    UnSeed(): Promise<void>;
}
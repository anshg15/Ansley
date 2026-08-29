export type UserPreset =
    | "student"
    | "professional"
    | "family"
    | "custom";

export interface UserProfile {
    preset: UserPreset;
}
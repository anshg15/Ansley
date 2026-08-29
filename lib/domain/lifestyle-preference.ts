export type PreferenceSource = "user" | "preset";

export type PreferenceCategory =
    | "groceries"
    | "pharmacy"
    | "healthcare"
    | "gym"
    | "parks"
    | "childcare"
    | "food"
    | "community"
    | "other";

export type PreferenceImportance =
    | "low"
    | "medium"
    | "high";

export interface LifestylePreference {
    id: string;
    label: string;
    query: string;
    category: PreferenceCategory;
    importance: PreferenceImportance;
    maxTravelMinutes?: number;
    source: PreferenceSource;
}
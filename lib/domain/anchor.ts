export type AnchorCategory =
    | "work"
    | "education"
    | "health"
    | "social"
    | "exercise"
    | "other";

export interface Anchor {
    id: string;
    name: string;
    address: string;
    category: AnchorCategory;
    visitsPerWeek: number;
    maxTravelMinutes: number;
    representativeTravelMinutes?: number;
}
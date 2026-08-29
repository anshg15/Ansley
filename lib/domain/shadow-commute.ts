export type FragilityLevel =
    | "low"
    | "medium"
    | "high";

export interface ShadowCommuteResult {
    anchorId: string;
    fragilityLevel: FragilityLevel;
    transfers: number;
    walkingMinutes: number;
    fallbackPenaltyMinutes?: number;
    explanation: string;
}
export type InsightType =
    | "route"
    | "routine-fit"
    | "time-lens"
    | "shadow-commute"
    | "amenity"
    | "community-access"
    | "safety"
    | "general";

export type InsightSeverity =
    | "positive"
    | "info"
    | "warning";

export interface Insight {
    id: string;
    type: InsightType;
    severity: InsightSeverity;
    title: string;
    explanation: string;
    evidence: string[];
}
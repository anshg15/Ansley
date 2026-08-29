export type TransportMode =
    | "transit"
    | "walking"
    | "cycling"
    | "driving"
    | "mixed";

export interface RouteAlternative {
    durationMinutes: number;
    transportMode: TransportMode;
    transfers: number;
    walkingMinutes: number;
}

export interface RouteAnalysis {
    anchorId: string;
    durationMinutes: number;
    transportMode: TransportMode;
    transfers: number;
    walkingMinutes: number;
    weeklyTravelMinutes: number;
    withinTolerance: boolean;
    alternatives?: RouteAlternative[];
}
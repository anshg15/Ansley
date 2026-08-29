export interface AmenityMatch {
    name: string;
    address?: string;
    travelMinutes?: number;
}

export interface AmenityResult {
    preferenceId: string;
    matches: AmenityMatch[];
    accessible: boolean;
    explanation: string;
}
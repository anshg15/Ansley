export interface TransportJourney {
    anchorId: string;
    durationMinutes: number;
    walkingMinutes: number;
    walkingDistanceMetres?: number;
    transfers: number;
    modes: string[];
    departureTime?: string;
    arrivalTime?: string;
    alternativeDurationMinutes?: number;
}
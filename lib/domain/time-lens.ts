export interface TimeLensPeriod {
    label: string;
    durationMinutes: number;
}

export interface TimeLensResult {
    anchorId: string;
    representativePeriods: TimeLensPeriod[];
    minimumDurationMinutes: number;
    maximumDurationMinutes: number;
}
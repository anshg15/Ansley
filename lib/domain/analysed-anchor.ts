import type { Anchor } from "./anchor";
import type { TransportJourney } from "./transport-journey";

export type AnalysedAnchor = Anchor & {
    route: TransportJourney;
    weeklyTravelMinutes: number;
    withinTravelTolerance: boolean;
};
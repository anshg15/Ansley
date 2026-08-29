import type { Anchor } from "@/lib/domain/anchor";
import type { RouteAnalysis, TransportMode } from "@/lib/domain/route-analysis";
import type { TransportJourney } from "@/lib/domain/transport-journey";
import { calculateWeeklyTravelMinutes } from "./weekly-burden";

function transportModeFor(journey: TransportJourney): TransportMode {
    return journey.modes.length === 0 ? "walking" : "transit";
}

export function buildRouteAnalysis(journey: TransportJourney, anchor: Anchor,): RouteAnalysis {
    return {
        anchorId: journey.anchorId,
        durationMinutes: journey.durationMinutes,
        transportMode: transportModeFor(journey),
        transfers: journey.transfers,
        walkingMinutes: journey.walkingMinutes,
        weeklyTravelMinutes: calculateWeeklyTravelMinutes(journey.durationMinutes, anchor.visitsPerWeek,),
        withinTolerance: journey.durationMinutes <= anchor.maxTravelMinutes,
    };
}
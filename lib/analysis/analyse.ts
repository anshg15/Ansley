import { buildRouteAnalysis } from "./build-route-analysis";
import { generateCoreInsights } from "./insights";
import { calculateRoutineFit } from "./routine-fit";
import { analyseShadowCommutes } from "./shadow-commute";
import { buildSafetyContext } from "./safety-context";
import { analyseTimeLens, isTimeLensEnabled } from "./time-lens";
import { calculateTotalWeeklyTravelMinutes, calculateWeeklyTravelMinutes } from "./weekly-burden";
import type { AddressTruthReport, AnalysedAnchor, AnalysisRequest, FailedAnchor, RepresentativeDeparture, RouteAnalysis } from "@/lib/domain/analysis";
import type { SafetyProvider } from "@/lib/providers/bocsar/client";
import type { LgaProvider } from "@/lib/providers/nsw/lga";

export type TransportProvider = {
  analyseJourney(originAddress: string, destinationAddress: string, anchorId: string): Promise<RouteAnalysis>;
  analyseJourneyAt?(originAddress: string, destinationAddress: string, anchorId: string, departure: RepresentativeDeparture): Promise<RouteAnalysis>;
};

const MAX_CONCURRENT_ROUTE_REQUESTS = 2;

async function mapWithConcurrency<T, R>(values: T[], limit: number, mapper: (value: T) => Promise<R>) {
  const results: R[] = new Array(values.length);
  let nextIndex = 0;
  async function worker() { while (nextIndex < values.length) { const index = nextIndex++; results[index] = await mapper(values[index]); } }
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, worker));
  return results;
}

export async function analyseAddressTruth(request: AnalysisRequest, transportProvider: TransportProvider, safetyProvider?: SafetyProvider, lgaProvider?: LgaProvider): Promise<AddressTruthReport> {
  const outcomes = await mapWithConcurrency(request.anchors, MAX_CONCURRENT_ROUTE_REQUESTS, async (anchor) => {
    try {
      const route = await transportProvider.analyseJourney(request.property.address, anchor.address, anchor.id);
      return { type: "success" as const, result: { ...anchor, route, weeklyTravelMinutes: calculateWeeklyTravelMinutes(route.durationMinutes, anchor.visitsPerWeek), withinTravelTolerance: route.durationMinutes <= anchor.maxTravelMinutes } satisfies AnalysedAnchor };
    } catch (error) {
      return { type: "failure" as const, failed: { anchorId: anchor.id, name: anchor.name, message: error instanceof Error ? error.message : "Live transport analysis is temporarily unavailable." } satisfies FailedAnchor };
    }
  });
  const anchors = outcomes.filter((outcome): outcome is Extract<(typeof outcomes)[number], { type: "success" }> => outcome.type === "success").map((outcome) => outcome.result);
  const failedAnchors = outcomes.filter((outcome): outcome is Extract<(typeof outcomes)[number], { type: "failure" }> => outcome.type === "failure").map((outcome) => outcome.failed);
  const weeklyTravelMinutes = calculateTotalWeeklyTravelMinutes(anchors);
  const routineFit = calculateRoutineFit(anchors);
  const timeLens = await analyseTimeLens(request.property.address, anchors, request.options, transportProvider);
  const shadowCommutes = analyseShadowCommutes(anchors);
  const safetyContext = await buildSafetyContext(request.property, anchors, safetyProvider, lgaProvider);
  return {
    property: request.property,
    anchors,
    routes: anchors.map((anchor) => buildRouteAnalysis(anchor.route, anchor)),
    failedAnchors,
    summary: { weeklyTravelMinutes, weeklyTravelHours: Math.round((weeklyTravelMinutes / 60) * 10) / 10, analysedAnchors: anchors.length },
    routineFit,
    insights: generateCoreInsights(anchors, routineFit),
    timeLens,
    shadowCommutes,
    modules: {
      transport: anchors.length > 0 ? { status: "available" } : { status: "unavailable", message: "Live transport analysis is temporarily unavailable." },
      timeLens: timeLens.length > 0 && timeLens.every((result) => result.status === "available") ? { status: "available" } : { status: "unavailable", message: isTimeLensEnabled(request.options) ? "Representative-time analysis is temporarily unavailable; showing the primary route only." : "Time-based analysis was not requested." },
      shadowCommute: shadowCommutes.length > 0 ? { status: "available" } : { status: "unavailable", message: "Route-fragility analysis requires a primary route." },
      amenities: { status: "unavailable", message: "Everyday access analysis has not been enabled yet." },
      safety: safetyContext.area.status === "available" ? { status: "available" } : { status: "unavailable", message: safetyContext.area.message },
    },
    safetyContext,
    generatedAt: new Date().toISOString(),
  };
}

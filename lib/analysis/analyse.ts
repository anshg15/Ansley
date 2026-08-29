import { generateCoreInsights } from "./insights";
import { calculateRoutineFit } from "./routine-fit";
import { calculateTotalWeeklyTravelMinutes, calculateWeeklyTravelMinutes } from "./weekly-burden";
import type { AnalysedAnchor } from "@/lib/domain/analysed-anchor";
import type { AnalysisRequest } from "@/lib/domain/analysis-request";
import type { TransportJourney } from "@/lib/domain/transport-journey";
import { buildRouteAnalysis } from "./build-route-analysis";
import type { AddressTruthReport } from "@/lib/domain/address-truth-report";
import type { FailedAnchor } from "@/lib/domain/failed-anchor";
import build from "next/dist/build";

export type TransportProvider = {
  analyseJourney(originAddress: string, destinationAddress: string, anchorId: string): Promise<TransportJourney>;
};

const MAX_CONCURRENT_ROUTE_REQUESTS = 2;

async function mapWithConcurrency<T, R>(
  values: T[],
  limit: number,
  mapper: (value: T) => Promise<R>,
) {
  const results: R[] = new Array(values.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < values.length) {
      const index = nextIndex++;
      results[index] = await mapper(values[index]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, worker));
  return results;
}

export async function analyseAddressTruth(
  request: AnalysisRequest,
  transportProvider: TransportProvider,
): Promise<AddressTruthReport> {
  const outcomes = await mapWithConcurrency(request.anchors, MAX_CONCURRENT_ROUTE_REQUESTS, async (anchor) => {
    try {
      const route = await transportProvider.analyseJourney(request.property.address, anchor.address, anchor.id);
      const result: AnalysedAnchor = {
        ...anchor,
        route,
        weeklyTravelMinutes: calculateWeeklyTravelMinutes(route.durationMinutes, anchor.visitsPerWeek),
        withinTravelTolerance: route.durationMinutes <= anchor.maxTravelMinutes,
      };
      return { type: "success" as const, result };
    } catch (error) {
      const failed: FailedAnchor = {
        anchorId: anchor.id,
        name: anchor.name,
        message: error instanceof Error ? error.message : "Live transport analysis is temporarily unavailable.",
      };
      return { type: "failure" as const, failed };
    }
  });

  const anchors = outcomes
    .filter((outcome): outcome is Extract<(typeof outcomes)[number], { type: "success" }> => outcome.type === "success")
    .map((outcome) => outcome.result);
  const failedAnchors = outcomes
    .filter((outcome): outcome is Extract<(typeof outcomes)[number], { type: "failure" }> => outcome.type === "failure")
    .map((outcome) => outcome.failed);
  const weeklyTravelMinutes = calculateTotalWeeklyTravelMinutes(anchors);
  const routineFit = calculateRoutineFit(anchors);
  const routes = anchors.map((anchor) => buildRouteAnalysis(anchor.route, anchor),);

  return {
    property: request.property,
    summary: {
      weeklyTravelMinutes,
      weeklyTravelHours: Math.round((weeklyTravelMinutes / 60) * 10) / 10,
      analysedAnchors: anchors.length,
    },
    routes,
    failedAnchors,
    routineFit,
    insights: generateCoreInsights(anchors, routineFit),
    generatedAt: new Date().toISOString(),
  };
}

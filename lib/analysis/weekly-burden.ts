import type { AnalysedAnchor } from "@/lib/domain/analysis";

export function calculateWeeklyTravelMinutes(
  durationMinutes: number,
  visitsPerWeek: number,
) {
  return Math.round(durationMinutes * 2 * visitsPerWeek);
}

export function calculateTotalWeeklyTravelMinutes(anchors: AnalysedAnchor[]) {
  return anchors.reduce((total, anchor) => total + anchor.weeklyTravelMinutes, 0);
}

import type { AnalysedAnchor } from "@/lib/domain/analysed-anchor";
import type { RoutineFitResult } from "@/lib/domain/routine-fit";

export function calculateRoutineFit(anchors: AnalysedAnchor[]): RoutineFitResult | null {
  const totalVisitsPerWeek = anchors.reduce((total, anchor) => total + anchor.visitsPerWeek, 0);
  if (totalVisitsPerWeek === 0) {
    return null;
  }

  const passingVisitsPerWeek = anchors
    .filter((anchor) => anchor.withinTravelTolerance)
    .reduce((total, anchor) => total + anchor.visitsPerWeek, 0);
  const percentage = Math.round((passingVisitsPerWeek / totalVisitsPerWeek) * 100);

  return {
    percentage,
    passingVisitsPerWeek,
    totalVisitsPerWeek,
    explanation: `${percentage}% of your regular weekly destination visits fall within the travel limits you set.`,
  };
}

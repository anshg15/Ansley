import type { AnalysedAnchor, RoutineFit } from "@/lib/domain/analysis";

export function calculateRoutineFit(anchors: AnalysedAnchor[]): RoutineFit | null {
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
